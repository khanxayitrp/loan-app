
<template>
  <section class="form-section">
    <h3 class="section-title">II. ຂໍ້ມູນຫ້ອງການບ່ອນເຮັດວຽກ ລູກຄ້າ</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <div class="form-control lg:col-span-2">
        <label class="label"><span class="label-text font-bold">ຊື່ອົງການ/ບໍລິສັດ: <span class="text-error">*</span></span></label>
        <input v-model="data.companyName" type="text" :readonly="!isEditing"
          class="input input-sm input-bordered w-full"
          :class="[isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed', errors.companyName ? 'input-error' : '']"
          @input="errors.companyName = ''" />
        <label v-if="errors.companyName" class="label p-0 pt-1">
          <span class="label-text-alt text-error flex items-center gap-1"><span class="icon-[tabler--alert-circle] size-4"></span> {{ errors.companyName }}</span>
        </label>
      </div>

      <div class="form-control lg:col-span-2">
        <label class="label"><span class="label-text font-bold">ປະເພດຂອງທຸລະກິດ: <span class="text-error">*</span></span></label>
        <input v-model="data.businessType" type="text" :readonly="!isEditing"
          class="input input-sm input-bordered w-full"
          :class="[isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed', errors.businessType ? 'input-error' : '']"
          @input="errors.businessType = ''" />
        <label v-if="errors.businessType" class="label p-0 pt-1">
          <span class="label-text-alt text-error flex items-center gap-1"><span class="icon-[tabler--alert-circle] size-4"></span> {{ errors.businessType }}</span>
        </label>
      </div>

      <div class="form-control lg:col-span-4">
        <label class="label"><span class="label-text font-bold">ທີ່ຢູ່ຫ້ອງການ:</span></label>
        <div class="address-grid-custom mt-1">
          <div class="input-sub">
            <span class="font-bold">ບ້ານ: <span class="text-error">*</span></span>
            <input v-model="data.address.village" type="text" :readonly="!isEditing"
              class="input input-sm input-bordered w-full bg-white" placeholder="ບ້ານ"
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
              class="select-addr select-sm select-bordered w-full bg-white"
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
              class="select-addr select-sm select-bordered w-full bg-white"
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

      <div class="form-control lg:col-span-2">
        <label class="label"><span class="label-text font-bold">ລາຍລະອຽດທຸລະກິດ:</span></label>
        <input v-model="data.businessDetail" type="text" :readonly="!isEditing"
          class="input input-sm input-bordered w-full"
          :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
      </div>

      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ພະແນກ:</span></label>
        <input v-model="data.department" type="text" :readonly="!isEditing"
          class="input input-sm input-bordered w-full"
          :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
      </div>

      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ເບີໂທບ່ອນເຮັດວຽກ: <span class="text-error">*</span></span></label>
        <input v-model="data.phone" type="tel" :readonly="!isEditing" 
          class="input input-sm input-bordered w-full"
          :class="[isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed', errors.phone ? 'input-error' : '']"
          @input="errors.phone = ''" />
        <label v-if="errors.phone" class="label p-0 pt-1">
          <span class="label-text-alt text-error flex items-center gap-1"><span class="icon-[tabler--alert-circle] size-4"></span> {{ errors.phone }}</span>
        </label>
      </div>

      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ອາຍຸການເຮັດວຽກ (ປີ): <span class="text-error">*</span></span></label>
        <input v-model.number="data.workYears" type="number" :readonly="!isEditing" min="0"
          class="input input-sm input-bordered w-full"
          :class="[isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed', errors.workYears ? 'input-error' : '']"
          @input="errors.workYears = ''" />
        <label v-if="errors.workYears" class="label p-0 pt-1">
          <span class="label-text-alt text-error flex items-center gap-1"><span class="icon-[tabler--alert-circle] size-4"></span> {{ errors.workYears }}</span>
        </label>
      </div>
      
      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ອາຍຸການເຮັດວຽກ (ເດືອນ):</span></label>
        <input v-model.number="data.workMonths" type="number" :readonly="!isEditing" min="0" max="11"
          class="input input-sm input-bordered w-full"
          :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
      </div>

      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ຕຳແໜ່ງ: <span class="text-error">*</span></span></label>
        <input v-model="data.position" type="text" :readonly="!isEditing"
          class="input input-sm input-bordered w-full"
          :class="[isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed', errors.position ? 'input-error' : '']"
          @input="errors.position = ''" />
        <label v-if="errors.position" class="label p-0 pt-1">
          <span class="label-text-alt text-error flex items-center gap-1"><span class="icon-[tabler--alert-circle] size-4"></span> {{ errors.position }}</span>
        </label>
      </div>
      
      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ພະນັກງານທັງໝົດຈຳນວນ:</span></label>
        <input v-model.number="data.totalEmployees" type="number" :readonly="!isEditing" min="0"
          class="input input-sm input-bordered w-full"
          :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
      </div>

      <div class="form-control lg:col-span-2">
        <label class="label"><span class="label-text font-bold">ເງິນເດືອນ/ລາຍຮັບຕໍ່ເດືອນ (ກີບ): <span class="text-error">*</span></span></label>
        <input :value="formatCurrencyInput(data.salary)" @input="handleCurrencyInput('salary', $event); errors.salary = ''" type="text"
          :readonly="!isEditing" 
          class="input input-sm input-bordered w-full"
          :class="[isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed', errors.salary ? 'input-error' : '']" />
        <label v-if="errors.salary" class="label p-0 pt-1">
          <span class="label-text-alt text-error flex items-center gap-1"><span class="icon-[tabler--alert-circle] size-4"></span> {{ errors.salary }}</span>
        </label>
      </div>

      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ມື້ເງິນເດືອນອອກ (ວັນທີ):</span></label>
        <input v-model.number="data.salaryDay" type="number" min="1" max="31" :readonly="!isEditing"
          class="input input-sm input-bordered w-full"
          :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
      </div>

      <div class="form-control lg:col-span-2">
        <label class="label"><span class="label-text font-bold">ລາຍໄດ້ອື່ນໆ (ຖ້າມີ) (ກີບ):</span></label>
        <input :value="formatCurrencyInput(data.otherIncome)" @input="handleCurrencyInput('otherIncome', $event)"
          type="text" :readonly="!isEditing" 
          class="input input-sm input-bordered w-full"
          :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
      </div>
      
      <div class="form-control lg:col-span-2">
        <label class="label"><span class="label-text font-bold">ແຫຼ່ງທີ່ມາຂອງລາຍໄດ້ອື່ນໆ:</span></label>
        <input v-model="data.otherIncomeSource" type="text" :readonly="!isEditing"
          class="input input-sm input-bordered w-full"
          :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useAddressStore } from '@/stores/address'
