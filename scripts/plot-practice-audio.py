"""Compare full-piece stem renders: before directory, after directory, output prefix."""
import json, sys, pathlib
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
before, after, target = map(pathlib.Path, sys.argv[1:4])
target.parent.mkdir(parents=True, exist_ok=True)
centres = 1000 * 2.0 ** (np.arange(-15, 14) / 3)
rows = []
for directory in [before, after]:
    info = json.loads((directory/'analysis.json').read_text()); rate = info['rate']
    a = np.memmap(directory/'stems.f32', dtype='<f4', mode='r').reshape(-1, 10)
    freq = np.fft.rfftfreq(4096, 1/rate); window = np.hanning(4096)
    psd = np.zeros((2049, 8)); frames = 0
    for start in range(0, len(a)-4096+1, 2048):
        psd += abs(np.fft.rfft(a[start:start+4096,:8]*window[:,None],axis=0))**2
        frames += 1
    psd *= 2/(frames*4096*np.sum(window**2)); psd[[0,-1]] *= .5
    psd = psd.reshape(2049,4,2).mean(axis=2)
    bands = np.array([psd[(freq>=f/2**(1/6))&(freq<f*2**(1/6))].sum(axis=0) for f in centres])
    rms = np.sqrt(np.mean(a.astype(np.float64).reshape(-1,5,2)**2,axis=(0,2)))
    mix = a.reshape(-1,5,2).sum(axis=1)*.6
    regions = {name:(10*np.log10(np.maximum(psd[(freq>=low)&(freq<high)].sum(axis=0),1e-16))).tolist() for name,low,high in [('bass',30,200),('lowMid',200,800),('mid',800,2000),('presence',2000,8000)]}
    rows.append({'source':str(directory),'rmsDb':(20*np.log10(rms)).tolist(),'mixPeakDb':float(20*np.log10(np.max(abs(mix)))),'bandsDb':(10*np.log10(np.maximum(bands,1e-16))).tolist(),'regionsDb':regions})
    print(directory,'RMS keys/bass/guitar/drums/fx:',np.round(20*np.log10(rms),2),'mix peak',round(rows[-1]['mixPeakDb'],2))
fig,axes=plt.subplots(1,2,figsize=(11,4),sharey=True)
for ax,row,title in zip(axes,rows,['Vorher','Gitarre −3 dB, dezenter Hall']):
    for role,label in enumerate(['Keyboard','Bass','Gitarre','Drums']):ax.semilogx(centres,np.array(row['bandsDb'])[:,role],label=label)
    ax.set(title=title,xlabel='Frequenz [Hz]',xlim=(30,18000),ylim=(-95,-30));ax.grid(alpha=.2);ax.legend(fontsize=8)
axes[0].set_ylabel('RMS je Terzband [dBFS]')
fig.suptitle('Praxis · Grade 5 Barock · 0x5EEC6550')
fig.text(.5,.01,'Vollständiges Stück + 3 s Ausklang · trockene Stimmen · Stereo-Leistungsmittel · kein LUFS-/Hörurteil',ha='center',fontsize=8)
fig.tight_layout(rect=(0,.04,1,.95));fig.savefig(str(target)+'.png',dpi=150);fig.savefig(str(target)+'.svg');plt.close(fig)
pathlib.Path(str(target)+'.json').write_text(json.dumps({'piece':'#/practice/guitar/5/baroque/0x5EEC6550','method':info['method'],'spectralMethod':'4096-sample Hann, 50% overlap, stereo mean power per third-octave band; mix includes effects and 0.6 master, before compressor.','centresHz':centres.tolist(),'roles':info['roles'],'before':rows[0],'after':rows[1]},indent=2)+'\n')
