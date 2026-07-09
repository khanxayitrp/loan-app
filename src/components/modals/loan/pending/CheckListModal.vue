<template>
  <teleport to="body">
    <div v-if="isOpen && loan" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">

        <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h3 class="text-lg font-bold flex items-center gap-2 text-gray-800 dark:text-white">
            <span class="icon-[tabler--clipboard-check] text-info size-6"></span>
            ຟອມກວດສອບ ແລະ ປະເມີນສິນເຊື່ອ (Checklist)
          </h3>
          <button @click="close" class="btn btn-ghost btn-sm btn-circle text-gray-500 hover:text-error hover:bg-error/10">
            <span class="icon-[tabler--x] size-5"></span>
          </button>
        </div>

        <div class="tabs tabs-bordered px-4 pt-2 bg-gray-50 dark:bg-gray-900 overflow-x-auto">
          <a class="tab tab-lg whitespace-nowrap"
            :class="{ 'tab-active font-bold text-primary border-b-2 border-primary': checklistTab === 'basic' }"
            @click="changeTab('basic')">1. ຂໍ້ມູນທົ່ວໄປ & ວຽກ</a>

          <a class="tab tab-lg whitespace-nowrap" :class="{
            'tab-active font-bold text-primary border-b-2 border-primary': checklistTab === 'call',
            'opacity-40 grayscale cursor-not-allowed pointer-events-none': !unlockedTabs.call
          }" @click="changeTab('call')">
            <span v-if="!unlockedTabs.call" class="icon-[tabler--lock] mr-1"></span> 2. ໂທຢືນຢັນ
          </a>

          <a class="tab tab-lg whitespace-nowrap" :class="{
            'tab-active font-bold text-primary border-b-2 border-primary': checklistTab === 'cib',
            'opacity-40 grayscale cursor-not-allowed pointer-events-none': !unlockedTabs.cib
          }" @click="changeTab('cib')">
            <span v-if="!unlockedTabs.cib" class="icon-[tabler--lock] mr-1"></span> 3. ກວດ CIB
          </a>

          <a class="tab tab-lg whitespace-nowrap" :class="{
            'tab-active font-bold text-primary border-b-2 border-primary': checklistTab === 'field',
            'opacity-40 grayscale cursor-not-allowed pointer-events-none': !unlockedTabs.field
          }" @click="changeTab('field')">
            <span v-if="!unlockedTabs.field" class="icon-[tabler--lock] mr-1"></span> 4. ລົງພື້ນທີ່ຈິງ
          </a>

          <a class="tab tab-lg whitespace-nowrap" :class="{
            'tab-active font-bold text-primary border-b-2 border-primary': checklistTab === 'income',
            'opacity-40 grayscale cursor-not-allowed pointer-events-none': !unlockedTabs.income
          }" @click="changeTab('income')">
            <span v-if="!unlockedTabs.income" class="icon-[tabler--lock] mr-1"></span> 5. ປະເມີນລາຍຮັບ (DSR)
          </a>
        </div>

        <div class="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800">

          <div v-if="checklistTab === 'basic'" class="space-y-6 animate-in fade-in">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="border rounded-lg p-4 bg-white dark:bg-base-100 shadow-sm">
                <h4 class="font-bold border-b pb-2 mb-4">ສ່ວນທີ 1: ການຢືນຢັນຂໍ້ມູນລູກຄ້າ ແລະ ສິນເຊື່ອ</h4>
                <div class="space-y-3">
                  <div class="form-control">
                    <label class="label"><span class="label-text">ວິທີການຕິດຕໍ່ລູກຄ້າ</span></label>
                    <select v-model="formBasic.cus_contact_method" class="select select-bordered select-sm">
                      <option value="face_to_face">ພົບຕໍ່ໜ້າ (Face to Face)</option>
                      <option value="phone">ທາງໂທລະສັບ (Phone)</option>
                    </select>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="form-control">
                      <label class="label"><span class="label-text">ຊື່ (ຢືນຢັນແລ້ວ)</span></label>
                      <input v-model="formBasic.verified_first_name" type="text"
                        class="input input-bordered input-sm" />
                    </div>
                    <div class="form-control">
                      <label class="label"><span class="label-text">ນາມສະກຸນ (ຢືນຢັນແລ້ວ)</span></label>
                      <input v-model="formBasic.verified_last_name" type="text" class="input input-bordered input-sm" />
                    </div>
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text">ວັນເດືອນປີເກີດ</span></label>
                    <input v-model="formBasic.verified_dob" type="date" class="input input-bordered input-sm" />
                  </div>

                  <div class="border p-3 rounded-lg bg-gray-50 dark:bg-base-200">
                    <label class="label p-0 mb-2"><span class="label-text font-bold">ທີ່ຢູ່ປັດຈຸບັນ (ຢືນຢັນແລ້ວ)</span></label>

                    <div class="form-control mb-2">
                        <label class="label pt-0"><span class="label-text text-xs">ບ້ານ / ລາຍລະອຽດເຮືອນ</span></label>
                        <input v-model="formBasic.verified_village" type="text" placeholder="ປ້ອນຊື່ບ້ານ, ໜ່ວຍ, ເຮືອນເລກທີ..." class="input input-bordered input-sm w-full" />
                    </div>

                    <div class="grid grid-cols-2 gap-2">
                        <div class="form-control">
                            <label class="label pt-0"><span class="label-text text-xs">ແຂວງ</span></label>
                            <select v-model="formBasic.verified_province_id"
                                    class="select select-bordered select-sm w-full">
                                <option value="">-- ເລືອກແຂວງ --</option>
                                <option v-for="p in addressStore.provinces" :key="p.province_id" :value="p.province_id">
                                    {{ p.province_name }}
                                </option>
                            </select>
                        </div>
                        <div class="form-control">
                            <label class="label pt-0"><span class="label-text text-xs">ເມືອງ</span></label>
                            <select v-model="formBasic.verified_district_id"
                                    :disabled="!formBasic.verified_province_id"
                                    class="select select-bordered select-sm w-full">
                                <option value="">-- ເລືອກເມືອງ --</option>
                                <option v-for="d in localDistricts" :key="d.district_id" :value="d.district_id">
                                    {{ d.district_name }}
                                </option>
                            </select>
                        </div>
                    </div>
                  </div>
                  <div class="divider my-1"></div>
                  <div class="form-control">
                    <label class="label"><span class="label-text text-primary font-bold">ປະເພດສິນຄ້າ
                        (ຢືນຢັນແລ້ວ)</span></label>
                    <input v-model="formBasic.verified_product_type" type="text"
                      class="input input-bordered input-sm border-primary" placeholder="ເຊັ່ນ: ລົດຈັກ, ໂທລະສັບ..." />
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="form-control">
                      <label class="label"><span class="label-text">ລາຄາສິນຄ້າຈິງ (ກີບ)</span></label>
                      <input v-model.number="formBasic.verified_price" type="number"
                        class="input input-bordered input-sm text-right" />
                    </div>
                    <div class="form-control">
                      <label class="label"><span class="label-text">ເງິນວາງດາວ (ກີບ)</span></label>
                      <input v-model.number="formBasic.verified_down_payment" type="number"
                        class="input input-bordered input-sm text-right" />
                    </div>
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text text-success font-bold">ຄ່າງວດທີ່ແຈ້ງລູກຄ້າ
                        (ກີບ)</span></label>
                    <input v-model.number="formBasic.verified_monthly_pay" type="number"
                      class="input input-bordered input-sm text-right text-success font-bold" />
                  </div>
                </div>
              </div>

              <div class="space-y-6">
                <div class="border rounded-lg p-4 bg-white dark:bg-base-100 shadow-sm">
                  <h4 class="font-bold border-b pb-2 mb-4">ສ່ວນທີ 2: ເອກະສານປະກອບ</h4>
                  <div class="flex flex-col gap-2">
                    <label class="cursor-pointer label justify-start gap-3">
                      <input type="checkbox" v-model="formBasic.has_id_card"
                        class="checkbox checkbox-primary checkbox-sm" />
                      <span>ບັດປະຈຳຕົວ / Passport</span>
                    </label>
                    <label class="cursor-pointer label justify-start gap-3">
                      <input type="checkbox" v-model="formBasic.has_census_book"
                        class="checkbox checkbox-primary checkbox-sm" />
                      <span>ປຶ້ມສຳມະໂນຄົວ</span>
                    </label>
                    <label class="cursor-pointer label justify-start gap-3">
                      <input type="checkbox" v-model="formBasic.has_income_doc"
                        class="checkbox checkbox-primary checkbox-sm" />
                      <span>ເອກະສານຢືນຢັນລາຍຮັບ (Statement/ໃບເງິນເດືອນ)</span>
                    </label>
                    <label class="cursor-pointer label justify-start gap-3">
                      <input type="checkbox" v-model="formBasic.has_other_doc"
                        class="checkbox checkbox-primary checkbox-sm" />
                      <span>ເອກະສານອື່ນໆ</span>
                    </label>
                    <input v-if="formBasic.has_other_doc" v-model="formBasic.other_doc_detail" type="text"
                      placeholder="ລະບຸເອກະສານອື່ນໆ..." class="input input-bordered input-sm mt-1" />
                  </div>
                  <div class="form-control mt-4">
                    <label class="label"><span class="label-text font-bold">ປະເມີນຄວາມໜ້າເຊື່ອຖືຂອງລູກຄ້າ</span></label>
                    <select v-model="formBasic.cus_credibility_assessment" class="select select-bordered select-sm">
                      <option value="reliable">ໜ້າເຊື່ອຖື (Reliable)</option>
                      <option value="unreliable">ບໍ່ໜ້າເຊື່ອຖື (Unreliable)</option>
                    </select>
                  </div>
                </div>

                <div class="border rounded-lg p-4 bg-white dark:bg-base-100 shadow-sm">
  <h4 class="font-bold border-b pb-2 mb-4">ສ່ວນທີ 3: ຂໍ້ມູນທີ່ເຮັດວຽກ (ຈາກການສຳພາດ)</h4>
  <div class="space-y-3">
    <div class="form-control">
      <label class="label"><span class="label-text">ຊື່ບໍລິສັດ/ບ່ອນເຮັດວຽກ</span></label>
      <input v-model="formBasic.work_company_name" type="text" class="input input-bordered input-sm" />
    </div>

    <div class="form-control">
      <label class="label"><span class="label-text">ຕຳແໜ່ງ</span></label>
      <input v-model="formBasic.work_position" type="text" class="input input-bordered input-sm" />
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div class="form-control">
        <label class="label"><span class="label-text">ອາຍຸການ (ປີ)</span></label>
        <input v-model.number="formBasic.work_years" type="number"
          class="input input-bordered input-sm" />
      </div>
      <div class="form-control">
        <label class="label"><span class="label-text">ອາຍຸການ (ເດືອນ)</span></label>
        <input v-model.number="formBasic.work_months" type="number"
          class="input input-bordered input-sm" />
      </div>
    </div>

    <div class="form-control">
      <label class="label"><span class="label-text">ເງິນເດືອນທີ່ແຈ້ງ (ກີບ)</span></label>
      <input v-model.number="formBasic.work_salary" type="number"
        class="input input-bordered input-sm text-right font-bold" />
    </div>
    <div class="form-control">
      <label class="label"><span
          class="label-text font-bold">ປະເມີນຄວາມໜ້າເຊື່ອຖືຂອງບ່ອນເຮັດວຽກ</span></label>
      <select v-model="formBasic.workplace_assessment" class="select select-bordered select-sm">
        <option value="good">ດີ (Good)</option>
        <option value="moderate">ປານກາງ (Moderate)</option>
        <option value="bad">ບໍ່ດີ / ບໍ່ຊັດເຈນ (Bad)</option>
      </select>
    </div>
  </div>
