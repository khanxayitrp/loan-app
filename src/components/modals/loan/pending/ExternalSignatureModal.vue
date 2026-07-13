<template>
  <teleport to="body">
    <div v-if="isOpen && loanId" class="fixed inset-0 z-[105] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
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

        <div v-if="isLoadingData" class="flex flex-col items-center justify-center p-12 flex-1 bg-gray-50 dark:bg-gray-900">
          <span class="loading loading-spinner loading-lg text-primary mb-4"></span>
          <p class="text-gray-500 font-medium animate-pulse">ກຳລັງກວດສອບປະຫວັດເອກະສານ...</p>
        </div>

        <div v-else class="p-6 overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-900">

          <div v-if="completedDocumentList.length > 0" class="mb-5 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-4 animate-in fade-in">
            <h4 class="font-bold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
              <span class="icon-[tabler--circle-check-filled] size-5"></span>
              ເອກະສານທີ່ອັບໂຫຼດແລ້ວ (ກົດເພື່ອອັບເດດໃໝ່)
            </h4>
            <div class="flex flex-wrap gap-2">
              <button type="button" v-for="doc in completedDocumentList" :key="doc.value"
                @click="editCompletedDocument(doc.value)"
                class="btn btn-sm"
                :class="form.document_type === doc.value ? 'btn-success text-white' : 'btn-outline btn-success bg-white dark:bg-gray-800'">
                <span class="icon-[tabler--edit] size-4"></span> {{ doc.label }}
              </button>
            </div>
          </div>

          <div class="alert alert-info shadow-sm mb-6 text-sm" v-if="availableDocumentOptions.length > 0 || form.document_type !== ''">
            <span class="icon-[tabler--info-circle] size-5"></span>
            <span>ເລືອກປະເພດເອກະສານ, ຕິກເລືອກຜູ້ທີ່ເຊັນໃນເອກະສານນີ້ ແລະ ອັບໂຫຼດໄຟລ໌ PDF ຫຼື ຮູບພາບ.</span>
          </div>
          <div class="alert alert-success shadow-sm mb-6 text-sm" v-else>
            <span class="icon-[tabler--check] size-5"></span>
            <span>ອັບໂຫຼດເອກະສານຄົບຖ້ວນທຸກປະເພດແລ້ວ.</span>
          </div>

          <div class="space-y-5 bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">

            <div class="form-control w-full">
              <label class="label"><span class="label-text font-bold">ປະເພດເອກະສານ *</span></label>
              <select v-model="form.document_type" class="select select-bordered w-full" @change="handleDocumentTypeChange">
                <option value="" disabled>-- ກະລຸນາເລືອກເອກະສານ --</option>
                <option v-for="opt in availableDocumentOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
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
                <input type="text" :value="form.display_reference" class="input input-bordered w-full rounded-l-none bg-gray-50 dark:bg-gray-800/50 text-gray-600 font-mono font-semibold" readonly />
              </div>
            </div>

            <div v-if="isFetchingRef" class="text-sm text-info flex items-center gap-2 mt-2">
              <span class="loading loading-spinner loading-xs"></span> ກຳລັງຄົ້ນຫາຂໍ້ມູນເອກະສານ...
            </div>

            <div v-if="form.reference_id" class="form-control w-full animate-in fade-in">
              <label class="label border-b pb-2 mb-3">
                <span class="label-text font-bold">ເລືອກຜູ້ທີ່ລົງລາຍເຊັນໃນເອກະສານນີ້ (Roles) *</span>
              </label>

              <div class="space-y-3">
                <div v-for="(signer, index) in form.signers" :key="signer.role" class="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border rounded-lg bg-base-50 transition-all" :class="{'border-primary bg-primary/5': signer.checked}">
                  <label class="cursor-pointer flex items-center gap-3 w-full sm:w-1/3">
                    <input type="checkbox" v-model="signer.checked" class="checkbox checkbox-primary" />
                    <span class="font-medium text-sm">{{ signer.label }}</span>
                  </label>

                  <div class="flex-1" v-if="signer.checked">
                    <input type="text" v-model="signer.name" class="input input-bordered input-sm w-full" :placeholder="`ຊື່ ແລະ ນາມສະກຸນ ${signer.label}`" />
                  </div>
                </div>
              </div>
              <p v-if="!hasCheckedSigner" class="text-error text-xs mt-2">ກະລຸນາເລືອກຜູ້ເຊັນຢ່າງໜ້ອຍ 1 ຄົນ</p>
            </div>

            <div class="form-control w-full" :class="{ 'opacity-50 pointer-events-none': !form.reference_id }">
              <label class="label"><span class="label-text font-bold">ໄຟລ໌ເອກະສານ (PDF ຫຼື ຮູບພາບ) *</span></label>

              <div class="flex flex-col sm:flex-row gap-4 items-start">
                <div class="flex-1 w-full">
                  <input type="file" class="file-input file-input-bordered file-input-primary w-full"
                         accept="image/jpeg, image/png, application/pdf" @change="handleFileUpload" />
                  <p class="text-xs text-gray-500 mt-2">ຮອງຮັບໄຟລ໌ PDF, JPG, PNG (ບໍ່ເກີນ 10MB ສຳລັບ PDF ແນະນຳ)</p>
                </div>

                <div v-if="fileToUpload" class="relative w-32 h-32 rounded-lg border-2 border-primary border-dashed overflow-hidden shrink-0 bg-base-200 flex items-center justify-center">

                  <img v-if="isImageFile" :src="previewUrl || undefined" class="w-full h-full object-cover" alt="Preview" />

                  <div v-else class="flex flex-col items-center justify-center p-2 text-center">
                    <span class="icon-[tabler--file-type-pdf] size-10 text-error mb-1"></span>
                    <span class="text-[10px] font-mono leading-tight truncate w-full px-1">{{ fileToUpload.name }}</span>
                  </div>

                  <button @click="removeFile" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition shadow-md">
                    <span class="icon-[tabler--x] size-4"></span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div class="p-4 border-t border-base-200 bg-base-100 flex justify-end gap-3 rounded-b-xl">
          <button class="btn btn-soft btn-secondary" @click="close" :disabled="isSaving || isLoadingData">ຍົກເລີກ</button>
          <button class="btn btn-primary" @click="submitSignature" :disabled="!isFormValid || isSaving || isLoadingData">
            <span v-if="isSaving" class="loading loading-spinner loading-xs"></span>
            <span v-else class="icon-[tabler--device-floppy] size-4"></span>
            ບັນທຶກເອກະສານ
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

