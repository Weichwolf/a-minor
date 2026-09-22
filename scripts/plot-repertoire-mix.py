import json, pathlib
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
root = pathlib.Path('docs/audio')
report = json.loads((root/'repertoire-mix.json').read_text())
rows = []
for piece in report['pieces']:
    row = []
    for state in ['beforeDb', 'afterDb']:
        seconds = sum(s['end']-s['start'] for s in piece['sections'])
        row.append([10*np.log10(sum((s['end']-s['start'])*10**(s[state][r]/10) for s in piece['sections'])/seconds) for r in range(4)])
    rows.append(row)
data = np.array(rows)
fig, axes = plt.subplots(1, 2, figsize=(11, 12), sharey=True, layout='constrained')
for i, ax in enumerate(axes):
    im = ax.imshow(data[:, i, :], vmin=-50, vmax=-30, cmap='viridis', aspect='auto')
    ax.set_xticks(range(4), ['Keyboard', 'Bass', 'Guitar', 'Drums'])
    ax.set_yticks(range(30), [p['title'] for p in report['pieces']])
    ax.set_title(['Before', 'After'][i])
    for y in range(30):
        for x in range(4):
            v = data[y, i, x]
            ax.text(x, y, f'{v:.1f}', ha='center', va='center', color='black' if v > -39 else 'white', fontsize=8)
fig.suptitle('Repertoire: complete-song dry-stem RMS\nIncluding rests; dBFS before master/compressor — not perceived loudness', fontsize=13)
fig.colorbar(im, ax=axes, label='dBFS', shrink=.55)
fig.savefig(root/'repertoire-mix.png', dpi=150)
fig.savefig(root/'repertoire-mix.svg')
p = root/'repertoire-mix.svg'
p.write_text('\n'.join(line.rstrip() for line in p.read_text().splitlines())+'\n')
