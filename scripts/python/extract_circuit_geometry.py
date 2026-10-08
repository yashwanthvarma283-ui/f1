import os
import sys
import json
import fastf1
import numpy as np
import pandas as pd

cache_dir = os.path.join(os.environ.get('TEMP', '.'), 'fastf1')
fastf1.Cache.enable_cache(cache_dir)

def extract_track_for_session(year, round_num):
    print(f"Loading session {year} round {round_num}...")
    # Try Qualifying first for DRS data, fallback to Race
    session = None
    try:
        session = fastf1.get_session(year, round_num, 'Q')
        session.load(telemetry=True, weather=False, messages=False)
    except Exception as e:
        print(f"Qualifying load failed: {e}, trying Race...")
        try:
            session = fastf1.get_session(year, round_num, 'R')
            session.load(telemetry=True, weather=False, messages=False)
        except Exception as e2:
            print(f"Race load failed: {e2}")
            return None

    circuit_info = session.get_circuit_info()
    rotation = float(circuit_info.rotation) if circuit_info and hasattr(circuit_info, 'rotation') else 0.0

    fastest_lap = session.laps.pick_fastest()
    if fastest_lap is None:
        print("No fastest lap found")
        return None

    tel = fastest_lap.get_telemetry()
    if tel is None or tel.empty:
        print("No telemetry found")
        return None

    x_ref = tel["X"].to_numpy().astype(float)
    y_ref = tel["Y"].to_numpy().astype(float)
    drs_ref = tel["DRS"].to_numpy().astype(int) if "DRS" in tel.columns else np.zeros(len(x_ref), dtype=int)

    # Compute tangents and normals
    dx = np.gradient(x_ref)
    dy = np.gradient(y_ref)
    norm = np.sqrt(dx**2 + dy**2)
    norm[norm == 0] = 1.0
    dx /= norm
    dy /= norm

    nx = -dy
    ny = dx

    track_width = 200.0  # Same as reference application
    x_outer = x_ref + nx * (track_width / 2.0)
    y_outer = y_ref + ny * (track_width / 2.0)
    x_inner = x_ref - nx * (track_width / 2.0)
    y_inner = y_ref - ny * (track_width / 2.0)

    # Rotate by circuit_rotation around center (identical to reference application world_to_screen)
    world_cx = (min(x_ref.min(), x_inner.min(), x_outer.min()) + max(x_ref.max(), x_inner.max(), x_outer.max())) / 2.0
    world_cy = (min(y_ref.min(), y_inner.min(), y_outer.min()) + max(y_ref.max(), y_inner.max(), y_outer.max())) / 2.0

    rot_rad = np.deg2rad(rotation)
    cos_rot = np.cos(rot_rad)
    sin_rot = np.sin(rot_rad)

    def rotate_points(xs, ys):
        tx = xs - world_cx
        ty = ys - world_cy
        rx = tx * cos_rot - ty * sin_rot
        ry = tx * sin_rot + ty * cos_rot
        return rx + world_cx, ry + world_cy

    x_ref_rot, y_ref_rot = rotate_points(x_ref, y_ref)
    x_in_rot, y_in_rot = rotate_points(x_inner, y_inner)
    x_out_rot, y_out_rot = rotate_points(x_outer, y_outer)

    # Normalize to SVG viewBox [0, 0, 1000, 700] with margin
    all_x = np.concatenate([x_ref_rot, x_in_rot, x_out_rot])
    all_y = np.concatenate([y_ref_rot, y_in_rot, y_out_rot])

    min_x, max_x = all_x.min(), all_x.max()
    min_y, max_y = all_y.min(), all_y.max()

    w = max_x - min_x
    h = max_y - min_y

    VIEW_W = 1000.0
    VIEW_H = 700.0
    PADDING = 50.0

    scale = min((VIEW_W - 2 * PADDING) / w, (VIEW_H - 2 * PADDING) / h)
    tx = (VIEW_W - scale * w) / 2.0 - scale * min_x
    ty = (VIEW_H - scale * h) / 2.0 - scale * min_y

    def to_screen(xs, ys):
        # In SVG, y is top-down; FastF1/Arcade y is bottom-up (flip y)
        sx = scale * xs + tx
        # Flip Y so track orientation matches visual perception
        sy = VIEW_H - (scale * ys + ty)
        return np.round(sx, 1), np.round(sy, 1)

    sx_ref, sy_ref = to_screen(x_ref_rot, y_ref_rot)
    sx_in, sy_in = to_screen(x_in_rot, y_in_rot)
    sx_out, sy_out = to_screen(x_out_rot, y_out_rot)

    # Extract DRS Zones
    drs_zones = []
    drs_start = None
    for i, val in enumerate(drs_ref):
        if val in [10, 12, 14]:
            if drs_start is None:
                drs_start = i
        else:
            if drs_start is not None:
                drs_end = i - 1
                zone_pts = [[float(sx_out[j]), float(sy_out[j])] for j in range(drs_start, drs_end + 1)]
                if len(zone_pts) > 1:
                    drs_zones.append(zone_pts)
                drs_start = None

    if drs_start is not None:
        drs_end = len(drs_ref) - 1
        zone_pts = [[float(sx_out[j]), float(sy_out[j])] for j in range(drs_start, drs_end + 1)]
        if len(zone_pts) > 1:
            drs_zones.append(zone_pts)

    # Extract Corners
    corners_data = []
    if circuit_info and hasattr(circuit_info, 'corners') and circuit_info.corners is not None:
        for _, c_row in circuit_info.corners.iterrows():
            cx = float(c_row['X'])
            cy = float(c_row['Y'])
            rcx, rcy = rotate_points(cx, cy)
            scx = scale * rcx + tx
            scy = VIEW_H - (scale * rcy + ty)
            corners_data.append({
                "number": int(c_row['Number']),
                "x": round(float(scx), 1),
                "y": round(float(scy), 1),
                "angle": float(c_row['Angle']) if 'Angle' in c_row and not pd.isna(c_row['Angle']) else 0.0
            })

    # Subsample to ~350 points for optimal smooth rendering
    step = max(1, len(sx_ref) // 350)
    racing_line = [[float(sx_ref[i]), float(sy_ref[i])] for i in range(0, len(sx_ref), step)]
    inner_boundary = [[float(sx_in[i]), float(sy_in[i])] for i in range(0, len(sx_in), step)]
    outer_boundary = [[float(sx_out[i]), float(sy_out[i])] for i in range(0, len(sx_out), step)]

    # Close loops
    if inner_boundary and inner_boundary[0] != inner_boundary[-1]:
        inner_boundary.append(inner_boundary[0])
    if outer_boundary and outer_boundary[0] != outer_boundary[-1]:
        outer_boundary.append(outer_boundary[0])
    if racing_line and racing_line[0] != racing_line[-1]:
        racing_line.append(racing_line[0])

    start_finish = {
        "inner": inner_boundary[0],
        "outer": outer_boundary[0]
    }

    result = {
        "event_name": session.event.EventName,
        "circuit_name": session.event.Location,
        "rotation": rotation,
        "viewBox": f"0 0 {int(VIEW_W)} {int(VIEW_H)}",
        "inner_boundary": inner_boundary,
        "outer_boundary": outer_boundary,
        "racing_line": racing_line,
        "drs_zones": drs_zones,
        "corners": corners_data,
        "start_finish": start_finish,
    }

    print(f"Successfully extracted {session.event.EventName}: {len(racing_line)} points, {len(drs_zones)} DRS zones, {len(corners_data)} corners")
    return result

if __name__ == '__main__':
    res = extract_track_for_session(2024, 1)
    if res:
        out_file = 'scripts/python/test_sakhir_track.json'
        with open(out_file, 'w') as f:
            json.dump(res, f, indent=2)
        print(f"Saved to {out_file}")
