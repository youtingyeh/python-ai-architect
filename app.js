(function(){
'use strict';
const course=window.COURSE, lessons=window.LESSONS, core=window.LEARN_CORE;
const KEY='python-ai-architect-interactive-v2', OLD='python-ai-architect-progress-v1';
const $=s=>document.querySelector(s), esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const steps=['概念','範例','實作','驗收','成果'];
let state=core.blank(), currentWeek=0, currentStep=0, worker=null, runTimer=null, toastTimer=null;
function warn(msg){$('#storage-warning').hidden=false;$('#storage-warning').textContent=msg;}
try{
  const saved=localStorage.getItem(KEY);
  if(saved)state=core.normalise(JSON.parse(saved),course,lessons);
  else{
    const old=JSON.parse(localStorage.getItem(OLD)||'[]');
    if(Array.isArray(old))for(const w of old)if(Number.isInteger(w)&&w>=1&&w<=36)core.week(state,w,course[w-1],lessons[w]).legacy=true;
  }
}catch(e){warn('儲存的進度無法讀取，本次以新進度開始。你仍可匯入之前的備份。');}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{warn('瀏覽器無法儲存進度。此頁仍可使用，離開前請匯出備份。');}}
function toast(msg){$('#toast').textContent=msg;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,4000);}
function ws(w=currentWeek){return core.week(state,w,course[w-1],lessons[w]);}
function completed(w){const s=state.weeks[w];return !!s&&core.completed(s,course[w-1],lessons[w]);}
function countDone(){return course.filter(c=>completed(c.w)).length;}
function continueWeek(){return course.find(c=>!completed(c.w))?.w||state.lastWeek;}
function lessonUrl(w,s=0){return '#week/'+w+'/'+s;}
function codeBlock(code){return `<div class="code-block"><button type="button" class="copy-code">複製</button><pre><code>${esc(code)}</code></pre></div>`;}
function refs(l){return `<div class="references"><b>延伸閱讀與原始檔案</b><br>${l.refs.map(([label,url])=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`).join('')}</div>`;}
function list(items){return `<ul>${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;}
function renderSidebar(){
  const term=$('#course-search').value.trim().toLowerCase(),phase=$('#phase-select').value;
  let lastPhase='',html='';
  const found=course.filter(c=>(!phase||c.p===phase)&&(!term||(c.t+' '+c.p+' '+c.topics.join(' ')).toLowerCase().includes(term)));
  for(const c of found){
    if(c.p!==lastPhase){html+=`<div class="phase-heading">${esc(c.p)}</div>`;lastPhase=c.p;}
    html+=`<a class="lesson-link${currentWeek===c.w?' active':''}" href="${lessonUrl(c.w)}" ${currentWeek===c.w?'aria-current="page"':''}><span class="number">${String(c.w).padStart(2,'0')}</span><span>${esc(c.t)}</span><span class="status" aria-label="${completed(c.w)?'已完成':'未完成'}">${completed(c.w)?'✓':''}</span></a>`;
  }
  $('#lesson-list').innerHTML=html||'<p class="empty-state">沒有符合的課程，請調整搜尋。</p>';
  $('#sidebar-progress').textContent=`${countDone()} / 36 週完成`;
  $('#total-progress').value=countDone();
}
function renderHome(){
  currentWeek=0;renderSidebar();
  $('#main').innerHTML=`<section class="home-hero"><span class="section-kicker">LEARN · BUILD · VERIFY</span><h1>從 Python 基礎，<br>走到<span>系統設計。</span></h1><p class="lead">一套 36 週實作教材。每週依序理解概念、拆解範例、動手練習、驗收並留下成果。每週約 8～10 小時，按實際掌握程度調整步調。</p><div class="actions"><a class="btn primary" href="${lessonUrl(continueWeek())}">繼續學習 · Week ${String(continueWeek()).padStart(2,'0')} →</a><a class="btn" href="${lessonUrl(1)}">從第 1 課開始</a></div></section>
  <div class="stats"><div class="stat"><b>${countDone()} / 36</b><span>週次完成</span></div><div class="stat"><b>${course.reduce((n,c)=>n+lessons[c.w].quiz.length,0)}</b><span>附解釋的驗收題</span></div><div class="stat"><b>3</b><span>瀏覽器 Python 實作課</span></div></div>
  <details class="setup" open><summary>開始前：建立你的練習環境</summary><p class="muted">已有 Python 基礎即可開始。第 1～3 週可先在頁面練習；檔案、Web、資料庫與部署作業需在自己的電腦實作。</p><ol><li>安裝 Python 3.12 或更新的穩定版本、VS Code 和 Git。Windows 可先用 PowerShell，Week 4 再用 WSL/Ubuntu。</li><li>建立 architect-learning 資料夾，執行 python -m venv .venv。</li><li>啟用環境：macOS/Linux 用 source .venv/bin/activate；PowerShell 用 .venv\\Scripts\\Activate.ps1。若啟用受限制，可直接用 .venv\\Scripts\\python.exe。</li><li>建立 README，執行 git init，每週儲存程式、測試與學習紀錄。</li></ol>${codeBlock('python --version\ngit --version\npython -m venv .venv\n# 啟用環境後：\npython -m pip install pytest\npython -m pytest')}<p class="muted">先不需安裝 Docker、TypeScript 等工具；到了對應課程再安裝。</p></details>
  <section class="home-section"><h2>每週的五步學習流程</h2><p class="lead">概念 → 範例 → 實作 → 驗收 → 成果。驗收題可重做；實作與成果由你依條件自評，頁面會保留紀錄。</p><div class="callout">進度、草稿與筆記只存在此瀏覽器。Python 首次執行需下載運算環境；其餘教材閱讀不依賴 Python 載入。每週檔案只是起點，完整作業仍需本機實作與測試。</div></section>
  <section class="home-section"><h2>完整學習路線</h2><div class="course-grid">${course.map(c=>`<a class="course-card" href="${lessonUrl(c.w)}"><span class="section-kicker">WEEK ${String(c.w).padStart(2,'0')} · ${esc(c.p)}</span><h3>${esc(c.t)}</h3><p>${esc(c.g)}</p><span class="card-end">${completed(c.w)?'✓ 已完成 · 再次閱讀':'進入教材 →'}</span></a>`).join('')}</div></section>`;
  bindCopy();
}
function readView(c,l,s){return `${l.sections.map(([title,text])=>`<section class="concept"><h2>${esc(title)}</h2><p>${esc(text)}</p></section>`).join('')}<div class="callout"><strong>本週目標</strong><br>${esc(c.g)}</div><h3>你要完成</h3>${list(c.tasks)}<label class="check-row"><input type="checkbox" data-step="0" ${s.steps[0]?'checked':''}>我能用自己的話說明本課核心概念</label>${refs(l)}`;}
function exampleView(c,l,s){return `<h2>先預測結果，再看拆解</h2><p class="muted">範例若包含專案抽象介面或需要先建資料表，請依拆解說明補齊環境。它不一定能作為單一檔案直接執行。</p>${codeBlock(l.example)}<h3>逐步拆解</h3><ol class="walkthrough">${l.walkthrough.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><label class="check-row"><input type="checkbox" data-step="1" ${s.steps[1]?'checked':''}>我已核對範例並能解釋每一步的作用</label>${refs(l)}`;}
function practiceView(c,l,s){return `<h2>動手做：${c.w<=3?'Python 小練習':'本機實作與設計練習'}</h2><p>${esc(l.prompt)}</p><p class="muted">${c.w<=3?'在下方編輯程式，執行可檢視 print；「執行並測試」會驗證題目規則。測試透過仍需理解程式，不能代替完整作業。':'在自己的電腦完成本題，下方可儲存程式草稿、指令、設計或觀察結果。此處不會執行伺服器、SQL 或 Docker，也不會自動判斷實作品質。'}</p>
<label class="field-label" for="draft">${c.w<=3?'Python 程式':'實作紀錄 / 草稿'}</label><textarea maxlength="20000" id="draft" class="editor" spellcheck="false" autocapitalize="off" autocomplete="off">${esc(s.draft)}</textarea><p class="editor-status" id="draft-status">草稿會自動儲存${s.testsPassed?' · 上次同份程式已透過測試':''}</p>
<div class="actions">${c.w<=3?'<button id="run-code" type="button">執行</button><button id="test-code" class="primary" type="button">執行並測試</button><button id="stop-code" type="button" disabled>停止</button>':''}<button id="download-exercise" type="button">下載練習${c.w<=3?'與測試':''}</button><button id="restore-starter" type="button">還原起始草稿</button></div>
${c.w<=3?'<p class="muted">Python 在背景執行緒執行。首次下載可能需一段時間；運算超時可停止。每次執行是新環境，不儲存 Python 暫存檔案；草稿另由瀏覽器儲存。若載入失敗，可下載到本機執行。</p><pre id="python-output" class="output" role="status" aria-live="polite">尚未執行</pre>':''}
${l.hints.map((h,i)=>`<details class="hints"><summary>提示 ${i+1} · 需要時再展開</summary><p>${esc(h)}</p></details>`).join('')}
<details class="hints"><summary>參考解法 / 預期紀錄</summary>${codeBlock(l.solution)}<p class="muted">參考答案不是唯一作法。先自行嘗試，再比較設計與限制。</p></details>
${c.w<=3?`<label class="check-row"><input id="local-passed" type="checkbox" ${s.localPassed?'checked':''}>我已在本機執行下載的相同測試並透過（自評；載入失敗時可使用）</label>`:''}
<label class="check-row"><input type="checkbox" data-step="2" ${s.steps[2]?'checked':''}>${c.w<=3?'我已透過測試並能解釋實作':'我已在本機完成實作，核對預期並留下紀錄（自評）'}</label>`;}
function quizView(c,l,s){return `<h2>檢查是否理解</h2><p class="muted">全部答對才符合本週的概念驗收條件。可修改答案後重做；題目判分不等同完整專案驗收。</p><form id="quiz-form">${l.quiz.map((q,i)=>`<fieldset class="quiz-question"><legend>${i+1}. ${esc(q.prompt)}</legend>${q.options.map((o,j)=>`<label class="quiz-option"><input type="radio" name="q${i}" value="${j}" ${s.answers[i]===j?'checked':''} required>${esc(o)}</label>`).join('')}${s.graded?`<div class="feedback ${s.answers[i]===q.answer?'correct':'wrong'}"><b>${s.answers[i]===q.answer?'✓ 正確':'再想一想 · 正確答案：'+esc(q.options[q.answer])}</b>${esc(q.explanation)}</div>`:''}</fieldset>`).join('')}<button class="primary" type="submit">檢查答案</button>${s.graded?`<p class="result-line" role="status">${core.quizScore(s,l)} / ${l.quiz.length} 題正確${core.quizScore(s,l)===l.quiz.length?' · 概念驗收透過':' · 修改後可再次檢查'}</p>`:''}</form>`;}
function projectView(c,l,s){const eligible=core.eligible(s,c,l);return `<h2>把本週成果留下來</h2><div class="callout"><strong>本週產出</strong><br>${esc(c.out)}</div><h3>完整作業</h3>${list(c.tasks)}<label class="field-label" for="project">成果紀錄：檔案 / commit / 測試結果 / 決策與限制</label><textarea maxlength="20000" id="project" placeholder="記錄你做了什麼、如何驗證、遇到的問題與尚未完成專案。">${esc(s.project)}</textarea><p class="muted">這是個人學習紀錄，不會自動上傳 GitHub。請勿貼入密碼、token 或真實私人資料。</p><h3>成果驗收（自評）</h3>${c.pass.map((v,i)=>`<label class="check-row"><input type="checkbox" data-rubric="${i}" ${s.rubric[i]?'checked':''}>${esc(v)}</label>`).join('')}
<div class="completion"><h3>${completed(c.w)?'✓ 本週已標記完成':'完成前的檢查'}</h3><ul><li>${s.steps[0]?'✓':'○'} 概念已確認</li><li>${s.steps[1]?'✓':'○'} 範例已確認</li><li>${s.steps[2]?'✓':'○'} 實作已驗證與自評</li><li>${s.graded&&core.quizScore(s,l)===l.quiz.length?'✓':'○'} 概念驗收全部答對</li><li>${s.rubric.every(Boolean)&&s.project.trim()?'✓':'○'} 成果紀錄與全部自評條件已完成</li></ul>${s.legacy?'<p>這週保留了舊版手動完成記錄。新教材各步仍可重新完成。</p>':''}<p>自評表示你確認已完成實作；網站沒有審查你的完整專案。</p><button id="complete-week" type="button" ${eligible?'':'disabled'}>${s.done?'已完成本週':'標記完成本週'}</button></div>${c.w<36?`<a class="btn primary" href="${lessonUrl(c.w+1)}">進入 Week ${String(c.w+1).padStart(2,'0')} →</a>`:'<a class="btn" href="#home">回到課程總覽</a>'}`;}
function renderLesson(w,step,focus=false){
  stopRun(false);currentWeek=w;currentStep=step;state.lastWeek=w;
  const c=course[w-1],l=lessons[w],s=ws(w);save();renderSidebar();
  document.title=`Week ${String(w).padStart(2,'0')} · ${c.t}｜互動教材`;
  const views=[readView,exampleView,practiceView,quizView,projectView];
  $('#main').innerHTML=`<header class="lesson-header"><span class="section-kicker">WEEK ${String(w).padStart(2,'0')} · ${esc(c.p)}</span><h1>${esc(c.t)}</h1><p class="lead">${esc(c.g)}</p><div class="meta"><span>建議 8～10 小時 / 週</span><span>${w<=3?'可在瀏覽器練習 Python':'含本機實作'}</span>${completed(w)?'<span class="badge">✓ 已完成</span>':''}</div></header>
<nav class="step-tabs" aria-label="學習步驟">${steps.map((label,i)=>`<a class="${i===step?'active':''}" href="${lessonUrl(w,i)}" ${i===step?'aria-current="step"':''}><small>0${i+1} ${(i<3&&s.steps[i])||(i===3&&s.graded&&core.quizScore(s,l)===l.quiz.length)||(i===4&&completed(w))?'✓':''}</small>${label}</a>`).join('')}</nav>
<article class="lesson-body">${views[step](c,l,s)}<details class="notes-area"><summary>我的學習筆記 · 自動儲存</summary><label class="sr-only" for="notes">本週學習筆記</label><textarea maxlength="20000" id="notes" placeholder="用自己的話解釋概念，留下卡住的地方與修正方法。">${esc(s.notes)}</textarea></details><div class="step-bottom"><a class="btn" href="${step>0?lessonUrl(w,step-1):w>1?lessonUrl(w-1,4):'#home'}">← ${step>0?'上一步':w>1?'上一週':'總覽'}</a>${step<4?`<a class="btn primary" href="${lessonUrl(w,step+1)}">下一步：${steps[step+1]} →</a>`:''}</div></article>`;
  $('#notes').value=s.notes;if($('#draft'))$('#draft').value=s.draft;if($('#project'))$('#project').value=s.project;
  bindLesson(c,l,s);bindCopy();
  if(focus){$('#main').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
}
function invalidate(s){s.done=false;}
function bindLesson(c,l,s){
  $('#notes').addEventListener('input',e=>{s.notes=e.target.value;save();});
  document.querySelectorAll('[data-step]').forEach(input=>input.addEventListener('change',()=>{
    const n=Number(input.dataset.step);
    if(n===2&&input.checked&&c.w<=3&&!s.testsPassed&&!s.localPassed){input.checked=false;toast('先透過頁面測試，或完成本機相同測試再勾選。');return;}
    if(n===2&&input.checked&&c.w>3&&!s.draft.trim()){input.checked=false;toast('先留下實作紀錄。');return;}
    s.steps[n]=input.checked;invalidate(s);save();renderSidebar();
  }));
  if(currentStep===2){
    $('#draft').addEventListener('input',e=>{s.draft=e.target.value;s.testsPassed=false;s.localPassed=false;s.steps[2]=false;invalidate(s);save();$('#draft-status').textContent='草稿已儲存 · 修改後需重新驗證';const check=document.querySelector('[data-step="2"]');check.checked=false;if($('#local-passed'))$('#local-passed').checked=false;renderSidebar();});
    $('#draft').addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();const el=e.target,start=el.selectionStart,end=el.selectionEnd;el.setRangeText('    ',start,end,'end');el.dispatchEvent(new Event('input',{bubbles:true}));}});
    $('#restore-starter').addEventListener('click',()=>{if(confirm('還原本課起始草稿？目前草稿會被取代，筆記保留。')){s.draft=l.starter;s.testsPassed=false;s.localPassed=false;s.steps[2]=false;invalidate(s);save();renderLesson(c.w,2);}});
    $('#download-exercise').addEventListener('click',()=>download(`week${String(c.w).padStart(2,'0')}.${c.w<=3?'py':'md'}`,c.w<=3?s.draft+'\n\n# 課程驗收測試\n'+l.tests+'\nprint("全部測試透過")\n':l.prompt+'\n\n'+s.draft,'text/plain'));
    if(c.w<=3){
      $('#run-code').addEventListener('click',()=>runPython(c,l,s,false));$('#test-code').addEventListener('click',()=>runPython(c,l,s,true));$('#stop-code').addEventListener('click',()=>stopRun(true));
      $('#local-passed').addEventListener('change',e=>{s.localPassed=e.target.checked;if(!s.localPassed&&!s.testsPassed){s.steps[2]=false;document.querySelector('[data-step="2"]').checked=false;invalidate(s);}save();});
    }
  }
  if(currentStep===3){
    $('#quiz-form').addEventListener('change',e=>{if(e.target.type==='radio'){const i=Number(e.target.name.slice(1));s.answers[i]=Number(e.target.value);s.graded=false;invalidate(s);save();document.querySelectorAll('.feedback,.result-line').forEach(el=>el.remove());renderSidebar();}});
    $('#quiz-form').addEventListener('submit',e=>{e.preventDefault();s.graded=true;invalidate(s);save();renderLesson(c.w,3);});
  }
  if(currentStep===4){
    function refresh(){invalidate(s);save();renderSidebar();$('#complete-week').disabled=!core.eligible(s,c,l);$('#complete-week').textContent='標記完成本週';document.querySelector('.completion h3').textContent=s.legacy?'✓ 保留舊版完成記錄':'完成前的檢查';const status=document.querySelector('.completion li:last-child');status.textContent=(s.rubric.every(Boolean)&&s.project.trim()?'✓':'○')+' 成果紀錄與全部自評條件已完成';}
    $('#project').addEventListener('input',e=>{s.project=e.target.value;refresh();});
    document.querySelectorAll('[data-rubric]').forEach(input=>input.addEventListener('change',()=>{s.rubric[Number(input.dataset.rubric)]=input.checked;refresh();renderLesson(c.w,4);}));
    $('#complete-week').addEventListener('click',()=>{if(!core.eligible(s,c,l))return;s.done=true;s.legacy=false;save();renderLesson(c.w,4);toast('本週已完成。進度與成果紀錄已儲存。');});
  }
}
function bindCopy(){document.querySelectorAll('.copy-code').forEach(b=>b.addEventListener('click',async()=>{const text=b.parentNode.querySelector('code').textContent;try{await navigator.clipboard.writeText(text);b.textContent='已複製';setTimeout(()=>b.textContent='複製',1500);}catch{toast('無法存取剪貼簿，請選取程式碼後手動複製。');}}));}
function stopRun(visible){if(worker){worker.terminate();worker=null;}clearTimeout(runTimer);if($('#run-code')){$('#run-code').disabled=false;$('#test-code').disabled=false;$('#stop-code').disabled=true;}if(visible&&$('#python-output'))$('#python-output').textContent='已停止執行。草稿仍保留。';}
function runPython(c,l,s,test){
  stopRun(false);
  if(test){s.testsPassed=false;s.steps[2]=false;invalidate(s);save();document.querySelector('[data-step="2"]').checked=false;}
  const output=$('#python-output'),code=s.draft;
  output.textContent='正在載入 Python 環境…首次執行需要下載。';
  $('#run-code').disabled=true;$('#test-code').disabled=true;$('#stop-code').disabled=false;
  try{worker=new Worker('python-worker.js',{type:'module'});}catch(e){output.textContent='無法建立 Python 執行環境。請下載練習到本機執行。\n'+e.message;stopRun(false);return;}
  const localWorker=worker;
  const failed=msg=>{if(worker!==localWorker)return;output.textContent=msg;stopRun(false);};
  runTimer=setTimeout(()=>failed('Python 環境載入超時。可重試，或下載練習到本機執行。'),60000);
  worker.onerror=()=>failed('Python 環境無法載入。請檢查網路/CDN 存取，或下載練習到本機執行。');
  worker.onmessage=({data})=>{
    if(worker!==localWorker)return;
    if(data.type==='ready'){clearTimeout(runTimer);output.textContent='Python 已載入，正在執行…';runTimer=setTimeout(()=>failed('程式執行超時，已停止。檢查是否有無限迴圈；草稿保留。'),10000);}
    if(data.type==='result'){
      output.textContent=data.output+'\n\n'+(data.ok?(test?'✓ 全部題目測試透過':'✓ 程式執行完成'):'✕ 執行或測試失敗，請閱讀上方錯誤');
      if(s.draft!==code)output.textContent+='\n注意：草稿已修改，此次結果屬於修改前的程式。';
      if(test&&data.ok&&s.draft===code){s.testsPassed=true;save();$('#draft-status').textContent='草稿已儲存 · 這份程式已透過題目測試';}
      stopRun(false);
    }
  };
  worker.postMessage({code,tests:test?l.tests:''});
}
function download(name,text,type){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function route(){
  const m=location.hash.match(/^#week\/(\d+)\/(\d+)$/);
  if(m){const w=Number(m[1]),step=Number(m[2]);if(w>=1&&w<=36&&step>=0&&step<=4){renderLesson(w,step,true);return;}}
  stopRun(false);renderHome();document.title='Python → AI Architect｜互動教材';
}
[...new Set(course.map(c=>c.p))].forEach(p=>{const o=document.createElement('option');o.value=p;o.textContent=p;$('#phase-select').appendChild(o);});
$('#course-search').addEventListener('input',renderSidebar);$('#phase-select').addEventListener('change',renderSidebar);
$('#continue-top').addEventListener('click',()=>location.hash=lessonUrl(state.lastWeek||continueWeek()));
$('#export-progress').addEventListener('click',()=>download('python-ai-learning-progress.json',JSON.stringify(state,null,2),'application/json'));
$('#import-progress').addEventListener('change',async e=>{
  const file=e.target.files[0];if(!file)return;
  try{if(file.size>8000000)throw new Error('進度檔過大');const imported=core.normalise(JSON.parse(await file.text()),course,lessons);if(confirm('使用備份取代此瀏覽器的進度與草稿？建議先匯出目前進度。')){stopRun(false);state=imported;save();route();toast('進度已匯入。');}}catch(err){toast('匯入失敗：'+err.message);}finally{e.target.value='';}
});
$('#reset-progress').addEventListener('click',()=>{if(confirm('清除所有週次進度、草稿與筆記？需要保留時請先匯出。')){stopRun(false);state=core.blank();try{localStorage.removeItem(OLD);}catch{}save();location.hash='#home';route();toast('進度已重設。');}});
window.addEventListener('hashchange',route);route();
})();
