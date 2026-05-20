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

        <div class="tabs tabs-boxed mb-6 flex-wrap gap-1">
          <button class="tab" :class="{ 'tab-active': activeTab === 'details' }" @click="activeTab = 'details'">
            ລາຍລະອຽດໄວ
          </button>
          <button class="tab" :class="{ 'tab-active': activeTab === 'loanContract' }"
            @click="activeTab = 'loanContract'">
            <span class="icon-[tabler--file-invoice] size-4 mr-1"></span> ແບບຟອມ & ສັນຍາກູ້ຢືມ
          </button>
          <button class="tab" :class="{ 'tab-active': activeTab === 'documents' }" @click="activeTab = 'documents'">
            <span class="icon-[tabler--files] size-4 mr-1"></span> ເອກະສານແນບ
          </button>
          <button class="tab" :class="{ 'tab-active': activeTab === 'map' }" @click="activeTab = 'map'">
            <span class="icon-[tabler--map] size-4 mr-1"></span> ແຜນທີ່
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
                <div class="md:col-span-2">
                  <label class="text-sm font-medium text-gray-500">ທີ່ຢູ່</label>
                  <p>{{ getDraftAddress(selectedDraft) }}</p>
                </div>
                <div v-if="selectedDraft.customer.income_per_month">
                  <label class="text-sm font-medium text-gray-500">ລາຍຮັບ</label>
                  <p class="text-success">{{ formatPrice(selectedDraft.customer.income_per_month) }}</p>
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
                      {{ selectedDraft.variant.color || 'ບໍ່ລະບຸ' }} / {{ selectedDraft.variant.size_or_capacity || selectedDraft.variant.size || 'ບໍ່ລະບຸ' }}
                    </span>
                  </p>
                </div>
                <div v-else>
                  <label class="text-sm font-medium text-gray-500">ສີ / ຂະໜາດ</label>
                  <p class="text-gray-400 text-sm">ບໍ່ມີຕົວເລືອກຍ່ອຍ</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ລາຄາສິນຄ້າຕົວຈິງ</label>
                  <p class="font-medium text-primary">{{ formatPrice(selectedDraft?.total_amount || selectedDraft.product.price) }}</p>
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
                    <label v-if="modalFormErrors.customer_name" class="label text-error pb-0 pt-1">
                      <span class="label-text-alt">{{ modalFormErrors.customer_name }}</span>
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ເບີໂທລະສັບ *</span></label>
                    <input v-model="modalDraftForm.customer_phone" type="tel"
                      class="input input-sm input-bordered w-full bg-white"
                      :class="{ 'input-error': modalFormErrors.customer_phone }" required />
                    <label v-if="modalFormErrors.customer_phone" class="label text-error pb-0 pt-1">
                      <span class="label-text-alt">{{ modalFormErrors.customer_phone }}</span>
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ເລກບັດປະຈຳຕົວ *</span></label>
                    <input v-model="modalDraftForm.customer_id_card" type="text"
                      class="input input-sm input-bordered w-full bg-white"
                      :class="{ 'input-error': modalFormErrors.customer_id_card }" required />
                    <label v-if="modalFormErrors.customer_id_card" class="label text-error pb-0 pt-1">
                      <span class="label-text-alt">{{ modalFormErrors.customer_id_card }}</span>
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ອາຍຸ *</span></label>
                    <input v-model.number="modalDraftForm.age" type="number"
                      class="input input-sm input-bordered w-full bg-white" min="0" />
                    <label v-if="modalFormErrors.age" class="label text-error pb-0 pt-1">
                      <span class="label-text-alt">{{ modalFormErrors.age }}</span>
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ອາຊີບ *</span></label>
                    <input v-model="modalDraftForm.occupation" type="text"
                      class="input input-sm input-bordered w-full bg-white"
                      :class="{ 'input-error': modalFormErrors.occupation }" required />
                    <label v-if="modalFormErrors.occupation" class="label text-error pb-0 pt-1">
                      <span class="label-text-alt">{{ modalFormErrors.occupation }}</span>
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ລາຍຮັບຕໍ່ເດືອນ *</span></label>
                    <input type="text" :value="formatCurrencyInput(modalDraftForm.income_per_month)"
                      @input="handleModalCurrencyInput('income_per_month', $event)"
                      class="input input-sm input-bordered w-full bg-white text-success font-medium"
                      :class="{ 'input-error': modalFormErrors.income_per_month }" />
                    <label v-if="modalFormErrors.income_per_month" class="label text-error pb-0 pt-1">
                      <span class="label-text-alt">{{ modalFormErrors.income_per_month }}</span>
                    </label>
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
                <span class="icon-[tabler--building-store] size-5 text-primary"></span>
                ເລືອກຮ້ານຄ້າ ແລະ ສິນຄ້າ
              </h4>

              <div class="form-control mb-4">
                <label class="label"><span class="label-text font-medium">ຮ້ານຄ້າ / ຕົວແທນ *</span></label>
                <select v-model="modalShopId" class="select select-sm select-bordered w-full" @change="handleShopChange"
                  required>
                  <option :value="null" disabled>-- ກະລຸນາເລືອກຮ້ານຄ້າ --</option>
                  <option v-for="shop in shopsList" :key="shop.id" :value="shop.id">
                    {{ shop.shop_name }}
                  </option>
                </select>
              </div>

              <div class="form-control mb-4">
                <label class="label">
                  <span class="label-text font-medium" :class="{ 'text-gray-400': !modalShopId }">ສິນຄ້າ *</span>
                  <span v-if="!modalShopId" class="text-xs text-error">ກະລຸນາເລືອກຮ້ານຄ້າກ່ອນ</span>
                </label>

                <div class="relative">
                  <input v-model="modalProductSearch" type="text" placeholder="ພິມຊື່ສິນຄ້າ ຫຼື ລະຫັດ…"
                    class="input input-sm input-bordered w-full pl-10 pr-10" :disabled="!modalShopId"
                    @input="debounceModalProductSearch" @focus="showModalProductDropdown = true"
                    @blur="handleModalProductBlur" />

                  <span
                    class="icon-[tabler--search] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4"></span>

                  <button type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    :disabled="!selectedModalProduct" @click="clearModalProductSelection">
                    <span class="icon-[tabler--x] size-4"></span>
                  </button>

                  <div v-if="showModalProductDropdown && filteredModalProducts.length > 0"
                    class="absolute left-0 right-0 z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div v-for="product in filteredModalProducts" :key="product.id"
                      class="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3"
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

              <div v-if="selectedModalProduct" class="form-control mb-4 border border-gray-200 dark:border-gray-700 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <label class="label pt-0">
                  <span class="label-text font-medium text-gray-800 dark:text-white">ເລືອກ ສີ / ຂະໜາດ <span v-if="modalProductVariants.length > 0">*</span></span>
                </label>
                
                <div v-if="isModalLoadingVariants" class="text-sm text-gray-500 flex items-center gap-2">
                  <span class="loading loading-spinner loading-xs"></span> ກຳລັງໂຫຼດຕົວເລືອກຍ່ອຍ...
                </div>
                
                <div v-else-if="modalProductVariants.length === 0" class="text-sm text-gray-500 flex items-center gap-2">
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
                <span class="icon-[tabler--file-invoice] size-5 text-primary"></span>
                ລາຍລະອຽດສິນເຊື່ອ
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                  <label class="label"><span class="label-text font-medium">ລາຄາສິນຄ້າ *</span></label>
                  <input type="text" :value="formatCurrencyInput(modalDraftForm.total_amount)"
                    @input="handleModalPriceInput" class="input input-sm input-bordered w-full font-bold text-primary"
                    :class="{ 'input-error': modalFormErrors.total_amount }" required placeholder="ປ້ອນລາຄາສິນຄ້າ" />
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">ຈຳນວນເງິນດາວ
                      <span v-if="modalDraftForm.total_amount > 0" class="text-xs text-gray-500">
                        ຍອດຈັດ: {{ formatPrice(Math.max(0, modalDraftForm.total_amount - (modalDraftForm.down_payment || 0))) }}
                      </span>
                    </span>
                  </label>
                  <input type="text" :value="formatCurrencyInput(modalDraftForm.down_payment)"
                    @input="handleModalDownPaymentInput" class="input input-sm input-bordered w-full"
                    :class="{ 'input-error': modalFormErrors.down_payment }" placeholder="ປ້ອນເງິນດາວ" />
                </div>

                <div class="form-control">
                  <label class="label"><span class="label-text font-medium">ໄລຍະເວລາ (ເດືອນ) *</span></label>
                  <select v-model.number="modalDraftForm.loan_period" class="select select-sm select-bordered w-full"
                    :class="{ 'select-error': modalFormErrors.loan_period }" required @change="handleModalTermChange">
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
                    class="input input-sm input-bordered w-full bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    :class="{ 'input-error': modalFormErrors.interest_rate }" min="0" max="100" step="0.01" readonly
                    required />
                </div>

                <div class="form-control">
                  <label class="label"><span class="label-text font-medium">ປະເພດດອກເບ້ຍ *</span></label>
                  <select v-model="modalDraftForm.interest_type"
                    @change="modalDraftForm.monthly_payment = calculateModalMonthlyPayment()"
                    class="select select-sm select-bordered w-full bg-base-50">
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
            <div v-if="!isEditingInModal" class="space-y-6">
                <div v-if="!loanApplicationStore.currentDocuments || loanApplicationStore.currentDocuments.length === 0"
                  class="text-center py-12 text-gray-500">
                  <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span class="icon-[tabler--file-off] size-8 text-gray-400"></span>
                  </div>
                  <p class="text-lg font-medium">ບໍ່ມີເອກະສານແນບ</p>
                  <p class="text-sm text-gray-500 mt-1">ຍັງບໍ່ມີເອກະສານທີ່ອັບໂຫຼດສຳລັບສິນເຊື່ອນີ້</p>
                </div>

                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div v-for="doc in sortedCurrentDocuments" :key="doc.id"
                    class="border rounded-lg p-4 flex flex-col gap-3 bg-white dark:bg-gray-800 overflow-hidden">
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
                        <a :href="getFullImageUrl(doc.file_url) || '#'" target="_blank"
                          class="btn btn-xs btn-ghost text-info hover:bg-info/10" title="ເບິ່ງເອກະສານ"
                          @click.prevent="openInNewTab(getFullImageUrl(doc.file_url))">
                          <span class="icon-[tabler--eye] size-4 mr-1"></span> ເບິ່ງ
                        </a>
                        <a :href="getFullImageUrl(doc.file_url) || '#'" target="_blank" download
                          class="btn btn-xs btn-ghost text-primary hover:bg-primary/10" title="ດາວໂຫຼດ">
                          <span class="icon-[tabler--download] size-4 mr-1"></span> ໂຫຼດ
                        </a>
                      </div>
                    </div>
                    <div class="mt-2">
                      <div v-if="isImage(doc.file_url)"
                        class="aspect-video bg-gray-100 dark:bg-gray-700 rounded overflow-hidden cursor-pointer"
                        @click="openInNewTab(getFullImageUrl(doc.file_url))">
                        <img :src="getFullImageUrl(doc.file_url) || ''" alt="Document preview"
                          class="w-full h-full object-contain p-2 hover:scale-105 transition-transform" />
                      </div>
                      <div v-else
                        class="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center cursor-pointer hover:bg-gray-200 transition"
                        @click="openInNewTab(getFullImageUrl(doc.file_url))">
                        <div class="text-center">
                          <span class="icon-[tabler--file-description] size-12 text-gray-400"></span>
                          <p class="text-xs text-gray-500 mt-2">ຄລິກເພື່ອເບິ່ງ PDF</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            </div>

            <div v-else class="space-y-6">
                <div>
                  <h4 class="font-medium mb-3 text-lg flex items-center gap-2">
                    <span class="icon-[tabler--file-check] size-5 text-error"></span> ເອກະສານທີ່ຕ້ອງການ
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-for="(doc, index) in draftDocuments" :key="index"
                      class="border-2 border-dashed rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                      <div class="flex items-center justify-between mb-3">
                        <div>
                          <h5 class="font-medium">{{ doc.name }}</h5>
                          <p class="text-xs text-gray-500 mt-1">{{ doc.description }}</p>
                        </div>
                        <span class="badge badge-soft badge-error text-xs">ຕ້ອງການ</span>
                      </div>
                      <div v-if="doc.preview" class="mt-3 relative w-full h-40 bg-gray-200 rounded overflow-hidden">
                        <img v-if="isImage(doc.preview!)" :src="getFullImageUrl(doc.preview!) || ''"
                          class="w-full h-full object-contain p-2" />
                        <button type="button"
                          class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600"
                          @click="removeDocument(index, 'req')" title="ລຶບເພື່ອອັບໂຫຼດໃໝ່">
                          <span class="icon-[tabler--x] size-4"></span>
                        </button>
                        <div class="absolute bottom-2 left-2 pointer-events-none">
                          <span v-if="doc.file" class="badge badge-success badge-sm shadow-sm text-white">ໄຟລ໌ໃໝ່</span>
                          <span v-else class="badge badge-neutral badge-sm shadow-sm">ໄຟລ໌ເດີມໃນລະບົບ</span>
                        </div>
                      </div>
                      <div v-else class="mt-3">
                        <label
                          class="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-100 transition">
                          <span class="icon-[tabler--upload] size-8 text-gray-400 mb-2"></span>
                          <p class="text-sm text-gray-600">ຄລິກເພື່ອອັບໂຫຼດ</p>
                          <input type="file" class="hidden" accept="image/*,.pdf"
                            @change="(event) => handleDocumentUpload(index, event, 'req')" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mt-8">
                  <h4 class="font-medium mb-3 text-lg flex items-center gap-2">
                    <span class="icon-[tabler--file-plus] size-5 text-primary"></span> ເອກະສານເພີ່ມເຕີມ (ບໍ່ບັງຄັບ)
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-for="(doc, index) in optionalDocuments" :key="index"
                      class="border-2 border-dashed rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                      <div class="flex items-center justify-between mb-3">
                        <div>
                          <h5 class="font-medium">{{ doc.name }}</h5>
                          <p class="text-xs text-gray-500 mt-1">{{ doc.description }}</p>
                        </div>
                      </div>
                      <div v-if="doc.preview" class="mt-3 relative w-full h-40 bg-gray-200 rounded overflow-hidden">
                        <img v-if="isImage(doc.preview!)" :src="getFullImageUrl(doc.preview!) || ''"
                          class="w-full h-full object-contain p-2" />
                        <button type="button"
                          class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600"
                          @click="removeDocument(index, 'opt')" title="ລຶບເພື່ອອັບໂຫຼດໃໝ່">
                          <span class="icon-[tabler--x] size-4"></span>
                        </button>
                        <div class="absolute bottom-2 left-2 pointer-events-none">
                          <span v-if="doc.file" class="badge badge-success badge-sm shadow-sm text-white">ໄຟລ໌ໃໝ່</span>
                          <span v-else class="badge badge-neutral badge-sm shadow-sm">ໄຟລ໌ເດີມໃນລະບົບ</span>
                        </div>
                      </div>
                      <div v-else class="mt-3">
                        <label
                          class="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-100 transition">
                          <span class="icon-[tabler--upload] size-8 text-gray-400 mb-2"></span>
                          <p class="text-sm text-gray-600">ຄລິກເພື່ອອັບໂຫຼດ</p>
                          <input type="file" class="hidden" accept="image/*,.pdf"
                            @change="(event) => handleDocumentUpload(index, event, 'opt')" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="isUploadingDocuments" class="mt-4 p-3 bg-info/10 rounded-lg text-center">
                  <div class="loading loading-spinner loading-sm inline-block mr-2"></div>
                  <span>ກຳລັງອັບໂຫຼດເອກະສານ...</span>
                </div>
            </div>
        </div>

        <div v-else-if="activeTab === 'map'" class="space-y-6">
          <CustomerLocationMap :customer-id="selectedDraft?.customer_id || 0" :locations="customerLocations"
            :google-maps-api-key="''" :is-loading="isLocationLoading" :can-add-location="true" :can-edit-location="true"
            :can-delete-location="true" :can-set-primary="true" @add-location="handleAddLocation"
            @update-location="handleUpdateLocation" @delete-location="handleDeleteLocation"
            @set-primary="handleSetPrimary" />
        </div>

        <div class="flex justify-end gap-3 mt-6 border-t pt-6">
          <button class="btn btn-soft btn-secondary" @click="closeModal">
            {{ isEditingInModal ? 'ຍົກເລີກ' : 'ປິດ' }}
          </button>

          <button v-if="!isEditingInModal && (activeTab === 'details' || activeTab === 'documents')"
            class="btn btn-primary" @click="startEditInModal">
            <span class="icon-[tabler--edit] size-4 mr-1"></span> ແກ້ໄຂ
          </button>

          <button v-else-if="isEditingInModal && (activeTab === 'details' || activeTab === 'documents')"
            class="btn btn-success text-white" @click="saveDraftFromModal" :disabled="isSaving || (modalProductVariants.length > 0 && !modalSelectedVariant)">
            <span v-if="isSaving" class="loading loading-spinner loading-xs"></span>
            <span v-else class="icon-[tabler--device-floppy] size-4 mr-1"></span>
            <span v-if="!isSaving">ບັນທຶກການປ່ຽນແປງ</span>
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
import { LoanApplicationStatus } from '@/types/loanApplication'
import type { CustomerLocation } from '@/types/customer'
import { formatPrice, formatCurrencyInput, getDocumentTypeName } from '@/utils/formatters'
import { getFullImageUrl } from '@/utils/url'
import { alert } from '@/utils/alert'

