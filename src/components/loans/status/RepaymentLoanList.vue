<template>
  <div class="p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ລາຍການຊຳລະສິນເຊື່ອ</h1>
        <p class="text-sm text-gray-500">ລາຍການສິນເຊື່ອທີ່ອະນຸມັດ ແລະ ມອບຮັບສິນຄ້າສຳເລັດແລ້ວ</p>
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
      class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 max-w-2xl bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div>
        <label class="label pb-1">
          <span class="label-text text-sm font-medium text-gray-700 dark:text-gray-300">ຄົ້ນຫາ</span>
        </label>
        <div class="relative">
          <input v-model="searchQuery" type="text" placeholder="ຄົ້ນຫາເລກທີສັນຍາ, ຊື່, ເບີໂທ..."
            class="input input-sm input-bordered w-full pl-9" @input="debounceSearch" />
          <span class="icon-[tabler--search] size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></span>
        </div>
      </div>

      <div>
        <label class="label pb-1">
          <span class="label-text text-sm font-medium text-gray-700 dark:text-gray-300">ສະຖານະການຈ່າຍເງິນ</span>
        </label>
        <select v-model="statusFilter" class="select select-sm select-bordered w-full">
          <option value="active">ກຳລັງຜ່ອນຊຳລະ (Active)</option>
          <option value="completed">ປິດບັນຊີແລ້ວ (Completed)</option>
          <option value="late">ຊັກຊ້າ (Late)</option>
        </select>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center py-12">
      <span class="loading loading-spinner text-primary"></span>
    </div>

    <div v-else
      class="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
      <table class="table table-zebra w-full min-w-max">
        <thead class="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 text-sm">
          <tr>
            <th>ເລກທີ່ສິນເຊື່ອ</th>
            <th>ເລກທີ່ສັນຍາ</th>
            <th>ລູກຄ້າ</th>
            <th>ຍອດຈັດສິນເຊື່ອ</th>
            <th>ຄ່າຜ່ອນ/ງວດ</th>
            <th>ສະຖານະ</th>
            <th class="text-center w-32">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="loan in displayedLoans" :key="loan.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <td class="font-mono text-gray-600 dark:text-gray-400 text-sm">#{{ loan.loan_id || loan.id }}</td>
            <td class="font-mono text-indigo-600 dark:text-indigo-400 text-sm font-bold">{{ getContractNumber(loan) }}
            </td>
            <td>
              <div class="font-bold text-gray-800 dark:text-white">{{ getCustomerName(loan) }}</div>
              <div class="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <span class="icon-[tabler--phone] size-3"></span> {{ loan.customer?.phone || '-' }}
              </div>
            </td>
            <td>
              <div class="font-bold text-emerald-600">
                {{ formatPrice((Number(loan.total_amount) || 0) - (Number(loan.down_payment) || 0)) }} ₭
              </div>
            </td>
            <td>
              <div class="font-bold text-primary bg-primary/10 inline-block px-2 py-1 rounded">
                {{ formatPrice(loan.monthly_pay) }} ₭
              </div>
            </td>
            <td>
              <span class="badge badge-sm border-0 font-medium shadow-sm bg-indigo-600 text-white">
                ອະນຸມັດແລ້ວ
              </span>
            </td>

            <td>
              <div class="flex flex-col items-center justify-center gap-1.5">
                <button class="btn btn-sm btn-primary w-full" @click="openRepaymentHub(loan)">
                  <span class="icon-[tabler--wallet] size-4 mr-1"></span> ຈັດການຊຳລະ
                </button>
                <div v-if="!hasApprovedDelivery(loan)"
                  class="text-[10px] font-medium text-warning flex items-center gap-1 bg-warning/10 px-2 py-0.5 rounded w-full justify-center">
                  <span class="icon-[tabler--alert-circle] size-3"></span> ຍັງບໍ່ມອບຮັບ
                </div>
              </div>
            </td>
          </tr>
          <tr v-if="!displayedLoans.length">
            <td colspan="7" class="text-center py-12 text-gray-400">
              <div class="flex flex-col items-center">
                <span class="icon-[tabler--file-search] size-12 mb-2 opacity-50"></span>
                <span>ບໍ່ພົບຂໍ້ມູນລາຍການຊຳລະສິນເຊື່ອ</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!isLoading && totalLoans > 0"
      class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm">
      <div class="text-gray-500">
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

        <span class="px-2">
          ໜ້າ {{ currentPage }} / {{ totalPages }}
        </span>

        <button class="btn btn-sm" :disabled="!hasNextPage" @click="nextPage">
          ຖັດໄປ
        </button>
      </div>
    </div>

    <teleport to="body">
      <div v-if="showRepaymentHub"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-5xl mx-auto max-h-[90vh] flex flex-col relative animate-in fade-in zoom-in duration-200">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4" @click="closeRepaymentHub">
            <span class="icon-[tabler--x] size-5"></span>
          </button>

          <h3 class="font-bold text-xl mb-4 border-b pb-4 pr-8 flex items-center gap-2">
            <span class="icon-[tabler--calendar-stats] text-warning size-6"></span>
            ຂໍ້ມູນການຜ່ອນຊຳລະ - ເລກທີ່ສັນຍາ: <span class="text-primary">{{ getContractNumber(selectedLoan) }}</span>
          </h3>

          <div v-if="isScheduleLoading" class="flex justify-center py-10">
            <span class="loading loading-spinner loading-lg text-primary"></span>
          </div>

          <div v-else-if="selectedLoan" class="flex-1 overflow-y-auto space-y-6 pr-2">

            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="p-4 rounded-xl bg-blue-50/50 border border-blue-100 shadow-sm">
                <p class="text-sm text-blue-600 font-medium">ຍອດໜີ້ທັງໝົດລວມດອກເບ້ຍ</p>
                <p class="text-2xl font-black text-gray-800">{{ formatPrice(summary.totalPayable) }}</p>
              </div>
              <div class="p-4 rounded-xl bg-green-50/50 border border-green-100 shadow-sm">
                <p class="text-sm text-green-600 font-medium">ຈ່າຍແລ້ວທັງໝົດ</p>
                <p class="text-2xl font-black text-gray-800">{{ formatPrice(summary.totalPaid) }}</p>
              </div>
              <div class="p-4 rounded-xl bg-red-50/50 border border-red-100 shadow-sm">
                <p class="text-sm text-red-600 font-medium">ຍອດໜີ້ຍັງເຫຼືອ</p>
                <p class="text-2xl font-black text-red-600">{{ formatPrice(summary.remainingBalance) }}</p>
              </div>

              <div class="flex items-center h-full">
                <button v-if="summary.remainingBalance > 0 && canManagePayment"
                  class="btn btn-error text-white w-full h-full shadow-md" @click="openPaymentModal(null, true)">
                  <span class="icon-[tabler--cash-banknote] size-5"></span> ປິດບັນຊີກ່ອນກຳນົດ
                </button>
                <div v-else-if="summary.remainingBalance <= 0"
                  class="text-success font-bold flex items-center justify-center w-full h-full gap-2 bg-success/10 rounded-xl border border-success/20">
                  <span class="icon-[tabler--circle-check-filled] size-6"></span> ປິດບັນຊີແລ້ວ
                </div>
                <div v-else-if="!canManagePayment"
                  class="flex items-center justify-center w-full h-full bg-gray-100 rounded-xl border text-gray-500 text-sm font-medium">
                  <span class="icon-[tabler--lock] size-4 mr-1"></span> Read Only
                </div>
              </div>
            </div>

            <div class="flex justify-end">
              <button class="btn btn-outline btn-primary btn-sm" @click="viewReceiptHistory(selectedLoan.id)">
                <span class="icon-[tabler--receipt] size-4 mr-1"></span> ເບິ່ງປະຫວັດການຊຳລະທັງໝົດ
              </button>
            </div>

            <div class="border rounded-xl overflow-hidden shadow-sm bg-white dark:bg-gray-800">
              <table class="table table-sm table-zebra w-full">
                <thead class="bg-gray-50 dark:bg-gray-900 text-gray-600">
                  <tr>
                    <th class="text-center py-3">ງວດທີ</th>
                    <th>ກຳນົດຈ່າຍ</th>
                    <th class="text-right">ຕົ້ນທຶນ</th>
                    <th class="text-right">ດອກເບ້ຍ</th>
                    <th class="text-right">ຍອດຕ້ອງຈ່າຍລວມ</th>
                    <th class="text-center">ສະຖານະ</th>
                    <th class="text-center">ຈັດການ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(sch, index) in currentSchedules" :key="sch.id"
                    :class="{ 'bg-emerald-50/50 dark:bg-emerald-900/10': sch.payment_status === 'paid' }">
                    <td class="font-bold text-center">{{ sch.installment_no }}</td>
                    <td class="font-medium text-gray-700">{{ formatDate(sch.due_date) }}</td>
                    <td class="text-gray-500 text-right">{{ formatPrice(sch.principal_amount) }}</td>
                    <td class="text-gray-500 text-right">{{ formatPrice(sch.interest_amount) }}</td>
                    <td class="font-bold text-right text-primary">{{ formatPrice(sch.total_due) }}</td>
                    <td class="text-center">
                      <span class="badge badge-sm border-0 font-medium"
                        :class="statusConfig[sch.payment_status]?.class || 'badge-ghost'">
                        {{ statusConfig[sch.payment_status]?.text || sch.payment_status }}
                      </span>
                    </td>
                    <td class="text-center">
                      <button v-if="sch.payment_status !== 'paid' && canManagePayment"
                        class="btn btn-xs btn-success text-white"
                        :class="{ 'opacity-50 cursor-not-allowed': !canPaySchedule(index) }"
                        :disabled="!canPaySchedule(index)" @click="openPaymentModal(sch, false)">
                        ຊຳລະງວດນີ້
                      </button>

                      <button v-else-if="sch.payment_status === 'paid'"
                        class="btn btn-xs btn-ghost text-primary hover:bg-primary/10" @click="viewReceipt(sch)">
                        <span class="icon-[tabler--receipt] size-4"></span> ໃບບິນ
                      </button>

                      <span v-else-if="!canManagePayment" class="text-gray-400 text-xs">-</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div v-if="showPaymentModal"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto relative max-h-[95vh] overflow-y-auto">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
            @click="showPaymentModal = false">✕</button>

          <h3 class="font-bold text-xl mb-4 text-success border-b pb-2 flex items-center gap-2 pr-8">
            <span class="icon-[tabler--receipt-2] size-6"></span>
            {{ isEarlyPayoff ? 'ປິດບັນຊີກ່ອນກຳນົດ (Pay Off)' : `ຊຳລະຄ່າງວດທີ ${paymentForm.installment_number}` }}
          </h3>

          <div class="space-y-4">
            <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border text-center relative overflow-hidden">
              <div v-if="isEarlyPayoff" class="absolute top-0 left-0 w-full h-1 bg-warning"></div>

              <p class="text-sm text-gray-500 dark:text-gray-400">ຍອດທີ່ຕ້ອງຊຳລະທັງໝົດ</p>
              <p class="text-3xl font-bold text-primary">{{ formatPrice(calculatedTotalExpected) }}</p>

              <div class="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3 text-sm text-gray-600 dark:text-gray-300">
                <span>ຕົ້ນທຶນ: <strong>{{ formatPrice(paymentForm.expected_principal) }}</strong></span>
                <span>ດອກເບ້ຍ: <strong>{{ formatPrice(paymentForm.expected_interest) }}</strong></span>
                <span v-if="paymentForm.expected_penalty > 0" class="text-error">
                  ຄ່າປັບໃໝ: <strong>+{{ formatPrice(paymentForm.expected_penalty) }}</strong>
                </span>
                <span v-if="paymentForm.discount_given > 0" class="text-success">
                  ສ່ວນຫຼຸດ: <strong>-{{ formatPrice(paymentForm.discount_given) }}</strong>
                </span>
              </div>
            </div>

            <div v-if="isEarlyPayoff" class="form-control bg-blue-50 p-3 rounded-lg border border-blue-200 mt-2">
              <label class="label pb-1">
                <span class="label-text font-medium text-blue-800">ຈຳນວນເດືອນດອກເບ້ຍທີ່ຕ້ອງຈ່າຍ (ເງື່ອນໄຂປິດກ່ອນ)</span>
              </label>
              <select v-model.number="paymentForm.payoff_months_to_charge" @change="recalculatePayoffInterest"
                class="select select-sm select-bordered w-full font-bold text-blue-700">
                <option v-for="n in 12" :key="n" :value="n">ຈ່າຍດອກເບ້ຍ {{ n }} ເດືອນ</option>
                <option :value="0">ຍົກເວັ້ນດອກເບ້ຍ (0 ເດືອນ)</option>
              </select>
              <p class="text-xs text-blue-600 mt-1">
                * ຖ້າງວດຍັງເຫຼືອຫຼາຍກວ່າ 6 ງວດ, ລະບົບຈະຕັ້ງຄ່າເລີ່ມຕົ້ນໃຫ້ເກັບດອກເບ້ຍລ່ວງໜ້າ 5 ເດືອນ
              </p>
            </div>

            <!-- 🌟 ปลดล็อก v-if="isEarlyPayoff" ออก เพื่อให้กรอกส่วนลดได้ทั้งงวดปกติและปิดบัญชี 🌟 -->
            <div class="form-control bg-green-50 p-3 rounded-lg border border-green-200 mt-2">
              <label class="label pb-1"><span class="label-text font-medium text-green-700">ມອບສ່ວນຫຼຸດ (ກີບ)</span></label>
              <input type="text" :value="formatCurrencyInput(paymentForm.discount_given)" @input="handleDiscountInput"
                class="input input-sm input-bordered w-full font-bold text-success" />
              <p class="text-[10px] text-green-600 mt-1 leading-tight">
                * ລະບົບຈະນຳສ່ວນຫຼຸດໄປຫັກລ້າງກັບຄ່າປັບໃໝກ່ອນ, ຖ້າເຫຼືອຈຶ່ງນຳໄປຫັກລ້າງດອກເບ້ຍ
              </p>
            </div>

            <div class="form-control mt-4">
              <label class="label pb-1"><span class="label-text font-bold text-lg text-blue-700">ຍອດເງິນທີ່ຮັບຈາກລູກຄ້າ
                  (ກີບ) *</span></label>
              <input type="text" :value="formatCurrencyInput(paymentForm.amount_received)" @input="handleAmountInput"
                class="input input-lg input-bordered w-full font-bold text-2xl text-primary bg-blue-50/50"
                placeholder="0" required />
            </div>

            <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 border">
              <p class="text-xs text-gray-500 mb-2 font-medium">ລະບົບຈະຈັດສັນເງິນອັດຕະໂນມັດ (Auto-Waterfall):</p>
              <div class="grid grid-cols-3 gap-2 text-sm text-center">
                <div class="flex flex-col p-1 bg-white rounded border">
                  <span class="text-xs text-gray-500">ຄ່າປັບໃໝ</span>
                  <span class="font-bold text-error">{{ formatPrice(waterfallPreview.penalty) }}</span>
                </div>
                <div class="flex flex-col p-1 bg-white rounded border">
                  <span class="text-xs text-gray-500">ດອກເບ້ຍ</span>
                  <span class="font-bold text-orange-500">{{ formatPrice(waterfallPreview.interest) }}</span>
                </div>
                <div class="flex flex-col p-1 bg-white rounded border">
                  <span class="text-xs text-gray-500">ຕົ້ນທຶນ</span>
                  <span class="font-bold text-blue-600">{{ formatPrice(waterfallPreview.principal) }}</span>
                </div>
              </div>

              <div v-if="waterfallPreview.overpay > 0" class="mt-2 pt-2 border-t flex justify-between text-success">
                <span class="font-medium">ເງິນທອນ / ຈ່າຍເກີນໄປງວດໜ້າ:</span>
                <span class="font-bold">+{{ formatPrice(waterfallPreview.overpay) }}</span>
              </div>
              <div v-else-if="paymentForm.amount_received > 0 && paymentForm.amount_received < calculatedTotalExpected"
                class="mt-2 pt-2 border-t flex justify-between text-warning">
                <span class="font-medium">ຍອດຍັງຄ້າງ (ໜີ້ຍົກໄປ):</span>
                <span class="font-bold">{{ formatPrice(calculatedTotalExpected - paymentForm.amount_received) }}</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 pt-2">
              <div class="form-control">
                <label class="label pb-1"><span class="label-text font-medium">ຊ່ອງທາງ *</span></label>
                <select v-model="paymentForm.payment_method" class="select select-bordered w-full">
                  <option value="cash">ເງິນສົດ</option>
                  <option value="transfer">ໂອນເງິນ</option>
                </select>
              </div>
              <div class="form-control">
                <label class="label pb-1"><span class="label-text font-medium">ວັນທີຊຳລະ *</span></label>
                <input type="date" v-model="paymentForm.payment_date" class="input input-bordered w-full" required />
              </div>
            </div>

            <div class="form-control" v-if="paymentForm.payment_method === 'transfer'">
              <label class="label pb-1"><span class="label-text font-medium">ເລກອ້າງອີງ / Ref No.</span></label>
              <input type="text" v-model="paymentForm.reference_number" placeholder="ຕົວຢ່າງ: BCEL 0012..."
                class="input input-bordered w-full" />
            </div>

            <div class="form-control mt-4" v-if="paymentForm.payment_method === 'transfer'">
              <label class="label pb-1"><span class="label-text font-medium text-blue-700">ຫຼັກຖານການໂອນ (Slip)
                  *</span></label>

              <div class="flex items-start gap-4">
                <div
                  class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 w-full md:w-1/2 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all"
                  @click="triggerSlipUpload">
                  <input ref="slipInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden"
                    @change="handleSlipUpload" />
                  <span class="icon-[tabler--upload] size-8 text-gray-400 mb-2"></span>
                  <p class="text-sm text-gray-500 font-medium">ອັບໂຫຼດຮູບສະລິບ</p>
                </div>

                <div v-if="paymentForm.slip_preview"
                  class="relative w-24 h-32 rounded-lg border shadow-sm overflow-hidden">
                  <img :src="paymentForm.slip_preview" class="w-full h-full object-cover" />
                  <button type="button" class="btn btn-circle btn-error btn-xs absolute top-1 right-1"
                    @click.stop="removeSlip">
                    <span class="icon-[tabler--x] size-3"></span>
                  </button>
                </div>
              </div>
            </div>

            <div class="form-control">
              <label class="label pb-1"><span class="label-text font-medium">ໝາຍເຫດ</span></label>
              <textarea v-model="paymentForm.remarks" class="textarea textarea-bordered h-16"
                placeholder="ລາຍລະອຽດການຊຳລະ..."></textarea>
            </div>
          </div>

          <div class="modal-action mt-6 border-t pt-4">
            <button class="btn btn-ghost" @click="showPaymentModal = false" :disabled="isProcessing">ຍົກເລີກ</button>
            <button class="btn btn-success text-white w-32" @click="submitPayment"
              :disabled="isProcessing || paymentForm.amount_received <= 0">
              <span v-if="isProcessing" class="loading loading-spinner"></span>
              <span v-else>ຢືນຢັນການຊຳລະ</span>
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div v-if="showReceiptModal"
        class="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg mx-auto relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4" @click="showReceiptModal = false">
            <span class="icon-[tabler--x] size-5"></span>
          </button>

          <h3 class="font-bold text-xl mb-4 border-b pb-4 flex items-center gap-2 text-primary">
            <span class="icon-[tabler--receipt] size-6"></span> ປະຫວັດການຊຳລະເງິນ
          </h3>

          <div v-if="isReceiptLoading" class="flex justify-center py-8">
            <span class="loading loading-spinner loading-lg text-primary"></span>
          </div>

          <div v-else-if="receiptTransactions.length > 0" class="space-y-4">
            <div v-for="(tx, index) in receiptTransactions" :key="index"
              class="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
              <div class="flex justify-between items-center mb-3 border-b pb-3">
                <span class="text-xs text-gray-500 font-medium">ໃບບິນ: {{ tx.id }}</span>
                <span class="badge badge-success border-0 text-white badge-sm shadow-sm">ສຳເລັດ</span>
              </div>

              <div class="grid grid-cols-2 gap-y-2 text-sm">

                <div class="text-gray-500">ປະເພດການຊຳລະ:</div>
                <div class="font-bold text-right text-indigo-600">
                  <span v-if="tx.transaction_type === 'closing'" class="text-error">ປິດບັນຊີ (Payoff)</span>
                  <span v-else-if="tx.schedule?.installment_no">ງວດທີ {{ tx.schedule.installment_no }}</span>
                  <span v-else>ຊຳລະຄ່າງວດ</span>
                </div>

                <div class="text-gray-500">ວັນທີຊຳລະ:</div>
                <div class="font-medium text-right">{{ formatDate(tx.paid_at || tx.createdAt) }}</div>

                <div class="text-gray-500 mt-1">ຍອດເງິນທີ່ຈ່າຍລວມ:</div>
                <div class="font-bold text-right text-primary text-lg">{{ formatPrice(tx.amount_paid) }} ກີບ</div>

                <template v-if="parseAllocation(tx.remarks) as any">
                  <div
                    class="col-span-2 bg-white dark:bg-gray-800 rounded-lg p-3 mt-2 mb-2 border border-dashed border-gray-300 shadow-sm">
                    <div class="text-[11px] font-bold text-gray-400 mb-2 border-b pb-1 uppercase tracking-wider">
                      ລາຍລະອຽດການແບ່ງຕັດຍອດ:</div>
                    <div class="flex justify-between mb-1">
                      <span class="text-xs text-gray-600 dark:text-gray-400">ຕັດຕົ້ນທຶນ:</span>
                      <span class="text-xs font-medium text-blue-600">
                        {{ formatPrice(parseAllocation(tx.remarks)?.principal_paid || 0) }} ₭
                      </span>
                    </div>
                    <div class="flex justify-between mb-1">
                      <span class="text-xs text-gray-600 dark:text-gray-400">ຕັດດອກເບ້ຍ:</span>
                      <span class="text-xs font-medium text-orange-500">
                        {{ formatPrice(parseAllocation(tx.remarks)?.interest_paid || 0) }} ₭
                      </span>
                    </div>
                    <div v-if="(parseAllocation(tx.remarks)?.penalty_paid || 0) > 0" class="flex justify-between mb-1">
                      <span class="text-xs text-error">ຕັດຄ່າປັບໃໝ:</span>
                      <span class="text-xs font-bold text-error">
                        {{ formatPrice(parseAllocation(tx.remarks)?.penalty_paid || 0) }} ₭
                      </span>
                    </div>
                    <div v-if="parseAllocation(tx.remarks)?.note" class="mt-2 pt-2 border-t text-[11px] text-gray-500">
                      <span class="font-semibold">ໝາຍເຫດ:</span> {{ parseAllocation(tx.remarks)?.note }}
                    </div>
                  </div>
                </template>

                <div class="text-gray-500">ຊ່ອງທາງ:</div>
                <div class="font-medium text-right">
                  {{ tx.payment_channel === 'bank_transfer' ? 'ໂອນເງິນ' : 'ເງິນສົດ' }}
                </div>

                <div class="text-gray-500">ຜູ້ຮັບເງິນ:</div>
                <div class="font-medium text-right">{{ tx.recorded_by_user?.full_name || tx.recorded_by_user?.username
                  || 'ລະບົບ' }}
                </div>
              </div>

              <div v-if="tx.proof_url" class="mt-4 pt-3 border-t text-center">
                <a :href="tx.proof_url" target="_blank" class="btn btn-sm btn-outline btn-info w-full shadow-sm">
                  <span class="icon-[tabler--photo] size-4 mr-1"></span> ເບິ່ງຮູບສະລິບໂອນເງິນ
                </a>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-12 text-gray-400">
            <div class="flex flex-col items-center">
              <span class="icon-[tabler--file-off] size-12 mb-2 opacity-50"></span>
              <span>ບໍ່ພົບຂໍ້ມູນປະຫວັດການຊຳລະເງິນສຳລັບສັນຍານີ້.</span>
            </div>
          </div>

          <div class="mt-6 border-t pt-4">
            <button class="btn btn-secondary w-full" @click="showReceiptModal = false">ປິດໜ້າຈໍ</button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, toRaw, watch } from 'vue'
