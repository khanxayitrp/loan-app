// utils/formatters.ts

export const getConfirmedStyle = (status: any) => {
  const isTrue = !!status && (status === true || status === 1 || status === 'true');
  return {
    text: isTrue ? 'ຢືນຢັນແລ້ວ' : 'ຍັງບໍ່ຢືນຢັນ',
    color: isTrue ? 'badge-success' : 'badge-warning'
  };
};

export const formatPrice = (price: number | string | undefined | null): string => {
  if (price === undefined || price === null || price === '') return '0';
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return '0';
  return new Intl.NumberFormat('lo-LA', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numPrice);
};

// 🟢 Helper function ສຳລັບແປງຕົວເລກໃຫ້ມີໝາຍຈຸດ (,) ໃນຊ່ອງ Input
export const formatCurrencyInput = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined || val === '') return '0';

  // ເຄຼຍໝາຍຈຸດອອກກ່ອນ (ຖ້າມີ) ແລ້ວແປງເປັນຕົວເລກ
  const num = typeof val === 'string' ? Number(val.replace(/,/g, '')) : Number(val);

  if (isNaN(num)) return '0';
  return num.toLocaleString('en-US');
};

// 🟢 Helper function ສຳລັບແປງສະຖານະເປັນສີຂອງ Badge
export const getStatusBadgeClass = (status: string): string => {
  // ໃຊ້ toLowerCase() ເພື່ອປ້ອງກັນ error ກໍລະນີຕົວພິມນ້ອຍ-ໃຫຍ່ບໍ່ກົງກັນ
  switch (status?.toLowerCase()) {
    case 'pending': return 'badge-warning';    // 🟡 ສີເຫຼືອງ/ສົ້ມ: ໝາຍເຖິງ "ລໍຖ້າການຈັດການ" ຫຼື ຕ້ອງເຂົ້າໄປເບິ່ງ
    case 'verifying': return 'badge-info';       // 🔵 ສີຟ້າ: ໝາຍເຖິງ "ກຳລັງດຳເນີນການ" (Process ຍັງແລ່ນຢູ່)
    case 'verified': return 'badge-primary';    // 🟣 ສີຫຼັກຂອງເວັບ: ໝາຍເຖິງ "ກວດກາຜ່ານແລ້ວ" ລໍຖ້າອະນຸມັດ
    case 'approved': return 'badge-success';    // 🟢 ສີຂຽວ: ໝາຍເຖິງ "ສຳເລັດ/ຜ່ານ" (ເປັນສັນຍານບວກ)
    case 'disbursed': return 'badge-secondary';  // 💖 ສີສຳຮອງ (ມັກຈະເປັນສີຊົມພູ/ມ່ວງ): ເພື່ອໃຫ້ເດັ່ນອອກມາວ່າ "ຈ່າຍເງິນແລ້ວ" ແຍກຈາກອະນຸມັດ
    case 'rejected': return 'badge-error';      // 🔴 ສີແດງ: ໝາຍເຖິງ "ຖືກປະຕິເສດ" ຫຼື ມີບັນຫາ
    case 'closed': return 'badge-neutral';    // ⚫️ ສີເທົາເຂັ້ມ: ໝາຍເຖິງ "ປິດການເຄື່ອນໄຫວ" ຈົບຂະບວນການແລ້ວ
    default: return 'badge-ghost';      // ⚪️ ສີເທົາອ່ອນໆ: ສຳລັບກໍລະນີບໍ່ມີສະຖານະ (ປ້ອງກັນ Error)
  }
};

// 🟢 Helper function ສຳລັບແປງສະຖານະພາສາອັງກິດເປັນພາສາລາວ
export const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': 'ລໍຖ້າ',
    'verifying': 'ກຳລັງກວດ',
    'verified': 'ກວດແລ້ວ',
    'approved': 'ອະນຸມັດ',
    'rejected': 'ປະຕິເສດ',
    'disbursed': 'ຈ່າຍເງິນແລ້ວ',
    'closed': 'ປິດສິນເຊື່ອ'
  };
  return statusMap[status] || status;
};

// 🟢 Helper function ສຳລັບແປງຊື່ປະເພດເອກະສານໃຫ້ເປັນພາສາລາວ
export const getDocumentTypeName = (type: string): string => {
  if (!type) return 'ບໍ່ລະບຸ';

  const typeMap: Record<string, string> = {
    'id_card': 'ບັດປະຈຳຕົວ',
    'house_reg': 'ໃບຄອບຄົວ',
    'household': 'ໃບຄອບຄົວ',
    'salary_slip': 'ຫຼັກຖານລາຍຮັບ',
    'income': 'ຫຼັກຖານລາຍຮັບ',
    'other': 'ເອກະສານອື່ນໆ'
  };

  return typeMap[type.toLowerCase()] || type;
};

/**
 * ແປງວັນທີຈາກ YYYY-MM-DD ເປັນ DD/MM/YYYY ສຳລັບສະແດງຜົນ
 */