import CustomerLocationMap from '@/components/loans/form/CustomerLocationMap.vue'
import LoanContractForm from '@/components/loans/form/LoanContractForm.vue'

const props = defineProps<{ show: boolean, draftId: number | null }>()
const emit = defineEmits(['close', 'refresh'])

const loanApplicationStore = useLoanApplicationStore()
const productStore = useProductStore()
const loanContractStore = useLoanContractStore()
const shopStore = useShopStore()
const addressStore = useAddressStore()

const activeTab = ref<'details' | 'documents' | 'map' | 'loanContract'>('details')
const isEditingInModal = ref(false)
const isSaving = ref(false)
const isUploadingDocuments = ref(false)

const selectedDraft = ref<any | null>(null)
const selectedContract = ref<any | null>(null)

// 🟢 Product & Variant Selection states
const modalShopId = ref<number | null>(null)
const modalProductSearch = ref('')
const showModalProductDropdown = ref(false)
const selectedModalProduct = ref<any | null>(null)
const shopsList = computed(() => shopStore.shops)

const modalProductVariants = ref<any[]>([])
const modalSelectedVariant = ref<any | null>(null)
const isModalLoadingVariants = ref(false)

// Map states
const customerLocations = ref<CustomerLocation[]>([])
const isLocationLoading = ref(false)