import { formatPrice } from '@/utils/formatters'
import { alert } from '@/utils/alert'
import apiClient from '@/api/apiclient'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { useLoanApplicationStore } from '@/stores/loanApplication'
import { usePermissionStore } from '@/stores/permission' // 🌟 1. Import Permission Store
import type { LoanApplication } from '@/types/loanApplication'
import { LoanApplicationStatus } from '@/types/loanApplication';

const loanAppStore = useLoanApplicationStore()
const permissionStore = usePermissionStore() // 🌟 2. ປະກາດໃຊ້ Store

const isLoading = computed(() => loanAppStore.isLoading)
const isScheduleLoading = ref(false)
const isProcessing = ref(false)
const searchQuery = ref('')
const statusFilter = ref('active')
const currentSchedules = ref<any[]>([])

const currentPage = ref(1)
const pageSize = ref(10)
const debouncedSearch = ref('')
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const showRepaymentHub = ref(false)
const showPaymentModal = ref(false)
const selectedLoan = ref<LoanApplication | null>(null)
const selectedSchedule = ref<any | null>(null)
const isEarlyPayoff = ref(false)
const slipInput = ref<HTMLInputElement | null>(null);

const showReceiptModal = ref(false);
const isReceiptLoading = ref(false);
const receiptTransactions = ref<any[]>([]);

