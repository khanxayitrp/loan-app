<template>
  <teleport to="body">
    <div v-if="isOpen && loan"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">

        <!-- Header -->
        <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h3 class="text-lg font-bold flex items-center gap-2 text-gray-800 dark:text-white">
            <span class="icon-[tabler--clipboard-check] text-info size-6"></span>
            ຟອມກວດສອບ ແລະ ປະເມີນສິນເຊື່ອ (Checklist)
          </h3>
          <button @click="close" class="btn btn-ghost btn-sm btn-circle text-gray-500 hover:text-error hover:bg-error/10">
            <span class="icon-[tabler--x] size-5"></span>
          </button>
        </div>

        <!-- Tabs -->
        <div class="tabs tabs-bordered px-4 pt-2 bg-gray-50 dark:bg-gray-900 overflow-x-auto">
          <a class="tab tab-lg whitespace-nowrap"
            :class="{ 'tab-active font-bold text-primary border-b-2 border-primary': checklistTab === 'basic' }"
            @click="changeTab('basic')">1. ຂໍ້ມູນທົ່ວໄປ & ວຽກ</a>

          <a class="tab tab-lg whitespace-nowrap" :class="{
            'tab-active font-bold text-primary border-b-2 border-primary': checklistTab === 'call',
            'opacity-40 grayscale cursor-not-allowed pointer-events-none': !unlockedTabs.call && canEditChecklist
          }" @click="changeTab('call')">
            <span v-if="!unlockedTabs.call && canEditChecklist" class="icon-[tabler--lock] mr-1"></span> 2. ໂທຢືນຢັນ
          </a>

          <a class="tab tab-lg whitespace-nowrap" :class="{
            'tab-active font-bold text-primary border-b-2 border-primary': checklistTab === 'cib',
            'opacity-40 grayscale cursor-not-allowed pointer-events-none': !unlockedTabs.cib && canEditChecklist
          }" @click="changeTab('cib')">
            <span v-if="!unlockedTabs.cib && canEditChecklist" class="icon-[tabler--lock] mr-1"></span> 3. ກວດ CIB
          </a>

          <a class="tab tab-lg whitespace-nowrap" :class="{
            'tab-active font-bold text-primary border-b-2 border-primary': checklistTab === 'field',
            'opacity-40 grayscale cursor-not-allowed pointer-events-none': !unlockedTabs.field && canEditChecklist
          }" @click="changeTab('field')">
            <span v-if="!unlockedTabs.field && canEditChecklist" class="icon-[tabler--lock] mr-1"></span> 4. ລົງພື້ນທີ່ຈິງ
          </a>

          <a class="tab tab-lg whitespace-nowrap" :class="{
            'tab-active font-bold text-primary border-b-2 border-primary': checklistTab === 'income',
            'opacity-40 grayscale cursor-not-allowed pointer-events-none': !unlockedTabs.income && canEditChecklist
          }" @click="changeTab('income')">
            <span v-if="!unlockedTabs.income && canEditChecklist" class="icon-[tabler--lock] mr-1"></span> 5. ປະເມີນລາຍຮັບ (DSR)
          </a>
        </div>

        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800">

          <!-- TAB 1: Basic -->
          <ChecklistBasicTab v-if="checklistTab === 'basic'" :formBasic="formBasic" :canEdit="canEditChecklist" />

          <!-- TAB 2: Call -->
          <ChecklistCallTab v-else-if="checklistTab === 'call'" :formCalls="formCalls" :canEdit="canEditChecklist" @addCall="addCallRecord" @removeCall="removeCallRecord" />

          <!-- TAB 3: CIB -->
          <ChecklistCibTab v-else-if="checklistTab === 'cib'" :formCIB="formCIB" :formCIBDetails="formCIBDetails" :canEdit="canEditChecklist" :isImporting="isImporting" @handleFileUpload="handleFileUpload" @addCibDetail="addCIBDetail" @removeCibDetail="removeCIBDetail" />

          <!-- TAB 4: Field -->
          <ChecklistFieldTab v-else-if="checklistTab === 'field'" :formFieldVisits="formFieldVisits" :canEdit="canEditChecklist" @addFieldVisit="addFieldVisit" @removeFieldVisit="removeFieldVisit" @getCurrentLocation="getCurrentLocation" @handleVisitImageUpload="handleVisitImageUpload" @removeVisitImage="removeVisitImage" />

          <!-- TAB 5: Income / DSR -->
          <ChecklistIncomeTab v-else-if="checklistTab === 'income'" :canEdit="canEditChecklist" @calculateCibDebt="calculateCibDebt" />

        </div>

        <!-- Footer Actions -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3">
          <button class="btn btn-ghost" @click="close">ປິດ</button>
          <button v-if="canEditChecklist" class="btn btn-primary" @click="saveChecklist" :disabled="isSavingChecklist">
            <span v-if="isSavingChecklist" class="loading loading-spinner loading-xs"></span>
            <span v-else class="icon-[tabler--device-floppy] size-4"></span>
            ບັນທຶກຂໍ້ມູນ {{ checklistTabTitle }}
          </button>
        </div>

      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { checklistApi } from '@/api/checklist';
