<template>
  <teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[105] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">

        <div class="flex justify-between items-center p-5 border-b border-base-200 bg-indigo-50/50 rounded-t-xl">
          <h3 class="text-xl font-bold flex items-center gap-2 text-indigo-700">
            <span class="icon-[tabler--signature] size-6"></span>
            ອັບໂຫຼດລາຍເຊັນເອກະສານຕົວຈິງ (Physical Signatures)
          </h3>
          <button @click="close" class="btn btn-ghost btn-sm btn-circle text-gray-500 hover:bg-gray-200">
            <span class="icon-[tabler--x] size-5"></span>
          </button>
        </div>

        <div class="p-6 overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-900">

          <div class="alert alert-info shadow-sm mb-6 text-sm">
            <span class="icon-[tabler--info-circle] size-5"></span>
            <span>ກະລຸນາອັບໂຫຼດຮູບພາບສັນຍາ ຫຼື ເອກະສານທີ່ລູກຄ້າ ແລະ ພາກສ່ວນກ່ຽວຂ້ອງໄດ້ລົງລາຍເຊັນແລ້ວ ເພື່ອເປັນຫຼັກຖານໃຫ້ຜູ້ບໍລິຫານກວດກາກ່ອນອະນຸມັດ.</span>
          </div>

          <div v-if="isLoading" class="flex justify-center py-8">
            <span class="loading loading-spinner loading-md text-primary"></span>
          </div>

          <div v-else-if="signatures.length === 0" class="text-center py-8 text-gray-500">
            ຍັງບໍ່ມີຂໍ້ມູນລາຍເຊັນທີ່ຕ້ອງການ (ກະລຸນາສ້າງສັນຍາກູ້ຢືມກ່ອນ)
          </div>

          <div v-else class="space-y-4">
            <div v-for="sig in signatures" :key="sig.id"
                 class="border rounded-xl p-4 bg-white shadow-sm transition-all"
                 :class="sig.status === 'signed' ? 'border-success border-l-4' : 'border-gray-200 border-l-4 border-l-warning'">

              <div class="flex flex-col md:flex-row justify-between gap-4">
                <div class="flex-1">
                  <h4 class="font-bold text-lg flex items-center gap-2" :class="sig.status === 'signed' ? 'text-success' : 'text-gray-700'">
                    <span v-if="sig.status === 'signed'" class="icon-[tabler--circle-check-filled]"></span>
                    <span v-else class="icon-[tabler--clock] text-warning"></span>
                    {{ getRoleName(sig.role_type) }}
                  </h4>

                  <div class="mt-2 space-y-2">
                    <div class="form-control w-full max-w-xs">
                      <label class="label py-1"><span class="label-text text-xs text-gray-500">ຊື່ຜູ້ເຊັນຕົວຈິງ (Signer Name)</span></label>
                      <input v-model="sig.signer_name" type="text" class="input input-sm input-bordered w-full" :disabled="sig.status === 'signed'" placeholder="ປ້ອນຊື່..." />
                    </div>
                  </div>
                </div>

                <div class="flex-1 flex flex-col items-start md:items-end justify-center border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4 mt-4 md:mt-0 border-gray-100">

                  <div v-if="sig.signature_image_url" class="flex flex-col items-center gap-2">
                    <a :href="getFullImageUrl(sig.signature_image_url)" target="_blank" class="w-24 h-24 rounded-lg border overflow-hidden hover:opacity-80 transition cursor-pointer block">
                      <img :src="getFullImageUrl(sig.signature_image_url)" class="w-full h-full object-cover" alt="Signature" />
                    </a>
                    <span class="text-xs text-success font-medium">ອັບໂຫຼດແລ້ວ</span>
                    </div>

                  <div v-else class="w-full">
                    <div class="form-control w-full">
                      <label class="label py-1"><span class="label-text text-xs text-gray-500">ອັບໂຫຼດຮູບຫຼັກຖານ (Image)</span></label>
                      <input type="file" class="file-input file-input-sm file-input-bordered file-input-primary w-full" accept="image/*" @change="(e) => handleFileUpload(e, sig)" />
                    </div>
                  </div>

                  <button v-if="sig.status === 'pending'"
                          @click="saveSignature(sig)"
                          class="btn btn-sm btn-primary mt-3 w-full"
                          :disabled="!sig.fileToUpload || !sig.signer_name">
                    <span class="icon-[tabler--upload] size-4"></span> ບັນທຶກລາຍເຊັນນີ້
                  </button>

                </div>
              </div>
            </div>
          </div>

        </div>

        <div class="p-4 border-t border-base-200 bg-base-100 flex justify-end rounded-b-xl">
          <button class="btn btn-ghost" @click="close">ປິດໜ້າຈໍ</button>
        </div>

      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import apiClient from '@/api/apiclient';
