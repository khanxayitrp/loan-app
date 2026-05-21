<template>
  <teleport to="body">
    <div v-if="show" class="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto flex flex-col">
        
        <div class="flex justify-between items-center mb-6 shrink-0">
          <h3 class="text-lg font-bold flex items-center gap-2">
            <span class="icon-[tabler--files] size-5 text-primary"></span>
            {{ isEditing ? 'ຈັດການເອກະສານແນບ' : 'ເອກະສານແນບ' }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition">
            <span class="icon-[tabler--x] size-5"></span>
          </button>
        </div>

        <div v-if="!isEditing" class="flex-1 overflow-y-auto space-y-6 pr-2">
          <div v-if="!currentDocuments || currentDocuments.length === 0" class="text-center py-12 text-gray-500">
            <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="icon-[tabler--file-off] size-8 text-gray-400"></span>
            </div>
            <p class="text-lg font-medium">ບໍ່ມີເອກະສານແນບ</p>
            <p class="text-sm text-gray-500 mt-1">ຍັງບໍ່ມີເອກະສານທີ່ອັບໂຫຼດສຳລັບລາຍການນີ້</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="doc in sortedCurrentDocuments" :key="doc.id" class="border rounded-lg p-4 flex flex-col gap-3 bg-white dark:bg-gray-800 overflow-hidden shadow-sm hover:shadow transition">
              <div class="flex justify-between items-start gap-2 w-full overflow-hidden">
                <div class="flex-1 min-w-0">
                  <h5 class="font-medium text-sm truncate">
                    {{ getDocumentTypeName(doc.document_type || doc.doc_type) }}
                  </h5>
                  <p class="text-xs text-gray-500 mt-1 truncate" :title="doc.original_filename || doc.file_name">
                    {{ doc.original_filename || doc.file_name || 'ບໍ່ຮູ້ຈັກ' }}
                  </p>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <button @click.prevent="openInNewTab(getFullImageUrl(doc.file_url))" class="btn btn-xs btn-ghost text-info hover:bg-info/10" title="ເບິ່ງເອກະສານ">
                    <span class="icon-[tabler--eye] size-4 mr-1"></span> ເບິ່ງ
                  </button>
                  <a :href="getFullImageUrl(doc.file_url) || '#'" target="_blank" download class="btn btn-xs btn-ghost text-primary hover:bg-primary/10" title="ດາວໂຫຼດ">
                    <span class="icon-[tabler--download] size-4 mr-1"></span> ໂຫຼດ
                  </a>
                </div>
              </div>
              <div class="mt-2">
                <div v-if="isImage(doc.file_url)" class="aspect-video bg-gray-100 dark:bg-gray-700 rounded overflow-hidden cursor-pointer" @click="openInNewTab(getFullImageUrl(doc.file_url))">
                  <img :src="getFullImageUrl(doc.file_url) || ''" alt="Document preview" class="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-300" />
                </div>
                <div v-else class="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center cursor-pointer hover:bg-gray-200 transition" @click="openInNewTab(getFullImageUrl(doc.file_url))">
                  <div class="text-center">
                    <span class="icon-[tabler--file-description] size-12 text-gray-400"></span>
                    <p class="text-xs text-gray-500 mt-2">ຄລິກເພື່ອເບິ່ງ PDF</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="flex-1 overflow-y-auto space-y-6 pr-2">
          <div>
            <h4 class="font-medium mb-3 text-lg flex items-center gap-2">
              <span class="icon-[tabler--file-check] size-5 text-error"></span> ເອກະສານທີ່ຕ້ອງການ (ບັງຄັບ)
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="(doc, index) in requiredDocs" :key="index" class="border-2 border-dashed rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50 transition-colors hover:border-gray-400">
                <div class="flex items-center justify-between mb-3">
                  <div>
                    <h5 class="font-medium">{{ doc.name }}</h5>
                    <p class="text-xs text-gray-500 mt-1">{{ doc.description }}</p>
                  </div>
                  <span class="badge badge-soft badge-error text-xs">ຕ້ອງການ</span>
                </div>
                
                <div v-if="doc.preview" class="mt-3 relative w-full h-40 bg-gray-200 rounded overflow-hidden group">
                  <img v-if="isImage(doc.preview)" :src="getFullImageUrl(doc.preview) || ''" class="w-full h-full object-contain p-2" />
                  <div v-else class="w-full h-full flex items-center justify-center bg-gray-100">
                     <span class="icon-[tabler--file-description] size-12 text-gray-400"></span>
                  </div>
                  
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button type="button" class="btn btn-sm btn-circle btn-error" @click="removeDocument(index, 'req')" title="ລຶບເພື່ອອັບໂຫຼດໃໝ່">
                      <span class="icon-[tabler--trash] size-4"></span>
                    </button>
                    <button v-if="!doc.file" type="button" class="btn btn-sm btn-circle btn-info" @click="openInNewTab(getFullImageUrl(doc.preview))" title="ເບິ່ງເອກະສານ">
                      <span class="icon-[tabler--eye] size-4"></span>
                    </button>
                  </div>
                  
                  <div class="absolute bottom-2 left-2 pointer-events-none">
                    <span v-if="doc.file" class="badge badge-success badge-sm shadow-sm text-white">ໄຟລ໌ໃໝ່ກຽມອັບໂຫຼດ</span>
                    <span v-else class="badge badge-neutral badge-sm shadow-sm">ໄຟລ໌ເດີມໃນລະບົບ</span>
                  </div>
                </div>
                
                <div v-else class="mt-3">
                  <label class="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-primary/5 hover:border-primary/50 transition">
                    <span class="icon-[tabler--upload] size-8 text-gray-400 mb-2"></span>
                    <p class="text-sm text-gray-600 font-medium">ຄລິກເພື່ອອັບໂຫຼດ</p>
                    <p class="text-xs text-gray-400 mt-1">ຮອງຮັບ: JPG, PNG, PDF</p>
                    <input type="file" class="hidden" accept="image/*,.pdf" @change="(event) => handleDocumentUpload(index, event, 'req')" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8 pt-6 border-t">
            <h4 class="font-medium mb-3 text-lg flex items-center gap-2">
              <span class="icon-[tabler--file-plus] size-5 text-primary"></span> ເອກະສານເພີ່ມເຕີມ (ບໍ່ບັງຄັບ)
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="(doc, index) in optionalDocs" :key="index" class="border-2 border-dashed rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50 transition-colors hover:border-gray-400">
                <div class="flex items-center justify-between mb-3">
                  <div>
                    <h5 class="font-medium">{{ doc.name }}</h5>
                    <p class="text-xs text-gray-500 mt-1">{{ doc.description }}</p>
                  </div>
                </div>
                
                <div v-if="doc.preview" class="mt-3 relative w-full h-40 bg-gray-200 rounded overflow-hidden group">
                  <img v-if="isImage(doc.preview)" :src="getFullImageUrl(doc.preview) || ''" class="w-full h-full object-contain p-2" />
                  <div v-else class="w-full h-full flex items-center justify-center bg-gray-100">
                     <span class="icon-[tabler--file-description] size-12 text-gray-400"></span>
                  </div>
                  
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button type="button" class="btn btn-sm btn-circle btn-error" @click="removeDocument(index, 'opt')" title="ລຶບເພື່ອອັບໂຫຼດໃໝ່">
                      <span class="icon-[tabler--trash] size-4"></span>
                    </button>
                    <button v-if="!doc.file" type="button" class="btn btn-sm btn-circle btn-info" @click="openInNewTab(getFullImageUrl(doc.preview))" title="ເບິ່ງເອກະສານ">
                      <span class="icon-[tabler--eye] size-4"></span>
                    </button>
                  </div>
                  
                  <div class="absolute bottom-2 left-2 pointer-events-none">
                    <span v-if="doc.file" class="badge badge-success badge-sm shadow-sm text-white">ໄຟລ໌ໃໝ່ກຽມອັບໂຫຼດ</span>
                    <span v-else class="badge badge-neutral badge-sm shadow-sm">ໄຟລ໌ເດີມໃນລະບົບ</span>
                  </div>
                </div>
                
                <div v-else class="mt-3">
                  <label class="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-primary/5 hover:border-primary/50 transition">
                    <span class="icon-[tabler--upload] size-8 text-gray-400 mb-2"></span>
                    <p class="text-sm text-gray-600 font-medium">ຄລິກເພື່ອອັບໂຫຼດ</p>
                    <p class="text-xs text-gray-400 mt-1">ຮອງຮັບ: JPG, PNG, PDF</p>
                    <input type="file" class="hidden" accept="image/*,.pdf" @change="(event) => handleDocumentUpload(index, event, 'opt')" />
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="isUploading" class="mt-4 p-3 bg-info/10 rounded-lg text-center flex items-center justify-center gap-2">
            <span class="loading loading-spinner loading-sm text-info"></span>
            <span class="text-info font-medium">ກຳລັງອັບໂຫຼດເອກະສານ... ກະລຸນາລໍຖ້າ</span>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6 border-t pt-6 shrink-0">
          <button class="btn btn-soft btn-secondary" @click="closeModal" :disabled="isUploading">
            {{ isEditing ? 'ຍົກເລີກ' : 'ປິດ' }}
          </button>

          <button v-if="!isEditing && allowEdit" class="btn btn-primary" @click="startEdit">
            <span class="icon-[tabler--edit] size-4 mr-1"></span> ແກ້ໄຂ / ເພີ່ມເອກະສານ
          </button>

          <button v-else-if="isEditing" class="btn btn-success text-white" @click="saveDocuments" :disabled="isUploading || !hasFilesToUpload">
            <span v-if="isUploading" class="loading loading-spinner loading-xs"></span>
            <span v-else class="icon-[tabler--device-floppy] size-4 mr-1"></span>
            <span v-if="!isUploading">ບັນທຶກເອກະສານ</span>
          </button>
        </div>

      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { getDocumentTypeName } from '@/utils/formatters'
import { getFullImageUrl } from '@/utils/url'

interface DocumentItem {
  id: string;
  name: string;
  description: string;
  required: boolean;
  file: File | null;
  preview: string | null;
}

const props = defineProps<{
  show: boolean;
  allowEdit?: boolean;
  currentDocuments: any[]; // Array ຂອງເອກະສານທີ່ດຶງມາຈາກ API
}>()

const emit = defineEmits(['close', 'save'])

const isEditing = ref(false)
const isUploading = ref(false)

// ກຳນົດໂຄງສ້າງເອກະສານພື້ນຖານ
const defaultRequiredDocs: DocumentItem[] = [
  { id: 'id_card', name: 'ບັດປະຈຳຕົວ', description: 'ຮູບຖ່າຍບັດປະຈຳຕົວທັງໜ້າ-ຫຼັງ', required: true, file: null, preview: null },
  { id: 'house_reg', name: 'ໃບຄອບຄົວ', description: 'ໃບຄອບຄົວຫຼືເອກະສານຢືນຢັນທີ່ຢູ່', required: true, file: null, preview: null }
]

const defaultOptionalDocs: DocumentItem[] = [
  { id: 'salary_slip', name: 'ຫຼັກຖານລາຍຮັບ', description: 'ໃບເງິນເດືອນ ຫຼື ໃບຮັບລາຍຮັບ', required: false, file: null, preview: null },
  { id: 'other', name: 'ເອກະສານອື່ນໆ', description: 'ເອກະສານອື່ນໆທີ່ກ່ຽວຂ້ອງ', required: false, file: null, preview: null }
]

const requiredDocs = ref<DocumentItem[]>([])
const optionalDocs = ref<DocumentItem[]>([])

// 🟢 Helper Functions
const isImage = (url: string) => /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(url)
const openInNewTab = (url: string | null | undefined) => { if (url) window.open(url, '_blank') }

// 🟢 ຈັດລຽງເອກະສານສຳລັບ View Mode
const sortedCurrentDocuments = computed(() => {
  const docs = props.currentDocuments || [];
  const orderList = ['id_card', 'house_reg', 'salary_slip', 'other'];
  return [...docs].sort((a, b) => {
    const typeA = a.document_type || a.doc_type || '';
    const typeB = b.document_type || b.doc_type || '';
    let indexA = orderList.indexOf(typeA);
    let indexB = orderList.indexOf(typeB);
    if (indexA === -1) indexA = 999;
    if (indexB === -1) indexB = 999;
    return indexA - indexB;
  });
})

// 🟢 Initialize ຂໍ້ມູນເມື່ອເປີດ Modal ຫຼື ກົດ Edit
const initializeForms = () => {
  // Deep clone defaults
  requiredDocs.value = defaultRequiredDocs.map(d => ({ ...d }))
  optionalDocs.value = defaultOptionalDocs.map(d => ({ ...d }))

  // Map ຂໍ້ມູນເກົ່າໃສ່ Form ຖ້າມີ
  if (props.currentDocuments && props.currentDocuments.length > 0) {
    props.currentDocuments.forEach(serverDoc => {
      const docType = serverDoc.document_type || serverDoc.doc_type
      const reqDoc = requiredDocs.value.find(d => d.id === docType)
      const optDoc = optionalDocs.value.find(d => d.id === docType)
      
      if (reqDoc && serverDoc.file_url) reqDoc.preview = serverDoc.file_url
      if (optDoc && serverDoc.file_url) optDoc.preview = serverDoc.file_url
    })
  }
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    isEditing.value = false
    isUploading.value = false
  }
})

