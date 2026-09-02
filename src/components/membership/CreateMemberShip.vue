<template>
  <div class="p-6 max-w-4xl mx-auto">
    <div class="flex items-center gap-3 mb-6">
      <div class="p-2 bg-primary/10 rounded-lg">
        <span class="icon-[tabler--user-plus] size-6 text-primary"></span>
      </div>
      <div>
        <h2 class="text-xl font-bold text-gray-800 dark:text-white">ສ້າງຂໍ້ມູນສະມາຊິກໃໝ່ (KYC)</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">ລົງທະບຽນຂໍ້ມູນລູກຄ້າໃໝ່ເຂົ້າສູ່ລະບົບ (ໂດຍພະນັກງານ)</p>
      </div>
    </div>

    <div class="tabs tabs-boxed mb-6">
      <button class="tab" :class="{ 'tab-active': activeTab === 'profile' }" @click="switchTab('profile')">
        <span class="icon-[tabler--user-circle] size-4 mr-2"></span>
        ຂໍ້ມູນສ່ວນຕົວ
      </button>
      <button class="tab" :class="{ 'tab-active': activeTab === 'documents', 'tab-disabled': !canAccessDocuments }"
        :disabled="!canAccessDocuments" @click="switchTab('documents')">
        <span class="icon-[tabler--file-upload] size-4 mr-2"></span>
        ເອກະສານຢັ້ງຢືນ
      </button>
    </div>

    <!-- 🌟 TAB 1: ຂໍ້ມູນສ່ວນຕົວ -->
    <div v-if="activeTab === 'profile'"
      class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">

      <!-- 🟢 ສ່ວນອັບໂຫຼດຮູບໂປຣໄຟລ໌ -->
      <div class="flex flex-col items-center justify-center mb-8 border-b pb-6 border-dashed">
        <div class="relative group cursor-pointer" @click="triggerProfileUpload">
          <div
            class="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-700 bg-gray-50 shadow-md">
            <img v-if="profilePreview" :src="profilePreview" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              <span class="icon-[tabler--user] size-10"></span>
            </div>
          </div>
          <div
            class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span class="icon-[tabler--camera-plus] size-6 text-white"></span>
          </div>
          <input ref="profileInput" type="file" class="hidden" accept="image/jpeg, image/png, image/webp"
            @change="handleProfileSelect" />
        </div>
        <p class="text-sm text-gray-500 mt-2 font-medium">ອັບໂຫຼດຮູບໂປຣໄຟລ໌ (ຖ້າມີ)</p>
        <button v-if="profilePreview" class="btn btn-xs btn-ghost text-error mt-1" @click="removeProfileImage">
          ລຶບຮູບ
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="form-control">
          <label class="label"><span class="label-text font-medium">ຊື່ແທ້ (ພາສາລາວ) *</span></label>
          <input v-model="customerForm.first_name" type="text" placeholder="ປ້ອນຊື່" class="input input-bordered w-full"
            @input="customerForm.first_name = customerForm.first_name.replace(/[^\u0E80-\u0EFF\s]/g, '')"
            :class="{ 'input-error': customerErrors.first_name }" />
          <label v-if="customerErrors.first_name" class="label text-error"><span class="label-text-alt">{{
            customerErrors.first_name }}</span></label>
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text font-medium">ນາມສະກຸນ (ພາສາລາວ)</span></label>
          <input v-model="customerForm.last_name" type="text" placeholder="ປ້ອນນາມສະກຸນ"
            class="input input-bordered w-full"
            @input="customerForm.last_name = customerForm.last_name.replace(/[^\u0E80-\u0EFF\s]/g, '')" />
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text font-medium">ເບີໂທລະສັບ *</span></label>
          <input v-model="customerForm.phone" type="tel" placeholder="ປ້ອນເບີໂທລະສັບ"
            class="input input-bordered w-full" :class="{ 'input-error': customerErrors.phone }" maxlength="11" />
          <label v-if="customerErrors.phone" class="label text-error"><span class="label-text-alt">{{
            customerErrors.phone }}</span></label>
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text font-medium">ເພດ</span></label>
          <select v-model="customerForm.gender" class="select select-bordered w-full">
            <option value="" disabled>-- ເລືອກເພດ --</option>
            <option value="Male">ຊາຍ (Male)</option>
            <option value="Female">ຍິງ (Female)</option>
          </select>
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text font-medium">ວັນເດືອນປີເກີດ *</span></label>
          <input v-model="customerForm.date_of_birth" type="date" class="input input-bordered w-full"
            :class="{ 'input-error': customerErrors.date_of_birth }" />
          <label v-if="customerErrors.date_of_birth" class="label text-error"><span class="label-text-alt">{{
            customerErrors.date_of_birth }}</span></label>
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text font-medium">ເລກບັດປະຈຳຕົວ (ຖ້າມີ)</span></label>
          <input v-model="customerForm.id_card" type="text" placeholder="ປ້ອນເລກບັດປະຈຳຕົວ"
            class="input input-bordered w-full" />
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text font-medium text-indigo-600">ເລກບັນຊີທະນາຄານ
              (BCEL)</span></label>
          <input v-model="customerForm.account_number" type="text" placeholder="ຕົວຢ່າງ: 010123456789"
            class="input input-bordered w-full border-indigo-200" />
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text font-medium">ອາຊີບ (ພາສາລາວ) *</span></label>
          <input v-model="customerForm.occupation" type="text" placeholder="ປ້ອນອາຊີບ"
            class="input input-bordered w-full"
            @input="customerForm.occupation = customerForm.occupation.replace(/[^\u0E80-\u0EFF\s]/g, '')"
            :class="{ 'input-error': customerErrors.occupation }" />
          <label v-if="customerErrors.occupation" class="label text-error"><span class="label-text-alt">{{
            customerErrors.occupation }}</span></label>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 border-t pt-4">
        <div class="form-control">
          <label class="label"><span class="label-text font-medium">ແຂວງ *</span></label>
          <select v-model="customerForm.province_id" class="select select-bordered w-full"
            :class="{ 'select-error': customerErrors.province_id }">
            <option value="" disabled>-- ເລືອກແຂວງ --</option>
            <option v-for="p in addressStore.provinces" :key="p.province_id" :value="p.province_id">{{ p.province_name
            }}</option>
          </select>
          <label v-if="customerErrors.province_id" class="label text-error"><span class="label-text-alt">{{
            customerErrors.province_id }}</span></label>
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text font-medium">ເມືອງ *</span></label>
          <select v-model="customerForm.district_id" class="select select-bordered w-full"
            :disabled="!customerForm.province_id || addressStore.loading"
            :class="{ 'select-error': customerErrors.district_id }">
            <option value="" disabled>{{ addressStore.loading ? 'ກຳລັງໂຫຼດ...' : '-- ເລືອກເມືອງ --' }}</option>
            <option v-for="d in addressStore.districts" :key="d.district_id" :value="d.district_id">{{ d.district_name
            }}</option>
          </select>
          <label v-if="customerErrors.district_id" class="label text-error"><span class="label-text-alt">{{
            customerErrors.district_id }}</span></label>
        </div>
      </div>

      <div class="form-control mt-4">
        <label class="label"><span class="label-text font-medium">ບ້ານ / ໜ່ວຍ / ເຮືອນເລກທີ (ພາສາລາວ) *</span></label>
        <input v-model="customerForm.address" type="text" placeholder="ຕົວຢ່າງ: ບ້ານໂພນໄຊ, ໜ່ວຍ 15"
          class="input input-bordered w-full"
          @input="customerForm.address = customerForm.address.replace(/[^\u0E80-\u0EFF\s0-9\/\-,.]/g, '')"
          :class="{ 'input-error': customerErrors.address }" />
        <label v-if="customerErrors.address" class="label text-error"><span class="label-text-alt">{{
          customerErrors.address }}</span></label>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div class="form-control">
          <label class="label"><span class="label-text font-medium">ລາຍຮັບຕໍ່ເດືອນ (ກີບ)</span></label>
          <input :value="formatCurrencyInput(customerForm.monthly_income)"
            @input="handleCurrencyInput('monthly_income', $event)" type="text" placeholder="ປ້ອນລາຍຮັບຕໍ່ເດືອນ"
            class="input input-bordered w-full text-success font-bold" />
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text font-medium">ໜີ້ສິນອື່ນໆ (ກີບ)</span></label>
          <input :value="formatCurrencyInput(customerForm.other_debts)"
            @input="handleCurrencyInput('other_debts', $event)" type="text" placeholder="ປ້ອນຈຳນວນໜີ້ສິນອື່ນໆ"
            class="input input-bordered w-full text-error font-bold" />
        </div>
      </div>

      <div class="flex justify-end mt-8 gap-3">
        <button type="button" class="btn btn-outline" @click="$router.push('/membership')">ຍົກເລີກ</button>
        <button type="button" class="btn btn-primary" :disabled="isSubmitting" @click="handleDirectSubmit">
          <span v-if="isSubmitting" class="loading loading-spinner loading-xs"></span>
          <span v-else>ບັນທຶກຂໍ້ມູນສະມາຊິກ</span>
        </button>
      </div>
    </div>

    <!-- 🌟 TAB 2: ເອກະສານ -->
    <div v-else-if="activeTab === 'documents'"
      class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">

      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white">ອັບໂຫຼດເອກະສານ (KYC)</h2>
        <button class="btn btn-sm btn-outline btn-secondary" @click="$router.push('/membership')">
          ຂ້າມໄປກ່ອນ (ອັບໂຫຼດພາຍຫຼັງ)
        </button>
      </div>

      <div class="space-y-6">
        <div v-for="cat in allDocumentCategories" :key="cat.id"
          class="border rounded-2xl p-5 bg-white shadow-sm border-slate-200">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h5 class="font-bold text-slate-800">{{ cat.name }}</h5>
              <p class="text-[11px] text-slate-400 mt-1">{{ cat.description }}</p>
            </div>
            <span v-if="cat.required"
              class="badge badge-error badge-soft text-[10px] font-bold px-2 py-1">ຕ້ອງການ</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            <div v-for="(f, fileIndex) in cat.files" :key="fileIndex"
              class="relative aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
              <button type="button" @click.stop="removeDocument(cat.id, fileIndex)"
                class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 z-10 shadow-md hover:scale-110 transition-transform">
                <span class="icon-[tabler--x] size-4"></span>
              </button>
              <img v-if="!f.isPdf" :src="f.preview" class="w-full h-full object-cover cursor-pointer"
                @click="openInNewTab(f.preview)" />
              <div v-else class="w-full h-full flex flex-col items-center justify-center cursor-pointer"
                @click="openInNewTab(f.preview)">
                <span class="icon-[tabler--file-type-pdf] size-10 text-red-500 mb-1"></span>
                <span class="text-[10px] text-center truncate px-2 w-full">{{ f.name }}</span>
              </div>
            </div>

            <label
              class="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-400 transition-all group">
              <input type="file" class="hidden" multiple accept="image/*,.pdf"
                @change="(e) => handleDocumentUpload(cat.id, e)" />
              <div
                class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                <span class="icon-[tabler--plus] size-6 text-slate-400 group-hover:text-indigo-600"></span>
              </div>
              <span class="text-[11px] font-bold text-slate-400 mt-2 group-hover:text-indigo-600">ເພີ່ມໄຟລ໌</span>
            </label>
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <button type="button" class="btn btn-primary" :disabled="isSubmitting || !allRequiredDocumentsUploaded"
            @click="submitDocuments">
            <span v-if="isSubmitting" class="loading loading-spinner loading-xs"></span>
            <span v-else>ບັນທຶກເອກະສານ ແລະ ສຳເລັດ</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <teleport to="body">
      <div v-if="showSuccessModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200">
          <div class="text-center">
            <div class="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4"><span
                class="icon-[tabler--check] size-8 text-success"></span></div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-2">ສ້າງຂໍ້ມູນສະມາຊິກສຳເລັດ!</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">ຂໍ້ມູນຖືກບັນທຶກເຂົ້າໃນລະບົບແລ້ວ
              ທ່ານຕ້ອງການອັບໂຫຼດເອກະສານເລີຍບໍ່?</p>

            <div class="flex flex-col gap-3">
              <button type="button" class="btn btn-primary w-full" @click="switchToDocumentsTab">
                ດຳເນີນການອັບໂຫຼດເອກະສານດຽວນີ້
              </button>
              <button type="button" class="btn btn-outline btn-secondary w-full" @click="$router.push('/membership')">
                ຂ້າມໄປກ່ອນ (ອັບໂຫຼດພາຍຫຼັງ)
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAddressStore } from '@/stores/address'
import apiClient from '@/api/apiclient'
import { alert } from '@/utils/alert'
import { formatStandardPhoneNumber, normalizePhoneNumber } from '@/utils/formatters'
import imageCompression from 'browser-image-compression'

