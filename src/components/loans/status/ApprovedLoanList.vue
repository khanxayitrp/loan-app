<template>
  <div class="p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ສິນເຊື່ອທີ່ອະນຸມັດແລ້ວ</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">ຈັດການສິນເຊື່ອທີ່ໄດ້ຮັບການອະນຸມັດແລ້ວ</p>
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
        <input v-model="searchQuery" type="text" placeholder="ຊື່ລູກຄ້າ, ເບີໂທ, ເລກທີ່..."
          class="input input-bordered w-full" @input="debounceSearch" />
      </div>

      <div>
        <label class="label">
          <span class="label-text text-sm font-medium">ສະຖານະການຈ່າຍເງິນ</span>
        </label>
        <select v-model="disbursementFilter" class="select select-bordered w-full">
          <option value="">ທັງໝົດສະຖານະ</option>
          <option value="pending_disbursement">ຍັງບໍ່ໄດ້ຈ່າຍເງິນ (Approved)</option>
          <option value="disbursed">ຈ່າຍເງິນແລ້ວ (Disbursed)</option>
        </select>
      </div>

      <div>
        <label class="label">
          <span class="label-text text-sm font-medium">ວັນທີ່ອະນຸມັດ</span>
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
            <th>ເລກທີ່ສິນເຊື່ອ</th>
            <th>ລູກຄ້າ</th>
            <th>ເບີໂທ</th>
            <th>ຈຳນວນເງິນ</th>
            <th>ດອກເບ້ຍ (%)</th>
            <th>ໄລຍະເວລາ</th>
            <th>ສະຖານະການຈ່າຍ</th>
            <th>ຜູ້ອະນຸມັດ</th>
            <th>ວັນທີ່ອະນຸມັດ</th>
            <th class="w-40">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="loan in displayedLoans" :key="loan.id">
            <td class="font-mono text-gray-600 dark:text-gray-400">{{ loan.loan_id }}</td>

            <td class="font-medium">{{ getCustomerName(loan) }}</td>

            <td>{{ getCustomerPhone(loan) }}</td>

            <td class="font-medium text-primary">{{ formatPrice(Number(loan.total_amount) || 0) }}</td>

            <td>{{ loan.interest_rate_at_apply }}%</td>

            <td>{{ loan.loan_period }} ເດືອນ</td>

            <td>
              <span class="badge badge-soft" :class="getDisbursementBadgeClass(loan)">
                {{ getDisbursementStatusText(loan) }}
              </span>
            </td>

            <td>{{ loan.approver?.username || '-' }}</td>

            <td>{{ formatDate(loan.approved_at || (loan as any).updatedAt || (loan as any).createdAt || '') }}</td>

            <td>
              <div class="flex gap-2">
                <!-- ປຸ່ມເບິ່ງລາຍລະອຽດ -->
                <button class="btn btn-circle btn-text btn-sm" @click="viewLoanDetails(loan)" aria-label="View details">
                  <span class="icon-[tabler--eye] size-4"></span>
                </button>

                <!-- 🌟 ປຸ່ມຈັດການລາຍເຊັນ -->
                <button v-if="hasContract(loan)" class="btn btn-circle btn-text btn-sm text-indigo-500 hover:bg-indigo-50"
                  @click="openSignatureModal(loan)" aria-label="Manage signatures">
                  <span class="icon-[tabler--signature] size-4"></span>
                </button>

                <!-- ປຸ່ມຈັດການໃບມອບຮັບ -->
                <!-- <button class="btn btn-circle btn-text btn-sm text-fuchsia-600 hover:bg-fuchsia-50" 
                  @click="openDeliveryNoteModal(loan)" aria-label="Manage delivery note">
                  <span class="icon-[tabler--file-invoice] size-4"></span>
                </button> -->

                <!-- ປຸ່ມປ່ອຍສິນເຊື່ອ (ຈ່າຍເງິນ) -->
                <!-- <button v-if="loan.status === 'approved' && hasApprovedDeliveryNote(loan)"
                  class="btn btn-circle btn-text btn-sm text-success hover:bg-success/10" @click="disburseLoan(loan)"
                  aria-label="Disburse payment">
                  <span class="icon-[tabler--currency-dollar] size-4"></span>
                </button> -->
              </div>
            </td>
          </tr>

          <tr v-if="displayedLoans.length === 0">
            <td colspan="10" class="text-center py-8 text-base-content/60">
              ບໍ່ພົບຂໍ້ມູນສິນເຊື່ອທີ່ອະນຸມັດແລ້ວ
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

        <span class="px-2">
          ໜ້າ {{ currentPage }} / {{ totalPages }}
        </span>

        <button class="btn btn-sm" :disabled="!hasNextPage" @click="nextPage">
          ຖັດໄປ
        </button>
      </div>
    </div>

    <!-- Details Modal -->
    <teleport to="body">
      <div v-if="showDetailsModal && selectedLoan"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold">ລາຍລະອຽດສິນເຊື່ອທີ່ອະນຸມັດແລ້ວ</h3>
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
                <span class="badge badge-soft mt-1"
                  :class="selectedLoan.status === 'disbursed' ? 'badge-success' : 'badge-info'">
                  {{ selectedLoan.status === 'disbursed' ? 'ຈ່າຍເງິນແລ້ວ' : 'ອະນຸມັດແລ້ວ' }}
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
                  <span class="badge badge-soft mt-1"
                    :class="(selectedLoan as any).delivery_receipt.status === 'approved' ? 'badge-success' : 'badge-warning'">
                    {{ (selectedLoan as any).delivery_receipt.status === 'approved' ? 'ອະນຸມັດແລ້ວ' :
                      'ລໍຖ້າການອະນຸມັດ' }}
                  </span>
                </div>
              </div>
            </div>

            <div v-else class="border-t pt-4 mt-2">
              <div class="alert alert-warning shadow-sm">
                <span class="icon-[tabler--alert-circle] size-5"></span>
                <span>ຍັງບໍ່ມີຂໍ້ມູນການມອບຮັບສິນຄ້າ</span>
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

          <div class="flex justify-end gap-3 mt-6 border-t pt-4">
            <!-- 🌟 ເພີ່ມປຸ່ມເບິ່ງຕາຕະລາງ ແລະ ຮ່າງສັນຍາ ຢູ່ບ່ອນນີ້ -->
            <button class="btn btn-outline btn-warning" @click="openScheduleModal(selectedLoan)">
              <span class="icon-[tabler--calendar-stats] size-4 mr-1"></span> ຕາຕະລາງຜ່ອນ
            </button>
            
            <button class="btn btn-outline btn-info" @click="openDraftContractModal">
              <span class="icon-[tabler--file-certificate] size-4 mr-1"></span> ເບິ່ງຮ່າງສັນຍາ
            </button>

            <button class="btn btn-soft btn-secondary w-full sm:w-auto" @click="closeDetailsModal">
              ປິດ
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- 🌟 Modal ສຳລັບສະແດງຮ່າງສັນຍາ (Read-Only) -->
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
          
          <!-- ເອີ້ນໃຊ້ Component ສັນຍາ ແບບ Read-only -->
          <LoanContractForm 
            v-if="selectedContract"
            :loan-contract-id="selectedLoan?.id" 
            :loan-application="selectedLoan"
            :loan-contract="selectedContract" 
            :is-editing="false" 
            :view-only="true"
            @cancel-edit="showContractModal = false"
          />
          <div v-else class="text-center py-8 text-gray-500">
            <div class="loading loading-spinner loading-md"></div>
            <p class="mt-2">ກຳລັງໂຫຼດຂໍ້ມູນສັນຍາ...</p>
          </div>
        </div>
      </div>
    </teleport>

    <!-- 🌟 Modal ສຳລັບສະແດງຕາຕະລາງຜ່ອນຊຳລະ -->
    <LoanScheduleModal 
      :show="showScheduleModal" 
      :loan="loanForSchedule" 
      :view-only="true"
      @close="showScheduleModal = false; loanForSchedule = null" 
    />

    <!-- Delivery Note Modal -->
    <teleport to="body">
      <div v-if="showDeliveryNoteModal && loanForDeliveryNote"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
          <!-- ໂຄດໃນ Modal ໃບຮັບເຄື່ອງຄືເກົ່າ -->
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold">
              {{ deliveryReceiptStore.currentReceipt ? 'ຈັດການໃບມອບຮັບສິນຄ້າ' : 'ສ້າງໃບມອບຮັບສິນຄ້າ' }}
            </h3>
            <button @click="closeDeliveryNoteModal" class="text-gray-400 hover:text-gray-600">
              <span class="icon-[tabler--x] size-5"></span>
            </button>
          </div>

          <div v-if="isLoadingDeliveryNote" class="text-center py-8">
            <span class="loading loading-spinner"></span>
            <p class="text-sm text-gray-500 mt-2">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
          </div>

          <form v-else @submit.prevent="saveDeliveryNote" class="space-y-4">
            <div class="form-control">
              <label class="label"><span class="label-text font-medium">ເລກທີ່ໃບມອບຮັບ *</span></label>
              <input v-model="deliveryNoteForm.note_number" type="text" placeholder="ປ້ອນເລກທີ່ໃບມອບຮັບ"
                class="input input-bordered w-full" disabled />
              <p v-if="!deliveryReceiptStore.currentReceipt" class="text-xs text-gray-500 mt-1">ລະບົບສ້າງໃຫ້ອັດຕະໂນມັດ
              </p>
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-medium">ຊື່ຜູ້ຮັບ *</span></label>
              <input v-model="deliveryNoteForm.recipient_name" type="text" placeholder="ປ້ອນຊື່ຜູ້ຮັບ"
                class="input input-bordered w-full" :disabled="isEditingDisabled" required />
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-medium">ເບີໂທຜູ້ຮັບ</span></label>
              <input v-model="deliveryNoteForm.recipient_phone" type="tel" placeholder="ອ້າງອີງຈາກຂໍ້ມູນລູກຄ້າ"
                class="input input-bordered w-full bg-gray-50" readonly />
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-medium">ທີ່ຢູ່ຈັດສົ່ງ</span></label>
              <textarea v-model="deliveryNoteForm.delivery_address" placeholder="ອ້າງອີງຈາກຂໍ້ມູນລູກຄ້າ"
                class="textarea textarea-bordered w-full min-h-24 bg-gray-50" readonly></textarea>
            </div>

            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-4">
                <input type="checkbox" v-model="deliveryNoteForm.approved" class="checkbox checkbox-primary"
                  :disabled="!canApproveDeliveryNote" />
                <span class="label-text font-medium">ອະນຸມັດໃບມອບຮັບສິນຄ້າ</span>
              </label>
              <p v-if="!canApproveDeliveryNote" class="text-xs text-gray-500 mt-1">
                {{ approvalDisabledMessage }}
              </p>
            </div>

            <div class="flex flex-col sm:flex-row justify-end gap-3 mt-6 border-t pt-4">
              <button type="button" class="btn btn-soft btn-secondary" @click="closeDeliveryNoteModal">
                ຍົກເລີກ
              </button>

              <button v-if="hasDeliveryNote" type="button" class="btn btn-outline btn-primary"
                @click="printDeliveryNote" :disabled="isPrintingDeliveryNote || isSavingDeliveryNote">
                <span v-if="isPrintingDeliveryNote" class="loading loading-spinner loading-xs mr-1"></span>
                <span v-else class="icon-[tabler--printer] size-4 mr-1"></span>
                {{ isPrintingDeliveryNote ? 'ກຳລັງພິມ...' : 'ພິມໃບມອບຮັບ' }}
              </button>

              <button type="submit" class="btn btn-primary" :disabled="isSavingDeliveryNote || isSaveDisabled">
                <span v-if="isSavingDeliveryNote" class="loading loading-spinner loading-xs"></span>
                <span v-else>
                  {{ deliveryReceiptStore.currentReceipt ? 'ບັນທຶກການປ່ຽນແປງ' : 'ສ້າງໃບມອບຮັບ' }}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </teleport>

    <!-- Disburse Modal -->
    <teleport to="body">
      <div v-if="showDisburseModal && loanToDisburse"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
          <h3 class="font-bold text-lg mb-4 text-primary flex items-center gap-2">
            <span class="icon-[tabler--currency-dollar] size-6"></span> ຈ່າຍເງິນສິນເຊື່ອ
          </h3>
          <p class="py-4 text-gray-700 dark:text-gray-300">
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການຈ່າຍເງິນ <strong class="text-primary">{{
              formatPrice(Number(loanToDisburse.total_amount) || 0) }}</strong>
            ໃຫ້ "{{ (loanToDisburse as any).disbursement_recipient || getCustomerName(loanToDisburse) }}" ?
          </p>

          <div class="flex justify-end gap-3 mt-6 border-t pt-4">
            <button class="btn btn-soft btn-secondary" @click="showDisburseModal = false">
              ຍົກເລີກ
            </button>
            <button class="btn btn-primary" @click="confirmDisburseLoan">
              ຍືນຍັນການຈ່າຍເງິນ
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- 🌟 Modal ສຳລັບຈັດການລາຍເຊັນ (External Signature) -->
    <ExternalSignatureModal 
  :is-open="showSignatureModal" 
  :loan-id="loanForSignature?.id ?? null"
  @close="showSignatureModal = false; loanForSignature = null" 
  @updated="fetchLoans" 
