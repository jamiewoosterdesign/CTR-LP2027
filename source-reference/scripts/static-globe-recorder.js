// Records the live globe's vector drawing commands without rasterising them.
window.StaticGlobeRecorder=class{
 constructor(){this.nodes=[];this.defs=[];this.path='';this.stack=[];this.fillStyle='#000';this.strokeStyle='#000';this.lineWidth=1;this.lineCap='butt';this.dash=[];}
 clearRect(){this.nodes=[];this.defs=[];}
 setTransform(){} beginPath(){this.path='';}
 moveTo(x,y){this.path+='M'+x+' '+y+' ';}
 lineTo(x,y){this.path+='L'+x+' '+y+' ';}
 closePath(){this.path+='Z ';}
 arc(x,y,r,a,b){const full=b-a>=Math.PI*2-.001;this.moveTo(x+r*Math.cos(a),y+r*Math.sin(a));if(full)this.path+='A'+r+' '+r+' 0 1 1 '+(x-r*Math.cos(a))+' '+(y-r*Math.sin(a))+' A'+r+' '+r+' 0 1 1 '+(x+r*Math.cos(a))+' '+(y+r*Math.sin(a))+' ';else this.path+='A'+r+' '+r+' 0 '+(b-a>Math.PI?1:0)+' 1 '+(x+r*Math.cos(b))+' '+(y+r*Math.sin(b))+' ';}
 createRadialGradient(x,y,r,x2,y2,r2){const id='globe-grad-'+this.defs.length,g={id,x,y,r,x2,y2,r2,stops:[],addColorStop(n,c){this.stops.push([n,c])}};this.defs.push(g);return g;}
 paint(p){return typeof p==='object'?'url(#'+p.id+')':p;}
 fill(rule){this.nodes.push('<path d="'+this.path+'" fill="'+this.paint(this.fillStyle)+'" fill-rule="'+(rule||'nonzero')+'"/>');}
 fillRect(x,y,w,h){this.nodes.push('<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+this.paint(this.fillStyle)+'"/>');}
 stroke(){this.nodes.push('<path d="'+this.path+'" fill="none" stroke="'+this.paint(this.strokeStyle)+'" stroke-width="'+this.lineWidth+'" stroke-linecap="'+this.lineCap+'"'+(this.dash.length?' stroke-dasharray="'+this.dash.join(' ')+'"':'')+'/>');}
 setLineDash(d){this.dash=d;}
 save(){this.stack.push([this.fillStyle,this.strokeStyle,this.lineWidth,this.lineCap,[...this.dash]]);}
 restore(){[this.fillStyle,this.strokeStyle,this.lineWidth,this.lineCap,this.dash]=this.stack.pop();}
 svg(size){return '<svg xmlns="http://www.w3.org/2000/svg" width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'"><defs>'+this.defs.map(g=>'<radialGradient id="'+g.id+'" gradientUnits="userSpaceOnUse" cx="'+g.x2+'" cy="'+g.y2+'" r="'+g.r2+'" fx="'+g.x+'" fy="'+g.y+'" fr="'+g.r+'">'+g.stops.map(([n,c])=>'<stop offset="'+n+'" stop-color="'+c+'"/>').join('')+'</radialGradient>').join('')+'</defs>'+this.nodes.join('')+'</svg>';}
};
