<template>
  <div class="min-h-screen bg-slate-50 p-6 font-lao text-slate-800">
    <div class="max-w-6xl mx-auto space-y-6">

      <!-- 📌 HEADER -->
      <header class="bg-red-50 border border-red-200 p-6 rounded-2xl shadow-sm">
        <h1 class="text-2xl font-black text-red-700 flex items-center gap-2">
          <span class="icon-[tabler--settings-exclamation] size-8"></span> IT Support: ລະບົບແກ້ໄຂສິນເຊື່ອສຸກເສີນ
        </h1>
        <p class="text-sm text-red-600 mt-2 font-medium">
          (God Mode) ແກ້ໄຂສະຖານະ, ຮ້ານຄ້າ, ສິນຄ້າ ແລະ ຂໍ້ມູນການເງິນ. ລະບົບຈະຄືນສະຕັອກ ແລະ ສ້າງຕາຕະລາງຜ່ອນໃໝ່ອັດຕະໂນມັດ ຕາມໂຄງສ້າງ Hybrid System.
        </p>
      </header>

      <!-- 📌 SEARCH -->
      <section class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <label class="block text-sm font-bold text-slate-700 mb-2">ລະຫັດສິນເຊື່ອ (Loan ID)</label>
        <div class="flex gap-4">
          <input v-model="searchQuery" type="text" placeholder="LN-2026-0001"
            class="input input-bordered w-full max-w-md bg-white" @keyup.enter="searchLoan" />
          <button @click="searchLoan" class="btn bg-slate-800 text-white hover:bg-slate-700"
            :disabled="adminStore.isLoading">
            <span v-if="adminStore.isLoading" class="loading loading-spinner loading-sm"></span> ຄົ້ນຫາ
          </button>
        </div>
      </section>

      <!-- 📌 MAIN CONTENT -->
      <div v-if="snapshot" class="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <!-- 🔴 ฝั่งซ้าย: ข้อมูลเก่า (Read Only) -->
        <section class="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit opacity-90">
          <h3 class="text-lg font-bold text-slate-800 border-b pb-3 mb-4 flex items-center gap-2">
            <span class="icon-[tabler--database] size-5 text-slate-500"></span> ຂໍ້ມູນປັດຈຸບັນ
          </h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between border-b pb-2"><span class="text-slate-500">ສະຖານະ:</span> <b class="uppercase text-slate-700">{{ snapshot.status }}</b></div>
            <div class="flex justify-between border-b pb-2"><span class="text-slate-500">ລູກຄ້າ:</span> <b>{{ snapshot.customer?.first_name }} {{ snapshot.customer?.last_name }}</b></div>
            <div class="flex justify-between border-b pb-2"><span class="text-slate-500">ຮ້ານຄ້າ:</span> <b>{{ snapshot.partner_name }}</b></div>
            <div class="flex justify-between border-b pb-2"><span class="text-slate-500">ສິນຄ້າ:</span> <b>{{ snapshot.product?.product_name }}</b></div>
            <div class="flex justify-between border-b pb-2"><span class="text-slate-500">ຕົວເລືອກ:</span> <b>{{ snapshot.variant?.color || 'N/A' }}</b></div>
            <div class="flex justify-between border-b pb-2"><span class="text-slate-500">ຍອດຈັດ:</span> <b class="text-sky-700">{{ formatPrice(snapshot.total_amount) }}</b></div>
            <div class="flex justify-between border-b pb-2"><span class="text-slate-500">ດອກເບ້ຍ:</span> <b>{{ snapshot.interest_rate_at_apply }}% ({{ snapshot.loan_period }} ງວດ)</b></div>
            <div class="flex justify-between pb-2"><span class="text-slate-500">ຄ່າຜ່ອນ/ເດືອນ:</span> <b class="text-sky-600 font-black">{{ formatPrice(snapshot.monthly_pay) }}</b></div>
          </div>
        </section>

        <!-- 🔴 ฝั่งขวา: ฟอร์มแก้ไข (Draft State) -->
        <section class="lg:col-span-7 bg-white p-6 rounded-2xl shadow-xl border-2 border-red-200 space-y-4 relative">
          <h3 class="text-lg font-bold text-red-700 border-b pb-3 mb-4">ກຳນົດຄ່າໃໝ່ (Overrides)</h3>

          <div class="form-control mb-4 p-4 bg-red-50 border border-red-100 rounded-xl">
            <label class="label"><span class="label-text font-bold text-red-800">ປະເພດການແກ້ໄຂ (Action Type) *</span></label>
            <select v-model="overrideForm.action_type" class="select select-bordered w-full bg-white font-bold text-red-700">
              <option value="FULL_OVERRIDE">ແກ້ໄຂທຸກຂໍ້ມູນ (Full Override)</option>
              <option value="CHANGE_PARTNER">ປ່ຽນຮ້ານຄ້າ ແລະ ສິນຄ້າ (Change Partner & Product)</option>
              <option value="CHANGE_PRODUCT">ປ່ຽນສະເພາະສິນຄ້າ (Change Product Only)</option>
              <option value="CANCEL_ONLY">ຍົກເລີກບິນຖາວອນ (Cancel Only)</option>
              <option value="CANCEL_AND_RECREATE">ຍົກເລີກບິນເກົ່າ ແລະ ເຊື່ອມໂຍງບິນໃໝ່ (Cancel & Recreate)</option>
            </select>
          </div>

          <div v-if="overrideForm.action_type === 'CANCEL_AND_RECREATE'" class="form-control mb-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <label class="label"><span class="label-text font-bold text-orange-800">ລະຫັດບິນໃໝ່ທີ່ພະນັກງານສ້າງໄວ້ແລ້ວ (New Loan ID) *</span></label>
            <input v-model="overrideForm.replacement_loan_id_str" type="text" placeholder="ຕົວຢ່າງ: LN-2026-0099" class="input input-bordered w-full bg-white font-mono text-orange-900 font-bold" />
            <p class="text-xs text-orange-600 mt-2">ລະບົບຈະກວດສອບວ່າບິນນີ້ມີຢູ່ຈິງກ່ອນທຳການເຊື່ອມໂຍງຂໍ້ມູນ</p>
          </div>

          <div class="space-y-4">
            
            <!-- 🌟 Status Field: เพิ่ม :disabled="isStatusForward(...)" ในแต่ละตัวเลือก 🌟 -->
            <fieldset :disabled="isStatusLocked" class="form-control">
              <label class="label"><span class="label-text font-bold" :class="{'text-slate-400': isStatusLocked}">ປັບສະຖານະ (Status)</span></label>
              <select v-model="overrideForm.status" class="select select-bordered w-full bg-white font-bold text-slate-700">
                <option value="pending" :disabled="isStatusForward('pending')">ສົ່ງກັບໄປແກ້ໄຂໃໝ່ (Pending / Return)</option>
                <option value="verifying" :disabled="isStatusForward('verifying')">ລໍຖ້າຫົວໜ້າກວດກາ (Verifying)</option>
                <option value="verified" :disabled="isStatusForward('verified')">ລໍຖ້າຜູ້ບໍລິຫານອະນຸມັດ (Verified)</option>
                <option value="approved" :disabled="isStatusForward('approved')">ອະນຸມັດ (Approved)</option>
                <option value="disbursed" :disabled="isStatusForward('disbursed')">ປ່ອຍສິນເຊື່ອສຳເລັດ (Disbursed)</option>
                <option value="rejected">ປະຕິເສດ (Rejected)</option>
                <option value="cancelled">ຍົກເລີກສິນເຊື່ອ (Cancelled)</option>
              </select>
              <p v-if="!isStatusLocked" class="text-xs text-red-500 mt-1">* ລະບົບອະນຸຍາດໃຫ້ປັບສະຖານະຍ້ອນກັບໄດ້ເທົ່ານັ້ນ</p>
            </fieldset>

            <div class="divider text-sm text-slate-400">ຮ້ານຄ້າ ແລະ ສິນຄ້າ</div>

            <fieldset :disabled="isPartnerLocked" class="form-control relative w-full">
              <label class="label"><span class="label-text font-bold" :class="{'text-slate-400': isPartnerLocked}">ເລືອກຮ້ານຄ້າໃໝ່ (Partner)</span></label>
              <input v-model="partnerSearch" @focus="fetchPartnersOnFocus" @input="showPartnerDropdown = true" @blur="hidePartnerDropdown" type="text"
                placeholder="ພິມຊື່ຮ້ານຄ້າເພື່ອຄົ້ນຫາ..." class="input input-bordered w-full bg-white" />

              <div v-show="showPartnerDropdown && filteredPartners.length > 0 && !isPartnerLocked"
                class="absolute z-[9999] w-full top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                <div v-for="p in filteredPartners" :key="p.id" @mousedown.prevent="selectPartner(p)"
                  class="p-4 hover:bg-red-50 cursor-pointer border-b last:border-0 transition-colors">
                  <div class="font-bold text-slate-800">{{ p.shop_name }}</div>
                  <div class="text-xs text-slate-500">ຮ້ານຄ້າ ID: {{ p.id }}</div>
                </div>
              </div>
            </fieldset>

            <fieldset :disabled="isProductLocked" class="form-control relative w-full" v-if="overrideForm.partner_id">
              <label class="label"><span class="label-text font-bold" :class="{'text-slate-400': isProductLocked}">ເລືອກສິນຄ້າໃໝ່ (ສະເພາະລຸ້ນທີ່ມີສະຕັອກ)</span></label>
              <input v-model="productSearch" @focus="fetchProductsOnFocus" @input="showProductDropdown = true" @blur="hideProductDropdown" type="text"
                placeholder="ພິມ System SKU ຫຼື ຊື່ສິນຄ້າເພື່ອຄົ້ນຫາ..." class="input input-bordered w-full bg-white" />

              <div v-show="showProductDropdown && filteredProducts.length > 0 && !isProductLocked"
                class="absolute z-[9999] w-full top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                <div v-for="prod in filteredProducts" :key="prod.variant_id" @mousedown.prevent="selectProduct(prod)"
                  class="p-4 hover:bg-red-50 cursor-pointer border-b last:border-0 transition-colors flex justify-between items-center">
                  <div>
                    <div class="font-bold text-slate-800">{{ prod.product_name }}</div>
                    <div class="text-sm text-slate-600 mt-1">
                      <span class="font-mono text-xs bg-slate-200 px-1 py-0.5 rounded text-slate-700 mr-2">{{ prod.system_sku }}</span>
                      <span class="text-xs">ສີ: {{ prod.color || 'Default' }}</span>
                    </div>
                  </div>
                  <div class="text-sky-600 font-bold text-right">
                    <div>{{ formatPrice(prod.price) }} LAK</div>
                    <div class="text-xs text-slate-400 font-normal">ສະຕັອກ: {{ prod.stock_quantity }}</div>
                  </div>
                </div>
              </div>
            </fieldset>

            <div class="divider text-sm text-slate-400">ຂໍ້ມູນການເງິນ (Financials)</div>

            <fieldset :disabled="isFinancialsLocked" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label"><span class="label-text font-bold" :class="{'text-slate-400': isFinancialsLocked}">ຍອດຈັດ (Total Amount)</span></label>
                <input v-model.number="overrideForm.total_amount" type="number" class="input input-bordered w-full bg-white font-bold" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text font-bold" :class="{'text-slate-400': isFinancialsLocked}">ເງິນດາວ (Down Payment)</span></label>
                <input v-model.number="overrideForm.down_payment" type="number" class="input input-bordered w-full bg-white" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text font-bold" :class="{'text-slate-400': isFinancialsLocked}">ໄລຍະເວລາ (ເດືອນ)</span></label>
                <input v-model.number="overrideForm.loan_period" type="number" class="input input-bordered w-full bg-white" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text font-bold" :class="{'text-slate-400': isFinancialsLocked}">ດອກເບ້ຍ (%)</span></label>
                <input v-model.number="overrideForm.interest_rate" type="number" step="0.01" class="input input-bordered w-full bg-white" />
              </div>
            </fieldset>

            <div class="p-4 bg-sky-50 border border-sky-200 rounded-xl mt-4 flex justify-between items-center" :class="{'opacity-50': isFinancialsLocked}">
              <span class="text-sm font-bold text-sky-800">ຄ່າຜ່ອນປະເມີນໃໝ່ (New Monthly):</span>
              <span class="text-2xl font-black text-sky-600">{{ formatPrice(calculatedMonthlyPay) }} LAK</span>
            </div>
          </div>

          <div class="divider text-sm text-slate-400">AUDIT TRAIL (ບັງຄັບ)</div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label"><span class="label-text font-bold text-slate-700">Ref. Doc No. *</span></label>
              <input v-model="auditForm.reference_doc" type="text" placeholder="ເລກທີເອກະສານອ້າງອີງ" class="input input-bordered bg-white" required />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold text-slate-700">Reason *</span></label>
              <input v-model="auditForm.reason" type="text" placeholder="ເຫດຜົນການແກ້ໄຂ" class="input input-bordered bg-white" required />
            </div>

            <div class="form-control md:col-span-2">
              <label class="label"><span class="label-text font-bold text-red-600">ຮູບເອກະສານອະນຸມັດ (Approval Document) *</span></label>
              <input type="file" @change="handleFileUpload" accept="image/*,.pdf" class="file-input file-input-bordered w-full bg-white" required />
              <p class="text-xs text-slate-500 mt-1">ກະລຸນາແນບຮູບພາບ ຫຼື ຟາຍ PDF ທີ່ໄດ້ຮັບການອະນຸມັດຈາກຜູ້ບໍລິຫານແລ້ວ</p>
            </div>
          </div>

          <!-- 🚀 Execute Button -->
          <button @click="handleExecuteOverride" class="btn bg-red-600 hover:bg-red-700 text-white w-full mt-4" :disabled="!isFormValid || adminStore.isSubmitting">
            <span v-if="adminStore.isSubmitting" class="loading loading-spinner"></span> ຍືນຍັນການແກ້ໄຂ (EXECUTE OVERRIDE)
          </button>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onUnmounted } from 'vue';
