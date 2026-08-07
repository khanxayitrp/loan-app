<template>
  <div class="p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ສິນເຊື່ອອະນຸມັດແບບມີເງື່ອນໄຂ</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">ລາຍການສິນເຊື່ອທີ່ອະນຸມັດ ແຕ່ມີຄະແນນປະເມີນລະຫວ່າງ 65 - 79</p>
      </div>

      <div class="flex items-center gap-2">
        <button @click="fetchLoans" class="btn btn-outline btn-sm">
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
          <span class="label-text text-sm font-medium text-gray-700 dark:text-gray-300">ຄົ້ນຫາ</span>
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
        <select v-model="disbursementFilter" class="select select-sm select-bordered w-full">
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
          <input v-model="dateFrom" type="date" class="input input-sm input-bordered w-full"
            @change="applyDateFilter" />
          <input v-model="dateTo" type="date" class="input input-sm input-bordered w-full" @change="applyDateFilter" />
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-12">
      <div class="loading loading-spinner loading-lg text-primary"></div>
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
            <th>ລາຄາສິນຄ້າ</th>
            <th>ເງິນວາງດາວ</th>
            <th>ຈຳນວນຍອດຈັດ</th>
            <th>ດອກເບ້ຍ (%)</th>
            <th>ໄລຍະເວລາ</th>
            <th>ຄະແນນ</th>
            <th>ສະຖານະການຈ່າຍ</th>
            <th>ຜູ້ອະນຸມັດ</th>
            <th>ວັນທີ່ອະນຸມັດ</th>
            <th class="w-24 text-center">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="loan in displayedLoans" :key="loan.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <td class="font-mono text-primary font-medium text-sm">#{{ loan.loan_id || loan.id }}</td>
            <td class="font-mono text-gray-600 dark:text-gray-400 text-sm">{{ getContractNumber(loan) }}</td>
            <td class="font-bold text-indigo-600 dark:text-indigo-400">{{ getCustomerName(loan) }}</td>
            <td>
              <div class="text-sm text-gray-500 flex items-center gap-1">
                <span class="icon-[tabler--phone] size-3"></span> {{ getCustomerPhone(loan) }}
              </div>
            </td>
            <td class="font-medium text-gray-700 dark:text-gray-300">
              {{ formatPrice(Number(loan.total_amount || 0)) }} ₭
            </td>
            <td class="font-medium text-gray-700 dark:text-gray-300">
              {{ formatPrice(Number(loan.down_payment || 0)) }} ₭
            </td>
            <td class="font-bold text-emerald-600">
              {{ formatPrice(Number(loan.total_amount || 0) - Number(loan.down_payment || 0)) }} ₭
            </td>
            <td class="text-sm">{{ loan.interest_rate_at_apply }}%</td>
            <td class="text-sm">{{ loan.loan_period }} ເດືອນ</td>
            <td>
              <span class="badge badge-sm badge-warning font-bold text-white shadow-sm">
                {{ loan.credit_score || 0 }}
              </span>
            </td>
            <td>
              <span class="badge badge-sm border-0 text-white font-medium shadow-sm"
                :class="getDisbursementBadgeClass(loan)">
                {{ getDisbursementStatusText(loan) }}
              </span>
            </td>
            <td class="text-sm text-gray-600">{{ loan.approver?.username || '-' }}</td>
            <td class="text-sm text-gray-600 dark:text-gray-400">{{ formatDate(loan.approved_at || loan.updatedAt ||
              loan.createdAt) }}</td>
            <td>
              <div class="flex justify-center gap-1">
                <div class="tooltip tooltip-top" data-tip="ເບິ່ງລາຍລະອຽດ">
                  <button class="btn btn-square btn-ghost btn-sm text-slate-600 hover:bg-slate-200"
                    @click="viewLoanDetails(loan)">
                    <span class="icon-[tabler--eye] size-5"></span>
                  </button>
                </div>

                <div v-if="loan.status === 'disbursed'" class="tooltip tooltip-top" data-tip="ເບິ່ງຕາຕະລາງຜ່ອນ">
                  <button class="btn btn-square btn-ghost btn-sm text-warning hover:bg-warning/10"
                    @click="openRepaymentHub(loan)">
                    <span class="icon-[tabler--calendar-stats] size-5"></span>
                  </button>
                </div>
              </div>
            </td>
          </tr>

          <tr v-if="displayedLoans.length === 0">
            <td colspan="14" class="text-center py-12 text-gray-400">
              <div class="flex flex-col items-center">
                <span class="icon-[tabler--database-off] size-12 mb-2 opacity-50"></span>
                <span>ບໍ່ພົບຂໍ້ມູນສິນເຊື່ອທີ່ອະນຸມັດແບບມີເງື່ອນໄຂ</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!isLoading && totalLoans > 0"
      class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm">
      <div class="text-gray-500">
        ສະແດງ {{ startIndex }} - {{ endIndex }} ຈາກທັງໝົດ {{ totalLoans }} ລາຍການ
      </div>

      <div class="flex items-center gap-2">
        <select v-model.number="pageSize" class="select select-sm select-bordered">
          <option :value="10">10 ຕໍ່ໜ້າ</option>
          <option :value="25">25 ຕໍ່ໜ້າ</option>
          <option :value="50">50 ຕໍ່ໜ້າ</option>
        </select>

        <button class="btn btn-sm btn-outline" :disabled="!hasPreviousPage" @click="previousPage">ກ່ອນໜ້າ</button>
        <span class="px-3 font-medium">ໜ້າ {{ currentPage }} / {{ totalPages }}</span>
        <button class="btn btn-sm btn-outline" :disabled="!hasNextPage" @click="nextPage">ຖັດໄປ</button>
      </div>
    </div>

    <teleport to="body">
      <div v-if="showDetailsModal && selectedLoan"
        class="fixed inset-0 z-[50] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">

          <div class="flex justify-between items-center mb-6 border-b pb-4">
            <h3 class="text-xl font-bold flex items-center gap-2">
              <span class="icon-[tabler--file-info] text-primary size-6"></span> ລາຍລະອຽດສິນເຊື່ອທີ່ອະນຸມັດແລ້ວ
            </h3>
            <button @click="closeDetailsModal" class="btn btn-ghost btn-circle btn-sm">
              <span class="icon-[tabler--x] size-5"></span>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto space-y-4 pr-2">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border">
                <label class="text-xs text-gray-500 block mb-1">ເລກທີ່ສິນເຊື່ອ</label>
                <p class="font-mono font-bold text-primary">{{ selectedLoan.loan_id || '-' }}</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border">
                <label class="text-xs text-gray-500 block mb-1">ສະຖານະ</label>
                <span class="badge badge-sm border-0 text-white"
                  :class="selectedLoan.status === 'disbursed' ? 'bg-indigo-600' : 'bg-emerald-500'">
                  {{ selectedLoan.status === 'disbursed' ? 'ຈ່າຍເງິນແລ້ວ' : 'ອະນຸມັດແລ້ວ' }}
                </span>
              </div>
              <div>
                <label class="text-xs text-gray-500">ຊື່ລູກຄ້າ</label>
                <p class="font-medium">{{ getCustomerName(selectedLoan) }}</p>
              </div>
              <div>
                <label class="text-xs text-gray-500">ເບີໂທ</label>
                <p class="font-medium">{{ getCustomerPhone(selectedLoan) }}</p>
              </div>
              <div>
                <label class="text-xs text-gray-500">ຊື່ສິນຄ້າ</label>
                <p class="font-medium">{{ selectedLoan.product?.product_name || '-' }}</p>
              </div>
              <div>
                <label class="text-xs text-gray-500">ຍອດຈັດສິນເຊື່ອຈິງ</label>
                <p class="font-bold text-blue-600">{{ formatPrice(Number(selectedLoan.total_amount || 0) -
                  Number(selectedLoan.down_payment || 0)) }}</p>
              </div>
              <div>
                <label class="text-xs text-gray-500">ດອກເບ້ຍ</label>
                <p class="font-medium">{{ selectedLoan.interest_rate_at_apply }}%</p>
              </div>
              <div>
                <label class="text-xs text-gray-500">ໄລຍະເວລາ</label>
                <p class="font-medium">{{ selectedLoan.loan_period }} ເດືອນ</p>
              </div>
              <div>
                <label class="text-xs text-gray-500">ຄະແນນການປະເມີນ</label>
                <p class="font-bold text-warning">
                  {{ selectedLoan.credit_score || 0 }} ຄະແນນ
                </p>
              </div>
              <div>
                <label class="text-xs text-gray-500">ຜູ້ອະນຸມັດ</label>
                <p class="font-medium">{{ selectedLoan.approver?.username || '-' }}</p>
              </div>
            </div>

            <div class="border-t pt-4">
              <label class="text-xs text-gray-500 block mb-1">ທີ່ຢູ່ປັດຈຸບັນ</label>
              <p class="text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{{ selectedLoan.customer?.address ||
                'ບໍ່ມີຂໍ້ມູນທີ່ຢູ່' }}</p>
            </div>

            <div v-if="(selectedLoan as any).delivery_receipt" class="border-t pt-4">
              <div class="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100">
                <h4 class="font-bold text-blue-800 flex items-center gap-2 mb-3">
                  <span class="icon-[tabler--file-invoice] size-5"></span> ຂໍ້ມູນໃບມອບຮັບສິນຄ້າ
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <label class="text-blue-600/80 block text-xs">ເລກທີ່ໃບມອບຮັບ</label>
                    <p class="font-medium">{{ (selectedLoan as any).delivery_receipt.receipts_id }}</p>
                  </div>
                  <div>
                    <label class="text-blue-600/80 block text-xs">ຊື່ຜູ້ຮັບສິນຄ້າ</label>
                    <p class="font-medium">{{ (selectedLoan as any).delivery_receipt.receiver_name }}</p>
                  </div>
                  <div>
                    <label class="text-blue-600/80 block text-xs">ວັນທີມອບຮັບ</label>
                    <p class="font-medium">{{ formatDate((selectedLoan as any).delivery_receipt.delivery_date) }}</p>
                  </div>
                  <div>
                    <label class="text-blue-600/80 block text-xs">ສະຖານະມອບຮັບ</label>
                    <span class="badge badge-sm mt-1 border-0 text-white"
                      :class="(selectedLoan as any).delivery_receipt.status === 'approved' ? 'bg-emerald-500' : 'bg-warning'">
                      {{ (selectedLoan as any).delivery_receipt.status === 'approved' ? 'ອະນຸມັດແລ້ວ' :
                        'ລໍຖ້າການອະນຸມັດ' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="border-t pt-4">
              <div class="alert alert-warning shadow-sm py-2">
                <span class="icon-[tabler--alert-circle] size-5"></span>
                <span class="text-sm">ຍັງບໍ່ມີຂໍ້ມູນການມອບຮັບສິນຄ້າ</span>
              </div>
            </div>

            <p class="text-xs text-gray-400 text-right mt-2">
              ອະນຸມັດເມື່ອ: {{ formatDate(selectedLoan.approved_at || selectedLoan.updatedAt || selectedLoan.createdAt)
              }}
            </p>
          </div>

          <div class="flex flex-wrap justify-end gap-3 mt-6 border-t pt-4">
            <button class="btn btn-outline btn-warning" @click="openScheduleModal(selectedLoan)">
              <span class="icon-[tabler--calendar-stats] size-4 mr-1"></span> ເບິ່ງຕາຕະລາງຜ່ອນ
            </button>
            <button class="btn btn-outline btn-info" @click="openDraftContractModal">
              <span class="icon-[tabler--file-certificate] size-4 mr-1"></span> ເບິ່ງຮ່າງສັນຍາ
            </button>
            <button class="btn btn-soft btn-secondary w-full sm:w-auto" @click="closeDetailsModal">
              ປິດໜ້າຈໍ
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div v-if="showContractModal"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-4xl mx-auto max-h-[95vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
          <div class="flex justify-between items-center mb-6 border-b pb-4">
            <h3 class="text-xl font-bold flex items-center gap-2">
              <span class="icon-[tabler--file-certificate] text-info size-6"></span> ຮ່າງສັນຍາກູ້ຢືມ
            </h3>
            <button @click="showContractModal = false"
              class="btn btn-circle btn-ghost btn-sm bg-gray-100 hover:bg-gray-200">
              <span class="icon-[tabler--x] size-5"></span>
            </button>
          </div>

          <LoanContractForm v-if="selectedContract" :loan-contract-id="selectedLoan?.id"
            :loan-application="selectedLoan" :loan-contract="selectedContract" :is-editing="false" :view-only="true"
            @cancel-edit="showContractModal = false" />
          <div v-else class="text-center py-10 text-gray-500">
            <div class="loading loading-spinner loading-lg text-primary"></div>
            <p class="mt-4">ກຳລັງໂຫຼດຂໍ້ມູນສັນຍາ...</p>
          </div>
        </div>
      </div>
    </teleport>

    <LoanScheduleModal :show="showScheduleModal" :loan="loanForSchedule" :view-only="true"
      @close="showScheduleModal = false; loanForSchedule = null" />

    <ExternalSignatureModal :is-open="showSignatureModal" :loan-id="loanForSignature?.id ?? null"
      @close="showSignatureModal = false; loanForSignature = null" @updated="fetchLoans" />

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
                      <span class="badge badge-sm" :class="statusConfig[sch.payment_status]?.class || 'badge-ghost'">
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
                <span class="badge badge-success text-white badge-sm">ສຳເລັດ</span>
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

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { useLoanApplicationStore } from '@/stores/loanApplication';
import { useLoanContractStore } from '@/stores/loanContract';
import { usePermissionStore } from '@/stores/permission'; // 🌟 1. Import Permission Store
import type { LoanApplication } from '@/types/loanApplication';
import { LoanApplicationStatus } from '@/types/loanApplication';
import apiClient from '@/api/apiclient';
import { alert } from '@/utils/alert';
import { formatPrice } from '@/utils/formatters';
import { storeToRefs } from 'pinia';

import LoanContractForm from '@/components/loans/form/LoanContractForm.vue';
import LoanScheduleModal from '@/components/modals/loan/detail/LoanScheduleModal.vue';
import ExternalSignatureModal from '@/components/modals/loan/pending/ExternalSignatureModal.vue';

const loanApplicationStore = useLoanApplicationStore();
const loanContractStore = useLoanContractStore();
const permissionStore = usePermissionStore(); // 🌟 2. ປະກາດໃຊ້ Store
const { loanApplications, isLoading } = storeToRefs(loanApplicationStore);

const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');
const disbursementFilter = ref('');
const dateFrom = ref('');
const dateTo = ref('');

const showDetailsModal = ref(false);
const selectedLoan = ref<LoanApplication | null>(null);

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

const statusConfig: Record<string, { class: string, text: string }> = {
  paid: { class: 'badge-success text-white', text: 'ຊຳລະແລ້ວ' },
  unpaid: { class: 'badge-warning', text: 'ລໍຖ້າຊຳລະ' },
  partial: { class: 'badge-info', text: 'ຈ່າຍບາງສ່ວນ' },
  overdue: { class: 'badge-error text-white', text: 'ກາຍກຳນົດ' }
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
  if (['disbursed', 'completed', 'closed'].includes(loan.status)) return 'bg-indigo-600 text-white';
  return 'bg-emerald-500 text-white';
};

const getDisbursementStatusText = (loan: any): string => {
  if (['disbursed', 'completed', 'closed'].includes(loan.status)) return 'ຈ່າຍເງິນແລ້ວ (Disbursed)';
  return 'ອະນຸມັດແລ້ວ (Approved)';
};

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const debouncedSearch = ref('');

const debounceSearch = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debouncedSearch.value = searchQuery.value;
    currentPage.value = 1;
  }, 300);
};