// Form Data
const modalDraftForm = reactive({
  customer_name: '', customer_phone: '', customer_id_card: '', customer_address: '', occupation: '', age: 0,
  province_id: '', district_id: '',
  product_name: '', product_type: '', total_amount: 0, down_payment: 0, interest_rate: 0, loan_period: 0,
  monthly_payment: 0, income_per_month: 0, other_debts: 0, interest_type: 'flat_rate', interest_rate_type: 'monthly'
})

const modalFormErrors = reactive({
  customer_name: '', customer_phone: '', customer_id_card: '', customer_address: '', occupation: '', age: '',
  province_id: '', district_id: '', total_amount: '', down_payment: '', interest_rate: '', loan_period: '', income_per_month: ''
})

// Document Arrays
interface Document { id: string, name: string, description: string, required: boolean, file: File | null, preview: string | null }
const draftDocuments = ref<Document[]>([
  { id: 'id_card', name: 'ບັດປະຈຳຕົວ', description: 'ຮູບຖ່າຍບັດປະຈຳຕົວທັງໜ້າ-ຫຼັງ', required: true, file: null, preview: null },
  { id: 'house_reg', name: 'ໃບຄອບຄົວ', description: 'ໃບຄອບຄົວຫຼືເອກະສານຢືນຢັນທີ່ຢູ່', required: true, file: null, preview: null }
])
const optionalDocuments = ref<Document[]>([
  { id: 'salary_slip', name: 'ຫຼັກຖານລາຍຮັບ', description: 'ໃບເງິນເດືອນ ຫຼື ໃບຮັບລາຍຮັບ', required: false, file: null, preview: null },
  { id: 'other', name: 'ເອກະສານອື່ນໆ', description: 'ເອກະສານອື່ນໆທີ່ກ່ຽວຂ້ອງ', required: false, file: null, preview: null }
])