import { useAdminLoanStore } from '@/stores/admin-loan';
import { useShopStore } from '@/stores/shop';
import { useProductStore } from '@/stores/product';
import { alert } from '@/utils/alert';

const adminStore = useAdminLoanStore();
const shopStore = useShopStore();
const productStore = useProductStore();

const searchQuery = ref('');
const snapshot = computed(() => adminStore.loanSnapshot);

const overrideForm = reactive({
  action_type: 'FULL_OVERRIDE',
  status: '',
  partner_id: null as number | null,
  product_id: null as number | null,
  variant_id: null as number | null,
  total_amount: 0,
  down_payment: 0,
  loan_period: 0,
  interest_rate: 0,
  replacement_loan_id_str: '' 
});
const auditForm = reactive({ reference_doc: '', reason: '' });
const approvalFile = ref<File | null>(null);

// ==========================================
// 🌟 1. Logic สำหรับล็อคฟอร์ม (Disabled Fields) 🌟
// ==========================================
const isFormGloballyLocked = computed(() => ['cancelled', 'rejected'].includes(snapshot.value?.status || ''));

// Status: ล็อคไว้ถ้าไม่ใช่ FULL_OVERRIDE
const isStatusLocked = computed(() => isFormGloballyLocked.value || overrideForm.action_type !== 'FULL_OVERRIDE');