</div>
              </div>
            </div>

            <div class="form-control mt-6 pt-4 border-t border-gray-300">
              <label class="label"><span class="label-text font-bold text-primary">ສະຖານະການກວດສອບ (Verification
                  Status)</span></label>
              <div class="flex items-center gap-4">
                <select v-model="formBasic.status"
                  class="select select-bordered select-primary w-full max-w-xs font-bold">
                  <option value="draft">ບັນທຶກຮ່າງ (Draft)</option>
                  <option value="completed">ກວດສອບສຳເລັດ (Completed)</option>
                </select>
                <span v-if="formBasic.status === 'completed'" class="text-success flex items-center gap-1">
                  <span class="icon-[tabler--circle-check-filled] size-5"></span> ພ້ອມສຳລັບຂັ້ນຕອນຕໍ່ໄປ
                </span>
              </div>
            </div>
          </div>

          <div v-else-if="checklistTab === 'call'" class="space-y-6 animate-in fade-in">
            <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex justify-between items-center shadow-sm">
              <div>
                <h4 class="font-bold text-blue-800 dark:text-blue-300">ບັນທຶກການໂທຢືນຢັນ</h4>
                <p class="text-sm text-blue-600">ບັນທຶກການໂທຫາບຸກຄົນອ້າງອີງ, ບ່ອນເຮັດວຽກ ຫຼື ຜູ້ຄ້ຳປະກັນ</p>
              </div>
              <button class="btn btn-primary btn-sm" @click="addCallRecord">
                <span class="icon-[tabler--plus] size-4"></span> ເພີ່ມປະຫວັດການໂທ
              </button>
            </div>

            <div v-for="(call, index) in formCalls" :key="index"
              class="border rounded-lg p-4 relative bg-white dark:bg-base-100 shadow-sm">
              <button class="btn btn-ghost btn-xs btn-circle absolute top-2 right-2 text-error"
                @click="removeCallRecord(index)">
                <span class="icon-[tabler--trash] size-4"></span>
              </button>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div class="form-control">
                  <label class="label"><span class="label-text font-medium">ເປົ້າໝາຍການໂທ</span></label>
                  <select v-model="call.call_target" class="select select-bordered select-sm">
                    <option value="workplace">ບ່ອນເຮັດວຽກ (HR/ໝູ່ຮ່ວມງານ)</option>
                    <option value="home">ທາງບ້ານ / ຍາດພີ່ນ້ອງ</option>
                    <option value="guarantor">ຜູ້ຄ້ຳປະກັນ</option>
                  </select>
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text font-medium">ຊື່ຜູ້ຮັບສາຍ</span></label>
                  <input v-model="call.contact_name" type="text" class="input input-bordered input-sm" />
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text font-medium">ເບີໂທຕິດຕໍ່</span></label>
                  <input v-model="call.contact_phone" type="text" class="input input-bordered input-sm" />
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text font-medium">ຄວາມສຳພັນ / ຕຳແໜ່ງ</span></label>
                  <input v-model="call.relationship" type="text" placeholder="ເຊັ່ນ: ພໍ່, ຫົວໜ້າງານ"
                    class="input input-bordered input-sm" />
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text font-medium">ຂໍ້ມູນຕົງກັບທີ່ລູກຄ້າແຈ້ງບໍ?</span></label>
                  <select v-model="call.is_info_matching" class="select select-bordered select-sm">
                    <option :value="true">ຕົງກັນ (Yes)</option>
                    <option :value="false">ບໍ່ຕົງກັນ (No)</option>
                  </select>
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text font-medium">ສະຖານະການໂທ</span></label>
                  <select v-model="call.call_status" class="select select-bordered select-sm">
                    <option value="completed">ສຳເລັດ (ໂທຕິດ ແລະ ຄຸຍແລ້ວ)</option>
                    <option value="no_answer">ບໍ່ຮັບສາຍ (No Answer)</option>
                    <option value="pending_callback">ລໍຖ້າໂທກັບ (Pending Callback)</option>
                  </select>
                </div>
                <div class="form-control md:col-span-3">
                  <label class="label"><span class="label-text font-medium">ໝາຍເຫດ / ບົດສົນທະນາຫຍໍ້</span></label>
                  <input v-model="call.remark" type="text" class="input input-bordered input-sm w-full" />
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="checklistTab === 'cib'" class="space-y-6 animate-in fade-in">
             <div class="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg flex justify-between items-center shadow-sm">
              <div>
                <h4 class="font-bold text-indigo-800 dark:text-indigo-300">ປະຫວັດສິນເຊື່ອ (CIB History)</h4>
                <p class="text-sm text-indigo-600">ບັນທຶກປະຫວັດການກູ້ຢືມແຕ່ລະບັນຊີຈາກໃບລາຍງານ CIB</p>
              </div>
              <button class="btn btn-primary btn-sm" @click="addCIBDetail">
                <span class="icon-[tabler--plus] size-4"></span> ເພີ່ມບັນຊີ
              </button>
            </div>

            <div v-for="(detail, index) in formCIBDetails" :key="index"
              class="border rounded-lg p-6 relative bg-white dark:bg-base-100 shadow-sm">
              <button class="btn btn-ghost btn-xs btn-circle absolute top-2 right-2 text-error"
                @click="removeCIBDetail(index)">
                <span class="icon-[tabler--trash] size-5"></span>
              </button>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div class="form-control">
                  <label class="label"><span class="label-text font-bold">ສະຖາບັນການເງິນ *</span></label>
                  <input v-model="detail.institution_name" type="text" placeholder="ເຊັ່ນ: BCEL, JDB, AEON..."
                    class="input input-bordered w-full" />
                </div>

                <div class="form-control">
                  <label class="label"><span class="label-text font-bold">ປະເພດສິນເຊື່ອ</span></label>
                  <input v-model="detail.account_type" type="text" placeholder="ເຊັ່ນ: ບັດເຄຣດິດ, ສິນເຊື່ອລົດຈັກ"
                    class="input input-bordered w-full" />
                </div>

                <div class="form-control">
                  <label class="label"><span class="label-text font-bold text-primary">ສະຖານະການຊຳລະ *</span></label>
                  <select v-model="detail.history_status" class="select select-bordered font-medium"
                    :class="getCibStatusColor(detail.history_status)">
                    <option value="no_delay">ດີຫຼາຍ: ບໍ່ມີຊັກຊ້າ (20 ຄະແນນ)</option>
                    <option value="delay_30_days">ດີ: ຊັກຊ້າບໍ່ເກີນ 30 ວັນ (15 ຄະແນນ)</option>
                    <option value="delay_60_days">ປານກາງ: ຊັກຊ້າ 30-60 ວັນ (10 ຄະແນນ)</option>
                    <option value="delay_90_days">ສ່ຽງສູງ: ຊັກຊ້າ 60-90 ວັນ (5 ຄະແນນ)</option>
                    <option value="blacklist">ບໍ່ດີ: ຊັກຊ້າ 90 ວັນ+ / Blacklist (0 ຄະແນນ)</option>
                  </select>
                </div>

                <div class="form-control">
                  <label class="label"><span class="label-text font-bold">ຍອດໜີ້ຄົງເຫຼືອ (ກີບ)</span></label>
                  <input v-model.number="detail.outstanding_balance" type="number"
                    class="input input-bordered w-full text-right" />
                </div>
              </div>
            </div>

            <div v-if="formCIBDetails.length === 0" class="alert alert-warning shadow-sm">
              <span class="icon-[tabler--alert-circle] size-6"></span>
              <span>ຍັງບໍ່ມີຂໍ້ມູນປະຫວັດ CIB. ກະລຸນາກົດປຸ່ມ "ເພີ່ມບັນຊີ" ເພື່ອບັນທຶກຂໍ້ມູນ, ຫຼືລະບຸວ່າບໍ່ເຄີຍມີປະຫວັດ.</span>
            </div>

            <div class="divider"></div>

            <div class="border rounded-lg p-6 bg-white dark:bg-base-100 shadow-sm">
              <h4 class="font-bold text-lg mb-4">ຂໍ້ມູນອື່ນໆ</h4>
              <div class="form-control">
                <label class="cursor-pointer label justify-start gap-4">
                  <input type="checkbox" v-model="formCIB.is_existing_customer" class="toggle toggle-primary" />
                  <span class="font-bold">ເຄີຍເປັນລູກຄ້າເກົ່າຂອງ INSEE ມາກ່ອນບໍ?</span>
                </label>
              </div>

              <div v-if="formCIB.is_existing_customer" class="form-control mt-4">
                <label class="label"><span class="label-text">ສະຖານະໜີ້ເກົ່າຂອງ INSEE</span></label>
                <select v-model="formCIB.existing_customer_status" class="select select-bordered">
                  <option value="normal">ປົກກະຕິ (ຈ່າຍດີ)</option>
                  <option value="late_payment">ຊັກຊ້າບາງງວດ</option>
                  <option value="bad_debt">ໜີ້ເສຍ (NPL)</option>
                </select>
              </div>

              <div class="form-control mt-4">
                <label class="label"><span class="label-text">ໝາຍເຫດເພີ່ມເຕີມ</span></label>
                <textarea v-model="formCIB.remark" class="textarea textarea-bordered h-24"
                  placeholder="ລາຍລະອຽດເພີ່ມເຕີມຈາກໃບລາຍງານ CIB..."></textarea>
              </div>
            </div>
          </div>

          <div v-else-if="checklistTab === 'field'" class="space-y-6 animate-in fade-in">
             <div class="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg flex justify-between items-center shadow-sm">
              <div>
                <h4 class="font-bold text-amber-800 dark:text-amber-300">ບົດບັນທຶກການລົງພື້ນທີ່ຈິງ (Site Visits)</h4>
                <p class="text-sm text-amber-600">ສາມາດເພີ່ມໄດ້ຫຼາຍສະຖານທີ່ ເຊັ່ນ: ເຮືອນ, ບ່ອນເຮັດວຽກ</p>
              </div>
              <button class="btn btn-primary btn-sm" @click="addFieldVisit">
                <span class="icon-[tabler--plus] size-4"></span> ເພີ່ມສະຖານທີ່
              </button>
            </div>

            <div v-for="(visit, index) in formFieldVisits" :key="index"
              class="border rounded-lg p-6 relative bg-white dark:bg-base-100 shadow-sm">
              <button class="btn btn-ghost btn-xs btn-circle absolute top-2 right-2 text-error"
                @click="removeFieldVisit(index)">
                <span class="icon-[tabler--trash] size-5"></span>
              </button>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div class="form-control">
                  <label class="label"><span class="label-text font-bold">ປະເພດສະຖານທີ່</span></label>
                  <select v-model="visit.visit_type" class="select select-bordered">
                    <option value="home">ເຮືອນພັກອາໄສ</option>
                    <option value="workplace">ບ່ອນເຮັດວຽກ</option>
                    <option value="other">ສະຖານທີ່ອື່ນໆ (ລະບຸໃນໝາຍເຫດ)</option>
                  </select>
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text font-bold">ວັນທີລົງພື້ນທີ່</span></label>
                  <input v-model="visit.visit_date" type="datetime-local" class="input input-bordered" />
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text font-bold">ສະພາບຄວາມເປັນຢູ່ / ລັກສະນະອາຄານ</span></label>
                  <input v-model="visit.living_condition" type="text" placeholder="ເຊັ່ນ: ເຮືອນປູນ 2 ຊັ້ນ, ຫ້ອງແຖວ..."
                    class="input input-bordered" />
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text font-bold">ທີ່ຢູ່ຕົງກັບເອກະສານແຈ້ງ ຫຼື
                      ບໍ່?</span></label>
                  <select v-model="visit.is_address_correct" class="select select-bordered">
                    <option :value="true">ຕົງກັນ (Yes)</option>
                    <option :value="false">ບໍ່ຕົງກັນ / ຫາບໍ່ພົບ (No)</option>
                  </select>
                </div>

                <div class="form-control md:col-span-2 border-t pt-4 mt-2">
                  <label class="label pb-0"><span class="label-text font-bold">ທີ່ຕັ້ງ (GPS Location)</span></label>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div class="flex gap-2">
                      <div class="w-full">
                        <label class="label text-xs"><span class="label-text">Latitude</span></label>
                        <input v-model.number="visit.latitude" type="number" step="any" placeholder="17.XXXXXX"
                          class="input input-bordered input-sm w-full" />
                      </div>
                      <div class="w-full">
                        <label class="label text-xs"><span class="label-text">Longitude</span></label>
                        <input v-model.number="visit.longitude" type="number" step="any" placeholder="102.XXXXXX"
                          class="input input-bordered input-sm w-full" />
                      </div>
                    </div>
                    <div class="flex items-end">
                      <button type="button" class="btn btn-outline btn-info btn-sm w-full gap-2"
                        @click="getCurrentLocation(index)">
                        <span class="icon-[tabler--current-location] size-4"></span> ດຶງທີ່ຕັ້ງປັດຈຸບັນ
                      </button>
                    </div>
                  </div>
                </div>

                <div class="form-control md:col-span-2 mt-2">
                  <label class="label"><span class="label-text font-bold">ຮູບພາບສະຖານທີ່ຈິງ (ສູງສຸດ 2 ຮູບ)</span></label>
                  <div class="grid grid-cols-2 gap-4 mt-2">
                    <div class="border rounded-lg overflow-hidden relative bg-base-200" style="height: 150px;">
                      <div v-if="visit.photo_url_1 || visit.photo_1_preview"
                        class="w-full h-full relative group bg-base-300 flex items-center justify-center">
                        <img :src="visit.photo_1_preview || getFullImageUrl(visit.photo_url_1)"
                          class="max-w-full max-h-full object-contain" />
                        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <button type="button" class="btn btn-error btn-sm btn-circle"
                            @click="removeVisitImage(index, 1)">
                            <span class="icon-[tabler--trash] size-4"></span>
                          </button>
                        </div>
                      </div>
                      <label v-else
                        class="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-base-300 transition-colors">
                        <span class="icon-[tabler--photo-plus] size-8 text-gray-400 mb-2"></span>
                        <span class="text-xs text-gray-500">ຮູບທີ 1 (ປ້າຍບ້ານ/ໜ້າບ້ານ)</span>
                        <input type="file" class="hidden" accept="image/*"
                          @change="(e) => handleVisitImageUpload(index, 1, e)" />
                      </label>
                    </div>

                    <div class="border rounded-lg overflow-hidden relative bg-base-200" style="height: 150px;">
                      <div v-if="visit.photo_url_2 || visit.photo_2_preview"
                        class="w-full h-full relative group bg-base-300 flex items-center justify-center">
                        <img :src="visit.photo_2_preview || getFullImageUrl(visit.photo_url_2)"
                          class="max-w-full max-h-full object-contain" />
                        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <button type="button" class="btn btn-error btn-sm btn-circle"
                            @click="removeVisitImage(index, 2)">
                            <span class="icon-[tabler--trash] size-4"></span>
                          </button>
                        </div>
                      </div>
                      <label v-else
                        class="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-base-300 transition-colors">
                        <span class="icon-[tabler--photo-plus] size-8 text-gray-400 mb-2"></span>
                        <span class="text-xs text-gray-500">ຮູບທີ 2 (ສະພາບລວມ)</span>
                        <input type="file" class="hidden" accept="image/*"
                          @change="(e) => handleVisitImageUpload(index, 2, e)" />
                      </label>
                    </div>
                  </div>
                </div>

                <div class="form-control md:col-span-2">
                  <label class="label"><span class="label-text font-bold">ໝາຍເຫດ (ສິ່ງທີ່ພົບເຫັນເພີ່ມເຕີມ)</span></label>
                  <textarea v-model="visit.remarks" class="textarea textarea-bordered"
                    placeholder="ລາຍລະອຽດເພີ່ມເຕີມທີ່ພົບເຫັນ..."></textarea>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="checklistTab === 'income'" class="space-y-6 animate-in fade-in">
             <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="border rounded-lg p-4 bg-green-50/50 dark:bg-green-900/10 shadow-sm">
                <h4 class="font-bold text-green-700 mb-4">1. ການປະເມີນລາຍຮັບ (ລາຍຮັບທີ່ພິສູດໄດ້)</h4>
                <div class="space-y-3">
                  <div class="form-control">
                    <label class="label"><span class="label-text">ລາຍຮັບສະເລ່ຍຈາກ Statement (ກີບ)</span></label>
                    <input v-model.number="formIncome.average_monthly_income" type="number"
                      class="input input-bordered text-right font-bold text-green-600" readonly />
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text">ລາຍຮັບອື່ນໆທີ່ຢືນຢັນໄດ້ (ກີບ)</span></label>
                    <input v-model.number="formIncome.other_verified_income" type="number"
                      class="input input-bordered text-right font-bold text-green-600"  readonly />
                  </div>
                  <div class="divider my-1"></div>
                  <div class="flex justify-between items-center font-bold text-lg">
                    <span>ລວມລາຍຮັບ (A)</span>
                    <span class="text-green-600">{{ formatPrice(totalVerifiedIncome) }}</span>
                  </div>
                </div>
              </div>

              <div class="border rounded-lg p-4 bg-red-50/50 dark:bg-red-900/10 shadow-sm">
                <h4 class="font-bold text-red-700 mb-4">2. ພາລະໜີ້ສິນ ແລະ ລາຍຈ່າຍ</h4>
                <div class="space-y-3">
                  <div class="form-control">
                    <label class="label"><span class="label-text">ຄ່າໃຊ້ຈ່າຍດຳລົງຊີວິດປະເມີນ (ກີບ)</span></label>
                    <input v-model.number="formIncome.estimated_living_expenses" type="number"
                      class="input input-bordered text-right" />
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text">ພາລະໜີ້ສິນເດີມ (ຈາກ CIB) (ກີບ)</span></label>
                    <input v-model.number="formIncome.existing_debt_payments" type="number"
                      class="input input-bordered text-right text-red-500" />
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-bold text-primary">ຄ່າງວດໃໝ່ທີ່ສະເໜີຂໍ
                        (ກີບ)</span></label>
                    <input v-model.number="formIncome.proposed_installment" type="number"
                      class="input input-bordered text-right font-bold text-primary border-primary" />
                  </div>
                  <div class="divider my-1"></div>
                  <div class="flex justify-between items-center font-bold text-lg">
                    <span>ລວມພາລະໜີ້ໃໝ່+ເກົ່າ (B)</span>
                    <span class="text-red-500">{{ formatPrice(totalDebtBurden) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="border-2 border-primary rounded-lg p-6 text-center bg-white dark:bg-base-100 shadow-sm">
              <h3 class="text-xl font-bold mb-2">ອັດຕາສ່ວນໜີ້ສິນຕໍ່ລາຍຮັບ (DSR)</h3>
              <div class="text-5xl font-black mb-2"
                :class="dsrPercentage > 60 ? 'text-error' : (dsrPercentage > 40 ? 'text-warning' : 'text-success')">
                {{ dsrPercentage.toFixed(2) }}%
              </div>
              <p class="text-gray-500">ສູດຄິດໄລ່: (ລວມພາລະໜີ້ B ÷ ລວມລາຍຮັບ A) × 100</p>
              <div class="mt-4 pt-4 border-t">
                <div class="form-control max-w-md mx-auto">
                  <label class="label"><span class="label-text font-bold">ວົງເງິນອະນຸມັດສູງສຸດທີ່ເປັນໄປໄດ້ (ກີບ)</span></label>
                  <input v-model.number="formIncome.max_approved_amount" type="number"
                    class="input input-bordered text-center text-xl font-bold text-primary" />
                </div>
              </div>
            </div>
          </div>

        </div>

        <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3">
          <button class="btn btn-ghost" @click="close">ປິດ</button>
          <button class="btn btn-primary" @click="saveChecklist" :disabled="isSavingChecklist">
            <span v-if="isSavingChecklist" class="loading loading-spinner loading-xs"></span>
            <span v-else class="icon-[tabler--device-floppy] size-4"></span>
            ບັນທຶກຂໍ້ມູນ {{ checklistTabTitle }}
          </button>
        </div>

      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { checklistApi } from '@/api/checklist';
import apiClient from '@/api/apiclient';
import { alert } from '@/utils/alert';
import { formatPrice } from '@/utils/formatters';
import { getFullImageUrl } from '@/utils/url';
import { useLoanApplicationStore } from '@/stores/loanApplication';
import { useChecklistStore } from '@/stores/checklist';

// 🟢 1. ດຶງ Store ສຳລັບທີ່ຢູ່ມາໃຊ້
import { useAddressStore } from '@/stores/address';

const props = defineProps<{ isOpen: boolean; loan: any }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const loanAppStore = useLoanApplicationStore();
const checklistStore = useChecklistStore();
const addressStore = useAddressStore(); // 🟢 2. ເອີ້ນໃຊ້ Store

const checklistTab = ref<'basic' | 'call' | 'cib' | 'field' | 'income'>('basic');
const isSavingChecklist = ref(false);

// 🟢 3. ກຽມຕົວແປເກັບລາຍຊື່ເມືອງທີ່ດຶງມາຈາກ ແຂວງທີ່ເລືອກ
const localDistricts = ref<any[]>([]);

const checklistTabTitle = computed(() => {
  const titles = { basic: 'ຂໍ້ມູນທົ່ວໄປ', call: 'ການໂທຢືນຢັນ', cib: 'ປະຫວັດ CIB', field: 'ການລົງພື້ນທີ່', income: 'ການປະເມີນລາຍຮັບ' };
  return titles[checklistTab.value];
});

const unlockedTabs = computed(() => {
  return {
    basic: true,
    call: formBasic.status === 'completed',
    cib: formBasic.status === 'completed' && formCalls.value.length > 0 && formCalls.value[0].id,
    field: formCIBDetails.value.length > 0 || formCIB.remark !== '',
    income: formFieldVisits.value.length > 0 && formFieldVisits.value[0].id
  };
});

const changeTab = (tab: 'basic' | 'call' | 'cib' | 'field' | 'income') => {
  if (tab === 'basic') { checklistTab.value = tab; return; }
  if (tab === 'call' && !unlockedTabs.value.call) return alert.error('ກະລຸນາບັນທຶກຂໍ້ມູນທົ່ວໄປໃຫ້ສຳເລັດກ່ອນ');
  if (tab === 'cib' && !unlockedTabs.value.cib) return alert.error('ກະລຸນາບັນທຶກການໂທຢືນຢັນກ່ອນ');
  if (tab === 'field' && !unlockedTabs.value.field) return alert.error('ກະລຸນາບັນທຶກຂໍ້ມູນ CIB ກ່ອນ');
  if (tab === 'income' && !unlockedTabs.value.income) return alert.error('ກະລຸນາບັນທຶກການລົງພື້ນທີ່ກ່ອນ');
  checklistTab.value = tab;
};

// 4. ເພີ່ມ province_id, district_id ແລະ ບ້ານ ເຂົ້າໃນ formBasic
const formBasic = reactive({
  cus_contact_method: 'phone',
  verified_first_name: '',
  verified_last_name: '',
  verified_dob: '',
  verified_village: '', // 🟢 ຮັບຊື່ບ້ານ
  verified_province_id: '', // 🟢 ຮັບ ID ແຂວງ
  verified_district_id: '', // 🟢 ຮັບ ID ເມືອງ
  verified_address: '', // ອັນນີ້ຈະຖືກ Generate ອັດຕະໂນມັດກ່ອນ Save
  verified_product_type: '',
  verified_price: 0,
  verified_down_payment: 0,
  verified_monthly_pay: 0,
  has_id_card: false,
  has_census_book: false,
  has_income_doc: false,
  has_other_doc: false,
  other_doc_detail: '',
  cus_credibility_assessment: 'reliable',
  work_company_name: '',
  work_position: '',
  work_years: 0,
  work_months: 0,
  work_salary: 0,
  workplace_assessment: 'good',
  status: 'draft'
});

// 🟢 5. Load ເມືອງອັດຕະໂນມັດເມື່ອແຂວງມີການປ່ຽນແປງ
watch(() => formBasic.verified_province_id, async (newVal) => {
  if (newVal) {
    await addressStore.fetchDistricts(newVal);
    localDistricts.value = [...addressStore.districts];

    // ຖ້າເມືອງທີ່ເລືອກໄວ້ບໍ່ຢູ່ໃນແຂວງໃໝ່, ໃຫ້ເຄລຍຄ່າຖິ້ມ
    const isValidDistrict = localDistricts.value.some(d => d.district_id === formBasic.verified_district_id);
    if (!isValidDistrict) {
      formBasic.verified_district_id = '';
    }
  } else {
    localDistricts.value = [];
    formBasic.verified_district_id = '';
  }
});

const formCalls = ref<any[]>([]);
const addCallRecord = () => formCalls.value.push({ call_target: 'workplace', contact_name: '', contact_phone: '', relationship: '', is_info_matching: true, call_status: 'completed', remark: '' });
const removeCallRecord = (index: number) => formCalls.value.splice(index, 1);

const formCIBDetails = ref<any[]>([]);
const formCIB = reactive({ is_existing_customer: false, existing_customer_status: 'normal', remark: '' });
const addCIBDetail = () => formCIBDetails.value.push({ institution_name: '', account_type: '', history_status: 'no_delay', outstanding_balance: 0 });
const removeCIBDetail = (index: number) => formCIBDetails.value.splice(index, 1);
const getCibStatusColor = (status: string) => {
  switch (status) {
    case 'no_delay': return 'text-success border-success';
    case 'delay_30_days': return 'text-info border-info';
    case 'delay_60_days': return 'text-warning border-warning';
    case 'delay_90_days': return 'text-orange-500 border-orange-500';
    case 'blacklist': return 'text-error border-error bg-error/10';
    default: return '';
  }
};

const formFieldVisits = ref<any[]>([]);
const addFieldVisit = () => formFieldVisits.value.push({ visit_type: 'home', visit_date: new Date().toISOString().slice(0, 16), living_condition: '', is_address_correct: true, remarks: '', latitude: null, longitude: null, photo_1_file: null, photo_1_preview: null, photo_2_file: null, photo_2_preview: null });
const removeFieldVisit = (index: number) => formFieldVisits.value.splice(index, 1);

const formIncome = reactive({
  average_monthly_income: 0,
  other_verified_income: 0,
  estimated_living_expenses: 0,
  existing_debt_payments: 0,
  proposed_installment: 0,
  max_approved_amount: 0
});
const totalVerifiedIncome = computed(() => Number(formIncome.average_monthly_income) + Number(formIncome.other_verified_income));
const totalDebtBurden = computed(() => Number(formIncome.existing_debt_payments) + Number(formIncome.proposed_installment));
const dsrPercentage = computed(() => totalVerifiedIncome.value <= 0 ? 0 : (totalDebtBurden.value / totalVerifiedIncome.value) * 100);

const getCurrentLocation = (index: number) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (formFieldVisits.value[index]) {
          formFieldVisits.value[index].latitude = position.coords.latitude;
          formFieldVisits.value[index].longitude = position.coords.longitude;
        }
      },
      (error) => alert.error("ເກີດຂໍ້ຜິດພາດໃນການດຶງທີ່ຕັ້ງ GPS"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  } else alert.error("Browser ຂອງທ່ານບໍ່ຮອງຮັບລະບົບ GPS");
};