import apiClient from '@/api/apiclient';
import { alert } from '@/utils/alert';
import { formatPrice } from '@/utils/formatters';
import { useLoanApplicationStore } from '@/stores/loanApplication';
import { useChecklistStore } from '@/stores/checklist';
import { useAddressStore } from '@/stores/address';
import { usePermissionStore } from '@/stores/permission';

import ChecklistBasicTab from './checklist/ChecklistBasicTab.vue';
import ChecklistCallTab from './checklist/ChecklistCallTab.vue';
import ChecklistCibTab from './checklist/ChecklistCibTab.vue';
import ChecklistFieldTab from './checklist/ChecklistFieldTab.vue';
import ChecklistIncomeTab from './checklist/ChecklistIncomeTab.vue';

const props = defineProps<{ isOpen: boolean; loan: Record<string, unknown> | null }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const loanAppStore = useLoanApplicationStore();
const checklistStore = useChecklistStore();
const addressStore = useAddressStore();
const permissionStore = usePermissionStore();

const checklistTab = ref<'basic' | 'call' | 'cib' | 'field' | 'income'>('basic');
const isSavingChecklist = ref(false);

const canEditChecklist = computed(() => {
  return permissionStore.hasPermission('loan_edit') || permissionStore.hasPermission('loan_approve');
});

const checklistTabTitle = computed(() => {
  const titles = { basic: 'ຂໍ້ມູນທົ່ວໄປ', call: 'ການໂທຢືນຢັນ', cib: 'ປະຫວັດ CIB', field: 'ການລົງພື້ນທີ່', income: 'ການປະເມີນລາຍຮັບ' };
  return titles[checklistTab.value];
});

// 🟢 Helper ເພື່ອ Reset ຂໍ້ມູນ Local State ໃຫ້ສະອາດ (Data Sanitization)
const resetForms = () => {
  const defaultFormBasic = {
    cus_contact_method: 'phone', verified_first_name: '', verified_last_name: '', verified_dob: '',
    verified_village: '', verified_province_id: '' as string | number, verified_district_id: '' as string | number, verified_address: '',
    verified_product_type: '', verified_price: 0, verified_down_payment: 0, verified_monthly_pay: 0,
    has_id_card: false, has_census_book: false, has_income_doc: false, has_other_doc: false, other_doc_detail: '',
    cus_credibility_assessment: 'reliable', work_company_name: '', work_position: '', work_years: 0, work_months: 0,
    workplace_assessment: 'good', status: 'draft'
  };
  Object.assign(formBasic, defaultFormBasic);
  
  formCalls.value = [];
  formCIBDetails.value = [];
  Object.assign(formCIB, { is_existing_customer: false, existing_customer_status: 'normal', remark: '' });
  formFieldVisits.value = [];
};

