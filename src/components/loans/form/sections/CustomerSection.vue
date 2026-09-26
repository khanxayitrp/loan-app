
<template>
  <section class="form-section">
    <h3 class="section-title">I. ຂໍ້ມູນສ່ວນຕົວລູກຄ້າ</h3>

    <div class="mb-5 bg-slate-50 p-5 rounded-xl border border-slate-200">
      <h4 class="font-bold text-primary mb-4 flex items-center gap-2">
        <span class="icon-[tabler--user] size-5"></span> ຂໍ້ມູນທົ່ວໄປ
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        <div class="form-control lg:col-span-2">
          <label class="label"><span class="label-text font-bold">ຊື່ ແລະ ນາມສະກຸນ: <span
                class="text-error">*</span></span></label>
          <input v-model="data.fullname" type="text" :readonly="!isEditing" class="input input-sm input-bordered w-full"
            :class="[isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed', errors.fullname ? 'input-error' : '']"
            @input="errors.fullname = ''" />
          <label v-if="errors.fullname" class="label p-0 pt-1">
            <span class="label-text-alt text-error flex items-center gap-1"><span
                class="icon-[tabler--alert-circle] size-4"></span> {{ errors.fullname }}</span>
          </label>
        </div>

        <div class="form-control relative">
          <label class="label"><span class="label-text font-bold">ວັນເດືອນປີເກີດ: <span
                class="text-error">*</span></span></label>
          <input type="text" :value="displayDob" :readonly="!isEditing" maxlength="10" placeholder="dd/mm/yyyy"
            class="input input-sm input-bordered w-full pr-10"
            :class="[isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed', errors.dob ? 'input-error' : '']"
            @input="handleDateTyping($event, 'dob')" @blur="handleDateBlur($event, 'dob')" />
          <input ref="hiddenDateInput" v-model="data.dob" type="date"
            class="absolute opacity-0 w-0 h-0 p-0 m-0 border-0 pointer-events-none" tabindex="-1" />
          <span class="icon-[tabler--calendar] absolute right-3 top-9 text-gray-500 size-4"
            :class="isEditing ? 'cursor-pointer hover:text-primary' : 'pointer-events-none'"
            @click="isEditing ? triggerDatePicker() : null"></span>
          <label v-if="errors.dob" class="label p-0 pt-1">
            <span class="label-text-alt text-error flex items-center gap-1"><span
                class="icon-[tabler--alert-circle] size-4"></span> {{ errors.dob }}</span>
          </label>
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
          <label class="label"><span class="label-text font-bold">ເບີໂທລະສັບມືຖື: <span
                class="text-error">*</span></span></label>
          <input v-model="data.phone" type="tel" :readonly="!isEditing" class="input input-sm input-bordered w-full"
            :class="[isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed', errors.phone ? 'input-error' : '']"
            @input="errors.phone = ''" />
          <label v-if="errors.phone" class="label p-0 pt-1">
            <span class="label-text-alt text-error flex items-center gap-1"><span
                class="icon-[tabler--alert-circle] size-4"></span> {{ errors.phone }}</span>
          </label>
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text font-bold">ເພດ: <span class="text-error">*</span></span></label>
          <select v-model="data.gender" :disabled="!isEditing" class="select select-sm select-bordered w-full"
            :class="[isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed', errors.gender ? 'select-error' : '']"
            @change="errors.gender = ''">
            <option value="">ເລືອກ</option>
            <option value="male">ຊາຍ</option>
            <option value="female">ຍິງ</option>
          </select>
          <label v-if="errors.gender" class="label p-0 pt-1">
            <span class="label-text-alt text-error flex items-center gap-1"><span
                class="icon-[tabler--alert-circle] size-4"></span> {{ errors.gender }}</span>
          </label>
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text font-bold">ສະຖານະພາບ: <span
                class="text-error">*</span></span></label>
          <select v-model="data.maritalStatus" :disabled="!isEditing" class="select select-sm select-bordered w-full"
            :class="[isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed', errors.maritalStatus ? 'select-error' : '']"
            @change="errors.maritalStatus = ''">
            <option value="">ເລືອກ</option>
            <option value="single">ໂສດ</option>
            <option value="married">ແຕ່ງງານແລ້ວ</option>
            <option value="divorced">ຢ່າຮ້າງ</option>
            <option value="widowed">ມ້າຍ</option>
          </select>
          <label v-if="errors.maritalStatus" class="label p-0 pt-1">
            <span class="label-text-alt text-error flex items-center gap-1"><span
                class="icon-[tabler--alert-circle] size-4"></span> {{ errors.maritalStatus }}</span>
          </label>
        </div>

        <div class="form-control lg:col-span-2">
          <label class="label"><span class="label-text font-bold">ອາຊີບ: <span
                class="text-error">*</span></span></label>
          <input v-model="data.occupation" type="text" :readonly="!isEditing"
            class="input input-sm input-bordered w-full"
            :class="[isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed', errors.occupation ? 'input-error' : '']"
            @input="errors.occupation = ''" />
          <label v-if="errors.occupation" class="label p-0 pt-1">
            <span class="label-text-alt text-error flex items-center gap-1"><span
                class="icon-[tabler--alert-circle] size-4"></span> {{ errors.occupation }}</span>
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
          <label class="label"><span class="label-text font-bold">IDCard/Passport: </span></label>
          <input v-model="data.idCard" type="text" :readonly="!isEditing" class="input input-sm input-bordered w-full"
            :class="[isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed', errors.idCard ? 'input-error' : '']"
            @input="errors.idCard = ''" />
          <label v-if="errors.idCard" class="label p-0 pt-1">
            <span class="label-text-alt text-error flex items-center gap-1"><span
                class="icon-[tabler--alert-circle] size-4"></span> {{ errors.idCard }}</span>
          </label>
        </div>

        <div class="form-control relative">
          <label class="label"><span class="label-text font-bold">ວັນເດືອນປີອອກບັດ: </span></label>
          <input type="text" :value="displayIdCardStartDate" :readonly="!isEditing" maxlength="10"
            placeholder="dd/mm/yyyy" class="input input-sm input-bordered w-full pr-10"
            :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'"
            @input="handleDateTyping($event, 'idCardIssueDate')" @blur="handleDateBlur($event, 'idCardIssueDate')" />
          <input ref="hiddenIdCardStartDateInput" v-model="data.idCardIssueDate" type="date"
            class="absolute opacity-0 w-0 h-0 p-0 m-0 border-0 pointer-events-none" tabindex="-1" />
          <span class="icon-[tabler--calendar] absolute right-3 top-9 text-gray-500 size-4"
            :class="isEditing ? 'cursor-pointer hover:text-primary' : 'pointer-events-none'"
            @click="isEditing ? triggerIdCardStartDatePicker() : null"></span>
          <!-- <label v-if="errors.idCardStartDate" class="label p-0 pt-1">
            <span class="label-text-alt text-error flex items-center gap-1"><span class="icon-[tabler--alert-circle] size-4"></span> {{ errors.idCardStartDate }}</span>
          </label> -->
        </div>

        <div class="form-control relative">
          <label class="label"><span class="label-text font-bold">ວັນເດືອນປີໝົດອາຍຸບັດ: </span></label>
          <input type="text" :value="displayIdCardExpiryDate" :readonly="!isEditing" maxlength="10"
            placeholder="dd/mm/yyyy" class="input input-sm input-bordered w-full pr-10"
            :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'"
            @input="handleDateTyping($event, 'idCardExpiryDate')" @blur="handleDateBlur($event, 'idCardExpiryDate')" />
          <input ref="hiddenIdCardExpiryDateInput" v-model="data.idCardExpiryDate" type="date"
            class="absolute opacity-0 w-0 h-0 p-0 m-0 border-0 pointer-events-none" tabindex="-1" />
          <span class="icon-[tabler--calendar] absolute right-3 top-9 text-gray-500 size-4"
            :class="isEditing ? 'cursor-pointer hover:text-primary' : 'pointer-events-none'"
            @click="isEditing ? triggerExpiryDatePicker() : null"></span>
          <!-- <label v-if="errors.idCardExpiryDate" class="label p-0 pt-1">
            <span class="label-text-alt text-error flex items-center gap-1"><span class="icon-[tabler--alert-circle] size-4"></span> {{ errors.idCardExpiryDate }}</span>
          </label> -->
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text font-bold">ປຶ້ມສຳມະໂນຄົວ ເລກທີ:</span></label>
          <input v-model="data.censusBook" type="text" :readonly="!isEditing"
            class="input input-sm input-bordered w-full"
            :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
        </div>

        <div class="form-control relative">
          <label class="label"><span class="label-text font-bold">ວັນເດືອນປີອອກ:</span></label>
          <input type="text" :value="displayCensusBookIssueDate" :readonly="!isEditing" maxlength="10"
            placeholder="dd/mm/yyyy" class="input input-sm input-bordered w-full pr-10"
            :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'"
            @input="handleDateTyping($event, 'censusBookIssueDate')"
            @blur="handleDateBlur($event, 'censusBookIssueDate')" />
          <input ref="hiddenCensusBookIssueDateInput" v-model="data.censusBookIssueDate" type="date"
            class="absolute opacity-0 w-0 h-0 p-0 m-0 border-0 pointer-events-none" tabindex="-1" />
          <span class="icon-[tabler--calendar] absolute right-3 top-9 text-gray-500 size-4"
            :class="isEditing ? 'cursor-pointer hover:text-primary' : 'pointer-events-none'"
            @click="isEditing ? triggerCensusBookIssueDatePicker() : null"></span>
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
          <input v-model="data.unit" type="text" :readonly="!isEditing" class="input input-sm input-bordered w-full"
            :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
        </div>

        <div class="md:col-span-4">
          <div class="address-grid-custom mt-1">
            <div class="input-sub">
              <span class="font-bold">ບ້ານ: <span class="text-error">*</span></span>
              <input v-model="data.address.village" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full"
                :class="[isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed', errors.village ? 'input-error' : '']"
                placeholder="ບ້ານ" @input="errors.village = ''" />
              <label v-if="errors.village" class="label p-0 pt-1">
                <span class="label-text-alt text-error flex items-center gap-1"><span
                    class="icon-[tabler--alert-circle] size-4"></span> {{ errors.village }}</span>
              </label>
            </div>

            <div class="input-sub">
              <span class="font-bold">ເມືອງ: <span class="text-error">*</span></span>
              <select v-model="data.address.district_id" :disabled="!isEditing || !data.address.province_id"
                @change="handleDistrictChange(); errors.district_id = ''"
                class="select-addr select-sm select-bordered w-full"
                :class="[isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed', errors.district_id ? 'select-error' : '']">
                <option value="">-- ເລືອກເມືອງ --</option>
                <option v-for="d in localDistricts" :key="d.district_id" :value="d.district_id">{{ d.district_name }}
                </option>
              </select>
              <label v-if="errors.district_id" class="label p-0 pt-1">
                <span class="label-text-alt text-error flex items-center gap-1"><span
                    class="icon-[tabler--alert-circle] size-4"></span> {{ errors.district_id }}</span>
              </label>
            </div>

            <div class="input-sub">
              <span class="font-bold">ແຂວງ: <span class="text-error">*</span></span>
              <select v-model="data.address.province_id" :disabled="!isEditing"
                class="select-addr select-sm select-bordered w-full"
                :class="[isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed', errors.province_id ? 'select-error' : '']"
                @change="errors.province_id = ''">
                <option value="">-- ເລືອກແຂວງ --</option>
                <option v-for="p in addressStore.provinces" :key="p.province_id" :value="p.province_id">{{
                  p.province_name }}</option>
              </select>
              <label v-if="errors.province_id" class="label p-0 pt-1">
                <span class="label-text-alt text-error flex items-center gap-1"><span
                    class="icon-[tabler--alert-circle] size-4"></span> {{ errors.province_id }}</span>
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
          <input v-model="data.liveWith" type="text" :readonly="!isEditing" class="input input-sm input-bordered w-full"
            :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
        </div>
        <div>
          <label class="label"><span class="label-text font-bold">ສະຖານະການຢູ່ອາໄສ:</span></label>
          <select v-model="data.residenceStatus" :disabled="!isEditing" class="select select-sm select-bordered w-full"
            :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'">
            <option value="">ເລືອກ</option>
            <option value="own">ເຮືອນຕົວເອງ</option>
            <option value="rent">ເຊົ່າ</option>
            <option value="family">ຢູ່ກັບຄອບຄົວ</option>
            <option value="relatives">ຢູ່ກັບພີ່ນ້ອງ</option>
            <option value="friends">ຢູ່ກັບຫມູ່ເພື່ອນ</option>
            <option value="party_state_office">ຢູ່ກັບພັກ,ລັດ/ຫ້ອງການ</option>
            <option value="other">ອື່ນໆ</option>
          </select>
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
import type { CustomerFormData } from '@/types/loanFormSections'