// 🟢 ປ່ຽນມາຮັບ prop loanId ຕາມທີ່ຕ້ອງການ
const props = defineProps<{ isOpen: boolean; loanId: number | null }>();
const emit = defineEmits<{ (e: 'close'): void; (e: 'updated'): void }>();

// ຕົວເລືອກພື້ນຖານຂອງເອກະສານທັງໝົດ
const baseDocumentOptions = [
  { value: 'contract', label: 'ສັນຍາກູ້ຢືມ (Loan Contract)' },
  { value: 'repayment_schedule', label: 'ຕາຕະລາງຜ່ອນ (Repayment Schedule)' },
  { value: 'delivery_note', label: 'ໃບສົ່ງມອບສິນຄ້າ (Delivery Note)' }
];

const roleTemplates = {
  contract: [
    { role: 'borrower', label: 'ລູກຄ້າຜູ້ກູ້', checked: true, name: '' },
    { role: 'guarantor', label: 'ຜູ້ຄ້ຳປະກັນ', checked: true, name: '' },
    { role: 'village_chief', label: 'ນາຍບ້ານ', checked: false, name: '' }
  ],
  repayment_schedule: [
    { role: 'borrower', label: 'ລູກຄ້າຜູ້ກູ້', checked: true, name: '' },
    { role: 'finance_staff', label: 'ພະນັກງານການເງິນ', checked: true, name: '' }
  ],
  delivery_note: [
    { role: 'borrower', label: 'ລູກຄ້າຜູ້ກູ້ / ຜູ້ຮັບສິນຄ້າ', checked: true, name: '' },
    { role: 'partner_shop', label: 'ຮ້ານຄ້າຕົວແທນ', checked: true, name: '' }
  ]
};

const form = reactive({
  document_type: '',
  reference_id: null as number | null,
  display_reference: '',
  signers: [] as Array<{ role: string, label: string, checked: boolean, name: string }>
});

