
<template>
  <teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-5xl mx-auto max-h-[90vh] overflow-y-auto">

        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold flex items-center gap-2">
            <span class="icon-[tabler--user-edit] size-6 text-primary"></span>
            {{ isEditing ? 'ແກ້ໄຂຂໍ້ມູນສະມາຊິກ ແລະ ວົງເງິນ' : 'ລາຍລະອຽດສະມາຊິກ ແລະ ວົງເງິນ' }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <span class="icon-[tabler--x] size-5"></span>
          </button>
        </div>

        <!-- 🌟 TABS -->
        <div class="flex w-full overflow-x-auto no-scrollbar border-b border-gray-200 dark:border-gray-700 mb-6">
          <button @click="activeTab = 'profile'"
            class="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 min-w-[80px] border-b-2 transition-all whitespace-nowrap"
            :class="activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary hover:bg-gray-50'">
            <span class="icon-[tabler--file-description] size-6"></span>
            <span class="text-xs font-bold">ຂໍ້ມູນສະໝັກ / ວົງເງິນ</span>
          </button>
          <button @click="activeTab = 'documents'"
            class="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 min-w-[80px] border-b-2 transition-all whitespace-nowrap"
            :class="activeTab === 'documents' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary hover:bg-gray-50'">
            <span class="icon-[basil--attach-outline] size-6"></span>
            <span class="text-xs font-bold">ເອກະສານ (KYC)</span>
          </button>
          <button @click="activeTab = 'map'"
            class="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 min-w-[80px] border-b-2 transition-all whitespace-nowrap"
            :class="activeTab === 'map' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary hover:bg-gray-50'">
            <span class="icon-[tabler--map-pin] size-6"></span>
            <span class="text-xs font-bold">ແຜນທີ່ທີ່ຕັ້ງ</span>
          </button>
        </div>

        <!-- 🌟 TAB 1: PROFILE & CREDIT (VIEW OR EDIT) -->
        <div v-if="activeTab === 'profile'" class="space-y-6">
          
          <!-- ============================================== -->
          <!-- 🟢 VIEW MODE (ເບິ່ງລາຍລະອຽດ) -->
          <!-- ============================================== -->
          <div v-if="!isEditing" class="space-y-6">
            <!-- Header Profile -->
            <div class="flex items-center gap-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <div class="w-20 h-20 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-primary shadow-sm">
                <img v-if="getCustomerInfo().profile_image_url" :src="getCustomerInfo().profile_image_url" class="w-full h-full object-cover" />
                <span v-else class="icon-[tabler--user] size-10 text-gray-400"></span>
              </div>
              <div class="flex-1">
                <h4 class="font-bold text-xl text-indigo-900">{{ getCustomerInfo().first_name }} {{ getCustomerInfo().last_name || '' }}</h4>
                <p class="text-sm text-indigo-700 flex items-center gap-1 mt-1">
                  <span class="icon-[tabler--phone] size-4"></span> {{ getCustomerInfo().phone }}
                  <span class="mx-2">|</span>
                  <span class="icon-[tabler--id] size-4"></span> ID: {{ getCustomerInfo().identity_number || '-' }}
                </p>
              </div>
              <div class="text-right">
                <span class="badge badge-lg border-0 text-white shadow-sm" :class="getKycBadgeClass(getCustomerInfo().kyc_status)">
                  {{ getKycStatusText(getCustomerInfo().kyc_status) }}
                </span>
                <p class="text-xs text-gray-500 mt-2">ລະຫັດສະມາຊິກ: <strong class="text-gray-800">{{ getCustomerInfo().member_code || '-' }}</strong></p>
              </div>
            </div>

            <!-- View: ຂໍ້ມູນສ່ວນຕົວ & ທີ່ຢູ່ -->
            <div class="bg-white border rounded-xl p-5 shadow-sm">
              <h5 class="font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2"><span class="icon-[tabler--user] text-primary"></span> 1-2. ຂໍ້ມູນສ່ວນຕົວ ແລະ ທີ່ຢູ່</h5>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6">
                <div><label class="text-xs text-gray-500 block">ເພດ</label><p class="font-medium text-sm">{{ getCustomerInfo().gender === 'Male' ? 'ຊາຍ' : (getCustomerInfo().gender === 'Female' ? 'ຍິງ' : '-') }}</p></div>
                <div><label class="text-xs text-gray-500 block">ວັນເດືອນປີເກີດ</label><p class="font-medium text-sm">{{ formatDateOnly(getCustomerInfo().date_of_birth) }}</p></div>
                <div class="col-span-2"><label class="text-xs text-gray-500 block">ເລກບັນຊີທະນາຄານ</label><p class="font-medium text-sm text-indigo-600">{{ getCustomerInfo().account_number || '-' }}</p></div>
                <div class="col-span-4"><label class="text-xs text-gray-500 block">ທີ່ຢູ່ປະຈຸບັນ</label><p class="font-medium text-sm">{{ getCustomerInfo().address || '-' }}</p></div>
              </div>
            </div>

            <!-- View: ຂໍ້ມູນອາຊີບ ແລະ ການເງິນ -->
            <div class="bg-white border rounded-xl p-5 shadow-sm">
              <h5 class="font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2"><span class="icon-[tabler--briefcase] text-primary"></span> 3-4. ຂໍ້ມູນອາຊີບ ແລະ ການເງິນ</h5>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6">
                <div class="col-span-2"><label class="text-xs text-gray-500 block">ອາຊີບ / ປະເພດວຽກ</label><p class="font-medium text-sm">{{ getCustomerInfo().occupation || getWorkInfo().business_type || '-' }}</p></div>
                <div class="col-span-2"><label class="text-xs text-gray-500 block">ສະຖານທີ່ເຮັດວຽກ</label><p class="font-medium text-sm">{{ getWorkInfo().company_name || '-' }} ({{ getWorkInfo().position || '-' }})</p></div>
                <div><label class="text-xs text-gray-500 block">ເບີໂທບ່ອນເຮັດວຽກ</label><p class="font-medium text-sm">{{ getWorkInfo().phone || '-' }}</p></div>
                <div><label class="text-xs text-gray-500 block">ພະແນກ</label><p class="font-medium text-sm">{{ getWorkInfo().department || '-' }}</p></div>
                <div><label class="text-xs text-gray-500 block">ປະເພດທຸລະກິດ</label><p class="font-medium text-sm">{{ getWorkInfo().business_type || '-' }}</p></div>
                <div><label class="text-xs text-gray-500 block">ອາຍຸງານ</label><p class="font-medium text-sm">{{ getWorkInfo().duration_years || 0 }} ປີ {{ getWorkInfo().duration_months || 0 }} ເດືອນ</p></div>
                <div class="col-span-4"><label class="text-xs text-gray-500 block">ລາຍລະອຽດທຸລະກິດ</label><p class="font-medium text-sm">{{ getWorkInfo().business_detail || '-' }}</p></div>
                <div class="col-span-4"><label class="text-xs text-gray-500 block">ທີ່ຕັ້ງບ່ອນເຮັດວຽກ</label><p class="font-medium text-sm">{{ getWorkInfo().address || '-' }}</p></div>
                
                <div class="col-span-4 border-t pt-4 mt-2"></div>
                <div><label class="text-xs text-gray-500 block">ລາຍຮັບຕໍ່ເດືອນ</label><p class="font-bold text-sm text-success">{{ formatPrice(getCustomerInfo().income_per_month) }} ກີບ</p></div>
                <div><label class="text-xs text-gray-500 block">ໜີ້ສິນອື່ນໆຄົງເຫຼືອ</label><p class="font-medium text-sm text-error">{{ formatPrice(getCustomerInfo().other_debt || 0) }} ກີບ</p></div>
                <div class="col-span-2">
                  <label class="text-xs text-gray-500 block">ເງິນທີ່ຕ້ອງຈ່າຍໜີ້ຕໍ່ເດືອນ</label>
                  <p class="font-medium text-sm text-error">{{ formatPrice(getSnapshot().financial_snapshot_json?.monthly_debt_payment || 0) }} ກີບ</p>
                </div>
              </div>
            </div>

            <!-- View: ຂໍ້ມູນຄຳຮ້ອງຂໍວົງເງິນ -->
            <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-5 shadow-sm">
              <h5 class="font-bold text-indigo-900 border-b border-indigo-200 pb-2 mb-4 flex items-center gap-2"><span class="icon-[tabler--credit-card] text-indigo-600"></span> 5-6. ຄຳຮ້ອງຂໍສິນເຊື່ອສະມາຊິກ</h5>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
                <div><label class="text-xs text-indigo-700 block">ວົງເງິນທີ່ຕ້ອງການຂໍ</label><p class="font-black text-lg text-indigo-600">{{ formatPrice(getAppInfo().requested_credit_limit || 0) }} ₭</p></div>
                <div class="col-span-2"><label class="text-xs text-indigo-700 block">ຈຸດປະສົງການຂໍ / ສິນຄ້າ</label><p class="font-medium text-sm">{{ getPurposeName(getAppInfo().purpose_id) }} ({{ getAppInfo().requested_product_type || '-' }})</p></div>
                <div class="col-span-3"><label class="text-xs text-indigo-700 block">ລາຍລະອຽດການນຳໃຊ້ (Usage Goal)</label><p class="font-medium text-sm text-gray-700 bg-white p-2 rounded border">{{ getAppInfo().usage_goal || 'ບໍ່ມີລາຍລະອຽດ' }}</p></div>
                <div class="col-span-3"><label class="text-xs text-indigo-700 block">ໝາຍເຫດ</label><p class="font-medium text-sm text-gray-600">{{ getAppInfo().remarks || '-' }}</p></div>
                
                <div class="col-span-3 border-t border-indigo-200 pt-4 mt-2">
                   <div class="flex items-center gap-2">
                     <span class="icon-[tabler--circle-check-filled] text-emerald-500 size-5"></span>
                     <span class="text-sm text-gray-700 font-medium">ລູກຄ້າຍອມຮັບເງື່ອນໄຂການກວດສອບ CIB ແລະ ຢືນຢັນຄວາມຖືກຕ້ອງແລ້ວ</span>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ============================================== -->
          <!-- 🔴 EDIT MODE (ແກ້ໄຂຂໍ້ມູນທັງ 6 ພາກສ່ວນ) -->
          <!-- ============================================== -->
          <div v-else class="space-y-8 animate-in fade-in duration-300">
            <!-- 🟢 ຮູບໂປຣໄຟລ໌ -->
            <div class="flex flex-col items-center justify-center border-b pb-6 border-dashed">
              <div class="relative group cursor-pointer" @click="triggerProfileUpload">
                <div class="w-24 h-24 rounded-full overflow-hidden border-4 border-primary bg-gray-100 shadow-sm">
                  <img v-if="profilePreview || getCustomerInfo().profile_image_url" :src="profilePreview || getCustomerInfo().profile_image_url" class="w-full h-full object-cover" />
                  <span v-else class="icon-[tabler--camera] size-8 text-gray-400 mt-7 ml-7"></span>
                </div>
                <div class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span class="icon-[tabler--pencil] size-6 text-white"></span>
                </div>
                <input ref="profileInput" type="file" class="hidden" accept="image/*" @change="handleProfileSelect" />
              </div>
              <p class="text-xs text-gray-500 mt-2 font-medium">ຄລິກເພື່ອປ່ຽນຮູບໂປຣໄຟລ໌</p>
            </div>

            <!-- 1. PERSONAL -->
            <div>
              <h3 class="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2"><span class="icon-[tabler--id] text-primary"></span> 1. ຂໍ້ມູນສ່ວນຕົວ (Personal Information)</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                  <label class="label"><span class="label-text font-medium">ຊື່ແທ້ (ພາສາລາວ) *</span></label>
                  <input v-model="editForm.first_name" type="text" class="input input-sm input-bordered w-full" :class="{ 'input-error': editErrors.first_name }" @input="editForm.first_name = filterLaoTextOnly(editForm.first_name)" />
                  <label v-if="editErrors.first_name" class="label text-error p-0 pt-1"><span class="label-text-alt">{{ editErrors.first_name }}</span></label>
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text font-medium">ນາມສະກຸນ (ພາສາລາວ) *</span></label>
                  <input v-model="editForm.last_name" type="text" class="input input-sm input-bordered w-full" :class="{ 'input-error': editErrors.last_name }" @input="editForm.last_name = filterLaoTextOnly(editForm.last_name)" />
                  <label v-if="editErrors.last_name" class="label text-error p-0 pt-1"><span class="label-text-alt">{{ editErrors.last_name }}</span></label>
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text font-medium">ເບີໂທລະສັບ (020/20 XXXXXXXX) *</span></label>
                  <input 
                    v-model="editForm.phone" 
                    type="tel" 
                    class="input input-sm input-bordered w-full" 
                    :class="{ 'input-error': editErrors.phone }" 
                    maxlength="11" 
                    @input="editForm.phone = editForm.phone.replace(/\D/g, '')" 
                  />
                  <label v-if="editErrors.phone" class="label text-error p-0 pt-1"><span class="label-text-alt">{{ editErrors.phone }}</span></label>
                </div>
                <div class="form-control"><label class="label"><span class="label-text font-medium">ເພດ *</span></label><select v-model="editForm.gender" class="select select-sm select-bordered w-full" :class="{ 'select-error': editErrors.gender }"><option value="" disabled>-- ເລືອກ --</option><option value="Male">ຊາຍ (Male)</option><option value="Female">ຍິງ (Female)</option></select></div>
                <div class="form-control"><label class="label"><span class="label-text font-medium">ວັນເດືອນປີເກີດ *</span></label><input v-model="editForm.date_of_birth" type="date" class="input input-sm input-bordered w-full" :class="{ 'input-error': editErrors.date_of_birth }" /></div>
                <div class="form-control"><label class="label"><span class="label-text font-medium">ເລກບັດປະຈຳຕົວ / ສຳມະໂນຄົວ *</span></label><input v-model="editForm.identity_number" type="text" class="input input-sm input-bordered w-full" :class="{ 'input-error': editErrors.identity_number }" /></div>
                <div class="form-control md:col-span-2"><label class="label"><span class="label-text font-medium text-indigo-600">ເລກບັນຊີທະນາຄານ (BCEL)</span></label><input v-model="editForm.account_number" type="text" class="input input-sm input-bordered w-full border-indigo-200" /></div>
              </div>
            </div>

            <!-- 2. ADDRESS -->
            <div>
              <h3 class="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2"><span class="icon-[tabler--home] text-primary"></span> 2. ຂໍ້ມູນທີ່ຢູ່ປັດຈຸບັນ (Residential Address)</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control"><label class="label"><span class="label-text font-medium">ແຂວງ *</span></label>
                  <select v-model="editForm.province_id" @change="handleProvinceChange" class="select select-sm select-bordered w-full" :class="{ 'select-error': editErrors.province_id }"><option value="" disabled>-- ເລືອກ --</option><option v-for="p in addressStore.provinces" :key="p.province_id" :value="p.province_id">{{ p.province_name }}</option></select>
                </div>
                <div class="form-control"><label class="label"><span class="label-text font-medium">ເມືອງ *</span></label>
                  <select v-model="editForm.district_id" :disabled="!editForm.province_id || addressStore.loading" class="select select-sm select-bordered w-full" :class="{ 'select-error': editErrors.district_id }"><option value="" disabled>-- ເລືອກ --</option><option v-for="d in addressStore.districts" :key="d.district_id" :value="d.district_id">{{ d.district_name }}</option></select>
                </div>
                <div class="form-control md:col-span-2"><label class="label"><span class="label-text font-medium">ບ້ານ / ໜ່ວຍ / ເຮືອນເລກທີ *</span></label><input v-model="editForm.address" type="text" class="input input-sm input-bordered w-full" :class="{ 'input-error': editErrors.address }" @input="editForm.address = filterLaoTextWithSymbols(editForm.address)" /></div>
              </div>
            </div>

            <!-- 3. EMPLOYMENT -->
            <div>
              <h3 class="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2"><span class="icon-[tabler--briefcase] text-primary"></span> 3. ຂໍ້ມູນອາຊີບ ແລະ ການເຮັດວຽກ (Employment Info)</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control"><label class="label"><span class="label-text font-medium">ປະເພດການຈ້າງງານ *</span></label><select v-model="editForm.employment_type" class="select select-sm select-bordered w-full" :class="{ 'select-error': editErrors.employment_type }"><option value="" disabled>-- ເລືອກ --</option><option v-for="item in employmentTypes" :key="item.value" :value="item.value">{{ item.label }}</option></select></div>
                <div class="form-control"><label class="label"><span class="label-text font-medium">ອາຊີບ *</span></label><input v-model="editForm.occupation" type="text" class="input input-sm input-bordered w-full" :class="{ 'input-error': editErrors.occupation }" @input="editForm.occupation = filterLaoTextOnly(editForm.occupation)" /></div>
                <div class="form-control"><label class="label"><span class="label-text font-medium">ຊື່ບໍລິສັດ / ຮ້ານຄ້າ *</span></label><input v-model="editForm.company_name" type="text" class="input input-sm input-bordered w-full" :class="{ 'input-error': editErrors.company_name }" @input="editForm.company_name = filterLaoTextWithSymbols(editForm.company_name)" /></div>
                <div class="form-control"><label class="label"><span class="label-text font-medium">ຕຳແໜ່ງ</span></label><input v-model="editForm.job_position" type="text" class="input input-sm input-bordered w-full" @input="editForm.job_position = filterLaoTextOnly(editForm.job_position)" /></div>

                <!-- Work phone with Lao telephone format validation -->
                <div class="form-control">
                  <label class="label"><span class="label-text font-medium">ເບີໂທບ່ອນເຮັດວຽກ</span></label>
                  <input 
                    v-model="editForm.work_phone" 
                    type="tel" 
                    class="input input-sm input-bordered w-full" 
                    placeholder="021XXXXXX ຫຼື 020XXXXXXXX" 
                    maxlength="11" 
                    :class="{ 'input-error': editErrors.work_phone }"
                    @input="editForm.work_phone = editForm.work_phone.replace(/\D/g, '')" 
                  />
                  <label v-if="editErrors.work_phone" class="label text-error p-0 pt-1"><span class="label-text-alt">{{ editErrors.work_phone }}</span></label>
                </div>

                <div class="form-control">
                  <label class="label"><span class="label-text font-medium">ພະແນກ (Department)</span></label>
                  <input v-model="editForm.department" type="text" class="input input-sm input-bordered w-full" placeholder="ຕົວຢ່າງ: ພະແນກການຕະຫຼາດ" @input="editForm.department = filterLaoTextOnly(editForm.department)" />
                </div>

                <div class="form-control">
                  <label class="label"><span class="label-text font-medium">ປະເພດທຸລະກິດ (Business Type)</span></label>
                  <input v-model="editForm.business_type" type="text" class="input input-sm input-bordered w-full" placeholder="ຕົວຢ່າງ: ໄອທີ, ຂາຍຍ່ອຍ, ກໍ່ສ້າງ..." @input="editForm.business_type = filterLaoTextOnly(editForm.business_type)" />
                </div>

                <div class="form-control md:col-span-2">
                  <label class="label"><span class="label-text font-medium">ລາຍລະອຽດທຸລະກິດ (Business Detail)</span></label>
                  <input v-model="editForm.business_detail" type="text" class="input input-sm input-bordered w-full" placeholder="ລາຍລະອຽດເພີ່ມເຕີມກ່ຽວກັບທຸລະກິດ..." @input="editForm.business_detail = filterLaoTextWithSymbols(editForm.business_detail)" />
                </div>

                <div class="form-control"><label class="label"><span class="label-text font-medium">ອາຍຸງານ</span></label><div class="flex gap-2"><input v-model.number="editForm.work_duration_years" type="number" min="0" class="input input-sm input-bordered w-full" placeholder="ປີ" /><input v-model.number="editForm.work_duration_months" type="number" min="0" max="11" class="input input-sm input-bordered w-full" placeholder="ເດືອນ" /></div></div>
                <div class="form-control md:col-span-2">
                  <label class="label"><span class="label-text font-medium">ສະຖານທີ່ເຮັດວຽກ (Work Location)</span></label>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <select v-model="editForm.work_province_id" class="select select-sm select-bordered w-full"><option value="">- ແຂວງ -</option><option v-for="p in addressStore.provinces" :key="p.province_id" :value="p.province_id">{{ p.province_name }}</option></select>
                    <select v-model="editForm.work_district_id" :disabled="!editForm.work_province_id" class="select select-sm select-bordered w-full"><option value="">- ເມືອງ -</option><option v-for="d in workDistricts" :key="d.district_id" :value="d.district_id">{{ d.district_name }}</option></select>
                    <input v-model="editForm.work_address" type="text" class="input input-sm input-bordered w-full" placeholder="ບ້ານ/ໜ່ວຍ/ຖະໜົນ..." @input="editForm.work_address = filterLaoTextWithSymbols(editForm.work_address)" />
                  </div>
                </div>
              </div>
            </div>

            <!-- 4. FINANCIAL -->
            <div>
              <h3 class="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2"><span class="icon-[tabler--coin] text-primary"></span> 4. ຂໍ້ມູນການເງິນ (Financial Information)</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="form-control"><label class="label"><span class="label-text font-medium">ລາຍຮັບຕໍ່ເດືອນ (ກີບ) *</span></label><input :value="formatCurrencyInput(editForm.monthly_income)" @input="handleCurrencyInput('monthly_income', $event)" type="text" class="input input-sm input-bordered w-full text-success font-bold" :class="{ 'input-error': editErrors.monthly_income }" /></div>
                <div class="form-control"><label class="label"><span class="label-text font-medium">ໜີ້ສິນອື່ນໆຄົງເຫຼືອລວມ (ກີບ)</span></label><input :value="formatCurrencyInput(editForm.other_debts)" @input="handleCurrencyInput('other_debts', $event)" type="text" class="input input-sm input-bordered w-full font-bold" /></div>
                <div class="form-control"><label class="label"><span class="label-text font-medium text-error">ເງິນທີ່ຕ້ອງຈ່າຍໜີ້ຕໍ່ເດືອນ *</span></label><input :value="formatCurrencyInput(editForm.monthly_debt_payment)" @input="handleCurrencyInput('monthly_debt_payment', $event)" type="text" class="input input-sm input-bordered w-full text-error font-bold" :class="{ 'input-error': editErrors.monthly_debt_payment }" /></div>
              </div>
            </div>

            <!-- 5. CREDIT REQUEST -->
            <div class="bg-indigo-50 p-5 rounded-xl border border-indigo-200">
              <h3 class="text-lg font-bold text-indigo-900 border-b border-indigo-200 pb-2 mb-4 flex items-center gap-2"><span class="icon-[tabler--credit-card] text-indigo-600"></span> 5. ຄຳຮ້ອງຂໍສິນເຊື່ອສະມາຊິກ (Credit Request)</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control"><label class="label"><span class="label-text font-medium text-indigo-900">ວົງເງິນສິນເຊື່ອທີ່ຕ້ອງການ (LAK) *</span></label><input :value="formatCurrencyInput(editForm.requested_credit_limit)" @input="handleCurrencyInput('requested_credit_limit', $event)" type="text" class="input input-sm input-bordered w-full font-black text-indigo-700" :class="{ 'input-error': editErrors.requested_credit_limit }" /></div>
                <div class="form-control">
                  <label class="label"><span class="label-text font-medium text-indigo-900">ຈຸດປະສົງການຂໍສິນເຊື່ອ *</span></label>
                  <select v-model="editForm.purpose_id" class="select select-sm select-bordered w-full" :class="{ 'select-error': editErrors.purpose_id }"><option value="" disabled>{{ creditStore.isLoading ? 'ກຳລັງໂຫຼດ...' : '-- ເລືອກ --' }}</option><option v-for="purpose in creditStore.purposes" :key="purpose.id" :value="purpose.id">{{ purpose.purpose_name }}</option></select>
                </div>
                <div class="form-control"><label class="label"><span class="label-text font-medium text-indigo-900">ປະເພດສິນຄ້າ/ບໍລິການ *</span></label><select v-model="editForm.requested_product_type" class="select select-sm select-bordered w-full" :class="{ 'select-error': editErrors.requested_product_type }"><option value="" disabled>-- ເລືອກ --</option><option value="CONSUMER_ELECTRONICS">ເຄື່ອງໃຊ້ໄຟຟ້າ</option><option value="MOBILE_PHONE">ໂທລະສັບ</option><option value="HOME_APPLIANCE">ເຄື່ອງໃຊ້ພາຍໃນເຮືອນ</option><option value="OTHER">ອື່ນໆ</option></select></div>
                <div class="form-control md:col-span-2"><label class="label"><span class="label-text font-medium text-indigo-900">ລາຍລະອຽດການນຳໃຊ້ (Usage Goal) *</span></label><textarea v-model="editForm.usage_goal" class="textarea textarea-bordered w-full h-16" :class="{ 'textarea-error': editErrors.usage_goal }" @input="editForm.usage_goal = filterLaoTextWithSymbols(editForm.usage_goal)"></textarea></div>
                <div class="form-control md:col-span-2"><label class="label"><span class="label-text font-medium text-indigo-900">ໝາຍເຫດເພີ່ມເຕີມ</span></label><textarea v-model="editForm.remarks" class="textarea textarea-bordered w-full h-12"></textarea></div>
              </div>
            </div>

            <!-- 6. CONSENT -->
            <div>
              <h3 class="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2"><span class="icon-[tabler--shield-check] text-primary"></span> 6. ການຍິນຍອມ ແລະ ຢືນຢັນຂໍ້ມູນ (Consent)</h3>
              <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                <label class="cursor-pointer label justify-start gap-3"><input v-model="editForm.data_accuracy_confirmation" type="checkbox" class="checkbox checkbox-sm checkbox-primary" /><span class="label-text font-medium text-sm">ຂ້າພະເຈົ້າຂໍຢືນຢັນວ່າຂໍ້ມູນທັງໝົດທີ່ໃຫ້ມາຂ້າງເທິງແມ່ນຄວາມຈິງ ແລະ ຖືກຕ້ອງທຸກປະການ *</span></label>
                <label class="cursor-pointer label justify-start gap-3"><input v-model="editForm.credit_check_consent" type="checkbox" class="checkbox checkbox-sm checkbox-primary" /><span class="label-text font-medium text-sm">ຂ້າພະເຈົ້າຍິນຍອມໃຫ້ບໍລິສັດກວດສອບປະຫວັດຂໍ້ມູນສິນເຊື່ອ (CIB) ເພື່ອໃຊ້ປະກອບການພິຈາລະນາ *</span></label>
              </div>
            </div>

          </div>
        </div>

        <!-- 🌟 TAB 2: DOCUMENTS -->
        <div v-else-if="activeTab === 'documents'" class="space-y-6">
           <div v-if="!isEditing" class="space-y-4">
            <div v-if="!allDocumentCategories?.some(c => c?.files?.length > 0)"
              class="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed">
              <span class="icon-[tabler--file-off] size-8 text-gray-400 mb-2"></span>
              <p>ຍັງບໍ່ມີເອກະສານອັບໂຫຼດເຂົ້າໃນລະບົບ</p>
            </div>
            <template v-else>
              <div v-for="cat in allDocumentCategories" :key="'view-cat-' + cat.id" v-show="cat?.files?.length > 0"
                class="border rounded-xl p-4">
                <h5 class="font-bold text-gray-800 border-b pb-2 mb-3 flex items-center gap-2"><span
                    class="icon-[tabler--folder] size-5 text-primary"></span> {{ cat.name }}</h5>
                <div class="flex flex-wrap gap-4">
                  <div v-for="(f, fileIndex) in cat.files" :key="fileIndex"
                    class="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 w-full sm:w-48 group cursor-pointer shadow-sm hover:shadow-md transition-all"
                    @click="openInNewTab(f.preview)">
                    <div class="h-32 w-full overflow-hidden bg-slate-100">
                      <img v-if="!f.isPdf" :src="f.preview"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div v-else class="w-full h-full flex flex-col items-center justify-center"><span
                          class="icon-[tabler--file-type-pdf] size-10 text-red-500 mb-2"></span><span
                          class="text-xs text-gray-500 truncate w-3/4 text-center">{{ f.name }}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <div v-else class="space-y-6">
            <div v-for="cat in allDocumentCategories" :key="'edit-cat-' + cat.id"
              class="border rounded-xl p-4 bg-gray-50">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h5 class="font-bold text-gray-800">{{ cat.name }}</h5>
                  <p class="text-xs text-gray-500 mt-1">{{ cat.description }}</p>
                </div>
                <span v-if="cat.required" class="badge badge-error badge-soft text-[10px] font-bold">ບັງຄັບ</span>
              </div>
              <div class="flex flex-wrap gap-4">
                <div v-for="(f, fileIndex) in cat.files" :key="fileIndex"
                  class="relative aspect-square w-24 rounded-lg border border-gray-300 overflow-hidden bg-white group">
                  <button type="button" @click.stop="removeDocument(cat.id, fileIndex)"
                    class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 z-10 shadow-md"><span
                      class="icon-[tabler--x] size-3"></span></button>
                  <img v-if="!f.isPdf" :src="f.preview" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex flex-col items-center justify-center"><span
                      class="icon-[tabler--file-type-pdf] size-8 text-red-500"></span></div>
                  <span v-if="f.file"
                    class="absolute bottom-1 left-1 text-[9px] bg-green-500 text-white px-1 rounded shadow">ໃໝ່</span>
                </div>
                <label
                  class="aspect-square w-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-white hover:border-primary transition-all group">
                  <input type="file" class="hidden" multiple accept="image/*,.pdf"
                    @change="(e) => handleDocumentUpload(cat.id, e)" />
                  <div
                    class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <span class="icon-[tabler--plus] size-5 text-gray-400 group-hover:text-primary"></span>
                  </div>
                  <span class="text-[10px] font-bold text-gray-400 mt-1 group-hover:text-primary">ເພີ່ມເອກະສານ</span>
                </label>
              </div>
            </div>
            <div v-if="isUploadingDocuments" class="alert alert-info py-2 shadow-sm text-sm"><span
                class="loading loading-spinner loading-sm"></span> ກຳລັງອັບໂຫຼດເອກະສານ... ກະລຸນາລໍຖ້າ</div>
          </div>
        </div>

        <!-- 🌟 TAB 3: ແຜນທີ່ -->
        <div v-else-if="activeTab === 'map'" class="space-y-4">
          <div v-if="customerLocations.length === 0" class="alert alert-warning shadow-sm py-2">
            <span class="icon-[tabler--map-pin-off] size-5"></span>
            <span class="text-sm">ລູກຄ້າຄົນນີ້ຍັງບໍ່ມີຂໍ້ມູນທີ່ຕັ້ງເທື່ອ.
              <span v-if="canManageLocation">ກະລຸນາປັກໝຸດທີ່ຕັ້ງລູກຄ້າເພື່ອງ່າຍຕໍ່ການຕິດຕາມ.</span>
            </span>
          </div>
          <CustomerLocationMap v-if="getCustomerInfo()?.id" :customer-id="getCustomerInfo()?.id" :locations="customerLocations"
            :google-maps-api-key="''" :is-loading="isLocationLoading" :can-add-location="canManageLocation"
            :can-edit-location="canManageLocation" :can-delete-location="canManageLocation"
            :can-set-primary="canManageLocation" @add-location="handleAddLocation"
            @update-location="handleUpdateLocation" @delete-location="handleDeleteLocation"
            @set-primary="handleSetPrimary" />
        </div>

        <!-- 🌟 FOOTER ACTIONS -->
        <div class="flex justify-end gap-3 mt-6 border-t pt-6 bg-white sticky bottom-0">
          <button class="btn btn-soft btn-secondary" @click="closeModal" :disabled="isSaving || isUploadingDocuments">
            {{ isEditing ? 'ຍົກເລີກ' : 'ປິດໜ້າຈໍ' }}
          </button>
          <button v-if="!isEditing && (activeTab === 'profile' || activeTab === 'documents')" class="btn btn-primary" @click="startEdit">
            <span class="icon-[tabler--edit] size-4 mr-1"></span> ແກ້ໄຂຂໍ້ມູນທັງໝົດ
          </button>
          <button v-else-if="isEditing && activeTab === 'profile'" class="btn btn-success text-white" @click="saveProfile" :disabled="isSaving">
            <span v-if="isSaving" class="loading loading-spinner loading-xs"></span>
            <span v-else class="icon-[tabler--device-floppy] size-4 mr-1"></span> <span v-if="!isSaving">ອັບເດດຂໍ້ມູນ</span>
          </button>
          <button v-else-if="isEditing && activeTab === 'documents'" class="btn btn-success text-white" @click="saveDocuments" :disabled="isUploadingDocuments">
            <span v-if="isUploadingDocuments" class="loading loading-spinner loading-xs"></span>
            <span v-else class="icon-[tabler--device-floppy] size-4 mr-1"></span> <span v-if="!isUploadingDocuments">ອັບເດດເອກະສານ</span>
          </button>
        </div>

      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useAddressStore } from '@/stores/address';