// 🌟 3. Computed Property ສຳລັບກວດສອບສິດການຊຳລະເງິນ (RBAC)
const canManagePayment = computed(() => {
  return permissionStore.hasPermission('payment_create') || permissionStore.hasPermission('loan_edit');
});

const paymentForm = reactive({
  expected_principal: 0,
  expected_interest: 0,
  expected_penalty: 0,
  payoff_months_to_charge: 5,
  base_monthly_interest: 0,
  amount_received: 0,
  discount_given: 0,
  payment_method: 'cash',
  payment_date: new Date().toISOString().split('T')[0],
  reference_number: '',
  remarks: '',
  installment_number: 0,
  slip_file: null as File | null,
  slip_preview: '' as string
})

const statusConfig: Record<string, { class: string, text: string }> = {
  paid: { class: 'bg-emerald-500 text-white', text: 'ຊຳລະແລ້ວ' },
  unpaid: { class: 'bg-warning text-white', text: 'ລໍຖ້າຊຳລະ' },
  partial: { class: 'bg-info text-white', text: 'ຈ່າຍບາງສ່ວນ' },
  overdue: { class: 'bg-error text-white', text: 'ກາຍກຳນົດ' }
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

const formatCurrencyInput = (val: number) => val ? val.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '0';

const getCustomerName = (loan: LoanApplication) => {
  return `${loan.customer?.first_name || ''} ${loan.customer?.last_name || ''}`.trim() || 'ບໍ່ມີຊື່';
}

const getCustomerPhone = (loan: LoanApplication) => {
  return loan.customer?.phone || '-';
}

const getContractNumber = (loan: any): string => {
  if (loan && loan.loan_contracts && loan.loan_contracts.length > 0) {
    return loan.loan_contracts[0].loan_contract_number || '-';
  }
  return '-';
};

const parseAllocation = (remarks: string | null) => {
  if (!remarks) return null;
  try {
    const parsed = JSON.parse(remarks);
    if (parsed && typeof parsed === 'object' && ('principal_paid' in parsed || 'interest_paid' in parsed)) {
      return {
        principal_paid: Number(parsed.principal_paid) || 0,
        interest_paid: Number(parsed.interest_paid) || 0,
        penalty_paid: Number(parsed.penalty_paid) || 0,
        note: parsed.note || ''
      };
    }
  } catch (e) {
  }
  return null;
}

const triggerSlipUpload = () => {
  if (slipInput.value) slipInput.value.click();
}

const recalculatePayoffInterest = () => {
  paymentForm.expected_interest = paymentForm.base_monthly_interest * paymentForm.payoff_months_to_charge;
  paymentForm.amount_received = paymentForm.expected_principal + paymentForm.expected_interest + paymentForm.expected_penalty;
}

const handleSlipUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      alert.error('ຂະໜາດໄຟລ໌ຕ້ອງນ້ອຍກວ່າ 2MB');
      return;
    }
    paymentForm.slip_file = file;
    paymentForm.slip_preview = URL.createObjectURL(file);
  }
}