interface UploadedFile { id?: number; file: File | null; preview: string; isPdf: boolean; name: string; }
interface DocumentCategory { id: string; name: string; description: string; required: boolean; files: UploadedFile[]; }

const addressStore = useAddressStore()
const router = useRouter()

const activeTab = ref<'profile' | 'documents'>('profile')
const isSubmitting = ref(false)
const canAccessDocuments = ref(false)
const showSuccessModal = ref(false)
const newCustomerId = ref<number | null>(null)

// 🟢 ຕົວປ່ຽນສຳລັບອັບໂຫຼດຮູບໂປຣໄຟລ໌
const profileInput = ref<HTMLInputElement | null>(null)
const profileFile = ref<File | null>(null)
const profilePreview = ref<string>('')

// 🟢 Form Data
const customerForm = reactive({
  first_name: '', last_name: '', phone: '', gender: '', date_of_birth: '', id_card: '',
  account_number: '',
  province_id: '', district_id: '', address: '', occupation: '', monthly_income: 0, other_debts: 0
})

const customerErrors = reactive({
  first_name: '', phone: '', province_id: '', district_id: '', address: '', occupation: '', date_of_birth: ''
})

// 🟢 Documents Data
const requiredDocuments = ref<DocumentCategory[]>([
  { id: 'id_card', name: 'ບັດປະຈຳຕົວ/ສຳມະໂນຄົວ', description: 'ຮູບຖ່າຍເອກະສານຢັ້ງຢືນຕົວຕົນ', required: true, files: [] },
  { id: 'house_reg', name: 'ປື້ມສຳມະໂນຄົວ', description: 'ເອກະສານຢັ້ງຢືນທີ່ຢູ່', required: false, files: [] }
])
const optionalDocuments = ref<DocumentCategory[]>([
  { id: 'salary_slip', name: 'ຫຼັກຖານລາຍຮັບ', description: 'ໃບເງິນເດືອນ ຫຼື ໃບຮັບລາຍຮັບ', required: false, files: [] },
  { id: 'other', name: 'ເອກະສານອື່ນໆ', description: 'ເອກະສານອື່ນໆທີ່ກ່ຽວຂ້ອງ', required: false, files: [] }
])