import { useLoanApplicationStore } from '@/stores/loanApplication';
import { useCustomerStore } from '@/stores/customer';
import { usePermissionStore } from '@/stores/permission';
import { useMembershipCreditStore } from '@/stores/membership-purpose';
import type { CustomerLocation } from '@/types/customer';
import apiClient from '@/api/apiclient';
import { alert } from '@/utils/alert';
import { 
  formatPrice, 
  formatCurrencyInput, 
  formatDateOnly, 
  normalizePhoneNumber, 
  formatStandardPhoneNumber 
} from '@/utils/formatters';
import { getFullImageUrl } from '@/utils/url';
import imageCompression from 'browser-image-compression';
import CustomerLocationMap from '@/components/loans/form/CustomerLocationMap.vue';

const props = defineProps<{ show: boolean, customerId: number | null }>();
const emit = defineEmits(['close', 'refresh']);

const addressStore = useAddressStore();
const loanAppStore = useLoanApplicationStore();
const customerStore = useCustomerStore();
const permissionStore = usePermissionStore();
const creditStore = useMembershipCreditStore();

const activeTab = ref<'profile' | 'documents' | 'map'>('profile');
const isEditing = ref(false);
const isSaving = ref(false);
const isUploadingDocuments = ref(false);
let isPopulating = false;

