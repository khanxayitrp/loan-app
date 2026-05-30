// src/utils/dateUtils.ts

/**
 * 1. ຄິດໄລ່ອາຍຸຈາກວັນເດືອນປີເກີດ (YYYY-MM-DD)
 * ຖ້າເປັນອະນາຄົດ ຈະສົ່ງຄ່າ null ກັບຄືນໄປ
 */
export const calculateAge = (dob: string | null | undefined): number | null => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  
  if (birthDate > today) return null;

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { 
    age--; 
  }
  return age;
};

/**
 * 2. ຫາວັນທີປັດຈຸບັນ ໃນຮູບແບບ YYYY-MM-DD (ໃຊ້ສຳລັບ maxDate ປ້ອງກັນອະນາຄົດ)
 */
export const getMaxDateToday = (): string => {
  return new Date().toISOString().split('T')[0] || '';
};

/**
 * 3. ຫາວັນທີໃນອະດີດຍ້ອນຫຼັງ X ປີ ໃນຮູບແບບ YYYY-MM-DD (ໃຊ້ສຳລັບ minDate)
 */
export const getMinDatePast = (yearsAgo: number): string => {
  const pastDate = new Date();
  pastDate.setFullYear(pastDate.getFullYear() - yearsAgo);
  return new Date().toISOString().split('T')[0] || '';
};

/**
 * 4. ກວດສອບວັນທີອອກເອກະສານ (ປ້ອງກັນອະນາຄົດ ແລະ ເກົ່າເກີນໄປ)
 * @returns 'VALID' (ປົກກະຕິ) | 'FUTURE' (ເປັນອະນາຄົດ) | 'TOO_OLD' (ເກົ່າເກີນໄປ)
 */
export const validateDocIssueDate = (dateStr: string, maxYearsAgo: number): 'VALID' | 'FUTURE' | 'TOO_OLD' => {
  if (!dateStr) return 'VALID'; // ຖ້າວ່າງເປົ່າ ໃຫ້ຜ່ານໄປກ່ອນ (ໃຫ້ HTML required ຈັດການແທນ)
  
  const selectedDate = new Date(dateStr);
  const today = new Date();
  const minAllowedDate = new Date();
  minAllowedDate.setFullYear(today.getFullYear() - maxYearsAgo);

  if (selectedDate > today) return 'FUTURE';
  if (selectedDate < minAllowedDate) return 'TOO_OLD';
  
  return 'VALID';
};