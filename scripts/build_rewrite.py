import json,glob,os,re,hashlib
import pathlib
root=str(pathlib.Path(__file__).resolve().parent.parent)
s=open(f'{root}/scripts/study-data.orig.js',encoding='utf8').read()
L=json.loads(s[s.index('['):s.rstrip().rstrip(';').rindex(']')+1])
# Filter overly generic 1-char or everyday 2-char terms that cause cross-domain false positives in global auto-highlighting
SKIP_GLOSS_KEYS={
    '秩','鹽','專家','來源','方法','設定','秘密','假設','取捨','命中',
    '交易','行程','類別','實例','例外','資產','否認','模擬','訊號',
    '提交','主體','標頭','fr'
}
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
            norm=re.sub(r'（.*?）|\(.*?\)','',a).strip()
            norm_key=norm.lower()
            if not norm_key or norm in SKIP_GLOSS_KEYS or norm_key in SKIP_GLOSS_KEYS:
                continue
            if norm_key not in seen:
                seen.add(norm_key);gloss.append([a,b])
        else: raise SystemExit(f'{lid}: bad block {k}')
    assert len(secs)>=5,(lid,len(secs))
    if lid in byid:
        byid[lid]['sections']=secs
for l in L:
    l["quizVersion"] = hashlib.sha256(json.dumps(l["quiz"], ensure_ascii=False, sort_keys=True).encode()).hexdigest()[:16]
for i,l in enumerate(L):
    deep=sum(len(h)+len(p) for h,p in l['sections'])+len(''.join(l['walkthrough']))
    mark='REWRITTEN' if os.path.exists(f"{root}/rewrite/{l['id']}.txt") else ''
    if mark: print(f"{i+1:>2} {l['id']:<18} text={deep:>6} ~{deep/300:4.1f}min {'OK' if deep/300>=30 else 'SHORT'}")
open(f'{root}/study-data.js','w',encoding='utf8',newline='\n').write('window.STUDY = '+json.dumps(L,ensure_ascii=False)+';')
open(f'{root}/glossary.js','w',encoding='utf8',newline='\n').write('window.GLOSSARY = '+json.dumps(gloss,ensure_ascii=False)+';\n')
print(len(gloss),'glossary terms')