const customerData = ref<any>(null);
const customerLocations = ref<CustomerLocation[]>([]);
const workDistricts = ref<any[]>([]);
const isLocationLoading = ref(false);
const canManageLocation = computed(() => permissionStore.hasPermission('user_manage') || permissionStore.hasPermission('loan_edit'));

const profileInput = ref<HTMLInputElement | null>(null);
const profileFile = ref<File | null>(null);
const profilePreview = ref<string>('');

const employmentTypes = [
  { value: 'EMPLOYEE', label: 'ພະນັກງານບໍລິສັດ / ລູກຈ້າງ' },
  { value: 'GOVERNMENT', label: 'ພະນັກງານລັດ / ຂ້າລັດຖະການ' },
  { value: 'SELF_EMPLOYED', label: 'ທຸລະກິດສ່ວນຕົວ / ອິດສະຫຼະ' },
  { value: 'BUSINESS_OWNER', label: 'ເຈົ້າຂອງທຸລະກິດ' },
  { value: 'FARMER', label: 'ກະສິກອນ' },
  { value: 'TRADER', label: 'ຄ້າຂາຍ' },
  { value: 'OTHER', label: 'ອື່ນໆ' }
];

// 🟢 6 Sections Form State
const editForm = reactive({
  first_name: '', last_name: '', phone: '', gender: '', date_of_birth: '', identity_number: '', account_number: '',
  province_id: '', district_id: '', address: '',
  employment_type: '', occupation: '', company_name: '', job_position: '', work_duration_years: 0, work_duration_months: 0,
  work_province_id: '', work_district_id: '', work_address: '',
  monthly_income: 0, other_debts: 0, monthly_debt_payment: 0,
  requested_credit_limit: 0, purpose_id: '', usage_goal: '', requested_product_type: '', remarks: '',
  work_phone: '', department: '', business_type: '', business_detail: '',
  credit_check_consent: false, data_accuracy_confirmation: false,
  age: 0
});

