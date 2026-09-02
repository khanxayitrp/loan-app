<template>
  <teleport to="body">
    <div id="print-modal-container" v-if="isOpen && printData"
      class="fixed inset-0 z-[120] flex items-center justify-center bg-gray-500/80 backdrop-blur-sm p-4 print:p-0 print:bg-white">

      <div
        class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col print:shadow-none print:max-h-none print:h-auto print:rounded-none">

        <div class="flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-xl no-print">
          <h3 class="text-lg font-bold flex items-center gap-2 text-gray-800">
            <span class="icon-[tabler--printer] size-5"></span> ຕົວຢ່າງກ່ອນພິມ (Print Preview)
          </h3>
          <div class="flex items-center gap-2">
            <span v-if="!canPrintSummary" class="text-xs text-error font-medium mr-2">
              <span class="icon-[tabler--lock] size-3"></span> ທ່ານບໍ່ມີສິດພິມເອກະສານນີ້
            </span>

            <button @click="close" class="btn btn-ghost btn-sm">ປິດ</button>

            <button @click="handlePrint" class="btn btn-primary btn-sm" :disabled="isPrinting || !canPrintSummary">
              <span v-if="isPrinting" class="loading loading-spinner loading-xs"></span>
              <span v-else class="icon-[tabler--printer] size-4"></span> ພິມເອກະສານ
            </button>
          </div>
        </div>

        <div id="print-section" class="flex-1 overflow-y-auto p-8 print:p-0 print:overflow-visible text-black">

          <div class="text-center mb-6">
            <h1 class="text-2xl font-bold uppercase mb-1">ໃບສະຫຼຸບການປະເມີນສິນເຊື່ອ</h1>
            <h2 class="text-lg font-bold uppercase tracking-widest text-gray-600">Approval Summary</h2>
          </div>

          <div class="flex justify-between text-sm mb-4">
            <div><strong>ເລກທີສັນຍາ:</strong> {{ printData.loan.loan_contracts?.[0]?.loan_contract_number }}</div>
            <div><strong>ວັນທີພິມ:</strong> {{ getCurrentDateDDMMYYYY() }}</div>
          </div>

          <div class="mb-4 break-inside-avoid">
            <div class="bg-gray-200 font-bold px-2 py-1 text-sm border border-gray-400">1. ຂໍ້ມູນລູກຄ້າ (Applicant
              Information)</div>
            <table class="w-full text-sm border-collapse border border-gray-400">
              <tbody>
                <tr>
                  <td class="border border-gray-400 px-2 py-1 w-1/4 font-semibold bg-gray-50">ຊື່ ແລະ ນາມສະກຸນ:</td>
                  <td class="border border-gray-400 px-2 py-1 w-1/4">{{ printData.customerName }}</td>
                  <td class="border border-gray-400 px-2 py-1 w-1/4 font-semibold bg-gray-50">ອາຍຸ:</td>
                  <td class="border border-gray-400 px-2 py-1 w-1/4">{{ printData.age }} ປີ</td>
                </tr>
                <tr>
                  <td class="border border-gray-400 px-2 py-1 font-semibold bg-gray-50">ເບີໂທຕິດຕໍ່:</td>
                  <td class="border border-gray-400 px-2 py-1">{{ printData.phone }}</td>
                  <td class="border border-gray-400 px-2 py-1 font-semibold bg-gray-50">ບ່ອນເຮັດວຽກ:</td>
                  <!-- ✅ ໂຄ້ດໃໝ່ (ເອົາຄຳວ່າ ປີ ອອກຈາກໃນວົງເລັບ) -->
                  <td class="border border-gray-400 px-2 py-1">{{ printData.companyName }} ({{ printData.jobTenure }})
                  </td>
                </tr>
                <tr>
                  <td class="border border-gray-400 px-2 py-1 font-semibold bg-gray-50">ລາຍຮັບລວມ/ເດືອນ:</td>
                  <td class="border border-gray-400 px-2 py-1 text-success font-bold">{{
                    formatPrice(printData.totalIncome) }} ກີບ</td>
                  <td class="border border-gray-400 px-2 py-1 font-semibold bg-gray-50">ໜີ້ສິນລວມ/ເດືອນ:</td>
                  <td class="border border-gray-400 px-2 py-1 text-error font-bold">{{ formatPrice(printData.totalDebt)
                  }} ກີບ</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mb-4 break-inside-avoid">
            <div class="bg-gray-200 font-bold px-2 py-1 text-sm border border-gray-400">2. ຂໍ້ມູນສິນເຊື່ອ (Loan Details)
            </div>
            <table class="w-full text-sm border-collapse border border-gray-400">
              <tbody>
                <tr>
                  <td class="border border-gray-400 px-2 py-1 w-1/4 font-semibold bg-gray-50">ປະເພດສິນຄ້າ:</td>
                  <td class="border border-gray-400 px-2 py-1 w-1/4">{{ printData.productName }}</td>
                  <td class="border border-gray-400 px-2 py-1 w-1/4 font-semibold bg-gray-50">ລາຄາສິນຄ້າ:</td>
                  <td class="border border-gray-400 px-2 py-1 w-1/4">{{ formatPrice(printData.productPrice) }} ກີບ</td>
                </tr>
                <tr>
                  <td class="border border-gray-400 px-2 py-1 font-semibold bg-gray-50">ເງິນວາງດາວ:</td>
                  <td class="border border-gray-400 px-2 py-1">{{ formatPrice(printData.downPayment) }} ກີບ ({{
                    printData.downPaymentPercent.toFixed(1) }}%)</td>
                  <td class="border border-gray-400 px-2 py-1 font-semibold bg-gray-50">ຍອດຈັດສິນເຊື່ອ:</td>
                  <td class="border border-gray-400 px-2 py-1 font-bold">{{ formatPrice(printData.approvedAmount) }} ກີບ
                  </td>
                </tr>
                <tr>
                  <td class="border border-gray-400 px-2 py-1 font-semibold bg-gray-50">ດອກເບ້ຍ:</td>
                  <td class="border border-gray-400 px-2 py-1">{{ printData.interestRate }}% {{ printData.interestType
                  }}</td>
                  <td class="border border-gray-400 px-2 py-1 font-semibold bg-gray-50">ໄລຍະເວລາ:</td>
                  <td class="border border-gray-400 px-2 py-1">{{ printData.loanPeriod }} ເດືອນ</td>
                </tr>
                <tr>
                  <td class="border border-gray-400 px-2 py-1 font-semibold bg-gray-50">ຄ່າງວດ/ເດືອນ:</td>
                  <td colspan="3" class="border border-gray-400 px-2 py-1 font-bold text-primary text-base">{{
                    formatPrice(printData.monthlyPay) }} ກີບ</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mb-4 break-inside-avoid">
            <div class="bg-gray-200 font-bold px-2 py-1 text-sm border border-gray-400">3. ຜົນການກວດສອບ (Verification
              Results)</div>
            <table class="w-full text-sm border-collapse border border-gray-400">
              <tbody>
                <tr>
                  <td class="border border-gray-400 px-2 py-1 w-1/3 font-semibold bg-gray-50">ປະຫວັດ CIB:</td>
                  <td class="border border-gray-400 px-2 py-1 w-2/3">{{ getCibLabel(printData.cibStatus) }}</td>
                </tr>
                <tr>
                  <td class="border border-gray-400 px-2 py-1 font-semibold bg-gray-50">ອັດຕาສ່ວນໜີ້ສິນ (DSR):</td>
                  <td class="border border-gray-400 px-2 py-1 font-bold"
                    :class="printData.dsrPercent > 50 ? 'text-error' : 'text-success'">{{
                      printData.dsrPercent.toFixed(2) }}%</td>
                </tr>
                <tr>
                  <td class="border border-gray-400 px-2 py-1 font-semibold bg-gray-50">ສະຖານະການໂທ (Call Check):</td>
                  <td class="border border-gray-400 px-2 py-1">{{ printData.callStatus === 'completed' ?
                    'ໂທຢືນຢັນສຳເລັດຂໍ້ມູນຖືກຕ້ອງ' : 'ມີບັນຫາໃນการໂທກວດສອບ' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mb-6 break-inside-avoid">
            <div class="bg-gray-200 font-bold px-2 py-1 text-sm border border-gray-400">4. ຄະແນນການປະເມີນ (Credit Score)
            </div>
            <table class="w-full text-sm border-collapse border border-gray-400">
              <tbody>
                <tr>
                  <td class="border border-gray-400 px-4 py-3 w-1/2 text-center bg-gray-50">
                    <div class="text-sm font-semibold">ຄະແນນລວມ (Total Score)</div>
                    <div class="text-4xl font-black mt-1 text-primary">{{ printData.creditScore }}</div>
                  </td>
                  <td class="border border-gray-400 px-4 py-3 w-1/2 text-center"
                    :class="printData.creditScore >= 80 ? 'bg-green-700 text-white' : (printData.creditScore >= 65 ? 'bg-amber-600 text-white' : 'bg-red-700 text-white')">
                    <div class="text-sm font-semibold">ຜົນການປະເມີນ (Recommendation)</div>
                    <div class="text-xl font-bold mt-1">
                      {{ printData.creditScore >= 80 ? 'ອະນຸມັດ (APPROVE)' : (printData.creditScore >= 65 ?
                        'ອະນຸມັດແບບມີເງື່ອນໄຂ' : 'ປະຕິເສດ (REJECT)') }}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mb-6 break-inside-avoid" v-if="approvalLogs.length > 0">
            <div class="bg-gray-200 font-bold px-2 py-1 text-sm border border-gray-400 border-b-0">5. ປະຫວັດການອະນຸມັດ
              ແລະ ຄວາມຄິດເຫັນ (Approval History)</div>
            <table class="w-full text-sm border-collapse border border-gray-400">
              <thead>
                <tr class="bg-gray-50">
                  <th class="border border-gray-400 px-2 py-1 w-10 text-center">ລ/ດ</th>
                  <th class="border border-gray-400 px-2 py-1 w-1/4 text-center">ວັນທີ/ເວລາ</th>
                  <th class="border border-gray-400 px-2 py-1 w-1/4 text-left">ຜູ້ດຳເນີນການ</th>
                  <th class="border border-gray-400 px-2 py-1 text-center whitespace-nowrap">ການກະທຳ</th>
                  <th class="border border-gray-400 px-2 py-1 w-1/3 text-left">ຄວາມຄິດເຫັນ (Remarks)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(log, idx) in approvalLogs" :key="idx">
                  <td class="border border-gray-400 px-2 py-1 text-center font-medium">{{ idx + 1 }}</td>
                  <td class="border border-gray-400 px-2 py-1 text-[11px] text-center">{{
                    formatDateTime(log.performed_at) }}</td>
                  <td class="border border-gray-400 px-2 py-1 text-[11px]">
                    <div class="font-bold">{{ log.performed_by_user?.full_name || log.performed_by_user?.username ||
                      'ລະບົບ' }}</div>
                    <div class="text-gray-600">{{ formatRoleName(log.performed_by_user?.staff_level) }}</div>
                  </td>
                  <td class="border border-gray-400 px-2 py-1 text-center text-[11px] font-bold">{{
                    getStatusText(log.status_to) }}</td>
                  <td class="border border-gray-400 px-2 py-1 text-[11px] whitespace-pre-line">{{ log.remarks || '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-12 flex justify-between px-8 text-center text-sm break-inside-avoid">
            <div class="w-1/3">
              <div class="border-b border-black mb-2 mx-4 h-16"></div>
              <div>ຜູ້ກວດສອບ / Prepared By</div>
              <div class="text-xs text-gray-500 mt-1">ວັນທີ: ____/____/______</div>
            </div>
            <div class="w-1/3">
              <div class="border-b border-black mb-2 mx-4 h-16"></div>
              <div>ຜູ້ກວດກາ / Checked By</div>
              <div class="text-xs text-gray-500 mt-1">ວັນທີ: ____/____/______</div>
            </div>
            <div class="w-1/3">
              <div class="border-b border-black mb-2 mx-4 h-16"></div>
              <div>ຜູ້ອະນຸມັດ / Approved By</div>
              <div class="text-xs text-gray-500 mt-1">ວັນທີ: ____/____/______</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import apiClient from '@/api/apiclient';
import { alert } from '@/utils/alert';
import { formatPrice, getCurrentDateDDMMYYYY, formatDateTime, getStatusText } from '@/utils/formatters';
import { useLoanApplicationStore } from '@/stores/loanApplication';
import { usePermissionStore } from '@/stores/permission'; // 🌟 1. Import Permission Store

const props = defineProps<{ isOpen: boolean; printData: any }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const loanApplicationStore = useLoanApplicationStore();
const permissionStore = usePermissionStore(); // 🌟 2. ປະກາດໃຊ້ Store

const approvalLogs = ref<any[]>([]);
const isPrinting = ref(false);

const close = () => emit('close');

// 🌟 3. Computed Property ສຳລັບກວດສອບສິດການພິມ
const canPrintSummary = computed(() => {
  // ອະນຸຍາດໃຫ້ພິມສະເພາະຜູ້ທີ່ມີສິດ edit ຫຼື approve (ປ້ອງກັນບໍ່ໃຫ້ Auditor ກົດພິມໄດ້)
  return permissionStore.hasPermission('loan_print') && permissionStore.hasPermission('loan_edit');
});

watch(() => props.isOpen, async (newVal) => {
  if (newVal && props.printData?.loan?.id) {
    approvalLogs.value = await loanApplicationStore.fetchApprovalLogs(props.printData.loan.id);
  } else {
    approvalLogs.value = [];
  }
});

const getCibLabel = (status: string) => {
  const map: Record<string, string> = {
    'no_delay': 'ດີຫຼາຍ (ບໍ່ມີຊັກຊ້າ)',
    'delay_30_days': 'ດີ (ຊັກຊ້າບໍ່ເກີນ 30 ວັນ)',
    'delay_60_days': 'ປານກາງ (ຊັກຊ້າ 30-60 ວັນ)',
    'delay_90_days': 'ສ່ຽງສູງ (ຊັກซ້າ 60-90 ວັນ)',
    'blacklist': 'ບໍ່ດີ (ຊັກซ້າ 90+ ວັນ/Blacklist)'
  }
  return map[status] || status;
};

const formatRoleName = (role: string) => {
  if (!role) return 'System';
  const roles: Record<string, string> = {
    'credit_officer': 'ພະນັກງານສິນເຊື່ອ',
    'sales': 'ພະນັກງານຂາຍ',
    'credit_manager': 'ຫົວໜ້າສິນເຊື່ອ',
    'approver': 'ຜູ້ອະນຸມັດ',
    'deputy_director': 'ຮອງຜູ້ອຳນວຍການ',
    'director': 'ຜູ້ອຳນວຍການ',
    'admin': 'ແອັດມິນ',
    'auditor': 'ຜູ້ກວດສອບພາຍໃນ'
  };
  return roles[role] || role;
};

const handlePrint = async () => {
  // ປ້ອງກັນໄວ້ອີກຊັ້ນໜຶ່ງ: ຖ້າບໍ່ມີສິດພິມ ໃຫ້ return ທັນທີ
  if (!props.printData?.loan || !canPrintSummary.value) return;

  isPrinting.value = true;
  try {
    await apiClient.post(`/loan-application/${props.printData.loan.id}/print-summary`);
    window.print();
    alert.success('ພິມເອກະສານສຳເລັດ', 'ລະບົບໄດ້ບັນທຶກປະຫວັດການພິມເອກະສານແລ້ວ.');
    close();
  } catch (error) {
    console.error("Error logging print action:", error);
    window.print();
  } finally {
    isPrinting.value = false;
  }
};
</script>

<style>
@media print {

  #app,
  body>div:not(#print-modal-container) {
    display: none !important;
  }

  .no-print {
    display: none !important;
  }

  #print-modal-container {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    display: block !important;
    width: 100% !important;
    height: auto !important;
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  #print-modal-container>div,
  #print-section {
    position: relative !important;
    max-height: none !important;
    height: auto !important;
    overflow: visible !important;
    box-shadow: none !important;
    border-radius: 0 !important;
  }

  #print-section {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  @page {
    size: A4 portrait;
    margin: 1cm;
  }

  table {
    font-size: 11px !important;
  }

  h1 {
    font-size: 18px !important;
  }

  h2 {
    font-size: 14px !important;
  }

  .break-inside-avoid {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
}
</style>
