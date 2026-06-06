<template>
  <section class="form-section">
    <h3 class="section-title flex items-center gap-4 flex-wrap">
      V. ຂໍ້ມູນສ່ວນຕົວຂອງ
      <label class="cursor-pointer flex items-center gap-2 text-sm font-normal bg-gray-100 px-2 py-1 rounded">
        <input type="checkbox" :checked="hasGuarantor" @change="$emit('update:hasGuarantor', !hasGuarantor); errors = {}"
          :disabled="!isEditing" class="checkbox checkbox-sm" />
        ຜູ້ຄ້ຳປະກັນ
      </label>
      <label class="cursor-pointer flex items-center gap-2 text-sm font-normal bg-gray-100 px-2 py-1 rounded">
        <input type="checkbox" :checked="hasReference" @change="$emit('update:hasReference', !hasReference); errors = {}"
          :disabled="!isEditing" class="checkbox checkbox-sm" />
        ຜູ້ອ້າງອີງ
      </label>
      <span class="text-sm font-normal text-gray-500">(ຖ້າມີ)</span>
    </h3>

    <div v-if="hasGuarantor || hasReference">
      <div class="mb-5 bg-slate-50 p-5 rounded-xl border border-slate-200">
        <h4 class="font-bold text-primary mb-4 flex items-center gap-2">
          <span class="icon-[tabler--user] size-5"></span> ຂໍ້ມູນທົ່ວໄປ
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div class="form-control lg:col-span-2">
            <label class="label"><span class="label-text font-bold">ຊື່ ແລະ ນາມສະກຸນ: <span class="text-error">*</span></span></label>
            <input v-model="data.fullname" type="text" :readonly="!isEditing"
              class="input input-sm input-bordered w-full"
              :class="[isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed', errors.fullname ? 'input-error' : '']"
              @input="errors.fullname = ''" />
            <label v-if="errors.fullname" class="label p-0 pt-1">
              <span class="label-text-alt text-error flex items-center gap-1"><span class="icon-[tabler--alert-circle] size-4"></span> {{ errors.fullname }}</span>
            </label>
          </div>

          <div class="form-control relative">
            <label class="label"><span class="label-text font-bold">ວັນເດືອນປີເກີດ:</span></label>
            <input 
              type="text" 
              :value="displayDob" 
              :readonly="!isEditing"
              maxlength="10"
              placeholder="dd/mm/yyyy"
              class="input input-sm input-bordered w-full pr-10"
              :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'"
              @input="handleDateTyping($event, 'dob')"
              @blur="handleDateBlur($event, 'dob')"
            />
            <input 
              ref="hiddenDateInput"
              v-model="data.dob" 
              type="date" 
              class="absolute opacity-0 w-0 h-0 p-0 m-0 border-0 pointer-events-none" 
              tabindex="-1"
            />
            <span 
              class="icon-[tabler--calendar] absolute right-3 top-9 text-gray-500 size-4"
              :class="isEditing ? 'cursor-pointer hover:text-primary' : 'pointer-events-none'"
              @click="isEditing ? triggerDatePicker() : null"
            ></span>
          </div>

          <div class="form-control">
            <label class="label"><span class="label-text font-bold">ອາຍຸ:</span></label>
            <div class="join w-full">
              <input v-model.number="data.age" type="number" :readonly="!isEditing"
                class="input input-sm input-bordered w-full join-item"
                :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
              <span class="btn btn-sm btn-disabled join-item">ປີ</span>
            </div>
          </div>
          
          <div class="form-control">
            <label class="label"><span class="label-text font-bold">ເບີໂທລະສັບມືຖື:</span></label>
            <input v-model="data.phone" type="tel" :readonly="!isEditing"
              class="input input-sm input-bordered w-full"
              :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
          </div>
          
          <div class="form-control">
            <label class="label"><span class="label-text font-bold">ເພດ:</span></label>
            <select v-model="data.gender" :disabled="!isEditing"
              class="select select-sm select-bordered w-full"
              :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'">
              <option value="">ເລືອກ</option>
              <option value="male">ຊາຍ</option>
              <option value="female">ຍິງ</option>
            </select>
          </div>
          
          <div class="form-control">
            <label class="label"><span class="label-text font-bold">ສະຖານະພາບ:</span></label>
            <select v-model="data.maritalStatus" :disabled="!isEditing"
              class="select select-sm select-bordered w-full"
              :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'">
              <option value="">ເລືອກ</option>
              <option value="single">ໂສດ</option>
              <option value="married">ແຕ່ງງານແລ້ວ</option>
              <option value="divorced">ຢ່າຮ້າງ</option>
            </select>
          </div>
          
          <div class="form-control">
            <label class="label"><span class="label-text font-bold">ອາຊີບ:</span></label>
            <input v-model="data.occupation" type="text" :readonly="!isEditing"
              class="input input-sm input-bordered w-full"
              :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
          </div>
          
          <div class="form-control">
            <label class="label"><span class="label-text font-bold">ສາຍພົວພັນ: <span class="text-error">*</span></span></label>
            <input v-model="data.relationship" type="text" :readonly="!isEditing"
              class="input input-sm input-bordered w-full"
              :class="[isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed', errors.relationship ? 'input-error' : '']"
              @input="errors.relationship = ''" />
            <label v-if="errors.relationship" class="label p-0 pt-1">
              <span class="label-text-alt text-error flex items-center gap-1"><span class="icon-[tabler--alert-circle] size-4"></span> {{ errors.relationship }}</span>
            </label>
          </div>
        </div>
      </div>

      <div class="mb-5 bg-slate-50 p-5 rounded-xl border border-slate-200">
        <h4 class="font-bold text-primary mb-4 flex items-center gap-2">
          <span class="icon-[tabler--id] size-5"></span> ເອກະສານຢັ້ງຢືນຕົວຕົນ
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="form-control">
            <label class="label"><span class="label-text font-bold">IDCard/Passport:</span></label>
            <input v-model="data.idCard" type="text" :readonly="!isEditing"
              class="input input-sm input-bordered w-full"
              :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
          </div>

          <div class="form-control relative">
            <label class="label"><span class="label-text font-bold">ວັນເດືອນປີອອກບັດ:</span></label>
            <input 
              type="text" 
              :value="displayIdCardIssueDate" 
              :readonly="!isEditing"
              maxlength="10"
              placeholder="dd/mm/yyyy"
              class="input input-sm input-bordered w-full pr-10"
              :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'"
              @input="handleDateTyping($event, 'idCardIssueDate')"
              @blur="handleDateBlur($event, 'idCardIssueDate')"
            />
            <input 
              ref="hiddenIdCardIssueDateInput"
              v-model="data.idCardIssueDate" 
              type="date" 
              class="absolute opacity-0 w-0 h-0 p-0 m-0 border-0 pointer-events-none" 
              tabindex="-1"
            />
            <span 
              class="icon-[tabler--calendar] absolute right-3 top-9 text-gray-500 size-4"
              :class="isEditing ? 'cursor-pointer hover:text-primary' : 'pointer-events-none'"
              @click="isEditing ? triggerIdCardIssueDatePicker() : null"
            ></span>
          </div>

          <div class="form-control relative">
            <label class="label"><span class="label-text font-bold">ວັນເດືອນປີໝົດອາຍຸບັດ:</span></label>
            <input 
              type="text" 
              :value="displayIdCardExpiryDate" 
              :readonly="!isEditing"
              maxlength="10"
              placeholder="dd/mm/yyyy"
              class="input input-sm input-bordered w-full pr-10"
              :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'"
              @input="handleDateTyping($event, 'idCardExpiryDate')"
              @blur="handleDateBlur($event, 'idCardExpiryDate')"
            />
            <input 
              ref="hiddenIdCardExpiryDateInput"
              v-model="data.idCardExpiryDate" 
              type="date" 
              class="absolute opacity-0 w-0 h-0 p-0 m-0 border-0 pointer-events-none" 
              tabindex="-1"
            />
            <span 
              class="icon-[tabler--calendar] absolute right-3 top-9 text-gray-500 size-4"
              :class="isEditing ? 'cursor-pointer hover:text-primary' : 'pointer-events-none'"
              @click="isEditing ? triggerIdCardExpiryDatePicker() : null"
            ></span>
          </div>

          <div class="form-control">
            <label class="label"><span class="label-text font-bold">ປຶ້ມສຳມະໂນຄົວ ເລກທີ:</span></label>
            <input v-model="data.censusBook" type="text" :readonly="!isEditing"
              class="input input-sm input-bordered w-full"
              :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
          </div>

          <div class="form-control relative">
            <label class="label"><span class="label-text font-bold">ວັນເດືອນປີອອກປຶ້ມ:</span></label>
            <input 
              type="text" 
              :value="displayCensusBookIssueDate" 
              :readonly="!isEditing"
              maxlength="10"
              placeholder="dd/mm/yyyy"
              class="input input-sm input-bordered w-full pr-10"
              :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'"
              @input="handleDateTyping($event, 'censusBookIssueDate')"
              @blur="handleDateBlur($event, 'censusBookIssueDate')"
            />
            <input 
              ref="hiddenCensusBookIssueDateInput"
              v-model="data.censusBookIssueDate" 
              type="date" 
              class="absolute opacity-0 w-0 h-0 p-0 m-0 border-0 pointer-events-none" 
              tabindex="-1"
            />
            <span 
              class="icon-[tabler--calendar] absolute right-3 top-9 text-gray-500 size-4"
              :class="isEditing ? 'cursor-pointer hover:text-primary' : 'pointer-events-none'"
              @click="isEditing ? triggerCensusBookIssueDatePicker() : null"
            ></span>
          </div>

          <div class="form-control md:col-span-2 lg:col-span-3">
            <label class="label"><span class="label-text font-bold">ສະຖານທີ່ອອກເອກະສານ:</span></label>
            <input v-model="data.censusAuthorizeBy" type="text" :readonly="!isEditing"
              class="input input-sm input-bordered w-full"
              :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
          </div>
        </div>
      </div>

      <div class="bg-slate-50 p-5 rounded-xl border border-slate-200">
        <h4 class="font-bold text-primary mb-4 flex items-center gap-2">
          <span class="icon-[tabler--map-pin] size-5"></span> ຂໍ້ມູນທີ່ຢູ່ປະຈຸບັນ ແລະ ການພັກອາໄສ
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="label"><span class="label-text font-bold">ເຮືອນເລກທີ:</span></label>
            <input v-model="data.houseNumber" type="text" :readonly="!isEditing"
              class="input input-sm input-bordered w-full"
              :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
          </div>
          <div>
            <label class="label"><span class="label-text font-bold">ໜ່ວຍ:</span></label>
            <input v-model="data.unit" type="text" :readonly="!isEditing"
              class="input input-sm input-bordered w-full"
              :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
          </div>

          <div class="md:col-span-4">
            <div class="address-grid-custom mt-1">
              <div class="input-sub">
                <span class="font-bold">ບ້ານ: <span class="text-error">*</span></span>
                <input v-model="data.address.village" type="text" :readonly="!isEditing"
                  class="input input-sm input-bordered w-full" placeholder="ບ້ານ"
                  :class="[isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed', errors.village ? 'input-error' : '']"
                  @input="errors.village = ''" />
                <label v-if="errors.village" class="label p-0 pt-1">
                  <span class="label-text-alt text-error flex items-center gap-1"><span class="icon-[tabler--alert-circle] size-4"></span> {{ errors.village }}</span>
                </label>
              </div>
              
              <div class="input-sub">
                <span class="font-bold">ເມືອງ: <span class="text-error">*</span></span>
                <select v-model="data.address.district_id" :disabled="!isEditing || !data.address.province_id"
                  @change="handleDistrictChange(); errors.district_id = ''" 
                  class="select-addr select-sm select-bordered w-full"
                  :class="[isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed', errors.district_id ? 'select-error' : '']">
                  <option value="">-- ເລືອກເມືອງ --</option>
                  <option v-for="d in localDistricts" :key="d.district_id" :value="d.district_id">{{ d.district_name }}</option>
                </select>
                <label v-if="errors.district_id" class="label p-0 pt-1">
                  <span class="label-text-alt text-error flex items-center gap-1"><span class="icon-[tabler--alert-circle] size-4"></span> {{ errors.district_id }}</span>
                </label>
              </div>
              
              <div class="input-sub">
                <span class="font-bold">ແຂວງ: <span class="text-error">*</span></span>
                <select v-model="data.address.province_id" :disabled="!isEditing"
                  class="select-addr select-sm select-bordered w-full"
                  :class="[isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed', errors.province_id ? 'select-error' : '']"
                  @change="errors.province_id = ''">
                  <option value="">-- ເລືອກແຂວງ --</option>
                  <option v-for="p in addressStore.provinces" :key="p.province_id" :value="p.province_id">{{ p.province_name }}</option>
                </select>
                <label v-if="errors.province_id" class="label p-0 pt-1">
                  <span class="label-text-alt text-error flex items-center gap-1"><span class="icon-[tabler--alert-circle] size-4"></span> {{ errors.province_id }}</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label class="label"><span class="label-text font-bold">ຈຳນວນປີທີ່ອາໄສ:</span></label>
            <div class="join w-full">
              <input v-model.number="data.residenceYears" type="number" :readonly="!isEditing"
                class="input input-sm input-bordered w-full join-item"
                :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
              <span class="btn btn-sm btn-disabled join-item">ປີ</span>
            </div>
          </div>
          <div class="md:col-span-2">
            <label class="label"><span class="label-text font-bold">ອາໄສຢູ່ກັບ:</span></label>
            <input v-model="data.liveWith" type="text" :readonly="!isEditing"
              class="input input-sm input-bordered w-full"
              :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
          </div>
          <div>
            <label class="label"><span class="label-text font-bold">ສະຖານະການຢູ່ອາໄສ:</span></label>
            <select v-model="data.residenceStatus" :disabled="!isEditing"
              class="select select-sm select-bordered w-full"
              :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'">
              <option value="">ເລືອກ</option>
              <option value="own">ເຮືອນຕົວເອງ</option>
              <option value="rent">ເຊົ່າ</option>
              <option value="family">ຢູ່ກັບຄອບຄົວ</option>
              <option value="other">ອື່ນໆ</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useAddressStore } from '@/stores/address'