const removeSlip = () => {
  paymentForm.slip_file = null;
  paymentForm.slip_preview = '';
  if (slipInput.value) slipInput.value.value = '';
}

const calculatedTotalExpected = computed(() => {
  return Math.max(0, (paymentForm.expected_principal + paymentForm.expected_interest + paymentForm.expected_penalty) - paymentForm.discount_given);
});

const waterfallPreview = computed(() => {
  let remainingCash = paymentForm.amount_received || 0;
  let actualPenalty = Math.max(0, paymentForm.expected_penalty - paymentForm.discount_given);
  let remainingDiscount = Math.max(0, paymentForm.discount_given - paymentForm.expected_penalty);
  let actualInterest = Math.max(0, paymentForm.expected_interest - remainingDiscount);
  const penaltyAllocated = Math.min(remainingCash, actualPenalty);
  remainingCash -= penaltyAllocated;
  const interestAllocated = Math.min(remainingCash, actualInterest);
  remainingCash -= interestAllocated;
  const principalAllocated = Math.min(remainingCash, paymentForm.expected_principal);
  remainingCash -= principalAllocated;
  return { penalty: penaltyAllocated, interest: interestAllocated, principal: principalAllocated, overpay: remainingCash };
});

const handleCurrencyInputGeneric = (field: keyof typeof paymentForm, e: Event) => {
  const target = e.target as HTMLInputElement;
  const rawValue = target.value.replace(/,/g, '').replace(/[^\d]/g, '');
  (paymentForm as any)[field] = Number(rawValue) || 0;
  target.value = formatCurrencyInput((paymentForm as any)[field]);
};