const handleVisitImageUpload = (index: number, photoNum: 1 | 2, event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { alert.error('ຂະໜາດຮູບພາບຕ້ອງນ້ອຍກວ່າ 5MB'); target.value = ''; return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    const visit = formFieldVisits.value[index];
    if (visit) {
      if (photoNum === 1) { visit.photo_1_file = file; visit.photo_1_preview = e.target?.result as string; }
      else { visit.photo_2_file = file; visit.photo_2_preview = e.target?.result as string; }
    }
    target.value = '';
  };
  reader.readAsDataURL(file);
};

const removeVisitImage = (index: number, photoNum: 1 | 2) => {
  const visit = formFieldVisits.value[index];
  if (visit) {
    if (photoNum === 1) { visit.photo_1_file = null; visit.photo_1_preview = null; visit.photo_url_1 = null; }
    else { visit.photo_2_file = null; visit.photo_2_preview = null; visit.photo_url_2 = null; }
  }
};

const fetchChecklistData = async (loanId: number) => {
  try {
    const res = await apiClient.get(`/checklist/summary/${loanId}`);
    const summaryData = res.data?.data;

    if (summaryData) {
      if (summaryData.basic_verification) {
        Object.assign(formBasic, summaryData.basic_verification);
        formBasic.has_id_card = !!summaryData.basic_verification.has_id_card;
        formBasic.has_census_book = !!summaryData.basic_verification.has_census_book;
        formBasic.has_income_doc = !!summaryData.basic_verification.has_income_doc;
        formBasic.has_other_doc = !!summaryData.basic_verification.has_other_doc;

        // 🟢 ແຍກ Address String ອອກມາເພື່ອໃສ່ໃນ Dropdown (ຖ້າມີການເຊບໄວ້ກ່ອນ)
        if (formBasic.verified_address && !formBasic.verified_village) {
            const parts = formBasic.verified_address.split(',').map(p => p.trim());
            if (parts.length >= 1) formBasic.verified_village = parts[0] || '';
            // ໝາຍເຫດ: ລະບົບບໍ່ສາມາດເດົາ ID ແຂວງ/ເມືອງຈາກຊື່ໄດ້ຊັດເຈນ, ດັ່ງນັ້ນ User ອາດຕ້ອງເລືອກໃໝ່ຖ້າເປັນຂໍ້ມູນເກົ່າ
        }
      }

      if (summaryData.call_verifications && summaryData.call_verifications.length > 0) formCalls.value = summaryData.call_verifications;
      else { formCalls.value = []; addCallRecord(); }

      if (summaryData.cib_check) {
        Object.assign(formCIB, summaryData.cib_check);
        formCIB.is_existing_customer = !!summaryData.cib_check.is_existing_customer;
        if (summaryData.cib_check.cib_details && summaryData.cib_check.cib_details.length > 0) formCIBDetails.value = [...summaryData.cib_check.cib_details];
        else formCIBDetails.value = [];
      } else {
        Object.assign(formCIB, { is_existing_customer: false, existing_customer_status: 'normal', remark: '' });
        formCIBDetails.value = [];
      }

      if (summaryData.field_visits && summaryData.field_visits.length > 0) {
        formFieldVisits.value = summaryData.field_visits.map((item: any) => ({
          ...item, visit_date: item.visit_date ? new Date(item.visit_date).toISOString().slice(0, 16) : '',
          photo_1_file: null, photo_1_preview: null, photo_2_file: null, photo_2_preview: null
        }));
      } else { formFieldVisits.value = []; addFieldVisit(); }

      if (summaryData.income_assessment) Object.assign(formIncome, summaryData.income_assessment);
    } else {
      formCalls.value = []; addCallRecord();
      formFieldVisits.value = []; addFieldVisit();
      formCIBDetails.value = [];
    }
  } catch (error) { console.error(error); }
};

