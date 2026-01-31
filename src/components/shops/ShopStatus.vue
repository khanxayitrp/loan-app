<!-- src/components/shops/ShopStatus.vue -->
<template>
  <div class="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <!-- Header -->
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

      <button
        @click="$emit('edit')"
        class="btn btn-primary"
      >
        <span class="icon-[tabler--edit] size-4 mr-1"></span>
        ແກ້ໄຂ
      </button>
    </div>

    <!-- Logo -->
    <div class="flex justify-center mb-6">
      <div
        v-if="shop.logo"
        class="w-24 h-24 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden"
      >
        <img
          :src="shop.logo"
          alt="Shop logo"
          class="w-full h-full object-contain"
        />
      </div>
      <div
        v-else
        class="w-24 h-24 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
      >
        <span class="icon-[tabler--building-store] size-8 text-gray-400"></span>
      </div>
    </div>

    <!-- Basic Info Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <label class="text-sm font-medium text-gray-500">ຊື່ຮ້ານ</label>
        <p class="font-medium">{{ shop.shop_name }}</p>
      </div>
      <div>
        <label class="text-sm font-medium text-gray-500">ລະຫັດຮ້ານ</label>
        <p class="font-mono text-gray-700 dark:text-gray-300">{{ shop.shop_code }}</p>
      </div>
      <div>
        <label class="text-sm font-medium text-gray-500">ເຈົ້າຂອງ</label>
        <p>{{ shop.owner_name }}</p>
      </div>
      <div>
        <label class="text-sm font-medium text-gray-500">ເບີໂທ</label>
        <p>{{ shop.phone }}</p>
      </div>
      <div>
        <label class="text-sm font-medium text-gray-500">ປະເພດທຸລະກິດ</label>
        <p>{{ getBusinessTypeName(shop.business_type) }}</p>
      </div>
      <div>
        <label class="text-sm font-medium text-gray-500">ສະຖານະ</label>
        <span
          class="badge badge-soft"
          :class="shop.is_active ? 'badge-success' : 'badge-error'"
        >
          {{ shop.is_active ? 'Active' : 'Inactive' }}
        </span>
      </div>
    </div>

    <!-- Address -->
    <div class="mb-6">
      <label class="text-sm font-medium text-gray-500">ທີ່ຢູ່</label>
      <p class="whitespace-pre-line mb-2">{{ shop.address }}</p>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ shop.village ? `${shop.village}, ` : '' }}
        {{ shop.district }}, {{ getProvinceName(shop.province) }}
      </p>
    </div>

    <!-- Created At -->
    <div>
      <label class="text-sm font-medium text-gray-500">ສ້າງເມື່ອ</label>
      <p>{{ formatDate(shop.created_at) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Shop } from '@/stores/shop'

const props = defineProps<{
  shop: Shop
}>()

const emit = defineEmits<{
  edit: []
}>()

const getProvinceName = (provinceCode: string): string => {
  const provinces: Record<string, string> = {
    'Vientiane': 'ນະຄອນຫຼວງວຽງຈັນ',
    'Champasak': 'ຈຳປາສັກ',
    'Savannakhet': 'ສະຫວັນນະເຂດ',
    'Luang Prabang': 'ຫຼວງພະບາງ',
    'Bokeo': 'ບໍ່ແກ້ວ',
    'Bolikhamxai': 'ບໍລິຄໍາໄຊ',
    'Houaphanh': 'ຫົວພັນ',
    'Khammouane': 'ຄໍາມ່ວນ',
    'Oudomxay': 'ອຸດົມໄຊ',
    'Phongsaly': 'ຜົ້ງສາລີ',
    'Salavan': 'ສາລະວັນ',
    'Sekong': 'ເຊກອງ',
    'Vientiane Province': 'ວຽງຈັນ',
    'Xayaboury': 'ໄຊຍະບູລີ',
    'Xiangkhouang': 'ຊຽງຂວາງ'
  }
  return provinces[provinceCode] || provinceCode
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

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('lo-LA')
}
</script>
