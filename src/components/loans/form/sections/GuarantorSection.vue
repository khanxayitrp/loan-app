<template>
  <section class="form-section">
    <h3 class="section-title flex items-center gap-4 flex-wrap">
      V. ຂໍ້ມູນສ່ວນຕົວຂອງ
      <label class="cursor-pointer flex items-center gap-2 text-sm font-normal bg-gray-100 px-2 py-1 rounded">
        <input type="checkbox" :checked="hasGuarantor" @change="$emit('update:hasGuarantor', !hasGuarantor)" :disabled="!isEditing" class="checkbox checkbox-sm" />
        ຜູ້ຄ້ຳປະກັນ
      </label>
      <label class="cursor-pointer flex items-center gap-2 text-sm font-normal bg-gray-100 px-2 py-1 rounded">
        <input type="checkbox" :checked="hasReference" @change="$emit('update:hasReference', !hasReference)" :disabled="!isEditing" class="checkbox checkbox-sm" />
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
            <label class="label"><span class="label-text font-bold">ຊື່ ແລະ ນາມສະກຸນ:</span></label>
            <input v-model="data.fullname" type="text" :readonly="!isEditing" class="input input-sm input-bordered w-full bg-white" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text font-bold">ວັນເດືອນປີເກີດ:</span></label>
            <input v-model="data.dob" type="date" :readonly="!isEditing" class="input input-sm input-bordered w-full bg-white" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text font-bold">ອາຍຸ:</span></label>
            <div class="join w-full">
              <input v-model.number="data.age" type="number" :readonly="!isEditing" class="input input-sm input-bordered w-full bg-white join-item" />
              <span class="btn btn-sm btn-disabled join-item">ປີ</span>
            </div>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text font-bold">ເບີໂທລະສັບມືຖື:</span></label>
            <input v-model="data.phone" type="tel" :readonly="!isEditing" class="input input-sm input-bordered w-full bg-white" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text font-bold">ເພດ:</span></label>
            <select v-model="data.gender" :disabled="!isEditing" class="select select-sm select-bordered w-full bg-white">
              <option value="">ເລືອກ</option>
              <option value="male">ຊາຍ</option>
              <option value="female">ຍິງ</option>
            </select>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text font-bold">ສະຖານະພາບ:</span></label>
            <select v-model="data.maritalStatus" :disabled="!isEditing" class="select select-sm select-bordered w-full bg-white">
              <option value="">ເລືອກ</option>
              <option value="single">ໂສດ</option>
              <option value="married">ແຕ່ງງານແລ້ວ</option>
              <option value="divorced">ຢ່າຮ້າງ</option>
            </select>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text font-bold">ອາຊີບ:</span></label>
            <input v-model="data.occupation" type="text" :readonly="!isEditing" class="input input-sm input-bordered w-full bg-white" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text font-bold">ສາຍພົວພັນ:</span></label>
            <input v-model="data.relationship" type="text" :readonly="!isEditing" class="input input-sm input-bordered w-full bg-white" />
          </div>
        </div>
      </div>

      <div class="mb-5 bg-slate-50 p-5 rounded-xl border border-slate-200">
        <h4 class="font-bold text-primary mb-4 flex items-center gap-2">
          <span class="icon-[tabler--id] size-5"></span> ເອກະສານຢັ້ງຢືນຕົວຕົນ
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="form-control">
            <label class="label"><span class="label-text font-bold">ບັດປະຈຳຕົວ/Passport:</span></label>
            <input v-model="data.idCard" type="text" :readonly="!isEditing" class="input input-sm input-bordered w-full bg-white" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text font-bold">ວັນເດືອນປີອອກ:</span></label>
            <input v-model="data.idCardIssueDate" type="date" :readonly="!isEditing" class="input input-sm input-bordered w-full bg-white" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text font-bold">ປຶ້ມສຳມະໂນຄົວ ເລກທີ:</span></label>
            <input v-model="data.censusBook" type="text" :readonly="!isEditing" class="input input-sm input-bordered w-full bg-white" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text font-bold">ວັນເດືອນປີອອກ:</span></label>
            <input v-model="data.censusBookIssueDate" type="date" :readonly="!isEditing" class="input input-sm input-bordered w-full bg-white" />
          </div>
          <div class="form-control md:col-span-2 lg:col-span-4">
            <label class="label"><span class="label-text font-bold">ສະຖານທີ່ອອກເອກະສານ:</span></label>
            <input v-model="data.censusAuthorizeBy" type="text" :readonly="!isEditing" class="input input-sm input-bordered w-full bg-white" />
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
            <input v-model="data.houseNumber" type="text" :readonly="!isEditing" class="input input-sm input-bordered w-full bg-white" />
          </div>
          <div>
            <label class="label"><span class="label-text font-bold">ໜ່ວຍ:</span></label>
            <input v-model="data.unit" type="text" :readonly="!isEditing" class="input input-sm input-bordered w-full bg-white" />
          </div>
          
          <div class="md:col-span-4">
            <div class="address-grid-custom mt-1">
              <div class="input-sub">
                <span class="font-bold">ບ້ານ:</span>
                <input v-model="data.address.village" type="text" :readonly="!isEditing" class="input input-sm input-bordered w-full bg-white" placeholder="ບ້ານ" />
              </div>
              <div class="input-sub">
                <span class="font-bold">ແຂວງ:</span>
                <select v-model="data.address.province_id" :disabled="!isEditing" class="select-addr select-sm select-bordered w-full bg-white">
                  <option value="">-- ເລືອກແຂວງ --</option>
                  <option v-for="p in addressStore.provinces" :key="p.province_id" :value="p.province_id">{{ p.province_name }}</option>
                </select>
              </div>
              <div class="input-sub">
                <span class="font-bold">ເມືອງ:</span>
                <select v-model="data.address.district_id" :disabled="!isEditing || !data.address.province_id" 
                        @change="handleDistrictChange" class="select-addr select-sm select-bordered w-full bg-white">
                  <option value="">-- ເລືອກເມືອງ --</option>
                  <option v-for="d in addressStore.districts" :key="d.district_id" :value="d.district_id">{{ d.district_name }}</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label class="label"><span class="label-text font-bold">ຈຳນວນປີທີ່ອາໄສ:</span></label>
            <div class="join w-full">
              <input v-model.number="data.residenceYears" type="number" :readonly="!isEditing" class="input input-sm input-bordered w-full bg-white join-item" />
              <span class="btn btn-sm btn-disabled join-item">ປີ</span>
            </div>
          </div>
          <div class="md:col-span-2">
            <label class="label"><span class="label-text font-bold">ອາໄສຢູ່ກັບ:</span></label>
            <input v-model="data.liveWith" type="text" :readonly="!isEditing" class="input input-sm input-bordered w-full bg-white" />
          </div>
          <div>
            <label class="label"><span class="label-text font-bold">ສະຖານະການຢູ່ອາໄສ:</span></label>
            <select v-model="data.residenceStatus" :disabled="!isEditing" class="select select-sm select-bordered w-full bg-white">
              <option value="">ເລືອກ</option>
              <option value="own">ເຮືອນຕົວເອງ</option>
              <option value="rent">ເຊົ່າ</option>
              <option value="family">ຢູ່ກັບຄອບຄົວ</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useAddressStore } from '@/stores/address'

const props = defineProps<{
  data: any,
  hasGuarantor: boolean,
  hasReference: boolean,
  isEditing: boolean
}>()

const emit = defineEmits(['update:hasGuarantor', 'update:hasReference'])
const addressStore = useAddressStore()

const handleDistrictChange = () => {
  const d = addressStore.districts.find(x => x.district_id === props.data.address.district_id);
  if (d) props.data.address.district = d.district_name;
};

watch(() => props.data.address.province_id, async (newVal) => {
  if (props.isEditing) {
    props.data.address.district_id = '';
    props.data.address.district = '';
    const p = addressStore.provinces.find(x => x.province_id === newVal);
    props.data.address.province = p ? p.province_name : '';
    if (newVal) await addressStore.fetchDistricts(newVal);
  }
});
</script>