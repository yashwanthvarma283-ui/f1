import os
from PIL import Image

def remove_background(img_path):
    print(f"Processing {img_path}...")
    try:
        img = Image.open(img_path).convert("RGBA")
        datas = img.getdata()

        # Determine background color by looking at the corners
        corners = [
            img.getpixel((0, 0)),
            img.getpixel((img.width - 1, 0)),
            img.getpixel((0, img.height - 1)),
            img.getpixel((img.width - 1, img.height - 1))
        ]
        
        # Most frequent corner color is assumed to be background
        bg_color = max(set(corners), key=corners.count)
        
        # We'll allow a small tolerance
        tolerance = 30
        
        newData = []
        for item in datas:
            # Check if pixel is close to bg_color
            if (abs(item[0] - bg_color[0]) <= tolerance and
                abs(item[1] - bg_color[1]) <= tolerance and
                abs(item[2] - bg_color[2]) <= tolerance):
                newData.append((255, 255, 255, 0)) # transparent
            else:
                newData.append(item)
                
        img.putdata(newData)
        
        # Save as PNG
        base, ext = os.path.splitext(img_path)
        out_path = base + ".png"
        img.save(out_path, "PNG")
        
        if ext.lower() != '.png':
            os.remove(img_path)
            print(f"Saved {out_path} and removed {img_path}")
        else:
            print(f"Saved {out_path}")
    except Exception as e:
        print(f"Error processing {img_path}: {e}")

folder = r"F:\F1\public\logos"
for filename in os.listdir(folder):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')) and "McLaren" not in filename:
        remove_background(os.path.join(folder, filename))
