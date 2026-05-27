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
    <div id="scores_view" className="space-y-16 animate-fade-in px-4 md:px-0 bg-white">
      
      {/* Editorial Header */}
      <section className="mx-auto max-w-7xl pt-10 text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-neutral-950 pb-6 gap-6">
          <div className="space-y-2">
            <span className="inline-block bg-[#da5f8e] text-white font-mono text-[10px] px-3 py-1 tracking-[0.3em] uppercase font-black">
              {siteLabels?.scoresSubtitle || "OFFICIAL LEADERS RECORD"}
            </span>
            <h1 className="font-thai text-5xl md:text-6xl font-bold tracking-tight text-neutral-950 leading-none">
              {siteLabels?.scoresTitle || "TOURNAMENT RESULTS & STATS"}
            </h1>
          </div>
          <span className="font-mono text-[10px] font-black text-neutral-400 tracking-[0.2em] uppercase">
            {siteLabels?.scoresVerifiedLabel || "VARSITY LEAGUE ARCHIVES • AMATA SPRING & ALPINE LOGS VERIFIED"}
          </span>
        </div>
      </section>

      {/* Main Stats Summary & Interactive List */}
      <section className="mx-auto max-w-7xl">
        
        {/* Interactive Match Score list */}
        <div className="space-y-8">
          <div className="border border-neutral-950 bg-white divide-y divide-neutral-950/10 overflow-hidden">
            {scores.map((score) => {
              const isExpanded = expandedId === score.id;

              return (
                <div key={score.id} className="p-8 md:p-12 space-y-8 bg-white hover:bg-neutral-50/50 transition-all duration-300 group">
                  
                  {/* Basic Card Overview */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="font-mono text-[10px] text-neutral-400 flex items-center gap-2 font-black uppercase tracking-[0.2em]">
                          <Calendar size={14} className="text-[#da5f8e]" />
                          {score.date}
                        </span>
                        <span className="font-mono text-[10px] text-white font-black tracking-[0.2em] uppercase bg-neutral-950 px-3 py-1">
                          {siteLabels?.scoresOfficialStatsBadge || "OFFICIAL STATS"}
                        </span>
                      </div>
                      <h3 className="font-thai text-3xl md:text-4xl font-bold text-neutral-950 leading-none group-hover:text-[#da5f8e] transition-colors">
                        {score.tournamentName}
                      </h3>
                      <p className="text-sm text-neutral-600 font-serif italic flex items-center gap-3 border-l-2 border-neutral-950/10 pl-4 py-1">
                        <Award size={16} className="text-[#da5f8e]" />
                        {score.result}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleExpand(score.id)}
                      className="inline-flex items-center gap-3 border-2 border-neutral-950 bg-white px-6 py-4 font-mono text-[10px] font-black text-neutral-950 uppercase hover:bg-neutral-950 hover:text-white transition-all cursor-pointer tracking-[0.2em] shadow-[4px_4px_0px_0px_#000000] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                    >
                      {isExpanded ? (
                        <>
                          <EyeOff size={14} /> {siteLabels?.scoresHideStandingsButton || "HIDE STANDINGS"}
                        </>
                      ) : (
                        <>
                          <Eye size={14} /> {siteLabels?.scoresViewStandingsButton || "VIEW STANDINGS"}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Expanded Leaderboard details */}
                  {isExpanded && (
                    <div className="border border-neutral-950 overflow-hidden animate-fade-in bg-white">
                      <div className="bg-neutral-950 text-white px-6 py-4 font-mono text-[10px] tracking-[0.3em] uppercase flex items-center gap-3 font-black">
                        <ClipboardList size={14} className="text-[#da5f8e]" />
                        {siteLabels?.scoresDetailedLeaderboardTitle || "DETAILED COMPETITIVE LEADERBOARD"} ({score.playersCount} ATTESTED)
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-serif">
                          <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-950 font-mono text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-black">
                              <th className="px-6 py-4">{siteLabels?.scoresTablePlayerHeader || "PLAYER NAME"}</th>
                              <th className="px-6 py-4 text-center">{siteLabels?.scoresTableScoreHeader || "STROKE SCORE"}</th>
                              <th className="px-6 py-4 text-right">{siteLabels?.scoresTablePositionHeader || "POSITION"}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-950/5">
                            {score.scoresList.map((sl, index) => (
                              <tr key={index} className="hover:bg-neutral-50 transition-colors uppercase">
                                <td className="px-6 py-5 text-neutral-950 flex items-center gap-4 font-bold text-lg md:text-xl font-thai">
                                  <Medal size={16} className={index === 0 ? "text-amber-500 shrink-0" : index === 1 ? "text-neutral-400 shrink-0" : "text-neutral-200 shrink-0"} />
                                  {sl.playerName}
                                </td>
                                <td className="px-6 py-5 text-center font-mono font-black text-xl text-[#da5f8e]">
                                  {sl.score}
                                </td>
                                <td className="px-6 py-5 text-right font-mono font-black text-neutral-400 text-sm">
                                  {sl.position}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="bg-neutral-50 border-t border-neutral-950 p-4 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-mono text-neutral-400 font-black uppercase tracking-[0.2em]">
                        <span>{siteLabels?.scoresAttestationLabel || "CU OFFICIAL GOLF SCORECARD ATTESTATION"}</span>
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
