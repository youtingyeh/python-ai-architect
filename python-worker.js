// Pinned browser runtime; user programs run off the UI thread.
import { loadPyodide } from 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.mjs';
let output='';
const append=s=>{ if(output.length<20000)output+=(s+'\n').slice(0,20000-output.length); };
const ready=loadPyodide({stdout:append,stderr:append});
self.onmessage=async({data})=>{
  let globals;
  try{
    const py=await ready;
    self.postMessage({type:'ready'});
    globals=py.toPy({});
    await py.runPythonAsync(data.code,{globals});
    if(data.tests)await py.runPythonAsync(data.tests,{globals});
    self.postMessage({type:'result',ok:true,output:output||'（程式沒有 print 輸出）'});
  }catch(e){self.postMessage({type:'result',ok:false,output:output+'\n'+e.message});}
  finally{globals?.destroy();}
};
