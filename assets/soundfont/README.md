# FluidR3 GM · a-minor selection

Author: Frank Wen and the contributors listed in [LICENSE.txt](LICENSE.txt).
License: MIT. The included Debian copyright file documents the original permission and contributor credits.

Source: [Debian fluid-soundfont-gm 3.1-5.3](https://deb.debian.org/debian/pool/main/f/fluid-soundfont/fluid-soundfont-gm_3.1-5.3_all.deb), file `usr/share/sounds/sf2/FluidR3_GM.sf2`. [manifest.json](manifest.json) records the SHA-256 of that original SF2 and of the distributed selection. `sourceSha256` hashes the SF2, not the Debian archive.

Selected melodic programs (zero-based): 0, 4, 25–30, 33. Drum sets: standard 0 and power 16. Complete presets retain original samples, stereo channels, key/velocity zones, generators, modulators, exclusive classes and loop points. No resampling or lossy encoding. SpessaSynth rewrites the SF2 container. The selection occupies 34,336,590 bytes, about 32.7 MiB (`bytes / 1024²`). It loads on first playback, not on page entry.

Rebuild from the extracted original:

```sh
npm ci
node scripts/build-soundfont.mjs /path/to/FluidR3_GM.sf2
node scripts/vendor-audio.mjs
```

SpessaSynth evaluates the SoundFont envelopes, filters, sample loops, velocity response, pitch bends and drum exclusive groups. A gain stage and compressor limit the mixed preview. Normal endings retain release tails; transport stop fades the complete bus in 30 ms. Repeated playback follows the written form, including rests. Practice mute and gain remain independent of MIDI program/controller changes.

This general-purpose bank replaces the separate Salamander piano library. No claim of equal piano realism is made. Guitar preview renders the written voices and bends; a GM patch cannot reproduce every pick, string, hammer-on or pull-off articulation. Dry PCM tests isolate sample envelopes and hi-hat choking from the reverb tail; browser tests cover the actual worklet, transport and output bus.