// Partner: ล็อคหากเปลี่ยนแค่สินค้าอย่างเดียว หรือสั่งยกเลิก
const isPartnerLocked = computed(() => isFormGloballyLocked.value || ['CANCEL_ONLY', 'CANCEL_AND_RECREATE', 'CHANGE_PRODUCT'].includes(overrideForm.action_type));

// Product/Financials: ล็อคเฉพาะตอนยกเลิก
const isProductLocked = computed(() => isFormGloballyLocked.value || ['CANCEL_ONLY', 'CANCEL_AND_RECREATE'].includes(overrideForm.action_type));
const isFinancialsLocked = computed(() => isFormGloballyLocked.value || ['CANCEL_ONLY', 'CANCEL_AND_RECREATE'].includes(overrideForm.action_type));

// ==========================================
// 🌟 [ใหม่] ป้องกันการเปลี่ยนสถานะไปด้านหน้า 🌟
// ==========================================
const statusProgression = ['pending', 'verifying', 'verified', 'approved', 'disbursed'];

const isStatusForward = (optionValue: string) => {
  if (!snapshot.value) return false;
  const currentIndex = statusProgression.indexOf(snapshot.value.status);
  const optionIndex = statusProgression.indexOf(optionValue);

  // ถ้าสถานะทั้งคู่รวมอยู่ใน progression ให้เช็คว่า Index ของ Option เกินกว่าสถานะเดิมหรือไม่
  if (currentIndex !== -1 && optionIndex !== -1) {
    return optionIndex > currentIndex;
  }
  return false;
};

