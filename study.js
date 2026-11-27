(()=>{'use strict';
const lessons=window.STUDY,KEY='python-ai-reading-v1',$=s=>document.querySelector(s),esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state={last:lessons[0].id,lessons:{}},current,trackFilter='all';

const SYMBOLS={
  '\\alpha':'α','\\beta':'β','\\theta':'θ','\\tau':'τ','\\eta':'η',
  '\\lambda':'λ','\\sigma':'σ','\\mu':'μ','\\delta':'δ','\\Delta':'Δ',
  '\\epsilon':'ε','\\nabla':'∇','\\partial':'∂','\\infty':'∞','\\emptyset':'∅',
  '\\cap':'∩','\\in':'∈','\\sim':'∼','\\approx':'≈','\\neq':'≠',
  '\\ge':'≥','\\le':'≤','\\ll':'≪','\\pm':'±','\\times':'×',
  '\\cdot':'·','\\cdots':'⋯','\\dots':'…','\\to':'→','\\rightarrow':'→',
  '\\leftarrow':'←','\\mid':'∣','\\circ':'°','\\quad':' ',
  '\\sum':'∑','\\prod':'∏','\\log':'log','\\exp':'exp','\\max':'max',
  '\\min':'min','\\arg':'arg'
};
function replaceBraced(s,cmd,fn){
  const tok=cmd+'{';let idx=s.indexOf(tok);
  while(idx!==-1){
    let d=1,i=idx+tok.length;
    while(i<s.length&&d>0){if(s[i]==='{')d++;else if(s[i]==='}')d--;i++;}
    if(d!==0)break;
    const inner=s.slice(idx+tok.length,i-1);
    s=s.slice(0,idx)+fn(inner)+s.slice(i);
    idx=s.indexOf(tok);
  }
  return s;
}
function replaceFrac(s){
  const tok='\\frac{';let idx=s.indexOf(tok);
  while(idx!==-1){
    let d=1,i=idx+tok.length;
    while(i<s.length&&d>0){if(s[i]==='{')d++;else if(s[i]==='}')d--;i++;}
    if(d!==0)break;
    const num=s.slice(idx+tok.length,i-1);
    while(i<s.length&&s[i]===' ')i++;
    if(s[i]!=='{')break;
    i++;const denStart=i;d=1;
    while(i<s.length&&d>0){if(s[i]==='{')d++;else if(s[i]==='}')d--;i++;}
    if(d!==0)break;
    const den=s.slice(denStart,i-1);
    s=s.slice(0,idx)+`<span class="mfrac"><span class="mnum">${renderMath(num)}</span><span class="mden">${renderMath(den)}</span></span>`+s.slice(i);
    idx=s.indexOf(tok);
  }
  return s;
}
function renderMath(tex){
  let s=tex.trim();
  s=s.replace(/\\begin\{cases\}([\s\S]*?)\\end\{cases\}/g,(_,body)=>{
    const rows=body.split(/\\\\/).map(r=>r.trim()).filter(Boolean).map(r=>{
      const parts=r.split('&').map(p=>renderMath(p.trim()));
      return `<span class="mcase-row">${parts.join('<span class="mcase-sep">，</span>')}</span>`;
    }).join('');
    return `<span class="mcases"><span class="mcases-brace">{</span><span class="mcases-body">${rows}</span></span>`;
  });
  s=s.replace(/\\(?:left|right|bigl|bigr)\b/g,'');
  s=s.replace(/\\\|/g,'‖').replace(/\\%/g,'%').replace(/\\\{/g,'{').replace(/\\\}/g,'}');
  s=replaceBraced(s,'\\text',inner=>`<span class="mtext">${inner}</span>`);
  s=replaceBraced(s,'\\mathbf',inner=>`<b>${renderMath(inner)}</b>`);
  s=replaceBraced(s,'\\mathbb',inner=>inner==='R'?'ℝ':`<b>${inner}</b>`);
  s=replaceBraced(s,'\\mathcal',inner=>({O:'𝒪',N:'𝒩',I:'ℐ',L:'ℒ'}[inner]||`<i>${inner}</i>`));
  s=replaceBraced(s,'\\hat',inner=>`${renderMath(inner)}&#770;`);
  s=replaceBraced(s,'\\sqrt',inner=>`<span class="msqrt">&radic;<span class="mrad">${renderMath(inner)}</span></span>`);
  s=replaceFrac(s);
  s=s.replace(/\\hat\s*([a-zA-Z0-9])/g,'$1&#770;');
  s=replaceBraced(s,'_',inner=>`<sub>${renderMath(inner)}</sub>`);
  s=replaceBraced(s,'^',inner=>`<sup>${renderMath(inner)}</sup>`);
  s=s.replace(/_([a-zA-Z0-9+\-])/g,'<sub>$1</sub>');
  s=s.replace(/\^([a-zA-Z0-9+\-′']+)/g,'<sup>$1</sup>');
  s=s.replace(/\\[a-zA-Z]+/g,cmd=>SYMBOLS[cmd]||cmd.slice(1));
  return s;
}
function fmt(raw){
  const escaped=esc(raw),codes=[];
  let s=escaped.replace(/`([^`\n]+)`/g,(_,c)=>{const id=codes.length;codes.push(`<code class="inline-code">${c}</code>`);return `\u0000C${id}\u0000`;});
  s=s.replace(/\$\$([\s\S]*?)\$\$/g,(_,t)=>`<div class="math-block" role="math">${renderMath(t)}</div>`);
  s=s.replace(/\$([^$\n]+)\$/g,(_,t)=>`<span class="math-inline" role="math">${renderMath(t)}</span>`);
  s=s.replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>');
  s=s.replace(/\u0000C(\d+)\u0000/g,(_,id)=>codes[Number(id)]);
  return s;
}

function isEngineering(l){return /^w([1-9]|[12][0-9]|3[0-3])$/.test(l.id)||l.track==='eng'||l.stage.includes('後續')||l.stage.includes('Python')||l.stage.includes('網站')||l.stage.includes('系統架構');}
function message(x){$('#status').textContent=x;}
function clean(raw){
  if(raw?.version!==1||!raw.lessons||typeof raw.lessons!=='object'||Array.isArray(raw.lessons))throw Error('格式不符');
  const out={last:lessons.some(l=>l.id===raw.last)?raw.last:lessons[0].id,lessons:{}};
  for(const l of lessons){
    const r=raw.lessons[l.id];
    if(r)out.lessons[l.id]={answers:l.quiz.map((q,i)=>Number.isInteger(r.answers?.[i])&&r.answers[i]>=0&&r.answers[i]<q.options.length?r.answers[i]:null),graded:r.graded===true};
  }
  return out;
}
try{const s=localStorage.getItem(KEY);if(s)state=clean(JSON.parse(s));}catch{message('進度無法讀取，可匯入備份。');}
function save(){try{localStorage.setItem(KEY,JSON.stringify({version:1,...state}));}catch{message('無法儲存，離開前請匯出。');}}
function record(l){
  const r=state.lessons[l.id];
  if(!r||!Array.isArray(r.answers)||r.answers.length!==l.quiz.length){
    state.lessons[l.id]={answers:l.quiz.map((_,i)=>Number.isInteger(r?.answers?.[i])?r.answers[i]:null),graded:false};
  }
  return state.lessons[l.id];
}
function passed(l){const r=state.lessons[l.id];return !!r?.graded&&l.quiz.every((q,i)=>r.answers[i]===q.answer);}
function lessonCharCount(l){
  const sec=l.sections.reduce((n,[h,p])=>n+String(h).length+String(p).length,0);
  const ex=(l.example||'').length+(l.walkthrough||[]).reduce((n,t)=>n+String(t).length,0)+(l.solution||'').length;
  const qz=l.quiz.reduce((n,q)=>n+String(q.prompt).length+q.options.join('').length+String(q.explanation).length,0);
  return sec+ex+qz;
}
function list(){
  const term=$('#search').value.toLowerCase(),phase=$('#stage').value;
  const filtered=lessons.filter(l=>{
    const eng=isEngineering(l);
    if(trackFilter==='ai'&&eng)return false;
    if(trackFilter==='eng'&&!eng)return false;
    if(phase&&l.stage!==phase)return false;
    if($('#todo').checked&&passed(l))return false;
    if(!term)return true;
    const blob=(l.title+' '+l.stage+' '+(l.source||'')+' '+l.sections.map(s=>s.join(' ')).join(' ')+' '+l.refs.map(r=>r[0]).join(' ')).toLowerCase();
    return blob.includes(term);
  });
  let html='',lastGroup='';
  for(const l of filtered){
    const idx=lessons.indexOf(l)+1;
    const group=isEngineering(l)?'後續工程延伸（Python、網站開發與系統架構）':'AI 核心學習主線（五大教材整合）';
    if(group!==lastGroup){
      html+=`<div class="unit-group-header">${esc(group)}</div>`;
      lastGroup=group;
    }
    html+=`<a href="#${l.id}" class="${current?.id===l.id?'active':''}" ${current?.id===l.id?'aria-current="page"':''}>
      <span class="unit-title">${passed(l)?'✓ ':''}${idx}. ${esc(l.title)}</span>
      <small class="unit-meta">${esc(l.stage)}${l.source?' · '+esc(l.source):''}</small>
    </a>`;
  }
  $('#units').innerHTML=html||'<p class="empty-msg">沒有符合的主題。</p>';
  $('#matches').textContent=filtered.length+' 個主題';
  const n=lessons.filter(passed).length;
  const aiLessons=lessons.filter(l=>!isEngineering(l)),engLessons=lessons.filter(isEngineering);
  const aiDone=aiLessons.filter(passed).length,engDone=engLessons.filter(passed).length;
  $('#count').textContent=n+' / '+lessons.length+' 課通過';
  if($('#ai-count'))$('#ai-count').textContent=`AI 主線：${aiDone} / ${aiLessons.length} 課 · 後續工程延伸：${engDone} / ${engLessons.length} 課`;
  $('#progress').value=n;
}
function show(id){
  current=lessons.find(l=>l.id===id)||lessons[0];
  const l=current,r=record(l),i=lessons.indexOf(l);
  state.last=l.id;save();
  const chars=lessonCharCount(l);
  const eng=isEngineering(l);
  const badgeText=eng?'後續工程延伸（Python／網站／架構）':'AI 核心學習主線';
  const badgeClass=eng?'track-badge eng':'track-badge ai';
  const toc=`<nav class="lesson-toc" aria-label="本章小節導覽">
    <strong>本章 30 分鐘學習導覽（共 ${l.sections.length} 大節 · 全文約 ${chars.toLocaleString()} 字）</strong>
    <ol>
      ${l.sections.map(([h])=>`<li>${fmt(h)}</li>`).join('')}
      ${l.example?'<li>程式碼／量化案例與逐步拆解</li>':''}
      ${l.solution?'<li>進階完整參考實作與驗證範本</li>':''}
      <li>情境選擇題驗收（共 ${l.quiz.length} 題附詳解）</li>
    </ol>
  </nav>`;
  $('#lesson').innerHTML=`
    <div class="lesson-header">
      <div class="meta-row">
        <span class="${badgeClass}">${esc(badgeText)}</span>
        <span class="meta">第 ${i+1} / ${lessons.length} 課 · ${esc(l.stage)}${l.source?' · 教材來源：'+esc(l.source):''} · 建議閱讀 30 分鐘</span>
      </div>
      <h2>${esc(l.title)}</h2>
      ${toc}
    </div>
    ${l.sections.map(([h,p])=>`<section class="lesson-section"><h3>${fmt(h)}</h3><div class="lesson-prose">${fmt(p)}</div></section>`).join('')}
    ${l.example?`<section class="lesson-section example-box"><h3>範例與逐步解說</h3><p class="section-hint">請先閱讀下方範例並思考每一段的輸入、狀態變化與輸出，再逐條核對下方的拆解說明：</p><pre><code>${esc(l.example)}</code></pre><h4>逐步拆解與關鍵細節</h4><ol class="walkthrough-list">${l.walkthrough.map(t=>'<li>'+fmt(t)+'</li>').join('')}</ol></section>`:''}
    ${l.solution?`<details class="solution-box" open><summary>進一步看完整解法與進階實作範本（不用提交作業）</summary><pre><code>${esc(l.solution)}</code></pre></details>`:''}
    <section class="quiz-section">
      <h3>選擇題驗收（30 分鐘讀後理解檢查）</h3>
      <p>答題後立即顯示正確答案與深度解析。全部答對即記錄本課通過，可隨時修改選項後重新作答。</p>
      <form id="quiz" class="quiz">
        ${l.quiz.map((q,j)=>`<fieldset><legend>${j+1}. ${fmt(q.prompt)}</legend>${q.options.map((o,k)=>`<label><input type="radio" name="q${j}" value="${k}" ${r.answers[j]===k?'checked':''} required> <span>${fmt(o)}</span></label>`).join('')}${r.graded?`<div class="feedback ${r.answers[j]===q.answer?'':'wrong'}"><b>${r.answers[j]===q.answer?'✓ 答對':'✕ 答錯'} · 正確答案：${fmt(q.options[q.answer])}</b><p>${fmt(q.explanation)}</p></div>`:''}</fieldset>`).join('')}
        <button class="primary" type="submit">檢查答案</button>
        <p class="question-status" id="result" role="status">${r.graded?l.quiz.filter((q,j)=>r.answers[j]===q.answer).length+' / '+l.quiz.length+' 題正確'+(passed(l)?' · 本課已通過':' · 可重新作答'):''}</p>
      </form>
    </section>
    <div class="controls">
      <button id="prev" type="button" ${i===0?'disabled':''}>← 上一課${i>0?'：'+esc(lessons[i-1].title):''}</button>
      <button id="next" type="button" ${i===lessons.length-1?'disabled':''}>下一課${i<lessons.length-1?'：'+esc(lessons[i+1].title):''} →</button>
    </div>
    <details class="resources" open>
      <summary>對應官方教材與延伸閱讀來源（選讀，不影響本課完成）</summary>
      <p>本章解說、範例與選擇題已完整整理於站內；若想進一步對照原始課程投影片、影片或官方程式庫，可開啟下列連結：</p>
      <div class="ref-links">${l.refs.map(([n,u])=>`<a href="${esc(u)}" target="_blank" rel="noopener">${esc(n)} ↗</a>`).join('')}</div>
    </details>`;
  $('#quiz').addEventListener('change',e=>{
    if(e.target.type!=='radio')return;
    const j=Number(e.target.name.slice(1));
    r.answers[j]=Number(e.target.value);
    r.graded=false;save();
    document.querySelectorAll('.feedback').forEach(el=>el.remove());
    $('#result').textContent='答案已修改，請重新檢查。';
    list();
  });
  $('#quiz').addEventListener('submit',e=>{
    e.preventDefault();
    if(r.answers.some(v=>v===null)){message('請先回答所有題目。');return;}
    r.graded=true;save();show(l.id);
    $('#result').scrollIntoView?.({block:'nearest'});
  });
  $('#prev').onclick=()=>location.hash=lessons[i-1].id;
  $('#next').onclick=()=>location.hash=lessons[i+1].id;
  list();
}
for(const s of new Set(lessons.map(l=>l.stage))){
  const o=document.createElement('option');o.value=s;o.textContent=s;$('#stage').append(o);
}
document.querySelectorAll('.track-btn').forEach(btn=>btn.addEventListener('click',()=>{
  trackFilter=btn.dataset.track||'all';
  document.querySelectorAll('.track-btn').forEach(b=>b.classList.toggle('active',b===btn));
  list();
}));
$('#stage').addEventListener('change',list);
$('#todo').addEventListener('change',list);
$('#search').addEventListener('input',list);
$('#resume').onclick=()=>{
  const nextAi=lessons.find(l=>!isEngineering(l)&&!passed(l));
  const nextAny=lessons.find(l=>!passed(l));
  const id=(nextAi||nextAny||lessons[0]).id;
  location.hash=id;show(id);
};
$('#export').onclick=()=>{
  const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,type:KEY,...state},null,2)],{type:'application/json'})),a=document.createElement('a');
  a.href=url;a.download='ai-reading-progress.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
};
$('#import').addEventListener('change',async e=>{
  const f=e.target.files[0];if(!f)return;
  try{
    if(f.size>2000000)throw Error('檔案過大');
    const raw=JSON.parse(await f.text());
    if(raw.type!==KEY)throw Error('不是新版閱讀進度檔');
    const next=clean(raw);
    if(!confirm('取代新版閱讀進度？舊版筆記不受影響。'))return;
    state=next;save();show(state.last);location.hash=state.last;message('進度已匯入。');
  }catch(err){message('匯入失敗：'+err.message);}finally{e.target.value='';}
});
window.addEventListener('hashchange',()=>show(location.hash.slice(1)));
show(location.hash.slice(1)||state.last);
})();