/>

  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '@/utils/formatters'
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useLoanApplicationStore } from '@/stores/loanApplication'
import { useDeliveryReceiptStore } from '@/stores/delivery_receipt'
import { useLoanContractStore } from '@/stores/loanContract' 
import type { LoanApplication } from '@/types/loanApplication'
import { LoanApplicationStatus } from '@/types/loanApplication'
import Papa from 'papaparse'
import { alert } from '@/utils/alert'
import apiClient from '@/api/apiclient'

// 🟢 ດຶງ Component ທີ່ໃຊ້ສະແດງ Modal ມາໃຊ້ງານ
import LoanContractForm from '@/components/loans/form/LoanContractForm.vue'
import LoanScheduleModal from '@/components/modals/loan/detail/LoanScheduleModal.vue'
import ExternalSignatureModal from '@/components/modals/loan/pending/ExternalSignatureModal.vue' // 🌟 ດຶງ Modal ລາຍເຊັນມາໃຊ້

const loanApplicationStore = useLoanApplicationStore()
const deliveryReceiptStore = useDeliveryReceiptStore()
const loanContractStore = useLoanContractStore() 

// Reactive state
const isLoading = computed(() => loanApplicationStore.isLoading)
const isLoadingDeliveryNote = ref(false)
const isPrintingDeliveryNote = ref(false) 
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const disbursementFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')

