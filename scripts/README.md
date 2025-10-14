# Game Image Generation Scripts

This directory contains scripts for generating preview images for math games.

## Files

### generate-images.js
Node.js script that generates SVG preview images for math games.

**Usage:**
```bash
node scripts/generate-images.js
```

**Generated Images:**
- `addition-game.svg` - Addition practice game preview
- `subtraction-game.svg` - Subtraction practice game preview
- `multiplication-game.svg` - Multiplication practice game preview
- `division-game.svg` - Division practice game preview
- `visualization-game.svg` - Number visualization game preview

All images are saved to `public/images/` directory.

### generate-game-images.html
HTML-based tool for manually generating game images with a visual interface.

**Usage:**
1. Open the file in a web browser
2. Click "Generate" buttons to create preview images
3. Click "Download" buttons to save images locally

## Image Specifications

- **Format:** SVG (Scalable Vector Graphics)
- **Dimensions:** 400x300 pixels
- **Style:** Clean, educational design matching existing game screenshots
- **Elements:**
  - Title (game name)
  - Subtitle ("Kids Math Game")
  - Example problem
  - Answer input box
  - Score display
  - Action button

## Why SVG?

SVG images are used because they:
- Scale perfectly at any resolution
- Have small file sizes (1-2KB vs 25-45KB for PNG)
- Can be easily styled with CSS if needed
- Look crisp on all devices
- Are easy to generate programmatically

## Regenerating Images

If you need to regenerate the images with different styles or content:

1. Edit `generate-images.js`
2. Run: `node scripts/generate-images.js`
3. The new images will replace the old ones in `public/images/`

## Converting to PNG (Optional)

If you prefer PNG images, you can convert SVG files using any of these tools:

**Command Line (with ImageMagick):**
```bash
convert input.svg -resize 400x300 output.png
```

**Online Tools:**
- https://cloudconvert.com/svg-to-png
- https://convertio.co/svg-png/

**Node.js (with sharp or svg2png):**
```bash
npm install sharp
node convert-to-png.js
```
