
<template>
  <div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
    <div class="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden">
      
      <div v-if="isLoading" class="p-10 text-center">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>

      <div v-else-if="error" class="p-10 text-center">
        <span class="icon-[tabler--x] size-12 text-red-500 mb-2"></span>
        <h2 class="text-xl font-bold text-gray-800">ກວດສອບບໍ່ສຳເລັດ</h2>
        <p class="text-gray-500 mt-2">{{ error }}</p>
      </div>

      <div v-else-if="basicData" class="p-6">
        <!-- Tier 1: Public Info -->
        <div class="text-center border-b pb-6">
          <div v-if="basicData.kyc_status === 'verified'" class="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-3">
            <span class="icon-[tabler--shield-check] size-8 text-emerald-500"></span>
          </div>
          <div v-else class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-3">
            <span class="icon-[tabler--shield-x] size-8 text-red-500"></span>
          </div>
          
          <h1 class="text-xl font-bold text-gray-800">
            {{ basicData.kyc_status === 'verified' ? 'ສະມາຊິກຖືກຕ້ອງ' : 'ສະມາຊິກບໍ່ພ້ອມໃຊ້ງານ' }}
          </h1>
        </div>

        <div class="py-6 flex items-center gap-4">
          <img :src="basicData.profile_image_url || '/placeholder-user.png'" class="w-16 h-16 rounded-full object-cover border" />
          <div>
            <h2 class="text-lg font-bold text-gray-800">{{ basicData.first_name }} {{ basicData.last_name }}</h2>
            <p class="text-gray-500 font-mono text-sm">{{ basicData.member_code }}</p>
          </div>
        </div>

        <!-- Tier 2: Unlock Financial Data -->
        <div v-if="basicData.kyc_status === 'verified'">
          <div v-if="!financialData" class="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
            <p class="text-sm text-gray-600 mb-3">ເພື່ອກວດສອບວົງເງິນ, ກະລຸນາປ້ອນ <strong>ເບີໂທລະສັບ 4 ຕົວທ້າຍ</strong> ຂອງລູກຄ້າ</p>
            <div class="flex gap-2 justify-center">
              <input v-model="phoneLast4" type="text" maxlength="4" placeholder="XXXX" class="input input-sm input-bordered w-24 text-center font-mono text-lg tracking-widest" @keyup.enter="unlockCredit" />
              <button class="btn btn-sm btn-primary" @click="unlockCredit" :disabled="isUnlocking || phoneLast4.length !== 4">
                <span v-if="isUnlocking" class="loading loading-spinner loading-xs"></span>
                ປົດລັອກ
              </button>
            </div>
            <p v-if="unlockError" class="text-xs text-red-500 mt-2">{{ unlockError }}</p>
          </div>

          <div v-else class="bg-indigo-50 rounded-xl p-4 border border-indigo-100 animate-fade-in">
            <p class="text-indigo-600 text-sm font-medium mb-1">ວົງເງິນທີ່ສາມາດໃຊ້ໄດ້ (Available Credit)</p>
            <p class="text-3xl font-black text-indigo-900">{{ formatPrice(financialData.available_balance) }} ກີບ</p>
            <p class="text-xs text-indigo-500 mt-2">ບັດໝົດອາຍຸ: {{ formatDateOnly(financialData.card_expire_at) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const isLoading = ref(true);
const error = ref('');
const basicData = ref<any>(null);

// Unlock States
const phoneLast4 = ref('');
const isUnlocking = ref(false);
const unlockError = ref('');
const financialData = ref<any>(null);

const formatPrice = (val: number) => new Intl.NumberFormat('lo-LA').format(val);
const formatDateOnly = (date: string) => date ? new Date(date).toLocaleDateString('lo-LA') : '-';

const memberCode = route.params.code as string;

// ดึงข้อมูล Tier 1 ทันทีเมื่อโหลดหน้าเว็บ
onMounted(async () => {
  if (!memberCode) {
    error.value = 'ລະຫັດສະມາຊິກບໍ່ຖືກຕ້ອງ';
    isLoading.value = false;
    return;
  }
  try {
    const res = await axios.get(`https://api.inseemicrofinances.com/api/public/verify/${memberCode}`);
    if (res.data.success) basicData.value = res.data.data;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'ບໍ່ພົບຂໍ້ມູນບັດສະມາຊິກນີ້ໃນລະບົບ';
  } finally {
    isLoading.value = false;
  }
});

// ฟังก์ชันปลดล็อก Tier 2 (ดูวงเงิน)
const unlockCredit = async () => {
  if (phoneLast4.value.length !== 4) return;
  isUnlocking.value = true;
  unlockError.value = '';

  try {
    const res = await axios.post(`https://api.inseemicrofinances.com/api/public/verify/credit`, {
      member_code: memberCode,
      phone_last_4: phoneLast4.value
    });
    if (res.data.success) financialData.value = res.data.data;
  } catch (err: any) {
    unlockError.value = err.response?.data?.message || 'ຂໍ້ມູນບໍ່ຖືກຕ້ອງ';
  } finally {
    isUnlocking.value = false;
  }
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
