<template>
  <div class="p-6">
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ສິນເຊື່ອ</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">ຈັດການຄຳຂໍສິນເຊື່ອທີ່ສົ່ງແລ້ວ</p>
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
            <td>{{ formatDate(loan.createdAt) }}</td>
            <!-- Actions -->
            <td>
              <div class="flex gap-2">
                <button class="btn btn-circle btn-text btn-sm" @click="viewLoanDetails(loan)" aria-label="View details">
                  <span class="icon-[tabler--eye] size-4"></span>
                </button>
                <!-- ✅ แสดงปุ่มแก้ไขเฉพาะสถานะที่ยังไม่ปิด -->
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

    <!-- Loan Details Modal -->
    <teleport to="body">
      <div v-if="showDetailsModal && selectedLoan"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <!-- Modal Header -->
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold">
              {{ isEditingInModal ? 'ແກ້ໄຂສິນເຊື່ອ' : 'ລາຍລະອຽດສິນເຊື່ອ' }}
            </h3>
            <button @click="closeDetailsModal" class="text-gray-400 hover:text-gray-600">
              <span class="icon-[tabler--x] size-5"></span>
            </button>
          </div>

          <!-- Tab Navigation -->
          <div class="tabs tabs-boxed mb-6">
            <button class="tab" :class="{ 'tab-active': activeTab === 'details' }" @click="activeTab = 'details'">
              ລາຍລະອຽດ
            </button>
            <button class="tab" :class="{ 'tab-active': activeTab === 'documents' }" @click="activeTab = 'documents'">
              ເອກະສານ
            </button>
            <!-- ✅ เพิ่ม Tab แผนที่ -->
            <button class="tab" :class="{ 'tab-active': activeTab === 'map' }" @click="activeTab = 'map'"
              :disabled="!selectedLoan?.customer_id">
              <span class="icon-[tabler--map] size-4 mr-1"></span>
              ແຜນທີ່
            </button>
          </div>

          <!-- Tab Content -->
          <div v-if="activeTab === 'details'" class="space-y-6">
            <!-- ✅ View Mode -->
            <div v-if="!isEditingInModal" class="space-y-6">
              <!-- Loan Information Section -->
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
                    <p class="font-medium">{{ selectedLoan.interest_rate_at_apply }}% ຕໍ່ປີ</p>
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

              <!-- Customer Information Section -->
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

              <!-- Product Information Section -->
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

              <!-- Loan Summary Section -->
              <div class="bg-primary/5 dark:bg-primary/10 rounded-lg p-4">
                <h4 class="font-medium text-lg mb-3">ສະຫຼຸບການຜ່ອນ</h4>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">ລາຄາສິນຄ້າ:</span>
                    <span class="font-medium">{{ formatPrice(selectedLoan.product?.price || 0) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">ເງິນກູ້:</span>
                    <span class="font-medium text-primary">{{ formatPrice(selectedLoan.total_amount) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">ດອກເບ້ຍ ({{ selectedLoan.interest_rate_at_apply
                      }}%):</span>
                    <span class="font-medium text-error">{{ formatPrice(calculateTotalInterest(selectedLoan)) }}</span>
                  </div>
                  <div class="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span class="font-medium">ຍອດຊຳລະທັງໝົດ:</span>
                    <span class="font-medium text-xl text-primary">
                      {{ formatPrice(calculateTotalPayment(selectedLoan)) }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">ຄ່າງວດຕໍ່ເດືອນ:</span>
                    <span class="font-medium text-success">{{ formatPrice(selectedLoan.monthly_pay) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">ຈຳນວນງວດ:</span>
                    <span class="font-medium">{{ selectedLoan.loan_period }} ເດືອນ</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- ✅ Edit Mode -->
            <div v-else class="space-y-6">
              <!-- Customer Information -->
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
                  <!-- คำแนะนำเพิ่มเติม -->
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

              <!-- Product Selection -->
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
                  <!-- แสดงข้อความเมื่อไม่มีร้านค้า -->
                  <div v-if="!modalShopId" class="text-xs text-warning mt-1">
                    ⚠️ ບໍ່ພົບຂໍ້ມູນຮ້ານຄ້າສຳລັບດຶງລາຍການສິນຄ້າ
                  </div>
                  <!-- Product Dropdown -->
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
                  <!-- No results -->
                  <div v-else-if="showModalProductDropdown && filteredModalProducts.length === 0 && modalProductSearch"
                    class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
                    <div class="text-center text-gray-500">ບໍ່ພົບສິນຄ້າ</div>
                  </div>
                </div>
                <!-- Current Product Display -->
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

              <!-- Loan Details -->
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
                      {{ formatPrice(modalLoanForm.total_amount) }}
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
                      {{ formatPrice(modalLoanForm.monthly_income) }}
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
                      {{ formatPrice(modalLoanForm.other_debts || 0) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Loan Summary Preview -->
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

          <!-- Documents Tab -->
          <div v-else-if="activeTab === 'documents'">
            <!-- View Mode: แสดงเอกสารที่อัปโหลดแล้ว -->
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
                    <a :href="getFullImageUrl(doc.file_url)" target="_blank" download
                      class="btn btn-xs btn-ghost text-primary hover:bg-primary/10">
                      <span class="icon-[tabler--download] size-4 mr-1"></span>
                      ດາວໂຫຼດ
                    </a>
                  </div>
                  <!-- Document Preview -->
                  <div class="mt-2">
                    <div v-if="isImage(doc.file_url)"
                      class="aspect-video bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                      <img :src="getFullImageUrl(doc.file_url)" alt="Document preview"
                        class="w-full h-full object-contain p-2" />
                    </div>
                    <div v-else
                      class="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                      <span class="icon-[tabler--file-description] size-12 text-gray-400"></span>
                    </div>
                  </div>
                  <!-- Document Metadata -->
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

            <!-- Edit Mode: อัปโหลดเอกสารใหม่ -->
            <div v-else class="space-y-6">
              <!-- Required Documents -->
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
                    <!-- Document Preview or Upload Area -->
                    <div v-if="doc.preview" class="mt-3">
                      <div class="relative w-full h-40 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                        <img v-if="isImage(doc.preview)" :src="getFullImageUrl(doc.preview)" alt="Document preview"
                          class="w-full h-full object-contain p-2" />
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

              <!-- Optional Documents -->
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
                    <!-- Document Preview or Upload Area -->
                    <div v-if="doc.preview" class="mt-3">
                      <div class="relative w-full h-40 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                        <img v-if="isImage(doc.preview)" :src="getFullImageUrl(doc.preview)" alt="Document preview"
                          class="w-full h-full object-contain p-2" />
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

              <!-- Upload Status -->
              <div v-if="isUploadingDocuments" class="mt-4 p-3 bg-info/10 rounded-lg text-center">
                <div class="loading loading-spinner loading-sm inline-block mr-2"></div>
                <span>ກຳລັງອັບໂຫຼດເອກະສານ...</span>
              </div>

              <!-- Validation Message -->
              <div v-if="!allRequiredDocumentsUploaded && isEditingInModal"
                class="mt-4 p-3 bg-warning/10 text-warning rounded-lg text-sm">
                ⚠️ ກະລຸນາອັບໂຫຼດເອກະສານທີ່ຕ້ອງການທັງໝົດກ່ອນບັນທຶກ
              </div>
            </div>
          </div>

          <!-- ✅ Map Tab -->
          <div v-else-if="activeTab === 'map'" class="space-y-6">
            <!-- ✅ แสดงข้อความถ้าไม่มี customer_id -->
            <div v-if="!selectedLoan?.customer_id" class="text-center py-12 text-gray-500">
              <div
                class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="icon-[tabler--map-pin-off] size-8 text-gray-400"></span>
              </div>
              <p class="text-lg font-medium">ບໍ່ມີຂໍ້ມູນລູກຄ້າ</p>
              <p class="text-sm text-gray-500 mt-1">ບໍ່ສາມາດສະແດງແຜນທີ່ໄດ້</p>
            </div>
            <!-- ✅ Map Component -->
            <CustomerLocationMap v-else :customer-id="selectedLoan.customer_id" :locations="customerLocations"
              :is-loading="isLocationLoading" :can-add-location="true" :can-edit-location="true"
              :can-delete-location="true" :can-set-primary="true" @add-location="handleAddLocation"
              @update-location="handleUpdateLocation" @delete-location="handleDeleteLocation"
              @set-primary="handleSetPrimary" />
          </div>

          <!-- Modal Actions -->
          <div class="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button class="btn btn-soft btn-secondary" @click="closeDetailsModal">
              {{ isEditingInModal ? 'ຍົກເລີກ' : 'ປິດ' }}
            </button>
            <!-- Edit button -->
            <button v-if="!isEditingInModal && selectedLoan.status !== 'closed' && selectedLoan.status !== 'disbursed'"
              class="btn btn-primary" @click="startEditInModal">
              <span class="icon-[tabler--edit] size-4 mr-1"></span>
              ແກ້ໄຂ
            </button>
            <!-- Save button -->
            <button v-else-if="isEditingInModal" class="btn btn-success" @click="saveLoanFromModal" :disabled="isSaving">
              <span v-if="isSaving" class="loading loading-spinner loading-xs"></span>
              <span v-else class="icon-[tabler--device-floppy] size-4 mr-1"></span>
              <span v-if="!isSaving">ບັນທຶກການປ່ຽນແປງ</span>
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
import Papa from 'papaparse'
import { getFullImageUrl } from '@/utils/url'
import CustomerLocationMap from '@/components/loans/form/CustomerLocationMap.vue'

// ✅ Stores
const loanApplicationStore = useLoanApplicationStore()
const productStore = useProductStore()
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
const selectedLoan = ref<LoanApplication | null>(null)
const isEditingInModal = ref(false)
const activeTab = ref<'details' | 'documents' | 'map'>('details')

// ✅ Product Search in Modal
const modalProductSearch = ref('')
const showModalProductDropdown = ref(false)
const selectedModalProduct = ref<any | null>(null)
const modalShopId = ref<number | null>(null)
const customerLocations = ref<CustomerLocation[]>([])
const isLocationLoading = ref(false)

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
  interest_rate: 0,
  loan_period: 0,
  monthly_payment: 0,
  monthly_income: 0,
  other_debts: 0
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
  interest_rate: '',
  loan_period: '',
  monthly_income: ''
})

// ✅ จัดการเอกสารให้ครบ 4 ไฟล์
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

// ✅ ตรวจสอบว่าอัปโหลดเอกสารที่จำเป็นครบหรือไม่
const allRequiredDocumentsUploaded = computed(() => {
  return loanDocuments.value.every(doc => doc.file !== null)
})

const uploadedDocuments = ref<any[]>([])
const isUploadingDocuments = ref(false)

const isConfirmed = (value: any) => {
  return value === true || value === 1 || value === 'true' || value === '1'
}

const isImage = (url: string) => /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url.toLowerCase());

// ✅ Computed properties
const filteredLoans = computed(() => {
  let filtered = loanApplicationStore.loanApplications.filter(app =>
    isConfirmed(app.is_confirmed)
  )
  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(loan =>
      (loan.customer?.first_name?.toLowerCase().includes(query) ||
        loan.customer?.last_name?.toLowerCase().includes(query) ||
        loan.customer?.full_name?.toLowerCase().includes(query) ||
        loan.customer?.phone?.includes(query) ||
        loan.loan_id?.toLowerCase().includes(query))
    )
  }
  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter(loan => loan.status === statusFilter.value)
  }
  // Date filter
  if (dateFrom.value || dateTo.value) {
    filtered = filtered.filter(loan => {
      if (!loan.createdAt) return false
      const loanDate = new Date(loan.createdAt).toISOString().split('T')[0]
      const fromDate = dateFrom.value || '1970-01-01'
      const toDate = dateTo.value || '9999-12-31'
      return loanDate >= fromDate && loanDate <= toDate
    })
  }
  return filtered
})

// ✅ กรองสินค้าใน Modal
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
const getCustomerName = (loan: LoanApplication): string => {
  if (loan.customer?.full_name) return loan.customer.full_name
  return `${loan.customer?.first_name || ''} ${loan.customer?.last_name || ''}`.trim() || '-'
}

const getCustomerPhone = (loan: LoanApplication): string => {
  return loan.customer?.phone || '-'
}

const getCustomerAddress = (loan: LoanApplication): string => {
  return loan.customer?.address || '-'
}

const getProductName = (loan: LoanApplication): string => {
  return loan.product?.product_name || '-'
}

const getProductType = (loan: LoanApplication): string => {
  const typeId = loan.product?.productType_id || (loan as any).productType_id
  return productStore.productTypeMap[typeId] || '-'
}

const getRequesterName = (loan: LoanApplication): string => {
  return loan.requester?.full_name || loan.requester?.name || `ID: ${loan.requester_id || '-'}`
}

const formatPrice = (price: number | string): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('lo-LA', {
    style: 'currency',
    currency: 'LAK'
  }).format(numPrice || 0)
}