// PDF Import CIB
const isImporting = ref(false);

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement; const file = target.files?.[0]; if (!file) return;
  if (file.size > 5 * 1024 * 1024) { alert.error('ຂະໜາດໄຟລ໌ຕ້ອງນ້ອຍກວ່າ 5MB'); target.value = ''; return; }
  
  isImporting.value = true;
  try {
    const formData = new FormData(); formData.append('file', file); formData.append('loan_id', String(props.loan?.id));
    const response = await apiClient.post('/checklist/import-cib-pdf', formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 30000 });
    const result = response.data?.data;
    
    if (result) {
      const details = result.cib_details || [];
      if (details.length > 0) {
        formCIBDetails.value = details.map((item: Record<string, unknown>) => ({
          institution_name: item.institution_name || '', account_type: item.account_type || null, history_status: item.history_status || 'no_delay',
          approved_amount: Number(item.outstanding_balance) || 0, outstanding_balance: Number(item.actual_outstanding_balance || item.actualOutstandingBalance) || 0,
        }));
      } else alert.warning('ບໍ່ພົບຂໍ້ມູນບັນຊີໃນ PDF');

      if (result.cib_status) {
        formCIB.is_existing_customer = result.is_existing_customer !== undefined ? result.is_existing_customer : false;
        formCIB.existing_customer_status = result.existing_customer_status || 'normal';
        formCIB.remark = result.remark || formCIB.remark || 'ນຳເຂົ້າຈາກ PDF';
      }
      alert.success(`ນຳເຂົ້າສຳເລັດ ${details.length} ລາຍການ`);
      calculateCibDebt();
    } else alert.error('ບໍ່ສາມາດອ່ານຂໍ້ມູນຈາກ PDF ໄດ້');
  } catch (error: unknown) {
    const errObj = error as { response?: { data?: { message?: string } }; message?: string };
    alert.error('ນຳເຂົ້າ PDF ຜິດພາດ', errObj.response?.data?.message || errObj.message || 'ເກີດຂໍ້ຜິດພາດ');
  } finally { isImporting.value = false; target.value = ''; }
};

const unlockedTabs = computed(() => {
  return {
    basic: true, 
    call: formBasic.status === 'completed',
    cib: formBasic.status === 'completed' && formCalls.value.length > 0 && Boolean(formCalls.value[0]?.id),
    field: formCIBDetails.value.length > 0 || formCIB.remark !== '',
    income: formFieldVisits.value.length > 0 && Boolean(formFieldVisits.value[0]?.id)
  };
});

const changeTab = (tab: 'basic' | 'call' | 'cib' | 'field' | 'income') => {
  if (tab === 'basic') { checklistTab.value = tab; return; }
  if (!canEditChecklist.value) { checklistTab.value = tab; return; }

  if (tab === 'call' && !unlockedTabs.value.call) return alert.error('ກະລຸນາບັນທຶກຂໍ້ມູນທົ່ວໄປໃຫ້ສຳເລັດກ່ອນ');
  if (tab === 'cib' && !unlockedTabs.value.cib) return alert.error('ກະລຸນາບັນທຶກການໂທຢືນຢັນກ່ອນ');
  if (tab === 'field' && !unlockedTabs.value.field) return alert.error('ກະລຸນາບັນທຶກຂໍ້ມູນ CIB ກ່ອນ');
  if (tab === 'income' && !unlockedTabs.value.income) return alert.error('ກະລຸນາບັນທຶກການລົງພື້ນທີ່ກ່ອນ');
  checklistTab.value = tab;
};

// =======================
// State: Form Basic
// =======================
const formBasic = reactive({
  cus_contact_method: 'phone', verified_first_name: '', verified_last_name: '', verified_dob: '',
  verified_village: '', verified_province_id: '' as string | number, verified_district_id: '' as string | number, verified_address: '',
  verified_product_type: '', verified_price: 0, verified_down_payment: 0, verified_monthly_pay: 0,
  has_id_card: false, has_census_book: false, has_income_doc: false, has_other_doc: false, other_doc_detail: '',
  cus_credibility_assessment: 'reliable', work_company_name: '', work_position: '', work_years: 0, work_months: 0,
  workplace_assessment: 'good', status: 'draft'
});

// =======================
// State: Calls & CIB
// =======================
const formCalls = ref<Record<string, unknown>[]>([]);
const addCallRecord = () => formCalls.value.push({ call_target: 'workplace', contact_name: '', contact_phone: '', relationship: '', is_info_matching: true, call_status: 'completed', remark: '' });
const removeCallRecord = (index: number) => formCalls.value.splice(index, 1);