const existingSignatures = ref<any[]>([]); // ເກັບປະຫວັດທີ່ດຶງມາຈາກ API
const isLoadingData = ref(false); // 🟢 ຈັດການ Loading state
const fileToUpload = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const isFetchingRef = ref(false);
const isSaving = ref(false);

const isImageFile = computed(() => fileToUpload.value?.type.startsWith('image/'));

// 🟢 Logic ຕອງເອກະສານ
const completedDocTypes = computed(() => {
  // 🟢 เพิ่มบรรทัดนี้: ถ้าไม่ใช่ Array ให้ส่งค่า Array ว่างกลับไปเลย
  if (!Array.isArray(existingSignatures.value)) return [];

  return existingSignatures.value
    .filter(s => s.role_type === 'borrower' && s.status === 'signed')
    .map(s => s.document_type);
});

const availableDocumentOptions = computed(() => {
  return baseDocumentOptions.filter(opt =>
    !completedDocTypes.value.includes(opt.value) || form.document_type === opt.value
  );
});

const completedDocumentList = computed(() => {
  return baseDocumentOptions.filter(opt => completedDocTypes.value.includes(opt.value));
});

const hasCheckedSigner = computed(() => form.signers.some(s => s.checked));
const isNamesFilled = computed(() => form.signers.filter(s => s.checked).every(s => s.name.trim() !== ''));

const isFormValid = computed(() => {
  return form.document_type !== '' &&
         form.reference_id !== null &&
         hasCheckedSigner.value &&
         isNamesFilled.value &&
         fileToUpload.value !== null;
});

// 🟢 ເມື່ອເປີດ Modal ໃຫ້ລ້າງຟອມ ແລະ ຍິງ API ດຶງຂໍ້ມູນໃໝ່ສະເໝີ
watch(() => props.isOpen, async (newVal) => {
  if (newVal && props.loanId) {
    resetForm();
    await fetchExistingSignatures();
  }
});

// 🟢 ຟັງຊັນຍິງ API ດຶງຂໍ້ມູນປະຫວັດການເຊັນ
const fetchExistingSignatures = async () => {
  if (!props.loanId) return;
  isLoadingData.value = true;
  try {
    const res = await apiClient.get(`/loan-application/document-signature/${props.loanId}`);

    // 🟢 1. เริ่มต้นปอกเปลือกข้อมูล
    let extractedData: any = res;

    // วน Loop ทะลวงเข้าไปใน Object จนกว่าจะเจอ Array หรือหมด property 'data'
    while (extractedData && typeof extractedData === 'object' && !Array.isArray(extractedData) && 'data' in extractedData && extractedData.data !== undefined) {
       extractedData = extractedData.data;
    }

    // 🟢 2. ตรวจสอบและเก็บค่าลง State
    existingSignatures.value = Array.isArray(extractedData) ? extractedData : [];

    // ลอง Log ดูรอบนี้ รับรองว่ามาเต็มแน่นอนครับ!
    console.log("ข้อมูลที่แกะสำเร็จแล้ว: ", JSON.parse(JSON.stringify(existingSignatures.value)));

  } catch (error) {
    console.error('Failed to fetch existing signatures', error);
    alert.error('ບໍ່ສາມາດດຶງຂໍ້ມູນປະຫວັດເອກະສານໄດ້');
    existingSignatures.value = [];
  } finally {
    isLoadingData.value = false;
  }
};

const resetForm = () => {
  form.document_type = '';
  form.reference_id = null;
  form.display_reference = '';
  form.signers = [];
  removeFile();
};

const editCompletedDocument = async (docType: string) => {
  form.document_type = docType;
  await handleDocumentTypeChange();
};

const handleDocumentTypeChange = async () => {
  const docType = form.document_type as keyof typeof roleTemplates;
  if (roleTemplates[docType]) {
    form.signers = JSON.parse(JSON.stringify(roleTemplates[docType]));

    // ດຶງຊື່ເກົ່າມາໃສ່ຊ່ອງ Input ອັດຕະໂນມັດຖ້າເຄີຍເຊັນໄປແລ້ວ
    form.signers.forEach(signer => {
      const existing = existingSignatures.value.find(s => s.document_type === docType && s.role_type === signer.role);
      if (existing && existing.signer_name) {
        signer.name = existing.signer_name;
        signer.checked = true; // ບັງຄັບຕິກໃຫ້ຖ້າເຄີຍເຊັນ
      }
    });
  } else {
    form.signers = [];
  }

  await fetchReferenceId();
};

