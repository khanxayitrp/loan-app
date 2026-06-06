<template>
  <section v-if="hasGuarantor || hasReference" class="form-section">
    <h3 class="section-title">VI. ຂໍ້ມູນຫ້ອງການບ່ອນເຮັດວຽກຂອງຜູ້ຄ້ຳປະກັນ</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <div class="form-control lg:col-span-2">
        <label class="label"><span class="label-text font-bold">ຊື່ອົງການ/ບໍລິສັດ:</span></label>
        <input v-model="data.companyName" type="text" :readonly="!isEditing"
          class="input input-sm input-bordered w-full"
          :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
      </div>
      
      <div class="form-control lg:col-span-2">
        <label class="label"><span class="label-text font-bold">ປະເພດຂອງທຸລະກິດ:</span></label>
        <input v-model="data.businessType" type="text" :readonly="!isEditing"
          class="input input-sm input-bordered w-full"
          :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
      </div>

      <div class="form-control lg:col-span-4">
        <label class="label"><span class="label-text font-bold">ທີ່ຢູ່ຫ້ອງການ:</span></label>
        <div class="address-grid-custom mt-1">
          <div class="input-sub">
            <span class="font-bold">ບ້ານ:</span>
            <input v-model="data.address.village" type="text" :readonly="!isEditing"
              class="input input-sm input-bordered w-full" placeholder="ບ້ານ"
              :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
          </div>
          <div class="input-sub">
            <span class="font-bold">ເມືອງ:</span>
            <select v-model="data.address.district_id" :disabled="!isEditing || !data.address.province_id"
              @change="handleDistrictChange" 
              class="select-addr select-sm select-bordered w-full"
              :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'">
              <option value="">-- ເລືອກເມືອງ --</option>
              <option v-for="d in localDistricts" :key="d.district_id" :value="d.district_id">{{ d.district_name }}</option>
            </select>
          </div>
          <div class="input-sub">
            <span class="font-bold">ແຂວງ:</span>
            <select v-model="data.address.province_id" :disabled="!isEditing"
              class="select-addr select-sm select-bordered w-full"
              :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'">
              <option value="">-- ເລືອກແຂວງ --</option>
              <option v-for="p in addressStore.provinces" :key="p.province_id" :value="p.province_id">{{ p.province_name }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ປີການເຮັດວຽກ:</span></label>
        <input v-model.number="data.workYears" type="number" :readonly="!isEditing" min="0"
          class="input input-sm input-bordered w-full"
          :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
      </div>
      
      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ເບີໂທບ່ອນເຮັດວຽກ:</span></label>
        <input v-model="data.phone" type="tel" :readonly="!isEditing"
          class="input input-sm input-bordered w-full"
          :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
      </div>
      
      <div class="form-control lg:col-span-2">
        <label class="label"><span class="label-text font-bold">ຕຳແໜ່ງ:</span></label>
        <input v-model="data.position" type="text" :readonly="!isEditing"
          class="input input-sm input-bordered w-full"
          :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
      </div>
      
      <div class="form-control lg:col-span-2">
        <label class="label"><span class="label-text font-bold">ເງິນເດືອນ/ລາຍຮັບຕໍ່ເດືອນ (ກີບ):</span></label>
        <input :value="formatCurrencyInput(data.salary)" @input="handleCurrencyInput('salary', $event)" type="text"
          :readonly="!isEditing" 
          class="input input-sm input-bordered w-full"
          :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
      </div>
      
      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ມື້ເງິນເດືອນອອກ (ວັນທີ):</span></label>
        <input v-model.number="data.salaryDay" type="number" min="1" max="31" :readonly="!isEditing"
          class="input input-sm input-bordered w-full"
          :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
      </div>
      
      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ພະນັກງານທັງໝົດຈຳນວນ:</span></label>
        <input v-model.number="data.totalEmployees" type="number" :readonly="!isEditing" min="0"
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

const props = defineProps<{
  data: any,
  hasGuarantor: boolean,
  hasReference: boolean,
  isEditing: boolean
}>()

const addressStore = useAddressStore()

// ເກັບໄວ້ເພື່ອບໍ່ໃຫ້ Component ແມ່ (Parent) error ເວລາດຶງ ref ໄປໃຊ້
const errors = ref<Record<string, string>>({})

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

const handleCurrencyInput = (field: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  const rawValue = target.value.replace(/,/g, '').replace(/[^\d]/g, '');
  const numericValue = parseInt(rawValue, 10);
  if (!isNaN(numericValue) && rawValue !== '') {
    props.data[field] = numericValue;
  } else {
    props.data[field] = null;
  }
  target.value = formatCurrencyInput(props.data[field]);
};

// ==========================================
// 🟢 Main Form Validation Function
// ==========================================
const validateForm = (): boolean => {
  errors.value = {}; 
  // ສົ່ງຄ່າ true ສະເໝີ ເພາະບໍ່ຈຳເປັນຕ້ອງ Validate ໜ້ານີ້ແລ້ວ
  return true;
};

// 🟢 Expose ຟັງຊັນອອກໄປໃຫ້ Parent Component ເອີ້ນໃຊ້ໄດ້
defineExpose({
  validateForm,
  errors
});
</script>