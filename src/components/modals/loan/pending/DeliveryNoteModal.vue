<template>
  <teleport to="body">
    <div v-if="isOpen && loan" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold">
            {{ deliveryReceiptStore.currentReceipt ? 'ຈັດການໃບມອບຮັບສິນຄ້າ' : 'ສ້າງໃບມອບຮັບສິນຄ້າ' }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <span class="icon-[tabler--x] size-5"></span>
          </button>
        </div>

        <div v-if="isLoading" class="text-center py-8">
          <span class="loading loading-spinner"></span>
          <p class="text-sm text-gray-500 mt-2">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
        </div>

        <form v-else @submit.prevent="saveDeliveryNote" class="space-y-4">
          <div class="form-control">
            <label class="label"><span class="label-text font-medium">ເລກທີ່ໃບມອບຮັບ *</span></label>
            <input v-model="form.note_number" type="text" placeholder="ປ້ອນເລກທີ່ໃບມອບຮັບ"
              class="input input-bordered w-full" disabled />
            <p v-if="!deliveryReceiptStore.currentReceipt" class="text-xs text-gray-500 mt-1">ລະບົບສ້າງໃຫ້ອັດຕະໂນມັດ</p>
          </div>

          <div class="form-control">
            <label class="label"><span class="label-text font-medium">ຊື່ຜູ້ຮັບ *</span></label>
            <input v-model="form.recipient_name" type="text" placeholder="ປ້ອນຊື່ຜູ້ຮັບ"
              class="input input-bordered w-full" :disabled="isEditingDisabled" required />
          </div>

          <div class="form-control">
            <label class="label"><span class="label-text font-medium">ເບີໂທຜູ້ຮັບ</span></label>
            <input v-model="form.recipient_phone" type="tel" placeholder="ອ້າງອີງຈາກຂໍ້ມູນລູກຄ້າ"
              class="input input-bordered w-full bg-gray-50" readonly />
          </div>

          <div class="form-control">
            <label class="label"><span class="label-text font-medium">ທີ່ຢູ່ຈັດສົ່ງ</span></label>
            <textarea v-model="form.delivery_address" placeholder="ອ້າງອີງຈາກຂໍ້ມູນລູກຄ້າ"
              class="textarea textarea-bordered w-full min-h-24 bg-gray-50" readonly></textarea>
          </div>

          <div v-if="!isPendingView" class="form-control">
            <label class="label cursor-pointer justify-start gap-4">
              <input type="checkbox" v-model="form.approved" class="checkbox checkbox-primary"
                :disabled="!canApproveDeliveryNote" />
              <span class="label-text font-medium">ອະນຸມັດໃບມອບຮັບສິນຄ້າ</span>
            </label>
            <p v-if="!canApproveDeliveryNote" class="text-xs text-gray-500 mt-1">
              {{ approvalDisabledMessage }}
            </p>
          </div>

          <div v-if="!hasDeliveryNote && !canEditNote" class="alert alert-warning shadow-sm mt-4 p-3 text-sm">
            <span class="icon-[tabler--info-circle] size-5 shrink-0"></span>
            <span>ຍັງບໍ່ມີການສ້າງໃບມອບຮັບສິນຄ້າສຳລັບລູກຄ້າຄົນນີ້.</span>
          </div>

          <div class="flex flex-col sm:flex-row justify-end gap-3 mt-6 border-t pt-4">
            <button type="button" class="btn btn-soft btn-secondary" @click="closeModal">
              ປິດ
            </button>

            <button v-if="hasDeliveryNote" type="button" class="btn btn-outline btn-primary" @click="printDeliveryNote"
              :disabled="isPrinting || isSaving">
              <span v-if="isPrinting" class="loading loading-spinner loading-xs mr-1"></span>
              <span v-else class="icon-[tabler--printer] size-4 mr-1"></span>
              {{ isPrinting ? 'ກຳລັງພິມ...' : 'ພິມໃບມອບຮັບ' }}
            </button>

            <button v-if="canEditNote" type="submit" class="btn btn-primary" :disabled="isSaving || isSaveDisabled">
              <span v-if="isSaving" class="loading loading-spinner loading-xs"></span>
              <span v-else>
                {{ deliveryReceiptStore.currentReceipt ? 'ບັນທຶກການປ່ຽນແປງ' : 'ສ້າງໃບມອບຮັບ' }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useDeliveryReceiptStore } from '@/stores/delivery_receipt';
import { useLoanApplicationStore } from '@/stores/loanApplication';
import { usePermissionStore } from '@/stores/permission'; // 🌟 1. Import Permission Store
import { alert } from '@/utils/alert';
import apiClient from '@/api/apiclient';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  loan: { type: Object, default: null },
  isPendingView: { type: Boolean, default: false }
});

