<template>
  <div class="space-y-6 animate-in fade-in">
    <div class="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg flex justify-between items-center shadow-sm">
      <div>
        <h4 class="font-bold text-amber-800 dark:text-amber-300">ບົດບັນທຶກການລົງພື້ນທີ່ຈິງ (Site Visits)</h4>
        <p class="text-sm text-amber-600">ສາມາດເພີ່ມໄດ້ຫຼາຍສະຖານທີ່ ເຊັ່ນ: ເຮືອນ, ບ່ອນເຮັດວຽກ</p>
      </div>
      <button v-if="canEdit" class="btn btn-primary btn-sm" @click="$emit('addFieldVisit')">
        <span class="icon-[tabler--plus] size-4"></span> ເພີ່ມສະຖານທີ່
      </button>
    </div>

    <div v-for="(visit, index) in formFieldVisits" :key="index" class="border rounded-lg p-6 relative bg-white dark:bg-base-100 shadow-sm">
      <button v-if="canEdit" class="btn btn-ghost btn-xs btn-circle absolute top-2 right-2 text-error" @click="$emit('removeFieldVisit', index)">
        <span class="icon-[tabler--trash] size-5"></span>
      </button>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div class="form-control">
          <label class="label"><span class="label-text font-bold">ປະເພດສະຖານທີ່</span></label>
          <select v-model="visit.visit_type" class="select select-bordered" :disabled="!canEdit">
            <option value="home">ເຮືອນພັກອາໄສ</option>
            <option value="workplace">ບ່ອນເຮັດວຽກ</option>
            <option value="other">ສະຖານທີ່ອື່ນໆ (ລະບຸໃນໝາຍເຫດ)</option>
          </select>
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text font-bold">ວັນທີລົງພື້ນທີ່</span></label>
          <input v-model="visit.visit_date" type="datetime-local" class="input input-bordered" :disabled="!canEdit" />
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text font-bold">ສະພາບຄວາມເປັນຢູ່ / ລັກສະນະອາຄານ</span></label>
          <input v-model="visit.living_condition" type="text" placeholder="ເຊັ່ນ: ເຮືອນປູນ 2 ຊັ້ນ, ຫ້ອງແຖວ..." class="input input-bordered" :disabled="!canEdit" />
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text font-bold">ທີ່ຢູ່ຕົງກັບເອກະສານແຈ້ງ ຫຼື ບໍ່?</span></label>
          <select v-model="visit.is_address_correct" class="select select-bordered" :disabled="!canEdit">
            <option :value="true">ຕົງກັນ (Yes)</option>
            <option :value="false">ບໍ່ຕົງກັນ / ຫາບໍ່ພົບ (No)</option>
          </select>
        </div>

        <div class="form-control md:col-span-2 border-t pt-4 mt-2">
          <label class="label pb-0"><span class="label-text font-bold">ທີ່ຕັ້ງ (GPS Location)</span></label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div class="flex gap-2">
              <div class="w-full">
                <label class="label text-xs"><span class="label-text">Latitude</span></label>
                <input v-model.number="visit.latitude" type="number" step="any" placeholder="17.XXXXXX" class="input input-bordered input-sm w-full" :disabled="!canEdit" />
              </div>
              <div class="w-full">
                <label class="label text-xs"><span class="label-text">Longitude</span></label>
                <input v-model.number="visit.longitude" type="number" step="any" placeholder="102.XXXXXX" class="input input-bordered input-sm w-full" :disabled="!canEdit" />
              </div>
            </div>
            <div class="flex items-end">
              <button v-if="canEdit" type="button" class="btn btn-outline btn-info btn-sm w-full gap-2" @click="$emit('getCurrentLocation', index)">
                <span class="icon-[tabler--current-location] size-4"></span> ດຶງທີ່ຕັ້ງປັດຈຸບັນ
              </button>
            </div>
          </div>
        </div>

        <!-- Field Visit Images -->
        <div class="form-control md:col-span-2 mt-2">
          <label class="label"><span class="label-text font-bold">ຮູບພາບສະຖານທີ່ຈິງ (ສູງສຸດ 2 ຮູບ)</span></label>
          <div class="grid grid-cols-2 gap-4 mt-2">
            <div class="border rounded-lg overflow-hidden relative bg-base-200" style="height: 150px;">
              <div v-if="visit.photo_url_1 || visit.photo_1_preview" class="w-full h-full relative group bg-base-300 flex items-center justify-center">
                <img :src="(visit.photo_1_preview as string) || getFullImageUrl(visit.photo_url_1 as string)" class="max-w-full max-h-full object-contain" />
                <div v-if="canEdit" class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <button type="button" class="btn btn-error btn-sm btn-circle" @click="$emit('removeVisitImage', index, 1)">
                    <span class="icon-[tabler--trash] size-4"></span>
                  </button>
                </div>
              </div>
              <label v-else-if="canEdit" class="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-base-300 transition-colors">
                <span class="icon-[tabler--photo-plus] size-8 text-gray-400 mb-2"></span>
                <span class="text-xs text-gray-500">ຮູບທີ 1 (ປ້າຍບ້ານ/ໜ້າບ້ານ)</span>
                <input type="file" class="hidden" accept="image/*" @change="(e) => $emit('handleVisitImageUpload', index, 1, e)" />
              </label>
              <div v-else class="w-full h-full flex flex-col items-center justify-center">
                <span class="icon-[tabler--photo-off] size-8 text-gray-300 mb-2"></span>
                <span class="text-xs text-gray-400">ບໍ່ມີຮູບພາບ</span>
              </div>
            </div>

            <div class="border rounded-lg overflow-hidden relative bg-base-200" style="height: 150px;">
              <div v-if="visit.photo_url_2 || visit.photo_2_preview" class="w-full h-full relative group bg-base-300 flex items-center justify-center">
                <img :src="(visit.photo_2_preview as string) || getFullImageUrl(visit.photo_url_2 as string)" class="max-w-full max-h-full object-contain" />
                <div v-if="canEdit" class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <button type="button" class="btn btn-error btn-sm btn-circle" @click="$emit('removeVisitImage', index, 2)">
                    <span class="icon-[tabler--trash] size-4"></span>
                  </button>
                </div>
              </div>
              <label v-else-if="canEdit" class="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-base-300 transition-colors">
                <span class="icon-[tabler--photo-plus] size-8 text-gray-400 mb-2"></span>
                <span class="text-xs text-gray-500">ຮູບທີ 2 (ສະພາບລວມ)</span>
                <input type="file" class="hidden" accept="image/*" @change="(e) => $emit('handleVisitImageUpload', index, 2, e)" />
              </label>
              <div v-else class="w-full h-full flex flex-col items-center justify-center">
                <span class="icon-[tabler--photo-off] size-8 text-gray-300 mb-2"></span>
                <span class="text-xs text-gray-400">ບໍ່ມີຮູບພາບ</span>
              </div>
            </div>
          </div>
        </div>

        <div class="form-control md:col-span-2">
          <label class="label"><span class="label-text font-bold">ໝາຍເຫດ (ສິ່ງທີ່ພົບເຫັນເພີ່ມເຕີມ)</span></label>
          <textarea v-model="visit.remarks" class="textarea textarea-bordered" placeholder="ລາຍລະອຽດເພີ່ມເຕີມທີ່ພົບເຫັນ..." :disabled="!canEdit"></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getFullImageUrl } from '@/utils/url';

defineProps<{
  formFieldVisits: any[];
  canEdit: boolean;
}>();

defineEmits<{
  (e: 'addFieldVisit'): void;
  (e: 'removeFieldVisit', index: number): void;
  (e: 'getCurrentLocation', index: number): void;
  (e: 'handleVisitImageUpload', index: number, photoNum: 1 | 2, event: Event): void;
  (e: 'removeVisitImage', index: number, photoNum: 1 | 2): void;
}>();
</script>
