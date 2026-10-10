from PIL import Image, ImageFilter
import sys
import os

def remove_background(input_path, output_path, tolerance=15, feather=1):
    img = Image.open(input_path).convert("RGBA")
    
    # Get the background color from the top-left pixel (or assume it's white if transparent)
    bg_color = img.getpixel((0,0))
    if bg_color[3] == 0:
        # If corner is already transparent, find the most common color among the edges
        edge_pixels = []
        for x in range(img.width):
            edge_pixels.append(img.getpixel((x, 0)))
            edge_pixels.append(img.getpixel((x, img.height - 1)))
        for y in range(img.height):
            edge_pixels.append(img.getpixel((0, y)))
            edge_pixels.append(img.getpixel((img.width - 1, y)))
        
        from collections import Counter
        counts = Counter(p for p in edge_pixels if p[3] > 0)
        if counts:
            bg_color = counts.most_common(1)[0][0]
        else:
            bg_color = (255, 255, 255, 255) # fallback to white
            
    # If the background color is found to be white-ish, use that
    # Let's just target near-white anyway if it's the most common
    
    # Create a mask based on color distance
    mask = Image.new("L", img.size, 255)
    img_data = img.load()
    mask_data = mask.load()
    
    for y in range(img.height):
        for x in range(img.width):
            pixel = img_data[x, y]
            if pixel[3] > 0:
                # Calculate distance to background color
                dist = sum(abs(pixel[i] - bg_color[i]) for i in range(3))
                if dist < tolerance * 3: # Simple Manhattan distance threshold
                    mask_data[x, y] = 0
            else:
                mask_data[x, y] = 0
                
    # Feather the mask
    if feather > 0:
        mask = mask.filter(ImageFilter.GaussianBlur(radius=feather))
        
    # Apply mask
    for y in range(img.height):
        for x in range(img.width):
            pixel = img_data[x, y]
            img_data[x, y] = (pixel[0], pixel[1], pixel[2], min(pixel[3], mask_data[x, y]))
            
    img.save(output_path, "PNG")
    print(f"Saved to {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python bg_remove.py <input> <output>")
        sys.exit(1)
    remove_background(sys.argv[1], sys.argv[2])