const formCIBDetails = ref<Record<string, unknown>[]>([]);
const formCIB = reactive({ is_existing_customer: false, existing_customer_status: 'normal', remark: '' });
const addCIBDetail = () => formCIBDetails.value.push({ institution_name: '', account_type: '', history_status: 'no_delay', approved_amount: 0, outstanding_balance: 0 });
const removeCIBDetail = (index: number) => formCIBDetails.value.splice(index, 1);

// 🟢 คำนวณ CIB Debt ใหม่ ตามมาตรฐาน Enterprise Risk Assessment
const calculateCibDebt = () => {
  if (formCIBDetails.value.length === 0) { 
    alert.warning('ບໍ່ມີຂໍ້ມູນ CIB ໃຫ້ຄຳນວນ'); 
    return; 
  }
  
  let estimatedMonthlyCibExternal = 0; // ถังที่ 1: หหนี้ສຖາບັນອື່ນ
  let estimatedMonthlyCibInternal = 0; // ถังที่ 2: หหนี้ INSEE ที่พบใน CIB

  // Source of Truth จากตาราง loan_contracts ใน Database
  const actualDbInternalInstallment = checklistStore.incomeData.internal_active_installments || 0;
  
  formCIBDetails.value.forEach(loan => {
    const institutionName = String(loan.institution_name || '').toLowerCase();
    const isInternalDebt = institutionName.includes('insee') || institutionName.includes('ອິນຊີ');
    const outstanding = Number(loan.outstanding_balance) || 0;
    const estimatedInstallment = outstanding * 0.05; // ประเมินค่างวด 5% ตามมาตรฐาน CIB
    
    if (outstanding > 0) {
      if (isInternalDebt) {
        estimatedMonthlyCibInternal += estimatedInstallment;
      } else {
        estimatedMonthlyCibExternal += estimatedInstallment;
      }
    }
  });
  
  // ==========================================
  // 🟢 Reconciliation & Deduplication Logic
  // ==========================================
  if (actualDbInternalInstallment > 0) {
    // กรณีที่ 1: DB มีข้อมูลหนี้ INSEE อยู่จริง
    // -> เราจะไม่เอา estimatedMonthlyCibInternal มารวม เพื่อป้องกันการคิดหนี้ซ้ำซ้อน (Double Counting)
    checklistStore.incomeData.existing_debt_payments = Math.round(estimatedMonthlyCibExternal);
    alert.success(`ຄຳນວນ CIB ສຳເລັດ: ຕັດຍອດໜີ້ພາຍໃນທີ່ຊ້ຳຊ້ອນອອກແລ້ວ (ຍຶດຂໍ້ມູນຈາກລະບົບເປັນຫຼັກ)`);
    
  } else {
    // กรณีที่ 2: DB ไม่มีหนี้ INSEE (เท่ากับ 0) แต่ในใบ CIB ดันระบุว่ามีหนี้ INSEE
    // -> ต้องอนุมานว่าเป็น "หนี้ตกหล่น" และต้องบวกกลับเข้าไปในหนี้ CIB รวม เพื่อประเมิน DSR ให้รัดกุมที่สุด
    if (estimatedMonthlyCibInternal > 0) {
      estimatedMonthlyCibExternal += estimatedMonthlyCibInternal;
      checklistStore.incomeData.existing_debt_payments = Math.round(estimatedMonthlyCibExternal);
      alert.warning(`ພົບໜີ້ INSEE ໃນ CIB ແຕ່ບໍ່ພົບໃນຖານຂໍ້ມູນ! ລະບົບໄດ້ຄິດໄລ່ລວມເຂົ້າໃນພາລະໜີ້ CIB ເພື່ອຄວາມປອດໄພ`);
    } else {
      checklistStore.incomeData.existing_debt_payments = Math.round(estimatedMonthlyCibExternal);
      alert.success(`ດຶງຍອດໜີ້ຈາກ CIB ສຳເລັດ: ${formatPrice(estimatedMonthlyCibExternal)} ກີບ`);
    }
  }
};

// =======================
// State: Field Visits
// =======================
const formFieldVisits = ref<Record<string, unknown>[]>([]);
const addFieldVisit = () => formFieldVisits.value.push({ visit_type: 'home', visit_date: new Date().toISOString().slice(0, 16), living_condition: '', is_address_correct: true, remarks: '', latitude: null, longitude: null, photo_1_file: null, photo_1_preview: null, photo_2_file: null, photo_2_preview: null });
const removeFieldVisit = (index: number) => formFieldVisits.value.splice(index, 1);

