import os
from PIL import Image

def extract_logo(img_path, dest_folder):
    print(f"Processing {img_path}...")
    try:
        img = Image.open(img_path).convert("RGBA")
        datas = img.getdata()
        
        # Check corners to find background color
        corners = [
            img.getpixel((0, 0)),
            img.getpixel((img.width - 1, 0)),
            img.getpixel((0, img.height - 1)),
            img.getpixel((img.width - 1, img.height - 1))
        ]
        
        # Assume most frequent corner color is the background color
        bg_color = max(set(corners), key=corners.count)
        
        # Tolerance for background matching
        tolerance = 30
        
        newData = []
        for item in datas:
            if (abs(item[0] - bg_color[0]) <= tolerance and
                abs(item[1] - bg_color[1]) <= tolerance and
                abs(item[2] - bg_color[2]) <= tolerance):
                newData.append((255, 255, 255, 0)) # transparent
            else:
                newData.append(item)
                
        img.putdata(newData)
        
        # Crop to the actual logo bounds
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
        
        # Save as PNG in dest_folder
        filename = os.path.basename(img_path)
        base, _ = os.path.splitext(filename)
        out_name = base.replace('New', '') + ".png"
        out_path = os.path.join(dest_folder, out_name)
        
        img.save(out_path, "PNG")
        print(f"Saved {out_path} with size {img.size}")
    except Exception as e:
        print(f"Error processing {img_path}: {e}")

src_folder = r"F:\F1\F1 Images\Logos"
dest_folder = r"F:\F1\public\logos"

if not os.path.exists(dest_folder):
    os.makedirs(dest_folder)

for filename in os.listdir(src_folder):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
        extract_logo(os.path.join(src_folder, filename), dest_folder)

print("Done fast processing logos!")