const editErrors = reactive({
  first_name: '', last_name: '', phone: '', gender: '', date_of_birth: '', identity_number: '',
  province_id: '', district_id: '', address: '',
  employment_type: '', occupation: '', company_name: '',
  work_phone: '', department: '', business_type: '', business_detail: '',
  monthly_income: '', monthly_debt_payment: '',
  requested_credit_limit: '', purpose_id: '', usage_goal: '', requested_product_type: ''
});

// Lao regex helper
const filterLaoTextOnly = (val: string): string => val.replace(/[^\u0E80-\u0EFF\s]/g, '');
const filterLaoTextWithSymbols = (val: string): string => val.replace(/[^\u0E80-\u0EFF\s0-9\/\-,.]/g, '');

interface UploadedFile { id?: number; file: File | null; preview: string; isPdf: boolean; name: string; }
interface DocumentCategory { id: string; name: string; description: string; required: boolean; files: UploadedFile[]; }
const requiredDocuments = ref<DocumentCategory[]>([
  { id: 'id_card', name: 'ບັດປະຈຳຕົວ/ສຳມະໂນຄົວ', description: 'ເອກະສານຢັ້ງຢືນຕົວຕົນ', required: true, files: [] },
  { id: 'house_reg', name: 'ປື້ມສຳມະໂນຄົວ', description: 'ເອກະສານຢັ້ງຢືນທີ່ຢູ່', required: false, files: [] }
]);
const optionalDocuments = ref<DocumentCategory[]>([
  { id: 'salary_slip', name: 'ຫຼັກຖານລາຍຮັບ', description: 'ໃບເງິນເດືອນ ຫຼື ໃບຮັບລາຍຮັບ', required: false, files: [] },
  { id: 'other', name: 'ເອກະສານອື່ນໆ', description: 'ເອກະສານທີ່ກ່ຽວຂ້ອງ', required: false, files: [] }
]);
const allDocumentCategories = computed(() => [...(requiredDocuments.value || []), ...(optionalDocuments.value || [])]);