const allDocumentCategories = computed(() => [...requiredDocuments.value, ...optionalDocuments.value]);
const allRequiredDocumentsUploaded = computed(() => requiredDocuments.value.every(cat => !cat.required || cat.files.length > 0))

// 🟢 Helper Function: ກວດສອບພາສາລາວ
const isLaoOnly = (text: string) => /^[\u0E80-\u0EFF\s]*$/.test(text.trim());
const isLaoWithNumbers = (text: string) => /^[\u0E80-\u0EFF\s0-9\/\-,.]*$/.test(text.trim());

const handleCurrencyInput = (field: 'monthly_income' | 'other_debts', event: Event) => {
  const target = event.target as HTMLInputElement; const num = parseInt(target.value.replace(/\D/g, ''), 10);
  customerForm[field] = isNaN(num) ? 0 : num;
}
const formatCurrencyInput = (val: number | string | null | undefined): string => {
  if (!val) return ''; return Number(val).toLocaleString('en-US');
}

watch(() => customerForm.province_id, async (newVal) => {
  customerForm.district_id = '';
  if (newVal) await addressStore.fetchDistricts(newVal); else addressStore.districts = [];
});

const switchTab = (tab: 'profile' | 'documents') => { if (tab === 'documents' && !canAccessDocuments.value) return; activeTab.value = tab }

