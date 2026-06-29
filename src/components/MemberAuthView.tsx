import React, { useState, useEffect } from "react";
import { registerMember, loginMember } from "../utils/api";
import { Member } from "../types";
import { useLanguage } from "../utils/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";

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
  const [studentId, setStudentId] = useState("");
  const [faculty, setFaculty] = useState("");
  const [year, setYear] = useState("Year 1");

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
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || (language === "th" ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง" : "Invalid email or password."));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email || !password || !name || !studentId) {
      setErrorMsg(language === "th" ? "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" : "Please fill in all required fields.");
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
        studentId,
        faculty: faculty || undefined,
        year: year || undefined
      });

      if (res.success) {
        setSuccessMsg(language === "th" ? "ลงทะเบียนสำเร็จแล้ว! กำลังเข้าสู่ระบบ..." : "Registration successful! Logging in...");
        const loginData = await loginMember({ email, password });
        if (loginData.success && loginData.token) {
          setMemberToken(loginData.token);
          setMemberUser(loginData.user);
          setTimeout(() => {
            navigate("/");
          }, 1000);
        } else {
          setActiveTab("login");
        }
      }
    } catch (err: any) {
      console.error(err);
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
          </div>

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
        
        {/* Simple Tab Navigation */}
        <div className="flex border-b border-brand-ink/20 font-display text-xs font-black tracking-widest uppercase">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 pb-3 text-center transition-all cursor-pointer border-b-2 ${
              activeTab === "login"
                ? "text-brand-ink border-brand-ink"
                : "text-stone-400 border-transparent hover:text-brand-ink"
            }`}
          >
            {language === "th" ? "เข้าสู่ระบบ" : "MEMBER LOG IN"}
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 pb-3 text-center transition-all cursor-pointer border-b-2 ${
              activeTab === "register"
                ? "text-brand-ink border-brand-ink"
                : "text-stone-400 border-transparent hover:text-brand-ink"
            }`}
          >
            {language === "th" ? "ลงทะเบียน" : "REGISTER NOW"}
          </button>
        </div>

        {/* Feedback Banners */}
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

        {activeTab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
                {language === "th" ? "อีเมล" : "EMAIL ADDRESS"}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. member@chula.ac.th"
                className="w-full px-3 py-2.5 bg-white border border-brand-ink text-brand-ink text-xs font-semibold focus:outline-none focus:border-brand-pink transition-colors placeholder:text-neutral-300"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
                {language === "th" ? "รหัสผ่าน" : "PASSWORD"}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
              {loading ? (language === "th" ? "กำลังตรวจสอบข้อมูล..." : "VERIFYING ACCOUNT...") : (language === "th" ? "เข้าสู่ระบบ" : "AUTHORIZE & LOGIN")}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            
            <div className="space-y-1">
              <label className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
                {language === "th" ? "ชื่อ-นามสกุลจริง *" : "FULL NAME *"}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={language === "th" ? "สมชาย รักกอล์ฟ" : "e.g. Somchai Rakgolf"}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. user@domain.com"
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
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. 66XXXXXXXX"
                className="w-full px-3 py-2.5 bg-white border border-brand-ink text-brand-ink text-xs font-semibold focus:outline-none focus:border-brand-pink transition-colors placeholder:text-neutral-300"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
                  {language === "th" ? "รหัสผ่าน *" : "PASSWORD *"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  className="w-full px-3 py-2.5 bg-white border border-brand-ink text-brand-ink text-xs font-semibold focus:outline-none focus:border-brand-pink transition-colors placeholder:text-neutral-300"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
                  {language === "th" ? "ยืนยันรหัสผ่าน *" : "CONFIRM *"}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 bg-white border border-brand-ink text-brand-ink text-xs font-semibold focus:outline-none focus:border-brand-pink transition-colors placeholder:text-neutral-300"
                  required
                />
              </div>
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
                  <option value="Year 1">{language === "th" ? "ชั้นปีที่ 1" : "Year 1"}</option>
                  <option value="Year 2">{language === "th" ? "ชั้นปีที่ 2" : "Year 2"}</option>
                  <option value="Year 3">{language === "th" ? "ชั้นปีที่ 3" : "Year 3"}</option>
                  <option value="Year 4">{language === "th" ? "ชั้นปีที่ 4" : "Year 4"}</option>
                  <option value="Year 5">{language === "th" ? "ชั้นปีที่ 5" : "Year 5"}</option>
                  <option value="Year 6">{language === "th" ? "ชั้นปีที่ 6" : "Year 6"}</option>
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

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-brand-ink hover:bg-brand-pink text-brand-neutral hover:text-brand-neutral py-3 text-xs font-mono font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 size={12} className="animate-spin" />}
              {loading ? (language === "th" ? "กำลังลงทะเบียน..." : "CREATING PROFILE...") : (language === "th" ? "สมัครสมาชิกชมรม" : "SUBMIT REGISTRATION")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