const fetchReferenceId = async () => {
  if (!form.document_type || !props.loanId) return;
  isFetchingRef.value = true;
  form.reference_id = null;
  form.display_reference = '';

  try {
    let endpoint = '';
    switch (form.document_type) {
      case 'contract': endpoint = `/loan-contract/${props.loanId}`; break;
      case 'repayment_schedule': endpoint = `/repayments/schedule/${props.loanId}`; break;
      case 'delivery_note': endpoint = `/delivery-receipt/application/${props.loanId}`; break;
    }

    if (endpoint) {
      const res = await apiClient.get(endpoint);
      let extractedData: any = res;
      while (extractedData && typeof extractedData === 'object' && 'data' in extractedData && extractedData.data !== undefined && extractedData.data !== null) {
         extractedData = extractedData.data;
      }

      if (!extractedData || (typeof extractedData === 'object' && Object.keys(extractedData).length === 0)) throw new Error('ບໍ່ພົບຂໍ້ມູນ');

      switch (form.document_type) {
        case 'contract':
          form.reference_id = extractedData.id || extractedData.loan_contract_id;
          form.display_reference = extractedData.loan_contract_number || `ສັນຍາ ID: ${form.reference_id}`;
          break;
        case 'repayment_schedule':
          if (!Array.isArray(extractedData) && extractedData.id) {
             form.reference_id = extractedData.id;
             form.display_reference = `ຕາຕະລາງຜ່ອນສິນເຊື່ອ (ID: ${extractedData.id})`;
          } else if (Array.isArray(extractedData) && extractedData.length > 0) {
             form.reference_id = extractedData[0].schedule_id || extractedData[0].id || props.loanId;
             form.display_reference = `ຕາຕະລາງຜ່ອນ (ງວດ ${extractedData.length})`;
          } else {
             form.reference_id = props.loanId;
             form.display_reference = `ຕາຕະລາງຜ່ອນສິນເຊື່ອ`;
          }
          break;
        case 'delivery_note':
          form.reference_id = extractedData.id;
          form.display_reference = extractedData.receipts_id || `ໃບນຳສົ່ງ (ID: ${form.reference_id})`;
          break;
      }
    }
  } catch (error) {
    console.error(`Error fetching ref ID:`, error);
  } finally {
    isFetchingRef.value = false;
  }
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert.error('ຂະໜາດໄຟລ໌ໃຫຍ່ເກີນໄປ (ສູງສຸດ 10MB)');
      target.value = '';
      return;
    }
    fileToUpload.value = file;
    if (file.type.startsWith('image/')) {
        previewUrl.value = URL.createObjectURL(file);
    } else {
        previewUrl.value = null;
    }
  }
};

const removeFile = () => {
  fileToUpload.value = null;
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = null;
};

const submitSignature = async () => {
  if (!isFormValid.value || !props.loanId) return;
  isSaving.value = true;

  try {
    const formData = new FormData();
    formData.append('document_type', form.document_type);
    formData.append('reference_id', String(form.reference_id));
    formData.append('file', fileToUpload.value as Blob);

    const activeSigners = form.signers
      .filter(s => s.checked)
      .map(s => ({ role: s.role, name: s.name }));

    formData.append('signers', JSON.stringify(activeSigners));

    const response = await apiClient.post(`/upload/signature/${props.loanId}/batch`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (response.data?.success || response.status === 201 || response.status === 200) {
      alert.success('ບັນທຶກເອກະສານສຳເລັດ!');

      // ເມື່ອບັນທຶກສຳເລັດແລ້ວ ໃຫ້ດຶງຂໍ້ມູນໃໝ່ທັນທີເພື່ອອັບເດດໜ້າຈໍ ໂດຍບໍ່ຕ້ອງປິດ Modal
      await fetchExistingSignatures();
      resetForm();

      emit('updated');
    } else {
      throw new Error(response.data?.message || 'ເກີດຂໍ້ຜິດພາດ');
    }

  } catch (error: any) {
    console.error('Submit signature error:', error);
    alert.error('ບໍ່ສາມາດບັນທຶກຂໍ້ມູນໄດ້', error.response?.data?.message || error.message);
  } finally {
    isSaving.value = false;
  }
};

const close = () => {
  emit('close');
};
</script>
