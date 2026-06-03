<template>
  <section class="form-section">
    <div class="flex justify-between items-center mb-4 border-b-2 border-e5e7eb pb-2">
      <h3 class="section-title mb-0 border-none pb-0">III. ຕາຕະລາງລາຍລະອຽດຂອງສິນຄ້າກູ້</h3>
      <button v-if="hasConflict && isEditing" @click="$emit('sync')" type="button" class="btn btn-warning btn-sm gap-1">
        <span class="icon-[tabler--refresh] size-4"></span>
        ອັບເດດຂໍ້ມູນຕາມໃບຄຳຂໍ
      </button>
    </div>

    <slot name="warnings"></slot>

    <input type="hidden" v-model="data.variantId" />

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="form-control lg:col-span-2">
        <label class="label"><span class="label-text font-bold">ລາຍລະອຽດສິນຄ້າ: <span class="text-error">*</span></span></label>
        <input v-model="data.description" type="text" :readonly="!isEditing"
          class="input input-sm input-bordered w-full"
          :class="[isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed', errors.description ? 'input-error' : '']"
          @input="errors.description = ''" />
        <label v-if="errors.description" class="label p-0 pt-1">
          <span class="label-text-alt text-error flex items-center gap-1"><span class="icon-[tabler--alert-circle] size-4"></span> {{ errors.description }}</span>
        </label>
      </div>

      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ປະເພດສິນຄ້າ: <span class="text-error">*</span></span></label>
        <select v-model="data.type" :disabled="!isEditing" 
          class="select select-sm select-bordered w-full"
          :class="[isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed', errors.type ? 'select-error' : '']"
          @change="errors.type = ''">
          <option value="">ເລືອກ</option>
          <option value="ສິນຄ້າຄຳ">ສິນຄ້າຄຳ</option>
          <option value="ສິນຄ້າທົ່ວໄປ">ສິນຄ້າທົ່ວໄປ</option>
          <option value="ສິນຄ້າລົດຈັກ">ສິນຄ້າລົດຈັກ</option>
        </select>
        <label v-if="errors.type" class="label p-0 pt-1">
          <span class="label-text-alt text-error flex items-center gap-1"><span class="icon-[tabler--alert-circle] size-4"></span> {{ errors.type }}</span>
        </label>
      </div>

      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ຍີ່ຫໍ້ສິນຄ້າ:</span></label>
        <input v-model="data.brand" type="text" :readonly="!isEditing" 
          class="input input-sm input-bordered w-full"
          :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
      </div>

      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ລຸ້ນສິນຄ້າ:</span></label>
        <input v-model="data.model" type="text" :readonly="!isEditing" 
          class="input input-sm input-bordered w-full"
          :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
      </div>

      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ສີສິນຄ້າ:</span></label>
        <input v-model="data.productColor" type="text" :readonly="!isEditing" 
          class="input input-sm input-bordered w-full"
          :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
      </div>
      
      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ຂະໜາດ:</span></label>
        <input v-model="data.productSize" type="text" :readonly="!isEditing" 
          class="input input-sm input-bordered w-full"
          :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
      </div>
      
      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ລາຄາສິນຄ້າ (ກີບ): <span class="text-error">*</span></span></label>
        <input :value="formatCurrencyInput(data.price)" @input="handleCurrencyInput('price', $event); errors.price = ''" type="text"
          :readonly="!isEditing" 
          class="input input-sm input-bordered w-full"
          :class="[isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed', errors.price ? 'input-error' : '']" />
        <label v-if="errors.price" class="label p-0 pt-1">
          <span class="label-text-alt text-error flex items-center gap-1"><span class="icon-[tabler--alert-circle] size-4"></span> {{ errors.price }}</span>
        </label>
      </div>

      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ເງິນວາງດາວ (ກີບ):</span></label>
        <input :value="formatCurrencyInput(data.downPayment)" @input="handleCurrencyInput('downPayment', $event); errors.downPayment = ''"
          type="text" :readonly="!isEditing" 
          class="input input-sm input-bordered w-full"
          :class="[isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed', errors.downPayment ? 'input-error' : '']" />
        <label v-if="errors.downPayment" class="label p-0 pt-1">
          <span class="label-text-alt text-error flex items-center gap-1"><span class="icon-[tabler--alert-circle] size-4"></span> {{ errors.downPayment }}</span>
        </label>
      </div>
      
      <div class="grid-span-1 form-control">
        <label class="label"><span class="label-text font-bold text-primary">ວົງເງິນອະນຸມັດ (ກີບ):</span></label>
        <input :value="formatPrice(data.approvedAmount)" type="text" readonly
          class="input input-sm input-bordered w-full bg-blue-50 text-blue-700 font-bold" />
      </div>
      
      <div class="form-control">
        <label class="label">
          <span class="label-text font-bold">
            ອັດຕາດອກເບ້ຍ (%)
            <span class="text-primary font-normal ml-1">{{ data.interestRateType === 'yearly' ? '(ຕໍ່ປີ)' : '(ຕໍ່ເດືອນ)' }}</span>: <span class="text-error">*</span>
          </span>
        </label>
        <input v-model.number="data.interestRate" type="number" step="0.01" :readonly="!isEditing"
          @input="$emit('recalculate'); errors.interestRate = ''" 
          class="input input-sm input-bordered w-full"
          :class="[isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed', errors.interestRate ? 'input-error' : '']" />
        <label v-if="errors.interestRate" class="label p-0 pt-1">
          <span class="label-text-alt text-error flex items-center gap-1"><span class="icon-[tabler--alert-circle] size-4"></span> {{ errors.interestRate }}</span>
        </label>
      </div>

      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ຈຳນວນງວດທີ່ກູ້ (ເດືອນ): <span class="text-error">*</span></span></label>
        <input v-model.number="data.loanTerm" type="number" :readonly="!isEditing" 
          @input="$emit('recalculate'); errors.loanTerm = ''"
          class="input input-sm input-bordered w-full"
          :class="[isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed', errors.loanTerm ? 'input-error' : '']" />
        <label v-if="errors.loanTerm" class="label p-0 pt-1">
          <span class="label-text-alt text-error flex items-center gap-1"><span class="icon-[tabler--alert-circle] size-4"></span> {{ errors.loanTerm }}</span>
        </label>
      </div>
      
      <div class="form-control">
        <label class="label"><span class="label-text font-bold text-primary">ຈຳນວນດອກເບ້ຍທັງໝົດ (ກີບ):</span></label>
        <input :value="formatPrice(data.totalInterest)" type="text" readonly
          class="input input-sm input-bordered w-full bg-blue-50 text-blue-700 font-bold" />
      </div>
      
      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ຄ່າທຳນຽມ CIB/ອື່ນໆ (ກີບ):</span></label>
        <input :value="formatCurrencyInput(data.fee)" @input="handleCurrencyInput('fee', $event)" type="text"
          :readonly="!isEditing" 
          class="input input-sm input-bordered w-full"
          :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
      </div>

      <div class="form-control">
        <label class="label"><span class="label-text font-bold text-primary">ຄ່າງວດລາຍເດືອນ (ກີບ):</span></label>
        <input :value="formatPrice(data.monthlyPayment)" type="text" readonly
          class="input input-sm input-bordered w-full bg-blue-50 text-blue-700 font-bold" />
      </div>
      
      <div class="form-control">
        <label class="label"><span class="label-text font-bold text-primary">ຄ່າງວດເດືອນທຳອິດ (+ຄ່າທຳນຽມ):</span></label>
        <input :value="formatPrice(data.firstInstallment)" type="text" readonly
          class="input input-sm input-bordered w-full bg-blue-50 text-blue-700 font-bold" />
      </div>
      
      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ມື້ກຳນົດການຊຳລະ (ທຸກວັນທີ): <span class="text-error">*</span></span></label>
        <input v-model.number="data.paymentDay" type="number" min="1" max="31" :readonly="!isEditing"
          class="input input-sm input-bordered w-full"
          :class="[isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed', errors.paymentDay ? 'input-error' : '']"
          @input="errors.paymentDay = ''" />
        <label v-if="errors.paymentDay" class="label p-0 pt-1">
          <span class="label-text-alt text-error flex items-center gap-1"><span class="icon-[tabler--alert-circle] size-4"></span> {{ errors.paymentDay }}</span>
        </label>
      </div>

      <template v-if="data.type === 'ສິນຄ້າລົດຈັກ'">
        <div class="form-control">
          <label class="label"><span class="label-text font-bold">ເລກຈັກ (ລົດຈັກ): <span class="text-error">*</span></span></label>
          <input v-model="data.motorcycle.motorId" type="text" :readonly="!isEditing"
            class="input input-sm input-bordered w-full"
            :class="[isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed', errors.motorId ? 'input-error' : '']"
            @input="errors.motorId = ''" />
          <label v-if="errors.motorId" class="label p-0 pt-1">
            <span class="label-text-alt text-error flex items-center gap-1"><span class="icon-[tabler--alert-circle] size-4"></span> {{ errors.motorId }}</span>
          </label>
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text font-bold">ສີລົດ (ລົດຈັກ):</span></label>
          <input v-model="data.motorcycle.motorColor" type="text" :readonly="!isEditing"
            class="input input-sm input-bordered w-full"
            :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text font-bold">ເລກຖັງ (ລົດຈັກ): <span class="text-error">*</span></span></label>
          <input v-model="data.motorcycle.tankNumber" type="text" :readonly="!isEditing"
            class="input input-sm input-bordered w-full"
            :class="[isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed', errors.tankNumber ? 'input-error' : '']"
            @input="errors.tankNumber = ''" />
          <label v-if="errors.tankNumber" class="label p-0 pt-1">
            <span class="label-text-alt text-error flex items-center gap-1"><span class="icon-[tabler--alert-circle] size-4"></span> {{ errors.tankNumber }}</span>
          </label>
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text font-bold">ໄລຍະຮັບປະກັນລົດ (ເດືອນ):</span></label>
          <input v-model.number="data.motorcycle.motorWarranty" type="number" :readonly="!isEditing"
            class="input input-sm input-bordered w-full"
            :class="isEditing ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'" />
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { formatPrice, formatCurrencyInput } from '@/utils/formatters'

