
<template>
  <div class="p-4 sm:p-6 max-w-5xl mx-auto">
    <!-- Header Section -->
    <div class="flex items-center gap-3 mb-6">
      <div class="p-2.5 bg-primary/10 rounded-xl">
        <span class="icon-[tabler--user-plus] size-7 text-primary"></span>
      </div>
      <div>
        <h2 class="text-xl font-bold text-gray-800 dark:text-white">
          ຄຳຮ້ອງຂໍສະໝັກສະມາຊິກ ແລະ ວົງເງິນ (Membership & Credit Origination)
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          ລົງທະບຽນລູກຄ້າໃໝ່, ປະຫວັດການເຮັດວຽກ, ແລະ ສ້າງຄຳຂໍວົງເງິນເຄຣດິດ
        </p>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="tabs tabs-boxed mb-6 p-1 bg-gray-100 dark:bg-gray-800">
      <button 
        class="tab tab-lg flex-1 font-semibold" 
        :class="{ 'tab-active !bg-white !text-primary shadow-sm': activeTab === 'profile' }" 
        @click="switchTab('profile')"
      >
        <span class="icon-[tabler--file-description] size-5 mr-2"></span>
        ຟອມສະໝັກ (Application Form)
      </button>
      <button 
        class="tab tab-lg flex-1 font-semibold" 
        :class="{ 'tab-active !bg-white !text-primary shadow-sm': activeTab === 'documents', 'tab-disabled opacity-50': !canAccessDocuments }"
        :disabled="!canAccessDocuments" 
        @click="switchTab('documents')"
      >
        <span class="icon-[tabler--file-upload] size-5 mr-2"></span>
        ເອກະສານຢັ້ງຢືນ (Documents)
      </button>
    </div>

    <!-- TAB 1: Main Application Form -->
    <div v-if="activeTab === 'profile'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">

      <!-- Profile Avatar Upload -->
      <div class="flex flex-col items-center justify-center mb-8 border-b pb-8 border-dashed border-gray-200">
        <div class="relative group cursor-pointer" @click="triggerProfileUpload">
          <div class="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-100 dark:border-gray-700 bg-gray-50 shadow-md">
            <img v-if="profilePreview" :src="profilePreview" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              <span class="icon-[tabler--user] size-12"></span>
            </div>
          </div>
          <div class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span class="icon-[tabler--camera-plus] size-6 text-white"></span>
          </div>
          <input ref="profileInput" type="file" class="hidden" accept="image/jpeg, image/png, image/webp" @change="handleProfileSelect" />
        </div>
        <p class="text-sm text-gray-600 mt-3 font-medium">ອັບໂຫຼດຮູບໂປຣໄຟລ໌ (ຖ້າມີ)</p>
        <button v-if="profilePreview" class="btn btn-xs btn-ghost text-error mt-1" @click="removeProfileImage">
          ລຶບຮູບ
        </button>
      </div>

      <!-- 1. PERSONAL INFORMATION -->
      <div class="mb-8">
        <h3 class="text-base font-bold text-gray-800 dark:text-white border-b pb-3 mb-5 flex items-center gap-2">
          <span class="p-1.5 bg-primary/10 rounded-lg text-primary icon-[tabler--id] size-5"></span>
          1. ຂໍ້ມູນສ່ວນຕົວ (Personal Information)
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="form-control">
            <label class="label pb-1.5"><span class="label-text font-medium">ຊື່ແທ້ (ພາສາລາວ) <span class="text-error">*</span></span></label>
            <input 
              v-model="customerForm.first_name" 
              type="text" 
              placeholder="ປ້ອນຊື່" 
              class="input input-bordered w-full"
              :class="{ 'input-error': customerErrors.first_name }"
              @input="customerForm.first_name = filterLaoTextOnly(customerForm.first_name)" 
            />
            <label v-if="customerErrors.first_name" class="label pb-0 text-error"><span class="label-text-alt">{{ customerErrors.first_name }}</span></label>
          </div>

          <div class="form-control">
            <label class="label pb-1.5"><span class="label-text font-medium">ນາມສະກຸນ (ພາສາລາວ) <span class="text-error">*</span></span></label>
            <input 
              v-model="customerForm.last_name" 
              type="text" 
              placeholder="ປ້ອນນາມສະກຸນ" 
              class="input input-bordered w-full"
              :class="{ 'input-error': customerErrors.last_name }"
              @input="customerForm.last_name = filterLaoTextOnly(customerForm.last_name)" 
            />
            <label v-if="customerErrors.last_name" class="label pb-0 text-error"><span class="label-text-alt">{{ customerErrors.last_name }}</span></label>
          </div>

          <!-- Phone number field with Lao validation rules -->
          <div class="form-control">
            <label class="label pb-1.5"><span class="label-text font-medium">ເບີໂທລະສັບ (020/20 XXXXXXXX) <span class="text-error">*</span></span></label>
            <input 
              v-model="customerForm.phone" 
              type="tel" 
              placeholder="020 XXXXXXXX" 
              class="input input-bordered w-full" 
              :class="{ 'input-error': customerErrors.phone }" 
              maxlength="11" 
              @input="customerForm.phone = customerForm.phone.replace(/\D/g, '')"
            />
            <label v-if="customerErrors.phone" class="label pb-0 text-error"><span class="label-text-alt">{{ customerErrors.phone }}</span></label>
          </div>

          <div class="form-control">
            <label class="label pb-1.5"><span class="label-text font-medium">ເພດ <span class="text-error">*</span></span></label>
            <select v-model="customerForm.gender" class="select select-bordered w-full" :class="{ 'select-error': customerErrors.gender }">
              <option value="" disabled>-- ເລືອກເພດ --</option>
              <option value="Male">ຊາຍ (Male)</option>
              <option value="Female">ຍິງ (Female)</option>
            </select>
            <label v-if="customerErrors.gender" class="label pb-0 text-error"><span class="label-text-alt">{{ customerErrors.gender }}</span></label>
          </div>

          <div class="form-control">
            <label class="label pb-1.5">
              <span class="label-text font-medium">ວັນເດືອນປີເກີດ <span class="text-error">*</span></span>
              <span v-if="customerForm.age > 0" class="label-text-alt font-bold text-primary">ອາຍຸ: {{ customerForm.age }} ປີ</span>
            </label>
            <input v-model="customerForm.date_of_birth" type="date" class="input input-bordered w-full" :class="{ 'input-error': customerErrors.date_of_birth }" />
            <label v-if="customerErrors.date_of_birth" class="label pb-0 text-error"><span class="label-text-alt">{{ customerErrors.date_of_birth }}</span></label>
          </div>

          <div class="form-control">
            <label class="label pb-1.5"><span class="label-text font-medium">ເລກບັດປະຈຳຕົວ / ສຳມະໂນຄົວ <span class="text-error">*</span></span></label>
            <input v-model="customerForm.id_card" type="text" placeholder="ປ້ອນເລກບັດປະຈຳຕົວ" class="input input-bordered w-full" :class="{ 'input-error': customerErrors.id_card }" />
            <label v-if="customerErrors.id_card" class="label pb-0 text-error"><span class="label-text-alt">{{ customerErrors.id_card }}</span></label>
          </div>

          <div class="form-control md:col-span-2">
            <label class="label pb-1.5"><span class="label-text font-medium text-indigo-700">ເລກບັນຊີທະນາຄານ (BCEL)</span></label>
            <input v-model="customerForm.account_number" type="text" placeholder="ຕົວຢ່າງ: 010123456789" class="input input-bordered w-full border-indigo-200 focus:border-indigo-500" />
          </div>
        </div>
      </div>

      <!-- 2. RESIDENTIAL ADDRESS -->
      <div class="mb-8">
        <h3 class="text-base font-bold text-gray-800 dark:text-white border-b pb-3 mb-5 flex items-center gap-2">
          <span class="p-1.5 bg-primary/10 rounded-lg text-primary icon-[tabler--home] size-5"></span>
          2. ຂໍ້ມູນທີ່ຢູ່ປັດຈຸບັນ (Residential Address)
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="form-control">
            <label class="label pb-1.5"><span class="label-text font-medium">ແຂວງ <span class="text-error">*</span></span></label>
            <select v-model="customerForm.province_id" class="select select-bordered w-full" :class="{ 'select-error': customerErrors.province_id }">
              <option value="" disabled>-- ເລືອກແຂວງ --</option>
              <option v-for="p in addressStore.provinces" :key="p.province_id" :value="p.province_id">{{ p.province_name }}</option>
            </select>
            <label v-if="customerErrors.province_id" class="label pb-0 text-error"><span class="label-text-alt">{{ customerErrors.province_id }}</span></label>
          </div>

          <div class="form-control">
            <label class="label pb-1.5"><span class="label-text font-medium">ເມືອງ <span class="text-error">*</span></span></label>
            <select v-model="customerForm.district_id" class="select select-bordered w-full" :disabled="!customerForm.province_id || addressStore.loading" :class="{ 'select-error': customerErrors.district_id }">
              <option value="" disabled>{{ addressStore.loading ? 'ກຳລັງໂຫຼດ...' : '-- ເລືອກເມືອງ --' }}</option>
              <option v-for="d in addressStore.districts" :key="d.district_id" :value="d.district_id">{{ d.district_name }}</option>
            </select>
            <label v-if="customerErrors.district_id" class="label pb-0 text-error"><span class="label-text-alt">{{ customerErrors.district_id }}</span></label>
          </div>

          <div class="form-control md:col-span-2">
            <label class="label pb-1.5"><span class="label-text font-medium">ບ້ານ / ໜ່ວຍ / ເຮືອນເລກທີ (ພາສາລາວ) <span class="text-error">*</span></span></label>
            <input 
              v-model="customerForm.address" 
              type="text" 
              placeholder="ຕົວຢ່າງ: ບ້ານໂພນໄຊ, ໜ່ວຍ 15" 
              class="input input-bordered w-full"
              :class="{ 'input-error': customerErrors.address }"
              @input="customerForm.address = filterLaoTextWithSymbols(customerForm.address)" 
            />
            <label v-if="customerErrors.address" class="label pb-0 text-error"><span class="label-text-alt">{{ customerErrors.address }}</span></label>
          </div>
        </div>
      </div>

      <!-- 3. EMPLOYMENT INFORMATION -->
      <div class="mb-8">
        <h3 class="text-base font-bold text-gray-800 dark:text-white border-b pb-3 mb-5 flex items-center gap-2">
          <span class="p-1.5 bg-primary/10 rounded-lg text-primary icon-[tabler--briefcase] size-5"></span>
          3. ຂໍ້ມູນອາຊີບ ແລະ ການເຮັດວຽກ (Employment Info)
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="form-control">
            <label class="label pb-1.5"><span class="label-text font-medium">ປະເພດການຈ້າງງານ <span class="text-error">*</span></span></label>
            <select v-model="customerForm.employment_type" class="select select-bordered w-full" :class="{ 'select-error': customerErrors.employment_type }">
              <option value="" disabled>-- ເລືອກ --</option>
              <option v-for="item in employmentTypes" :key="item.value" :value="item.value">{{ item.label }}</option>
            </select>
            <label v-if="customerErrors.employment_type" class="label pb-0 text-error"><span class="label-text-alt">{{ customerErrors.employment_type }}</span></label>
          </div>

          <div class="form-control">
            <label class="label pb-1.5"><span class="label-text font-medium">ອາຊີບ (ພາສາລາວ) <span class="text-error">*</span></span></label>
            <input 
              v-model="customerForm.occupation" 
              type="text" 
              class="input input-bordered w-full" 
              placeholder="ຕົວຢ່າງ: ຊ່ຽວຊານໄອທີ, ພໍ່ຄ້າ, ຊາວນາ" 
              :class="{ 'input-error': customerErrors.occupation }"
              @input="customerForm.occupation = filterLaoTextOnly(customerForm.occupation)" 
            />
            <label v-if="customerErrors.occupation" class="label pb-0 text-error"><span class="label-text-alt">{{ customerErrors.occupation }}</span></label>
          </div>

          <div class="form-control">
            <label class="label pb-1.5"><span class="label-text font-medium">ຊື່ບໍລິສັດ / ຮ້ານຄ້າ (ພາສາລາວ) <span class="text-error">*</span></span></label>
            <input 
              v-model="customerForm.company_name" 
              type="text" 
              class="input input-bordered w-full" 
              placeholder="ຊື່ບໍລິສັດ ຫຼື ຮ້ານຄ້າ" 
              :class="{ 'input-error': customerErrors.company_name }" 
              @input="customerForm.company_name = filterLaoTextWithSymbols(customerForm.company_name)"
            />
            <label v-if="customerErrors.company_name" class="label pb-0 text-error"><span class="label-text-alt">{{ customerErrors.company_name }}</span></label>
          </div>

          <div class="form-control">
            <label class="label pb-1.5"><span class="label-text font-medium">ຕຳແໜ່ງ (ພາສາລາວ)</span></label>
            <input 
              v-model="customerForm.job_position" 
              type="text" 
              class="input input-bordered w-full" 
              placeholder="ຕົວຢ່າງ: ພະນັກງານການຕະຫຼາດ" 
              @input="customerForm.job_position = filterLaoTextOnly(customerForm.job_position)"
            />
          </div>

          <div class="form-control">
            <label class="label pb-1.5"><span class="label-text font-medium">ພະແນກ (ພາສາລາວ)</span></label>
            <input 
              v-model="customerForm.department" 
              type="text" 
              class="input input-bordered w-full" 
              placeholder="ຕົວຢ່າງ: ພະແນກບັນຊີ, ພະແນກຂາຍ" 
              :class="{ 'input-error': customerErrors.department }"
              @input="customerForm.department = filterLaoTextOnly(customerForm.department)" 
            />
            <label v-if="customerErrors.department" class="label pb-0 text-error"><span class="label-text-alt">{{ customerErrors.department }}</span></label>
          </div>

          <!-- Work Phone field with phone pattern validation -->
          <div class="form-control">
            <label class="label pb-1.5"><span class="label-text font-medium">ເບີໂທບ່ອນເຮັດວຽກ</span></label>
            <input 
              v-model="customerForm.work_phone" 
              type="tel" 
              class="input input-bordered w-full" 
              placeholder="ຕົວຢ່າງ: 021XXXXXX ຫຼື 020XXXXXXXX" 
              maxlength="11" 
              :class="{ 'input-error': customerErrors.work_phone }"
              @input="customerForm.work_phone = customerForm.work_phone.replace(/\D/g, '')"
            />
            <label v-if="customerErrors.work_phone" class="label pb-0 text-error"><span class="label-text-alt">{{ customerErrors.work_phone }}</span></label>
          </div>

          <div class="form-control">
            <label class="label pb-1.5"><span class="label-text font-medium">ປະເພດທຸລະກິດ (ພາສາລາວ)</span></label>
            <input 
              v-model="customerForm.business_type" 
              type="text" 
              class="input input-bordered w-full" 
              placeholder="ຕົວຢ່າງ: ຂາຍຍ່ອຍ, ບໍລິການ, ຂົນສົ່ງ" 
              :class="{ 'input-error': customerErrors.business_type }"
              @input="customerForm.business_type = filterLaoTextOnly(customerForm.business_type)" 
            />
            <label v-if="customerErrors.business_type" class="label pb-0 text-error"><span class="label-text-alt">{{ customerErrors.business_type }}</span></label>
          </div>

          <div class="form-control">
            <label class="label pb-1.5"><span class="label-text font-medium">ອາຍຸງານ (ໄລຍະເວລາເຮັດວຽກ)</span></label>
            <div class="grid grid-cols-2 gap-3">
              <div class="relative">
                <input v-model.number="customerForm.work_duration_years" type="number" min="0" class="input input-bordered w-full pr-8" placeholder="0" />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">ປີ</span>
              </div>
              <div class="relative">
                <input v-model.number="customerForm.work_duration_months" type="number" min="0" max="11" class="input input-bordered w-full pr-12" placeholder="0" />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">ເດືອນ</span>
              </div>
            </div>
          </div>

          <div class="form-control md:col-span-2">
            <label class="label pb-1.5"><span class="label-text font-medium">ລາຍລະອຽດທຸລະກິດ (ພາສາລາວ)</span></label>
            <input 
              v-model="customerForm.business_detail" 
              type="text" 
              class="input input-bordered w-full" 
              placeholder="ລາຍລະອຽດເພີ່ມເຕີມກ່ຽວກັບທຸລະກິດ ຫຼື ສິນຄ້າທີ່ຈຳໜ່າຍ..." 
              :class="{ 'input-error': customerErrors.business_detail }"
              @input="customerForm.business_detail = filterLaoTextWithSymbols(customerForm.business_detail)" 
            />
            <label v-if="customerErrors.business_detail" class="label pb-0 text-error"><span class="label-text-alt">{{ customerErrors.business_detail }}</span></label>
          </div>

          <!-- Work Location -->
          <div class="form-control md:col-span-2 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
            <label class="label pt-0 pb-2"><span class="label-text font-bold text-gray-700 dark:text-gray-200">ສະຖານທີ່ຕັ້ງບ່ອນເຮັດວຽກ (Work Location)</span></label>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select v-model="customerForm.work_province_id" class="select select-bordered w-full">
                <option value="">-- ເລືອກແຂວງ --</option>
                <option v-for="p in addressStore.provinces" :key="p.province_id" :value="p.province_id">{{ p.province_name }}</option>
              </select>
              
              <select v-model="customerForm.work_district_id" class="select select-bordered w-full" :disabled="!customerForm.work_province_id">
                <option value="">-- ເລືອກເມືອງ --</option>
                <option v-for="d in workDistricts" :key="d.district_id" :value="d.district_id">{{ d.district_name }}</option>
              </select>

              <input 
                v-model="customerForm.work_address" 
                type="text" 
                class="input input-bordered w-full" 
                placeholder="ບ້ານ, ໜ່ວຍ, ຖະໜົນ..." 
                @input="customerForm.work_address = filterLaoTextWithSymbols(customerForm.work_address)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 4. FINANCIAL INFORMATION -->
      <div class="mb-8">
        <h3 class="text-base font-bold text-gray-800 dark:text-white border-b pb-3 mb-5 flex items-center gap-2">
          <span class="p-1.5 bg-primary/10 rounded-lg text-primary icon-[tabler--coin] size-5"></span>
          4. ຂໍ້ມູນການເງິນ (Financial Information)
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div class="form-control">
            <label class="label pb-1.5"><span class="label-text font-medium">ລາຍຮັບຕໍ່ເດືອນ (ກີບ) <span class="text-error">*</span></span></label>
            <input 
              :value="formatCurrencyInput(customerForm.monthly_income)" 
              type="text" 
              placeholder="0" 
              class="input input-bordered w-full text-success font-bold" 
              :class="{ 'input-error': customerErrors.monthly_income }" 
              @input="handleCurrencyInput('monthly_income', $event)" 
            />
            <label v-if="customerErrors.monthly_income" class="label pb-0 text-error"><span class="label-text-alt">{{ customerErrors.monthly_income }}</span></label>
          </div>
          
          <div class="form-control">
            <label class="label pb-1.5"><span class="label-text font-medium">ຍອດໜີ້ສິນອື່ນໆຄົງເຫຼືອລວມ (ກີບ)</span></label>
            <input 
              :value="formatCurrencyInput(customerForm.other_debts)" 
              type="text" 
              placeholder="0" 
              class="input input-bordered w-full font-bold" 
              @input="handleCurrencyInput('other_debts', $event)" 
            />
          </div>

          <div class="form-control">
            <label class="label pb-1.5">
              <span class="label-text font-medium text-error">ເງິນທີ່ຕ້ອງຈ່າຍໜີ້ຕໍ່ເດືອນ (ກີບ) <span class="text-error">*</span></span>
            </label>
            <input 
              :value="formatCurrencyInput(customerForm.monthly_debt_payment)" 
              type="text" 
              placeholder="0" 
              class="input input-bordered w-full text-error font-bold" 
              :class="{ 'input-error': customerErrors.monthly_debt_payment }" 
              @input="handleCurrencyInput('monthly_debt_payment', $event)" 
            />
            <label class="label pb-0"><span class="label-text-alt text-gray-400">ໃຊ້ສຳລັບຄຳນວນ DSR (Debt Service Ratio)</span></label>
            <label v-if="customerErrors.monthly_debt_payment" class="label pb-0 text-error"><span class="label-text-alt">{{ customerErrors.monthly_debt_payment }}</span></label>
          </div>
        </div>
      </div>

      <!-- 5. MEMBERSHIP CREDIT REQUEST -->
      <div class="bg-indigo-50/60 dark:bg-indigo-950/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 mb-8">
        <h3 class="text-base font-bold text-indigo-900 dark:text-indigo-300 border-b border-indigo-200/60 dark:border-indigo-800/60 pb-3 mb-5 flex items-center gap-2">
          <span class="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-600 icon-[tabler--credit-card] size-5"></span>
          5. ຄຳຮ້ອງຂໍສິນເຊື່ອສະມາຊິກ (Membership Credit Request)
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="form-control">
            <label class="label pb-1.5"><span class="label-text font-bold text-indigo-950 dark:text-indigo-200">ວົງເງິນສິນເຊື່ອທີ່ຕ້ອງການ (LAK) <span class="text-error">*</span></span></label>
            <input 
              :value="formatCurrencyInput(customerForm.requested_credit_limit)" 
              type="text" 
              placeholder="30,000,000" 
              class="input input-bordered w-full font-black text-xl text-indigo-700 bg-white" 
              :class="{ 'input-error': customerErrors.requested_credit_limit }" 
              @input="handleCurrencyInput('requested_credit_limit', $event)" 
            />
            <label v-if="customerErrors.requested_credit_limit" class="label pb-0 text-error"><span class="label-text-alt">{{ customerErrors.requested_credit_limit }}</span></label>
          </div>
          
          <div class="form-control">
            <label class="label pb-1.5"><span class="label-text font-medium text-indigo-950 dark:text-indigo-200">ຈຸດປະສົງການຂໍສິນເຊື່ອ <span class="text-error">*</span></span></label>
            <select v-model="customerForm.purpose_id" class="select select-bordered w-full bg-white" :class="{ 'select-error': customerErrors.purpose_id }">
              <option value="" disabled>{{ creditStore.isLoading ? 'ກຳລັງໂຫຼດ...' : '-- ເລືອກຈຸດປະສົງ --' }}</option>
              <option v-for="purpose in creditStore.purposes" :key="purpose.id" :value="purpose.id">{{ purpose.purpose_name }}</option>
            </select>
            <label v-if="customerErrors.purpose_id" class="label pb-0 text-error"><span class="label-text-alt">{{ customerErrors.purpose_id }}</span></label>
          </div>

          <div class="form-control md:col-span-2">
            <label class="label pb-1.5"><span class="label-text font-medium text-indigo-950 dark:text-indigo-200">ປະເພດສິນຄ້າ/ບໍລິການ <span class="text-error">*</span></span></label>
            <select v-model="customerForm.requested_product_type" class="select select-bordered w-full bg-white" :class="{ 'select-error': customerErrors.requested_product_type }">
              <option value="" disabled>-- ເລືອກປະເພດ --</option>
              <option value="CONSUMER_ELECTRONICS">ເຄື່ອງໃຊ້ໄຟຟ້າ (Consumer Electronics)</option>
              <option value="MOBILE_PHONE">ໂທລະສັບ (Mobile Phone)</option>
              <option value="HOME_APPLIANCE">ເຄື່ອງໃຊ້ພາຍໃນເຮືອນ (Home Appliance)</option>
              <option value="OTHER">ອື່ນໆ (Other)</option>
            </select>
            <label v-if="customerErrors.requested_product_type" class="label pb-0 text-error"><span class="label-text-alt">{{ customerErrors.requested_product_type }}</span></label>
          </div>
        </div>

        <div class="form-control mt-4">
          <label class="label pb-1.5"><span class="label-text font-medium text-indigo-950 dark:text-indigo-200">ລາຍລະອຽດການນຳໃຊ້ (Usage Goal) <span class="text-error">*</span></span></label>
          <textarea 
            v-model="customerForm.usage_goal" 
            class="textarea textarea-bordered w-full h-20 bg-white" 
            placeholder="ອະທິບາຍວ່າຕ້ອງການນຳວົງເງິນໄປໃຊ້ເພື່ອຫຍັງ..." 
            :class="{ 'textarea-error': customerErrors.usage_goal }"
            @input="customerForm.usage_goal = filterLaoTextWithSymbols(customerForm.usage_goal)"
          ></textarea>
          <label v-if="customerErrors.usage_goal" class="label pb-0 text-error"><span class="label-text-alt">{{ customerErrors.usage_goal }}</span></label>
        </div>

        <div class="form-control mt-4">
          <label class="label pb-1.5"><span class="label-text font-medium text-indigo-950 dark:text-indigo-200">ໝາຍເຫດເພີ່ມເຕີມ (Remarks)</span></label>
          <textarea v-model="customerForm.remarks" class="textarea textarea-bordered w-full h-16 bg-white" placeholder="ຂໍ້ມູນເພີ່ມເຕີມສຳລັບເຈົ້າໜ້າທີ່ພິຈາລະນາ..."></textarea>
        </div>
      </div>

      <!-- 6. CONSENT & DECLARATION -->
      <div class="mb-8">
        <h3 class="text-base font-bold text-gray-800 dark:text-white border-b pb-3 mb-5 flex items-center gap-2">
          <span class="p-1.5 bg-primary/10 rounded-lg text-primary icon-[tabler--shield-check] size-5"></span>
          6. ການຍິນຍອມ ແລະ ຢືນຢັນຂໍ້ມູນ (Consent)
        </h3>
        
        <div class="bg-gray-50 dark:bg-gray-700/40 p-5 rounded-2xl border border-gray-200 dark:border-gray-600 space-y-3">
          <label class="cursor-pointer label justify-start gap-4 p-0">
            <input v-model="customerForm.data_accuracy_confirmation" type="checkbox" class="checkbox checkbox-primary" />
            <span class="label-text font-medium text-gray-800 dark:text-gray-200">
              ຂ້າພະເຈົ້າຂໍຢືນຢັນວ່າຂໍ້ມູນທັງໝົດທີ່ໃຫ້ມາຂ້າງເທິງແມ່ນຄວາມຈິງ ແລະ ຖືກຕ້ອງທຸກປະການ <span class="text-error">*</span>
            </span>
          </label>
          
          <label class="cursor-pointer label justify-start gap-4 p-0">
            <input v-model="customerForm.credit_check_consent" type="checkbox" class="checkbox checkbox-primary" />
            <span class="label-text font-medium text-gray-800 dark:text-gray-200">
              ຂ້າພະເຈົ້າຍິນຍອມໃຫ້ບໍລິສັດກວດສອບປະຫວັດຂໍ້ມູນສິນເຊື່ອ (CIB) ເພື່ອໃຊ້ປະກອບການພິຈາລະນາ <span class="text-error">*</span>
            </span>
          </label>
        </div>
      </div>

      <!-- Footer Action Buttons -->
      <div class="flex justify-end gap-3 border-t pt-6">
        <button type="button" class="btn btn-outline" @click="$router.push('/membership')">
          ຍົກເລີກ
        </button>
        <button type="button" class="btn btn-primary px-8" :disabled="isSubmitting" @click="handleDirectSubmit">
          <span v-if="isSubmitting" class="loading loading-spinner loading-xs"></span>
          <span v-else>ບັນທຶກຄຳຮ້ອງສະໝັກສະມາຊິກ</span>
        </button>
      </div>
    </div>

    <!-- TAB 2: Documents Verification -->
    <div v-else-if="activeTab === 'documents'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white">ອັບໂຫຼດເອກະສານ (Documents)</h2>
        <button class="btn btn-sm btn-outline btn-secondary" @click="$router.push('/membership')">
          ຂ້າມໄປກ່ອນ (ອັບໂຫຼດພາຍຫຼັງ)
        </button>
      </div>

      <div class="space-y-6">
        <div v-for="cat in allDocumentCategories" :key="cat.id" class="border rounded-2xl p-5 bg-white shadow-sm border-slate-200">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h5 class="font-bold text-slate-800">{{ cat.name }}</h5>
              <p class="text-[11px] text-slate-400 mt-1">{{ cat.description }}</p>
            </div>
            <span v-if="cat.required" class="badge badge-error badge-soft text-[10px] font-bold px-2 py-1">ຕ້ອງການ</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            <div v-for="(f, fileIndex) in cat.files" :key="fileIndex" class="relative aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
              <button type="button" class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 z-10 shadow-md hover:scale-110 transition-transform" @click.stop="removeDocument(cat.id, fileIndex)">
                <span class="icon-[tabler--x] size-4"></span>
              </button>
              <img v-if="!f.isPdf" :src="f.preview" class="w-full h-full object-cover cursor-pointer" @click="openInNewTab(f.preview)" />
              <div v-else class="w-full h-full flex flex-col items-center justify-center cursor-pointer" @click="openInNewTab(f.preview)">
                <span class="icon-[tabler--file-type-pdf] size-10 text-red-500 mb-1"></span>
                <span class="text-[10px] text-center truncate px-2 w-full">{{ f.name }}</span>
              </div>
            </div>

            <label class="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-400 transition-all group">
              <input type="file" class="hidden" multiple accept="image/*,.pdf" @change="(e) => handleDocumentUpload(cat.id, e)" />
              <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                <span class="icon-[tabler--plus] size-6 text-slate-400 group-hover:text-indigo-600"></span>
              </div>
              <span class="text-[11px] font-bold text-slate-400 mt-2 group-hover:text-indigo-600">ເພີ່ມໄຟລ໌</span>
            </label>
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <button type="button" class="btn btn-primary" :disabled="isSubmitting || !allRequiredDocumentsUploaded" @click="submitDocuments">
            <span v-if="isSubmitting" class="loading loading-spinner loading-xs"></span>
            <span v-else>ບັນທຶກເອກະສານ ແລະ ສຳເລັດ</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Success Teleport Modal -->
    <teleport to="body">
      <div v-if="showSuccessModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md animate-in fade-in zoom-in duration-200">
          <div class="text-center">
            <div class="w-16 h-16 bg-success/15 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="icon-[tabler--check] size-8 text-success"></span>
            </div>
            <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">ສົ່ງຄຳຮ້ອງຂໍສຳເລັດ!</h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
              ຄຳຮ້ອງສະໝັກສະມາຊິກ ແລະ ວົງເງິນຖືກສົ່ງເຂົ້າລະບົບຮຽບຮ້ອຍແລ້ວ ທ່ານຕ້ອງການອັບໂຫຼດເອກະສານຢັ້ງຢືນດຽວນີ້ເລີຍບໍ່?
            </p>

            <div class="flex flex-col gap-3">
              <button type="button" class="btn btn-primary w-full" @click="switchToDocumentsTab">
                ດຳເນີນການອັບໂຫຼດເອກະສານດຽວນີ້
              </button>
              <button type="button" class="btn btn-outline w-full" @click="$router.push('/membership')">
                ຂ້າມໄປກ່ອນ (ອັບໂຫຼດພາຍຫຼັງ)
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAddressStore } from '@/stores/address'
import { useMembershipCreditStore } from '@/stores/membership-purpose' 
import apiClient from '@/api/apiclient'
import { alert } from '@/utils/alert'
import { normalizePhoneNumber, formatStandardPhoneNumber } from '@/utils/formatters'
import imageCompression from 'browser-image-compression'