// ==========================================
// 🌟 2. Watcher ป้องกัน Data รบกวน (Auto-Reset) 🌟
// ==========================================
watch(() => overrideForm.action_type, (newType) => {
  if (!snapshot.value) return;

  // 1. จัดการ Status อัตโนมัติ
  if (['CANCEL_ONLY', 'CANCEL_AND_RECREATE'].includes(newType)) {
    overrideForm.status = 'cancelled';
  } else {
    overrideForm.status = snapshot.value.status;
  }

  // 2. เคลียร์รหัสบิลใหม่ หากเปลี่ยนใจไม่ Recreate แล้ว
  if (newType !== 'CANCEL_AND_RECREATE') {
    overrideForm.replacement_loan_id_str = '';
  }

  // 3. เคลียร์ร้านค้า หากเลือกผิดประเภท
  if (['CHANGE_PRODUCT', 'CANCEL_ONLY', 'CANCEL_AND_RECREATE'].includes(newType)) {
    overrideForm.partner_id = snapshot.value.product?.partner_id || null;
    partnerSearch.value = snapshot.value.partner_name || '';
  }

  // 4. เคลียร์สินค้าและการเงิน หากสั่งยกเลิก
  if (['CANCEL_ONLY', 'CANCEL_AND_RECREATE'].includes(newType)) {
    overrideForm.product_id = snapshot.value.product_id;
    overrideForm.variant_id = snapshot.value.variant_id;
    overrideForm.total_amount = snapshot.value.total_amount;
    overrideForm.down_payment = snapshot.value.down_payment;
    overrideForm.loan_period = snapshot.value.loan_period;
    overrideForm.interest_rate = snapshot.value.interest_rate_at_apply;
    productSearch.value = snapshot.value.variant?.system_sku
      ? `${snapshot.value.variant?.system_sku} - ${snapshot.value.product?.product_name}`
      : (snapshot.value.product?.product_name || '');
  }
});

