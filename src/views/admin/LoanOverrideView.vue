
<template>
  <div class="min-h-screen bg-slate-50 p-6 font-lao text-slate-800">
    <div class="max-w-6xl mx-auto space-y-6">

      <header class="bg-red-50 border border-red-200 p-6 rounded-2xl shadow-sm">
        <h1 class="text-2xl font-black text-red-700 flex items-center gap-2">
          <span class="icon-[tabler--settings-exclamation] size-8"></span> IT Support: ລະບົບແກ້ໄຂສິນເຊື່ອສຸກເສີນ
        </h1>
        <p class="text-sm text-red-600 mt-2 font-medium">
          (God Mode) ແກ້ໄຂສະຖານະ, ຮ້ານຄ້າ, ສິນຄ້າ, ຂໍ້ມູນລູກຄ້າ ແລະ ການເງິນ. ລະບົບຈະບັນທຶກປະຫວັດການແກ້ໄຂໄວ້ຢ່າງລະອຽດ.
        </p>
      </header>

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

      <div v-if="snapshot" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <!-- 🌟 ຊ້າຍ: ຂໍ້ມູນປັດຈຸບັນ -->
          <section class="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit opacity-90">
            <h3 class="text-lg font-bold text-slate-800 border-b pb-3 mb-4 flex items-center gap-2">
              <span class="icon-[tabler--database] size-5 text-slate-500"></span> ຂໍ້ມູນປັດຈຸບັນ
            </h3>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between border-b pb-2"><span class="text-slate-500">ສະຖານະ:</span> <b
                  class="uppercase text-slate-700">{{ snapshot.status }}</b></div>
              <div class="flex justify-between border-b pb-2"><span class="text-slate-500">ລູກຄ້າ:</span> <b class="text-right">{{
                snapshot.customer?.first_name }} {{ snapshot.customer?.last_name }}</b></div>
              <div class="flex justify-between border-b pb-2"><span class="text-slate-500">ຮ້ານຄ້າ:</span> <b class="text-right">{{
                snapshot.partner_name }}</b></div>
              <div class="flex justify-between border-b pb-2"><span class="text-slate-500">ສິນຄ້າ:</span> <b class="text-right">{{
                snapshot.product?.product_name }}</b></div>
              <div class="flex justify-between border-b pb-2"><span class="text-slate-500">ຕົວເລືອກ:</span> <b>{{
                snapshot.variant?.color || 'N/A' }}</b></div>
              <div class="flex justify-between border-b pb-2"><span class="text-slate-500">ຍອດຈັດ:</span> <b
                  class="text-sky-700">{{ formatPrice(snapshot.total_amount) }}</b></div>
              <div class="flex justify-between border-b pb-2">
                <span class="text-slate-500">ດອກເບ້ຍ:</span>
                <b>{{ snapshot.interest_rate_at_apply }}% ({{ snapshot.interest_type === 'effective_rate' ?
                  'ຫຼຸດຕົ້ນຫຼຸດດອກ' : 'ຄົງທີ່' }})</b>
              </div>
              <div class="flex justify-between pb-2"><span class="text-slate-500">ຄ່າຜ່ອນ/ເດືອນ:</span> <b
                  class="text-sky-600 font-black">{{ formatPrice(snapshot.monthly_pay) }}</b></div>
            </div>
          </section>

          <!-- 🌟 ຂວາ: ຟອມແກ້ໄຂຂໍ້ມູນ (God Mode Overrides) -->
          <section class="lg:col-span-8 bg-white p-6 rounded-2xl shadow-xl border-2 border-red-200 space-y-4 relative">
            <h3 class="text-lg font-bold text-red-700 border-b pb-3 mb-4">ກຳນົດຄ່າໃໝ່ (Overrides)</h3>

            <div class="form-control mb-4 p-4 bg-red-50 border border-red-100 rounded-xl">
              <label class="label"><span class="label-text font-bold text-red-800">ປະເພດການແກ້ໄຂ (Action Type)
                  *</span></label>
              <select v-model="overrideForm.action_type"
                class="select select-bordered w-full bg-white font-bold text-red-700">
                <option value="FULL_OVERRIDE">ແກ້ໄຂທຸກຂໍ້ມູນ (Full Override)</option>
                
                <optgroup label="ແກ້ໄຂສັນຍາ ແລະ ສິນຄ້າ">
                  <option value="CHANGE_PAYMENT_DATE">ແກ້ໄຂສະເພາະວັນທີຜ່ອນງວດທຳອິດ (Change 1st Payment Date)</option>
                  <option value="CHANGE_PARTNER">ປ່ຽນຮ້ານຄ້າ ແລະ ສິນຄ້າ (Change Partner & Product)</option>
                  <option value="CHANGE_PRODUCT">ປ່ຽນສະເພາະສິນຄ້າ (Change Product Only)</option>
                </optgroup>
                
                <optgroup label="ແກ້ໄຂຂໍ້ມູນບຸກຄົນ">
                  <option value="CHANGE_CUSTOMER_INFO">ແກ້ໄຂສະເພາະຂໍ້ມູນລູກຄ້າ (Change Customer Info)</option>
                  <option value="CHANGE_WORK_INFO">ແກ້ໄຂສະເພາະຂໍ້ມູນບ່ອນເຮັດວຽກ (Change Work Info)</option>
                  <option value="CHANGE_GUARANTOR_INFO">ແກ້ໄຂສະເພາະຂໍ້ມູນຜູ້ຄ້ຳປະກັນ (Change Guarantor Info)</option>
                </optgroup>

                <optgroup label="ຍົກເລີກສິນເຊື່ອ">
                  <option value="CANCEL_ONLY">ຍົກເລີກບິນຖາວອນ (Cancel Only)</option>
                  <option value="CANCEL_AND_RECREATE">ຍົກເລີກບິນເກົ່າ ແລະ ເຊື່ອມໂຍງບິນໃໝ່ (Cancel & Recreate)</option>
                </optgroup>
              </select>
            </div>

            <!-- 🌟 ຟອມປ້ອນຂໍ້ມູນຕາມ Action Type ທີ່ເລືອກ 🌟 -->
            <div class="space-y-6">

              <div v-if="overrideForm.action_type === 'CANCEL_AND_RECREATE'"
                class="form-control mb-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <label class="label"><span class="label-text font-bold text-orange-800">ລະຫັດບິນໃໝ່ທີ່ພະນັກງານສ້າງໄວ້ແລ້ວ
                    (New Loan ID) *</span></label>
                <input v-model="overrideForm.replacement_loan_id_str" type="text" placeholder="ຕົວຢ່າງ: LN-2026-0099"
                  class="input input-bordered w-full bg-white font-mono text-orange-900 font-bold" />
              </div>

              <!-- ============================================== -->
              <!-- 🟢 1. ຂໍ້ມູນລູກຄ້າ (customers) -->
              <!-- ============================================== -->
              <div v-if="['FULL_OVERRIDE', 'CHANGE_CUSTOMER_INFO'].includes(overrideForm.action_type)" class="bg-indigo-50/50 p-5 rounded-xl border border-indigo-200">
                <h4 class="font-bold text-indigo-800 mb-4 flex items-center gap-2 border-b border-indigo-200 pb-2">
                  <span class="icon-[tabler--user] size-5"></span> ຂໍ້ມູນລູກຄ້າ (Customer Info)
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="form-control"><label class="label"><span class="label-text font-medium">ຊື່ແທ້ (First Name)</span></label><input v-model="overrideForm.cust_first_name" type="text" class="input input-bordered input-sm bg-white" /></div>
                  <div class="form-control"><label class="label"><span class="label-text font-medium">ນາມສະກຸນ (Last Name)</span></label><input v-model="overrideForm.cust_last_name" type="text" class="input input-bordered input-sm bg-white" /></div>
                  <div class="form-control"><label class="label"><span class="label-text font-medium">ເພດ (Gender)</span></label>
                    <select v-model="overrideForm.cust_gender" class="select select-bordered select-sm bg-white">
                      <option value="Male">ຊາຍ (Male)</option>
                      <option value="Female">ຍິງ (Female)</option>
                    </select>
                  </div>
                  
                  <div class="form-control"><label class="label"><span class="label-text font-medium">ເບີໂທລະສັບ</span></label><input v-model="overrideForm.cust_phone" type="text" class="input input-bordered input-sm bg-white" /></div>
                  <div class="form-control"><label class="label"><span class="label-text font-medium">ວັນເດືອນປີເກີດ</span></label><input v-model="overrideForm.cust_dob" type="date" class="input input-bordered input-sm bg-white" /></div>
                  <div class="form-control"><label class="label"><span class="label-text font-medium">ອາຍຸ (Age)</span></label><input v-model.number="overrideForm.cust_age" type="number" class="input input-bordered input-sm bg-white" /></div>

                  <div class="form-control"><label class="label"><span class="label-text font-medium">ເລກບັດປະຈຳຕົວ</span></label><input v-model="overrideForm.cust_identity_number" type="text" class="input input-bordered input-sm bg-white" /></div>
                  <div class="form-control"><label class="label"><span class="label-text font-medium">ເລກສຳມະໂນຄົວ</span></label><input v-model="overrideForm.cust_census_number" type="text" class="input input-bordered input-sm bg-white" /></div>
                  <div class="form-control"><label class="label"><span class="label-text font-medium">ເລກບັນຊີທະນາຄານ</span></label><input v-model="overrideForm.cust_account_number" type="text" class="input input-bordered input-sm bg-white" /></div>

                  <div class="form-control"><label class="label"><span class="label-text font-medium">ອອກໃຫ້ທີ່ (Issue Place)</span></label><input v-model="overrideForm.cust_issue_place" type="text" class="input input-bordered input-sm bg-white" /></div>
                  <div class="form-control"><label class="label"><span class="label-text font-medium">ວັນທີອອກບັດ</span></label><input v-model="overrideForm.cust_issue_date" type="date" class="input input-bordered input-sm bg-white" /></div>
                  <div class="form-control"><label class="label"><span class="label-text font-medium">ໜ່ວຍ (Unit)</span></label><input v-model="overrideForm.cust_unit" type="text" class="input input-bordered input-sm bg-white" /></div>

                  <!-- 🌟 ແຂວງ ແລະ ເມືອງ ລູກຄ້າ (Dropdown) 🌟 -->
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ແຂວງ (Province)</span></label>
                    <select v-model="overrideForm.cust_province_id" class="select select-bordered select-sm bg-white">
                      <option value="">-- ເລືອກແຂວງ --</option>
                      <option v-for="p in addressStore.provinces" :key="p.province_id" :value="p.province_id">{{ p.province_name }}</option>
                    </select>
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ເມືອງ (District)</span></label>
                    <select v-model="overrideForm.cust_district_id" :disabled="!overrideForm.cust_province_id" class="select select-bordered select-sm bg-white">
                      <option value="">-- ເລືອກເມືອງ --</option>
                      <option v-for="d in customerDistricts" :key="d.district_id" :value="d.district_id">{{ d.district_name }}</option>
                    </select>
                  </div>
                  <div class="form-control"><label class="label"><span class="label-text font-medium">ທີ່ຢູ່ປະຈຸບັນລາຍລະອຽດ</span></label><input v-model="overrideForm.cust_address" type="text" class="input input-bordered input-sm w-full bg-white" /></div>

                  <div class="form-control"><label class="label"><span class="label-text font-medium">ອາຊີບ (Occupation)</span></label><input v-model="overrideForm.cust_occupation" type="text" class="input input-bordered input-sm bg-white" /></div>
                  <div class="form-control"><label class="label"><span class="label-text font-medium text-success">ລາຍຮັບຕໍ່ເດືອນ</span></label><input v-model.number="overrideForm.cust_income" type="number" class="input input-bordered input-sm bg-white font-bold" /></div>
                  <div class="form-control"><label class="label"><span class="label-text font-medium text-error">ໜີ້ສິນອື່ນໆຕໍ່ເດືອນ</span></label><input v-model.number="overrideForm.cust_other_debt" type="number" class="input input-bordered input-sm bg-white font-bold" /></div>
                </div>
              </div>

              <!-- ============================================== -->
              <!-- 🟢 2. ຂໍ້ມູນທີ່ເຮັດວຽກ (customer_work_info) -->
              <!-- ============================================== -->
              <div v-if="['FULL_OVERRIDE', 'CHANGE_WORK_INFO'].includes(overrideForm.action_type)" class="bg-emerald-50/50 p-5 rounded-xl border border-emerald-200">
                <h4 class="font-bold text-emerald-800 mb-4 flex items-center gap-2 border-b border-emerald-200 pb-2">
                  <span class="icon-[tabler--building] size-5"></span> ຂໍ້ມູນບ່ອນເຮັດວຽກ (Employment Info)
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="form-control md:col-span-2"><label class="label"><span class="label-text font-medium">ຊື່ບໍລິສັດ/ສະຖານທີ່</span></label><input v-model="overrideForm.work_company_name" type="text" class="input input-bordered input-sm bg-white" /></div>
                  <div class="form-control"><label class="label"><span class="label-text font-medium">ເບີໂທບ່ອນເຮັດວຽກ</span></label><input v-model="overrideForm.work_phone" type="text" class="input input-bordered input-sm bg-white" /></div>
                  
                  <div class="form-control"><label class="label"><span class="label-text font-medium">ປະເພດການຈ້າງງານ</span></label><input v-model="overrideForm.work_employment_type" type="text" placeholder="ເຊັ່ນ: ພະນັກງານລັດ, ເອກະຊົນ" class="input input-bordered input-sm bg-white" /></div>
                  <div class="form-control"><label class="label"><span class="label-text font-medium">ປະເພດທຸລະກິດ</span></label><input v-model="overrideForm.work_business_type" type="text" class="input input-bordered input-sm bg-white" /></div>
                  <div class="form-control"><label class="label"><span class="label-text font-medium">ພະແນກ (Department)</span></label><input v-model="overrideForm.work_department" type="text" class="input input-bordered input-sm bg-white" /></div>
                  
                  <div class="form-control"><label class="label"><span class="label-text font-medium">ຕຳແໜ່ງ (Position)</span></label><input v-model="overrideForm.work_position" type="text" class="input input-bordered input-sm bg-white" /></div>
                  <div class="form-control"><label class="label"><span class="label-text font-medium">ອາຍຸງານ (ປີ)</span></label><input v-model.number="overrideForm.work_duration_years" type="number" class="input input-bordered input-sm bg-white" /></div>
                  <div class="form-control"><label class="label"><span class="label-text font-medium">ອາຍຸງານ (ເດືອນ)</span></label><input v-model.number="overrideForm.work_duration_months" type="number" class="input input-bordered input-sm bg-white" /></div>

                  <!-- 🌟 ແຂວງ ແລະ ເມືອງ ບ່ອນເຮັດວຽກ (Dropdown) 🌟 -->
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ແຂວງບ່ອນເຮັດວຽກ</span></label>
                    <select v-model="overrideForm.work_province_id" class="select select-bordered select-sm bg-white">
                      <option value="">-- ເລືອກແຂວງ --</option>
                      <option v-for="p in addressStore.provinces" :key="p.province_id" :value="p.province_id">{{ p.province_name }}</option>
                    </select>
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ເມືອງບ່ອນເຮັດວຽກ</span></label>
                    <select v-model="overrideForm.work_district_id" :disabled="!overrideForm.work_province_id" class="select select-bordered select-sm bg-white">
                      <option value="">-- ເລືອກເມືອງ --</option>
                      <option v-for="d in workDistricts" :key="d.district_id" :value="d.district_id">{{ d.district_name }}</option>
                    </select>
                  </div>
                  <div class="form-control"><label class="label"><span class="label-text font-medium">ເງິນເດືອນ (Salary)</span></label><input v-model.number="overrideForm.work_salary" type="number" class="input input-bordered input-sm bg-white font-bold text-emerald-700" /></div>
                  
                  <div class="form-control md:col-span-3"><label class="label"><span class="label-text font-medium">ລາຍລະອຽດທຸລະກິດ (Business Detail)</span></label><input v-model="overrideForm.work_business_detail" type="text" class="input input-bordered input-sm bg-white" /></div>
                  <div class="form-control md:col-span-3"><label class="label"><span class="label-text font-medium">ທີ່ຢູ່ບ່ອນເຮັດວຽກລາຍລະອຽດ</span></label><input v-model="overrideForm.work_address" type="text" class="input input-bordered input-sm bg-white" /></div>
                </div>
              </div>

              <!-- ============================================== -->
              <!-- 🟢 3. ຂໍ້ມູນຜູ້ຄ້ຳປະກັນ (loan_guarantors) -->
              <!-- ============================================== -->
              <div v-if="['FULL_OVERRIDE', 'CHANGE_GUARANTOR_INFO'].includes(overrideForm.action_type)" class="bg-fuchsia-50/50 p-5 rounded-xl border border-fuchsia-200">
                <h4 class="font-bold text-fuchsia-800 mb-4 flex items-center gap-2 border-b border-fuchsia-200 pb-2">
                  <span class="icon-[tabler--users] size-5"></span> ຂໍ້ມູນບຸກຄົນອ້າງອີງ / ຜູ້ຄ້ຳປະກັນ (Guarantor Info)
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="form-control"><label class="label"><span class="label-text font-medium">ປະເພດບຸກຄົນອ້າງອີງ</span></label>
                    <select v-model="overrideForm.guar_ref_type" class="select select-bordered select-sm bg-white">
                      <option value="guarantor">ຜູ້ຄ້ຳປະກັນ (Guarantor)</option>
                      <option value="reference">ບຸກຄົນອ້າງອີງ (Reference)</option>
                    </select>
                  </div>
                  <div class="form-control md:col-span-2"><label class="label"><span class="label-text font-medium">ຊື່ ແລະ ນາມສະກຸນເຕັມ</span></label><input v-model="overrideForm.guar_name" type="text" class="input input-bordered input-sm bg-white" /></div>
                  
                  <div class="form-control"><label class="label"><span class="label-text font-medium">ເບີໂທລະສັບ</span></label><input v-model="overrideForm.guar_phone" type="text" class="input input-bordered input-sm bg-white" /></div>
                  <div class="form-control"><label class="label"><span class="label-text font-medium">ຄວາມສຳພັນ (Relationship)</span></label><input v-model="overrideForm.guar_relationship" type="text" class="input input-bordered input-sm bg-white" /></div>
                  <div class="form-control"><label class="label"><span class="label-text font-medium">ເລກບັດປະຈຳຕົວ</span></label><input v-model="overrideForm.guar_identity_number" type="text" class="input input-bordered input-sm bg-white" /></div>

                  <div class="form-control"><label class="label"><span class="label-text font-medium">ວັນເດືອນປີເກີດ</span></label><input v-model="overrideForm.guar_dob" type="date" class="input input-bordered input-sm bg-white" /></div>
                  <div class="form-control"><label class="label"><span class="label-text font-medium">ອາຍຸ (Age)</span></label><input v-model.number="overrideForm.guar_age" type="number" class="input input-bordered input-sm bg-white" /></div>
                  <div class="form-control"><label class="label"><span class="label-text font-medium">ອາຊີບ (Occupation)</span></label><input v-model="overrideForm.guar_occupation" type="text" class="input input-bordered input-sm bg-white" /></div>

                  <div class="form-control md:col-span-3"><label class="label"><span class="label-text font-medium">ທີ່ຢູ່ປະຈຸບັນລາຍລະອຽດ</span></label><input v-model="overrideForm.guar_address" type="text" class="input input-bordered input-sm w-full bg-white" /></div>
                  
                  <!-- 🌟 ແຂວງ ແລະ ເມືອງ ທີ່ຢູ່ຜູ້ຄ້ຳ (Dropdown) 🌟 -->
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ແຂວງ (ທີ່ຢູ່)</span></label>
                    <select v-model="overrideForm.guar_province_id" class="select select-bordered select-sm bg-white">
                      <option value="">-- ເລືອກແຂວງ --</option>
                      <option v-for="p in addressStore.provinces" :key="p.province_id" :value="p.province_id">{{ p.province_name }}</option>
                    </select>
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ເມືອງ (ທີ່ຢູ່)</span></label>
                    <select v-model="overrideForm.guar_district_id" :disabled="!overrideForm.guar_province_id" class="select select-bordered select-sm bg-white">
                      <option value="">-- ເລືອກເມືອງ --</option>
                      <option v-for="d in guarantorDistricts" :key="d.district_id" :value="d.district_id">{{ d.district_name }}</option>
                    </select>
                  </div>
                  <div><!-- Spacer --></div>

                  <div class="col-span-3 border-t border-fuchsia-200 mt-2 pt-2"></div>
                  
                  <div class="form-control md:col-span-2"><label class="label"><span class="label-text font-medium">ຊື່ບໍລິສັດທີ່ເຮັດວຽກ</span></label><input v-model="overrideForm.guar_work_company_name" type="text" class="input input-bordered input-sm bg-white" /></div>
                  <div class="form-control"><label class="label"><span class="label-text font-medium">ເບີໂທບ່ອນເຮັດວຽກ</span></label><input v-model="overrideForm.guar_work_phone" type="text" class="input input-bordered input-sm bg-white" /></div>
                  
                  <div class="form-control"><label class="label"><span class="label-text font-medium">ຕຳແໜ່ງ (Position)</span></label><input v-model="overrideForm.guar_work_position" type="text" class="input input-bordered input-sm bg-white" /></div>
                  <div class="form-control"><label class="label"><span class="label-text font-medium">ເງິນເດືອນ (Salary)</span></label><input v-model.number="overrideForm.guar_work_salary" type="number" class="input input-bordered input-sm bg-white" /></div>
                  <div><!-- Spacer --></div>

                  <!-- 🌟 ແຂວງ ແລະ ເມືອງ ບ່ອນເຮັດວຽກຜູ້ຄ້ຳ (Dropdown) 🌟 -->
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ແຂວງບ່ອນເຮັດວຽກ</span></label>
                    <select v-model="overrideForm.guar_work_province_id" class="select select-bordered select-sm bg-white">
                      <option value="">-- ເລືອກແຂວງ --</option>
                      <option v-for="p in addressStore.provinces" :key="p.province_id" :value="p.province_id">{{ p.province_name }}</option>
                    </select>
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ເມືອງບ່ອນເຮັດວຽກ</span></label>
                    <select v-model="overrideForm.guar_work_district_id" :disabled="!overrideForm.guar_work_province_id" class="select select-bordered select-sm bg-white">
                      <option value="">-- ເລືອກເມືອງ --</option>
                      <option v-for="d in guarWorkDistricts" :key="d.district_id" :value="d.district_id">{{ d.district_name }}</option>
                    </select>
                  </div>
                  <div class="form-control"><label class="label"><span class="label-text font-medium">ທີ່ຢູ່ບ່ອນເຮັດວຽກ (Work Location)</span></label><input v-model="overrideForm.guar_work_location" type="text" class="input input-bordered input-sm bg-white" /></div>
                </div>
              </div>


              <div v-show="!isFinancialsLocked || !isPartnerLocked || !isStatusLocked" class="divider text-sm text-slate-400">ຂໍ້ມູນສິນເຊື່ອ ແລະ ສິນຄ້າ</div>

              <!-- 🌟 ສະຖານະ ແລະ ສິນຄ້າ -->
              <fieldset v-show="!isStatusLocked" :disabled="isStatusLocked" class="form-control mb-4">
                <label class="label"><span class="label-text font-bold" :class="{ 'text-slate-400': isStatusLocked }">ປັບສະຖານະ (Status)</span></label>
                <select v-model="overrideForm.status" class="select select-bordered w-full bg-white font-bold text-slate-700">
                  <option value="pending" :disabled="isStatusForward('pending')">ສົ່ງກັບໄປແກ້ໄຂໃໝ່ (Pending / Return)</option>
                  <option value="verifying" :disabled="isStatusForward('verifying')">ລໍຖ້າຫົວໜ້າກວດກາ (Verifying)</option>
                  <option value="verified" :disabled="isStatusForward('verified')">ລໍຖ້າຜູ້ບໍລິຫານອະນຸມັດ (Verified)</option>
                  <option value="approved" :disabled="isStatusForward('approved')">ອະນຸມັດ (Approved)</option>
                  <option value="disbursed" :disabled="isStatusForward('disbursed')">ປ່ອຍສິນເຊື່ອສຳເລັດ (Disbursed)</option>
                  <option value="rejected">ປະຕິເສດ (Rejected)</option>
                  <option value="cancelled">ຍົກເລີກສິນເຊື່ອ (Cancelled)</option>
                </select>
              </fieldset>

              <fieldset v-show="!isPartnerLocked" :disabled="isPartnerLocked" class="form-control relative w-full mb-4">
                <label class="label"><span class="label-text font-bold" :class="{ 'text-slate-400': isPartnerLocked }">ເລືອກຮ້ານຄ້າໃໝ່ (Partner)</span></label>
                <input v-model="partnerSearch" @focus="fetchPartnersOnFocus" @input="showPartnerDropdown = true" @blur="hidePartnerDropdown" type="text" placeholder="ພິມຊື່ຮ້ານຄ້າເພື່ອຄົ້ນຫາ..." class="input input-bordered w-full bg-white" />
                <div v-show="showPartnerDropdown && filteredPartners.length > 0 && !isPartnerLocked" class="absolute z-[9999] w-full top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                  <div v-for="p in filteredPartners" :key="p.id" @mousedown.prevent="selectPartner(p)" class="p-4 hover:bg-red-50 cursor-pointer border-b last:border-0 transition-colors">
                    <div class="font-bold text-slate-800">{{ p.shop_name }}</div>
                  </div>
                </div>
              </fieldset>

              <fieldset v-show="!isProductLocked" :disabled="isProductLocked" class="form-control relative w-full mb-4" v-if="overrideForm.partner_id">
                <label class="label"><span class="label-text font-bold" :class="{ 'text-slate-400': isProductLocked }">ເລືອກສິນຄ້າໃໝ່ (ສະເພາະລຸ້ນທີ່ມີສະຕັອກ)</span></label>
                <input v-model="productSearch" @focus="fetchProductsOnFocus" @input="showProductDropdown = true" @blur="hideProductDropdown" type="text" placeholder="ພິມ System SKU ຫຼື ຊື່ສິນຄ້າເພື່ອຄົ້ນຫາ..." class="input input-bordered w-full bg-white" />
                <div v-show="showProductDropdown && filteredProducts.length > 0 && !isProductLocked" class="absolute z-[9999] w-full top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                  <div v-for="prod in filteredProducts" :key="prod.variant_id" @mousedown.prevent="selectProduct(prod)" class="p-4 hover:bg-red-50 cursor-pointer border-b last:border-0 transition-colors flex justify-between items-center">
                    <div>
                      <div class="font-bold text-slate-800">{{ prod.product_name }}</div>
                      <div class="text-sm text-slate-600 mt-1"><span class="font-mono text-xs bg-slate-200 px-1 py-0.5 rounded mr-2">{{ prod.system_sku }}</span><span class="text-xs">ສີ: {{ prod.color || 'Default' }}</span></div>
                    </div>
                    <div class="text-sky-600 font-bold text-right">
                      <div>{{ formatPrice(prod.price) }} ₭</div>
                      <div class="text-xs text-slate-400 font-normal">ສະຕັອກ: {{ prod.stock_quantity }}</div>
                    </div>
                  </div>
                </div>
              </fieldset>

              <!-- 🌟 ຂໍ້ມູນການເງິນ -->
              <fieldset v-show="!isFinancialsLocked" :disabled="isFinancialsLocked" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div class="form-control"><label class="label"><span class="label-text font-bold">ຍອດຈັດ (Total Amount)</span></label><input v-model.number="overrideForm.total_amount" type="number" class="input input-bordered w-full bg-white font-bold" /></div>
                <div class="form-control"><label class="label"><span class="label-text font-bold">ເງິນດາວ (Down Payment)</span></label><input v-model.number="overrideForm.down_payment" type="number" class="input input-bordered w-full bg-white" /></div>
                <div class="form-control">
                  <label class="label"><span class="label-text font-bold">ໄລຍະເວລາ (ເດືອນ)</span></label>
                  <select v-model.number="overrideForm.loan_period" class="select select-bordered w-full bg-white" @change="handleTermChange">
                    <option disabled value="0">ເລືອກຈຳນວນງວດ</option>
                    <option value="6">6 ເດືອນ</option>
                    <option value="12">12 ເດືອນ</option>
                    <option value="18">18 ເດືອນ</option>
                    <option value="24">24 ເດືອນ</option>
                    <option value="36">36 ເດືອນ</option>
                    <option value="48">48 ເດືອນ</option>
                  </select>
                </div>
                <div class="form-control md:col-span-2">
                  <label class="label"><span class="label-text font-bold">ປະເພດດອກເບ້ຍ (Interest Type)</span></label>
                  <select v-model="overrideForm.interest_type" class="select select-bordered w-full bg-white">
                    <option value="flat_rate">ດອກເບ້ຍຄົງທີ່ (Flat Rate)</option>
                    <option value="effective_rate">ຫຼຸດຕົ້ນຫຼຸດດອກ (Effective Rate)</option>
                  </select>
                </div>
                <div class="form-control"><label class="label"><span class="label-text font-bold">ດອກເບ້ຍ (%)</span></label><input v-model.number="overrideForm.interest_rate" type="number" step="0.01" class="input input-bordered w-full bg-white" /></div>
              </fieldset>

              <fieldset v-show="!isDateLocked" :disabled="isDateLocked" class="form-control">
                <label class="label">
                  <span class="label-text font-bold">ວັນທີຜ່ອນງວດທຳອິດ (First Installment Date) <span v-if="overrideForm.action_type === 'CHANGE_PAYMENT_DATE'" class="text-red-500">*</span></span>
                </label>
                <input v-model="overrideForm.first_installment_date" type="date" class="input input-bordered w-full bg-white font-bold text-sky-700" />
              </fieldset>

              <div v-show="!isFinancialsLocked" class="p-4 bg-sky-50 border border-sky-200 rounded-xl mt-4 flex justify-between items-center" :class="{ 'opacity-50': isFinancialsLocked }">
                <span class="text-sm font-bold text-sky-800">ຄ່າຜ່ອນປະເມີນໃໝ່ (New Monthly):</span>
                <span class="text-2xl font-black text-sky-600">{{ formatPrice(calculatedMonthlyPay) }} LAK</span>
              </div>
            </div>

            <div class="divider text-sm text-slate-400">AUDIT TRAIL (ບັງຄັບ)</div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label"><span class="label-text font-bold text-slate-700">Ref. Doc No. *</span></label>
                <input v-model="auditForm.reference_doc" type="text" placeholder="ເລກທີເອກະສານອ້າງອີງ"
                  class="input input-bordered bg-white" required />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text font-bold text-slate-700">Reason *</span></label>
                <input v-model="auditForm.reason" type="text" placeholder="ເຫດຜົນການແກ້ໄຂ"
                  class="input input-bordered bg-white" required />
              </div>

              <div class="form-control md:col-span-2">
                <label class="label"><span class="label-text font-bold text-red-600">ຮູບເອກະສານອະນຸມັດ (Approval
                    Document) *</span></label>
                <input type="file" @change="handleFileUpload" accept="image/*,.pdf"
                  class="file-input file-input-bordered w-full bg-white" required />
                <p class="text-xs text-slate-500 mt-1">ກະລຸນາແນບຮູບພາບ ຫຼື ຟາຍ PDF ທີ່ໄດ້ຮັບການອະນຸມັດຈາກຜູ້ບໍລິຫານແລ້ວ
                </p>
              </div>
            </div>

            <button @click="handleExecuteOverride" class="btn bg-red-600 hover:bg-red-700 text-white w-full mt-4"
              :disabled="!isFormValid || adminStore.isSubmitting">
              <span v-if="adminStore.isSubmitting" class="loading loading-spinner"></span> ຍືນຍັນການແກ້ໄຂ (EXECUTE
              OVERRIDE)
            </button>
          </section>

        </div>

        <section class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div class="flex justify-between items-center border-b pb-4 mb-4">
            <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span class="icon-[tabler--calendar-due] size-6 text-sky-600"></span> ຕາຕະລາງຜ່ອນຊຳລະປັດຈຸບັນ (Repayment Schedule)
            </h3>
            <span v-if="repaymentsList.length > 0" class="badge badge-sky font-bold text-xs">
              ທັງໝົດ {{ repaymentsList.length }} ງວດ
            </span>
          </div>

          <div v-if="repaymentsList.length > 0" class="overflow-x-auto">
            <table class="table table-zebra w-full text-sm">
              <thead>
                <tr class="bg-slate-100 text-slate-700">
                  <th class="text-center">ງວດທີ</th>
                  <th class="text-center font-bold text-sky-700">ວັນທີກຳນົດຜ່ອນ (Due Date)</th>
                  <th class="text-right">ເງິນຕົ້ນ (Principal)</th>
                  <th class="text-right">ດອກເບ້ຍ (Interest)</th>
                  <th class="text-right font-bold">ຄ່າງວດລວມ (Total Due)</th>
                  <th class="text-center">ສະຖານະ (Status)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in repaymentsList" :key="item.id" class="hover:bg-sky-50/50 transition-colors">
                  <td class="text-center font-bold text-slate-600">{{ item.installment_no }}</td>
                  <td class="text-center font-mono font-bold text-sky-800 bg-sky-50/80 rounded-lg px-2 py-1">
                    {{ formatDate(item.due_date) }}
                  </td>
                  <td class="text-right font-mono">{{ formatPrice(item.principal_amount) }}</td>
                  <td class="text-right font-mono">{{ formatPrice(item.interest_amount) }}</td>
                  <td class="text-right font-mono font-bold text-slate-900">{{ formatPrice(item.total_due) }}</td>
                  <td class="text-center">
                    <span v-if="item.payment_status === 'paid'"
                      class="badge badge-success badge-sm text-white font-bold">
                      ຊຳລະແລ້ວ (Paid)
                    </span>
                    <span v-else-if="item.payment_status === 'cancelled'"
                      class="badge badge-ghost badge-sm text-slate-400">
                      ຍົກເລີກ (Cancelled)
                    </span>
                    <span v-else class="badge badge-warning badge-sm font-bold text-slate-800">
                      ລໍຖ້າຊຳລະ (Unpaid)
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="text-center py-8 text-slate-400">
            <span class="icon-[tabler--calendar-off] size-10 mx-auto mb-2 opacity-50 block"></span>
            <p>ບໍ່ພົບຂໍ້ມູນຕາຕະລາງຜ່ອນຊຳລະ ຫຼື ຍັງບໍ່ໄດ້ຖືກສ້າງ</p>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import type { Ref } from 'vue'; // 🌟 ແຍກ Ref ມາເປັນ type-only import