// Safe Getters
const getAppInfo = () => customerData.value || {};
const getCustomerInfo = () => customerData.value?.customer || {};
const getWorkInfo = () => {
  const c = getCustomerInfo();
  return c.customer_work_infos?.[0] || c.customer_work_info || {}; 
};
const getSnapshot = () => customerData.value?.membership_application_versions?.[0] || {};
const getPurposeName = (id: number | string) => {
  const p = creditStore.purposes.find(x => String(x.id) === String(id));
  return p ? p.purpose_name : '-';
};

onMounted(async () => {
  if (addressStore.provinces.length === 0) await addressStore.fetchProvinces();
  if (creditStore.purposes.length === 0) await creditStore.fetchPurposes();
});

watch(() => props.show, async (newVal) => {
  if (newVal && props.customerId) {
    activeTab.value = 'profile'; isEditing.value = false; profileFile.value = null; profilePreview.value = '';
    await loadApplicationData(props.customerId);
  } else {
    customerData.value = null;
  }
});

watch(() => editForm.province_id, async (newVal) => {
  if (isPopulating) return;
  editForm.district_id = '';
  if (newVal) await addressStore.fetchDistricts(newVal); else addressStore.districts = [];
});

watch(() => editForm.work_province_id, async (newVal) => {
  if (isPopulating) return;
  editForm.work_district_id = ''; workDistricts.value = [];
  if (newVal) {
    try { const res = await apiClient.get(`/address/provinces/${newVal}/districts`); workDistricts.value = res.data?.data || res.data; } catch (e) { workDistricts.value = []; }
  }
});

