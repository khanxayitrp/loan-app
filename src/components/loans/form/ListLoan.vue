<template>
  <div class="p-6">
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ລາຍການສິນເຊື່ອ</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">ຈັດການຄຳຂໍສິນເຊື່ອ</p>
      </div>
      <!-- Export Button -->
      <button @click="exportToCSV" class="btn btn-outline btn-sm whitespace-nowrap">
        <span class="icon-[tabler--file-export] size-4 mr-1"></span>
        Export CSV
      </button>
    </div>

    <!-- Filter Section -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <!-- Search Input -->
      <div>
        <label class="label">
          <span class="label-text text-sm font-medium">ຄົ້ນຫາ</span>
        </label>
        <input v-model="searchQuery" type="text" placeholder="ຊື່ລູກຄ້າ, ເບີໂທ..." class="input input-bordered w-full"
          @input="debounceSearch" />
      </div>
      <!-- Status Filter -->
      <div>
        <label class="label">
          <span class="label-text text-sm font-medium">ສະຖານະ</span>
        </label>
        <select v-model="statusFilter" class="select select-bordered w-full">
          <option value="">ທັງໝົດສະຖານະ</option>
          <option value="pending">ລໍຖ້າ</option>
          <option value="verifying">ກຳລັງກວດ</option>
          <option value="approved">ອະນຸມັດ</option>
          <option value="rejected">ປະຕິເສດ</option>
          <option value="disbursed">ຈ່າຍເງິນແລ້ວ</option>
          <option value="closed">ປິດສິນເຊື່ອ</option>
        </select>
      </div>
      <!-- Date Range Filter -->
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

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="loading loading-spinner"></div>
    </div>

    <!-- Table -->
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
          <tr v-for="loan in displayedLoans" :key="loan.id">
            <!-- Customer Name -->
            <td class="font-medium">
              <div>{{ getCustomerName(loan) }}</div>
              <div class="text-sm text-gray-500">{{ getCustomerPhone(loan) }}</div>
            </td>
            <!-- Product -->
            <td>
              <div>{{ getProductName(loan) }}</div>
              <div class="text-sm text-gray-500">{{ getProductType(loan) }}</div>
            </td>
            <!-- Amount -->
            <td class="font-medium">{{ formatPrice(loan.total_amount) }}</td>
            <!-- Staff -->
            <td>{{ getRequesterName(loan) }}</td>
            <!-- Status -->
            <td>
              <span class="badge badge-soft" :class="getStatusBadgeClass(loan.status)">
                {{ getStatusText(loan.status) }}
              </span>
            </td>
            <!-- Created At -->
            <td>{{ formatDate(loan.created_at || loan.createdAt) }}</td>
            <!-- Actions -->
            <td>
              <div class="flex gap-2">
                <!-- 🟢 Details/Edit -->
                <button class="btn btn-circle btn-text btn-sm" @click="viewLoanDetails(loan)" aria-label="View details"
                  title="ລາຍລະອຽດ">
                  <span class="icon-[tabler--eye] size-4"></span>
                </button>

                <!-- 🟢 Schedule / Repayment Modal -->
                <button class="btn btn-circle btn-text btn-sm text-info" @click="viewSchedule(loan)"
                  aria-label="View Schedule" title="ຕາຕະລາງຜ່ອນຊຳລະ">
                  <span class="icon-[tabler--calendar-stats] size-4"></span>
                </button>

                <!-- 🟢 Quick Edit -->
                <button v-if="loan.status !== 'closed' && loan.status !== 'disbursed'"
                  class="btn btn-circle btn-text btn-sm" @click="editLoan(loan)" aria-label="Edit loan" title="ແກ້ໄຂ">
                  <span class="icon-[tabler--edit] size-4"></span>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="displayedLoans.length === 0">
            <td colspan="7" class="text-center py-8 text-base-content/60">
              {{ isLoading ? 'ກຳລັງໂຫຼດ...' : 'ບໍ່ມີຂໍ້ມູນສິນເຊື່ອ' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="!isLoading" class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm">
      <div>
        ສະແດງ {{ startIndex }} - {{ endIndex }} ຈາກ {{ totalLoans }} ລາຍການ
      </div>
      <div class="flex items-center gap-2">
        <select v-model.number="pageSize" class="select select-sm select-bordered">
          <option :value="10">10 ຕໍ່ໜ້າ</option>
          <option :value="25">25 ຕໍ່ໜ້າ</option>
          <option :value="50">50 ຕໍ່ໜ້າ</option>
        </select>
        <button class="btn btn-sm" :disabled="!hasPreviousPage" @click="previousPage">
          ກ່ອນໜ້າ
        </button>
        <span class="px-2"> ໜ້າ {{ currentPage }} / {{ totalPages }} </span>
        <button class="btn btn-sm" :disabled="!hasNextPage" @click="nextPage">
          ຖັດໄປ
        </button>
      </div>
    </div>

    <!-- 🟢 Loan Details & Edit Modal 🟢 -->
    <teleport to="body">
      <div v-if="showDetailsModal && selectedLoan"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
          <!-- Modal Header -->
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold">
              {{ isEditingInModal ? 'ແກ້ໄຂຂໍ້ມູນສິນເຊື່ອ' : 'ລາຍລະອຽດສິນເຊື່ອ' }}
            </h3>
            <button @click="closeDetailsModal" class="text-gray-400 hover:text-gray-600">
              <span class="icon-[tabler--x] size-5"></span>
            </button>
          </div>

          <!-- Tab Navigation -->
          <div class="tabs tabs-boxed mb-6 flex-wrap gap-1">
            <button class="tab" :class="{ 'tab-active': activeTab === 'details' }" @click="activeTab = 'details'">
              ລາຍລະອຽດ
            </button>
            <button class="tab" :class="{ 'tab-active': activeTab === 'documents' }" @click="activeTab = 'documents'">
              ເອກະສານ
            </button>
            <button class="tab" :class="{ 'tab-active': activeTab === 'map' }" @click="activeTab = 'map'"
              :disabled="!selectedLoan?.customer_id">
              <span class="icon-[tabler--map] size-4 mr-1"></span>
              ແຜນທີ່
            </button>
            <button class="tab" :class="{ 'tab-active': activeTab === 'requestForm' }"
              @click="activeTab = 'requestForm'">
              <span class="icon-[tabler--file-text] size-4 mr-1"></span>
              ແບບຟອມຂໍກູ້
            </button>
            <button class="tab" :class="{ 'tab-active': activeTab === 'loanContract' }"
              @click="activeTab = 'loanContract'">
              <span class="icon-[tabler--file-invoice] size-4 mr-1"></span>
              ສັນຍາກູ້ຢືມ
            </button>
          </div>

          <!-- Tab Content: Details -->
          <div v-if="activeTab === 'details'" class="space-y-6">
            <!-- 👁️ View Mode -->
            <div v-if="!isEditingInModal" class="space-y-6">
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h4 class="font-medium text-lg mb-4 flex items-center gap-2">
                  <span class="icon-[tabler--file-invoice] size-5 text-primary"></span>
                  ຂໍ້ມູນສິນເຊື່ອ
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium text-gray-500">ເລກທີ່ສິນເຊື່ອ</label>
                    <p class="font-medium text-lg text-primary">{{ selectedLoan.loan_id }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">ສະຖານະ</label><br>
                    <span class="badge badge-soft mt-1" :class="getStatusBadgeClass(selectedLoan.status)">
                      {{ getStatusText(selectedLoan.status) }}
                    </span>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">ຈຳນວນເງິນກູ້</label>
                    <p class="font-medium text-xl text-primary">{{ formatPrice(selectedLoan.total_amount - selectedLoan.down_payment) }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">ອັດຕາດອກເບ້ຍ</label>
                    <p class="font-medium">{{ selectedLoan.interest_rate_at_apply }}%
                      <span class="text-primary text-xs">{{ selectedLoan.interest_rate_type === 'yearly' ? '(ຕໍ່ປີ)' :
                        '(ຕໍ່ເດືອນ)' }}</span>
                    </p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">ໄລຍະເວລາ</label>
                    <p class="font-medium">{{ selectedLoan.loan_period }} ເດືອນ</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">ຄ່າງວດຕໍ່ເດືອນ</label>
                    <p class="font-medium text-lg text-success">{{ formatPrice(selectedLoan.monthly_pay) }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">ເຈົ້າໜ້າທີ່ຮັບຜິດຊອບ</label>
                    <p>{{ getRequesterName(selectedLoan) }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">ວັນທີ່ສ້າງ</label>
                    <p>{{ formatDate(selectedLoan.created_at || selectedLoan.createdAt) }}</p>
                  </div>
                </div>
              </div>

              <div v-if="selectedLoan.customer" class="border-t pt-6">
                <h4 class="font-medium text-lg mb-4 flex items-center gap-2">
                  <span class="icon-[tabler--user] size-5 text-primary"></span>
                  ຂໍ້ມູນລູກຄ້າ
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium text-gray-500">ຊື່ ແລະ ນາມສະກຸນ</label>
                    <p class="font-medium">{{ getCustomerName(selectedLoan) }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">ເບີໂທລະສັບ</label>
                    <p class="font-medium">{{ getCustomerPhone(selectedLoan) }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">ເລກບັດປະຈຳຕົວ</label>
                    <p>{{ selectedLoan.customer.identity_number || '-' }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">ອາຊີບ</label>
                    <p>{{ selectedLoan.customer.occupation || '-' }}</p>
                  </div>
                  <div class="md:col-span-2">
                    <label class="text-sm font-medium text-gray-500">ທີ່ຢູ່</label>
                    <p class="whitespace-pre-line">{{ getCustomerAddress(selectedLoan) }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">ລາຍຮັບຕໍ່ເດືອນ</label>
                    <p class="font-medium text-success">{{ formatPrice(selectedLoan.customer.income_per_month || 0) }}
                    </p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">ໜີ້ສິນອື່ນໆ</label>
                    <p class="font-medium text-error">{{ formatPrice(selectedLoan.customer.other_debts || 0) }}</p>
                  </div>
                </div>
              </div>

              <div v-if="selectedLoan.product" class="border-t pt-6">
                <h4 class="font-medium text-lg mb-4 flex items-center gap-2">
                  <span class="icon-[tabler--box] size-5 text-primary"></span>
                  ຂໍ້ມູນສິນຄ້າ
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium text-gray-500">ຊື່ສິນຄ້າ</label>
                    <p class="font-medium">{{ getProductName(selectedLoan) }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">ປະເພດ</label>
                    <p>{{ getProductType(selectedLoan) }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">ລາຄາສິນຄ້າ</label>
                    <p class="font-medium text-primary">{{ formatPrice(selectedLoan.product.price) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- ✏️ Edit Mode -->
            <div v-else class="space-y-6">
              <div>
                <h4 class="font-medium text-lg mb-4 flex items-center gap-2">
                  <span class="icon-[tabler--user-edit] size-5 text-primary"></span>
                  ແກ້ໄຂຂໍ້ມູນລູກຄ້າ
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ຊື່ ແລະ ນາມສະກຸນ *</span></label>
                    <input v-model="modalLoanForm.customer_name" type="text" class="input input-bordered w-full"
                      :class="{ 'input-error': modalFormErrors.customer_name }" required />
                    <label v-if="modalFormErrors.customer_name" class="label text-error">
                      <span class="label-text-alt">{{ modalFormErrors.customer_name }}</span>
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ເບີໂທລະສັບ *</span></label>
                    <input v-model="modalLoanForm.customer_phone" type="tel" class="input input-bordered w-full"
                      :class="{ 'input-error': modalFormErrors.customer_phone }" required />
                    <label v-if="modalFormErrors.customer_phone" class="label text-error">
                      <span class="label-text-alt">{{ modalFormErrors.customer_phone }}</span>
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ເລກບັດປະຈຳຕົວ *</span></label>
                    <input v-model="modalLoanForm.customer_id_card" type="text" class="input input-bordered w-full"
                      :class="{ 'input-error': modalFormErrors.customer_id_card }" required />
                    <label v-if="modalFormErrors.customer_id_card" class="label text-error">
                      <span class="label-text-alt">{{ modalFormErrors.customer_id_card }}</span>
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ອາຍຸ *</span></label>
                    <input v-model.number="modalLoanForm.age" type="number" class="input input-bordered w-full"
                      min="0" />
                    <label v-if="modalFormErrors.age" class="label text-error">
                      <span class="label-text-alt">{{ modalFormErrors.age }}</span>
                    </label>
                  </div>
                </div>
                <div class="form-control mt-4">
                  <label class="label">
                    <span class="label-text font-medium">ອາຊີບ *</span>
                    <span class="text-xs text-gray-500 ml-1">(ຂໍ້ມູນສຳຄັນສຳລັບການພິຈາລະນາສິນເຊື່ອ)</span>
                  </label>
                  <input v-model="modalLoanForm.occupation" type="text" class="input input-bordered w-full"
                    :class="{ 'input-error': modalFormErrors.occupation }" required />
                  <label v-if="modalFormErrors.occupation" class="label text-error">
                    <span class="label-text-alt">{{ modalFormErrors.occupation }}</span>
                  </label>
                </div>
                <div class="form-control mt-4">
                  <label class="label"><span class="label-text font-medium">ທີ່ຢູ່ *</span></label>
                  <textarea v-model="modalLoanForm.customer_address" class="textarea textarea-bordered w-full min-h-24"
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
                      {{ shop.shop_name }} </option>
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
                    <input type="text" :value="formatCurrencyInput(modalLoanForm.total_amount)"
                      class="input input-bordered w-full bg-gray-100 dark:bg-gray-700 cursor-not-allowed" readonly
                      required />
                  </div>
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">ຈຳນວນເງິນດາວ <span v-if="modalLoanForm.total_amount > 0"
                          class="text-xs text-gray-500">
                          ຍອດຈັດ: {{ formatPrice(Math.max(0, modalLoanForm.total_amount - (modalLoanForm.down_payment ||
                          0))) }}
                        </span></span>

                    </label>
                    <input type="text" :value="formatCurrencyInput(modalLoanForm.down_payment)"
                      @input="handleModalCurrencyInput('down_payment', $event)" class="input input-bordered w-full"
                      :class="{ 'input-error': modalFormErrors.down_payment }" />
                    <label v-if="modalFormErrors.down_payment" class="label text-error">
                      <span class="label-text-alt">{{ modalFormErrors.down_payment }}</span>
                    </label>
                  </div>

                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ໄລຍະເວລາ (ເດືອນ) *</span></label>
                    <input v-model.number="modalLoanForm.loan_period" type="number" class="input input-bordered w-full"
                      :class="{ 'input-error': modalFormErrors.loan_period }" min="1" max="60" required />
                    <label v-if="modalFormErrors.loan_period" class="label text-error">
                      <span class="label-text-alt">{{ modalFormErrors.loan_period }}</span>
                    </label>
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">ອັດຕາດອກເບ້ຍ * <span
                          class="badge badge-primary badge-sm badge-soft">
                          {{ modalLoanForm.interest_rate_type === 'yearly' ? '% ຕໍ່ປີ' : '% ຕໍ່ເດືອນ' }}
                        </span></span>
                    </label>
                    <input v-model.number="modalLoanForm.interest_rate" type="number"
                      class="input input-bordered w-full" :class="{ 'input-error': modalFormErrors.interest_rate }"
                      min="0" max="100" step="0.01" readonly required />
                    <label v-if="modalFormErrors.interest_rate" class="label text-error">
                      <span class="label-text-alt">{{ modalFormErrors.interest_rate }}</span>
                    </label>
                  </div>

                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ປະເພດດອກເບ້ຍ *</span></label>
                    <select v-model="modalLoanForm.interest_type" class="select select-bordered w-full bg-base-50">
                      <option value="flat_rate">ດອກເບ້ຍຄົງທີ່ (Flat Rate)</option>
                      <option value="effective_rate">ລົດຕົ້ນລົດດອກ (Effective Rate)</option>
                    </select>
                  </div>

                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ຄ່າງວດຕໍ່ເດືອນ</span></label>
                    <input :value="formatPrice(calculateModalMonthlyPayment())" type="text"
                      class="input input-bordered w-full bg-gray-100 dark:bg-gray-700 cursor-not-allowed" readonly />
                  </div>

                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ລາຍຮັບຕໍ່ເດືອນ *</span></label>
                    <input type="text" :value="formatCurrencyInput(modalLoanForm.monthly_income)"
                      @input="handleModalCurrencyInput('monthly_income', $event)" class="input input-bordered w-full"
                      :class="{ 'input-error': modalFormErrors.monthly_income }" />
                    <label v-if="modalFormErrors.monthly_income" class="label text-error">
                      <span class="label-text-alt">{{ modalFormErrors.monthly_income }}</span>
                    </label>
                  </div>

                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ໜີ້ສິນອື່ນໆ</span></label>
                    <input type="text" :value="formatCurrencyInput(modalLoanForm.other_debts)"
                      @input="handleModalCurrencyInput('other_debts', $event)" class="input input-bordered w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab Content: Documents -->
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
                      <span class="icon-[tabler--download] size-4 mr-1"></span>
                      ດາວໂຫຼດ
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
                  <div class="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div class="flex justify-between">
                      <span>ອັບໂຫຼດເມື່ອ:</span>
                      <span>{{ formatDate(doc.uploaded_at || doc.createdAt) }}</span>
                    </div>
                    <div class="flex justify-between mt-1">
                      <span>ຂະໜາດ:</span>
                      <span>{{ formatFileSize(doc.file_size) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="space-y-6">
              <div>
                <h4 class="font-medium mb-3 text-lg flex items-center gap-2">
                  <span class="icon-[tabler--file-check] size-5 text-error"></span>
                  ເອກະສານທີ່ຕ້ອງການ
                </h4>
                <div class="text-sm text-gray-500 mb-4">
                  ກະລຸນາອັບໂຫຼດເອກະສານທັງໝົດທີ່ຕ້ອງການເພື່ອດຳເນີນການຕໍ່
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div v-for="(doc, index) in loanDocuments" :key="index"
                    class="border-2 border-dashed rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                    <div class="flex items-center justify-between mb-3">
                      <div>
                        <h5 class="font-medium">{{ doc.name }}</h5>
                        <p class="text-xs text-gray-500 mt-1">{{ doc.description }}</p>
                      </div>
                      <span class="badge badge-soft badge-error text-xs">ຕ້ອງການ</span>
                    </div>
                    <div v-if="doc.preview" class="mt-3">
                      <div class="relative w-full h-40 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                        <img v-if="isImage(doc.preview!)" :src="getFullImageUrl(doc.preview!) || ''"
                          alt="Document preview" class="w-full h-full object-contain p-2" />
                        <div v-else class="w-full h-full flex items-center justify-center text-gray-500">
                          <span class="icon-[tabler--file-description] size-10"></span>
                        </div>
                        <button type="button"
                          class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition"
                          @click="removeDocument(index)">
                          <span class="icon-[tabler--x] size-4"></span>
                        </button>
                      </div>
                    </div>
                    <div v-else class="mt-3">
                      <label
                        class="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition">
                        <div class="flex flex-col items-center justify-center pt-3 pb-2">
                          <span class="icon-[tabler--upload] size-8 text-gray-400 mb-2"></span>
                          <p class="text-sm text-gray-600 dark:text-gray-400">ຄລິກເພື່ອອັບໂຫຼດ</p>
                          <p class="text-xs text-gray-500 mt-1">JPG, PNG, PDF (ສູງສຸດ 5MB)</p>
                        </div>
                        <input type="file" class="hidden" accept="image/*,.pdf"
                          @change="(event) => handleDocumentUpload(index, event)" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-8">
                <h4 class="font-medium mb-3 text-lg flex items-center gap-2">
                  <span class="icon-[tabler--file-plus] size-5 text-primary"></span>
                  ເອກະສານເພີ່ມເຕີມ (ບໍ່ບັງຄັບ)
                </h4>
                <div class="text-sm text-gray-500 mb-4">
                  ອັບໂຫຼດເອກະສານເພີ່ມເຕີມເພື່ອຊ່ວຍໃນການພິຈາລະນາສິນເຊື່ອ
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div v-for="(doc, index) in optionalDocuments" :key="index + loanDocuments.length"
                    class="border-2 border-dashed rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                    <div class="flex items-center justify-between mb-3">
                      <div>
                        <h5 class="font-medium">{{ doc.name }}</h5>
                        <p class="text-xs text-gray-500 mt-1">{{ doc.description }}</p>
                      </div>
                    </div>
                    <div v-if="doc.preview" class="mt-3">
                      <div class="relative w-full h-40 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                        <img v-if="isImage(doc.preview!)" :src="getFullImageUrl(doc.preview!) || ''"
                          alt="Document preview" class="w-full h-full object-contain p-2" />
                        <div v-else class="w-full h-full flex items-center justify-center text-gray-500">
                          <span class="icon-[tabler--file-description] size-10"></span>
                        </div>
                        <button type="button"
                          class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition"
                          @click="removeDocument(index + loanDocuments.length)">
                          <span class="icon-[tabler--x] size-4"></span>
                        </button>
                      </div>
                    </div>
                    <div v-else class="mt-3">
                      <label
                        class="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition">
                        <div class="flex flex-col items-center justify-center pt-3 pb-2">
                          <span class="icon-[tabler--upload] size-8 text-gray-400 mb-2"></span>
                          <p class="text-sm text-gray-600 dark:text-gray-400">ຄລິກເພື່ອອັບໂຫຼດ</p>
                          <p class="text-xs text-gray-500 mt-1">JPG, PNG, PDF (ສູງສຸດ 5MB)</p>
                        </div>
                        <input type="file" class="hidden" accept="image/*,.pdf"
                          @change="(event) => handleDocumentUpload(index + loanDocuments.length, event)" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="isUploadingDocuments" class="mt-4 p-3 bg-info/10 rounded-lg text-center">
                <div class="loading loading-spinner loading-sm inline-block mr-2"></div>
                <span>ກຳລັງອັບໂຫຼດເອກະສານ...</span>
              </div>

              <div v-if="!allRequiredDocumentsUploaded && isEditingInModal"
                class="mt-4 p-3 bg-warning/10 text-warning rounded-lg text-sm">
                ⚠️ ກະລຸນາອັບໂຫຼດເອກະສານທີ່ຕ້ອງການທັງໝົດກ່ອນບັນທຶກ
              </div>
            </div>
          </div>

          <!-- Tab Content: Map -->
          <div v-else-if="activeTab === 'map'" class="space-y-6">
            <div v-if="!selectedLoan?.customer_id" class="text-center py-12 text-gray-500">
              <div
                class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="icon-[tabler--map-pin-off] size-8 text-gray-400"></span>
              </div>
              <p class="text-lg font-medium">ບໍ່ມີຂໍ້ມູນລູກຄ້າ</p>
            </div>
            <CustomerLocationMap v-else :customer-id="selectedLoan.customer_id" :locations="customerLocations"
              :is-loading="isLocationLoading" :can-add-location="true" :can-edit-location="true"
              :can-delete-location="true" :can-set-primary="true" @add-location="handleAddLocation"
              @update-location="handleUpdateLocation" @delete-location="handleDeleteLocation"
              @set-primary="handleSetPrimary" />
          </div>

          <!-- Tab Content: Request Form -->
          <div v-else-if="activeTab === 'requestForm'" class="space-y-6">
            <LoanRequestForm :loan-application-id="selectedLoan?.id" :loan-application="selectedLoan"
              :is-editing="isEditingInModal" @save-form="handleRequestFormSave" @form-updated="handleRequestFormUpdated"
              @cancel-edit="isEditingInModal = false" />
          </div>

          <!-- Tab Content: Loan Contract -->
          <div v-else-if="activeTab === 'loanContract'" class="space-y-6">
            <LoanContractForm :loan-contract-id="selectedLoan?.id" :loan-application="selectedLoan"
              :loan-contract="selectedContract" :is-editing="isEditingInModal" @cancel-edit="isEditingInModal = false"
              @enable-edit="isEditingInModal = true" @save-form="handleSaveContract" />
          </div>

          <!-- Modal Footer Actions (ສຳລັບ Tabs ປົກກະຕິ) -->
          <div class="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button class="btn btn-soft btn-secondary" @click="closeDetailsModal">
              {{ isEditingInModal ? 'ຍົກເລີກ' : 'ປິດ' }}
            </button>
            <button
              v-if="!isEditingInModal && selectedLoan.status !== 'closed' && selectedLoan.status !== 'disbursed' && (activeTab === 'details' || activeTab === 'documents')"
              class="btn btn-primary" @click="startEditInModal">
              <span class="icon-[tabler--edit] size-4 mr-1"></span> ແກ້ໄຂ
            </button>
            <button v-else-if="isEditingInModal && (activeTab === 'details' || activeTab === 'documents')"
              class="btn btn-success" @click="saveLoanFromModal" :disabled="isSaving">
              <span v-if="isSaving" class="loading loading-spinner loading-xs"></span>
              <span v-else class="icon-[tabler--device-floppy] size-4 mr-1"></span>
              <span v-if="!isSaving">ບັນທຶກການປ່ຽນແປງ</span>
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- 🟢 Schedule Modal 🟢 (ແຍກອອກມາເປັນ Modal ໃໝ່) -->
    <teleport to="body">
      <div v-if="showScheduleModal && selectedLoan"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 p-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-6 border-b pb-4">
            <h3 class="text-xl font-bold flex items-center gap-2">
              <span class="icon-[tabler--calendar-stats] size-6 text-primary"></span>
              ຕາຕະລາງການຜ່ອນຊຳລະ
            </h3>
            <button @click="closeScheduleModal" class="btn btn-ghost btn-sm btn-circle text-gray-500 hover:text-error">
              <span class="icon-[tabler--x] size-6"></span>
            </button>
          </div>

          <div v-if="hasScheduleConflict"
            class="alert alert-warning shadow-sm mb-4 flex-row items-start p-4 border border-warning/50">
            <span class="icon-[tabler--alert-triangle] size-6 shrink-0 mt-0.5"></span>
            <div class="w-full">
              <h3 class="font-bold text-base">⚠️ ຕາຕະລາງຜ່ອນຊຳລະບໍ່ກົງກັບຂໍ້ມູນໃບຄຳຂໍຫຼ້າສຸດ!</h3>
              <div class="text-sm mt-2 grid grid-cols-1 gap-y-2">
                <template v-for="(diff, key) in scheduleDifferences" :key="key">
                  <div
                    class="flex flex-col sm:flex-row sm:justify-between border-b border-warning/20 border-dashed pb-1">
                    <span class="font-medium">{{ diff.label }}:</span>
                    <span class="mt-1 sm:mt-0">
                      <span class="line-through text-error opacity-70 mr-2">ຕາຕະລາງເກົ່າ: {{ formatPrice(diff.schedVal)
                        }}</span>
                      <span class="font-bold text-success">👉 ໃບຄຳຂໍປັດຈຸບັນ: {{ formatPrice(diff.appVal) }}</span>
                    </span>
                  </div>
                </template>
              </div>
              <div class="mt-3 text-sm font-semibold text-error bg-error/10 p-2 rounded">
                * ກະລຸນາກົດປຸ່ມ <span class="badge badge-warning badge-sm"><span
                    class="icon-[tabler--refresh] mr-1"></span>
                  ຣີເຊັດຄ່າເລີ່ມຕົ້ນ</span> ເພື່ອສ້າງຕາຕະລາງໃໝ່ໃຫ້ກົງກັນ, ແລ້ວກົດບັນທຶກ.
              </div>
            </div>
          </div>
          <div class="space-y-4 printable-section">
            <div
              class="flex justify-between items-center bg-primary/10 p-4 rounded-lg border border-primary/20 no-print">
              <div>
                <h4 class="font-bold text-primary text-lg flex items-center gap-2">
                  <span class="icon-[tabler--info-circle] size-5"></span> ຂໍ້ມູນຕາຕະລາງຜ່ອນ
                  <span v-if="!isScheduleSaved" class="badge badge-warning badge-sm ml-2">ຍັງບໍ່ໄດ້ບັນທຶກ</span>
                  <span v-else class="badge badge-success text-white badge-sm ml-2">ບັນທຶກແລ້ວ</span>
                </h4>
                <p class="text-sm text-gray-600 mt-1">
                  ຍອດຈັດ (ຕົ້ນທຶນ): <span class="font-medium text-black">{{
                    formatPrice(Number(selectedLoan?.total_amount || 0) - Number(selectedLoan?.down_payment || 0))
                    }}</span> |
                  ດອກເບ້ຍ: <span class="font-medium text-black">{{ selectedLoan?.interest_rate_at_apply }}%
                    {{ selectedLoan?.interest_rate_type === 'yearly' ? '(ຕໍ່ປີ)' : '(ຕໍ່ເດືອນ)' }}</span>
                </p>
              </div>
              <div class="flex gap-2">
                <button v-if="!isScheduleSaved" class="btn btn-warning btn-sm" @click="generateSchedule">
                  <span class="icon-[tabler--refresh] size-4 mr-1"></span> ຣີເຊັດຄ່າເລີ່ມຕົ້ນ
                </button>
                <button v-if="isScheduleSaved" class="btn btn-outline btn-primary btn-sm" @click="printSchedule">
                  <span class="icon-[tabler--printer] size-4 mr-1"></span> ພິມຕາຕະລາງ
                </button>
              </div>
            </div>

            <div class="overflow-x-auto border border-gray-200 rounded-lg">
              <table class="table table-sm w-full table-fixed">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="text-center w-16 align-middle">ລຳດັບ</th>
                    <th class="w-40 align-middle">ວັນທີຈ່າຍ</th>
                    <th class="align-middle text-right">ຕົ້ນທຶນ (ກີບ)</th>
                    <th class="align-middle text-right">ດອກເບ້ຍ (ກີບ)</th>
                    <th class="text-right align-middle">ລວມທັງໝົດ (ກີບ)</th>
                    <th class="text-right align-middle">ຍອດເຫຼືອໜີ້ (ກີບ)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="bg-base-200/50 font-medium">
                    <td class="text-center align-middle">-</td>
                    <td class="align-middle">ມື້ເຮັດສັນຍາ</td>
                    <td colspan="3" class="text-right align-middle">ຍອດໜີ້ຕັ້ງຕົ້ນ:</td>
                    <td class="text-right text-primary text-lg align-middle">
                      {{ formatPrice(Number(selectedLoan?.total_amount || 0) - Number(selectedLoan?.down_payment || 0))
                      }}
                    </td>
                  </tr>
                  <tr v-for="(row, index) in scheduleRows" :key="index" class="hover:bg-base-200/30 transition-colors">
                    <td class="text-center align-middle font-medium">{{ row.installment_number }}</td>
                    <td class="align-middle">
                      <input type="date" v-model="row.due_date" class="input input-sm input-bordered w-full"
                        :disabled="isScheduleSaved && selectedLoan?.status !== 'pending' && selectedLoan?.status !== 'verifying'" />
                    </td>
                    <td class="align-middle text-right">
                      <input type="text" :value="formatCurrencyInput(row.principal)"
                        @input="handleScheduleInput(row, 'principal', $event)"
                        class="input input-sm input-bordered w-full text-right"
                        :disabled="isScheduleSaved && selectedLoan?.status !== 'pending' && selectedLoan?.status !== 'verifying'" />
                    </td>
                    <td class="align-middle text-right">
                      <input type="text" :value="formatCurrencyInput(row.interest)"
                        @input="handleScheduleInput(row, 'interest', $event)"
                        class="input input-sm input-bordered w-full text-right text-error font-medium"
                        :disabled="isScheduleSaved && selectedLoan?.status !== 'pending' && selectedLoan?.status !== 'verifying'" />
                    </td>
                    <td class="text-right align-middle font-bold bg-gray-50 text-success">
                      {{ formatPrice(row.total_amount) }}
                    </td>
                    <td class="text-right align-middle font-bold"
                      :class="row.remaining_balance <= 0 ? 'text-success' : 'text-primary'">
                      {{ formatPrice(row.remaining_balance) }}
                    </td>
                  </tr>
                </tbody>
                <tfoot class="bg-primary/5 font-bold text-base">
                  <tr>
                    <td colspan="2" class="text-right align-middle">ລວມທັງໝົດ:</td>
                    <td class="text-right text-primary align-middle">{{ formatPrice(totalSchedulePrincipal) }}</td>
                    <td class="text-right text-error align-middle">{{ formatPrice(totalScheduleInterest) }}</td>
                    <td class="text-right text-success align-middle">{{ formatPrice(totalSchedulePrincipal +
                      totalScheduleInterest) }}</td>
                    <td class="text-right align-middle">
                      <span v-if="Math.abs(totalScheduleRemaining) > 10" class="text-error text-sm">
                        (ຍອດບໍ່ລົງຕົວ {{ formatPrice(totalScheduleRemaining) }})
                      </span>
                      <span v-else class="text-success text-sm">(ລົງຕົວ)</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button class="btn btn-soft btn-secondary" @click="closeScheduleModal">ປິດ</button>
            <button class="btn btn-success" @click="saveSchedule" :disabled="isSaving">
              <span v-if="isSaving" class="loading loading-spinner loading-xs"></span>
              <span v-else class="icon-[tabler--device-floppy] size-4 mr-1"></span> ບັນທຶກຕາຕະລາງ
            </button>
          </div>

        </div>
      </div>
    </teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLoanApplicationStore } from '@/stores/loanApplication'
import { useProductStore } from '@/stores/product'
import type { LoanApplication, UpdateLoanApplicationDto } from '@/types/loanApplication'
import type { CustomerLocation } from '@/types/customer'
import type { CreateLoanContractRequest } from '@/types/loanContract'
import { formatPrice } from '@/utils/formatters'
import Papa from 'papaparse'
import apiClient from '@/api/apiclient'
import { getFullImageUrl } from '@/utils/url'
import CustomerLocationMap from '@/components/loans/form/CustomerLocationMap.vue'
import LoanRequestForm from '@/components/loans/form/RequestForm.vue'
import LoanContractForm from '@/components/loans/form/LoanContractForm.vue'
import { useLoanContractStore } from '@/stores/loanContract'
import { alert } from '@/utils/alert'
import { LoanApplicationStatus } from '@/types/loanApplication'
import { useShopStore } from '@/stores/shop'

// ✅ Stores
const loanApplicationStore = useLoanApplicationStore()
const productStore = useProductStore()
const loanContractStore = useLoanContractStore()
const shopStore = useShopStore() // 🟢 ເພີ່ມບັນທັດນີ້
const router = useRouter()

// Reactive state
const isLoading = computed(() => loanApplicationStore.isLoading)
const isSaving = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const statusFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')

// Modal states
const showDetailsModal = ref(false)
const showScheduleModal = ref(false) // 🟢 Modal ສຳລັບຕາຕະລາງຜ່ອນ

const selectedLoan = ref<any | null>(null)
const selectedContract = ref<any | null>(null)
const isEditingInModal = ref(false)
const activeTab = ref<'details' | 'documents' | 'map' | 'requestForm' | 'loanContract'>('details')

// ✅ Product Search in Modal
const modalProductSearch = ref('')
const showModalProductDropdown = ref(false)
const selectedModalProduct = ref<any | null>(null)
const modalShopId = ref<number | null>(null)

// ✅ Schedule States
const isScheduleSaved = ref(false);
const hasScheduleConflict = ref(false); // 🟢 ເພີ່ມຕົວແປນີ້
const scheduleDifferences = reactive<Record<string, any>>({}); // 🟢 ເພີ່ມຕົວແປນີ້

// 🟢 ດຶງລາຍຊື່ຮ້ານຄ້າມາຈາກ ShopStore
const shopsList = computed(() => shopStore.shops)

// ✅ Map & Location States
const customerLocations = ref<CustomerLocation[]>([])
const isLocationLoading = ref(false)

// ✅ Schedule States
// const isScheduleSaved = ref(false);
interface ScheduleRow {
  installment_number: number;
  due_date: string;
  principal: number;
  interest: number;
  total_amount: number;
  remaining_balance: number;
}
const scheduleRows = ref<ScheduleRow[]>([])

// Form for editing in modal
const modalLoanForm = reactive({
  customer_name: '',
  customer_phone: '',
  customer_id_card: '',
  customer_address: '',
  occupation: '',
  age: 0,
  product_id: 0,
  product_name: '',
  product_type: '',
  product_price: 0,
  total_amount: 0,
  down_payment: 0, // 🟢 ເພີ່ມຕົວແປເງິນດາວ
  interest_rate: 0,
  loan_period: 0,
  monthly_payment: 0,
  monthly_income: 0,
  other_debts: 0,
  first_month_payment: 0,
  // 🟢 ເພີ່ມ 2 ຕົວແປນີ້ເຂົ້າໄປ
  interest_type: 'flat_rate',
  interest_rate_type: 'monthly'
})

// ✅ Validation errors
const modalFormErrors = reactive({
  customer_name: '',
  customer_phone: '',
  customer_id_card: '',
  customer_address: '',
  occupation: '',
  age: '',
  total_amount: '',
  down_payment: '', // 🟢 ເພີ່ມສຳລັບເກັບ Error ເງິນດາວ
  interest_rate: '',
  loan_period: '',
  monthly_income: ''
})

// ✅ ຈັດການເອກະສານ
interface Document {
  id: string; name: string; description: string; required: boolean; file: File | null; preview: string | null;
}
const loanDocuments = ref<Document[]>([
  { id: 'id_card', name: 'ບັດປະຈຳຕົວ', description: 'ຮູບຖ່າຍບັດປະຈຳຕົວທັງໜ້າ-ຫຼັງ', required: true, file: null, preview: null },
  { id: 'house_reg', name: 'ໃບຄອບຄົວ', description: 'ໃບຄອບຄົວຫຼືເອກະສານຢືນຢັນທີ່ຢູ່', required: true, file: null, preview: null }
])
const optionalDocuments = ref<Document[]>([
  { id: 'salary_slip', name: 'ຫຼັກຖານລາຍຮັບ', description: 'ໃບເງິນເດືອນ ຫຼື ໃບຮັບລາຍຮັບ', required: false, file: null, preview: null },
  { id: 'other', name: 'ເອກະສານອື່ນໆ', description: 'ເອກະສານອື່ນໆທີ່ກ່ຽວຂ້ອງ', required: false, file: null, preview: null }
])
const allLoanDocuments = computed(() => [...loanDocuments.value, ...optionalDocuments.value])

const allRequiredDocumentsUploaded = computed(() => {
  return loanDocuments.value.every(doc => doc.file !== null)
})

const isUploadingDocuments = ref(false)

const isConfirmed = (value: any) => {
  return value === true || value === 1 || value === 'true' || value === '1'
}

const isImage = (url: string) => /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url.toLowerCase());


// 🟢 ຟັງຊັນເມື່ອແອັດມິນປ່ຽນຮ້ານຄ້າໃນ Dropdown
const handleShopChange = async () => {
  // 1. ເຄຼຍຂໍ້ມູນສິນຄ້າເກົ່າຖິ້ມ
  clearModalProductSelection()
  modalLoanForm.total_amount = 0
  modalLoanForm.down_payment = 0
  modalLoanForm.interest_rate = 0
  modalLoanForm.loan_period = 0
  modalLoanForm.monthly_payment = 0
  modalLoanForm.first_month_payment = 0

  // 2. ໂຫຼດສິນຄ້າໃໝ່ສະເພາະຮ້ານທີ່ເລືອກ
  if (modalShopId.value) {
    try {
      await productStore.fetchProducts({ shop_id: modalShopId.value, limit: 100 })
    } catch (error) {
      console.error('❌ Failed to load products for this shop:', error)
      alert.error('ບໍ່ສາມາດດຶງຂໍ້ມູນສິນຄ້າຂອງຮ້ານນີ້ໄດ້')
    }
  } else {
    productStore.clearProducts()
  }
}

// ✅ Computed properties ສຳລັບ Filter
const filteredLoans = computed(() => {
  let filtered = loanApplicationStore.loanApplications.filter(app =>
    isConfirmed(app.is_confirmed)
  )

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(loan =>
    (loan.customer?.first_name?.toLowerCase().includes(query) ||
      loan.customer?.last_name?.toLowerCase().includes(query) ||
      (loan.customer as any)?.full_name?.toLowerCase().includes(query) ||
      loan.customer?.phone?.includes(query) ||
      loan.loan_id?.toLowerCase().includes(query))
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(loan => loan.status === statusFilter.value)
  }

  if (dateFrom.value || dateTo.value) {
    filtered = filtered.filter(loan => {
      const dateTarget = loan.createdAt || (loan as any).created_at;
      if (!dateTarget) return false;
      const loanDate = new Date(dateTarget).toISOString().split('T')[0];
      if (!loanDate) return false; // 🟢 ເພີ່ມບັອກນີ້ກັນໜຽວ
      const fromDate = dateFrom.value || '1970-01-01';
      const toDate = dateTo.value || '9999-12-31';
      return loanDate >= fromDate && loanDate <= toDate;
    })
  }
  return filtered
})

const filteredModalProducts = computed(() => {
  if (!modalProductSearch.value) return productStore.products
  const query = modalProductSearch.value.toLowerCase()
  return productStore.products.filter(product =>
    product.product_name?.toLowerCase().includes(query) ||
    product.type_name?.toLowerCase().includes(query) ||
    product.id?.toString().includes(query)
  )
})

const displayedLoans = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredLoans.value.slice(start, end)
})

const totalLoans = computed(() => filteredLoans.value.length)
const totalPages = computed(() => Math.ceil(totalLoans.value / pageSize.value) || 1)
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value + 1)
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, totalLoans.value))
const hasPreviousPage = computed(() => currentPage.value > 1)
const hasNextPage = computed(() => currentPage.value < totalPages.value)

// ✅ Helper functions
const getCustomerName = (loan: any): string => {
  if (loan.customer?.full_name) return loan.customer.full_name
  return `${loan.customer?.first_name || ''} ${loan.customer?.last_name || ''}`.trim() || '-'
}

const getCustomerPhone = (loan: any): string => loan.customer?.phone || '-'
const getCustomerAddress = (loan: any): string => loan.customer?.address || '-'
const getProductName = (loan: any): string => loan.product?.product_name || '-'
const getProductType = (loan: any): string => {
  const typeId = loan.product?.productType_id || loan.productType_id
  return productStore.productTypeMap[typeId] || '-'
}

const getRequesterName = (loan: any): string => {
  return loan.requester?.full_name || loan.requester?.name || `ID: ${loan.requester_id || '-'}`
}

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('lo-LA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'pending': return 'badge-warning'
    case 'verifying': return 'badge-info'
    case 'approved': return 'badge-success'
    case 'rejected': return 'badge-error'
    case 'disbursed': return 'badge-primary'
    case 'closed': return 'badge-neutral'
    default: return 'badge-neutral'
  }
}

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': 'ລໍຖ້າ',
    'verifying': 'ກຳລັງກວດ',
    'approved': 'ອະນຸມັດ',
    'rejected': 'ປະຕິເສດ',
    'disbursed': 'ຈ່າຍເງິນແລ້ວ',
    'closed': 'ປິດສິນເຊື່ອ'
  }
  return statusMap[status] || status
}

// 🟢 ຟັງຊັນກວດສອບວ່າ ຕາຕະລາງເກົ່າ ກົງກັບ ໃບຄຳຂໍປັດຈຸບັນ ຫຼື ບໍ່
// 🟢 ຟັງຊັນກວດສອບວ່າ ຕາຕະລາງເກົ່າ ກົງກັບ ໃບຄຳຂໍປັດຈຸບັນ ຫຼື ບໍ່
const checkScheduleConflicts = () => {
  hasScheduleConflict.value = false;
  Object.keys(scheduleDifferences).forEach(k => delete scheduleDifferences[k]);

  if (!selectedLoan.value || scheduleRows.value.length === 0 || !isScheduleSaved.value) return;

  const loan = selectedLoan.value;
  const firstRow = scheduleRows.value[0]; // ດຶງແຖວທີ 1 ມາທຽບ

  if (!firstRow) return; // 🟢 ເພີ່ມແຖວນີ້ເພື່ອບອກ TypeScript ວ່າຖ້າມັນວ່າງໃຫ້ຢຸດເລີຍ

  // 1. ຄ່າຈາກໃບຄຳຂໍ (Application)
  const appPrincipal = Number(loan.total_amount || 0) - Number(loan.down_payment || 0);
  const appMonthlyPay = Number(loan.monthly_pay || 0);
  const appTerm = Number(loan.loan_period || 0); // 🟢 ດຶງຈຳນວນເດືອນຈາກໃບຄຳຂໍ

  // 2. ຄ່າຈາກຕາຕະລາງ (Schedule)
  const schedPrincipal = Number(firstRow.principal) + Number(firstRow.remaining_balance);
  const schedMonthlyPay = Number(firstRow.total_amount);
  const schedTerm = scheduleRows.value.length; // 🟢 ນັບຈຳນວນແຖວຂອງຕາຕະລາງເກົ່າ

  let isConflict = false;

  // 🟢 ກວດສອບຍອດຈັດ (ຕົ້ນທຶນ)
  if (Math.abs(appPrincipal - schedPrincipal) > 10) {
    isConflict = true;
    scheduleDifferences['principal'] = {
      label: 'ຍອດຈັດ (ຕົ້ນທຶນ)',
      schedVal: schedPrincipal,
      appVal: appPrincipal
    };
  }

  // 🟢 ກວດສອບຄ່າງວດຕໍ່ເດືອນ
  if (Math.abs(appMonthlyPay - schedMonthlyPay) > 10) {
    isConflict = true;
    scheduleDifferences['monthly'] = {
      label: 'ຄ່າງວດຕໍ່ເດືອນ',
      schedVal: schedMonthlyPay,
      appVal: appMonthlyPay
    };
  }

  // 🟢 ກວດສອບຈຳນວນງວດ (ໃໝ່)
  if (appTerm !== schedTerm) {
    isConflict = true;
    scheduleDifferences['term'] = {
      label: 'ຈຳນວນງວດ (ເດືອນ)',
      schedVal: schedTerm,
      appVal: appTerm
    };
  }

  hasScheduleConflict.value = isConflict;
}

// ✅ Calculation functions
const calculateTotalInterest = (loan: any): number => {
  const totalPayment = Number(loan.monthly_pay) * Number(loan.loan_period)
  return totalPayment - Number(loan.total_amount)
}

const calculateTotalPayment = (loan: any): number => {
  return Number(loan.monthly_pay) * Number(loan.loan_period)
}

const calculateModalTotalPayment = (): number => {
  return modalLoanForm.monthly_payment * modalLoanForm.loan_period
}

const calculateModalTotalInterest = (): number => {
  return calculateModalTotalPayment() - modalLoanForm.total_amount
}

// 🟢 ຟັງຊັນສຳລັບຈັດການ Input ຈຳນວນເງິນໃນ Modal ໃຫ້ມີໝາຍຈຸດ (,) ອັດຕະໂນມັດ
const handleModalCurrencyInput = (field: 'total_amount' | 'down_payment' | 'monthly_income' | 'other_debts', event: Event) => {
  const target = event.target as HTMLInputElement;

  // ລຶບໝາຍຈຸດ ແລະ ຕົວອັກສອນອື່ນໆທີ່ບໍ່ແມ່ນຕົວເລກອອກກ່ອນ
  const rawValue = target.value.replace(/,/g, '').replace(/[^\d]/g, '');
  const numericValue = Number(rawValue);

  // ອັບເດດຄ່າຕົວເລກແທ້ໆລົງໃນ modalLoanForm
  if (!isNaN(numericValue) && rawValue !== '') {
    modalLoanForm[field] = numericValue;
  } else {
    modalLoanForm[field] = 0;
  }

  // ອັບເດດການສະແດງຜົນໃນຊ່ອງ Input ໃຫ້ມີໝາຍຈຸດ
  target.value = formatCurrencyInput(modalLoanForm[field]);
};

// ✅ คำนวณค่างวด (รองรับ Flat/Effective และ Monthly/Yearly)
// ✅ ປັບສູດຄຳນວນໃໝ່ ໃຫ້ຮອງຮັບເງິນດາວ
const calculateModalMonthlyPayment = (): number => {
  const { total_amount, down_payment, interest_rate, loan_period, interest_type, interest_rate_type } = modalLoanForm

  // 🟢 ຍອດຈັດ = ລາຄາສິນຄ້າ - ເງິນດາວ (ຖ້າເງິນດາວຫຼາຍກວ່າລາຄາ ໃຫ້ເປັນ 0)
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

// 🟢 Watcher ຕ້ອງເພີ່ມ `down_payment` ເຂົ້າໄປນຳ ເພື່ອໃຫ້ມັນຄຳນວນໃໝ່ທັນທີທີ່ພິມເງິນດາວ
watch(
  () => [
    modalLoanForm.total_amount,
    modalLoanForm.down_payment, // ເພີ່ມບັນທັດນີ້
    modalLoanForm.interest_rate,
    modalLoanForm.loan_period,
    modalLoanForm.interest_type,
    modalLoanForm.interest_rate_type,
  ],
  () => {
    modalLoanForm.monthly_payment = calculateModalMonthlyPayment()
  }
)

const calculateMonthlyPayment = (): number => {
  const { total_amount, interest_rate, loan_period } = modalLoanForm
  if (!total_amount || !interest_rate || !loan_period) return 0
  const monthlyRate = interest_rate / 100 / 12
  const monthlyPayment = (total_amount * monthlyRate * Math.pow(1 + monthlyRate, loan_period)) /
    (Math.pow(1 + monthlyRate, loan_period) - 1)
  return Math.round(monthlyPayment)
}

watch(
  () => [modalLoanForm.total_amount, modalLoanForm.interest_rate, modalLoanForm.loan_period],
  () => {
    modalLoanForm.monthly_payment = calculateMonthlyPayment()
  }
)

// ==========================================
// 🟢 Schedule & Repayment Logic
// ==========================================
const generateSchedule = () => {
  scheduleRows.value = [];
  isScheduleSaved.value = false;
  hasScheduleConflict.value = false; // 🟢 ປິດ Alert ເມື່ອສ້າງຕາຕະລາງໃໝ່
  if (!selectedLoan.value) return;

  const loan = selectedLoan.value;
  const price = Number(loan.total_amount || loan.product?.price || 0);
  const downPayment = Number(loan.down_payment || 0);
  const principal = price - downPayment;
  const term = Number(loan.loan_period || 1);
  const interestRate = Number(loan.interest_rate_at_apply || 0);

  const interestType = loan.interest_type || 'flat_rate';
  const rateType = loan.interest_rate_type || 'monthly';
  const paymentDay = Number(loan.payment_day || 1);

  const ratePerMonth = rateType === 'yearly' ? (interestRate / 12) / 100 : interestRate / 100;

  let currentBalance = principal;
  let startDate = new Date();

  let flatMonthlyPrincipal = principal / term;
  let flatMonthlyInterest = principal * ratePerMonth;

  let effectivePmt = 0;
  if (ratePerMonth > 0) {
    effectivePmt = (principal * ratePerMonth * Math.pow(1 + ratePerMonth, term)) / (Math.pow(1 + ratePerMonth, term) - 1);
  } else {
    effectivePmt = principal / term;
  }

  for (let i = 1; i <= term; i++) {
    let dueDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, paymentDay);

    let rowPrincipal = 0;
    let rowInterest = 0;

    if (interestType === 'flat_rate') {
      rowPrincipal = flatMonthlyPrincipal;
      rowInterest = flatMonthlyInterest;
    } else { // effective_rate
      rowInterest = currentBalance * ratePerMonth;
      rowPrincipal = effectivePmt - rowInterest;
    }

    if (i === term) {
      rowPrincipal = currentBalance;
    }

    let totalAmount = rowPrincipal + rowInterest;
    currentBalance -= rowPrincipal;

    scheduleRows.value.push({
      installment_number: i,
      due_date: dueDate.toISOString().split('T')[0] || '',
      principal: Math.round(rowPrincipal),
      interest: Math.round(rowInterest),
      total_amount: Math.round(totalAmount),
      remaining_balance: Math.round(Math.max(0, currentBalance))
    });
  }
}

const fetchSavedSchedule = async () => {
  if (!selectedLoan.value) return;
  try {
    const savedData = await loanApplicationStore.fetchRepaymentSchedule(selectedLoan.value.id);

    if (savedData && savedData.length > 0) {
      // 1. Map ຂໍ້ມູນເກົ່າໄວ້ທຽບ
      const tempRows = savedData.map((r: any) => ({
        installment_number: r.installment_no,
        due_date: r.due_date ? r.due_date.split('T')[0] : '',
        principal: Number(r.principal_amount),
        interest: Number(r.interest_amount),
        total_amount: Number(r.total_due),
        remaining_balance: Number(r.remaining_principal)
      }));

      // 2. ດຶງຄ່າມາທຽບກັນ
      const loan = selectedLoan.value;
      const firstRow = tempRows[0];

      const appPrincipal = Number(loan.total_amount || 0) - Number(loan.down_payment || 0);
      const appMonthlyPay = Number(loan.monthly_pay || 0);
      const appTerm = Number(loan.loan_period || 0);

      const schedPrincipal = Number(firstRow.principal) + Number(firstRow.remaining_balance);
      const schedMonthlyPay = Number(firstRow.total_amount);
      const schedTerm = tempRows.length; // ຈຳນວນແຖວຂອງຕາຕະລາງເກົ່າ

      // 3. ກວດສອບ Conflict
      const isConflict = Math.abs(appPrincipal - schedPrincipal) > 10 ||
        Math.abs(appMonthlyPay - schedMonthlyPay) > 10 ||
        appTerm !== schedTerm;

      if (isConflict) {
        console.log("🔄 Data conflict detected! Auto-regenerating schedule...");
        // 🟢 ສ້າງຕາຕະລາງໃໝ່ອັດຕະໂນມັດ ຕາມຄ່າໃໝ່
        generateSchedule();

        // 🟢 ບັງຄັບເປີດກ່ອງແຈ້ງເຕືອນໄວ້ (ເພື່ອໃຫ້ຮູ້ວ່າຖືກອັບເດດແລ້ວ ແລະ ລໍຖ້າກົດບັນທຶກ)
        hasScheduleConflict.value = true;
      } else {
        // ຖ້າກົງກັນ ກໍສະແດງປົກກະຕິ
        scheduleRows.value = tempRows;
        isScheduleSaved.value = true;
        hasScheduleConflict.value = false;
      }

    } else {
      generateSchedule(); // ຖ້າຍັງບໍ່ມີຂໍ້ມູນໃນ DB ກໍສ້າງໃໝ່
      hasScheduleConflict.value = false;
    }
  } catch (error) {
    console.warn("Failed to fetch saved schedule, generating draft.", error);
    generateSchedule();
    hasScheduleConflict.value = false;
  }
}

const viewSchedule = async (loan: any) => {
  try {
    // ==========================================
    // 🟢 1. ກວດສອບວ່າມີ "ສັນຍາກູ້ຢືມ (Loan Contract)" ແລ້ວຫຼືຍັງ
    // ==========================================
    let contractData = null;
    try {
      // ພະຍາຍາມດຶງຂໍ້ມູນສັນຍາ
      const contractRes = await loanContractStore.fetchContract(loan.id);
      contractData = (contractRes as any)?.data?.data || (contractRes as any)?.data || contractRes;

      // ຖ້າບໍ່ມີຂໍ້ມູນສັນຍາ
      if (!contractRes || (contractRes as any).data?.data == null) {
        alert.error('ບໍ່ສາມາດເປີດຕາຕະລາງໄດ້', 'ກະລຸນາສ້າງ "ສັນຍາກູ້ຢືມ" ໃຫ້ລູກຄ້າຮັບຮູ້ເງື່ອນໄຂກ່ອນ!');
        return; // ຢຸດການເຮັດວຽກ ບໍ່ໃຫ້ເປີດ Modal
      }
    } catch (error) {
      console.warn("Error checking loan contract:", error);
      alert.error('ບໍ່ສາມາດເປີດຕາຕະລາງໄດ້', 'ກະລຸນາສ້າງ "ສັນຍາກູ້ຢືມ" ໃຫ້ລູກຄ້າຮັບຮູ້ເງື່ອນໄຂກ່ອນ!');
      return;
    }

    // ==========================================
    // 🟢 2. ດຶງຂໍ້ມູນໃບຄຳຂໍຫຼ້າສຸດ (Full Loan Application)
    // ==========================================
    const fullLoan = await loanApplicationStore.fetchLoanApplicationById(loan.id);

    // ==========================================
    // 🟢 3. ກວດສອບຄວາມຂັດແຍ້ງກັນລະຫວ່າງ "ໃບຄຳຂໍ" ແລະ "ສັນຍາ"
    // ==========================================
    // ຄ່າຈາກໃບຄຳຂໍ (ຍອດຈັດ = ລາຄາ - ເງິນດາວ)
    const appPrincipal = Number(fullLoan.total_amount || 0) - Number(fullLoan.down_payment || 0);
    const appMonthlyPay = Number(fullLoan.monthly_pay || 0);
    const appTerm = Number(fullLoan.loan_period || 0);

    // ຄ່າຈາກສັນຍາເກົ່າ (ໃນຕາຕະລາງສັນຍາ total_amount ຄືຍອດຈັດທີ່ຫັກດາວແລ້ວ)
    const contractPrincipal = Number(contractData.total_amount || 0);
    const contractMonthlyPay = Number(contractData.monthly_pay || 0);
    const contractTerm = Number(contractData.loan_period || 0);

    // ທຽບຄ່າ ຖ້າຕ່າງກັນເກີນ 1 ກີບ ຖືວ່າຂັດແຍ້ງກັນ
    const isConflict =
      Math.abs(appPrincipal - contractPrincipal) > 1 ||
      Math.abs(appMonthlyPay - contractMonthlyPay) > 1 ||
      appTerm !== contractTerm;

    if (isConflict) {
      // 🛑 ຖ້າຂໍ້ມູນບໍ່ກົງກັນ ບລັອກບໍ່ໃຫ້ເປີດຕາຕະລາງ ແລະ ແຈ້ງເຕືອນໃຫ້ໄປແກ້ໄຂສັນຍາກ່ອນ
      alert.error(
        'ຂໍ້ມູນສັນຍາບໍ່ອັບເດດ! ⚠️',
        'ຂໍ້ມູນສິນເຊື່ອມີການປ່ຽນແປງຫຼັງຈາກສ້າງສັນຍາໄປແລ້ວ.\n\n👉 ກະລຸນາກົດເຂົ້າ "ລາຍລະອຽດສິນເຊື່ອ" > ແຖບ "ສັນຍາກູ້ຢືມ" > ກົດແກ້ໄຂ ແລະ ກົດ "ອັບເດດຂໍ້ມູນຕາມໃບຄຳຂໍ" ກ່ອນຈຶ່ງຈະເປີດຕາຕະລາງໄດ້.'
      );
      return;
    }

    // ==========================================
    // 🟢 4. ຖ້າຂໍ້ມູນກົງກັນດີ ຈຶ່ງດຳເນີນການໂຫຼດຂໍ້ມູນ ແລະ ເປີດຕາຕະລາງປົກກະຕິ
    // ==========================================
    selectedLoan.value = fullLoan;
    await fetchSavedSchedule();
    showScheduleModal.value = true;

  } catch (error: any) {
    console.error(error);
    alert.error('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຕາຕະລາງໄດ້');
  }
}

const closeScheduleModal = () => {
  showScheduleModal.value = false;
  selectedLoan.value = null;
  isScheduleSaved.value = false;
  hasScheduleConflict.value = false; // 🟢 ລ້າງຄ່າ
  Object.keys(scheduleDifferences).forEach(k => delete scheduleDifferences[k]); // 🟢 ລ້າງຄ່າ
  scheduleRows.value = [];
}

// 🟢 อัปเดตฟังก์ชันนี้ ให้แปลงค่าเป็นตัวเลขก่อน format เสมอ
const formatCurrencyInput = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined || val === '') return '0';

  // เคลียร์คอมม่าออกก่อน (ถ้ามี) แล้วแปลงเป็นตัวเลข
  const num = typeof val === 'string' ? Number(val.replace(/,/g, '')) : Number(val);

  if (isNaN(num)) return '0';
  return num.toLocaleString('en-US');
};

const handleScheduleInput = (row: ScheduleRow, field: 'principal' | 'interest', event: Event) => {
  const target = event.target as HTMLInputElement;

  const cursorPosition = target.selectionStart;
  const originalLength = target.value.length;

  const rawValue = target.value.replace(/,/g, '').replace(/[^\d]/g, '');
  const numericValue = Number(rawValue);

  if (!isNaN(numericValue)) {
    row[field] = numericValue;
  } else if (rawValue === '') {
    row[field] = 0;
  }

  target.value = formatCurrencyInput(row[field]);

  const newLength = target.value.length;
  const lengthDiff = newLength - originalLength;
  if (cursorPosition !== null) {
    target.setSelectionRange(cursorPosition + lengthDiff, cursorPosition + lengthDiff);
  }

  recalculateSchedule();
};

const recalculateSchedule = () => {
  if (!selectedLoan.value) return;
  const loan = selectedLoan.value;
  const price = Number(loan.total_amount || loan.product?.price || 0);
  const downPayment = Number(loan.down_payment || 0);
  const initialPrincipal = price - downPayment;

  let currentBalance = initialPrincipal;

  for (let i = 0; i < scheduleRows.value.length; i++) {
    let row = scheduleRows.value[i];
    if (!row) continue;

    row.principal = Number(row.principal) || 0;
    row.interest = Number(row.interest) || 0;
    row.total_amount = row.principal + row.interest;

    currentBalance -= row.principal;
    row.remaining_balance = Math.round(currentBalance);
  }
}

const totalSchedulePrincipal = computed(() => scheduleRows.value.reduce((sum, row) => sum + Number(row.principal), 0))
const totalScheduleInterest = computed(() => scheduleRows.value.reduce((sum, row) => sum + Number(row.interest), 0))
const totalScheduleRemaining = computed(() => {
  const loan = selectedLoan.value;
  if (!loan) return 0;
  const initial = Number(loan.total_amount) - Number(loan.down_payment || 0);
  return initial - totalSchedulePrincipal.value;
})

const saveSchedule = async () => {
  if (!selectedLoan.value || scheduleRows.value.length === 0) {
    alert.error('ບໍ່ມີຂໍ້ມູນຕາຕະລາງສຳລັບບັນທຶກ');
    return;
  }

  isSaving.value = true;
  try {
    await loanApplicationStore.saveRepaymentSchedule(selectedLoan.value.id, scheduleRows.value);
    alert.success('ບັນທຶກຕາຕະລາງຜ່ອນສຳເລັດ!');

    // 🟢 ປ່ຽນສະຖານະເປັນ Save ແລ້ວ ແລະ ປິດກ່ອງແຈ້ງເຕືອນ
    isScheduleSaved.value = true;
    hasScheduleConflict.value = false;

  } catch (error: any) {
    console.error(error);
    alert.error('ເກີດຂໍ້ຜິດພາດ: ' + (error.response?.data?.message || error.message));
  } finally {
    isSaving.value = false;
  }
}

const printSchedule = async () => {
  if (!isScheduleSaved.value) {
    alert.error('ກະລຸນາບັນທຶກຕາຕະລາງກ່ອນພິມ');
    return;
  }

  isSaving.value = true;
  alert.info('ກຳລັງສ້າງເອກະສານ PDF...');

  try {
    const payload = {
      loanData: selectedLoan.value,
      scheduleRows: scheduleRows.value,
      totals: {
        principal: totalSchedulePrincipal.value,
        interest: totalScheduleInterest.value,
        amount: totalSchedulePrincipal.value + totalScheduleInterest.value
      }
    };

    const response = await apiClient.post('/pdf/generate-repayment-schedule', payload, {
      responseType: 'blob',
      timeout: 60000
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');

  } catch (error: any) {
    console.error('Print Schedule Error:', error);
    alert.error('ເກີດຂໍ້ຜິດພາດໃນການສ້າງ PDF ຕາຕະລາງ');
  } finally {
    isSaving.value = false;
  }
}

// ==========================================
// 🟢 Modal Selection Logic
// ==========================================
const selectModalProduct = (product: any) => {
  selectedModalProduct.value = product
  modalProductSearch.value = product.product_name
  showModalProductDropdown.value = false
  modalLoanForm.product_id = product.id
  modalLoanForm.product_name = product.product_name
  modalLoanForm.product_type = product.productType?.type_name || product.type_name || ''
  // 🟢 เพิ่ม Number() ครอบเอาไว้ตรง 2 บรรทัดนี้
  modalLoanForm.product_price = Number(product.price || 0)
  modalLoanForm.total_amount = Number(product.price || 0)
  modalLoanForm.down_payment = 0 // 🟢 ຕັ້ງເງິນດາວເປັນ 0 ເລີ່ມຕົ້ນຕອນເລືອກສິນຄ້າໃໝ່
  modalLoanForm.interest_rate = Number(product.interest_rate || 0)
  modalLoanForm.loan_period = Number(product.term || 0)

  // 🟢 ເພີ່ມ 2 ບັນທັດນີ້ ເພື່ອດຶງປະເພດດອກເບ້ຍມາຈາກ Product ທີ່ເລືອກໃໝ່
  modalLoanForm.interest_type = product.interest_type || 'flat_rate'
  modalLoanForm.interest_rate_type = product.interest_rate_type || 'monthly'

  modalLoanForm.monthly_payment = calculateMonthlyPayment()
}

const clearModalProductSelection = () => {
  selectedModalProduct.value = null
  modalProductSearch.value = ''
}

const handleModalProductBlur = () => {
  setTimeout(() => {
    showModalProductDropdown.value = false
  }, 200)
}

let modalProductSearchTimer: ReturnType<typeof setTimeout> | null = null
const debounceModalProductSearch = () => {
  if (modalProductSearchTimer) clearTimeout(modalProductSearchTimer)
  modalProductSearchTimer = setTimeout(() => { }, 300)
}

const validateModalForm = (): boolean => {
  Object.keys(modalFormErrors).forEach(key => {
    modalFormErrors[key as keyof typeof modalFormErrors] = ''
  })
  let isValid = true

  if (!modalLoanForm.customer_name.trim()) {
    modalFormErrors.customer_name = 'ກະລຸນາປ້ອນຊື່ລູກຄ້າ'
    isValid = false
  }
  const phoneRegex = /^[\d\-\+\(\)\s]{8,15}$/
  if (!modalLoanForm.customer_phone.trim()) {
    modalFormErrors.customer_phone = 'ກະລຸນາປ້ອນເບີໂທລະສັບ'
    isValid = false
  } else if (!phoneRegex.test(modalLoanForm.customer_phone)) {
    modalFormErrors.customer_phone = 'ເບີໂທລະສັບບໍ່ຖືກຕ້ອງ'
    isValid = false
  }
  if (!modalLoanForm.customer_id_card.trim()) {
    modalFormErrors.customer_id_card = 'ກະລຸນາປ້ອນເລກບັດປະຈຳຕົວ'
    isValid = false
  }
  if (!modalLoanForm.customer_address.trim()) {
    modalFormErrors.customer_address = 'ກະລຸນາປ້ອນທີ່ຢູ່'
    isValid = false
  }
  if (!modalLoanForm.occupation.trim()) {
    modalFormErrors.occupation = 'ກະລຸນາປ້ອນອາຊີບ'
    isValid = false
  }
  if (!modalLoanForm.age || modalLoanForm.age < 18 || modalLoanForm.age > 100) {
    modalFormErrors.age = 'ອາຍຸຕ້ອງຢູ່ລະຫວ່າງ 18-100 ປີ'
    isValid = false
  }
  if (!modalLoanForm.total_amount || modalLoanForm.total_amount <= 0) {
    modalFormErrors.total_amount = 'ຈຳນວນເງິນກູ້ຕ້ອງຫຼາຍກວ່າ 0'
    isValid = false
  }
  if (modalLoanForm.down_payment >= modalLoanForm.total_amount) {
    modalFormErrors.down_payment = 'ເງິນດາວຕ້ອງໜ້ອຍກວ່າລາຄາສິນຄ້າ'
    isValid = false
  }
  if (modalLoanForm.interest_rate < 0 || modalLoanForm.interest_rate > 100) {
    modalFormErrors.interest_rate = 'ດອກເບ້ຍຕ້ອງຢູ່ລະຫວ່າງ 0-100%'
    isValid = false
  }
  if (!modalLoanForm.loan_period || modalLoanForm.loan_period < 1 || modalLoanForm.loan_period > 60) {
    modalFormErrors.loan_period = 'ໄລຍະເວລາຕ້ອງຢູ່ລະຫວ່າງ 1-60 ເດືອນ'
    isValid = false
  }
  if (!modalLoanForm.monthly_income || modalLoanForm.monthly_income <= 0) {
    modalFormErrors.monthly_income = 'ລາຍຮັບຕ້ອງຫຼາຍກວ່າ 0'
    isValid = false
  }

  return isValid
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null
const debounceSearch = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    currentPage.value = 1
  }, 300)
}

const applyDateFilter = () => {
  currentPage.value = 1
}

// ==========================================
// 🟢 Map Functions
// ==========================================
const loadCustomerLocations = async (customerId: number) => {
  if (!customerId) return
  isLocationLoading.value = true
  try {
    const { getCustomerLocations } = await import('@/api/customer')
    const response = await getCustomerLocations(customerId)
    customerLocations.value = response.data || response || []
  } catch (error) {
    customerLocations.value = []
  } finally {
    isLocationLoading.value = false
  }
}

const handleAddLocation = async (locationData: Omit<CustomerLocation, 'id'>) => {
  try {
    const { createCustomerLocation } = await import('@/api/customer')
    await createCustomerLocation(locationData.customer_id, locationData)
    alert.success('ເພີ່ມທີ່ຢູ່ສຳເລັດ!')
    await loadCustomerLocations(locationData.customer_id)
  } catch (error: any) {
    alert.error('ເພີ່ມທີ່ຢູ່ລົ້ມເຫຼວ', error.message)
  }
}

const handleUpdateLocation = async (id: number, locationData: Partial<CustomerLocation>) => {
  try {
    const { updateCustomerLocation } = await import('@/api/customer')
    await updateCustomerLocation(id, locationData)
    alert.success('ແກ້ໄຂທີ່ຢູ່ສຳເລັດ!')
    if (selectedLoan.value?.customer_id) {
      await loadCustomerLocations(selectedLoan.value.customer_id)
    }
  } catch (error: any) {
    alert.error('ແກ້ໄຂທີ່ຢູ່ລົ້ມເຫຼວ', error.message)
  }
}

const handleDeleteLocation = async (id: number) => {
  try {
    const { deleteCustomerLocation } = await import('@/api/customer')
    await deleteCustomerLocation(id)
    alert.success('ລຶບທີ່ຢູ່ສຳເລັດ!')
    if (selectedLoan.value?.customer_id) {
      await loadCustomerLocations(selectedLoan.value.customer_id)
    }
  } catch (error: any) {
    alert.error('ລຶບທີ່ຢູ່ລົ້ມເຫຼວ', error.message)
  }
}

const handleSetPrimary = async (id: number) => {
  try {
    const { updateCustomerLocation } = await import('@/api/customer')
    await updateCustomerLocation(id, { is_primary: 1 })
    alert.success('ຕັ້ງເປັນທີ່ຢູ່ຫຼັກສຳເລັດ!')
    if (selectedLoan.value?.customer_id) {
      await loadCustomerLocations(selectedLoan.value.customer_id)
    }
  } catch (error: any) {
    alert.error('ຕັ້ງເປັນທີ່ຢູ່ຫຼັກລົ້ມເຫຼວ', error.message)
  }
}

// ==========================================
// 🟢 Edit Modal Functions
// ==========================================
const viewLoanDetails = async (loan: any) => {
  try {
    const fullLoan = await loanApplicationStore.fetchLoanApplicationById(loan.id)
    selectedLoan.value = fullLoan

    if (fullLoan.id) {
      await loanApplicationStore.fetchDocuments(fullLoan.id)
      loanDocuments.value.forEach(doc => { doc.file = null; doc.preview = null })
      optionalDocuments.value.forEach(doc => { doc.file = null; doc.preview = null })

      if (loanApplicationStore.currentDocuments.length > 0) {
        loanApplicationStore.currentDocuments.forEach(doc => {
          const docType = doc.document_type || doc.doc_type
          const targetDoc = allLoanDocuments.value.find(d => d.id === docType)
          if (targetDoc && doc.file_url) {
            targetDoc.preview = doc.file_url
          }
        })
      }

      selectedContract.value = null
      try {
        const contract = await loanContractStore.fetchContract(fullLoan.id)
        selectedContract.value = contract
      } catch (error) {
        console.warn(`No existing contract found for loan ${fullLoan.id}`)
      }
    }

    if (fullLoan.customer_id) {
      await loadCustomerLocations(fullLoan.customer_id)
    }

    showDetailsModal.value = true
    isEditingInModal.value = false
    activeTab.value = 'details'
  } catch (error) {
    console.error('Failed to load loan details:', error)
    selectedLoan.value = loan
    showDetailsModal.value = true
    isEditingInModal.value = false
    activeTab.value = 'details'
  }
}

const editLoan = (loan: any) => {
  selectedLoan.value = loan
  showDetailsModal.value = true
  startEditInModal()
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedLoan.value = null
  selectedContract.value = null
  isEditingInModal.value = false
  isSaving.value = false
  activeTab.value = 'details'
  customerLocations.value = []
  isLocationLoading.value = false
  modalProductSearch.value = ''
  showModalProductDropdown.value = false
  selectedModalProduct.value = null
  modalShopId.value = null
  loanDocuments.value.forEach(doc => { doc.file = null; doc.preview = null })
  optionalDocuments.value.forEach(doc => { doc.file = null; doc.preview = null })
}

const startEditInModal = async () => {
  if (!selectedLoan.value) return
  const shopId = selectedLoan.value.product?.partner_id || selectedLoan.value.product?.shop_id || null
  modalShopId.value = shopId

  if (shopId) {
    try {
      await productStore.fetchProducts({ shop_id: shopId, limit: 100 })
      if (selectedLoan.value.product_id) {
        const currentProduct = productStore.products.find(p => p.id === selectedLoan.value!.product_id)
        if (currentProduct) {
          selectedModalProduct.value = currentProduct
          modalProductSearch.value = currentProduct.product_name
        }
      }
    } catch (error) {
      console.error('❌ Failed to load products:', error)
    }
  }

  const fullName = getCustomerName(selectedLoan.value).trim()
  modalLoanForm.customer_name = fullName
  modalLoanForm.customer_phone = getCustomerPhone(selectedLoan.value)
  modalLoanForm.customer_id_card = selectedLoan.value.customer?.identity_number || ''
  modalLoanForm.customer_address = getCustomerAddress(selectedLoan.value)
  modalLoanForm.occupation = selectedLoan.value.customer?.occupation || ''
  modalLoanForm.age = selectedLoan.value.customer?.age || 0
  modalLoanForm.product_id = selectedLoan.value.product_id
  modalLoanForm.product_name = getProductName(selectedLoan.value)
  modalLoanForm.product_type = getProductType(selectedLoan.value)
  modalLoanForm.product_price = Number(selectedLoan.value.product?.price || 0)
  modalLoanForm.total_amount = Number(selectedLoan.value.total_amount || 0)
  modalLoanForm.down_payment = Number(selectedLoan.value.down_payment || 0) // 🟢 ເພີ່ມບັນທັດນີ້
  modalLoanForm.interest_rate = Number(selectedLoan.value.interest_rate_at_apply || 0)
  modalLoanForm.loan_period = Number(selectedLoan.value.loan_period || 0)
  modalLoanForm.monthly_payment = Number(selectedLoan.value.monthly_pay || 0)
  modalLoanForm.monthly_income = Number(selectedLoan.value.customer?.income_per_month || 0)
  modalLoanForm.other_debts = Number(selectedLoan.value.customer?.other_debts || 0)

  // 🟢 ເພີ່ມ 2 ບັນທັດນີ້ ເພື່ອດຶງປະເພດດອກເບ້ຍມາຈາກຂໍ້ມູນເກົ່າ
  modalLoanForm.interest_type = selectedLoan.value.interest_type || 'flat_rate'
  modalLoanForm.interest_rate_type = selectedLoan.value.interest_rate_type || 'monthly'

  isEditingInModal.value = true
  activeTab.value = 'details'
}

const saveLoanFromModal = async () => {
  if (!selectedLoan.value) return
  if (!validateModalForm()) {
    alert.error('ກະລຸນາກວດສອບຂໍ້ມູນທີ່ປ້ອນ')
    return
  }
  if (!allRequiredDocumentsUploaded.value && loanDocuments.value.some(d => d.file)) {
    // Allow saving without docs if they didn't touch them, but if they started, they should finish?
    // For editing existing loan, documents might already exist in preview.
  }

  isSaving.value = true
  try {
    const nameParts = modalLoanForm.customer_name.trim().split(' ')
    const firstName = nameParts[0] || modalLoanForm.customer_name
    const lastName = nameParts.slice(1).join(' ') || ''
    const fee = 20000
    const updateData: any = {
      product_id: selectedModalProduct.value?.id || selectedLoan.value.product_id,
      customer_id: selectedLoan.value.customer_id,
      first_name: firstName,
      last_name: lastName,

      age: Number(modalLoanForm.age),
      phone: modalLoanForm.customer_phone.trim(),
      identity_number: modalLoanForm.customer_id_card.trim(),
      address: modalLoanForm.customer_address.trim(),
      occupation: modalLoanForm.occupation.trim(),

      income_per_month: modalLoanForm.monthly_income,
      other_debts: modalLoanForm.other_debts,
      interest_type: modalLoanForm.interest_type, // 🟢 ເພີ່ມບັນທັດນີ້
      interest_rate_type: modalLoanForm.interest_rate_type, // 🟢 ເພີ່ມບັນທັດນີ້


      total_amount: Number(modalLoanForm.total_amount) || 0,
      down_payment: Number(modalLoanForm.down_payment) || 0, // 🟢 ເພີ່ມບັນທັດນີ້
      interest_rate_at_apply: Number(modalLoanForm.interest_rate) || 0,
      loan_period: Number(modalLoanForm.loan_period) || 0,
      monthly_pay: Number(modalLoanForm.monthly_payment) || 0,
      first_installment_amount: Number(modalLoanForm.monthly_payment || 0) + Number(fee),
    }

    await loanApplicationStore.updateDraftLoanApplication(selectedLoan.value.id, updateData)

    if (selectedLoan.value.id) {
      const allDocs = [...loanDocuments.value, ...optionalDocuments.value].filter(doc => doc.file)
      if (allDocs.length > 0) {
        isUploadingDocuments.value = true
        for (const doc of allDocs) {
          if (doc.file) {
            await loanApplicationStore.uploadDocument(selectedLoan.value.id, doc.file, doc.id)
          }
        }
        await loanApplicationStore.fetchDocuments(selectedLoan.value.id)
        isUploadingDocuments.value = false
      }
    }
    alert.success('ບັນທຶກການປ່ຽນແປງສຳເລັດ!')
    isEditingInModal.value = false
    await loanApplicationStore.fetchLoanApplications({
      status: [LoanApplicationStatus.PENDING, LoanApplicationStatus.VERIFYING] as any,
      is_confirmed: 1, limit: 1000
    })
  } catch (error: any) {
    console.error('Error saving loan:', error)
    alert.error('ເກີດຂໍ້ຜິດພາດການບັນທຶກ', error.message)
  } finally {
    isSaving.value = false
  }
}

// ==========================================
// 🟢 Request Form & Contract Submits
// ==========================================
const handleRequestFormSave = async (customerId: number, formData: any) => {
  if (!selectedLoan.value) return
  try {
    if (!formData || !formData.customer) throw new Error('ข้อมูลฟอร์มไม่ถูกต้อง')
    const formatAddress = (addr: any): string => {
      if (!addr || typeof addr !== 'object') return ''
      return [addr.village, addr.district, addr.province].filter(Boolean).join(', ')
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
      // 🟢 เพิ่มบรรทัดนี้เข้าไป เพื่อดึงค่าจากฟอร์มส่งไปให้ Backend
      GuatantorAGE: formData.guarantor?.age || 0,

      Guarantoraddress: formatAddress(formData.guarantor?.address),
      work_company_name: formData.guarantor?.work?.companyName || '',
      // ลบบรรทัดเดิมออก และเปลี่ยนเป็นแบบนี้:
      work_location: formatAddress(formData.guarantor?.work?.address),
      work_phone: formData.guarantor.work?.phone || '',
      work_position: formData.guarantor?.work?.position || '',
      work_salary: String(formData.guarantor?.work?.salary || '0'),

      first_name: first_name,
      last_name: last_name,
      identity_card: formData.customer.idCard
    }

    const CustLoanData = {
      customer_id: selectedLoan.value.customer_id,
      identity_number: formData.customer.idCard,
      census_number: formData.customer.censusNo,
      first_name: first_name,
      last_name: last_name,
      phone: formData.customer.phone,
      address: formatAddress(formData.customer.address),
      date_of_birth: formData.customer.dob,
      age: formData.customer.age,
      occupation: formData.customer.occupation,
      income_per_month: selectedLoan.value.customer?.income_per_month || 0,
      other_debt: selectedLoan.value.customer?.other_debts || 0,
      unit: formData.customer.unit,
      issue_place: formData.customer.issuePlace,
      issue_date: formData.customer.issueDate,

      product_id: selectedLoan.value.product_id,
      total_amount: Number(formData.product.price) || 0,
      interest_rate_at_apply: Number(formData.product.interestRate) || 0,

      interest_type: modalLoanForm.interest_type, // 🟢 ເພີ່ມບັນທັດນີ້
      interest_rate_type: modalLoanForm.interest_rate_type, // 🟢 ເພີ່ມບັນທັດນີ້

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
    await saveCustProposal(selectedLoan.value.customer_id, selectedLoan.value.id, updateData)
    await loanApplicationStore.updateDraftLoanApplication(selectedLoan.value.id, CustLoanData)
    alert.success('ບັນທຶກແບບຟອມຂໍກູ້ສຳເລັດ!')

    await loanApplicationStore.fetchLoanApplications({
      status: [LoanApplicationStatus.PENDING, LoanApplicationStatus.VERIFYING] as any,
      is_confirmed: 1, limit: 1000
    })
    selectedLoan.value = loanApplicationStore.loanApplications.find(d => d.id === selectedLoan.value?.id) || null
  } catch (error: any) {
    alert.error('ເກີດຂໍ້ຜິດພາດ', error.message)
  }
}

const handleRequestFormUpdated = (updatedData: any) => { }

const handleSaveContract = async (customerId: number, formData: any) => {
  if (!selectedLoan.value) return
  try {
    const formatAddress = (addr: any) => {
      if (!addr) return ''
      return [addr.village, addr.district, addr.province].filter(Boolean).join(', ')
    }

    const contractData: CreateLoanContractRequest = {
      loanId: selectedLoan.value.id,

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
      producttypeId: selectedLoan.value.product?.productType_id || null,
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

      partnerId: selectedLoan.value.product?.partner?.id || null,
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

    await loanContractStore.createContract(selectedLoan.value.id, contractData)
    alert.success('ບັນທຶກສັນຍາສຳເລັດ!')
    isEditingInModal.value = false
    await loanApplicationStore.fetchLoanApplications({
      status: [LoanApplicationStatus.PENDING, LoanApplicationStatus.VERIFYING] as any,
      is_confirmed: 1, limit: 1000
    })
  } catch (error: any) {
    alert.error('ເກີດຂໍ້ຜິດພາດ', error.message)
  }
}

// ==========================================
// 🟢 Document Functions
// ==========================================
const handleDocumentUpload = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

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

  const allDocs = [...loanDocuments.value, ...optionalDocuments.value]
  const reader = new FileReader()
  reader.onload = (e) => {
    if (allDocs[index]) {
      allDocs[index].file = file
      allDocs[index].preview = e.target?.result as string
    }
    if (index < loanDocuments.value.length) {
      loanDocuments.value = [...allDocs.slice(0, loanDocuments.value.length)]
    } else {
      optionalDocuments.value = [...allDocs.slice(loanDocuments.value.length)]
    }
    target.value = ''
  }
  reader.readAsDataURL(file)
}

const removeDocument = (index: number) => {
  const allDocs = [...loanDocuments.value, ...optionalDocuments.value]
  if (allDocs[index]) {
    allDocs[index].file = null
    allDocs[index].preview = null
  }

  if (index < loanDocuments.value.length) {
    loanDocuments.value = [...allDocs.slice(0, loanDocuments.value.length)]
  } else {
    optionalDocuments.value = [...allDocs.slice(loanDocuments.value.length)]
  }
}

const getDocumentTypeName = (type: string): string => {
  const typeMap: Record<string, string> = { 'id_card': 'ບັດປະຈຳຕົວ', 'household': 'ໃບຄອບຄົວ', 'income': 'ຫຼັກຖານລາຍຮັບ', 'other': 'ເອກະສານອື່ນໆ' }
  return typeMap[type] || type
}

// const getFullImageUrl = (url: string | null | undefined): string => {
//   if (!url) return '';
//   if (url.startsWith('http')) return url;
//   const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:3000';
//   return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
// };

const formatFileSize = (size: number | string): string => {
  if (!size) return 'ບໍ່ຮູ້ຈັກ'
  const numSize = typeof size === 'string' ? parseInt(size) : size
  if (numSize < 1024) return `${numSize} B`
  if (numSize < 1024 * 1024) return `${(numSize / 1024).toFixed(1)} KB`
  return `${(numSize / (1024 * 1024)).toFixed(1)} MB`
}

// Export CSV
const exportToCSV = () => {
  if (!displayedLoans.value.length) {
    alert.info('ບໍ່ມີຂໍ້ມູນສຳລັບສົ່ງອອກ')
    return
  }
  const csvData = displayedLoans.value.map(loan => ({
    'ເລກທີ່ສິນເຊື່ອ': loan.loan_id || `LN-${loan.id}`,
    'ລູກຄ້າ': getCustomerName(loan),
    'ເບີໂທ': getCustomerPhone(loan),
    'ສິນຄ້າ': getProductName(loan),
    'ປະເພດ': getProductType(loan),
    'ຈຳນວນເງິນ': formatPrice(loan.total_amount),
    'ດອກເບ້ຍ (%)': loan.interest_rate_at_apply,
    'ໄລຍະເວລາ (ເດືອນ)': loan.loan_period,
    'ເຈົ້າໜ້າທີ່': getRequesterName(loan),
    'ສະຖານະ': getStatusText(loan.status),
    'ວັນທີ່ສ້າງ': formatDate(loan.created_at || loan.createdAt || '')
  }))
  const csv = Papa.unparse(csvData)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `loans_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

// Pagination
const previousPage = () => {
  if (hasPreviousPage.value) currentPage.value--
}

const nextPage = () => {
  if (hasNextPage.value) currentPage.value++
}

watch(pageSize, () => {
  currentPage.value = 1
})

onMounted(async () => {
  try {
    console.log('📡 Loading loan applications...')
    await Promise.all([
      loanApplicationStore.fetchLoanApplications({
        status: [LoanApplicationStatus.PENDING, LoanApplicationStatus.VERIFYING] as any,
        is_confirmed: 1,
        limit: 1000
      }),
      productStore.fetchProductTypes(),
      shopStore.fetchAllShop()
    ])
    console.log('✅ Loaded loans:', loanApplicationStore.loanApplications.length)
  } catch (error) {
    console.error('❌ Failed to load loans:', error)
    alert.error('ເກີດຂໍ້ຜິດພາດການດຶງຂໍ້ມູນສິນເຊື່ອ')
  }
})
</script>