import { formatCurrencyInput } from '@/utils/formatters'
import type { WorkFormData } from '@/types/loanFormSections'

interface ExtendedWorkFormData extends WorkFormData {
  businessDetail?: string;
  department?: string;
  phone?: string;
  totalEmployees?: number | null;
  salaryDay?: number | null;
}

const props = defineProps<{ isEditing: boolean }>()
const data = defineModel<ExtendedWorkFormData>('data', { required: true })

const addressStore = useAddressStore()

// 🟢 ປະກາດຕົວແປສຳລັບເກັບ Error ຂອງແຕ່ລະ Field
const errors = ref<Record<string, string>>({})

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
  if (data.value.companyAddress?.province_id) {
    await loadLocalDistricts(data.value.companyAddress.province_id);
  }
});

const handleDistrictChange = () => {
  if (!data.value.companyAddress) return;
  const d = localDistricts.value.find(x => x.district_id === data.value.companyAddress?.district_id);
  if (d) data.value.companyAddress.district = d.district_name;
};

watch(() => data.value.companyAddress?.province_id, async (newVal) => {
  if (props.isEditing && newVal !== undefined && data.value.companyAddress) {
    data.value.companyAddress.district_id = '';
    data.value.companyAddress.district = '';
    const p = addressStore.provinces.find(x => x.province_id === newVal);
    data.value.companyAddress.province = p ? p.province_name : '';
    if (newVal) await loadLocalDistricts(newVal);
  }
});

const handleCurrencyInput = (field: 'salary' | 'otherIncome', event: Event) => {
  const target = event.target as HTMLInputElement;
  const rawValue = target.value.replace(/,/g, '').replace(/[^\d]/g, '');
  const numericValue = parseInt(rawValue, 10);
  if (!isNaN(numericValue) && rawValue !== '') {
    data.value[field] = numericValue;
  } else {
    data.value[field] = null;
  }
  target.value = formatCurrencyInput(data.value[field]);
};

// ==========================================
// 🟢 Main Form Validation Function
// ==========================================
const validateForm = (): boolean => {
  errors.value = {}; // Reset errors
  let isValid = true;

  if (!data.value.companyName?.trim()) { errors.value.companyName = 'ກະລຸນາປ້ອນຊື່ອົງການ/ບໍລິສັດ'; isValid = false; }
  if (!data.value.businessType?.trim()) { errors.value.businessType = 'ກະລຸນາປ້ອນປະເພດທຸລະກິດ'; isValid = false; }
  
  if (!data.value.companyAddress?.village?.trim()) { errors.value.village = 'ກະລຸນາປ້ອນບ້ານ'; isValid = false; }
  if (!data.value.companyAddress?.district_id) { errors.value.district_id = 'ກະລຸນາເລືອກເມືອງ'; isValid = false; }
  if (!data.value.companyAddress?.province_id) { errors.value.province_id = 'ກະລຸນາເລືອກແຂວງ'; isValid = false; }
  
  if (!data.value.phone?.trim()) { errors.value.phone = 'ກະລຸນາປ້ອນເບີໂທບ່ອນເຮັດວຽກ'; isValid = false; }
  
  if (data.value.workYears === null || data.value.workYears === undefined || (data.value.workYears as unknown as string) === '') {
    errors.value.workYears = 'ກະລຸນາປ້ອນອາຍຸການເຮັດວຽກ'; 
    isValid = false; 
  } else if (data.value.workYears < 0) {
    errors.value.workYears = 'ອາຍຸການເຮັດວຽກຕ້ອງບໍ່ຫຼຸດ 0'; 
    isValid = false; 
  }

  if (!data.value.position?.trim()) { errors.value.position = 'ກະລຸນາປ້ອນຕຳແໜ່ງ'; isValid = false; }
  
  if (!data.value.salary || data.value.salary <= 0) {
    errors.value.salary = 'ກະລຸນາປ້ອນລາຍຮັບຕໍ່ເດືອນທີ່ຖືກຕ້ອງ'; 
    isValid = false; 
  }

  return isValid;
};

// 🟢 Expose ຟັງຊັນອອກໄປໃຫ້ Parent Component ເອີ້ນໃຊ້ໄດ້
defineExpose({
  validateForm,
  errors
});
</script>
