import type { LoanApplication } from '@/types/loanApplication';

export function useLoanStatus() {
  /**
   * 🏷️ Get CSS Badge Class for Loan Status
   */
  const getStatusBadgeClass = (status: string | undefined): string => {
    if (!status) return 'bg-gray-400';
    const map: Record<string, string> = {
      'pending': 'bg-slate-400',
      'verifying': 'bg-amber-500',
      'verified': 'bg-blue-500',
      'approved': 'bg-emerald-500',
      'disbursed': 'bg-indigo-600',
      'rejected': 'bg-rose-500',
      'cancelled': 'bg-gray-600',
      'completed': 'bg-gray-800',
      'closed_early': 'bg-gray-800',
      'draft': 'bg-gray-300 text-gray-800'
    };
    return map[status.toLowerCase()] || 'bg-gray-400';
  };

  /**
   * 📝 Get Lao Text for Loan Status
   */
  const getStatusText = (status: string | undefined): string => {
    if (!status) return '-';
    const map: Record<string, string> = {
      'pending': 'ຄຳຂໍໃໝ່',
      'verifying': 'ກຳລັງກວດສອບ',
      'verified': 'ລໍຖ້າອະນຸມັດ',
      'approved': 'ອະນຸມັດແລ້ວ',
      'disbursed': 'ປ່ອຍສິນເຊື່ອແລ້ວ',
      'rejected': 'ປະຕິເສດ',
      'cancelled': 'ຍົກເລີກ',
      'completed': 'ປິດບັນຊີ (ສຳເລັດ)',
      'closed_early': 'ປິດບັນຊີກ່ອນກຳນົດ',
      'draft': 'ຮ່າງ'
    };
    return map[status.toLowerCase()] || status;
  };

  /**
   * 📅 Format Date string into Lao locale date format
   */
  const formatDate = (dateString: string | null | undefined, includeTime = false): string => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';

    if (includeTime) {
      return d.toLocaleDateString('lo-LA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    return d.toLocaleDateString('lo-LA');
  };

  /**
   * 👤 Get Customer Full Name safely
   */
  const getCustomerFullName = (loan: LoanApplication | null | undefined): string => {
    if (loan?.customer) {
      return `${loan.customer.first_name || ''} ${loan.customer.last_name || ''}`.trim() || 'ບໍ່ຮູ້ຊື່';
    }
    return 'ບໍ່ຮູ້ຊື່';
  };

  /**
   * 📞 Get Customer Phone safely
   */
  const getCustomerPhone = (loan: LoanApplication | null | undefined): string => {
    return loan?.customer?.phone || '-';
  };

  /**
   * 📄 Get Loan Contract Number safely
   */
  const getContractNumber = (loan: LoanApplication | null | undefined): string => {
    if (loan && loan.loan_contracts && loan.loan_contracts.length > 0 && loan.loan_contracts[0]) {
      return loan.loan_contracts[0].loan_contract_number || '-';
    }
    return '-';
  };

  return {
    getStatusBadgeClass,
    getStatusText,
    formatDate,
    getCustomerFullName,
    getCustomerPhone,
    getContractNumber
  };
}
