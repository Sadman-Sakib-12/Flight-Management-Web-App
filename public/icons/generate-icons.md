# Icon Generation

To generate the required PWA icons (192x192 and 512x512), you can:

1. Use an online tool like https://realfavicongenerator.net/
2. Or run this command after installing sharp:
   ```
   npx sharp-cli --input icon.svg --output icon-192x192.png --width 192 --height 192
   npx sharp-cli --input icon.svg --output icon-512x512.png --width 512 --height 512
   ```
3. Or use any image editor to create PNG icons from the SVG above.

The icons should be placed in `/public/icons/` as:
- `icon-192x192.png`
- `icon-512x512.png`
