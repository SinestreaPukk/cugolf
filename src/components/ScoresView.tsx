import { TournamentScore, SiteLabels, AdminEditProps } from"../types";
import { useState } from"react";
import { Award, Calendar, Users, Eye, EyeOff, ClipboardList, Target, Medal, Edit, Trophy, ArrowRight } from"lucide-react";

interface ScoresViewProps extends AdminEditProps {
 scores: TournamentScore[];
 siteLabels?: SiteLabels;
}

export default function ScoresView({ scores, siteLabels, isAdmin, onEditSection, activeSectionId }: ScoresViewProps) {
 const [expandedId, setExpandedId] = useState<string | null>(scores[0]?.id || null);

 const toggleExpand = (id: string) => {
 if (expandedId === id) {
 setExpandedId(null);
 } else {
 setExpandedId(id);
 }
 };

 const isActive = activeSectionId ==="scores_list";
 const wrapperClasses = isAdmin 
 ? `relative transition-all duration-200 cursor-pointer ${isActive ? 'ring-4 ring-brand-pink bg-brand-pink/5 z-40' : 'hover:ring-4 hover:ring-brand-pink/50 hover:bg-brand-pink/5'}` 
 :"";

 return (
 <div 
 id="scores_view"
 className={`space-y-20 animate-fade-in px-4 md:px-0 bg-brand-neutral min-h-screen pb-32 ${wrapperClasses}`}
 onClick={(e) => {
 if (isAdmin && onEditSection) {
 e.stopPropagation();
 onEditSection("scores_list");
 }
 }}
 >
 {isAdmin && (
 <div className={`absolute top-4 left-4 z-50 bg-brand-pink text-brand-neutral px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest flex items-center gap-2 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
 <Edit size={12} /> EDIT SCORES COLLECTION
 </div>
 )}
 
 {/* Editorial Title Banner */}
 <section className="mx-auto max-w-7xl pt-16 md:pt-24">
 <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-brand-ink pb-8 gap-8">
 <div className="space-y-4">
 <span className="inline-block bg-brand-ink text-brand-neutral font-mono text-[10px] px-4 py-1.5 tracking-[0.4em] uppercase font-black">
 {siteLabels?.scoresSubtitle ||"LEADERS RECORD"}
 </span>
 <h1 className="font-display text-4xl md:text-6xl font-black tracking-tighter text-brand-ink uppercase leading-[0.85]">
 {siteLabels?.scoresTitle ||"RESULTS & STATISTICS"}
 </h1>
 </div>
 <div className="font-mono text-[10px] font-black text-stone-400 tracking-[0.2em] uppercase flex items-center gap-4 bg-brand-stone px-6 py-3 border border-brand-ink/10">
 <Trophy size={14} className="text-brand-pink" /> {siteLabels?.scoresVerifiedLabel ||"VARSITY ARCHIVES VERIFIED"}
 </div>
 </div>
 </section>

 {/* Main Stats Summary & Interactive List */}
 <section className="mx-auto max-w-7xl font-sans">
 
 {/* Interactive Match Score list */}
 <div className="space-y-10">
   <div className="border-2 border-brand-ink bg-brand-neutral divide-y-2 divide-brand-ink overflow-hidden shadow-[12px_12px_0px_rgba(18,18,18,0.05)]">
     {(scores || []).filter(s => s.isVisible !== false).map((score) => {
 const isExpanded = expandedId === score.id;

 return (
 <div key={score.id} className="p-8 md:p-12 space-y-8 bg-brand-neutral hover:bg-brand-stone/20 transition-all duration-500">
 
 {/* Basic Card Overview */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
 <div className="space-y-4">
 <div className="flex flex-wrap items-center gap-4">
 <span className="font-mono text-[10px] text-stone-400 flex items-center gap-2 font-black uppercase tracking-[0.2em]">
 <Calendar size={12} className="text-brand-pink"/>
 {score.date}
 </span>
 <span className="font-mono text-[9px] text-emerald-800 font-black tracking-[0.2em] uppercase bg-emerald-50 px-3 py-1 border border-emerald-500/20 shadow-sm">
 {siteLabels?.scoresOfficialStatsBadge ||"UNOFFICIAL STATS"}
 </span>
 </div>
 <h3 className="font-display text-2xl md:text-3xl font-black text-brand-ink uppercase tracking-tight leading-none">
 {score.tournamentName}
 </h3>
 <p className="text-[11px] text-stone-500 font-mono font-black uppercase tracking-[0.3em] flex items-center gap-3">
 <Award size={14} className="text-brand-pink"/>
 {score.result}
 </p>
 </div>

 <button
 onClick={() => toggleExpand(score.id)}
 className="inline-flex items-center gap-3 border-2 border-brand-ink bg-brand-ink px-8 py-4 font-mono text-[10px] font-black text-brand-neutral uppercase hover:bg-brand-pink hover:border-brand-pink transition-all duration-300 cursor-pointer shadow-lg group"
 >
 {isExpanded ? (
 <>
 <EyeOff size={14} /> {siteLabels?.scoresHideStandingsButton ||"CLOSE SCORECARD"}
 </>
 ) : (
 <>
 <Eye size={14} /> {siteLabels?.scoresViewStandingsButton ||"VIEW SCORECARD"}
 </>
 )}
 <ArrowRight size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
 </button>
 </div>

 {/* Expanded Leaderboard details */}
 {isExpanded && (
 <div className="border-2 border-brand-ink overflow-hidden animate-slide-down bg-brand-neutral mt-8">
 <div className="bg-brand-ink text-brand-neutral px-6 py-4 font-mono text-[10px] tracking-[0.3em] uppercase flex items-center justify-between font-black">
 <div className="flex items-center gap-3">
 <ClipboardList size={14} className="text-brand-pink"/>
 {siteLabels?.scoresDetailedLeaderboardTitle ||"TECHNICAL LEADERBOARD"}
 </div>
 <span className="text-brand-neutral/40 font-mono">{score.playersCount} ATTESTED ROUNDS</span>
 </div>
 
 <div className="overflow-x-auto">
 <table className="w-full text-left font-sans text-sm">
 <thead>
 <tr className="bg-brand-stone border-b-2 border-brand-ink font-mono text-[10px] text-stone-500 uppercase tracking-[0.2em] font-black">
 <th className="px-8 py-4">{siteLabels?.scoresTablePlayerHeader ||"VARISTY PLAYER"}</th>
 <th className="px-8 py-4 text-center">{siteLabels?.scoresTableScoreHeader ||"STROKE SCORE"}</th>
 <th className="px-8 py-4 text-right">{siteLabels?.scoresTablePositionHeader ||"RANK"}</th>
 </tr>
 </thead>
 <tbody className="divide-y-2 divide-brand-stone">
 {(score.scoresList || []).map((sl, index) => (
 <tr key={index} className="hover:bg-brand-stone/30 transition-colors uppercase font-bold text-brand-ink">
 <td className="px-8 py-5 flex items-center gap-4">
 <Medal size={16} className={index === 0 ?"text-amber-500 shrink-0": index === 1 ?"text-stone-400 shrink-0":"text-stone-300 shrink-0"} />
 <span className="tracking-tight">{sl.playerName}</span>
 </td>
 <td className="px-8 py-5 text-center font-mono font-black text-lg bg-brand-stone/10">
 {sl.score}
 </td>
 <td className="px-8 py-5 text-right font-mono font-black text-brand-pink text-lg">
 {sl.position}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 <div className="bg-brand-stone/50 border-t-2 border-brand-ink p-4 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-mono text-stone-400 font-black uppercase tracking-[0.2em]">
 <span>{siteLabels?.scoresAttestationLabel ||"CU ATHLETIC DEPT ATTESTED ROUND"}</span>
 <div className="flex items-center gap-4">
 <span>{siteLabels?.scoresVerifiedDirectoryLabel ||"OFFICIAL LOG"}</span>
 <span className="h-1 w-1 rounded-full bg-brand-pink animate-pulse" />
 </div>
 </div>

 </div>
 )}

 </div>
 );
 })}
   </div>
 </div>

 </section>
 </div>
 );
}