const openInNewTab = (url: string | null | undefined) => {
  if (url) window.open(url, '_blank');
};

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
      await loanApplicationStore.fetchDocuments(props.draftId)
      try { selectedContract.value = await loanContractStore.fetchContract(props.draftId) } catch (e) { }
      if (selectedDraft.value.customer_id) await loadCustomerLocations(selectedDraft.value.customer_id)
      activeTab.value = 'details'
      isEditingInModal.value = false
    } catch (error) {
      alert.error('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຮ່າງສິນເຊື່ອໄດ້.')
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
const openPrintTab = (tabName: 'loanContract') => { activeTab.value = tabName; }

const sortedCurrentDocuments = computed(() => {
  const docs = loanApplicationStore.currentDocuments || [];
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
});

const handleProvinceChange = async () => {
  modalDraftForm.district_id = '';
  if (modalDraftForm.province_id) await addressStore.fetchDistricts(modalDraftForm.province_id);
  else addressStore.districts = [];
};

// 🟢 ໂຫຼດຂໍ້ມູນ Variant ເມື່ອກົດປຸ່ມແກ້ໄຂ
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
        
        // 🟢 ດຶງຂໍ້ມູນ Variants ຂອງສິນຄ້າເກົ່າມາສະແດງພ້ອມ
        await loadVariantsForEdit(currentProduct.id, draftData.variant_id);
      }
    }
  }

  modalDraftForm.customer_name = getDraftDisplayName(draftData)
  modalDraftForm.customer_phone = getDraftPhone(draftData)
  modalDraftForm.customer_id_card = draftData.customer?.identity_number || ''
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

  draftDocuments.value.forEach(doc => { doc.file = null; doc.preview = null })
  optionalDocuments.value.forEach(doc => { doc.file = null; doc.preview = null })

  if (loanApplicationStore.currentDocuments && loanApplicationStore.currentDocuments.length > 0) {
    loanApplicationStore.currentDocuments.forEach(serverDoc => {
      const docType = serverDoc.document_type || serverDoc.doc_type
      const reqDoc = draftDocuments.value.find(d => d.id === docType)
      const optDoc = optionalDocuments.value.find(d => d.id === docType)
      if (reqDoc && serverDoc.file_url) reqDoc.preview = serverDoc.file_url
      if (optDoc && serverDoc.file_url) optDoc.preview = serverDoc.file_url
    })
  }

  isEditingInModal.value = true
}