const emit = defineEmits(['close', 'updated']);

const deliveryReceiptStore = useDeliveryReceiptStore();
const loanApplicationStore = useLoanApplicationStore();
const permissionStore = usePermissionStore(); // 🌟 2. ປະກາດໃຊ້ Store

const isLoading = ref(false);
const isSaving = ref(false);
const isPrinting = ref(false);

const form = reactive({
  note_number: '',
  recipient_name: '',
  recipient_phone: '',
  delivery_address: '',
  approved: false
});

const originalData = ref<any>(null);
const originalApprovedStatus = ref(false);
const fullLoanDataRef = ref<any>(null);

// 🌟 3. Computed Property ສຳລັບເຊັກສິດການແກ້ໄຂ
const canEditNote = computed(() => {
  return permissionStore.hasPermission('loan_edit') || permissionStore.hasPermission('loan_approve');
});

// Helpers
const getCustomerName = (loan: any): string => {
  if (!loan.customer) return '-';
  return `${loan.customer.first_name || ''} ${loan.customer.last_name || ''}`.trim();
};

const getCustomerPhone = (loan: any): string => {
  return loan.customer?.phone || '-';
};

watch(() => props.isOpen, async (newVal) => {
  if (newVal && props.loan) {
    await initModalData();
  } else {
    deliveryReceiptStore.clearCurrentReceipt();
  }
});

const initModalData = async () => {
  isLoading.value = true;
  try {
    let fullLoanData = props.loan;

    if (!fullLoanData.customer || !fullLoanData.customer.address) {
      try {
        const fetchedLoan = await loanApplicationStore.fetchLoanApplicationById(props.loan.id);
        if (fetchedLoan) fullLoanData = fetchedLoan;
      } catch (err) {
        console.warn('Failed to fetch full loan details');
      }
    }

    fullLoanDataRef.value = fullLoanData;

    const existingReceipt = await deliveryReceiptStore.fetchReceiptByApplicationId(props.loan.id);

    if (existingReceipt) {
      form.note_number = existingReceipt.receipts_id;
      form.recipient_name = existingReceipt.receiver_name;
      form.approved = existingReceipt.status === 'approved';
      form.recipient_phone = getCustomerPhone(fullLoanData);
      form.delivery_address = fullLoanData.customer?.address || '';

      originalData.value = { receiver_name: existingReceipt.receiver_name };
      originalApprovedStatus.value = existingReceipt.status === 'approved';
    } else {
      let nextReceiptId = '';
      const currentYear = new Date().getFullYear();

      try {
        const lastReceiptData = await deliveryReceiptStore.fetchLatestReceiptId();
        if (lastReceiptData && lastReceiptData.receipts_id) {
          const parts = lastReceiptData.receipts_id.split('-');
          if (parts.length === 3) {
            const num = parseInt(parts[2] || '0', 10) + 1;
            nextReceiptId = `DR-${currentYear}-${num.toString().padStart(6, '0')}`;
          } else {
            nextReceiptId = `DR-${currentYear}-000001`;
          }
        } else {
          nextReceiptId = `DR-${currentYear}-000001`;
        }
      } catch (e) {
        nextReceiptId = `DR-${currentYear}-000001`;
      }

      form.note_number = nextReceiptId;
      form.recipient_name = getCustomerName(fullLoanData);
      form.recipient_phone = getCustomerPhone(fullLoanData);
      form.delivery_address = fullLoanData.customer?.address || '';
      form.approved = false;

      originalData.value = null;
      originalApprovedStatus.value = false;
    }
  } catch (error) {
    alert.error('ບໍ່ສາມາດດຶງຂໍ້ມູນໃບມອບຮັບໄດ້');
  } finally {
    isLoading.value = false;
  }
};

const closeModal = () => {
  emit('close');
};

const hasDeliveryNote = computed(() => deliveryReceiptStore.currentReceipt !== null);

// 🌟 ອັບເດດ: ຖ້າບໍ່ມີສິດ ກໍໃຫ້ Disable ທັນທີ
const isEditingDisabled = computed(() => {
  if (!canEditNote.value) return true; // ສຳລັບ Auditor
  return deliveryReceiptStore.currentReceipt?.status === 'approved';
});

const canApproveDeliveryNote = computed(() => {
  if (!canEditNote.value) return false; // ສຳລັບ Auditor
  return deliveryReceiptStore.currentReceipt !== null && deliveryReceiptStore.currentReceipt.status !== 'approved';
});