const props = defineProps<{
  data: any,
  productType: any,
  isEditing: boolean,
  hasConflict: boolean
}>()

const emit = defineEmits(['recalculate', 'sync'])

// 🟢 ປະກາດຕົວແປສຳລັບເກັບ Error ຂອງແຕ່ລະ Field
const errors = ref<Record<string, string>>({})

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
  emit('recalculate');
};

// ==========================================
// 🟢 Main Form Validation Function
// ==========================================
const validateForm = (): boolean => {
  errors.value = {}; // Reset errors
  let isValid = true;

  if (!props.data.description?.trim()) { errors.value.description = 'ກະລຸນາປ້ອນລາຍລະອຽດສິນຄ້າ'; isValid = false; }
  if (!props.data.type) { errors.value.type = 'ກະລຸນາເລືອກປະເພດສິນຄ້າ'; isValid = false; }
  
  if (!props.data.price || props.data.price <= 0) { errors.value.price = 'ກະລຸນາປ້ອນລາຄາສິນຄ້າທີ່ຖືກຕ້ອງ'; isValid = false; }
  
  if (props.data.downPayment !== null && props.data.downPayment !== undefined && props.data.downPayment !== '') {
    if (props.data.downPayment < 0) {
      errors.value.downPayment = 'ເງິນດາວຕ້ອງບໍ່ຫຼຸດ 0'; 
      isValid = false;
    } else if (props.data.downPayment > props.data.price) {
      errors.value.downPayment = 'ເງິນດາວບໍ່ສາມາດຫຼາຍກວ່າລາຄາສິນຄ້າໄດ້'; 
      isValid = false;
    }
  }

  if (props.data.interestRate === null || props.data.interestRate === undefined || props.data.interestRate === '') { 
    errors.value.interestRate = 'ກະລຸນາປ້ອນອັດຕາດອກເບ້ຍ'; 
    isValid = false; 
  } else if (props.data.interestRate < 0) {
    errors.value.interestRate = 'ດອກເບ້ຍຕ້ອງບໍ່ຫຼຸດ 0'; 
    isValid = false; 
  }

  if (!props.data.loanTerm || props.data.loanTerm <= 0) { errors.value.loanTerm = 'ກະລຸນາປ້ອນຈຳນວນງວດ'; isValid = false; }
  
  if (!props.data.paymentDay) { 
    errors.value.paymentDay = 'ກະລຸນາປ້ອນມື້ຊຳລະ'; 
    isValid = false; 
  } else if (props.data.paymentDay < 1 || props.data.paymentDay > 31) {
    errors.value.paymentDay = 'ວັນທີຕ້ອງຢູ່ລະຫວ່າງ 1-31'; 
    isValid = false; 
  }

  // ຖ້າເປັນສິນຄ້າລົດຈັກ ຕ້ອງບັງຄັບໃສ່ເລກຈັກ ແລະ ເລກຖັງ
  if (props.data.type === 'ສິນຄ້າລົດຈັກ') {
    if (!props.data.motorcycle?.motorId?.trim()) { errors.value.motorId = 'ກະລຸນາປ້ອນເລກຈັກ'; isValid = false; }
    if (!props.data.motorcycle?.tankNumber?.trim()) { errors.value.tankNumber = 'ກະລຸນາປ້ອນເລກຖັງ'; isValid = false; }
  }

  return isValid;
};

// 🟢 Expose ຟັງຊັນອອກໄປໃຫ້ Parent Component ເອີ້ນໃຊ້ໄດ້
defineExpose({
  validateForm,
  errors
});
</script>