interface UploadedFile { id?: number; file: File | null; preview: string; isPdf: boolean; name: string; }
interface DocumentCategory { id: string; name: string; description: string; required: boolean; files: UploadedFile[]; }

const addressStore = useAddressStore()
const creditStore = useMembershipCreditStore() 
const router = useRouter()

const activeTab = ref<'profile' | 'documents'>('profile')
const isSubmitting = ref(false)
const canAccessDocuments = ref(false)
const showSuccessModal = ref(false)
const newApplicationId = ref<number | null>(null) 

const workDistricts = ref<any[]>([]) 

const employmentTypes = [
  { value: 'EMPLOYEE', label: 'ພະນັກງານບໍລິສັດ / ລູກຈ້າງ' },
  { value: 'GOVERNMENT', label: 'ພະນັກງານລັດ / ຂ້າລັດຖະການ' },
  { value: 'SELF_EMPLOYED', label: 'ທຸລະກິດສ່ວນຕົວ / ອິດສະຫຼະ' },
  { value: 'BUSINESS_OWNER', label: 'ເຈົ້າຂອງທຸລະກິດ' },
  { value: 'FARMER', label: 'ກະສິກອນ' },
  { value: 'TRADER', label: 'ຄ້າຂາຍ' },
  { value: 'OTHER', label: 'ອື່ນໆ' }
]

