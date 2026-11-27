import json,glob,os,re
import pathlib
root=str(pathlib.Path(__file__).resolve().parent.parent)
s=open(f'{root}/scripts/study-data.orig.js',encoding='utf8').read()
L=json.loads(s[s.index('['):s.rstrip().rstrip(';').rindex(']')+1])
gloss=[];seen=set()
byid={l['id']:l for l in L}
for f in sorted(glob.glob(f'{root}/rewrite/*.txt')):
    lid=os.path.basename(f)[:-4];txt=open(f,encoding='utf8').read()
    blocks=re.split(r'^@(section|term)[ \t]*(.*)$',txt,flags=re.M)
    secs=[]
    for i in range(1,len(blocks),3):
        k,a,b=blocks[i],blocks[i+1].strip(),re.sub(r'\n{3,}','\n\n',blocks[i+2].strip())
        if k=='section': secs.append([a,b])
        elif k=='term':
            if a not in seen: seen.add(a);gloss.append([a,b])
        else: raise SystemExit(f'{lid}: bad block {k}')
    assert len(secs)>=5,(lid,len(secs))
    byid[lid]['sections']=secs
for i,l in enumerate(L):
    deep=sum(len(h)+len(p) for h,p in l['sections'])+len(''.join(l['walkthrough']))
    mark='REWRITTEN' if os.path.exists(f"{root}/rewrite/{l['id']}.txt") else ''
    if mark: print(f"{i+1:>2} {l['id']:<18} text={deep:>6} ~{deep/300:4.1f}min {'OK' if deep/300>=30 else 'SHORT'}")
open(f'{root}/study-data.js','w',encoding='utf8').write('window.STUDY = '+json.dumps(L,ensure_ascii=False)+';')
open(f'{root}/glossary.js','w',encoding='utf8').write('window.GLOSSARY = '+json.dumps(gloss,ensure_ascii=False)+';\n')
print(len(gloss),'glossary terms')
