# CHIP8 Emulator Wasm Demo

## Overview

This project is inspired by the retro graphics of the Chip-8 system and serves as a demonstration of my Chip-8 emulator [repo](https://github.com/berke-bakar/chip8-emulator).

![chip8emulator vercel app_ (2)](https://github.com/user-attachments/assets/d9dd516a-6106-4771-969a-d97957e33953)
![chip8emulator vercel app_ (3)](https://github.com/user-attachments/assets/d4be195f-151b-4e9e-ab4a-f0692824b15b)
![chip8emulator vercel app_ (1)](https://github.com/user-attachments/assets/9b96f392-66e5-4dc8-9c8d-165f14f0309e)

![chip8emulator vercel app_](https://github.com/user-attachments/assets/e05edbc7-b48e-4d52-9836-759e2e3246a0)

## How it Works

* The **WASM output** of the Chip-8 emulator project is imported into a web worker.
* Selected ROM is uploaded from UI and sent to the worker to be uploaded into emulators virtual memory. (4096 Bytes limit
* The worker handles the Chip-8 execution loop according to configured CPU and Timer frequencies (600 Hz & 60 Hz by default),
* Updated graphics array (64x32) is sent to main thread to be drawn to UI.
* The 2D canvas receives these graphics array and displays them with scale factor of 10 for better visibility.
* This canvas is projected inside a 3D scene to simulate a retro computer running the emulator.

## Attributes

* "Computer Terminal" (https://skfb.ly/6vrwA) by Chris Sweetwood is licensed under Creative Commons Attribution-ShareAlike (http://creativecommons.org/licenses/by-sa/4.0/).

* "Old Wooden Table" (https://skfb.ly/pnLHX) by sergeilihandristov is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
* "Office Chair" (https://skfb.ly/oDozK) by artvolodskikh is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
* "Table lamp mechanics (Retry School)" (https://skfb.ly/oKtIX) by Lunatika is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).

**Sounds**

* https://www.zapsplat.com/music/office-chair-on-wheels-roll-on-tiled-floor-one-wheel-slightly-jammed-4/
* https://www.zapsplat.com/music/footsteps-heavy-duty-work-boots-walking-on-concrete-or-tile-floor/