const profileInput = ref<HTMLInputElement | null>(null)
const profileFile = ref<File | null>(null)
const profilePreview = ref<string>('')

// Form State with Lao script & Phone normalization fields
const customerForm = reactive({
  first_name: '',
  last_name: '',
  phone: '',
  gender: '',
  date_of_birth: '',
  age: 0,
  id_card: '',
  account_number: '',

  province_id: '',
  district_id: '',
  address: '',

  employment_type: '',
  occupation: '',
  company_name: '',
  job_position: '',
  work_phone: '',
  department: '',
  business_type: '',
  business_detail: '',
  work_duration_years: 0,
  work_duration_months: 0,
  work_province_id: '',
  work_district_id: '',
  work_address: '',

  monthly_income: 0,
  other_debts: 0,
  monthly_debt_payment: 0,

  requested_credit_limit: 0,
  purpose_id: '',
  usage_goal: '',
  requested_product_type: '',
  remarks: '',

  credit_check_consent: false,
  data_accuracy_confirmation: false
})

const customerErrors = reactive({
  first_name: '',
  last_name: '',
  phone: '',
  gender: '',
  date_of_birth: '',
  id_card: '',
  province_id: '',
  district_id: '',
  address: '',
  employment_type: '',
  occupation: '',
  company_name: '',
  work_phone: '',
  department: '',
  business_type: '',
  business_detail: '',
  monthly_income: '',
  monthly_debt_payment: '',
  requested_credit_limit: '',
  purpose_id: '',
  usage_goal: '',
  requested_product_type: ''
})

