# On The C Fitness Club: website

Static site with a Three.js 3D backdrop. No build step.

## Run
```
python3 -m http.server 8000
```
then open http://localhost:8000 (ES modules need a server, not `file://`).

## Hero animation
The hero is a procedural 3D lifter doing a looping deadlift (`js/scene.js`). Rep timing is the `T_*` constants at the top of that file; body proportions are `THIGH`, `SHIN`, `TORSO`, `ARM`. Scroll orbits the lifter out of frame, the mouse turns it, and `prefers-reduced-motion` freezes it at lockout.

## Add the real content
- **Photos**: put files in `assets/photos/` with the names listed in `js/data.js`
  (`coach-1.jpg` … `coach-5.jpg`, `floor-1.jpg` … `floor-3.jpg`, `gallery-1.jpg` … `gallery-6.jpg`).
  A labelled placeholder shows until each file exists.
- **Text**: `js/data.js` holds the gym details, coaches, floors and prices.
  Coach names/bios, floor descriptions, phone, address, hours and the member count are **placeholders**.
- **Prices**: 3 months ₹6,000 · 6 months ₹9,000 · 12 months ₹18,000.

## Credits
Three.js r170 (MIT), vendored in `vendor/`. Fonts: Anton + Inter via Google Fonts.
