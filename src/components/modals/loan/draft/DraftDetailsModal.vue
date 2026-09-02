<template>
  <teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">

        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold">
            {{ isEditingInModal ? 'ແກ້ໄຂຮ່າງສິນເຊື່ອ' : 'ລາຍລະອຽດຮ່າງສິນເຊື່ອ' }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <span class="icon-[tabler--x] size-5"></span>
          </button>
        </div>

        <div v-if="!isEditingInModal"
          class="flex flex-wrap gap-2 mb-6 bg-gray-50 p-3 rounded-lg border border-dashed border-primary/30">
          <span class="text-sm font-bold w-full mb-1 text-primary flex items-center gap-1">
            <span class="icon-[tabler--printer] size-4"></span> ສູນລວມການພິມເອກະສານ:
          </span>

          <button @click="openPrintTab('loanContract')" class="btn btn-sm"
            :class="canPrintProposal ? 'btn-outline btn-primary bg-white' : 'btn-ghost opacity-50'">
            <span class="icon-[tabler--file-description] size-4 mr-1"></span>
            1. ພິມໃບສະເໜີຂໍກູ້
            <span v-if="!canPrintProposal" class="icon-[tabler--lock] size-3 ml-1 text-error"></span>
          </button>

          <button @click="openPrintTab('loanContract')" class="btn btn-sm"
            :class="canPrintContract ? 'btn-outline btn-success bg-white' : 'btn-ghost opacity-50'">
            <span class="icon-[tabler--file-certificate] size-4 mr-1"></span>
            2. ພິມສັນຍາກູ້ຢືມ
            <span v-if="!canPrintContract" class="icon-[tabler--lock] size-3 ml-1 text-error"></span>
          </button>
        </div>

        <div class="flex w-full overflow-x-auto no-scrollbar border-b border-gray-200 dark:border-gray-700 mb-6">
          <button @click="activeTab = 'details'"
            class="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 min-w-[80px] border-b-2 transition-all whitespace-nowrap"
            :class="activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800'">
            <span class="icon-[tabler--alert-circle] size-6"></span>
            <span class="text-xs font-bold">ລາຍລະອຽດໄວ</span>
          </button>

          <button @click="activeTab = 'loanContract'"
            class="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 min-w-[80px] border-b-2 transition-all whitespace-nowrap"
            :class="activeTab === 'loanContract' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800'">
            <span class="icon-[tabler--file-invoice] size-6"></span>
            <span class="text-xs font-bold">ແບບຟອມ</span>
          </button>

          <button @click="activeTab = 'documents'"
            class="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 min-w-[80px] border-b-2 transition-all whitespace-nowrap"
            :class="activeTab === 'documents' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800'">
            <span class="icon-[basil--attach-outline] size-6"></span>
            <span class="text-xs font-bold">ເອກະສານແນບ</span>
          </button>

          <button @click="activeTab = 'map'"
            class="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 min-w-[80px] border-b-2 transition-all whitespace-nowrap"
            :class="activeTab === 'map' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800'">
            <span class="icon-[tabler--map] size-6"></span>
            <span class="text-xs font-bold">ແຜນທີ່</span>
          </button>
        </div>

        <div v-if="activeTab === 'details'" class="space-y-6">

          <div v-if="!isEditingInModal" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500">Loan ID</label>
                <p class="font-medium">{{ selectedDraft?.loan_id }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ລູກຄ້າ ID</label>
                <p>{{ selectedDraft?.customer_id }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ສິນຄ້າ ID</label>
                <p>{{ selectedDraft?.product_id }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ຈຳນວນເງິນກູ້ (ຍອດຈັດ)</label>
                <p class="font-medium text-primary">{{ formatPrice(Number(selectedDraft?.total_amount || 0) -
                  Number(selectedDraft?.down_payment || 0)) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ເງິນດາວ</label>
                <p class="font-medium">{{ formatPrice(selectedDraft?.down_payment || 0) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ດອກເບ້ຍ</label>
                <p>{{ selectedDraft?.interest_rate_at_apply }}%</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ໄລຍະເວລາ</label>
                <p>{{ selectedDraft?.loan_period }} ເດືອນ</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ຄ່າຜ່ອນ/ເດືອນ</label>
                <p class="font-medium text-success">{{ formatPrice(selectedDraft?.monthly_pay) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ສະຖານະ</label>
                <p>
                  <span class="badge badge-soft badge-info">ຮ່າງ (Draft)</span>
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ເຈົ້າໜ້າທີ່</label>
                <p>{{ getRequesterName(selectedDraft) || 'ID: ' + selectedDraft?.requester_id }}</p>
              </div>
            </div>

            <div v-if="selectedDraft?.customer" class="border-t pt-4 mt-4">
              <h4 class="font-medium mb-3">ຂໍ້ມູນລູກຄ້າ</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-gray-500">ຊື່</label>
                  <p>{{ getDraftDisplayName(selectedDraft) }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ເບີໂທ</label>
                  <p>{{ getDraftPhone(selectedDraft) }}</p>
                </div>
                <!-- 🟢 ເພີ່ມສະແດງເລກບັນຊີທະນາຄານ -->
                <div>
                  <label class="text-sm font-medium text-gray-500">ເລກບັນຊີທະນາຄານ (BCEL)</label>
                  <p class="font-medium text-indigo-600">{{ selectedDraft.customer?.account_number || '-' }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ລາຍຮັບ</label>
                  <p v-if="selectedDraft.customer.income_per_month" class="text-success">{{
                    formatPrice(selectedDraft.customer.income_per_month) }}</p>
                  <p v-else>-</p>
                </div>
                <div class="md:col-span-2">
                  <label class="text-sm font-medium text-gray-500">ທີ່ຢູ່</label>
                  <p>{{ getDraftAddress(selectedDraft) }}</p>
                </div>
              </div>
            </div>

            <div v-if="selectedDraft?.product" class="border-t pt-4 mt-4">
              <h4 class="font-medium mb-3">ຂໍ້ມູນສິນຄ້າ</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                  <label class="text-sm font-medium text-gray-500">ສິນຄ້າ</label>
                  <p class="font-medium">{{ getProductName(selectedDraft) }}</p>
                </div>
                <div v-if="selectedDraft?.variant">
                  <label class="text-sm font-medium text-gray-500">ສີ / ຂະໜາດ</label>
                  <p>
                    <span class="badge badge-primary badge-soft">
                      {{ selectedDraft.variant.color || 'ບໍ່ລະບຸ' }} / {{ selectedDraft.variant.size_or_capacity ||
                        selectedDraft.variant.size || 'ບໍ່ລະບຸ' }}
                    </span>
                  </p>
                </div>
                <div v-else>
                  <label class="text-sm font-medium text-gray-500">ສີ / ຂະໜາດ</label>
                  <p class="text-gray-400 text-sm">ບໍ່ມີຕົວເລືອກຍ່ອຍ</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ລາຄາສິນຄ້າຕົວຈິງ</label>
                  <p class="font-medium text-primary">{{ formatPrice(selectedDraft?.total_amount ||
                    selectedDraft.product.price) }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="space-y-6">
            <div>
              <h4 class="font-medium text-lg mb-4 flex items-center gap-2">
                <span class="icon-[tabler--user-edit] size-5 text-primary"></span>
                ແກ້ໄຂຂໍ້ມູນລູກຄ້າເບື້ອງຕົ້ນ
              </h4>

              <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ຊື່ ແລະ ນາມສະກຸນ *</span></label>
                    <input v-model="modalDraftForm.customer_name" type="text"
                      class="input input-sm input-bordered w-full bg-white"
                      :class="{ 'input-error': modalFormErrors.customer_name }" required />
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ເບີໂທລະສັບ *</span></label>
                    <input v-model="modalDraftForm.customer_phone" type="tel"
                      class="input input-sm input-bordered w-full bg-white"
                      :class="{ 'input-error': modalFormErrors.customer_phone }" required />
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ເລກບັດປະຈຳຕົວ *</span></label>
                    <input v-model="modalDraftForm.customer_id_card" type="text"
                      class="input input-sm input-bordered w-full bg-white"
                      :class="{ 'input-error': modalFormErrors.customer_id_card }" required />
                  </div>
                  <!-- 🟢 ເພີ່ມຊ່ອງແກ້ໄຂເລກບັນຊີ -->
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ເລກບັນຊີທະນາຄານ (BCEL) *</span></label>
                    <input v-model="modalDraftForm.account_number" type="text"
                      class="input input-sm input-bordered w-full bg-white"
                      :class="{ 'input-error': modalFormErrors.account_number }" required />
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ອາຍຸ *</span></label>
                    <input v-model.number="modalDraftForm.age" type="number"
                      class="input input-sm input-bordered w-full bg-white" min="0" />
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ອາຊີບ *</span></label>
                    <input v-model="modalDraftForm.occupation" type="text"
                      class="input input-sm input-bordered w-full bg-white"
                      :class="{ 'input-error': modalFormErrors.occupation }" required />
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ລາຍຮັບຕໍ່ເດືອນ *</span></label>
                    <input type="text" :value="formatCurrencyInput(modalDraftForm.income_per_month)"
                      @input="handleModalCurrencyInput('income_per_month', $event)"
                      class="input input-sm input-bordered w-full bg-white text-success font-medium" />
                  </div>

                  <div class="form-control md:col-span-2">
                    <label class="label"><span class="label-text font-medium">ທີ່ຢູ່ປະຈຸບັນ *</span></label>
                    <div class="address-grid-custom mt-1">
                      <div class="input-sub">
                        <span class="font-bold">ບ້ານ:</span>
                        <input v-model="modalDraftForm.customer_address" type="text"
                          class="input input-sm input-bordered w-full bg-white" placeholder="ບ້ານ" required />
                      </div>
                      <div class="input-sub">
                        <span class="font-bold">ແຂວງ:</span>
                        <select v-model="modalDraftForm.province_id" @change="handleProvinceChange"
                          class="select-addr select-sm select-bordered w-full bg-white" required>
                          <option value="" disabled>-- ເລືອກແຂວງ --</option>
                          <option v-for="p in addressStore.provinces" :key="p.province_id" :value="p.province_id">
                            {{ p.province_name }}
                          </option>
                        </select>
                      </div>
                      <div class="input-sub">
                        <span class="font-bold">ເມືອງ:</span>
                        <select v-model="modalDraftForm.district_id" :disabled="!modalDraftForm.province_id"
                          class="select-addr select-sm select-bordered w-full bg-white" required>
                          <option value="" disabled>-- ເລືອກເມືອງ --</option>
                          <option v-for="d in addressStore.districts" :key="d.district_id" :value="d.district_id">
                            {{ d.district_name }}
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="border-t pt-6">
              <h4 class="font-medium text-lg mb-4 flex items-center gap-2">
                <span class="icon-[tabler--building-store] size-5 text-primary"></span> ເລືອກຮ້ານຄ້າ ແລະ ສິນຄ້າ
              </h4>
              <div class="form-control mb-4">
                <label class="label"><span class="label-text font-medium">ຮ້ານຄ້າ / ຕົວແທນ *</span></label>
                <select v-model="modalShopId" class="select select-sm select-bordered w-full bg-white"
                  @change="handleShopChange" required>
                  <option :value="null" disabled>-- ກະລຸນາເລືອກຮ້ານຄ້າ --</option>
                  <option v-for="shop in shopsList" :key="shop.id" :value="shop.id">{{ shop.shop_name }}</option>
                </select>
              </div>
              <div class="form-control mb-4">
                <label class="label">
                  <span class="label-text font-medium" :class="{ 'text-gray-400': !modalShopId }">ສິນຄ້າ *</span>
                  <span v-if="!modalShopId" class="text-xs text-error">ກະລຸນາເລືອກຮ້ານຄ້າກ່ອນ</span>
                </label>
                <div class="relative">
                  <input v-model="modalProductSearch" type="text" placeholder="ພິມຊື່ສິນຄ້າ ຫຼື ລະຫັດ…"
                    class="input input-sm input-bordered w-full pl-10 pr-10 bg-white" :disabled="!modalShopId"
                    @input="debounceModalProductSearch" @focus="showModalProductDropdown = true"
                    @blur="handleModalProductBlur" />

                  <span
                    class="icon-[tabler--search] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4"></span>

                  <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-error"
                    :disabled="!selectedModalProduct" @click="clearModalProductSelection">
                    <span class="icon-[tabler--x] size-4"></span>
                  </button>

                  <div v-if="showModalProductDropdown && filteredModalProducts.length > 0"
                    class="absolute left-0 right-0 z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div v-for="product in filteredModalProducts" :key="product.id"
                      class="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
                      @click="selectModalProduct(product)">
                      <div class="flex-1">
                        <div class="font-medium">{{ product.product_name }}</div>
                        <div class="text-xs text-gray-500">{{ product.type_name }}</div>
                      </div>
                      <div class="text-right">
                        <div class="font-medium text-primary text-sm">{{ formatPrice(product.price) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="selectedModalProduct"
                class="form-control mb-4 border border-gray-200 dark:border-gray-700 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <label class="label pt-0">
                  <span class="label-text font-medium text-gray-800 dark:text-white">ເລືອກ ສີ / ຂະໜາດ <span
                      v-if="modalProductVariants.length > 0">*</span></span>
                </label>

                <div v-if="isModalLoadingVariants" class="text-sm text-gray-500 flex items-center gap-2">
                  <span class="loading loading-spinner loading-xs"></span> ກຳລັງໂຫຼດຕົວເລືອກຍ່ອຍ...
                </div>

                <div v-else-if="modalProductVariants.length === 0"
                  class="text-sm text-gray-500 flex items-center gap-2">
                  <span class="icon-[tabler--info-circle] size-4 text-gray-400"></span>
                  <span>ສິນຄ້ານີ້ບໍ່ມີຕົວເລືອກຍ່ອຍ</span>
                </div>

                <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div v-for="variant in modalProductVariants" :key="variant.id"
                    class="border rounded p-2 cursor-pointer flex justify-between items-center transition-all bg-white"
                    :class="modalSelectedVariant?.id === variant.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-primary/30'"
                    @click="selectModalVariant(variant)">
                    <div>
                      <div class="font-medium text-sm text-gray-800 dark:text-white">
                        {{ variant.color || 'ບໍ່ລະບຸ' }} / {{ variant.size_or_capacity || 'ບໍ່ລະບຸ' }}
                      </div>
                    </div>
                    <div class="font-bold text-primary text-sm">{{ formatPrice(variant.price) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="border-t pt-6">
              <h4 class="font-medium text-lg mb-4 flex items-center gap-2">
                <span class="icon-[tabler--file-invoice] size-5 text-primary"></span> ລາຍລະອຽດສິນເຊື່ອ
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                  <label class="label"><span class="label-text font-medium">ລາຄາສິນຄ້າ *</span></label>
                  <input type="text" :value="formatCurrencyInput(modalDraftForm.total_amount)"
                    @input="handleModalPriceInput"
                    class="input input-sm input-bordered w-full font-bold text-primary bg-white" required
                    placeholder="ປ້ອນລາຄາສິນຄ້າ" />
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">ຈຳນວນເງິນດາວ
                      <span v-if="modalDraftForm.total_amount > 0" class="text-xs text-gray-500">
                        ຍອດຈັດ: {{ formatPrice(Math.max(0, modalDraftForm.total_amount - (modalDraftForm.down_payment ||
                          0))) }}
                      </span>
                    </span>
                  </label>
                  <input type="text" :value="formatCurrencyInput(modalDraftForm.down_payment)"
                    @input="handleModalDownPaymentInput" class="input input-sm input-bordered w-full bg-white"
                    placeholder="ປ້ອນເງິນດາວ" />
                </div>

                <div class="form-control">
                  <label class="label"><span class="label-text font-medium">ໄລຍະເວລາ (ເດືອນ) *</span></label>
                  <select v-model.number="modalDraftForm.loan_period"
                    class="select select-sm select-bordered w-full bg-white" required @change="handleModalTermChange">
                    <option value="0" disabled>-- ເລືອກຈຳນວນງວດ --</option>
                    <option value="6">6 ເດືອນ</option>
                    <option value="12">12 ເດືອນ</option>
                    <option value="18">18 ເດືອນ</option>
                    <option value="24">24 ເດືອນ</option>
                    <option value="36">36 ເດືອນ</option>
                    <option value="48">48 ເດືອນ</option>
                  </select>
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">ອັດຕາດອກເບ້ຍ (ອັດຕະໂນມັດ) * <span
                        class="badge badge-primary badge-xs badge-soft ml-1">
                        {{ modalDraftForm.interest_rate_type === 'yearly' ? '% ຕໍ່ປີ' : '% ຕໍ່ເດືອນ' }}
                      </span></span>
                  </label>
                  <input v-model.number="modalDraftForm.interest_rate" type="number"
                    class="input input-sm input-bordered w-full bg-gray-100 cursor-not-allowed" min="0" max="100"
                    step="0.01" readonly required />
                </div>

                <div class="form-control">
                  <label class="label"><span class="label-text font-medium">ປະເພດດອກເບ້ຍ *</span></label>
                  <select v-model="modalDraftForm.interest_type"
                    @change="modalDraftForm.monthly_payment = calculateModalMonthlyPayment()"
                    class="select select-sm select-bordered w-full bg-white">
                    <option value="flat_rate">ດອກເບ້ຍຄົງທີ່ (Flat Rate)</option>
                    <option value="effective_rate">ລົດຕົ້ນລົດດອກ (Effective Rate)</option>
                  </select>
                </div>

                <div class="form-control">
                  <label class="label"><span class="label-text font-medium">ຄ່າງວດຕໍ່ເດືອນ</span></label>
                  <input :value="formatPrice(modalDraftForm.monthly_payment)" type="text"
                    class="input input-sm input-bordered w-full bg-blue-50 text-blue-700 font-bold cursor-not-allowed"
                    readonly />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'loanContract'" class="space-y-6">
          <LoanContractForm :loan-contract-id="selectedDraft?.id" :loan-application="selectedDraft"
            :loan-contract="selectedContract" :is-editing="isEditingInModal" @cancel-edit="isEditingInModal = false"
            @enable-edit="isEditingInModal = true" @save-form="handleSaveContract" />
        </div>

        <div v-else-if="activeTab === 'documents'" class="space-y-6">

          <div v-if="!isEditingInModal" class="space-y-6 bg-slate-50/50 p-2 sm:p-4 rounded-xl">

            <div v-if="!loanApplicationStore.currentDocuments || loanApplicationStore.currentDocuments.length === 0"
              class="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div
                class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="icon-[tabler--file-off] size-8 text-gray-400"></span>
              </div>
              <p class="text-lg font-medium">ບໍ່ມີເອກະສານແນບ</p>
              <p class="text-sm text-gray-500 mt-1">ຍັງບໍ່ມີເອກະສານທີ່ອັບໂຫຼດສຳລັບສິນເຊື່ອນີ້</p>
            </div>

            <template v-else>
              <div v-for="(cat, catIndex) in allDocumentCategories" :key="'view-cat-' + catIndex"
                v-show="cat.files && cat.files.length > 0"
                class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">

                <div class="flex items-center justify-between mb-4 border-b pb-3">
                  <h4 class="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <span class="icon-[tabler--folder-open] size-5 text-indigo-600"></span> {{ cat.name }}
                  </h4>
                  <span v-if="cat.required" class="badge badge-soft badge-success text-xs font-bold">ຕາມກຳນົດ</span>
                  <span v-else class="badge badge-soft text-xs font-bold bg-gray-100 text-gray-600">ບໍ່ບັງຄັບ</span>
                </div>

                <div class="flex flex-wrap gap-4">
                  <div v-for="(f, fileIndex) in cat.files" :key="fileIndex"
                    class="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 w-full sm:w-48 group cursor-pointer shadow-sm hover:shadow-md transition-all"
                    @click="openInNewTab(f.preview)">

                    <div class="h-32 w-full overflow-hidden bg-slate-100">
                      <img v-if="!f.isPdf" :src="f.preview"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div v-else class="w-full h-full flex flex-col items-center justify-center">
                        <span class="icon-[tabler--file-type-pdf] size-10 text-red-500 mb-2"></span>
                        <span class="text-xs text-gray-500 truncate w-3/4 text-center">{{ f.name }}</span>
                      </div>
                    </div>

                    <div
                      class="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-center py-2 text-[11px] font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      ເບິ່ງເອກະສານ
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <div v-else class="space-y-6">
            <div v-for="(cat, catIndex) in allDocumentCategories" :key="'edit-cat-' + cat.id"
              class="border rounded-2xl p-5 bg-white shadow-sm border-slate-200">

              <div class="flex justify-between items-start mb-4">
                <div>
                  <h5 class="font-bold text-slate-800">{{ cat.name }}</h5>
                  <p class="text-[11px] text-slate-400 mt-1">{{ cat.description }}</p>
                </div>
                <span v-if="cat.required"
                  class="badge badge-error badge-soft text-[10px] font-bold px-2 py-1">ຕ້ອງການ</span>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">

                <div v-for="(f, fileIndex) in cat.files" :key="fileIndex"
                  class="relative aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">

                  <button type="button" @click.stop="removeDocument(cat.id, fileIndex)"
                    class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 z-10 shadow-md hover:scale-110 transition-transform">
                    <span class="icon-[tabler--x] size-4"></span>
                  </button>

                  <img v-if="!f.isPdf" :src="f.preview"
                    class="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
                    @click="openInNewTab(f.preview)" />
                  <div v-else
                    class="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors"
                    @click="openInNewTab(f.preview)">
                    <span class="icon-[tabler--file-type-pdf] size-10 text-red-500 mb-1"></span>
                    <span class="text-[10px] text-center truncate px-2 w-full">{{ f.name }}</span>
                  </div>

                  <div class="absolute bottom-1 left-1 pointer-events-none">
                    <span v-if="f.file"
                      class="text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded shadow">ໃໝ່</span>
                  </div>
                </div>

                <label
                  class="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-400 transition-all group">
                  <input type="file" class="hidden" multiple accept="image/*,.pdf"
                    @change="(e) => handleDocumentUpload(cat.id, e)" />
                  <div
                    class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    <span class="icon-[tabler--plus] size-6 text-slate-400 group-hover:text-indigo-600"></span>
                  </div>
                  <span class="text-[11px] font-bold text-slate-400 mt-2 group-hover:text-indigo-600">ເພີ່ມໄຟລ໌</span>
                </label>

              </div>

              <div class="mt-3 text-[11px] text-gray-500 text-right font-medium border-t pt-3">
                ອັບໂຫຼດແລ້ວ: <span :class="cat.files.length > 0 ? 'text-success' : 'text-error'">{{ cat.files.length }}
                  ໄຟລ໌</span>
              </div>
            </div>

            <div v-if="isUploadingDocuments"
              class="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-center font-bold text-indigo-700 shadow-sm flex items-center justify-center gap-2">
              <span class="loading loading-spinner loading-sm"></span>
              ກຳລັງອັບໂຫຼດເອກະສານ... ກະລຸນາລໍຖ້າ
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'map'" class="space-y-4">
          <div v-if="customerLocations.length === 0" class="alert alert-warning shadow-sm py-2">
            <span class="icon-[tabler--map-pin-off] size-5"></span>
            <span class="text-sm">ລູກຄ້າຄົນນີ້ຍັງບໍ່ມີຂໍ້ມູນທີ່ຕັ້ງເທື່ອ.
              <span v-if="canManageLocation">ກະລຸນາປັກໝຸດທີ່ຕັ້ງລູກຄ້າເພື່ອງ່າຍຕໍ່ການຕິດຕາມ.</span>
            </span>
          </div>

          <CustomerLocationMap v-if="selectedDraft?.customer_id" :customer-id="selectedDraft.customer_id"
            :locations="customerLocations" :google-maps-api-key="''" :is-loading="isLocationLoading"
            :can-add-location="canManageLocation" :can-edit-location="canManageLocation"
            :can-delete-location="canManageLocation" :can-set-primary="canManageLocation"
            @add-location="handleAddLocation" @update-location="handleUpdateLocation"
            @delete-location="handleDeleteLocation" @set-primary="handleSetPrimary" />
        </div>

        <div class="flex justify-end gap-3 mt-6 border-t pt-6">
          <button class="btn btn-soft btn-secondary" @click="closeModal">
            {{ isEditingInModal ? 'ຍົກເລີກ' : 'ປິດ' }}
          </button>

          <button v-if="!isEditingInModal && (activeTab === 'details' || activeTab === 'documents')"
            v-show="permissionStore.hasPermission('loan_edit') || permissionStore.hasPermission('loan_create')"
            class="btn btn-primary" @click="startEditInModal">
            <span class="icon-[tabler--edit] size-4 mr-1"></span> ແກ້ໄຂ
          </button>

          <button v-else-if="isEditingInModal && activeTab === 'details'" class="btn btn-success text-white"
            @click="saveDraftFromModal"
            :disabled="isSaving || (modalProductVariants.length > 0 && !modalSelectedVariant)">
            <span v-if="isSaving" class="loading loading-spinner loading-xs"></span>
            <span v-else class="icon-[tabler--device-floppy] size-4 mr-1"></span>
            <span v-if="!isSaving">ບັນທຶກການປ່ຽນແປງ</span>
          </button>

          <button v-else-if="isEditingInModal && activeTab === 'documents'" class="btn btn-success text-white"
            @click="saveDocumentsOnly" :disabled="isUploadingDocuments">
            <span v-if="isUploadingDocuments" class="loading loading-spinner loading-xs"></span>
            <span v-else class="icon-[tabler--device-floppy] size-4 mr-1"></span>
            <span v-if="!isUploadingDocuments">ບັນທຶກເອກະສານ</span>
          </button>

        </div>

      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useLoanApplicationStore } from '@/stores/loanApplication'
import { useProductStore } from '@/stores/product'
import { useLoanContractStore } from '@/stores/loanContract'
import { useShopStore } from '@/stores/shop'
import { useAddressStore } from '@/stores/address'
import { usePermissionStore } from '@/stores/permission'
import { LoanApplicationStatus } from '@/types/loanApplication'
import type { CustomerLocation } from '@/types/customer'
import { formatPrice, formatCurrencyInput, getDocumentTypeName } from '@/utils/formatters'
import { getFullImageUrl } from '@/utils/url'
import { alert as customAlert } from '@/utils/alert'
import imageCompression from 'browser-image-compression';

import CustomerLocationMap from '@/components/loans/form/CustomerLocationMap.vue'
import LoanContractForm from '@/components/loans/form/LoanContractForm.vue'

const props = defineProps<{ show: boolean, draftId: number | null }>()
const emit = defineEmits(['close', 'refresh'])

const loanApplicationStore = useLoanApplicationStore()
const productStore = useProductStore()
const loanContractStore = useLoanContractStore()
const shopStore = useShopStore()
const addressStore = useAddressStore()
const permissionStore = usePermissionStore()

const activeTab = ref<'details' | 'documents' | 'map' | 'loanContract'>('details')
const isEditingInModal = ref(false)
const isSaving = ref(false)
const isUploadingDocuments = ref(false)

const selectedDraft = ref<any | null>(null)
const selectedContract = ref<any | null>(null)

const openInNewTab = (url: string | null | undefined) => {
  if (url) window.open(url, '_blank');
};

const modalShopId = ref<number | null>(null)
const modalProductSearch = ref('')
const showModalProductDropdown = ref(false)
const selectedModalProduct = ref<any | null>(null)
const shopsList = computed(() => shopStore.shops)

const modalProductVariants = ref<any[]>([])
const modalSelectedVariant = ref<any | null>(null)
const isModalLoadingVariants = ref(false)

const customerLocations = ref<CustomerLocation[]>([])
const isLocationLoading = ref(false)

const modalDraftForm = reactive({
  customer_name: '', customer_phone: '', customer_id_card: '', account_number: '', customer_address: '', occupation: '', age: 0,
  province_id: '', district_id: '',
  product_name: '', product_type: '', total_amount: 0, down_payment: 0, interest_rate: 0, loan_period: 0,
  monthly_payment: 0, income_per_month: 0, other_debts: 0, interest_type: 'flat_rate', interest_rate_type: 'monthly'
})

const modalFormErrors = reactive({
  customer_name: '', customer_phone: '', customer_id_card: '', account_number: '', customer_address: '', occupation: '', age: '',
  province_id: '', district_id: '', total_amount: '', down_payment: '', interest_rate: '', loan_period: '', income_per_month: ''
})

interface UploadedFile {
  id?: number;
  file: File | Blob | null;
  preview: string;
  isPdf: boolean;
  name: string;
}

interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  files: UploadedFile[];
}

const draftDocuments = ref<DocumentCategory[]>([
  { id: 'id_card', name: 'ບັດປະຈຳຕົວ (ID Card/Passport)', description: 'ຮູບຖ່າຍບັດປະຈຳຕົວທັງໜ້າ-ຫຼັງ', required: true, files: [] },
  { id: 'house_reg', name: 'ທະບຽນບ້ານ (House Registration)', description: 'ໃບຄອບຄົວຫຼືເອກະສານຢືນຢັນທີ່ຢູ່', required: true, files: [] }
])
const optionalDocuments = ref<DocumentCategory[]>([
  { id: 'salary_slip', name: 'ຫຼັກຖານລາຍຮັບ (Income Evidence)', description: 'ໃບເງິນເດືອນ ຫຼື ໃບຮັບລາຍຮັບ', required: false, files: [] },
  { id: 'other', name: 'ເອກະສານອື່ນໆ (Other Documents)', description: 'ເອກະສານອື່ນໆທີ່ກ່ຽວຂ້ອງ', required: false, files: [] }
])

const allDocumentCategories = computed(() => [...draftDocuments.value, ...optionalDocuments.value]);

const getFilesByType = (typeId: string) => {
  const category = allDocumentCategories.value.find(c => c.id === typeId);
  return category ? category.files : [];
};

const populateDocumentsFromStore = () => {
  draftDocuments.value.forEach(doc => { doc.files = [] })
  optionalDocuments.value.forEach(doc => { doc.files = [] })

  if (loanApplicationStore.currentDocuments && loanApplicationStore.currentDocuments.length > 0) {
    loanApplicationStore.currentDocuments.forEach(serverDoc => {
      const docType = serverDoc.document_type || serverDoc.doc_type;
      const reqDoc = draftDocuments.value.find(d => d.id === docType);
      const optDoc = optionalDocuments.value.find(d => d.id === docType);
      const fileUrl = getFullImageUrl(serverDoc.file_url);

      if (fileUrl) {
        const newFileObj: UploadedFile = {
          id: serverDoc.id,
          file: null,
          preview: fileUrl,
          isPdf: serverDoc.file_url?.toLowerCase().endsWith('.pdf') || false,
          name: serverDoc.original_filename || serverDoc.file_name || 'Document'
        };

        if (reqDoc) reqDoc.files.push(newFileObj);
        if (optDoc) optDoc.files.push(newFileObj);
      }
    })
  }
}

const getDraftDisplayName = (draft: any): string => draft?.customer ? `${draft.customer.first_name || ''} ${draft.customer.last_name || ''}`.trim() : '-'
const getDraftPhone = (draft: any): string => draft?.customer?.phone || '-'
const getDraftAddress = (draft: any): string => draft?.customer?.address || '-'
const getProductName = (draft: any): string => draft?.product?.product_name || '-'
const getRequesterName = (draft: any): string => (draft?.requester as any)?.full_name || (draft?.requester as any)?.name || '-'
const isImage = (url: string) => /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url.toLowerCase())

watch(() => props.show, async (newVal) => {
  if (newVal && props.draftId) {
    try {
      selectedDraft.value = await loanApplicationStore.fetchLoanApplicationById(props.draftId)

      await loanApplicationStore.fetchDocuments(selectedDraft.value.customer_id)
      populateDocumentsFromStore()

      try { selectedContract.value = await loanContractStore.fetchContract(props.draftId) } catch (e) { }
      if (selectedDraft.value.customer_id) await loadCustomerLocations(selectedDraft.value.customer_id)

      activeTab.value = 'details'
      isEditingInModal.value = false
    } catch (error) {
      customAlert.error('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຮ່າງສິນເຊື່ອໄດ້.')
      closeModal()
    }
  } else {
    selectedDraft.value = null; selectedContract.value = null;
  }
})

const closeModal = () => {
  isEditingInModal.value = false; activeTab.value = 'details'; emit('close');
}

const canPrintProposal = computed(() => !!selectedDraft.value?.id && !!selectedDraft.value?.customer?.first_name)
const canPrintContract = computed(() => !!selectedContract.value && !!selectedContract.value.id)

const canManageLocation = computed(() => {
  return permissionStore.hasPermission('loan_edit') || permissionStore.hasPermission('loan_create');
});

const openPrintTab = (tabName: 'loanContract') => { activeTab.value = tabName; }

const handleProvinceChange = async () => {
  modalDraftForm.district_id = '';
  if (modalDraftForm.province_id) await addressStore.fetchDistricts(modalDraftForm.province_id);
  else addressStore.districts = [];
};

const loadVariantsForEdit = async (productId: number, variantId?: number) => {
  isModalLoadingVariants.value = true;
  try {
    const variants = await productStore.fetchVariantsByProductId(productId);
    modalProductVariants.value = variants || [];

    if (variantId) {
      modalSelectedVariant.value = modalProductVariants.value.find(v => v.id === variantId) || null;
    } else {
      modalSelectedVariant.value = null;
    }
  } catch (error) {
    console.error('Failed to load variants:', error);
    modalProductVariants.value = [];
  } finally {
    isModalLoadingVariants.value = false;
  }
}

const startEditInModal = async () => {
  if (!selectedDraft.value) return
  let draftData = selectedDraft.value
  const shopId = draftData.partner_id || draftData.product?.partner_id || null
  modalShopId.value = shopId

  if (shopId) {
    await productStore.fetchProducts({ shop_id: shopId, limit: 100 })
    if (draftData.product_id) {
      const currentProduct = productStore.products.find(p => p.id === draftData.product_id)
      if (currentProduct) {
        selectedModalProduct.value = currentProduct;
        modalProductSearch.value = currentProduct.product_name
        await loadVariantsForEdit(currentProduct.id, draftData.variant_id);
      }
    }
  }

  modalDraftForm.customer_name = getDraftDisplayName(draftData)
  modalDraftForm.customer_phone = getDraftPhone(draftData)
  modalDraftForm.customer_id_card = draftData.customer?.identity_number || ''
  modalDraftForm.account_number = draftData.customer?.account_number || '' // 🟢 ເພີ່ມໂຕນີ້
  modalDraftForm.customer_address = getDraftAddress(draftData)

  modalDraftForm.province_id = draftData.customer?.province_id ? String(draftData.customer.province_id) : ''
  if (modalDraftForm.province_id) await addressStore.fetchDistricts(modalDraftForm.province_id)
  modalDraftForm.district_id = draftData.customer?.district_id ? String(draftData.customer.district_id) : ''

  modalDraftForm.occupation = draftData.customer?.occupation || ''
  modalDraftForm.age = draftData.customer?.age || 0

  modalDraftForm.total_amount = Math.round(Number(draftData.total_amount || 0))
  modalDraftForm.down_payment = Math.round(Number(draftData.down_payment || 0))
  modalDraftForm.loan_period = Number(draftData.loan_period || 0)
  modalDraftForm.interest_rate = Number(draftData.interest_rate_at_apply || 0)
  modalDraftForm.interest_type = draftData.interest_type || 'flat_rate'
  modalDraftForm.interest_rate_type = draftData.interest_rate_type || 'monthly'
  modalDraftForm.monthly_payment = calculateModalMonthlyPayment()
  modalDraftForm.income_per_month = Math.round(Number(draftData.customer?.income_per_month || 0))

  isEditingInModal.value = true
}

const saveDraftFromModal = async () => {
  if (modalProductVariants.value.length > 0 && !modalSelectedVariant.value) {
    customAlert.error('ກະລຸນາເລືອກ ສີ/ຂະໜາດ ຂອງສິນຄ້າກ່ອນບັນທຶກ');
    return;
  }

  isSaving.value = true
  try {
    const nameParts = modalDraftForm.customer_name.trim().split(' ')
    const firstName = nameParts[0] || modalDraftForm.customer_name
    const lastName = nameParts.slice(1).join(' ') || ''

    const updateData = {
      product_id: selectedModalProduct.value?.id || selectedDraft.value.product_id,
      variant_id: modalSelectedVariant.value?.id || null,
      customer_id: selectedDraft.value?.customer_id,
      first_name: firstName, last_name: lastName,
      phone: modalDraftForm.customer_phone, identity_number: modalDraftForm.customer_id_card,
      account_number: modalDraftForm.account_number, // 🟢 ເພີ່ມໂຕນີ້
      address: modalDraftForm.customer_address, province_id: modalDraftForm.province_id, district_id: modalDraftForm.district_id,
      age: Number(modalDraftForm.age), occupation: modalDraftForm.occupation,
      income_per_month: modalDraftForm.income_per_month,
      total_amount: Number(modalDraftForm.total_amount), down_payment: Number(modalDraftForm.down_payment),
      loan_period: Number(modalDraftForm.loan_period), interest_rate_at_apply: Number(modalDraftForm.interest_rate),
      monthly_pay: Number(modalDraftForm.monthly_payment),
      interest_type: modalDraftForm.interest_type, interest_rate_type: modalDraftForm.interest_rate_type
    }

    await loanApplicationStore.updateDraftLoanApplication(selectedDraft.value.id, updateData)

    selectedDraft.value = await loanApplicationStore.fetchLoanApplicationById(selectedDraft.value.id)

    isEditingInModal.value = false
    customAlert.success('ບັນທຶກສຳເລັດ!')

    emit('refresh')
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ';
    customAlert.error('ເກີດຂໍ້ຜິດພາດ', errorMsg)
  } finally { isSaving.value = false }
}

const saveDocumentsOnly = async () => {
  if (!selectedDraft.value) return;
  isUploadingDocuments.value = true;

  try {
    const filesToUpload: File[] = [];
    const docTypesArray: string[] = [];

    for (const cat of allDocumentCategories.value) {
      for (const f of cat.files) {
        if (f.file) {
          const fileObj = f.file instanceof File
            ? f.file
            : new File([f.file as Blob], f.name || 'document.pdf', { type: f.file?.type });

          filesToUpload.push(fileObj);
          docTypesArray.push(cat.id);
        }
      }
    }

    if (filesToUpload.length > 0) {
      await loanApplicationStore.uploadMultipleDocuments(
        selectedDraft.value.customer_id,
        selectedDraft.value.id,
        filesToUpload,
        docTypesArray
      );

      await loanApplicationStore.fetchDocuments(selectedDraft.value.customer_id);
      populateDocumentsFromStore();

      customAlert.success('ອັບໂຫຼດເອກະສານສຳເລັດ!');
    } else {
      customAlert.info('ບໍ່ມີເອກະສານໃໝ່ໃຫ້ອັບໂຫຼດ');
    }

    isEditingInModal.value = false;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'ເກີດຂໍ້ຜິດພາດການບັນທຶກເອກະສານ';
    customAlert.error('ເກີດຂໍ້ຜິດພາດການບັນທຶກເອກະສານ', errorMsg);
  } finally {
    isUploadingDocuments.value = false;
  }
}

const handleSaveContract = async (customerId: number, formData: any) => {
  if (!selectedDraft.value) return;
  isSaving.value = true;

  try {
    const loanId = selectedDraft.value.id;
    const refType = formData.hasGuarantor ? 'guarantor' : (formData.hasReference ? 'reference' : null);
    const hasGuarantorOrRef = !!refType;

    const cData = formData?.customer || {};
    const wData = formData?.work || {};
    const pData = formData?.product || {};
    const sData = formData?.shop || {};

    const gData = hasGuarantorOrRef ? (formData?.guarantor || {}) : {};
    const gwData = hasGuarantorOrRef ? (formData?.guarantorWork || {}) : {};

    const fullNameString = String(cData.fullname || '').trim();
    const nameParts = fullNameString ? fullNameString.split(' ') : [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const updateAppPayload = {
      total_amount: Number(pData.price) || 0,
      down_payment: Number(pData.downPayment) || 0,
      interest_rate_at_apply: Number(pData.interestRate) || 0,
      loan_period: Number(pData.loanTerm) || 0,
      monthly_pay: Number(pData.monthlyPayment) || 0,
      fee: Number(pData.fee) || 0,
      payment_day: Number(pData.paymentDay) || 1,
      interest_type: pData.interestType || 'flat_rate',
      interest_rate_type: pData.interestRateType || 'monthly',
      variant_id: Number(pData.variant_id) || selectedDraft.value?.variant_id || null,
      first_name: firstName, last_name: lastName,
      phone: cData.phone || '', identity_number: cData.idCard || '',
      gender: cData.gender || '', marital_status: cData.maritalStatus || '',
      date_of_birth: cData.dob || '', age: Number(cData.age) || 0,
      occupation: cData.occupation || '',
      province_id: cData.address?.province_id || null,
      district_id: cData.address?.district_id || null,
      address: cData.address?.village || '',
      unit: cData.unit || '', house_number: cData.houseNumber || '',
      census_number: cData.censusBook || '', issue_place: cData.censusAuthorizeBy || '',
      issue_date: cData.idCardIssueDate || null
    };
    await loanApplicationStore.updateDraftLoanApplication(loanId, updateAppPayload);

    const proposalData = {
      company_name: wData.companyName || '',
      province_id: wData.address?.province_id || null,
      district_id: wData.address?.district_id || null,
      address: wData.address?.village || '',
      phone: wData.phone || cData.phone || '',
      business_type: wData.businessType || '',
      business_detail: wData.businessDetail || '',
      department: wData.department || '',
      duration_years: wData.workYears || null,
      duration_months: wData.workMonths || null,
      position: wData.position || '',
      salary: wData.salary || null,

      ref_type: refType,

      name: hasGuarantorOrRef && gData.fullname ? gData.fullname : 'ບໍ່ມີ',
      identity_number: hasGuarantorOrRef && gData.idCard ? gData.idCard : 'ບໍ່ມີ',
      GuarantorDOB: hasGuarantorOrRef && gData.dob ? gData.dob : null,
      GuarantorAGE: hasGuarantorOrRef ? (gData.age || 0) : 0,
      Guarantorprovince_id: hasGuarantorOrRef ? (gData.address?.province_id || null) : null,
      Guarantordistrict_id: hasGuarantorOrRef ? (gData.address?.district_id || null) : null,
      Guarantoraddress: hasGuarantorOrRef && gData.address?.village ? gData.address.village : 'ບໍ່ມີ',
      Guarantorphone: hasGuarantorOrRef && gData.phone ? gData.phone : 'ບໍ່ມີ',
      occupation: hasGuarantorOrRef && gData.occupation ? gData.occupation : 'ບໍ່ມີ',
      relationship: hasGuarantorOrRef && gData.relationship ? gData.relationship : 'ບໍ່ມີ',

      work_company_name: hasGuarantorOrRef && gwData.companyName ? gwData.companyName : 'ບໍ່ມີ',
      work_phone: hasGuarantorOrRef && gwData.phone ? gwData.phone : 'ບໍ່ມີ',
      work_location: hasGuarantorOrRef && gwData.address?.village ? gwData.address.village : 'ບໍ່ມີ',
      work_province_id: hasGuarantorOrRef ? (gwData.address?.province_id || null) : null,
      work_district_id: hasGuarantorOrRef ? (gwData.address?.district_id || null) : null,
      work_position: hasGuarantorOrRef && gwData.position ? gwData.position : 'ບໍ່ມີ',
      work_salary: hasGuarantorOrRef ? String(gwData.salary || '0') : '0'
    };

    const { saveCustProposal } = await import('@/api/proposal');
    await saveCustProposal(customerId, loanId, proposalData);

    const formatAddr = (addr: any) => addr ? [addr.village, addr.district, addr.province].filter(Boolean).join(', ') : 'ບໍ່ລະບຸ';

    const flatContractPayload = {
      loanId: loanId,
      cusFullName: cData.fullname || 'ບໍ່ລະບຸ', cusSex: cData.gender || 'ບໍ່ລະບຸ',
      cusDateOfBirth: cData.dob || new Date().toISOString().split('T')[0], cusPhone: cData.phone || 'ບໍ່ລະບຸ',
      cusMaritalStatus: cData.maritalStatus || 'ບໍ່ລະບຸ', cusIdPassNumber: cData.idCard || 'ບໍ່ລະບຸ',
      cusIdPassDate: cData.idCardIssueDate || new Date().toISOString().split('T')[0],
      cusIdPassExpiryDate: cData.idCardExpiryDate || new Date().toISOString().split('T')[0],
      cusCensusNumber: cData.censusBook || 'ບໍ່ມີ', cusCensusCreated: cData.censusBookIssueDate || new Date().toISOString().split('T')[0],
      cusCensusAuthorizeBy: cData.censusAuthorizeBy || 'ບໍ່ລະບຸ', cusHouseNumber: cData.houseNumber || 'ບໍ່ລະບຸ',
      cusUnit: Number(cData.unit) || 0, cusAddress: formatAddr(cData.address), cusProvinceId: cData.address?.province_id || null,
      cusDistrictId: cData.address?.district_id || null, cusLivedYear: Number(cData.residenceYears) || 0,
      cusLivedWith: cData.liveWith || 'ບໍ່ລະບຸ', cusLivedSituation: cData.residenceStatus || 'ບໍ່ລະບຸ', cusOccupation: cData.occupation || 'ບໍ່ລະບຸ',

      cusCompanyName: wData.companyName || 'ບໍ່ລະບຸ', cusCompanyBusinessType: wData.businessType || 'ບໍ່ລະບຸ',
      cusCompanyLocation: formatAddr(wData.address), cusCompanyWorkYear: Number(wData.workYears) || 0, cusCompanyWorkMonth: Number(wData.workMonths) || 0,
      cusPosition: wData.position || 'ບໍ່ລະບຸ', cusIncome: Number(wData.salary) || 0,
      cusPayrollDate: String(wData.salaryDay || '0'), cusCompanyEmpNumber: Number(wData.totalEmployees) || 0,
      cusIncomeOther: Number(wData.otherIncome) || 0, cusIncomeOtherSource: wData.otherIncomeSource || 'ບໍ່ມີ',

      productDetail: pData.description || 'ບໍ່ລະບຸ', productBrand: pData.brand || '', productModel: pData.model || '',
      variant_id: Number(pData.variantId) || selectedDraft.value?.variant_id || null,
      product_color: pData.productColor || selectedDraft.value?.variant?.color || '',
      product_size: pData.productSize || selectedDraft.value?.variant?.size_or_capacity || '',

      productPrice: Number(pData.price) || 0, productDownPayment: Number(pData.downPayment) || 0,
      totalAmount: Number(pData.approvedAmount) || 0, interestRateAtApply: Number(pData.interestRate) || 0,
      loanPeriod: Number(pData.loanTerm) || 0, totalInterest: Number(pData.totalInterest) || 0,
      fee: Number(pData.fee) || 0, monthlyPay: Number(pData.monthlyPayment) || 0,
      firstInstallmentAmount: Number(pData.firstInstallment) || 0, paymentDay: Number(pData.paymentDay) || 1,

      ref_Type: refType,

      refName: hasGuarantorOrRef && gData.fullname ? gData.fullname : 'ບໍ່ມີ',
      refDateOfBirth: hasGuarantorOrRef && gData.dob ? gData.dob : null,
      refPhone: hasGuarantorOrRef && gData.phone ? gData.phone : 'ບໍ່ມີ',
      refSex: hasGuarantorOrRef && gData.gender ? gData.gender : 'ບໍ່ລະບຸ',
      refMaritalStatus: hasGuarantorOrRef && gData.maritalStatus ? gData.maritalStatus : 'ບໍ່ລະບຸ',
      refIdPassNumber: hasGuarantorOrRef && gData.idCard ? gData.idCard : 'ບໍ່ມີ',
      refIdPassDate: hasGuarantorOrRef && gData.idCardIssueDate ? gData.idCardIssueDate : null,
      refIdPassExpiryDate: hasGuarantorOrRef && gData.idCardExpiryDate ? gData.idCardExpiryDate : null,
      refCensusNumber: hasGuarantorOrRef && gData.censusBook ? gData.censusBook : 'ບໍ່ມີ',
      refCensusCreated: hasGuarantorOrRef && gData.censusBookIssueDate ? gData.censusBookIssueDate : null,
      refCensusAuthorizeBy: hasGuarantorOrRef && gData.censusAuthorizeBy ? gData.censusAuthorizeBy : 'ບໍ່ມີ',
      refHouseNumber: hasGuarantorOrRef && gData.houseNumber ? gData.houseNumber : 'ບໍ່ມີ',
      refUnit: hasGuarantorOrRef ? (Number(gData.unit) || 0) : 0,
      refAddress: hasGuarantorOrRef ? formatAddr(gData.address) : 'ບໍ່ມີ',
      refProvinceId: hasGuarantorOrRef ? (gData.address?.province_id || null) : null,
      refDistrictId: hasGuarantorOrRef ? (gData.address?.district_id || null) : null,
      refLivedYear: hasGuarantorOrRef ? (Number(gData.residenceYears) || 0) : 0,
      refLivedWith: hasGuarantorOrRef && gData.liveWith ? gData.liveWith : 'ບໍ່ມີ',
      refLivedSituation: hasGuarantorOrRef && gData.residenceStatus ? gData.residenceStatus : 'ບໍ່ມີ',
      refOccupation: hasGuarantorOrRef && gData.occupation ? gData.occupation : 'ບໍ່ມີ',
      refRelationship: hasGuarantorOrRef && gData.relationship ? gData.relationship : 'ບໍ່ມີ',

      refCompanyName: hasGuarantorOrRef && gwData.companyName ? gwData.companyName : 'ບໍ່ມີ',
      refCompanyBusinessType: hasGuarantorOrRef && gwData.businessType ? gwData.businessType : 'ບໍ່ມີ',
      refCompanyLocation: hasGuarantorOrRef ? formatAddr(gwData.address) : 'ບໍ່ມີ',
      refCompanyWorkYear: hasGuarantorOrRef ? (Number(gwData.workYears) || 0) : 0,
      refPosition: hasGuarantorOrRef && gwData.position ? gwData.position : 'ບໍ່ມີ',
      refIncome: hasGuarantorOrRef ? (Number(gwData.salary) || 0) : 0,
      refPayrollDate: hasGuarantorOrRef && gwData.salaryDay ? String(gwData.salaryDay) : '0',
      refCompanyEmpNumber: hasGuarantorOrRef ? (Number(gwData.totalEmployees) || 0) : 0,
      refIncomeOther: hasGuarantorOrRef ? (Number(gwData.otherIncome) || 0) : 0,
      refIncomeOtherSource: hasGuarantorOrRef && gwData.otherIncomeSource ? gwData.otherIncomeSource : 'ບໍ່ມີ',

      motorId: pData.motorcycle?.motorId || '', tankNumber: pData.motorcycle?.tankNumber || '',
      motorColor: pData.motorcycle?.motorColor || '', motorWarranty: Number(pData.motorcycle?.motorWarranty) || 0,
      shopId: sData.code || '', shopBranch: sData.branch || '',
      producttypeId: selectedDraft.value.product?.productType_id || null
    };

    await loanContractStore.createContract(loanId, flatContractPayload);

    customAlert.success('ບັນທຶກຂໍ້ມູນສັນຍາ ແລະ ໃບສະເໜີສຳເລັດ!');
    isEditingInModal.value = false;

    selectedContract.value = await loanContractStore.fetchContract(loanId);
    emit('refresh');

  } catch (error: any) {
    console.error("Save Contract Error: ", error);
    customAlert.error('ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກສັນຍາ', error.response?.data?.message || error.message || 'ກະລຸນາລອງໃໝ່');
  } finally {
    isSaving.value = false;
  }
}

const calculateModalMonthlyPayment = (): number => {
  const { total_amount, down_payment, interest_rate, loan_period, interest_type, interest_rate_type } = modalDraftForm
  const principal = Math.max(0, total_amount - (down_payment || 0))
  if (!principal || !interest_rate || !loan_period) return 0
  const rate = interest_rate_type === 'yearly' ? (interest_rate / 12) / 100 : interest_rate / 100
  let pmt = 0
  if (interest_type === 'flat_rate') pmt = (principal / loan_period) + (principal * rate)
  else pmt = rate > 0 ? (principal * rate * Math.pow(1 + rate, loan_period)) / (Math.pow(1 + rate, loan_period) - 1) : principal / loan_period
  return Math.round(pmt)
}

const handleModalCurrencyInput = (field: keyof typeof modalDraftForm, e: Event) => {
  const target = e.target as HTMLInputElement;
  const raw = target.value.replace(/,/g, '');
  // @ts-ignore
  modalDraftForm[field] = Number(raw) || 0;
  target.value = formatCurrencyInput(Number(modalDraftForm[field]));
}
const handleModalPriceInput = (e: Event) => { handleModalCurrencyInput('total_amount', e); modalDraftForm.monthly_payment = calculateModalMonthlyPayment() }
const handleModalDownPaymentInput = (e: Event) => { handleModalCurrencyInput('down_payment', e); modalDraftForm.monthly_payment = calculateModalMonthlyPayment() }

const getInterestRateByTerm = (months: number): number => {
  if (!months || months <= 6) return 2.50;
  if (months <= 12) return 2.00;
  if (months <= 18) return 1.89;
  if (months <= 24) return 1.75;
  return 1.69;
}

const handleModalTermChange = () => {
  modalDraftForm.interest_rate = getInterestRateByTerm(modalDraftForm.loan_period);
}

watch(() => [modalDraftForm.total_amount, modalDraftForm.down_payment, modalDraftForm.interest_rate, modalDraftForm.loan_period], () => {
  modalDraftForm.monthly_payment = calculateModalMonthlyPayment()
})

const handleShopChange = async () => {
  clearModalProductSelection()
  if (modalShopId.value) await productStore.fetchProducts({ shop_id: modalShopId.value, limit: 100 })
}

const filteredModalProducts = computed(() => {
  if (!modalProductSearch.value) return productStore.products
  return productStore.products.filter(p => p.product_name.toLowerCase().includes(modalProductSearch.value.toLowerCase()))
})

const selectModalProduct = async (product: any) => {
  selectedModalProduct.value = product;
  modalProductSearch.value = product.product_name;
  showModalProductDropdown.value = false;

  await loadVariantsForEdit(product.id);

  if (modalProductVariants.value.length === 0) {
    modalDraftForm.total_amount = product.price;
  } else {
    modalDraftForm.total_amount = 0;
  }

  modalDraftForm.loan_period = product.term || 12;
  handleModalTermChange();
}

const selectModalVariant = (variant: any) => {
  modalSelectedVariant.value = variant;
  modalDraftForm.total_amount = variant.price;
}

const clearModalProductSelection = () => {
  selectedModalProduct.value = null;
  modalProductSearch.value = '';
  modalSelectedVariant.value = null;
  modalProductVariants.value = [];
}

let modalProductSearchTimer: any = null
const debounceModalProductSearch = () => { clearTimeout(modalProductSearchTimer); modalProductSearchTimer = setTimeout(() => { }, 300) }
const handleModalProductBlur = () => setTimeout(() => showModalProductDropdown.value = false, 200)

const handleDocumentUpload = async (typeId: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files || files.length === 0) return;

  const category = allDocumentCategories.value.find(c => c.id === typeId);
  if (!category) return;

  for (let i = 0; i < files.length; i++) {
    const currentFile = files[i];
    if (!currentFile) continue;

    if (currentFile.size > 8 * 1024 * 1024) {
      customAlert.error('ໄຟລ໌ໃຫຍ່ເກີນໄປ', `ໄຟລ໌ ${currentFile.name} ໃຫຍ່ເກີນໄປ (ເກີນ 8MB)`);
      continue;
    }

    let finalFile: File = currentFile;

    if (finalFile.type.startsWith('image/')) {
      try {
        const compressedBlob = await imageCompression(currentFile, {
          maxSizeMB: 3, maxWidthOrHeight: 1920, useWebWorker: true
        });
        finalFile = new File([compressedBlob], currentFile.name, {
          type: compressedBlob.type, lastModified: Date.now()
        });
      } catch (error) {
        console.error('Compress error:', error);
        if (finalFile.size > 3 * 1024 * 1024) continue;
      }
    }

    const isPdf = finalFile.type === 'application/pdf';

    const reader = new FileReader();
    reader.onload = (e) => {
      category.files.push({
        file: finalFile,
        preview: (e.target?.result as string) || '',
        isPdf: isPdf,
        name: finalFile.name
      });
    };
    reader.readAsDataURL(finalFile);
  }
  target.value = '';
}

const removeDocument = (typeId: string, fileIndex: number) => {
  const category = allDocumentCategories.value.find(c => c.id === typeId);
  if (category && category.files[fileIndex]) {
    const targetFile = category.files[fileIndex];
    if (targetFile.id) {
      if (confirm('ທ່ານຕ້ອງການລຶບເອກະສານນີ້ອອກຈາກລະບົບແທ້ບໍ່?')) {
        category.files.splice(fileIndex, 1);
      }
    } else {
      category.files.splice(fileIndex, 1);
    }
  }
}

const loadCustomerLocations = async (customerId: number) => {
  const { getCustomerLocations } = await import('@/api/customer')
  customerLocations.value = (await getCustomerLocations(customerId)).data || []
}
const handleAddLocation = async (data: any) => { const { createCustomerLocation } = await import('@/api/customer'); await createCustomerLocation(data.customer_id, data); loadCustomerLocations(data.customer_id) }
const handleUpdateLocation = async (id: number, data: any) => { const { updateCustomerLocation } = await import('@/api/customer'); await updateCustomerLocation(id, data); loadCustomerLocations(selectedDraft.value.customer_id) }
const handleDeleteLocation = async (id: number) => { const { deleteCustomerLocation } = await import('@/api/customer'); await deleteCustomerLocation(id); loadCustomerLocations(selectedDraft.value.customer_id) }
const handleSetPrimary = async (id: number) => { const { updateCustomerLocation } = await import('@/api/customer'); await updateCustomerLocation(id, { is_primary: 1 }); loadCustomerLocations(selectedDraft.value.customer_id) }
</script>

<style scoped>
.address-grid-custom {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  align-items: center;
}

.input-sub {
  display: flex;
  align-items: center;
  gap: 5px;
}

.input-sub span {
  font-size: 12px;
  white-space: nowrap;
  color: #666;
}

.select-addr {
  width: 100%;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 13px;
  background-color: white;
}

.select-addr:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .address-grid-custom {
    grid-template-columns: 1fr;
  }
}
</style>
