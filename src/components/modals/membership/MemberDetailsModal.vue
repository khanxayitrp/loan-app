<template>
  <teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">

        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold flex items-center gap-2">
            <span class="icon-[tabler--user-edit] size-6 text-primary"></span>
            {{ isEditing ? 'ແກ້ໄຂຂໍ້ມູນສະມາຊິກ' : 'ລາຍລະອຽດສະມາຊິກ' }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <span class="icon-[tabler--x] size-5"></span>
          </button>
        </div>

        <!-- 🌟 TABS -->
        <div class="flex w-full overflow-x-auto no-scrollbar border-b border-gray-200 dark:border-gray-700 mb-6">
          <button @click="activeTab = 'profile'"
            class="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 min-w-[80px] border-b-2 transition-all whitespace-nowrap"
            :class="activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary hover:bg-gray-50'">
            <span class="icon-[tabler--user-circle] size-6"></span>
            <span class="text-xs font-bold">ຂໍ້ມູນສ່ວນຕົວ</span>
          </button>
          <button @click="activeTab = 'documents'"
            class="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 min-w-[80px] border-b-2 transition-all whitespace-nowrap"
            :class="activeTab === 'documents' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary hover:bg-gray-50'">
            <span class="icon-[basil--attach-outline] size-6"></span>
            <span class="text-xs font-bold">ເອກະສານ (KYC)</span>
          </button>
          <button @click="activeTab = 'map'"
            class="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 min-w-[80px] border-b-2 transition-all whitespace-nowrap"
            :class="activeTab === 'map' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary hover:bg-gray-50'">
            <span class="icon-[tabler--map-pin] size-6"></span>
            <span class="text-xs font-bold">ແຜນທີ່ທີ່ຕັ້ງ</span>
          </button>
        </div>

        <!-- 🌟 TAB 1: PROFILE (VIEW OR EDIT) -->
        <div v-if="activeTab === 'profile'" class="space-y-6">
          <!-- View Mode -->
          <div v-if="!isEditing" class="space-y-4">
            <div class="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl border">
              <div
                class="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                <img v-if="customerData?.profile_image_url" :src="customerData.profile_image_url"
                  class="w-full h-full object-cover" />
                <span v-else class="icon-[tabler--user] size-8 text-gray-400"></span>
              </div>
              <div>
                <h4 class="font-bold text-lg text-gray-800">{{ customerData?.first_name }} {{ customerData?.last_name ||
                  '' }}</h4>
                <p class="text-sm text-gray-500 flex items-center gap-1">
                  <span class="icon-[tabler--phone] size-4"></span> {{ customerData?.phone }}
                </p>
              </div>
              <div class="ml-auto">
                <span class="badge badge-lg border-0 text-white" :class="getKycBadgeClass(customerData?.kyc_status)">
                  {{ getKycStatusText(customerData?.kyc_status) }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label class="text-sm text-gray-500 block">ເລກບັດປະຈຳຕົວ</label>
                <p class="font-medium">{{ customerData?.identity_number || '-' }}</p>
              </div>
              <div><label class="text-sm text-gray-500 block">ເພດ</label>
                <p class="font-medium">{{ customerData?.gender === 'Male' ? 'ຊາຍ' : (customerData?.gender === 'Female' ?
                  'ຍິງ' : '-') }}</p>
              </div>
              <div><label class="text-sm text-gray-500 block">ວັນເດືອນປີເກີດ</label>
                <p class="font-medium">{{ formatDateOnly(customerData?.date_of_birth) }}</p>
              </div>
              <!-- 🟢 ลบอายุออกจากการแสดงผลตามคำขอ (หรือจะเก็บไว้ดูเฉยๆ ก็ได้ แต่ในโหมด Edit ลบออกแล้ว) -->
              <div><label class="text-sm text-gray-500 block">ເລກບັນຊີທະນາຄານ</label>
                <p class="font-medium text-indigo-600">{{ customerData?.account_number || '-' }}</p>
              </div>
              <div><label class="text-sm text-gray-500 block">ອາຊີບ</label>
                <p class="font-medium">{{ customerData?.occupation || '-' }}</p>
              </div>
              <div><label class="text-sm text-gray-500 block">ລາຍຮັບຕໍ່ເດືອນ</label>
                <p class="font-medium text-success">{{ formatPrice(customerData?.income_per_month) }} ກີບ</p>
              </div>
              <div><label class="text-sm text-gray-500 block">ໜີ້ສິນອື່ນໆ</label>
                <p class="font-medium text-error">{{ formatPrice(customerData?.other_debt || 0) }} ກີບ</p>
              </div>
              <div class="md:col-span-2"><label class="text-sm text-gray-500 block">ທີ່ຢູ່ປະຈຸບັນ</label>
                <p class="font-medium">{{ customerData?.address || '-' }}</p>
              </div>
            </div>
          </div>

          <!-- Edit Mode -->
          <div v-else class="space-y-4">
            <div class="flex flex-col items-center justify-center mb-6">
              <div class="relative group cursor-pointer" @click="triggerProfileUpload">
                <div class="w-20 h-20 rounded-full overflow-hidden border-2 border-primary bg-gray-100 shadow-sm">
                  <img v-if="profilePreview || customerData?.profile_image_url"
                    :src="profilePreview || customerData?.profile_image_url" class="w-full h-full object-cover" />
                  <span v-else class="icon-[tabler--camera] size-8 text-gray-400 mt-5 ml-6"></span>
                </div>
                <div
                  class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span class="icon-[tabler--pencil] size-6 text-white"></span>
                </div>
                <input ref="profileInput" type="file" class="hidden" accept="image/*" @change="handleProfileSelect" />
              </div>
              <p class="text-xs text-gray-500 mt-2">ປ່ຽນຮູບໂປຣໄຟລ໌</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label"><span class="label-text font-medium">ຊື່ແທ້ (ພາສາລາວ) <span
                      class="text-error">*</span></span></label>
                <input v-model="editForm.first_name" type="text" class="input input-sm input-bordered w-full" required
                  @input="editForm.first_name = editForm.first_name.replace(/[^\u0E80-\u0EFF\s]/g, '')" />
              </div>

              <div class="form-control">
                <label class="label"><span class="label-text font-medium">ນາມສະກຸນ (ພາສາລາວ)</span></label>
                <input v-model="editForm.last_name" type="text" class="input input-sm input-bordered w-full"
                  @input="editForm.last_name = editForm.last_name.replace(/[^\u0E80-\u0EFF\s]/g, '')" />
              </div>
              <div class="form-control"><label class="label"><span class="label-text font-medium">ເບີໂທລະສັບ <span
                      class="text-error">*</span></span></label><input v-model="editForm.phone" type="text"
                  class="input input-sm input-bordered w-full" required /></div>
              <div class="form-control"><label class="label"><span
                    class="label-text font-medium">ເພດ</span></label><select v-model="editForm.gender"
                  class="select select-sm select-bordered w-full">
                  <option value="" disabled>-- ເລືອກ --</option>
                  <option value="Male">ຊາຍ (Male)</option>
                  <option value="Female">ຍິງ (Female)</option>
                </select></div>
              <div class="form-control"><label class="label"><span
                    class="label-text font-medium">ວັນເດືອນປີເກີດ</span></label><input v-model="editForm.date_of_birth"
                  type="date" class="input input-sm input-bordered w-full" /></div>
              <!-- 🟢 ลบ Field อายุออกตามคำขอ -->

              <div class="form-control"><label class="label"><span
                    class="label-text font-medium">ເລກບັດປະຈຳຕົວ</span></label><input v-model="editForm.identity_number"
                  type="text" class="input input-sm input-bordered w-full" /></div>
              <div class="form-control"><label class="label"><span
                    class="label-text font-medium text-indigo-600">ເລກບັນຊີທະນາຄານ (BCEL)</span></label><input
                  v-model="editForm.account_number" type="text"
                  class="input input-sm input-bordered w-full border-indigo-200" /></div>
              <div class="form-control">
                <label class="label"><span class="label-text font-medium">ອາຊີບ (ພາສາລາວ)</span></label>
                <input v-model="editForm.occupation" type="text" class="input input-sm input-bordered w-full"
                  @input="editForm.occupation = editForm.occupation.replace(/[^\u0E80-\u0EFF\s]/g, '')" />
              </div>
              <div class="form-control"><label class="label"><span class="label-text font-medium">ລາຍຮັບຕໍ່ເດືອນ
                    (ກີບ)</span></label><input :value="formatCurrencyInput(editForm.income_per_month)"
                  @input="handleCurrencyInput('income_per_month', $event)" type="text"
                  class="input input-sm input-bordered w-full font-medium" /></div>

              <div class="form-control md:col-span-2">
                <label class="label"><span class="label-text font-medium">ທີ່ຢູ່ (ພາສາລາວ) <span
                      class="text-error">*</span></span></label>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input v-model="editForm.address" type="text" class="input input-sm input-bordered w-full"
                    placeholder="ບ້ານ, ໜ່ວຍ" required
                    @input="editForm.address = editForm.address.replace(/[^\u0E80-\u0EFF\s0-9\/\-,.]/g, '')" />
                  <select v-model="editForm.province_id" @change="handleProvinceChange"
                    class="select select-sm select-bordered w-full">
                    <option value="" disabled>-- ແຂວງ --</option>
                    <option v-for="p in addressStore.provinces" :key="p.province_id" :value="p.province_id">{{
                      p.province_name }}</option>
                  </select>
                  <select v-model="editForm.district_id" :disabled="!editForm.province_id"
                    class="select select-sm select-bordered w-full">
                    <option value="" disabled>-- ເມືອງ --</option>
                    <option v-for="d in addressStore.districts" :key="d.district_id" :value="d.district_id">{{
                      d.district_name }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 🌟 TAB 2: DOCUMENTS -->
        <div v-else-if="activeTab === 'documents'" class="space-y-6">
          <div v-if="!isEditing" class="space-y-4">
            <!-- 🟢 แก้ไขเรื่อง Error Console โดยใช้ Optional Chaining (?.) -->
            <div v-if="!allDocumentCategories?.some(c => c?.files?.length > 0)"
              class="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed">
              <span class="icon-[tabler--file-off] size-8 text-gray-400 mb-2"></span>
              <p>ຍັງບໍ່ມີເອກະສານອັບໂຫຼດເຂົ້າໃນລະບົບ</p>
            </div>
            <template v-else>
              <div v-for="cat in allDocumentCategories" :key="'view-cat-' + cat.id" v-show="cat?.files?.length > 0"
                class="border rounded-xl p-4">
                <h5 class="font-bold text-gray-800 border-b pb-2 mb-3 flex items-center gap-2"><span
                    class="icon-[tabler--folder] size-5 text-primary"></span> {{ cat.name }}</h5>
                <div class="flex flex-wrap gap-4">
                  <div v-for="(f, fileIndex) in cat.files" :key="fileIndex"
                    class="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 w-full sm:w-48 group cursor-pointer shadow-sm hover:shadow-md transition-all"
                    @click="openInNewTab(f.preview)">
                    <div class="h-32 w-full overflow-hidden bg-slate-100">
                      <img v-if="!f.isPdf" :src="f.preview"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div v-else class="w-full h-full flex flex-col items-center justify-center"><span
                          class="icon-[tabler--file-type-pdf] size-10 text-red-500 mb-2"></span><span
                          class="text-xs text-gray-500 truncate w-3/4 text-center">{{ f.name }}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <div v-else class="space-y-6">
            <div v-for="cat in allDocumentCategories" :key="'edit-cat-' + cat.id"
              class="border rounded-xl p-4 bg-gray-50">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h5 class="font-bold text-gray-800">{{ cat.name }}</h5>
                  <p class="text-xs text-gray-500 mt-1">{{ cat.description }}</p>
                </div>
                <span v-if="cat.required" class="badge badge-error badge-soft text-[10px] font-bold">ບັງຄັບ</span>
              </div>
              <div class="flex flex-wrap gap-4">
                <div v-for="(f, fileIndex) in cat.files" :key="fileIndex"
                  class="relative aspect-square w-24 rounded-lg border border-gray-300 overflow-hidden bg-white group">
                  <button type="button" @click.stop="removeDocument(cat.id, fileIndex)"
                    class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 z-10 shadow-md"><span
                      class="icon-[tabler--x] size-3"></span></button>
                  <img v-if="!f.isPdf" :src="f.preview" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex flex-col items-center justify-center"><span
                      class="icon-[tabler--file-type-pdf] size-8 text-red-500"></span></div>
                  <span v-if="f.file"
                    class="absolute bottom-1 left-1 text-[9px] bg-green-500 text-white px-1 rounded shadow">ໃໝ່</span>
                </div>
                <label
                  class="aspect-square w-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-white hover:border-primary transition-all group">
                  <input type="file" class="hidden" multiple accept="image/*,.pdf"
                    @change="(e) => handleDocumentUpload(cat.id, e)" />
                  <div
                    class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <span class="icon-[tabler--plus] size-5 text-gray-400 group-hover:text-primary"></span>
                  </div>
                  <span class="text-[10px] font-bold text-gray-400 mt-1 group-hover:text-primary">ເພີ່ມເອກະສານ</span>
                </label>
              </div>
            </div>
            <div v-if="isUploadingDocuments" class="alert alert-info py-2 shadow-sm text-sm"><span
                class="loading loading-spinner loading-sm"></span> ກຳລັງອັບໂຫຼດເອກະສານ... ກະລຸນາລໍຖ້າ</div>
          </div>
        </div>

        <!-- 🌟 TAB 3: ແຜນທີ່ -->
        <div v-else-if="activeTab === 'map'" class="space-y-4">
          <div v-if="customerLocations.length === 0" class="alert alert-warning shadow-sm py-2">
            <span class="icon-[tabler--map-pin-off] size-5"></span>
            <span class="text-sm">ລູກຄ້າຄົນນີ້ຍັງບໍ່ມີຂໍ້ມູນທີ່ຕັ້ງເທື່ອ.
              <span v-if="canManageLocation">ກະລຸນາປັກໝຸດທີ່ຕັ້ງລູກຄ້າເພື່ອງ່າຍຕໍ່ການຕິດຕາມ.</span>
            </span>
          </div>
          <CustomerLocationMap v-if="customerId" :customer-id="customerId" :locations="customerLocations"
            :google-maps-api-key="''" :is-loading="isLocationLoading" :can-add-location="canManageLocation"
            :can-edit-location="canManageLocation" :can-delete-location="canManageLocation"
            :can-set-primary="canManageLocation" @add-location="handleAddLocation"
            @update-location="handleUpdateLocation" @delete-location="handleDeleteLocation"
            @set-primary="handleSetPrimary" />
        </div>

        <!-- 🌟 FOOTER ACTIONS -->
        <div class="flex justify-end gap-3 mt-6 border-t pt-6">
          <button class="btn btn-soft btn-secondary" @click="closeModal" :disabled="isSaving || isUploadingDocuments">
            {{ isEditing ? 'ຍົກເລີກ' : 'ປິດໜ້າຈໍ' }}
          </button>
          <button v-if="!isEditing && (activeTab === 'profile' || activeTab === 'documents')" class="btn btn-primary"
            @click="startEdit">
            <span class="icon-[tabler--edit] size-4 mr-1"></span> ແກ້ໄຂຂໍ້ມູນ
          </button>
          <button v-else-if="isEditing && activeTab === 'profile'" class="btn btn-success text-white"
            @click="saveProfile" :disabled="isSaving">
            <span v-if="isSaving" class="loading loading-spinner loading-xs"></span>
            <span v-else class="icon-[tabler--device-floppy] size-4 mr-1"></span>
            <span v-if="!isSaving">ບັນທຶກໂປຣໄຟລ໌</span>
          </button>
          <button v-else-if="isEditing && activeTab === 'documents'" class="btn btn-success text-white"
            @click="saveDocuments" :disabled="isUploadingDocuments">
            <span v-if="isUploadingDocuments" class="loading loading-spinner loading-xs"></span>
            <span v-else class="icon-[tabler--device-floppy] size-4 mr-1"></span>
            <span v-if="!isUploadingDocuments">ບັນທຶກເອກະສານ</span>
          </button>
        </div>

      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
// 🟢 จัดกลุ่ม Imports และประกาศตัวแปรให้เป็นระเบียบ เพื่อแก้บัค [Vue warn] accessed during render
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useAddressStore } from '@/stores/address';
import { useLoanApplicationStore } from '@/stores/loanApplication';
import { useCustomerStore } from '@/stores/customer';
import { usePermissionStore } from '@/stores/permission';
import type { CustomerLocation } from '@/types/customer';
import { alert } from '@/utils/alert';
import { formatPrice, formatCurrencyInput, formatDateOnly, formatStandardPhoneNumber } from '@/utils/formatters';
import { getFullImageUrl } from '@/utils/url';
import imageCompression from 'browser-image-compression';
import CustomerLocationMap from '@/components/loans/form/CustomerLocationMap.vue';

// ----------------------------------------------------
// 1. Props & Emits
// ----------------------------------------------------
const props = defineProps<{ show: boolean, customerId: number | null }>();
const emit = defineEmits(['close', 'refresh']);

// ----------------------------------------------------
// 2. Stores Setup
// ----------------------------------------------------
const addressStore = useAddressStore();
const loanAppStore = useLoanApplicationStore();
const customerStore = useCustomerStore();
const permissionStore = usePermissionStore();

// ----------------------------------------------------
// 3. UI States
// ----------------------------------------------------
const activeTab = ref<'profile' | 'documents' | 'map'>('profile');
const isEditing = ref(false);
const isSaving = ref(false);
const isUploadingDocuments = ref(false);

const customerData = ref<any>(null);
const customerLocations = ref<CustomerLocation[]>([]);
const isLocationLoading = ref(false);
const canManageLocation = computed(() => permissionStore.hasPermission('user_manage') || permissionStore.hasPermission('loan_edit'));

const profileInput = ref<HTMLInputElement | null>(null);
const profileFile = ref<File | null>(null);
const profilePreview = ref<string>('');

// ----------------------------------------------------
// 4. Form State (เอา age ออก)
// ----------------------------------------------------
const editForm = reactive({
  first_name: '', last_name: '', phone: '', gender: '', date_of_birth: '',
  identity_number: '', account_number: '', occupation: '', income_per_month: 0,
  province_id: '', district_id: '', address: ''
});

// ----------------------------------------------------
// 5. Document Setup (เลื่อนมาไว้บนสุดก่อน Watch/Computed จะเรียกใช้)
// ----------------------------------------------------
interface UploadedFile { id?: number; file: File | null; preview: string; isPdf: boolean; name: string; }
interface DocumentCategory { id: string; name: string; description: string; required: boolean; files: UploadedFile[]; }
const requiredDocuments = ref<DocumentCategory[]>([
  { id: 'id_card', name: 'ບັດປະຈຳຕົວ/ສຳມະໂນຄົວ', description: 'ເອກະສານຢັ້ງຢືນຕົວຕົນ', required: true, files: [] },
  { id: 'house_reg', name: 'ປື້ມສຳມະໂນຄົວ', description: 'ເອກະສານຢັ້ງຢືນທີ່ຢູ່', required: false, files: [] }
]);
const optionalDocuments = ref<DocumentCategory[]>([
  { id: 'salary_slip', name: 'ຫຼັກຖານລາຍຮັບ', description: 'ໃບເງິນເດືອນ ຫຼື ໃບຮັບລາຍຮັບ', required: false, files: [] },
  { id: 'other', name: 'ເອກະສານອື່ນໆ', description: 'ເອກະສານທີ່ກ່ຽວຂ້ອງ', required: false, files: [] }
]);
const allDocumentCategories = computed(() => [...(requiredDocuments.value || []), ...(optionalDocuments.value || [])]);

// ----------------------------------------------------
// 6. Lifecycle & Watchers
// ----------------------------------------------------
onMounted(async () => {
  // 🟢 รับประกันว่าเมื่อโหลด Component เข้ามา จะทำการ Fetch แขวงเสมอ (แก้ปัญหาเลือกแขวงไม่ได้)
  if (addressStore.provinces.length === 0) {
    await addressStore.fetchProvinces();
  }
});

watch(() => props.show, async (newVal) => {
  if (newVal && props.customerId) {
    activeTab.value = 'profile';
    isEditing.value = false;
    profileFile.value = null;
    profilePreview.value = '';

    await loadCustomerData(props.customerId);
    await loadCustomerDocuments(props.customerId);
    await loadCustomerLocations(props.customerId);
  } else {
    customerData.value = null;
  }
});

// ----------------------------------------------------
// 7. Data Fetching
// ----------------------------------------------------
const loadCustomerData = async (id: number) => {
  try {
    customerData.value = await customerStore.fetchCustomerById(id);
  } catch (error) {
    alert.error('ຜິດພາດ', 'ບໍ່ສາມາດດຶງຂໍ້ມູນລູກຄ້າໄດ້');
    closeModal();
  }
};

const loadCustomerDocuments = async (id: number) => {
  requiredDocuments.value.forEach(d => d.files = []);
  optionalDocuments.value.forEach(d => d.files = []);
  try {
    await loanAppStore.fetchDocuments(id);
    const docs = loanAppStore.currentDocuments || [];
    docs.forEach(serverDoc => {
      const docType = serverDoc.document_type || serverDoc.doc_type;
      const targetCat = allDocumentCategories.value.find(d => d.id === docType);
      const fileUrl = getFullImageUrl(serverDoc.file_url);
      if (targetCat && fileUrl) {
        targetCat.files.push({
          id: serverDoc.id, file: null, preview: fileUrl,
          isPdf: serverDoc.file_url?.toLowerCase().endsWith('.pdf') || false,
          name: serverDoc.original_filename || serverDoc.file_name || 'Document'
        });
      }
    });
  } catch (error) { console.warn("Load Documents Error", error); }
};

const loadCustomerLocations = async (id: number) => {
  isLocationLoading.value = true;
  try {
    const res = await customerStore.fetchLocations(id);
    customerLocations.value = res.data || res;
  } catch (error) {
    console.warn("Failed to load locations");
  } finally {
    isLocationLoading.value = false;
  }
};

// ----------------------------------------------------
// 8. Event Handlers (Location)
// ----------------------------------------------------
const handleAddLocation = async (data: any) => {
  if (!props.customerId) return;
  await customerStore.addLocation(props.customerId, data);
  await loadCustomerLocations(props.customerId);
};
const handleUpdateLocation = async (id: number, data: any) => {
  await customerStore.editLocation(id, data);
  if (props.customerId) await loadCustomerLocations(props.customerId);
};
const handleDeleteLocation = async (id: number) => {
  await customerStore.removeLocation(id);
  if (props.customerId) await loadCustomerLocations(props.customerId);
};
const handleSetPrimary = async (id: number) => {
  await customerStore.editLocation(id, { is_primary: 1 });
  if (props.customerId) await loadCustomerLocations(props.customerId);
};

// ----------------------------------------------------
// 9. Edit Profile Form Controls
// ----------------------------------------------------
const startEdit = async () => {
  if (!customerData.value) return;
  const c = customerData.value;
  editForm.first_name = c.first_name || '';
  editForm.last_name = c.last_name || '';
  editForm.phone = c.phone || '';
  editForm.gender = c.gender || '';
  // 👈 Wrap in parentheses and add || '' to prevent 'string | undefined' error
  editForm.date_of_birth = c.date_of_birth ? (new Date(c.date_of_birth).toISOString().split('T')[0] || '') : '';

  editForm.identity_number = c.identity_number || '';
  editForm.account_number = c.account_number || '';
  editForm.occupation = c.occupation || '';
  editForm.income_per_month = Number(c.income_per_month) || 0;
  editForm.address = c.address || '';
  editForm.province_id = c.province_id || '';

  // 🟢 ดึงข้อมูลเมืองเมื่อโหลดจังหวัดเดิม
  if (editForm.province_id) await addressStore.fetchDistricts(editForm.province_id);
  editForm.district_id = c.district_id || '';

  isEditing.value = true;
};

const triggerProfileUpload = () => { profileInput.value?.click(); };
const handleProfileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement; const files = target.files;
  if (!files || files.length === 0) return;
  const file = files[0];
  if (!file) return; // 👈 Add this line to satisfy TypeScript (Type Narrowing)
  if (file.size > 5 * 1024 * 1024) { alert.error('ຮູບໃຫຍ່ເກີນໄປ', 'ສູງສຸດ 5MB'); target.value = ''; return; }
  try {
    const compressedBlob = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true });
    profileFile.value = new File([compressedBlob], file.name, { type: compressedBlob.type, lastModified: Date.now() });
    const reader = new FileReader();
    reader.onload = (e) => { profilePreview.value = e.target?.result as string; };
    reader.readAsDataURL(profileFile.value);
  } catch (e) { }
};

