<template>
  <div class="p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ສິນເຊື່ອລໍຖ້າການອະນຸມັດ</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">ຈັດການຄຳຂໍສິນເຊື່ອທີ່ລໍຖ້າການອະນຸມັດ</p>
      </div>

      <div class="flex gap-2">
        <button @click="showScoringGuideModal = true"
          class="btn btn-outline btn-info btn-sm whitespace-nowrap bg-info/10">
          <span class="icon-[tabler--info-circle] size-4 mr-1"></span> ເກນການໃຫ້ຄະແນນ
        </button>

        <div class="flex items-center gap-2">
          <button @click="exportToCSV" class="btn btn-outline btn-sm whitespace-nowrap">
            <span class="icon-[tabler--file-export] size-4 mr-1"></span> Export CSV
          </button>
          <button @click="exportToExcel" class="btn btn-outline btn-sm whitespace-nowrap btn-success">
            <span class="icon-[tabler--file-spreadsheet] size-4 mr-1"></span> Export Excel
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <label class="label"><span class="label-text text-sm font-medium">ຄົ້ນຫາ</span></label>
        <input v-model="searchQuery" type="text" placeholder="ຊື່ລູກຄ້າ, ເບີໂທ, ເລກທີ່..."
          class="input input-bordered w-full" @input="debounceSearch" />
      </div>

      <div>
        <label class="label"><span class="label-text text-sm font-medium">ວັນທີ່ສ້າງ</span></label>
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
            <th>ຄະແນນສິນເຊື່ອ</th>
            <th>ສະຖານະ</th>
            <th>ວັນທີ່ສ້າງ</th>
            <th class="w-32">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="loan in displayedLoans" :key="loan.id">
            <td class="font-mono text-gray-600 dark:text-gray-400">{{ loan.loan_id }}</td>
            <td class="font-medium">{{ getCustomerName(loan) }}</td>
            <td>{{ getCustomerPhone(loan) }}</td>
            <td class="font-medium">{{ formatPrice(Number(loan.total_amount || 0) - Number(loan.down_payment || 0)) }}
            </td>
            <td>{{ loan.interest_rate_at_apply }}%</td>
            <td>{{ loan.loan_period }} ເດືອນ</td>

            <td>
              <div class="flex items-center gap-2">
                <span class="font-medium" :class="!loan.credit_score ? 'text-gray-400' : ''">{{ loan.credit_score || '-'
                  }}</span>
                <div
                  v-if="loan.status !== 'approved' && loan.status !== 'rejected' && (isSalesOrOfficer || isApproverGroup)"
                  class="tooltip tooltip-top" data-tip="ຄຳນວນຄະແນນ" title="ຄຳນວນຄະແນນ">
                  <button class="btn btn-circle btn-text btn-xs transition-all text-primary hover:bg-primary/10"
                    @click="openCreditScoreModal(loan)">
                    <span class="icon-[tabler--calculator] size-4"></span>
                  </button>
                </div>
              </div>
            </td>

            <td>
              <div class="badge badge-sm border-0 text-white font-medium shadow-sm"
                :class="getStatusBadge(loan.status).class">
                {{ getStatusBadge(loan.status).text }}
              </div>
            </td>

            <td>{{ formatDate(loan.createdAt) }}</td>

            <td>
              <div class="flex gap-2">
                <div class="tooltip tooltip-top" data-tip="ເບິ່ງລາຍລະອຽດ" title="ເບິ່ງລາຍລະອຽດ">
                  <button class="btn btn-circle btn-text btn-sm" @click="viewLoanDetails(loan)">
                    <span class="icon-[tabler--eye] size-4"></span>
                  </button>
                </div>

                <div v-if="hasContract(loan) && (isSalesOrOfficer || isManager)" class="tooltip tooltip-top"
                  data-tip="ຈັດການລາຍເຊັນເອກະສານ (ລູກຄ້າ/ນາຍບ້ານ)" title="ຈັດການລາຍເຊັນເອກະສານ (ລູກຄ້າ/ນາຍບ້ານ)">
                  <button class="btn btn-circle btn-text btn-sm text-indigo-500 hover:bg-indigo-50"
                    @click="openSignatureModal(loan)">
                    <span class="icon-[tabler--signature] size-5"></span>
                  </button>
                </div>

                <div v-if="isSalesOrOfficer || isManager" class="tooltip tooltip-top" data-tip="ພິມໃບມອບຮັບສິນຄ້າ"
                  title="ພິມໃບມອບຮັບສິນຄ້າ">
                  <button class="btn btn-circle btn-text btn-sm text-fuchsia-600 hover:bg-fuchsia-50"
                    @click="openDeliveryNoteModal(loan)">
                    <span class="icon-[tabler--box-seam] size-5"></span>
                  </button>
                </div>

                <template v-if="isManager && loan.credit_score">
                  <div v-if="loan.status === 'pending' || loan.status === 'verifying'" class="tooltip tooltip-top"
                    data-tip="ກວດກາ ແລະ ຢືນຢັນ" title="ກວດກາ ແລະ ຢືນຢັນ">
                    <button class="btn btn-circle btn-text btn-sm text-info hover:bg-info/10" @click="verifyLoan(loan)">
                      <span class="icon-[tabler--user-check] size-5"></span>
                    </button>
                  </div>
                  <div v-else-if="loan.status === 'verified'" class="tooltip tooltip-top"
                    data-tip="ທ່ານໄດ້ຢືນຢັນເອກະສານນີ້ແລ້ວ">
                    <button class="btn btn-circle btn-text btn-sm text-gray-400 bg-gray-100 cursor-not-allowed">
                      <span class="icon-[tabler--user-check] size-5 opacity-50"></span>
                    </button>
                  </div>
                </template>

                <!-- <div v-if="loan.credit_score && loan.credit_score >= 65 && loan.status === 'verified' && isApproverGroup && !isManager"
                  class="tooltip tooltip-top" data-tip="ອະນຸມັດ ແລະ ປ່ອຍສິນເຊື່ອ">
                  <button class="btn btn-circle btn-text btn-sm text-success hover:bg-success/10"
                    @click="approveLoan(loan)">
                    <span class="icon-[tabler--cash-banknote] size-5"></span>
                  </button>
                </div> -->

                <div
                  v-if="loan.credit_score && loan.credit_score >= 65 && loan.status === 'verified' && isApproverGroup && !isManager"
                  class="flex items-center gap-1 border-l pl-2 ml-1 border-gray-200 dark:border-gray-700">

                  <div v-if="getSignedApprovers(loan).length > 0" class="flex -space-x-2 mr-1">
                    <div v-for="(signer, idx) in getSignedApprovers(loan)" :key="idx" class="z-10 cursor-default"
                      :title="signer.name">
                      <div
                        class="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-sm uppercase hover:scale-110 transition-transform">
                        {{ getInitials(signer.name) }}
                      </div>
                    </div>
                  </div>

                  <div v-if="!hasCurrentUserSigned(loan)" class="tooltip tooltip-top"
                    data-tip="ອະນຸມັດ ແລະ ປ່ອຍສິນເຊື່ອ" title="ອະນຸມັດ ແລະ ປ່ອຍສິນເຊື່ອ">
                    <button class="btn btn-circle btn-text btn-sm text-success hover:bg-success/10"
                      @click="approveLoan(loan)">
                      <span class="icon-[tabler--cash-banknote] size-5"></span>
                    </button>
                  </div>

                  <div v-else class="tooltip tooltip-top" data-tip="ທ່ານໄດ້ອະນຸມັດແລ້ວ">
                    <button class="btn btn-circle btn-text btn-sm text-gray-400 bg-gray-100 cursor-not-allowed">
                      <span class="icon-[tabler--check] size-5 opacity-50"></span>
                    </button>
                  </div>

                </div>

                <div
                  v-if="loan.status !== 'approved' && loan.status !== 'rejected' && loan.status !== 'disbursed' && isApproverGroup"
                  class="tooltip tooltip-top" data-tip="ປະຕິເສດ" title="ປະຕິເສດ">
                  <button class="btn btn-circle btn-text btn-sm text-error hover:bg-error/10" @click="rejectLoan(loan)">
                    <span class="icon-[tabler--x] size-5"></span>
                  </button>
                </div>

                <div v-if="isSalesOrOfficer || isManager" class="tooltip tooltip-top" data-tip="ແບບຟອມ Checklist"
                  title="ແບບຟອມ Checklist">
                  <button class="btn btn-circle btn-text btn-sm text-primary hover:bg-primary/10"
                    @click="openChecklistModal(loan)">
                    <span class="icon-[tabler--clipboard-check] size-5"></span>
                  </button>
                </div>

                <div v-if="loan.credit_score && (isSalesOrOfficer || isManager)" class="tooltip tooltip-top"
                  data-tip="ພິມໃບສະຫຼຸບ" title="ພິມໃບສະຫຼຸບ">
                  <button class="btn btn-circle btn-text btn-sm text-gray-500 hover:text-primary hover:bg-gray-100"
                    @click="openPrintSummary(loan)">
                    <span class="icon-[tabler--printer] size-5"></span>
                  </button>
                </div>
              </div>
            </td>
          </tr>

          <tr v-if="displayedLoans.length === 0">
            <td colspan="10" class="text-center py-8 text-base-content/60">ບໍ່ພົບຂໍ້ມູນການຂໍສິນເຊື່ອທີ່ລໍຖ້າການອະນຸມັດ
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!isLoading" class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm">
      <div>ສະແດງ {{ startIndex }} - {{ endIndex }} ຈາກ {{ totalLoans }} ລາຍການ</div>
      <div class="flex items-center gap-2">
        <select v-model.number="pageSize" class="select select-sm select-bordered">
          <option :value="10">10 ຕໍ່ໜ້າ</option>
          <option :value="25">25 ຕໍ່ໜ້າ</option>
          <option :value="50">50 ຕໍ່ໜ້າ</option>
        </select>
        <button class="btn btn-sm" :disabled="!hasPreviousPage" @click="previousPage">ກ່ອນໜ້າ</button>
        <span class="px-2">ໜ້າ {{ currentPage }} / {{ totalPages }}</span>
        <button class="btn btn-sm" :disabled="!hasNextPage" @click="nextPage">ຖັດໄປ</button>
      </div>
    </div>

    <ScoringGuideModal :is-open="showScoringGuideModal" @close="showScoringGuideModal = false" />

    <VerifyLoanModal :is-open="showVerifyModal" :loan="loanToAction"
      @close="showVerifyModal = false; loanToAction = null" @success="fetchData" />

    <PrintSummaryModal :is-open="showPrintModal" :print-data="printData"
      @close="showPrintModal = false; printData = null" />

    <ChecklistModal :is-open="showChecklistModal" :loan="selectedChecklistLoan"
      @close="showChecklistModal = false; selectedChecklistLoan = null" />

    <CreditScoreModal :is-open="showCreditScoreModal" :loan="loanForCreditScore" :summary-data="summaryDataForScore"
      @close="showCreditScoreModal = false; loanForCreditScore = null" @success="fetchData" />

    <ExternalSignatureModal :is-open="showSignatureModal" :loan-id="loanForSignature?.id"
      @close="showSignatureModal = false; loanForSignature = null" @updated="fetchData" />

    <DeliveryNoteModal :is-open="showDeliveryNoteModal" :loan="loanForDeliveryNote" :is-pending-view="true"
      @close="showDeliveryNoteModal = false; loanForDeliveryNote = null" @updated="fetchData" />

    <teleport to="body">
      <div v-if="showDetailsModal && selectedLoan"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-3xl mx-auto max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
          <div class="flex justify-between items-center mb-6 border-b pb-4">
            <h3 class="text-lg font-bold flex items-center gap-2">
              <span class="icon-[tabler--list-details] text-primary size-6"></span> ລາຍລະອຽດສິນເຊື່ອ
            </h3>
            <button @click="closeDetailsModal"
              class="btn btn-circle btn-ghost btn-sm text-gray-500 hover:bg-gray-200"><span
                class="icon-[tabler--x] size-5"></span></button>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div><label class="text-sm font-medium text-gray-500">ເລກທີ່ສິນເຊື່ອ</label>
                <p class="font-mono font-bold">{{ selectedLoan.loan_id }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ສະຖານະ</label><br>
                <span class="badge badge-sm border-0 text-white mt-1"
                  :class="getStatusBadge(selectedLoan.status).class">
                  {{ getStatusBadge(selectedLoan.status).text }}
                </span>
              </div>
              <div><label class="text-sm font-medium text-gray-500">ຊື່ລູກຄ້າ</label>
                <p>{{ getCustomerName(selectedLoan) }}</p>
              </div>
              <div><label class="text-sm font-medium text-gray-500">ເບີໂທ</label>
                <p>{{ getCustomerPhone(selectedLoan) }}</p>
              </div>
              <div><label class="text-sm font-medium text-gray-500">ຈຳນວນເງິນ</label>
                <p class="font-medium text-primary">{{ formatPrice(selectedLoan.total_amount) }}</p>
              </div>
              <div><label class="text-sm font-medium text-gray-500">ດອກເບ້ຍ</label>
                <p>{{ selectedLoan.interest_rate_at_apply }}%</p>
              </div>
              <div><label class="text-sm font-medium text-gray-500">ໄລຍະເວລາ</label>
                <p>{{ selectedLoan.loan_period }} ເດືອນ</p>
              </div>
              <div><label class="text-sm font-medium text-gray-500">ຄະແນນສິນເຊື່ອ</label>
                <p class="font-bold text-info">{{ selectedLoan.credit_score || 'ຍັງບໍ່ໄດ້ຄຳນວນ' }}</p>
              </div>
            </div>

            <div class="border-t pt-4"><label class="text-sm font-medium text-gray-500">ທີ່ຢູ່</label>
              <p class="whitespace-pre-line">{{ selectedLoan.customer?.address }}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
              <div><label class="text-sm font-medium text-gray-500">ລາຍຮັບຕໍ່ເດືອນ</label>
                <p class="text-success font-medium">{{ formatPrice(selectedLoan.customer?.income_per_month) }}</p>
              </div>
              <div><label class="text-sm font-medium text-gray-500">ໜີ້ສິນອື່ນໆ</label>
                <p class="text-error font-medium">{{ formatPrice(selectedLoan.customer?.other_debts) }}</p>
              </div>
              <div><label class="text-sm font-medium text-gray-500">ອາຍຸ</label>
                <p>{{ selectedLoan.customer?.age }} ປີ</p>
              </div>
              <div><label class="text-sm font-medium text-gray-500">ສະຖານະການເຮັດວຽກ</label>
                <p>{{ selectedLoan.customer?.occupation }}</p>
              </div>
            </div>

            <!-- <div v-if="selectedLoan.remarks" class="border-t pt-4"><label
                class="text-sm font-medium text-gray-500">ໝາຍເຫດລະບົບ</label>
              <p class="bg-gray-50 p-3 rounded-lg border border-gray-200 mt-1">{{ selectedLoan.remarks }}</p>
            </div> -->
            <ApprovalTimeline v-if="approvalLogs.length > 0" :logs="approvalLogs" />

            <div class="border-t pt-4"><label class="text-sm font-medium text-gray-500">ສ້າງເມື່ອ</label>
              <p>{{ formatDate(selectedLoan.createdAt) }}</p>
            </div>
          </div>

          <div class="flex flex-wrap justify-end gap-3 mt-8 border-t pt-4">
            <button class="btn btn-outline border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
              @click="openDocumentModal(selectedLoan)">
              <span class="icon-[tabler--files] size-4 mr-1"></span> ເອກະສານແນບ
            </button>

            <button class="btn btn-outline border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300"
              @click="openScheduleModal(selectedLoan)">
              <span class="icon-[tabler--calendar-stats] size-4 mr-1"></span> ຕາຕະລາງຜ່ອນ
            </button>

            <button class="btn btn-outline border-info/50 text-info hover:bg-info/10 hover:border-info"
              @click="openDraftContractModal">
              <span class="icon-[tabler--file-certificate] size-4 mr-1"></span> ເບິ່ງຮ່າງສັນຍາ
            </button>

            <button class="btn btn-primary ml-auto md:ml-0" @click="closeDetailsModal">ປິດໜ້າຈໍ</button>
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
            :loan-application="selectedLoan" :loan-contract="selectedContract" :is-editing="false" :view-only="true"
            @cancel-edit="showContractModal = false" />
          <div v-else class="text-center py-8 text-gray-500">
            <div class="loading loading-spinner loading-md"></div>
            <p class="mt-2">ກຳລັງໂຫຼດຂໍ້ມູນສັນຍາ...</p>
          </div>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div v-if="showApproveModal && loanToAction"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md mx-auto animate-in fade-in zoom-in duration-200">
          <h3 class="font-bold text-xl mb-4 text-success flex items-center gap-2">
            <span class="icon-[tabler--check] size-6"></span> ຢືນຢັນການອະນຸມັດ
          </h3>
          <p class="py-2 text-gray-700 dark:text-gray-300">
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການອະນຸມັດສິນເຊື່ອຂອງລູກຄ້າຊື່: <br>
            <strong class="text-lg text-primary">"{{ getCustomerName(loanToAction) }}"</strong> ?
          </p>
          <div class="alert alert-info shadow-sm text-sm py-2 mb-4">
            <span class="icon-[tabler--info-circle] size-4"></span>
            ລະບົບຈະສ້າງຕາຕະລາງຜ່ອນຊຳລະ ແລະ ອັບເດດສະຖານະເປັນ "ປ່ອຍສິນເຊື່ອ (Disbursed)" ທັນທີ
          </div>

          <div class="form-control mt-4 p-4 rounded-xl border"
            :class="isConditionalApproval ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'">
            <label class="label pb-1">
              <span class="label-text font-bold" :class="isConditionalApproval ? 'text-amber-700' : 'text-green-700'">
                <span v-if="isConditionalApproval" class="icon-[tabler--alert-triangle] size-4 mr-1"></span>
                <span v-else class="icon-[tabler--check] size-4 mr-1"></span>
                ເງື່ອນໄຂ / ເຫດຜົນອະນຸມັດ (Remarks) <span v-if="isConditionalApproval" class="text-error">*</span>
              </span>
            </label>

            <p v-if="isConditionalApproval" class="text-xs text-amber-600 mb-2">
              ລູກຄ້າຢູ່ໃນເກນ (65-79 ຄະແນນ), ບັງຄັບໃຫ້ລະບຸເງື່ອນໄຂກ່ອນອະນຸມັດ.
            </p>
            <p v-else class="text-xs text-green-600 mb-2">
              ຄະແນນຜ່ານເກນດີເລີດ (80+ ຄະແນນ), ສາມາດລະບຸເຫດຜົນເພີ່ມເຕີມໄດ້ (ບໍ່ບັງຄັບ).
            </p>

            <textarea v-model="actionRemark" class="textarea textarea-bordered w-full h-24 bg-white"
              :placeholder="isConditionalApproval ? 'ລະບຸເງື່ອນໄຂເຊັ່ນ: ຕ້ອງເພີ່ມເງິນດາວ 10%... (ບັງຄັບ)' : 'ລະບຸເຫດຜົນເພີ່ມເຕີມ (ຖ້າມີ)...'"></textarea>
          </div>

          <div class="flex justify-end gap-3 mt-6 border-t pt-4">
            <button class="btn btn-ghost" @click="showApproveModal = false">ຍົກເລີກ</button>
            <button class="btn btn-success text-white" @click="confirmApproveLoan">ອະນຸມັດສິນເຊື່ອ</button>
          </div>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div v-if="showRejectModal && loanToAction"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md mx-auto animate-in fade-in zoom-in duration-200">
          <h3 class="font-bold text-xl mb-4 text-error flex items-center gap-2">
            <span class="icon-[tabler--x] size-6"></span> ຢືນຢັນການປະຕິເສດ
          </h3>
          <p class="py-2 text-gray-700 dark:text-gray-300">
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການປະຕິເສດສິນເຊື່ອຂອງລູກຄ້າຊື່: <br>
            <strong class="text-lg text-primary">"{{ getCustomerName(loanToAction) }}"</strong> ?
          </p>

          <div class="form-control mt-4 p-4 rounded-xl border bg-red-50 border-red-200">
            <label class="label pb-1">
              <span class="label-text font-bold text-red-700">
                ເຫດຜົນການປະຕິເສດ (Remarks) <span v-if="isConditionalApproval" class="text-error">*</span>
              </span>
            </label>
            <p v-if="isConditionalApproval" class="text-xs text-amber-600 mb-2">ລູກຄ້າຢູ່ໃນເກນ (65-79 ຄະແນນ),
              ບັງຄັບໃຫ້ລະບຸເຫດຜົນການປະຕິເສດ.</p>
            <p v-else class="text-xs text-red-500 mb-2">ກະລຸນາລະບຸເຫດຜົນເພື່ອແຈ້ງໃຫ້ພະນັກງານຊາບ.</p>

            <textarea v-model="actionRemark" class="textarea textarea-bordered w-full h-24 bg-white"
              placeholder="ລະບຸເຫດຜົນເຊັ່ນ: ປະຫວັດ CIB ບໍ່ດີ, ໜີ້ສິນເກີນກຳນົດ..."></textarea>
          </div>

          <div class="flex justify-end gap-3 mt-6 border-t pt-4">
            <button class="btn btn-ghost" @click="showRejectModal = false">ຍົກເລີກ</button>
            <button class="btn btn-error text-white" @click="confirmRejectLoan">ປະຕິເສດສິນເຊື່ອ</button>
          </div>
        </div>
      </div>
    </teleport>

  </div>

  <LoanScheduleModal :show="showScheduleModal" :loan="loanForSchedule" :view-only="true"
    @close="showScheduleModal = false; loanForSchedule = null" />

  <DocumentModalForm :show="showDocumentModal" :allow-edit="false"
    :current-documents="loanApplicationStore.currentDocuments"
    @close="showDocumentModal = false; loanForDocument = null" />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { useLoanApplicationStore } from '@/stores/loanApplication';
import { useLoanContractStore } from '@/stores/loanContract';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/api/apiclient';
import { alert } from '@/utils/alert';
import { formatPrice } from '@/utils/formatters';
import { LoanApplicationStatus } from '@/types/loanApplication';

// 🟢 ປະກາດ Props ເພື່ອລຶບ Warning `Extraneous non-props attributes`
const props = defineProps<{
  loanStatus?: string;
}>();

// 🟢 Import Modals
import ScoringGuideModal from '@/components/modals/loan/pending/ScoringGuideModal.vue';
import VerifyLoanModal from '@/components/modals/loan/pending/VerifyLoanModal.vue';
import PrintSummaryModal from '@/components/modals/loan/pending/PrintSummaryModal.vue';
import ChecklistModal from '@/components/modals/loan/pending/CheckListModal.vue';
import CreditScoreModal from '@/components/modals/loan/pending/CreditScoreModal.vue';
import ExternalSignatureModal from '@/components/modals/loan/pending/ExternalSignatureModal.vue';
import DeliveryNoteModal from '@/components/modals/loan/pending/DeliveryNoteModal.vue';
import LoanScheduleModal from '@/components/modals/loan/detail/LoanScheduleModal.vue';
import LoanContractForm from '@/components/loans/form/LoanContractForm.vue';
import DocumentModalForm from '@/components/modals/loan/pending/CheckDocumentModal.vue';
import ApprovalTimeline from '@/components/loans/form/ApprovalTimeline.vue'; // ກວດສອບ Path ນີ້ໃຫ້ຖືກຕ້ອງ!


const loanApplicationStore = useLoanApplicationStore();
const loanContractStore = useLoanContractStore();
const authStore = useAuthStore();

// --- States ທົ່ວໄປ ---
const isLoading = computed(() => loanApplicationStore.isLoading);
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');
const dateFrom = ref('');
const dateTo = ref('');

// --- State ໃໝ່ສຳລັບເກັບ Log ---
const approvalLogs = ref<any[]>([]);

// --- Role ຂອງຜູ້ໃຊ້ປັດຈຸບັນ ---
const currentUserLevel = computed(() => authStore.user?.staff_level || '');

const isSalesOrOfficer = computed(() => ['sales', 'credit_officer'].includes(currentUserLevel.value));
const isManager = computed(() => currentUserLevel.value === 'credit_manager');
const isApproverGroup = computed(() => ['credit_manager', 'deputy_director', 'director'].includes(currentUserLevel.value));


// --- Modal States ---
const showDetailsModal = ref(false);
const showApproveModal = ref(false);
const showRejectModal = ref(false);
const showScoringGuideModal = ref(false);
const showVerifyModal = ref(false);
const showPrintModal = ref(false);
const showChecklistModal = ref(false);
const showCreditScoreModal = ref(false);
const showSignatureModal = ref(false);
const showDeliveryNoteModal = ref(false);

const loanForDeliveryNote = ref<any>(null);
const loanForSignature = ref<any>(null);
const showScheduleModal = ref(false);
const loanForSchedule = ref<any>(null);
const showContractModal = ref(false);
const selectedContract = ref<any>(null);

// Document Modal State
const showDocumentModal = ref(false);
const loanForDocument = ref<any>(null);

const selectedLoan = ref<any>(null);
const loanToAction = ref<any>(null);
const selectedChecklistLoan = ref<any>(null);
const loanForCreditScore = ref<any>(null);
const summaryDataForScore = ref<any>(null);
const printData = ref<any>(null);
const actionRemark = ref('');

// ==========================================
// 5. ຟັງຊັນສຳລັບຈັດການລາຍເຊັນອະນຸມັດຂອງຜູ້ບໍລິຫານ (Multi-Approver Tracking)
// ==========================================

// ກຳນົດກຸ່ມ Role ທີ່ຕ້ອງການກວດສອບວ່າໃຜມີສິດອະນຸມັດແດ່
const targetApproverRoles = ['credit_head', 'approver_1', 'approver_2', 'approver_3'];

// 5.1 ດຶງລາຍຊື່ຜູ້ທີ່ເຊັນອະນຸມັດແລ້ວ ເພື່ອເອົາໄປສະແດງເປັນຮູບວົງມົນ
const getSignedApprovers = (loan: any) => {
  if (!loan.document_signatures || !Array.isArray(loan.document_signatures)) return [];

  return loan.document_signatures
    .filter((sig: any) =>
      sig.document_type === 'contract' &&
      sig.status === 'signed' &&
      targetApproverRoles.includes(sig.role_type)
    )
    .map((sig: any) => ({
      role: sig.role_type,
      name: sig.user?.first_name || sig.user?.full_name || sig.user?.username || sig.signer_name || 'ຜູ້ອະນຸມັດ'
    }));
};

// 5.2 ກວດສອບວ່າຜູ້ໃຊ້ປັດຈຸບັນ (ທີ່ກຳລັງ Login) ເຄີຍກົດອະນຸມັດສິນເຊື່ອນີ້ໄປແລ້ວຫຼືຍັງ?
const hasCurrentUserSigned = (loan: any) => {
  if (!loan.document_signatures || !Array.isArray(loan.document_signatures) || !authStore.user) return false;

  return loan.document_signatures.some((sig: any) =>
    sig.document_type === 'contract' &&
    sig.status === 'signed' &&
    sig.user_id === authStore.user?.id // ທຽບ ID ຂອງຄົນໃນຕາຕະລາງລາຍເຊັນ ກັບ ID ຂອງຄົນທີ່ Login
  );
};

// 5.3 ແປງຊື່ Role ພາສາອັງກິດ ໃຫ້ເປັນພາສາລາວເພື່ອສະແດງໃນ Tooltip ໃຫ້ອ່ານງ່າຍ
const formatRoleName = (role: string) => {
  const roles: Record<string, string> = {
    'credit_head': 'ຫົວໜ້າສິນເຊື່ອ',
    'approver_1': 'ຜູ້ອະນຸມັດ 1',
    'approver_2': 'ຜູ້ອະນຸມັດ 2',
    'approver_3': 'ຜູ້ອະນຸມັດ 3'
  };
  return roles[role] || role;
};

// 5.4 ຕັດເອົາຕົວອັກສອນ 2 ໂຕທຳອິດຂອງຊື່ມາເຮັດເປັນຮູບ Avatar ວົງມົນ
const getInitials = (name: string) => {
  if (!name) return '?';
  return name.substring(0, 2);
};



// --- Functions ---
const openDocumentModal = async (loan: any) => {
  try {
    loanForDocument.value = loan;
    showDocumentModal.value = true;

    // 🟢 ປ່ຽນມາໃຊ້ Customer ID (33) ແທນ
    await loanApplicationStore.fetchDocuments(loan.customer_id);
  } catch (error: any) {
    alert.error('ບໍ່ສາມາດໂຫຼດເອກະສານໄດ້', 'ກະລຸນາລອງໃໝ່ອີກຄັ້ງ');
    showDocumentModal.value = false;
  }
};

const openDeliveryNoteModal = async (loan: any) => {
  try {
    // 1. ກວດສອບວ່າມີຂໍ້ມູນສັນຍາແລ້ວຫຼືຍັງ?
    const contractRes = await loanContractStore.fetchContract(loan.id);
    const contractData = (contractRes as any)?.data?.data || (contractRes as any)?.data || contractRes;

    if (!contractData || Object.keys(contractData).length === 0 || (!contractData.id && !contractData.loan_id)) {
      alert.error('ບໍ່ສາມາດພິມໃບມອບຮັບໄດ້', 'ກະລຸນາສ້າງ ແລະ ບັນທຶກ "ຮ່າງສັນຍາກູ້ຢືມ" ໃຫ້ສຳເລັດກ່ອນ!');
      return;
    }

    // 2. ກວດສອບວ່າມີຕາຕະລາງຜ່ອນຊຳລະແລ້ວຫຼືຍັງ?
    const repaymentRes = await loanApplicationStore.fetchRepaymentSchedule(loan.id);
    const hasRepayments = Array.isArray(repaymentRes) ? repaymentRes.length > 0 : (repaymentRes?.data ? true : false);

    if (!hasRepayments) {
      alert.error('ບໍ່ສາມາດພິມໃບມອບຮັບໄດ້', 'ກະລຸນາສ້າງ ແລະ ບັນທຶກ "ຕາຕະລາງຜ່ອນຊຳລະ" ໃຫ້ສຳເລັດກ່ອນ!');
      return;
    }

    // ======================================================
    // 🟢 3. ເພີ່ມການກວດສອບ Checklist ໃຫ້ຄົບຖ້ວນກ່ອນພິມໃບມອບຮັບ
    // ======================================================
    let summaryData = null;
    try {
      const res = await apiClient.get(`/checklist/summary/${loan.id}`);
      summaryData = res.data?.data;
    } catch (e) { }

    if (!summaryData) {
      alert.error('ບໍ່ສາມາດພິມໃບມອບຮັບໄດ້', 'ທ່ານຍັງບໍ່ໄດ້ບັນທຶກຂໍ້ມູນໃນ "ຟອມກວດສອບສິນເຊື່ອ (Checklist)" ເລີຍ!');
      return;
    }

    const errorMsg = [];
    if (!summaryData.basic_verification || summaryData.basic_verification.status !== 'completed') errorMsg.push("- ຍັງບໍ່ໄດ້ບັນທຶກ 'ຂໍ້ມູນທົ່ວໄປ' ຫຼື ຍັງເປັນຮ່າງ");
    if (!summaryData.call_verifications || summaryData.call_verifications.length === 0) errorMsg.push("- ຍັງບໍ່ມີປະຫວັດ 'ການໂທຢືນຢັນ'");
    if (!summaryData.cib_check) errorMsg.push("- ຍັງບໍ່ໄດ້ບັນທຶກຜົນ 'ກວດ CIB'");
    if (!summaryData.field_visits || summaryData.field_visits.length === 0) errorMsg.push("- ຍັງບໍ່ມີປະຫວັດ 'ລົງພື້ນທີ່ຈິງ'");
    if (!summaryData.income_assessment) errorMsg.push("- ຍັງບໍ່ໄດ້ 'ປະເມີນລາຍຮັບ (DSR)'");

    // ຖ້າມີຂໍ້ໃດໜຶ່ງບໍ່ຄົບຖ້ວນ ໃຫ້ແຈ້ງເຕືອນແລະຢຸດການເຮັດວຽກທັນທີ
    if (errorMsg.length > 0) {
      alert.error("ຂໍ້ມູນ Checklist ບໍ່ຄົບຖ້ວນ!", "ກະລຸນາກວດສອບ:\n" + errorMsg.join('\n'));
      return;
    }
    // ======================================================

    // ຖ້າຜ່ານທັງ 3 ເງື່ອນໄຂ ຈຶ່ງອະນຸຍາດໃຫ້ເປີດ Modal ໄດ້
    loanForDeliveryNote.value = loan;
    showDeliveryNoteModal.value = true;

  } catch (error) {
    console.error("Error checking prerequisites for delivery note:", error);
    alert.error('ເກີດຂໍ້ຜິດພາດ', 'ບໍ່ສາມາດກວດສອບຂໍ້ມູນສັນຍາ ແລະ ຕາຕະລາງຜ່ອນໄດ້. ກະລຸນາລອງໃໝ່ອີກຄັ້ງ.');
  }
};

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

    const appPrincipal = Number(fullLoan.total_amount || 0) - Number(fullLoan.down_payment || 0);
    const appMonthlyPay = Number(fullLoan.monthly_pay || 0);
    const appTerm = Number(fullLoan.loan_period || 0);

    const contractPrincipal = Number(contractData.totalAmount || contractData.total_amount || 0);
    const contractMonthlyPay = Number(contractData.monthlyPay || contractData.monthly_pay || 0);
    const contractTerm = Number(contractData.loanPeriod || contractData.loan_period || 0);

    const isConflict = Math.abs(appPrincipal - contractPrincipal) > 10 || Math.abs(appMonthlyPay - contractMonthlyPay) > 10 || appTerm !== contractTerm;

    if (isConflict) {
      alert.error('ຂໍ້ມູນສັນຍາບໍ່ອັບເດດ! ⚠️', 'ຂໍ້ມູນສິນເຊື່ອມີການປ່ຽນແປງຫຼັງຈາກສ້າງສັນຍາໄປແລ້ວ.\n\n👉 ກະລຸນາກົດເຂົ້າ "ລາຍລະອຽດສິນເຊື່ອ" > ແຖບ "ສັນຍາກູ້ຢືມ" > ກົດແກ້ໄຂ ແລະ ກົດ "ອັບເດດຂໍ້ມູນຕາມໃບຄຳຂໍ" ກ່ອນ.');
      return;
    }
    loanForSchedule.value = fullLoan;
    showScheduleModal.value = true;

  } catch (error) {
    alert.error('ເກີດຂໍ້ຜິດພາດ', 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຕາຕະລາງໄດ້');
  }
};

