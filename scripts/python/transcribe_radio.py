"""
Optional local team radio transcription script using faster-whisper.
CRITICAL CONSTRAINTS:
1. Downloads audio clips temporarily into memory or temporary cache.
2. Transcribes using faster-whisper locally.
3. Writes ONLY the text and confidence score next to each clip in radio.json.
4. IMMEDIATELY DELETES the downloaded temporary audio file.
5. Marks transcripts with: "machine transcription, may contain errors".
6. Kept OFF by default.
"""

import sys
import os
import json
import argparse
import tempfile
import urllib.request

def transcribe_radio_clips(year: int, round_dir: str):
    radio_path = os.path.join(round_dir, 'race', 'radio.json')
    if not os.path.exists(radio_path):
        print(f"[Whisper] radio.json not found in {round_dir}")
        return

    with open(radio_path, 'r', encoding='utf-8') as f:
        clips = json.load(f)

    if not clips:
        print("[Whisper] No clips to transcribe.")
        return

    print(f"[Whisper] Preparing to transcribe {len(clips)} clips for {round_dir}...")

    try:
        from faster_whisper import WhisperModel
        print("[Whisper] Loading faster-whisper model ('base.en')...")
        model = WhisperModel("base.en", device="cpu", compute_type="int8")
    except ImportError:
        print("[Whisper WARN] faster-whisper not installed in Python environment.")
        print("[Whisper] To enable optional transcription, run: pip install faster-whisper")
        return

    updated_count = 0
    with tempfile.TemporaryDirectory() as temp_dir:
        for idx, clip in enumerate(clips):
            audio_url = clip.get('audioUrl')
            if not audio_url or clip.get('transcript'):
                continue

            temp_audio = os.path.join(temp_dir, f"clip_{idx}.mp3")
            try:
                # 1. Download clip temporarily
                urllib.request.urlretrieve(audio_url, temp_audio)

                # 2. Transcribe
                segments, info = model.transcribe(temp_audio, beam_size=3)
                text_segments = []
                avg_prob = 0.0
                count = 0
                for segment in segments:
                    text_segments.append(segment.text.strip())
                    avg_prob += segment.avg_logprob
                    count += 1

                full_text = " ".join(text_segments).strip()
                confidence = round(pow(2.71828, avg_prob / count), 2) if count > 0 else 0.85

                clip['transcript'] = full_text or "[Inaudible radio transmission]"
                clip['transcriptConfidence'] = confidence
                clip['transcriptNotice'] = "machine transcription, may contain errors"
                updated_count += 1

            except Exception as e:
                print(f"[Whisper Error] Failed on clip {idx}: {e}")
            finally:
                # 3. Always delete temporary audio
                if os.path.exists(temp_audio):
                    try:
                        os.remove(temp_audio)
                    except:
                        pass

    # Save enriched radio.json
    with open(radio_path, 'w', encoding='utf-8') as f:
        json.dump(clips, f, indent=2)

    print(f"\x1b[32m✔ Transcribed {updated_count} clips. Temporary audio deleted.\x1b[0m")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Optional local team radio transcription")
    parser.add_argument("--dir", type=str, required=True, help="Path to race folder (e.g. public/data/2024/01_sakhir)")
    parser.add_argument("--year", type=int, default=2024, help="Season year")
    args = parser.parse_args()

    transcribe_radio_clips(args.year, args.dir)
