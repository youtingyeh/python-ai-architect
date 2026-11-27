const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{parseHTML}=require('linkedom');
function boot(){const {window}=parseHTML(fs.readFileSync('study.html','utf8')),saved={};for(const id of ['stage','search'])Object.defineProperty(window.document.querySelector('#'+id),'value',{value:'',writable:true});const ctx={window,document:window.document,location:{hash:''},localStorage:{getItem:()=>null,setItem:(k,v)=>saved[k]=v},Blob,URL,setTimeout,confirm:()=>true};vm.createContext(ctx);for(const n of ['study-data.js','study.js'])vm.runInContext(fs.readFileSync(n,'utf8'),ctx);return {window,ctx,saved,d:window.document};}
test('all 76 reading lessons render with AI-first order, 30-minute reading depth, examples, and valid questions',()=>{
  const {window,ctx,d}=boot();
  assert.equal(window.STUDY.length,76);
  // First 43 lessons must be the AI track, and lessons 44..76 must be w1..w33 engineering extension
  for(let i=0;i<43;i++){
    assert.ok(!/^w([1-9]|[12][0-9]|3[0-3])$/.test(window.STUDY[i].id),`Lesson ${i+1} (${window.STUDY[i].id}) should be AI track`);
  }
  for(let i=43;i<76;i++){
    assert.ok(/^w([1-9]|[12][0-9]|3[0-3])$/.test(window.STUDY[i].id),`Lesson ${i+1} (${window.STUDY[i].id}) should be post-AI engineering track`);
  }
  let count=0;
  for(const l of window.STUDY){
    ctx.location.hash='#'+l.id;
    window.dispatchEvent(new window.Event('hashchange'));
    assert.equal(d.querySelectorAll('textarea').length,0);
    assert.equal(d.querySelectorAll('fieldset').length,l.quiz.length);
    assert.ok(l.sections.length>=5,`Lesson ${l.id} should have at least 5 deep sections`);
    const secChars=l.sections.reduce((n,[h,p])=>n+String(h).length+String(p).length,0);
    const totalChars=secChars+(l.example||'').length+(l.walkthrough||[]).join('').length+(l.solution||'').length;
    assert.ok(totalChars>=2500,`Lesson ${l.id} should have at least 2500 chars for 30-min study, got ${totalChars}`);
    assert.ok(l.example&&l.example.length>=150,`Lesson ${l.id} must have a code/case example`);
    assert.ok(Array.isArray(l.walkthrough)&&l.walkthrough.length>=4,`Lesson ${l.id} must have a step-by-step walkthrough`);
    assert.ok(l.quiz.length>=3,`Lesson ${l.id} must have at least 3 quiz questions`);
    for(const q of l.quiz){
      assert.ok(q.options[q.answer]);
      assert.ok(q.explanation&&q.explanation.length>=40);
      count++;
    }
    // Verify no raw $...$ or unrendered LaTeX commands appear outside <pre><code> blocks
    const proseHtml=Array.from(d.querySelectorAll('.lesson-prose, .walkthrough-list, .quiz')).map(el=>el.innerHTML.replace(/<code[\s\S]*?<\/code>/g,'')).join(' ');
    assert.equal(/\\[a-zA-Z]+|\$[^$\n]+\$|\$/.test(proseHtml),false,`Lesson ${l.id} has unrendered math or raw $`);
  }
  assert.ok(count>=228);
});
test('grading provides explanation and changing answer invalidates passed state',()=>{
  const {window,d,saved}=boot();
  const l=window.STUDY[0];
  for(let i=0;i<l.quiz.length;i++){
    const el=d.querySelector(`[name=q${i}][value="${l.quiz[i].answer}"]`);
    el.checked=true;
    el.dispatchEvent(new window.Event('change',{bubbles:true}));
  }
  d.querySelector('#quiz').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
  assert.match(d.querySelector('#result').textContent,/本課已通過/);
  assert.equal(d.querySelectorAll('.feedback').length,l.quiz.length);
  const el=d.querySelector(`[name=q0][value="${(l.quiz[0].answer+1)%l.quiz[0].options.length}"]`);
  el.checked=true;
  el.dispatchEvent(new window.Event('change',{bubbles:true}));
  assert.equal(d.querySelectorAll('.feedback').length,0);
  assert.equal(JSON.parse(saved['python-ai-reading-v1']).lessons[l.id].graded,false);
  d.querySelector('#quiz').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
  assert.match(d.querySelector('#result').textContent,new RegExp(`${l.quiz.length-1} \\/ ${l.quiz.length}`));
  assert.equal(d.querySelectorAll('.wrong').length,1);
});
