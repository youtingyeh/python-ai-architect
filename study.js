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
  s=s.replace(/\^\s*\{?\\circ\}?/g,'°');
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

// ---------- 白話入門篇 / 名詞點按解釋 ----------
const GLOSS=new Map(window.GLOSSARY||[]);
const GTERMS=[...GLOSS.keys()].sort((a,b)=>b.length-a.length);
function termKey(t){return t.replace(/（.*?）|\(.*?\)/g,'').trim();}
function termify(html,used){
  if(!GTERMS.length)return html;
  const parts=html.split(/(<[^>]+>)/),stack=[];
  for(let i=0;i<parts.length;i++){
    const p=parts[i];
    if(p.startsWith('<')){
      if(p.startsWith('</')){stack.pop();continue;}
      if(/^<(br|img|hr|input)\b/.test(p)||p.endsWith('/>'))continue;
      const parentSkip=stack.length?stack[stack.length-1]:false;
      stack.push(parentSkip||/^<(code|strong|a|sub|sup)\b/.test(p)||/class="(math|term|m)/.test(p));
      continue;
    }
    const skip=stack.length?stack[stack.length-1]:false;
    if(skip||!p.trim())continue;
    let seg=p;
    for(const t of GTERMS){
      const k=termKey(t);if(!k||used.has(k))continue;
      const at=seg.indexOf(k);if(at<0)continue;
      const before=seg[at-1]||'',after=seg[at+k.length]||'';
      if(/[A-Za-z]/.test(k[0])&&/[A-Za-z]/.test(before))continue;
      if(/[A-Za-z]/.test(k[k.length-1])&&/[A-Za-z]/.test(after))continue;
      used.add(k);
      seg=seg.slice(0,at)+`\u0001${GTERMS.indexOf(t)}\u0001`+seg.slice(at+k.length);
    }
    parts[i]=seg.replace(/\u0001(\d+)\u0001/g,(_,n)=>{const t=GTERMS[+n];return `<span class="term" role="button" tabindex="0" data-term="${esc(t)}">${esc(termKey(t))}</span>`;});
  }
  return parts.join('');
}
function readingStats(l){
  const deep=l.sections.reduce((n,[h,p])=>n+String(h).length+String(p).length,0)+(l.walkthrough||[]).join('').length;
  const quiz=l.quiz.reduce((n,q)=>n+String(q.prompt).length+q.options.join('').length+String(q.explanation).length,0);
  const codeLines=((l.example||'')+'\n'+(l.solution||'')).split('\n').filter(x=>x.trim()).length;
  // 初學者閱讀速度：白話文約每分鐘 350 字、技術文約每分鐘 250 字、程式碼約每分鐘 12 行
  const min=Math.round(deep/300+codeLines/12);
  return {deep,quiz,codeLines,min,text:deep};
}
let pop;
function hidePop(){if(pop)pop.hidden=true;}
function showPop(el){
  if(!pop){pop=document.createElement('div');pop.className='term-pop';pop.setAttribute('role','dialog');document.body.append(pop);}
  const t=el.dataset.term,d=GLOSS.get(t);if(!d)return;
  pop.innerHTML=`<b>${esc(t)}</b><p>${fmt(d)}</p><button type="button" class="pop-close">知道了</button>`;
  pop.hidden=false;
  const r=el.getBoundingClientRect?.();
  if(r){const w=Math.min(360,(window.innerWidth||800)-24);pop.style.width=w+'px';pop.style.left=Math.max(12,Math.min(r.left+(window.scrollX||0),(window.scrollX||0)+(window.innerWidth||800)-w-12))+'px';pop.style.top=(r.bottom+(window.scrollY||0)+8)+'px';}
  pop.querySelector('.pop-close').onclick=hidePop;
}
document.addEventListener('click',e=>{const el=e.target.closest?.('.term');if(el){showPop(el);e.stopPropagation();}else if(pop&&!pop.contains(e.target))hidePop();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')hidePop();const el=e.target.closest?.('.term');if(el&&(e.key==='Enter'||e.key===' ')){e.preventDefault();showPop(el);}});
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
  if(id==='quiz')return showQuizHub();
  if(id&&id.startsWith('quiz-')&&lessons.some(l=>l.id===id.slice(5)))return showQuiz(id.slice(5));
  current=lessons.find(l=>l.id===id)||lessons[0];
  const l=current,r=record(l),i=lessons.indexOf(l);
  state.last=l.id;save();
  const st=readingStats(l),used=new Set();
  const eng=isEngineering(l);
  const badgeText=eng?'後續工程延伸（Python／網站／架構）':'AI 核心學習主線';
  const badgeClass=eng?'track-badge eng':'track-badge ai';
  const toc=`<nav class="lesson-toc" aria-label="本章小節導覽">
    <strong>本章學習導覽 · 預估閱讀約 ${st.min} 分鐘（文字 ${st.text.toLocaleString()} 字${st.codeLines?` · 程式碼 ${st.codeLines} 行`:''}）</strong>
    <ol>
      ${l.sections.map(([h],k)=>`<li><a href="#" data-sec="${k}">${fmt(h)}</a></li>`).join('')}
      ${l.example?'<li>程式碼／量化案例與逐步拆解</li>':''}
      ${l.solution?'<li>進階完整參考實作與驗證範本</li>':''}
    </ol>
    <p class="toc-quiz">🧠 本課另有 ${l.quiz.length} 題情境選擇題放在<a href="#quiz-${l.id}">自我測驗區</a>，讀完想考考自己再去。</p>
  </nav>`;
  $('#lesson').innerHTML=`
    <div class="lesson-header">
      <div class="meta-row">
        <span class="${badgeClass}">${esc(badgeText)}</span>
        <span class="meta">第 ${i+1} / ${lessons.length} 課 · ${esc(l.stage)}${l.source?' · 教材來源：'+esc(l.source):''} · 預估 ${st.min} 分鐘</span>
      </div>
      <h2>${esc(l.title)}</h2>
      ${toc}
    </div>
    ${GLOSS.size?'<p class="term-tip">💡 文中有<span class="term-demo">虛線底線</span>的詞，點一下可以看白話解釋。</p>':''}
    ${l.sections.map(([h,p],k)=>`<section class="lesson-section" id="sec-${k}"><h3>${fmt(h)}</h3><div class="lesson-prose">${termify(fmt(p),used)}</div></section>`).join('')}
    ${l.example?`<section class="lesson-section example-box"><h3>範例與逐步解說</h3><p class="section-hint">請先閱讀下方範例並思考每一段的輸入、狀態變化與輸出，再逐條核對下方的拆解說明：</p><pre><code>${esc(l.example)}</code></pre><h4>逐步拆解與關鍵細節</h4><ol class="walkthrough-list">${l.walkthrough.map(t=>'<li>'+fmt(t)+'</li>').join('')}</ol></section>`:''}
    ${l.solution?`<details class="solution-box" open><summary>進一步看完整解法與進階實作範本（不用提交作業）</summary><pre><code>${esc(l.solution)}</code></pre></details>`:''}
    <section class="quiz-cta">
      <div><b>🧠 想考考自己嗎？</b><span>本課有 ${l.quiz.length} 題情境選擇題，答完會顯示詳解。${passed(l)?'<strong class="ok">✓ 你已通過本課測驗</strong>':''}</span></div>
      <a class="button-link" href="#quiz-${l.id}">前往本課測驗 →</a>
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
  document.querySelectorAll('[data-sec]').forEach(a=>a.onclick=e=>{e.preventDefault();document.getElementById('sec-'+a.dataset.sec)?.scrollIntoView?.({behavior:'smooth'});});
  hidePop();
  $('#prev').onclick=()=>location.hash=lessons[i-1].id;
  $('#next').onclick=()=>location.hash=lessons[i+1].id;
  list();
}
function quizStatus(l){const r=state.lessons[l.id];if(passed(l))return '<span class="qs ok">✓ 已通過</span>';if(r?.graded)return '<span class="qs retry">↻ 再試一次</span>';return '<span class="qs todo">尚未作答</span>';}
function showQuizHub(){
  current=null;
  const row=l=>`<li><a href="#quiz-${l.id}"><span>${lessons.indexOf(l)+1}. ${esc(l.title)}</span>${quizStatus(l)}</a></li>`;
  const ai=lessons.filter(l=>!isEngineering(l)),eng=lessons.filter(isEngineering);
  $('#lesson').innerHTML=`<div class="lesson-header"><div class="meta-row"><span class="track-badge quiz">🧠 自我測驗區</span></div>
    <h2>讀完了？挑一課考考自己</h2>
    <p>每課 3 題情境選擇題，答完立即顯示正確答案與詳解；全部答對就會在課程列表打勾。測驗是選做的——還沒讀完的課也可以先試試看，答錯了再回去讀。</p>
    <p class="muted">AI 主線已通過 ${ai.filter(passed).length} / ${ai.length} 課 · 工程延伸已通過 ${eng.filter(passed).length} / ${eng.length} 課</p></div>
    <h3>AI 主線（第 1～${ai.length} 課）</h3><ol class="quiz-hub">${ai.map(row).join('')}</ol>
    <details class="resources"><summary>工程延伸（第 ${ai.length+1}～${lessons.length} 課）</summary><ol class="quiz-hub">${eng.map(row).join('')}</ol></details>`;
  hidePop();list();
}
function showQuiz(lid){
  current=lessons.find(l=>l.id===lid);
  const l=current,r=record(l),i=lessons.indexOf(l);
  $('#lesson').innerHTML=`<div class="lesson-header"><div class="meta-row"><span class="track-badge quiz">🧠 自我測驗區</span><span class="meta">第 ${i+1} 課 · ${l.quiz.length} 題</span></div>
    <h2>${esc(l.title)}</h2>
    <p class="quiz-nav"><a href="#${l.id}">← 回到本課閱讀</a> · <a href="#quiz">測驗區總覽</a></p></div>
    <section class="quiz-section">
      <h3>情境選擇題</h3>
      <p>答題後立即顯示正確答案與深度解析。全部答對即記錄本課通過，可隨時修改選項後重新作答。</p>
      <form id="quiz" class="quiz">
        ${l.quiz.map((q,j)=>`<fieldset><legend>${j+1}. ${fmt(q.prompt)}</legend>${q.options.map((o,k)=>`<label><input type="radio" name="q${j}" value="${k}" ${r.answers[j]===k?'checked':''} required> <span>${fmt(o)}</span></label>`).join('')}${r.graded?`<div class="feedback ${r.answers[j]===q.answer?'':'wrong'}"><b>${r.answers[j]===q.answer?'✓ 答對':'✕ 答錯'} · 正確答案：${fmt(q.options[q.answer])}</b><p>${fmt(q.explanation)}</p></div>`:''}</fieldset>`).join('')}
        <button class="primary" type="submit">檢查答案</button>
        <p class="question-status" id="result" role="status">${r.graded?l.quiz.filter((q,j)=>r.answers[j]===q.answer).length+' / '+l.quiz.length+' 題正確'+(passed(l)?' · 本課已通過':' · 可重新作答'):''}</p>
      </form>
    </section>
    <div class="controls">
      <button id="prev" type="button" ${i===0?'disabled':''}>← 上一課測驗</button>
      <button id="next" type="button" ${i===lessons.length-1?'disabled':''}>下一課測驗 →</button>
    </div>`;
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
    r.graded=true;save();showQuiz(l.id);
    $('#result').scrollIntoView?.({block:'nearest'});
  });
  hidePop();
  $('#prev').onclick=()=>location.hash='quiz-'+lessons[i-1].id;
  $('#next').onclick=()=>location.hash='quiz-'+lessons[i+1].id;
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
if($('#start'))$('#start').onclick=()=>{location.hash=lessons[0].id;show(lessons[0].id);$('#lesson').scrollIntoView?.();};
$('#resume').onclick=()=>{
  const nextAi=lessons.find(l=>!isEngineering(l)&&!passed(l));
  const nextAny=lessons.find(l=>!passed(l));
  const id=(nextAi||nextAny||lessons[0]).id;
  location.hash=id;show(id);
};
$('#export').onclick=()=>{
  const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,type:KEY,...state},null,2)],{type:'application/json'})),a=document.createElement('a');
  a.href=url;a.download='ai-reading-progress.json';try{a.click();}catch{}
  try{navigator.clipboard?.writeText(JSON.stringify({version:1,type:KEY,...state})).then(()=>message('已下載備份檔；若沒有出現下載，進度也已複製到剪貼簿，可貼到記事本保存。'),()=>{});}catch{}
  setTimeout(()=>URL.revokeObjectURL(url),1000);
};
$('#import').addEventListener('change',async e=>{
  const f=e.target.files[0];if(!f)return;
  try{
    if(f.size>2000000)throw Error('檔案過大');
    const raw=JSON.parse(await f.text());
    if(raw.type!==KEY)throw Error('不是新版閱讀進度檔');
    const next=clean(raw);
        state=next;save();show(state.last);location.hash=state.last;message('進度已匯入。');
  }catch(err){message('匯入失敗：'+err.message);}finally{e.target.value='';}
});
window.addEventListener('hashchange',()=>show(location.hash.slice(1)));
show(location.hash.slice(1)||state.last);
if($('#quiz-hub-btn'))$('#quiz-hub-btn').onclick=()=>{location.hash='quiz';};
})();