const isSaveDisabled = computed(() => {
  if (isEditingDisabled.value) return true;
  if (deliveryReceiptStore.currentReceipt && !hasChanges()) return true;
  return false;
});

const approvalDisabledMessage = computed(() => {
  if (!canEditNote.value) return 'ທ່ານບໍ່ມີສິດອະນຸມັດ (Read-only)'; // ຂໍ້ຄວາມສຳລັບ Auditor
  if (!deliveryReceiptStore.currentReceipt) return 'ຕ້ອງສ້າງໃບມອບຮັບກ່ອນຈຶ່ງຈະສາມາດອະນຸມັດໄດ້';
  if (deliveryReceiptStore.currentReceipt.status === 'approved') return 'ໃບມອບຮັບນີ້ໄດ້ຮັບການອະນຸມັດແລ້ວ';
  return '';
});

const hasChanges = (): boolean => {
  if (!deliveryReceiptStore.currentReceipt) return false;
  const currentData = { receiver_name: form.recipient_name };
  const hasDataChanges = JSON.stringify(currentData) !== JSON.stringify(originalData.value);
  const hasApprovalChanged = form.approved !== originalApprovedStatus.value;
  return hasDataChanges || hasApprovalChanged;
};

const saveDeliveryNote = async () => {
  if (!props.loan || !canEditNote.value) return; // 🌟 ປ້ອງກັນໄວ້ກ່ອນ
  isSaving.value = true;

  try {
    const payload = {
      application_id: props.loan.id,
      delivery_date: new Date().toISOString(),
      receiver_name: form.recipient_name,
      status: (form.approved && !props.isPendingView ? 'approved' : 'pending') as 'pending' | 'approved' | 'rejected',
    };

    if (deliveryReceiptStore.currentReceipt) {
      await deliveryReceiptStore.updateReceipt(deliveryReceiptStore.currentReceipt.id, payload);
      alert.success('ອັບເດດໃບຮັບສິນຄ້າສຳເລັດ');
    } else {
      await deliveryReceiptStore.createReceipt(props.loan.id, payload);
      alert.success('ສ້າງໃບຮັບສິນຄ້າສຳເລັດ');
    }

    emit('updated');
    closeModal();
  } catch (error: any) {
    alert.error('ເກີດຂໍ້ຜິດພາດ: ' + (error.message || 'ບໍ່ສາມາດບັນທຶກໄດ້'));
  } finally {
    isSaving.value = false;
  }
};

const printDeliveryNote = async () => {
  if (!deliveryReceiptStore.currentReceipt || !props.loan) return;

  isPrinting.value = true;
  alert.info('ກຳລັງສ້າງເອກະສານ PDF ກະລຸນາລໍຖ້າ...');

  const pdfWindow = window.open('', '_blank');
  if (pdfWindow) {
    pdfWindow.document.write(`
      <html lang="lo">
        <head><title>ກຳລັງໂຫຼດ PDF...</title></head>
        <body style="display:flex; justify-content:center; align-items:center; height:100vh; margin:0; font-family:sans-serif; background-color:#f3f4f6; color:#555;">
          <div style="text-align:center;">
            <h2 style="margin-bottom: 10px;">ກຳລັງສ້າງເອກະສານ PDF...</h2>
            <p>ກະລຸນາລໍຖ້າຈັກໜ່ອຍ, ລະບົບກຳລັງປະມວນຜົນ.</p>
          </div>
        </body>
      </html>
    `);
    pdfWindow.document.close();
  }

  try {
    const response = await apiClient.post('/pdf/delivery-receipt', {
      loanData: fullLoanDataRef.value || props.loan,
      receiptData: deliveryReceiptStore.currentReceipt,
      receiverPhone: form.recipient_phone,
      deliveryAddress: form.delivery_address
    }, { responseType: 'blob', timeout: 60000 });

    const blobData = response.data instanceof Blob ? response.data : response;
    const file = new Blob([blobData as any], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(file);

    if (pdfWindow) {
      pdfWindow.document.open();
      pdfWindow.document.write(`
        <html>
          <head><title>ໃບມອບຮັບສິນຄ້າ - ${deliveryReceiptStore.currentReceipt.receipts_id}</title></head>
          <body style="margin:0; padding:0; overflow:hidden;">
            <iframe src="${url}" width="100%" height="100%" style="border:none;"></iframe>
          </body>
        </html>
      `);
      pdfWindow.document.close();
    } else {
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${deliveryReceiptStore.currentReceipt.receipts_id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    if (pdfWindow) pdfWindow.close();
    alert.error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດພິມເອກະສານໄດ້.");
  } finally {
    isPrinting.value = false;
  }
};
</script>