const props = defineProps<{ isEditing: boolean }>()
const data = defineModel<CustomerFormData>('data', { required: true })

const addressStore = useAddressStore()

// 🟢 ປະກາດຕົວແປສຳລັບເກັບ Error ຂອງແຕ່ລະ Field
const errors = ref<Record<string, string>>({})

// ==========================================
// 🟢 Date Pickers Logic
// ==========================================
const displayDob = computed(() => formatDateToDDMMYYYY(data.value.dob ?? undefined))
const displayIdCardStartDate = computed(() => formatDateToDDMMYYYY(data.value.idCardIssueDate ?? undefined))
const displayIdCardExpiryDate = computed(() => formatDateToDDMMYYYY(data.value.idCardExpiryDate ?? undefined))
const displayCensusBookIssueDate = computed(() => formatDateToDDMMYYYY(data.value.censusBookIssueDate ?? undefined))

const hiddenDateInput = ref<HTMLInputElement | null>(null)
const triggerDatePicker = () => { if (hiddenDateInput.value) hiddenDateInput.value.showPicker() }

const hiddenIdCardExpiryDateInput = ref<HTMLInputElement | null>(null)
const triggerExpiryDatePicker = () => { if (hiddenIdCardExpiryDateInput.value) hiddenIdCardExpiryDateInput.value.showPicker() }