import { useAdminLoanStore } from '@/stores/admin-loan';
import { useShopStore } from '@/stores/shop';
import { useProductStore } from '@/stores/product';
import { useAddressStore } from '@/stores/address'; // 🌟 ນຳໃຊ້ Address Store
import { alert } from '@/utils/alert';

const adminStore = useAdminLoanStore();
const shopStore = useShopStore();
const productStore = useProductStore();
const addressStore = useAddressStore(); // 🌟

const searchQuery = ref('');
const snapshot = computed(() => adminStore.loanSnapshot);

const repaymentsList = computed(() => {
  if (!snapshot.value) return [];
  return snapshot.value.repayments || snapshot.value.repayment_schedules || [];
});

// 🌟 ກຳນົດ type ຂອງ parameter ເປັນ any ແລະ ບັງຄັບ Return ເປັນ string ສະເໝີ
const formatInputDate = (dateStr: any): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  
  // 🌟 ຕື່ມ || '' ໃສ່ທາງທ້າຍເພື່ອປ້ອງກັນ type 'undefined'
  return d.toISOString().split('T')[0] || ''; 
};

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
  interest_type: 'flat_rate',
  first_installment_date: '',
  replacement_loan_id_str: '',
  
  cust_first_name: '', cust_last_name: '', cust_gender: '', cust_phone: '',
  cust_dob: '', cust_age: 0, cust_identity_number: '', cust_census_number: '',
  cust_account_number: '', cust_issue_place: '', cust_issue_date: '', cust_unit: '',
  cust_province_id: '', cust_district_id: '', cust_address: '', 
  cust_occupation: '', cust_income: 0, cust_other_debt: 0,

  work_company_name: '', work_phone: '', work_employment_type: '', work_business_type: '',
  work_department: '', work_position: '', work_duration_years: 0, work_duration_months: 0,
  work_province_id: '', work_district_id: '', work_salary: 0, 
  work_business_detail: '', work_address: '',

  guar_ref_type: 'guarantor', guar_name: '', guar_phone: '', guar_relationship: '',
  guar_identity_number: '', guar_dob: '', guar_age: 0, guar_occupation: '',
  guar_address: '', guar_province_id: '', guar_district_id: '',
  guar_work_company_name: '', guar_work_phone: '', guar_work_position: '', 
  guar_work_salary: 0, guar_work_province_id: '', guar_work_district_id: '', guar_work_location: ''
});