const formatDate = (dateString: string): string => {
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

// ✅ Calculation functions
const calculateTotalInterest = (loan: LoanApplication): number => {
  const totalPayment = loan.monthly_pay * loan.loan_period
  return totalPayment - loan.total_amount
}

const calculateTotalPayment = (loan: LoanApplication): number => {
  return loan.monthly_pay * loan.loan_period
}

const calculateModalTotalInterest = (): number => {
  return calculateModalTotalPayment() - modalLoanForm.total_amount
}

const calculateModalTotalPayment = (): number => {
  return modalLoanForm.monthly_payment * modalLoanForm.loan_period
}

// ✅ คำนวณค่างวดอัตโนมัติ
const calculateMonthlyPayment = (): number => {
  const { total_amount, interest_rate, loan_period } = modalLoanForm
  if (!total_amount || !interest_rate || !loan_period) return 0
  const monthlyRate = interest_rate / 100 / 12
  const monthlyPayment = (total_amount * monthlyRate * Math.pow(1 + monthlyRate, loan_period)) /
    (Math.pow(1 + monthlyRate, loan_period) - 1)
  return Math.round(monthlyPayment)
}

// ✅ Watch สำหรับคำนวณอัตโนมัติ
watch(
  () => [modalLoanForm.total_amount, modalLoanForm.interest_rate, modalLoanForm.loan_period],
  () => {
    modalLoanForm.monthly_payment = calculateMonthlyPayment()
  }
)

// ✅ เลือกสินค้าใน Modal
const selectModalProduct = (product: any) => {
  console.log('🎯 Product selected:', product)
  selectedModalProduct.value = product
  modalProductSearch.value = product.product_name
  showModalProductDropdown.value = false
  // อัปเดตข้อมูลสินค้าในฟอร์ม
  modalLoanForm.product_id = product.id
  modalLoanForm.product_name = product.product_name
  modalLoanForm.product_type = product.productType?.type_name || product.type_name || ''
  modalLoanForm.product_price = product.price
  modalLoanForm.total_amount = product.price
  modalLoanForm.interest_rate = product.interest_rate
  modalLoanForm.loan_period = product.term
  // คำนวณค่างวด
  modalLoanForm.monthly_payment = calculateMonthlyPayment()
  console.log('✅ Product updated in form')
}

// ✅ ล้างสินค้าที่เลือก
const clearModalProductSelection = () => {
  selectedModalProduct.value = null
  modalProductSearch.value = ''
}

// ✅ จัดการการ blur
const handleModalProductBlur = () => {
  setTimeout(() => {
    showModalProductDropdown.value = false
  }, 200)
}

// ✅ Debounce search
let modalProductSearchTimer: NodeJS.Timeout | null = null
const debounceModalProductSearch = () => {
  if (modalProductSearchTimer) {
    clearTimeout(modalProductSearchTimer)
  }
  modalProductSearchTimer = setTimeout(() => {
    // Search handled by computed
  }, 300)
}

// ✅ Validation function
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

  // Age
  if (!modalLoanForm.age || modalLoanForm.age < 18 || modalLoanForm.age > 100) {
    modalFormErrors.age = 'ອາຍຸຕ້ອງຢູ່ລະຫວ່າງ 18-100 ປີ'
    isValid = false
  }

  if (!modalLoanForm.total_amount || modalLoanForm.total_amount <= 0) {
    modalFormErrors.total_amount = 'ຈຳນວນເງິນກູ້ຕ້ອງຫຼາຍກວ່າ 0'
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

// Debounce search
let debounceTimer: NodeJS.Timeout | null = null
const debounceSearch = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    currentPage.value = 1
  }, 300)
}

