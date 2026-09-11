import concurrent.futures
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile

source = Path(sys.argv[1]).expanduser()
target = Path(__file__).resolve().parents[1] / 'assets/piano'
revision = '3382bf9496bba2486f5ab0de55a264d1dfc38404'

def read(path):
    return subprocess.check_output(['git', '-C', str(source), 'show', f'{revision}:{path}'])

tuning = [int(x) for x in re.findall(r'#define \$TUNE\d+ (-?\d+)', read('Data/tune_ret.txt').decode())]
layers = [(4, 40), (8, 60), (12, 92)]
offsets = {v: [int(x) for x in re.findall(r'#define \$OFF\d+ (\d+)', read(f'Data/vel_{v:02}.txt').decode())] for v, _ in layers}
target.mkdir(parents=True, exist_ok=True)

def convert(job):
    midi, layer, velocity = job
    name = ['C', '', '', 'D#', '', '', 'F#', '', '', 'A', '', ''][midi % 12] + str(midi // 12 - 1)
    original = f'Samples/{name}v{layer}.flac'
    filename = f'{midi}-v{layer}.mp3'
    index = (midi - 21) // 3
    # Fetches stay serial to avoid concurrent lazy-fetch mutations in the source checkout.
    raw = blobs[original]
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / 'source.flac'
        path.write_bytes(raw)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(path), '-af', f'atrim=start_sample={offsets[layer][index]},asetpts=PTS-STARTPTS', '-ar', '44100', '-c:a', 'libmp3lame', '-q:a', '4', '-map_metadata', '-1', str(target / filename)], check=True)
    return {'midi': midi, 'layer': layer, 'velocity': velocity, 'tune': tuning[index], 'file': filename, 'source': original, 'sourceSha256': hashlib.sha256(raw).hexdigest(), 'sha256': hashlib.sha256((target / filename).read_bytes()).hexdigest()}

jobs = [(m, v, vel) for m in range(36, 85, 3) for v, vel in layers]
blobs = {}
for m, v, _ in jobs:
    name = ['C', '', '', 'D#', '', '', 'F#', '', '', 'A', '', ''][m % 12] + str(m // 12 - 1)
    path = f'Samples/{name}v{v}.flac'
    blobs[path] = read(path)
    print(path, flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    samples = list(pool.map(convert, jobs))
(target / 'manifest.json').write_text(json.dumps({'name': 'Salamander Grand Piano v3', 'author': 'Alexander Holm', 'license': 'CC-BY-3.0', 'source': 'https://github.com/sfzinstruments/SalamanderGrandPiano', 'revision': revision, 'samples': samples}, indent=2) + '\n')
(target / 'LICENSE.txt').write_bytes(read('LICENSE'))
print(f'{len(samples)} samples; {sum((target / s["file"]).stat().st_size for s in samples)} bytes')
