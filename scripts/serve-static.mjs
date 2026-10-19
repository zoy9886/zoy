import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.png':'image/png'};
createServer(async(req,res)=>{
 try {
  const url=new URL(req.url,'http://localhost');
  if(!url.pathname.startsWith('/zoy/')){res.writeHead(404);res.end();return;}
  const name=decodeURIComponent(url.pathname.slice(5))||'index.html';
  const path=resolve(root,name);
  if(!path.startsWith(root.endsWith(sep)?root:root+sep)){res.writeHead(403);res.end();return;}
  const body=await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream'});res.end(body);
 }catch{res.writeHead(404);res.end();}
}).listen(Number(process.argv[2]||4175),'0.0.0.0',()=>console.log('Static Pages server ready'));
