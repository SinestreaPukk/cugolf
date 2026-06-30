import React, { useState } from "react";
import { registerMember, loginMember } from "../utils/api";
import { Member, SiteSettings } from "../types";
import { useLanguage } from "../utils/LanguageContext";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, CheckCircle2 } from "lucide-react";

interface MemberAuthViewProps {
  memberUser: any;
  setMemberUser: (user: any) => void;
  memberToken: string | null;
  setMemberToken: (token: string | null) => void;
  siteSettings?: SiteSettings;
  adminToken: string | null;
  setAdminToken: (token: string | null) => void;
}

export default function MemberAuthView({
  memberUser,
  setMemberUser,
  memberToken,
  setMemberToken,
  siteSettings,
  adminToken,
  setAdminToken
}: MemberAuthViewProps) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Login fields
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");

  // Register fields
  const [regEmail, setRegEmail] = useState("");
  const [regStudentId, setRegStudentId] = useState("");
  const [prefix, setPrefix] = useState("นาย");
  const [name, setName] = useState("");
  const [faculty, setFaculty] = useState("");
  const [year, setYear] = useState("Year 1");
  const [instagram, setInstagram] = useState("");
  const [lineId, setLineId] = useState("");

  const clearErrors = () => { setErrorMsg(""); setSuccessMsg(""); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !studentId) {
      setErrorMsg(language === "th" ? "กรุณากรอกอีเมลและรหัสนิสิต" : "Please enter your email and student ID.");
      return;
    }
    setLoading(true);
    clearErrors();
    try {
      const data = await loginMember({ email, studentId });
      if (data.success && data.token) {
        setMemberToken(data.token);
        setMemberUser(data.user);
        setSuccessMsg(language === "th" ? "เข้าสู่ระบบสำเร็จแล้ว!" : "Successfully logged in!");
        setTimeout(() => navigate("/"), 1000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || (language === "th" ? "อีเมลหรือรหัสนิสิตไม่ถูกต้อง" : "Invalid email or student ID."));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    if (!regEmail || !regStudentId || !name) {
      setErrorMsg(language === "th" ? "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" : "Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await registerMember({
        email: regEmail,
        prefix,
        name,
        studentId: regStudentId,
        faculty: faculty || undefined,
        year: year || undefined,
        instagram: instagram || undefined,
        lineId: lineId || undefined
      });
      if (res.success) {
        setSuccessMsg(language === "th" ? "ลงทะเบียนสำเร็จแล้ว! กำลังเข้าสู่ระบบ..." : "Registration successful! Logging in...");
        const loginData = await loginMember({ email: regEmail, studentId: regStudentId });
        if (loginData.success && loginData.token) {
          setMemberToken(loginData.token);
          setMemberUser(loginData.user);
          setTimeout(() => navigate("/"), 1000);
        } else {
          setActiveTab("login");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || (language === "th" ? "การลงทะเบียนล้มเหลว กรุณาลองอีกครั้ง" : "Registration failed."));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setMemberToken(null);
    setMemberUser(null);
    navigate("/");
  };

  if (memberUser) {
    const profile = memberUser.profile || {};
    return (
      <div className="mx-auto max-w-md py-8 animate-fade-in text-brand-ink">
        <div className="bg-brand-neutral border border-brand-ink p-6 space-y-6 shadow-[4px_4px_0px_rgba(18,18,18,1)]">
          <div className="border-b border-brand-ink/10 pb-4 text-center space-y-1">
            <h3 className="font-display text-base font-bold uppercase tracking-wider text-brand-ink">
              {language === "th" ? "พอร์ทัลสมาชิก" : "MEMBER PORTAL"}
            </h3>
            <p className="text-[9px] text-neutral-400 font-mono tracking-widest uppercase">
              ID: CUGC-{memberUser.id?.substring(0, 8).toUpperCase()}
            </p>
          </div>

          <div className="space-y-3 font-sans text-xs">
            {profile.prefix && (
              <div className="flex justify-between border-b border-brand-ink/10 pb-2">
                <span className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider">{language === "th" ? "คำนำหน้า" : "PREFIX"}</span>
                <span className="font-bold text-brand-ink">{profile.prefix}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-brand-ink/10 pb-2">
              <span className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider">{language === "th" ? "ชื่อ-นามสกุล" : "NAME"}</span>
              <span className="font-bold text-brand-ink uppercase">{memberUser.name}</span>
            </div>
            <div className="flex justify-between border-b border-brand-ink/10 pb-2">
              <span className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider">{language === "th" ? "อีเมล" : "EMAIL"}</span>
              <span className="font-bold text-brand-ink">{memberUser.email}</span>
            </div>
            <div className="flex justify-between border-b border-brand-ink/10 pb-2">
              <span className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider">{language === "th" ? "รหัสนิสิต" : "STUDENT ID"}</span>
              <span className="font-bold text-brand-ink">{profile.studentId || "—"}</span>
            </div>
            <div className="flex justify-between border-b border-brand-ink/10 pb-2">
              <span className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider">{language === "th" ? "ชั้นปี" : "YEAR"}</span>
              <span className="font-bold text-brand-ink uppercase">
                {profile.year ? (language === "th" ? profile.year.replace("Year", "ชั้นปีที่") : profile.year) : "—"}
              </span>
            </div>
            <div className="flex justify-between border-b border-brand-ink/10 pb-2">
              <span className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider">{language === "th" ? "คณะ" : "FACULTY"}</span>
              <span className="font-bold text-brand-ink uppercase">{profile.faculty || "—"}</span>
            </div>
            {profile.instagram && (
              <div className="flex justify-between border-b border-brand-ink/10 pb-2">
                <span className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Instagram</span>
                <span className="font-bold text-brand-ink">{profile.instagram}</span>
              </div>
            )}
            {profile.lineId && (
              <div className="flex justify-between border-b border-brand-ink/10 pb-2">
                <span className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Line ID</span>
                <span className="font-bold text-brand-ink">{profile.lineId}</span>
              </div>
            )}
          </div>

          {memberUser.isAdmin && (
            <div className="space-y-3 pt-2 border-t border-brand-ink/10">
              <span className="font-mono text-[9px] font-bold text-brand-pink tracking-[0.2em] uppercase block">
                {language === "th" ? "สิทธิ์ผู้ดูแลระบบ (ADMIN)" : "ADMINISTRATOR PRIVILEGES"}
              </span>
              {!adminToken ? (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setAdminToken(memberToken);
                      localStorage.setItem("cu-golf-club-admin-token", memberToken || "");
                    }}
                    className="w-full inline-flex justify-center items-center bg-brand-pink hover:bg-brand-ink text-brand-neutral hover:text-brand-neutral py-2.5 border border-brand-ink text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    ⚡ {language === "th" ? "เปิดโหมดแก้ไขข้อมูล" : "ACTIVATE EDITING MODE"}
                  </button>
                  <p className="text-[9.5px] text-stone-500 font-sans leading-normal">
                    {language === "th"
                      ? "การเปิดโหมดแก้ไขจะแสดงแถบ CMS และปุ่มแก้ไขบนหน้าเว็บต่างๆ เพื่อให้คุณแก้ไขข้อมูลได้ทันที"
                      : "Activating editing mode displays the CMS active bar and edit actions on public pages to let you modify website content."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <button
                    onClick={() => {
                      setAdminToken(null);
                      localStorage.removeItem("cu-golf-club-admin-token");
                    }}
                    className="w-full inline-flex justify-center items-center bg-brand-neutral hover:bg-stone-100 text-brand-ink py-2.5 border-2 border-brand-ink text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    ❌ {language === "th" ? "ปิดโหมดแก้ไขข้อมูล" : "DEACTIVATE EDITING MODE"}
                  </button>
                  <Link
                    to="/admin"
                    className="w-full inline-flex justify-center items-center bg-brand-ink hover:bg-neutral-800 text-brand-neutral hover:text-brand-neutral py-2.5 border border-brand-ink text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    ⚙️ {language === "th" ? "เข้าสู่ระบบจัดการหลังบ้าน (CMS)" : "ENTER ADMIN CMS PANEL"}
                  </Link>
                  <p className="text-[9.5px] text-stone-500 font-sans leading-normal">
                    {language === "th"
                      ? "คุณกำลังอยู่ในโหมดแก้ไขข้อมูล (แถบควบคุมถูกเปิดใช้งาน) ปิดโหมดแก้ไขหากต้องการพรีวิวหน้าเว็บแบบผู้เยี่ยมชมทั่วไป"
                      : "You are currently in editing mode (CMS is active). Deactivate editing mode to preview the site as a regular visitor."}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleLogout}
              className="w-full bg-brand-stone hover:bg-red-50 hover:text-red-600 text-brand-ink py-2.5 border border-brand-ink text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              {language === "th" ? "ออกจากระบบ" : "DISCONNECT SESSION"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md py-8 animate-fade-in text-brand-ink">
      <div className="bg-brand-neutral border border-brand-ink p-6 md:p-8 space-y-6 shadow-[4px_4px_0px_rgba(18,18,18,1)]">

        <div className={`flex border-b border-brand-ink/20 text-xs font-black uppercase ${language === "th" ? "font-sans tracking-normal" : "font-display tracking-widest"}`}>
          <button
            onClick={() => { setActiveTab("login"); clearErrors(); }}
            className={`flex-1 pb-3 text-center transition-all cursor-pointer border-b-2 ${activeTab === "login" ? "text-brand-ink border-brand-ink" : "text-stone-400 border-transparent hover:text-brand-ink"}`}
          >
            {language === "th" ? "เข้าสู่ระบบ" : "MEMBER LOG IN"}
          </button>
          <button
            onClick={() => { setActiveTab("register"); clearErrors(); }}
            className={`flex-1 pb-3 text-center transition-all cursor-pointer border-b-2 ${activeTab === "register" ? "text-brand-ink border-brand-ink" : "text-stone-400 border-transparent hover:text-brand-ink"}`}
          >
            {language === "th" ? "ลงทะเบียน" : "REGISTER NOW"}
          </button>
        </div>

        {errorMsg && (
          <div className="border border-red-500/30 bg-red-50 text-red-700 text-xs p-3 font-mono font-bold uppercase">
            ⚠️ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="border border-emerald-500/30 bg-emerald-50 text-emerald-700 text-xs p-3 font-mono font-bold uppercase flex items-center gap-2">
            <CheckCircle2 size={12} /> {successMsg}
          </div>
        )}

        {activeTab === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
                {language === "th" ? "อีเมล" : "EMAIL ADDRESS"}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="member@chula.ac.th"
                className="w-full px-3 py-2.5 bg-white border border-brand-ink text-brand-ink text-xs font-semibold focus:outline-none focus:border-brand-pink transition-colors placeholder:text-neutral-300"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
                {language === "th" ? "รหัสนิสิต" : "STUDENT ID"}
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="66XXXXXXXX"
                className="w-full px-3 py-2.5 bg-white border border-brand-ink text-brand-ink text-xs font-semibold focus:outline-none focus:border-brand-pink transition-colors placeholder:text-neutral-300"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-ink hover:bg-brand-pink text-brand-neutral hover:text-brand-neutral py-3 text-xs font-mono font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 size={12} className="animate-spin" />}
              {loading ? (language === "th" ? "กำลังตรวจสอบ..." : "VERIFYING...") : (language === "th" ? "เข้าสู่ระบบ" : "LOG IN")}
            </button>
          </form>
        )}

        {activeTab === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
                {language === "th" ? "คำนำหน้า *" : "PREFIX *"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[{ th: "นาย", en: "Mr." }, { th: "นางสาว", en: "Ms." }].map(opt => (
                  <button
                    key={opt.th}
                    type="button"
                    onClick={() => setPrefix(opt.th)}
                    className={`py-2.5 text-xs font-mono font-bold border transition-colors cursor-pointer ${prefix === opt.th ? "bg-brand-ink text-brand-neutral border-brand-ink" : "bg-white text-brand-ink border-brand-ink hover:bg-brand-stone"}`}
                  >
                    {language === "th" ? opt.th : `${opt.th} / ${opt.en}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
                {language === "th" ? "ชื่อ-นามสกุลจริง *" : "FULL NAME *"}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={language === "th" ? "สมชาย รักกอล์ฟ" : "Somchai Rakgolf"}
                className="w-full px-3 py-2.5 bg-white border border-brand-ink text-brand-ink text-xs font-semibold focus:outline-none focus:border-brand-pink transition-colors placeholder:text-neutral-300"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
                {language === "th" ? "อีเมล *" : "EMAIL ADDRESS *"}
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="member@chula.ac.th"
                className="w-full px-3 py-2.5 bg-white border border-brand-ink text-brand-ink text-xs font-semibold focus:outline-none focus:border-brand-pink transition-colors placeholder:text-neutral-300"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
                {language === "th" ? "รหัสนิสิต *" : "STUDENT ID *"}
              </label>
              <input
                type="text"
                value={regStudentId}
                onChange={(e) => setRegStudentId(e.target.value)}
                placeholder="66XXXXXXXX"
                className="w-full px-3 py-2.5 bg-white border border-brand-ink text-brand-ink text-xs font-semibold focus:outline-none focus:border-brand-pink transition-colors placeholder:text-neutral-300"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
                  {language === "th" ? "ระดับชั้นปี" : "CLASS YEAR"}
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-brand-ink text-brand-ink text-xs font-semibold focus:outline-none focus:border-brand-pink transition-colors cursor-pointer"
                >
                  {[1,2,3,4,5,6].map(n => (
                    <option key={n} value={`Year ${n}`}>{language === "th" ? `ชั้นปีที่ ${n}` : `Year ${n}`}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
                  {language === "th" ? "คณะ" : "FACULTY"}
                </label>
                <input
                  type="text"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  placeholder="e.g. Sports Science"
                  className="w-full px-3 py-2.5 bg-white border border-brand-ink text-brand-ink text-xs font-semibold focus:outline-none focus:border-brand-pink transition-colors placeholder:text-neutral-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Instagram</label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@username"
                  className="w-full px-3 py-2.5 bg-white border border-brand-ink text-brand-ink text-xs font-semibold focus:outline-none focus:border-brand-pink transition-colors placeholder:text-neutral-300"
                />
              </div>
              <div className="space-y-1">
                <label className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Line ID</label>
                <input
                  type="text"
                  value={lineId}
                  onChange={(e) => setLineId(e.target.value)}
                  placeholder="line_id"
                  className="w-full px-3 py-2.5 bg-white border border-brand-ink text-brand-ink text-xs font-semibold focus:outline-none focus:border-brand-pink transition-colors placeholder:text-neutral-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-brand-ink hover:bg-brand-pink text-brand-neutral hover:text-brand-neutral py-3 text-xs font-mono font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 size={12} className="animate-spin" />}
              {loading ? (language === "th" ? "กำลังลงทะเบียน..." : "CREATING PROFILE...") : (language === "th" ? "สมัครสมาชิกชมรม" : "SUBMIT REGISTRATION")}
            </button>

            {/* Line OpenChat QR */}
            <div className="mt-4 border-t border-brand-ink/10 pt-4 flex flex-col items-center gap-3">
              <p className="font-mono text-[9px] font-bold text-neutral-400 uppercase text-center" style={{ letterSpacing: language === "th" ? "normal" : "0.15em" }}>
                {language === "th" ? "เข้าร่วมกลุ่ม Line OpenChat สมาชิก CU Golf Club" : "Join the CU Golf Club Member Line OpenChat"}
              </p>
              <div className="bg-white p-2 border border-brand-ink/20 shadow-[2px_2px_0px_rgba(218,95,142,0.3)]">
                <img
                  src="/line-openchat-qr.jpeg"
                  alt="Line OpenChat QR Code — CU Golf Club Members"
                  className="w-32 h-32 object-contain"
                />
              </div>
              <p className="font-sans text-[10px] text-stone-500 text-center leading-relaxed max-w-xs">
                {language === "th"
                  ? "สแกน QR Code เพื่อเข้าร่วม Line OpenChat สำหรับสมาชิกชมรมกอล์ฟจุฬาฯ"
                  : "Scan the QR code above to join the exclusive Line OpenChat group for CU Golf Club members."}
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
