import { formatDateToDDMMYYYY } from '@/utils/formatters';

export function useDateInputMask() {
  const handleDateTyping = (
    e: Event,
    field: string,
    targetObject: Record<string, unknown>,
    errorsRef?: { value: Record<string, string> }
  ) => {
    if (errorsRef?.value && errorsRef.value[field]) {
      errorsRef.value[field] = '';
    }

    const target = e.target as HTMLInputElement;
    let val = target.value.replace(/\D/g, '');

    if (val.length > 8) val = val.substring(0, 8);

    let formatted = val;
    if (val.length >= 3) {
      formatted = val.substring(0, 2) + '/' + val.substring(2);
    }
    if (val.length >= 5) {
      formatted = formatted.substring(0, 5) + '/' + val.substring(4);
    }

    target.value = formatted;

    if (val.length === 8) {
      const day = parseInt(val.substring(0, 2), 10);
      const month = parseInt(val.substring(2, 4), 10);
      const year = parseInt(val.substring(4, 8), 10);

      if (day > 0 && day <= 31 && month > 0 && month <= 12 && year > 1900 && year <= 2100) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        targetObject[field] = dateStr;
      } else if (errorsRef?.value) {
        errorsRef.value[field] = 'ວັນທີບໍ່ຖືກຕ້ອງ (ຕົວຢ່າງ: 25/05/1999)';
      }
    } else if (val.length === 0) {
      targetObject[field] = '';
      if (errorsRef?.value) {
        errorsRef.value[field] = '';
      }
    } else {
      targetObject[field] = '';
    }
  };

  const handleDateBlur = (
    e: Event,
    field: string,
    targetObject: Record<string, unknown>
  ) => {
    const target = e.target as HTMLInputElement;
    if (target.value.length > 0 && target.value.length < 10) {
      const val = targetObject[field] as string | undefined;
      target.value = formatDateToDDMMYYYY(val);
    }
  };

  return {
    handleDateTyping,
    handleDateBlur
  };
}
