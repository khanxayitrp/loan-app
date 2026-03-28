<template>
  <div class="p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ລາຍການຮ່າງສິນເຊື່ອ</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">ຈັດການຮ່າງຄຳຂໍສິນເຊື່ອທີ່ຍັງບໍ່ໄດ້ສົ່ງ</p>
      </div>
      <button @click="exportToCSV" class="btn btn-outline btn-sm whitespace-nowrap">
        <span class="icon-[tabler--file-export] size-4 mr-1"></span>
        Export CSV
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <label class="label">
          <span class="label-text text-sm font-medium">ຄົ້ນຫາ</span>
        </label>
        <input v-model="searchQuery" type="text" placeholder="ຊື່ລູກຄ້າ, ເບີໂທ..." class="input input-bordered w-full"
          @input="debounceSearch" />
      </div>
      <div>
        <label class="label">
          <span class="label-text text-sm font-medium">ເຈົ້າໜ້າທີ່</span>
        </label>
        <select v-model="staffFilter" class="select select-bordered w-full">
          <option value="">ທັງໝົດເຈົ້າໜ້າທີ່</option>
          <option v-for="staff in staffList" :key="staff.id" :value="staff.id.toString()">
            {{ staff.name }}
          </option>
        </select>
      </div>
      <div>
        <label class="label">
          <span class="label-text text-sm font-medium">ວັນທີ່ສ້າງ</span>
        </label>
        <div class="flex gap-2">
          <input v-model="dateFrom" type="date" class="input input-bordered w-full" @change="applyDateFilter" />
          <input v-model="dateTo" type="date" class="input input-bordered w-full" @change="applyDateFilter" />
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-8">
      <div class="loading loading-spinner"></div>
    </div>

    <div v-else class="w-full overflow-x-auto rounded-lg border border-base-content/10">
      <table class="table table-zebra w-full min-w-max">
        <thead>
          <tr>
            <th>ລູກຄ້າ</th>
            <th>ສິນຄ້າ</th>
            <th>ຈຳນວນເງິນ</th>
            <th>ເຈົ້າໜ້າທີ່</th>
            <th>ສະຖານະ</th>
            <th>ວັນທີ່ສ້າງ</th>
            <th class="w-32">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="draft in displayedDrafts" :key="draft.id">
            <td class="font-medium">
              <div>{{ getDraftDisplayName(draft) || `Loan #${draft.loan_id}` }}</div>
              <div class="text-sm text-gray-500">{{ getDraftPhone(draft) }}</div>
            </td>
            <td>
              <div>{{ getProductName(draft) }}</div>
              <div class="text-sm text-gray-500">ID: {{ draft.product_id }}</div>
            </td>
            <td class="font-medium">{{ formatPrice(draft.total_amount) }}</td>
            <td>{{ getRequesterName(draft) || `ID: ${draft.requester_id || '-'}` }}</td>
            <td>
              <span class="badge badge-soft" :class="{
                'badge-warning': draft.is_confirmed === 0,
                'badge-info': draft.is_confirmed === 1 && draft.status === LoanApplicationStatus.PENDING,
                'badge-success': draft.status === LoanApplicationStatus.APPROVED,
                'badge-error': draft.status === LoanApplicationStatus.REJECTED
              }">
                {{ getStatusLabel(draft) }}
              </span>
            </td>
            <td>{{ draft.createdAt ? formatDate(draft.createdAt) : '-' }}</td>
            <td>
              <div class="flex gap-2">
                <button class="btn btn-circle btn-text btn-sm" @click="viewDraftDetails(draft)"
                  aria-label="View details">
                  <span class="icon-[tabler--eye] size-4"></span>
                </button>
                <button v-if="isDraft(draft)" class="btn btn-circle btn-text btn-sm text-error"
                  @click="deleteDraft(draft.id)" aria-label="Delete draft">
                  <span class="icon-[tabler--trash] size-4"></span>
                </button>
                <button v-if="isDraft(draft)" class="btn btn-circle btn-text btn-sm text-success"
                  @click="confirmSubmitDraft(draft)" aria-label="Submit draft">
                  <span class="icon-[tabler--check] size-4"></span>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="displayedDrafts.length === 0">
            <td colspan="7" class="text-center py-8 text-base-content/60">
              {{ isLoading ? 'ກຳລັງໂຫຼດ...' : 'ບໍ່ມີຂໍ້ມູນ' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!isLoading" class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm">
      <div>
        ສະແດງ {{ startIndex }} - {{ endIndex }} ຈາກ {{ totalDrafts }} ລາຍການ
      </div>
      <div class="flex items-center gap-2">
        <select v-model.number="pageSize" class="select select-sm select-bordered">
          <option :value="10">10 ຕໍ່ໜ້າ</option>
          <option :value="25">25 ຕໍ່ໜ້າ</option>
          <option :value="50">50 ຕໍ່ໜ້າ</option>
        </select>
        <button class="btn btn-sm" :disabled="!hasPreviousPage" @click="previousPage">ກ່ອນໜ້າ</button>
        <span class="px-2"> ໜ້າ {{ currentPage }} / {{ totalPages }} </span>
        <button class="btn btn-sm" :disabled="!hasNextPage" @click="nextPage">ຖັດໄປ</button>
      </div>
    </div>

    <teleport to="body">
      <div v-if="showDetailsModal && selectedDraft"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold">
              {{ isEditingInModal ? 'ແກ້ໄຂຮ່າງສິນເຊື່ອ' : 'ລາຍລະອຽດຮ່າງສິນເຊື່ອ' }}
            </h3>
            <button @click="closeDetailsModal" class="text-gray-400 hover:text-gray-600">
              <span class="icon-[tabler--x] size-5"></span>
            </button>
          </div>

          <div class="tabs tabs-boxed mb-6 flex-wrap gap-1">
            <button class="tab" :class="{ 'tab-active': activeTab === 'details' }" @click="activeTab = 'details'">
              ລາຍລະອຽດ
            </button>
            <button class="tab" :class="{ 'tab-active': activeTab === 'documents' }" @click="activeTab = 'documents'">
              ເອກະສານ
            </button>
            <button class="tab" :class="{ 'tab-active': activeTab === 'map' }" @click="activeTab = 'map'">
              <span class="icon-[tabler--map] size-4 mr-1"></span> ແຜນທີ່
            </button>
            <button class="tab" :class="{ 'tab-active': activeTab === 'requestForm' }"
              @click="activeTab = 'requestForm'">
              <span class="icon-[tabler--file-text] size-4 mr-1"></span> ແບບຟອມຂໍກູ້
            </button>
            <button class="tab" :class="{ 'tab-active': activeTab === 'loanContract' }"
              @click="activeTab = 'loanContract'">
              <span class="icon-[tabler--file-invoice] size-4 mr-1"></span> ສັນຍາກູ້ຢືມ
            </button>
          </div>

          <div v-if="activeTab === 'details'" class="space-y-6">

            <div v-if="!isEditingInModal" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-gray-500">Loan ID</label>
                  <p class="font-medium">{{ selectedDraft.loan_id }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ລູກຄ້າ ID</label>
                  <p>{{ selectedDraft.customer_id }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ສິນຄ້າ ID</label>
                  <p>{{ selectedDraft.product_id }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ຈຳນວນເງິນກູ້ (ຍອດຈັດ)</label>
                  <p class="font-medium text-primary">{{ formatPrice(Number(selectedDraft.total_amount || 0) - Number(selectedDraft.down_payment || 0)) }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ເງິນດາວ</label>
                  <p class="font-medium">{{ formatPrice(selectedDraft.down_payment || 0) }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ດອກເບ້ຍ</label>
                  <p>{{ selectedDraft.interest_rate_at_apply }}%</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ໄລຍະເວລາ</label>
                  <p>{{ selectedDraft.loan_period }} ເດືອນ</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ຄ່າຜ່ອນ/ເດືອນ</label>
                  <p class="font-medium text-success">{{ formatPrice(selectedDraft.monthly_pay) }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ສະຖານະ</label>
                  <p>
                    <span class="badge badge-soft badge-info">ຮ່າງ (Draft)</span>
                  </p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ເຈົ້າໜ້າທີ່</label>
                  <p>{{ getRequesterName(selectedDraft) || 'ID: ' + selectedDraft.requester_id }}</p>
                </div>
              </div>
              <div v-if="selectedDraft.customer" class="border-t pt-4 mt-4">
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
              <div v-if="selectedDraft.product" class="border-t pt-4 mt-4">
                <h4 class="font-medium mb-3">ຂໍ້ມູນສິນຄ້າ</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium text-gray-500">ສິນຄ້າ</label>
                    <p>{{ getProductName(selectedDraft) }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">ລາຄາ</label>
                    <p>{{ formatPrice(selectedDraft.product.price) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="space-y-6">

              <div>
                <h4 class="font-medium text-lg mb-4 flex items-center gap-2">
                  <span class="icon-[tabler--user-edit] size-5 text-primary"></span>
                  ແກ້ໄຂຂໍ້ມູນລູກຄ້າ
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ຊື່ ແລະ ນາມສະກຸນ *</span></label>
                    <input v-model="modalDraftForm.customer_name" type="text" class="input input-bordered w-full"
                      :class="{ 'input-error': modalFormErrors.customer_name }" required />
                    <label v-if="modalFormErrors.customer_name" class="label text-error">
                      <span class="label-text-alt">{{ modalFormErrors.customer_name }}</span>
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ເບີໂທລະສັບ *</span></label>
                    <input v-model="modalDraftForm.customer_phone" type="tel" class="input input-bordered w-full"
                      :class="{ 'input-error': modalFormErrors.customer_phone }" required />
                    <label v-if="modalFormErrors.customer_phone" class="label text-error">
                      <span class="label-text-alt">{{ modalFormErrors.customer_phone }}</span>
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ເລກບັດປະຈຳຕົວ *</span></label>
                    <input v-model="modalDraftForm.customer_id_card" type="text" class="input input-bordered w-full"
                      :class="{ 'input-error': modalFormErrors.customer_id_card }" required />
                    <label v-if="modalFormErrors.customer_id_card" class="label text-error">
                      <span class="label-text-alt">{{ modalFormErrors.customer_id_card }}</span>
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ອາຍຸ *</span></label>
                    <input v-model.number="modalDraftForm.age" type="number" class="input input-bordered w-full"
                      min="0" />
                    <label v-if="modalFormErrors.age" class="label text-error">
                      <span class="label-text-alt">{{ modalFormErrors.age }}</span>
                    </label>
                  </div>
                </div>
                <div class="form-control mt-4">
                  <label class="label">
                    <span class="label-text font-medium">ອາຊີບ *</span>
                    <span class="text-xs text-gray-500 ml-1">(ຕົວຢ່າງ: ພະນັກງານລັດ, ທຸລະກິດສ່ວນຕົວ, ກະສິກອນ,
                      ແຮງງານ)</span>
                  </label>
                  <input v-model="modalDraftForm.occupation" type="text" class="input input-bordered w-full"
                    :class="{ 'input-error': modalFormErrors.occupation }" required />
                  <label v-if="modalFormErrors.occupation" class="label text-error">
                    <span class="label-text-alt">{{ modalFormErrors.occupation }}</span>
                  </label>
                </div>
                <div class="form-control mt-4">
                  <label class="label"><span class="label-text font-medium">ທີ່ຢູ່ *</span></label>
                  <textarea v-model="modalDraftForm.customer_address" class="textarea textarea-bordered w-full min-h-24"
                    :class="{ 'textarea-error': modalFormErrors.customer_address }" required></textarea>
                  <label v-if="modalFormErrors.customer_address" class="label text-error">
                    <span class="label-text-alt">{{ modalFormErrors.customer_address }}</span>
                  </label>
                </div>
              </div>

              <div class="border-t pt-6">
                <h4 class="font-medium text-lg mb-4 flex items-center gap-2">
                  <span class="icon-[tabler--building-store] size-5 text-primary"></span>
                  ເລືອກຮ້ານຄ້າ ແລະ ສິນຄ້າ
                </h4>

                <div class="form-control mb-4">
                  <label class="label"><span class="label-text font-medium">ຮ້ານຄ້າ / ຕົວແທນ *</span></label>
                  <select v-model="modalShopId" class="select select-bordered w-full" @change="handleShopChange"
                    required>
                    <option :value="null" disabled>-- ກະລຸນາເລືອກຮ້ານຄ້າ --</option>
                    <option v-for="shop in shopsList" :key="shop.id" :value="shop.id">
                      {{ shop.shop_name }}
                    </option>
                  </select>
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium" :class="{ 'text-gray-400': !modalShopId }">ສິນຄ້າ *</span>
                    <span v-if="!modalShopId" class="text-xs text-error">ກະລຸນາເລືອກຮ້ານຄ້າກ່ອນ</span>
                  </label>

                  <div class="relative">
                    <input v-model="modalProductSearch" type="text" placeholder="ພິມຊື່ສິນຄ້າ ຫຼື ລະຫັດ…"
                      class="input input-bordered w-full pl-10 pr-10" :disabled="!modalShopId"
                      @input="debounceModalProductSearch" @focus="showModalProductDropdown = true"
                      @blur="handleModalProductBlur" />

                    <span
                      class="icon-[tabler--search] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>

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
                          <div class="text-sm text-gray-500">{{ product.type_name }}</div>
                        </div>
                        <div class="text-right">
                          <div class="font-medium text-primary">{{ formatPrice(product.price) }}</div>
                        </div>
                      </div>
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
                    <input type="text" :value="formatPrice(modalDraftForm.total_amount)"
                      class="input input-bordered w-full bg-gray-100 dark:bg-gray-700 cursor-not-allowed" readonly
                      required />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">ຈຳນວນເງິນດາວ
                        <span v-if="modalDraftForm.total_amount > 0" class="text-xs text-gray-500">
                          ຍອດຈັດ: {{ formatPrice(Math.max(0, modalDraftForm.total_amount - (modalDraftForm.down_payment
                            || 0))) }}
                        </span></span>
                    </label>
                    <input type="text" :value="formatCurrencyInput(modalDraftForm.down_payment)"
                      @input="handleModalCurrencyInput('down_payment', $event)" class="input input-bordered w-full"
                      :class="{ 'input-error': modalFormErrors.down_payment }" />
                    <label v-if="modalFormErrors.down_payment" class="label text-error">
                      <span class="label-text-alt">{{ modalFormErrors.down_payment }}</span>
                    </label>
                  </div>

                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ໄລຍະເວລາ (ເດືອນ) *</span></label>
                    <input v-model.number="modalDraftForm.loan_period" type="number" class="input input-bordered w-full"
                      :class="{ 'input-error': modalFormErrors.loan_period }" min="1" max="60" required />
                    <label v-if="modalFormErrors.loan_period" class="label text-error">
                      <span class="label-text-alt">{{ modalFormErrors.loan_period }}</span>
                    </label>
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">ອັດຕາດອກເບ້ຍ * <span
                          class="badge badge-primary badge-sm badge-soft">
                          {{ modalDraftForm.interest_rate_type === 'yearly' ? '% ຕໍ່ປີ' : '% ຕໍ່ເດືອນ' }}
                        </span></span>
                    </label>
                    <input v-model.number="modalDraftForm.interest_rate" type="number"
                      class="input input-bordered w-full" :class="{ 'input-error': modalFormErrors.interest_rate }"
                      min="0" max="100" step="0.01" readonly required />
                  </div>

                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ປະເພດດອກເບ້ຍ *</span></label>
                    <select v-model="modalDraftForm.interest_type" class="select select-bordered w-full bg-base-50">
                      <option value="flat_rate">ດອກເບ້ຍຄົງທີ່ (Flat Rate)</option>
                      <option value="effective_rate">ລົດຕົ້ນລົດດອກ (Effective Rate)</option>
                    </select>
                  </div>

                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ຄ່າງວດຕໍ່ເດືອນ</span></label>
                    <input :value="formatPrice(modalDraftForm.monthly_payment)" type="text"
                      class="input input-bordered w-full bg-gray-100 dark:bg-gray-700 text-success font-bold cursor-not-allowed"
                      readonly />
                  </div>

                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ລາຍຮັບຕໍ່ເດືອນ *</span></label>
                    <input type="text" :value="formatCurrencyInput(modalDraftForm.income_per_month)"
                      @input="handleModalCurrencyInput('income_per_month', $event)"
                      class="input input-bordered w-full text-blue-700"
                      :class="{ 'input-error': modalFormErrors.income_per_month }" />
                    <label v-if="modalFormErrors.income_per_month" class="label text-error">
                      <span class="label-text-alt">{{ modalFormErrors.income_per_month }}</span>
                    </label>
                  </div>

                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ໜີ້ສິນອື່ນໆ</span></label>
                    <input type="text" :value="formatCurrencyInput(modalDraftForm.other_debts)"
                      @input="handleModalCurrencyInput('other_debts', $event)"
                      class="input input-bordered w-full text-red-500" />
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div v-else-if="activeTab === 'documents'">

            <div v-if="!isEditingInModal" class="space-y-6">
              <div v-if="!loanApplicationStore.currentDocuments || loanApplicationStore.currentDocuments.length === 0"
                class="text-center py-12 text-gray-500">
                <div
                  class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span class="icon-[tabler--file-off] size-8 text-gray-400"></span>
                </div>
                <p class="text-lg font-medium">ບໍ່ມີເອກະສານແນບ</p>
                <p class="text-sm text-gray-500 mt-1">ຍັງບໍ່ມີເອກະສານທີ່ອັບໂຫຼດສຳລັບສິນເຊື່ອນີ້</p>
              </div>
              <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="doc in loanApplicationStore.currentDocuments" :key="doc.id"
                  class="border rounded-lg p-4 flex flex-col gap-3 bg-white dark:bg-gray-800">
                  <div class="flex justify-between items-start">
                    <div>
                      <h5 class="font-medium text-sm">
                        {{ getDocumentTypeName(doc.document_type || doc.doc_type) }}
                      </h5>
                      <p class="text-xs text-gray-500 mt-1">{{ doc.original_filename || doc.file_name || 'ບໍ່ຮູ້ຈັກ' }}
                      </p>
                    </div>
                    <a :href="getFullImageUrl(doc.file_url) || '#'" target="_blank" download
                      class="btn btn-xs btn-ghost text-primary hover:bg-primary/10">
                      <span class="icon-[tabler--download] size-4 mr-1"></span> ດາວໂຫຼດ
                    </a>
                  </div>
                  <div class="mt-2">
                    <div v-if="isImage(doc.file_url)"
                      class="aspect-video bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                      <img :src="getFullImageUrl(doc.file_url) || ''" alt="Document preview"
                        class="w-full h-full object-contain p-2" />
                    </div>
                    <div v-else
                      class="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                      <span class="icon-[tabler--file-description] size-12 text-gray-400"></span>
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
                        class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        @click="removeDocument(index)">
                        <span class="icon-[tabler--x] size-4"></span>
                      </button>
                    </div>
                    <div v-else class="mt-3">
                      <label
                        class="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-100 transition">
                        <span class="icon-[tabler--upload] size-8 text-gray-400 mb-2"></span>
                        <p class="text-sm text-gray-600">ຄລິກເພື່ອອັບໂຫຼດ</p>
                        <input type="file" class="hidden" accept="image/*,.pdf"
                          @change="(event) => handleDocumentUpload(index, event)" />
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
                  <div v-for="(doc, index) in optionalDocuments" :key="index + draftDocuments.length"
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
                        class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        @click="removeDocument(index + draftDocuments.length)">
                        <span class="icon-[tabler--x] size-4"></span>
                      </button>
                    </div>
                    <div v-else class="mt-3">
                      <label
                        class="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-100 transition">
                        <span class="icon-[tabler--upload] size-8 text-gray-400 mb-2"></span>
                        <p class="text-sm text-gray-600">ຄລິກເພື່ອອັບໂຫຼດ</p>
                        <input type="file" class="hidden" accept="image/*,.pdf"
                          @change="(event) => handleDocumentUpload(index + draftDocuments.length, event)" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
          <div v-else-if="activeTab === 'map'" class="space-y-6">
            <CustomerLocationMap :customer-id="selectedDraft?.customer_id || 0" :locations="customerLocations"
            :google-maps-api-key="''"
              :is-loading="isLocationLoading" :can-add-location="true" :can-edit-location="true"
              :can-delete-location="true" :can-set-primary="true" @add-location="handleAddLocation"
              @update-location="handleUpdateLocation" @delete-location="handleDeleteLocation"
              @set-primary="handleSetPrimary" />
          </div>
          <div v-else-if="activeTab === 'requestForm'" class="space-y-6">
            <LoanRequestForm :loan-application-id="selectedDraft?.id" :loan-application="selectedDraft"
              :is-editing="isEditingInModal" @save-form="handleRequestFormSave" @form-updated="handleRequestFormUpdated"
              @cancel-edit="isEditingInModal = false" />
          </div>
          <div v-else-if="activeTab === 'loanContract'" class="space-y-6">
            <LoanContractForm :loan-contract-id="selectedDraft?.id" :loan-application="selectedDraft"
              :loan-contract="selectedContract" :is-editing="isEditingInModal" @cancel-edit="isEditingInModal = false"
              @enable-edit="isEditingInModal = true" @save-form="handleSaveContract" />
          </div>

          <div class="flex justify-end gap-3 mt-6 border-t pt-6">
            <button class="btn btn-soft btn-secondary" @click="closeDetailsModal">
              {{ isEditingInModal ? 'ຍົກເລີກ' : 'ປິດ' }}
            </button>
            <button v-if="!isEditingInModal && (activeTab === 'details' || activeTab === 'documents')"
              class="btn btn-primary" @click="startEditInModal">
              <span class="icon-[tabler--edit] size-4 mr-1"></span> ແກ້ໄຂ
            </button>
            <button v-else-if="isEditingInModal && (activeTab === 'details' || activeTab === 'documents')"
              class="btn btn-success" @click="saveDraftFromModal" :disabled="isSaving">
              <span v-if="isSaving" class="loading loading-spinner loading-xs"></span>
              <span v-else class="icon-[tabler--device-floppy] size-4 mr-1"></span>
              <span v-if="!isSaving">ບັນທຶກການປ່ຽນແປງ</span>
            </button>
          </div>

        </div>
      </div>
    </teleport>

    <!-- <teleport to="body">
      <div v-if="showOtpModal && draftToSubmit"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold">ຢືນຢັນເບີໂທລະສັບ</h3>
            <button @click="closeOtpModal" class="text-gray-400 hover:text-gray-600">
              <span class="icon-[tabler--x] size-5"></span>
            </button>
          </div>
          <div class="text-center mb-6">
            <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="icon-[tabler--message] size-6 text-primary"></span>
            </div>
            <p class="text-gray-600 dark:text-gray-400">ພວກເຮົາໄດ້ສົ່ງລະຫັດ OTP ໄປຫາເບີ</p>
            <p class="font-medium text-lg mt-2">{{ getDraftPhone(draftToSubmit) }}</p>
          </div>
          <div class="form-control mb-6">
            <input v-model="otpCode" type="text" inputmode="numeric" placeholder="ປ້ອນລະຫັດ OTP 6 ຕົວ"
              class="input input-bordered w-full text-center text-2xl tracking-widest"
              :class="{ 'input-error': otpError }" maxlength="6" @keyup.enter="verifyAndSubmitDraft" />
            <label v-if="otpError" class="label text-error">
              <span class="label-text-alt">{{ otpError }}</span>
            </label>
          </div>
          <div class="flex justify-between gap-3">
            <button type="button" class="btn btn-soft btn-secondary flex-1" @click="closeOtpModal">ຍົກເລີກ</button>
            <button type="button" class="btn btn-success flex-1" @click="verifyAndSubmitDraft" :disabled="isVerifying || otpCode.length !== 6">
              <span v-if="isVerifying" class="loading loading-spinner loading-xs"></span>
              <span v-else>ຢືນຢັນ</span>
            </button>
          </div>
        </div>
      </div>
    </teleport> -->

    <!-- <teleport to="body">
      <div v-if="showSubmitModal && draftToSubmit"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
          <h3 class="font-bold text-lg mb-4 text-success">ສົ່ງຮ່າງສິນເຊື່ອ</h3>
          <p class="py-4 text-gray-700 dark:text-gray-300">
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການສົ່ງຮ່າງສິນເຊື່ອເລກທີ {{ draftToSubmit.loan_id }} ?
          </p>
          <div class="flex justify-end gap-3 mt-6">
            <button class="btn btn-soft btn-secondary" @click="showSubmitModal = false">ຍົກເລີກ</button>
            <button class="btn btn-success" @click="submitDraft">ສົ່ງຮ່າງ</button>
          </div>
        </div>
      </div>
    </teleport> -->
    <teleport to="body">
      <div v-if="showSubmitModal && draftToSubmit"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
          <h3 class="font-bold text-lg mb-4 text-success">ຢືນຢັນການສົ່ງຄຳຂໍສິນເຊື່ອ</h3>
          <p class="py-4 text-gray-700 dark:text-gray-300">
            ທ່ານກວດສອບຂໍ້ມູນ ແລະ ເອກະສານຄົບຖ້ວນແລ້ວແມ່ນບໍ່?<br>
            ຕ້ອງການສົ່ງຮ່າງສິນເຊື່ອເລກທີ <strong>{{ draftToSubmit.loan_id }}</strong> ເຂົ້າສູ່ລະບົບການພິຈາລະນາເລີຍບໍ່?
          </p>
          <div class="flex justify-end gap-3 mt-6">
            <button class="btn btn-soft btn-secondary" @click="showSubmitModal = false"
              :disabled="isVerifying">ຍົກເລີກ</button>
            <button class="btn btn-success" @click="submitDraft" :disabled="isVerifying">
              <span v-if="isVerifying" class="loading loading-spinner loading-xs"></span>
              <span v-else>ຢືນຢັນການສົ່ງ</span>
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '@/utils/formatters'
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useLoanApplicationStore } from '@/stores/loanApplication'
import { useProductStore } from '@/stores/product'
import { useLoanContractStore } from '@/stores/loanContract'
import { useShopStore } from '@/stores/shop' // 🟢 ເພີ່ມ Store ຮ້ານຄ້າ
import { LoanApplicationStatus } from '@/types/loanApplication'
import type { LoanApplication, CustomerLocation, ConfirmDraftDto } from '@/types/loanApplication'
import type { CreateLoanContractRequest } from '@/types/loanContract'
import { requestOtpForCustomer } from '@/api/customer'
import Papa from 'papaparse'
import { getConfirmedStyle } from '@/utils/formatters'
import { getFullImageUrl } from '@/utils/url'
import CustomerLocationMap from '@/components/loans/form/CustomerLocationMap.vue'
import LoanRequestForm from '@/components/loans/form/RequestForm.vue'
import LoanContractForm from '@/components/loans/form/LoanContractForm.vue'
import { alert } from '@/utils/alert'

// ✅ Stores
const loanApplicationStore = useLoanApplicationStore()
const productStore = useProductStore()
const loanContractStore = useLoanContractStore()
const shopStore = useShopStore() // 🟢 ເພີ່ມຕົວແປ Store ຮ້ານຄ້າ

// Reactive state
const isLoading = computed(() => loanApplicationStore.isLoading)
const isSaving = computed(() => loanApplicationStore.isSaving)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const staffFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')

// Modal states
const showDetailsModal = ref(false)
const showSubmitModal = ref(false)
const showOtpModal = ref(false)
const selectedDraft = ref<LoanApplication | null>(null)
const draftToSubmit = ref<LoanApplication | null>(null)
const activeTab = ref<'details' | 'documents' | 'map' | 'requestForm' | 'loanContract'>('details')
const isEditingInModal = ref(false)

// ✅ Product Search in Modal
const modalProductSearch = ref('')
const showModalProductDropdown = ref(false)
const selectedModalProduct = ref<any | null>(null)
const modalShopId = ref<number | null>(null)

// 🟢 ດຶງລາຍຊື່ຮ້ານຄ້າມາຈາກ ShopStore
const shopsList = computed(() => shopStore.shops)

// OTP
const otpCode = ref('')
const otpError = ref('')
const isVerifying = ref(false)

// Map states
const customerLocations = ref<CustomerLocation[]>([])
const isLocationLoading = ref(false)

// // Mock staff list
// const mockStaffList = [
//   { id: 1, name: 'ສົມຊາຍ ພົນສຸກ' },
//   { id: 2, name: 'ສົມສິງ ດຳດີ' },
//   { id: 3, name: 'ອຸດົມ ສີສົມບັດ' }
// ]

// ✅ Documents
interface Document { id: string, name: string, description: string, required: boolean, file: File | null, preview: string | null }
const draftDocuments = ref<Document[]>([
  { id: 'id_card', name: 'ບັດປະຈຳຕົວ', description: 'ຮູບຖ່າຍບັດປະຈຳຕົວທັງໜ້າ-ຫຼັງ', required: true, file: null, preview: null },
  { id: 'house_reg', name: 'ໃບຄອບຄົວ', description: 'ໃບຄອບຄົວຫຼືເອກະສານຢືນຢັນທີ່ຢູ່', required: true, file: null, preview: null }
])
const optionalDocuments = ref<Document[]>([
  { id: 'salary_slip', name: 'ຫຼັກຖານລາຍຮັບ', description: 'ໃບເງິນເດືອນ ຫຼື ໃບຮັບລາຍຮັບ', required: false, file: null, preview: null },
  { id: 'other', name: 'ເອກະສານອື່ນໆ', description: 'ເອກະສານອື່ນໆທີ່ກ່ຽວຂ້ອງ', required: false, file: null, preview: null }
])
const isUploadingDocuments = ref(false)
const allRequiredDocumentsUploaded = computed(() => draftDocuments.value.every(doc => doc.file !== null))


// Data Extractors
const getDraftDisplayName = (draft: LoanApplication): string => draft.customer ? `${draft.customer.first_name || ''} ${draft.customer.last_name || ''}`.trim() : '-'
const isDraft = (draft: LoanApplication): boolean => draft.is_confirmed === 0 || !draft.is_confirmed
const getStatusLabel = (draft: LoanApplication): string => {
  if (isDraft(draft)) return 'ຮ່າງ'
  switch (draft.status) {
    case LoanApplicationStatus.PENDING: return 'ລໍຖ້າ'
    case LoanApplicationStatus.VERIFYING: return 'ກຳລັງກວດ'
    case LoanApplicationStatus.APPROVED: return 'ອະນຸມັດ'
    case LoanApplicationStatus.REJECTED: return 'ປະຕິເສດ'
    default: return draft.status
  }
}
const getDraftPhone = (draft: LoanApplication): string => draft.customer?.phone || '-'
const getDraftAddress = (draft: LoanApplication): string => draft.customer?.address || '-'
const getProductName = (draft: LoanApplication): string => draft.product?.product_name || '-'
const getRequesterName = (draft: LoanApplication): string => (draft.requester as any)?.full_name || (draft.requester as any)?.name || '-'
const formatDate = (dateString: string): string => new Date(dateString).toLocaleDateString('lo-LA')


// ==========================================
// Computed properties
// ==========================================
const staffList = computed(() => {
  const drafts = loanApplicationStore.loanApplications || []
  const staffMap = new Map<number, string>()

  drafts.forEach(draft => {
    if (draft.requester_id) {
      const name = getRequesterName(draft)
      // ຖ້າຍັງບໍ່ມີເຈົ້າໜ້າທີ່ຄົນນີ້ໃນ Map, ໃຫ້ເພີ່ມເຂົ້າໄປ (ເພື່ອປ້ອງກັນການຊ້ຳກັນ)
      if (!staffMap.has(draft.requester_id)) {
        staffMap.set(
          draft.requester_id,
          name !== '-' ? name : `ID ເຈົ້າໜ້າທີ່: ${draft.requester_id}`
        )
      }
    }
  })

  // ແປງຈາກ Map ກັບມາເປັນ Array Object ເພື່ອໃຫ້ Dropdown ເອົາໄປ Loop ໄດ້
  return Array.from(staffMap.entries()).map(([id, name]) => ({ id, name }))
})
// 🟢 Updated Form for editing (Added missing fields)
const modalDraftForm = reactive({
  customer_name: '',
  customer_phone: '',
  customer_id_card: '',
  customer_address: '',
  occupation: '',
  age: 0,
  product_name: '',
  product_type: '',
  total_amount: 0,
  down_payment: 0, // ເພີ່ມເງິນດາວ
  interest_rate: 0,
  loan_period: 0,
  monthly_payment: 0,
  income_per_month: 0,
  other_debts: 0,
  interest_type: 'flat_rate', // Flat Rate vs Effective Rate
  interest_rate_type: 'monthly' // Monthly vs Yearly
})

// 🟢 Updated Validation errors
const modalFormErrors = reactive({
  customer_name: '',
  customer_phone: '',
  customer_id_card: '',
  customer_address: '',
  occupation: '',
  age: '',
  total_amount: '',
  down_payment: '',
  interest_rate: '',
  loan_period: '',
  income_per_month: ''
})

// ✅ Helper functions
const isImage = (url: string) => /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url.toLowerCase())
const getDocumentTypeName = (type: string): string => {
  const typeMap: Record<string, string> = { 'id_card': 'ບັດປະຈຳຕົວ', 'house_reg': 'ໃບຄອບຄົວ', 'salary_slip': 'ຫຼັກຖານລາຍຮັບ', 'other': 'ເອກະສານອື່ນໆ' }
  return typeMap[type] || type
}
const formatFileSize = (size: number | string): string => {
  if (!size) return 'ບໍ່ຮູ້ຈັກ'
  const numSize = typeof size === 'string' ? parseInt(size) : size
  if (numSize < 1024) return `${numSize} B`
  if (numSize < 1024 * 1024) return `${(numSize / 1024).toFixed(1)} KB`
  return `${(numSize / (1024 * 1024)).toFixed(1)} MB`
}

// 🟢 ຟັງຊັນສຳລັບຈັດການ Input ທີ່ເປັນເງິນ ໃຫ້ມີໝາຍຈຸດ (,) อัตโนมัติ (จาก ListLoan.vue)
// 🟢 แก้ไขการ Format เงิน ให้บังคับปัดเศษทศนิยมออก
const formatCurrencyInput = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return Number(val).toLocaleString('en-US', { maximumFractionDigits: 0 });
};

const handleModalCurrencyInput = (field: 'total_amount' | 'down_payment' | 'income_per_month' | 'other_debts', event: Event) => {
  const target = event.target as HTMLInputElement;
  const rawValue = target.value.replace(/,/g, '').replace(/[^\d]/g, '');
  const numericValue = Number(rawValue);

  if (!isNaN(numericValue) && rawValue !== '') {
    modalDraftForm[field] = numericValue;
  } else {
    modalDraftForm[field] = 0;
  }
  target.value = formatCurrencyInput(modalDraftForm[field]);
};

// 🟢 ຟັງຊັນເມື່ອແອັດມິນປ່ຽນຮ້ານຄ້າໃນ Dropdown
const handleShopChange = async () => {
  clearModalProductSelection()
  modalDraftForm.total_amount = 0
  modalDraftForm.down_payment = 0
  modalDraftForm.interest_rate = 0
  modalDraftForm.loan_period = 0
  modalDraftForm.monthly_payment = 0

  if (modalShopId.value) {
    try {
      await productStore.fetchProducts({ shop_id: modalShopId.value, limit: 100 })
    } catch (error) {
      alert.error('ບໍ່ສາມາດດຶງຂໍ້ມູນສິນຄ້າຂອງຮ້ານນີ້ໄດ້')
    }
  } else {
    productStore.clearProducts()
  }
}

// ✅ Upload Documents
const handleDocumentUpload = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    alert.error('ຂະໜາດໄຟລ໌ຕ້ອງນ້ອຍກວ່າ 5MB')
    target.value = ''
    return
  }
  if (!file.type.match(/^(image\/.*|application\/pdf)$/)) {
    alert.error('ກະລຸນາເລືອກໄຟລ໌ຮູບພາບ ຫຼື PDF ເທົ່ານັ້ນ')
    target.value = ''
    return
  }
  const allDocs = [...draftDocuments.value, ...optionalDocuments.value]
  const reader = new FileReader()
  reader.onload = (e) => {
    if (allDocs[index]) {
      allDocs[index].file = file
      allDocs[index].preview = e.target?.result as string
    }
    if (index < draftDocuments.value.length) {
      draftDocuments.value = [...allDocs.slice(0, draftDocuments.value.length)]
    } else {
      optionalDocuments.value = [...allDocs.slice(draftDocuments.value.length)]
    }
    target.value = ''
  }
  reader.readAsDataURL(file)
}
const removeDocument = (index: number) => {
  const allDocs = [...draftDocuments.value, ...optionalDocuments.value]
  if (allDocs[index]) {
    allDocs[index].file = null
    allDocs[index].preview = null
  }
  if (index < draftDocuments.value.length) {
    draftDocuments.value = [...allDocs.slice(0, draftDocuments.value.length)]
  } else {
    optionalDocuments.value = [...allDocs.slice(draftDocuments.value.length)]
  }
}

// 🟢 Validation function Updated
const validateModalForm = (): boolean => {
  Object.keys(modalFormErrors).forEach(key => { modalFormErrors[key as keyof typeof modalFormErrors] = '' })
  let isValid = true

  if (!modalDraftForm.customer_name.trim()) { modalFormErrors.customer_name = 'ກະລຸນາປ້ອນຊື່ລູກຄ້າ'; isValid = false }
  const phoneRegex = /^[\d\-\+\(\)\s]{8,15}$/
  if (!modalDraftForm.customer_phone.trim()) { modalFormErrors.customer_phone = 'ກະລຸນາປ້ອນເບີໂທລະສັບ'; isValid = false }
  else if (!phoneRegex.test(modalDraftForm.customer_phone)) { modalFormErrors.customer_phone = 'ເບີໂທລະສັບບໍ່ຖືກຕ້ອງ'; isValid = false }
  if (!modalDraftForm.customer_id_card.trim()) { modalFormErrors.customer_id_card = 'ກະລຸນາປ້ອນເລກບັດປະຈຳຕົວ'; isValid = false }
  if (!modalDraftForm.customer_address.trim()) { modalFormErrors.customer_address = 'ກະລຸນາປ້ອນທີ່ຢູ່'; isValid = false }
  if (!modalDraftForm.occupation.trim()) { modalFormErrors.occupation = 'ກະລຸນາປ້ອນອາຊີບ'; isValid = false }
  if (!modalDraftForm.age || modalDraftForm.age < 18 || modalDraftForm.age > 100) { modalFormErrors.age = 'ອາຍຸຕ້ອງຢູ່ລະຫວ່າງ 18-100 ປີ'; isValid = false }
  if (!modalDraftForm.total_amount || modalDraftForm.total_amount <= 0) { modalFormErrors.total_amount = 'ມູນຄ່າຕ້ອງຫຼາຍກວ່າ 0'; isValid = false }
  if (modalDraftForm.down_payment >= modalDraftForm.total_amount) { modalFormErrors.down_payment = 'ເງິນດາວຕ້ອງໜ້ອຍກວ່າລາຄາສິນຄ້າ'; isValid = false }
  if (modalDraftForm.interest_rate < 0 || modalDraftForm.interest_rate > 100) { modalFormErrors.interest_rate = 'ດອກເບ້ຍຕ້ອງຢູ່ລະຫວ່າງ 0-100%'; isValid = false }
  if (!modalDraftForm.loan_period || modalDraftForm.loan_period < 1 || modalDraftForm.loan_period > 60) { modalFormErrors.loan_period = 'ໄລຍະເວລາຕ້ອງຢູ່ລະຫວ່າງ 1-60 ເດືອນ'; isValid = false }
  if (!modalDraftForm.income_per_month || modalDraftForm.income_per_month <= 0) { modalFormErrors.income_per_month = 'ລາຍຮັບຕ້ອງຫຼາຍກວ່າ 0'; isValid = false }

  return isValid
}

// Computed properties
// const staffList = computed(() => mockStaffList)
const filteredDrafts = computed(() => {
  let filtered = loanApplicationStore.loanApplications || []
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(draft =>
      draft.customer?.first_name?.toLowerCase().includes(query) ||
      draft.customer?.last_name?.toLowerCase().includes(query) ||
      draft.customer?.phone?.includes(query) ||
      draft.loan_id?.toLowerCase().includes(query)
    )
  }
  if (staffFilter.value) {
    const staffId = parseInt(staffFilter.value)
    filtered = filtered.filter(draft => draft.requester_id === staffId)
  }
  if (dateFrom.value || dateTo.value) {
    filtered = filtered.filter(draft => {
      if (!draft.createdAt) return false
      const draftDate = new Date(draft.createdAt).toISOString().split('T')[0] ?? ''
      const fromDate = dateFrom.value || '1970-01-01'
      const toDate = dateTo.value || '9999-12-31'
      return draftDate >= fromDate && draftDate <= toDate
    })
  }
  return filtered
})
const filteredModalProducts = computed(() => {
  if (!modalProductSearch.value) return productStore.products
  const query = modalProductSearch.value.toLowerCase()
  return productStore.products.filter(product =>
    product.product_name.toLowerCase().includes(query) ||
    (product.type_name || '').toLowerCase().includes(query) ||
    product.id.toString().includes(query)
  )
})
const displayedDrafts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredDrafts.value.slice(start, end)
})
const totalDrafts = computed(() => filteredDrafts.value.length)
const totalPages = computed(() => Math.ceil(totalDrafts.value / pageSize.value) || 1)
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value + 1)
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, totalDrafts.value))
const hasPreviousPage = computed(() => currentPage.value > 1)
const hasNextPage = computed(() => currentPage.value < totalPages.value)

