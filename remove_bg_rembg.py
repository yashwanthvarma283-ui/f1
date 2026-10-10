import os
from rembg import remove
from PIL import Image
import shutil

src_folder = r"F:\F1\F1 Images\Logos"
dest_folder = r"F:\F1\public\logos"

if not os.path.exists(dest_folder):
    os.makedirs(dest_folder)

for filename in os.listdir(src_folder):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
        src_path = os.path.join(src_folder, filename)
        base, _ = os.path.splitext(filename)
        out_path = os.path.join(dest_folder, base + ".png")
        
        if "McLaren" in filename:
            # Copy McLaren as is (but rename to png just in case it isn't, actually we know it's a png)
            shutil.copy2(src_path, out_path)
            print(f"Copied {filename}")
        else:
            print(f"Removing bg from {filename}...")
            with open(src_path, 'rb') as i:
                input_data = i.read()
                output_data = remove(input_data)
                with open(out_path, 'wb') as o:
                    o.write(output_data)
            print(f"Saved {out_path}")