// Modal states
const showDetailsModal = ref(false)
const showDeliveryNoteModal = ref(false)
const showDisburseModal = ref(false)
const selectedLoan = ref<LoanApplication | null>(null)
const loanForDeliveryNote = ref<LoanApplication | null>(null)
const loanToDisburse = ref<LoanApplication | null>(null)

// 🟢 ເພີ່ມ State ສຳລັບຕາຕະລາງຜ່ອນ, ຮ່າງສັນຍາ ແລະ ຈັດການລາຍເຊັນ
const showScheduleModal = ref(false);
const loanForSchedule = ref<any>(null);
const showContractModal = ref(false);
const selectedContract = ref<any>(null);
const showSignatureModal = ref(false);
const loanForSignature = ref<LoanApplication | null>(null);

// Delivery note form
const deliveryNoteForm = reactive({
  note_number: '',
  recipient_name: '',
  recipient_phone: '',
  delivery_address: '',
  approved: false
})

const isSavingDeliveryNote = ref(false)

const getCustomerName = (loan: LoanApplication): string => {
  if (!loan.customer) return '-'
  return `${loan.customer.first_name || ''} ${loan.customer.last_name || ''}`.trim()
}
const getCustomerPhone = (loan: LoanApplication): string => {
  return loan.customer?.phone || '-'
}