const saveDraftFromModal = async () => {
  // ກວດສອບກ່ອນບັນທຶກວ່າເລືອກ Variant ແລ້ວຫຼືບໍ່ (ຖ້າມີ)
  if (modalProductVariants.value.length > 0 && !modalSelectedVariant.value) {
      alert.error('ກະລຸນາເລືອກ ສີ/ຂະໜາດ ຂອງສິນຄ້າກ່ອນບັນທຶກ');
      return;
  }

  isSaving.value = true
  try {
    const nameParts = modalDraftForm.customer_name.trim().split(' ')
    const firstName = nameParts[0] || modalDraftForm.customer_name
    const lastName = nameParts.slice(1).join(' ') || ''

    const updateData = {
      product_id: selectedModalProduct.value?.id || selectedDraft.value.product_id,
      variant_id: modalSelectedVariant.value?.id || null, // 🟢 ສົ່ງ Variant ໄປອັບເດດນຳ
      customer_id: selectedDraft.value?.customer_id,
      first_name: firstName, last_name: lastName,
      phone: modalDraftForm.customer_phone, identity_number: modalDraftForm.customer_id_card,
      address: modalDraftForm.customer_address, province_id: modalDraftForm.province_id, district_id: modalDraftForm.district_id,
      age: Number(modalDraftForm.age), occupation: modalDraftForm.occupation,
      income_per_month: modalDraftForm.income_per_month,
      total_amount: Number(modalDraftForm.total_amount), down_payment: Number(modalDraftForm.down_payment),
      loan_period: Number(modalDraftForm.loan_period), interest_rate_at_apply: Number(modalDraftForm.interest_rate),
      monthly_pay: Number(modalDraftForm.monthly_payment),
      interest_type: modalDraftForm.interest_type, interest_rate_type: modalDraftForm.interest_rate_type
    }

    await loanApplicationStore.updateDraftLoanApplication(selectedDraft.value.id, updateData)

    const newDocs = [...draftDocuments.value, ...optionalDocuments.value].filter(d => d.file)
    if (newDocs.length > 0) {
      isUploadingDocuments.value = true
      for (const doc of newDocs) await loanApplicationStore.uploadDocument(selectedDraft.value.customer_id, doc.file!, doc.id)
      await loanApplicationStore.fetchDocuments(selectedDraft.value.id)
      isUploadingDocuments.value = false
    }
    // 🟢 3. ສຳຄັນທີ່ສຸດ: ດຶງຂໍ້ມູນໃໝ່ຈາກ API ມາທັບຂໍ້ມູນເກົ່າ
    selectedDraft.value = await loanApplicationStore.fetchLoanApplicationById(selectedDraft.value.id)

    isEditingInModal.value = false
    alert.success('ບັນທຶກສຳເລັດ!')
    
    emit('refresh')
  } catch (error: any) { alert.error('ເກີດຂໍ້ຜິດພາດ', error.message) } finally { isSaving.value = false }
}