const applyDateFilter = () => {
  currentPage.value = 1;
};

const filteredLoans = computed(() => {
  let filtered = loanApplications.value;

  if (debouncedSearch.value) {
    const q = debouncedSearch.value.toLowerCase();
    filtered = filtered.filter(loan =>
      getCustomerName(loan).toLowerCase().includes(q) ||
      getCustomerPhone(loan).includes(q) ||
      (loan.loan_id ?? '').toLowerCase().includes(q) ||
      getContractNumber(loan).toLowerCase().includes(q)
    );
  }

  if (disbursementFilter.value === 'disbursed') {
    filtered = filtered.filter(loan => ['disbursed', 'completed', 'closed'].includes(loan.status));
  } else if (disbursementFilter.value === 'pending_disbursement') {
    filtered = filtered.filter(loan => loan.status === 'approved');
  }

  if (dateFrom.value || dateTo.value) {
    filtered = filtered.filter(loan => {
      const targetDate = loan.approved_at || loan.updatedAt || loan.createdAt;
      if (!targetDate) return false;
      const loanDate: string = new Date(targetDate).toISOString().split('T')[0] || '';
      return loanDate >= (dateFrom.value || '1970-01-01') && loanDate <= (dateTo.value || '9999-12-31');
    });
  }

  filtered = filtered.filter(loan => {
    const score = loan.credit_score || 0;
    return score >= 65 && score < 80;
  });

  return filtered;
});