// ==========================================
// 🌟 3. ระบบการค้นหา และ Typeahead 🌟
// ==========================================
const partnerSearch = ref('');
const showPartnerDropdown = ref(false);
const productSearch = ref('');
const showProductDropdown = ref(false);

const filteredPartners = computed(() => {
  const query = partnerSearch.value.toLowerCase();
  return shopStore.shops.filter((p: any) => p.shop_name?.toLowerCase().includes(query) || String(p.id).includes(query));
});

const flatProductVariants = computed(() => {
  const list: any[] = [];
  productStore.products.forEach((p: any) => {
    if (p.variants && p.variants.length > 0) {
      p.variants.forEach((v: any) => {
        list.push({ product_id: p.id, variant_id: v.id, product_name: p.product_name, system_sku: v.system_sku, color: v.color, price: v.price, stock_quantity: v.stock_quantity });
      });
    } else {
      list.push({ product_id: p.id, variant_id: null, product_name: p.product_name, system_sku: p.system_sku, color: 'Default', price: p.price, stock_quantity: p.stock_quantity || 0 });
    }
  });
  return list;
});

const filteredProducts = computed(() => {
  const query = productSearch.value.toLowerCase();
  if (!query) return flatProductVariants.value;
  return flatProductVariants.value.filter(v => (v.product_name || '').toLowerCase().includes(query) || (v.system_sku || '').toLowerCase().includes(query));
});

