<template>
  <div class="p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ສິນເຊື່ອທີ່ອະນຸມັດແລ້ວ</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          ຈັດການສິນເຊື່ອທີ່ໄດ້ຮັບການອະນຸມັດແລ້ວ
          <span class="ml-1 text-primary font-medium">
            (ທັງໝົດ {{ totalFiltered }} ລາຍການ)
          </span>
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button @click="fetchData" class="btn btn-outline btn-sm">
          <span class="icon-[tabler--refresh] size-4 mr-1"></span> ໂຫຼດຂໍ້ມູນໃໝ່
        </button>
        <button @click="exportToCSV" class="btn btn-outline btn-sm whitespace-nowrap"
          :disabled="isLoading || filteredLoans.length === 0">
          <span class="icon-[tabler--file-export] size-4 mr-1"></span> Export CSV
        </button>
        <button @click="exportToExcel" class="btn btn-outline btn-sm whitespace-nowrap btn-success"
          :disabled="isLoading || filteredLoans.length === 0">
          <span class="icon-[tabler--file-spreadsheet] size-4 mr-1"></span> Export Excel
        </button>
      </div>
    </div>

    <div
      class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div>
        <label class="label pb-1">
          <span class="label-text text-sm font-medium text-gray-700 dark:text-gray-300">ຄົ້ນຫາ
            (ໃນລາຍການທີ່ໂຫຼດມາ)</span>
        </label>
        <div class="relative">
          <input v-model="searchQuery" type="text" placeholder="ຊື່ລູກຄ້າ, ເບີໂທ, ເລກທີ່..."
            class="input input-sm input-bordered w-full pl-9" @input="debounceSearch" />
          <span class="icon-[tabler--search] size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></span>
        </div>
      </div>

      <div>
        <label class="label pb-1">
          <span class="label-text text-sm font-medium text-gray-700 dark:text-gray-300">ສະຖານະການຈ່າຍເງິນ</span>
        </label>
        <select v-model="disbursementFilter" class="select select-sm select-bordered w-full" @change="resetPage">
          <option value="">ທັງໝົດສະຖານະ</option>
          <option value="pending_disbursement">ຍັງບໍ່ໄດ້ຈ່າຍເງິນ (Approved)</option>
          <option value="disbursed">ຈ່າຍເງິນແລ້ວ (Disbursed)</option>
        </select>
      </div>

      <div>
        <label class="label pb-1">
          <span class="label-text text-sm font-medium text-gray-700 dark:text-gray-300">ວັນທີ່ອະນຸມັດ</span>
        </label>
        <div class="flex gap-2">
          <input v-model="dateFrom" type="date" class="input input-sm input-bordered w-full" @change="resetPage" />
          <input v-model="dateTo" type="date" class="input input-sm input-bordered w-full" @change="resetPage" />
        </div>
      </div>
    </div>

    <div v-if="isLoading && loanApplicationStore.loanApplications.length === 0" class="text-center py-12">
      <div class="loading loading-spinner text-primary"></div>
      <p class="text-gray-500 mt-2">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
    </div>

    <div v-else
      class="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
      <table class="table table-zebra w-full min-w-max">
        <thead class="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 text-sm">
          <tr>
            <th>ເລກທີ່ສິນເຊື່ອ</th>
            <th>ເລກທີ່ສັນຍາ</th>
            <th>ລູກຄ້າ</th>
            <th>ເບີໂທ</th>
            <th>ຈຳນວນເງິນ</th>
            <th>ດອກເບ້ຍ (%)</th>
            <th>ໄລຍະເວລາ</th>
            <th>ສະຖານະການຈ່າຍ</th>
            <th>ຜູ້ອະນຸມັດ</th>
            <th>ວັນທີ່ອະນຸມັດ</th>
            <th class="w-40 text-center">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <!-- 🟢 ນຳໃຊ້ displayedLoans ສຳລັບ Client-Side Pagination -->
          <tr v-for="loan in displayedLoans" :key="loan.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <td class="font-mono text-gray-600 dark:text-gray-400 text-sm">{{ loan.loan_id }}</td>
            <td class="font-mono text-gray-600 dark:text-gray-400 text-sm">{{ getContractNumber(loan) }}</td>
            <td>
              <div class="font-bold text-indigo-600 dark:text-indigo-400">{{ getCustomerName(loan) }}</div>
            </td>
            <td>
              <div class="text-sm text-gray-500 flex items-center gap-1">
                <span class="icon-[tabler--phone] size-3"></span> {{ getCustomerPhone(loan) }}
              </div>
            </td>
            <td>
              <div class="font-bold text-emerald-600">
                {{ formatPrice(Number(loan.total_amount || 0) - Number(loan.down_payment || 0)) }} ₭
              </div>
            </td>
            <td class="text-sm">{{ loan.interest_rate_at_apply }}%</td>
            <td class="text-sm">{{ loan.loan_period }} ເດືອນ</td>

            <td>
              <span class="badge badge-sm border-0 font-medium shadow-sm text-white"
                :class="getDisbursementBadgeClass(loan)">
                {{ getDisbursementStatusText(loan) }}
              </span>
            </td>

            <td class="text-sm text-gray-600">{{ loan.approver?.username || '-' }}</td>
            <td class="text-sm text-gray-600 dark:text-gray-400">
              {{ formatDate(loan.approved_at || (loan as any).updatedAt || (loan as any).createdAt || '') }}
            </td>

            <td>
              <div class="flex justify-center gap-1">
                <div class="tooltip tooltip-top" data-tip="ເບິ່ງລາຍລະອຽດ">
                  <button class="btn btn-square btn-ghost btn-sm text-slate-600 hover:bg-slate-200"
                    @click="viewLoanDetails(loan)">
                    <span class="icon-[tabler--eye] size-5"></span>
                  </button>
                </div>
                <div v-if="loan.credit_score" class="tooltip tooltip-top" data-tip="ພິມໃບສະຫຼຸບ">
                  <button class="btn btn-square btn-ghost btn-sm text-gray-500 hover:text-primary hover:bg-gray-100"
                    @click="openPrintSummary(loan)">
                    <span class="icon-[tabler--printer] size-5"></span>
                  </button>
                </div>

                <div v-if="hasContract(loan)" class="tooltip tooltip-top" data-tip="ເບິ່ງ/ຈັດການລາຍເຊັນ">
                  <button class="btn btn-square btn-ghost btn-sm text-indigo-500 hover:bg-indigo-100"
                    @click="openSignatureModal(loan)">
                    <span class="icon-[tabler--signature] size-5"></span>
                  </button>
                </div>

                <div class="tooltip tooltip-top" data-tip="ເບິ່ງ/ຈັດການໃບມອບຮັບ">
                  <button class="btn btn-square btn-ghost btn-sm text-fuchsia-600 hover:bg-fuchsia-100"
                    @click="openDeliveryNoteModal(loan)">
                    <span class="icon-[tabler--file-invoice] size-5"></span>
                  </button>
                </div>

                <!-- <div v-if="loan.status === 'disbursed' || loan.status === 'completed'" class="tooltip tooltip-top"
                  data-tip="ເບິ່ງຕາຕະລາງຜ່ອນ">
                  <button class="btn btn-square btn-ghost btn-sm text-warning hover:bg-warning/10"
                    @click="openRepaymentHub(loan)">
                    <span class="icon-[tabler--calendar-stats] size-5"></span>
                  </button>
                </div> -->
              </div>
            </td>
          </tr>

          <tr v-if="displayedLoans.length === 0">
            <td colspan="11" class="text-center py-12 text-gray-400">
              <div class="flex flex-col items-center">
                <span class="icon-[tabler--file-search] size-12 mb-2 opacity-50"></span>
                <span>ບໍ່ພົບຂໍ້ມູນທີ່ກົງກັບການຄົ້ນຫາ</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 🟢 ລະບົບແບ່ງໜ້າແບບ Local Pagination -->
    <div v-if="!isLoading && totalFiltered > 0"
      class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm">
      <div class="text-gray-500">
        ສະແດງ {{ startIndex }} - {{ endIndex }} ຈາກທີ່ຄົ້ນຫາພົບ {{ totalFiltered }} ລາຍການ
      </div>

      <div class="flex items-center gap-2">
        <select v-model.number="pageSize" class="select select-sm select-bordered" @change="resetPage">
          <option :value="10">10 ຕໍ່ໜ້າ</option>
          <option :value="25">25 ຕໍ່ໜ້າ</option>
          <option :value="50">50 ຕໍ່ໜ້າ</option>
          <option :value="100">100 ຕໍ່ໜ້າ</option>
        </select>

        <button class="btn btn-sm btn-outline" :disabled="!hasPreviousPage" @click="previousPage">ກ່ອນໜ້າ</button>
        <span class="px-3 font-medium">ໜ້າ {{ currentPage }} / {{ totalPages }}</span>
        <button class="btn btn-sm btn-outline" :disabled="!hasNextPage" @click="nextPage">ຖັດໄປ</button>
      </div>
    </div>

    <!-- 🟢 ປຸ່ມ Load More ດຶງຂໍ້ມູນຈາກ Server ຖ້າຄົ້ນຫາບໍ່ເຈີ -->
    <div v-if="!isLoading"
      class="flex flex-col items-center mt-6 mb-4 border-t pt-6 border-dashed dark:border-gray-700">
      <button v-if="loanApplicationStore.canLoadMore" class="btn btn-primary btn-outline w-full max-w-xs"
        @click="loadMore" :disabled="loanApplicationStore.isLoadingMore">
        <span v-if="loanApplicationStore.isLoadingMore" class="loading loading-spinner loading-sm"></span>
        <span v-else class="icon-[tabler--arrow-down-circle] size-5"></span>
        ໂຫຼດຂໍ້ມູນຈາກຖານຂໍ້ມູນເພີ່ມເຕີມ
      </button>

      <p v-else class="text-sm text-gray-400 italic">
        (ດຶງຂໍ້ມູນມາຄົບທັງໝົດ {{ loanApplicationStore.totalRecords }} ລາຍການແລ້ວ)
      </p>
    </div>

    <!-- Modals (ອັນເກົ່າທັງໝົດ ຮັກສາໄວ້ຄືເດີມ) -->
    <teleport to="body">
      <div v-if="showDetailsModal && selectedLoan"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold flex items-center gap-2">
              <span class="icon-[tabler--list-details] text-primary size-6"></span> ລາຍລະອຽດສິນເຊື່ອທີ່ອະນຸມັດແລ້ວ
            </h3>
            <button @click="closeDetailsModal" class="text-gray-400 hover:text-gray-600">
              <span class="icon-[tabler--x] size-5"></span>
            </button>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500">ເລກທີ່ສິນເຊື່ອ</label>
                <p class="font-mono">{{ selectedLoan.loan_id }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ສະຖານະ</label><br>
                <span class="badge badge-sm border-0 mt-1 text-white shadow-sm"
                  :class="selectedLoan.status === 'disbursed' || selectedLoan.status === 'completed' ? 'bg-indigo-600' : 'bg-emerald-500'">
                  {{ (selectedLoan.status === 'disbursed' || selectedLoan.status === 'completed') ? 'ຈ່າຍເງິນແລ້ວ' :
                    'ອະນຸມັດແລ້ວ' }}
                </span>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ຊື່ລູກຄ້າ</label>
                <p>{{ getCustomerName(selectedLoan) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ເບີໂທ</label>
                <p>{{ getCustomerPhone(selectedLoan) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ຊື່ສິນຄ້າ</label>
                <p class="font-medium">{{ selectedLoan.product?.product_name || '-' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ຈຳນວນເງິນ</label>
                <p class="font-medium text-primary">{{ formatPrice(Number(selectedLoan.total_amount) || 0) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ດອກເບ້ຍ</label>
                <p>{{ selectedLoan.interest_rate_at_apply }}%</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ໄລຍະເວລາ</label>
                <p>{{ selectedLoan.loan_period }} ເດືອນ</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ຄະແນນສິນເຊື່ອ</label>
                <p class="font-bold text-info">{{ selectedLoan.credit_score || 'ຍັງບໍ່ໄດ້ຄຳນວນ' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ຜູ້ອະນຸມັດ</label>
                <p>{{ selectedLoan.approver?.username || '-' }}</p>
              </div>
            </div>

            <div class="border-t pt-4">
              <label class="text-sm font-medium text-gray-500">ທີ່ຢູ່</label>
              <p class="whitespace-pre-line">{{ selectedLoan.customer?.address || '-' }}</p>
            </div>

            <div v-if="(selectedLoan as any).delivery_receipt"
              class="border-t pt-4 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg mt-2">
              <h4 class="font-medium mb-3 flex items-center gap-2">
                <span class="icon-[tabler--file-invoice] size-5 text-primary"></span> ຂໍ້ມູນໃບມອບຮັບສິນຄ້າ
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <label class="text-gray-500 block mb-1">ເລກທີ່ໃບມອບຮັບ</label>
                  <p class="font-medium">{{ (selectedLoan as any).delivery_receipt.receipts_id }}</p>
                </div>
                <div>
                  <label class="text-gray-500 block mb-1">ຊື່ຜູ້ຮັບສິນຄ້າ</label>
                  <p class="font-medium">{{ (selectedLoan as any).delivery_receipt.receiver_name }}</p>
                </div>
                <div>
                  <label class="text-gray-500 block mb-1">ວັນທີ່ມອບຮັບ</label>
                  <p>{{ formatDate((selectedLoan as any).delivery_receipt.delivery_date) }}</p>
                </div>
                <div>
                  <label class="text-gray-500 block mb-1">ສະຖານະ</label>
                  <br>
                  <span class="badge badge-sm border-0 text-white mt-1"
                    :class="(selectedLoan as any).delivery_receipt.status === 'approved' ? 'bg-emerald-500' : 'bg-warning'">
                    {{ (selectedLoan as any).delivery_receipt.status === 'approved' ? 'ອະນຸມັດແລ້ວ' : 'ລໍຖ້າການອະນຸມັດ'
                    }}
                  </span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mt-4">
              <div>
                <label class="text-sm font-medium text-gray-500">ອະນຸມັດເມື່ອ</label>
                <p>{{ formatDate(selectedLoan.approved_at || (selectedLoan as any).updatedAt || (selectedLoan as
                  any).createdAt || '') }}</p>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap justify-end gap-3 mt-6 border-t pt-4">
            <button class="btn btn-outline btn-warning text-warning hover:bg-warning/10"
              @click="openScheduleModal(selectedLoan)">
              <span class="icon-[tabler--calendar-stats] size-4 mr-1"></span> ຕາຕະລາງຜ່ອນ
            </button>

            <button class="btn btn-outline btn-info text-info hover:bg-info/10" @click="openDraftContractModal">
              <span class="icon-[tabler--file-certificate] size-4 mr-1"></span> ເບິ່ງຮ່າງສັນຍາ
            </button>

            <button
              class="btn btn-outline text-fuchsia-600 border-fuchsia-200 hover:bg-fuchsia-50 hover:border-fuchsia-300"
              @click="openDeliveryNoteModal(selectedLoan)">
              <span class="icon-[tabler--file-invoice] size-4 mr-1"></span> ໃບມອບຮັບ
            </button>

            <button class="btn btn-primary w-full sm:w-auto ml-auto md:ml-0" @click="closeDetailsModal">
              ປິດໜ້າຈໍ
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div v-if="showContractModal"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
          <div class="flex justify-between items-center mb-6 border-b pb-4">
            <h3 class="text-lg font-bold flex items-center gap-2">
              <span class="icon-[tabler--file-certificate] text-info size-6"></span> ຮ່າງສັນຍາກູ້ຢືມ
            </h3>
            <button @click="showContractModal = false"
              class="btn btn-circle btn-ghost btn-sm text-gray-500 hover:bg-gray-200">
              <span class="icon-[tabler--x] size-5"></span>
            </button>
          </div>

          <LoanContractForm v-if="selectedContract" :loan-contract-id="selectedLoan?.id"
            :loan-application="selectedLoan || undefined" :loan-contract="selectedContract" :is-editing="false"
            :view-only="true" @cancel-edit="showContractModal = false" />
          <div v-else class="text-center py-8 text-gray-500">
            <div class="loading loading-spinner loading-md"></div>
            <p class="mt-2">ກຳລັງໂຫຼດຂໍ້ມູນສັນຍາ...</p>
          </div>
        </div>
      </div>
    </teleport>

    <DeliveryNoteModal :is-open="showDeliveryNoteModal" :loan="loanForDeliveryNote || undefined" :is-read-only="true"
      @close="showDeliveryNoteModal = false; loanForDeliveryNote = null" />

    <LoanScheduleModal :show="showScheduleModal" :loan="loanForSchedule || undefined" :view-only="true"
      @close="showScheduleModal = false; loanForSchedule = null" />

    <ExternalSignatureModal :is-open="showSignatureModal" :loan-id="loanForSignature?.id ?? null"
      @close="showSignatureModal = false; loanForSignature = null" @updated="fetchData" />

    <!-- 🌟 Repayment Hub Modal 🌟 -->
    <teleport to="body">
      <div v-if="showRepaymentHub"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-5xl mx-auto max-h-[90vh] flex flex-col relative animate-in fade-in zoom-in duration-200">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4" @click="closeRepaymentHub">✕</button>

          <h3 class="font-bold text-xl mb-4 border-b pb-2 pr-8 flex items-center gap-2">
            <span class="icon-[tabler--calendar-stats] text-warning size-6"></span>
            ຂໍ້ມູນການຜ່ອນຊຳລະ - ເລກທີ່ສັນຍາ: {{ getContractNumber(selectedLoan) }}
          </h3>

          <div v-if="isScheduleLoading" class="flex justify-center py-10"><span
              class="loading loading-spinner loading-lg text-primary"></span></div>
          <div v-else-if="selectedLoan" class="flex-1 overflow-y-auto space-y-6 pr-2">

            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <p class="text-sm text-blue-600">ຍອດໜີ້ທັງໝົດລວມດອກເບ້ຍ</p>
                <p class="text-xl font-bold">{{ formatPrice(summary.totalPayable) }}</p>
              </div>
              <div class="p-4 rounded-lg bg-green-50 border border-green-100">
                <p class="text-sm text-green-600">ຈ່າຍແລ້ວທັງໝົດ</p>
                <p class="text-xl font-bold">{{ formatPrice(summary.totalPaid) }}</p>
              </div>
              <div class="p-4 rounded-lg bg-red-50 border border-red-100">
                <p class="text-sm text-red-600">ຍອດໜີ້ຍັງເຫຼືອ</p>
                <p class="text-xl font-bold text-red-600">{{ formatPrice(summary.remainingBalance) }}</p>
              </div>

              <div
                class="flex items-center justify-center bg-gray-50 border rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer"
                @click="viewReceiptHistory(selectedLoan.id)">
                <button class="btn btn-outline btn-primary w-full h-full shadow-sm flex flex-col gap-1">
                  <span class="icon-[tabler--receipt] size-6"></span>
                  <span class="text-xs font-bold whitespace-normal leading-tight">ເບິ່ງປະຫວັດການຊຳລະທັງໝົດ</span>
                </button>
              </div>
            </div>

            <div class="border rounded-lg overflow-x-auto">
              <table class="table table-sm table-zebra w-full">
                <thead class="bg-base-200">
                  <tr>
                    <th class="text-center">ງວດທີ</th>
                    <th>ກຳນົດຈ່າຍ</th>
                    <th>ຕົ້ນທຶນ</th>
                    <th>ດອກເບ້ຍ</th>
                    <th>ຍອດຕ້ອງຈ່າຍລວມ</th>
                    <th>ສະຖານະ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="sch in currentSchedules" :key="sch.id"
                    :class="{ 'bg-green-50/50 dark:bg-green-900/20': sch.payment_status === 'paid' }">
                    <td class="font-medium text-center">{{ sch.installment_no }}</td>
                    <td>{{ formatDate(sch.due_date) }}</td>
                    <td class="text-gray-500">{{ formatPrice(sch.principal_amount) }}</td>
                    <td class="text-gray-500">{{ formatPrice(sch.interest_amount) }}</td>
                    <td class="font-bold">{{ formatPrice(sch.total_due) }}</td>
                    <td>
                      <span class="badge badge-sm border-0 text-white"
                        :class="statusConfig[sch.payment_status]?.class || 'badge-ghost'">
                        {{ statusConfig[sch.payment_status]?.text || sch.payment_status }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="!currentSchedules.length">
                    <td colspan="6" class="text-center py-6 text-gray-500">ບໍ່ພົບຕາຕະລາງການຜ່ອນຊຳລະ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </teleport>

    <!-- 🌟 Receipt Modal 🌟 -->
    <teleport to="body">
      <div v-if="showReceiptModal"
        class="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg mx-auto relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
            @click="showReceiptModal = false">✕</button>

          <h3 class="font-bold text-xl mb-4 border-b pb-2 flex items-center gap-2 text-primary">
            <span class="icon-[tabler--receipt] size-6"></span> ປະຫວັດການຊຳລະເງິນ
          </h3>

          <div v-if="isReceiptLoading" class="flex justify-center py-8">
            <span class="loading loading-spinner loading-lg text-primary"></span>
          </div>

          <div v-else-if="receiptTransactions.length > 0" class="space-y-4">
            <div v-for="(tx, index) in receiptTransactions" :key="index"
              class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border">
              <div class="flex justify-between items-center mb-3 border-b pb-2">
                <span class="text-xs text-gray-500 font-medium">ໃບບິນອ້າງອີງ: {{ tx.id }}</span>
                <span class="badge badge-success text-white badge-sm border-0">ສຳເລັດ</span>
              </div>

              <div class="grid grid-cols-2 gap-y-2 text-sm">
                <div class="text-gray-500">ປະເພດ / ງວດທີ:</div>
                <div class="font-bold text-right text-indigo-600">
                  <span v-if="tx.transaction_type === 'closing'" class="text-error">ປິດບັນຊີ (Payoff)</span>
                  <span v-else-if="tx.schedule?.installment_no">ງວດທີ {{ tx.schedule.installment_no }}</span>
                  <span v-else>ຊຳລະທົ່ວໄປ</span>
                </div>

                <div class="text-gray-500">ວັນທີຊຳລະ:</div>
                <div class="font-medium text-right">{{ formatDate(tx.paid_at || tx.createdAt) }}</div>

                <div class="text-gray-500 mt-1">ຍອດເງິນທີ່ຈ່າຍ:</div>
                <div class="font-bold text-right text-primary text-base mt-1">{{ formatPrice(tx.amount_paid) }} ກີບ
                </div>

                <div class="col-span-2 bg-white dark:bg-gray-800 rounded-md border p-3 my-1 shadow-sm">
                  <div class="grid grid-cols-2 gap-y-1.5 text-xs">
                    <div class="text-gray-500 flex items-center gap-1">
                      <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> ຕົ້ນທຶນ:
                    </div>
                    <div class="font-medium text-right">{{ formatPrice(tx.schedule?.paid_principal || 0) }} ກີບ</div>

                    <div class="text-gray-500 flex items-center gap-1">
                      <span class="w-1.5 h-1.5 rounded-full bg-orange-400"></span> ດອກເບ້ຍ:
                    </div>
                    <div class="font-medium text-right">{{ formatPrice(tx.schedule?.paid_interest || 0) }} ກີບ</div>

                    <div class="text-gray-500 flex items-center gap-1">
                      <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> ຄ່າປັບໃໝ:
                    </div>
                    <div class="font-medium text-right text-error">{{ formatPrice(tx.schedule?.paid_penalty || 0) }} ກີບ
                    </div>
                  </div>
                </div>

                <div class="text-gray-500">ຊ່ອງທາງ:</div>
                <div class="font-medium text-right">
                  {{ tx.payment_channel === 'bank_transfer' ? 'ໂອນເງິນ' : 'ເງິນສົດ' }}
                </div>

                <div class="text-gray-500">ຜູ້ຮັບເງິນ:</div>
                <div class="font-medium text-right">{{ tx.recorded_by_user?.full_name || tx.recorded_by_user?.username
                  || 'ລະບົບ' }}</div>
              </div>

              <div v-if="tx.proof_url" class="mt-4 pt-3 border-t text-center">
                <a :href="tx.proof_url" target="_blank" class="btn btn-sm btn-outline btn-info w-full">
                  <span class="icon-[tabler--photo] size-4 mr-1"></span> ເບິ່ງຮູບສະລິບໂອນເງິນ
                </a>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-500">
            ບໍ່ພົບຂໍ້ມູນປະຫວັດການຊຳລະເງິນສຳລັບສັນຍານີ້.
          </div>

          <div class="modal-action mt-6">
            <button class="btn btn-secondary w-full" @click="showReceiptModal = false">ປິດໜ້າຈໍ</button>
          </div>
        </div>
      </div>
    </teleport>

    <PrintSummaryModal :is-open="showPrintModal" :print-data="printData"
      @close="showPrintModal = false; printData = null" />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { useLoanApplicationStore } from '@/stores/loanApplication';
import { useLoanContractStore } from '@/stores/loanContract';
import { usePermissionStore } from '@/stores/permission';
import type { LoanApplication } from '@/types/loanApplication';
import { LoanApplicationStatus } from '@/types/loanApplication';
import apiClient from '@/api/apiclient';
import { alert } from '@/utils/alert';
import { formatPrice } from '@/utils/formatters';
import { storeToRefs } from 'pinia';

import LoanContractForm from '@/components/loans/form/LoanContractForm.vue';
import LoanScheduleModal from '@/components/modals/loan/detail/LoanScheduleModal.vue';
import ExternalSignatureModal from '@/components/modals/loan/pending/ExternalSignatureModal.vue';
import DeliveryNoteModal from '@/components/modals/loan/pending/DeliveryNoteModal.vue';
import PrintSummaryModal from '@/components/modals/loan/pending/PrintSummaryModal.vue';

const loanApplicationStore = useLoanApplicationStore();
const loanContractStore = useLoanContractStore();
const permissionStore = usePermissionStore();
const { loanApplications, isLoading } = storeToRefs(loanApplicationStore);

const route = useRoute();
const router = useRouter();

// 🟢 Pagination & Filter States
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');
const disbursementFilter = ref('');
const dateFrom = ref('');
const dateTo = ref('');

// 🟢 Modal States
const showDetailsModal = ref(false);
const showDeliveryNoteModal = ref(false);
const selectedLoan = ref<LoanApplication | null>(null);
const loanForDeliveryNote = ref<LoanApplication | null>(null);

const showScheduleModal = ref(false);
const loanForSchedule = ref<any>(null);
const showContractModal = ref(false);
const selectedContract = ref<any>(null);
const showSignatureModal = ref(false);
const loanForSignature = ref<LoanApplication | null>(null);

const showRepaymentHub = ref(false);
const isScheduleLoading = ref(false);
const currentSchedules = ref<any[]>([]);
const showReceiptModal = ref(false);
const isReceiptLoading = ref(false);
const receiptTransactions = ref<any[]>([]);

const showPrintModal = ref(false);
const printData = ref<any>(null);

// ===============================================
// 🌟 1. Utilities
// ===============================================
const statusConfig: Record<string, { class: string, text: string }> = {
  paid: { class: 'bg-emerald-500 text-white', text: 'ຊຳລະແລ້ວ' },
  unpaid: { class: 'bg-warning text-white', text: 'ລໍຖ້າຊຳລະ' },
  partial: { class: 'bg-info text-white', text: 'ຈ່າຍບາງສ່ວນ' },
  overdue: { class: 'bg-error text-white', text: 'ກາຍກຳນົດ' }
};

const getContractNumber = (loan: any): string => {
  if (loan && loan.loan_contracts && loan.loan_contracts.length > 0) {
    return loan.loan_contracts[0].loan_contract_number || '-';
  }
  return '-';
};

const getCustomerName = (loan: LoanApplication): string => {
  if (!loan.customer) return '-';
  return `${loan.customer?.first_name || ''} ${loan.customer?.last_name || ''}`.trim();
};

const getCustomerPhone = (loan: LoanApplication): string => {
  return loan.customer?.phone || '-';
};

const getDisbursementBadgeClass = (loan: any): string => {
  if (['disbursed', 'completed', 'closed'].includes(loan.status)) return 'bg-indigo-600';
  return 'bg-emerald-500';
};

const getDisbursementStatusText = (loan: any): string => {
  if (['disbursed', 'completed', 'closed'].includes(loan.status)) return 'ຈ່າຍເງິນແລ້ວ (Disbursed)';
  return 'ອະນຸມັດແລ້ວ (Approved)';
};

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('lo-LA');
};

const hasContract = (loan: any): boolean => {
  return !!(loan.loan_contracts && loan.loan_contracts.length > 0);
};

const summary = computed(() => {
  let totalPayable = 0;
  let totalPaid = 0;
  if (Array.isArray(currentSchedules.value)) {
    currentSchedules.value.forEach(sch => {
      totalPayable += Number(sch.total_due) || 0;
      if (sch.payment_status === 'paid') totalPaid += Number(sch.total_due) || 0;
    });
  }
  return { totalPayable, totalPaid, remainingBalance: Math.max(0, totalPayable - totalPaid) };
});

// ===============================================
// 🌟 2. Local Search & Pagination Logic
// ===============================================
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const debouncedSearch = ref('');

const debounceSearch = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debouncedSearch.value = searchQuery.value;
    resetPage();
  }, 300);
};

const resetPage = () => {
  currentPage.value = 1;
};

const applyDateFilter = () => {
  resetPage();
};

const filteredLoans = computed(() => {
  let filtered = loanApplications.value;

  if (debouncedSearch.value) {
    const query = debouncedSearch.value.toLowerCase().trim();
    filtered = filtered.filter(loan =>
      getCustomerName(loan).toLowerCase().includes(query) ||
      getCustomerPhone(loan).includes(query) ||
      (loan.loan_id ?? '').toLowerCase().includes(query) ||
      getContractNumber(loan).toLowerCase().includes(query)
    );
  }

  if (disbursementFilter.value === 'disbursed') {
    filtered = filtered.filter(loan => ['disbursed', 'completed', 'closed'].includes(loan.status));
  } else if (disbursementFilter.value === 'pending_disbursement') {
    filtered = filtered.filter(loan => loan.status === 'approved');
  }

  if (dateFrom.value || dateTo.value) {
    filtered = filtered.filter(loan => {
      const dateTarget = loan.approved_at || (loan as any).updatedAt || (loan as any).createdAt || '';
      if (!dateTarget) return false;
      const loanDate = new Date(dateTarget).toISOString().split('T')[0] || '';
      const fromDate = dateFrom.value || '1970-01-01';
      const toDate = dateTo.value || '9999-12-31';
      return loanDate >= fromDate && loanDate <= toDate;
    });
  }

  return filtered;
});

const displayedLoans = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredLoans.value.slice(start, start + pageSize.value);
});

const totalFiltered = computed(() => filteredLoans.value.length);
const totalPages = computed(() => Math.ceil(totalFiltered.value / pageSize.value) || 1);
const startIndex = computed(() => totalFiltered.value === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1);
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, totalFiltered.value));
const hasPreviousPage = computed(() => currentPage.value > 1);
const hasNextPage = computed(() => currentPage.value < totalPages.value);

const previousPage = () => { if (hasPreviousPage.value) currentPage.value--; };
const nextPage = () => { if (hasNextPage.value) currentPage.value++; };

// ===============================================
// 🌟 3. Data Fetching
// ===============================================
const fetchData = async () => {
  try {
    await loanApplicationStore.fetchLoanApplications({
      status: [LoanApplicationStatus.APPROVED, LoanApplicationStatus.DISBURSED] as any,
      is_confirmed: 1,
      limit: 100, // 🟢 ດຶງຂໍ້ມູນມາກ້ອນໃຫຍ່ສຳລັບ Local Filter
      cursor: undefined
    });
  } catch (error: any) {
    alert.error('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້', error.message);
  }
};

const loadMore = async () => {
  await loanApplicationStore.loadMoreLoanApplications();
};

const applyNotificationFilter = (id: any) => {
  if (!id) return;
  const targetLoan = loanApplicationStore.loanApplications.find((l: any) => l.id === Number(id));

  if (targetLoan && targetLoan.loan_id) {
    searchQuery.value = targetLoan.loan_id;
    debouncedSearch.value = targetLoan.loan_id;
    resetPage();
  }

  if (route.query.filterId) {
    const query = { ...route.query };
    delete query.filterId;
    router.replace({ query });
  }
};

onMounted(async () => {
  await fetchData();

  if (route.query.filterId) {
    applyNotificationFilter(route.query.filterId);
  }
});

watch(() => route.query.filterId, (newId) => {
  if (newId) {
    applyNotificationFilter(newId);
  }
});

onUnmounted(() => {
  loanApplicationStore.resetFilters();
});

// ===============================================
// 🌟 4. Modals & Actions
// ===============================================
const viewLoanDetails = async (loan: LoanApplication) => {
  try {
    const fullDetails = await loanApplicationStore.fetchLoanApplicationById(loan.id);
    selectedLoan.value = fullDetails || loan;
  } catch (error) {
    selectedLoan.value = loan;
  }
  showDetailsModal.value = true;
};

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedLoan.value = null;
};

const openSignatureModal = (loan: LoanApplication) => {
  loanForSignature.value = loan;
  showSignatureModal.value = true;
};

const openDeliveryNoteModal = (loan: LoanApplication) => {
  loanForDeliveryNote.value = loan;
  showDeliveryNoteModal.value = true;
};

const openDraftContractModal = async () => {
  if (!selectedLoan.value) return;
  try {
    showContractModal.value = true;
    selectedContract.value = null;
    const contractRes = await loanContractStore.fetchContract(selectedLoan.value.id);
    const contractData = (contractRes as any)?.data?.data || (contractRes as any)?.data || contractRes;
    if (!contractData || Object.keys(contractData).length === 0 || (!contractData.id && !contractData.loan_id)) throw new Error("No Contract");
    selectedContract.value = contractData;
  } catch (error) {
    showContractModal.value = false;
    alert.error('ບໍ່ພົບຂໍ້ມູນ', 'ຍັງບໍ່ມີການສ້າງຮ່າງສັນຍາສຳລັບສິນເຊື່ອນີ້');
  }
};

const openScheduleModal = async (loan: any) => {
  try {
    const contractRes = await loanContractStore.fetchContract(loan.id);
    const contractData = (contractRes as any)?.data?.data || (contractRes as any)?.data || contractRes;
    if (!contractData || Object.keys(contractData).length === 0 || (!contractData.id && !contractData.loan_id)) throw new Error("Contract is empty");

    const fullLoan = await loanApplicationStore.fetchLoanApplicationById(loan.id);
    loanForSchedule.value = fullLoan;
    showScheduleModal.value = true;
  } catch (error) {
    alert.error('ບໍ່ສາມາດເປີດຕາຕະລາງໄດ້', 'ກະລຸນາສ້າງ "ສັນຍາກູ້ຢືມ" ໃຫ້ລູກຄ້າຮັບຮູ້ເງື່ອນໄຂກ່ອນ!');
  }
};

// 🌟 ແກ້ໄຂບັນຫາ Repayment Reactivity
const openRepaymentHub = async (loan: LoanApplication) => {
  currentSchedules.value = [];
  selectedLoan.value = loan;
  showRepaymentHub.value = true;
  isScheduleLoading.value = true;

  try {
    const res = await loanApplicationStore.fetchRepaymentSchedule(loan.id);

    let rawData = [];
    if (Array.isArray(res)) {
      rawData = res;
    } else if (res?.data && Array.isArray(res.data)) {
      rawData = res.data;
    } else if (res?.data?.data && Array.isArray(res.data.data)) {
      rawData = res.data.data;
    } else if (typeof res === 'string') {
      try {
        const parsed = JSON.parse(res);
        rawData = Array.isArray(parsed) ? parsed : (parsed.data || []);
      } catch (e) { }
    }

    currentSchedules.value = [...rawData];
  } catch (error: any) {
    alert.error('ເກີດຂໍ້ຜິດພາດ', 'ບໍ່ສາມາດໂຫຼດຕາຕະລາງການຜ່ອນຊຳລະໄດ້');
    currentSchedules.value = [];
  } finally {
    isScheduleLoading.value = false;
  }
};

const closeRepaymentHub = () => {
  showRepaymentHub.value = false;
  selectedLoan.value = null;
  currentSchedules.value = [];
};

const viewReceiptHistory = async (applicationId: number) => {
  showReceiptModal.value = true;
  isReceiptLoading.value = true;
  receiptTransactions.value = [];

  try {
    const response = await apiClient.get(`/repayments/transactions/application/${applicationId}`);
    if (response.data && response.data.data) {
      receiptTransactions.value = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
    }
  } catch (error) {
    alert.error('ເກີດຂໍ້ຜິດພາດ', 'ບໍ່ສາມາດດຶງຂໍ້ມູນໃບບິນໄດ້');
  } finally {
    isReceiptLoading.value = false;
  }
};

const openPrintSummary = async (loan: any) => {
  try {
    let summaryData = null;
    try {
      const res = await apiClient.get(`/checklist/summary/${loan.id}`);
      summaryData = res.data?.data;
    } catch (e) { }

    if (!summaryData) return alert.error('ບໍ່ສາມາດພິມໄດ້', 'ກະລຸນາປະເມີນຄະແນນ ແລະ Checklist ໃຫ້ຄົບຖ້ວນກ່ອນພິມ.');

    const basic = summaryData.basic_verification || {};
    const income = summaryData.income_assessment || {};
    const cib = summaryData.cib_check || {};

    let age = loan.customer?.age || 0;
    if (!age && basic.verified_dob) {
      age = Math.abs(new Date(Date.now() - new Date(basic.verified_dob).getTime()).getUTCFullYear() - 1970);
    }

    const workInfo = loan.customer?.customer_work_infos?.[0] || loan.customer?.work_info?.[0] || {};
    const workYears = Number(basic.work_years) || Number(workInfo.duration_years) || 0;
    const workMonths = Number(basic.work_months) || Number(workInfo.duration_months) || 0;

    let formattedTenure = '';
    if (workYears > 0 && workMonths > 0) {
      formattedTenure = `${workYears} ປີ ${workMonths} ເດືອນ`;
    } else if (workYears > 0) {
      formattedTenure = `${workYears} ປີ`;
    } else if (workMonths > 0) {
      formattedTenure = `${workMonths} ເດືອນ`;
    } else {
      formattedTenure = `ບໍ່ລະບຸ`;
    }

    const totalIncome = (Number(income.average_monthly_income) || 0) + (Number(income.other_verified_income) || 0);
    const totalDebt = (Number(income.existing_debt_payments) || 0) + (Number(income.proposed_installment) || 0);
    const dsrPercent = totalIncome > 0 ? (totalDebt / totalIncome) * 100 : 100;
    const price = Number(basic.verified_price) || Number(loan.total_amount) || 1;
    const dp = Number(basic.verified_down_payment) || Number(loan.down_payment) || 0;

    printData.value = {
      loan: loan,
      customerName: getCustomerName(loan),
      age: age,
      phone: getCustomerPhone(loan),
      companyName: basic.work_company_name || workInfo.company_name || 'ບໍ່ລະບຸ',
      jobTenure: formattedTenure,
      totalIncome: totalIncome,
      totalDebt: totalDebt,
      productName: basic.verified_product_type || loan.product?.product_name || '-',
      productPrice: price,
      downPayment: dp,
      downPaymentPercent: (dp / price) * 100,
      approvedAmount: price - dp,
      interestRate: loan.interest_rate_at_apply,
      interestType: loan.interest_rate_type === 'yearly' ? 'ຕໍ່ປີ' : 'ຕໍ່ເດືອນ',
      loanPeriod: loan.loan_period,
      monthlyPay: Number(basic.verified_monthly_pay) || Number(loan.monthly_pay),
      cibStatus: cib.cib_status || cib.overall_cib_status || 'no_delay',
      dsrPercent: dsrPercent,
      callStatus: summaryData.call_verifications?.[0]?.call_status || 'completed',
      remarks: loan.remarks || cib.remark || '',
      creditScore: loan.credit_score || 0
    };
    showPrintModal.value = true;
  } catch (error) {
    alert.error('ເກີດຂໍ້ຜິດພາດໃນການກຽມຂໍ້ມູນພິມ');
  }
}

// ===============================================
// 🌟 5. Export
// ===============================================
const exportToCSV = () => {
  if (!filteredLoans.value.length) {
    alert.warning('ບໍ່ມີຂໍ້ມູນ', 'ບໍ່ມີຂໍ້ມູນສຳລັບ Export');
    return;
  }
  const csvData = filteredLoans.value.map(loan => {
    const netAmount = Number(loan.total_amount || 0) - Number(loan.down_payment || 0);
    return {
      'ເລກທີ່ສິນເຊື່ອ': loan.loan_id || '-',
      'ເລກທີ່ສັນຍາ': getContractNumber(loan),
      'ຊື່ລູກຄ້າ': getCustomerName(loan),
      'ເບີໂທ': getCustomerPhone(loan),
      'ຈຳນວນເງິນ': formatPrice(netAmount),
      'ດອກເບ້ຍ (%)': loan.interest_rate_at_apply || '0',
      'ໄລຍະເວລາ (ເດືອນ)': loan.loan_period || '0',
      'ສະຖານະການຈ່າຍ': getDisbursementStatusText(loan),
      'ຜູ້ອະນຸມັດ': loan.approver?.username || '-',
      'ວັນທີ່ອະນຸມັດ': formatDate(loan.approved_at || (loan as any).updatedAt || (loan as any).createdAt || '')
    };
  });
  const csv = Papa.unparse(csvData);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `approved_loans_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

const exportToExcel = () => {
  if (!filteredLoans.value.length) {
    alert.warning('ບໍ່ມີຂໍ້ມູນ', 'ບໍ່ມີຂໍ້ມູນສຳລັບ Export');
    return;
  }
  const excelData = filteredLoans.value.map(loan => {
    const netAmount = Number(loan.total_amount || 0) - Number(loan.down_payment || 0);
    return {
      'ເລກທີ່ສິນເຊື່ອ': loan.loan_id || '-',
      'ເລກທີ່ສັນຍາ': getContractNumber(loan),
      'ຊື່ລູກຄ້າ': getCustomerName(loan),
      'ເບີໂທ': getCustomerPhone(loan),
      'ຈຳນວນເງິນ (ກີບ)': netAmount, // 🟢 Number
      'ດອກເບ້ຍ (%)': Number(loan.interest_rate_at_apply || 0), // 🟢 Number
      'ໄລຍະເວລາ (ເດືອນ)': Number(loan.loan_period || 0), // 🟢 Number
      'ສະຖານະການຈ່າຍ': getDisbursementStatusText(loan),
      'ຜູ້ອະນຸມັດ': loan.approver?.username || '-',
      'ວັນທີ່ອະນຸມັດ': formatDate(loan.approved_at || (loan as any).updatedAt || (loan as any).createdAt || '')
    };
  });
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Loans');
  XLSX.writeFile(workbook, `approved_loans_${new Date().toISOString().split('T')[0]}.xlsx`);
};
</script>