const displayedLoans = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredLoans.value.slice(start, start + pageSize.value);
});

const totalLoans = computed(() => filteredLoans.value.length);
const totalPages = computed(() => Math.ceil(totalLoans.value / pageSize.value) || 1);
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value + 1);
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, totalLoans.value));
const hasPreviousPage = computed(() => currentPage.value > 1);
const hasNextPage = computed(() => currentPage.value < totalPages.value);

const previousPage = () => { if (hasPreviousPage.value) currentPage.value--; };
const nextPage = () => { if (hasNextPage.value) currentPage.value++; };

watch(pageSize, () => { currentPage.value = 1; });

// 🌟 ແກ້ໄຂ Error ໂດຍໃຊ້ Type Assertion (!) ບັງຄັບໃຫ້ TypeScript ຮູ້ວ່າຄ່າບໍ່ເປັນ undefined
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('lo-LA');
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

const openDraftContractModal = async () => {
  if (!selectedLoan.value) return;
  try {
    showContractModal.value = true;
    selectedContract.value = null;
    const contractRes = await loanContractStore.fetchContract(selectedLoan.value.id);
    const contractData = (contractRes as any)?.data?.data || (contractRes as any)?.data || contractRes;
    if (!contractData || Object.keys(contractData).length === 0) throw new Error("No Contract");
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
    if (!contractData || Object.keys(contractData).length === 0) throw new Error("Contract is empty");

    const fullLoan = await loanApplicationStore.fetchLoanApplicationById(loan.id);
    loanForSchedule.value = fullLoan;
    showScheduleModal.value = true;
  } catch (error) {
    alert.error('ບໍ່ສາມາດເປີດຕາຕະລາງໄດ້', 'ກະລຸນາສ້າງ "ສັນຍາກູ້ຢືມ" ກ່ອນ!');
  }
};

