<template>
  <teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[105] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">

        <div class="flex justify-between items-center p-5 border-b border-base-200 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-t-xl">
          <h3 class="text-xl font-bold flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
            <span class="icon-[tabler--signature] size-6"></span>
            ບັນທຶກຫຼັກຖານການລົງລາຍເຊັນ (Physical Signatures)
          </h3>
          <button @click="close" class="btn btn-ghost btn-sm btn-circle text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700">
            <span class="icon-[tabler--x] size-5"></span>
          </button>
        </div>

        <div class="p-6 overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-900">

          <div class="alert alert-info shadow-sm mb-6 text-sm">
            <span class="icon-[tabler--info-circle] size-5"></span>
            <span>ເລືອກປະເພດເອກະສານ ແລະ ບົດບາດຂອງຜູ້ເຊັນ ເພື່ອອັບໂຫຼດຮູບພາບຫຼັກຖານການລົງລາຍເຊັນຕົວຈິງ.</span>
          </div>

          <div class="space-y-5 bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">

            <div class="form-control w-full">
              <label class="label"><span class="label-text font-bold">ປະເພດເອກະສານ *</span></label>
              <select v-model="form.document_type" class="select select-bordered w-full" @change="fetchReferenceId">
                <option value="" disabled>-- ກະລຸນາເລືອກເອກະສານ --</option>
                <option value="contract">ສັນຍາກູ້ຢືມ (Loan Contract)</option>
                <option value="repayment_schedule">ຕາຕະລາງຜ່ອນ (Repayment Schedule)</option>
                <option value="delivery_note">ໃບສົ່ງມອບສິນຄ້າ (Delivery Note)</option>
              </select>
            </div>

            <div v-if="form.reference_id" class="form-control w-full animate-in fade-in duration-300">
              <label class="label">
                <span class="label-text font-bold text-gray-600">ລະຫັດອ້າງອີງເອກະສານ</span>
                <span class="badge badge-success badge-sm text-white">ພົບເອກະສານແລ້ວ</span>
              </label>
              <div class="flex items-center">
                <span class="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 border-r-0 px-3 py-3 rounded-l-lg text-gray-500">
                  <span class="icon-[tabler--link] size-5"></span>
                </span>
                <input type="text" :value="form.display_reference || `ID: ${form.reference_id}`"
                       class="input input-bordered w-full rounded-l-none bg-gray-50 dark:bg-gray-800/50 text-gray-600 font-mono font-semibold" readonly />
              </div>
            </div>

            <div v-if="isFetchingRef" class="text-sm text-info flex items-center gap-2 mt-2">
              <span class="loading loading-spinner loading-xs"></span> ກຳລັງຄົ້ນຫາຂໍ້ມູນເອກະສານ...
            </div>
            <div v-else-if="form.document_type && !form.reference_id" class="text-sm text-error flex items-center gap-2 mt-2 p-3 bg-error/10 rounded-lg">
              <span class="icon-[tabler--alert-circle] size-5"></span>
              <span>ບໍ່ພົບເອກະສານນີ້ໃນລະບົບ (ກະລຸນາສ້າງເອກະສານກ່ອນຈຶ່ງຈະສາມາດອັບໂຫຼດລາຍເຊັນໄດ້)</span>
            </div>

            <div class="form-control w-full" :class="{ 'opacity-50 pointer-events-none': !form.reference_id }">
              <label class="label"><span class="label-text font-bold">ບົດບາດຜູ້ເຊັນ (Role) *</span></label>
              <select v-model="form.role_type" class="select select-bordered w-full">
                <option value="" disabled>-- ກະລຸນາເລືອກບົດບາດ --</option>
                <option value="borrower">ລູກຄ້າຜູ້ກູ້ (Borrower)</option>
                <option value="guarantor">ຜູ້ຄ້ຳປະກັນ (Guarantor)</option>
                <option value="village_chief">ນາຍບ້ານ (Village Chief)</option>
                <option value="partner_shop">ຮ້ານຄ້າຕົວແທນ (Partner Shop)</option>
              </select>
            </div>

            <div class="form-control w-full" :class="{ 'opacity-50 pointer-events-none': !form.reference_id }">
              <label class="label">
                <span class="label-text font-bold">ຊື່ຜູ້ເຊັນຕົວຈິງ *</span>
                <span class="text-xs text-gray-500 font-normal">ປ້ອນຊື່ ແລະ ນາມສະກຸນ</span>
              </label>
              <input v-model="form.signer_name" type="text" class="input input-bordered w-full" placeholder="ເຊັ່ນ: ທ້າວ ສົມຊາຍ ໃຈດີ" />
            </div>

            <div class="form-control w-full" :class="{ 'opacity-50 pointer-events-none': !form.reference_id }">
              <label class="label"><span class="label-text font-bold">ຮູບພາບຫຼັກຖານລາຍເຊັນ *</span></label>

              <div class="flex flex-col sm:flex-row gap-4 items-start">
                <div class="flex-1 w-full">
                  <input type="file" class="file-input file-input-bordered file-input-primary w-full"
                         accept="image/*" @change="handleFileUpload" />
                  <p class="text-xs text-gray-500 mt-2">ຮອງຮັບໄຟລ໌ JPG, PNG (ບໍ່ເກີນ 5MB)</p>
                </div>

                <div v-if="previewUrl" class="relative w-32 h-32 rounded-lg border-2 border-primary border-dashed overflow-hidden shrink-0">
                  <img :src="previewUrl" class="w-full h-full object-cover" alt="Preview" />
                  <button @click="removeFile" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition shadow-md">
                    <span class="icon-[tabler--x] size-4"></span>
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

        <div class="p-4 border-t border-base-200 bg-base-100 flex justify-end gap-3 rounded-b-xl">
          <button class="btn btn-soft btn-secondary" @click="close" :disabled="isSaving">ຍົກເລີກ</button>
          <button class="btn btn-primary" @click="submitSignature" :disabled="!isFormValid || isSaving">
            <span v-if="isSaving" class="loading loading-spinner loading-xs"></span>
            <span v-else class="icon-[tabler--device-floppy] size-4"></span>
            ບັນທຶກຂໍ້ມູນ
          </button>
        </div>

      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import apiClient from '@/api/apiclient';