const handleAmountInput = (e: Event) => handleCurrencyInputGeneric('amount_received', e);
const handleDiscountInput = (e: Event) => handleCurrencyInputGeneric('discount_given', e);

const hasApprovedDelivery = (loan: any): boolean => {
  if (!loan) return false;
  if (loan.document_signatures !== undefined) {
    if (Array.isArray(loan.document_signatures)) {
      return loan.document_signatures.some((sig: any) => sig.document_type === 'delivery_note' && sig.status === 'signed');
    }
    return false;
  }
  if (loan.delivery_receipt) {
    if (Array.isArray(loan.delivery_receipt)) return loan.delivery_receipt.some((receipt: any) => receipt.status === 'approved');
    else if (typeof loan.delivery_receipt === 'object') return loan.delivery_receipt.status === 'approved';
  }
  if (loan.delivery_receipts) {
    if (Array.isArray(loan.delivery_receipts)) return loan.delivery_receipts.some((receipt: any) => receipt.status === 'approved');
    else if (typeof loan.delivery_receipts === 'object') return loan.delivery_receipts.status === 'approved';
  }
  return false;
}

const debounceSearch = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    debouncedSearch.value = searchQuery.value
    currentPage.value = 1
  }, 300)
}

const filteredLoans = computed(() => {
  let loans = loanAppStore.loanApplications || [];
  loans = loans.filter((loan: any) => loan.status === 'disbursed' || loan.status === 'active');

  if (debouncedSearch.value) {
    const q = debouncedSearch.value.toLowerCase();
    loans = loans.filter((loan: any) =>
      getCustomerName(loan).toLowerCase().includes(q) ||
      (loan.customer?.phone || '').includes(q) ||
      (loan.loan_id || loan.id?.toString()).toLowerCase().includes(q) ||
      getContractNumber(loan).toLowerCase().includes(q)
    );
  }

  return loans;
});

