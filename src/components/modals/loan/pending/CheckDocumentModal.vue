<template>
  <teleport to="body">
    <div v-if="show" class="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto flex flex-col">
        
        <div class="flex justify-between items-center mb-6 shrink-0">
          <h3 class="text-lg font-bold flex items-center gap-2">
            <span class="icon-[tabler--files] size-5 text-primary"></span>
            {{ isEditing ? 'ຈັດການເອກະສານແນບ' : 'ເອກະສານແນບ' }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition" :disabled="isUploading">
            <span class="icon-[tabler--x] size-5"></span>
          </button>
        </div>

        <!-- <div v-if="!isEditing" class="flex-1 overflow-y-auto space-y-6 pr-2 bg-gray-50/50 p-2 sm:p-4 rounded-xl">
          
          <div v-if="!currentDocuments || currentDocuments.length === 0" class="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="icon-[tabler--file-off] size-8 text-gray-400"></span>
            </div>
            <p class="text-lg font-medium">ບໍ່ມີເອກະສານແນບ</p>
            <p class="text-sm text-gray-500 mt-1">ຍັງບໍ່ມີເອກະສານທີ່ອັບໂຫຼດສຳລັບລາຍການນີ້</p>
          </div>

          <template v-else>
            <div v-for="doc in groupedDocuments" :key="doc.id" 
                 class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              
              <div class="flex items-center justify-between mb-4 border-b pb-3">
                <h4 class="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <span class="icon-[tabler--id-badge] size-5 text-primary"></span> 
                  {{ getDocumentTypeName(doc.document_type || doc.doc_type) }}
                </h4>
              </div>

              <div class="flex flex-wrap gap-4">
                <div class="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 w-full sm:w-48 group cursor-pointer shadow-sm hover:shadow-md transition-all"
                     @click="openInNewTab(getFullImageUrl(doc.file_url))">
                  
                  <div class="h-32 w-full overflow-hidden bg-slate-100">
                    <img v-if="isImage(doc.file_url)" :src="getFullImageUrl(doc.file_url) || ''" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div v-else class="w-full h-full flex flex-col items-center justify-center">
                      <span class="icon-[tabler--file-type-pdf] size-10 text-red-500 mb-2"></span>
                      <span class="text-xs text-gray-500 truncate px-2 w-full text-center">{{ doc.original_filename || doc.file_name || 'Document' }}</span>
                    </div>
                  </div>

                  <div class="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-center py-2 text-[11px] font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    ເບິ່ງເອກະສານ
                  </div>
                </div>
              </div>
            </div>
          </template>

        </div> -->


        <div v-if="!isEditing" class="flex-1 overflow-y-auto space-y-6 pr-2 bg-white sm:p-2 rounded-xl">
  
  <div v-if="!currentDocuments || currentDocuments.length === 0" class="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm">
    <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
      <span class="icon-[tabler--file-off] size-8 text-gray-400"></span>
    </div>
    <p class="text-lg font-medium">ບໍ່ມີເອກະສານແນບ</p>
    <p class="text-sm text-gray-500 mt-1">ຍັງບໍ່ມີເອກະສານທີ່ອັບໂຫຼດສຳລັບລາຍການນີ້</p>
  </div>

  <template v-else>
    <div v-for="group in groupedDocuments" :key="group.type" 
         class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm mb-4">
      
      <div class="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
        <h4 class="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <span class="icon-[tabler--folder] size-5 text-indigo-600"></span> 
          {{ getDocumentTypeName(group.type) }}
        </h4>
        <span v-if="group.isRequired" class="badge badge-success badge-soft bg-green-50 text-green-600 text-[11px] font-bold px-2.5 py-1 border-none">ຕາມກຳນົດ</span>
        <span v-else class="badge badge-ghost bg-gray-100 text-gray-500 text-[11px] font-bold px-2.5 py-1 border-none">ບໍ່ບັງຄັບ</span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div v-for="doc in group.files" :key="doc.id" 
             class="relative rounded-xl overflow-hidden border border-gray-200 bg-slate-50 flex flex-col cursor-pointer group shadow-sm hover:shadow hover:border-indigo-300 transition-all"
             @click="openInNewTab(getFullImageUrl(doc.file_url))">
          
          <div class="h-32 flex flex-col items-center justify-center p-3 relative bg-slate-50/50">
            <template v-if="isImage(doc.file_url)">
              <img :src="getFullImageUrl(doc.file_url) || ''" class="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-300" />
            </template>
            <template v-else>
              <span class="icon-[tabler--file-type-pdf] size-12 text-red-500 mb-2 group-hover:scale-110 transition-transform"></span>
              <span class="text-xs text-gray-600 text-center line-clamp-2 px-1 w-full">{{ doc.original_filename || doc.file_name || 'Document' }}</span>
            </template>
          </div>

          <div class="bg-indigo-50 text-indigo-600 text-center py-2.5 text-[11px] font-bold group-hover:bg-indigo-100 transition-colors w-full mt-auto">
            ເບິ່ງເອກະສານ
          </div>
        </div>
      </div>
      
    </div>
  </template>

</div>


        <div v-else class="flex-1 overflow-y-auto space-y-6 pr-2">
          
          <div>
            <h4 class="font-medium mb-3 text-lg flex items-center gap-2">
              <span class="icon-[tabler--file-check] size-5 text-error"></span> ເອກະສານທີ່ຕ້ອງການ (ບັງຄັບ)
            </h4>
            <div class="grid grid-cols-1 gap-4">
              <div v-for="(doc, index) in requiredDocs" :key="'req-' + index" 
                   class="border rounded-2xl p-5 bg-white shadow-sm border-slate-200">
                
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h5 class="font-bold text-slate-800">{{ doc.name }}</h5>
                    <p class="text-[11px] text-slate-400 mt-1">{{ doc.description }}</p>
                  </div>
                  <span class="badge badge-error badge-soft text-[10px] font-bold px-2 py-1">ຕ້ອງການ</span>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  
                  <div v-if="doc.preview" class="relative aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
                    
                    <button type="button" @click.stop="removeDocument(index, 'req')" 
                      class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 z-10 shadow-md hover:scale-110 transition-transform">
                      <span class="icon-[tabler--x] size-4"></span>
                    </button>

                    <img v-if="isImage(doc.preview)" :src="getFullImageUrl(doc.preview) || ''" class="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity" @click="openInNewTab(getFullImageUrl(doc.preview))" />
                    
                    <div v-else class="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors" @click="openInNewTab(getFullImageUrl(doc.preview))">
                      <span class="icon-[tabler--file-type-pdf] size-10 text-red-500 mb-1"></span>
                      <span class="text-[10px] text-center truncate px-2 w-full">PDF File</span>
                    </div>

                    <div class="absolute bottom-1 left-1 pointer-events-none">
                      <span v-if="doc.file" class="text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded shadow">ໃໝ່ກຽມອັບໂຫຼດ</span>
                      <span v-else class="text-[9px] bg-slate-500 text-white px-1.5 py-0.5 rounded shadow">ໄຟລ໌ເດີມໃນລະບົບ</span>
                    </div>
                  </div>

                  <label v-if="!doc.preview" class="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-400 transition-all group">
                    <input type="file" class="hidden" accept="image/*,.pdf" @change="(event) => handleDocumentUpload(index, event, 'req')" />
                    <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                      <span class="icon-[tabler--plus] size-6 text-slate-400 group-hover:text-indigo-600"></span>
                    </div>
                    <span class="text-[11px] font-bold text-slate-400 mt-2 group-hover:text-indigo-600">ເພີ່ມໄຟລ໌</span>
                  </label>
                  
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8 pt-6 border-t">
            <h4 class="font-medium mb-3 text-lg flex items-center gap-2">
              <span class="icon-[tabler--file-plus] size-5 text-primary"></span> ເອກະສານເພີ່ມເຕີມ (ບໍ່ບັງຄັບ)
            </h4>
            <div class="grid grid-cols-1 gap-4">
              <div v-for="(doc, index) in optionalDocs" :key="'opt-' + index" 
                   class="border rounded-2xl p-5 bg-white shadow-sm border-slate-200">
                
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <h5 class="font-bold text-slate-800">{{ doc.name }}</h5>
                    <p class="text-[11px] text-slate-400 mt-1">{{ doc.description }}</p>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  
                  <div v-if="doc.preview" class="relative aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
                    
                    <button type="button" @click.stop="removeDocument(index, 'opt')" 
                      class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 z-10 shadow-md hover:scale-110 transition-transform">
                      <span class="icon-[tabler--x] size-4"></span>
                    </button>

                    <img v-if="isImage(doc.preview)" :src="getFullImageUrl(doc.preview) || ''" class="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity" @click="openInNewTab(getFullImageUrl(doc.preview))" />
                    
                    <div v-else class="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors" @click="openInNewTab(getFullImageUrl(doc.preview))">
                      <span class="icon-[tabler--file-type-pdf] size-10 text-red-500 mb-1"></span>
                      <span class="text-[10px] text-center truncate px-2 w-full">PDF File</span>
                    </div>

                    <div class="absolute bottom-1 left-1 pointer-events-none">
                      <span v-if="doc.file" class="text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded shadow">ໃໝ່ກຽມອັບໂຫຼດ</span>
                      <span v-else class="text-[9px] bg-slate-500 text-white px-1.5 py-0.5 rounded shadow">ໄຟລ໌ເດີມໃນລະບົບ</span>
                    </div>
                  </div>

                  <label v-if="!doc.preview" class="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-400 transition-all group">
                    <input type="file" class="hidden" accept="image/*,.pdf" @change="(event) => handleDocumentUpload(index, event, 'opt')" />
                    <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                      <span class="icon-[tabler--plus] size-6 text-slate-400 group-hover:text-indigo-600"></span>
                    </div>
                    <span class="text-[11px] font-bold text-slate-400 mt-2 group-hover:text-indigo-600">ເພີ່ມໄຟລ໌</span>
                  </label>
                  
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="isUploading" class="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-center font-bold text-indigo-700 shadow-sm flex items-center justify-center gap-2">
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
  currentDocuments: any[]; 
}>()