// Automatic age calculation
watch(() => editForm.date_of_birth, (newDob) => {
  if (newDob && !isPopulating) {
    const dob = new Date(newDob);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    editForm.age = age > 0 ? age : 0;
  }
});

const loadApplicationData = async (cid: number) => {
  try { 
    // 🌟 ແກ້ໄຂ URL ໃຫ້ກົງກັບ Backend Route (/membership-origination)
    const res = await apiClient.get(`/membership/applications/customer/${cid}`);
    
    // ເກັບຂໍ້ມູນໃບຄຳຂໍທີ່ໄດ້ມາ
    customerData.value = res.data?.data || res.data;
    
    // ເອົາ Customer ID ໄປດຶງເອກະສານ ແລະ ທີ່ຕັ້ງ
    const realCustomerId = getCustomerInfo().id;
    if (realCustomerId) {
       await loadCustomerDocuments(realCustomerId);
       await loadCustomerLocations(realCustomerId);
    }
  } catch (e) { 
    alert.error('ຜິດພາດ', 'ບໍ່ສາມາດດຶງຂໍ້ມູນຄຳຮ້ອງຂໍໄດ້'); closeModal(); 
  }
};

const loadCustomerDocuments = async (id: number) => {
  requiredDocuments.value.forEach(d => d.files = []); optionalDocuments.value.forEach(d => d.files = []);
  try {
    await loanAppStore.fetchDocuments(id);
    const docs = loanAppStore.currentDocuments || [];
    docs.forEach(serverDoc => {
      const docType = serverDoc.document_type || serverDoc.doc_type;
      const targetCat = allDocumentCategories.value.find(d => d.id === docType);
      const fileUrl = getFullImageUrl(serverDoc.file_url);
      if (targetCat && fileUrl) {
        targetCat.files.push({ id: serverDoc.id, file: null, preview: fileUrl, isPdf: serverDoc.file_url?.toLowerCase().endsWith('.pdf') || false, name: serverDoc.original_filename || serverDoc.file_name || 'Document' });
      }
    });
  } catch (e) {}
};

const loadCustomerLocations = async (id: number) => {
  isLocationLoading.value = true;
  try { const res = await customerStore.fetchLocations(id); customerLocations.value = res.data || res; } catch (e) {} finally { isLocationLoading.value = false; }
};

const handleAddLocation = async (data: any) => { const cid = getCustomerInfo().id; if (!cid) return; await customerStore.addLocation(cid, data); await loadCustomerLocations(cid); };
const handleUpdateLocation = async (id: number, data: any) => { const cid = getCustomerInfo().id; await customerStore.editLocation(id, data); if (cid) await loadCustomerLocations(cid); };
const handleDeleteLocation = async (id: number) => { const cid = getCustomerInfo().id; await customerStore.removeLocation(id); if (cid) await loadCustomerLocations(cid); };
const handleSetPrimary = async (id: number) => { const cid = getCustomerInfo().id; await customerStore.editLocation(id, { is_primary: 1 }); if (cid) await loadCustomerLocations(cid); };

