/* Keep the final two words together in prose without touching heading layouts. */
(()=>{
 if(document.documentElement.lang!=='en')return;
 const selector='p,.au-tip,.profile-lead,.profile-note,#report-top .copy>.micro';
 document.querySelectorAll(selector).forEach(el=>{
  if(el.closest('h1,h2,h3,h4,h5,h6,nav,button,svg,[role="tablist"]')||el.matches('.kicker,.ai-eyebrow,.au-eyebrow,.sb-index,.popover-kicker,.gh-eyebrow'))return;
  const nodes=[],walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let text='',node;
  while(node=walker.nextNode()){nodes.push({node,start:text.length});text+=node.data;}
  const end=text.match(/\S+(\s+)\S+\s*$/);if(!end||!end[1]||end[1]==='\u00a0')return;
  const gap=end.index+end[0].indexOf(end[1]),gapEnd=gap+end[1].length;
  for(const {node,start} of nodes){const from=Math.max(gap-start,0),to=Math.min(gapEnd-start,node.data.length);if(to>from)node.data=node.data.slice(0,from)+(start<=gap&&gap<start+node.data.length?'\u00a0':'')+node.data.slice(to);}
 });
})();
