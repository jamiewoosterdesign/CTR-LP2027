import fs from 'node:fs';
const replacements=JSON.parse(fs.readFileSync(new URL('./data/optimized-images.json',import.meta.url),'utf8'));
export function optimizeReportImages(page){
 for(const [from,to] of Object.entries(replacements))page=page.replaceAll('/assets/'+from,'/assets/'+to);
 return page.replace(/<img\b[^>]*>/g,tag=>{
  if(!tag.includes('decoding='))tag=tag.replace('<img','<img decoding="async"');
  if(!tag.includes('loading=')&&!tag.includes('fetchpriority="high"')&&!/report-logo|report-mark/.test(tag))tag=tag.replace('<img','<img loading="lazy"');
  return tag;
 });
}