// 🟢 ຟັງຊັນກວດສອບວ່າສິນເຊື່ອນີ້ມີສັນຍາແລ້ວຫຼືຍັງ (ສຳລັບປຸ່ມຈັດການລາຍເຊັນ)
const hasContract = (loan: any): boolean => {
  return !!(loan.loan_contracts && loan.loan_contracts.length > 0);
};

// 🟢 ຟັງຊັນສຳລັບເປີດ Modal ຈັດການລາຍເຊັນ
const openSignatureModal = (loan: LoanApplication) => {
  loanForSignature.value = loan;
  showSignatureModal.value = true;
};

let debounceTimer: ReturnType<typeof setTimeout> | null = null
const debouncedSearch = ref('')

const debounceSearch = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    debouncedSearch.value = searchQuery.value
    currentPage.value = 1
  }, 300)
}

const applyDateFilter = () => {
  currentPage.value = 1
}

const filteredLoans = computed(() => {
  let filtered = loanApplicationStore.loanApplications

  if (debouncedSearch.value) {
    const query = debouncedSearch.value.toLowerCase()
    filtered = filtered.filter(loan =>
      getCustomerName(loan).toLowerCase().includes(query) ||
      getCustomerPhone(loan).includes(query) ||
      loan.loan_id?.toLowerCase().includes(query)
    )
  }

  // ປັບປຸງ Filter ການຈ່າຍເງິນໃຫ້ໃຊ້ສະຖານະແທ້ຈິງ
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
      const fromDate = dateFrom.value || '1970-01-01'
      const toDate = dateTo.value || '9999-12-31'
      return loanDate >= fromDate && loanDate <= toDate
    })
  }

  return filtered
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

