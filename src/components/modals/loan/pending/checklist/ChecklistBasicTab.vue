<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="space-y-6 animate-in fade-in">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="border rounded-lg p-4 bg-white dark:bg-base-100 shadow-sm">
        <h4 class="font-bold border-b pb-2 mb-4">ສ່ວນທີ 1: ການຢືນຢັນຂໍ້ມູນລູກຄ້າ ແລະ ສິນເຊື່ອ</h4>
        <div class="space-y-3">
          <div class="form-control">
            <label class="label"><span class="label-text">ວິທີການຕິດຕໍ່ລູກຄ້າ</span></label>
            <select v-model="formBasic.cus_contact_method" class="select select-bordered select-sm" :disabled="!canEdit">
              <option value="face_to_face">ພົບຕໍ່ໜ້າ (Face to Face)</option>
              <option value="phone">ທາງໂທລະສັບ (Phone)</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="form-control">
              <label class="label"><span class="label-text">ຊື່ (ຢືນຢັນແລ້ວ)</span></label>
              <input v-model="formBasic.verified_first_name" type="text" class="input input-bordered input-sm" :disabled="!canEdit" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">ນາມສະກຸນ (ຢືນຢັນແລ້ວ)</span></label>
              <input v-model="formBasic.verified_last_name" type="text" class="input input-bordered input-sm" :disabled="!canEdit" />
            </div>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">ວັນເດືອນປີເກີດ</span></label>
            <input v-model="formBasic.verified_dob" type="date" class="input input-bordered input-sm" :disabled="!canEdit" />
          </div>

          <div class="border p-3 rounded-lg bg-gray-50 dark:bg-base-200">
            <label class="label p-0 mb-2"><span class="label-text font-bold">ທີ່ຢູ່ປັດຈຸບັນ (ຢືນຢັນແລ້ວ)</span></label>
            <div class="form-control mb-2">
              <label class="label pt-0"><span class="label-text text-xs">ບ້ານ / ລາຍລະອຽດເຮືອນ</span></label>
              <input v-model="formBasic.verified_village" type="text" placeholder="ປ້ອນຊື່ບ້ານ, ໜ່ວຍ, ເຮືອນເລກທີ..." class="input input-bordered input-sm w-full" :disabled="!canEdit" />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div class="form-control">
                <label class="label pt-0"><span class="label-text text-xs">ແຂວງ</span></label>
                <select v-model="formBasic.verified_province_id" class="select select-bordered select-sm w-full" :disabled="!canEdit">
                  <option value="">-- ເລືອກແຂວງ --</option>
                  <option v-for="p in provinces" :key="p.province_id" :value="p.province_id">{{ p.province_name }}</option>
                </select>
              </div>
              <div class="form-control">
                <label class="label pt-0"><span class="label-text text-xs">ເມືອງ</span></label>
                <select v-model="formBasic.verified_district_id" :disabled="!formBasic.verified_province_id || !canEdit" class="select select-bordered select-sm w-full">
                  <option value="">-- ເລືອກເມືອງ --</option>
                  <option v-for="d in localDistricts" :key="d.district_id" :value="d.district_id">{{ d.district_name }}</option>
                </select>
              </div>
            </div>
          </div>
          <div class="divider my-1"></div>
          <div class="form-control">
            <label class="label"><span class="label-text text-primary font-bold">ປະເພດສິນຄ້າ (ຢືນຢັນແລ້ວ)</span></label>
            <input v-model="formBasic.verified_product_type" type="text" class="input input-bordered input-sm border-primary" placeholder="ເຊັ່ນ: ລົດຈັກ, ໂທລະສັບ..." :disabled="!canEdit" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="form-control">
              <label class="label"><span class="label-text">ລາຄາສິນຄ້າຈິງ (ກີບ)</span></label>
              <input :value="formatPrice(Number(formBasic.verified_price) || 0)" type="text"
                @focus="handleNumberFocus($event, Number(formBasic.verified_price) || 0)"
                @input="updateBasicNumberField('verified_price', $event)"
                @blur="handleNumberBlur($event, Number(formBasic.verified_price) || 0)"
                class="input input-bordered input-sm text-right" :disabled="!canEdit" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">ເງິນວາງດາວ (ກີບ)</span></label>
              <input :value="formatPrice(Number(formBasic.verified_down_payment) || 0)" type="text"
                @focus="handleNumberFocus($event, Number(formBasic.verified_down_payment) || 0)"
                @input="updateBasicNumberField('verified_down_payment', $event)"
                @blur="handleNumberBlur($event, Number(formBasic.verified_down_payment) || 0)"
                class="input input-bordered input-sm text-right" :disabled="!canEdit" />
            </div>
          </div>

          <div class="form-control">
            <label class="label"><span class="label-text text-success font-bold">ຄ່າງວດທີ່ແຈ້ງລູກຄ້າ (ກີບ)</span></label>
            <input :value="formatPrice(Number(formBasic.verified_monthly_pay) || 0)" type="text"
              @focus="handleNumberFocus($event, Number(formBasic.verified_monthly_pay) || 0)"
              @input="updateBasicNumberField('verified_monthly_pay', $event)"
              @blur="handleNumberBlur($event, Number(formBasic.verified_monthly_pay) || 0)"
              class="input input-bordered input-sm text-right text-success font-bold" :disabled="!canEdit" />
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="border rounded-lg p-4 bg-white dark:bg-base-100 shadow-sm">
          <h4 class="font-bold border-b pb-2 mb-4">ສ່ວນທີ 2: ເອກະສານປະກອບ</h4>
          <div class="flex flex-col gap-2">
            <label class="cursor-pointer label justify-start gap-3">
              <input type="checkbox" v-model="formBasic.has_id_card" class="checkbox checkbox-primary checkbox-sm" :disabled="!canEdit" />
              <span>ບັດປະຈຳຕົວ / Passport</span>
            </label>
            <label class="cursor-pointer label justify-start gap-3">
              <input type="checkbox" v-model="formBasic.has_census_book" class="checkbox checkbox-primary checkbox-sm" :disabled="!canEdit" />
              <span>ປຶ້ມສຳມະໂນຄົວ</span>
            </label>
            <label class="cursor-pointer label justify-start gap-3">
              <input type="checkbox" v-model="formBasic.has_income_doc" class="checkbox checkbox-primary checkbox-sm" :disabled="!canEdit" />
              <span>ເອກະສານຢືນຢັນລາຍຮັບ (Statement/ໃບເງິນເດືອນ)</span>
            </label>
            <label class="cursor-pointer label justify-start gap-3">
              <input type="checkbox" v-model="formBasic.has_other_doc" class="checkbox checkbox-primary checkbox-sm" :disabled="!canEdit" />
              <span>ເອກະສານອື່ນໆ</span>
            </label>
            <input v-if="formBasic.has_other_doc" v-model="formBasic.other_doc_detail" type="text" placeholder="ລະບຸເອກະສານອື່ນໆ..." class="input input-bordered input-sm mt-1" :disabled="!canEdit" />
          </div>
          <div class="form-control mt-4">
            <label class="label"><span class="label-text font-bold">ປະເມີນຄວາມໜ້າເຊື່ອຖືຂອງລູກຄ້າ</span></label>
            <select v-model="formBasic.cus_credibility_assessment" class="select select-bordered select-sm" :disabled="!canEdit">
              <option value="reliable">ໜ້າເຊື່ອຖື (Reliable)</option>
              <option value="unreliable">ບໍ່ໜ້າເຊື່ອຖື (Unreliable)</option>
            </select>
          </div>
        </div>

        <div class="border rounded-lg p-4 bg-white dark:bg-base-100 shadow-sm">
          <h4 class="font-bold border-b pb-2 mb-4">ສ່ວນທີ 3: ຂໍ້ມູນທີ່ເຮັດວຽກ (ຈາກການສຳພາດ)</h4>
          <div class="space-y-3">
            <div class="form-control">
              <label class="label"><span class="label-text">ຊື່ບໍລິສັດ/ບ່ອນເຮັດວຽກ</span></label>
              <input v-model="formBasic.work_company_name" type="text" class="input input-bordered input-sm" :disabled="!canEdit" />
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text">ຕຳແໜ່ງ</span></label>
              <input v-model="formBasic.work_position" type="text" class="input input-bordered input-sm" :disabled="!canEdit" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="form-control">
                <label class="label"><span class="label-text">ອາຍຸການ (ປີ)</span></label>
                <input v-model.number="formBasic.work_years" type="number" class="input input-bordered input-sm" :disabled="!canEdit" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text">ອາຍຸການ (ເດືອນ)</span></label>
                <input v-model.number="formBasic.work_months" type="number" class="input input-bordered input-sm" :disabled="!canEdit" />
              </div>
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text">ເງິນເດືອນທີ່ແຈ້ງ (ກີບ)</span></label>
              <input :value="formatPrice(checklistStore.incomeData.work_salary)" type="text"
                @focus="handleNumberFocus($event, checklistStore.incomeData.work_salary)"
                @input="updateNumberField('work_salary', $event)"
                @blur="handleNumberBlur($event, checklistStore.incomeData.work_salary)"
                class="input input-bordered input-sm text-right font-bold" :disabled="!canEdit" />
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ປະເມີນຄວາມໜ້າເຊື່ອຖືຂອງບ່ອນເຮັດວຽກ</span></label>
              <select v-model="formBasic.workplace_assessment" class="select select-bordered select-sm" :disabled="!canEdit">
                <option value="good">ດີ (Good)</option>
                <option value="moderate">ປານກາງ (Moderate)</option>
                <option value="bad">ບໍ່ດີ / ບໍ່ຊັດເຈນ (Bad)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="form-control mt-6 pt-4 border-t border-gray-300">
      <label class="label"><span class="label-text font-bold text-primary">ສະຖານະການກວດສອບ (Verification Status)</span></label>
      <div class="flex items-center gap-4">
        <select v-model="formBasic.status" class="select select-bordered select-primary w-full max-w-xs font-bold" :disabled="!canEdit">
          <option value="draft">ບັນທຶກຮ່າງ (Draft)</option>
          <option value="completed">ກວດສອບສຳເລັດ (Completed)</option>
        </select>
        <span v-if="formBasic.status === 'completed'" class="text-success flex items-center gap-1">
          <span class="icon-[tabler--circle-check-filled] size-5"></span> ພ້ອມສຳລັບຂັ້ນຕອນຕໍ່ໄປ
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatPrice } from '@/utils/formatters';
import { useChecklistStore } from '@/stores/checklist';
import { useAddressCascade } from '@/composables/useAddressCascade';
import type { SectionAddressData } from '@/types/loanFormSections';

