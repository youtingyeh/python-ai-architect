(()=>{'use strict';
const KEY='python-ai-genai-supplement-v1',ids=Array.from({length:22},(_,i)=>String(i).padStart(2,'0'));let state={};
const $=s=>document.querySelector(s),status=m=>$('#status').textContent=m;
function valid(raw){const out={};if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('格式不符');for(const id of ids){const x=raw[id];out[id]={note:typeof x?.note==='string'?x.note.slice(0,12000):'',done:x?.done===true};}return out;}
try{state=valid(JSON.parse(localStorage.getItem(KEY)||'{}'));}catch{state=valid({});status('無法讀取儲存紀錄；請匯入備份或重新記錄。');}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{status('無法儲存，離開前請匯出補充進度。');}}
function render(){let n=0;for(const id of ids){const x=state[id],card=$('#lesson-'+id);if(x.done)n++;const f=$('#filter').value;card.hidden=!(f==='all'||(f==='todo'?!x.done:card.querySelector('.tag').textContent.includes(f)));}$('#count').textContent=n+' / 22 項完成';$('#progress').value=n;}
function fill(){for(const id of ids){$('[data-note="'+id+'"]').value=state[id].note;$('[data-done="'+id+'"]').checked=state[id].done;}render();}
document.querySelectorAll('[data-note]').forEach(el=>el.addEventListener('input',()=>{state[el.dataset.note].note=el.value;save();}));
document.querySelectorAll('[data-done]').forEach(el=>el.addEventListener('change',()=>{state[el.dataset.done].done=el.checked;save();render();}));
$('#filter').addEventListener('change',render);
$('#export').addEventListener('click',()=>{const blob=new Blob([JSON.stringify({type:KEY,version:1,units:state},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='genai-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
$('#import').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>1000000)throw Error('檔案太大');const raw=JSON.parse(await file.text());if(raw.type!==KEY||raw.version!==1)throw Error('不是補充單元進度檔');const next=valid(raw.units);if(!confirm('匯入將取代目前的補充單元紀錄，是否繼續？'))return;state=next;save();fill();status('補充進度已匯入。');}catch(err){status('匯入失敗：'+err.message);}finally{e.target.value='';}});fill();})();