const emit = defineEmits(['close', 'save'])

const isEditing = ref(false)
const isUploading = ref(false)

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

const isImage = (url: string) => /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(url || '')
const openInNewTab = (url: string | null | undefined) => { if (url) window.open(url, '_blank') }

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

// ປ່ຽນຈາກໂຕນີ້: const sortedCurrentDocuments = computed(() => { ... })
// ມາເປັນໂຕນີ້ແທນ:
const groupedDocuments = computed(() => {
  const docs = props.currentDocuments || [];
  const groups: Record<string, any[]> = {};
  
  // ຈັດກຸ່ມເອກະສານຕາມປະເພດ
  docs.forEach(doc => {
    const type = doc.document_type || doc.doc_type || 'other';
    if (!groups[type]) groups[type] = [];
    groups[type].push(doc);
  });

  const orderList = ['id_card', 'house_reg', 'salary_slip', 'other'];
  
  // ຈັດລຽງໝວດໝູ່ ແລະ ໃສ່ຂໍ້ມູນເພີ່ມເຕີມເຊັ່ນ: ບັງຄັບ ຫຼື ບໍ່ບັງຄັບ
  return Object.keys(groups)
    .sort((a, b) => {
      let indexA = orderList.indexOf(a);
      let indexB = orderList.indexOf(b);
      if (indexA === -1) indexA = 999;
      if (indexB === -1) indexB = 999;
      return indexA - indexB;
    })
    .map(type => {
      const isRequired = defaultRequiredDocs.some(d => d.id === type);
      return {
        type,
        isRequired,
        files: groups[type]
      };
    });
})

const initializeForms = () => {
  requiredDocs.value = defaultRequiredDocs.map(d => ({ ...d }))
  optionalDocs.value = defaultOptionalDocs.map(d => ({ ...d }))

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
  if (isUploading.value) return; 
  isEditing.value = false;
  emit('close');
}

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

const hasFilesToUpload = computed(() => {
  const files = [...requiredDocs.value, ...optionalDocs.value].filter(d => d.file !== null)
  return files.length > 0
})

const saveDocuments = () => {
  if (!hasFilesToUpload.value) return;
  
  isUploading.value = true;
  const filesToUpload = [...requiredDocs.value, ...optionalDocs.value].filter(d => d.file !== null);
  
  emit('save', filesToUpload, () => {
    isUploading.value = false;
    isEditing.value = false;
  });
}
</script>