// 🟢 ຄຳນວນຄ່າງວດ (Advance formula handling down payment & rate types)
const calculateModalMonthlyPayment = (): number => {
  const { total_amount, down_payment, interest_rate, loan_period, interest_type, interest_rate_type } = modalDraftForm

  const principal = Math.max(0, total_amount - (down_payment || 0))
  if (!principal || !interest_rate || !loan_period) return 0

  const ratePerMonth = interest_rate_type === 'yearly' ? (interest_rate / 12) / 100 : interest_rate / 100
  let monthlyPayment = 0

  if (interest_type === 'flat_rate') {
    const flatMonthlyPrincipal = principal / loan_period
    const flatMonthlyInterest = principal * ratePerMonth
    monthlyPayment = flatMonthlyPrincipal + flatMonthlyInterest
  } else {
    if (ratePerMonth > 0) {
      monthlyPayment = (principal * ratePerMonth * Math.pow(1 + ratePerMonth, loan_period)) /
        (Math.pow(1 + ratePerMonth, loan_period) - 1)
    } else {
      monthlyPayment = principal / loan_period
    }
  }

  return Math.round(monthlyPayment)
}

watch(
  () => [
    modalDraftForm.total_amount,
    modalDraftForm.down_payment,
    modalDraftForm.interest_rate,
    modalDraftForm.loan_period,
    modalDraftForm.interest_type,
    modalDraftForm.interest_rate_type
  ],
  () => { modalDraftForm.monthly_payment = calculateModalMonthlyPayment() }
)