const applyDateFilter = () => {
  currentPage.value = 1
}

// ✅ ฟังก์ชันโหลด Customer Locations
const loadCustomerLocations = async (customerId: number) => {
  if (!customerId) return
  isLocationLoading.value = true
  try {
    const { getCustomerLocations } = await import('@/api/customer')
    const response = await getCustomerLocations(customerId)
    customerLocations.value = response.data || response || []
    console.log('[Map] Loaded locations:', customerLocations.value.length)
  } catch (error) {
    console.error('[Map] Failed to load locations:', error)
    customerLocations.value = []
  } finally {
    isLocationLoading.value = false
  }
}

// ✅ Handle Add Location
const handleAddLocation = async (locationData: Omit<CustomerLocation, 'id'>) => {
  try {
    const { createCustomerLocation } = await import('@/api/customer')
    await createCustomerLocation(locationData.customer_id, locationData)
    alert('ເພີ່ມທີ່ຢູ່ສຳເລັດ!')
    await loadCustomerLocations(locationData.customer_id)
  } catch (error: any) {
    alert('ເພີ່ມທີ່ຢູ່ລົ້ມເຫຼວ: ' + error.message)
  }
}

// ✅ Handle Update Location
const handleUpdateLocation = async (id: number, locationData: Partial<CustomerLocation>) => {
  try {
    const { updateCustomerLocation } = await import('@/api/customer')
    await updateCustomerLocation(id, locationData)
    alert('ແກ້ໄຂທີ່ຢູ່ສຳເລັດ!')
    if (selectedLoan.value?.customer_id) {
      await loadCustomerLocations(selectedLoan.value.customer_id)
    }
  } catch (error: any) {
    alert('ແກ້ໄຂທີ່ຢູ່ລົ້ມເຫຼວ: ' + error.message)
  }
}