const auditForm = reactive({ reference_doc: '', reason: '' });
const approvalFile = ref<File | null>(null);

const isFormGloballyLocked = computed(() => ['cancelled', 'rejected'].includes(snapshot.value?.status || ''));

const isStatusLocked = computed(() => isFormGloballyLocked.value || overrideForm.action_type !== 'FULL_OVERRIDE');
const isPartnerLocked = computed(() => isFormGloballyLocked.value || !['FULL_OVERRIDE', 'CHANGE_PARTNER'].includes(overrideForm.action_type));
const isProductLocked = computed(() => isFormGloballyLocked.value || !['FULL_OVERRIDE', 'CHANGE_PARTNER', 'CHANGE_PRODUCT'].includes(overrideForm.action_type));
const isFinancialsLocked = computed(() => isFormGloballyLocked.value || overrideForm.action_type !== 'FULL_OVERRIDE');
const isDateLocked = computed(() => isFormGloballyLocked.value || !['FULL_OVERRIDE', 'CHANGE_PAYMENT_DATE'].includes(overrideForm.action_type));

const statusProgression = ['pending', 'verifying', 'verified', 'approved', 'disbursed'];
const isStatusForward = (optionValue: string) => {
  if (!snapshot.value) return false;
  const currentIndex = statusProgression.indexOf(snapshot.value.status);
  const optionIndex = statusProgression.indexOf(optionValue);
  if (currentIndex !== -1 && optionIndex !== -1) {
    return optionIndex > currentIndex;
  }
  return false;
};

