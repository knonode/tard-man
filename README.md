# Weird Scratchy Pacman Theme Player

A simple browser-based application that plays a distorted and weird version of the classic Pacman theme music. The sound is deliberately made to be scratchy and glitchy, with interactive controls to adjust the amount of distortion and weirdness. Features a custom animated head with open and closed mouth instead of the traditional Pacman character.

## Features

- Plays a simplified version of the Pacman theme music
- Interactive controls to adjust the level of "scratchiness" and "weirdness"
- Animated custom head that chomps along with the music
- Retro, glitchy aesthetics with static and visual effects

## How to Use

1. Open the `index.html` file in a modern web browser (Chrome, Firefox, Edge recommended)
2. Click the "PLAY THEME" button to start the music and animation
3. Adjust the "Scratchiness" slider to control the amount of distortion
4. Adjust the "Weirdness" slider to control frequency filters and other audio effects
5. Click "STOP" to stop the music and animation

## How It Works

This application uses the Web Audio API to generate sounds directly in the browser. Instead of playing a pre-recorded audio file, it:

- Generates the Pacman theme note by note using oscillators
- Applies various audio effects like distortion and filtering
- Adds random glitchy elements and noise bursts
- Modifies the waveform shapes and detunes notes for extra weirdness
- Toggles between head images to create a simple chomping animation

## Technical Details

- The audio is generated entirely with JavaScript using the Web Audio API
- The distortion effect uses a custom curve algorithm to create the scratchy sound
- Random elements are introduced throughout the audio chain for unpredictability
- Simple CSS animations and image toggling for the head character
- Images are stored in the `images` directory

## Browser Compatibility

This application requires a modern browser that supports:
- Web Audio API
- CSS animations and modern CSS features

Works best in Chrome, Firefox, and Edge.

## License

Feel free to use, modify, and distribute this code for personal or educational purposes. 