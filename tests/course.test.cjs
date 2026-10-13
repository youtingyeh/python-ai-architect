const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const data={window:{}};vm.createContext(data);
for(const name of ['course.js','lessons.js'])vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),data);
const course=data.window.COURSE,lessons=data.window.LESSONS,core=require('../progress.js');
test('36 complete authored lessons and 75 valid questions',()=>{
 assert.equal(course.length,36);assert.equal(Object.keys(lessons).length,36);
 let questions=0;
 for(const c of course){
  const l=lessons[c.w];assert.ok(l);assert.equal(l.sections.length,2);
  for(const [title,text]of l.sections){assert.ok(title.length>3);assert.ok(text.length>70);}
  for(const key of ['example','prompt','starter','solution'])assert.ok(l[key].length>20,`week ${c.w} ${key}`);
  assert.ok(l.walkthrough.length>=3);assert.ok(l.hints.length>=2);assert.ok(l.refs.length>=1);
  for(const [,url]of l.refs)assert.ok(new URL(url).protocol==='https:');
  for(const q of l.quiz){questions++;assert.ok(q.answer>=0&&q.answer<q.options.length);assert.ok(q.explanation.length>10);}
 }
 assert.equal(questions,75);
});
test('completion requires correct quiz, verified steps, rubric and evidence',()=>{
 const st=core.blank(),c=course[0],l=lessons[1],s=core.week(st,1,c,l);
 assert.equal(core.eligible(s,c,l),false);
 s.testsPassed=true;s.steps=[true,true,true];s.answers=l.quiz.map(q=>q.answer);s.graded=true;s.rubric=c.pass.map(()=>true);
 assert.equal(core.eligible(s,c,l),false);s.project='tests and commit evidence';
 assert.equal(core.eligible(s,c,l),true);s.done=true;assert.equal(core.completed(s,c,l),true);
 s.answers[0]=(l.quiz[0].answer+1)%3;assert.equal(core.completed(s,c,l),false);
});
test('backup validation rejects foreign format and normalises invalid answers',()=>{
 assert.throws(()=>core.normalise({weeks:{}},course,lessons));
 const backup={version:2,lastWeek:999,weeks:{1:{steps:[true],answers:[999,{},-1],rubric:[true],draft:'<script>data</script>',done:true},999:{done:true}}};
 const clean=core.normalise(backup,course,lessons);
 assert.equal(clean.lastWeek,1);assert.equal(clean.weeks[1].done,false);assert.equal(JSON.stringify(clean.weeks[1].answers),'[null,null,null]');
 assert.equal(clean.weeks[999],undefined);assert.equal(clean.weeks[1].draft,'<script>data</script>');
});
test('v2 backups retain manual-local verification and valid completion',()=>{
 const st=core.blank(),s=core.week(st,1,course[0],lessons[1]);
 s.localPassed=true;s.steps=[true,true,true];s.answers=lessons[1].quiz.map(q=>q.answer);s.graded=true;s.rubric=[true,true,true];s.project='evidence';s.done=true;
 const restored=core.normalise(JSON.parse(JSON.stringify(st)),course,lessons);
 assert.equal(restored.weeks[1].localPassed,true);assert.equal(core.completed(restored.weeks[1],course[0],lessons[1]),true);
});
test('Python solutions pass normal, boundary and rejection assertions',()=>{
 for(let w=1;w<=3;w++)execFileSync('python3',['-c',lessons[w].solution+'\n'+lessons[w].tests],{timeout:5000});
});
test('Python tests reject starter and deliberately broken implementations',()=>{
 for(let w=1;w<=3;w++)assert.throws(()=>execFileSync('python3',['-c',lessons[w].starter+'\n'+lessons[w].tests],{timeout:5000,stdio:'pipe'}));
 assert.throws(()=>execFileSync('python3',['-c','def average(scores): return 0\n'+lessons[1].tests],{timeout:5000,stdio:'pipe'}));
});
module.exports={root,course,lessons};