// 🟢 เลือกสินค้า
const selectModalProduct = (product: any) => {
  selectedModalProduct.value = product
  modalProductSearch.value = product.product_name
  showModalProductDropdown.value = false
  modalDraftForm.product_name = product.product_name
  modalDraftForm.product_type = product.productType?.type_name || product.type_name || ''
  modalDraftForm.total_amount = product.price
  modalDraftForm.down_payment = 0
  modalDraftForm.interest_rate = product.interest_rate
  modalDraftForm.loan_period = product.term
  modalDraftForm.interest_type = product.interest_type || 'flat_rate'
  modalDraftForm.interest_rate_type = product.interest_rate_type || 'monthly'
  modalDraftForm.monthly_payment = calculateModalMonthlyPayment()
}
const clearModalProductSelection = () => {
  selectedModalProduct.value = null
  modalProductSearch.value = ''
  modalDraftForm.product_name = ''
  modalDraftForm.product_type = ''
}
const handleModalProductBlur = () => setTimeout(() => showModalProductDropdown.value = false, 200)

let debounceTimer: NodeJS.Timeout | null = null
const debounceSearch = () => { if (debounceTimer) clearTimeout(debounceTimer); debounceTimer = setTimeout(() => currentPage.value = 1, 300) }
let modalProductSearchTimer: NodeJS.Timeout | null = null
const debounceModalProductSearch = () => { if (modalProductSearchTimer) clearTimeout(modalProductSearchTimer); modalProductSearchTimer = setTimeout(() => { }, 300) }
const applyDateFilter = () => currentPage.value = 1

