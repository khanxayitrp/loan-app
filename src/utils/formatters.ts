// utils/formatters.ts
export const getConfirmedStyle = (status) => {
  const isTrue = !!status && (status === true || status === 1 || status === 'true');
  return {
    text: isTrue ? 'ຢືນຢັນແລ້ວ' : 'ຍັງບໍ່ຢືນຢັນ',
    color: isTrue ? 'badge-success' : 'badge-warning'
  };
};
