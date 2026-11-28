const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{parseHTML}=require('linkedom');
function boot(){const {window}=parseHTML(fs.readFileSync('study.html','utf8')),saved={};for(const id of ['stage','search'])Object.defineProperty(window.document.querySelector('#'+id),'value',{value:'',writable:true});const ctx={window,document:window.document,location:{hash:''},localStorage:{getItem:()=>null,setItem:(k,v)=>saved[k]=v},Blob,URL,setTimeout,confirm:()=>true};vm.createContext(ctx);for(const n of ['study-data.js','glossary.js','study.js'])vm.runInContext(fs.readFileSync(n,'utf8'),ctx);return {window,ctx,saved,d:window.document};}
test('all 110 reading lessons render with AI-first order, 30-minute reading depth, examples, and valid questions',()=>{
  const {window,ctx,d}=boot();
  assert.equal(window.STUDY.length,110);
  // First 47 lessons must be the AI track, lessons 48..80 must be w1..w33, 81..86 the AI security & quantum extension w37..w42, and 87..110 the quantum computing track q1..q24
  for(let i=0;i<47;i++){
    assert.ok(!/^w([1-9]|[12][0-9]|3[0-3])$/.test(window.STUDY[i].id),`Lesson ${i+1} (${window.STUDY[i].id}) should be AI track`);
  }
  for(let i=47;i<80;i++){
    assert.ok(/^w([1-9]|[12][0-9]|3[0-3])$/.test(window.STUDY[i].id),`Lesson ${i+1} (${window.STUDY[i].id}) should be post-AI engineering track`);
  }
  for(let i=80;i<86;i++){
    assert.equal(window.STUDY[i].id,'w'+(i-43),`Lesson ${i+1} should be AI security & quantum extension`);
    assert.equal(window.STUDY[i].track,'eng');
  }
  for(let i=86;i<110;i++){
    assert.equal(window.STUDY[i].id,'q'+(i-85),`Lesson ${i+1} should be quantum computing track`);
    assert.equal(window.STUDY[i].track,'eng');
  }
  let count=0;
  for(const l of window.STUDY){
    ctx.location.hash='#'+l.id;
    window.dispatchEvent(new window.Event('hashchange'));
    assert.equal(d.querySelectorAll('textarea').length,0);
    // 閱讀頁不放選擇題，只放前往測驗區的連結
    assert.equal(d.querySelectorAll('fieldset').length,0);
    assert.ok(d.querySelector(`a[href="#quiz-${l.id}"]`),`Lesson ${l.id} should link to its quiz`);
    // Verify no raw $...$, unrendered LaTeX commands, {,}, or unfenced ``` appear in lesson prose outside <code> blocks
    const lessonHtml=Array.from(d.querySelectorAll('.lesson-prose, .walkthrough-list')).map(el=>el.innerHTML.replace(/<code[\s\S]*?<\/code>/g,'')).join(' ');
    assert.equal(/\\[a-zA-Z]+|\$[^$\n]+\$|\$|\{,\}|```/.test(lessonHtml),false,`Lesson ${l.id} prose has unrendered math, {,}, raw $, or raw code fence`);
    ctx.location.hash='#quiz-'+l.id;
    window.dispatchEvent(new window.Event('hashchange'));
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
    const quizHtml=Array.from(d.querySelectorAll('.quiz')).map(el=>el.innerHTML.replace(/<code[\s\S]*?<\/code>/g,'')).join(' ');
    assert.equal(/\\[a-zA-Z]+|\$[^$\n]+\$|\$|\{,\}|```/.test(quizHtml),false,`Lesson ${l.id} quiz has unrendered math, {,}, raw $, or raw code fence`);
  }
  assert.ok(count>=240);
});
test('grading provides explanation and changing answer invalidates passed state',()=>{
  const {window,ctx,d,saved}=boot();
  const l=window.STUDY[0];
  ctx.location.hash='#quiz-'+l.id;
  window.dispatchEvent(new window.Event('hashchange'));
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

test('quiz hub lists every lesson; term tooltips, code blocks, quotes, and math commas render',()=>{
  const {window,ctx,d}=boot();
  ctx.location.hash='#quiz';
  window.dispatchEvent(new window.Event('hashchange'));
  assert.equal(d.querySelectorAll('.quiz-hub a').length,110);
  ctx.location.hash='#ext-tensor';
  window.dispatchEvent(new window.Event('hashchange'));
  assert.ok(d.querySelectorAll('.lesson-prose .term').length>0);
  ctx.location.hash='#ext-orientation';
  window.dispatchEvent(new window.Event('hashchange'));
  assert.equal(d.querySelector('#lesson').textContent.includes('{,}'),false);
  assert.ok(d.querySelector('#lesson').textContent.includes('10,000,000'));
  ctx.location.hash='#ext-context';
  window.dispatchEvent(new window.Event('hashchange'));
  assert.ok(d.querySelectorAll('.lesson-prose pre.prose-code').length>0);
  assert.ok(d.querySelectorAll('.lesson-prose blockquote.prose-quote').length>0);
});