// Regex Filter Utilities
const filterLaoTextOnly = (val: string): string => val.replace(/[^\u0E80-\u0EFF\s]/g, '')
const filterLaoTextWithSymbols = (val: string): string => val.replace(/[^\u0E80-\u0EFF\s0-9\/\-,.]/g, '')

const isLaoStrict = (text: string): boolean => /^[\u0E80-\u0EFF\s]*$/.test(text.trim())
const isLaoWithSymbolsStrict = (text: string): boolean => /^[\u0E80-\u0EFF\s0-9\/\-,.]*$/.test(text.trim())

// Automatic Age Calculation
watch(() => customerForm.date_of_birth, (newDob) => {
  if (newDob) {
    const dob = new Date(newDob)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const m = today.getMonth() - dob.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--
    }
    customerForm.age = age > 0 ? age : 0
  } else {
    customerForm.age = 0
  }
})

// Currency Input Handlers
const handleCurrencyInput = (field: 'monthly_income' | 'other_debts' | 'monthly_debt_payment' | 'requested_credit_limit', event: Event) => {
  const target = event.target as HTMLInputElement
  const num = parseInt(target.value.replace(/\D/g, ''), 10)
  customerForm[field] = isNaN(num) ? 0 : num
}

const formatCurrencyInput = (val: number | string | null | undefined): string => {
  if (!val) return ''
  return Number(val).toLocaleString('en-US')
}