const getCurrentLocation = (index: number) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => { if (formFieldVisits.value[index]) { formFieldVisits.value[index].latitude = position.coords.latitude; formFieldVisits.value[index].longitude = position.coords.longitude; } },
      () => alert.error("ເກີດຂໍ້ຜິດພາດໃນການດຶງທີ່ຕັ້ງ GPS"), { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  } else alert.error("Browser ຂອງທ່ານບໍ່ຮອງຮັບລະບົບ GPS");
};

const handleVisitImageUpload = (index: number, photoNum: 1 | 2, event: Event) => {
  const target = event.target as HTMLInputElement; const file = target.files?.[0]; if (!file) return;
  if (file.size > 5 * 1024 * 1024) { alert.error('ຂະໜາດຮູບພາບຕ້ອງນ້ອຍກວ່າ 5MB'); target.value = ''; return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    const visit = formFieldVisits.value[index];
    if (visit) {
      if (photoNum === 1) { visit.photo_1_file = file; visit.photo_1_preview = e.target?.result as string; }
      else { visit.photo_2_file = file; visit.photo_2_preview = e.target?.result as string; }
    }
    target.value = '';
  };
  reader.readAsDataURL(file);
};

const removeVisitImage = (index: number, photoNum: 1 | 2) => {
  const visit = formFieldVisits.value[index];
  if (visit) {
    if (photoNum === 1) { visit.photo_1_file = null; visit.photo_1_preview = null; visit.photo_url_1 = null; }
    else { visit.photo_2_file = null; visit.photo_2_preview = null; visit.photo_url_2 = null; }
  }
};

// =======================
// Data Fetch & Sync
// =======================
const fetchChecklistData = async (loanId: number) => {
  try {
    const res = await apiClient.get(`/checklist/summary/${loanId}`);
    const summaryData = res.data?.data;

    if (summaryData) {
      if (summaryData.basic_verification) {
        Object.assign(formBasic, summaryData.basic_verification);
        checklistStore.incomeData.work_salary = Number(summaryData.basic_verification.work_salary) || 0;
        formBasic.has_id_card = !!summaryData.basic_verification.has_id_card;
        formBasic.has_census_book = !!summaryData.basic_verification.has_census_book;
        formBasic.has_income_doc = !!summaryData.basic_verification.has_income_doc;
        formBasic.has_other_doc = !!summaryData.basic_verification.has_other_doc;

        if (formBasic.verified_address && !formBasic.verified_village) {
          const parts = formBasic.verified_address.split(',').map(p => p.trim());
          if (parts.length >= 1) formBasic.verified_village = parts[0] || '';
        }
      }

      if (summaryData.call_verifications && summaryData.call_verifications.length > 0) formCalls.value = summaryData.call_verifications;
      else { formCalls.value = []; addCallRecord(); }

      if (summaryData.cib_check) {
        Object.assign(formCIB, summaryData.cib_check);
        formCIB.is_existing_customer = !!summaryData.cib_check.is_existing_customer;
        if (summaryData.cib_check.cib_details && summaryData.cib_check.cib_details.length > 0) {
          formCIBDetails.value = summaryData.cib_check.cib_details.map((d: Record<string, unknown>) => ({ ...d, approved_amount: Number(d.approved_amount) || 0, outstanding_balance: Number(d.outstanding_balance) || 0 }));
        } else formCIBDetails.value = [];
      } else { Object.assign(formCIB, { is_existing_customer: false, existing_customer_status: 'normal', remark: '' }); formCIBDetails.value = []; }

      if (summaryData.field_visits && summaryData.field_visits.length > 0) {
        formFieldVisits.value = summaryData.field_visits.map((item: Record<string, unknown>) => ({ ...item, visit_date: item.visit_date ? new Date(item.visit_date as string).toISOString().slice(0, 16) : '', photo_1_file: null, photo_1_preview: null, photo_2_file: null, photo_2_preview: null }));
      } else { formFieldVisits.value = []; addFieldVisit(); }

      if (summaryData.income_assessment) {
        checklistStore.updateIncomeData({
          other_verified_income: Number(summaryData.income_assessment.other_verified_income) || 0,
          estimated_living_expenses: Number(summaryData.income_assessment.estimated_living_expenses) || 0,
          existing_debt_payments: Number(summaryData.income_assessment.existing_debt_payments) || 0,
          internal_active_installments: Number(summaryData.income_assessment.internal_active_installments || 0),
          proposed_installment: Number(summaryData.income_assessment.proposed_installment) || 0,
          max_approved_amount: Number(summaryData.income_assessment.max_approved_amount) || 0
        });
      }
    } else {
      formCalls.value = []; addCallRecord(); formFieldVisits.value = []; addFieldVisit(); formCIBDetails.value = []; checklistStore.resetIncomeData();
    }
  } catch (error) { 
    console.error('Failed to load checklist:', error); 
    resetForms();
    checklistStore.clearData(); 
  }
};

