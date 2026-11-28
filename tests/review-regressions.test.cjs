const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process'),{parseHTML}=require('linkedom');
function boot(initial={}){const {window}=parseHTML(fs.readFileSync('study.html','utf8')),saved={...initial};for(const id of ['stage','search'])Object.defineProperty(window.document.querySelector('#'+id),'value',{value:'',writable:true});const ctx={window,document:window.document,location:{hash:''},localStorage:{getItem:k=>saved[k]||null,setItem:(k,v)=>saved[k]=v},Blob,URL,setTimeout};vm.createContext(ctx);for(const n of ['study-data.js','glossary.js','study.js'])vm.runInContext(fs.readFileSync(n,'utf8'),ctx);return {window,ctx,saved,d:window.document};}
function route(b,id){b.ctx.location.hash='#'+id;b.window.dispatchEvent(new b.window.Event('hashchange'));}
test('reading formulas preserve transpose, mean, division and cases; all lessons have supported formulas',()=>{const b=boot();for(const l of b.window.STUDY){route(b,l.id);assert.equal(b.d.querySelectorAll('.math-error').length,0,l.id);assert.ok(![...b.d.querySelectorAll('.math-inline,.math-block')].some(x=>x.textContent.includes('amp;')),l.id);}route(b,'ext-attention');assert.ok([...b.d.querySelectorAll('sup')].some(x=>x.textContent==='⊤'));assert.ok(b.d.querySelector('.moverline'));assert.ok(b.d.querySelector('#lesson').textContent.includes('÷'));route(b,'ext-overfit');assert.ok(b.d.querySelector('.mcases'));});
test('resume uses reading position and migrates old grades without reusing old indices',()=>{const old=JSON.stringify({version:1,last:'ms-lesson-10',lessons:{'ext-orientation':{answers:[1,1,1],graded:true}}}),b=boot({'python-ai-reading-v1':old});assert.equal(b.saved['python-ai-reading-v1-before-20261127-fix'],old);assert.equal(JSON.parse(b.saved['python-ai-reading-v1']).lessons['ext-orientation'].graded,false);b.d.querySelector('[data-bookmark="2"]').click();b.d.querySelector('#resume').click();assert.equal(b.ctx.location.hash,'ms-lesson-10');const c=boot(b.saved);assert.equal(JSON.parse(c.saved['python-ai-reading-v1']).lessons['ms-lesson-10'].bookmark,2);});
test('published static package includes every study dependency, glossary is clean, and quiz positions/lengths are balanced',()=>{const html=fs.readFileSync('study.html','utf8'),workflow=fs.readFileSync('.github/workflows/pages.yml','utf8'),copy=workflow.split('\n').find(l=>l.trim().startsWith('cp study.html'));for(const match of html.matchAll(/(?:src|href)="([^"#]+\.(?:js|css))"/g)){assert.ok(copy.includes(match[1]),match[1]);assert.ok(fs.existsSync(match[1]));}const b=boot(),n=[0,0,0,0];let longest=0,total=0;for(const l of b.window.STUDY){assert.ok(l.quizVersion);for(const q of l.quiz){n[q.answer]++;total++;const al=q.options[q.answer].length,om=Math.max(...q.options.filter((_,k)=>k!==q.answer).map(o=>o.length));if(al>om)longest++;}}assert.ok(Math.max(...n)<100,JSON.stringify(n));assert.ok(longest/total<0.55,`longest answer bias too high: ${longest}/${total}`);const seen=new Set();for(const [t] of b.window.GLOSSARY){const k=t.replace(/（.*?）|\(.*?\)/g,'').trim().toLowerCase();assert.equal(seen.has(k),false,`duplicate glossary key: ${t}`);seen.add(k);assert.equal(['專家','來源','鹽','秩'].includes(k),false,`ambiguous glossary term: ${t}`);}});
test('corrected teaching examples execute and reject security counterexamples',()=>{const py=String.raw`
import json,contextlib,io,ast
s=open('study-data.js',encoding='utf8').read();D={l['id']:l for l in json.loads(s[s.index('['):s.rindex(']')+1])}
for id in ['w27','ext-harness','ms-lesson-08','w34','ms-lesson-13','ms-lesson-15','ms-lesson-16','ms-lesson-06','w19','ext-post-training','ext-multimodal','ext-mcp','ext-self-improving','w37','w38','w39','w40','w41','w42','q1','q2','q3','q4','q5','q6','q7','q8','q9','q10','q11','q12','q13','q14','q15','q16','q17','q18','q19','q20','q21','q22','q23','q24']:
 ns={}
 with contextlib.redirect_stdout(io.StringIO()):exec(D[id]['example']+'\n'+D[id]['solution'],ns)
 if id=='w34':
  try:ns['svc'].request_refund('OTHER','ENR-100',2000,'KEY-A');raise AssertionError('authorization bypass')
  except ns['RefundError'] as e:assert e.code=='ERR_403_FORBIDDEN'
  for amount in [True,1000]:
   try:ns['svc'].request_refund('STU-1','ENR-100',amount,'KEY-A');raise AssertionError('invalid replay')
   except ns['RefundError']:pass
 if id=='w19':assert ns['redact_payload']({'users':[{'password':'SECRET'}]})['users'][0]['password']=='***REDACTED***'
 if id=='ms-lesson-13':
  g=ns['SecurityBoundaryGuard'](True);args={'to':'a@example.test'}
  assert g.authorize_tool_call('send_email',args,'HUMAN_SIG_fake')['status']!='ALLOWED'
  token=g.record_trusted_ui_approval('send_email',args)
  assert g.authorize_tool_call('send_email',args,token)['status']=='ALLOWED'
  assert g.authorize_tool_call('send_email',args,token)['status']!='ALLOWED'
  token=g.record_trusted_ui_approval('send_email',args)
  assert g.authorize_tool_call('send_email',{'to':'other@example.test'},token)['status']!='ALLOWED'
 if id=='ms-lesson-15':
  c=ns['RetrievedChunk']('c1','規定','學生可以申請退費。')
  result=ns['diagnose_rag_response']([c],{'c1'},'學生不可以申請退費。','c1','學生可以申請退費。')
  assert result['requires_semantic_review'] and result['stage']!='PASS'
 if id=='ms-lesson-08':assert ns['hits'][0]['rrf_score']==ns['hits'][1]['rrf_score']
 if id=='ms-lesson-16':
  m=ns['ModelCandidate']('demo/gemma','a'*40,'gemma',['weights.safetensors'],False,.99,.99)
  assert not ns['audit_open_weight_model'](m)['approved']
print('review counterexamples passed')
`;const r=spawnSync('python',['-c',py],{encoding:'utf8',timeout:15000});assert.equal(r.status,0,r.stdout+r.stderr);});