import { formatDateToDDMMYYYY } from '@/utils/formatters'
import { calculateAge } from '@/utils/dateUtils'

const props = defineProps<{
  data: any,
  hasGuarantor: boolean,
  hasReference: boolean,
  isEditing: boolean
}>()

const emit = defineEmits(['update:hasGuarantor', 'update:hasReference'])
const addressStore = useAddressStore()

// 🟢 ປະກາດຕົວແປສຳລັບເກັບ Error ຂອງແຕ່ລະ Field
const errors = ref<Record<string, string>>({})

// ==========================================
// 🟢 Date Pickers Logic
// ==========================================
const displayDob = computed(() => formatDateToDDMMYYYY(props.data.dob))
const displayIdCardIssueDate = computed(() => formatDateToDDMMYYYY(props.data.idCardIssueDate))
const displayIdCardExpiryDate = computed(() => formatDateToDDMMYYYY(props.data.idCardExpiryDate))
const displayCensusBookIssueDate = computed(() => formatDateToDDMMYYYY(props.data.censusBookIssueDate))

const hiddenDateInput = ref<HTMLInputElement | null>(null)
const triggerDatePicker = () => { if (hiddenDateInput.value) hiddenDateInput.value.showPicker() }

const hiddenIdCardIssueDateInput = ref<HTMLInputElement | null>(null)
const triggerIdCardIssueDatePicker = () => { if (hiddenIdCardIssueDateInput.value) hiddenIdCardIssueDateInput.value.showPicker() }

