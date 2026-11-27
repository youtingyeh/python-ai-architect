const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{parseHTML}=require('linkedom');
test('supplement links, persistent notes and completion filter',()=>{
const {window}=parseHTML(fs.readFileSync('genai.html','utf8'));let saved={};
const storage={getItem:k=>saved[k]||null,setItem:(k,v)=>saved[k]=v};
vm.runInNewContext(fs.readFileSync('genai.js','utf8'),{document:window.document,localStorage:storage,Blob,URL,setTimeout,confirm:()=>true});
const d=window.document;assert.equal(d.querySelectorAll('article').length,22);assert.equal(d.querySelectorAll('a[href*="/translations/zh-TW/"]').length,23);
const note=d.querySelector('[data-note="15"]');note.value='RAG 測試紀錄';note.dispatchEvent(new window.Event('input'));
const done=d.querySelector('[data-done="15"]');done.checked=true;done.dispatchEvent(new window.Event('change'));
assert.equal(JSON.parse(saved['python-ai-genai-supplement-v1'])['15'].note,'RAG 測試紀錄');assert.equal(d.querySelector('#count').textContent,'1 / 22 項完成');
Object.defineProperty(d.querySelector('#filter'),'value',{value:'todo',configurable:true});d.querySelector('#filter').dispatchEvent(new window.Event('change'));assert.equal(d.querySelector('#lesson-15').hidden,true);assert.equal(d.querySelector('#lesson-14').hidden,false);
});