const selectedContract = ref<any | null>(null)

// Action handlers
const viewDraftDetails = async (draft: LoanApplication) => {
  if (!draft.id) return
  selectedDraft.value = draft
  showDetailsModal.value = true
  isEditingInModal.value = false
  activeTab.value = 'details'

  try {
    const fullDetails = await loanApplicationStore.fetchLoanApplicationById(draft.id)
    selectedDraft.value = fullDetails
    await loanApplicationStore.fetchDocuments(draft.id)
    try {
      selectedContract.value = await loanContractStore.fetchContract(draft.id)
    } catch (e) {
      console.log('Contract not found or error fetching:', e)
    }
    if (fullDetails.customer_id) await loadCustomerLocations(fullDetails.customer_id)
  } catch (error) {
    alert.error('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຮ່າງສິນເຊື່ອແບບເຕັມໄດ້.')
    closeDetailsModal()
  }
}

// Location Maps
const loadCustomerLocations = async (customerId: number) => {
  isLocationLoading.value = true
  try {
    const { getCustomerLocations } = await import('@/api/customer')
    const response = await getCustomerLocations(customerId)
    customerLocations.value = response.data || response || []
  } catch (error) { customerLocations.value = [] } finally { isLocationLoading.value = false }
}
const handleAddLocation = async (locationData: Omit<CustomerLocation, 'id'>) => {
  try {
    const { createCustomerLocation } = await import('@/api/customer')
    await createCustomerLocation(locationData.customer_id, locationData)
    alert.success('ເພີ່ມທີ່ຢູ່ສຳເລັດ!')
    await loadCustomerLocations(locationData.customer_id)
  } catch (error: any) { alert.error('ເພີ່ມທີ່ຢູ່ລົ້ມເຫຼວ', error.message) }
}
const handleUpdateLocation = async (id: number, locationData: Partial<CustomerLocation>) => {
  try {
    const { updateCustomerLocation } = await import('@/api/customer')
    await updateCustomerLocation(id, locationData)
    alert.success('ແກ້ໄຂທີ່ຢູ່ສຳເລັດ!')
    if (selectedDraft.value?.customer_id) await loadCustomerLocations(selectedDraft.value.customer_id)
  } catch (error: any) { alert.error('ແກ້ໄຂທີ່ຢູ່ລົ້ມເຫຼວ', error.message) }
}
const handleDeleteLocation = async (id: number) => {
  try {
    const { deleteCustomerLocation } = await import('@/api/customer')
    await deleteCustomerLocation(id)
    alert.success('ລຶບທີ່ຢູ່ສຳເລັດ!')
    if (selectedDraft.value?.customer_id) await loadCustomerLocations(selectedDraft.value.customer_id)
  } catch (error: any) { alert.error('ລຶບທີ່ຢູ່ລົ້ມເຫຼວ', error.message) }
}
const handleSetPrimary = async (id: number) => {
  try {
    const { updateCustomerLocation } = await import('@/api/customer')
    await updateCustomerLocation(id, { is_primary: 1 })
    alert.success('ຕັ້ງເປັນທີ່ຢູ່ຫຼັກສຳເລັດ!')
    if (selectedDraft.value?.customer_id) await loadCustomerLocations(selectedDraft.value.customer_id)
  } catch (error: any) { alert.error('ຕັ້ງເປັນທີ່ຢູ່ຫຼັກລົ້ມເຫຼວ', error.message) }
}

