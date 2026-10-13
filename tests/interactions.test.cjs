const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..');
function app(initial={}){
 const {window,document}=parseHTML(fs.readFileSync(path.join(root,'index.html'),'utf8'));
 const store=new Map(Object.entries(initial)),timers=new Map(),workers=[];let timer=0;
 const location={hash:'#home'};
 const localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
 class Worker{constructor(){this.terminated=false;workers.push(this);}postMessage(v){this.sent=v;}terminate(){this.terminated=true;}}
 const ctx={window,document,location,localStorage,navigator:{clipboard:{writeText:async()=>{}}},Worker,Event:window.Event,Blob,URL,console,
 setTimeout:(fn,ms)=>{timers.set(++timer,{fn,ms});return timer;},clearTimeout:id=>timers.delete(id),confirm:()=>true};
 window.scrollTo=()=>{};
 // linkedom does not model select.value; define the UI's normal browser contract.
 Object.defineProperty(document.querySelector('#phase-select'),'value',{value:'',writable:true,configurable:true});
 document.querySelector('#course-search').value='';
 document.querySelector('#main').focus=()=>{};
 vm.createContext(ctx);
 for(const file of ['course.js','lessons.js','progress.js','app.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
 const route=(w,s=0)=>{location.hash=`#week/${w}/${s}`;window.dispatchEvent(new window.Event('hashchange'));};
 const click=sel=>document.querySelector(sel).dispatchEvent(new window.Event('click',{bubbles:true}));
 const change=sel=>document.querySelector(sel).dispatchEvent(new window.Event('change',{bubbles:true}));
 const input=(sel,value)=>{document.querySelector(sel).value=value;document.querySelector(sel).dispatchEvent(new window.Event('input',{bubbles:true}));};
 return {window,document,store,timers,workers,route,click,change,input,state:()=>JSON.parse(store.get('python-ai-architect-interactive-v2'))};
}
test('all 180 lesson views render; search and phases filter',()=>{
 const a=app();assert.equal(a.document.querySelectorAll('.course-card').length,36);
 for(let w=1;w<=36;w++)for(let s=0;s<5;s++){a.route(w,s);assert.ok(a.document.querySelector('.lesson-body'));}
 a.input('#course-search','not-a-course');assert.equal(a.document.querySelectorAll('.lesson-link').length,0);
 a.input('#course-search','');a.document.querySelector('#phase-select').value='資料庫';a.change('#phase-select');assert.equal(a.document.querySelectorAll('.lesson-link').length,3);
});
test('draft autosave, markup is escaped, local verification and edits invalidate practice',()=>{
 const a=app();a.route(1,2);a.input('#draft','<script>alert(1)</script>');a.route(2);a.route(1,2);
 assert.equal(a.document.querySelector('#draft').value,'<script>alert(1)</script>');assert.equal(a.document.querySelector('#main script'),null);
 const local=a.document.querySelector('#local-passed');local.checked=true;a.change('#local-passed');
 const practice=a.document.querySelector('[data-step="2"]');practice.checked=true;a.change('[data-step="2"]');assert.equal(a.state().weeks[1].steps[2],true);
 a.input('#draft','print(1)');assert.equal(a.state().weeks[1].steps[2],false);assert.equal(a.state().weeks[1].localPassed,false);
});
test('quiz grading feedback and changed answer removes old passing result',()=>{
 const a=app();a.route(1,3);
 for(const [i,q]of a.window.LESSONS[1].quiz.entries()){
  const el=a.document.querySelector(`input[name="q${i}"][value="${q.answer}"]`);el.checked=true;el.dispatchEvent(new a.window.Event('change',{bubbles:true}));
 }
 a.document.querySelector('#quiz-form').dispatchEvent(new a.window.Event('submit',{bubbles:true,cancelable:true}));
 assert.equal(a.document.querySelectorAll('.feedback.correct').length,3);assert.equal(a.state().weeks[1].graded,true);
 const wrong=a.document.querySelector('input[name="q0"][value="0"]');wrong.checked=true;wrong.dispatchEvent(new a.window.Event('change',{bubbles:true}));
 assert.equal(a.state().weeks[1].graded,false);assert.equal(a.document.querySelectorAll('.feedback').length,0);
});
test('worker success, explicit failure, stop and timeout are handled',()=>{
 const a=app();a.route(1,2);a.input('#draft','def average(scores): return 1');a.click('#test-code');
 let w=a.workers.at(-1);assert.ok(w.sent.tests.includes('assert'));w.onmessage({data:{type:'ready'}});w.onmessage({data:{type:'result',ok:false,output:'AssertionError'}});
 assert.equal(a.state().weeks[1].testsPassed,false);assert.match(a.document.querySelector('#python-output').textContent,/失敗/);assert.equal(w.terminated,true);
 a.click('#test-code');w=a.workers.at(-1);w.onmessage({data:{type:'result',ok:true,output:'ok'}});assert.equal(a.state().weeks[1].testsPassed,true);
 a.click('#run-code');w=a.workers.at(-1);a.click('#stop-code');assert.equal(w.terminated,true);assert.match(a.document.querySelector('#python-output').textContent,/停止/);
 a.click('#run-code');w=a.workers.at(-1);w.onmessage({data:{type:'ready'}});[...a.timers.values()].find(t=>t.ms===10000).fn();assert.equal(w.terminated,true);assert.match(a.document.querySelector('#python-output').textContent,/超時/);
});
test('legacy progress migrates; blocked storage and corrupt JSON do not break course',()=>{
 const a=app({'python-ai-architect-progress-v1':'[1,2,999]'});assert.equal(a.document.querySelector('#total-progress').value,2);
 const b=app({'python-ai-architect-interactive-v2':'invalid'});assert.equal(b.document.querySelector('#storage-warning').hidden,false);assert.equal(b.document.querySelectorAll('.course-card').length,36);
});
