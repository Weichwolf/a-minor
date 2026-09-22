# FluidR3 GM · a-minor selection

Author: Frank Wen and the contributors listed in [LICENSE.txt](LICENSE.txt).
License: MIT. The included Debian copyright file documents the original permission and contributor credits.

Source: [Debian fluid-soundfont-gm 3.1-5.3](https://deb.debian.org/debian/pool/main/f/fluid-soundfont/fluid-soundfont-gm_3.1-5.3_all.deb), file `usr/share/sounds/sf2/FluidR3_GM.sf2`. [manifest.json](manifest.json) records the SHA-256 of that original SF2 and of the distributed selection. `sourceSha256` hashes the SF2, not the Debian archive.

Selected melodic programs (zero-based): 0, 4, 25–30, 33. Drum sets: standard 0 and power 16. Complete presets retain original samples, stereo channels, key/velocity zones, envelope/filter generators, modulators, exclusive classes and loop points. Preset attenuation is calibrated as documented in `balance.json`. No resampling or lossy encoding. SpessaSynth rewrites the SF2 container. The selection occupies 34,336,802 bytes, about 32.7 MiB (`bytes / 1024²`). It loads on first playback, not on page entry.

Rebuild from the extracted original:

```sh
npm ci
node scripts/build-soundfont.mjs /path/to/FluidR3_GM.sf2
node scripts/vendor-audio.mjs
```

SpessaSynth evaluates the SoundFont envelopes, filters, sample loops, velocity response, pitch bends and drum exclusive groups. A gain stage and compressor limit the mixed preview. Normal endings retain release tails; transport stop fades the complete bus in 30 ms. Repeated playback follows the written form, including rests. Practice mute and gain remain independent of MIDI program/controller changes.

This general-purpose bank replaces the separate Salamander piano library. No claim of equal piano realism is made. Guitar preview renders the written voices and bends; a GM patch cannot reproduce every pick, string, hammer-on or pull-off articulation. Dry PCM tests isolate sample envelopes and hi-hat choking from the reverb tail; browser tests cover the actual worklet, transport and output bus.

## Balance calibration

[Measurement report and spectra](../../docs/audio/SOUNDFONT_BALANCE.md). `balance.json` records the net preset corrections in dB. Clean guitar: −5; muted/overdrive/distortion guitar: −8; electric piano: −6. Acoustic piano and bass retain their levels. Standard drums: +6; power drums: 0.

The build adds positive preset attenuation without changing note velocity, sample data, filtering or envelopes. SpessaSynth 4.3.22 scales the stored SF2 attenuation by 0.4; 25 stored centibels therefore produce 1 dB of attenuation. Every local preset zone inherits its previous effective attenuation before the offset is added. The independent drum bus adds +6 dB (`10^(6/20)`); the power-kit preset compensates this with −6 dB. The runtime mix slider multiplies this calibration, so 100% denotes the calibrated default and 0% remains silent. Program/controller changes do not reset the calibration. External MIDI files and MIDI Out remain unchanged because the correction is specific to this SoundFont.

The player revalidates the cached bank and balance configuration on first playback after a page load. Original PCM level fixtures and rendered calibration tests detect changes to the attenuation response when the engine or bank is updated.