// Residential Address Watcher
watch(() => customerForm.province_id, async (newVal) => {
  customerForm.district_id = ''
  if (newVal) await addressStore.fetchDistricts(newVal)
  else addressStore.districts = []
})

// Work Location Address Watcher
watch(() => customerForm.work_province_id, async (newVal) => {
  customerForm.work_district_id = ''
  workDistricts.value = []

  if (newVal) {
    try {
      const res = await apiClient.get(`/address/provinces/${newVal}/districts`)
      const responseData = res.data?.data || res.data
      if (Array.isArray(responseData)) {
        workDistricts.value = responseData
      } else {
        workDistricts.value = []
      }
    } catch {
      workDistricts.value = []
    }
  }
})

// Tab Navigation & Upload Controls
const switchTab = (tab: 'profile' | 'documents') => {
  if (tab === 'documents' && !canAccessDocuments.value) return
  activeTab.value = tab
}

const triggerProfileUpload = () => { profileInput.value?.click() }
const removeProfileImage = () => {
  profileFile.value = null
  profilePreview.value = ''
  if (profileInput.value) profileInput.value.value = ''
}

const handleProfileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) return
  const file = files[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    alert.error('ຮູບໃຫຍ່ເກີນໄປ', 'ຂະໜາດຮູບບໍ່ເກີນ 5MB')
    target.value = ''
    return
  }

  try {
    const compressedBlob = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true })
    profileFile.value = new File([compressedBlob], file.name, { type: compressedBlob.type, lastModified: Date.now() })
    const reader = new FileReader()
    reader.onload = (e) => { profilePreview.value = e.target?.result as string }
    reader.readAsDataURL(profileFile.value)
  } catch (error) {
    console.error('Compress error:', error)
  }
}