// ==========================================
// 🌟 ລະບົບໂຫຼດເມືອງ (District Loaders) 🌟
// ==========================================
const customerDistricts = ref<any[]>([]);
const workDistricts = ref<any[]>([]);
const guarantorDistricts = ref<any[]>([]);
const guarWorkDistricts = ref<any[]>([]);

const loadDistrictsForProvince = async (provinceId: string, targetArray: Ref<any[]>) => {
  if (!provinceId) {
    targetArray.value = [];
    return;
  }
  await addressStore.fetchDistricts(provinceId);
  targetArray.value = [...addressStore.districts];
};

onMounted(async () => {
  if (addressStore.provinces.length === 0) {
    await addressStore.fetchProvinces();
  }
});

// Watchers ສຳລັບ Dropdown ແຂວງ ເພື່ອໂຫຼດເມືອງໃໝ່
watch(() => overrideForm.cust_province_id, async (newVal) => {
  overrideForm.cust_district_id = '';
  await loadDistrictsForProvince(newVal, customerDistricts);
});
watch(() => overrideForm.work_province_id, async (newVal) => {
  overrideForm.work_district_id = '';
  await loadDistrictsForProvince(newVal, workDistricts);
});
watch(() => overrideForm.guar_province_id, async (newVal) => {
  overrideForm.guar_district_id = '';
  await loadDistrictsForProvince(newVal, guarantorDistricts);
});
watch(() => overrideForm.guar_work_province_id, async (newVal) => {
  overrideForm.guar_work_district_id = '';
  await loadDistrictsForProvince(newVal, guarWorkDistricts);
});