const handleSaveContract = async (customerId: number, formData: any) => {
  if (!selectedDraft.value) return;
  isSaving.value = true;

  try {
    const loanId = selectedDraft.value.id;

    // ແຍກຂໍ້ມູນເພື່ອໃຫ້ອ່ານງ່າຍ
    const cData = formData?.customer || {};
    const wData = formData?.work || {};
    const gData = formData?.guarantor || {};
    const gwData = formData?.guarantorWork || {};
    const pData = formData?.product || {};
    const sData = formData?.shop || {};

    const fullNameString = String(cData.fullname || '').trim();
    const nameParts = fullNameString ? fullNameString.split(' ') : [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // 1. ອັບເດດຂໍ້ມູນ Loan Application (ໃບຄຳຂໍ)
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

      // 🟢 1. ເພີ່ມ variant_id ເຂົ້າໃບຄຳຂໍ (ອ້າງອີງຈາກຂໍ້ມູນຫຼ້າສຸດໃນໃບຄຳຂໍ ຫຼື ຈາກຟອມສັນຍາ)
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

    // 2. Proposal Data (ໃບສະເໜີປ່ອຍສິນຄ້າ)
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

      name: gData.fullname || '',
      identity_number: gData.idCard || '',
      GuarantorDOB: gData.dob || '',
      GuarantorAGE: gData.age || null,
      Guarantorprovince_id: gData.address?.province_id || null,
      Guarantordistrict_id: gData.address?.district_id || null,
      Guarantoraddress: gData.address?.village || '',
      Guarantorphone: gData.phone || '',
      occupation: gData.occupation || '',
      relationship: gData.relationship || '',

      work_company_name: gwData.companyName || '',
      work_phone: gwData.phone || '',
      work_location: gwData.address?.village || '',
      work_province_id: gwData.address?.province_id || null,
      work_district_id: gwData.address?.district_id || null,
      work_position: gwData.position || '',
      work_salary: String(gwData.salary || '0')
    };

    const { saveCustProposal } = await import('@/api/proposal');
    await saveCustProposal(customerId, loanId, proposalData);

    // 3. Flat Contract Payload (ຂໍ້ມູນສັນຍາກູ້ຢືມຕົວຈິງ)
    const formatAddr = (addr: any) => addr ? [addr.village, addr.district, addr.province].filter(Boolean).join(', ') : 'ບໍ່ລະບຸ';

    const flatContractPayload = {
      loanId: loanId,
      cusFullName: cData.fullname || 'ບໍ່ລະບຸ',
      cusSex: cData.gender || 'ບໍ່ລະບຸ',
      cusDateOfBirth: cData.dob || new Date().toISOString().split('T')[0],
      cusPhone: cData.phone || 'ບໍ່ລະບຸ',
      cusMaritalStatus: cData.maritalStatus || 'ບໍ່ລະບຸ',
      cusIdPassNumber: cData.idCard || 'ບໍ່ລະບຸ',
      cusIdPassDate: cData.idCardIssueDate || new Date().toISOString().split('T')[0],
      cusCensusNumber: cData.censusBook || 'ບໍ່ມີ',
      cusCensusCreated: cData.idCardExpiryDate || new Date().toISOString().split('T')[0],
      cusCensusAuthorizeBy: cData.censusAuthorizeBy || 'ບໍ່ລະບຸ',
      cusHouseNumber: cData.houseNumber || 'ບໍ່ລະບຸ',
      cusUnit: Number(cData.unit) || 0,
      cusAddress: formatAddr(cData.address),
      cusProvinceId: cData.address?.province_id || null,
      cusDistrictId: cData.address?.district_id || null,
      cusLivedYear: Number(cData.residenceYears) || 0,
      cusLivedWith: cData.liveWith || 'ບໍ່ລະບຸ',
      cusLivedSituation: cData.residenceStatus || 'ບໍ່ລະບຸ',
      cusOccupation: cData.occupation || 'ບໍ່ລະບຸ',

      cusCompanyName: wData.companyName || 'ບໍ່ລະບຸ',
      cusCompanyBusinessType: wData.businessType || 'ບໍ່ລະບຸ',
      cusCompanyLocation: formatAddr(wData.address),
      cusCompanyWorkYear: Number(wData.workYears) || 0,
      cusPosition: wData.position || 'ບໍ່ລະບຸ',
      cusIncome: Number(wData.salary) || 0,
      cusPayrollDate: String(wData.salaryDay || '0'),
      cusCompanyEmpNumber: Number(wData.totalEmployees) || 0,
      cusIncomeOther: Number(wData.otherIncome) || 0,
      cusIncomeOtherSource: wData.otherIncomeSource || 'ບໍ່ມີ',

      productDetail: pData.description || 'ບໍ່ລະບຸ',
      productBrand: pData.brand || 'ບໍ່ລະບຸ',
      productModel: pData.model || 'ບໍ່ລະບຸ',

      variant_id: Number(pData.variant_id) || selectedDraft.value?.variant_id || null, // 🟢 ສົ່ງ variant_id ໄປສ້າງສັນຍາ
      product_color: pData.productColor || selectedDraft.value?.variant.color || 'ບໍ່ລະບຸ',
      product_size: pData.productSize || selectedDraft.value?.variant.size_or_capacity || 'ບໍ່ລະບຸ',

      productPrice: Number(pData.price) || 0,
      productDownPayment: Number(pData.downPayment) || 0,
      totalAmount: Number(pData.approvedAmount) || 0,
      interestRateAtApply: Number(pData.interestRate) || 0,
      loanPeriod: Number(pData.loanTerm) || 0,
      totalInterest: Number(pData.totalInterest) || 0,
      fee: Number(pData.fee) || 0,
      monthlyPay: Number(pData.monthlyPayment) || 0,
      firstInstallmentAmount: Number(pData.firstInstallment) || 0,
      paymentDay: Number(pData.paymentDay) || 1,

      refName: gData.fullname || 'ບໍ່ມີ',
      refDateOfBirth: gData.dob || new Date().toISOString().split('T')[0],
      refPhone: gData.phone || 'ບໍ່ມີ',
      refSex: gData.gender || 'ບໍ່ລະບຸ',
      refMaritalStatus: gData.maritalStatus || 'ບໍ່ລະບຸ',
      refIdPassNumber: gData.idCard || 'ບໍ່ມີ',
      refIdPassDate: gData.idCardIssueDate || new Date().toISOString().split('T')[0],
      refCensusNumber: gData.censusBook || 'ບໍ່ມີ',
      refCensusCreated: gData.censusBookIssueDate || new Date().toISOString().split('T')[0],
      refCensusAuthorizeBy: gData.censusAuthorizeBy || 'ບໍ່ມີ',
      refHouseNumber: gData.houseNumber || 'ບໍ່ມີ',
      refUnit: Number(gData.unit) || 0,
      refAddress: formatAddr(gData.address),
      refProvinceId: gData.address?.province_id || null,
      refDistrictId: gData.address?.district_id || null,
      refLivedYear: Number(gData.residenceYears) || 0,
      refLivedWith: gData.liveWith || 'ບໍ່ມີ',
      refLivedSituation: gData.residenceStatus || 'ບໍ່ມີ',
      refOccupation: gData.occupation || 'ບໍ່ມີ',
      refRelationship: gData.relationship || 'ບໍ່ມີ',

      refCompanyName: gwData.companyName || 'ບໍ່ມີ',
      refCompanyBusinessType: gwData.businessType || 'ບໍ່ມີ',
      refCompanyLocation: formatAddr(gwData.address),
      refCompanyWorkYear: Number(gwData.workYears) || 0,
      refPosition: gwData.position || 'ບໍ່ມີ',
      refIncome: Number(gwData.salary) || 0,
      refPayrollDate: String(gwData.salaryDay || '0'),
      refCompanyEmpNumber: Number(gwData.totalEmployees) || 0,
      refIncomeOther: Number(gwData.otherIncome) || 0,
      refIncomeOtherSource: gwData.otherIncomeSource || 'ບໍ່ມີ',

      motorId: pData.motorcycle?.motorId || '',
      tankNumber: pData.motorcycle?.tankNumber || '',
      motorColor: pData.motorcycle?.motorColor || '',
      motorWarranty: Number(pData.motorcycle?.motorWarranty) || 0,
      partner_id: sData.id || '',
      shopId: sData.code || '',
      shopBranch: sData.branch || '',
      producttypeId: selectedDraft.value.product?.productType_id || null
    };

    await loanContractStore.createContract(loanId, flatContractPayload);

    // 4. ອັບໂຫຼດເອກະສານທີ່ແນບມາໃນໜ້າສັນຍາ (ຖ້າມີ)
    const newUploadDocs = [...draftDocuments.value, ...optionalDocuments.value].filter(doc => doc.file !== null);
    if (newUploadDocs.length > 0) {
      isUploadingDocuments.value = true;
      for (const doc of newUploadDocs) {
        await loanApplicationStore.uploadDocument(selectedDraft.value.customer_id, doc.file!, doc.id);
      }
      await loanApplicationStore.fetchDocuments(loanId);
      isUploadingDocuments.value = false;
    }

    alert.success('ບັນທຶກຂໍ້ມູນສັນຍາ ແລະ ໃບສະເໜີສຳເລັດ!');
    isEditingInModal.value = false;

    // ຣີເຟຣຊຂໍ້ມູນໃໝ່ຫຼ້າສຸດ
    selectedContract.value = await loanContractStore.fetchContract(loanId);
    emit('refresh');

  } catch (error: any) {
    console.error("Save Contract Error: ", error);
    alert.error('ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກສັນຍາ', error.response?.data?.message || error.message || 'ກະລຸນາລອງໃໝ່');
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
const handleModalPriceInput = (e: Event) => handleModalCurrencyInput('total_amount', e)
const handleModalDownPaymentInput = (e: Event) => handleModalCurrencyInput('down_payment', e)

const handleModalTermChange = () => {
  const m = modalDraftForm.loan_period;
  modalDraftForm.interest_rate = m <= 6 ? 2.5 : m <= 12 ? 2.0 : m <= 18 ? 1.89 : 1.75;
}

watch(() => [modalDraftForm.total_amount, modalDraftForm.down_payment, modalDraftForm.interest_rate, modalDraftForm.loan_period], () => {
  modalDraftForm.monthly_payment = calculateModalMonthlyPayment()
})

// 🟢 Shop & Product
const handleShopChange = async () => {
  clearModalProductSelection()
  if (modalShopId.value) await productStore.fetchProducts({ shop_id: modalShopId.value, limit: 100 })
}

const filteredModalProducts = computed(() => {
  if (!modalProductSearch.value) return productStore.products
  return productStore.products.filter(p => p.product_name.toLowerCase().includes(modalProductSearch.value.toLowerCase()))
})

// 🟢 ເມື່ອເລືອກສິນຄ້າໃນໜ້າແກ້ໄຂ
const selectModalProduct = async (product: any) => {
  selectedModalProduct.value = product;
  modalProductSearch.value = product.product_name;
  showModalProductDropdown.value = false;
  
  // ໂຫຼດ Variants ໃໝ່
  await loadVariantsForEdit(product.id);
  
  // ຖ້າບໍ່ມີ Variant ໃຫ້ໃຊ້ລາຄາຫຼັກເລີຍ
  if (modalProductVariants.value.length === 0) {
      modalDraftForm.total_amount = product.price;
  } else {
      modalDraftForm.total_amount = 0; // ຣີເຊັດລໍຖ້າໃຫ້ເລືອກກ່ອນ
  }
  
  modalDraftForm.loan_period = product.term || 12;
  handleModalTermChange();
}

// 🟢 ເມື່ອເລືອກ Variant ໃນໜ້າແກ້ໄຂ
const selectModalVariant = (variant: any) => {
    modalSelectedVariant.value = variant;
    modalDraftForm.total_amount = variant.price; // ອັບເດດລາຄາໃໝ່ຕາມ Variant
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

// 🟢 Docs Handlers ... (ໂຄ້ດເກົ່າ)
const handleDocumentUpload = (index: number, event: Event, type: 'req' | 'opt') => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const docs = type === 'req' ? draftDocuments.value : optionalDocuments.value;
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
  const docs = type === 'req' ? draftDocuments.value : optionalDocuments.value;
  if (docs[index]) { 
    docs[index].file = null;
    docs[index].preview = null;
  }
}

// 🟢 Maps Handlers ... (ໂຄ້ດເກົ່າ)
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
/* (Style ເກົ່າທັງໝົດຮັກສາໄວ້) */
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