// ✅ Handle Delete Location
const handleDeleteLocation = async (id: number) => {
  try {
    const { deleteCustomerLocation } = await import('@/api/customer')
    await deleteCustomerLocation(id)
    alert('ລຶບທີ່ຢູ່ສຳເລັດ!')
    if (selectedLoan.value?.customer_id) {
      await loadCustomerLocations(selectedLoan.value.customer_id)
    }
  } catch (error: any) {
    alert('ລຶບທີ່ຢູ່ລົ້ມເຫຼວ: ' + error.message)
  }
}

// ✅ Handle Set Primary
const handleSetPrimary = async (id: number) => {
  try {
    const { updateCustomerLocation } = await import('@/api/customer')
    await updateCustomerLocation(id, { is_primary: true })
    alert('ຕັ້ງເປັນທີ່ຢູ່ຫຼັກສຳເລັດ!')
    if (selectedLoan.value?.customer_id) {
      await loadCustomerLocations(selectedLoan.value.customer_id)
    }
  } catch (error: any) {
    alert('ຕັ້ງເປັນທີ່ຢູ່ຫຼັກລົ້ມເຫຼວ: ' + error.message)
  }
}

// ✅ Action handlers
const viewLoanDetails = async (loan: LoanApplication) => {
  try {
    const fullLoan = await loanApplicationStore.fetchLoanApplicationById(loan.id)
    selectedLoan.value = fullLoan
    // ✅ ดึงเอกสารของสินเชื่อนี้
    if (fullLoan.id) {
      await loanApplicationStore.fetchDocuments(fullLoan.id)
      // ✅ ตั้งค่าเอกสารในฟอร์ม (สำหรับโหมดแก้ไข)
      // ล้างเอกสารเก่าก่อน
      loanDocuments.value.forEach(doc => {
        doc.file = null
        doc.preview = null
      })
      optionalDocuments.value.forEach(doc => {
        doc.file = null
        doc.preview = null
      })
      // ✅ ตั้งค่าเอกสารที่มีอยู่แล้ว (ถ้ามี)
      if (loanApplicationStore.currentDocuments.length > 0) {
        loanApplicationStore.currentDocuments.forEach(doc => {
          // ค้นหาประเภทเอกสารที่ตรงกัน
          const docType = doc.document_type || doc.doc_type
          const targetDoc = allLoanDocuments.value.find(d => d.id === docType)
          if (targetDoc && doc.file_url) {
            targetDoc.preview = doc.file_url
            // ไม่สามารถตั้งค่าไฟล์จริงได้จาก URL แต่แสดง preview ได้
          }
        })
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

const editLoan = (loan: LoanApplication) => {
  selectedLoan.value = loan
  showDetailsModal.value = true
  startEditInModal()
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedLoan.value = null
  isEditingInModal.value = false
  isSaving.value = false
  activeTab.value = 'details'
  // ✅ ล้าง locations
  customerLocations.value = []
  isLocationLoading.value = false
  // ล้างข้อมูลสินค้า
  modalProductSearch.value = ''
  showModalProductDropdown.value = false
  selectedModalProduct.value = null
  modalShopId.value = null
  productStore.products = []
  // ✅ ล้างข้อมูลเอกสาร
  loanDocuments.value.forEach(doc => {
    doc.file = null
    doc.preview = null
  })
  optionalDocuments.value.forEach(doc => {
    doc.file = null
    doc.preview = null
  })
}

const startEditInModal = async () => {
  if (!selectedLoan.value) return
  // ✅ ดึง shop_id
  const shopId = selectedLoan.value.product?.partner_id ||
    selectedLoan.value.product?.shop_id ||
    null
  modalShopId.value = shopId
  // ✅ โหลดสินค้า
  if (shopId) {
    console.log('📡 Loading products for shop ID:', shopId)
    try {
      await productStore.fetchProducts({ shop_id: shopId, limit: 100 })
      console.log('✅ Loaded products:', productStore.products.length)
      // ตั้งค่าสินค้าปัจจุบัน
      if (selectedLoan.value.product_id) {
        const currentProduct = productStore.products.find(
          p => p.id === selectedLoan.value!.product_id
        )
        if (currentProduct) {
          selectedModalProduct.value = currentProduct
          modalProductSearch.value = currentProduct.product_name
        }
      }
    } catch (error) {
      console.error('❌ Failed to load products:', error)
    }
  }
  // แยกชื่อ-นามสกุล
  const fullName = getCustomerName(selectedLoan.value).trim()
  // ตั้งค่าฟอร์ม
  modalLoanForm.customer_name = fullName
  modalLoanForm.customer_phone = getCustomerPhone(selectedLoan.value)
  modalLoanForm.customer_id_card = selectedLoan.value.customer?.identity_number || ''
  modalLoanForm.customer_address = getCustomerAddress(selectedLoan.value)
  modalLoanForm.occupation = selectedLoan.value.customer?.occupation || ''
  modalLoanForm.age = selectedLoan.value.customer?.age || 0
  modalLoanForm.product_id = selectedLoan.value.product_id
  modalLoanForm.product_name = getProductName(selectedLoan.value)
  modalLoanForm.product_type = getProductType(selectedLoan.value)
  modalLoanForm.product_price = selectedLoan.value.product?.price || 0
  modalLoanForm.total_amount = parseFloat(selectedLoan.value.total_amount.toString())
  modalLoanForm.interest_rate = parseFloat(selectedLoan.value.interest_rate_at_apply.toString())
  modalLoanForm.loan_period = selectedLoan.value.loan_period
  modalLoanForm.monthly_payment = parseFloat(selectedLoan.value.monthly_pay?.toString() || '0')
  modalLoanForm.monthly_income = parseFloat(selectedLoan.value.customer?.income_per_month?.toString() || '0')
  modalLoanForm.other_debts = parseFloat(selectedLoan.value.customer?.other_debts?.toString() || '0')
  isEditingInModal.value = true
  activeTab.value = 'details'
}

// ✅ บันทึกการแก้ไข
const saveLoanFromModal = async () => {
  if (!selectedLoan.value) return
  if (!validateModalForm()) {
    console.warn('⚠️ Form validation failed')
    alert('ກະລຸນາກວດສອບຂໍ້ມູນທີ່ປ້ອນ')
    return
  }
  // ✅ ตรวจสอบเอกสารที่จำเป็น
  if (!allRequiredDocumentsUploaded.value) {
    alert('ກະລຸນາອັບໂຫຼດເອກະສານທີ່ຕ້ອງການທັງໝົດກ່ອນບັນທຶກ')
    return
  }
  isSaving.value = true
  try {
    const nameParts = modalLoanForm.customer_name.trim().split(' ')
    const firstName = nameParts[0] || modalLoanForm.customer_name
    const lastName = nameParts.slice(1).join(' ') || ''
    const updateData: UpdateLoanApplicationDto = {
      customer_id: selectedLoan.value.customer_id,
      first_name: firstName,
      last_name: lastName,
      age: modalLoanForm.age,
      phone: modalLoanForm.customer_phone.trim(),
      identity_number: modalLoanForm.customer_id_card.trim(),
      address: modalLoanForm.customer_address.trim(),
      occupation: modalLoanForm.occupation.trim(),
      income_per_month: modalLoanForm.monthly_income,
      other_debts: modalLoanForm.other_debts,
      product_id: selectedModalProduct.value?.id || selectedLoan.value.product_id, // ✅ ส่ง product_id เสมอ
      total_amount: modalLoanForm.total_amount,
      interest_rate_at_apply: modalLoanForm.interest_rate,
      loan_period: modalLoanForm.loan_period,
      monthly_pay: modalLoanForm.monthly_payment
    }
    console.log('📤 Update data:', updateData)
    await loanApplicationStore.updateDraftLoanApplication(selectedLoan.value.id, updateData)
    // ✅ อัปโหลดเอกสารใหม่ (ถ้ามี)
    if (selectedLoan.value.id) {
      isUploadingDocuments.value = true
      // รวมเอกสารทั้งหมดที่มีไฟล์
      const allDocs = [...loanDocuments.value, ...optionalDocuments.value].filter(doc => doc.file)
      // อัปโหลดทีละไฟล์
      for (const doc of allDocs) {
        if (doc.file) {
          await loanApplicationStore.uploadDocument(
            selectedLoan.value.id,
            doc.file,
            doc.id
          )
        }
      }
      // ✅ ดึงข้อมูลเอกสารใหม่หลังอัปโหลด
      await loanApplicationStore.fetchDocuments(selectedLoan.value.id)
      isUploadingDocuments.value = false
    }
    alert('ບັນທຶກການປ່ຽນແປງສຳເລັດ!')
    isEditingInModal.value = false
    await loanApplicationStore.fetchLoanApplications({
      status: 'pending',
      is_confirmed: 1,
      limit: 1000
    })
  } catch (error: any) {
    console.error('Error saving loan:', error)
    let errorMessage = 'ເກີດຂໍ້ຜິດພາດການບັນທຶກ'
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors
      errorMessage = Object.values(errors).flat().join('\n')
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    alert(`ເກີດຂໍ້ຜິດພາດ: ${errorMessage}`)
  } finally {
    isSaving.value = false
  }
}

// ✅ ฟังก์ชันอัปโหลดเอกสาร
const handleDocumentUpload = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  // ✅ ตรวจสอบขนาดไฟล์
  if (file.size > 5 * 1024 * 1024) {
    alert('ຂະໜາດໄຟລ໌ຕ້ອງນ້ອຍກວ່າ 5MB')
    target.value = '' // ล้างค่า input
    return
  }
  // ✅ ตรวจสอบประเภทไฟล์
  if (!file.type.match(/^(image\/.*|application\/pdf)$/)) {
    alert('ກະລຸນາເລືອກໄຟລ໌ຮູບພາບ ຫຼື PDF ເທົ່ານັ້ນ')
    target.value = '' // ล้างค่า input
    return
  }
  const allDocs = [...loanDocuments.value, ...optionalDocuments.value]
  const reader = new FileReader()
  reader.onload = (e) => {
    allDocs[index].file = file
    allDocs[index].preview = e.target?.result as string
    if (index < loanDocuments.value.length) {
      loanDocuments.value = [...allDocs.slice(0, loanDocuments.value.length)]
    } else {
      optionalDocuments.value = [...allDocs.slice(loanDocuments.value.length)]
    }
    // ล้างค่า input เพื่อให้สามารถอัปโหลดไฟล์เดิมซ้ำได้
    target.value = ''
  }
  reader.readAsDataURL(file)
}

// ✅ ฟังก์ชันลบเอกสาร
const removeDocument = (index: number) => {
  const allDocs = [...loanDocuments.value, ...optionalDocuments.value]
  allDocs[index].file = null
  allDocs[index].preview = null
  if (index < loanDocuments.value.length) {
    loanDocuments.value = [...allDocs.slice(0, loanDocuments.value.length)]
  } else {
    optionalDocuments.value = [...allDocs.slice(loanDocuments.value.length)]
  }
}

// ✅ ฟังก์ชันช่วยเหลือ
const getDocumentTypeName = (type: string): string => {
  const typeMap: Record<string, string> = {
    'id_card': 'ບັດປະຈຳຕົວ',
    'household': 'ໃບຄອບຄົວ',
    'income': 'ຫຼັກຖານລາຍຮັບ',
    'other': 'ເອກະສານອື່ນໆ'
  }
  return typeMap[type] || type
}

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
    alert('ບໍ່ມີຂໍ້ມູນສຳລັບສົ່ງອອກ')
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
    'ວັນທີ່ສ້າງ': formatDate(loan.createdAt || '')
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

// ✅ โหลดข้อมูล
onMounted(async () => {
  try {
    console.log('📡 Loading loan applications...')
    await Promise.all([
      loanApplicationStore.fetchLoanApplications({
        status: 'pending',
        is_confirmed: 1,
        limit: 1000
      }),
      productStore.fetchProductTypes()
    ])
    console.log('✅ Loaded loans:', loanApplicationStore.loanApplications.length)
  } catch (error) {
    console.error('❌ Failed to load loans:', error)
    alert('ເກີດຂໍ້ຜິດພາດການດຶງຂໍ້ມູນສິນເຊື່ອ')
  }
})
</script>