watch(() => overrideForm.action_type, (newType) => {
  if (!snapshot.value) return;

  if (['CANCEL_ONLY', 'CANCEL_AND_RECREATE'].includes(newType)) {
    overrideForm.status = 'cancelled';
  } else {
    overrideForm.status = snapshot.value.status;
  }

  if (newType !== 'CANCEL_AND_RECREATE') {
    overrideForm.replacement_loan_id_str = '';
  }

  if (!['FULL_OVERRIDE', 'CHANGE_PAYMENT_DATE'].includes(newType)) {
    overrideForm.first_installment_date = '';
  }

  if (!['FULL_OVERRIDE', 'CHANGE_PARTNER'].includes(newType)) {
    overrideForm.partner_id = snapshot.value.product?.partner_id || null;
    partnerSearch.value = snapshot.value.partner_name || '';
  }

  if (!['FULL_OVERRIDE', 'CHANGE_PARTNER', 'CHANGE_PRODUCT'].includes(newType)) {
    overrideForm.product_id = snapshot.value.product_id;
    overrideForm.variant_id = snapshot.value.variant_id;
    overrideForm.total_amount = snapshot.value.total_amount;
    productSearch.value = snapshot.value.variant?.system_sku
      ? `${snapshot.value.variant?.system_sku} - ${snapshot.value.product?.product_name}`
      : (snapshot.value.product?.product_name || '');
  }
});

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

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  approvalFile.value = target.files?.[0] ?? null;
};

