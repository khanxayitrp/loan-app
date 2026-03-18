export interface LoanRepaymentInfo {
  id: number;
  contract_number: string;
  customer_name: string;
  customer_phone: string;
  approved_amount: number;
  total_payable: number;
  total_paid: number;
  remaining_balance: number;
  next_due_date: string | null;
  repayment_status: 'active' | 'completed' | 'late';
}

export interface RepaymentSchedule {
  id: number;
  loan_id: number;
  installment_number: number;
  due_date: string;
  principal_amount: number;
  interest_amount: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'late';
  paid_date?: string;
}

export interface PaymentForm {
  amount_to_pay: number;
  amount_received: number;
  payment_method: 'cash' | 'transfer';
  payment_date: string;
  reference_number: string;
  remarks: string;
  installment_number: number;
}