const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending': return { text: 'ຄຳຂໍໃໝ່', class: 'bg-slate-400' };
    case 'verifying': return { text: 'ກຳລັງກວດສອບ', class: 'bg-amber-500' };
    case 'verified': return { text: 'ລໍຖ້າອະນຸມັດ', class: 'bg-blue-500' };
    case 'disbursed': return { text: 'ປ່ອຍສິນເຊື່ອແລ້ວ', class: 'bg-indigo-600' };
    case 'approved': return { text: 'ອະນຸມັດແລ້ວ', class: 'bg-emerald-500' };
    case 'rejected': return { text: 'ປະຕິເສດ', class: 'bg-rose-500' };
    case 'cancelled': return { text: 'ຍົກເລີກ', class: 'bg-gray-600' };
    default: return { text: status, class: 'bg-gray-300' };
  }
}

const hasContract = (loan: any): boolean => {
  return !!(loan.loan_contracts && loan.loan_contracts.length > 0);
};

// --- Pagination & Search ---
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const debouncedSearch = ref('');
const debounceSearch = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { debouncedSearch.value = searchQuery.value; currentPage.value = 1; }, 300);
}
const applyDateFilter = () => { currentPage.value = 1; }

const filteredLoans = computed(() => {
  let filtered = loanApplicationStore.loanApplications;
  if (debouncedSearch.value) {
    const query = debouncedSearch.value.toLowerCase();
    filtered = filtered.filter(loan => getCustomerName(loan).toLowerCase().includes(query) || getCustomerPhone(loan).includes(query) || loan.loan_id?.toLowerCase().includes(query));
  }
  if (dateFrom.value || dateTo.value) {
    filtered = filtered.filter(loan => {
      const loanDate = loan.createdAt ? new Date(loan.createdAt).toISOString().split('T')[0] : '';
      const fromDate = dateFrom.value || '1970-01-01';
      const toDate = dateTo.value || '9999-12-31';
      if (!loanDate) return false;
      return loanDate >= fromDate && loanDate <= toDate;
    });
  }
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
const previousPage = () => { if (hasPreviousPage.value) currentPage.value--; }
const nextPage = () => { if (hasNextPage.value) currentPage.value++; }
watch(pageSize, () => { currentPage.value = 1; });

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('lo-LA');
}

const getCustomerName = (loan: any): string => {
  if (!loan.customer) return '-';
  return `${loan.customer.first_name || ''} ${loan.customer.last_name || ''}`.trim();
}

const getCustomerPhone = (loan: any): string => {
  return loan.customer?.phone || '-';
}

// --- Actions Modals ---
const viewLoanDetails = async (loan: any) => {
  try {
    if (loan.id) {
      const fullDetails = await loanApplicationStore.fetchLoanApplicationById(loan.id);
      selectedLoan.value = fullDetails || loan;
    } else {
      selectedLoan.value = loan;
    }

    // ໂຫຼດຂໍ້ມູນ Log ຜ່ານ Pinia Store
    approvalLogs.value = await loanApplicationStore.fetchApprovalLogs(selectedLoan.value.id);

    showDetailsModal.value = true;
  } catch (error: any) {
    alert.error("ກະລຸນາກວດສອບຂໍ້ມູນ", "ເນື່ອງຈາກ: " + (error.response?.data?.message || error.message));
  }
}
const closeDetailsModal = () => { showDetailsModal.value = false; selectedLoan.value = null; }

const openSignatureModal = (loan: any) => {
  loanForSignature.value = loan;
  showSignatureModal.value = true;
};

const verifyLoan = (loan: any) => {
  loanToAction.value = loan;
  showVerifyModal.value = true;
};

const openChecklistModal = (loan: any) => {
  selectedChecklistLoan.value = loan;
  showChecklistModal.value = true;
};

const openPrintSummary = async (loan: any) => {
  try {
    let summaryData = null;
    try {
      const res = await apiClient.get(`/checklist/summary/${loan.id}`);
      summaryData = res.data?.data;
    } catch (e) { console.warn("Checklist data missing for print"); }

    if (!summaryData) return alert.error('ບໍ່ສາມາດພິມໄດ້', 'ກະລຸນາປະເມີນຄະແນນ ແລະ Checklist ໃຫ້ຄົບຖ້ວນກ່ອນພິມ.');

    const basic = summaryData.basic_verification || {};
    const income = summaryData.income_assessment || {};
    const cib = summaryData.cib_check || {};

    let age = loan.customer?.age || 0;
    if (!age && basic.verified_dob) {
      age = Math.abs(new Date(Date.now() - new Date(basic.verified_dob).getTime()).getUTCFullYear() - 1970);
    }

    const totalIncome = (Number(income.average_monthly_income) || 0) + (Number(income.other_verified_income) || 0);
    const totalDebt = (Number(income.existing_debt_payments) || 0) + (Number(income.proposed_installment) || 0);
    const dsrPercent = totalIncome > 0 ? (totalDebt / totalIncome) * 100 : 100;
    const price = Number(basic.verified_price) || Number(loan.total_amount) || 1;
    const dp = Number(basic.verified_down_payment) || Number(loan.down_payment) || 0;

    printData.value = {
      loan: loan, customerName: getCustomerName(loan), age: age, phone: getCustomerPhone(loan),
      companyName: basic.work_company_name || loan.customer?.work_info?.[0]?.company_name || 'ບໍ່ລະບຸ',
      jobTenure: Number(basic.work_years) || 0, totalIncome: totalIncome, totalDebt: totalDebt,
      productName: basic.verified_product_type || loan.product?.product_name || '-', productPrice: price,
      downPayment: dp, downPaymentPercent: (dp / price) * 100, approvedAmount: price - dp,
      interestRate: loan.interest_rate_at_apply, interestType: loan.interest_rate_type === 'yearly' ? 'ຕໍ່ປີ' : 'ຕໍ່ເດືອນ',
      loanPeriod: loan.loan_period, monthlyPay: Number(basic.verified_monthly_pay) || Number(loan.monthly_pay),
      cibStatus: cib.cib_status || cib.overall_cib_status || 'no_delay', dsrPercent: dsrPercent,
      callStatus: summaryData.call_verifications?.[0]?.call_status || 'completed', remarks: loan.remarks || cib.remark || '',
      creditScore: loan.credit_score || 0
    };
    showPrintModal.value = true;
  } catch (error) {
    alert.error('ເກີດຂໍ້ຜິດພາດໃນການກຽມຂໍ້ມູນພິມ');
  }
}

const openCreditScoreModal = async (loan: any) => {
  try {
    const contractRes = await loanContractStore.fetchContract(loan.id);
    if (!contractRes) return alert.error('ບໍ່ສາມາດຄຳນວນຄະແນນໄດ້', 'ກະລຸນາສ້າງ ແລະ ບັນທຶກ "ສັນຍາກູ້ຢືມ" ໃຫ້ສຳເລັດກ່ອນ!');

    const repaymentRes = await loanApplicationStore.fetchRepaymentSchedule(loan.id);
    const hasRepayments = Array.isArray(repaymentRes) ? repaymentRes.length > 0 : (repaymentRes?.data ? true : false);
    if (!hasRepayments) return alert.error('ບໍ່ສາມາດຄຳນວນຄະແນນໄດ້', 'ກະລຸນາສ້າງ ແລະ ບັນທຶກ "ຕາຕະລາງຜ່ອນຊຳລະ" ໃຫ້ສຳເລັດກ່ອນ!');

    let summaryData = null;
    try {
      const res = await apiClient.get(`/checklist/summary/${loan.id}`);
      summaryData = res.data?.data;
    } catch (e) { }

    if (!summaryData) return alert.error('ບໍ່ສາມາດຄຳນວນຄະແນນໄດ້', 'ທ່ານຍັງບໍ່ໄດ້ບັນທຶກຂໍ້ມູນໃນ "ຟອມກວດສອບສິນເຊື່ອ (Checklist)" ເລີຍ!');

    const errorMsg = [];
    if (!summaryData.basic_verification || summaryData.basic_verification.status !== 'completed') errorMsg.push("- ຍັງບໍ່ໄດ້ບັນທຶກ 'ຂໍ້ມູນທົ່ວໄປ' ຫຼື ຍັງເປັນຮ່າງ");
    if (!summaryData.call_verifications || summaryData.call_verifications.length === 0) errorMsg.push("- ຍັງບໍ່ມີປະຫວັດ 'ການໂທຢືນຢັນ'");
    if (!summaryData.cib_check) errorMsg.push("- ຍັງບໍ່ໄດ້ບັນທຶກຜົນ 'ກວດ CIB'");
    if (!summaryData.field_visits || summaryData.field_visits.length === 0) errorMsg.push("- ຍັງບໍ່ມີປະຫວັດ 'ລົງພື້ນທີ່ຈິງ'");
    if (!summaryData.income_assessment) errorMsg.push("- ຍັງບໍ່ໄດ້ 'ປະເມີນລາຍຮັບ (DSR)'");

    if (errorMsg.length > 0) return alert.error("ຂໍ້ມູນ Checklist ບໍ່ຄົບຖ້ວນ!", "ເນື່ອງຈາກ:\n" + errorMsg.join('\n'));

    summaryDataForScore.value = summaryData;
    loanForCreditScore.value = loan;
    showCreditScoreModal.value = true;
  } catch (error) {
    alert.error('ເກີດຂໍ້ຜິດພາດໃນການກວດສອບເງື່ອນໄຂ');
  }
}

const isConditionalApproval = computed(() => {
  if (!loanToAction.value || !loanToAction.value.credit_score) return false;
  return loanToAction.value.credit_score >= 65 && loanToAction.value.credit_score <= 79;
});

const approveLoan = (loan: any) => { loanToAction.value = loan; actionRemark.value = ''; showApproveModal.value = true; }
const rejectLoan = (loan: any) => { loanToAction.value = loan; actionRemark.value = ''; showRejectModal.value = true; }

const confirmApproveLoan = async () => {
  if (!loanToAction.value) return;
  if (isConditionalApproval.value && !actionRemark.value.trim()) return alert.error('ກະລຸນາປ້ອນເຫດຜົນ', 'ລູກຄ້າຢູ່ໃນເກນ (65-79 ຄະແນນ) ຕ້ອງລະບຸເຫດຜົນກ່ອນອະນຸມັດ!');

  try {
    const updateData: any = { status: LoanApplicationStatus.DISBURSED, approver_id: authStore.user?.id };
    if (actionRemark.value.trim()) updateData.remarks = actionRemark.value.trim();
    await loanApplicationStore.updateLoanApplication(loanToAction.value.id, updateData);
    alert.success('ອະນຸມັດສິນເຊື່ອສຳເລັດແລ້ວ!');
    showApproveModal.value = false;
    fetchData();
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'ເກີດຂໍ້ຜິດພາດໃນການອະນຸມັດ';
    alert.error('ການອະນຸມັດສິນເຊື່ອຜິດພາດ!', errorMsg);
  } finally { loanToAction.value = null; }
}

const confirmRejectLoan = async () => {
  if (!loanToAction.value) return;
  if (!actionRemark.value.trim()) return alert.error('ກະລຸນາປ້ອນເຫດຜົນ', 'ການປະຕິເສດສິນເຊື່ອຈຳເປັນຕ້ອງລະບຸເຫດຜົນເພື່ອແຈ້ງໃຫ້ພະນັກງານຊາບ!');

  try {
    const updateData: any = { status: LoanApplicationStatus.REJECTED, approver_id: authStore.user?.id };
    if (actionRemark.value.trim()) updateData.remarks = actionRemark.value.trim();
    await loanApplicationStore.updateLoanApplication(loanToAction.value.id, updateData);
    alert.success('ປະຕິເສດສິນເຊື່ອສຳເລັດແລ້ວ!');
    showRejectModal.value = false;
    fetchData();
  } catch (error: any) {
    alert.error('ການປະຕິເສດສິນເຊື່ອຜິດພາດ!', error.response?.data?.message || error.message);
  } finally { loanToAction.value = null; }
}

const exportToCSV = () => {
  if (!displayedLoans.value.length) return;
  const csvData = displayedLoans.value.map(loan => ({
    'ເລກທີ່ສິນເຊື່ອ': loan.loan_id, 'ຊື່ລູກຄ້າ': getCustomerName(loan), 'ເບີໂທ': getCustomerPhone(loan),
    'ຈຳນວນເງິນ': formatPrice(loan.total_amount), 'ດອກເບ້ຍ (%)': loan.interest_rate_at_apply, 'ໄລຍະເວລາ (ເດືອນ)': loan.loan_period,
    'ສະຖານະ': getStatusBadge(loan.status).text, 'ຄະແນນສິນເຊື່ອ': loan.credit_score || '-', 'ວັນທີ່ສ້າງ': formatDate(loan.createdAt)
  }));
  const csv = Papa.unparse(csvData);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `pending_loans_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}

const exportToExcel = () => {
  // alert.error('ຍັງບໍ່ສາມາດສົ່ງອອກເປັນ Excel ໄດ້', 'ກະລຸນາໃຊ້ CSV ແທນ ຫຼື รอการอัปเดตในอนาคต!');
  const excelData = displayedLoans.value.map(loan => ({
    'ເລກທີ່ສິນເຊື່ອ': loan.loan_id, 'ຊື່ລູກຄ້າ': getCustomerName(loan), 'ເບີໂທ': getCustomerPhone(loan),
    'ຈຳນວນເງິນ': formatPrice(loan.total_amount), 'ດອກເບ້ຍ (%)': loan.interest_rate_at_apply, 'ໄລຍະເວລາ (ເດືອນ)': loan.loan_period,
    'ສະຖານະ': getStatusBadge(loan.status).text, 'ຄະແນນ': loan.credit_score || '-', 'ວັນที่สร้าง': formatDate(loan.createdAt)
  }));
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Pending Loans');
  XLSX.writeFile(workbook, `pending_loans_${new Date().toISOString().split('T')[0]}.xlsx`);
}

const fetchData = async () => {
  try {
    await loanApplicationStore.fetchLoanApplications({
      status: [
        LoanApplicationStatus.PENDING,
        LoanApplicationStatus.VERIFYING,
        LoanApplicationStatus.VERIFIED
      ] as any,
      is_confirmed: 1, limit: 1000
    });
  } catch (e) {
    console.error("Failed to load pending loans", e);
  }
}

onMounted(() => { fetchData(); });
</script>
