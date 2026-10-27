import http from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4','.woff2':'font/woff2','.ico':'image/x-icon'};
const server=http.createServer(async(req,res)=>{
 try{
  if(req.url==='/'){res.writeHead(302,{Location:'/concept-traveller-stories-interactive/'});res.end();return;}
  const url=new URL(req.url,'http://localhost');
  const target=path.resolve(root,'.'+decodeURIComponent(url.pathname));
  if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  let file=target;let info=await stat(file);if(info.isDirectory()){file=path.join(file,'index.html');info=await stat(file);}
  const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache'};
  const range=req.headers.range;
  if(range){
   const m=/^bytes=(\d*)-(\d*)$/.exec(range);if(!m){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return;}
   let start=m[1]?Number(m[1]):Math.max(0,info.size-Number(m[2]));let end=m[1]?(m[2]?Math.min(Number(m[2]),info.size-1):info.size-1):info.size-1;
   if(start>end||start>=info.size){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return;}
   res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${info.size}`,'Content-Length':end-start+1});
   if(req.method==='HEAD')res.end();else createReadStream(file,{start,end}).pipe(res);
  }else{res.writeHead(200,{...headers,'Content-Length':info.size});if(req.method==='HEAD')res.end();else createReadStream(file).pipe(res);}
 }catch{res.writeHead(404);res.end('Not found');}
});
server.listen(Number(process.env.PORT||3000),'127.0.0.1',()=>console.log(`CTR ready at http://localhost:${server.address().port}/concept-traveller-stories-interactive/`));