// Complete Validation Engine matching CreateWalkinLoan
const validateCustomerForm = (): boolean => {
  Object.keys(customerErrors).forEach(key => { customerErrors[key as keyof typeof customerErrors] = '' })
  let isValid = true

  // 1. Personal Info
  if (!customerForm.first_name.trim()) { 
    customerErrors.first_name = 'ກະລຸນາປ້ອນຊື່ແທ້'
    isValid = false 
  } else if (!isLaoStrict(customerForm.first_name)) {
    customerErrors.first_name = 'ຊື່ແທ້ຕ້ອງເປັນພາສາລາວເທົ່ານັ້ນ'
    isValid = false
  }

  if (!customerForm.last_name.trim()) { 
    customerErrors.last_name = 'ກະລຸນາປ້ອນນາມສະກຸນ'
    isValid = false 
  } else if (!isLaoStrict(customerForm.last_name)) {
    customerErrors.last_name = 'ນາມສະກຸນຕ້ອງເປັນພາສາລາວເທົ່ານັ້ນ'
    isValid = false
  }

  // 🌟 Phone Validation logic identical to CreateWalkinLoan.vue
  if (!customerForm.phone.trim()) {
    customerErrors.phone = 'ກະລຸນາປ້ອນເບີໂທລະສັບ'
    isValid = false
  } else {
    const normalizedPhone = normalizePhoneNumber(customerForm.phone)
    if (normalizedPhone.length < 7 || normalizedPhone.length > 8) {
      customerErrors.phone = 'ເບີໂທລະສັບບໍ່ຖືກຕ້ອງ (ຕົວຢ່າງ: 020 99887766)'
      isValid = false
    }
  }

  if (!customerForm.gender) { 
    customerErrors.gender = 'ກະລຸນາເລືອກເພດ'
    isValid = false 
  }

  if (!customerForm.date_of_birth) { 
    customerErrors.date_of_birth = 'ກະລຸນາປ້ອນວັນເດືອນປີເກີດ'
    isValid = false 
  }

  if (!customerForm.id_card.trim()) { 
    customerErrors.id_card = 'ກະລຸນາປ້ອນເລກບັດປະຈຳຕົວ / ສຳມະໂນຄົວ'
    isValid = false 
  }

  // 2. Address
  if (!customerForm.province_id) { 
    customerErrors.province_id = 'ກະລຸນາເລືອກແຂວງ'
    isValid = false 
  }
  if (!customerForm.district_id) { 
    customerErrors.district_id = 'ກະລຸນາເລືອກເມືອງ'
    isValid = false 
  }
  if (!customerForm.address.trim()) { 
    customerErrors.address = 'ກະລຸນາປ້ອນທີ່ຢູ່'
    isValid = false 
  } else if (!isLaoWithSymbolsStrict(customerForm.address)) {
    customerErrors.address = 'ທີ່ຢູ່ຕ້ອງເປັນພາສາລາວເທົ່ານັ້ນ'
    isValid = false
  }

  // 3. Employment & Work Info
  if (!customerForm.employment_type) { 
    customerErrors.employment_type = 'ກະລຸນາເລືອກປະເພດການຈ້າງງານ'
    isValid = false 
  }
  if (!customerForm.occupation.trim()) { 
    customerErrors.occupation = 'ກະລຸນາປ້ອນອາຊີບ'
    isValid = false 
  } else if (!isLaoStrict(customerForm.occupation)) {
    customerErrors.occupation = 'ອາຊີບຕ້ອງເປັນພາສາລາວເທົ່ານັ້ນ'
    isValid = false
  }

  if (!customerForm.company_name.trim()) { 
    customerErrors.company_name = 'ກະລຸນາປ້ອນຊື່ບໍລິສັດ'
    isValid = false 
  } else if (!isLaoWithSymbolsStrict(customerForm.company_name)) {
    customerErrors.company_name = 'ຊື່ບໍລິສັດຕ້ອງເປັນພາສາລາວເທົ່ານັ້ນ'
    isValid = false
  }

  // Work Phone validation if provided
  if (customerForm.work_phone.trim()) {
    const normalizedWorkPhone = normalizePhoneNumber(customerForm.work_phone)
    if (normalizedWorkPhone.length < 6 || normalizedWorkPhone.length > 8) {
      customerErrors.work_phone = 'ເບີໂທບ່ອນເຮັດວຽກບໍ່ຖືກຕ້ອງ (ຕົວຢ່າງ: 021 212121 ຫຼື 020 99887766)'
      isValid = false
    }
  }

  // Optional Lao Text Validations
  if (customerForm.department && !isLaoStrict(customerForm.department)) {
    customerErrors.department = 'ພະແນກຕ້ອງເປັນພາສາລາວເທົ່ານັ້ນ'
    isValid = false
  }

  if (customerForm.business_type && !isLaoStrict(customerForm.business_type)) {
    customerErrors.business_type = 'ປະເພດທຸລະກິດຕ້ອງເປັນພາສາລາວເທົ່ານັ້ນ'
    isValid = false
  }

  if (customerForm.business_detail && !isLaoWithSymbolsStrict(customerForm.business_detail)) {
    customerErrors.business_detail = 'ລາຍລະອຽດທຸລະກິດຕ້ອງເປັນພາສາລາວເທົ່ານັ້ນ'
    isValid = false
  }

  // 4. Financial Info
  if (customerForm.monthly_income <= 0) { 
    customerErrors.monthly_income = 'ກະລຸນາລະບຸລາຍຮັບທີ່ຖືກຕ້ອງ'
    isValid = false 
  }
  if (customerForm.monthly_debt_payment < 0) { 
    customerErrors.monthly_debt_payment = 'ຍອດຈ່າຍໜີ້ບໍ່ສາມາດຕິດລົບໄດ້'
    isValid = false 
  }

  // 5. Credit Request
  if (customerForm.requested_credit_limit <= 0) { 
    customerErrors.requested_credit_limit = 'ກະລຸນາລະບຸວົງເງິນທີ່ຕ້ອງການຂໍ'
    isValid = false 
  }
  if (!customerForm.purpose_id) { 
    customerErrors.purpose_id = 'ກະລຸນາເລືອກຈຸດປະສົງ'
    isValid = false 
  }
  if (!customerForm.requested_product_type) { 
    customerErrors.requested_product_type = 'ກະລຸນາເລືອກປະເພດສິນຄ້າ'
    isValid = false 
  }
  if (!customerForm.usage_goal.trim()) { 
    customerErrors.usage_goal = 'ກະລຸນາອະທິບາຍການນຳໃຊ້'
    isValid = false 
  }

  // 6. Consent Checks
  if (!customerForm.data_accuracy_confirmation) {
    alert.error('ຢືນຢັນຂໍ້ມູນ', 'ກະລຸນາຕິກເພື່ອຢືນຢັນວ່າຂໍ້ມູນຖືກຕ້ອງ')
    isValid = false
  }
  if (!customerForm.credit_check_consent) {
    alert.error('ການຍິນຍອມ', 'ກະລຸນາຕິກຍິນຍອມໃຫ້ກວດສອບຂໍ້ມູນເຄຣດິດ (CIB)')
    isValid = false
  }

  return isValid
}

