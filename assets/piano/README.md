# Salamander Grand Piano v3 · a-minor subset

Samples by Alexander Holm, CC BY 3.0. Retuning by Markus Fiedler; SFZ mapping by kinwie.
[Credits and adaptation](credits.html), [license](LICENSE.txt).

Pinned upstream: `sfzinstruments/SalamanderGrandPiano@3382bf9496bba2486f5ab0de55a264d1dfc38404`.

Rebuild with Git, Python 3 and FFmpeg (libmp3lame):

```sh
python3 scripts/build-piano.py ~/Git/SalamanderGrandPiano
```

17 roots (C2–C6, three semitones apart) × 3 velocity layers (4, 8, 12) = 51 files.
MIDI velocities 40, 60 and 92 represent the selected source layers. Nearest-layer selection changes recorded timbre; velocity gain scales relative to that layer. Pitch transposition never exceeds one semitone for the supported C2–C6 range. Source retuning is applied in cents.

Manifest records original and converted SHA-256 hashes. Conversion trims only the documented source offset; complete natural tails remain. Stereo, 44.1 kHz, MP3 VBR quality 4. No individual normalization, looping, added reverb or noise samples.

The player loads only required samples, four concurrent requests, 15-second request timeout, failed loads retry on the next Listen. Decoded LRU cache budget: 96 MiB. A prepared exercise additionally retains its required buffers until stopped, even if evicted from the cache.

Envelope: recorded attack/decay, 2 ms de-click ramp (at most half a note), no artificial sustain plateau in the sound. At note-off, gain falls exponentially to −60 dB over a 0.18–0.65 s base release, shortened for very short notes; bass damps more slowly. Low-pass cutoff falls during release. These values are an explicit playback model, not measured Salamander damper parameters. Stop fades existing voices over 30 ms and cancels future scheduling. Playback loops on the complete written form duration, including rests; release tails overlap the boundary without extending the loop. Cycle timestamps derive from the original audio-clock start to avoid accumulating timer drift. Scheduler looks ahead 150 ms; delayed scheduling beyond 250 ms stops instead of bunching attacks. A shared compressor provides headroom for polyphony.

Bends are continuous sample pitch shifts, retaining the written target pitch. They are not a guitar articulation model. Pedal, sympathetic resonance and key-release noises are omitted; this is a compact score reference, not a full SFZ piano emulation.
