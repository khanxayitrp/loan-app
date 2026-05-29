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
  switch (status) {
    case 'pending': return 'badge-warning';
    case 'verifying': return 'badge-info';
    case 'approved': return 'badge-success';
    case 'rejected': return 'badge-error';
    case 'disbursed': return 'badge-primary';
    case 'closed': return 'badge-neutral';
    default: return 'badge-neutral';
  }
};

// 🟢 Helper function ສຳລັບແປງສະຖານະພາສາອັງກິດເປັນພາສາລາວ
export const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': 'ລໍຖ້າ',
    'verifying': 'ກຳລັງກວດ',
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