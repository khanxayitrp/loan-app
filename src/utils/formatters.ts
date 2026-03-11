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
