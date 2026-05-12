<template>
  <div class="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div v-if="isLoading" class="text-center py-8">
      <div class="loading loading-spinner"></div>
    </div>

    <div v-else-if="error" class="text-center py-8 text-error">
      <span class="icon-[tabler--alert-triangle] size-8 mb-4"></span>
      <p>{{ error }}</p>
    </div>

    <div v-else-if="shop">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-primary/10 rounded-lg">
            <span class="icon-[tabler--building-store] size-6 text-primary"></span>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-800 dark:text-white">ຂໍ້ມູນຮ້ານ</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">ຂໍ້ມູນລາຍລະອຽດຂອງຮ້ານ</p>
          </div>
        </div>

        <button @click="$emit('edit')" class="btn btn-primary">
          <span class="icon-[tabler--edit] size-4 mr-1"></span>
          ແກ້ໄຂ
        </button>
      </div>

      <div class="flex justify-center mb-6">
        <div v-if="shop.shop_logo_url"
          class="w-24 h-24 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
          <img :src="shop.shop_logo_url" alt="Shop logo" class="w-full h-full object-contain" />
        </div>
        <div v-else class="w-24 h-24 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <span class="icon-[tabler--building-store] size-8 text-gray-400"></span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label class="text-sm font-medium text-gray-500">ຊື່ຮ້ານ</label>
          <p class="font-medium text-blue-600">{{ shop.shop_name }}</p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-500">ລະຫັດຮ້ານ</label>
          <p class="font-mono text-gray-700 dark:text-gray-300">{{ shop.shop_id }}</p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-500">ເຈົ້າຂອງ</label>
          <p>{{ shop.shop_owner }}</p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-500">ເບີໂທ</label>
          <p class="font-medium  text-blue-600">{{ shop.contact_number }}</p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-500">ປະເພດທຸລະກິດ</label>
          <p>{{ getBusinessTypeName(shop.business_type) }}</p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-500">ສະຖານະ</label>
          <span class="badge badge-soft" :class="shop.is_active ? 'badge-success' : 'badge-error'">
            {{ shop.is_active ? 'Active' : 'Inactive' }}
          </span>
        </div>
      </div>

      <div class="mb-6">
        <label class="text-sm font-medium text-gray-500">ທີ່ຢູ່</label>
        <p class="whitespace-pre-line mb-1">{{ shop.address }}</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ getFullAddressText(shop.province_id ?? undefined, shop.district_id ?? undefined) }}
        </p>
      </div>
      
    </div>

    <div v-else class="text-center py-8 text-gray-500">
      <span class="icon-[tabler--building-store] size-8 mb-4"></span>
      <p>ບໍ່ພົບຂໍ້ມູນຮ້ານ</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useShopStore } from '@/stores/shop'
import { useAddressStore } from '@/stores/address' // 🟢 ເພີ່ມ Address Store
import type { shopType } from '@/types/shop'

const emit = defineEmits<{
  edit: []
}>()

const props = defineProps<{
  shop: shopType | null
}>()

const shop = computed(() => props.shop)
const shopStore = useShopStore()
const addressStore = useAddressStore() // 🟢 ໃຊ້ Address Store

const isLoading = computed(() => shopStore.isLoading)
const error = computed(() => shopStore.error)

// 🟢 ຟັງຊັນຊອກຫາຊື່ແຂວງ ແລະ ເມືອງ ຈາກ ID
const getFullAddressText = (provinceId?: string | number, districtId?: string | number): string => {
  let addressText = '';

  // ຫາຊື່ເມືອງ
  if (districtId) {
    // ຖ້າຍັງບໍ່ມີຂໍ້ມູນເມືອງໃນ Store ໃຫ້ພະຍາຍາມດຶງມາກ່ອນ (ຖ້າໂຫຼດແລ້ວມັນຈະມີໃນ Cache)
    const district = addressStore.districts.find(d => String(d.district_id) === String(districtId));
    if (district) {
      addressText += `${district.district_name}, `;
    }
  }

  // ຫາຊື່ແຂວງ
  if (provinceId) {
    const province = addressStore.provinces.find(p => String(p.province_id) === String(provinceId));
    if (province) {
      addressText += `ແຂວງ${province.province_name}`;
    }
  }

  return addressText || 'ບໍ່ລະບຸແຂວງ/ເມືອງ';
}

const getBusinessTypeName = (businessType: string): string => {
  const types: Record<string, string> = {
    'retail': 'ຮ້ານຄ້າປົກກະຕິ',
    'wholesale': 'ຜູ້ຈັດຈໍາໜ່າຍ',
    'restaurant': 'ຮ້ານອາຫານ',
    'service': 'ບໍລິການ',
    'manufacturing': 'ຜະລິດ',
    'other': 'ອື່ນໆ'
  }
  return types[businessType] || businessType
}

// 🟢 ໂຫຼດຂໍ້ມູນແຂວງ (ແລະເມືອງຖ້າມີ) ຂຶ້ນມາກຽມໄວ້
// 🟢 เปลี่ยนจาก onMounted เดิม เป็นการใช้ watch ผสม onMounted
onMounted(async () => {
  // โหลดรายชื่อแขวงทั้งหมดเตรียมไว้ก่อน (ดึงแค่ครั้งเดียว)
  if (addressStore.provinces.length === 0) {
    await addressStore.fetchProvinces();
  }
})

// 🟢 เพิ่ม watch เพื่อคอยดูว่าข้อมูลร้านค้าถูกส่งมาถึงหรือยัง
watch(() => props.shop?.province_id, async (newProvinceId) => {
  if (newProvinceId) {
    // ทันทีที่ province_id โหลดมาถึง (เช่น "01") ให้สั่งดึงรายชื่อเมือง
    // ปล่อยค่าเป็น String หรือ Number ตามที่ API รับได้เลย (ไม่ต้องครอบ Number() แล้วถ้า Backend ใช้ "01")
    await addressStore.fetchDistricts(newProvinceId as any);
  }
}, { immediate: true }) // immediate: true สั่งให้ทำงานทันทีที่เปิดหน้าจอด้วย

</script>