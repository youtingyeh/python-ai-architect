(function (root) {
'use strict';
const validText = v => typeof v === 'string' ? v.slice(0, 20000) : '';
function blank() { return {version:2, lastWeek:1, weeks:{}}; }
function normalise(data, course, lessons) {
  if (!data || typeof data !== 'object' || data.version !== 2 || !data.weeks || typeof data.weeks !== 'object' || Array.isArray(data.weeks)) throw new Error('不是本課程的 v2 進度檔');
  const clean=blank();
  clean.lastWeek=Number.isInteger(data.lastWeek)&&data.lastWeek>=1&&data.lastWeek<=36?data.lastWeek:1;
  for(const c of course){
    const raw=data.weeks[c.w]; if(!raw||typeof raw!=='object')continue;
    const l=lessons[c.w];
    clean.weeks[c.w]={
      steps:Array.from({length:3},(_,i)=>raw.steps?.[i]===true),
      answers:l.quiz.map((x,i)=>Number.isInteger(raw.answers?.[i])&&raw.answers[i]>=0&&raw.answers[i]<x.options.length?raw.answers[i]:null),
      graded:raw.graded===true,
      rubric:c.pass.map((_,i)=>raw.rubric?.[i]===true),
      draft:validText(raw.draft),notes:validText(raw.notes),project:validText(raw.project),
      localPassed:raw.localPassed===true,testsPassed:raw.testsPassed===true,done:raw.done===true,legacy:raw.legacy===true
    };
    if(!eligible(clean.weeks[c.w],c,l))clean.weeks[c.w].done=false;
  }
  return clean;
}
function week(state,w,c,l){
  if(!state.weeks[w])state.weeks[w]={steps:[false,false,false],answers:l.quiz.map(()=>null),graded:false,rubric:c.pass.map(()=>false),draft:l.starter,notes:'',project:'',localPassed:false,testsPassed:false,done:false,legacy:false};
  return state.weeks[w];
}
function quizScore(s,l){return l.quiz.reduce((n,q,i)=>n+(s.answers[i]===q.answer?1:0),0);}
function eligible(s,c,l){return s.steps.every(Boolean)&&(!l.tests||s.testsPassed||s.localPassed)&&s.graded&&quizScore(s,l)===l.quiz.length&&s.rubric.length===c.pass.length&&s.rubric.every(Boolean)&&s.project.trim().length>0;}
function completed(s,c,l){return s.legacy || (s.done&&eligible(s,c,l));}
const api={blank,normalise,week,quizScore,eligible,completed};
root.LEARN_CORE=api;
if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
