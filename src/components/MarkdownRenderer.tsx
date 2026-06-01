// Robust Markdown-like parser with image support
export default function MarkdownRenderer({ text }: { text: string }) {
 if (!text) return null;
 
 return (
 <div className="space-y-6">
 {text.split("\n").map((line, idx) => {
 const trimmed = line.trim();
 
 // Image support: ![alt text](url)
 const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
 if (imgMatch) {
 return (
 <div key={idx} className="my-8">
 <img 
 src={imgMatch[2]} 
 alt={imgMatch[1]} 
 className="w-full h-auto border border-stone-100"
 />
 {imgMatch[1] && (
 <p className="text-[10px] text-center text-stone-400 mt-2 font-mono uppercase tracking-widest">
 {imgMatch[1]}
 </p>
 )}
 </div>
 );
 }

 if (trimmed.startsWith("###")) {
 return (
 <h3 key={idx} className="font-display text-2xl font-bold tracking-tight text-brand-ink mt-10 mb-4 uppercase">
 {trimmed.replace("###","")}
 </h3>
 );
 }
 
 if (trimmed.startsWith("####")) {
 return (
 <h4 key={idx} className="font-display text-lg font-black uppercase tracking-wider text-brand-ink mt-8 mb-3">
 {trimmed.replace("####","")}
 </h4>
 );
 }
 
 if (trimmed.startsWith(">")) {
 return (
 <blockquote key={idx} className="border-l-4 border-brand-pink pl-6 italic my-8 font-serif text-xl text-stone-700 bg-brand-stone py-4 pr-4">
 {trimmed.replace(">","")}
 </blockquote>
 );
 }
 
 if (trimmed.startsWith("-")) {
 return (
 <li key={idx} className="list-disc ml-8 my-2 text-stone-700 leading-relaxed">
 {trimmed.replace("-","")}
 </li>
 );
 }
 
 if (trimmed ==="") {
 return <div key={idx} className="h-4"/>;
 }
 
 return (
 <p key={idx} className="text-stone-700 leading-relaxed text-lg font-sans text-justify">
 {trimmed}
 </p>
 );
 })}
 </div>
 );
}