const getInterestRateByTerm = (months: number): number => {
  if (!months || months <= 6) return 2.50;
  if (months <= 12) return 2.00;
  if (months <= 18) return 1.89;
  if (months <= 24) return 1.75;
  return 1.69;
};

const handleTermChange = () => {
  if (overrideForm.loan_period > 0) {
    overrideForm.interest_rate = getInterestRateByTerm(overrideForm.loan_period);
  }
};

const calculatedMonthlyPay = computed(() => {
  const principal = Math.max(0, overrideForm.total_amount - overrideForm.down_payment);
  if (!principal || !overrideForm.interest_rate || !overrideForm.loan_period) return 0;

  const ratePerMonth = overrideForm.interest_rate / 100;

  if (overrideForm.interest_type === 'effective_rate') {
    const r = ratePerMonth;
    const n = overrideForm.loan_period;
    return Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  } else {
    const totalInterest = principal * ratePerMonth * overrideForm.loan_period;
    return Math.round((principal + totalInterest) / overrideForm.loan_period);
  }
});

const isFormValid = computed(() => {
  const isAuditValid = auditForm.reference_doc.trim() !== '' && auditForm.reason.trim() !== '' && approvalFile.value !== null;
  if (!isAuditValid) return false;

  if (overrideForm.action_type === 'CANCEL_AND_RECREATE') {
    return overrideForm.replacement_loan_id_str.trim() !== '';
  }
  
  if (overrideForm.action_type === 'CHANGE_PAYMENT_DATE') {
    return overrideForm.first_installment_date.trim() !== '';
  }
  
  if (['CHANGE_PRODUCT', 'CHANGE_PARTNER'].includes(overrideForm.action_type)) {
    return overrideForm.product_id !== null; 
  }
  
  return true;
});