// Populate form
const startEdit = async () => {
  if (!customerData.value) return;
  isPopulating = true;
  const app = getAppInfo();
  const c = getCustomerInfo();
  const w = getWorkInfo();
  const snap = getSnapshot();

  editForm.first_name = c.first_name || ''; 
  editForm.last_name = c.last_name || ''; 
  editForm.phone = c.phone || ''; 
  editForm.gender = c.gender || '';
  editForm.date_of_birth = c.date_of_birth ? (new Date(c.date_of_birth).toISOString().split('T')[0] || '') : '';
  editForm.identity_number = c.identity_number || ''; 
  editForm.account_number = c.account_number || ''; 
  editForm.occupation = c.occupation || w.occupation || ''; 
  editForm.monthly_income = Number(w.salary) || Number(c.income_per_month) || 0; 
  editForm.other_debts = Number(c.other_debt) || 0;
  editForm.address = c.address || ''; 
  editForm.province_id = c.province_id || '';

  // ພ້ອມທັງໃສ່ Fallback ໄປຫາ Snapshot ຖ້າໃນ work_info ບໍ່ມີ
  editForm.employment_type = w.employment_type 
    || snap.credit_request_snapshot_json?.employment_type 
    || snap.employment_snapshot_json?.employment_type 
    || '';
  editForm.company_name = w.company_name || ''; 
  editForm.job_position = w.position || '';
  editForm.work_phone = w.phone || '';
  editForm.department = w.department || '';
  editForm.business_type = w.business_type || '';
  editForm.business_detail = w.business_detail || '';
  editForm.work_duration_years = Number(w.duration_years) || 0; 
  editForm.work_duration_months = Number(w.duration_months) || 0;
  editForm.work_province_id = w.province_id || ''; 
  editForm.work_address = w.address || '';

  const finSnap = snap.financial_snapshot_json || {};
  editForm.monthly_debt_payment = Number(finSnap.monthly_debt_payment) || 0;

  editForm.requested_credit_limit = Number(app.requested_credit_limit) || 0;
  editForm.purpose_id = app.purpose_id || ''; 
  editForm.usage_goal = app.usage_goal || ''; 
  editForm.requested_product_type = app.requested_product_type || ''; 
  editForm.remarks = app.remarks || '';
  
  const reqSnap = snap.credit_request_snapshot_json || {};
  editForm.credit_check_consent = reqSnap.credit_check_consent === 'true' || reqSnap.credit_check_consent === true; 
  editForm.data_accuracy_confirmation = reqSnap.data_accuracy_confirmation === 'true' || reqSnap.data_accuracy_confirmation === true;

  if (editForm.province_id) await addressStore.fetchDistricts(editForm.province_id);
  if (editForm.work_province_id) {
    try { 
      const res = await apiClient.get(`/address/provinces/${editForm.work_province_id}/districts`); 
      workDistricts.value = res.data?.data || res.data; 
    } catch (e) { 
      workDistricts.value = []; 
    }
  }

  editForm.district_id = c.district_id || '';
  editForm.work_district_id = w.district_id || '';
  
  isPopulating = false;
  isEditing.value = true;
};

const triggerProfileUpload = () => { profileInput.value?.click(); };
const handleProfileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement; const files = target.files;
  if (!files || files.length === 0) return; const file = files[0]; if (!file) return;
  if (file.size > 5 * 1024 * 1024) { alert.error('ຮູບໃຫຍ່ເກີນໄປ', 'ສູງສຸດ 5MB'); target.value = ''; return; }
  try {
    const compressedBlob = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true });
    profileFile.value = new File([compressedBlob], file.name, { type: compressedBlob.type, lastModified: Date.now() });
    const reader = new FileReader(); reader.onload = (e) => { profilePreview.value = e.target?.result as string; }; reader.readAsDataURL(profileFile.value);
  } catch (e) { }
};

const handleProvinceChange = async () => { editForm.district_id = ''; if (editForm.province_id) await addressStore.fetchDistricts(editForm.province_id); };
const handleCurrencyInput = (field: 'monthly_income' | 'other_debts' | 'monthly_debt_payment' | 'requested_credit_limit', event: Event) => {
  const target = event.target as HTMLInputElement; 
  const num = parseInt(target.value.replace(/\D/g, ''), 10); 
  editForm[field] = isNaN(num) ? 0 : num;
};

// 🌟 Strict Phone Number Validation matching CreateWalkinLoan
const validateEditForm = (): boolean => {
  Object.keys(editErrors).forEach(key => { editErrors[key as keyof typeof editErrors] = '' }); 
  let isValid = true;

  if (!editForm.first_name.trim()) { editErrors.first_name = 'ກະລຸນາປ້ອນຊື່ແທ້'; isValid = false; }
  if (!editForm.last_name.trim()) { editErrors.last_name = 'ກະລຸນາປ້ອນນາມສະກຸນ'; isValid = false; }
  if (!editForm.gender) { editErrors.gender = 'ກະລຸນາເລືອກເພດ'; isValid = false; }
  if (!editForm.identity_number.trim()) { editErrors.identity_number = 'ກະລຸນາປ້ອນເລກບັດປະຈຳຕົວ / ສຳມະໂນຄົວ'; isValid = false; }

  // 🌟 Primary phone validation (Matching CreateWalkinLoan)
  if (!editForm.phone.trim()) { 
    editErrors.phone = 'ກະລຸນາປ້ອນເບີໂທລະສັບ'; 
    isValid = false; 
  } else {
    const normalizedPhone = normalizePhoneNumber(editForm.phone);
    if (normalizedPhone.length < 7 || normalizedPhone.length > 8) {
      editErrors.phone = 'ເບີໂທລະສັບບໍ່ຖືກຕ້ອງ (ຕົວຢ່າງ: 020 99887766)';
      isValid = false;
    }
  }

  // 🌟 Workplace phone validation (Optional, but checked if present)
  if (editForm.work_phone && editForm.work_phone.trim()) {
    const normalizedWorkPhone = normalizePhoneNumber(editForm.work_phone);
    if (normalizedWorkPhone.length < 6 || normalizedWorkPhone.length > 8) {
      editErrors.work_phone = 'ເບີໂທບ່ອນເຮັດວຽກບໍ່ຖືກຕ້ອງ (ຕົວຢ່າງ: 021 212121 ຫຼື 020 99887766)';
      isValid = false;
    }
  }

  if (!editForm.date_of_birth) { editErrors.date_of_birth = 'ກະລຸນາປ້ອນວັນເດືອນປີເກີດ'; isValid = false; }
  if (!editForm.province_id) { editErrors.province_id = 'ກະລຸນາເລືອກແຂວງ'; isValid = false; }
  if (!editForm.district_id) { editErrors.district_id = 'ກະລຸນາເລືອກເມືອງ'; isValid = false; }
  if (!editForm.address.trim()) { editErrors.address = 'ກະລຸນາປ້ອນທີ່ຢູ່'; isValid = false; }
  if (!editForm.employment_type) { editErrors.employment_type = 'ກະລຸນາເລືອກປະເພດການຈ້າງງານ'; isValid = false; }
  if (!editForm.occupation.trim()) { editErrors.occupation = 'ກະລຸນາປ້ອນອາຊີບ'; isValid = false; }
  if (!editForm.company_name.trim()) { editErrors.company_name = 'ກະລຸນາປ້ອນຊື່ບໍລິສັດ'; isValid = false; }
  if (editForm.monthly_income <= 0) { editErrors.monthly_income = 'ກະລຸນາລະບຸລາຍຮັບ'; isValid = false; }
  if (editForm.monthly_debt_payment < 0) { editErrors.monthly_debt_payment = 'ຫ້າມຕິດລົບ'; isValid = false; }
  if (editForm.requested_credit_limit <= 0) { editErrors.requested_credit_limit = 'ກະລຸນາລະບຸວົງເງິນທີ່ຕ້ອງການຂໍ'; isValid = false; }
  if (!editForm.purpose_id) { editErrors.purpose_id = 'ກະລຸນາເລືອກຈຸດປະສົງ'; isValid = false; }
  if (!editForm.requested_product_type) { editErrors.requested_product_type = 'ກະລຸນາເລືອກປະເພດສິນຄ້າ'; isValid = false; }
  if (!editForm.usage_goal.trim()) { editErrors.usage_goal = 'ກະລຸນາອະທິບາຍການນຳໃຊ້'; isValid = false; }
  
  if (!editForm.data_accuracy_confirmation) { alert.error('ຢືນຢັນຂໍ້ມູນ', 'ກະລຸນາຕິກເພື່ອຢືນຢັນວ່າຂໍ້ມູນຖືກຕ້ອງ'); isValid = false; }
  if (!editForm.credit_check_consent) { alert.error('ການຍິນຍອມ', 'ກະລຸນາຕິກຍິນຍອມໃຫ້ກວດສອບຂໍ້ມູນເຄຣດິດ (CIB)'); isValid = false; }
  return isValid;
};