watch(() => props.isOpen, async (newVal) => {
  if (newVal && props.loan) {
    checklistTab.value = 'basic';
    await addressStore.fetchProvinces(); // 🟢 ໂຫຼດແຂວງທັນທີທີ່ເປີດ Modal
    await fetchChecklistData(props.loan.id);

    let fullDetails: any = props.loan;
    try {
      const fetched = await loanAppStore.fetchLoanApplicationById(props.loan.id);
      if (fetched) fullDetails = fetched;
    } catch (error) { }

    const workInfo = fullDetails.customer?.customer_work_infos?.[0] || fullDetails.customer?.work_info?.[0];

    const loanContract = fullDetails.loan_contracts?.[0];

    // 🟢 ດຶງຂໍ້ມູນ Default ຖ້າບໍ່ເຄີຍເຊບ
    formBasic.verified_first_name = formBasic.verified_first_name || fullDetails.customer?.first_name || '';
    formBasic.verified_last_name = formBasic.verified_last_name || fullDetails.customer?.last_name || '';
    formBasic.verified_dob = formBasic.verified_dob || (fullDetails.customer?.date_of_birth ? new Date(fullDetails.customer.date_of_birth).toISOString().slice(0, 10) : '');

    // 🟢 ດຶງຂໍ້ມູນທີ່ຢູ່ຈາກ Customer ເຂົ້າໄປໃນ Dropdown ອັດຕະໂນມັດ
    if (!formBasic.verified_village && fullDetails.customer?.address) {
        formBasic.verified_village = fullDetails.customer.address;
    }
    if (!formBasic.verified_province_id && fullDetails.customer?.province_id) {
        formBasic.verified_province_id = fullDetails.customer.province_id;
    }
    if (!formBasic.verified_district_id && fullDetails.customer?.district_id) {
        formBasic.verified_district_id = fullDetails.customer.district_id;
    }

    formBasic.verified_product_type = formBasic.verified_product_type || fullDetails.product?.product_name || '';
    formBasic.verified_price = formBasic.verified_price || Number(fullDetails.total_amount || 0);
    formBasic.verified_down_payment = formBasic.verified_down_payment || Number(fullDetails.down_payment || 0);
    formBasic.verified_monthly_pay = formBasic.verified_monthly_pay || Number(fullDetails.monthly_pay || 0);
    formBasic.work_company_name = formBasic.work_company_name || workInfo?.company_name || '';
    formBasic.work_position = formBasic.work_position || workInfo?.position || '';
    formBasic.work_years = formBasic.work_years || workInfo?.duration_years || 0;
    formBasic.work_salary = formBasic.work_salary || Number(workInfo?.salary || 0);

    // ==========================================
    // 🟢 ດຶງຂໍ້ມູນຈາກສັນຍາແລະລູກຄ້າມາເກັບໄວ້ກ່ອນ
    const contractOtherIncome = Number(fullDetails.loan_contracts?.[0]?.cus_income_other || loanContract?.cus_income_other || 0);
    const customerIncome = Number(workInfo?.salary || 0);
    const customerDebts = Number(fullDetails.customer?.other_debts || 0);
    const proposedPay = Number(fullDetails.monthly_pay || 0);
    const maxAmount = Number(fullDetails.total_amount || 0) - Number(fullDetails.down_payment || 0);

    // 🟢 ບັງຄັບກວດສອບດ້ວຍ Number() ສະເໝີ ເພື່ອປ້ອງກັນບັນຫາ String "0.00"
    // ຖ້າຊ່ອງໃດຍັງເປັນ 0 (ຫຼື "0.00") ໃຫ້ດຶງຂໍ້ມູນໃໝ່ມາໃສ່ທັບທັນທີ

    // 🌟 🟢 ບັງຄັບອັບເດດຄ່າໃຫ້ກົງກັບຖານຂໍ້ມູນຫຼັກສະເໝີ (Always Sync)
    // ເພາະຊ່ອງພວກນີ້ເປັນ readonly ຈຶ່ງຕ້ອງດຶງຄ່າຫຼ້າສຸດມາສະແດງສະເໝີ ໂດຍບໍ່ຕ້ອງເຊັກ === 0
    formIncome.average_monthly_income = customerIncome;
    formIncome.other_verified_income = contractOtherIncome;
    formIncome.existing_debt_payments = customerDebts;
    formIncome.proposed_installment = proposedPay;


      formIncome.max_approved_amount = maxAmount;

    // ==========================================
  }
});