import { alert } from '@/utils/alert';
import { getFullImageUrl } from '@/utils/url';

const props = defineProps<{ isOpen: boolean; loanId: number | null }>();
const emit = defineEmits<{ (e: 'close'): void; (e: 'updated'): void }>();

const isLoading = ref(false);
const signatures = ref<any[]>([]);

// ແປພາສາ Role ໃຫ້ອ່ານງ່າຍ
const getRoleName = (role: string) => {
  const roles: any = {
    borrower: 'ລູກຄ້າ (Borrower)',
    guarantor: 'ຜູ້ຄ້ຳປະກັນ (Guarantor)',
    village_chief: 'ນາຍບ້ານ (Village Chief)'
  };
  return roles[role] || role;
};

// ໂຫຼດຂໍ້ມູນຈາກ DB ຕອນເປີດ Modal
watch(() => props.isOpen, async (newVal) => {
  if (newVal && props.loanId) {
    await fetchSignatures();
  }
});

const fetchSignatures = async () => {
  isLoading.value = true;
  try {
    // ຍິງ API ໄປດຶງ document_signatures ທີ່ເປັນຂອງຄົນນອກ (ລູກຄ້າ, ຄົນຄ້ຳ, ນາຍບ້ານ) ສຳລັບ loanId ນີ້
    const res = await apiClient.get(`/document-signatures/external/${props.loanId}`);
    signatures.value = res.data.data.map((sig: any) => ({
      ...sig,
      temp_signer_name: sig.signer_name || '',
      fileToUpload: null // ເກັບ File object ໄວ້ລໍຖ້າອັບໂຫຼດ
    }));
  } catch (error) {
    console.error('Error fetching signatures:', error);
  } finally {
    isLoading.value = false;
  }
};

const handleFileUpload = (event: Event, sig: any) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    sig.fileToUpload = target.files[0];
  }
};

const saveSignature = async (sig: any) => {
  try {
    // 1. ອັບໂຫຼດຮູບພາບກ່ອນ
    const formData = new FormData();
    formData.append('file', sig.fileToUpload);
    // (ສົມມຸດມີ API ອັບໂຫຼດຮູບທົ່ວໄປ)
    const uploadRes = await apiClient.post('/upload/image', formData);
    const imageUrl = uploadRes.data.file_url;

    // 2. ອັບເດດຂໍ້ມູນໃນຕາຕະລາງ document_signatures
    await apiClient.put(`/document-signatures/${sig.id}/external-sign`, {
      signer_name: sig.signer_name,
      signature_image_url: imageUrl,
      status: 'signed'
    });

    alert.success('ບັນທຶກລາຍເຊັນສຳເລັດ!');
    await fetchSignatures(); // ໂຫຼດໃໝ່ໃຫ້ຂຶ້ນສີຂຽວ
    emit('updated'); // ບອກໜ້າຫຼັກວ່າອັບເດດແລ້ວ

  } catch (error) {
    alert.error('ບໍ່ສາມາດບັນທຶກລາຍເຊັນໄດ້');
  }
};

const close = () => {
  emit('close');
};
</script>