const hiddenIdCardStartDateInput = ref<HTMLInputElement | null>(null)
const triggerIdCardStartDatePicker = () => { if (hiddenIdCardStartDateInput.value) hiddenIdCardStartDateInput.value.showPicker() }

const hiddenCensusBookIssueDateInput = ref<HTMLInputElement | null>(null)
const triggerCensusBookIssueDatePicker = () => { if (hiddenCensusBookIssueDateInput.value) hiddenCensusBookIssueDateInput.value.showPicker() }

// ==========================================
// 🟢 ລະບົບພິມວັນທີເອງ (Date Typing & Masking)
// ==========================================
const handleDateTyping = (e: Event, field: string) => {
  if (errors.value[field]) errors.value[field] = ''; // ເຄລຍ Error ອັດຕະໂນມັດເມື່ອພິມໃໝ່

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
      (data.value as unknown as Record<string, unknown>)[field] = dateStr;
    } else {
      errors.value[field] = 'ວັນທີບໍ່ຖືກຕ້ອງ (ຕົວຢ່າງ: 25/05/1999)';
    }
  } else if (val.length === 0) {
    (data.value as unknown as Record<string, unknown>)[field] = '';
    errors.value[field] = ''; // 🟢 Clear error ทิ้งด้วยเมื่อผู้ใช้ลบข้อมูลจนว่างเปล่า
  } else {
    (data.value as unknown as Record<string, unknown>)[field] = '';
  }
};

