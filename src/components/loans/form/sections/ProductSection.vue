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

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="form-control lg:col-span-2">
        <label class="label"><span class="label-text font-bold">ລາຍລະອຽດສິນຄ້າ:</span></label>
        <input v-model="data.description" type="text" :readonly="!isEditing"
          class="input input-sm input-bordered w-full" />
      </div>
      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ປະເພດສິນຄ້າ:</span></label>
        <select v-model="data.type" :disabled="!isEditing" class="select select-sm select-bordered w-full">
          <option value="">ເລືອກ</option>
          <option value="ສິນຄ້າຄຳ">ສິນຄ້າຄຳ</option>
          <option value="ສິນຄ້າທົ່ວໄປ">ສິນຄ້າທົ່ວໄປ</option>
          <option value="ສິນຄ້າລົດຈັກ">ສິນຄ້າລົດຈັກ</option>
        </select>
      </div>

      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ຍີ່ຫໍ້ສິນຄ້າ:</span></label>
        <input v-model="data.brand" type="text" :readonly="!isEditing" class="input input-sm input-bordered w-full" />
      </div>
      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ລຸ້ນສິນຄ້າ:</span></label>
        <input v-model="data.model" type="text" :readonly="!isEditing" class="input input-sm input-bordered w-full" />
      </div>
      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ລາຄາສິນຄ້າ (ກີບ):</span></label>
        <input :value="formatCurrencyInput(data.price)" @input="handleCurrencyInput('price', $event)" type="text"
          :readonly="!isEditing" class="input input-sm input-bordered w-full" />
      </div>

      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ເງິນວາງດາວ (ກີບ):</span></label>
        <input :value="formatCurrencyInput(data.downPayment)" @input="handleCurrencyInput('downPayment', $event)"
          type="text" :readonly="!isEditing" class="input input-sm input-bordered w-full" />
      </div>
      <div class="form-control">
        <label class="label"><span class="label-text font-bold text-primary">ວົງເງິນອະນຸມັດ (ກີບ):</span></label>
        <input :value="formatPrice(data.approvedAmount)" type="text" readonly
          class="input input-sm input-bordered w-full bg-blue-50 text-blue-700 font-bold" />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text font-bold">
            ອັດຕາດອກເບ້ຍ (%)
            <span class="text-primary font-normal ml-1">{{ data.interestRateType === 'yearly' ? '(ຕໍ່ປີ)' : '(ຕໍ່ເດືອນ)'
              }}</span>:
          </span>
        </label>
        <input v-model.number="data.interestRate" type="number" step="0.01" :readonly="!isEditing"
          @input="$emit('recalculate')" class="input input-sm input-bordered w-full" />
      </div>

      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ຈຳນວນງວດທີ່ກູ້ (ເດືອນ):</span></label>
        <input v-model.number="data.loanTerm" type="number" :readonly="!isEditing" @input="$emit('recalculate')"
          class="input input-sm input-bordered w-full" />
      </div>
      <div class="form-control">
        <label class="label"><span class="label-text font-bold text-primary">ຈຳນວນດອກເບ້ຍທັງໝົດ (ກີບ):</span></label>
        <input :value="formatPrice(data.totalInterest)" type="text" readonly
          class="input input-sm input-bordered w-full bg-blue-50 text-blue-700 font-bold" />
      </div>
      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ຄ່າທຳນຽມ CIB/ອື່ນໆ (ກີບ):</span></label>
        <input :value="formatCurrencyInput(data.fee)" @input="handleCurrencyInput('fee', $event)" type="text"
          :readonly="!isEditing" class="input input-sm input-bordered w-full" />
      </div>

      <div class="form-control">
        <label class="label"><span class="label-text font-bold text-primary">ຄ່າງວດລາຍເດືອນ (ກີບ):</span></label>
        <input :value="formatPrice(data.monthlyPayment)" type="text" readonly
          class="input input-sm input-bordered w-full bg-blue-50 text-blue-700 font-bold" />
      </div>
      <div class="form-control">
        <label class="label"><span class="label-text font-bold text-primary">ຄ່າງວດເດືອນທຳອິດ
            (+ຄ່າທຳນຽມ):</span></label>
        <input :value="formatPrice(data.firstInstallment)" type="text" readonly
          class="input input-sm input-bordered w-full bg-blue-50 text-blue-700 font-bold" />
      </div>
      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ມື້ກຳນົດການຊຳລະ (ທຸກວັນທີ):</span></label>
        <input v-model.number="data.paymentDay" type="number" min="1" max="31" :readonly="!isEditing"
          class="input input-sm input-bordered w-full" />
      </div>

      <template v-if="productType.motorcycle">
        <div class="form-control">
          <label class="label"><span class="label-text font-bold">ເລກຈັກ (ລົດຈັກ):</span></label>
          <input v-model="data.motorcycle.motorId" type="text" :readonly="!isEditing"
            class="input input-sm input-bordered w-full" />
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text font-bold">ສີລົດ (ລົດຈັກ):</span></label>
          <input v-model="data.motorcycle.motorColor" type="text" :readonly="!isEditing"
            class="input input-sm input-bordered w-full" />
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text font-bold">ເລກຖັງ (ລົດຈັກ):</span></label>
          <input v-model="data.motorcycle.tankNumber" type="text" :readonly="!isEditing"
            class="input input-sm input-bordered w-full" />
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text font-bold">ໄລຍະຮັບປະກັນລົດ (ເດືອນ):</span></label>
          <input v-model.number="data.motorcycle.motorWarranty" type="number" :readonly="!isEditing"
            class="input input-sm input-bordered w-full" />
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { formatPrice, formatCurrencyInput } from '@/utils/formatters'

const props = defineProps<{
  data: any,
  productType: any,
  isEditing: boolean,
  hasConflict: boolean
}>()

const emit = defineEmits(['recalculate', 'sync'])

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
</script>
