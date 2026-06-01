  const renderSidebarContent = () => {
    switch (activeSectionId) {
      case "home_welcome":
        return (
          <div className="space-y-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#121212] flex items-center gap-2">
              <Layout size={16} className="text-[#da5f8e]" /> EDIT WELCOME HERO
            </h2>
            <div className="space-y-4">
              <ImageUploadWidget
                id="welcome_image"
                label="HERO BACKGROUND IMAGE"
                value={welcomeImageUrl}
                onChange={setWelcomeImageUrl}
                placeholder="https://images.unsplash.com/photo-..."
                helperText="A wide panoramic or landscape golf course photo works best."
              />
              <div className="space-y-1.5">
                <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">PRIMARY TITLE (THAI OR MAIN)</label>
                <input
                  type="text"
                  value={welcomeTitleThai}
                  onChange={(e) => setWelcomeTitleThai(e.target.value)}
                  className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none focus:border-[#ec4899] text-[#121212]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">SECONDARY TITLE (ENGLISH / SUB)</label>
                <input
                  type="text"
                  value={welcomeTitleEnglish}
                  onChange={(e) => setWelcomeTitleEnglish(e.target.value)}
                  className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none focus:border-[#ec4899] text-[#121212]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">WELCOME DESCRIPTION PARAGRAPH</label>
                <textarea
                  rows={5}
                  value={welcomeDescription}
                  onChange={(e) => setWelcomeDescription(e.target.value)}
                  className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none leading-relaxed text-[#121212]"
                />
              </div>
              <div className="pt-4 border-t border-[#121212]/10">
                <button
                  onClick={handleUpdateWelcomeSection}
                  className="w-full bg-[#121212] text-white hover:bg-[#ec4899] px-6 py-3 font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors shadow-lg cursor-pointer"
                >
                  <Save size={14} /> SAVE WELCOME SECTION
                </button>
              </div>
            </div>
          </div>
        );
      case "home_sponsors":
        return (
          <div className="space-y-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#121212] flex items-center gap-2">
              <Sparkles size={16} className="text-[#da5f8e]" /> EDIT HOME SPONSORS
            </h2>
            <div className="space-y-4">
               <div className="flex items-center gap-2 py-1">
                  <input
                    id="home_spon_show"
                    type="checkbox"
                    checked={homeSponShowSection}
                    onChange={(e) => setHomeSponShowSection(e.target.checked)}
                    className="h-4 w-4 text-[#ec4899] accent-[#ec4899]"
                  />
                  <label htmlFor="home_spon_show" className="font-mono text-[9px] font-bold text-[#121212]/75 uppercase">
                    SHOW THIS SECTION ON HOMEPAGE
                  </label>
                </div>
              <div className="space-y-1.5">
                <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">TITLE</label>
                <input
                  type="text"
                  value={homeSponTitle}
                  onChange={(e) => setHomeSponTitle(e.target.value)}
                  className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">SUBTITLE</label>
                <input
                  type="text"
                  value={homeSponSubtitle}
                  onChange={(e) => setHomeSponSubtitle(e.target.value)}
                  className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">DESCRIPTION</label>
                <textarea
                  rows={4}
                  value={homeSponDescription}
                  onChange={(e) => setHomeSponDescription(e.target.value)}
                  className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none leading-relaxed"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">MARQUEE RUNNING TEXT</label>
                <input
                  type="text"
                  value={homeSponMarqueeText}
                  onChange={(e) => setHomeSponMarqueeText(e.target.value)}
                  className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none font-mono"
                />
              </div>
              <ImageUploadWidget
                id="home_spon_image"
                label="FEATURED IMAGE"
                value={homeSponImageUrl}
                onChange={setHomeSponImageUrl}
                placeholder="https://images.unsplash.com/photo-..."
              />
              <div className="pt-4 border-t border-[#121212]/10">
                <button
                  onClick={handleUpdateHomeSponsorSection}
                  className="w-full bg-[#121212] text-white hover:bg-[#ec4899] px-6 py-3 font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors shadow-lg cursor-pointer"
                >
                  <Save size={14} /> SAVE SPONSOR SECTION
                </button>
              </div>
            </div>
          </div>
        );
      case "ca_hero":
      case "ca_philosophy":
      case "ca_captain":
      case "ca_competitions":
      case "ca_training":
      case "ca_legacy":
        return (
          <div className="space-y-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#121212] flex items-center gap-2">
              <Sparkles size={16} className="text-[#da5f8e]" /> EDIT CLUB ACTIVITIES
            </h2>
            <div className="bg-stone-50 border border-[#121212]/5 p-4 space-y-4">
              <h3 className="font-mono text-[10px] font-black text-[#121212] uppercase tracking-widest border-b border-[#121212]/10 pb-2">Visibility Toggles</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="show_philosophy" checked={caShowPhilosophy} onChange={(e) => setCaShowPhilosophy(e.target.checked)} className="h-3 w-3 accent-[#da5f8e]" />
                  <label htmlFor="show_philosophy" className="font-mono text-[8px] font-bold uppercase">Philosophy</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="show_captain" checked={caShowCaptainMandate} onChange={(e) => setCaShowCaptainMandate(e.target.checked)} className="h-3 w-3 accent-[#da5f8e]" />
                  <label htmlFor="show_captain" className="font-mono text-[8px] font-bold uppercase">Captain</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="show_competitions" checked={caShowCompetitions} onChange={(e) => setCaShowCompetitions(e.target.checked)} className="h-3 w-3 accent-[#da5f8e]" />
                  <label htmlFor="show_competitions" className="font-mono text-[8px] font-bold uppercase">Tournaments</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="show_training" checked={caShowTraining} onChange={(e) => setCaShowTraining(e.target.checked)} className="h-3 w-3 accent-[#da5f8e]" />
                  <label htmlFor="show_training" className="font-mono text-[8px] font-bold uppercase">Training</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="show_legacy" checked={caShowLegacy} onChange={(e) => setCaShowLegacy(e.target.checked)} className="h-3 w-3 accent-[#da5f8e]" />
                  <label htmlFor="show_legacy" className="font-mono text-[8px] font-bold uppercase">Legacy</label>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              {activeSectionId === "ca_hero" && (
                <ImageUploadWidget id="ca_hero_image" label="HERO BACKGROUND IMAGE" value={caHeroImageUrl} onChange={setCaHeroImageUrl} />
              )}
              {activeSectionId === "ca_philosophy" && (
                <>
                  <div className="space-y-1.5"><label className="font-mono text-[9px] font-bold uppercase">Title</label><input type="text" value={caPhilosophyTitle} onChange={(e) => setCaPhilosophyTitle(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none" /></div>
                  <div className="space-y-1.5"><label className="font-mono text-[9px] font-bold uppercase">Quote</label><textarea rows={3} value={caPhilosophyQuote} onChange={(e) => setCaPhilosophyQuote(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none italic" /></div>
                  <div className="space-y-1.5"><label className="font-mono text-[9px] font-bold uppercase">Description</label><textarea rows={6} value={caPhilosophyDescription} onChange={(e) => setCaPhilosophyDescription(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none" /></div>
                  <div className="space-y-1.5"><label className="font-mono text-[9px] font-bold uppercase">Technical Excellence</label><textarea rows={6} value={caTechnicalExcellenceDescription} onChange={(e) => setCaTechnicalExcellenceDescription(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none" /></div>
                </>
              )}
              {activeSectionId === "ca_captain" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="font-mono text-[9px] font-bold uppercase">Name</label><input type="text" value={caCaptainName} onChange={(e) => setCaCaptainName(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none" /></div>
                    <div className="space-y-1.5"><label className="font-mono text-[9px] font-bold uppercase">Role</label><input type="text" value={caCaptainRole} onChange={(e) => setCaCaptainRole(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none" /></div>
                  </div>
                  <ImageUploadWidget id="ca_captain_img" label="CAPTAIN IMAGE" value={caCaptainImageUrl} onChange={setCaCaptainImageUrl} />
                  <div className="space-y-1.5"><label className="font-mono text-[9px] font-bold uppercase">Philosophy</label><textarea rows={6} value={caCaptainPhilosophy} onChange={(e) => setCaCaptainPhilosophy(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none" /></div>
                </>
              )}
              {activeSectionId === "ca_competitions" && (
                <div className="space-y-4">
                  <button onClick={handleAddCompetition} className="bg-black text-white px-3 py-1.5 font-mono text-[9px] font-black uppercase flex items-center gap-1.5"><Plus size={10} /> ADD COMPETITION</button>
                  {caCompetitions.map((comp) => (
                    <div key={comp.id} className="border border-stone-200 p-3 space-y-3 bg-stone-50 relative">
                      <button onClick={() => handleDeleteCompetition(comp.id)} className="absolute top-2 right-2 text-red-500"><Trash2 size={12} /></button>
                      <input type="text" value={comp.title} onChange={(e) => handleUpdateCompetition(comp.id, { title: e.target.value })} className="w-full bg-white border border-[#121212]/10 p-1.5 text-[11px] focus:outline-none font-bold" />
                      <input type="text" value={comp.difficulty} onChange={(e) => handleUpdateCompetition(comp.id, { difficulty: e.target.value })} className="w-full bg-white border border-[#121212]/10 p-1.5 text-[11px] focus:outline-none font-mono" />
                      <textarea rows={2} value={comp.description} onChange={(e) => handleUpdateCompetition(comp.id, { description: e.target.value })} className="w-full bg-white border border-[#121212]/10 p-1.5 text-[11px] focus:outline-none" />
                    </div>
                  ))}
                </div>
              )}
              {activeSectionId === "ca_training" && (
                <div className="space-y-1.5"><label className="font-mono text-[9px] font-bold uppercase">Training Description</label><textarea rows={6} value={caTrainingDescription} onChange={(e) => setCaTrainingDescription(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none" /></div>
              )}
              {activeSectionId === "ca_legacy" && (
                <>
                  <div className="space-y-1.5"><label className="font-mono text-[9px] font-bold uppercase">Legacy Description</label><textarea rows={4} value={caLegacyDescription} onChange={(e) => setCaLegacyDescription(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="font-mono text-[9px] font-bold uppercase">Founded Year</label><input type="text" value={caFoundedYear} onChange={(e) => setCaFoundedYear(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none font-mono" /></div>
                    <div className="space-y-1.5"><label className="font-mono text-[9px] font-bold uppercase">Active Years</label><input type="text" value={caActiveYears} onChange={(e) => setCaActiveYears(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none font-mono" /></div>
                  </div>
                </>
              )}
            </div>
            <div className="pt-4 border-t border-[#121212]/10">
              <button onClick={handleUpdateClubActivity} className="w-full bg-[#121212] text-white hover:bg-[#ec4899] px-6 py-3 font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors shadow-lg cursor-pointer">
                <Save size={14} /> SAVE CHANGES
              </button>
            </div>
          </div>
        );
      case "news_list":
        return (
          <div className="space-y-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#121212] flex items-center gap-2">
              <FileText size={16} className="text-[#da5f8e]" /> ACTIVITIES & STORIES
            </h2>
            <div className="max-h-[70vh] overflow-y-auto space-y-4 pr-2">
              <button 
                onClick={() => { setEditingNewsId(null); setNewsTitle(""); setNewsExcerpt(""); setNewsContent(""); setNewsImage(""); setNewsDate(""); setNewsRank(0); setNewsIsVisible(true); setActiveSectionId("news_edit"); }}
                className="w-full bg-black text-white py-3 font-mono text-[10px] font-bold uppercase flex items-center justify-center gap-2 hover:bg-[#da5f8e]"
              >
                <Plus size={14} /> CREATE NEW STORY
              </button>
              {(dbState.news || []).map((item) => (
                <div key={item.id} className="border border-stone-200 p-4 bg-white hover:border-[#da5f8e] transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[9px] text-stone-400">{item.publishDate}</span>
                    {item.isVisible === false && <span className="text-red-500 font-mono text-[9px] font-bold">HIDDEN</span>}
                  </div>
                  <h4 className="font-display text-xs font-bold uppercase line-clamp-1">{item.title}</h4>
                  <div className="flex gap-2 mt-4">
                    <button onClick={(e) => { e.stopPropagation(); handleEditNewsTrigger(item); setActiveSectionId("news_edit"); }} className="flex-1 bg-stone-100 py-1.5 font-mono text-[9px] font-bold uppercase hover:bg-stone-200 flex justify-center items-center gap-1"><Edit size={10} /> Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteNewsCall(item.id); }} className="flex-1 bg-red-50 text-red-600 py-1.5 font-mono text-[9px] font-bold uppercase hover:bg-red-100 flex justify-center items-center gap-1"><Trash2 size={10} /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "news_edit":
        return (
          <div className="space-y-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#121212] flex items-center gap-2">
              {editingNewsId ? "EDIT STORY" : "NEW STORY"}
            </h2>
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
              <div className="space-y-1.5"><label className="font-mono text-[9px] font-bold uppercase">Title</label><input type="text" value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs" /></div>
              <div className="space-y-1.5"><label className="font-mono text-[9px] font-bold uppercase">Excerpt</label><textarea rows={3} value={newsExcerpt} onChange={(e) => setNewsExcerpt(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="font-mono text-[9px] font-bold uppercase">Date (YYYY-MM-DD)</label><input type="text" value={newsDate} onChange={(e) => setNewsDate(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs font-mono" /></div>
                <div className="space-y-1.5"><label className="font-mono text-[9px] font-bold uppercase">Rank (Higher = First)</label><input type="number" value={newsRank} onChange={(e) => setNewsRank(parseInt(e.target.value) || 0)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs font-mono" /></div>
              </div>
              <ImageUploadWidget id="news_img" label="COVER IMAGE" value={newsImage} onChange={setNewsImage} />
              <div className="space-y-1.5">
                <label className="font-mono text-[9px] font-bold uppercase">Content (Markdown)</label>
                <textarea rows={10} value={newsContent} onChange={(e) => setNewsContent(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs font-mono leading-relaxed" />
              </div>
              <div className="flex items-center gap-2 py-2">
                <input type="checkbox" id="news_vis" checked={newsIsVisible} onChange={(e) => setNewsIsVisible(e.target.checked)} className="h-4 w-4 accent-[#ec4899]" />
                <label htmlFor="news_vis" className="font-mono text-[9px] font-bold uppercase">PUBLICLY VISIBLE</label>
              </div>
            </div>
            <div className="flex gap-4 pt-4 border-t border-[#121212]/10">
              <button onClick={() => setActiveSectionId("news_list")} className="flex-1 bg-stone-100 py-3 font-mono text-[10px] font-bold uppercase hover:bg-stone-200">CANCEL</button>
              <button onClick={() => { handleSaveNews(); setActiveSectionId("news_list"); }} className="flex-1 bg-black text-white py-3 font-mono text-[10px] font-bold uppercase hover:bg-[#ec4899] flex justify-center items-center gap-1.5"><Save size={12} /> SAVE</button>
            </div>
          </div>
        );
      case "roster_list":
        return (
          <div className="space-y-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#121212] flex items-center gap-2">
              <Users size={16} className="text-[#da5f8e]" /> VARSITY ROSTER
            </h2>
            <div className="max-h-[70vh] overflow-y-auto space-y-4 pr-2">
              <button 
                onClick={() => { setEditingPlayerId(null); setPlayerName(""); setPlayerHandicap(1.5); setPlayerYear("Freshman"); setPlayerFaculty(""); setPlayerImage(""); setPlayerIsFeatured(false); setPlayerIsVisible(true); setActiveSectionId("roster_edit"); }}
                className="w-full bg-black text-white py-3 font-mono text-[10px] font-bold uppercase flex items-center justify-center gap-2 hover:bg-[#da5f8e]"
              >
                <Plus size={14} /> ADD PLAYER
              </button>
              {(dbState.roster || []).map((player) => (
                <div key={player.id} className="border border-stone-200 p-4 bg-white hover:border-[#da5f8e] transition-colors cursor-pointer flex items-center gap-4 group">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-stone-100 shrink-0"><img src={player.imageUrl} className="w-full h-full object-cover" alt={player.name} /></div>
                  <div className="flex-grow">
                    <h4 className="font-display text-xs font-bold uppercase">{player.name} {player.isVisible === false && <span className="text-red-500 font-mono">(HIDDEN)</span>}</h4>
                    <p className="font-mono text-[9px] text-stone-500">{player.year} • HDCP {player.handicap}</p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); handleEditPlayerTrigger(player); setActiveSectionId("roster_edit"); }} className="p-1.5 bg-stone-100 hover:bg-stone-200"><Edit size={10} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeletePlayerCall(player.id); }} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100"><Trash2 size={10} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "roster_edit":
        return (
          <div className="space-y-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#121212] flex items-center gap-2">
              {editingPlayerId ? "EDIT PLAYER" : "NEW PLAYER"}
            </h2>
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
              <div className="space-y-1.5"><label className="font-mono text-[9px] font-bold uppercase">Name</label><input type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="font-mono text-[9px] font-bold uppercase">Handicap</label><input type="number" step="0.1" value={playerHandicap} onChange={(e) => setPlayerHandicap(parseFloat(e.target.value) || 0)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs font-mono" /></div>
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] font-bold uppercase">Year</label>
                  <select value={playerYear} onChange={(e) => setPlayerYear(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs">
                    <option value="Freshman">Freshman</option><option value="Sophomore">Sophomore</option><option value="Junior">Junior</option><option value="Senior">Senior</option><option value="Alumni">Alumni</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5"><label className="font-mono text-[9px] font-bold uppercase">Faculty</label><input type="text" value={playerFaculty} onChange={(e) => setPlayerFaculty(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs" /></div>
              <ImageUploadWidget id="player_img" label="HEADSHOT IMAGE" value={playerImage} onChange={setPlayerImage} />
              <div className="flex items-center gap-4 py-2">
                <div className="flex items-center gap-2"><input type="checkbox" id="p_feat" checked={playerIsFeatured} onChange={(e) => setPlayerIsFeatured(e.target.checked)} className="h-4 w-4 accent-[#ec4899]" /><label htmlFor="p_feat" className="font-mono text-[9px] font-bold uppercase">FEATURED (LEAD)</label></div>
                <div className="flex items-center gap-2"><input type="checkbox" id="p_vis" checked={playerIsVisible} onChange={(e) => setPlayerIsVisible(e.target.checked)} className="h-4 w-4 accent-[#ec4899]" /><label htmlFor="p_vis" className="font-mono text-[9px] font-bold uppercase">VISIBLE</label></div>
              </div>
            </div>
            <div className="flex gap-4 pt-4 border-t border-[#121212]/10">
              <button onClick={() => setActiveSectionId("roster_list")} className="flex-1 bg-stone-100 py-3 font-mono text-[10px] font-bold uppercase hover:bg-stone-200">CANCEL</button>
              <button onClick={() => { handleSavePlayer(); setActiveSectionId("roster_list"); }} className="flex-1 bg-black text-white py-3 font-mono text-[10px] font-bold uppercase hover:bg-[#ec4899] flex justify-center items-center gap-1.5"><Save size={12} /> SAVE</button>
            </div>
          </div>
        );
      case "staff_list":
        return (
          <div className="space-y-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#121212] flex items-center gap-2">
              <Users size={16} className="text-[#da5f8e]" /> STAFF & BOARD
            </h2>
            <div className="max-h-[70vh] overflow-y-auto space-y-4 pr-2">
              <button 
                onClick={() => { setEditingStaffId(null); setStaffName(""); setStaffRole(""); setStaffFaculty(""); setStaffImage(""); setStaffOrder(1); setStaffIsVisible(true); setActiveSectionId("staff_edit"); }}
                className="w-full bg-black text-white py-3 font-mono text-[10px] font-bold uppercase flex items-center justify-center gap-2 hover:bg-[#da5f8e]"
              >
                <Plus size={14} /> ADD STAFF MEMBER
              </button>
              {(dbState.staff || []).sort((a,b) => a.order - b.order).map((person) => (
                <div key={person.id} className="border border-stone-200 p-4 bg-white hover:border-[#da5f8e] transition-colors cursor-pointer flex items-center gap-4 group">
                  <div className="h-10 w-10 bg-stone-100 shrink-0"><img src={person.imageUrl} className="w-full h-full object-cover" alt={person.name} /></div>
                  <div className="flex-grow">
                    <h4 className="font-display text-xs font-bold uppercase">{person.name} {person.isVisible === false && <span className="text-red-500 font-mono">(HIDDEN)</span>}</h4>
                    <p className="font-mono text-[9px] text-stone-500">{person.role} • {person.year}</p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); handleEditStaffTrigger(person); setActiveSectionId("staff_edit"); }} className="p-1.5 bg-stone-100 hover:bg-stone-200"><Edit size={10} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteStaffCall(person.id); }} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100"><Trash2 size={10} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "staff_edit":
        return (
          <div className="space-y-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#121212] flex items-center gap-2">
              {editingStaffId ? "EDIT STAFF" : "NEW STAFF"}
            </h2>
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
              <div className="space-y-1.5"><label className="font-mono text-[9px] font-bold uppercase">Name</label><input type="text" value={staffName} onChange={(e) => setStaffName(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs" /></div>
              <div className="space-y-1.5"><label className="font-mono text-[9px] font-bold uppercase">Role (Title)</label><input type="text" value={staffRole} onChange={(e) => setStaffRole(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="font-mono text-[9px] font-bold uppercase">Year / Faculty</label><input type="text" value={staffFaculty} onChange={(e) => setStaffFaculty(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs" /></div>
                <div className="space-y-1.5"><label className="font-mono text-[9px] font-bold uppercase">Order (1=First)</label><input type="number" value={staffOrder} onChange={(e) => setStaffOrder(parseInt(e.target.value) || 1)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs font-mono" /></div>
              </div>
              <ImageUploadWidget id="staff_img" label="HEADSHOT IMAGE" value={staffImage} onChange={setStaffImage} />
              <div className="flex items-center gap-2 py-2">
                <input type="checkbox" id="s_vis" checked={staffIsVisible} onChange={(e) => setStaffIsVisible(e.target.checked)} className="h-4 w-4 accent-[#ec4899]" />
                <label htmlFor="s_vis" className="font-mono text-[9px] font-bold uppercase">VISIBLE</label>
              </div>
            </div>
            <div className="flex gap-4 pt-4 border-t border-[#121212]/10">
              <button onClick={() => setActiveSectionId("staff_list")} className="flex-1 bg-stone-100 py-3 font-mono text-[10px] font-bold uppercase hover:bg-stone-200">CANCEL</button>
              <button onClick={() => { handleSaveStaff(); setActiveSectionId("staff_list"); }} className="flex-1 bg-black text-white py-3 font-mono text-[10px] font-bold uppercase hover:bg-[#ec4899] flex justify-center items-center gap-1.5"><Save size={12} /> SAVE</button>
            </div>
          </div>
        );
      case "scores_list":
        return (
          <div className="space-y-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#121212] flex items-center gap-2">
              <Trophy size={16} className="text-[#da5f8e]" /> SCORES & STATS
            </h2>
            <div className="max-h-[70vh] overflow-y-auto space-y-4 pr-2">
              <button 
                onClick={() => { setEditingScoreId(null); setScoreTournamentName(""); setScoreDate(""); setScoreResult(""); setScoreList([{ playerName: "", score: 72, position: "" }]); setScoreIsVisible(true); setActiveSectionId("scores_edit"); }}
                className="w-full bg-black text-white py-3 font-mono text-[10px] font-bold uppercase flex items-center justify-center gap-2 hover:bg-[#da5f8e]"
              >
                <Plus size={14} /> LOG NEW TOURNAMENT
              </button>
              {(dbState.scores || []).map((score) => (
                <div key={score.id} className="border border-stone-200 p-4 bg-white hover:border-[#da5f8e] transition-colors cursor-pointer group space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] text-stone-400">{score.date}</span>
                    {score.isVisible === false && <span className="text-red-500 font-mono text-[9px] font-bold">HIDDEN</span>}
                  </div>
                  <h4 className="font-display text-xs font-bold uppercase text-[#121212] leading-tight">{score.tournamentName}</h4>
                  <p className="font-mono text-[9px] text-[#da5f8e] font-bold">{score.result}</p>
                  <div className="flex gap-2 mt-2 pt-2 border-t border-stone-100">
                    <button onClick={(e) => { e.stopPropagation(); handleEditScoreTrigger(score); setActiveSectionId("scores_edit"); }} className="flex-1 bg-stone-100 py-1.5 font-mono text-[9px] font-bold uppercase hover:bg-stone-200 flex justify-center items-center gap-1"><Edit size={10} /> Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteScoreCall(score.id); }} className="flex-1 bg-red-50 text-red-600 py-1.5 font-mono text-[9px] font-bold uppercase hover:bg-red-100 flex justify-center items-center gap-1"><Trash2 size={10} /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "scores_edit":
        return (
          <div className="space-y-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#121212] flex items-center gap-2">
              {editingScoreId ? "EDIT TOURNAMENT" : "NEW TOURNAMENT"}
            </h2>
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
              <div className="space-y-1.5"><label className="font-mono text-[9px] font-bold uppercase">Tournament Name</label><input type="text" value={scoreTournamentName} onChange={(e) => setScoreTournamentName(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="font-mono text-[9px] font-bold uppercase">Date (YYYY-MM-DD)</label><input type="text" value={scoreDate} onChange={(e) => setScoreDate(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs font-mono" /></div>
                <div className="space-y-1.5"><label className="font-mono text-[9px] font-bold uppercase">Overall Result</label><input type="text" value={scoreResult} onChange={(e) => setScoreResult(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs" /></div>
              </div>
              <div className="flex items-center gap-2 py-1">
                <input type="checkbox" id="score_vis" checked={scoreIsVisible} onChange={(e) => setScoreIsVisible(e.target.checked)} className="h-4 w-4 accent-[#ec4899]" />
                <label htmlFor="score_vis" className="font-mono text-[9px] font-bold uppercase">VISIBLE</label>
              </div>
              
              <div className="border border-stone-200 p-3 bg-stone-50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[9px] font-bold uppercase">Player Scores</span>
                  <button onClick={handleAddPlayerScoreRow} className="bg-black text-white px-2 py-1 font-mono text-[8px] flex items-center gap-1"><Plus size={10}/> ADD ROW</button>
                </div>
                {scoreList.map((row, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-white p-2 border border-stone-100">
                    <input type="text" value={row.playerName} placeholder="Player Name" onChange={(e) => handleUpdatePlayerScoreRow(idx, "playerName", e.target.value)} className="flex-[2] bg-transparent text-xs p-1 focus:outline-none border-b border-stone-200" />
                    <input type="number" value={row.score} placeholder="Score" onChange={(e) => handleUpdatePlayerScoreRow(idx, "score", parseInt(e.target.value)||72)} className="flex-1 bg-transparent text-xs p-1 font-mono text-center focus:outline-none border-b border-stone-200" />
                    <input type="text" value={row.position} placeholder="Pos (e.g. 1st)" onChange={(e) => handleUpdatePlayerScoreRow(idx, "position", e.target.value)} className="flex-1 bg-transparent text-xs p-1 text-center text-[#da5f8e] font-bold focus:outline-none border-b border-stone-200" />
                    <button onClick={() => handleRemovePlayerScoreRow(idx)} className="text-red-500 p-1"><X size={12}/></button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-4 pt-4 border-t border-[#121212]/10">
              <button onClick={() => setActiveSectionId("scores_list")} className="flex-1 bg-stone-100 py-3 font-mono text-[10px] font-bold uppercase hover:bg-stone-200">CANCEL</button>
              <button onClick={() => { handleSaveTournament(); setActiveSectionId("scores_list"); }} className="flex-1 bg-black text-white py-3 font-mono text-[10px] font-bold uppercase hover:bg-[#ec4899] flex justify-center items-center gap-1.5"><Save size={12} /> SAVE</button>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 text-stone-400 space-y-4 text-center">
            <Layout size={32} className="opacity-20" />
            <p className="font-mono text-[10px] font-bold tracking-widest uppercase">Select a highlighted section in the live preview on the left to edit its content.</p>
          </div>
        );
    }
  };