const handleProvinceChange = async () => {
  editForm.district_id = '';
  if (editForm.province_id) await addressStore.fetchDistricts(editForm.province_id);
};
const handleCurrencyInput = (field: 'income_per_month', event: Event) => {
  const target = event.target as HTMLInputElement;
  const num = parseInt(target.value.replace(/\D/g, ''), 10);
  editForm[field] = isNaN(num) ? 0 : num;
};

// 🟢 Helper Function: กรองภาษาลาว
const isLaoOnly = (text: string) => /^[\u0E80-\u0EFF\s]*$/.test(text.trim());
const isLaoWithNumbers = (text: string) => /^[\u0E80-\u0EFF\s0-9\/\-,.]*$/.test(text.trim());
// 🟢 Save Profile Logic & Strict Validation
// 🟢 Save Profile Logic & Strict Validation
const saveProfile = async () => {
  // 1. เช็คข้อมูลว่าง
  if (!editForm.first_name || !editForm.phone || !editForm.province_id || !editForm.district_id || !editForm.address) {
    alert.error('ຂໍ້ມູນບໍ່ຄົບຖ້ວນ', 'ກະລຸນາປ້ອນຂໍ້ມູນບັງຄັບ (*) ໃຫ້ຄົບຖ້ວນ');
    return;
  }

  // 2. เช็คภาษาลาว
  if (!isLaoOnly(editForm.first_name)) {
    alert.error('ຂໍ້ມູນບໍ່ຖືກຕ້ອງ', 'ຊື່ແທ້ຕ້ອງເປັນພາສາລາວເທົ່ານັ້ນ');
    return;
  }
  if (editForm.last_name && !isLaoOnly(editForm.last_name)) {
    alert.error('ຂໍ້ມູນບໍ່ຖືກຕ້ອງ', 'ນາມສະກຸນຕ້ອງເປັນພາສາລາວເທົ່ານັ້ນ');
    return;
  }
  if (editForm.occupation && !isLaoOnly(editForm.occupation)) {
    alert.error('ຂໍ້ມູນບໍ່ຖືກຕ້ອງ', 'ອາຊີບຕ້ອງເປັນພາສາລາວເທົ່ານັ້ນ');
    return;
  }
  if (!isLaoWithNumbers(editForm.address)) {
    alert.error('ຂໍ້ມູນບໍ່ຖືກຕ້ອງ', 'ທີ່ຢູ່ຕ້ອງເປັນພາສາລາວ ແລະ ຕົວເລກເທົ່ານັ້ນ');
    return;
  }

  isSaving.value = true;
  try {
    const formData = new FormData();
    formData.append('first_name', editForm.first_name);
    formData.append('last_name', editForm.last_name);
    formData.append('phone', formatStandardPhoneNumber(editForm.phone));
    if (editForm.gender) formData.append('gender', editForm.gender);
    if (editForm.date_of_birth) formData.append('date_of_birth', editForm.date_of_birth);
    if (editForm.identity_number) formData.append('identity_number', editForm.identity_number);
    if (editForm.account_number) formData.append('account_number', editForm.account_number);
    formData.append('occupation', editForm.occupation);
    formData.append('income_per_month', String(editForm.income_per_month));
    formData.append('address', editForm.address);
    formData.append('province_id', editForm.province_id);
    formData.append('district_id', editForm.district_id);

    if (profileFile.value) {
      formData.append('profile_image', profileFile.value);
    }

    await customerStore.updateCustomer(props.customerId!, formData);

    alert.success('ບັນທຶກສຳເລັດ!');
    isEditing.value = false;
    await loadCustomerData(props.customerId!);
    emit('refresh');
  } catch (error: any) {
    alert.error('ຜິດພາດ', error.response?.data?.message || 'ບໍ່ສາມາດອັບເດດຂໍ້ມູນໄດ້');
  } finally {
    isSaving.value = false;
  }
};