const props = defineProps<{
  formBasic: Record<string, unknown>;
  canEdit: boolean;
}>();

const checklistStore = useChecklistStore();

const addressRef = computed<SectionAddressData>({
  get: () => ({
    province_id: props.formBasic.verified_province_id as string | number,
    province: props.formBasic.verified_province as string,
    district_id: props.formBasic.verified_district_id as string | number,
    district: props.formBasic.verified_district as string,
    village: props.formBasic.verified_village as string
  }),
  set: (val) => {
    if (val) {
      /* eslint-disable vue/no-mutating-props */
      props.formBasic.verified_province_id = val.province_id;
      props.formBasic.verified_district_id = val.district_id;
      props.formBasic.verified_village = val.village;
      /* eslint-enable vue/no-mutating-props */
    }
  }
});

const { provinces, localDistricts } = useAddressCascade(addressRef, computed(() => props.canEdit));

const parseNumberStr = (val: string) => {
  if (!val) return 0;
  const parsed = parseFloat(val.replace(/[^0-9.-]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};

const handleNumberFocus = (e: Event, val: number) => {
  const target = e.target as HTMLInputElement;
  if (target) target.value = val ? String(val) : '';
};

const handleNumberBlur = (e: Event, val: number) => {
  const target = e.target as HTMLInputElement;
  if (target) target.value = formatPrice(val);
};

const updateNumberField = (field: keyof typeof checklistStore.incomeData, e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target) {
    checklistStore.incomeData[field] = parseNumberStr(target.value);
  }
};

const updateBasicNumberField = (field: string, e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target) {
    /* eslint-disable vue/no-mutating-props */
    props.formBasic[field] = parseNumberStr(target.value);
    /* eslint-enable vue/no-mutating-props */
  }
};
</script>