const formatPrice = (price: number | undefined) => Number(price || 0).toLocaleString('en-US');

const formatDate = (dateStr: string | Date | undefined) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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
      overrideForm.interest_type = snapshot.value.interest_type || 'flat_rate';
      overrideForm.replacement_loan_id_str = '';
      overrideForm.first_installment_date = '';

      // 🌟 Populate ຂໍ້ມູນບຸກຄົນອັດຕະໂນມັດ 🌟
      // 🌟 ກຳນົດ :any ໃຫ້ຕົວແປທັງໝົດເພື່ອຂ້າມຜ່ານ Error ຂອງ TypeScript
      const snap: any = snapshot.value || {};
      const cust: any = snap.customer || {};
      
      overrideForm.cust_first_name = cust.first_name || '';
      overrideForm.cust_last_name = cust.last_name || '';
      overrideForm.cust_gender = cust.gender || '';
      overrideForm.cust_phone = cust.phone || '';
      overrideForm.cust_dob = formatInputDate(cust.date_of_birth);
      overrideForm.cust_age = cust.age || 0;
      overrideForm.cust_identity_number = cust.identity_number || '';
      overrideForm.cust_census_number = cust.census_number || '';
      overrideForm.cust_account_number = cust.account_number || '';
      overrideForm.cust_issue_place = cust.issue_place || '';
      overrideForm.cust_issue_date = formatInputDate(cust.issue_date);
      overrideForm.cust_unit = cust.unit || '';
      overrideForm.cust_address = cust.address || '';
      overrideForm.cust_occupation = cust.occupation || '';
      overrideForm.cust_income = cust.income_per_month ? Number(cust.income_per_month) : 0;
      overrideForm.cust_other_debt = cust.other_debt ? Number(cust.other_debt) : 0;
      
      // ໂຫຼດເມືອງໃຫ້ລູກຄ້າ
      overrideForm.cust_province_id = cust.province_id || '';
      if (overrideForm.cust_province_id) {
        await loadDistrictsForProvince(overrideForm.cust_province_id, customerDistricts);
      }
      overrideForm.cust_district_id = cust.district_id || '';

      const work: any = cust.customer_work_info || (cust.customer_work_infos && cust.customer_work_infos[0]) || {};
      overrideForm.work_company_name = work.company_name || '';
      overrideForm.work_phone = work.phone || '';
      overrideForm.work_employment_type = work.employment_type || '';
      overrideForm.work_business_type = work.business_type || '';
      overrideForm.work_department = work.department || '';
      overrideForm.work_position = work.position || '';
      overrideForm.work_duration_years = work.duration_years || 0;
      overrideForm.work_duration_months = work.duration_months || 0;
      overrideForm.work_salary = work.salary ? Number(work.salary) : 0;
      overrideForm.work_business_detail = work.business_detail || '';
      overrideForm.work_address = work.address || '';

      // ໂຫຼດເມືອງໃຫ້ບ່ອນເຮັດວຽກ
      overrideForm.work_province_id = work.province_id || '';
      if (overrideForm.work_province_id) {
        await loadDistrictsForProvince(overrideForm.work_province_id, workDistricts);
      }
      overrideForm.work_district_id = work.district_id || '';

      const guar: any = snap.guarantor || (snap.guarantors && snap.guarantors[0]) || {};
      overrideForm.guar_ref_type = guar.ref_Type || 'guarantor';
      overrideForm.guar_name = guar.name || '';
      overrideForm.guar_phone = guar.phone || '';
      overrideForm.guar_relationship = guar.relationship || '';
      overrideForm.guar_identity_number = guar.identity_number || '';
      overrideForm.guar_dob = formatInputDate(guar.date_of_birth);
      overrideForm.guar_age = guar.age || 0;
      overrideForm.guar_occupation = guar.occupation || '';
      overrideForm.guar_address = guar.address || '';
      overrideForm.guar_work_company_name = guar.work_company_name || '';
      overrideForm.guar_work_phone = guar.work_phone || '';
      overrideForm.guar_work_position = guar.work_position || '';
      overrideForm.guar_work_salary = guar.work_salary ? Number(guar.work_salary) : 0;
      overrideForm.guar_work_location = guar.work_location || '';

      // ໂຫຼດເມືອງໃຫ້ຜູ້ຄ້ຳປະກັນ
      overrideForm.guar_province_id = guar.province_id || '';
      if (overrideForm.guar_province_id) {
        await loadDistrictsForProvince(overrideForm.guar_province_id, guarantorDistricts);
      }
      overrideForm.guar_district_id = guar.district_id || '';

      // ໂຫຼດເມືອງໃຫ້ບ່ອນເຮັດວຽກຜູ້ຄ້ຳ
      overrideForm.guar_work_province_id = guar.work_province_id || '';
      if (overrideForm.guar_work_province_id) {
        await loadDistrictsForProvince(overrideForm.guar_work_province_id, guarWorkDistricts);
      }
      overrideForm.guar_work_district_id = guar.work_district_id || '';

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
    `ການແກ້ໄຂນີ້ຈະຖືກບັນທຶກລົງ Audit Log ຢ່າງລະອຽດ.<br><br>ກະລຸນາພິມລະຫັດ <b>${expectedLoanId}</b> ເພື່ອຢືນຢັນ:`,
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

    await searchLoan();

    alert.success('ສຳເລັດ!', 'ອັບເດດຂໍ້ມູນສຳເລັດ ທ່ານສາມາດພິມສັນຍາໃໝ່ໄດ້ເລີຍ.');
  } catch (error: any) {
    // 🌟 ປ່ຽນມາໃຊ້ error.response?.data?.message ເພື່ອດຶງຂໍ້ຄວາມຈາກ Backend ມາສະແດງ
    const errMsg = error.response?.data?.message || error.message || 'ລົ້ມເຫຼວໃນການແກ້ໄຂ';
    alert.error('ເກີດຂໍ້ຜິດພາດ', errMsg);
  }
};

onUnmounted(() => {
  adminStore.clearState();
  productStore.clearProducts();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@300;400;600;700;900&display=swap');

.font-lao {
  font-family: 'Noto Sans Lao', sans-serif;
}
</style>