// ----------------------------------------------------
// 10. Documents Controls
// ----------------------------------------------------
const handleDocumentUpload = async (typeId: string, event: Event) => {
  const target = event.target as HTMLInputElement; const files = target.files;
  if (!files || files.length === 0) return;
  const category = allDocumentCategories.value.find(c => c.id === typeId); if (!category) return;
  for (let i = 0; i < files.length; i++) {
    const currentFile = files[i]; if (!currentFile) continue;
    if (currentFile.size > 8 * 1024 * 1024) { alert.error('ໄຟລ໌ໃຫຍ່ເກີນໄປ', 'ສູງສຸດ 8MB'); continue; }
    let finalFile: File = currentFile;
    if (finalFile.type.startsWith('image/')) {
      try {
        const compressedBlob = await imageCompression(currentFile, { maxSizeMB: 2, maxWidthOrHeight: 1920, useWebWorker: true });
        finalFile = new File([compressedBlob], currentFile.name, { type: compressedBlob.type, lastModified: Date.now() });
      } catch (error) { console.error('Compress err:', error); }
    }
    const isPdf = finalFile.type === 'application/pdf';
    const reader = new FileReader();
    reader.onload = (e) => {
      category.files.push({ file: finalFile, preview: (e.target?.result as string) || '', isPdf: isPdf, name: finalFile.name });
    };
    reader.readAsDataURL(finalFile);
  }
  target.value = '';
};