// Advanced Form Logic
const handleRequestFormSave = async (customerId: number, formData: any) => {
  if (!selectedDraft.value) return
  try {
    if (!formData || !formData.customer) throw new Error('ข้อมูลฟอร์มไม่ถูกต้อง')
    const formatAddress = (addr: any): string => {
      if (!addr || typeof addr !== 'object') return ''
      return [addr.village, addr.district, addr.province].filter((p: any) => p && typeof p === 'string' && p.trim()).join(', ')
    }
    const parseName = (fullName: any) => {
      if (!fullName || typeof fullName !== 'string') return { first_name: '', last_name: '' }
      const trimmed = fullName.trim()
      if (!trimmed) return { first_name: '', last_name: '' }
      const parts = trimmed.split(/\s+/)
      return { first_name: parts[0] || '', last_name: parts.slice(1).join(' ') || '' }
    }
    const { first_name, last_name } = parseName(formData.customer.fullname)

    const updateData = {
      company_name: formData.work?.companyName || '',
      address: formatAddress(formData.customer.address),
      phone: formData.customer.phone || '',
      business_type: formData.work?.businessType || '',
      business_details: formData.work?.businessDetail || '',
      duration_years: formData.work?.durationYears || 0,
      duration_months: formData.work?.durationMonths || 0,
      department: formData.work?.department || '',
      position: formData.work?.position || '',
      salary: Number(formData.work?.salary) || 0,

      name: formData.guarantor?.name || '',
      identity_number: formData.guarantor?.idCard || '',
      occupation: formData.guarantor?.occupation || '',
      relationship: formData.guarantor?.relationship || '',
      Guarantorphone: formData.guarantor.phone || '',
      GuarantorDOB: formData.guarantor.dob || '',
      GuatantorAGE: formData.guarantor?.age || 0,

      Guarantoraddress: formatAddress(formData.guarantor?.address),
      work_company_name: formData.guarantor?.work?.companyName || '',

      work_location: formatAddress(formData.guarantor?.work?.address),
      work_phone: formData.guarantor.work.phone || '',
      work_position: formData.guarantor?.work?.position || '',
      work_salary: String(formData.guarantor?.work?.salary || '0'),

      first_name: first_name,
      last_name: last_name,
      identity_card: formData.customer.idCard
    }

    const CustLoanData = {
      customer_id: selectedDraft.value.customer_id,
      identity_number: formData.customer.idCard,
      census_number: formData.customer.censusNo,
      first_name: first_name,
      last_name: last_name,
      phone: formData.customer.phone,
      address: formatAddress(formData.customer.address),
      date_of_birth: formData.customer.dob,
      age: formData.customer.age,
      occupation: formData.customer.occupation,
      income_per_month: selectedDraft.value.customer?.income_per_month,
      other_debt: selectedDraft.value.customer?.other_debts,
      unit: formData.customer.unit,
      issue_place: formData.customer.issuePlace,
      issue_date: formData.customer.issueDate,

      product_id: selectedDraft.value.product_id,
      total_amount: Number(formData.product.price) || 0,
      interest_rate_at_apply: Number(formData.product.interestRate) || 0,

      interest_type: formData.product.interestType, // 🟢 ເພີ່ມບັນທັດນີ້
      interest_rate_type: formData.product.interestRateType, // 🟢 ເພີ່ມບັນທັດນີ້

      monthly_pay: Number(formData.product.monthlyPayment) || 0,
      loan_period: Number(formData.product.loanTerm) || 0,
      down_payment: Number(formData.product.downPayment) || 0,
      fee: Number(formData.product.fee) || 0,
      first_installment_amount: Number(formData.product.firstInstallment) || null,
      payment_day: Number(formData.product.paymentDay) || null,
      borrower_signature_date: formData.signatures.borrowerDate || null,
      guarantor_signature_date: formData.signatures.guarantorDate || null,
      staff_signature_date: formData.signatures.staffDate || null

    }

    const { saveCustProposal } = await import('@/api/proposal')
    await saveCustProposal(selectedDraft.value.customer_id, selectedDraft.value.id, updateData)
    await loanApplicationStore.updateDraftLoanApplication(selectedDraft.value.id, CustLoanData)
    alert.success('ບັນທຶກແບບຟອມຂໍກູ້ສຳເລັດ!')
    await loanApplicationStore.fetchLoanApplications({ status: LoanApplicationStatus.PENDING, is_confirmed: 0 })
    selectedDraft.value = loanApplicationStore.loanApplications.find(d => d.id === selectedDraft.value?.id) || null
  } catch (error: any) { alert.error('ເກີດຂໍ້ຜິດພາດ', error.message) }
}
const handleRequestFormUpdated = (updatedData: any) => {
  Object.assign(modalDraftForm, {
    customer_name: updatedData.customerName,
    customer_phone: updatedData.customerPhone,
  })
}