const formatDate = (dateString: string): string => {
  if (!dateString) return '-'
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('lo-LA')
}

// ປ່ຽນໃຫ້ໃຊ້ loan.status ແທນ
const getDisbursementBadgeClass = (loan: any): string => {
  if (['disbursed', 'completed', 'closed'].includes(loan.status)) return 'badge-success'
  return 'badge-warning'
}

// ປ່ຽນໃຫ້ໃຊ້ loan.status ແທນ
const getDisbursementStatusText = (loan: any): string => {
  if (['disbursed', 'completed', 'closed'].includes(loan.status)) return 'ຈ່າຍເງິນແລ້ວ (Disbursed)'
  return 'ຍັງບໍ່ຈ່າຍເງິນ (Approved)'
}

const viewLoanDetails = async (loan: LoanApplication) => {
  try {
    const fullDetails = await loanApplicationStore.fetchLoanApplicationById(loan.id)
    selectedLoan.value = fullDetails || loan
  } catch (error) {
    console.error("Error fetching full loan details", error)
    selectedLoan.value = loan
  }
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedLoan.value = null
}

// ຟັງຊັນສຳລັບເປີດ Modal ເບິ່ງຮ່າງສັນຍາ
const openDraftContractModal = async () => {
  if (!selectedLoan.value) return;
  
  try {
    showContractModal.value = true;
    selectedContract.value = null; 

    const contractRes = await loanContractStore.fetchContract(selectedLoan.value.id);
    const contractData = (contractRes as any)?.data?.data || (contractRes as any)?.data || contractRes;
    
    if (!contractData || Object.keys(contractData).length === 0 || (!contractData.id && !contractData.loan_id)) {
       throw new Error("No Contract");
    }

    selectedContract.value = contractData;

  } catch (error) {
    showContractModal.value = false;
    alert.error('ບໍ່ພົບຂໍ້ມູນ', 'ຍັງບໍ່ມີການສ້າງຮ່າງສັນຍາສຳລັບສິນເຊື່ອນີ້'); 
  }
};