const hiddenIdCardExpiryDateInput = ref<HTMLInputElement | null>(null)
const triggerIdCardExpiryDatePicker = () => { if (hiddenIdCardExpiryDateInput.value) hiddenIdCardExpiryDateInput.value.showPicker() }

const hiddenCensusBookIssueDateInput = ref<HTMLInputElement | null>(null)
const triggerCensusBookIssueDatePicker = () => { if (hiddenCensusBookIssueDateInput.value) hiddenCensusBookIssueDateInput.value.showPicker() }

// ==========================================
// 🟢 ລະບົບພິມວັນທີເອງ
// ==========================================
const handleDateTyping = (e: Event, field: string) => {
  if (errors.value[field]) errors.value[field] = '';

  const target = e.target as HTMLInputElement;
  let val = target.value.replace(/\D/g, ''); 

  if (val.length > 8) val = val.substring(0, 8);

  let formatted = val;
  if (val.length >= 3) {
    formatted = val.substring(0, 2) + '/' + val.substring(2);
  }
  if (val.length >= 5) {
    formatted = formatted.substring(0, 5) + '/' + val.substring(4);
  }

  target.value = formatted;

  if (val.length === 8) {
    const day = parseInt(val.substring(0, 2));
    const month = parseInt(val.substring(2, 4));
    const year = parseInt(val.substring(4, 8));

    if (day > 0 && day <= 31 && month > 0 && month <= 12 && year > 1900 && year <= 2100) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      props.data[field] = dateStr;
    }
  } else if (val.length === 0) {
    props.data[field] = '';
  }
};

