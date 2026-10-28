import {readFile, writeFile} from 'node:fs/promises';

// One rule for all report languages, including scripts without word spaces.
// Only changes emphasis in story-card headings; preserves copy and line breaks.
const supported=['en','th','es','it','de','fr','pt'];
const selected=process.argv.slice(2);
for(const locale of selected.length?selected:supported){
 if(!supported.includes(locale))throw new Error('Unsupported locale: '+locale);
 const file=new URL('../dist/concept-traveller-stories-interactive/'+(locale==='en'?'':locale+'/')+'index.html',import.meta.url);
 const source=await readFile(file,'utf8');
 const segmenter=new Intl.Segmenter(locale,{granularity:'word'});
 const highlights=[];
 const result=source.replace(/(<header\b[^>]*class="[^"]*\bsb-story-hero\b[^"]*"[^>]*>[\s\S]*?<h2\b[^>]*>)([\s\S]*?)(<\/h2>)/g,(_,before,heading,after)=>{
  const content=heading.replace(/<\/?em\b[^>]*>/g,'');
  const tokens=[...content.matchAll(/<[^>]*>|[^<]+/g)];
  const text=tokens.filter(t=>!t[0].startsWith('<')).map(t=>t[0]).join('');
  // Heading copy currently has no HTML entities: fail instead of splitting one.
  if(/&(?:#\d+|#x[\da-f]+|\w+);/i.test(text))throw new Error('Decode heading entities before segmentation: '+locale);
  const last=[...segmenter.segment(text)].filter(t=>t.isWordLike).at(-1);
  if(!last)throw new Error('Heading has no final word: '+locale);
  let offset=0,start;
  for(const token of tokens){
   if(token[0].startsWith('<'))continue;
   if(last.index<offset+token[0].length){start=token.index+last.index-offset;break;}
   offset+=token[0].length;
  }
  if(start===undefined)throw new Error('Cannot locate final word: '+locale);
  highlights.push(last.segment);
  return before+content.slice(0,start)+'<em>'+content.slice(start)+'</em>'+after;
 });
 if(highlights.length!==4)throw new Error('Expected four story headings: '+locale);
 if(result!==source)await writeFile(file,result,'utf8');
 console.log(locale+': '+highlights.join(' | '));
}
