import { useLanguage } from "../utils/LanguageContext";
import { ShieldCheck, Mail } from "lucide-react";

const CONTACT_EMAIL = "tigerpukk@gmail.com";

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-base font-bold uppercase tracking-wider border-b border-brand-ink/10 pb-2">
        {number}. {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed text-stone-700">{children}</p>;
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-brand-stone/40 border border-brand-ink/15 p-4 text-sm text-stone-700 leading-relaxed space-y-1">
      {children}
    </div>
  );
}

export default function PrivacyView() {
  const { language } = useLanguage();

  if (language === "th") {
    return (
      <div className="mx-auto max-w-3xl py-12 animate-fade-in text-brand-ink font-sans space-y-10">

        {/* Header */}
        <header className="space-y-4 border-b border-brand-ink pb-8">
          <div className="flex items-center gap-2 font-display text-[10px] font-bold text-brand-pink uppercase tracking-widest">
            <ShieldCheck size={14} /> นโยบายความเป็นส่วนตัว · PDPA
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tight leading-none">
            นโยบายการคุ้มครอง<br />ข้อมูลส่วนบุคคล
          </h1>
          <div className="text-xs text-stone-500 font-display space-y-0.5">
            <p>มีผลบังคับใช้: 1 มกราคม พ.ศ. 2568 &nbsp;|&nbsp; เวอร์ชัน 2.0</p>
            <p>จัดทำตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562</p>
          </div>
          <InfoBox>
            <p className="font-semibold text-brand-ink">สรุปสาระสำคัญ</p>
            <p>ชมรมกอล์ฟจุฬาลงกรณ์มหาวิทยาลัยเก็บรวบรวมข้อมูลส่วนบุคคลของคุณเพื่อการบริหารสมาชิกและการจัดกิจกรรมชมรมเท่านั้น เราไม่ขาย ไม่ให้เช่า และไม่เปิดเผยข้อมูลของคุณแก่บุคคลภายนอกโดยไม่ได้รับความยินยอม คุณมีสิทธิเต็มที่ในการเข้าถึง แก้ไข และลบข้อมูลของคุณได้ทุกเมื่อ</p>
          </InfoBox>
        </header>

        {/* 1 */}
        <Section number="1" title="ผู้ควบคุมข้อมูลส่วนบุคคล">
          <P>
            <strong>ชมรมกอล์ฟจุฬาลงกรณ์มหาวิทยาลัย (CU Golf Club)</strong> เป็นชมรมนิสิตที่จดทะเบียนภายใต้สำนักงานกิจการนิสิต จุฬาลงกรณ์มหาวิทยาลัย
            ซึ่งทำหน้าที่เป็นผู้ควบคุมข้อมูลส่วนบุคคล (Data Controller) ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
          </P>
          <InfoBox>
            <p><strong>ชื่อองค์กร:</strong> ชมรมกอล์ฟจุฬาลงกรณ์มหาวิทยาลัย (CU Golf Club)</p>
            <p><strong>สังกัด:</strong> สำนักงานกีฬา จุฬาลงกรณ์มหาวิทยาลัย</p>
            <p><strong>ที่อยู่:</strong> ถนนพญาไท แขวงวังใหม่ เขตปทุมวัน กรุงเทพมหานคร 10330</p>
            <p><strong>อีเมลติดต่อ:</strong> <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-brand-ink underline hover:text-brand-pink">{CONTACT_EMAIL}</a></p>
          </InfoBox>
          <P>
            นโยบายนี้อธิบายถึงวิธีที่เราเก็บรวบรวม ใช้ เปิดเผย และคุ้มครองข้อมูลส่วนบุคคลของคุณในฐานะสมาชิกหรือผู้สนใจสมัครสมาชิกชมรม
            กรุณาอ่านนโยบายนี้อย่างละเอียดก่อนการลงทะเบียน
          </P>
        </Section>

        {/* 2 */}
        <Section number="2" title="ข้อมูลส่วนบุคคลที่เราเก็บรวบรวม">
          <P>เราเก็บรวบรวมข้อมูลส่วนบุคคลของคุณโดยตรงเมื่อคุณสมัครสมาชิกผ่านเว็บไซต์ชมรม ข้อมูลที่เก็บรวบรวมมีดังต่อไปนี้:</P>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-display font-bold uppercase tracking-wider text-stone-400 mb-1">ข้อมูลบังคับ</p>
              <table className="w-full text-xs border border-brand-ink/20 border-collapse">
                <thead>
                  <tr className="bg-brand-ink text-brand-neutral font-display uppercase">
                    <th className="p-2.5 text-left border border-brand-ink/20">ประเภทข้อมูล</th>
                    <th className="p-2.5 text-left border border-brand-ink/20">รายละเอียด</th>
                    <th className="p-2.5 text-left border border-brand-ink/20">เหตุผลที่จำเป็น</th>
                  </tr>
                </thead>
                <tbody className="text-stone-700">
                  {[
                    ["คำนำหน้าชื่อ", "นาย / นางสาว", "การระบุตัวตนในทะเบียนสมาชิก"],
                    ["ชื่อ-นามสกุล", "ชื่อเต็มตามบัตรนิสิต", "ยืนยันตัวตนและแสดงในทะเบียนนักกีฬา"],
                    ["ที่อยู่อีเมล", "อีเมลจุฬาฯ หรืออีเมลส่วนตัว", "การติดต่อและการเข้าสู่ระบบ"],
                    ["รหัสนิสิต", "รหัสนิสิต 10 หลัก", "ยืนยันสถานะนิสิตจุฬาฯ และการเข้าสู่ระบบ"],
                    ["คณะ", "คณะที่ศึกษาอยู่", "สถิติสมาชิกและการจัดกลุ่ม"],
                    ["ชั้นปี", "ปีการศึกษาปัจจุบัน", "สถิติสมาชิกและการจัดทีม"],
                  ].map(([type, detail, reason], i) => (
                    <tr key={i} className={i % 2 === 1 ? "bg-brand-stone/30" : ""}>
                      <td className="p-2.5 border border-brand-ink/10 font-semibold">{type}</td>
                      <td className="p-2.5 border border-brand-ink/10">{detail}</td>
                      <td className="p-2.5 border border-brand-ink/10 text-stone-500">{reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <p className="text-xs font-display font-bold uppercase tracking-wider text-stone-400 mb-1">ข้อมูลเพิ่มเติม (ไม่บังคับ)</p>
              <table className="w-full text-xs border border-brand-ink/20 border-collapse">
                <thead>
                  <tr className="bg-brand-ink/70 text-brand-neutral font-display uppercase">
                    <th className="p-2.5 text-left border border-brand-ink/20">ประเภทข้อมูล</th>
                    <th className="p-2.5 text-left border border-brand-ink/20">วัตถุประสงค์</th>
                  </tr>
                </thead>
                <tbody className="text-stone-700">
                  <tr>
                    <td className="p-2.5 border border-brand-ink/10 font-semibold">บัญชี Instagram</td>
                    <td className="p-2.5 border border-brand-ink/10">การติดตามกิจกรรมชมรมบนโซเชียลมีเดีย</td>
                  </tr>
                  <tr className="bg-brand-stone/30">
                    <td className="p-2.5 border border-brand-ink/10 font-semibold">Line ID</td>
                    <td className="p-2.5 border border-brand-ink/10">การสื่อสารและการแจ้งเตือนภายในชมรม</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <P>เราไม่เก็บข้อมูลที่อ่อนไหว (Sensitive Personal Data) ตามมาตรา 26 แห่ง PDPA เช่น เชื้อชาติ ความเชื่อทางศาสนา ข้อมูลสุขภาพ หรือประวัติอาชญากรรม</P>
        </Section>

        {/* 3 */}
        <Section number="3" title="วัตถุประสงค์และฐานกฎหมายในการประมวลผลข้อมูล">
          <P>เราประมวลผลข้อมูลส่วนบุคคลของคุณภายใต้ฐานกฎหมายที่ชัดเจนตาม PDPA มาตรา 24 และมาตรา 19 ดังต่อไปนี้:</P>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-brand-ink/20 border-collapse">
              <thead>
                <tr className="bg-brand-ink text-brand-neutral font-display uppercase tracking-wider">
                  <th className="p-3 text-left border border-brand-ink/20">วัตถุประสงค์</th>
                  <th className="p-3 text-left border border-brand-ink/20">ข้อมูลที่ใช้</th>
                  <th className="p-3 text-left border border-brand-ink/20">ฐานกฎหมาย</th>
                </tr>
              </thead>
              <tbody className="text-stone-700">
                {[
                  ["การยืนยันตัวตนและเข้าสู่ระบบ", "อีเมล, รหัสนิสิต", "การปฏิบัติตามสัญญา (มาตรา 24(3))"],
                  ["การจัดทำทะเบียนสมาชิกชมรม", "ชื่อ, คณะ, ชั้นปี", "การปฏิบัติตามสัญญา (มาตรา 24(3))"],
                  ["การแสดงผลทะเบียนนักกีฬาสาธารณะ", "ชื่อ, คณะ, แฮนดิแคป", "ความยินยอม (มาตรา 19)"],
                  ["การแจ้งเตือนกิจกรรมและการแข่งขัน", "อีเมล, Line ID", "ความยินยอม (มาตรา 19)"],
                  ["การส่งข้อมูลเข้าแข่งขันระหว่างมหาวิทยาลัย", "ชื่อ, รหัสนิสิต, คณะ", "การปฏิบัติตามสัญญา (มาตรา 24(3))"],
                  ["การรักษาความปลอดภัยของระบบ", "บันทึกการใช้งาน (Log)", "ประโยชน์อันชอบธรรม (มาตรา 24(5))"],
                  ["การวิเคราะห์สถิติภายในชมรม (ไม่ระบุตัวตน)", "คณะ, ชั้นปี", "ประโยชน์อันชอบธรรม (มาตรา 24(5))"],
                ].map(([purpose, data, basis], i) => (
                  <tr key={i} className={i % 2 === 1 ? "bg-brand-stone/30" : ""}>
                    <td className="p-2.5 border border-brand-ink/10">{purpose}</td>
                    <td className="p-2.5 border border-brand-ink/10 text-stone-500">{data}</td>
                    <td className="p-2.5 border border-brand-ink/10 font-medium">{basis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <P>
            เมื่อเราอาศัยความยินยอมเป็นฐานกฎหมาย คุณมีสิทธิถอนความยินยอมได้ทุกเมื่อโดยติดต่อเราที่อีเมลด้านล่าง
            การถอนความยินยอมไม่กระทบต่อความชอบด้วยกฎหมายของการประมวลผลที่ได้ดำเนินการไปก่อนหน้านั้น
          </P>
        </Section>

        {/* 4 */}
        <Section number="4" title="ระยะเวลาการเก็บรักษาข้อมูล">
          <P>เราเก็บรักษาข้อมูลส่วนบุคคลของคุณตามระยะเวลาที่จำเป็นและสมเหตุสมผลดังนี้:</P>
          <InfoBox>
            <p>• <strong>ระหว่างเป็นสมาชิกชมรม:</strong> เก็บข้อมูลทั้งหมดตลอดระยะเวลาสมาชิกภาพ</p>
            <p>• <strong>หลังพ้นสมาชิกภาพหรือสำเร็จการศึกษา:</strong> เก็บข้อมูลต่ออีก <strong>3 ปี</strong> เพื่อบันทึกประวัติชมรมและการอ้างอิงในอนาคต</p>
            <p>• <strong>กรณีร้องขอให้ลบข้อมูล:</strong> ดำเนินการลบภายใน 30 วันนับจากวันที่ได้รับคำร้อง เว้นแต่มีเหตุผลทางกฎหมายให้เก็บต่อ</p>
            <p>• <strong>บันทึกการเข้าสู่ระบบ (Log):</strong> เก็บไว้ 90 วันเพื่อความปลอดภัยของระบบ</p>
          </InfoBox>
          <P>
            เมื่อครบกำหนดระยะเวลาการเก็บรักษา เราจะทำลายหรือทำให้ข้อมูลนั้นไม่สามารถระบุตัวตนได้ (Anonymization)
            โดยใช้วิธีการที่ปลอดภัยและไม่สามารถกู้คืนได้
          </P>
        </Section>

        {/* 5 */}
        <Section number="5" title="การเปิดเผยข้อมูลแก่บุคคลภายนอก">
          <P>
            เราให้ความสำคัญกับความเป็นส่วนตัวของคุณอย่างสูงสุด <strong>เราไม่ขาย ไม่ให้เช่า และไม่เผยแพร่ข้อมูลส่วนบุคคลของคุณแก่บุคคลภายนอกเพื่อวัตถุประสงค์ทางการค้า</strong>
            เราอาจแบ่งปันข้อมูลเฉพาะในกรณีต่อไปนี้เท่านั้น โดยจำกัดเฉพาะข้อมูลที่จำเป็นต่อวัตถุประสงค์นั้น:
          </P>
          <table className="w-full text-xs border border-brand-ink/20 border-collapse">
            <thead>
              <tr className="bg-brand-ink text-brand-neutral font-display uppercase tracking-wider">
                <th className="p-3 text-left border border-brand-ink/20">ผู้รับข้อมูล</th>
                <th className="p-3 text-left border border-brand-ink/20">วัตถุประสงค์</th>
                <th className="p-3 text-left border border-brand-ink/20">ข้อมูลที่แบ่งปัน</th>
              </tr>
            </thead>
            <tbody className="text-stone-700">
              {[
                ["สำนักงานกีฬา จุฬาลงกรณ์มหาวิทยาลัย", "การลงทะเบียนแข่งขันระหว่างมหาวิทยาลัย", "ชื่อ, รหัสนิสิต, คณะ"],
                ["สมาคมกอล์ฟมหาวิทยาลัยไทย (TUGA)", "การลงทะเบียนในรายการแข่งขันระดับชาติ", "ชื่อ, สังกัดมหาวิทยาลัย"],
                ["Supabase Inc. (ผู้ให้บริการฐานข้อมูล)", "การจัดเก็บและประมวลผลข้อมูลในฐานะ Data Processor", "ข้อมูลสมาชิกทั้งหมด (เข้ารหัสและมีมาตรการปกป้อง)"],
                ["หน่วยงานรัฐ", "เมื่อมีหมาย คำสั่งศาล หรือกฎหมายกำหนด", "เฉพาะที่ร้องขอ"],
              ].map(([recipient, purpose, data], i) => (
                <tr key={i} className={i % 2 === 1 ? "bg-brand-stone/30" : ""}>
                  <td className="p-2.5 border border-brand-ink/10 font-semibold">{recipient}</td>
                  <td className="p-2.5 border border-brand-ink/10">{purpose}</td>
                  <td className="p-2.5 border border-brand-ink/10 text-stone-500">{data}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <P>
            ผู้ให้บริการภายนอกทุกรายที่เข้าถึงข้อมูลส่วนบุคคลของคุณจะต้องมีข้อตกลงการประมวลผลข้อมูล (Data Processing Agreement)
            ที่มีมาตรการคุ้มครองข้อมูลที่เทียบเท่าหรือสูงกว่ามาตรฐานที่ PDPA กำหนด
          </P>
        </Section>

        {/* 6 */}
        <Section number="6" title="สิทธิของเจ้าของข้อมูลส่วนบุคคล">
          <P>ภายใต้ PDPA คุณในฐานะเจ้าของข้อมูลส่วนบุคคลมีสิทธิดังต่อไปนี้ ซึ่งสามารถใช้ได้โดยการติดต่อเราทางอีเมล:</P>
          <div className="space-y-2">
            {[
              ["สิทธิในการได้รับแจ้ง (Right to be Informed)", "มาตรา 23", "ได้รับแจ้งถึงวิธีการที่เราใช้ข้อมูลของคุณก่อนหรือในขณะเก็บรวบรวม นโยบายนี้คือการแจ้งดังกล่าว"],
              ["สิทธิในการเข้าถึงข้อมูล (Right of Access)", "มาตรา 30", "ขอสำเนาข้อมูลส่วนบุคคลของคุณที่เราเก็บไว้ และตรวจสอบว่าเราประมวลผลข้อมูลนั้นอย่างไร"],
              ["สิทธิในการแก้ไขข้อมูล (Right to Rectification)", "มาตรา 35", "ขอแก้ไขข้อมูลที่ไม่ถูกต้อง ไม่ครบถ้วน หรือทำให้เกิดความเข้าใจผิด"],
              ["สิทธิในการลบข้อมูล (Right to Erasure)", "มาตรา 33", "ขอให้ลบหรือทำลายข้อมูลส่วนบุคคลของคุณ เมื่อไม่มีเหตุผลทางกฎหมายให้เก็บต่อ"],
              ["สิทธิในการระงับการใช้ข้อมูล (Right to Restriction)", "มาตรา 34", "ขอให้ระงับการประมวลผลข้อมูลชั่วคราวในระหว่างที่มีข้อโต้แย้งหรืออยู่ระหว่างการตรวจสอบ"],
              ["สิทธิในการโอนย้ายข้อมูล (Right to Portability)", "มาตรา 31", "ขอรับข้อมูลของคุณในรูปแบบที่อ่านได้ด้วยเครื่อง (เช่น JSON หรือ CSV) หรือโอนข้อมูลไปยังผู้ควบคุมรายอื่น"],
              ["สิทธิในการคัดค้าน (Right to Object)", "มาตรา 32", "คัดค้านการประมวลผลที่อาศัยฐานประโยชน์อันชอบธรรม รวมถึงการส่งข้อมูลเพื่อการตลาดโดยตรง"],
              ["สิทธิในการถอนความยินยอม (Right to Withdraw Consent)", "มาตรา 19", "ถอนความยินยอมที่เคยให้ไว้ได้ทุกเมื่อ โดยไม่กระทบต่อการประมวลผลที่ดำเนินการไปก่อนหน้า"],
            ].map(([right, section, desc], i) => (
              <div key={i} className="border border-brand-ink/10 p-3 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-brand-ink">{right}</p>
                  <span className="font-display text-[9px] text-brand-pink shrink-0">{section}</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <InfoBox>
            <p className="font-semibold text-brand-ink">วิธีการยื่นคำขอใช้สิทธิ</p>
            <p>ส่งคำขอมาที่: <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold underline hover:text-brand-pink">{CONTACT_EMAIL}</a></p>
            <p>ระบุชื่อ รหัสนิสิต และสิทธิที่ต้องการใช้</p>
            <p>เราจะดำเนินการและแจ้งผลภายใน <strong>30 วัน</strong> นับจากวันที่ได้รับคำร้อง หากต้องใช้เวลานานกว่านั้น เราจะแจ้งให้ทราบล่วงหน้า</p>
          </InfoBox>
        </Section>

        {/* 7 */}
        <Section number="7" title="มาตรการรักษาความปลอดภัยของข้อมูล">
          <P>เราดำเนินการมาตรการทางเทคนิคและการบริหารจัดการที่เหมาะสมเพื่อคุ้มครองข้อมูลส่วนบุคคลของคุณ ดังนี้:</P>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              ["การเข้ารหัสข้อมูล", "ข้อมูลทั้งหมดที่รับส่งระหว่างเบราว์เซอร์และเซิร์ฟเวอร์ได้รับการเข้ารหัสด้วย TLS 1.3"],
              ["การควบคุมการเข้าถึง", "ระบบ Row-Level Security (RLS) ของ Supabase จำกัดการเข้าถึงข้อมูลตามบทบาทผู้ใช้"],
              ["โครงสร้างพื้นฐานที่ปลอดภัย", "จัดเก็บบนเซิร์ฟเวอร์คลาวด์ที่ผ่านการรับรองมาตรฐาน SOC 2 Type II"],
              ["การยืนยันตัวตนสองชั้น", "การเข้าสู่ระบบต้องใช้ทั้งอีเมลและรหัสนิสิต ลดความเสี่ยงการเข้าถึงโดยไม่ได้รับอนุญาต"],
              ["การจำกัดสิทธิ์ผู้ดูแลระบบ", "เฉพาะผู้ดูแลระบบที่ได้รับมอบหมายเท่านั้นสามารถเข้าถึงและแก้ไขข้อมูลสมาชิกได้"],
              ["การบันทึกกิจกรรม", "บันทึก Log การเข้าใช้งานระบบเพื่อตรวจสอบและป้องกันการเข้าถึงโดยไม่ได้รับอนุญาต"],
            ].map(([title, desc], i) => (
              <div key={i} className="border border-brand-ink/10 bg-brand-stone/20 p-3 space-y-1">
                <p className="text-xs font-semibold text-brand-ink">✓ {title}</p>
                <p className="text-xs text-stone-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <P>
            อย่างไรก็ตาม ไม่มีระบบรักษาความปลอดภัยใดที่สมบูรณ์แบบ 100% หากคุณพบหรือสงสัยว่ามีการละเมิดข้อมูลส่วนบุคคล
            กรุณาแจ้งเราทันทีที่ <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-brand-ink underline hover:text-brand-pink">{CONTACT_EMAIL}</a> เราจะดำเนินการสอบสวนและแจ้งต่อหน่วยงานที่เกี่ยวข้องภายใน 72 ชั่วโมงตามที่ PDPA กำหนด
          </P>
        </Section>

        {/* 8 */}
        <Section number="8" title="คุกกี้และข้อมูลการใช้งาน">
          <P>
            เว็บไซต์ชมรมใช้ <strong>Local Storage</strong> ของเบราว์เซอร์เพื่อบันทึกการตั้งค่าภาษาและสถานะการเข้าสู่ระบบของคุณเท่านั้น
            เราไม่ใช้คุกกี้เพื่อการติดตามพฤติกรรม (Tracking Cookies) หรือโฆษณา และไม่มีการส่งข้อมูลการใช้งานไปยังบริการวิเคราะห์ภายนอก
          </P>
          <InfoBox>
            <p><strong>Local Storage ที่ใช้:</strong></p>
            <p>• <code className="text-xs bg-brand-ink/10 px-1">cu-golf-club-language</code> — การตั้งค่าภาษา (ไทย/อังกฤษ)</p>
            <p>• <code className="text-xs bg-brand-ink/10 px-1">cu-golf-club-member-token</code> — Token การเข้าสู่ระบบสมาชิก (หมดอายุเมื่อออกจากระบบ)</p>
            <p>• <code className="text-xs bg-brand-ink/10 px-1">cu-golf-club-member-user</code> — ข้อมูลโปรไฟล์สมาชิกที่แคชไว้</p>
          </InfoBox>
          <P>คุณสามารถล้างข้อมูล Local Storage ได้ทุกเมื่อผ่านการตั้งค่าเบราว์เซอร์ของคุณ</P>
        </Section>

        {/* 9 */}
        <Section number="9" title="การร้องเรียนต่อหน่วยงานกำกับดูแล">
          <P>
            หากคุณเชื่อว่าเราประมวลผลข้อมูลส่วนบุคคลของคุณโดยไม่ชอบด้วยกฎหมาย หรือไม่เป็นไปตาม PDPA
            คุณมีสิทธิยื่นเรื่องร้องเรียนต่อหน่วยงานกำกับดูแลได้ดังนี้:
          </P>
          <InfoBox>
            <p className="font-semibold text-brand-ink">สำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล (สคส.)</p>
            <p>Personal Data Protection Committee Office (PDPC)</p>
            <p>กระทรวงดิจิทัลเพื่อเศรษฐกิจและสังคม</p>
            <p>เราขอแนะนำให้ติดต่อเราก่อนเพื่อพยายามแก้ไขปัญหาร่วมกัน ก่อนยื่นเรื่องต่อหน่วยงานกำกับดูแล</p>
          </InfoBox>
        </Section>

        {/* 10 */}
        <Section number="10" title="การเปลี่ยนแปลงนโยบายความเป็นส่วนตัว">
          <P>
            เราอาจปรับปรุงนโยบายนี้เป็นครั้งคราวเพื่อให้สอดคล้องกับการเปลี่ยนแปลงทางกฎหมาย การดำเนินงานของชมรม
            หรือแนวปฏิบัติที่ดีที่สุดด้านการคุ้มครองข้อมูล
          </P>
          <P>
            <strong>การเปลี่ยนแปลงที่มีนัยสำคัญ</strong> จะแจ้งให้สมาชิกทราบล่วงหน้าอย่างน้อย <strong>30 วัน</strong> ผ่านอีเมลที่ลงทะเบียนไว้
            และจะระบุสรุปการเปลี่ยนแปลงไว้ที่ด้านบนของหน้านี้ การใช้งานเว็บไซต์ต่อเนื่องหลังจากการแจ้งถือว่าคุณยอมรับนโยบายที่ปรับปรุงแล้ว
          </P>
          <P>วันที่มีผลบังคับใช้ของเวอร์ชันล่าสุดจะปรากฏที่ส่วนหัวของเอกสารนี้เสมอ</P>
        </Section>

        {/* Contact */}
        <section className="bg-brand-ink text-brand-neutral p-6 space-y-3">
          <div className="flex items-center gap-2 font-display text-[10px] font-bold text-brand-pink uppercase tracking-widest">
            <Mail size={12} /> ติดต่อเรา
          </div>
          <p className="text-sm leading-relaxed">
            หากมีคำถามเกี่ยวกับนโยบายนี้ ต้องการใช้สิทธิตาม PDPA หรือต้องการรายงานปัญหาด้านความเป็นส่วนตัว
            กรุณาติดต่อเราที่:
          </p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-2 font-display text-sm font-bold text-brand-pink hover:underline">
            <Mail size={14} /> {CONTACT_EMAIL}
          </a>
          <p className="text-xs text-stone-400">เราจะตอบกลับภายใน 3 วันทำการ</p>
        </section>

        <div className="border-t border-brand-ink/20 pt-6 text-xs text-stone-400 font-display space-y-1">
          <p>เอกสารนี้จัดทำขึ้นเพื่อให้เป็นไปตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 แห่งราชอาณาจักรไทย</p>
          <p>© {new Date().getFullYear()} ชมรมกอล์ฟจุฬาลงกรณ์มหาวิทยาลัย · สงวนลิขสิทธิ์</p>
        </div>
      </div>
    );
  }

  // English version
  return (
    <div className="mx-auto max-w-3xl py-12 animate-fade-in text-brand-ink font-sans space-y-10">

      <header className="space-y-4 border-b border-brand-ink pb-8">
        <div className="flex items-center gap-2 font-display text-[10px] font-bold text-brand-pink uppercase tracking-widest">
          <ShieldCheck size={14} /> Privacy Policy · PDPA
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tight leading-none">
          Privacy<br />Disclosure (PDPA)
        </h1>
        <div className="text-xs text-stone-500 font-display space-y-0.5">
          <p>Effective: 1 January 2025 &nbsp;|&nbsp; Version 2.0</p>
          <p>Prepared under the Personal Data Protection Act B.E. 2562 (PDPA), Kingdom of Thailand</p>
        </div>
        <InfoBox>
          <p className="font-semibold text-brand-ink">Summary</p>
          <p>CU Golf Club collects your personal data solely to administer membership and club activities. We do not sell, rent, or disclose your data to third parties without your consent. You have full rights to access, correct, and delete your data at any time.</p>
        </InfoBox>
      </header>

      <Section number="1" title="Data Controller">
        <P>
          <strong>Chulalongkorn University Golf Club (CU Golf Club)</strong> is a registered student organisation under the Student Affairs Office of Chulalongkorn University and acts as the Data Controller under the Personal Data Protection Act B.E. 2562 (PDPA).
        </P>
        <InfoBox>
          <p><strong>Organisation:</strong> Chulalongkorn University Golf Club (CU Golf Club)</p>
          <p><strong>Affiliation:</strong> Sports Office, Chulalongkorn University</p>
          <p><strong>Address:</strong> Phayathai Road, Pathumwan, Bangkok 10330, Thailand</p>
          <p><strong>Contact Email:</strong> <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-brand-ink underline hover:text-brand-pink">{CONTACT_EMAIL}</a></p>
        </InfoBox>
        <P>This policy explains how we collect, use, disclose, and protect your personal data as a club member or prospective member. Please read it carefully before registering.</P>
      </Section>

      <Section number="2" title="Personal Data We Collect">
        <P>We collect personal data directly from you when you register as a member through the club website. The data collected is as follows:</P>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-display font-bold uppercase tracking-wider text-stone-400 mb-1">Required Data</p>
            <table className="w-full text-xs border border-brand-ink/20 border-collapse">
              <thead>
                <tr className="bg-brand-ink text-brand-neutral font-display uppercase">
                  <th className="p-2.5 text-left border border-brand-ink/20">Data Type</th>
                  <th className="p-2.5 text-left border border-brand-ink/20">Detail</th>
                  <th className="p-2.5 text-left border border-brand-ink/20">Why Required</th>
                </tr>
              </thead>
              <tbody className="text-stone-700">
                {[
                  ["Prefix", "Mr. / Ms.", "Identification in the membership register"],
                  ["Full Name", "As per student ID card", "Identity verification and roster display"],
                  ["Email Address", "Chula or personal email", "Login and communications"],
                  ["Student ID", "10-digit student number", "Verify Chula enrollment and login"],
                  ["Faculty", "Faculty of study", "Member statistics and grouping"],
                  ["Academic Year", "Current year of study", "Member statistics and team management"],
                ].map(([type, detail, reason], i) => (
                  <tr key={i} className={i % 2 === 1 ? "bg-brand-stone/30" : ""}>
                    <td className="p-2.5 border border-brand-ink/10 font-semibold">{type}</td>
                    <td className="p-2.5 border border-brand-ink/10">{detail}</td>
                    <td className="p-2.5 border border-brand-ink/10 text-stone-500">{reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <p className="text-xs font-display font-bold uppercase tracking-wider text-stone-400 mb-1">Optional Data</p>
            <table className="w-full text-xs border border-brand-ink/20 border-collapse">
              <thead>
                <tr className="bg-brand-ink/70 text-brand-neutral font-display uppercase">
                  <th className="p-2.5 text-left border border-brand-ink/20">Data Type</th>
                  <th className="p-2.5 text-left border border-brand-ink/20">Purpose</th>
                </tr>
              </thead>
              <tbody className="text-stone-700">
                <tr>
                  <td className="p-2.5 border border-brand-ink/10 font-semibold">Instagram Handle</td>
                  <td className="p-2.5 border border-brand-ink/10">Following club activities on social media</td>
                </tr>
                <tr className="bg-brand-stone/30">
                  <td className="p-2.5 border border-brand-ink/10 font-semibold">Line ID</td>
                  <td className="p-2.5 border border-brand-ink/10">Club communications and notifications</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <P>We do not collect sensitive personal data (as defined in PDPA §26) such as race, religion, health data, or criminal records.</P>
      </Section>

      <Section number="3" title="Purpose & Legal Basis for Processing">
        <P>We process your personal data under a clear legal basis as specified in PDPA §24 and §19:</P>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-brand-ink/20 border-collapse">
            <thead>
              <tr className="bg-brand-ink text-brand-neutral font-display uppercase tracking-wider">
                <th className="p-3 text-left border border-brand-ink/20">Purpose</th>
                <th className="p-3 text-left border border-brand-ink/20">Data Used</th>
                <th className="p-3 text-left border border-brand-ink/20">Legal Basis</th>
              </tr>
            </thead>
            <tbody className="text-stone-700">
              {[
                ["Member authentication and login", "Email, Student ID", "Performance of contract (§24(3))"],
                ["Maintaining the club membership register", "Name, Faculty, Year", "Performance of contract (§24(3))"],
                ["Display on public Varsity Roster", "Name, Faculty, Handicap", "Consent (§19)"],
                ["Activity and competition notifications", "Email, Line ID", "Consent (§19)"],
                ["Submission for inter-university competition", "Name, Student ID, Faculty", "Performance of contract (§24(3))"],
                ["System security and integrity", "Access logs", "Legitimate interests (§24(5))"],
                ["Anonymous club statistics", "Faculty, Year (anonymised)", "Legitimate interests (§24(5))"],
              ].map(([purpose, data, basis], i) => (
                <tr key={i} className={i % 2 === 1 ? "bg-brand-stone/30" : ""}>
                  <td className="p-2.5 border border-brand-ink/10">{purpose}</td>
                  <td className="p-2.5 border border-brand-ink/10 text-stone-500">{data}</td>
                  <td className="p-2.5 border border-brand-ink/10 font-medium">{basis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P>Where we rely on consent as our legal basis, you may withdraw that consent at any time by contacting us. Withdrawal does not affect the lawfulness of processing carried out prior to withdrawal.</P>
      </Section>

      <Section number="4" title="Retention Period">
        <P>We retain your personal data only for as long as necessary:</P>
        <InfoBox>
          <p>• <strong>During active membership:</strong> All data retained for the full duration of membership</p>
          <p>• <strong>After membership ends or graduation:</strong> Retained for a further <strong>3 years</strong> for club records and future reference</p>
          <p>• <strong>On erasure request:</strong> Deleted within 30 days of receiving the request, unless a legal obligation requires retention</p>
          <p>• <strong>System access logs:</strong> Retained for 90 days for security purposes</p>
        </InfoBox>
        <P>Upon expiry of the retention period, data is permanently deleted or anonymised using irreversible methods.</P>
      </Section>

      <Section number="5" title="Third-Party Disclosure">
        <P><strong>We do not sell, rent, or share your personal data for commercial purposes.</strong> We may share data only in the following circumstances, limited to what is strictly necessary:</P>
        <table className="w-full text-xs border border-brand-ink/20 border-collapse">
          <thead>
            <tr className="bg-brand-ink text-brand-neutral font-display uppercase tracking-wider">
              <th className="p-3 text-left border border-brand-ink/20">Recipient</th>
              <th className="p-3 text-left border border-brand-ink/20">Purpose</th>
              <th className="p-3 text-left border border-brand-ink/20">Data Shared</th>
            </tr>
          </thead>
          <tbody className="text-stone-700">
            {[
              ["CU Sports Office", "Inter-university competition registration", "Name, Student ID, Faculty"],
              ["Thailand University Golf Association (TUGA)", "National tournament registration", "Name, university affiliation"],
              ["Supabase Inc. (database processor)", "Cloud storage and processing as Data Processor", "All member data (encrypted, safeguarded)"],
              ["Governmental authorities", "When required by law, court order, or legal process", "Only what is specifically requested"],
            ].map(([recipient, purpose, data], i) => (
              <tr key={i} className={i % 2 === 1 ? "bg-brand-stone/30" : ""}>
                <td className="p-2.5 border border-brand-ink/10 font-semibold">{recipient}</td>
                <td className="p-2.5 border border-brand-ink/10">{purpose}</td>
                <td className="p-2.5 border border-brand-ink/10 text-stone-500">{data}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <P>All third-party processors are bound by Data Processing Agreements with protections equivalent to or exceeding PDPA requirements.</P>
      </Section>

      <Section number="6" title="Your Rights Under PDPA">
        <P>As a data subject you have the following rights, exercisable by contacting us by email:</P>
        <div className="space-y-2">
          {[
            ["Right to be Informed", "§23", "To be notified of how your data is used before or at the time of collection. This policy constitutes that notice."],
            ["Right of Access", "§30", "Request a copy of the personal data we hold about you and how we process it."],
            ["Right to Rectification", "§35", "Request correction of inaccurate, incomplete, or misleading data."],
            ["Right to Erasure", "§33", "Request deletion or destruction of your personal data when there is no legal ground to retain it."],
            ["Right to Restriction", "§34", "Request that we temporarily suspend processing while a dispute or review is in progress."],
            ["Right to Data Portability", "§31", "Receive your data in a machine-readable format (e.g. JSON or CSV) or transfer it to another controller."],
            ["Right to Object", "§32", "Object to processing based on legitimate interests, including direct marketing."],
            ["Right to Withdraw Consent", "§19", "Withdraw any previously given consent at any time without affecting prior lawful processing."],
          ].map(([right, section, desc], i) => (
            <div key={i} className="border border-brand-ink/10 p-3 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold text-brand-ink">{right}</p>
                <span className="font-display text-[9px] text-brand-pink shrink-0">{section}</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <InfoBox>
          <p className="font-semibold text-brand-ink">How to Submit a Rights Request</p>
          <p>Email: <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold underline hover:text-brand-pink">{CONTACT_EMAIL}</a></p>
          <p>Include your name, student ID, and the specific right you wish to exercise.</p>
          <p>We will respond within <strong>30 days</strong>. If additional time is needed, we will notify you in advance.</p>
        </InfoBox>
      </Section>

      <Section number="7" title="Data Security">
        <P>We implement appropriate technical and organisational measures to protect your personal data:</P>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            ["Encryption in Transit", "All data between your browser and our servers is encrypted using TLS 1.3."],
            ["Access Controls", "Supabase Row-Level Security (RLS) restricts data access by user role."],
            ["Certified Infrastructure", "Data stored on SOC 2 Type II certified cloud infrastructure."],
            ["Two-Factor Login", "Login requires both email and student ID, reducing unauthorised access risk."],
            ["Admin Privileges", "Only designated administrators can access and modify member data."],
            ["Activity Logging", "System access logs are maintained to detect and investigate unauthorised access."],
          ].map(([title, desc], i) => (
            <div key={i} className="border border-brand-ink/10 bg-brand-stone/20 p-3 space-y-1">
              <p className="text-xs font-semibold text-brand-ink">✓ {title}</p>
              <p className="text-xs text-stone-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <P>
          No security system is 100% infallible. If you discover or suspect a data breach, please notify us immediately at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-brand-ink underline hover:text-brand-pink">{CONTACT_EMAIL}</a>.
          We will investigate and, where required, notify the PDPC within 72 hours as mandated by the PDPA.
        </P>
      </Section>

      <Section number="8" title="Cookies & Local Storage">
        <P>
          This website uses browser <strong>Local Storage</strong> only to save your language preference and login session.
          We do not use tracking cookies or advertising cookies, and we do not send usage data to third-party analytics services.
        </P>
        <InfoBox>
          <p><strong>Local Storage keys used:</strong></p>
          <p>• <code className="text-xs bg-brand-ink/10 px-1">cu-golf-club-language</code> — Language preference (Thai / English)</p>
          <p>• <code className="text-xs bg-brand-ink/10 px-1">cu-golf-club-member-token</code> — Member session token (cleared on logout)</p>
          <p>• <code className="text-xs bg-brand-ink/10 px-1">cu-golf-club-member-user</code> — Cached member profile data</p>
        </InfoBox>
        <P>You can clear Local Storage at any time through your browser settings.</P>
      </Section>

      <Section number="9" title="Complaints to the Supervisory Authority">
        <P>
          If you believe we are processing your personal data unlawfully or in breach of the PDPA,
          you have the right to lodge a complaint with the supervisory authority:
        </P>
        <InfoBox>
          <p className="font-semibold text-brand-ink">Personal Data Protection Committee Office (PDPC)</p>
          <p>Ministry of Digital Economy and Society, Kingdom of Thailand</p>
          <p className="mt-2 text-stone-500">We encourage you to contact us first so we can attempt to resolve your concern before escalating to the PDPC.</p>
        </InfoBox>
      </Section>

      <Section number="10" title="Policy Updates">
        <P>
          We may update this policy periodically to reflect changes in law, club operations, or best practices in data protection.
        </P>
        <P>
          <strong>Material changes</strong> will be communicated to members at least <strong>30 days in advance</strong> via registered email,
          with a summary of changes noted at the top of this page. Continued use of the website after notification constitutes acceptance of the updated policy.
        </P>
        <P>The effective date of the latest version is always shown in the header of this document.</P>
      </Section>

      {/* Contact block */}
      <section className="bg-brand-ink text-brand-neutral p-6 space-y-3">
        <div className="flex items-center gap-2 font-display text-[10px] font-bold text-brand-pink uppercase tracking-widest">
          <Mail size={12} /> Contact Us
        </div>
        <p className="text-sm leading-relaxed">
          For questions about this policy, to exercise your PDPA rights, or to report a privacy concern, contact us at:
        </p>
        <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-2 font-display text-sm font-bold text-brand-pink hover:underline">
          <Mail size={14} /> {CONTACT_EMAIL}
        </a>
        <p className="text-xs text-stone-400">We aim to respond within 3 business days.</p>
      </section>

      <div className="border-t border-brand-ink/20 pt-6 text-xs text-stone-400 font-display space-y-1">
        <p>This document is prepared in compliance with the Personal Data Protection Act B.E. 2562 (PDPA) of the Kingdom of Thailand.</p>
        <p>© {new Date().getFullYear()} Chulalongkorn University Golf Club · All rights reserved.</p>
      </div>
    </div>
  );
}