import { alert } from '@/utils/alert';

const props = defineProps<{ isOpen: boolean; loanId: number | null }>();
const emit = defineEmits<{ (e: 'close'): void; (e: 'updated'): void }>();

// 🟢 Form State
const form = reactive({
  document_type: '',
  reference_id: null as number | null,
  display_reference: '',
  role_type: '',
  signer_name: '',
});

const fileToUpload = ref<File | null>(null);
const previewUrl = ref<string | null>(null);

const isFetchingRef = ref(false);
const isSaving = ref(false);

// 🟢 Validation ກວດສອບກ່ອນໃຫ້ກົດບັນທຶກ
const isFormValid = computed(() => {
  return form.document_type !== '' &&
         form.reference_id !== null &&
         form.role_type !== '' &&
         form.signer_name.trim() !== '' &&
         fileToUpload.value !== null;
});

// Reset ຟອມເມື່ອປິດ ຫຼື ເປີດໃໝ່
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    resetForm();
  }
});

const resetForm = () => {
  form.document_type = '';
  form.reference_id = null;
  form.role_type = '';
  form.signer_name = '';
  fileToUpload.value = null;
  previewUrl.value = null;
};

// 🟢 ຟັງຊັນຊອກຫາ Reference ID ອັດຕະໂນມັດ
const fetchReferenceId = async () => {
  if (!form.document_type || !props.loanId) return;

  isFetchingRef.value = true;
  form.reference_id = null;
  form.display_reference = '';

  try {
    let endpoint = '';

    switch (form.document_type) {
      case 'contract':
        endpoint = `/loan-contract/${props.loanId}`;
        break;
      case 'repayment_schedule':
        endpoint = `/repayments/schedule/${props.loanId}`;
        break;
      case 'delivery_note':
        endpoint = `/delivery-receipt/application/${props.loanId}`;
        break;
    }

    if (endpoint) {
      const res = await apiClient.get(endpoint);

      // ==============================================
      // 🟢 ໂລຈິກປອກເປືອກຂໍ້ມູນແບບໄຮ້ທຽມທານ (Invincible Unwrapping)
      let extractedData: any = res;

      while (extractedData && typeof extractedData === 'object' && 'data' in extractedData && extractedData.data !== undefined && extractedData.data !== null) {
         extractedData = extractedData.data;
      }

      console.log(`[Debug] ຂໍ້ມູນສຸດທ້າຍຫຼັງຈາກແກະແລ້ວ:`, extractedData);

      if (!extractedData || (typeof extractedData === 'object' && Object.keys(extractedData).length === 0)) {
         throw new Error('ບໍ່ພົບຂໍ້ມູນ (Data is empty)');
      }

      // ==============================================
      // 🟢 ດຶງຄ່າ ID ແລະ ສະແດງຜົນ
      // ==============================================
      switch (form.document_type) {
        case 'contract':
          form.reference_id = extractedData.id || extractedData.loan_contract_id;
          form.display_reference = extractedData.loan_contract_number || `ສັນຍາ ID: ${form.reference_id}`;
          break;

        case 'repayment_schedule':
          // 🟢 ແກ້ໄຂໃໝ່: ຮອງຮັບ Object ທີ່ສົ່ງມາ (ເຊັ່ນ: {id: 9, application_id: 32, ...})
          if (!Array.isArray(extractedData) && extractedData.id) {
             form.reference_id = extractedData.id;
             // ສະແດງຜົນໃຫ້ເຫັນເລກ ID ແຈ້ງໆເລີຍ
             form.display_reference = `ຕາຕະລາງຜ່ອນສິນເຊື່ອ (ID: ${extractedData.id})`;
          }
          // ປ້ອງກັນກໍລະນີອະນາຄົດ ຖ້າ API ສົ່ງມາເປັນ Array
          else if (Array.isArray(extractedData) && extractedData.length > 0) {
             form.reference_id = extractedData[0].schedule_id || extractedData[0].id || props.loanId;
             form.display_reference = `ຕາຕະລາງຜ່ອນ (ງວດ ${extractedData.length})`;
          } else {
             // ຖ້າຫາບໍ່ເຫັນແທ້ໆ ໃຫ້ໃຊ້ loanId ແທນ
             form.reference_id = props.loanId;
             form.display_reference = `ຕາຕະລາງຜ່ອນສິນເຊື່ອ`;
          }
          break;

        case 'delivery_note':
          form.reference_id = extractedData.receipts_id || extractedData.id;
          form.display_reference = extractedData.delivery_number || extractedData.receipt_number || `ໃບນຳສົ່ງ (ID: ${form.reference_id})`;
          break;
      }

      if (!form.reference_id) {
         console.error("[Error] Object ທີ່ແກະໄດ້ ບໍ່ມີ id:", extractedData);
         throw new Error('ດຶງ ID ບໍ່ສຳເລັດ (Mapping Failed)');
      }
    }
  } catch (error) {
    console.error(`Error fetching reference ID for ${form.document_type}:`, error);
    form.reference_id = null; // ໃຫ້ UI ແຈ້ງເຕືອນສີແດງ
  } finally {
    isFetchingRef.value = false;
  }
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];

    if (!file) {
        console.warn("No file selected");
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert.error('ຂະໜາດໄຟລ໌ໃຫຍ່ເກີນໄປ (ສູງສຸດ 5MB)');
      target.value = '';
      return;
    }

    fileToUpload.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
};