const hidePartnerDropdown = () => { setTimeout(() => { showPartnerDropdown.value = false; }, 200); };
const hideProductDropdown = () => { setTimeout(() => { showProductDropdown.value = false; }, 200); };

const fetchPartnersOnFocus = async () => {
  showPartnerDropdown.value = true;
  if (shopStore.shops.length === 0) await shopStore.fetchAllShop();
};

const fetchProductsOnFocus = async () => {
  showProductDropdown.value = true;
  if (overrideForm.partner_id) await productStore.fetchProducts({ shop_id: overrideForm.partner_id, limit: 1000 });
};

const selectPartner = (p: any) => {
  overrideForm.partner_id = p.id;
  partnerSearch.value = p.shop_name;
  showPartnerDropdown.value = false;
  overrideForm.product_id = null;
  overrideForm.variant_id = null;
  productSearch.value = '';
  productStore.clearProducts();
};

const selectProduct = (prod: any) => {
  overrideForm.product_id = prod.product_id;
  overrideForm.variant_id = prod.variant_id;
  productSearch.value = `${prod.system_sku} - ${prod.product_name}`;
  overrideForm.total_amount = Number(prod.price || 0);
  showProductDropdown.value = false;
};

// ==========================================
// 🌟 4. ระบบการคำนวน ແລະ ส่งข้อมูล 🌟
// ==========================================
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  // 🌟 FIX: Use Optional Chaining and Nullish Coalescing to satisfy strict type rules
  approvalFile.value = target.files?.[0] ?? null;
};

const calculatedMonthlyPay = computed(() => {
  const principal = Math.max(0, overrideForm.total_amount - overrideForm.down_payment);
  if (!principal || !overrideForm.interest_rate || !overrideForm.loan_period) return 0;
  const ratePerMonth = overrideForm.interest_rate / 100;
  return Math.round((principal / overrideForm.loan_period) + (principal * ratePerMonth));
});

// ตรวจสอบความถูกต้องของฟอร์ม
const isFormValid = computed(() => {
  const isAuditValid = auditForm.reference_doc.trim() !== '' && auditForm.reason.trim() !== '' && approvalFile.value !== null;
  if (overrideForm.action_type === 'CANCEL_AND_RECREATE') {
    return isAuditValid && overrideForm.replacement_loan_id_str.trim() !== '';
  }
  return isAuditValid;
});

const formatPrice = (price: number | undefined) => Number(price || 0).toLocaleString('en-US');

