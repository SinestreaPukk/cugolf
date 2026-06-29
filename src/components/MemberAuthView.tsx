import React, { useState, useEffect } from "react";
import { registerMember, loginMember, forgotPassword, resetPassword, changePassword } from "../utils/api";
import { Member, SiteSettings } from "../types";
import { useLanguage } from "../utils/LanguageContext";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"login" | "register" | "forgot" | "reset">("login");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [prefix, setPrefix] = useState("นาย");
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [faculty, setFaculty] = useState("");
  const [year, setYear] = useState("Year 1");
  const [instagram, setInstagram] = useState("");
  const [lineId, setLineId] = useState("");

  // Forgot/Reset password states
  const [forgotEmail, setForgotEmail] = useState("");
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);

  // Change password (logged-in)
  const [showChangePw, setShowChangePw] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changePwError, setChangePwError] = useState("");
  const [changePwSuccess, setChangePwSuccess] = useState("");

  useEffect(() => {
    // Check if URL has a recovery token (e.g. from password reset redirect)
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      const params = new URLSearchParams(hash.replace("#", "?"));
      const token = params.get("access_token");
      if (token) {
        setRecoveryToken(token);
        setActiveTab("reset");
      }
    }
  }, []);

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
        prefix,
        name,
        studentId,
        faculty: faculty || undefined,
        year: year || undefined,
        instagram: instagram || undefined,
        lineId: lineId || undefined
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

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setErrorMsg(language === "th" ? "กรุณากรอกอีเมลของคุณ" : "Please enter your email address.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await forgotPassword(forgotEmail);
      if (res.success) {
        setSuccessMsg(
          language === "th"
            ? "ส่งคำแนะนำการรีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว! กรุณาตรวจสอบกล่องขาเข้า (รวมถึงโฟลเดอร์สแปม)"
            : "Reset link sent! Check your inbox and spam folder."
        );
      }
    } catch (err: any) {
      console.error(err);
      // Supabase free tier has a very low email rate limit — show a helpful fallback
      setErrorMsg(
        language === "th"
          ? "ไม่สามารถส่งอีเมลรีเซ็ตรหัสผ่านได้ในขณะนี้ กรุณาล็อกอินก่อนแล้วใช้ฟีเจอร์ \"เปลี่ยนรหัสผ่าน\" ในพอร์ทัลสมาชิก หรือติดต่อผู้ดูแลระบบ"
          : "Could not send reset email right now (email limit reached). If you know your password, log in and use Change Password in the member portal. Otherwise contact an admin to reset it for you."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!password || !confirmPassword) {
      setErrorMsg(language === "th" ? "กรุณากรอกรหัสผ่านใหม่" : "Please fill in all password fields.");
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

    if (!recoveryToken) {
      setErrorMsg(language === "th" ? "โทเคนการกู้คืนไม่ถูกต้องหรือหมดอายุแล้ว" : "Recovery token is missing or expired.");
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword(password, recoveryToken);
      if (res.success) {
        setSuccessMsg(
          language === "th"
            ? "รีเซ็ตรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่ของคุณ"
            : "Password reset successfully! Please log in with your new password."
        );
        // Clear recovery token and hash
        setRecoveryToken(null);
        window.location.hash = "";
        setTimeout(() => {
          setActiveTab("login");
        }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || (language === "th" ? "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน" : "Failed to reset password."));
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

          {/* Change Password */}
          <div className="pt-2 border-t border-brand-ink/10 space-y-2">
            <button
              onClick={() => { setShowChangePw(v => !v); setChangePwError(""); setChangePwSuccess(""); }}
              className="w-full bg-brand-stone hover:bg-stone-200 text-brand-ink py-2.5 border border-brand-ink text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              {language === "th" ? "เปลี่ยนรหัสผ่าน" : "CHANGE PASSWORD"}
            </button>
            {showChangePw && (
              <div className="space-y-2 pt-1">
                {changePwError && <p className="text-red-500 text-[10px] font-mono">{changePwError}</p>}
                {changePwSuccess && <p className="text-green-600 text-[10px] font-mono">{changePwSuccess}</p>}
                <input
                  type="password"
                  placeholder={language === "th" ? "รหัสผ่านปัจจุบัน" : "Current password"}
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="w-full border border-brand-ink/30 bg-white px-3 py-2 text-xs font-mono focus:outline-none focus:border-brand-ink"
                />
                <input
                  type="password"
                  placeholder={language === "th" ? "รหัสผ่านใหม่" : "New password"}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full border border-brand-ink/30 bg-white px-3 py-2 text-xs font-mono focus:outline-none focus:border-brand-ink"
                />
                <input
                  type="password"
                  placeholder={language === "th" ? "ยืนยันรหัสผ่านใหม่" : "Confirm new password"}
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                  className="w-full border border-brand-ink/30 bg-white px-3 py-2 text-xs font-mono focus:outline-none focus:border-brand-ink"
                />
                <button
                  disabled={loading}
                  onClick={async () => {
                    setChangePwError("");
                    setChangePwSuccess("");
                    if (!oldPassword || !newPassword || !confirmNewPassword) {
                      setChangePwError(language === "th" ? "กรุณากรอกข้อมูลให้ครบ" : "All fields are required.");
                      return;
                    }
                    if (newPassword !== confirmNewPassword) {
                      setChangePwError(language === "th" ? "รหัสผ่านใหม่ไม่ตรงกัน" : "New passwords do not match.");
                      return;
                    }
                    if (newPassword.length < 6) {
                      setChangePwError(language === "th" ? "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร" : "New password must be at least 6 characters.");
                      return;
                    }
                    setLoading(true);
                    try {
                      const res = await changePassword(oldPassword, newPassword, memberToken!);
                      if (res.success) {
                        setChangePwSuccess(language === "th" ? "เปลี่ยนรหัสผ่านสำเร็จ" : "Password changed successfully.");
                        setOldPassword(""); setNewPassword(""); setConfirmNewPassword("");
                        setShowChangePw(false);
                      } else {
                        setChangePwError(res.message || (language === "th" ? "เกิดข้อผิดพลาด" : "Failed to change password."));
                      }
                    } catch (err: any) {
                      setChangePwError(err.message || (language === "th" ? "เกิดข้อผิดพลาด" : "Error."));
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="w-full bg-brand-ink hover:bg-neutral-800 text-brand-neutral py-2.5 border border-brand-ink text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? "..." : (language === "th" ? "ยืนยันเปลี่ยนรหัสผ่าน" : "CONFIRM CHANGE")}
                </button>
              </div>
            )}
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
        
        {/* Simple Tab Navigation or Header */}
        {activeTab === "login" || activeTab === "register" ? (
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
        ) : (
          <div className="border-b border-brand-ink/20 font-display text-xs font-black tracking-widest uppercase pb-3 text-center text-brand-ink font-bold">
            {activeTab === "forgot" 
              ? (language === "th" ? "ลืมรหัสผ่าน" : "PASSWORD RECOVERY")
              : (language === "th" ? "ตั้งรหัสผ่านใหม่" : "RESET PASSWORD")
            }
          </div>
        )}

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
              {loading ? (language === "th" ? "กำลังตรวจสอบ..." : "VERIFYING...") : (language === "th" ? "เข้าสู่ระบบ" : "AUTHORIZE & LOGIN")}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setActiveTab("forgot")}
                className="text-[10px] font-mono font-bold text-stone-400 hover:text-brand-ink uppercase tracking-wider transition-colors cursor-pointer bg-transparent border-none outline-none"
              >
                {language === "th" ? "ลืมรหัสผ่าน?" : "Forgot Password?"}
              </button>
            </div>
          </form>
        )}

        {activeTab === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
                {language === "th" ? "คำนำหน้า *" : "PREFIX *"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { th: "นาย", en: "Mr." },
                  { th: "นางสาว", en: "Ms." }
                ].map(opt => (
                  <button
                    key={opt.th}
                    type="button"
                    onClick={() => setPrefix(opt.th)}
                    className={`py-2.5 text-xs font-mono font-bold border transition-colors cursor-pointer ${
                      prefix === opt.th
                        ? "bg-brand-ink text-brand-neutral border-brand-ink"
                        : "bg-white text-brand-ink border-brand-ink hover:bg-brand-stone"
                    }`}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="66XXXXXXXX"
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Instagram
                </label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@username"
                  className="w-full px-3 py-2.5 bg-white border border-brand-ink text-brand-ink text-xs font-semibold focus:outline-none focus:border-brand-pink transition-colors placeholder:text-neutral-300"
                />
              </div>
              <div className="space-y-1">
                <label className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Line ID
                </label>
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
          </form>
        )}

        {activeTab === "forgot" && (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <p className="text-[11px] text-stone-500 font-sans leading-relaxed">
              {language === "th" 
                ? "ป้อนอีเมลที่ใช้สมัครสมาชิก แล้วระบบจะส่งลิงก์เพื่อกู้คืนและตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณ" 
                : "Enter your registered email address below, and we will send you a secure link to reset your password."
              }
            </p>
            
            <div className="space-y-1">
              <label className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
                {language === "th" ? "อีเมลสมาชิก" : "MEMBER EMAIL"}
              </label>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="member@chula.ac.th"
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
              {loading ? (language === "th" ? "กำลังส่งคำขอ..." : "SENDING REQUEST...") : (language === "th" ? "ขอลิงก์รีเซ็ตรหัสผ่าน" : "SEND RECOVERY EMAIL")}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className="text-[10px] font-mono font-bold text-stone-400 hover:text-brand-ink uppercase tracking-wider transition-colors cursor-pointer bg-transparent border-none outline-none"
              >
                {language === "th" ? "← กลับไปหน้าเข้าสู่ระบบ" : "← Back to Login"}
              </button>
            </div>
          </form>
        )}

        {activeTab === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-[11px] text-stone-500 font-sans leading-relaxed">
              {language === "th" 
                ? "กรอกรหัสผ่านใหม่ที่ต้องการใช้สำหรับเข้าสู่ระบบของชมรม" 
                : "Please choose a new password below for your golf club membership."
              }
            </p>

            <div className="space-y-1">
              <label className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
                {language === "th" ? "รหัสผ่านใหม่" : "NEW PASSWORD"}
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
                {language === "th" ? "ยืนยันรหัสผ่านใหม่" : "CONFIRM NEW PASSWORD"}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-ink hover:bg-brand-pink text-brand-neutral hover:text-brand-neutral py-3 text-xs font-mono font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 size={12} className="animate-spin" />}
              {loading ? (language === "th" ? "กำลังบันทึก..." : "UPDATING PASSWORD...") : (language === "th" ? "ตั้งรหัสผ่านใหม่" : "CONFIRM PASSWORD RESET")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