// ຟັງຊັນສຳລັບເປີດ Modal ເບິ່ງຕາຕະລາງຜ່ອນຊຳລະ
const openScheduleModal = async (loan: any) => {
  try {
    let contractData = null;
    try {
      const contractRes = await loanContractStore.fetchContract(loan.id);
      contractData = (contractRes as any)?.data?.data || (contractRes as any)?.data || contractRes;
      
      if (!contractData || Object.keys(contractData).length === 0 || (!contractData.id && !contractData.loan_id)) {
        throw new Error("Contract is empty");
      }
    } catch (e) {
      alert.error('ບໍ່ສາມາດເປີດຕາຕະລາງໄດ້', 'ກະລຸນາສ້າງ "ສັນຍາກູ້ຢືມ" ໃຫ້ລູກຄ້າຮັບຮູ້ເງື່ອນໄຂກ່ອນ!');
      return;
    }

    const fullLoan = await loanApplicationStore.fetchLoanApplicationById(loan.id);
    loanForSchedule.value = fullLoan;
    showScheduleModal.value = true;
    
  } catch (error) {
    alert.error('ເກີດຂໍ້ຜິດພາດ', 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຕາຕະລາງໄດ້');
  }
};

const originalDeliveryNoteData = ref<any>(null)
const originalApprovedStatus = ref(false)

// อัปเดตฟังก์ชันเช็คสถานะใบส่งมอบสินค้าให้ครอบคลุมและถูกต้อง
const hasApprovedDeliveryNote = (loan: any): boolean => {
  if (!loan) return false;

  if (loan.delivery_receipt && loan.delivery_receipt.status === 'approved') {
    return true;
  }

  if (loan.delivery_receipts && loan.delivery_receipts.length > 0) {
    return loan.delivery_receipts[0].status === 'approved';
  }

  return false;
}

const openDeliveryNoteModal = async (loan: LoanApplication) => {
  showDeliveryNoteModal.value = true;
  isLoadingDeliveryNote.value = true;

  try {
    let fullLoanData = loan; 
    try {
      const fetchedLoan = await loanApplicationStore.fetchLoanApplicationById(loan.id);
      if (fetchedLoan) {
        fullLoanData = JSON.parse(JSON.stringify(fetchedLoan));
        if (fullLoanData.customer) {
          const customerAny = fullLoanData.customer as any;
          if (customerAny.customer_work_infos) customerAny.work_info = customerAny.customer_work_infos;
          if (customerAny.customer_locations) customerAny.locations = customerAny.customer_locations;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch full loan details, using basic info', err);
    }

    loanForDeliveryNote.value = fullLoanData;
    const existingReceipt = await deliveryReceiptStore.fetchReceiptByApplicationId(loan.id);

    if (existingReceipt) {
      deliveryNoteForm.note_number = existingReceipt.receipts_id;
      deliveryNoteForm.recipient_name = existingReceipt.receiver_name;
      deliveryNoteForm.approved = existingReceipt.status === 'approved';
      deliveryNoteForm.recipient_phone = getCustomerPhone(fullLoanData);
      deliveryNoteForm.delivery_address = fullLoanData.customer?.address || '';
      originalDeliveryNoteData.value = { receiver_name: existingReceipt.receiver_name };
      originalApprovedStatus.value = existingReceipt.status === 'approved';
    } else {
      let nextReceiptId = '';
      const currentYear = new Date().getFullYear();

      if (typeof deliveryReceiptStore.fetchLatestReceiptId === 'function') {
        const lastReceiptData = await deliveryReceiptStore.fetchLatestReceiptId();
        if (lastReceiptData && lastReceiptData.receipts_id) {
          const parts = lastReceiptData.receipts_id.split('-');
          if (parts.length === 3) {
            const num = parseInt(parts[2] || '0', 10) + 1;
            nextReceiptId = `DR-${currentYear}-${num.toString().padStart(6, '0')}`;
          } else {
            nextReceiptId = `DR-${currentYear}-000001`;
          }
        } else {
          nextReceiptId = `DR-${currentYear}-000001`;
        }
      } else {
        console.warn("fetchLatestReceiptId is not a function in store. Using default ID.");
        nextReceiptId = `DR-${currentYear}-000001`;
      }

      deliveryNoteForm.note_number = nextReceiptId;
      deliveryNoteForm.recipient_name = getCustomerName(fullLoanData);
      deliveryNoteForm.recipient_phone = getCustomerPhone(fullLoanData);
      deliveryNoteForm.delivery_address = fullLoanData.customer?.address || '';
      deliveryNoteForm.approved = false;
      originalDeliveryNoteData.value = null;
      originalApprovedStatus.value = false;
    }
  } catch (error) {
    console.error("Failed to load delivery receipt info", error);
    alert.error('ບໍ່ສາມາດດຶງຂໍ້ມູນໃບມອບຮັບໄດ້');
  } finally {
    isLoadingDeliveryNote.value = false;
  }
}

const closeDeliveryNoteModal = () => {
  showDeliveryNoteModal.value = false;
  loanForDeliveryNote.value = null;
  deliveryReceiptStore.clearCurrentReceipt();
}

const hasDeliveryNote = computed(() => {
  return deliveryReceiptStore.currentReceipt !== null;
})

const isEditingDisabled = computed(() => {
  return deliveryReceiptStore.currentReceipt?.status === 'approved';
})

const canApproveDeliveryNote = computed(() => {
  return deliveryReceiptStore.currentReceipt !== null && deliveryReceiptStore.currentReceipt.status !== 'approved';
})

const isSaveDisabled = computed(() => {
  if (isEditingDisabled.value) return true;
  if (deliveryReceiptStore.currentReceipt && !hasChanges()) return true;
  return false;
})

const approvalDisabledMessage = computed(() => {
  if (!deliveryReceiptStore.currentReceipt) return 'ຕ້ອງສ້າງໃບມອບຮັບກ່ອນຈຶ່ງຈະສາມາດອະນຸມັດໄດ້';
  if (deliveryReceiptStore.currentReceipt.status === 'approved') return 'ໃບມອບຮັບນີ້ໄດ້ຮັບການອະນຸມັດແລ້ວ';
  return '';
})

const hasChanges = (): boolean => {
  if (!deliveryReceiptStore.currentReceipt) return false;
  const currentData = { receiver_name: deliveryNoteForm.recipient_name };
  const hasDataChanges = JSON.stringify(currentData) !== JSON.stringify(originalDeliveryNoteData.value);
  const hasApprovalChanged = deliveryNoteForm.approved !== originalApprovedStatus.value;
  return hasDataChanges || hasApprovalChanged;
}

const saveDeliveryNote = async () => {
  if (!loanForDeliveryNote.value) return;
  isSavingDeliveryNote.value = true;

  try {
    const payload = {
      application_id: loanForDeliveryNote.value.id,
      delivery_date: new Date().toISOString(),
      receiver_name: deliveryNoteForm.recipient_name,
      status: (deliveryNoteForm.approved ? 'approved' : 'pending') as 'pending' | 'approved' | 'rejected',
    };

    if (deliveryReceiptStore.currentReceipt) {
      await deliveryReceiptStore.updateReceipt(deliveryReceiptStore.currentReceipt.id, payload);
      alert.success('ອັບເດດໃບຮັບສິນຄ້າສຳເລັດ');
    } else {
      await deliveryReceiptStore.createReceipt(loanForDeliveryNote.value.id, payload);
      alert.success('ສ້າງໃບຮັບສິນຄ້າສຳເລັດ');
    }

    fetchLoans();
    closeDeliveryNoteModal();
  } catch (error: any) {
    console.error("Save delivery note error:", error);
    alert.error('ເກີດຂໍ້ຜິດພາດ: ' + (error.message || 'ບໍ່ສາມາດບັນທຶກໄດ້'));
  } finally {
    isSavingDeliveryNote.value = false;
  }
}

const printDeliveryNote = async () => {
  if (!deliveryReceiptStore.currentReceipt || !loanForDeliveryNote.value) return;

  isPrintingDeliveryNote.value = true;
  alert.info('ກຳລັງສ້າງເອກະສານ PDF ກະລຸນາລໍຖ້າ...');

  const pdfWindow = window.open('', '_blank');
  if (pdfWindow) {
    pdfWindow.document.write(`
      <html lang="lo">
        <head><title>ກຳລັງໂຫຼດ PDF...</title></head>
        <body style="display:flex; justify-content:center; align-items:center; height:100vh; margin:0; font-family:sans-serif; background-color:#f3f4f6; color:#555;">
          <div style="text-align:center;">
            <h2 style="margin-bottom: 10px;">ກຳລັງສ້າງເອກະສານ PDF...</h2>
            <p>ກະລຸນາລໍຖ້າຈັກໜ່ອຍ, ລະບົບກຳລັງປະມວນຜົນ.</p>
          </div>
        </body>
      </html>
    `);
    pdfWindow.document.close();
  }

  try {
    const loan = loanForDeliveryNote.value;
    const receipt = deliveryReceiptStore.currentReceipt;

    const response = await apiClient.post('/pdf/delivery-receipt', {
      loanData: loan,
      receiptData: receipt,
      receiverPhone: deliveryNoteForm.recipient_phone,
      deliveryAddress: deliveryNoteForm.delivery_address
    }, {
      responseType: 'blob',
      timeout: 60000
    });

    const blobData = response.data instanceof Blob ? response.data : response;
    const file = new Blob([blobData as any], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(file);

    if (pdfWindow) {
      pdfWindow.document.open();
      pdfWindow.document.write(`
        <html>
          <head><title>ໃບມອບຮັບສິນຄ້າ - ${receipt.receipts_id}</title></head>
          <body style="margin:0; padding:0; overflow:hidden;">
            <iframe src="${url}" width="100%" height="100%" style="border:none;"></iframe>
          </body>
        </html>
      `);
      pdfWindow.document.close();
    } else {
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${receipt.receipts_id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    alert.success('ສ້າງ PDF ສຳເລັດແລ້ວ');
  } catch (error: any) {
    console.error('Print Receipt Error:', error);
    if (pdfWindow) pdfWindow.close();
    alert.error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດພິມເອກະສານໄດ້. ກະລຸນາກວດສອບການເຊື່ອມຕໍ່ ຫຼື Router Endpoint.");
  } finally {
    isPrintingDeliveryNote.value = false;
  }
}

const disburseLoan = (loan: LoanApplication) => {
  loanToDisburse.value = loan
  showDisburseModal.value = true
}

const confirmDisburseLoan = async () => {
  if (loanToDisburse.value) {
    console.log("Disbursing loan:", loanToDisburse.value.id)
    alert.info('ແຈ້ງເຕືອນ', 'ການຈ່າຍເງິນສິນເຊື່ອຕ້ອງເຊື່ອມຕໍ່ກັບ API.')
  }
  showDisburseModal.value = false
  loanToDisburse.value = null
}

const exportToCSV = () => {
  if (!displayedLoans.value.length) return

  const csvData = displayedLoans.value.map(loan => ({
    'ເລກທີ່ສິນເຊື່ອ': loan.loan_id,
    'ຊື່ລູກຄ້າ': getCustomerName(loan),
    'ເບີໂທ': getCustomerPhone(loan),
    'ຈຳນວນເງິນ': formatPrice(Number(loan.total_amount) || 0),
    'ດອກເບ້ຍ (%)': loan.interest_rate_at_apply,
    'ໄລຍະເວລາ (ເດືອນ)': loan.loan_period,
    'ສະຖານະການຈ່າຍ': getDisbursementStatusText(loan),
    'ຜູ້ອະນຸມັດ': loan.approver?.username || '-',
    'ວັນທີ່ອະນຸມັດ': formatDate(loan.approved_at || (loan as any).updatedAt || (loan as any).createdAt || '')
  }))

  const csv = Papa.unparse(csvData)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `approved_loans_${new Date().toISOString().split('T')[0]}.csv`
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

// ຟັງຊັນສຳລັບການ Load ຂໍ້ມູນ 
const fetchLoans = () => {
  // ດຶງຂໍ້ມູນສະເພາະສິນເຊື່ອທີ່ approved ແລະ disbursed ເທົ່ານັ້ນ
  loanApplicationStore.fetchLoanApplications({ 
    status: [LoanApplicationStatus.APPROVED, LoanApplicationStatus.DISBURSED] as any, 
    is_confirmed: 1 
  });
}

onMounted(() => {
  fetchLoans();
})
</script>