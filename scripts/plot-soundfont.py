import json, sys, pathlib
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
before, after, target = map(pathlib.Path, sys.argv[1:4])
target.mkdir(parents=True, exist_ok=True)
profiles = [json.loads((directory/'analysis.json').read_text()) for directory in [before, after]]
rate = profiles[0]['rate']
centres = 1000 * 2.0 ** (np.arange(-15, 14) / 3)
frequency = np.fft.rfftfreq(4096, 1/rate)
window = np.hanning(4096)
colours = ['#276bb2','#8d5caf','#d14c3c','#149479']
labels = ['Keyboard','Bass','Gitarre','Drums']
spectra, measurements = [], []
for directory, profile in zip([before, after], profiles):
    bands, rows = [], []
    for piece in profile['pieces']:
        a = np.fromfile(directory/(piece['id']+'.f32'), dtype='<f4').reshape(-1, 10)
        psd = np.zeros((2049,8))
        frames = 0
        for start in range(0,len(a)-4096+1,2048):
            fft = np.fft.rfft(a[start:start+4096,:8]*window[:,None],axis=0)
            psd += abs(fft)**2
            frames += 1
        psd *= 2/(frames*4096*np.sum(window**2))
        psd[[0,-1]] *= .5
        psd = psd.reshape(2049,4,2).mean(axis=2)
        energy = np.array([psd[(frequency>=f/2**(1/6))&(frequency<f*2**(1/6))].sum(axis=0) for f in centres])
        bands.append(energy)
        mix = a.reshape(-1,5,2).sum(axis=1)*.6
        rms = np.sqrt(np.mean(a[:,:8].reshape(-1,4,2)**2,axis=(0,2)))
        rows.append({'id':piece['id'],'title':piece['title'],'programs':piece['programs'],'rmsDb':list(20*np.log10(rms).astype(float)),'mixPeakDb':float(20*np.log10(np.max(abs(mix)))),'mixRmsDb':float(20*np.log10(np.sqrt(np.mean(mix**2))))})
    spectra.append(10*np.log10(np.maximum(np.mean(bands,axis=0),1e-16)))
    measurements.append(rows)
fig,axes=plt.subplots(1,2,figsize=(12,4.4),sharey=True)
for ax,curves,title in zip(axes,spectra,['Vorher','Kalibriert']):
    for role in range(4):ax.semilogx(centres,curves[:,role],color=colours[role],label=labels[role],lw=1.8)
    ax.set(title=title,xlabel='Frequenz [Hz]',xlim=(30,20000),ylim=(-85,-30))
    ax.set_xticks([50,100,300,1000,3000,10000],['50','100','300','1k','3k','10k'])
    ax.grid(True,alpha=.2);ax.legend(frameon=False,fontsize=9)
axes[0].set_ylabel('RMS je Terzband [dBFS]')
fig.suptitle('FluidR3 / SpessaSynth · Spektrum der vier Stimmen',fontsize=14)
fig.text(.5,.015,'30 Stücke · je Anfang von A und B (ersatzweise A′) · 48 kHz Stereo · trockene Einzelstimmen vor Master/Kompressor',ha='center',fontsize=8)
fig.tight_layout(rect=(0,.04,1,.95));fig.savefig(target/'soundfont-spectrum.png',dpi=160);fig.savefig(target/'soundfont-spectrum.svg');plt.close(fig)
svg=target/'soundfont-spectrum.svg'
svg.write_text('\n'.join(line.rstrip() for line in svg.read_text().splitlines())+'\n')
report={'method':profiles[0]['method'],'spectralMethod':'4096-sample Hann windows, 50% overlap; mean stereo power per one-third octave band, then equal power average over 30 pieces. Dry stems; mix peaks include shared effects and 0.6 browser master gain, before compressor. RMS is not LUFS or a subjective loudness judgement.','profile':profiles[1].get('profile'),'before':measurements[0],'after':measurements[1],'centresHz':centres.tolist(),'spectrumBeforeDb':spectra[0].tolist(),'spectrumAfterDb':spectra[1].tolist()}
(target/'soundfont-levels.json').write_text(json.dumps(report,indent=2)+'\n')
for name,rows in zip(['before','after'],measurements):
    print(name,'median stem dBFS',np.median([p['rmsDb'] for p in rows],axis=0).round(1),'highest mix peak',round(max(p['mixPeakDb'] for p in rows),1))
for kit in [0,16]:
    for name,rows in zip(['before','after'],measurements):
        values=[p['rmsDb'][2]-p['rmsDb'][3] for p in rows if p['programs']['drums']==kit]
        print('kit',kit,name,'median guitar minus drums',round(float(np.median(values)),1))
