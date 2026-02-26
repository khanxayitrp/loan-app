<template>
  <div class="print-template" id="print-area">
    <div class="top-info">
      <p>ສະຖາບັນການເງິນ ຈຸລະພາກບໍ່ຮັບເງິນຝາກ ອິນຊີ ຈໍາກັດ ສໍານັກງານໃຫຍ່ຕັ້ງຢູ່ ຖະໜົນ 23 ສິງຫາ, ບ້ານ ໜອງບອນ, ເມືອງ ໄຊເສດຖາ, ນະຄອນຫຼວງວຽງຈັນ</p>
      <p class="en-text">INSEE Microfinance, 23 Singha Rd, Nongbone Village, Saysatha District, VTE. ໂທລະສັບ/Tel 021 417775, 021 417776 (856-20) 99164243</p>
    </div>

    <div class="header-section">
      <div class="logo-box">
        <img src="/image/LOGO INSEE.png" alt="INSEE Logo" class="logo-img" />
        <p class="logo-text">ສະຖາບັນການເງິນຈຸລະພາກບໍ່ຮັບເງິນຝາກ<br/>ອິນຊີ ຈໍາກັດ</p>
      </div>
      <div class="header-text">
        <h2 class="country-title">ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ</h2>
        <p class="motto-title">ສັນຕິພາບ ເອກະລາດ ປະຊາທິປະໄຕ ເອກະພາບ ວັດທະນາຖາວອນ</p>
      </div>
    </div>

    <h1 class="form-title">ໃບສະເໜີຂໍກູ້ຢືມປະເພດສິນເຊື່ອເພື່ອການຊົມໃຊ້</h1>
    <div class="checkbox-center">
      <span class="checkbox-item"><span class="box">☐</span> ອອນລາຍ</span>
      <span class="checkbox-item"><span class="box">☐</span> ອ໋ອບລາຍ</span>
    </div>

    <div class="recipient">
      <p><strong>ຮຽນ:</strong> ທ່ານຄະນະອຳນວຍການ ສະຖາບັນການເງິນຈຸລະພາກທີ່ບໍ່ຮັບເງິນຝາກ ອິນຊີ ຈໍາກັດ</p>
      <div class="subject-line">
        <strong>ເລື່ອງ:</strong> ຂໍກູ້ຢືມປະເພດສິນເຊື່ອຊົມໃຊ້ ປະເພດ: &nbsp;
        <span class="checkbox-item"><span class="box">☐</span> ສິນຄ້າຄຳ</span>
        <span class="checkbox-item"><span class="box">☐</span> ສິນຄ້າທົ່ວໄປ</span>
        <span class="checkbox-item"><span class="box">☐</span> ສິນຄ້າລົດຈັກ</span>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">I. ຂໍ້ມູນລູກຄ້າ:</h3>
      <div class="inline-content">
        ຂ້າພະເຈົ້າຊື່ ທ້າວ/ນາງ: <span class="fill-text min-200">{{ formData.customer.name || formData.customer.fullname }}</span>
        ວັນເດືອນປີເກີດ: <span class="fill-text">{{ formatDateInline(formData.customer.dob) }}</span>
        ອາຍຸ: <span class="fill-text">{{ formData.customer.age || '........' }}</span> ປີ,
        ອາຊີບ: <span class="fill-text">{{ formData.customer.occupation || '.......................' }}</span>,
        ເບີໂທ: <span class="fill-text">{{ formData.customer.phone || '.......................' }}</span>
        ທີ່ຢູ່ປັດຈຸບັນ: ບ້ານ <span class="fill-text">{{ formData.customer.address.village || '.......................' }}</span>
        ເມືອງ: <span class="fill-text">{{ formData.customer.address.district || '.......................' }}</span>
        ແຂວງ <span class="fill-text">{{ formData.customer.address.province || '.......................' }}</span>
        ເລກບັດປະຈຳຕົວ: <span class="fill-text">{{ formData.customer.idCard || '.......................' }}</span>
        ເລກທີ່ສຳມະໂນຄົວ: <span class="fill-text">{{ formData.customer.censusNo || '.......................' }}</span>,
        ໜ່ວຍ: <span class="fill-text">{{ formData.customer.unit || '........' }}</span>,
        ສະຖານທີ່ອອກ: <span class="fill-text">{{ formData.customer.issuePlace || '.......................' }}</span>
        ວັນທີ່ອອກ: <span class="fill-text">{{ formatDateInline(formData.customer.issueDate) }}</span>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">II. ຂໍ້ມູນບ່ອນເຮັດວຽກ:</h3>
      <div class="inline-content">
        ຊື່ບໍລິສັດ/ຮ້ານ: <span class="fill-text min-300">{{ formData.work.companyName || '................................................' }}</span>,
        ທີ່ຢູ່ຫ້ອງການ: ບ້ານ <span class="fill-text">{{ formData.work.address.village || '.......................' }}</span>,
        ເມືອງ <span class="fill-text">{{ formData.work.address.district || '.......................' }}</span>
        ແຂວງ <span class="fill-text">{{ formData.work.address.province || '.......................' }}</span>
        ເບີໂທ <span class="fill-text">{{ formData.work.phone || '............' }}</span>
        ປະເພດຂອງທຸລະກິດ: <span class="fill-text">{{ formData.work.businessType || '............' }}</span>
        ລາຍລະອຽດທຸລະກິດ <span class="fill-text">{{ formData.work.businessDetail || '............' }}</span>
        ໄລຍະການເຮັດວຽກ <span class="fill-text">{{ formData.work.durationMonths || '......' }}</span> ເດືອນ
        <span class="fill-text">{{ formData.work.durationYears || '......' }}</span> ປີ,
        ພະແນກ <span class="fill-text">{{ formData.work.department || '..................' }}</span>
        ຕຳແໜ່ງ <span class="fill-text">{{ formData.work.position || '............' }}</span>
        ເງິນເດືອນ <span class="fill-text">{{ formatCurrency(formData.work.salary) || '.......................' }}</span>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">III. ລາຍລະອຽດສິນຄ້າ:</h3>
      <table class="product-table">
        <tbody>
          <tr>
            <td class="cell-label">1. ປະເພດສິນຄ້າ:</td>
            <td class="cell-value">{{ formData.product.type || '................' }}</td>
            <td class="cell-label">7. ຍີ່ຫໍ້:</td>
            <td class="cell-value">{{ formData.product.brand || '................' }}</td>
            <td class="cell-label">12. ລຸ້ນສິນຄ້າ:</td>
            <td class="cell-value">{{ formData.product.model || '................' }}</td>
          </tr>
          <tr>
            <td class="cell-label">2. ລາຄາສິນຄ້າ:</td>
            <td class="cell-value">{{ formatCurrency(formData.product.price) }}</td>
            <td class="cell-label">8. ວາງດາວ:</td>
            <td class="cell-value">{{ formatCurrency(formData.product.downPayment) }}</td>
            <td class="cell-label">13. ວົງເງິນອະນຸມັດ:</td>
            <td class="cell-value">{{ formatCurrency(formData.product.approvedAmount) }}</td>
          </tr>
          <tr>
            <td class="cell-label">3. ໄລະຍະເວລາກູ້:</td>
            <td class="cell-value">{{ formData.product.loanTerm || '....' }} ເດືອນ</td>
            <td class="cell-label">9. ອັດຕາດອກເບ້ຍ:</td>
            <td class="cell-value">{{ formData.product.interestRate || '....' }}%</td>
            <td class="cell-label">14. ດອກເບ້ຍທັງໝົດ:</td>
            <td class="cell-value">{{ formatCurrency(formData.product.totalInterest) }}</td>
          </tr>
          <tr>
            <td class="cell-label">4. ຄ່າທຳນຽມ/(CIB):</td>
            <td class="cell-value" colspan="5"><strong>20,000 ກີບ</strong></td>
          </tr>
          <tr>
            <td class="cell-label" colspan="3">10. ຄ່າງວດເດືອນທຳອິດ(ຄ່າງວດແຕ່ລະເດືອນ+ຄ່າທຳນຽມ):</td>
            <td class="cell-value" colspan="3">{{ formatCurrency(formData.product.firstInstallment) }}</td>
          </tr>
          <tr>
            <td class="cell-label">5. ຄ່າງວດລາຍເດືອນ:</td>
            <td class="cell-value">{{ formatCurrency(formData.product.monthlyPayment) }}</td>
            <td class="cell-label" colspan="3">11. ການຊຳລະຄ່າງວດທຸກໆວັນທີ່</td>
            <td class="cell-value">{{ formData.product.paymentDay || '......' }} ຂອງແຕ່ລະເດືອນ.</td>
          </tr>
          <tr>
            <td class="cell-label" colspan="6">6. ຮ້ານຄ້າທີ່ເລືອກ:</td>
          </tr>
          <tr>
            <td class="cell-value" colspan="6" style="height: 35px;">{{ formData.product.store || '..................................................................................' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section">
      <h3 class="section-title">IV. ຂໍ້ມູນສ່ວນຕົວຂອງ <span class="box">☐</span> ຜູ້ຄ້ຳປະກັນ / <span class="box">☐</span> ຜູ້ອ້າງອີງ (ຖ້າມີ)</h3>
      <div class="inline-content">
        ຂ້າພະເຈົ້າຊື່ທ້າວ/ນາງ: <span class="fill-text min-200">{{ formData.guarantor.name || '................................' }}</span>
        ວັນເດືອນປີເກີດ: <span class="fill-text">{{ formatDateInline(formData.guarantor.dob) }}</span>
        ອາຍຸ: <span class="fill-text">{{ formData.guarantor.age || '........' }}</span> ປີ,
        ອາຊີບ: <span class="fill-text">{{ formData.guarantor.occupation || '..................' }}</span>,
        ເບີໂທ: <span class="fill-text">{{ formData.guarantor.phone || '.......................' }}</span>
        ທີ່ຢູ່ປະຈຸບັນ: ບ້ານ <span class="fill-text">{{ formData.guarantor.address.village || '..................' }}</span>
        ເມືອງ: <span class="fill-text">{{ formData.guarantor.address.district || '..................' }}</span>
        ແຂວງ <span class="fill-text">{{ formData.guarantor.address.province || '..................' }}</span>
        ເລກບັດປະຈຳຕົວ: <span class="fill-text">{{ formData.guarantor.idCard || '..................' }}</span>
        ຄວາມສຳພັນ: <span class="box">☐</span> ພໍ່ແມ່ <span class="box">☐</span> ຄູ່ສົມລົດ <span class="box">☐</span> ອື່ນໆ <span class="fill-text">{{ formData.guarantor.relationshipOther || '........' }}</span>
        ຊື່ບໍລິສັດ/ຮ້ານ <span class="fill-text">{{ formData.guarantor.work.companyName || '..................' }}</span>
        ຕຳແໜ່ງ <span class="fill-text">{{ formData.guarantor.work.position || '............' }}</span>
        ເງິນເດືອນ <span class="fill-text">{{ formatCurrency(formData.guarantor.work.salary) || '..................' }}</span>
      </div>
    </div>

    <div class="note-box">
      <strong>ໝາຍເຫດ:</strong> ຂ້າພະເຈົ້າ, ຜູ້ກູ້ ແລະ/ຫລື ຜູ້ຄ້ຳປະກັນ (ຖ້າມີ), ເຫັນດີ ແລະ ຍິນຍອມໃຫ້ ສກຈບ ອິນຊີກວດສອບປະຫວັດໃນບົດລາຍງານ CIB ຕາມຂໍ້ມູນທີ່ໄດ້ສະແດງຂ້າງເທິງ.
    </div>

    <p class="bottom-conclusion">ດັ່ງນັ້ນ, ຈຶ່ງສະເໜີມາຍັງທ່ານພິຈາລະນາຕາມທາງຄວນດ້ວຍ</p>

    <div class="signature-section">
      <div class="sig-block">
        <p>ເຊັນຜູ້ຂໍກູ້ (ລູກຄ້າ):</p>
        <div class="space-y"></div>
        <p>ວັນທີ່: <span class="date-line">{{ formatDateSlash(formData.signatures.borrowerDate) }}</span></p>
      </div>
      <div class="sig-block">
        <p>ເຊັນຜູ້ຄ້ຳປະກັນ (ຖ້າມີ):</p>
        <div class="space-y"></div>
        <p>ວັນທີ່: <span class="date-line">{{ formatDateSlash(formData.signatures.guarantorDate) }}</span></p>
      </div>
      <div class="sig-block">
        <p>ພະນັກງານ (ອິນຊີ)</p>
        <div class="space-y"></div>
        <p>ວັນທີ່: <span class="date-line">{{ formatDateSlash(formData.signatures.staffDate) }}</span></p>
      </div>
    </div>

    <div class="red-footer-stripe">
      <p>ສະຖາບັນການເງິນຈຸລະພາກບໍ່ຮັບເງິນຝາກ ອິນຊີ ຈໍາກັດ ສໍານັກງານໃຫຍ່ຕັ້ງຢູ່ ຖະໜົນ 23 ສິງຫາ, ບ້ານ ໜອງບອນ, ເມືອງ ໄຊເສດຖາ, ນະຄອນຫຼວງວຽງຈັນ</p>
      <p class="en-small">INSEE Microfinance, 23 Singha Rd, Nongbone Village, Saysatha District, VTE. ໂທລະສັບ/Tel 021 417775, 021 417776 (856-20) 99164243</p>
    </div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{ formData: any }>()

const formatCurrency = (val: any) => {
  if (!val) return '................'
  return new Intl.NumberFormat('lo-LA').format(Number(val)) + ' ກີບ'
}

const formatDateInline = (dateStr: string | null) => {
  if (!dateStr) return '........./.........../............'
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? '........./.........../............' : `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
}

const formatDateSlash = (dateStr: string | null) => {
  if (!dateStr) return '....../....../......'
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? '....../....../......' : `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
}
</script>

<style scoped>
/* ✅ Base Print Style */
.print-template {
  width: 210mm;
  min-height: 297mm;
  padding: 10mm 15mm;
  margin: 0 auto;
  background-color: #ffffff !important;
  color: #000000 !important;
  font-family: 'Phetsarath OT', 'Noto Sans Lao', sans-serif;
  font-size: 10.5pt;
  line-height: 1.4;
  -webkit-print-color-adjust: exact; /* ບັງຄັບໃຫ້ພິມສີພື້ນຫຼັງ */
  print-color-adjust: exact;
}

/* ✅ Header Styles */
.top-info {
  text-align: center;
  font-size: 8.5pt;
  margin-bottom: 10px;
  border-bottom: 1px solid #000;
  padding-bottom: 5px;
}
.en-text { font-size: 7.5pt; }

.header-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}
.logo-box {
  width: 45mm;
  border: 1px solid #000;
  text-align: center;
  padding: 5px;
}
.logo-img { width: 25mm; height: auto; }
.logo-text { font-size: 7pt; font-weight: bold; margin-top: 5px; }

.header-text { flex: 1; text-align: center; padding-top: 5px; }
.country-title { font-size: 12pt; font-weight: bold; margin: 0; }
.motto-title { font-size: 9.5pt; margin-top: 5px; }

/* ✅ Form Title & Checkboxes */
.form-title {
  text-align: center;
  font-size: 14pt;
  font-weight: bold;
  text-decoration: underline;
  margin: 15px 0 5px;
}
.checkbox-center { text-align: center; margin-bottom: 15px; }
.checkbox-item { margin: 0 10px; display: inline-flex; align-items: center; }
.box { font-size: 14pt; margin-right: 4px; font-weight: normal; }

.recipient { margin-bottom: 15px; }
.subject-line { margin-top: 5px; }

/* ✅ Section & Fill-in-text */
.section { margin-bottom: 12px; }
.section-title { font-size: 11pt; font-weight: bold; margin-bottom: 5px; border-left: 4px solid #000; padding-left: 8px; }
.inline-content { text-align: justify; line-height: 1.8; }
.fill-text { border-bottom: 1px dotted #000; padding: 0 5px; display: inline-block; }
.min-200 { min-width: 200px; }
.min-300 { min-width: 300px; }

/* ✅ Table Styling */
.product-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
  table-layout: fixed;
}
.product-table td {
  border: 1px solid #000;
  padding: 5px;
  font-size: 9.5pt;
  word-wrap: break-word;
}
.cell-label { background-color: #f2f2f2 !important; font-weight: bold; width: 18%; }
.cell-value { width: 15%; text-align: center; }

/* ✅ Signature */
.signature-section {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  text-align: center;
}
.sig-block { flex: 1; }
.space-y { height: 50px; }
.date-line { border-bottom: 1px solid #000; min-width: 100px; display: inline-block; }

.bottom-conclusion { text-align: center; font-weight: bold; margin: 20px 0; }
.note-box { font-size: 9pt; border: 1px solid #000; padding: 8px; margin-top: 10px; }

/* ✅ Bottom Footer Stripe (Red Background) */
.red-footer-stripe {
  background-color: #cc0000 !important;
  color: #ffffff !important;
  text-align: center;
  padding: 10px;
  margin-top: 30px;
  border-radius: 2px;
}
.red-footer-stripe p { margin: 0; font-size: 8pt; color: #ffffff !important; }
.en-small { font-size: 7pt !important; }

/* ✅ Media Print */
@media print {
  body { margin: 0; padding: 0; }
  .print-template {
    padding: 0;
    margin: 0;
    width: 100%;
    box-shadow: none;
  }
  @page {
    size: A4;
    margin: 15mm 10mm;
  }
}
</style>