export const formatDateToDDMMYYYY = (dateString: string | null | undefined): string => {
  if (!dateString) return '';

  if (dateString.includes('-')) {
    const [year, month, day] = dateString.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
  }

  return dateString;
}

/**
 * ດຶງວັນທີປັດຈຸບັນ ແລະ ແປງເປັນ DD/MM/YYYY ສະເໝີ (ສຳລັບວັນທີພິມເອກະສານ)
 */
export const getCurrentDateDDMMYYYY = (): string => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export const normalizePhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '';

  let cleanPhone = phone.replace(/[\s\-\+\(\)]/g, '');

  if (cleanPhone.startsWith('020')) {
    cleanPhone = cleanPhone.substring(3);
  } else if (cleanPhone.startsWith('20')) {
    cleanPhone = cleanPhone.substring(2);
  } else if (cleanPhone.startsWith('030')) {
    cleanPhone = cleanPhone.substring(3);
  } else if (cleanPhone.startsWith('30')) {
    cleanPhone = cleanPhone.substring(2);
  }

  return cleanPhone;
};

export const formatStandardPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '';

  let cleanPhone = phone.replace(/\D/g, '');

  if (cleanPhone.startsWith('85620')) cleanPhone = cleanPhone.substring(5);
  else if (cleanPhone.startsWith('85630')) cleanPhone = cleanPhone.substring(5);
  else if (cleanPhone.startsWith('020')) cleanPhone = cleanPhone.substring(3);
  else if (cleanPhone.startsWith('20')) cleanPhone = cleanPhone.substring(2);
  else if (cleanPhone.startsWith('030')) cleanPhone = cleanPhone.substring(3);
  else if (cleanPhone.startsWith('30')) cleanPhone = cleanPhone.substring(2);

  if (cleanPhone.length === 8) {
    return '020' + cleanPhone;
  } else if (cleanPhone.length === 7) {
    return '030' + cleanPhone;
  }

  return cleanPhone;
};

export const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return dateString;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ເວລາ ${hours}:${minutes}`;
};

// ========================================================
// 🌟 ເພີ່ມ Helper Functions ສຳລັບ Report 🌟
// ========================================================

/**
 * 🟢 ແປງວັນທີໃຫ້ເປັນຮູບແບບ YYYY-MM-DD (ສຳລັບສົ່ງໃຫ້ API ຫຼື Input type="date")
 */
export const formatYMD = (date: Date): string => {
  if (!date || isNaN(date.getTime())) return '';
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * 🟢 ແປງ String ວັນທີໃຫ້ເຫຼືອພຽງ YYYY-MM-DD
 */

export const formatDateOnly = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';

  // 🟢 ຕື່ມ || '-' ເພື່ອຮັບປະກັນວ່າມັນຈະ Return String ສະເໝີ
  return date.toISOString().split('T')[0] || '-';
}

/**
 * 🟢 ລວມຊື່ ແລະ ນາມສະກຸນລູກຄ້າ
 */
export const getCustomerFullName = (loan: any): string => {
  return loan?.customer ? `${loan.customer.first_name || ''} ${loan.customer.last_name || ''}`.trim() : 'ບໍ່ຮູ້ຊື່'
}

/**
 * 🟢 ຊອກຫາວັນທີງວດທຳອິດ ໂດຍດຶງຈາກ Repayments ຖ້າມີ
 */
export const getFirstInstallment = (loan: any): string => {
  if (loan?.repayments && loan.repayments.length > 0) {
    return formatDateOnly(loan.repayments[0].due_date)
  }
  return formatDateOnly(loan?.payment_day || loan?.first_installment_date)
}

/**
 * 🟢 ຄຳນວນວັນທີງວດສຸດທ້າຍ: ງວດທຳອິດ + (ຈຳນວນເດືອນ - 1)
 */
export const getLastInstallment = (loan: any): string => {
  const firstInstallmentDateStr = getFirstInstallment(loan);
  if (firstInstallmentDateStr === '-') return '-';

  const firstDate = new Date(firstInstallmentDateStr);
  const loanPeriod = Number(loan?.loan_period) || 0;

  if (loanPeriod <= 1) return firstInstallmentDateStr;

  firstDate.setMonth(firstDate.getMonth() + (loanPeriod - 1));
  return formatDateOnly(firstDate.toISOString());
}

/**
 * 🟢 ຄຳນວນອາຍຸຈາກ ວັນເດືອນປີເກີດ
 */
export const calculateAge = (dateOfBirth: string | null | undefined): string | number => {
  if (!dateOfBirth) return '-';
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return '-';

  const diffMs = Date.now() - dob.getTime();
  const ageDt = new Date(diffMs);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
}
/**
 * 🟢 แปลงวันที่สำหรับการแสดงผลให้อยู่ในรูปแบบ DD-MM-YYYY
 */
export const formatDisplayDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';

  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();

  return `${d}-${m}-${y}`;
}
