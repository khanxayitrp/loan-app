<template>
  <teleport to="body">
    <div v-if="isOpen && loan"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-auto animate-in fade-in zoom-in duration-200">

        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold flex items-center gap-2">
            <span class="icon-[tabler--calculator] text-primary size-6"></span> ຄຳນວນຄະແນນສິນເຊື່ອ (Credit Scoring)
          </h3>
          <button @click="close" class="btn btn-ghost btn-sm btn-circle text-gray-500 hover:bg-gray-200">
            <span class="icon-[tabler--x] size-5"></span>
          </button>
        </div>

        <div
          class="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-6 text-sm border border-gray-200 dark:border-gray-700">
          <div><span class="text-gray-500 block mb-1">ອາຍຸລູກຄ້າ</span><span class="font-bold text-base">{{ form.age }}
              ປີ</span></div>
          <div><span class="text-gray-500 block mb-1">ອາຍຸການເຮັດວຽກ</span><span class="font-bold text-base">{{
            form.job_tenure_years }} ປີ {{ form.job_tenure_months }} ເດືອນ</span></div>
          <div><span class="text-gray-500 block mb-1">ສະຖານະ CIB</span><span
              class="font-bold text-base text-indigo-600">{{ getCibLabel(form.cib_status) }}</span></div>
          <div><span class="text-gray-500 block mb-1">ອັດຕາສ່ວນໜີ້ສິນ (DSR)</span><span
              class="font-bold text-base text-red-500">{{ form.dsr_percent.toFixed(2) }}%</span></div>

          <div v-if="form.is_gold">
            <span class="text-gray-500 block mb-1">ອັດຕາສ່ວນເງິນກູ້ (LTV)</span>
            <span class="font-bold text-base text-blue-600">{{ form.ltv_percent.toFixed(2) }}%</span>
          </div>
          <div v-else>
            <span class="text-gray-500 block mb-1">ເງິນວາງດາວ</span>
            <span class="font-bold text-base text-green-600">{{ form.down_payment_percent.toFixed(2) }}%</span>
          </div>
        </div>

        <div>
          <div v-if="result" class="mb-4 animate-in fade-in slide-in-from-bottom-2">
            <div class="p-6 rounded-t-xl text-center text-white" :class="result.colorClass">
              <p class="text-sm font-medium opacity-80 mb-1">ຄະແນນລວມ (Total Score)</p>
              <div class="text-6xl font-black mb-2">{{ result.score }} <span class="text-2xl font-normal opacity-70">/
                  {{ result.maxScore }}</span></div>
              <div class="text-xl font-bold bg-white/20 inline-block px-4 py-1 rounded-full">
                {{ result.grade }} : {{ result.description }}
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 border border-t-0 rounded-b-xl overflow-hidden">
              <table class="table table-zebra table-sm w-full">
                <thead class="bg-base-200">
                  <tr>
                    <th>ປັດໄຈປະເມີນ (Scoring Factor)</th>
                    <th class="text-right w-24">ຄະແນນທີ່ໄດ້</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1. ອາຍຸ (Age)</td>
                    <td class="text-right font-medium">{{ result.details.ageScore }} / {{ result.details.factor1Max }}
                    </td>
                  </tr>
                  <tr>
                    <td>2. ອາຍຸການເຮັດວຽກ (Job Tenure)</td>
                    <td class="text-right font-medium">{{ result.details.tenureScore }} / {{ result.details.factor2Max
                      }}</td>
                  </tr>
                  <tr>
                    <td>3. ລາຍຮັບ ແລະ ໜີ້ສິນ (Income & DSR)</td>
                    <td class="text-right font-medium">{{ result.details.dsrScore }} / 25</td>
                  </tr>
                  <tr>
                    <td>4. ປະຫວັດສິນເຊື່ອ (Credit History / CIB)</td>
                    <td class="text-right font-medium">{{ result.details.cibScore }} / 20</td>
                  </tr>
                  <tr>
                    <td>5. {{ form.is_gold ? 'ອັດຕາສ່ວນເງິນກູ້ (LTV)' : 'ເງິນວາງດາວ (Down Payment)' }}</td>
                    <td class="text-right font-medium">{{ result.details.dpScore }} / {{ result.details.factor5Max }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-2">
            <button type="button" class="btn btn-ghost" @click="close">ປິດ / ຍົກເລີກ</button>

            <button v-if="result" type="button" class="btn btn-success w-40 text-white" @click="saveScore"
              :disabled="isSaving">
              <span v-if="isSaving" class="loading loading-spinner loading-xs"></span>
              <span v-else class="icon-[tabler--device-floppy] size-5"></span> ຢືນຢັນການບັນທຶກ
            </button>
          </div>
        </div>

      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { useLoanApplicationStore } from '@/stores/loanApplication';
import { alert } from '@/utils/alert';

const props = defineProps<{ isOpen: boolean; loan: any; summaryData: any }>();
const emit = defineEmits<{ (e: 'close'): void; (e: 'success'): void }>();

const loanApplicationStore = useLoanApplicationStore();

const isSaving = ref(false); // 🟢 ປ່ຽນຊື່ຈາກ isCalculating ເປັນ isSaving ໃຫ້ກົງກັບໜ້າທີ່
const result = ref<any>(null);

const form = reactive({
  age: 0,
  job_tenure_years: 0,
  job_tenure_months: 0,
  cib_status: 'no_delay',
  dsr_percent: 0,
  down_payment_percent: 0,
  ltv_percent: 0,
  is_gold: false
});

const getCibLabel = (status: string) => {
  const map: Record<string, string> = { 'no_delay': 'ດີຫຼາຍ (ບໍ່ມີຊັກຊ້າ)', 'delay_30_days': 'ດີ (ຊັກຊ້າບໍ່ເກີນ 30 ວັນ)', 'delay_60_days': 'ປານກາງ (ຊັກຊ້າ 30-60 ວັນ)', 'delay_90_days': 'ສ່ຽງສູງ (ຊັກຊ້າ 60-90 ວັນ)', 'blacklist': 'ບໍ່ດີ (ຊັກຊ້າ 90+ ວັນ/Blacklist)' };
  return map[status] || status;
};

watch(() => props.isOpen, (newVal) => {
  if (newVal && props.loan && props.summaryData) {
    result.value = null;
    const basic = props.summaryData.basic_verification || {};
    const income = props.summaryData.income_assessment || {};
    const cib = props.summaryData.cib_check || {};

    let age = props.loan.customer?.age || 0;
    if (!age && basic.verified_dob) {
      const diffMs = Date.now() - new Date(basic.verified_dob).getTime();
      age = Math.abs(new Date(diffMs).getUTCFullYear() - 1970);
    }
    form.age = age;

    const workInfo = props.loan.customer?.customer_work_infos?.[0] || props.loan.customer?.work_info?.[0];
    form.job_tenure_years = Number(basic.work_years) || Number(workInfo?.duration_years) || 0;
    form.job_tenure_months = Number(basic.work_months) || Number(workInfo?.duration_months) || 0;

    form.cib_status = cib.cib_status || cib.overall_cib_status || 'no_delay';

    const contractIncome = Number(props.loan.loan_contracts?.[0]?.cus_income_other) || 0;
    const cusIncome = Number(props.loan.customer?.income_per_month) || 0;
    const cusDebt = Number(props.loan.customer?.other_debts) || 0;
    const monthlyPay = Number(props.loan.monthly_pay) || 0;

    const finalAvgIncome = Number(income.average_monthly_income || 0) === 0 ? cusIncome : Number(income.average_monthly_income);
    const finalOtherIncome = Number(income.other_verified_income || 0) === 0 ? contractIncome : Number(income.other_verified_income);
    const finalDebt = Number(income.existing_debt_payments || 0) === 0 ? cusDebt : Number(income.existing_debt_payments);
    const finalInstallment = Number(income.proposed_installment || 0) === 0 ? monthlyPay : Number(income.proposed_installment);

    const totalIncome = finalAvgIncome + finalOtherIncome;
    const totalDebt = finalDebt + finalInstallment;

    form.dsr_percent = totalIncome > 0 ? (totalDebt / totalIncome) * 100 : 100;

    const price = Number(basic.verified_price) || Number(props.loan.product?.price) || Number(props.loan.total_amount) || 1;
    const dp = Number(basic.verified_down_payment) || Number(props.loan.down_payment) || 0;

    form.down_payment_percent = (dp / price) * 100;
    const remainingLoan = price - dp;
    form.ltv_percent = (remainingLoan / price) * 100;

    const typeName = String(props.loan.product?.productType?.type_name || props.loan.producttype?.type_name || '').trim();
    const typeId = Number(props.loan.product?.productType_id || props.loan.producttype_id || 0);
    form.is_gold = typeName.includes('ຄຳ') || typeId === 8 || typeId === 1;

    // 🌟 🟢 ເອີ້ນໃຊ້ການຄຳນວນທັນທີ ຫຼັງຈາກກຽມຂໍ້ມູນສຳເລັດ
    calculateCreditScore();
  } else {
    // ເມື່ອປິດ Modal ໃຫ້ລຶບຂໍ້ມູນຖິ້ມ
    result.value = null;
  }
});

const calculateCreditScore = () => {
  // 🟢 ລຶບ Delay (setTimeout) ອອກ ເພື່ອໃຫ້ຄຳນວນແບບ Real-time

  let totalScore = 0;
  const age = form.age;
  const totalTenureInYears = form.job_tenure_years + (form.job_tenure_months / 12);
  const tenure = totalTenureInYears;
  const cib = form.cib_status;
  const dsr = form.dsr_percent;

  let ageScore = 0;
  let tenureScore = 0;
  let cibScore = 0;
  let dsrScore = 0;
  let dpScore = 0;

  let factor1Max = 0;
  let factor2Max = 0;
  let factor5Max = 0;

  if (form.is_gold) {
    ageScore = (age >= 25 && age <= 35) ? 15 :
      (age >= 36 && age <= 45) ? 13 :
        (age >= 46 && age <= 55) ? 12 :
          (age >= 18 && age <= 24) ? 10 : 8;
    factor1Max = 15;

    tenureScore = (tenure >= 3) ? 15 :
      (tenure >= 1) ? 12 :
        (tenure >= 0.5) ? 10 : 5;
    factor2Max = 15;

    const ltv = form.ltv_percent;
    dpScore = (ltv <= 60) ? 25 :
      (ltv <= 70) ? 20 :
        (ltv <= 80) ? 15 :
          (ltv <= 90) ? 10 : 5;
    factor5Max = 25;

  } else {
    ageScore = (age >= 25 && age <= 35) ? 20 :
      (age >= 36 && age <= 45) ? 18 :
        (age >= 46 && age <= 55) ? 12 :
          (age >= 18 && age <= 24) ? 10 : 8;
    factor1Max = 20;

    tenureScore = (tenure >= 3) ? 20 :
      (tenure >= 1) ? 15 :
        (tenure >= 0.5) ? 10 : 5;
    factor2Max = 20;

    const dp = form.down_payment_percent;
    dpScore = (dp >= 30) ? 15 :
      (dp >= 20) ? 12 :
        (dp >= 10) ? 8 : 5;
    factor5Max = 15;
  }

  dsrScore = (dsr <= 30) ? 25 :
    (dsr <= 40) ? 20 :
      (dsr <= 50) ? 15 :
        (dsr <= 60) ? 10 : 5;

  cibScore = (cib === 'no_delay') ? 20 :
    (cib === 'delay_30_days') ? 15 :
      (cib === 'delay_60_days') ? 10 :
        (cib === 'delay_90_days') ? 5 : 0;

  const maxTotalScore = factor1Max + factor2Max + 25 + 20 + factor5Max;
  totalScore = ageScore + tenureScore + dsrScore + cibScore + dpScore;

  const percentScore = (totalScore / maxTotalScore) * 100;
  let grade = percentScore >= 80 ? 'APPROVE' : percentScore >= 65 ? 'CONDITIONAL APPROVAL' : 'REJECT';
  let description = percentScore >= 80 ? 'ຜ່ານອະນຸມັດ' : percentScore >= 65 ? 'ອະນຸມັດແບບມີເງື່ອນໄຂ' : 'ປະຕິເສດການອະນຸມັດ';
  let colorClass = percentScore >= 80 ? 'bg-gradient-to-r from-emerald-500 to-green-600' : percentScore >= 65 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-red-500 to-rose-600';

  result.value = {
    score: totalScore,
    maxScore: maxTotalScore,
    grade,
    description,
    colorClass,
    details: {
      ageScore,
      tenureScore,
      cibScore,
      dsrScore,
      dpScore,
      factor1Max,
      factor2Max,
      factor5Max
    }
  };
};

const saveScore = async () => {
  if (!props.loan || !result.value) return;
  isSaving.value = true;
  try {
    await loanApplicationStore.updateLoanApplication(props.loan.id, { credit_score: result.value.score });
    alert.success('ບັນທຶກຄະແນນສຳເລັດ', `ສິນເຊື່ອໄດ້ຮັບ ${result.value.score} ຄະແນນ`);
    emit('success');
    close();
  } catch (error) {
    alert.error('ເກີດຂໍ້ຜິດພາດການບັນທຶກຄະແນນສິນເຊື່ອ');
  } finally {
    isSaving.value = false;
  }
};

const close = () => emit('close');
</script>
