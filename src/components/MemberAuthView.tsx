import React, { useState, useEffect } from "react";
import { registerMember, loginMember, getMemberProfile } from "../utils/api";
import { Member } from "../types";
import { useLanguage } from "../utils/LanguageContext";
import { ShieldCheck, User, Mail, Lock, Phone, Award, School, LogOut, ArrowRight, Loader2, CreditCard, CheckCircle2, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MemberAuthViewProps {
  memberUser: any;
  setMemberUser: (user: any) => void;
  memberToken: string | null;
  setMemberToken: (token: string | null) => void;
}

export default function MemberAuthView({
  memberUser,
  setMemberUser,
  memberToken,
  setMemberToken
}: MemberAuthViewProps) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [faculty, setFaculty] = useState("");
  const [year, setYear] = useState("Freshman");
  const [handicap, setHandicap] = useState<number | "">("");

  // Clear messages on tab switch
  useEffect(() => {
    setErrorMsg("");
    setSuccessMsg("");
  }, [activeTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg(language === "th" ? "กรุณากรอกอีเมลและรหัสผ่าน" : "Please fill in all email and password fields.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const data = await loginMember({ email, password });
      if (data.success && data.token) {
        setMemberToken(data.token);
        setMemberUser(data.user);
        setSuccessMsg(language === "th" ? "เข้าสู่ระบบสำเร็จแล้ว!" : "Successfully logged in!");
        // Redirect to homepage or refresh profile after 1.2s
        setTimeout(() => {
          navigate("/");
        }, 1200);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || (language === "th" ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง" : "Invalid email or password. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email || !password || !name) {
      setErrorMsg(language === "th" ? "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ชื่อ, อีเมล, รหัสผ่าน)" : "Please fill in all required fields (Name, Email, Password).");
      return;
    }

    if (password.length < 6) {
      setErrorMsg(language === "th" ? "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" : "Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(language === "th" ? "รหัสผ่านไม่ตรงกัน" : "Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await registerMember({
        email,
        password,
        name,
        phone: phone || undefined,
        faculty: faculty || undefined,
        year: year || undefined,
        handicap: handicap !== "" ? Number(handicap) : undefined
      });

      if (res.success) {
        setSuccessMsg(language === "th" ? "ลงทะเบียนสำเร็จแล้ว! กำลังเข้าสู่ระบบ..." : "Registration successful! Logging you in...");
        
        // Auto-login after successful registration
        const loginData = await loginMember({ email, password });
        if (loginData.success && loginData.token) {
          setMemberToken(loginData.token);
          setMemberUser(loginData.user);
          setTimeout(() => {
            navigate("/");
          }, 1500);
        } else {
          setActiveTab("login");
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || (language === "th" ? "การลงทะเบียนล้มเหลว กรุณาลองอีกครั้ง" : "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setMemberToken(null);
    setMemberUser(null);
    navigate("/");
  };

  // Render Member Portal Dashboard if already logged in
  if (memberUser) {
    const profile = memberUser.profile || {};
    return (
      <div className="mx-auto max-w-4xl py-6 md:py-10 animate-fade-in text-brand-ink">
        <div className="grid gap-8 md:grid-cols-5">
          {/* Member Card & Status Panel */}
          <div className="md:col-span-3 space-y-6">
            <div className="border-4 border-brand-ink bg-brand-stone p-6 relative overflow-hidden shadow-[8px_8px_0px_0px_rgba(21,21,21,1)]">
              {/* Decorative Corner Flaps */}
              <div className="absolute top-0 right-0 bg-brand-ink text-brand-neutral text-[8px] font-mono px-3 py-1 uppercase tracking-widest font-bold">
                {language === "th" ? "สมาชิกอย่างเป็นทางการ" : "OFFICIAL MEMBER"}
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="bg-brand-pink p-3 border-2 border-brand-ink">
                  <CreditCard size={28} className="text-brand-neutral" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-black uppercase tracking-tight leading-none text-brand-ink">
                    CU GOLF CLUB
                  </h3>
                  <p className="font-mono text-[9px] font-bold text-neutral-500 uppercase tracking-widest mt-1">
                    {language === "th" ? "บัตรทะเบียนดิจิทัล" : "DIGITAL REGISTRY PASS"}
                  </p>
                </div>
              </div>

              {/* Membership Card Graphic */}
              <div className="border-2 border-dashed border-brand-ink/40 p-4 bg-brand-neutral/80 relative rounded-sm font-mono space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider block">MEMBER NAME</span>
                    <span className="text-sm font-black text-brand-ink uppercase font-sans">
                      {memberUser.name || "N/A"}
                    </span>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider block">REGISTRY ID</span>
                    <span className="text-[10px] font-bold text-brand-ink font-mono uppercase">
                      CUGC-{memberUser.id?.substring(0, 8).toUpperCase() || "PENDING"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-brand-ink/10 pt-3">
                  <div>
                    <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider block">CLASS YEAR</span>
                    <span className="text-xs font-bold text-brand-ink uppercase font-sans">
                      {profile.year || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider block">FACULTY</span>
                    <span className="text-xs font-bold text-brand-ink uppercase font-sans truncate block">
                      {profile.faculty || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-brand-ink/10 pt-3">
                  <div>
                    <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider block">HANDICAP INDEX</span>
                    <span className="text-xs font-bold text-brand-pink font-mono">
                      {profile.handicap !== undefined && profile.handicap !== null ? profile.handicap.toFixed(1) : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider block">STATUS</span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 uppercase mt-0.5">
                      <CheckCircle2 size={10} /> {language === "th" ? "ตรวจสอบแล้ว" : "VERIFIED ACTIVE"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between font-mono text-[9px] text-neutral-500 uppercase tracking-tight">
                <span>ESTABLISHED 1916</span>
                <span>SECURE DATABASE SYNC</span>
              </div>
            </div>

            {/* Welcome Banner */}
            <div className="border border-brand-ink/10 bg-white p-6 rounded-sm space-y-4">
              <h4 className="font-display text-base font-bold uppercase tracking-tight text-brand-ink">
                {language === "th" ? "ยินดีต้อนรับสู่คลับกอล์ฟจุฬาฯ" : "WELCOME TO THE CHULA GOLF PORTAL"}
              </h4>
              <p className="text-xs leading-relaxed text-brand-ink/70">
                {language === "th"
                  ? "คุณได้เข้าสู่ระบบในฐานะสมาชิกของชมรมกอล์ฟจุฬาลงกรณ์มหาวิทยาลัยแล้ว ข้อมูลของคุณได้รับการจัดเก็บและเชื่อมโยงกับฐานข้อมูลของทีมอย่างปลอดภัย ทางบอร์ดบริหารจะประกาศสิทธิประโยชน์และระบบจองรอบสนามให้ทราบเร็วๆ นี้"
                  : "You are currently logged into the official CU Golf Club membership system. Your profile is securely synced with our centralized repository. Updates regarding tournament entries, coaching registry benefits, and varsity tee times will be posted here soon."}
              </p>
            </div>
          </div>

          {/* Quick Actions & Logout */}
          <div className="md:col-span-2 space-y-6">
            <div className="border-2 border-brand-ink bg-white p-6 shadow-[4px_4px_0px_0px_rgba(21,21,21,1)]">
              <h4 className="font-display text-xs font-black uppercase tracking-widest text-brand-ink mb-4 border-b-2 border-brand-ink pb-2">
                {language === "th" ? "เมนูสมาชิก" : "MEMBER OPERATIONS"}
              </h4>
              
              <div className="space-y-3 font-sans text-xs">
                <div className="p-3 bg-brand-stone border border-brand-ink/10 flex justify-between items-center">
                  <span className="font-mono font-bold text-[9.5px] uppercase">{language === "th" ? "ข้อมูลการติดต่อ" : "CONTACT EMAIL"}</span>
                  <span className="text-brand-ink/80 truncate font-semibold">{memberUser.email}</span>
                </div>
                <div className="p-3 bg-brand-stone border border-brand-ink/10 flex justify-between items-center">
                  <span className="font-mono font-bold text-[9.5px] uppercase">{language === "th" ? "เบอร์โทรศัพท์" : "PHONE"}</span>
                  <span className="text-brand-ink/80 font-semibold">{profile.phone || "—"}</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-brand-ink text-brand-neutral hover:bg-brand-pink hover:text-brand-neutral py-3 text-xs font-mono font-bold uppercase transition-all duration-200 cursor-pointer"
              >
                <LogOut size={14} />
                {language === "th" ? "ออกจากระบบ" : "DISCONNECT SESSION"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Registration & Login forms
  return (
    <div className="mx-auto max-w-xl py-6 md:py-10 animate-fade-in text-brand-ink">
      <div className="border-4 border-brand-ink bg-brand-stone p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(21,21,21,1)]">
        
        {/* Toggle Tabs */}
        <div className="flex border-b-2 border-brand-ink mb-6 md:mb-8 font-display text-sm font-black tracking-wider uppercase">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 pb-3 text-center transition-all cursor-pointer ${
              activeTab === "login"
                ? "text-brand-ink border-b-4 border-brand-ink"
                : "text-stone-400 hover:text-neutral-900"
            }`}
          >
            {language === "th" ? "เข้าสู่ระบบสมาชิก" : "MEMBER LOGIN"}
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 pb-3 text-center transition-all cursor-pointer ${
              activeTab === "register"
                ? "text-brand-ink border-b-4 border-brand-ink"
                : "text-stone-400 hover:text-neutral-900"
            }`}
          >
            {language === "th" ? "สมัครสมาชิกใหม่" : "REGISTER NOW"}
          </button>
        </div>

        {/* Header Branding */}
        <div className="mb-6 text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-brand-ink text-brand-neutral px-3 py-1 font-mono text-[9px] uppercase font-bold tracking-widest">
            <ShieldCheck size={12} />
            {language === "th" ? "ระบบสมาชิกกอล์ฟจุฬาฯ" : "CU GOLF SECURE GATEWAY"}
          </div>
          <h3 className="font-display text-xl font-extrabold uppercase tracking-tight text-brand-ink mt-2">
            {activeTab === "login" 
              ? (language === "th" ? "ยินดีต้อนรับสมาชิกชมรม" : "ACCESS YOUR MEMBER PASS")
              : (language === "th" ? "สร้างบัญชีสมาชิกชมรม" : "JOIN THE PINK SQUAD REGISTRY")
            }
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed max-w-sm mx-auto">
            {activeTab === "login"
              ? (language === "th" ? "กรอกข้อมูลบัญชีเพื่อเข้าชมสิทธิ์และประวัติสโมสร" : "Provide your email credentials below to verify your digital membership session.")
              : (language === "th" ? "ลงทะเบียนเพื่อเข้าเป็นส่วนหนึ่งของระบบสมาชิกกอล์ฟจุฬาลงกรณ์" : "Create a secure account on our cloud registry to record stats and access team files.")
            }
          </p>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mb-6 border-2 border-red-500 bg-red-50 p-4 font-mono text-xs text-red-600 font-bold uppercase flex items-center gap-3">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 border-2 border-emerald-500 bg-emerald-50 p-4 font-mono text-xs text-emerald-600 font-bold uppercase flex items-center gap-3">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Forms */}
        {activeTab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-brand-ink block">
                {language === "th" ? "อีเมลมหาวิทยาลัย / สมาชิก" : "EMAIL ADDRESS"}
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. member@chula.ac.th"
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-brand-ink text-brand-ink text-xs font-semibold focus:outline-none focus:border-brand-pink transition-colors placeholder:text-neutral-300"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-brand-ink block">
                {language === "th" ? "รหัสผ่าน" : "PASSWORD"}
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-brand-ink text-brand-ink text-xs font-semibold focus:outline-none focus:border-brand-pink transition-colors placeholder:text-neutral-300"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-brand-ink text-brand-neutral hover:bg-brand-pink hover:text-brand-neutral py-3 text-xs font-mono font-bold uppercase transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {language === "th" ? "กำลังตรวจสอบข้อมูล..." : "VERIFYING ACCOUNT..."}
                </>
              ) : (
                <>
                  {language === "th" ? "เข้าสู่ระบบชมรม" : "AUTHORIZE & LOGIN"}
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Required Account Credentials */}
            <div className="border border-brand-ink/20 p-4 bg-white/50 space-y-4">
              <h4 className="font-mono text-[10px] font-bold uppercase text-neutral-400 border-b border-brand-ink/10 pb-1">
                {language === "th" ? "1. ข้อมูลการลงทะเบียนบัญชี" : "1. ACCOUNT CREDENTIALS (REQUIRED)"}
              </h4>
              
              <div className="space-y-1">
                <label className="font-mono text-[9px] font-bold uppercase tracking-wider text-brand-ink block">
                  {language === "th" ? "ชื่อ-นามสกุลจริง *" : "FULL NAME *"}
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={language === "th" ? "ตัวอย่าง: สมชาย รักกอล์ฟ" : "e.g. Somchai Rakgolf"}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-brand-ink text-brand-ink text-xs font-semibold focus:outline-none focus:border-brand-pink transition-colors placeholder:text-neutral-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[9px] font-bold uppercase tracking-wider text-brand-ink block">
                  {language === "th" ? "อีเมลติดต่อจริง *" : "EMAIL ADDRESS *"}
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. user@domain.com"
                    className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-brand-ink text-brand-ink text-xs font-semibold focus:outline-none focus:border-brand-pink transition-colors placeholder:text-neutral-300"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-mono text-[9px] font-bold uppercase tracking-wider text-brand-ink block">
                    {language === "th" ? "รหัสผ่าน *" : "PASSWORD *"}
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-brand-ink text-brand-ink text-xs font-semibold focus:outline-none focus:border-brand-pink transition-colors placeholder:text-neutral-300"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[9px] font-bold uppercase tracking-wider text-brand-ink block">
                    {language === "th" ? "ยืนยันรหัสผ่าน *" : "CONFIRM PASSWORD *"}
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-brand-ink text-brand-ink text-xs font-semibold focus:outline-none focus:border-brand-pink transition-colors placeholder:text-neutral-300"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Roster profile info */}
            <div className="border border-brand-ink/20 p-4 bg-white/50 space-y-4">
              <h4 className="font-mono text-[10px] font-bold uppercase text-neutral-400 border-b border-brand-ink/10 pb-1">
                {language === "th" ? "2. ข้อมูลสถิติและประวัติ (ไม่บังคับ)" : "2. PLAYER PROFILE (OPTIONAL)"}
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-mono text-[9px] font-bold uppercase tracking-wider text-brand-ink block">
                    {language === "th" ? "เบอร์โทรศัพท์" : "PHONE NUMBER"}
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0812345678"
                      className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-brand-ink text-brand-ink text-xs font-semibold focus:outline-none focus:border-brand-pink transition-colors placeholder:text-neutral-300"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="font-mono text-[9px] font-bold uppercase tracking-wider text-brand-ink block">
                    {language === "th" ? "แต้มต่อแฮนดิแคป" : "HANDICAP INDEX"}
                  </label>
                  <div className="relative">
                    <Award size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="number"
                      step="0.1"
                      value={handicap}
                      onChange={(e) => setHandicap(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 2.4"
                      className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-brand-ink text-brand-ink text-xs font-semibold focus:outline-none focus:border-brand-pink transition-colors placeholder:text-neutral-300"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-mono text-[9px] font-bold uppercase tracking-wider text-brand-ink block">
                    {language === "th" ? "ระดับชั้นปี" : "CLASS YEAR"}
                  </label>
                  <div className="relative">
                    <School size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-brand-ink text-brand-ink text-xs font-semibold focus:outline-none focus:border-brand-pink transition-colors cursor-pointer appearance-none"
                    >
                      <option value="Freshman">{language === "th" ? "ปี 1 (Freshman)" : "Freshman"}</option>
                      <option value="Sophomore">{language === "th" ? "ปี 2 (Sophomore)" : "Sophomore"}</option>
                      <option value="Junior">{language === "th" ? "ปี 3 (Junior)" : "Junior"}</option>
                      <option value="Senior">{language === "th" ? "ปี 4 (Senior)" : "Senior"}</option>
                      <option value="Alumni">{language === "th" ? "ศิษย์เก่า (Alumni)" : "Alumni"}</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-ink pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[9px] font-bold uppercase tracking-wider text-brand-ink block">
                    {language === "th" ? "คณะที่ศึกษา" : "FACULTY"}
                  </label>
                  <input
                    type="text"
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    placeholder={language === "th" ? "คณะวิทยาศาสตร์การกีฬา" : "e.g. Sports Science"}
                    className="w-full px-3 py-2.5 bg-white border-2 border-brand-ink text-brand-ink text-xs font-semibold focus:outline-none focus:border-brand-pink transition-colors placeholder:text-neutral-300"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-brand-ink text-brand-neutral hover:bg-brand-pink hover:text-brand-neutral py-3 text-xs font-mono font-bold uppercase transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {language === "th" ? "กำลังบันทึกข้อมูลสมาชิก..." : "SYNCING MEMBERSHIP..."}
                </>
              ) : (
                <>
                  {language === "th" ? "ส่งคำขอลงทะเบียน" : "SUBMIT REGISTRATION"}
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