// 🟢 Profile Image Logic
const triggerProfileUpload = () => {
  profileInput.value?.click();
};

const handleProfileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files || files.length === 0) return;

  const file = files[0];
  if (!file) return; // 👈 Add this line to satisfy TypeScript (Type Narrowing)
  if (file.size > 5 * 1024 * 1024) {
    alert.error('ຮູບໃຫຍ່ເກີນໄປ', 'ກະລຸນາເລືອກຮູບໂປຣໄຟລ໌ທີ່ມີຂະໜາດບໍ່ເກີນ 5MB');
    target.value = '';
    return;
  }

  try {
    const compressedBlob = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true });
    profileFile.value = new File([compressedBlob], file.name, { type: compressedBlob.type, lastModified: Date.now() });

    const reader = new FileReader();
    reader.onload = (e) => { profilePreview.value = e.target?.result as string; };
    reader.readAsDataURL(profileFile.value);
  } catch (error) {
    console.error('Profile Compress error:', error);
  }
};

const removeProfileImage = () => {
  profileFile.value = null;
  profilePreview.value = '';
  if (profileInput.value) profileInput.value.value = '';
};

// 🟢 ຟັງຊັນ Validation
const validateCustomerForm = (): boolean => {
  Object.keys(customerErrors).forEach(key => { customerErrors[key as keyof typeof customerErrors] = '' })
  let isValid = true

  if (!customerForm.first_name.trim()) {
    customerErrors.first_name = 'ກະລຸນາປ້ອນຊື່ແທ້'; isValid = false;
  } else if (!isLaoOnly(customerForm.first_name)) {
    customerErrors.first_name = 'ກະລຸນາປ້ອນຊື່ເປັນພາສາລາວເທົ່ານັ້ນ'; isValid = false;
  }

  if (!customerForm.phone.trim()) {
    customerErrors.phone = 'ກະລຸນາປ້ອນເບີໂທລະສັບ'; isValid = false;
  } else {
    const normalizedPhone = normalizePhoneNumber(customerForm.phone);
    if (normalizedPhone.length < 7 || normalizedPhone.length > 8) { customerErrors.phone = 'ເບີໂທລະສັບບໍ່ຖືກຕ້ອງ (ຕົວຢ່າງ: 020 99887766)'; isValid = false; }
  }

  // 🟢 Validation ວັນເດືອນປີເກີດ ແລະ ອາຍຸ
  if (!customerForm.date_of_birth) {
    customerErrors.date_of_birth = 'ກະລຸນາປ້ອນວັນເດືອນປີເກີດ';
    isValid = false;
  } else {
    const dob = new Date(customerForm.date_of_birth);
    const today = new Date();

    if (dob > today) {
      customerErrors.date_of_birth = 'ວັນເດືອນປີເກີດບໍ່ສາມາດກາຍວັນທີປັດຈຸບັນໄດ້';
      isValid = false;
    } else {
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      if (age < 15) {
        customerErrors.date_of_birth = 'ອາຍຸຕ້ອງບໍ່ຕ່ຳກວ່າ 15 ປີ';
        isValid = false;
      } else if (age > 100) {
        customerErrors.date_of_birth = 'ອາຍຸຕ້ອງບໍ່ເກີນ 100 ປີ';
        isValid = false;
      }
    }
  }

  if (!customerForm.province_id) { customerErrors.province_id = 'ກະລຸນາເລືອກແຂວງ'; isValid = false }
  if (!customerForm.district_id) { customerErrors.district_id = 'ກະລຸນາເລືອກເມືອງ'; isValid = false }

  if (!customerForm.address.trim()) {
    customerErrors.address = 'ກະລຸນາປ້ອນທີ່ຢູ່'; isValid = false;
  } else if (!isLaoWithNumbers(customerForm.address)) {
    customerErrors.address = 'ທີ່ຢູ່ຕ້ອງເປັນພາສາລາວເທົ່ານັ້ນ'; isValid = false;
  }

  if (!customerForm.occupation.trim()) {
    customerErrors.occupation = 'ກະລຸນາປ້ອນອາຊີບ'; isValid = false;
  } else if (!isLaoOnly(customerForm.occupation)) {
    customerErrors.occupation = 'ອາຊີບຕ້ອງປ້ອນເປັນພາສາລາວເທົ່ານັ້ນ'; isValid = false;
  }

  return isValid
}

