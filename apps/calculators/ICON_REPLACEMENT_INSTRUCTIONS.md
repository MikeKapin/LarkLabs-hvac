# Gas Pipe Calculator Icon Replacement Instructions

## Overview
The Canadian Gas Pipe Sizing Calculator has been set up as a Progressive Web App (PWA) with placeholder icons. You need to replace these with your custom gas pipe calculator icon (the blue image with the Canadian maple leaf and calculator).

## Files to Replace

Replace these placeholder icon files in the `apps/calculators/icons/` directory:

1. **icon-192.png** (192x192 pixels) - Used for Android home screen
2. **icon-512.png** (512x512 pixels) - Used for splash screen and Android install prompt  
3. **apple-touch-icon.png** (180x180 pixels) - Used for iOS home screen

## Icon Requirements

- **Format**: PNG with transparent background recommended
- **Design**: Should be your gas pipe calculator icon (blue background, maple leaf, calculator)
- **Sizing**: Icons should be square and properly sized for each resolution
- **Quality**: Use high-quality images that scale well

## How to Replace

1. Save your gas pipe calculator icon in the required sizes
2. Name them exactly as listed above
3. Replace the placeholder files in `apps/calculators/icons/`
4. Test the PWA functionality by:
   - Opening the calculator in a mobile browser
   - Using "Add to Home Screen" option
   - Verifying the correct icon appears

## What's Already Configured

✅ PWA manifest file (`gas-pipe-calc-manifest.json`)
✅ HTML meta tags for PWA support  
✅ Service worker for offline functionality
✅ Proper file references in the code

## Testing the PWA

1. Open the calculator on your phone: `https://larklabs.org/apps/calculators/canadian-gas-piping-calculator.html`
2. In browser menu, select "Add to Home Screen" or "Install App"
3. The app should install with your custom icon
4. The app will work offline once cached

## Current Status

- ✅ PWA setup complete
- 🔄 Placeholder icons active (need replacement)
- ✅ Ready for custom icon deployment