const handleDateBlur = (e: Event, field: string) => {
  const target = e.target as HTMLInputElement;
  if (target.value.length > 0 && target.value.length < 10) {
    target.value = formatDateToDDMMYYYY(props.data[field]);
  }
};

// ==========================================
// 🟢 Validation ວັນທີ & ຄິດໄລ່ອາຍຸ
// ==========================================
const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0] || '';
}

watch(() => props.data.dob, (newDob: string | undefined | null) => {
  if (!props.isEditing) return;
  if (!newDob) {
    props.data.age = null;
    return;
  }

  if (newDob > getTodayDateString()) {
    props.data.dob = '';
    props.data.age = null;
    return;
  }

  const calculatedAge = calculateAge(newDob);
  if (calculatedAge !== null) {
    if (calculatedAge < 18 || calculatedAge > 100) {
       props.data.dob = '';
       props.data.age = null;
       return;
    }
  }
  props.data.age = calculatedAge;
});

watch(() => props.data.idCardIssueDate, (newStartDate: string | undefined | null) => {
  if (!props.isEditing) return;
  if (!newStartDate) return;
  
  if (newStartDate > getTodayDateString()) {
    props.data.idCardIssueDate = '';
    return;
  }
  const expiryDate = props.data.idCardExpiryDate;
  if (expiryDate && newStartDate >= expiryDate) {
    props.data.idCardIssueDate = '';
  }
});