const saveChecklist = async () => {
  if (!props.loan) return;
  const loanId = props.loan.id;
  isSavingChecklist.value = true;

  try {
    if (checklistTab.value === 'basic') {

      // 🟢 ປະກອບທີ່ຢູ່ໃຫ້ເປັນ String ດຽວກ່ອນເຊບລົງ DB
      let fullAddressStr = formBasic.verified_village;
      if (formBasic.verified_district_id) {
          const districtName = localDistricts.value.find(d => d.district_id === formBasic.verified_district_id)?.district_name;
          if (districtName) fullAddressStr += `, ${districtName}`;
      }
      if (formBasic.verified_province_id) {
          const provinceName = addressStore.provinces.find(p => p.province_id === formBasic.verified_province_id)?.province_name;
          if (provinceName) fullAddressStr += `, ${provinceName}`;
      }
      formBasic.verified_address = fullAddressStr; // ອັບເດດຄ່າ

      await checklistApi.saveBasic(loanId, {
          ...formBasic,
          full_name: `${formBasic.verified_first_name} ${formBasic.verified_last_name}`.trim()
      });

    } else if (checklistTab.value === 'call') {
      await checklistApi.saveCalls(loanId, { calls: formCalls.value });
    } else if (checklistTab.value === 'cib') {
      if (formCIBDetails.value.some(d => !d.institution_name)) return alert.error('ກະລຸນາລະບຸຊື່ສະຖາບັນການເງິນ');
      await checklistApi.saveCIB(loanId, { ...formCIB, cib_details: formCIBDetails.value });
    } else if (checklistTab.value === 'field') {
      const processedVisits = [];
      for (const visit of formFieldVisits.value) {
        let f1 = visit.photo_url_1; let f2 = visit.photo_url_2;
        if (visit.photo_1_file || visit.photo_2_file) {
          const imgFormData = new FormData();
          const uploadedOrder = [];
          if (visit.photo_1_file) { imgFormData.append('files', visit.photo_1_file); uploadedOrder.push('photo1'); }
          if (visit.photo_2_file) { imgFormData.append('files', visit.photo_2_file); uploadedOrder.push('photo2'); }
          const res = await apiClient.post(`/upload/location/${props.loan.customer_id}/image/${loanId}`, imgFormData, { headers: { 'Content-Type': 'multipart/form-data' } });
          const urls = res.data?.data.uploaded || res.data?.urls || [];
          uploadedOrder.forEach((t, i) => {
            if (urls[i]) { if (t === 'photo1') f1 = urls[i].file_url; if (t === 'photo2') f2 = urls[i].file_url; }
          });
        }
        processedVisits.push({
          visit_type: visit.visit_type, visit_date: visit.visit_date, living_condition: visit.living_condition,
          is_address_correct: visit.is_address_correct ? 1 : 0, remarks: visit.remarks,
          latitude: visit.latitude ? String(visit.latitude) : null, longitude: visit.longitude ? String(visit.longitude) : null,
          photo_url_1: f1, photo_url_2: f2
        });
      }
      await checklistApi.saveFieldVisits(loanId, { visits: processedVisits });
    } else if (checklistTab.value === 'income') {
      await checklistApi.saveIncome(loanId, formIncome);
    }

    alert.success(`ບັນທຶກຂໍ້ມູນ ${checklistTabTitle.value} ສຳເລັດ`);
    await fetchChecklistData(loanId);

    if (checklistTab.value === 'basic' && formBasic.status === 'completed') {
      checklistTab.value = 'call';
    }
  } catch (error) {
    alert.error('ບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ');
  } finally {
    isSavingChecklist.value = false;
  }
};

const close = () => {
  emit('close');
};
</script>