// Contract Form
const handleSaveContract = async (customerId: number, formData: any) => {
  if (!selectedDraft.value) return
  try {
    const formatAddress = (addr: any) => addr ? [addr.village, addr.district, addr.province].filter(Boolean).join(', ') : ''
    const contractData: CreateLoanContractRequest = {
      loanId: selectedDraft.value.id,
      cusFullName: formData.customer.fullname,
      cusSex: formData.customer.gender,
      cusDateOfBirth: formData.customer.dob,
      cusPhone: formData.customer.phone,
      cusMaritalStatus: formData.customer.maritalStatus,
      cusIdPassNumber: formData.customer.idCard,
      cusIdPassDate: formData.customer.idCardIssueDate,
      cusCensusNumber: formData.customer.censusBook,
      cusCensusCreated: formData.customer.idCardExpiryDate,
      cusCensusAuthorizeBy: formData.customer.censusAuthorizeBy,
      cusHouseNumber: formData.customer.houseNumber,
      cusUnit: Number(formData.customer.unit) || 0,
      cusAddress: formatAddress(formData.customer.address),
      cusLivedYear: Number(formData.customer.residenceYears) || 0,
      cusLivedWith: formData.customer.liveWith,
      cusLivedSituation: formData.customer.residenceStatus,
      cusOccupation: formData.customer.occupation,
      cusCompanyName: formData.work.companyName,
      cusCompanyBusinessType: formData.work.businessType,
      cusCompanyLocation: formatAddress(formData.work.address),
      cusCompanyWorkYear: Number(formData.work.workYears) || 0,
      cusPosition: formData.work.position,
      cusIncome: Number(formData.work.salary) || 0,
      cusPayrollDate: String(formData.work.salaryDay || ''),
      cusCompanyEmpNumber: Number(formData.work.totalEmployees) || 0,
      cusIncomeOther: Number(formData.work.otherIncome) || 0,
      cusIncomeOtherSource: formData.work.otherIncomeSource,

      productDetail: formData.product.description,
      producttypeId: selectedDraft.value.product?.productType_id || null,
      productBrand: formData.product.brand,
      productModel: formData.product.model,
      productPrice: Number(formData.product.price) || 0,
      productDownPayment: Number(formData.product.downPayment) || 0,
      totalAmount: Number(formData.product.approvedAmount) || 0,
      interestRateAtApply: Number(formData.product.interestRate) || 0,
      loanPeriod: Number(formData.product.loanTerm) || 0,
      totalInterest: Number(formData.product.totalInterest) || 0,
      fee: Number(formData.product.fee) || 0,
      monthlyPay: Number(formData.product.monthlyPayment) || 0,
      firstInstallmentAmount: Number(formData.product.firstInstallment) || 0,
      paymentDay: Number(formData.product.paymentDay) || 0,

      motorId: formData.product.motorcycle?.engineNo || '',
      motorColor: formData.product.motorcycle?.color || '',
      tankNumber: formData.product.motorcycle?.chassisNo || '',
      motorWarranty: Number(formData.product.motorcycle?.insurance) || 0,

      partnerId: (selectedDraft.value as any).product?.partner?.id || null,
      shopBranch: formData.shop.branch,
      shopId: formData.shop.code,

      refName: formData.guarantor.fullname,
      refDateOfBirth: formData.guarantor.dob,
      refPhone: formData.guarantor.phone,
      refSex: formData.guarantor.gender,
      refMaritalStatus: formData.guarantor.maritalStatus,
      refIdPassNumber: formData.guarantor.idCard,
      refIdPassDate: formData.guarantor.idCardIssueDate,
      refCensusNumber: formData.guarantor.censusBook,
      refCensusCreated: formData.guarantor.censusBookIssueDate,
      refCensusAuthorizeBy: formData.guarantor.censusAuthorizeBy,
      refHouseNumber: formData.guarantor.houseNumber,
      refUnit: Number(formData.guarantor.unit) || 0,
      refAddress: formatAddress(formData.guarantor.address),
      refLivedYear: Number(formData.guarantor.residenceYears) || 0,
      refLivedWith: formData.guarantor.liveWith,
      refLivedSituation: formData.guarantor.residenceStatus,
      refOccupation: formData.guarantor.occupation,
      refRelationship: formData.guarantor.relationship,

      refCompanyName: formData.guarantorWork.companyName,
      refCompanyBusinessType: formData.guarantorWork.businessType,
      refCompanyLocation: formatAddress(formData.guarantorWork.address),
      refCompanyWorkYear: Number(formData.guarantorWork.workYears) || 0,
      refPosition: formData.guarantorWork.position,
      refIncome: Number(formData.guarantorWork.salary) || 0,
      refPayrollDate: String(formData.guarantorWork.salaryDay || ''),
      refCompanyEmpNumber: Number(formData.guarantorWork.totalEmployees) || 0,
      refIncomeOther: Number(formData.guarantorWork.otherIncome) || 0,
      refIncomeOtherSource: formData.guarantorWork.otherIncomeSource
    } as any;
    await loanContractStore.createContract(selectedDraft.value.id, contractData)
    alert.success('ບັນທຶກສັນຍາສຳເລັດ!')
    isEditingInModal.value = false
    await loanApplicationStore.fetchLoanApplications({ status: LoanApplicationStatus.PENDING, is_confirmed: 0 })
  } catch (error: any) { alert.error('ເກີດຂໍ້ຜິດພາດ', error.message) }
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedDraft.value = null
  isEditingInModal.value = false
  activeTab.value = 'details'
  customerLocations.value = []
  modalProductSearch.value = ''
  showModalProductDropdown.value = false
  selectedModalProduct.value = null
  modalShopId.value = null
  productStore.products = []
  draftDocuments.value.forEach(doc => { doc.file = null; doc.preview = null })
  optionalDocuments.value.forEach(doc => { doc.file = null; doc.preview = null })
}

