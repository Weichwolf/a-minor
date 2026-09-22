# Locally hosted audio engine

- [SpessaSynth Lib](https://github.com/spessasus/spessasynth_lib) 4.3.14, Spessasus, Apache-2.0.
- [SpessaSynth Core](https://github.com/spessasus/spessasynth_core) 4.3.22, Spessasus, Apache-2.0.
- [stb-vorbis](https://www.npmjs.com/package/stb-vorbis), pinned in `versions.json` and package-lock.json; Apache-2.0 distribution with its included notices.

License texts are adjacent to the JavaScript files. `npm ci && node scripts/vendor-audio.mjs` copies the installed distribution files. Changes: module imports point to local sibling files; source-map references are removed from the main modules. Trailing whitespace and surplus final blank lines are normalized, including in the AudioWorklet bundle. No runtime CDN requests.
