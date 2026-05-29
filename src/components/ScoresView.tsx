import { TournamentScore, SiteLabels } from "../types";
import { useState } from "react";
import { Award, Calendar, Users, Eye, EyeOff, ClipboardList, Target, Medal } from "lucide-react";

interface ScoresViewProps {
  scores: TournamentScore[];
  siteLabels?: SiteLabels;
}

export default function ScoresView({ scores, siteLabels }: ScoresViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(scores[0]?.id || null);

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  return (
    <div id="scores_view" className="space-y-12 animate-fade-in px-4 md:px-0 bg-stone-50/20">
      
      {/* Editorial Header */}
      <section className="mx-auto max-w-7xl pt-6 text-center md:text-left space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-stone-250/70 pb-4 gap-4">
          <div className="space-y-2">
            <span className="inline-block bg-neutral-900 text-stone-100 font-mono text-[8.5px] px-2.5 py-1 tracking-widest uppercase font-bold rounded-xs">
              {siteLabels?.scoresSubtitle || "UNOFFICIAL LEADERS RECORD"}
            </span>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-neutral-950 uppercase leading-none">
              {siteLabels?.scoresTitle || "TOURNAMENT RESULTS & STATS"}
            </h1>
          </div>
          <span className="font-mono text-[9.5px] font-bold text-stone-400 tracking-wider uppercase">
            {siteLabels?.scoresVerifiedLabel || "VARSITY LEAGUE ARCHIVES • AMATA SPRING & ALPINE LOGS VERIFIED"}
          </span>
        </div>
      </section>

      {/* Main Stats Summary & Interactive List */}
      <section className="mx-auto max-w-7xl font-sans">
        
        {/* Interactive Match Score list */}
        <div className="space-y-6">
          <div className="border border-stone-200 bg-white divide-y divide-stone-150 rounded-lg overflow-hidden shadow-xs">
            {(scores || []).filter(s => s.isVisible !== false).map((score) => {
              const isExpanded = expandedId === score.id;

              return (
                <div key={score.id} className="p-6 md:p-8 space-y-6 bg-white hover:bg-stone-50/50 transition-colors duration-300">
                  
                  {/* Basic Card Overview */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[9px] text-stone-400 flex items-center gap-1 font-bold uppercase tracking-wider">
                          <Calendar size={11} className="text-stone-300" />
                          {score.date}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-stone-300 hidden sm:inline" />
                        <span className="font-mono text-[8.5px] text-emerald-700 font-bold tracking-wider uppercase bg-emerald-50 px-2 py-0.5 border border-emerald-500/10 rounded-xs">
                          {siteLabels?.scoresOfficialStatsBadge || "UNOFFICIAL STATS"}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-neutral-950 uppercase tracking-tight leading-none">
                        {score.tournamentName}
                      </h3>
                      <p className="text-xs text-stone-600 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Award size={13} className="text-stone-500" />
                        {score.result}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleExpand(score.id)}
                      className="inline-flex items-center gap-1.5 border border-neutral-300 bg-neutral-900 px-4 py-2 font-mono text-[9px] font-bold text-stone-100 uppercase hover:bg-neutral-800 transition-all cursor-pointer self-start sm:self-center tracking-wider rounded-sm shadow-3xs"
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
                    <div className="border border-stone-200 rounded-lg overflow-hidden animate-slide-down bg-white shadow-2xs">
                      <div className="bg-[#18181b] text-stone-200 px-4 py-2.5 font-mono text-[8.5px] tracking-wider uppercase flex items-center gap-1.5 font-bold border-b border-stone-800">
                        <ClipboardList size={11} className="text-stone-450" />
                        {siteLabels?.scoresDetailedLeaderboardTitle || "DETAILED COMPETITIVE LEADERBOARD"} ({score.playersCount} ATTESTED)
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans text-xs">
                          <thead>
                            <tr className="bg-stone-50 border-b border-stone-200 font-mono text-[8.5px] text-stone-400 uppercase tracking-wider font-semibold">
                              <th className="px-4 py-3">{siteLabels?.scoresTablePlayerHeader || "PLAYER NAME"}</th>
                              <th className="px-4 py-3 text-center">{siteLabels?.scoresTableScoreHeader || "STROKE SCORE"}</th>
                              <th className="px-4 py-3 text-right">{siteLabels?.scoresTablePositionHeader || "POSITION"}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                            {(score.scoresList || []).map((sl, index) => (
                              <tr key={index} className="hover:bg-stone-50/50 transition-colors uppercase font-medium text-stone-750">
                                <td className="px-4 py-3 text-stone-800 flex items-center gap-2 font-bold">
                                  <Medal size={11} className={index === 0 ? "text-amber-500 shrink-0" : index === 1 ? "text-stone-400 shrink-0" : "text-stone-350 shrink-0"} />
                                  {sl.playerName}
                                </td>
                                <td className="px-4 py-3 text-center font-mono font-bold text-neutral-900">
                                  {sl.score}
                                </td>
                                <td className="px-4 py-3 text-right font-mono font-bold text-neutral-900">
                                  {sl.position}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="bg-stone-50 border-t border-stone-150 p-3 flex justify-between items-center text-[8.5px] font-mono text-stone-400 font-bold uppercase">
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