// 🟢 ເປີດໂໝດແກ້ໄຂ
const startEditInModal = async () => {
  if (!selectedDraft.value) return
  let draftData = selectedDraft.value
  if (typeof draftData === 'string') {
    try { draftData = JSON.parse(draftData) } catch (e) { return }
  }

  const shopId = (draftData as any).partner_id || (draftData.product as any)?.partner_id || null
  modalShopId.value = shopId

  if (shopId) {
    try {
      await productStore.fetchProducts({ shop_id: shopId, limit: 100 })
      if (draftData.product_id) {
        const currentProduct = productStore.products.find(p => p.id === draftData!.product_id)
        if (currentProduct) {
          selectedModalProduct.value = currentProduct
          modalProductSearch.value = currentProduct.product_name
        }
      }
      if (draftData.product?.productType_id) {
        const matchingType = productStore.productTypes.find(t => t.id === draftData!.product?.productType_id)
        if (matchingType) modalDraftForm.product_type = matchingType.type_name
      }
    } catch (error) { console.error('❌ Failed to load products:', error) }
  } else { productStore.products = [] }

  modalDraftForm.customer_name = getDraftDisplayName(draftData)
  modalDraftForm.customer_phone = getDraftPhone(draftData)
  modalDraftForm.customer_id_card = draftData.customer?.identity_number || ''
  modalDraftForm.customer_address = getDraftAddress(draftData)
  modalDraftForm.occupation = draftData.customer?.occupation || ''
  modalDraftForm.age = draftData.customer?.age || 0
  modalDraftForm.product_name = getProductName(draftData)

  // 🟢 บังคับให้ปัดเศษและเป็น Number ที่ถูกต้อง
  modalDraftForm.total_amount = Math.round(Number(draftData.total_amount || 0))
  modalDraftForm.down_payment = Math.round(Number(draftData.down_payment || 0))
  modalDraftForm.interest_rate = Number(draftData.interest_rate_at_apply || 0)
  modalDraftForm.loan_period = Number(draftData.loan_period || 0)
  modalDraftForm.income_per_month = Math.round(Number(draftData.customer?.income_per_month || 0))
  modalDraftForm.other_debts = Math.round(Number(draftData.customer?.other_debts || 0))

  modalDraftForm.interest_type = (draftData as any).interest_type || 'flat_rate'
   modalDraftForm.interest_rate_type = (draftData as any).interest_rate_type || 'monthly'

  // 🟢 บังคับคำนวณค่างวดทันทีที่เปิด Modal เพื่อไม่ให้แสดงเป็น 0
  modalDraftForm.monthly_payment = calculateModalMonthlyPayment()

  isEditingInModal.value = true
  activeTab.value = 'details'
}

// 🟢 ບັນທຶກ Draft
const saveDraftFromModal = async () => {
  if (!selectedDraft.value) return
  if (!validateModalForm()) { alert.error('ກະລຸນາກວດສອບຂໍ້ມູນທີ່ປ້ອນ'); return }

  try {
    const nameParts = modalDraftForm.customer_name.trim().split(' ')
    const firstName = nameParts[0] || modalDraftForm.customer_name
    const lastName = nameParts.slice(1).join(' ') || ''
    const productIdToUpdate = selectedModalProduct.value?.id || selectedDraft.value.product_id
    const fee = 20000

    const updateData: any = {
      product_id: productIdToUpdate,
      customer_id: selectedDraft.value?.customer_id,
      first_name: firstName,
      last_name: lastName,

      age: Number(modalDraftForm.age),
      phone: modalDraftForm.customer_phone.trim(),
      identity_number: modalDraftForm.customer_id_card.trim(),
      address: modalDraftForm.customer_address.trim(),
      occupation: modalDraftForm.occupation.trim(),

      income_per_month: modalDraftForm.income_per_month,
      other_debts: modalDraftForm.other_debts || 0,
      interest_type: modalDraftForm.interest_type,
      interest_rate_type: modalDraftForm.interest_rate_type,

      total_amount: Number(modalDraftForm.total_amount) || 0,
      down_payment: Number(modalDraftForm.down_payment) || 0,
      interest_rate_at_apply: Number(modalDraftForm.interest_rate) || 0,
      loan_period: Number(modalDraftForm.loan_period) || 0,
      monthly_pay: Number(modalDraftForm.monthly_payment) || 0,
      first_installment_amount: Number(modalDraftForm.monthly_payment || 0) + Number(fee), // 🟢 เพิ่มฟิeld นี้เพื่อให้แน่ใจว่ามีค่า
    }

    await loanApplicationStore.updateDraftLoanApplication(selectedDraft.value.id, updateData)

    if (selectedDraft.value.id) {
      isUploadingDocuments.value = true
      const allDocs = [...draftDocuments.value, ...optionalDocuments.value].filter(doc => doc.file)
      for (const doc of allDocs) {
        if (doc.file) {
          await loanApplicationStore.uploadDocument(selectedDraft.value.id, doc.file, doc.id)
        }
      }
      await loanApplicationStore.fetchDocuments(selectedDraft.value.id)
      isUploadingDocuments.value = false
    }

    alert.success('ບັນທຶກການປ່ຽນແປງສຳເລັດ!')
    isEditingInModal.value = false
    await loanApplicationStore.fetchLoanApplications({ status: LoanApplicationStatus.PENDING, is_confirmed: 0 })
  } catch (error: any) { alert.error('ເກີດຂໍ້ຜິດພາດ', error.message) }
}