const removeFile = () => {
  fileToUpload.value = null;
  previewUrl.value = null;
};

// 🟢 ຟັງຊັນບັນທຶກຂໍ້ມູນ (ແກ້ໄຂໃໝ່ໃຫ້ກົງກັບ Backend)
const submitSignature = async () => {
  if (!isFormValid.value || !props.loanId) return;

  isSaving.value = true;

  try {
    // 1. ແພັກຂໍ້ມູນທຸກຢ່າງເຂົ້າໃນ FormData ດຽວ
    const formData = new FormData();

    // ຂໍ້ມູນເອກະສານ
    formData.append('document_type', form.document_type);
    formData.append('reference_id', String(form.reference_id)); // ແປງເປັນ String
    formData.append('role_type', form.role_type);
    formData.append('signer_name', form.signer_name);

    // ໄຟລ໌ຮູບພາບ
    formData.append('file', fileToUpload.value as Blob);

    // 2. ຍິງ API ອັບໂຫຼດພ້ອມກັບຂໍ້ມູນ (ໃຊ້ Endpoint ຂອງ Backend ທີ່ກຽມໄວ້)
    // ⚠️ ຢ່າລືມປ່ຽນ `/upload/signature/${props.loanId}` ໃຫ້ກົງກັບ Route ຂອງ Backend ທີ່ແທ້ຈິງຂອງທ່ານ
    const response = await apiClient.post(`/upload/signature/${props.loanId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data?.success || response.status === 201) {
      alert.success('ບັນທຶກຫຼັກຖານລາຍເຊັນສຳເລັດ!');
      emit('updated');
      close();
    } else {
      throw new Error(response.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ');
    }

  } catch (error: any) {
    console.error('Submit signature error:', error);

    // ດັກຈັບ Error ຈາກ Backend ຖ້າເກີດ Duplicate
    if (error.response?.status === 409 || error.response?.data?.message?.includes('Duplicate')) {
      alert.error('ຂໍ້ມູນຊ້ຳຊ້ອນ', 'ບົດບາດນີ້ໄດ້ລົງລາຍເຊັນໃນເອກະສານນີ້ໄປແລ້ວ.');
    } else {
      const errorMsg = error.response?.data?.message || error.message || 'ກະລຸນາລອງໃໝ່ອີກຄັ້ງ';
      alert.error('ບໍ່ສາມາດບັນທຶກຂໍ້ມູນໄດ້', errorMsg);
    }
  } finally {
    isSaving.value = false;
  }
};

const close = () => {
  emit('close');
};
</script>