// 🟢 SUBMIT
const handleDirectSubmit = async () => {
  if (!validateCustomerForm()) return
  isSubmitting.value = true
  try {
    const standardizedPhone = formatStandardPhoneNumber(customerForm.phone);

    // 🌟 ປ່ຽນການສົ່ງຈາກ JSON ເປັນ FormData
    const formData = new FormData();
    formData.append('first_name', customerForm.first_name);
    formData.append('last_name', customerForm.last_name || '');
    formData.append('phone', standardizedPhone);
    formData.append('otp', 'bypass'); // ສົ່ງຄ່າ Dummy ເຂົ້າໄປເພາະ Backend ອາດບັງຄັບ

    if (customerForm.gender) formData.append('gender', customerForm.gender);
    if (customerForm.date_of_birth) formData.append('date_of_birth', customerForm.date_of_birth);
    if (customerForm.id_card) formData.append('identity_number', customerForm.id_card);
    if (customerForm.account_number) formData.append('account_number', customerForm.account_number);

    formData.append('province_id', customerForm.province_id);
    formData.append('district_id', customerForm.district_id);
    formData.append('address', customerForm.address);
    formData.append('occupation', customerForm.occupation);

    if (customerForm.monthly_income) formData.append('income_per_month', String(customerForm.monthly_income));
    if (customerForm.other_debts) formData.append('other_debt', String(customerForm.other_debts));

    if (profileFile.value) {
      formData.append('profile_image', profileFile.value);
    }

    const res = await apiClient.post('/customer/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    newCustomerId.value = res.data?.data?.id || res.data?.id;

    showSuccessModal.value = true;
    canAccessDocuments.value = true;
  } catch (error: any) {
    alert.error('ເກີດຂໍ້ຜິດພາດ', error.response?.data?.message || 'ບໍ່ສາມາດສ້າງຂໍ້ມູນລູກຄ້າໄດ້ (ເບີໂທອາດຈະຊ້ຳກັນ)');
  } finally {
    isSubmitting.value = false
  }
}

const switchToDocumentsTab = () => {
  activeTab.value = 'documents'; showSuccessModal.value = false;
}

// 🟢 DOCUMENTS
const handleDocumentUpload = async (typeId: string, event: Event) => {
  const target = event.target as HTMLInputElement; const files = target.files;
  if (!files || files.length === 0) return;
  const category = allDocumentCategories.value.find(c => c.id === typeId); if (!category) return;

  for (let i = 0; i < files.length; i++) {
    const currentFile = files[i]; if (!currentFile) continue;
    if (currentFile.size > 8 * 1024 * 1024) { alert.error(`ໄຟລ໌ ${currentFile.name} ໃຫຍ່ເກີນໄປ (ສູງສຸດ 8MB)`); continue; }

    let finalFile: File = currentFile;
    if (finalFile.type.startsWith('image/')) {
      try {
        const compressedBlob = await imageCompression(currentFile, { maxSizeMB: 2, maxWidthOrHeight: 1920, useWebWorker: true });
        finalFile = new File([compressedBlob], currentFile.name, { type: compressedBlob.type, lastModified: Date.now() });
      } catch (error) { console.error('Compress err:', error); }
    }

    const isPdf = finalFile.type === 'application/pdf'; const reader = new FileReader();
    reader.onload = (e) => { category.files.push({ file: finalFile, preview: (e.target?.result as string) || '', isPdf: isPdf, name: finalFile.name }); };
    reader.readAsDataURL(finalFile);
  }
  target.value = '';
}

const removeDocument = (typeId: string, fileIndex: number) => {
  const category = allDocumentCategories.value.find(c => c.id === typeId);
  if (category && category.files[fileIndex]) category.files.splice(fileIndex, 1);
}
const openInNewTab = (url: string) => { if (url) window.open(url, '_blank'); };

const submitDocuments = async () => {
  if (!newCustomerId.value) return;
  isSubmitting.value = true
  try {
    const formData = new FormData();
    for (const cat of allDocumentCategories.value) {
      for (const f of cat.files) {
        if (f.file) {
          formData.append('files', f.file);
          formData.append('docTypes', cat.id);
        }
      }
    }

    await apiClient.post(`/customers/${newCustomerId.value}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    alert.success('ສຳເລັດ', 'ບັນທຶກຂໍ້ມູນສະມາຊິກ ແລະ ເອກະສານຮຽບຮ້ອຍແລ້ວ');
    router.push('/membership');
  } catch (error: any) {
    alert.error('ເກີດຂໍ້ຜິດພາດການອັບໂຫຼດ', error.response?.data?.message || 'ກະລຸນາລອງໃໝ່ອີກຄັ້ງ');
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  await addressStore.fetchProvinces();
})
</script>