watch(() => props.isOpen, async (newVal) => {
  if (newVal && props.loan) {
    const loanId = props.loan.id as number;
    checklistStore.clearData();
    resetForms();
    checklistTab.value = 'basic';
    
    await addressStore.fetchProvinces();
    await fetchChecklistData(loanId);

    let fullDetails = props.loan as Record<string, unknown>;
    try {
      const fetched = await loanAppStore.fetchLoanApplicationById(loanId);
      if (fetched) fullDetails = fetched as unknown as Record<string, unknown>;
    } catch { }

    const custObj = (fullDetails.customer || {}) as Record<string, unknown>;
    const custWorkInfos = (custObj.customer_work_infos || custObj.work_info) as Record<string, unknown>[] | undefined;
    const workInfo = custWorkInfos?.[0];
    const loanContracts = fullDetails.loan_contracts as Record<string, unknown>[] | undefined;
    const loanContract = loanContracts?.[0];
    const productObj = fullDetails.product as Record<string, unknown> | undefined;

    formBasic.verified_first_name = formBasic.verified_first_name || (custObj.first_name as string) || '';
    formBasic.verified_last_name = formBasic.verified_last_name || (custObj.last_name as string) || '';
    formBasic.verified_dob = formBasic.verified_dob || (custObj.date_of_birth ? new Date(custObj.date_of_birth as string).toISOString().slice(0, 10) : '');
    if (!formBasic.verified_village && custObj.address) formBasic.verified_village = custObj.address as string;
    if (!formBasic.verified_province_id && custObj.province_id) formBasic.verified_province_id = custObj.province_id as string | number;
    if (!formBasic.verified_district_id && custObj.district_id) formBasic.verified_district_id = custObj.district_id as string | number;
    
    formBasic.verified_product_type = formBasic.verified_product_type || (productObj?.product_name as string) || '';
    formBasic.verified_price = formBasic.verified_price || Number(fullDetails.total_amount || 0);
    formBasic.verified_down_payment = formBasic.verified_down_payment || Number(fullDetails.down_payment || 0);
    formBasic.verified_monthly_pay = formBasic.verified_monthly_pay || Number(fullDetails.monthly_pay || 0);
    formBasic.work_company_name = formBasic.work_company_name || (workInfo?.company_name as string) || '';
    formBasic.work_position = formBasic.work_position || (workInfo?.position as string) || '';
    formBasic.work_years = formBasic.work_years || (workInfo?.duration_years as number) || 0;

    checklistStore.updateIncomeData({
      work_salary: checklistStore.incomeData.work_salary || Number(workInfo?.salary || 0),
      other_verified_income: checklistStore.incomeData.other_verified_income || Number(loanContract?.cus_income_other || 0),
      existing_debt_payments: checklistStore.incomeData.existing_debt_payments || Number(custObj.other_debts || 0),
      internal_active_installments: checklistStore.incomeData.internal_active_installments || Number(custObj.total_active_internal_installments || 0),
      proposed_installment: checklistStore.incomeData.proposed_installment || Number(fullDetails.monthly_pay || 0),
      max_approved_amount: checklistStore.incomeData.max_approved_amount || (Number(fullDetails.total_amount || 0) - Number(fullDetails.down_payment || 0))
    });
  } else {
    checklistStore.clearData();
    resetForms();
  }
});