const removeDocument = async (typeId: string, fileIndex: number) => {
  const category = allDocumentCategories.value.find(c => c.id === typeId);
  if (category && category.files[fileIndex]) {
    if (category.files[fileIndex].id) {
      if (!confirm('ຕ້ອງການລຶບເອກະສານເດີມອອກຈາກລະບົບແທ້ບໍ່? (ລຶບແລ້ວບໍ່ສາມາດກູ້ຄືນໄດ້)')) return;
    }
    category.files.splice(fileIndex, 1);
  }
};

const saveDocuments = async () => {
  if (!props.customerId) return;
  isUploadingDocuments.value = true;
  try {
    const filesToUpload: File[] = []; const docTypesArray: string[] = [];
    allDocumentCategories.value.forEach(cat => {
      cat.files.forEach(f => {
        if (f.file) { filesToUpload.push(f.file); docTypesArray.push(cat.id); }
      });
    });
    if (filesToUpload.length > 0) {
      await loanAppStore.uploadMultipleDocuments(props.customerId, 0 as any, filesToUpload, docTypesArray);
      alert.success('ອັບໂຫຼດເອກະສານສຳເລັດ!');
      await loadCustomerDocuments(props.customerId);
    } else { alert.info('ບໍ່ມີເອກະສານໃໝ່ໃຫ້ອັບໂຫຼດ'); }
    isEditing.value = false;
  } catch (error: any) { alert.error('ຜິດພາດ', error.response?.data?.message || 'ອັບໂຫຼດເອກະສານລົ້ມເຫຼວ'); } finally { isUploadingDocuments.value = false; }
};

// ----------------------------------------------------
// 11. Utilities
// ----------------------------------------------------
const openInNewTab = (url: string) => { if (url) window.open(url, '_blank'); };
const closeModal = () => { emit('close'); };

const getKycBadgeClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'verified': return 'bg-emerald-500';
    case 'unverified': return 'bg-warning text-gray-800';
    case 'rejected': return 'bg-error';
    default: return 'bg-gray-400';
  }
};
const getKycStatusText = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'verified': return 'ຢືນຢັນແລ້ວ';
    case 'unverified': return 'ລໍຖ້າກວດສອບ';
    case 'rejected': return 'ຖືກປະຕິເສດ';
    default: return 'ບໍ່ລະບຸ';
  }
};
</script>