const displayedLoans = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredLoans.value.slice(start, end);
});

const totalLoans = computed(() => filteredLoans.value.length);
const totalPages = computed(() => Math.ceil(totalLoans.value / pageSize.value) || 1);
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value + 1);
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, totalLoans.value));
const hasPreviousPage = computed(() => currentPage.value > 1);
const hasNextPage = computed(() => currentPage.value < totalPages.value);

const previousPage = () => {
  if (hasPreviousPage.value) currentPage.value--;
};

const nextPage = () => {
  if (hasNextPage.value) currentPage.value++;
};

watch(pageSize, () => {
  currentPage.value = 1;
});

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

const viewReceipt = async (schedule: any) => {
  showReceiptModal.value = true;
  isReceiptLoading.value = true;
  receiptTransactions.value = [];

  try {
    const response = await apiClient.get(`/repayments/transactions/application/${schedule.application_id}`);

    if (response.data && response.data.data) {
      receiptTransactions.value = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
    }
  } catch (error) {
    console.error('Failed to fetch receipt:', error);
    alert.error('ເກີດຂໍ້ຜິດພາດ', 'ບໍ່ສາມາດດຶງຂໍ້ມູນໃບບິນໄດ້ (API ອາດຍັງບໍ່ຮອງຮັບ)');
  } finally {
    isReceiptLoading.value = false;
  }
};

