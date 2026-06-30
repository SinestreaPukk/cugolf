import { useLanguage } from "../utils/LanguageContext";
import { ShieldCheck } from "lucide-react";

export default function PrivacyView() {
  const { language } = useLanguage();

  if (language === "th") {
    return (
      <div className="mx-auto max-w-3xl py-12 animate-fade-in text-brand-ink font-sans space-y-10">
        <header className="space-y-3 border-b border-brand-ink pb-8">
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-brand-pink uppercase tracking-widest">
            <ShieldCheck size={14} /> นโยบายความเป็นส่วนตัว
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tight leading-none">
            การเปิดเผยข้อมูล<br />ส่วนบุคคล (PDPA)
          </h1>
          <p className="text-xs text-stone-500 font-mono">
            มีผลบังคับใช้: 1 มกราคม 2568 &nbsp;|&nbsp; เวอร์ชัน 1.0
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="font-display text-base font-bold uppercase tracking-wider">1. ผู้ควบคุมข้อมูลส่วนบุคคล</h2>
          <p className="text-sm leading-relaxed text-stone-700">
            ชมรมกอล์ฟจุฬาลงกรณ์มหาวิทยาลัย (CU Golf Club) ซึ่งเป็นส่วนหนึ่งของกิจกรรมนิสิตภายใต้การกำกับดูแลของ
            จุฬาลงกรณ์มหาวิทยาลัย ถนนพญาไท แขวงวังใหม่ เขตปทุมวัน กรุงเทพมหานคร 10330
            เป็นผู้ควบคุมข้อมูลส่วนบุคคลตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
          </p>
          <p className="text-sm leading-relaxed text-stone-700">
            ติดต่อผู้ควบคุมข้อมูล: <span className="font-semibold">golf@chula.ac.th</span>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-base font-bold uppercase tracking-wider">2. ข้อมูลส่วนบุคคลที่เก็บรวบรวม</h2>
          <p className="text-sm leading-relaxed text-stone-700">เมื่อคุณสมัครสมาชิกชมรม เราเก็บรวบรวมข้อมูลต่อไปนี้:</p>
          <ul className="list-disc list-inside text-sm text-stone-700 space-y-1 pl-2">
            <li>คำนำหน้าชื่อ ชื่อ และนามสกุล</li>
            <li>ที่อยู่อีเมล</li>
            <li>รหัสนิสิต</li>
            <li>คณะและชั้นปีการศึกษา</li>
            <li>บัญชี Instagram (ถ้ามี)</li>
            <li>Line ID (ถ้ามี)</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-base font-bold uppercase tracking-wider">3. วัตถุประสงค์และฐานกฎหมายในการประมวลผล</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-brand-ink/20 border-collapse">
              <thead>
                <tr className="bg-brand-ink text-brand-neutral font-mono uppercase tracking-wider">
                  <th className="p-3 text-left border border-brand-ink/20">วัตถุประสงค์</th>
                  <th className="p-3 text-left border border-brand-ink/20">ฐานกฎหมาย</th>
                </tr>
              </thead>
              <tbody className="text-stone-700">
                <tr className="border-b border-brand-ink/10">
                  <td className="p-3 border border-brand-ink/10">การยืนยันตัวตนและการเข้าสู่ระบบสมาชิก</td>
                  <td className="p-3 border border-brand-ink/10">การปฏิบัติตามสัญญา (มาตรา 24(3))</td>
                </tr>
                <tr className="border-b border-brand-ink/10 bg-brand-stone/30">
                  <td className="p-3 border border-brand-ink/10">การจัดทำทะเบียนสมาชิกชมรม</td>
                  <td className="p-3 border border-brand-ink/10">การปฏิบัติตามสัญญา (มาตรา 24(3))</td>
                </tr>
                <tr className="border-b border-brand-ink/10">
                  <td className="p-3 border border-brand-ink/10">การติดต่อสื่อสารเกี่ยวกับกิจกรรมชมรม</td>
                  <td className="p-3 border border-brand-ink/10">ความยินยอม (มาตรา 19)</td>
                </tr>
                <tr className="border-b border-brand-ink/10 bg-brand-stone/30">
                  <td className="p-3 border border-brand-ink/10">การแสดงผลในทะเบียนนักกีฬา (Varsity Roster)</td>
                  <td className="p-3 border border-brand-ink/10">ความยินยอม (มาตรา 19)</td>
                </tr>
                <tr>
                  <td className="p-3 border border-brand-ink/10">การดูแลความปลอดภัยของระบบ</td>
                  <td className="p-3 border border-brand-ink/10">ประโยชน์อันชอบธรรม (มาตรา 24(5))</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-base font-bold uppercase tracking-wider">4. ระยะเวลาการเก็บรักษาข้อมูล</h2>
          <p className="text-sm leading-relaxed text-stone-700">
            เราเก็บรักษาข้อมูลส่วนบุคคลของคุณตลอดระยะเวลาที่คุณเป็นสมาชิกชมรม และนานสูงสุด <span className="font-semibold">3 ปี</span> หลังจากที่คุณพ้นสมาชิกภาพหรือสำเร็จการศึกษา
            เพื่อวัตถุประสงค์ด้านบันทึกประวัติชมรม เว้นแต่คุณจะร้องขอให้ลบข้อมูลก่อนกำหนด
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-base font-bold uppercase tracking-wider">5. การเปิดเผยข้อมูลแก่บุคคลภายนอก</h2>
          <p className="text-sm leading-relaxed text-stone-700">
            เราไม่ขายหรือให้เช่าข้อมูลส่วนบุคคลของคุณแก่บุคคลภายนอก เราอาจเปิดเผยข้อมูลในกรณีต่อไปนี้เท่านั้น:
          </p>
          <ul className="list-disc list-inside text-sm text-stone-700 space-y-1 pl-2">
            <li>จุฬาลงกรณ์มหาวิทยาลัย (สำนักงานกีฬา) เพื่อการจัดการแข่งขันระดับมหาวิทยาลัย</li>
            <li>สมาคมกอล์ฟมหาวิทยาลัยไทย (TUGA) เพื่อการลงทะเบียนแข่งขัน</li>
            <li>ผู้ให้บริการระบบคลาวด์ (Supabase Inc.) ในฐานะผู้ประมวลผลข้อมูล ซึ่งมีมาตรการรักษาความปลอดภัยที่เหมาะสม</li>
            <li>หน่วยงานของรัฐเมื่อมีคำสั่งโดยชอบด้วยกฎหมาย</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-base font-bold uppercase tracking-wider">6. สิทธิของเจ้าของข้อมูลส่วนบุคคล</h2>
          <p className="text-sm leading-relaxed text-stone-700">ภายใต้ PDPA คุณมีสิทธิดังต่อไปนี้:</p>
          <ul className="text-sm text-stone-700 space-y-2 pl-2">
            {[
              ["สิทธิในการเข้าถึง", "ขอสำเนาข้อมูลส่วนบุคคลของคุณที่เราเก็บไว้"],
              ["สิทธิในการแก้ไข", "ขอแก้ไขข้อมูลที่ไม่ถูกต้องหรือไม่ครบถ้วน"],
              ["สิทธิในการลบ", "ขอให้ลบข้อมูลส่วนบุคคลของคุณ (ภายใต้เงื่อนไขที่กฎหมายกำหนด)"],
              ["สิทธิในการระงับ", "ขอระงับการประมวลผลข้อมูลของคุณชั่วคราว"],
              ["สิทธิในการคัดค้าน", "คัดค้านการประมวลผลข้อมูลที่อาศัยฐานประโยชน์อันชอบธรรม"],
              ["สิทธิในการโอนย้าย", "ขอรับข้อมูลในรูปแบบที่สามารถอ่านได้ด้วยเครื่อง"],
              ["สิทธิในการถอนความยินยอม", "ถอนความยินยอมได้ทุกเมื่อโดยไม่กระทบสิทธิที่เกิดขึ้นก่อนหน้า"],
            ].map(([right, desc]) => (
              <li key={right} className="flex gap-2">
                <span className="font-semibold text-brand-ink shrink-0">• {right}:</span>
                <span>{desc}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-stone-700">
            ยื่นคำขอใช้สิทธิได้ที่: <span className="font-semibold">golf@chula.ac.th</span> เราจะดำเนินการภายใน 30 วัน
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-base font-bold uppercase tracking-wider">7. ความปลอดภัยของข้อมูล</h2>
          <p className="text-sm leading-relaxed text-stone-700">
            เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสม ได้แก่ การเข้ารหัสข้อมูลในระหว่างการส่ง (TLS) การควบคุมการเข้าถึงผ่านระบบ Row-Level Security
            และการจัดเก็บข้อมูลบนโครงสร้างพื้นฐานคลาวด์ที่ผ่านมาตรฐาน SOC 2
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-base font-bold uppercase tracking-wider">8. การร้องเรียน</h2>
          <p className="text-sm leading-relaxed text-stone-700">
            หากคุณมีข้อร้องเรียนเกี่ยวกับการประมวลผลข้อมูลส่วนบุคคล คุณมีสิทธิร้องเรียนต่อ
            สำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล (สคส.) ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-base font-bold uppercase tracking-wider">9. การเปลี่ยนแปลงนโยบาย</h2>
          <p className="text-sm leading-relaxed text-stone-700">
            เราอาจปรับปรุงนโยบายนี้เป็นครั้งคราว การเปลี่ยนแปลงสำคัญจะแจ้งให้ทราบผ่านอีเมลที่คุณลงทะเบียนไว้
            วันที่มีผลบังคับใช้จะระบุที่ด้านบนของหน้านี้เสมอ
          </p>
        </section>

        <div className="border-t border-brand-ink/20 pt-6 text-xs text-stone-400 font-mono">
          เอกสารนี้จัดทำขึ้นเพื่อให้เป็นไปตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) แห่งราชอาณาจักรไทย
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl py-12 animate-fade-in text-brand-ink font-sans space-y-10">
      <header className="space-y-3 border-b border-brand-ink pb-8">
        <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-brand-pink uppercase tracking-widest">
          <ShieldCheck size={14} /> Privacy Policy
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tight leading-none">
          Privacy<br />Disclosure (PDPA)
        </h1>
        <p className="text-xs text-stone-500 font-mono">
          Effective: 1 January 2025 &nbsp;|&nbsp; Version 1.0
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-base font-bold uppercase tracking-wider">1. Data Controller</h2>
        <p className="text-sm leading-relaxed text-stone-700">
          The Chulalongkorn University Golf Club (CU Golf Club), a student organisation operating under the supervision of
          Chulalongkorn University, Phayathai Road, Pathumwan, Bangkok 10330, Thailand,
          is the data controller under the Personal Data Protection Act B.E. 2562 (PDPA).
        </p>
        <p className="text-sm leading-relaxed text-stone-700">
          Contact: <span className="font-semibold">golf@chula.ac.th</span>
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-base font-bold uppercase tracking-wider">2. Personal Data Collected</h2>
        <p className="text-sm leading-relaxed text-stone-700">When you register as a member, we collect the following:</p>
        <ul className="list-disc list-inside text-sm text-stone-700 space-y-1 pl-2">
          <li>Prefix, first name and last name</li>
          <li>Email address</li>
          <li>Student ID number</li>
          <li>Faculty and academic year</li>
          <li>Instagram handle (optional)</li>
          <li>Line ID (optional)</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-base font-bold uppercase tracking-wider">3. Purpose & Legal Basis</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-brand-ink/20 border-collapse">
            <thead>
              <tr className="bg-brand-ink text-brand-neutral font-mono uppercase tracking-wider">
                <th className="p-3 text-left border border-brand-ink/20">Purpose</th>
                <th className="p-3 text-left border border-brand-ink/20">Legal Basis</th>
              </tr>
            </thead>
            <tbody className="text-stone-700">
              <tr className="border-b border-brand-ink/10">
                <td className="p-3 border border-brand-ink/10">Member authentication and login</td>
                <td className="p-3 border border-brand-ink/10">Performance of contract (§24(3))</td>
              </tr>
              <tr className="border-b border-brand-ink/10 bg-brand-stone/30">
                <td className="p-3 border border-brand-ink/10">Maintaining the club membership register</td>
                <td className="p-3 border border-brand-ink/10">Performance of contract (§24(3))</td>
              </tr>
              <tr className="border-b border-brand-ink/10">
                <td className="p-3 border border-brand-ink/10">Club activity communications</td>
                <td className="p-3 border border-brand-ink/10">Consent (§19)</td>
              </tr>
              <tr className="border-b border-brand-ink/10 bg-brand-stone/30">
                <td className="p-3 border border-brand-ink/10">Display on public Varsity Roster</td>
                <td className="p-3 border border-brand-ink/10">Consent (§19)</td>
              </tr>
              <tr>
                <td className="p-3 border border-brand-ink/10">System security and integrity</td>
                <td className="p-3 border border-brand-ink/10">Legitimate interests (§24(5))</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-base font-bold uppercase tracking-wider">4. Retention Period</h2>
        <p className="text-sm leading-relaxed text-stone-700">
          We retain your personal data for the duration of your membership and for up to <span className="font-semibold">3 years</span> after
          your membership ends or you graduate, for club record-keeping purposes, unless you request earlier deletion.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-base font-bold uppercase tracking-wider">5. Third-Party Disclosure</h2>
        <p className="text-sm leading-relaxed text-stone-700">
          We do not sell or rent your personal data. We may share it only with:
        </p>
        <ul className="list-disc list-inside text-sm text-stone-700 space-y-1 pl-2">
          <li>Chulalongkorn University (Sports Office) for inter-university competition management</li>
          <li>Thailand University Golf Association (TUGA) for tournament registration</li>
          <li>Supabase Inc. (cloud database processor) under appropriate data processing safeguards</li>
          <li>Governmental authorities when legally required</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-base font-bold uppercase tracking-wider">6. Your Rights</h2>
        <p className="text-sm leading-relaxed text-stone-700">Under the PDPA you have the right to:</p>
        <ul className="text-sm text-stone-700 space-y-2 pl-2">
          {[
            ["Access", "Request a copy of the personal data we hold about you"],
            ["Rectification", "Request correction of inaccurate or incomplete data"],
            ["Erasure", "Request deletion of your personal data (subject to legal obligations)"],
            ["Restriction", "Request that we temporarily suspend processing of your data"],
            ["Objection", "Object to processing based on legitimate interests"],
            ["Portability", "Receive your data in a machine-readable format"],
            ["Withdraw consent", "Withdraw consent at any time without affecting prior processing"],
          ].map(([right, desc]) => (
            <li key={right} className="flex gap-2">
              <span className="font-semibold text-brand-ink shrink-0">• {right}:</span>
              <span>{desc}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-stone-700">
          Submit requests to: <span className="font-semibold">golf@chula.ac.th</span>. We will respond within 30 days.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-base font-bold uppercase tracking-wider">7. Data Security</h2>
        <p className="text-sm leading-relaxed text-stone-700">
          We implement appropriate technical safeguards including TLS encryption in transit, Row-Level Security access controls,
          and storage on SOC 2-certified cloud infrastructure.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-base font-bold uppercase tracking-wider">8. Complaints</h2>
        <p className="text-sm leading-relaxed text-stone-700">
          If you have concerns about our data processing, you have the right to lodge a complaint with the
          Personal Data Protection Committee (PDPC) of Thailand under the PDPA B.E. 2562.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-base font-bold uppercase tracking-wider">9. Policy Updates</h2>
        <p className="text-sm leading-relaxed text-stone-700">
          We may update this policy periodically. Material changes will be notified via the email address you registered.
          The effective date at the top of this page will always reflect the latest version.
        </p>
      </section>

      <div className="border-t border-brand-ink/20 pt-6 text-xs text-stone-400 font-mono">
        This document is prepared in compliance with the Personal Data Protection Act B.E. 2562 (PDPA) of the Kingdom of Thailand.
      </div>
    </div>
  );
}