watch(() => props.data.idCardExpiryDate, (newExpiryDate: string | undefined | null) => {
  if (!props.isEditing) return;
  if (!newExpiryDate) return;
  const startDate = props.data.idCardIssueDate;
  if (startDate && newExpiryDate <= startDate) {
    props.data.idCardExpiryDate = '';
  }
});

watch(() => props.data.censusBookIssueDate, (newDate: string | undefined | null) => {
  if (!props.isEditing) return;
  if (!newDate) return;
  if (newDate > getTodayDateString()) {
    props.data.censusBookIssueDate = '';
  }
});

// ==========================================
// 🟢 Address Management
// ==========================================
const localDistricts = ref<any[]>([])

const loadLocalDistricts = async (provinceId: string) => {
  if (!provinceId) {
    localDistricts.value = [];
    return;
  }
  await addressStore.fetchDistricts(provinceId);
  localDistricts.value = [...addressStore.districts];
}

onMounted(async () => {
  if (props.data.address?.province_id) {
    await loadLocalDistricts(props.data.address.province_id);
  }
});

const handleDistrictChange = () => {
  const d = localDistricts.value.find(x => x.district_id === props.data.address.district_id);
  if (d) props.data.address.district = d.district_name;
};

watch(() => props.data.address.province_id, async (newVal) => {
  if (props.isEditing) {
    props.data.address.district_id = '';
    props.data.address.district = '';
    const p = addressStore.provinces.find(x => x.province_id === newVal);
    props.data.address.province = p ? p.province_name : '';
    if (newVal) await loadLocalDistricts(newVal);
  }
});

// ==========================================
// 🟢 Main Form Validation Function
// ==========================================
const validateForm = (): boolean => {
  errors.value = {}; // Reset errors
  let isValid = true;

  // ຖ້າບໍ່ມີການຕິກເລືອກ ຜູ້ຄ້ຳປະກັນ ຫຼື ຜູ້ອ້າງອີງ ຖືວ່າຜ່ານເລີຍ
  if (!props.hasGuarantor && !props.hasReference) {
    return true;
  }

  // 🟢 ກວດສອບສະເພາະ 5 ຈຸດ ຕາມທີ່ກຳນົດ
  if (!props.data.fullname?.trim()) { errors.value.fullname = 'ກະລຸນາປ້ອນຊື່ ແລະ ນາມສະກຸນ'; isValid = false; }
  if (!props.data.relationship?.trim()) { errors.value.relationship = 'ກະລຸນາປ້ອນສາຍພົວພັນ'; isValid = false; }
  if (!props.data.address?.village?.trim()) { errors.value.village = 'ກະລຸນາປ້ອນບ້ານ'; isValid = false; }
  if (!props.data.address?.district_id) { errors.value.district_id = 'ກະລຸນາເລືອກເມືອງ'; isValid = false; }
  if (!props.data.address?.province_id) { errors.value.province_id = 'ກະລຸນາເລືອກແຂວງ'; isValid = false; }

  return isValid;
};

// Expose ຟັງຊັນອອກໄປໃຫ້ Parent Component ເອີ້ນໃຊ້ໄດ້
defineExpose({
  validateForm,
  errors
});
</script>