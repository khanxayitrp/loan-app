<template>
  <div class="p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ສິນເຊື່ອ</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">ຈັດການຄຳຂໍສິນເຊື່ອທີ່ສົ່ງແລ້ວ</p>
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
          <tr v-for="loan in displayedLoans" :key="loan.id">
            <td class="font-medium">
              <div>{{ getCustomerName(loan) }}</div>
              <div class="text-sm text-gray-500">{{ getCustomerPhone(loan) }}</div>
            </td>
            <td>
              <div>{{ getProductName(loan) }}</div>
              <div class="text-sm text-gray-500">{{ getProductType(loan) }}</div>
            </td>
            <td class="font-medium">{{ formatPrice(loan.total_amount) }}</td>
            <td>{{ getRequesterName(loan) }}</td>
            <td>
              <span class="badge badge-soft" :class="getStatusBadgeClass(loan.status)">
                {{ getStatusText(loan.status) }}
              </span>
            </td>
            <td>{{ formatDate(loan.createdAt) }}</td>
            <td>
              <div class="flex gap-2">
                <button class="btn btn-circle btn-text btn-sm" @click="viewLoanDetails(loan)" aria-label="View details">
                  <span class="icon-[tabler--eye] size-4"></span>
                </button>

                <button class="btn btn-circle btn-text btn-sm text-info" @click="viewSchedule(loan)" aria-label="View Schedule" title="ຕາຕະລາງຜ່ອນຊຳລະ">
                  <span class="icon-[tabler--calendar-stats] size-4"></span>
                </button>

                <button v-if="loan.status !== 'closed' && loan.status !== 'disbursed'"
                  class="btn btn-circle btn-text btn-sm" @click="editLoan(loan)" aria-label="Edit loan">
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

    <teleport to="body">
      <div v-if="showDetailsModal && selectedLoan"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold">
              {{ isEditingInModal ? 'ແກ້ໄຂສິນເຊື່ອ' : 'ລາຍລະອຽດສິນເຊື່ອ' }}
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
            <button class="tab" :class="{ 'tab-active': activeTab === 'schedule' }" @click="activeTab = 'schedule'">
              <span class="icon-[tabler--calendar-stats] size-4 mr-1"></span>
              ຕາຕະລາງຜ່ອນ
            </button>
          </div>

          <div v-if="activeTab === 'details'" class="space-y-6">
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
                    <label class="text-sm font-medium text-gray-500">ສະຖານະ</label>
                    <p>
                      <span class="badge badge-soft text-sm" :class="getStatusBadgeClass(selectedLoan.status)">
                        {{ getStatusText(selectedLoan.status) }}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">ຈຳນວນເງິນກູ້</label>
                    <p class="font-medium text-xl text-primary">{{ formatPrice(selectedLoan.total_amount) }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">ອັດຕາດອກເບ້ຍ</label>
                    <p class="font-medium">{{ selectedLoan.interest_rate_at_apply }}%
                      <span class="text-primary text-xs">{{ selectedLoan.interest_rate_type === 'yearly' ? '(ຕໍ່ປີ)' : '(ຕໍ່ເດືອນ)' }}</span>
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
                    <p>{{ formatDate(selectedLoan.createdAt) }}</p>
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
                    <p class="font-medium text-success">{{ formatPrice(selectedLoan.customer.income_per_month || 0) }}</p>
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

            <div v-else class="space-y-6">
              <div>
                <h4 class="font-medium text-lg mb-4 flex items-center gap-2">
                  <span class="icon-[tabler--user-edit] size-5 text-primary"></span>
                  ແກ້ໄຂຂໍ້ມູນລູກຄ້າ
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">ຊື່ ແລະ ນາມສະກຸນ *</span>
                    </label>
                    <input v-model="modalLoanForm.customer_name" type="text" class="input input-bordered w-full"
                      :class="{ 'input-error': modalFormErrors.customer_name }" required />
                    <label v-if="modalFormErrors.customer_name" class="label text-error">
                      <span class="label-text-alt">{{ modalFormErrors.customer_name }}</span>
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">ເບີໂທລະສັບ *</span>
                    </label>
                    <input v-model="modalLoanForm.customer_phone" type="tel" class="input input-bordered w-full"
                      :class="{ 'input-error': modalFormErrors.customer_phone }" required />
                    <label v-if="modalFormErrors.customer_phone" class="label text-error">
                      <span class="label-text-alt">{{ modalFormErrors.customer_phone }}</span>
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">ເລກບັດປະຈຳຕົວ *</span>
                    </label>
                    <input v-model="modalLoanForm.customer_id_card" type="text" class="input input-bordered w-full"
                      :class="{ 'input-error': modalFormErrors.customer_id_card }" required />
                    <label v-if="modalFormErrors.customer_id_card" class="label text-error">
                      <span class="label-text-alt">{{ modalFormErrors.customer_id_card }}</span>
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">ອາຍຸ *</span>
                    </label>
                    <input v-model.number="modalLoanForm.age" type="number" class="input input-bordered w-full"
                      min="0" />
                    <label v-if="modalFormErrors.age" class="label text-error">
                      <span class="label-text-alt">{{ modalFormErrors.age }}</span>
                    </label>
                  </div>
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">ອາຊີບ *</span>
                    <span class="text-xs text-gray-500 ml-1">(ຂໍ້ມູນສຳຄັນສຳລັບການພິຈາລະນາສິນເຊື່ອ)</span>
                  </label>
                  <input v-model="modalLoanForm.occupation"
                    placeholder="ປ້ອນອາຊີບ (ຕົວຢ່າງ: ພະນັກງານລັດ, ທຸລະກິດສ່ວນຕົວ, ກະສິກອນ, ແຮງງານ)" type="text"
                    class="input input-bordered w-full" :class="{ 'input-error': modalFormErrors.occupation }"
                    required />
                  <label v-if="modalFormErrors.occupation" class="label text-error">
                    <span class="label-text-alt">{{ modalFormErrors.occupation }}</span>
                  </label>
                  <div class="text-xs text-gray-500 mt-1">
                    <p>ຕົວຢ່າງ: ພະນັກງານບໍລິສັດ, ຄູ, ແພດ, ທຸລະກິດສ່ວນຕົວ, ກະສິກອນ, ແຮງງານອຸດສາຫະກຳ</p>
                  </div>
                </div>
                <div class="form-control mt-4">
                  <label class="label">
                    <span class="label-text font-medium">ທີ່ຢູ່ *</span>
                  </label>
                  <textarea v-model="modalLoanForm.customer_address" class="textarea textarea-bordered w-full min-h-24"
                    :class="{ 'textarea-error': modalFormErrors.customer_address }" required></textarea>
                  <label v-if="modalFormErrors.customer_address" class="label text-error">
                    <span class="label-text-alt">{{ modalFormErrors.customer_address }}</span>
                  </label>
                </div>
              </div>

              <div class="border-t pt-6">
                <h4 class="font-medium text-lg mb-4 flex items-center gap-2">
                  <span class="icon-[tabler--shopping-cart] size-5 text-primary"></span>
                  ເລືອກສິນຄ້າ
                </h4>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">ສິນຄ້າ *</span>
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
                  </div>
                  <div v-if="!modalShopId" class="text-xs text-warning mt-1">
                    ⚠️ ບໍ່ພົບຂໍ້ມູນຮ້ານຄ້າສຳລັບດຶງລາຍການສິນຄ້າ
                  </div>
                  <div v-if="showModalProductDropdown && filteredModalProducts.length > 0"
                    class="absolute z-10 mt-1 w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div v-for="product in filteredModalProducts" :key="product.id"
                      class="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3"
                      @click="selectModalProduct(product)">
                      <div class="w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <span class="icon-[tabler--box] size-4 text-gray-400"></span>
                      </div>
                      <div class="flex-1">
                        <div class="font-medium">{{ product.product_name }}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">{{ product.type_name }}</div>
                      </div>
                      <div class="text-right">
                        <div class="font-medium text-primary">{{ formatPrice(product.price) }}</div>
                        <div class="text-xs text-gray-500">{{ product.interest_rate }}% / {{ product.term }} ເດືອນ</div>
                      </div>
                    </div>
                  </div>
                  <div v-else-if="showModalProductDropdown && filteredModalProducts.length === 0 && modalProductSearch"
                    class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
                    <div class="text-center text-gray-500">ບໍ່ພົບສິນຄ້າ</div>
                  </div>
                </div>
                <div v-if="modalLoanForm.product_name" class="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label class="text-xs font-medium text-gray-500">ສິນຄ້າທີ່ເລືອກ</label>
                      <p class="font-medium">{{ modalLoanForm.product_name }}</p>
                    </div>
                    <div>
                      <label class="text-xs font-medium text-gray-500">ປະເພດ</label>
                      <p class="text-sm">{{ modalLoanForm.product_type || '-' }}</p>
                    </div>
                    <div>
                      <label class="text-xs font-medium text-gray-500">ລາຄາ</label>
                      <p class="font-medium text-primary">{{ formatPrice(modalLoanForm.product_price || 0) }}</p>
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
                    <label class="label">
                      <span class="label-text font-medium">ຈຳນວນເງິນກູ້ *</span>
                    </label>
                    <input v-model.number="modalLoanForm.total_amount" type="number" class="input input-bordered w-full"
                      :class="{ 'input-error': modalFormErrors.total_amount }" min="0" required />
                    <div class="text-xs text-gray-500 mt-1">
                      {{ formatPrice(modalLoanForm.total_amount) }} ກີບ
                    </div>
                    <label v-if="modalFormErrors.total_amount" class="label text-error">
                      <span class="label-text-alt">{{ modalFormErrors.total_amount }}</span>
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">ອັດຕາດອກເບ້ຍ (%) *</span>
                    </label>
                    <input v-model.number="modalLoanForm.interest_rate" type="number"
                      class="input input-bordered w-full" :class="{ 'input-error': modalFormErrors.interest_rate }"
                      min="0" max="100" step="0.01" required />
                    <label v-if="modalFormErrors.interest_rate" class="label text-error">
                      <span class="label-text-alt">{{ modalFormErrors.interest_rate }}</span>
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">ໄລຍະເວລາ (ເດືອນ) *</span>
                    </label>
                    <input v-model.number="modalLoanForm.loan_period" type="number" class="input input-bordered w-full"
                      :class="{ 'input-error': modalFormErrors.loan_period }" min="1" max="60" required />
                    <label v-if="modalFormErrors.loan_period" class="label text-error">
                      <span class="label-text-alt">{{ modalFormErrors.loan_period }}</span>
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">ຄ່າງວດຕໍ່ເດືອນ</span>
                    </label>
                    <input :value="formatPrice(modalLoanForm.monthly_payment)" type="text"
                      class="input input-bordered w-full bg-gray-100 dark:bg-gray-700 cursor-not-allowed" readonly />
                    <div class="text-xs text-success mt-1 font-medium">
                      {{ formatPrice(modalLoanForm.monthly_payment) }}/ເດືອນ
                    </div>
                  </div>
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">ລາຍຮັບຕໍ່ເດືອນ *</span>
                    </label>
                    <input v-model.number="modalLoanForm.monthly_income" type="number"
                      class="input input-bordered w-full" :class="{ 'input-error': modalFormErrors.monthly_income }"
                      min="0" />
                    <div class="text-xs text-gray-500 mt-1">
                      {{ formatPrice(modalLoanForm.monthly_income) }} ກີບ
                    </div>
                    <label v-if="modalFormErrors.monthly_income" class="label text-error">
                      <span class="label-text-alt">{{ modalFormErrors.monthly_income }}</span>
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">ໜີ້ສິນອື່ນໆ</span>
                    </label>
                    <input v-model.number="modalLoanForm.other_debts" type="number" class="input input-bordered w-full"
                      min="0" />
                    <div class="text-xs text-gray-500 mt-1">
                      {{ formatPrice(modalLoanForm.other_debts || 0) }} ກີບ
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-primary/5 dark:bg-primary/10 rounded-lg p-4">
                <h4 class="font-medium mb-3">ສະຫຼຸບການຜ່ອນ (ພຣີວິວ)</h4>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">ລາຄາສິນຄ້າ:</span>
                    <span class="font-medium">{{ formatPrice(modalLoanForm.product_price || 0) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">ເງິນກູ້:</span>
                    <span class="font-medium text-primary">{{ formatPrice(modalLoanForm.total_amount) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">ດອກເບ້ຍ ({{ modalLoanForm.interest_rate }}%):</span>
                    <span class="font-medium text-error">{{ formatPrice(calculateModalTotalInterest()) }}</span>
                  </div>
                  <div class="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span class="font-medium">ຍອດຊຳລະທັງໝົດ:</span>
                    <span class="font-medium text-xl text-primary">
                      {{ formatPrice(calculateModalTotalPayment()) }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">ຄ່າງວດຕໍ່ເດືອນ:</span>
                    <span class="font-medium text-success">{{ formatPrice(modalLoanForm.monthly_payment) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">ຈຳນວນງວດ:</span>
                    <span class="font-medium">{{ modalLoanForm.loan_period }} ເດືອນ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'documents'">
             <div v-if="!isEditingInModal" class="space-y-6">
               <div v-if="!loanApplicationStore.currentDocuments || loanApplicationStore.currentDocuments.length === 0"
                class="text-center py-12 text-gray-500">
                <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span class="icon-[tabler--file-off] size-8 text-gray-400"></span>
                </div>
                <p class="text-lg font-medium">ບໍ່ມີເອກະສານແນບ</p>
              </div>
              <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="doc in loanApplicationStore.currentDocuments" :key="doc.id"
                  class="border rounded-lg p-4 flex flex-col gap-3 bg-white dark:bg-gray-800">
                  <div class="flex justify-between items-start">
                    <div>
                      <h5 class="font-medium text-sm">{{ getDocumentTypeName(doc.document_type || doc.doc_type) }}</h5>
                      <p class="text-xs text-gray-500 mt-1">{{ doc.original_filename || doc.file_name || 'ບໍ່ຮູ້ຈັກ' }}</p>
                    </div>
                    <a :href="getFullImageUrl(doc.file_url)" target="_blank" download
                      class="btn btn-xs btn-ghost text-primary hover:bg-primary/10">
                      <span class="icon-[tabler--download] size-4 mr-1"></span> ດາວໂຫຼດ
                    </a>
                  </div>
                  <div class="mt-2">
                    <div v-if="isImage(doc.file_url)" class="aspect-video bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                      <img :src="getFullImageUrl(doc.file_url)" alt="Document preview" class="w-full h-full object-contain p-2" />
                    </div>
                    <div v-else class="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                      <span class="icon-[tabler--file-description] size-12 text-gray-400"></span>
                    </div>
                  </div>
                </div>
              </div>
             </div>
             <div v-else class="space-y-6">
                </div>
          </div>

          <div v-else-if="activeTab === 'map'" class="space-y-6">
            <div v-if="!selectedLoan?.customer_id" class="text-center py-12 text-gray-500">
              <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="icon-[tabler--map-pin-off] size-8 text-gray-400"></span>
              </div>
              <p class="text-lg font-medium">ບໍ່ມີຂໍ້ມູນລູກຄ້າ</p>
            </div>
            <CustomerLocationMap v-else :customer-id="selectedLoan.customer_id" :locations="customerLocations"
              googleMapsApiKey="YOUR_API_KEY" :is-loading="isLocationLoading" :can-add-location="true"
              :can-edit-location="true" :can-delete-location="true" :can-set-primary="true"
              @add-location="handleAddLocation" @update-location="handleUpdateLocation"
              @delete-location="handleDeleteLocation" @set-primary="handleSetPrimary" />
          </div>

          <div v-else-if="activeTab === 'requestForm'" class="space-y-6">
            <LoanRequestForm :loan-application-id="selectedLoan?.id" :loan-application="selectedLoan"
              :is-editing="isEditingInModal" @save-form="handleRequestFormSave" @form-updated="handleRequestFormUpdated"
              @cancel-edit="isEditingInModal = false" />
          </div>

          <div v-else-if="activeTab === 'loanContract'" class="space-y-6">
            <LoanContractForm :loan-contract-id="selectedLoan?.id" :loan-application="selectedLoan"
              :loan-contract="selectedContract" :is-editing="isEditingInModal" @cancel-edit="isEditingInModal = false"
              @enable-edit="isEditingInModal = true" @save-form="handleSaveContract" />
          </div>

          <div v-else-if="activeTab === 'schedule'" class="space-y-4">
             <div class="flex justify-between items-center bg-primary/10 p-4 rounded-lg border border-primary/20">
                <div>
                   <h4 class="font-bold text-primary text-lg">ຕາຕະລາງຜ່ອນຊຳລະ (ຮ່າງ)</h4>
                   <p class="text-sm text-gray-600 mt-1">
                     ຍອດຈັດ (ຕົ້ນທຶນ): <span class="font-medium text-black">{{ formatPrice(Number(selectedLoan?.total_amount || 0) - Number(selectedLoan?.down_payment || 0)) }}</span> |
                     ດອກເບ້ຍ: <span class="font-medium text-black">{{ selectedLoan?.interest_rate_at_apply }}%
                     {{ selectedLoan?.interest_rate_type === 'yearly' ? '(ຕໍ່ປີ)' : '(ຕໍ່ເດືອນ)' }}</span> |
                     ປະເພດ: <span class="font-medium text-black">{{ selectedLoan?.interest_type === 'effective_rate' ? 'ຫຼຸດຕົ້ນຫຼຸດດອກ' : 'ຄົງທີ່' }}</span>
                   </p>
                </div>
                <button class="btn btn-warning btn-sm" @click="generateSchedule">
                   <span class="icon-[tabler--refresh] size-4 mr-1"></span> ຣີເຊັດຄ່າເລີ່ມຕົ້ນ
                </button>
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
                          {{ formatPrice(Number(selectedLoan?.total_amount || 0) - Number(selectedLoan?.down_payment || 0)) }}
                       </td>
                    </tr>
                    <tr v-for="(row, index) in scheduleRows" :key="index" class="hover:bg-base-200/30 transition-colors">
                       <td class="text-center align-middle font-medium">{{ row.installment_number }}</td>
                       <td class="align-middle">
                          <input type="date" v-model="row.due_date" class="input input-sm input-bordered w-full" />
                       </td>
                       <td class="align-middle">
                          <input type="text"
                            :value="formatCurrencyInput(row.principal)"
                            @input="handleScheduleInput(row, 'principal', $event)"
                            class="input input-sm input-bordered w-full text-right" />
                       </td>
                       <td class="align-middle">
                          <input type="text"
                            :value="formatCurrencyInput(row.interest)"
                            @input="handleScheduleInput(row, 'interest', $event)"
                            class="input input-sm input-bordered w-full text-right text-error font-medium" />
                       </td>
                       <td class="text-right align-middle font-bold bg-gray-50 text-success">
                          {{ formatPrice(row.total_amount) }}
                       </td>
                       <td class="text-right align-middle font-bold" :class="row.remaining_balance <= 0 ? 'text-success' : 'text-primary'">
                          {{ formatPrice(row.remaining_balance) }}
                       </td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-primary/5 font-bold text-base">
                    <tr>
                      <td colspan="2" class="text-right align-middle">ລວມທັງໝົດ:</td>
                      <td class="text-right text-primary align-middle">{{ formatPrice(totalSchedulePrincipal) }}</td>
                      <td class="text-right text-error align-middle">{{ formatPrice(totalScheduleInterest) }}</td>
                      <td class="text-right text-success align-middle">{{ formatPrice(totalSchedulePrincipal + totalScheduleInterest) }}</td>
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
             <p class="text-xs text-gray-500 italic mt-2">
               * ໝາຍເຫດ: ທ່ານສາມາດແກ້ໄຂຕົວເລກໃນຊ່ອງຕົ້ນທຶນ ແລະ ດອກເບ້ຍໄດ້ (ລະບົບຈະໃສ່ເຄື່ອງໝາຍຈຸດໃຫ້ອັດຕະໂນມັດ). ລະບົບຈະຄຳນວນຍອດລວມ ແລະ ຍອດເຫຼືອໜີ້ໃນງວດຖັດໄປອັດຕະໂນມັດ.
             </p>
          </div>

          <div class="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button class="btn btn-soft btn-secondary" @click="closeDetailsModal">
              {{ isEditingInModal ? 'ຍົກເລີກ' : 'ປິດ' }}
            </button>
            <button
              v-if="!isEditingInModal && selectedLoan.status !== LoanApplicationStatus.CLOSED_EARLY && selectedLoan.status !== 'completed' && activeTab !== 'schedule'"
              class="btn btn-primary" @click="startEditInModal">
              <span class="icon-[tabler--edit] size-4 mr-1"></span>
              ແກ້ໄຂ
            </button>
            <button v-else-if="isEditingInModal && activeTab !== 'schedule'" class="btn btn-success" @click="saveLoanFromModal"
              :disabled="isSaving">
              <span v-if="isSaving" class="loading loading-spinner loading-xs"></span>
              <span v-else class="icon-[tabler--device-floppy] size-4 mr-1"></span>
              <span v-if="!isSaving">ບັນທຶກການປ່ຽນແປງ</span>
            </button>
            <button v-if="activeTab === 'schedule'" class="btn btn-success" @click="saveSchedule" :disabled="isSaving">
              <span class="icon-[tabler--device-floppy] size-4 mr-1"></span> ບັນທຶກຕາຕະລາງ
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
import { LoanApplicationStatus } from '@/types/loanApplication'
import type { CustomerLocation } from '@/types/customer'
import type { CreateLoanContractRequest } from '@/types/loanContract'
import { formatPrice } from '@/utils/formatters'
import Papa from 'papaparse'
import { getFullImageUrl } from '@/utils/url'
import CustomerLocationMap from '@/components/loans/form/CustomerLocationMap.vue'
import LoanRequestForm from '@/components/loans/form/RequestForm.vue'
import LoanContractForm from '@/components/loans/form/LoanContractForm.vue'
import { useLoanContractStore } from '@/stores/loanContract'
import { alert } from '@/utils/alert'

const loanApplicationStore = useLoanApplicationStore()
const productStore = useProductStore()
const loanContractStore = useLoanContractStore()
const router = useRouter()

const isLoading = computed(() => loanApplicationStore.isLoading)
const isSaving = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const statusFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')

const showDetailsModal = ref(false)
// 🟢 ໃຊ້ Type ທີ່ຮອງຮັບທຸກ Field ເພື່ອແກ້ໄຂບັນຫາ Property does not exist
const selectedLoan = ref<any | null>(null)
const selectedContract = ref<any | null>(null)
const isEditingInModal = ref(false)
const activeTab = ref<'details' | 'documents' | 'map' | 'requestForm' | 'loanContract' | 'schedule'>('details')

const modalProductSearch = ref('')
const showModalProductDropdown = ref(false)
const selectedModalProduct = ref<any | null>(null)
const modalShopId = ref<number | null>(null)
const customerLocations = ref<CustomerLocation[]>([])
const isLocationLoading = ref(false)

// 🟢 State ສຳລັບຕາຕະລາງຜ່ອນຊຳລະ
interface ScheduleRow {
  installment_number: number;
  due_date: string;
  principal: number;
  interest: number;
  total_amount: number;
  remaining_balance: number;
}
const scheduleRows = ref<ScheduleRow[]>([])

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
  interest_rate: 0,
  loan_period: 0,
  monthly_payment: 0,
  monthly_income: 0,
  other_debts: 0
})

const modalFormErrors = reactive({
  customer_name: '',
  customer_phone: '',
  customer_id_card: '',
  customer_address: '',
  occupation: '',
  age: '',
  total_amount: '',
  interest_rate: '',
  loan_period: '',
  monthly_income: ''
})

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

const uploadedDocuments = ref<any[]>([])
const isUploadingDocuments = ref(false)

const isConfirmed = (value: any) => {
  return value === true || value === 1 || value === 'true' || value === '1'
}

const isImage = (url: string) => /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url.toLowerCase());

const filteredLoans = computed(() => {
  let filtered = loanApplicationStore.loanApplications.filter(app =>
    isConfirmed(app.is_confirmed)
  )
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(loan => {
      if (loan.customer) {
        const fullName = `${loan.customer.first_name || ''} ${loan.customer.last_name || ''}`.trim().toLowerCase();
        if (fullName.includes(query)) return true;
        if (loan.customer.phone?.includes(query)) return true;
      }
      if (loan.loan_id?.toLowerCase().includes(query)) return true;
      return false;
    })
  }
  if (statusFilter.value) {
    filtered = filtered.filter(loan => loan.status === statusFilter.value)
  }
  if (dateFrom.value || dateTo.value) {
    filtered = filtered.filter(loan => {
      if (!loan.createdAt) return false;
      const loanDate = new Date(loan.createdAt).toISOString().split('T')[0] || '';
      const fromDate = dateFrom.value || '1970-01-01'
      const toDate = dateTo.value || '9999-12-31'
      return loanDate >= fromDate && loanDate <= toDate
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

// Helper functions
const getCustomerName = (loan: any): string => {
  if (!loan.customer) return '-'
  return `${loan.customer?.first_name || ''} ${loan.customer?.last_name || ''}`.trim() || '-'
}

const getCustomerPhone = (loan: any): string => loan.customer?.phone || '-'
const getCustomerAddress = (loan: any): string => loan.customer?.address || '-'
const getProductName = (loan: any): string => loan.product?.product_name || '-'
const getProductType = (loan: any): string => {
  const typeId = loan.product?.productType_id
  if (!typeId) return '-'
  return productStore.productTypeMap[typeId] || '-'
}
const getRequesterName = (loan: any): string => loan.requester?.name || `ID: ${loan.requester_id || '-'}`

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
    'pending': 'ລໍຖ້າ', 'verifying': 'ກຳລັງກວດ', 'approved': 'ອະນຸມັດ',
    'rejected': 'ປະຕິເສດ', 'disbursed': 'ຈ່າຍເງິນແລ້ວ', 'closed': 'ປິດສິນເຊື່ອ'
  }
  return statusMap[status] || status
}

// 🟢 ຟັງຊັນສ້າງຕາຕະລາງຜ່ອນຊຳລະເບື້ອງຕົ້ນ
const generateSchedule = () => {
  scheduleRows.value = [];
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
  if(ratePerMonth > 0) {
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

      // 🟢 ໃຊ້ || '' ເພື່ອແກ້ໄຂບັນຫາ TS string | undefined
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

// 🟢 Helper Function ສຳລັບ Format ຕົວເລກໃນ Input
const formatCurrencyInput = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return val.toLocaleString('en-US');
};

// 🟢 ຟັງຊັນຈັດການເມື່ອພິມຕົວເລກໃນ Input
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

// 🟢 ຟັງຊັນຄຳນວນໃໝ່ເມື່ອມີການແກ້ໄຂ
const recalculateSchedule = () => {
  if (!selectedLoan.value) return;
  const loan = selectedLoan.value;
  const price = Number(loan.total_amount || loan.product?.price || 0);
  const downPayment = Number(loan.down_payment || 0);
  const initialPrincipal = price - downPayment;

  let currentBalance = initialPrincipal;

  for (let i = 0; i < scheduleRows.value.length; i++) {
      let row = scheduleRows.value[i];

      // 🟢 ປ້ອງກັນບໍ່ໃຫ້ row ເປັນ undefined
      if (!row) continue;

      row.principal = Number(row.principal) || 0;
      row.interest = Number(row.interest) || 0;
      row.total_amount = row.principal + row.interest;

      currentBalance -= row.principal;
      row.remaining_balance = Math.round(currentBalance);
  }
}

// Computed ສຳລັບລວມຍອດຕາຕະລາງ
const totalSchedulePrincipal = computed(() => scheduleRows.value.reduce((sum, row) => sum + Number(row.principal), 0))
const totalScheduleInterest = computed(() => scheduleRows.value.reduce((sum, row) => sum + Number(row.interest), 0))
const totalScheduleRemaining = computed(() => {
  const loan = selectedLoan.value;
  if(!loan) return 0;
  const initial = Number(loan.total_amount) - Number(loan.down_payment || 0);
  return initial - totalSchedulePrincipal.value;
})

const saveSchedule = () => {
  console.log("Data to save:", scheduleRows.value);
  alert.success('ບັນທຶກຕາຕະລາງຜ່ອນສຳເລັດ! (UI Only)');
}

const viewSchedule = async (loan: any) => {
  try {
    const fullLoan = await loanApplicationStore.fetchLoanApplicationById(loan.id)
    selectedLoan.value = fullLoan
    generateSchedule()
    showDetailsModal.value = true
    isEditingInModal.value = false
    activeTab.value = 'schedule'
  } catch (error) {
    console.error(error)
    alert.error('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້')
  }
}

const calculateTotalInterest = (loan: any): number => {
  const totalPayment = Number(loan.monthly_pay) * Number(loan.loan_period)
  return totalPayment - Number(loan.total_amount)
}

const calculateTotalPayment = (loan: any): number => {
  return Number(loan.monthly_pay) * Number(loan.loan_period)
}

const calculateModalTotalInterest = (): number => {
  return calculateModalTotalPayment() - modalLoanForm.total_amount
}

const calculateModalTotalPayment = (): number => {
  return modalLoanForm.monthly_payment * modalLoanForm.loan_period
}

const calculateMonthlyPayment = (): number => {
  const { total_amount, interest_rate, loan_period } = modalLoanForm
  if (!total_amount || !interest_rate || !loan_period) return 0
  const monthlyRate = interest_rate / 100 / 12
  const monthlyPayment = (total_amount * monthlyRate * Math.pow(1 + monthlyRate, loan_period)) /
    (Math.pow(1 + monthlyRate, loan_period) - 1)
  return Math.round(monthlyPayment)
}

const handleRequestFormSave = async (customerId: number, formData: any) => {}
const handleRequestFormUpdated = (updatedData: any) => {}
const handleSaveContract = async (customerId: number, formData: any) => {}

const selectModalProduct = (product: any) => {
  selectedModalProduct.value = product
  modalProductSearch.value = product.product_name
  showModalProductDropdown.value = false
  modalLoanForm.product_id = product.id
  modalLoanForm.product_name = product.product_name
  modalLoanForm.product_type = product.productType?.type_name || product.type_name || ''
  modalLoanForm.product_price = product.price
  modalLoanForm.total_amount = product.price
  modalLoanForm.interest_rate = product.interest_rate
  modalLoanForm.loan_period = product.term
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

let modalProductSearchTimer: NodeJS.Timeout | null = null
const debounceModalProductSearch = () => {
  if (modalProductSearchTimer) clearTimeout(modalProductSearchTimer)
  modalProductSearchTimer = setTimeout(() => {}, 300)
}

const validateModalForm = (): boolean => {
  Object.keys(modalFormErrors).forEach(key => {
    modalFormErrors[key as keyof typeof modalFormErrors] = ''
  })
  let isValid = true
  if (!modalLoanForm.customer_name.trim()) { modalFormErrors.customer_name = 'ກະລຸນາປ້ອນຊື່ລູກຄ້າ'; isValid = false }
  if (!modalLoanForm.customer_phone.trim()) { modalFormErrors.customer_phone = 'ກະລຸນາປ້ອນເບີໂທລະສັບ'; isValid = false }
  return isValid
}

let debounceTimer: NodeJS.Timeout | null = null
const debounceSearch = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { currentPage.value = 1 }, 300)
}

const applyDateFilter = () => { currentPage.value = 1 }

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

const handleAddLocation = async (locationData: Omit<CustomerLocation, 'id'>) => {}
const handleUpdateLocation = async (id: number, locationData: Partial<CustomerLocation>) => {}
const handleDeleteLocation = async (id: number) => {}
const handleSetPrimary = async (id: number) => {}

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
          if (targetDoc && doc.file_url) targetDoc.preview = doc.file_url
        })
      }
      selectedContract.value = null
      try {
        const contract = await loanContractStore.fetchContract(fullLoan.id)
        selectedContract.value = contract
      } catch (error) {}
    }
    if (fullLoan.customer_id) await loadCustomerLocations(fullLoan.customer_id)

    // 🟢 Generate ຕາຕະລາງສະເໝີເວລາເປີດລາຍລະອຽດ
    generateSchedule()

    showDetailsModal.value = true
    isEditingInModal.value = false
    activeTab.value = 'details'
  } catch (error) {
    alert.error('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້')
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
  productStore.products = []
  scheduleRows.value = [] // ລ້າງຕາຕະລາງ
  loanDocuments.value.forEach(doc => { doc.file = null; doc.preview = null })
  optionalDocuments.value.forEach(doc => { doc.file = null; doc.preview = null })
}

const startEditInModal = async () => {}
const saveLoanFromModal = async () => {}
const handleDocumentUpload = (index: number, event: Event) => {}
const removeDocument = (index: number) => {}

const getDocumentTypeName = (type: string): string => {
  const typeMap: Record<string, string> = { 'id_card': 'ບັດປະຈຳຕົວ', 'household': 'ໃບຄອບຄົວ', 'income': 'ຫຼັກຖານລາຍຮັບ', 'other': 'ເອກະສານອື່ນໆ' }
  return typeMap[type] || type
}

const formatFileSize = (size: number | string): string => {
  if (!size) return 'ບໍ່ຮູ້ຈັກ'
  const numSize = typeof size === 'string' ? parseInt(size) : size
  if (numSize < 1024) return `${numSize} B`
  if (numSize < 1024 * 1024) return `${(numSize / 1024).toFixed(1)} KB`
  return `${(numSize / (1024 * 1024)).toFixed(1)} MB`
}

const exportToCSV = () => {}
const previousPage = () => { if (hasPreviousPage.value) currentPage.value-- }
const nextPage = () => { if (hasNextPage.value) currentPage.value++ }
watch(pageSize, () => { currentPage.value = 1 })

onMounted(async () => {
  try {
    await Promise.all([
      loanApplicationStore.fetchLoanApplications({ status: LoanApplicationStatus.PENDING, is_confirmed: 1, limit: 1000 }),
      productStore.fetchProductTypes()
    ])
  } catch (error) {}
})
</script>
