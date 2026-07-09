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
    default:  return 'badge-ghost';      // ⚪️ ສີເທົາອ່ອນໆ: ສຳລັບກໍລະນີບໍ່ມີສະຖານະ (ປ້ອງກັນ Error)
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

  // ກວດສອບວ່າມີເຄື່ອງໝາຍ - ຫຼືບໍ່ (ປ້ອງກັນ error ຖ້າຂໍ້ມູນຜິດຮູບແບບ)
  if (dateString.includes('-')) {
    const [year, month, day] = dateString.split('-');
    // ຖ້າແຍກໄດ້ 3 ພາກສ່ວນຄົບຖ້ວນ
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
  }

  // ຖ້າຮູບແບບບໍ່ກົງ ກໍສົ່ງຄ່າເດີມກັບຄືນໄປ
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

/**
 * 🟢 Helper function ສຳລັບຈັດລະບຽບເບີໂທ (ຕັດຍະຫວ່າງ, ຂີດ ແລະ ຕັດ 020, 20, 030, 30 ອອກ)
 * ເພື່ອໃຫ້ເຫຼືອແຕ່ເລກຫຼັກ 7 ຫຼື 8 ຕົວ ສຳລັບນຳໄປຄົ້ນຫາ ຫຼື ກວດສອບ
 */
export const normalizePhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '';
  
  // ລຶບຊ່ອງຫວ່າງ, ຂີດ, ວົງເລັບ ແລະ ເຄື່ອງໝາຍບວກອອກກ່ອນ
  let cleanPhone = phone.replace(/[\s\-\+\(\)]/g, ''); 

  // ຕັດ Prefix ອອກ (ກວດຈາກຍາວໄປຫາສັ້ນ)
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

// 🟢 Helper ສຳລັບແປງເບີໂທໃຫ້ເປັນມາດຕະຖານ (020 ຫຼື 030 ນຳໜ້າສະເໝີ)
export const formatStandardPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '';
  
  // 1. ລຶບຕົວອັກສອນອື່ນໆທີ່ບໍ່ແມ່ນຕົວເລກອອກໝົດ (ເຊັ່ນ ຍະຫວ່າງ, - , +)
  let cleanPhone = phone.replace(/\D/g, ''); 

  // 2. ຕັດ Prefix ທີ່ອາດຈະຕິດມາອອກໃຫ້ເຫຼືອແຕ່ເລກຫຼັກ
  if (cleanPhone.startsWith('85620')) cleanPhone = cleanPhone.substring(5);
  else if (cleanPhone.startsWith('85630')) cleanPhone = cleanPhone.substring(5);
  else if (cleanPhone.startsWith('020')) cleanPhone = cleanPhone.substring(3);
  else if (cleanPhone.startsWith('20')) cleanPhone = cleanPhone.substring(2);
  else if (cleanPhone.startsWith('030')) cleanPhone = cleanPhone.substring(3);
  else if (cleanPhone.startsWith('30')) cleanPhone = cleanPhone.substring(2);
  
  // 3. ປະກອບຮ່າງໃໝ່
  if (cleanPhone.length === 8) {
      return '020' + cleanPhone; // ເບີມືຖື
  } else if (cleanPhone.length === 7) {
      return '030' + cleanPhone; // ເບີຕັ້ງໂຕະ/ເບີຫຼັກ 7
  }
  
  // ຖ້າຄວາມຍາວຜິດປົກກະຕິ ກໍສົ່ງຄ່າເດີມໄປ (ເພື່ອໃຫ້ Validation ແຈ້ງເຕືອນ)
  return cleanPhone; 
};