const openRepaymentHub = async (loan: LoanApplication) => {
  currentSchedules.value = [];
  selectedLoan.value = loan;
  showRepaymentHub.value = true;
  isScheduleLoading.value = true;

  try {
    const res = await loanApplicationStore.fetchRepaymentSchedule(loan.id);
    const data = res?.data || res || [];
    currentSchedules.value = Array.isArray(data) ? data : [];
  } catch (error: any) {
    alert.error('ເກີດຂໍ້ຜິດພາດ', 'ບໍ່ສາມາດໂຫຼດຕາຕະລາງການຜ່ອນຊຳລະໄດ້');
    currentSchedules.value = [];
  } finally {
    isScheduleLoading.value = false;
  }
};

// 🌟 ເພີ່ມຟັງຊັນ closeRepaymentHub ເພື່ອແກ້ໄຂ Error TS2551
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

// 🌟 ແກ້ໄຂບັກການ Export CSV: ໃຊ້ filteredLoans ແລະ ຄຳນວນຍອດເງິນໃຫ້ຖືກຕ້ອງ
const exportToCSV = () => {
  if (!filteredLoans.value.length) {
    alert.warning('ບໍ່ມີຂໍ້ມູນ', 'ບໍ່ມີຂໍ້ມູນສຳລັບ Export');
    return;
  }
  const csvData = filteredLoans.value.map(loan => {
    const netAmount = Number(loan.total_amount || 0) - Number(loan.down_payment || 0);
    return {
      'ເລກທີ່ສິນເຊື່ອ': loan.loan_id || loan.id || '-',
      'ເລກທີ່ສັນຍາ': getContractNumber(loan),
      'ຊື່ລູກຄ້າ': getCustomerName(loan),
      'ເບີໂທ': getCustomerPhone(loan),
      'ລາຄາສິນຄ້າ': formatPrice(Number(loan.total_amount || 0)),
      'ເງິນວາງດາວ': formatPrice(Number(loan.down_payment || 0)),
      'ຍອດຈັດສິນເຊື່ອ': formatPrice(netAmount),
      'ດອກເບ້ຍ (%)': loan.interest_rate_at_apply || '0',
      'ໄລຍະເວລາ (ເດືອນ)': loan.loan_period || '0',
      'ຄະແນນ': loan.credit_score || '0',
      'ສະຖານະການຈ່າຍ': getDisbursementStatusText(loan),
      'ຜູ້ອະນຸມັດ': loan.approver?.username || '-',
      'ວັນທີ່ອະນຸມັດ': formatDate(loan.approved_at || loan.updatedAt || loan.createdAt || '')
    };
  });
  const csv = Papa.unparse(csvData);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `conditional_loans_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

// 🌟 ແກ້ໄຂບັກການ Export Excel: ໃຊ້ filteredLoans ແລະ ສົ່ງເປັນ Number ໃຫ້ Excel ໄປບວກລົບກັນໄດ້
const exportToExcel = () => {
  if (!filteredLoans.value.length) {
    alert.warning('ບໍ່ມີຂໍ້ມູນ', 'ບໍ່ມີຂໍ້ມູນສຳລັບ Export');
    return;
  }
  const excelData = filteredLoans.value.map(loan => {
    const netAmount = Number(loan.total_amount || 0) - Number(loan.down_payment || 0);
    return {
      'ເລກທີ່ສິນເຊື່ອ': loan.loan_id || loan.id || '-',
      'ເລກທີ່ສັນຍາ': getContractNumber(loan),
      'ຊື່ລູກຄ້າ': getCustomerName(loan),
      'ເບີໂທ': getCustomerPhone(loan),
      'ລາຄາສິນຄ້າ (ກີບ)': Number(loan.total_amount || 0),
      'ເງິນວາງດາວ (ກີບ)': Number(loan.down_payment || 0),
      'ຍອດຈັດສິນເຊື່ອ (ກີບ)': netAmount,
      'ດອກເບ້ຍ (%)': Number(loan.interest_rate_at_apply || 0),
      'ໄລຍະເວລາ (ເດືອນ)': Number(loan.loan_period || 0),
      'ຄະແນນ': Number(loan.credit_score || 0),
      'ສະຖານະການຈ່າຍ': getDisbursementStatusText(loan),
      'ຜູ້ອະນຸມັດ': loan.approver?.username || '-',
      'ວັນທີ່ອະນຸມັດ': formatDate(loan.approved_at || loan.updatedAt || loan.createdAt || '')
    };
  });
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Conditional Loans');
  XLSX.writeFile(workbook, `conditional_loans_${new Date().toISOString().split('T')[0]}.xlsx`);
};

const fetchLoans = async () => {
  try {
    await loanApplicationStore.fetchLoanApplications({
      status: [LoanApplicationStatus.APPROVED, LoanApplicationStatus.DISBURSED] as any,
      is_confirmed: 1,
      limit: 1000,
      minScore: 65,
      maxScore: 80,
    } as any);
  } catch (error: any) {
    alert.error('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້', error.message);
  }
};

onMounted(() => {
  fetchLoans();
});

onUnmounted(() => {
  loanApplicationStore.resetFilters();
});
</script>