const fetchLoans = async () => {
  try {
    await loanAppStore.fetchLoanApplications({ is_confirmed: 1, status: LoanApplicationStatus.DISBURSED, limit: 1000 });
  } catch (error: any) {
    alert.error('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້', error.message);
  }
}

// 🌟 ແກ້ໄຂບັກການ Export (CSV) ໃຊ້ filteredLoans ແລະ ຄຳນວນຍອດເງິນໃຫ້ກົງກັບໜ້າຈໍ
const exportToCSV = () => {
  if (!filteredLoans.value.length) {
    alert.warning('ບໍ່ມີຂໍ້ມູນ', 'ບໍ່ມີຂໍ້ມູນສຳລັບ Export');
    return;
  }
  const csvData = filteredLoans.value.map(loan => {
    const netAmount = (Number(loan.total_amount) || 0) - (Number(loan.down_payment) || 0);
    return {
      'ເລກທີ່ສິນເຊື່ອ': loan.loan_id || loan.id || '-',
      'ເລກທີ່ສັນຍາ': getContractNumber(loan),
      'ຊື່ລູກຄ້າ': getCustomerName(loan),
      'ເບີໂທ': getCustomerPhone(loan),
      'ຍອດຈັດສິນເຊື່ອ': formatPrice(netAmount),
      'ຄ່າຜ່ອນ/ງວດ': formatPrice(Number(loan.monthly_pay) || 0),
      'ສະຖານະ': loan.status === 'disbursed' ? 'ອະນຸມັດແລ້ວ' : loan.status,
      'ມອບຮັບສິນຄ້າແລ້ວ': hasApprovedDelivery(loan) ? 'ແມ່ນ' : 'ຍັງບໍ່ມອບຮັບ'
    };
  });
  const csv = Papa.unparse(csvData);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `repayment_list_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}

// 🌟 ແກ້ໄຂບັກການ Export (Excel) ສົ່ງເປັນ Number ໃຫ້ Excel ໄປບວກລົບກັນໄດ້
const exportToExcel = () => {
  if (!filteredLoans.value.length) {
    alert.warning('ບໍ່ມີຂໍ້ມູນ', 'ບໍ່ມີຂໍ້ມູນສຳລັບ Export');
    return;
  }
  const excelData = filteredLoans.value.map(loan => {
    const netAmount = (Number(loan.total_amount) || 0) - (Number(loan.down_payment) || 0);
    return {
      'ເລກທີ່ສິນເຊື່ອ': loan.loan_id || loan.id || '-',
      'ເລກທີ່ສັນຍາ': getContractNumber(loan),
      'ຊື່ລູກຄ້າ': getCustomerName(loan),
      'ເບີໂທ': getCustomerPhone(loan),
      'ຍອດຈັດສິນເຊື່ອ (ກີບ)': netAmount, // ສົ່ງເປັນ Number ລ້າໆ
      'ຄ່າຜ່ອນ/ງວດ (ກີບ)': Number(loan.monthly_pay) || 0, // ສົ່ງເປັນ Number ລ້າໆ
      'ສະຖານະ': loan.status === 'disbursed' ? 'ອະນຸມັດແລ້ວ' : loan.status,
      'ມອບຮັບສິນຄ້າແລ້ວ': hasApprovedDelivery(loan) ? 'ແມ່ນ' : 'ຍັງບໍ່ມອບຮັບ'
    };
  });
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Repayments');
  XLSX.writeFile(workbook, `repayment_list_${new Date().toISOString().split('T')[0]}.xlsx`);
}

const openRepaymentHub = async (loan: LoanApplication) => {
  currentSchedules.value = [];
  selectedSchedule.value = null;
  isEarlyPayoff.value = false;
  selectedLoan.value = loan;
  showRepaymentHub.value = true;
  isScheduleLoading.value = true;

  try {
    const res = await loanAppStore.fetchRepaymentSchedule(loan.id);
    const data = res?.data || res || [];
    currentSchedules.value = Array.isArray(data) ? data : [];
  } catch (error: any) {
    alert.error('ເກີດຂໍ້ຜິດພາດ', 'ບໍ່ສາມາດໂຫຼດຕາຕະລາງການຜ່ອນຊຳລະໄດ້');
    currentSchedules.value = [];
  } finally {
    isScheduleLoading.value = false;
  }
}

const closeRepaymentHub = () => {
  showRepaymentHub.value = false;
  selectedLoan.value = null;
  currentSchedules.value = [];
}

const openPaymentModal = async (schedule: any | null, earlyPayoff = false) => {
  if (!canManagePayment.value) return; // 🌟 ປ້ອງກັນໄວ້ອີກຊັ້ນ

  isEarlyPayoff.value = earlyPayoff;
  selectedSchedule.value = schedule;

  if (earlyPayoff) {
    try {
      isProcessing.value = true;
      const res = await apiClient.get(`repayments/early-payoff/${selectedLoan.value?.id}`);
      const payoffData = res.data.data;

      const unpaidSchedules = currentSchedules.value.filter(s => s.payment_status !== 'paid');
      const remainingCount = unpaidSchedules.length;
      const monthlyInt = Number(unpaidSchedules[0]?.interest_amount || 0);

      let defaultChargeMonths = remainingCount > 6 ? 5 : remainingCount;

      Object.assign(paymentForm, {
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        reference_number: '',
        remarks: 'ປິດບັນຊີກ່ອນກຳນົດ (Early Payoff)',
        expected_principal: Number(payoffData.remaining_principal),
        expected_penalty: Number(payoffData.total_penalty),
        base_monthly_interest: monthlyInt,
        payoff_months_to_charge: defaultChargeMonths,
        discount_given: 0,
        installment_number: 0
      });

      recalculatePayoffInterest();
      showPaymentModal.value = true;
    } catch (error: any) {
      alert.error('ເກີດຂໍ້ຜິດພາດ', error.response?.data?.message || 'ບໍ່ສາມາດຄຳນວນຍອດປິດບັນຊີໄດ້');
    } finally {
      isProcessing.value = false;
    }
  } else {
    const expectedPrincipal = (Number(schedule.principal_amount) || 0) - (Number(schedule.paid_principal) || 0);
    const expectedInterest = (Number(schedule.interest_amount) || 0) - (Number(schedule.paid_interest) || 0);
    const expectedPenalty = (Number(schedule.penalty) || 0) - (Number(schedule.paid_penalty) || 0);
    const totalOwed = expectedPrincipal + expectedInterest + expectedPenalty;

    Object.assign(paymentForm, {
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      reference_number: '',
      remarks: '',
      expected_principal: Math.max(0, expectedPrincipal),
      expected_interest: Math.max(0, expectedInterest),
      expected_penalty: Math.max(0, expectedPenalty),
      amount_received: totalOwed,
      discount_given: 0,
      installment_number: schedule.installment_no
    });

    showPaymentModal.value = true;
  }
}

const submitPayment = async () => {
  if (!canManagePayment.value) return; // 🌟 ປ້ອງກັນໄວ້ອີກຊັ້ນ

  if (paymentForm.payment_method === 'transfer' && !paymentForm.slip_file) {
    alert.error('ກະລຸນາແນບຮູບຫຼັກຖານການໂອນເງິນ (Slip)');
    return;
  }
  isProcessing.value = true;
  try {
    const payload = {
      application_id: selectedLoan.value?.id,
      schedule_id: selectedSchedule.value?.id || null,
      is_early_payoff: isEarlyPayoff.value,
      payoff_interest_months: isEarlyPayoff.value ? paymentForm.payoff_months_to_charge : null,
      amount_paid: paymentForm.amount_received,
      discount_amount: paymentForm.discount_given,
      payment_method: paymentForm.payment_method,
      payment_date: paymentForm.payment_date,
      reference_number: paymentForm.reference_number,
      remarks: paymentForm.remarks
    };

    const response = await apiClient.post('/repayments/pay', payload);
    const transactionId = response.data?.data?.receipt?.id;

    if (paymentForm.payment_method === 'transfer' && paymentForm.slip_file && transactionId) {
      try {
        const formData = new FormData();
        formData.append('file', toRaw(paymentForm.slip_file));
        await apiClient.post(`/upload/payment/${transactionId}/proof`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } catch (uploadErr) {
        console.error('Failed to upload slip:', uploadErr);
        alert.error('ຕັດຍອດສຳເລັດ! ແຕ່ການອັບໂຫຼດຮູບສະລິບຂັດຂ້ອງ. ກະລຸນາອັບໂຫຼດໃໝ່ພາຍຫຼັງ.');
      }
    }

    if (response.data?.data?.change > 0) {
      alert.info(`ບັນທຶກສຳເລັດ! ມີເງິນທອນຄືນລູກຄ້າ: ${formatPrice(response.data.data.change)} ກີບ`);
    } else {
      alert.success('ບັນທຶກການຊຳລະເງິນສຳເລັດແລ້ວ!');
    }

    removeSlip();
    showPaymentModal.value = false;

    if (selectedLoan.value) {
      await openRepaymentHub(selectedLoan.value);
    }
  } catch (error: any) {
    alert.error('ເກີດຂໍ້ຜິດພາດໃນການຊຳລະ', error.response?.data?.message || error.message);
  } finally {
    isProcessing.value = false;
  }
}

onMounted(() => {
  fetchLoans();
});

const canPaySchedule = (scheduleIndex: number) => {
  if (scheduleIndex === 0) return true;
  const previousSchedule = currentSchedules.value[scheduleIndex - 1];
  return previousSchedule && previousSchedule.payment_status === 'paid';
}

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
    console.error('Failed to fetch receipts:', error);
    alert.error('ເກີດຂໍ້ຜິດພາດ', 'ບໍ່ສາມາດດຶງຂໍ້ມູນໃບບິນໄດ້');
  } finally {
    isReceiptLoading.value = false;
  }
};
</script>
