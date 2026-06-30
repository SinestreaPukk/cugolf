import { TournamentScore, SiteLabels, AdminEditProps } from "../types";
import { useState } from "react";
import { Award, Calendar, Users, Eye, EyeOff, ClipboardList, Target, Medal, Edit } from "lucide-react";
import { useLanguage } from "../utils/LanguageContext";
import { fmtDate } from "../utils/format";

interface ScoresViewProps extends AdminEditProps {
  scores: TournamentScore[];
  siteLabels?: SiteLabels;
}

export default function ScoresView({ scores, siteLabels, isAdmin, onEditSection, activeSectionId }: ScoresViewProps) {
  const { language } = useLanguage();
  const [expandedId, setExpandedId] = useState<string | null>(scores[0]?.id || null);

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  const isActive = activeSectionId === "scores_list";
  const wrapperClasses = isAdmin 
    ? `relative transition-all duration-200 cursor-pointer ${isActive ? 'ring-4 ring-[#da5f8e] bg-brand-pink/5 z-40' : 'hover:ring-4 hover:ring-[#da5f8e]/50 hover:bg-brand-pink/5'}` 
    : "";

  return (
    <div 
      id="scores_view"
      className={`space-y-12 animate-fade-in px-4 md:px-0 bg-brand-neutral pb-12 ${wrapperClasses}`}
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
      
      {/* Editorial Header */}
      <section className="mx-auto max-w-7xl pt-6 text-center md:text-left space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-brand-ink pb-4 gap-4">
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-brand-ink uppercase leading-none">
              {siteLabels?.scoresTitle || "TOURNAMENT LEADERBOARD"}
            </h1>
          </div>
        </div>
      </section>

      {/* Main Stats Summary & Interactive List */}
      <section className="mx-auto max-w-7xl font-sans">
        {/* Interactive Match Score list */}
        <div className="space-y-6">
          <div className="border border-brand-ink bg-brand-neutral divide-y divide-stone-150 overflow-hidden shadow-[8px_8px_0px_rgba(18,18,18,0.08)]">
            {(scores || []).filter(s => s.isVisible !== false).map((score) => {
              const isExpanded = expandedId === score.id;

              return (
                <div key={score.id} className="p-6 md:p-8 space-y-6 bg-brand-neutral hover:bg-brand-stone/50 transition-colors duration-300">
                  {/* Basic Card Overview */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[9px] text-stone-400 flex items-center gap-1 font-bold uppercase tracking-wider">
                          <Calendar size={11} className="text-stone-300"/>
                          {fmtDate(score.date)}
                        </span>
                        <span className="h-1 w-1 bg-stone-300 hidden sm:inline"/>
                        <span className="font-mono text-[8.5px] text-emerald-700 font-bold tracking-wider uppercase bg-emerald-50 px-2 py-0.5 border border-emerald-500/10">
                          {siteLabels?.scoresOfficialStatsBadge || "UNOFFICIAL STATS"}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-brand-ink uppercase tracking-tight leading-none">
                        {language === "th" && score.tournamentNameThai ? score.tournamentNameThai : score.tournamentName}
                      </h3>
                      <p className="text-xs text-stone-600 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Award size={13} className="text-stone-500"/>
                        {language === "th" && score.resultThai ? score.resultThai : score.result}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleExpand(score.id)}
                      className="inline-flex items-center gap-1.5 border border-neutral-300 bg-neutral-900 px-4 py-2 font-mono text-[9px] font-bold text-stone-100 uppercase hover:bg-neutral-800 transition-all cursor-pointer self-start sm:self-center tracking-wider"
                    >
                      {isExpanded ? (
                        <>
                          <EyeOff size={11} /> {siteLabels?.scoresHideStandingsButton || "HIDE STANDINGS"}
                        </>
                      ) : (
                        <>
                          <Eye size={11} /> {siteLabels?.scoresViewStandingsButton || "VIEW STANDINGS"}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Expanded Leaderboard details */}
                  {isExpanded && (
                    <div className="border border-brand-ink overflow-hidden animate-slide-down bg-brand-neutral">
                      <div className="bg-[#18181b] text-stone-200 px-4 py-2.5 font-mono text-[8.5px] tracking-wider uppercase flex items-center gap-1.5 font-bold border-b border-stone-800">
                        <ClipboardList size={11} className="text-stone-450"/>
                        {siteLabels?.scoresDetailedLeaderboardTitle || "DETAILED COMPETITIVE LEADERBOARD"} ({score.playersCount} ATTESTED)
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans text-xs">
                          <thead>
                            <tr className="bg-brand-stone border-b border-brand-ink font-mono text-[8.5px] text-stone-400 uppercase tracking-wider font-semibold">
                              <th className="px-4 py-3">{siteLabels?.scoresTablePlayerHeader || "PLAYER NAME"}</th>
                              <th className="px-4 py-3 text-center">{siteLabels?.scoresTableScoreHeader || "STROKE SCORE"}</th>
                              <th className="px-4 py-3 text-right">{siteLabels?.scoresTablePositionHeader || "POSITION"}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                            {(score.scoresList || []).map((sl, index) => (
                              <tr key={index} className="hover:bg-brand-stone/50 transition-colors uppercase font-medium text-stone-750">
                                <td className="px-4 py-3 text-stone-800 flex items-center gap-2 font-bold">
                                  <Medal size={11} className={index === 0 ? "text-amber-500 shrink-0" : index === 1 ? "text-stone-400 shrink-0" : "text-stone-350 shrink-0"} />
                                  {language === "th" && sl.playerNameThai ? sl.playerNameThai : sl.playerName}
                                </td>
                                <td className="px-4 py-3 text-center font-mono font-bold text-neutral-900">
                                  {sl.score}
                                </td>
                                <td className="px-4 py-3 text-right font-mono font-bold text-neutral-900">
                                  {language === "th" && sl.positionThai ? sl.positionThai : sl.position}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="bg-brand-stone border-t border-brand-ink p-3 flex justify-between items-center text-[8.5px] font-mono text-stone-400 font-bold uppercase">
                        <span>{siteLabels?.scoresAttestationLabel || "CU UNOFFICIAL GOLF SCORECARD ATTESTATION"}</span>
                        <span>{siteLabels?.scoresVerifiedDirectoryLabel || "COACH VERIFIED DIRECTORY"}</span>
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