const searchLoan = async () => {
  if (!searchQuery.value) return;
  try {
    await adminStore.fetchLoanDetails(searchQuery.value);

    if (snapshot.value) {
      overrideForm.action_type = 'FULL_OVERRIDE';
      overrideForm.status = snapshot.value.status;
      overrideForm.partner_id = snapshot.value.product?.partner_id || null;
      overrideForm.product_id = snapshot.value.product_id;
      overrideForm.variant_id = snapshot.value.variant_id;
      overrideForm.total_amount = snapshot.value.total_amount;
      overrideForm.down_payment = snapshot.value.down_payment;
      overrideForm.loan_period = snapshot.value.loan_period;
      overrideForm.interest_rate = snapshot.value.interest_rate_at_apply;
      overrideForm.replacement_loan_id_str = '';

      auditForm.reference_doc = ''; auditForm.reason = ''; approvalFile.value = null;
      partnerSearch.value = snapshot.value.partner_name || '';

      productSearch.value = snapshot.value.variant?.system_sku
        ? `${snapshot.value.variant?.system_sku} - ${snapshot.value.product?.product_name}`
        : (snapshot.value.product?.product_name || '');

      productStore.clearProducts();
    }
  } catch (err: any) {
    alert.error('ບໍ່ພົບຂໍ້ມູນ', err.message);
  }
};

const handleExecuteOverride = async () => {
  if (!snapshot.value) return;

  const expectedLoanId = snapshot.value.loan_id;
  const userInput = await alert.prompt(
    'ຢືນຢັນການຂຽນທັບລະບົບອັນຕະລາຍ!',
    `ການແກ້ໄຂນີ້ຈະທຳການຄືນສະຕັອກ ແລະ ສ້າງຕາຕະລາງຜ່ອນໃໝ່ອັດຕະໂນມັດ ຖ້າຈຳເປັນ.<br><br>ກະລຸນາພິມລະຫັດ <b>${expectedLoanId}</b> ເພື່ອຢືນຢັນ:`,
    'ພິມລະຫັດສິນເຊື່ອຢູ່ນີ້...'
  );

  if (userInput === null) return;
  if (userInput.trim() !== expectedLoanId) {
    alert.error('ການຢືນຢັນລົ້ມເຫຼວ', 'ລະຫັດສິນເຊື່ອບໍ່ກົງກັນ!');
    return;
  }

  if (!approvalFile.value) {
    alert.error('ຂໍ້ຜິດພາດ', 'ກະລຸນາແນບຮູບເອກະສານອະນຸມັດກ່ອນ!');
    return;
  }

  alert.showLoading('ກຳລັງປະມວນຜົນການຂຽນທັບລະບົບ...');
  try {
    const payloadObj = {
      action: overrideForm.action_type,
      data: { ...overrideForm, monthly_pay: calculatedMonthlyPay.value },
      audit: { reference_doc: auditForm.reference_doc, reason: auditForm.reason }
    };

    const formData = new FormData();
    formData.append('payload', JSON.stringify(payloadObj));
    formData.append('document', approvalFile.value);

    await adminStore.executeLoanOverride(snapshot.value.id, formData);

    if (overrideForm.action_type === 'CANCEL_AND_RECREATE') {
      alert.success('ສຳເລັດ!', `ຍົກເລີກບິນເກົ່າ ແລະ ເຊື່ອມໂຍງບິນໃໝ່ (${overrideForm.replacement_loan_id_str}) ສຳເລັດແລ້ວ.`);
    } else if (overrideForm.action_type === 'CANCEL_ONLY') {
      alert.success('ສຳເລັດ!', 'ຍົກເລີກບິນຖາວອນສຳເລັດແລ້ວ.');
    } else {
      alert.success('ສຳເລັດ!', 'ອັບເດດຂໍ້ມູນສຳເລັດ ທ່ານສາມາດພິມສັນຍາໃໝ່ໄດ້ເລີຍ.');
    }
  } catch (error: any) {
    alert.error('ເກີດຂໍ້ຜິດພາດ', error.message || 'ລົ້ມເຫຼວໃນການແກ້ໄຂ');
  }
};

onUnmounted(() => {
  adminStore.clearState();
  productStore.clearProducts();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@300;400;600;700;900&display=swap');
.font-lao { font-family: 'Noto Sans Lao', sans-serif; }
</style>