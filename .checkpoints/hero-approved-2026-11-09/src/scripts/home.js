import { samples } from "../data/examples";
import { copyText } from "./clipboard";
let current='basic';
const escapeHtml=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function highlight(line){
 const token=/(\/\/.*$)|("(?:[^"\\]|\\.)*")|\b(import|from|const|new|await|for|if|in|as)\b|\b(\d+)\b/g;
 let html='',last=0;for(const m of line.matchAll(token)){html+=escapeHtml(line.slice(last,m.index));const cls=m[1]?'comment':m[2]?'str':m[3]?'kw':'num';html+='<span class="'+cls+'">'+escapeHtml(m[0])+'</span>';last=m.index+m[0].length;}return html+escapeHtml(line.slice(last));
}
function setExample(name,moveFocus=false){current=name;const sample=samples[name];document.getElementById('filename').textContent=sample.file;document.getElementById('output').textContent=sample.output;document.getElementById('source-code').innerHTML=sample.source.split('\n').map((line,i)=>'<span class="code-line"><span class="ln" aria-hidden="true">'+String(i+1).padStart(2,'0')+'</span>'+highlight(line)+'</span>').join('');document.querySelectorAll('.tab').forEach(tab=>{const selected=tab.dataset.example===name;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;if(selected&&moveFocus)tab.focus()});document.getElementById('code-panel').setAttribute('aria-labelledby','tab-'+name);}
document.querySelectorAll('.tab').forEach(tab=>{tab.addEventListener('click',()=>setExample(tab.dataset.example));tab.addEventListener('keydown',e=>{const names=Object.keys(samples),i=names.indexOf(current);if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();setExample(e.key==='Home'?names[0]:e.key==='End'?names.at(-1):names[(i+(e.key==='ArrowRight'?1:-1)+names.length)%names.length],true)}})});
document.querySelectorAll('[data-copy]').forEach(btn=>btn.addEventListener('click',()=>copyText(btn.dataset.copy)));document.getElementById('copy-code').addEventListener('click',()=>copyText(samples[current].source));

setExample('basic');
