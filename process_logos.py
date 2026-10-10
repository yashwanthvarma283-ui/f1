import os
from rembg import remove
from PIL import Image
import io

src_folder = r"F:\F1\F1 Images\Logos"
dest_folder = r"F:\F1\public\logos"

if not os.path.exists(dest_folder):
    os.makedirs(dest_folder)

for filename in os.listdir(src_folder):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
        src_path = os.path.join(src_folder, filename)
        
        # Remove "New" from the output filename
        base, _ = os.path.splitext(filename)
        out_name = base.replace('New', '') + ".png"
        out_path = os.path.join(dest_folder, out_name)
        
        print(f"Processing {filename} -> {out_name}")
        
        with open(src_path, 'rb') as i:
            input_data = i.read()
            # Remove background
            output_data = remove(input_data)
            
            # Load with PIL to crop to bounding box
            img = Image.open(io.BytesIO(output_data)).convert("RGBA")
            bbox = img.getbbox()
            if bbox:
                img = img.crop(bbox)
            
            img.save(out_path, "PNG")
            print(f"Saved {out_path} with size {img.size}")

print("Done processing logos!")
