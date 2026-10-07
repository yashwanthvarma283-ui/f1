import argparse
import json
import math
import os
import sys
import pandas as pd
import numpy as np

try:
    import fastf1
except ImportError:
    print(json.dumps({"error": "fastf1 module is not installed"}))
    sys.exit(1)


def sanitize_val(val):
    if val is None:
        return None
    if isinstance(val, (np.floating, float)):
        if math.isnan(val) or math.isinf(val):
            return None
        return float(val)
    if isinstance(val, (np.integer, int)):
        return int(val)
    if isinstance(val, (np.bool_, bool)):
        return bool(val)
    if isinstance(val, pd.Timedelta):
        total_sec = val.total_seconds()
        if math.isnan(total_sec) or math.isinf(total_sec):
            return None
        return round(total_sec, 3)
    if isinstance(val, pd.Timestamp):
        return val.isoformat()
    return str(val)


def format_lap_time(sec):
    if sec is None or math.isnan(sec):
        return "--:--.---"
    mins = int(sec // 60)
    rem = sec % 60
    return f"{mins}:{rem:06.3f}"


def extract_session_data(year, round_num, session_type="R", cache_dir=None):
    if cache_dir:
        os.makedirs(cache_dir, exist_ok=True)
        fastf1.Cache.enable_cache(cache_dir)

    try:
        session = fastf1.get_session(year, round_num, session_type)
        session.load(telemetry=False, weather=True, messages=True)
    except Exception as e:
        return {"error": f"Failed to load FastF1 session: {str(e)}"}

    # 1. Extract Drivers & Results
    drivers_list = []
    results_list = []

    session_results = None
    try:
        session_results = session.results
    except Exception:
        pass

    if session_results is not None and not session_results.empty:
        for _, row in session_results.iterrows():
            d_num = int(row["DriverNumber"]) if pd.notna(row.get("DriverNumber")) else 0
            color = str(row.get("TeamColor") or "E10600").strip("#")
            headshot = row.get("HeadshotUrl")
            if pd.isna(headshot) or not headshot:
                headshot = None

            driver_info = {
                "driverNumber": d_num,
                "broadcastName": str(row.get("BroadcastName") or ""),
                "fullName": str(row.get("FullName") or f"{row.get('FirstName', '')} {row.get('LastName', '')}".strip()),
                "nameAcronym": str(row.get("Abbreviation") or ""),
                "teamName": str(row.get("TeamName") or "F1 Team"),
                "teamColour": f"#{color}",
                "firstName": str(row.get("FirstName") or ""),
                "lastName": str(row.get("LastName") or ""),
                "headshotUrl": headshot,
                "countryCode": str(row.get("CountryCode") or "") if pd.notna(row.get("CountryCode")) else None,
            }
            drivers_list.append(driver_info)

            # Results
            pos = row.get("Position")
            pos_int = int(pos) if pd.notna(pos) else 20
            time_val = row.get("Time")
            time_str = str(time_val) if pd.notna(time_val) else None

            results_list.append({
                "position": pos_int,
                "classifiedPosition": str(row.get("ClassifiedPosition") or pos_int),
                "grid": int(row.get("GridPosition")) if pd.notna(row.get("GridPosition")) else pos_int,
                "status": str(row.get("Status") or "Finished"),
                "points": float(row.get("Points")) if pd.notna(row.get("Points")) else 0.0,
                "laps": int(row.get("Laps")) if pd.notna(row.get("Laps")) else 0,
                "time": time_str,
                "driverNumber": d_num,
                "driverCode": str(row.get("Abbreviation") or ""),
                "teamName": str(row.get("TeamName") or ""),
            })

    # 2. Extract Laps
    laps_list = []
    stints_map = {}
    pitstops_list = []

    # Calculate exact UTC session base time
    session_info = getattr(session, "session_info", {})
    start_date = session_info.get("StartDate")
    gmt_offset = session_info.get("GmtOffset")
    
    t0_utc = None
    if start_date and gmt_offset:
        race_start_utc = start_date - gmt_offset
        started_offset = pd.Timedelta(hours=1)
        try:
            status_df = session.session_status
            if status_df is not None and not status_df.empty:
                started_rows = status_df[status_df["Status"] == "Started"]
                if not started_rows.empty:
                    started_offset = started_rows.iloc[0]["Time"]
        except Exception:
            pass
        t0_utc = race_start_utc - started_offset
    elif hasattr(session, "date"):
        t0_utc = session.date

    session_laps = None
    try:
        session_laps = session.laps
    except Exception:
        pass

    if session_laps is not None and not session_laps.empty:
        # Sort laps chronologically by driver and lap number
        sorted_laps = session_laps.sort_values(by=["DriverNumber", "LapNumber"])

        for _, lap in sorted_laps.iterrows():
            d_num = int(lap["DriverNumber"]) if pd.notna(lap.get("DriverNumber")) else 0
            lap_num = int(lap["LapNumber"]) if pd.notna(lap.get("LapNumber")) else 0

            # Lap Duration
            lap_dur = lap.get("LapTime")
            lap_dur_sec = lap_dur.total_seconds() if pd.notna(lap_dur) else None

            s1 = lap.get("Sector1Time")
            s2 = lap.get("Sector2Time")
            s3 = lap.get("Sector3Time")
            s1_sec = round(s1.total_seconds(), 3) if pd.notna(s1) else None
            s2_sec = round(s2.total_seconds(), 3) if pd.notna(s2) else None
            s3_sec = round(s3.total_seconds(), 3) if pd.notna(s3) else None

            pit_out = pd.notna(lap.get("PitOutTime"))
            pit_in = pd.notna(lap.get("PitInTime"))
            compound = str(lap.get("Compound") or "UNKNOWN").upper()
            stint_num = int(lap.get("Stint")) if pd.notna(lap.get("Stint")) else 1
            tyre_life = int(lap.get("TyreLife")) if pd.notna(lap.get("TyreLife")) else 1
            fresh_tyre = bool(lap.get("FreshTyre")) if pd.notna(lap.get("FreshTyre")) else False

            date_start_iso = None
            lap_start_time = lap.get("LapStartTime")
            lap_time = lap.get("Time")

            if t0_utc is not None and pd.notna(lap_start_time):
                date_start_iso = (t0_utc + lap_start_time).isoformat() + "+00:00"
            elif t0_utc is not None and pd.notna(lap_time) and lap_dur:
                date_start_iso = (t0_utc + lap_time - lap_dur).isoformat() + "+00:00"
            elif pd.notna(lap.get("LapStartDate")):
                date_start_iso = lap.get("LapStartDate").isoformat()

            lap_item = {
                "driverNumber": d_num,
                "lapNumber": lap_num,
                "lapDuration": round(lap_dur_sec, 3) if lap_dur_sec is not None else None,
                "lapTimeString": format_lap_time(lap_dur_sec),
                "sector1": s1_sec,
                "sector2": s2_sec,
                "sector3": s3_sec,
                "speedI1": sanitize_val(lap.get("SpeedI1")),
                "speedI2": sanitize_val(lap.get("SpeedI2")),
                "speedSt": sanitize_val(lap.get("SpeedST")),
                "speedFl": sanitize_val(lap.get("SpeedFL")),
                "isPitOutLap": pit_out,
                "isPersonalBest": bool(lap.get("IsPersonalBest")) if pd.notna(lap.get("IsPersonalBest")) else False,
                "isFastestLap": False,
                "compound": compound,
                "tyreLife": tyre_life,
                "freshTyre": fresh_tyre,
                "stint": stint_num,
                "position": int(lap.get("Position")) if pd.notna(lap.get("Position")) else None,
                "trackStatus": str(lap.get("TrackStatus") or "1"),
                "dateStartIso": date_start_iso,
            }
            laps_list.append(lap_item)

            # Stint tracking
            if d_num not in stints_map:
                stints_map[d_num] = {}
            if stint_num not in stints_map[d_num]:
                stints_map[d_num][stint_num] = {
                    "driverNumber": d_num,
                    "stintNumber": stint_num,
                    "compound": compound,
                    "tyreAgeAtStart": tyre_life - 1 if tyre_life > 0 else 0,
                    "lapStart": lap_num,
                    "lapEnd": lap_num,
                    "totalLaps": 1,
                }
            else:
                stints_map[d_num][stint_num]["lapEnd"] = lap_num
                stints_map[d_num][stint_num]["totalLaps"] += 1

            # Pit stop detection
            if pit_in:
                pitstops_list.append({
                    "driverNumber": d_num,
                    "lapNumber": lap_num,
                    "stopNumber": len([p for p in pitstops_list if p["driverNumber"] == d_num]) + 1,
                    "pitDurationSeconds": 24.5, # default pit lane delta if not timed separately
                    "timestamp": date_start_iso,
                })

    # Flatten stints
    stints_list = []
    for d_num in sorted(stints_map.keys()):
        for s_num in sorted(stints_map[d_num].keys()):
            stints_list.append(stints_map[d_num][s_num])

    # 3. Extract Weather
    weather_list = []
    session_weather = None
    try:
        session_weather = session.weather_data
    except Exception:
        pass

    if session_weather is not None and not session_weather.empty:
        for _, w in session_weather.iterrows():
            w_time = w.get("Time")
            time_iso = session.date.isoformat() if hasattr(session, "date") else ""
            if pd.notna(w_time):
                if isinstance(w_time, pd.Timedelta):
                    time_iso = (session.date + w_time).isoformat()
                elif isinstance(w_time, pd.Timestamp):
                    time_iso = w_time.isoformat()
                else:
                    time_iso = str(w_time)

            weather_list.append({
                "timestamp": time_iso,
                "airTemp": sanitize_val(w.get("AirTemp")),
                "trackTemp": sanitize_val(w.get("TrackTemp")),
                "humidity": sanitize_val(w.get("Humidity")),
                "pressure": sanitize_val(w.get("Pressure")),
                "windSpeed": sanitize_val(w.get("WindSpeed")),
                "windDirection": sanitize_val(w.get("WindDirection")),
                "rainfall": bool(w.get("Rainfall")) if pd.notna(w.get("Rainfall")) else False,
            })

    # 4. Extract Race Control Messages
    race_control_list = []
    session_rc = None
    try:
        session_rc = session.race_control_messages
    except Exception:
        pass

    if session_rc is not None and not session_rc.empty:
        for idx, rc in session_rc.iterrows():
            rc_time = rc.get("Time")
            rc_time_iso = session.date.isoformat() if hasattr(session, "date") else ""
            if pd.notna(rc_time):
                if isinstance(rc_time, pd.Timedelta):
                    rc_time_iso = (session.date + rc_time).isoformat()
                elif isinstance(rc_time, pd.Timestamp):
                    rc_time_iso = rc_time.isoformat()
                else:
                    rc_time_iso = str(rc_time)

            lap_val = rc.get("Lap")
            lap_int = int(lap_val) if pd.notna(lap_val) else None
            scope = str(rc.get("Scope") or "")
            sector = int(rc.get("Sector")) if pd.notna(rc.get("Sector")) else None
            flag = str(rc.get("Flag") or "") if pd.notna(rc.get("Flag")) else None
            category = str(rc.get("Category") or "Information")
            msg = str(rc.get("Message") or "")

            race_control_list.append({
                "id": f"rc_f1_{year}_{round_num}_{idx}",
                "timestamp": rc_time_iso,
                "category": category,
                "flag": flag,
                "message": msg,
                "scope": scope,
                "sector": sector,
                "lapNumber": lap_int,
            })

    return {
        "source": "FastF1",
        "year": year,
        "round": round_num,
        "session": session_type,
        "drivers": drivers_list,
        "results": results_list,
        "laps": laps_list,
        "stints": stints_list,
        "pitstops": pitstops_list,
        "weather": weather_list,
        "raceControl": race_control_list,
    }


def main():
    parser = argparse.ArgumentParser(description="FastF1 Extraction Script for PitWall")
    parser.add_argument("--year", type=int, required=True, help="Championship Year")
    parser.add_argument("--round", type=int, required=True, help="Round Number")
    parser.add_argument("--session", type=str, default="R", help="Session Type (R, Q, S, SQ, FP1, FP2, FP3)")
    parser.add_argument("--cache-dir", type=str, default=".cache/fastf1", help="Cache Directory")
    parser.add_argument("--output", type=str, help="Output JSON file path")

    args = parser.parse_args()

    data = extract_session_data(args.year, args.round, args.session, args.cache_dir)

    if args.output:
        os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print(f"Successfully extracted {args.year} Round {args.round} ({args.session}) to {args.output}")
    else:
        print(json.dumps(data))


if __name__ == "__main__":
    main()