const startEdit = () => {
  initializeForms()
  isEditing.value = true
}

const closeModal = () => {
  if (isUploading.value) return; // ປ້ອງກັນການປິດຂະນະອັບໂຫຼດ
  isEditing.value = false;
  emit('close');
}

// 🟢 Handlers ສຳລັບ File Input
const handleDocumentUpload = (index: number, event: Event, type: 'req' | 'opt') => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const docs = type === 'req' ? requiredDocs.value : optionalDocs.value;
  const reader = new FileReader();
  reader.onload = (e) => {
    if (docs[index]) { 
      docs[index].file = file;
      docs[index].preview = e.target?.result as string;
    }
  };
  reader.readAsDataURL(file);
}

const removeDocument = (index: number, type: 'req' | 'opt') => {
  const docs = type === 'req' ? requiredDocs.value : optionalDocs.value;
  if (docs[index]) { 
    docs[index].file = null;
    docs[index].preview = null;
  }
}

// 🟢 ສົ່ງຂໍ້ມູນກັບໄປໃຫ້ Parent Component ຈັດການການອັບໂຫຼດ
const hasFilesToUpload = computed(() => {
  const files = [...requiredDocs.value, ...optionalDocs.value].filter(d => d.file !== null)
  return files.length > 0
})

const saveDocuments = () => {
  if (!hasFilesToUpload.value) return;
  
  isUploading.value = true;
  // ຮວບຮວມສະເພາະໄຟລ໌ທີ່ມີການອັບໂຫຼດໃໝ່
  const filesToUpload = [...requiredDocs.value, ...optionalDocs.value].filter(d => d.file !== null);
  
  // ສົ່ງ Event 'save' ອອກໄປພ້ອມ Array ຂອງ Files ໃຫ້ Parent Component ໄປ Call API ເອົາເອງ
  emit('save', filesToUpload, () => {
    // Callback ເມື່ອ Parent ອັບໂຫຼດສຳເລັດ
    isUploading.value = false;
    isEditing.value = false;
  });
}
</script>