// 🟢 SUBMIT UPDATE
const saveProfile = async () => {
  if (!validateEditForm()) return;
  isSaving.value = true;
  try {
    const formData = new FormData();
    const currentAppId = props.customerId;
    const realCustomerId = getCustomerInfo().id;
    if (realCustomerId) formData.append('customer_id', String(realCustomerId));

    // Standardized Phone dispatch
    const cleanPhone = normalizePhoneNumber(editForm.phone);
    const standardizedPhone = formatStandardPhoneNumber(cleanPhone);

    const cleanWorkPhone = editForm.work_phone.trim() 
      ? formatStandardPhoneNumber(normalizePhoneNumber(editForm.work_phone)) 
      : '';

    formData.append('first_name', editForm.first_name); 
    formData.append('last_name', editForm.last_name);
    formData.append('phone', standardizedPhone); 
    formData.append('gender', editForm.gender);
    formData.append('date_of_birth', editForm.date_of_birth); 
    formData.append('age', String(editForm.age));
    formData.append('identity_number', editForm.identity_number);
    formData.append('account_number', editForm.account_number); 
    formData.append('province_id', editForm.province_id);
    formData.append('district_id', editForm.district_id); 
    formData.append('address', editForm.address);
    formData.append('employment_type', editForm.employment_type); 
    formData.append('occupation', editForm.occupation);
    formData.append('company_name', editForm.company_name); 
    formData.append('job_position', editForm.job_position);
    formData.append('work_phone', cleanWorkPhone);
    formData.append('department', editForm.department);
    formData.append('business_type', editForm.business_type);
    formData.append('business_detail', editForm.business_detail);
    formData.append('work_duration_years', String(editForm.work_duration_years)); 
    formData.append('work_duration_months', String(editForm.work_duration_months));
    formData.append('work_province_id', editForm.work_province_id); 
    formData.append('work_district_id', editForm.work_district_id);
    formData.append('work_address', editForm.work_address); 
    formData.append('income_per_month', String(editForm.monthly_income));
    formData.append('other_debt', String(editForm.other_debts)); 
    formData.append('monthly_debt_payment', String(editForm.monthly_debt_payment));
    formData.append('requested_credit_limit', String(editForm.requested_credit_limit)); 
    formData.append('purpose_id', String(editForm.purpose_id));
    formData.append('usage_goal', editForm.usage_goal); 
    formData.append('requested_product_type', editForm.requested_product_type);
    formData.append('remarks', editForm.remarks); 
    formData.append('credit_check_consent', String(editForm.credit_check_consent));
    formData.append('data_accuracy_confirmation', String(editForm.data_accuracy_confirmation));
    if (profileFile.value) formData.append('profile_image', profileFile.value);

    await apiClient.put(`/membership/applications/staff-update/${currentAppId}`, formData, { 
      headers: { 'Content-Type': 'multipart/form-data' } 
    });

    alert.success('ອັບເດດຂໍ້ມູນສຳເລັດ!');
    isEditing.value = false;
    await loadApplicationData(props.customerId!);
    emit('refresh');
  } catch (error: any) {
    alert.error('ຜິດພາດ', error.response?.data?.message || 'ບໍ່ສາມາດອັບເດດຂໍ້ມູນໄດ້');
  } finally {
    isSaving.value = false;
  }
};

const handleDocumentUpload = async (typeId: string, event: Event) => {
  const target = event.target as HTMLInputElement; const files = target.files; if (!files || files.length === 0) return;
  const category = allDocumentCategories.value.find(c => c.id === typeId); if (!category) return;
  for (let i = 0; i < files.length; i++) {
    const currentFile = files[i]; if (!currentFile) continue;
    if (currentFile.size > 8 * 1024 * 1024) { alert.error('ໄຟລ໌ໃຫຍ່ເກີນໄປ', 'ສູງສຸດ 8MB'); continue; }
    let finalFile: File = currentFile;
    if (finalFile.type.startsWith('image/')) {
      try { const compressedBlob = await imageCompression(currentFile, { maxSizeMB: 2, maxWidthOrHeight: 1920, useWebWorker: true }); finalFile = new File([compressedBlob], currentFile.name, { type: compressedBlob.type, lastModified: Date.now() }); } catch (error) { }
    }
    const isPdf = finalFile.type === 'application/pdf';
    const reader = new FileReader(); reader.onload = (e) => { category.files.push({ file: finalFile, preview: (e.target?.result as string) || '', isPdf: isPdf, name: finalFile.name }); }; reader.readAsDataURL(finalFile);
  }
  target.value = '';
};

const removeDocument = async (typeId: string, fileIndex: number) => {
  const category = allDocumentCategories.value.find(c => c.id === typeId);
  if (category && category.files[fileIndex]) {
    if (category.files[fileIndex].id) { if (!confirm('ຕ້ອງການລຶບເອກະສານເດີມອອກຈາກລະບົບແທ້ບໍ່? (ລຶບແລ້ວບໍ່ສາມາດກູ້ຄືນໄດ້)')) return; }
    category.files.splice(fileIndex, 1);
  }
};

const saveDocuments = async () => {
  const realCustomerId = getCustomerInfo().id;
  if (!realCustomerId) return;
  isUploadingDocuments.value = true;
  try {
    const filesToUpload: File[] = []; const docTypesArray: string[] = [];
    allDocumentCategories.value.forEach(cat => { cat.files.forEach(f => { if (f.file) { filesToUpload.push(f.file); docTypesArray.push(cat.id); } }); });
    if (filesToUpload.length > 0) {
      await loanAppStore.uploadMultipleDocuments(realCustomerId, 0 as any, filesToUpload, docTypesArray);
      alert.success('ອັບໂຫຼດເອກະສານສຳເລັດ!');
      await loadCustomerDocuments(realCustomerId);
    } else { alert.info('ບໍ່ມີເອກະສານໃໝ່ໃຫ້ອັບໂຫຼດ'); }
    isEditing.value = false;
  } catch (error: any) { alert.error('ຜິດພາດ', error.response?.data?.message || 'ອັບໂຫຼດເອກະສານລົ້ມເຫຼວ'); } finally { isUploadingDocuments.value = false; }
};

const openInNewTab = (url: string) => { if (url) window.open(url, '_blank'); };
const closeModal = () => { emit('close'); };
const getKycBadgeClass = (status: string) => { switch (status?.toLowerCase()) { case 'verified': return 'bg-emerald-500'; case 'unverified': return 'bg-warning text-gray-800'; case 'rejected': return 'bg-error'; default: return 'bg-gray-400'; } };
const getKycStatusText = (status: string) => { switch (status?.toLowerCase()) { case 'verified': return 'ຢືນຢັນແລ້ວ'; case 'unverified': return 'ລໍຖ້າກວດສອບ'; case 'rejected': return 'ຖືກປະຕິເສດ'; default: return 'ບໍ່ລະບຸ'; } };
</script>