const saveChecklist = async () => {
  if (!props.loan || !canEditChecklist.value) return;
  const loanId = props.loan.id as number;
  isSavingChecklist.value = true;

  try {
    if (checklistTab.value === 'basic') {
      let fullAddressStr = formBasic.verified_village;
      if (formBasic.verified_district_id) {
        const districtObj = addressStore.districts.find(d => d.district_id === formBasic.verified_district_id);
        if (districtObj) fullAddressStr += `, ${districtObj.district_name}`;
      }
      if (formBasic.verified_province_id) {
        const provinceObj = addressStore.provinces.find(p => p.province_id === formBasic.verified_province_id);
        if (provinceObj) fullAddressStr += `, ${provinceObj.province_name}`;
      }
      formBasic.verified_address = fullAddressStr;

      await checklistApi.saveBasic(loanId, {
        ...formBasic,
        work_salary: checklistStore.incomeData.work_salary,
        full_name: `${formBasic.verified_first_name} ${formBasic.verified_last_name}`.trim()
      });

    } else if (checklistTab.value === 'call') {
      await checklistApi.saveCalls(loanId, { calls: formCalls.value });
    } else if (checklistTab.value === 'cib') {
      if (formCIBDetails.value.some(d => !d.institution_name)) return alert.error('ກະລຸນາລະບຸຊື່ສະຖາບັນການເງິນ');
      await checklistApi.saveCIB(loanId, { ...formCIB, cib_details: formCIBDetails.value });
    } else if (checklistTab.value === 'field') {
      const processedVisits = [];
      for (const visit of formFieldVisits.value) {
        let f1 = visit.photo_url_1; let f2 = visit.photo_url_2;
        if (visit.photo_1_file || visit.photo_2_file) {
          const imgFormData = new FormData(); const uploadedOrder = [];
          if (visit.photo_1_file) { imgFormData.append('files', visit.photo_1_file as Blob); uploadedOrder.push('photo1'); }
          if (visit.photo_2_file) { imgFormData.append('files', visit.photo_2_file as Blob); uploadedOrder.push('photo2'); }
          const res = await apiClient.post(`/upload/location/${props.loan.customer_id}/image/${loanId}`, imgFormData, { headers: { 'Content-Type': 'multipart/form-data' } });
          const urls = res.data?.data.uploaded || res.data?.urls || [];
          uploadedOrder.forEach((t, i) => { if (urls[i]) { if (t === 'photo1') f1 = urls[i].file_url; if (t === 'photo2') f2 = urls[i].file_url; } });
        }
        processedVisits.push({
          visit_type: visit.visit_type, visit_date: visit.visit_date, living_condition: visit.living_condition,
          is_address_correct: visit.is_address_correct ? 1 : 0, remarks: visit.remarks,
          latitude: visit.latitude ? String(visit.latitude) : null, longitude: visit.longitude ? String(visit.longitude) : null,
          photo_url_1: f1, photo_url_2: f2
        });
      }
      await checklistApi.saveFieldVisits(loanId, { visits: processedVisits });
    } else if (checklistTab.value === 'income') {
      await checklistApi.saveIncome(loanId, {
        average_monthly_income: checklistStore.incomeData.work_salary,
        other_verified_income: checklistStore.incomeData.other_verified_income,
        estimated_living_expenses: checklistStore.incomeData.estimated_living_expenses,
        existing_debt_payments: checklistStore.incomeData.existing_debt_payments,
        internal_active_installments: checklistStore.incomeData.internal_active_installments,
        proposed_installment: checklistStore.incomeData.proposed_installment,
        max_approved_amount: checklistStore.incomeData.max_approved_amount
      });
    }

    alert.success(`ບັນທຶກຂໍ້ມູນ ${checklistTabTitle.value} ສຳເລັດ`);
    await fetchChecklistData(loanId);

    if (checklistTab.value === 'basic' && formBasic.status === 'completed') { checklistTab.value = 'call'; }
  } catch { alert.error('ບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ'); }
  finally { isSavingChecklist.value = false; }
};

const close = () => { 
  checklistStore.clearData(); 
  resetForms();
  emit('close'); 
};
</script>