// Form Submission
const handleDirectSubmit = async () => {
  if (!validateCustomerForm()) return
  isSubmitting.value = true

  try {
    const cleanSubmitPhone = normalizePhoneNumber(customerForm.phone)
    const standardizedPhone = formatStandardPhoneNumber(cleanSubmitPhone)

    const formData = new FormData()

    formData.append('first_name', customerForm.first_name)
    formData.append('last_name', customerForm.last_name)
    formData.append('phone', standardizedPhone)
    formData.append('gender', customerForm.gender)
    formData.append('date_of_birth', customerForm.date_of_birth)
    formData.append('age', String(customerForm.age || 0))
    formData.append('identity_number', customerForm.id_card)
    formData.append('account_number', customerForm.account_number)

    formData.append('province_id', customerForm.province_id)
    formData.append('district_id', customerForm.district_id)
    formData.append('address', customerForm.address)

    formData.append('employment_type', customerForm.employment_type)
    formData.append('occupation', customerForm.occupation)
    formData.append('company_name', customerForm.company_name)
    formData.append('job_position', customerForm.job_position)
    formData.append('work_duration_years', String(customerForm.work_duration_years))
    formData.append('work_duration_months', String(customerForm.work_duration_months))

    formData.append('work_phone', customerForm.work_phone.trim() ? formatStandardPhoneNumber(normalizePhoneNumber(customerForm.work_phone)) : '')
    formData.append('department', customerForm.department)
    formData.append('business_type', customerForm.business_type)
    formData.append('business_detail', customerForm.business_detail)

    formData.append('work_province_id', customerForm.work_province_id)
    formData.append('work_district_id', customerForm.work_district_id)
    formData.append('work_address', customerForm.work_address)

    formData.append('income_per_month', String(customerForm.monthly_income))
    formData.append('other_debt', String(customerForm.other_debts))
    formData.append('monthly_debt_payment', String(customerForm.monthly_debt_payment))

    formData.append('requested_credit_limit', String(customerForm.requested_credit_limit))
    formData.append('purpose_id', String(customerForm.purpose_id))
    formData.append('usage_goal', customerForm.usage_goal)
    formData.append('requested_product_type', customerForm.requested_product_type)
    formData.append('remarks', customerForm.remarks)

    formData.append('credit_check_consent', String(customerForm.credit_check_consent))
    formData.append('data_accuracy_confirmation', String(customerForm.data_accuracy_confirmation))

    if (profileFile.value) {
      formData.append('profile_image', profileFile.value)
    }

    const res = await apiClient.post('/membership-origination/staff-apply', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    newApplicationId.value = res.data?.data?.application_id || res.data?.id
    showSuccessModal.value = true
    canAccessDocuments.value = true
  } catch (error: any) {
    alert.error('ເກີດຂໍ້ຜິດພາດ', error.response?.data?.message || 'ບໍ່ສາມາດສ້າງຄຳຂໍໄດ້')
  } finally {
    isSubmitting.value = false
  }
}

// Documents State & Stubs
const requiredDocuments = ref<DocumentCategory[]>([
  { id: 'id_card', name: 'ບັດປະຈຳຕົວ/ສຳມະໂນຄົວ', description: 'ຮູບຖ່າຍເອກະສານຢັ້ງຢືນຕົວຕົນ', required: true, files: [] },
  { id: 'house_reg', name: 'ປື້ມສຳມະໂນຄົວ', description: 'ເອກະສານຢັ້ງຢືນທີ່ຢູ່', required: false, files: [] }
])
const optionalDocuments = ref<DocumentCategory[]>([
  { id: 'salary_slip', name: 'ຫຼັກຖານລາຍຮັບ', description: 'ໃບເງິນເດືອນ ຫຼື ໃບຮັບລາຍຮັບ', required: false, files: [] },
  { id: 'other', name: 'ເອກະສານອື່ນໆ', description: 'ເອກະສານອື່ນໆທີ່ກ່ຽວຂ້ອງ', required: false, files: [] }
])

const allDocumentCategories = computed(() => [...requiredDocuments.value, ...optionalDocuments.value])
const allRequiredDocumentsUploaded = computed(() => requiredDocuments.value.every(cat => !cat.required || cat.files.length > 0))

const switchToDocumentsTab = () => {
  activeTab.value = 'documents'
  showSuccessModal.value = false
}

const handleDocumentUpload = async (typeId: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) return
  const category = allDocumentCategories.value.find(c => c.id === typeId)
  if (!category) return

  for (let i = 0; i < files.length; i++) {
    const currentFile = files[i]
    if (!currentFile) continue
    if (currentFile.size > 8 * 1024 * 1024) {
      alert.error('ໄຟລ໌ໃຫຍ່ເກີນໄປ', 'ສູງສຸດ 8MB')
      continue
    }

    let finalFile: File = currentFile
    if (finalFile.type.startsWith('image/')) {
      try {
        const compressedBlob = await imageCompression(currentFile, { maxSizeMB: 2, maxWidthOrHeight: 1920, useWebWorker: true })
        finalFile = new File([compressedBlob], currentFile.name, { type: compressedBlob.type, lastModified: Date.now() })
      } catch (error) {
        console.error('Compress error:', error)
      }
    }

    const isPdf = finalFile.type === 'application/pdf'
    const reader = new FileReader()
    reader.onload = (e) => {
      category.files.push({
        file: finalFile,
        preview: (e.target?.result as string) || '',
        isPdf,
        name: finalFile.name
      })
    }
    reader.readAsDataURL(finalFile)
  }
  target.value = ''
}

const removeDocument = (typeId: string, fileIndex: number) => {
  const category = allDocumentCategories.value.find(c => c.id === typeId)
  if (category && category.files[fileIndex]) {
    category.files.splice(fileIndex, 1)
  }
}

const openInNewTab = (url: string) => {
  if (url) window.open(url, '_blank')
}

const submitDocuments = async () => {
  // Document uploading logic
}

onMounted(async () => {
  await addressStore.fetchProvinces()
  await creditStore.fetchPurposes()
})
</script>
