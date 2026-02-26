<template>
  <div class="p-6">
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ລາຍການຮ່າງສິນເຊື່ອ</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">ຈັດການຮ່າງຄຳຂໍສິນເຊື່ອທີ່ຍັງບໍ່ໄດ້ສົ່ງ</p>
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
      <!-- Staff Filter -->
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
          <tr v-for="draft in displayedDrafts" :key="draft.id">
            <!-- Customer Name -->
            <td class="font-medium">
              <div>{{ getDraftDisplayName(draft) || `Loan #${draft.loan_id}` }}</div>
              <div class="text-sm text-gray-500">{{ getDraftPhone(draft) }}</div>
            </td>
            <!-- Product -->
            <td>
              <div>{{ getProductName(draft) }}</div>
              <div class="text-sm text-gray-500">ID: {{ draft.product_id }}</div>
            </td>
            <!-- Amount -->
            <td class="font-medium">{{ formatPrice(draft.total_amount) }}</td>
            <!-- Staff -->
            <td>{{ getRequesterName(draft) || `ID: ${draft.requester_id || '-'}` }}</td>
            <!-- Status -->
            <td>
              <span class="badge badge-soft" :class="{
                'badge-warning': draft.is_confirmed === 0,
                'badge-info': draft.is_confirmed === 1 && draft.status === 'pending',
                'badge-success': draft.status === 'approved',
                'badge-error': draft.status === 'rejected'
              }">
                {{ getStatusLabel(draft) }}
              </span>
            </td>
            <!-- Created At -->
            <td>{{ draft.createdAt ? formatDate(draft.createdAt) : '-' }}</td>
            <!-- Actions -->
            <td>
              <div class="flex gap-2">
                <button class="btn btn-circle btn-text btn-sm" @click="viewDraftDetails(draft)"
                  aria-label="View details">
                  <span class="icon-[tabler--eye] size-4"></span>
                </button>
                <!-- ✅ แสดงปุ่มลบเฉพาะ draft -->
                <button v-if="isDraft(draft)" class="btn btn-circle btn-text btn-sm text-error"
                  @click="deleteDraft(draft.id)" aria-label="Delete draft">
                  <span class="icon-[tabler--trash] size-4"></span>
                </button>
                <!-- ✅ แสดงปุ่มส่งเฉพาะ draft -->
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
    <!-- Pagination -->
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
        <button class="btn btn-sm" :disabled="!hasPreviousPage" @click="previousPage">
          ກ່ອນໜ້າ
        </button>
        <span class="px-2">
          ໜ້າ {{ currentPage }} / {{ totalPages }}
        </span>
        <button class="btn btn-sm" :disabled="!hasNextPage" @click="nextPage">
          ຖັດໄປ
        </button>
      </div>
    </div>
    <!-- Draft Details Modal -->
    <teleport to="body">
      <div v-if="showDetailsModal && selectedDraft"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <!-- Modal Header -->
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold">
              {{ isEditingInModal ? 'ແກ້ໄຂຮ່າງສິນເຊື່ອ' : 'ລາຍລະອຽດຮ່າງສິນເຊື່ອ' }}
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
            <button class="tab" :class="{ 'tab-active': activeTab === 'map' }" @click="activeTab = 'map'">
              <span class="icon-[tabler--map] size-4 mr-1"></span>
              ແຜນທີ່
            </button>
            <!-- ✅ เพิ่ม Tab RequestForm -->
            <button class="tab" :class="{ 'tab-active': activeTab === 'requestForm' }"
              @click="activeTab = 'requestForm'">
              <span class="icon-[tabler--file-text] size-4 mr-1"></span>
              ແບບຟອມຂໍກູ້
            </button>
            <!-- ✅ Add the new LoanContractForm tab button -->
            <button class="tab" :class="{ 'tab-active': activeTab === 'loanContract' }"
              @click="activeTab = 'loanContract'">
              <span class="icon-[tabler--file-invoice] size-4 mr-1"></span>
              ສັນຍາກູ້ຢືມ
            </button>
          </div>
          <!-- Tab Content -->
          <div v-if="activeTab === 'details'" class="space-y-6">
            <!-- View Mode -->
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
                  <label class="text-sm font-medium text-gray-500">ຈຳນວນເງິນ</label>
                  <p class="font-medium text-primary">{{ formatPrice(selectedDraft.total_amount) }}</p>
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
                  <p class="font-medium">{{ formatPrice(selectedDraft.monthly_pay) }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ສະຖານະການຢືນຢັນ</label>
                  <p>
                    <span class="badge badge-soft" :class="getConfirmedStyle(selectedDraft.is_confirmed).color">
                      {{ getConfirmedStyle(selectedDraft.is_confirmed).text }}
                    </span>
                  </p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ສະຖານະ</label>
                  <p>
                    <span class="badge badge-soft" :class="{
                      'badge-info': selectedDraft.status === 'pending',
                      'badge-warning': selectedDraft.status === 'verifying',
                      'badge-success': selectedDraft.status === 'approved',
                      'badge-error': selectedDraft.status === 'rejected'
                    }">
                      {{
                        selectedDraft.status === 'pending' ? 'ລໍຖ້າ' :
                          selectedDraft.status === 'verifying' ? 'ກຳລັງກວດ' :
                            selectedDraft.status === 'approved' ? 'ອະນຸມັດ' :
                              selectedDraft.status === 'rejected' ? 'ປະຕິເສດ' : selectedDraft.status
                      }}
                    </span>
                  </p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ເຈົ້າໜ້າທີ່</label>
                  <p>{{ getRequesterName(selectedDraft) || 'ID: ' + selectedDraft.requester_id }}</p>
                </div>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ສ້າງເມື່ອ</label>
                <p>{{ selectedDraft.createdAt ? formatDate(selectedDraft.createdAt) : '-' }}</p>
              </div>
              <!-- ✅ แสดง Customer Info ถ้ามี -->
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
                  <div>
                    <label class="text-sm font-medium text-gray-500">ທີ່ຢູ່</label>
                    <p>{{ getDraftAddress(selectedDraft) }}</p>
                  </div>
                  <div v-if="selectedDraft.customer.income_per_month">
                    <label class="text-sm font-medium text-gray-500">ລາຍຮັບ</label>
                    <p>{{ formatPrice(selectedDraft.customer.income_per_month) }}</p>
                  </div>
                </div>
              </div>
              <!-- ✅ แสดง Product Info ถ้ามี -->
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
            <!-- Edit Mode -->
            <div v-else class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                  <label class="text-sm font-medium text-gray-500">ຊື່ລູກຄ້າ *</label>
                  <input v-model="modalDraftForm.customer_name" type="text" class="input input-bordered w-full"
                    :class="{ 'input-error': modalFormErrors.customer_name }" required />
                  <label v-if="modalFormErrors.customer_name" class="label text-error">
                    <span class="label-text-alt">{{ modalFormErrors.customer_name }}</span>
                  </label>
                </div>
                <div class="form-control">
                  <label class="text-sm font-medium text-gray-500">ເບີໂທ *</label>
                  <input v-model="modalDraftForm.customer_phone" type="tel" class="input input-bordered w-full"
                    :class="{ 'input-error': modalFormErrors.customer_phone }" required />
                  <label v-if="modalFormErrors.customer_phone" class="label text-error">
                    <span class="label-text-alt">{{ modalFormErrors.customer_phone }}</span>
                  </label>
                </div>
                <!-- Product Selection -->
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
                <div class="form-control">
                  <label class="text-sm font-medium text-gray-500">ປະເພດ</label>
                  <input v-model="modalDraftForm.product_type" type="text" class="input input-bordered w-full"
                    readonly />
                </div>
                <div class="form-control">
                  <label class="text-sm font-medium text-gray-500">ມູນຄ່າ *</label>
                  <input v-model.number="modalDraftForm.total_amount" type="number"
                    class="input input-bordered w-full text-blue-700"
                    :class="{ 'input-error': modalFormErrors.total_amount }" required min="0" />
                  <div class="text-xs text-gray-500 mt-1">
                    <div>ມູນຄ່າ (ກີບ): {{ formatPrice(modalDraftForm.total_amount) }}</div>
                    <label v-if="modalFormErrors.total_amount" class="label text-error">
                      <span class="label-text-alt">{{ modalFormErrors.total_amount }}</span>
                    </label>
                  </div>
                </div>
                <div class="form-control">
                  <label class="text-sm font-medium text-gray-500">ດອກເບ້ຍ (%)</label>
                  <input v-model.number="modalDraftForm.interest_rate" type="number" class="input input-bordered w-full"
                    :class="{ 'input-error': modalFormErrors.interest_rate }" min="0" max="100" step="0.01" />
                  <label v-if="modalFormErrors.interest_rate" class="label text-error">
                    <span class="label-text-alt">{{ modalFormErrors.interest_rate }}</span>
                  </label>
                </div>
                <div class="form-control">
                  <label class="text-sm font-medium text-gray-500">ໄລຍະເວລາ (ເດືອນ) *</label>
                  <input v-model.number="modalDraftForm.loan_period" type="number" class="input input-bordered w-full"
                    :class="{ 'input-error': modalFormErrors.loan_period }" min="1" max="60" />
                  <label v-if="modalFormErrors.loan_period" class="label text-error">
                    <span class="label-text-alt">{{ modalFormErrors.loan_period }}</span>
                  </label>
                </div>
                <div class="form-control">
                  <label class="text-sm font-medium text-gray-500">ຄ່າງວດຕໍ່ເດືອນ (ກີບ)</label>
                  <input v-model.number="modalDraftForm.monthly_payment" type="number"
                    class="input input-bordered w-full text-red-500" min="1" max="60" readonly />
                  <div class="text-xs text-gray-500 mt-1">
                    <div>ຄ່າງວດ (ກີບ): {{ formatPrice(modalDraftForm.monthly_payment) }}</div>
                  </div>
                </div>
                <div class="form-control">
                  <label class="text-sm font-medium text-gray-500">ລາຍຮັບຕໍ່ເດືອນ</label>
                  <input v-model.number="modalDraftForm.income_per_month" type="number"
                    class="input input-bordered w-full text-blue-700"
                    :class="{ 'input-error': modalFormErrors.income_per_month }" min="0" />
                  <div class="text-xs text-gray-500 mt-1">
                    <div>ລາຍຮັບ (ກີບ): {{ formatPrice(modalDraftForm.income_per_month) }}</div>
                  </div>
                  <label v-if="modalFormErrors.income_per_month" class="label text-error">
                    <span class="label-text-alt">{{ modalFormErrors.income_per_month }}</span>
                  </label>
                </div>
                <div class="form-control">
                  <label class="text-sm font-medium text-gray-500">ອາຍຸ *</label>
                  <input v-model.number="modalDraftForm.age" type="number" class="input input-bordered w-full"
                    :class="{ 'input-error': modalFormErrors.age }" min="0" />
                  <label v-if="modalFormErrors.age" class="label text-error">
                    <span class="label-text-alt">{{ modalFormErrors.age }}</span>
                  </label>
                </div>
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">ເລກບັດປະຈຳຕົວ *</span>
                </label>
                <input v-model="modalDraftForm.customer_id_card" type="text" placeholder="ປ້ອນເລກບັດປະຈຳຕົວ"
                  class="input input-bordered w-full" :class="{ 'input-error': modalFormErrors.customer_id_card }"
                  required />
                <label v-if="modalFormErrors.customer_id_card" class="label text-error">
                  <span class="label-text-alt">{{ modalFormErrors.customer_id_card }}</span>
                </label>
              </div>
              <!-- ✅ Occupation Field -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">ອາຊີບ <span class="text-primary">*</span></span>
                  <span class="text-xs text-gray-500 ml-1">(ຂໍ້ມູນສຳຄັນສຳລັບການພິຈາລະນາສິນເຊື່ອ)</span>
                </label>
                <input v-model="modalDraftForm.occupation" type="text"
                  placeholder="ປ້ອນອາຊີບ (ຕົວຢ່າງ: ພະນັກງານລັດ, ທຸລະກິດສ່ວນຕົວ, ກະສິກອນ, ແຮງງານ)"
                  class="input input-bordered w-full" :class="{ 'input-error': modalFormErrors.occupation }" required />
                <label v-if="modalFormErrors.occupation" class="label text-error">
                  <span class="label-text-alt">{{ modalFormErrors.occupation }}</span>
                </label>
                <div class="text-xs text-gray-500 mt-1">
                  <p>ຕົວຢ່າງ: ພະນັກງານບໍລິສັດ, ຄູ, ແພດ, ທຸລະກິດສ່ວນຕົວ, ກະສິກອນ, ແຮງງານອຸດສາຫະກຳ</p>
                </div>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ທີ່ຢູ່</label>
                <textarea v-model="modalDraftForm.customer_address" class="textarea textarea-bordered w-full min-h-24"
                  :class="{ 'textarea-error': modalFormErrors.customer_address }"></textarea>
                <label v-if="modalFormErrors.customer_address" class="label text-error">
                  <span class="label-text-alt">{{ modalFormErrors.customer_address }}</span>
                </label>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ໜີ້ສິນອື່ນໆ</label>
                <input v-model.number="modalDraftForm.other_debts" type="number"
                  class="input input-bordered w-full text-red-500" min="0" />
                <div class="text-xs text-gray-500 mt-1">
                  <div>ໜີ້ສິນອື່ນໆ (ກີບ): {{ formatPrice(modalDraftForm.other_debts) }}</div>
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
                  <div v-for="(doc, index) in draftDocuments" :key="index"
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
                  <div v-for="(doc, index) in optionalDocuments" :key="index + draftDocuments.length"
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
                          @click="removeDocument(index + draftDocuments.length)">
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
                          @change="(event) => handleDocumentUpload(index + draftDocuments.length, event)" />
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
          <!-- ✅ เพิ่ม Tab แผนที่ -->
          <div v-else-if="activeTab === 'map'" class="space-y-6">
            <CustomerLocationMap :customer-id="selectedDraft?.customer_id || 0" :locations="customerLocations"
              :is-loading="isLocationLoading" :can-add-location="true" :can-edit-location="true"
              :can-delete-location="true" :can-set-primary="true" @add-location="handleAddLocation"
              @update-location="handleUpdateLocation" @delete-location="handleDeleteLocation"
              @set-primary="handleSetPrimary" />
          </div>
          <!-- ✅ เพิ่ม Tab RequestForm -->
          <div v-else-if="activeTab === 'requestForm'" class="space-y-6">
            <LoanRequestForm :loan-application-id="selectedDraft?.id" :loan-application="selectedDraft"
              :is-editing="isEditingInModal" @save-form="handleRequestFormSave" @form-updated="handleRequestFormUpdated"
              @cancel-edit="isEditingInModal = false" />
          </div>
          <!-- ✅ Add the new LoanContractForm component -->
          <div v-else-if="activeTab === 'loanContract'" class="space-y-6">
            <LoanContractForm :loan-contract-id="selectedDraft?.id" :loan-contract="selectedDraft"
              :is-editing="isEditingInModal" @cancel-edit="isEditingInModal = false"
              @enable-edit="isEditingInModal = true" />
          </div>
          <!-- Modal Actions -->
          <div class="flex justify-end gap-3 mt-6">
            <button class="btn btn-soft btn-secondary" @click="closeDetailsModal">
              {{ isEditingInModal ? 'ຍົກເລີກ' : 'ປິດ' }}
            </button>
            <!-- Edit button (only in view mode) -->
            <button v-if="!isEditingInModal" class="btn btn-primary" @click="startEditInModal">
              ແກ້ໄຂ
            </button>
            <!-- Save button (only in edit mode) -->
            <button v-else class="btn btn-success" @click="saveDraftFromModal" :disabled="isSaving">
              <span v-if="isSaving" class="loading loading-spinner loading-xs"></span>
              <span v-else>ບັນທຶກການປ່ຽນແປງ</span>
            </button>
          </div>
        </div>
      </div>
    </teleport>
    <!-- OTP Modal -->
    <teleport to="body">
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
            <p class="text-gray-600 dark:text-gray-400">
              ພວກເຮົາໄດ້ສົ່ງລະຫັດ OTP ໄປຫາເບີ
            </p>
            <p class="font-medium text-lg mt-2">{{ getDraftPhone(draftToSubmit) }}</p>
          </div>
          <div class="form-control mb-6">
            <label class="label">
              <span class="label-text font-medium">ລະຫັດ OTP *</span>
            </label>
            <input v-model="otpCode" type="text" inputmode="numeric" placeholder="ປ້ອນລະຫັດ OTP 6 ຕົວ"
              class="input input-bordered w-full text-center text-2xl tracking-widest"
              :class="{ 'input-error': otpError }" maxlength="6" @keyup.enter="verifyAndSubmitDraft" />
            <label v-if="otpError" class="label text-error">
              <span class="label-text-alt">{{ otpError }}</span>
            </label>
          </div>
          <div class="text-center mb-4">
            <button type="button" class="btn btn-link btn-sm" @click="requestOtp">
              ຂໍລະຫັດໃໝ່
            </button>
          </div>
          <div class="flex justify-between gap-3">
            <button type="button" class="btn btn-soft btn-secondary flex-1" @click="closeOtpModal"
              :disabled="isVerifying">
              ຍົກເລີກ
            </button>
            <button type="button" class="btn btn-success flex-1"
              :disabled="!otpCode || otpCode.length !== 6 || isVerifying" @click="verifyAndSubmitDraft">
              <span v-if="isVerifying" class="loading loading-spinner loading-xs"></span>
              <span v-else>ຢືນຢັນ</span>
            </button>
          </div>
        </div>
      </div>
    </teleport>
    <!-- Submit Confirmation Modal -->
    <teleport to="body">
      <div v-if="showSubmitModal && draftToSubmit"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
          <h3 class="font-bold text-lg mb-4 text-success">ສົ່ງຮ່າງສິນເຊື່ອ</h3>
          <p class="py-4 text-gray-700 dark:text-gray-300">
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການສົ່ງຮ່າງສິນເຊື່ອເລກທີ {{ draftToSubmit.loan_id }} ຂອງ "{{
              draftToSubmit.customer.first_name }} {{ draftToSubmit.customer.last_name }}" ?
          </p>
          <div class="flex justify-end gap-3 mt-6">
            <button class="btn btn-soft btn-secondary" @click="showSubmitModal = false">
              ຍົກເລີກ
            </button>
            <button class="btn btn-success" @click="submitDraft">
              ສົ່ງຮ່າງ
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useLoanApplicationStore } from '@/stores/loanApplication'
import { useProductStore } from '@/stores/product'
import type { LoanApplication, ConfirmDraftDto, CustomerLocation } from '@/types/loanApplication'
import { requestOtpForCustomer } from '@/api/customer'
import Papa from 'papaparse'
import { getConfirmedStyle } from '@/utils/formatters'
import { getFullImageUrl } from '@/utils/url'
import CustomerLocationMap from '@/components/loans/form/CustomerLocationMap.vue'
import LoanRequestForm from '@/components/loans/form/RequestForm.vue'  // ✅ Import the new component
import LoanContractForm from '@/components/loans/form/LoanContractForm.vue'
// ✅ Use Store
const loanApplicationStore = useLoanApplicationStore()
const productStore = useProductStore()
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
const activeTab = ref<'details' | 'documents' | 'map' | 'requestForm' | 'loanContract'>('details')  // ✅ Extend activeTab type
const isEditingInModal = ref(false)
// ✅ Product Search in Modal
const modalProductSearch = ref('')
const showModalProductDropdown = ref(false)
const selectedModalProduct = ref<any | null>(null)
const modalShopId = ref<number | null>(null)
// OTP
const otpCode = ref('')
const otpError = ref('')
const isVerifying = ref(false)
// ✅ เพิ่ม state สำหรับ locations
const customerLocations = ref<CustomerLocation[]>([])
const isLocationLoading = ref(false)
// Mock staff list
const mockStaffList = [
  { id: 1, name: 'ສົມຊາຍ ພົນສຸກ' },
  { id: 2, name: 'ສົມສິງ ດຳດີ' },
  { id: 3, name: 'ອຸດົມ ສີສົມບັດ' }
]
// ✅ Documents
interface Document {
  id: string
  name: string
  description: string
  required: boolean
  file: File | null
  preview: string | null
}
const draftDocuments = ref<Document[]>([
  { id: 'id_card', name: 'ບັດປະຈຳຕົວ', description: 'ຮູບຖ່າຍບັດປະຈຳຕົວທັງໜ້າ-ຫຼັງ', required: true, file: null, preview: null },
  { id: 'house_reg', name: 'ໃບຄອບຄົວ', description: 'ໃບຄອບຄົວຫຼືເອກະສານຢືນຢັນທີ່ຢູ່', required: true, file: null, preview: null }
])
const optionalDocuments = ref<Document[]>([
  { id: 'salary_slip', name: 'ຫຼັກຖານລາຍຮັບ', description: 'ໃບເງິນເດືອນ ຫຼື ໃບຮັບລາຍຮັບ', required: false, file: null, preview: null },
  { id: 'other', name: 'ເອກະສານອື່ນໆ', description: 'ເອກະສານອື່ນໆທີ່ກ່ຽວຂ້ອງ', required: false, file: null, preview: null }
])
const isUploadingDocuments = ref(false)
// ✅ ตรวจสอบเอกสารที่จำเป็น
const allRequiredDocumentsUploaded = computed(() => {
  return draftDocuments.value.every(doc => doc.file !== null)
})
// Form for editing
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
  interest_rate: 0,
  loan_period: 0,
  monthly_payment: 0,
  income_per_month: 0,
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
  income_per_month: ''
})
// ✅ Helper functions
const isImage = (url: string) => /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url.toLowerCase())
const getDocumentTypeName = (type: string): string => {
  const typeMap: Record<string, string> = {
    'id_card': 'ບັດປະຈຳຕົວ',
    'house_reg': 'ໃບຄອບຄົວ',
    'salary_slip': 'ຫຼັກຖານລາຍຮັບ',
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
// ✅ อัปโหลดเอกสาร
const handleDocumentUpload = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    alert('ຂະໜາດໄຟລ໌ຕ້ອງນ້ອຍກວ່າ 5MB')
    target.value = ''
    return
  }
  if (!file.type.match(/^(image\/.*|application\/pdf)$/)) {
    alert('ກະລຸນາເລືອກໄຟລ໌ຮູບພາບ ຫຼື PDF ເທົ່ານັ້ນ')
    target.value = ''
    return
  }
  const allDocs = [...draftDocuments.value, ...optionalDocuments.value]
  const reader = new FileReader()
  reader.onload = (e) => {
    allDocs[index].file = file
    allDocs[index].preview = e.target?.result as string
    if (index < draftDocuments.value.length) {
      draftDocuments.value = [...allDocs.slice(0, draftDocuments.value.length)]
    } else {
      optionalDocuments.value = [...allDocs.slice(draftDocuments.value.length)]
    }
    target.value = ''
  }
  reader.readAsDataURL(file)
}
// ✅ ลบเอกสาร
const removeDocument = (index: number) => {
  const allDocs = [...draftDocuments.value, ...optionalDocuments.value]
  allDocs[index].file = null
  allDocs[index].preview = null
  if (index < draftDocuments.value.length) {
    draftDocuments.value = [...allDocs.slice(0, draftDocuments.value.length)]
  } else {
    optionalDocuments.value = [...allDocs.slice(draftDocuments.value.length)]
  }
}
// ✅ Validation function
const validateModalForm = (): boolean => {
  Object.keys(modalFormErrors).forEach(key => {
    modalFormErrors[key as keyof typeof modalFormErrors] = ''
  })
  let isValid = true
  if (!modalDraftForm.customer_name.trim()) {
    modalFormErrors.customer_name = 'ກະລຸນາປ້ອນຊື່ລູກຄ້າ'
    isValid = false
  }
  const phoneRegex = /^[\d\-\+\(\)\s]{8,15}$/
  if (!modalDraftForm.customer_phone.trim()) {
    modalFormErrors.customer_phone = 'ກະລຸນາປ້ອນເບີໂທລະສັບ'
    isValid = false
  } else if (!phoneRegex.test(modalDraftForm.customer_phone)) {
    modalFormErrors.customer_phone = 'ເບີໂທລະສັບບໍ່ຖືກຕ້ອງ'
    isValid = false
  }
  if (!modalDraftForm.customer_id_card.trim()) {
    modalFormErrors.customer_id_card = 'ກະລຸນາປ້ອນເລກບັດປະຈຳຕົວ'
    isValid = false
  }
  if (!modalDraftForm.customer_address.trim()) {
    modalFormErrors.customer_address = 'ກະລຸນາປ້ອນທີ່ຢູ່'
    isValid = false
  }
  if (!modalDraftForm.occupation.trim()) {
    modalFormErrors.occupation = 'ກະລຸນາປ້ອນອາຊີບ'
    isValid = false
  }
  if (!modalDraftForm.age || modalDraftForm.age < 18 || modalDraftForm.age > 100) {
    modalFormErrors.age = 'ອາຍຸຕ້ອງຢູ່ລະຫວ່າງ 18-100 ປີ'
    isValid = false
  }
  if (!modalDraftForm.total_amount || modalDraftForm.total_amount <= 0) {
    modalFormErrors.total_amount = 'ມູນຄ່າຕ້ອງຫຼາຍກວ່າ 0'
    isValid = false
  }
  if (modalDraftForm.interest_rate < 0 || modalDraftForm.interest_rate > 100) {
    modalFormErrors.interest_rate = 'ດອກເບ້ຍຕ້ອງຢູ່ລະຫວ່າງ 0-100%'
    isValid = false
  }
  if (!modalDraftForm.loan_period || modalDraftForm.loan_period < 1 || modalDraftForm.loan_period > 60) {
    modalFormErrors.loan_period = 'ໄລຍະເວລາຕ້ອງຢູ່ລະຫວ່າງ 1-60 ເດືອນ'
    isValid = false
  }
  if (!modalDraftForm.income_per_month || modalDraftForm.income_per_month <= 0) {
    modalFormErrors.income_per_month = 'ລາຍຮັບຕ້ອງຫຼາຍກວ່າ 0'
    isValid = false
  }
  return isValid
}
// ✅ Computed properties
const staffList = computed(() => mockStaffList)
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
      if (!draft.created_at) return false
      const draftDate = new Date(draft.created_at).toISOString().split('T')[0]
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
    product.type_name.toLowerCase().includes(query) ||
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
// ✅ Helper functions
const getDraftDisplayName = (draft: LoanApplication): string => {
  if (draft.customer) {
    return `${draft.customer.first_name || ''} ${draft.customer.last_name || ''}`.trim()
  }
  return '-'
}
const isDraft = (draft: LoanApplication): boolean => {
  return draft.is_confirmed === 0 ||
    draft.is_confirmed === false ||
    !draft.is_confirmed
}
const isConfirmed = (draft: LoanApplication): boolean => {
  return draft.is_confirmed === 1 ||
    draft.is_confirmed === true
}
const getStatusLabel = (draft: LoanApplication): string => {
  if (isDraft(draft)) {
    return 'ຮ່າງ'
  }
  switch (draft.status) {
    case 'pending':
      return 'ລໍຖ້າ'
    case 'verifying':
      return 'ກຳລັງກວດ'
    case 'approved':
      return 'ອະນຸມັດ'
    case 'rejected':
      return 'ປະຕິເສດ'
    default:
      return draft.status
  }
}
const getDraftPhone = (draft: LoanApplication): string => {
  return draft.customer?.phone || '-'
}
const getDraftAddress = (draft: LoanApplication): string => {
  return draft.customer?.address || '-'
}
const getProductName = (draft: LoanApplication): string => {
  return draft.product?.product_name || '-'
}
const getRequesterName = (draft: LoanApplication): string => {
  return draft.requester?.full_name || '-'
}
const formatPrice = (price: number | string): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('lo-LA', {
    style: 'currency',
    currency: 'LAK'
  }).format(numPrice || 0)
}
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('lo-LA')
}
// ✅ คำนวณค่างวด
const calculateModalMonthlyPayment = (): number => {
  const { total_amount, interest_rate, loan_period } = modalDraftForm
  if (!total_amount || !interest_rate || !loan_period) return 0
  const monthlyRate = interest_rate / 100 / 12
  const monthlyPayment = (total_amount * monthlyRate * Math.pow(1 + monthlyRate, loan_period)) /
    (Math.pow(1 + monthlyRate, loan_period) - 1)
  return Math.round(monthlyPayment)
}
watch(
  () => [modalDraftForm.total_amount, modalDraftForm.interest_rate, modalDraftForm.loan_period],
  () => {
    modalDraftForm.monthly_payment = calculateModalMonthlyPayment()
  }
)
// ✅ เลือกสินค้า
const selectModalProduct = (product: any) => {
  selectedModalProduct.value = product
  modalProductSearch.value = product.product_name
  showModalProductDropdown.value = false
  modalDraftForm.product_name = product.product_name
  modalDraftForm.product_type = product.productType?.type_name || ''
  modalDraftForm.total_amount = product.price
  modalDraftForm.interest_rate = product.interest_rate
  modalDraftForm.loan_period = product.term
  modalDraftForm.monthly_payment = calculateModalMonthlyPayment()
}
const clearModalProductSelection = () => {
  selectedModalProduct.value = null
  modalProductSearch.value = ''
  modalDraftForm.product_name = ''
  modalDraftForm.product_type = ''
}
const handleModalProductBlur = () => {
  setTimeout(() => {
    showModalProductDropdown.value = false
  }, 200)
}
let modalProductSearchTimer: NodeJS.Timeout | null = null
const debounceModalProductSearch = () => {
  if (modalProductSearchTimer) {
    clearTimeout(modalProductSearchTimer)
  }
  modalProductSearchTimer = setTimeout(() => {
    // handled by computed
  }, 300)
}
// Debounce search
let debounceTimer: NodeJS.Timeout | null = null
const debounceSearch = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    currentPage.value = 1
  }, 300)
}
const applyDateFilter = () => {
  currentPage.value = 1
}
// Action handlers
const viewDraftDetails = async (draft: LoanApplication) => {
  selectedDraft.value = draft
  // ✅ โหลดเอกสาร
  if (draft.id) {
    await loanApplicationStore.fetchDocuments(draft.id)
  }
  // ✅ โหลด locations
  if (draft.customer_id) {
    await loadCustomerLocations(draft.customer_id)
  }
  // ✅ โหลดข้อมูลสำหรับ RequestForm ถ้าจำเป็น (component จะ handle เอง)
  showDetailsModal.value = true
  isEditingInModal.value = false
  activeTab.value = 'details'
}
// ✅ ฟังก์ชันโหลด Customer Locations
const loadCustomerLocations = async (customerId: number) => {
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
    await loadCustomerLocations(props.customerId)
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
    await loadCustomerLocations(props.customerId)
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
    await loadCustomerLocations(props.customerId)
  } catch (error: any) {
    alert('ຕັ້ງເປັນທີ່ຢູ່ຫຼັກລົ້ມເຫຼວ: ' + error.message)
  }
}
// ✅ Handle RequestForm Save (เรียกเมื่อ component emit save-form)
const handleRequestFormSave = async (customerId: number, formData: any) => {
  if (!selectedDraft.value) return
  try {
    console.log('📥 Received customerId:', customerId)
    console.log('📥 Received formData:', formData)
    // ✅ แปลง Address จาก Object เป็น String
    // ✅ ตรวจสอบว่า formData มีค่าหรือไม่
    if (!formData || !formData.customer) {
      throw new Error('ข้อมูลฟอร์มไม่ถูกต้อง')
    }

    // ✅ Helper Function - แปลง Address จาก Object เป็น String (ปลอดภัย)
    const formatAddress = (addr: any): string => {
      if (!addr || typeof addr !== 'object') return ''
      const parts = [addr.village, addr.district, addr.province]
        .filter((p: any) => p && typeof p === 'string' && p.trim())
      return parts.join(', ')
    }

    // ✅ Helper Function - แยกชื่อ-นามสกุล (ปลอดภัย)
    const parseName = (fullName: any) => {
      // ตรวจสอบว่า fullName เป็น string และไม่ empty
      if (!fullName || typeof fullName !== 'string') {
        return { first_name: '', last_name: '' }
      }
      const trimmed = fullName.trim()
      if (!trimmed) {
        return { first_name: '', last_name: '' }
      }
      const parts = trimmed.split(/\s+/)
      return {
        first_name: parts[0] || '',
        last_name: parts.slice(1).join(' ') || ''
      }
    }

    // ✅ แยกชื่อ-นามสกุลอย่างปลอดภัย
    // ✅ แยกชื่อ-นามสกุลอย่างปลอดภัย
    const { first_name, last_name } = parseName(formData.customer.fullname)

    console.log('📝 Parsed name:', { first_name, last_name })
    console.log('📝 All formData:', formData)
    // ✅ Map formData จาก RequestForm ไปยัง backend format (คล้ายกับ saveDraftFromModal)
    const updateData = {
      // ຂໍ້ມູນວຽກ (Work Info)
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

      // ຂໍ້ມູນຜູ້ຄ້ຳປະກັນ (Guarantor) - ຖ້າມີ
      name: formData.guarantor?.name || '',
      identity_number: formData.guarantor?.idCard || '',
      occupation: formData.guarantor?.occupation || '',
      relationship: formData.guarantor?.relationship || '',
      Guarantorphone: FormData.quarantor?.phone || '',
      Guarantoraddress: formatAddress(formData.guarantor?.address),
      work_company_name: formData.guarantor?.work?.companyName || '',
      work_position: formData.guarantor?.work?.position || '',
      work_salary: String(formData.guarantor?.work?.salary || '0'),

      // ຂໍ້ມູນເພີ່ມເຕີມທີ່ໃຊ້ໃນການຄິດໄລ່
      first_name: first_name,
      last_name: last_name,
      identity_card: formData.customer.idCard // ເພີ່ມໃຫ້ຄົບ
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
      income_per_month: selectedDraft.value.customer.income_per_month,
      unit: formData.customer.unit,
      issue_place: formData.customer.issuePlace,
      issue_date: formData.customer.issueDate,

      product_id: selectedDraft.value.product_id,
      total_amount: formData.product.price,
      interest_rate_at_apply: formData.product.interestRate,
      // status: loan_status,
      monthly_pay: formData.product.monthlyPayment,
      loan_period: formData.product.loanTerm,
      down_payment: formData.product.downPayment,
      fee: formData.product.fee,
      first_intstallment_amount: formData.product.firstInstallment || null,
      payment_day: formData.product.paymentDay,
      borrower_signature_date: formData.signatures.borrowerDate || null,
      guarantor_signature_date: formData.signatures.guarantorDate || null,
      staff_signature_date: formData.signatures.staffDate || null
    }
    console.log('fixed error ', updateData)
    const { saveCustProposal } = await import('@/api/proposal')
    await saveCustProposal(selectedDraft.value.customer_id, selectedDraft.value.id, updateData)
    await loanApplicationStore.updateDraftLoanApplication(selectedDraft.value.id, CustLoanData)
    alert('ບັນທຶກແບບຟອມຂໍກູ້ສຳເລັດ!')
    // ✅ Refresh ข้อมูล selectedDraft
    await loanApplicationStore.fetchLoanApplications({ status: 'pending', is_confirmed: 0 })
    // ✅ หา draft ที่อัปเดตใหม่
    selectedDraft.value = loanApplicationStore.loanApplications.find(d => d.id === selectedDraft.value?.id) || null
  } catch (error: any) {
    console.error('Error saving request form:', error)
    alert('ເກີດຂໍ້ຜິດພາດ: ' + error.message)
  }
}
// ✅ Handle RequestForm Updated (emit เมื่อ form มีการเปลี่ยนแปลง ถ้าต้องการ sync กับ modal อื่นๆ)
const handleRequestFormUpdated = (updatedData: any) => {
  // ✅ Optional: Sync ข้อมูลบางส่วนกลับไปยัง modalDraftForm ถ้าต้องการ
  Object.assign(modalDraftForm, {
    customer_name: updatedData.customerName,
    customer_phone: updatedData.customerPhone,
    // ... sync fields อื่นๆ ถ้าจำเป็น
  })
}
const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedDraft.value = null
  isEditingInModal.value = false
  activeTab.value = 'details'
  customerLocations.value = [] // ✅ ล้าง locations
  modalProductSearch.value = ''
  showModalProductDropdown.value = false
  selectedModalProduct.value = null
  modalShopId.value = null
  productStore.products = []
  // ล้างเอกสาร
  draftDocuments.value.forEach(doc => {
    doc.file = null
    doc.preview = null
  })
  optionalDocuments.value.forEach(doc => {
    doc.file = null
    doc.preview = null
  })
}
const startEditInModal = async () => {
  if (!selectedDraft.value) return
  let draftData = selectedDraft.value
  if (typeof draftData === 'string') {
    try {
      draftData = JSON.parse(draftData)
    } catch (e) {
      console.error('Error parsing selectedDraft.value:', e)
      return
    }
  }
  const shopId = draftData.partner_id ||
    draftData.product?.partner_id ||
    null
  modalShopId.value = shopId
  if (shopId) {
    try {
      await productStore.fetchProducts({ shop_id: shopId, limit: 100 })
      if (draftData.product_id) {
        const currentProduct = productStore.products.find(
          p => p.id === draftData!.product_id
        )
        if (currentProduct) {
          selectedModalProduct.value = currentProduct
          modalProductSearch.value = currentProduct.product_name
        }
      }
      if (draftData.product.productType_id) {
        const matchingProduct = productStore.products.find(
          p => p.productType_id === draftData!.product.productType_id
        )
        if (matchingProduct) {
          modalDraftForm.product_type = matchingProduct.productType.type_name
        }
      }
    } catch (error) {
      console.error('❌ Failed to load products:', error)
    }
  } else {
    productStore.products = []
  }
  modalDraftForm.customer_name = getDraftDisplayName(draftData)
  modalDraftForm.customer_phone = getDraftPhone(draftData)
  modalDraftForm.customer_id_card = draftData.customer?.identity_number || ''
  modalDraftForm.customer_address = getDraftAddress(draftData)
  modalDraftForm.occupation = draftData.customer?.occupation || ''
  modalDraftForm.age = draftData.customer?.age || 0
  modalDraftForm.product_name = getProductName(draftData)
  modalDraftForm.total_amount = parseFloat(draftData.total_amount.toString())
  modalDraftForm.interest_rate = parseFloat(draftData.interest_rate_at_apply.toString())
  modalDraftForm.loan_period = draftData.loan_period
  modalDraftForm.monthly_payment = parseFloat(draftData.monthly_pay.toString())
  modalDraftForm.income_per_month = draftData.customer?.income_per_month || 0
  modalDraftForm.other_debts = draftData.customer?.other_debts || 0
  isEditingInModal.value = true
  activeTab.value = 'details'
}
const saveDraftFromModal = async () => {
  if (!selectedDraft.value) return
  if (!validateModalForm()) {
    alert('ກະລຸນາກວດສອບຂໍ້ມູນທີ່ປ້ອນ')
    return
  }
  try {
    const nameParts = modalDraftForm.customer_name.trim().split(' ')
    const firstName = nameParts[0] || modalDraftForm.customer_name
    const lastName = nameParts.slice(1).join(' ') || ''
    const productIdToUpdate = selectedModalProduct.value?.id || selectedDraft.value.product_id
    const updateData: any = {
      product_id: productIdToUpdate,
      total_amount: modalDraftForm.total_amount,
      interest_rate_at_apply: modalDraftForm.interest_rate,
      loan_period: modalDraftForm.loan_period,
      monthly_pay: modalDraftForm.monthly_payment,
      customer_id: selectedDraft.value?.customer_id,
      first_name: firstName,
      last_name: lastName,
      phone: modalDraftForm.customer_phone.trim(),
      identity_number: modalDraftForm.customer_id_card.trim(),
      address: modalDraftForm.customer_address.trim(),
      occupation: modalDraftForm.occupation.trim(),
      age: modalDraftForm.age,
      income_per_month: modalDraftForm.income_per_month,
      other_debts: modalDraftForm.other_debts || 0
    }
    await loanApplicationStore.updateDraftLoanApplication(selectedDraft.value.id, updateData)
    // ✅ อัปโหลดเอกสาร
    if (selectedDraft.value.id) {
      isUploadingDocuments.value = true
      const allDocs = [...draftDocuments.value, ...optionalDocuments.value].filter(doc => doc.file)
      for (const doc of allDocs) {
        if (doc.file) {
          await loanApplicationStore.uploadDocument(
            selectedDraft.value.id,
            doc.file,
            doc.id
          )
        }
      }
      await loanApplicationStore.fetchDocuments(selectedDraft.value.id)
      isUploadingDocuments.value = false
    }
    alert('ບັນທຶກການປ່ຽນແປງສຳເລັດ!')
    isEditingInModal.value = false
    await loanApplicationStore.fetchLoanApplications({ status: 'pending', is_confirmed: 0 })
  } catch (error: any) {
    console.error('Error saving draft:', error)
    alert('ເກີດຂໍ້ຜິດພາດ: ' + error.message)
  }
}
const deleteDraft = async (draftId: number) => {
  if (!confirm('ຕ້ອງການລຶບຮ່າງສິນເຊື່ອນີ້ບໍ?')) return
  try {
    await loanApplicationStore.updateLoanApplication(draftId, { status: 'rejected', remarks: 'ລຶບຮ່າງ' })
    alert('ລຶບຮ່າງສິນເຊື່ອສຳເລັດ!')
    if (selectedDraft.value?.id === draftId) {
      closeDetailsModal()
    }
    await loanApplicationStore.fetchLoanApplications({ status: 'pending', is_confirmed: 0 })
  } catch (error: any) {
    console.error('Error deleting draft:', error)
    alert('ເກີດຂໍ້ຜິດພາດ: ' + error.message)
  }
}
const confirmSubmitDraft = (draft: LoanApplication) => {
  draftToSubmit.value = draft
  showSubmitModal.value = true
}
const submitDraft = async () => {
  if (!draftToSubmit.value) return
  showSubmitModal.value = false
  await requestOtp()
  showOtpModal.value = true
}
const requestOtp = async () => {
  if (!draftToSubmit.value?.customer?.phone) {
    alert('ບໍ່ພົບເບີໂທລະສັບ')
    return
  }
  try {
    await requestOtpForCustomer({ phone: draftToSubmit.value.customer.phone })
  } catch (error: any) {
    console.error('❌ Request OTP failed:', error)
    alert('ເກີດຂໍ້ຜິດພາດການສົ່ງ OTP: ' + error.message)
  }
}
const verifyAndSubmitDraft = async () => {
  if (!otpCode.value || otpCode.value.length !== 6) {
    otpError.value = 'ກະລຸນາປ້ອນລະຫັດ OTP 6 ຕົວ'
    return
  }
  if (!draftToSubmit.value) return
  isVerifying.value = true
  otpError.value = ''
  try {
    const confirmData: ConfirmDraftDto = {
      phone: draftToSubmit.value.customer.phone,
      otp: otpCode.value.trim(),
      is_confirmed: 1
    }
    await loanApplicationStore.ApplyDraft(draftToSubmit.value.id, confirmData)
    alert('ສົ່ງຮ່າງສິນເຊື່ອສຳເລັດ!')
    showOtpModal.value = false
    if (selectedDraft.value?.id === draftToSubmit.value.id) {
      closeDetailsModal()
    }
    draftToSubmit.value = null
    otpCode.value = ''
    await loanApplicationStore.fetchLoanApplications({ status: 'pending', is_confirmed: 0 })
  } catch (error: any) {
    console.error('❌ Submit draft failed:', error)
    otpError.value = error.message || 'ເກີດຂໍ້ຜິດພາດການຢືນຢັນ OTP'
  } finally {
    isVerifying.value = false
  }
}
const closeOtpModal = () => {
  showOtpModal.value = false
  otpCode.value = ''
  otpError.value = ''
  draftToSubmit.value = null
}
const exportToCSV = () => {
  if (!displayedDrafts.value.length) return
  const csvData = displayedDrafts.value.map(draft => ({
    'Loan ID': draft.loan_id,
    'ລູກຄ້າ': getDraftDisplayName(draft),
    'ເບີໂທ': getDraftPhone(draft),
    'ສິນຄ້າ': getProductName(draft),
    'ຈຳນວນເງິນ': formatPrice(draft.total_amount),
    'ດອກເບ້ຍ (%)': draft.interest_rate_at_apply,
    'ໄລຍະເວລາ (ເດືອນ)': draft.loan_period,
    'ເຈົ້າໜ້າທີ່': getRequesterName(draft),
    'ວັນທີ່ສ້າງ': draft.created_at ? formatDate(draft.created_at) : '-'
  }))
  const csv = Papa.unparse(csvData)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `loan_applications_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}
const previousPage = () => {
  if (hasPreviousPage.value) {
    currentPage.value--
  }
}
const nextPage = () => {
  if (hasNextPage.value) {
    currentPage.value++
  }
}
watch(pageSize, () => {
  currentPage.value = 1
})
onMounted(async () => {
  try {
    await loanApplicationStore.fetchLoanApplications({ status: 'pending', is_confirmed: 0 })
  } catch (error) {
    console.error('❌ Failed to load applications:', error)
  }
})
</script>