const handleDateBlur = (e: Event, field: string) => {
  const target = e.target as HTMLInputElement;
  if (target.value.length > 0 && target.value.length < 10) {
    const val = (data.value as unknown as Record<string, unknown>)[field] as string | undefined;
    target.value = formatDateToDDMMYYYY(val);
  }
};

// ==========================================
// 🟢 Validation ວັນທີ & ຄິດໄລ່ອາຍຸ
// ==========================================
const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0] || '';
}

watch(() => data.value.dob, (newDob: string | undefined | null) => {
  if (!props.isEditing) return;
  if (!newDob) {
    data.value.age = null;
    return;
  }

  if (newDob > getTodayDateString()) {
    errors.value.dob = 'ວັນເດືອນປີເກີດບໍ່ສາມາດເກີນວັນທີປະຈຸບັນໄດ້';
    data.value.dob = '';
    data.value.age = null;
    return;
  }

  const calculatedAge = calculateAge(newDob);

  if (calculatedAge !== null) {
    if (calculatedAge < 18) {
      errors.value.dob = 'ລູກຄ້າຕ້ອງມີອາຍຸ 18 ປີຂຶ້ນໄປ';
      data.value.dob = '';
      data.value.age = null;
      return;
    }

    if (calculatedAge > 100) {
      errors.value.dob = 'ອາຍຸບໍ່ສາມາດເກີນ 100 ປີໄດ້';
      data.value.dob = '';
      data.value.age = null;
      return;
    }
  }

  data.value.age = calculatedAge;
});