const deleteDraft = async (draftId: number) => {
  if (!await alert.confirm('ຕ້ອງການລຶບຮ່າງສິນເຊື່ອນີ້ບໍ?')) return
  try {
    await loanApplicationStore.updateLoanApplication(draftId, { status: LoanApplicationStatus.REJECTED, remarks: 'ລຶບຮ່າງ' })
    alert.success('ລຶບຮ່າງສິນເຊື່ອສຳເລັດ!')
    if (selectedDraft.value?.id === draftId) closeDetailsModal()
    await loanApplicationStore.fetchLoanApplications({ status: LoanApplicationStatus.PENDING, is_confirmed: 0 })
  } catch (error: any) { alert.error('ເກີດຂໍ້ຜິດພາດ', error.message) }
}
// 🟢 ເພີ່ມຟັງຊັນກວດສອບເອກະສານກ່ອນສົ່ງຮ່າງ
const confirmSubmitDraft = async (draft: LoanApplication) => {
  if (!draft.id) return;

  try {
    // 1. ໂຫຼດຂໍ້ມູນເອກະສານຫຼ້າສຸດຂອງຮ່າງນີ້ມາກວດສອບກ່ອນ
    await loanApplicationStore.fetchDocuments(draft.id);
    const uploadedDocs = loanApplicationStore.currentDocuments || [];

    // 2. ກວດສອບວ່າອັບໂຫຼດຄົບຕາມເງື່ອນໄຂແລ້ວຫຼືຍັງ (id_card, house_reg, salary_slip)
    const hasIdCard = uploadedDocs.some(doc => doc.document_type === 'id_card' || doc.doc_type === 'id_card');
    const hasHouseReg = uploadedDocs.some(doc => doc.document_type === 'house_reg' || doc.doc_type === 'house_reg');
    const hasSalarySlip = uploadedDocs.some(doc => doc.document_type === 'salary_slip' || doc.doc_type === 'salary_slip');

    const missingDocs = [];
    if (!hasIdCard) missingDocs.push('ບັດປະຈຳຕົວ');
    if (!hasHouseReg) missingDocs.push('ໃບຄອບຄົວ');
    if (!hasSalarySlip) missingDocs.push('ຫຼັກຖານລາຍຮັບ (ໃບເງິນເດືອນ)');

    // 3. ຖ້າບໍ່ຄົບ ໃຫ້ແຈ້ງເຕືອນ ແລະ ຢຸດການເຮັດວຽກ (ບໍ່ເປີດ Modal)
    if (missingDocs.length > 0) {
      alert.error(
        'ເອກະສານບໍ່ຄົບຖ້ວນ',
        `ກະລຸນາອັບໂຫຼດເອກະສານລຸ່ມນີ້ໃຫ້ຄົບກ່ອນສົ່ງຮ່າງ:\n\n- ${missingDocs.join('\n- ')}`
      );
      return;
    }

    // 4. ຖ້າເອກະສານຄົບແລ້ວ ຈຶ່ງອະນຸຍາດໃຫ້ເປີດ Modal ຢືນຢັນ
    draftToSubmit.value = draft;
    showSubmitModal.value = true;

  } catch (error: any) {
    console.error("Error checking documents:", error);
    alert.error('ເກີດຂໍ້ຜິດພາດ', 'ບໍ່ສາມາດກວດສອບເອກະສານໄດ້ ກະລຸນາລອງໃໝ່');
  }
}

// 🟢 ຟັງຊັນສົ່ງຮ່າງ (Submit Draft) ແບບບໍ່ຕ້ອງໃຊ້ OTP
const submitDraft = async () => {
  if (!draftToSubmit.value) return;

  isVerifying.value = true;
  try {
    // ອັບເດດສະຖານະແຈ້ງ Backend ວ່າ Confirm ແລ້ວ (is_confirmed: 1)
    // ທ່ານສາມາດປັບຊື່ Endpoint API ຕາມທີ່ Backend ທ່ານຮອງຮັບໄດ້ເລີຍ (ApplyDraft ຫຼື updateStatus)
    const confirmData: ConfirmDraftDto = {
      is_confirmed: 1,
      status: LoanApplicationStatus.PENDING // ຫຼື 'verifying' ແລ້ວແຕ່ Flow ລະບົບທ່ານ
    } as any;

    await loanApplicationStore.ApplyDraft(draftToSubmit.value.id, confirmData);

    alert.success('ສົ່ງຄຳຂໍສິນເຊື່ອສຳເລັດແລ້ວ!');

    showSubmitModal.value = false;

    // ປິດ Modal ລາຍລະອຽດ ຖ້າມັນເປີດຢູ່
    if (selectedDraft.value?.id === draftToSubmit.value.id) {
      closeDetailsModal();
    }

    draftToSubmit.value = null;

    // Refresh ໜ້າຈໍ ດຶງຂໍ້ມູນໃໝ່ (ເຫຼືອແຕ່ອັນທີ່ຍັງບໍ່ Submit)
    await loanApplicationStore.fetchLoanApplications({
      status: LoanApplicationStatus.PENDING,
      is_confirmed: 0
    });

  } catch (error: any) {
    alert.error('ເກີດຂໍ້ຜິດພາດໃນການສົ່ງຄຳຂໍ', error.message || 'ກະລຸນາລອງໃໝ່ອີກຄັ້ງ');
  } finally {
    isVerifying.value = false;
  }
}
const requestOtp = async () => {
  if (!draftToSubmit.value?.customer?.phone) { alert.error('ບໍ່ພົບເບີໂທລະສັບ'); return }
  try { await requestOtpForCustomer({ phone: draftToSubmit.value.customer.phone }) }
  catch (error: any) { alert.error('ເກີດຂໍ້ຜິດພາດການສົ່ງ OTP', error.message) }
}
const verifyAndSubmitDraft = async () => {
  if (!otpCode.value || otpCode.value.length !== 6) { otpError.value = 'ກະລຸນາປ້ອນລະຫັດ OTP 6 ຕົວ'; return }
  if (!draftToSubmit.value || !draftToSubmit.value.customer?.phone) { alert.error('ຂໍ້ມູນລູກຄ້າບໍ່ຄົບຖ້ວນ'); return }

  isVerifying.value = true
  otpError.value = ''
  try {
    const confirmData: ConfirmDraftDto = { phone: draftToSubmit.value.customer.phone, otp: otpCode.value.trim(), is_confirmed: 1 }
    await loanApplicationStore.ApplyDraft(draftToSubmit.value.id, confirmData)
    alert.success('ສົ່ງຮ່າງສິນເຊື່ອສຳເລັດ!')
    showOtpModal.value = false
    if (selectedDraft.value?.id === draftToSubmit.value.id) closeDetailsModal()
    draftToSubmit.value = null
    otpCode.value = ''
    await loanApplicationStore.fetchLoanApplications({ status: LoanApplicationStatus.PENDING, is_confirmed: 0 })
  } catch (error: any) { otpError.value = error.message || 'ເກີດຂໍ້ຜິດພາດການຢືນຢັນ OTP' } finally { isVerifying.value = false }
}
const closeOtpModal = () => { showOtpModal.value = false; otpCode.value = ''; otpError.value = ''; draftToSubmit.value = null }
const exportToCSV = () => {
  if (!displayedDrafts.value.length) return
  const csvData = displayedDrafts.value.map(draft => ({
    'Loan ID': draft.loan_id, 'ລູກຄ້າ': getDraftDisplayName(draft), 'ເບີໂທ': getDraftPhone(draft),
    'ສິນຄ້າ': getProductName(draft), 'ຈຳນວນເງິນ': formatPrice(draft.total_amount), 'ດອກເບ້ຍ (%)': draft.interest_rate_at_apply,
    'ໄລຍະເວລາ (ເດືອນ)': draft.loan_period, 'ເຈົ້າໜ້າທີ່': getRequesterName(draft), 'ວັນທີ່ສ້າງ': draft.createdAt ? formatDate(draft.createdAt) : '-'
  }))
  const csv = Papa.unparse(csvData)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `draft_loans_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}
const previousPage = () => { if (hasPreviousPage.value) currentPage.value-- }
const nextPage = () => { if (hasNextPage.value) currentPage.value++ }
watch(pageSize, () => currentPage.value = 1)
onMounted(async () => {
  try {
    await Promise.all([
      loanApplicationStore.fetchLoanApplications({ status: LoanApplicationStatus.PENDING, is_confirmed: 0 }),
      productStore.fetchProductTypes(),
      shopStore.fetchAllShop() // 🟢 ໂຫຼດຮ້ານຄ້າໃນຕອນເລີ່ມຕົ້ນ
    ])
  } catch (error) { console.error('❌ Failed to load applications:', error) }
})
</script>