watch(() => data.value.idCardIssueDate, (newStartDate: string | undefined | null) => {
  if (!props.isEditing) return;
  if (!newStartDate) return;

  if (newStartDate > getTodayDateString()) {
    errors.value.idCardIssueDate = 'ວັນທີອອກບັດບໍ່ສາມາດເກີນວັນທີປະຈຸບັນໄດ້';
    data.value.idCardIssueDate = '';
    return;
  }

  const expiryDate = data.value.idCardExpiryDate;
  if (expiryDate && newStartDate >= expiryDate) {
    errors.value.idCardIssueDate = 'ວັນທີອອກບັດບໍ່ສາມາດກາຍ ຫຼື ເທົ່າກັບວັນທີໝົດອາຍຸບັດໄດ້';
    data.value.idCardIssueDate = '';
  }
});

watch(() => data.value.idCardExpiryDate, (newExpiryDate: string | undefined | null) => {
  if (!props.isEditing) return;
  if (!newExpiryDate) return;

  const startDate = data.value.idCardIssueDate;

  if (startDate && newExpiryDate <= startDate) {
    errors.value.idCardExpiryDate = 'ວັນເດືອນປີໝົດອາຍຸບັດຕ້ອງຫຼາຍກວ່າວັນທີອອກບັດ';
    data.value.idCardExpiryDate = '';
  }
});

watch(() => data.value.censusBookIssueDate, (newDate: string | undefined | null) => {
  if (!props.isEditing) return;
  if (!newDate) return;

  if (newDate > getTodayDateString()) {
    errors.value.censusBookIssueDate = 'ວັນເດືອນປີອອກປຶ້ມສຳມະໂນຄົວບໍ່ສາມາດເກີນວັນທີປະຈຸບັນໄດ້';
    data.value.censusBookIssueDate = '';
  }
});

// ==========================================
// 🟢 Address Management
// ==========================================
interface DistrictItem {
  district_id: string | number;
  district_name: string;
}

const localDistricts = ref<DistrictItem[]>([])

const loadLocalDistricts = async (provinceId: string | number) => {
  if (!provinceId) {
    localDistricts.value = [];
    return;
  }
  await addressStore.fetchDistricts(String(provinceId));
  localDistricts.value = [...addressStore.districts];
}

onMounted(async () => {
  if (data.value.address?.province_id) {
    await loadLocalDistricts(data.value.address.province_id);
  }
});

const handleDistrictChange = () => {
  const d = localDistricts.value.find(x => x.district_id === data.value.address.district_id);
  if (d) data.value.address.district = d.district_name;
};

watch(() => data.value.address.province_id, async (newVal) => {
  if (props.isEditing) {
    data.value.address.district_id = '';
    data.value.address.district = '';
    const p = addressStore.provinces.find(x => x.province_id === newVal);
    data.value.address.province = p ? p.province_name : '';
    if (newVal) await loadLocalDistricts(newVal);
  }
});

// ==========================================
// 🟢 Main Form Validation Function
// ==========================================
const validateForm = (): boolean => {
  errors.value = {}; // Reset errors
  let isValid = true;

  // ກວດສອບຂໍ້ມູນທົ່ວໄປ
  if (!data.value.fullname?.trim()) { errors.value.fullname = 'ກະລຸນາປ້ອນຊື່ ແລະ ນາມສະກຸນ'; isValid = false; }
  if (!data.value.dob) { errors.value.dob = 'ກະລຸນາປ້ອນວັນເດືອນປີເກີດ'; isValid = false; }
  if (!data.value.phone?.trim()) { errors.value.phone = 'ກະລຸນາປ້ອນເບີໂທລະສັບ'; isValid = false; }
  if (!data.value.gender) { errors.value.gender = 'ກະລຸນາເລືອກເພດ'; isValid = false; }
  if (!data.value.maritalStatus) { errors.value.maritalStatus = 'ກະລຸນາເລືອກສະຖານະພາບ'; isValid = false; }
  if (!data.value.occupation?.trim()) { errors.value.occupation = 'ກະລຸນາປ້ອນອາຊີບ'; isValid = false; }

  // ກວດສອບຂໍ້ມູນທີ່ຢູ່
  if (!data.value.address?.village?.trim()) { errors.value.village = 'ກະລຸນາປ້ອນບ້ານ'; isValid = false; }
  if (!data.value.address?.district_id) { errors.value.district_id = 'ກະລຸນາເລືອກເມືອງ'; isValid = false; }
  if (!data.value.address?.province_id) { errors.value.province_id = 'ກະລຸນາເລືອກແຂວງ'; isValid = false; }

  return isValid;
};

// 🟢 Expose ຟັງຊັນອອກໄປໃຫ້ Parent Component ເອີ້ນໃຊ້ໄດ້
defineExpose({
  validateForm,
  errors
});
</script>

