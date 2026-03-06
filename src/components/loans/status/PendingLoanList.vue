<template>
  <div class="p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ສິນເຊື່ອລໍຖ້າການອະນຸມັດ</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">ຈັດການຄຳຂໍສິນເຊື່ອທີ່ລໍຖ້າການອະນຸມັດ</p>
      </div>

      <button @click="exportToCSV" class="btn btn-outline btn-sm whitespace-nowrap">
        <span class="icon-[tabler--file-export] size-4 mr-1"></span>
        Export CSV
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <label class="label">
          <span class="label-text text-sm font-medium">ຄົ້ນຫາ</span>
        </label>
        <input v-model="searchQuery" type="text" placeholder="ຊື່ລູກຄ້າ, ເບີໂທ, ເລກທີ່..."
          class="input input-bordered w-full" @input="debounceSearch" />
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
            <th>ເລກທີ່</th>
            <th>ລູກຄ້າ</th>
            <th>ເບີໂທ</th>
            <th>ຈຳນວນເງິນ</th>
            <th>ດອກເບ້ຍ (%)</th>
            <th>ໄລຍະເວລາ</th>
            <th>ຄະແນນສິນເຊື່ອ</th>
            <th>ວັນທີ່ສ້າງ</th>
            <th class="w-32">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="loan in displayedLoans" :key="loan.id">
            <td class="font-mono text-gray-600 dark:text-gray-400">{{ loan.loan_id }}</td>
            <td class="font-medium">{{ getCustomerName(loan) }}</td>
            <td>{{ getCustomerPhone(loan) }}</td>
            <td class="font-medium">{{ formatPrice(loan.total_amount) }}</td>
            <td>{{ loan.interest_rate_at_apply }}%</td>
            <td>{{ loan.loan_period }} ເດືອນ</td>
            <td>
              <div class="flex items-center gap-2">
                <span class="font-medium">{{ loan.credit_score || '-' }}</span>
                <button class="btn btn-circle btn-text btn-xs" @click="openCreditScoreModal(loan)"
                  aria-label="Calculate credit score">
                  <span class="icon-[tabler--calculator] size-3"></span>
                </button>
              </div>
            </td>
            <td>{{ formatDate(loan.createdAt) }}</td>
            <td>
              <div class="flex gap-2">
                <button class="btn btn-circle btn-text btn-sm" @click="viewLoanDetails(loan)" aria-label="View details">
                  <span class="icon-[tabler--eye] size-4"></span>
                </button>

                <button class="btn btn-circle btn-text btn-sm text-success" @click="approveLoan(loan)"
                  aria-label="Approve loan" :disabled="!loan.credit_score || loan.credit_score < 1">
                  <span class="icon-[tabler--check] size-4"></span>
                </button>

                <button class="btn btn-circle btn-text btn-sm text-error" @click="rejectLoan(loan)"
                  aria-label="Reject loan" :disabled="!loan.credit_score || loan.credit_score < 1">
                  <span class="icon-[tabler--x] size-4"></span>
                </button>

                <button class="btn btn-circle btn-text btn-sm text-info" @click="openChecklistModal(loan)"
                  aria-label="Verification Checklist">
                  <span class="icon-[tabler--clipboard-check] size-5"></span>
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="displayedLoans.length === 0">
            <td colspan="9" class="text-center py-8 text-base-content/60">
              ບໍ່ພົບຂໍ້ມູນການຂໍສິນເຊື່ອທີ່ລໍຖ້າການອະນຸມັດ
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
        <button class="btn btn-sm" :disabled="!hasPreviousPage" @click="previousPage">ກ່ອນໜ້າ</button>
        <span class="px-2">ໜ້າ {{ currentPage }} / {{ totalPages }}</span>
        <button class="btn btn-sm" :disabled="!hasNextPage" @click="nextPage">ຖັດໄປ</button>
      </div>
    </div>


    <teleport to="body">
      <div v-if="showDetailsModal && selectedLoan"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold">ລາຍລະອຽດສິນເຊື່ອ</h3>
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
                <span class="badge badge-soft badge-warning mt-1">ລໍຖ້າການອະນຸມັດ</span>
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
                <label class="text-sm font-medium text-gray-500">ຈຳນວນເງິນ</label>
                <p class="font-medium text-primary">{{ formatPrice(selectedLoan.total_amount) }}</p>
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
            </div>

            <div class="border-t pt-4">
              <label class="text-sm font-medium text-gray-500">ທີ່ຢູ່</label>
              <p class="whitespace-pre-line">{{ selectedLoan.customer?.address }}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
              <div>
                <label class="text-sm font-medium text-gray-500">ລາຍຮັບຕໍ່ເດືອນ</label>
                <p class="text-success font-medium">{{ formatPrice(selectedLoan.customer?.income_per_month) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ໜີ້ສິນອື່ນໆ</label>
                <p class="text-error font-medium">{{ formatPrice(selectedLoan.customer?.other_debts) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ອາຍຸ</label>
                <p>{{ selectedLoan.customer?.age }} ປີ</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ສະຖານະການເຮັດວຽກ</label>
                <p>{{ selectedLoan.customer?.occupation }}</p>
              </div>
            </div>

            <div v-if="selectedLoan.remarks" class="border-t pt-4">
              <label class="text-sm font-medium text-gray-500">ໝາຍເຫດ</label>
              <p class="bg-gray-50 p-2 rounded">{{ selectedLoan.remarks }}</p>
            </div>
            <div class="border-t pt-4">
              <label class="text-sm font-medium text-gray-500">ສ້າງເມື່ອ</label>
              <p>{{ formatDate(selectedLoan.createdAt) }}</p>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6 border-t pt-4">
            <button class="btn btn-primary w-full" @click="closeDetailsModal">ປິດ</button>
          </div>
        </div>
      </div>
    </teleport>


    <teleport to="body">
      <div v-if="showCreditScoreModal && loanForCreditScore"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold flex items-center gap-2">
              <span class="icon-[tabler--calculator] text-primary size-5"></span> ຄຳນວນຄະແນນສິນເຊື່ອ
            </h3>
            <button @click="closeCreditScoreModal" class="text-gray-400 hover:text-gray-600">
              <span class="icon-[tabler--x] size-5"></span>
            </button>
          </div>

          <form @submit.prevent="calculateCreditScore" class="space-y-4">
            <div class="form-control">
              <label class="label"><span class="label-text font-medium">ລາຍຮັບຕໍ່ເດືອນ (ກີບ) *</span></label>
              <input v-model.number="creditScoreForm.monthly_income" type="number" class="input input-bordered w-full"
                required />
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-medium">ໜີ້ສິນອື່ນໆ (ກີບ) *</span></label>
              <input v-model.number="creditScoreForm.other_debts" type="number" class="input input-bordered w-full"
                required />
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-medium">ອາຍຸ (ປີ) *</span></label>
              <input v-model.number="creditScoreForm.age" type="number" class="input input-bordered w-full" min="18"
                max="100" required />
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-medium">ສະຖານະການເຮັດວຽກ *</span></label>
              <select v-model="creditScoreForm.employment_status" class="select select-bordered w-full" required>
                <option value="" disabled selected>ເລືອກສະຖານະການເຮັດວຽກ</option>
                <option value="employed">ມີວຽກເຮັດງານທຳ</option>
                <option value="self-employed">ເຮັດວຽກເອງ</option>
                <option value="unemployed">ບໍ່ມີວຽກເຮັດງານທຳ</option>
                <option value="retired">ພັກເຊົາ</option>
              </select>
            </div>

            <div v-if="creditScoreResult" class="p-4 bg-base-200 rounded-lg mt-4 border">
              <div class="flex justify-between items-center mb-2">
                <span class="font-medium">ຄະແນນສິນເຊື່ອ:</span>
                <span class="text-3xl font-black" :class="getScoreColorClass(creditScoreResult.score)">
                  {{ creditScoreResult.score }}
                </span>
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400 font-bold">
                ເກຣດ: {{ creditScoreResult.grade }} - {{ creditScoreResult.description }}
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-6 border-t pt-4">
              <button type="button" class="btn btn-soft btn-secondary" @click="closeCreditScoreModal">ຍົກເລີກ</button>
              <button type="submit" class="btn btn-primary" :disabled="isCalculating">
                <span v-if="isCalculating" class="loading loading-spinner loading-xs"></span>
                <span v-else>ຄຳນວນ & ບັນທຶກ</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </teleport>


    <teleport to="body">
      <div v-if="showApproveModal && loanToAction"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
          <h3 class="font-bold text-xl mb-4 text-success flex items-center gap-2">
            <span class="icon-[tabler--check] size-6"></span> ຢືນຢັນການອະນຸມັດ
          </h3>
          <p class="py-4 text-gray-700 dark:text-gray-300">
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການອະນຸມັດສິນເຊື່ອຂອງລູກຄ້າຊື່: <br>
            <strong>"{{ getCustomerName(loanToAction) }}"</strong> ?
          </p>
          <div class="flex justify-end gap-3 mt-6 border-t pt-4">
            <button class="btn btn-soft btn-secondary" @click="showApproveModal = false">ຍົກເລີກ</button>
            <button class="btn btn-success" @click="confirmApproveLoan">ອະນຸມັດສິນເຊື່ອ</button>
          </div>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div v-if="showRejectModal && loanToAction"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
          <h3 class="font-bold text-xl mb-4 text-error flex items-center gap-2">
            <span class="icon-[tabler--x] size-6"></span> ຢືນຢັນການປະຕິເສດ
          </h3>
          <p class="py-4 text-gray-700 dark:text-gray-300">
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການປະຕິເສດສິນເຊື່ອຂອງລູກຄ້າຊື່: <br>
            <strong>"{{ getCustomerName(loanToAction) }}"</strong> ?
          </p>
          <div class="flex justify-end gap-3 mt-6 border-t pt-4">
            <button class="btn btn-soft btn-secondary" @click="showRejectModal = false">ຍົກເລີກ</button>
            <button class="btn btn-error" @click="confirmRejectLoan">ປະຕິເສດສິນເຊື່ອ</button>
          </div>
        </div>
      </div>
    </teleport>


    <teleport to="body">
      <div v-if="showChecklistModal && selectedChecklistLoan"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">

          <div
            class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <h3 class="text-lg font-bold flex items-center gap-2 text-gray-800 dark:text-white">
              <span class="icon-[tabler--clipboard-check] text-info size-6"></span>
              ຟອມກວດສອບ ແລະ ປະເມີນສິນເຊື່ອ (Checklist)
            </h3>
            <button @click="closeChecklistModal"
              class="btn btn-ghost btn-sm btn-circle text-gray-500 hover:text-error hover:bg-error/10">
              <span class="icon-[tabler--x] size-5"></span>
            </button>
          </div>

          <div class="tabs tabs-bordered px-4 pt-2 bg-gray-50 dark:bg-gray-900 overflow-x-auto">
            <a class="tab tab-lg whitespace-nowrap"
              :class="{ 'tab-active font-bold text-primary border-b-2 border-primary': checklistTab === 'basic' }"
              @click="checklistTab = 'basic'">1. ຂໍ້ມູນທົ່ວໄປ & ວຽກ</a>
            <a class="tab tab-lg whitespace-nowrap"
              :class="{ 'tab-active font-bold text-primary border-b-2 border-primary': checklistTab === 'call' }"
              @click="checklistTab = 'call'">2. ໂທຢືນຢັນ</a>
            <a class="tab tab-lg whitespace-nowrap"
              :class="{ 'tab-active font-bold text-primary border-b-2 border-primary': checklistTab === 'cib' }"
              @click="checklistTab = 'cib'">3. ກວດ CIB</a>
            <a class="tab tab-lg whitespace-nowrap"
              :class="{ 'tab-active font-bold text-primary border-b-2 border-primary': checklistTab === 'field' }"
              @click="checklistTab = 'field'">4. ລົງພື້ນທີ່ຈິງ</a>
            <a class="tab tab-lg whitespace-nowrap"
              :class="{ 'tab-active font-bold text-primary border-b-2 border-primary': checklistTab === 'income' }"
              @click="checklistTab = 'income'">5. ປະເມີນລາຍຮັບ (DSR)</a>
          </div>

          <div class="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800">

            <div v-if="checklistTab === 'basic'" class="space-y-6 animate-in fade-in">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="border rounded-lg p-4 bg-white dark:bg-base-100 shadow-sm">
                  <h4 class="font-bold border-b pb-2 mb-4">ສ່ວນທີ 1: ການຢືນຢັນຂໍ້ມູນລູກຄ້າ ແລະ ສິນເຊື່ອ</h4>
                  <div class="space-y-3">
                    <div class="form-control">
                      <label class="label"><span class="label-text">ວິທີການຕິດຕໍ່ລູກຄ້າ</span></label>
                      <select v-model="formBasic.cus_contact_method" class="select select-bordered select-sm">
                        <option value="face_to_face">ພົບຕໍ່ໜ້າ (Face to Face)</option>
                        <option value="phone">ທາງໂທລະສັບ (Phone)</option>
                      </select>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                      <div class="form-control">
                        <label class="label"><span class="label-text">ຊື່ (ຢືນຢັນແລ້ວ)</span></label>
                        <input v-model="formBasic.verified_first_name" type="text"
                          class="input input-bordered input-sm" />
                      </div>
                      <div class="form-control">
                        <label class="label"><span class="label-text">ນາມສະກຸນ (ຢືນຢັນແລ້ວ)</span></label>
                        <input v-model="formBasic.verified_last_name" type="text"
                          class="input input-bordered input-sm" />
                      </div>
                    </div>
                    <div class="form-control">
                      <label class="label"><span class="label-text">ວັນເດືອນປີເກີດ</span></label>
                      <input v-model="formBasic.verified_dob" type="date" class="input input-bordered input-sm" />
                    </div>
                    <div class="form-control">
                      <label class="label"><span class="label-text">ທີ່ຢູ່ປັດຈຸບັນ (ຢືນຢັນແລ້ວ)</span></label>
                      <textarea v-model="formBasic.verified_address"
                        class="textarea textarea-bordered textarea-sm"></textarea>
                    </div>

                    <div class="divider my-1"></div>
                    <div class="form-control">
                      <label class="label"><span class="label-text text-primary font-bold">ປະເພດສິນຄ້າ
                          (ຢືນຢັນແລ້ວ)</span></label>
                      <input v-model="formBasic.verified_product_type" type="text"
                        class="input input-bordered input-sm border-primary" placeholder="ເຊັ່ນ: ລົດຈັກ, ໂທລະສັບ..." />
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                      <div class="form-control">
                        <label class="label"><span class="label-text">ລາຄາສິນຄ້າຈິງ (ກີບ)</span></label>
                        <input v-model.number="formBasic.verified_price" type="number"
                          class="input input-bordered input-sm text-right" />
                      </div>
                      <div class="form-control">
                        <label class="label"><span class="label-text">ເງິນວາງດາວ (ກີບ)</span></label>
                        <input v-model.number="formBasic.verified_down_payment" type="number"
                          class="input input-bordered input-sm text-right" />
                      </div>
                    </div>
                    <div class="form-control">
                      <label class="label"><span class="label-text text-success font-bold">ຄ່າງວດທີ່ແຈ້ງລູກຄ້າ
                          (ກີບ)</span></label>
                      <input v-model.number="formBasic.verified_monthly_pay" type="number"
                        class="input input-bordered input-sm text-right text-success font-bold" />
                    </div>
                  </div>
                </div>

                <div class="space-y-6">
                  <div class="border rounded-lg p-4 bg-white dark:bg-base-100 shadow-sm">
                    <h4 class="font-bold border-b pb-2 mb-4">ສ່ວນທີ 2: ເອກະສານປະກອບ</h4>
                    <div class="flex flex-col gap-2">
                      <label class="cursor-pointer label justify-start gap-3">
                        <input type="checkbox" v-model="formBasic.has_id_card"
                          class="checkbox checkbox-primary checkbox-sm" />
                        <span>ບັດປະຈຳຕົວ / Passport</span>
                      </label>
                      <label class="cursor-pointer label justify-start gap-3">
                        <input type="checkbox" v-model="formBasic.has_census_book"
                          class="checkbox checkbox-primary checkbox-sm" />
                        <span>ປຶ້ມສຳມະໂນຄົວ</span>
                      </label>
                      <label class="cursor-pointer label justify-start gap-3">
                        <input type="checkbox" v-model="formBasic.has_income_doc"
                          class="checkbox checkbox-primary checkbox-sm" />
                        <span>ເອກະສານຢືນຢັນລາຍຮັບ (Statement/ໃບເງິນເດືອນ)</span>
                      </label>
                      <label class="cursor-pointer label justify-start gap-3">
                        <input type="checkbox" v-model="formBasic.has_other_doc"
                          class="checkbox checkbox-primary checkbox-sm" />
                        <span>ເອກະສານອື່ນໆ</span>
                      </label>
                      <input v-if="formBasic.has_other_doc" v-model="formBasic.other_doc_detail" type="text"
                        placeholder="ລະບຸເອກະສານອື່ນໆ..." class="input input-bordered input-sm mt-1" />
                    </div>
                    <div class="form-control mt-4">
                      <label class="label"><span
                          class="label-text font-bold">ປະເມີນຄວາມໜ້າເຊື່ອຖືຂອງລູກຄ້າ</span></label>
                      <select v-model="formBasic.cus_credibility_assessment" class="select select-bordered select-sm">
                        <option value="reliable">ໜ້າເຊື່ອຖື (Reliable)</option>
                        <option value="unreliable">ບໍ່ໜ້າເຊື່ອຖື (Unreliable)</option>
                      </select>
                    </div>
                  </div>

                  <div class="border rounded-lg p-4 bg-white dark:bg-base-100 shadow-sm">
                    <h4 class="font-bold border-b pb-2 mb-4">ສ່ວນທີ 3: ຂໍ້ມູນທີ່ເຮັດວຽກ (ຈາກການສຳພາດ)</h4>
                    <div class="space-y-3">
                      <div class="form-control">
                        <label class="label"><span class="label-text">ຊື່ບໍລິສັດ/ບ່ອນເຮັດວຽກ</span></label>
                        <input v-model="formBasic.work_company_name" type="text"
                          class="input input-bordered input-sm" />
                      </div>
                      <div class="grid grid-cols-2 gap-3">
                        <div class="form-control">
                          <label class="label"><span class="label-text">ຕຳແໜ່ງ</span></label>
                          <input v-model="formBasic.work_position" type="text" class="input input-bordered input-sm" />
                        </div>
                        <div class="form-control">
                          <label class="label"><span class="label-text">ອາຍຸການ (ປີ)</span></label>
                          <input v-model.number="formBasic.work_years" type="number"
                            class="input input-bordered input-sm" />
                        </div>
                      </div>
                      <div class="form-control">
                        <label class="label"><span class="label-text">ເງິນເດືອນທີ່ແຈ້ງ (ກີບ)</span></label>
                        <input v-model.number="formBasic.work_salary" type="number"
                          class="input input-bordered input-sm text-right font-bold" />
                      </div>
                      <div class="form-control">
                        <label class="label"><span
                            class="label-text font-bold">ປະເມີນຄວາມໜ້າເຊື່ອຖືຂອງບ່ອນເຮັດວຽກ</span></label>
                        <select v-model="formBasic.workplace_assessment" class="select select-bordered select-sm">
                          <option value="good">ດີ (Good)</option>
                          <option value="moderate">ປານກາງ (Moderate)</option>
                          <option value="bad">ບໍ່ດີ / ບໍ່ຊັດເຈນ (Bad)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-control mt-6 pt-4 border-t border-gray-300">
                <label class="label"><span class="label-text font-bold text-primary">ສະຖານະການກວດສອບ (Verification
                    Status)</span></label>
                <div class="flex items-center gap-4">
                  <select v-model="formBasic.status"
                    class="select select-bordered select-primary w-full max-w-xs font-bold">
                    <option value="draft">ບັນທຶກຮ່າງ (Draft)</option>
                    <option value="completed">ກວດສອບສຳເລັດ (Completed)</option>
                  </select>
                  <span v-if="formBasic.status === 'completed'" class="text-success flex items-center gap-1">
                    <span class="icon-[tabler--circle-check-filled] size-5"></span> ພ້ອມສຳລັບຂັ້ນຕອນຕໍ່ໄປ
                  </span>
                </div>
              </div>
            </div>

            <div v-else-if="checklistTab === 'call'" class="space-y-6 animate-in fade-in">
              <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex justify-between items-center shadow-sm">
                <div>
                  <h4 class="font-bold text-blue-800 dark:text-blue-300">ບັນທຶກການໂທຢືນຢັນ</h4>
                  <p class="text-sm text-blue-600">ບັນທຶກການໂທຫາບຸກຄົນອ້າງອີງ, ບ່ອນເຮັດວຽກ ຫຼື ຜູ້ຄ້ຳປະກັນ</p>
                </div>
                <button class="btn btn-primary btn-sm" @click="addCallRecord">
                  <span class="icon-[tabler--plus] size-4"></span> ເພີ່ມປະຫວັດການໂທ
                </button>
              </div>

              <div v-for="(call, index) in formCalls" :key="index"
                class="border rounded-lg p-4 relative bg-white dark:bg-base-100 shadow-sm">
                <button class="btn btn-ghost btn-xs btn-circle absolute top-2 right-2 text-error"
                  @click="removeCallRecord(index)">
                  <span class="icon-[tabler--trash] size-4"></span>
                </button>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ເປົ້າໝາຍການໂທ</span></label>
                    <select v-model="call.call_target" class="select select-bordered select-sm">
                      <option value="workplace">ບ່ອນເຮັດວຽກ (HR/ໝູ່ຮ່ວມງານ)</option>
                      <option value="home">ທາງບ້ານ / ຍາດພີ່ນ້ອງ</option>
                      <option value="guarantor">ຜູ້ຄ້ຳປະກັນ</option>
                    </select>
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ຊື່ຜູ້ຮັບສາຍ</span></label>
                    <input v-model="call.contact_name" type="text" class="input input-bordered input-sm" />
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ເບີໂທຕິດຕໍ່</span></label>
                    <input v-model="call.contact_phone" type="text" class="input input-bordered input-sm" />
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ຄວາມສຳພັນ / ຕຳແໜ່ງ</span></label>
                    <input v-model="call.relationship" type="text" placeholder="ເຊັ່ນ: ພໍ່, ຫົວໜ້າງານ"
                      class="input input-bordered input-sm" />
                  </div>
                  <div class="form-control">
                    <label class="label"><span
                        class="label-text font-medium">ຂໍ້ມູນຕົງກັບທີ່ລູກຄ້າແຈ້ງບໍ?</span></label>
                    <select v-model="call.is_info_matching" class="select select-bordered select-sm">
                      <option :value="true">ຕົງກັນ (Yes)</option>
                      <option :value="false">ບໍ່ຕົງກັນ (No)</option>
                    </select>
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium">ສະຖານະການໂທ</span></label>
                    <select v-model="call.call_status" class="select select-bordered select-sm">
                      <option value="completed">ສຳເລັດ (ໂທຕິດ ແລະ ຄຸຍແລ້ວ)</option>
                      <option value="no_answer">ບໍ່ຮັບສາຍ (No Answer)</option>
                      <option value="pending_callback">ລໍຖ້າໂທກັບ (Pending Callback)</option>
                    </select>
                  </div>
                  <div class="form-control md:col-span-3">
                    <label class="label"><span class="label-text font-medium">ໝາຍເຫດ / ບົດສົນທະນາຫຍໍ້</span></label>
                    <input v-model="call.remark" type="text" class="input input-bordered input-sm w-full" />
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="checklistTab === 'cib'" class="space-y-6 animate-in fade-in">
              <div class="border rounded-lg p-6 max-w-3xl mx-auto bg-white dark:bg-base-100 shadow-sm">
                <div class="flex items-center gap-3 mb-6 border-b pb-4">
                  <span class="icon-[tabler--report-money] size-8 text-primary"></span>
                  <h4 class="font-bold text-lg">ຜົນການກວດສອບເຄຣດິດບູໂຣ (CIB)</h4>
                </div>

                <div class="grid grid-cols-2 gap-6">
                  <div class="form-control p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <label class="label"><span class="label-text font-bold text-green-700">ປະຫວັດດີ (ຊັ້ນ A, B)
                        ຈຳນວນ:</span></label>
                    <div class="flex gap-2">
                      <input v-model.number="formCIB.good_history_count" type="number" class="input input-bordered w-20"
                        min="0" />
                      <span class="mt-3">ບັນຊີ</span>
                    </div>
                    <label class="label mt-2"><span class="label-text">ຈາກສະຖາບັນການເງິນ:</span></label>
                    <input v-model="formCIB.good_history_institutions" type="text" placeholder="ເຊັ່ນ: BCEL, JDB..."
                      class="input input-bordered input-sm" />
                  </div>

                  <div class="form-control p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <label class="label"><span class="label-text font-bold text-red-700">ປະຫວັດຊ້າ/ໜີ້ເສຍ (C, D, E)
                        ຈຳນວນ:</span></label>
                    <div class="flex gap-2">
                      <input v-model.number="formCIB.bad_history_count" type="number" class="input input-bordered w-20"
                        min="0" />
                      <span class="mt-3">ບັນຊີ</span>
                    </div>
                    <label class="label mt-2"><span class="label-text">ຈາກສະຖາບັນການເງິນ:</span></label>
                    <input v-model="formCIB.bad_history_institutions" type="text" placeholder="ລະບຸຊື່ທະນາຄານ..."
                      class="input input-bordered input-sm" />
                  </div>
                </div>

                <div class="divider"></div>

                <div class="form-control">
                  <label class="cursor-pointer label justify-start gap-4">
                    <input type="checkbox" v-model="formCIB.is_existing_customer" class="toggle toggle-primary" />
                    <span class="font-bold">ເຄີຍເປັນລູກຄ້າເກົ່າຂອງ INSEE ມາກ່ອນບໍ?</span>
                  </label>
                </div>

                <div v-if="formCIB.is_existing_customer" class="form-control mt-4">
                  <label class="label"><span class="label-text">ສະຖານະໜີ້ເກົ່າຂອງ INSEE</span></label>
                  <select v-model="formCIB.existing_customer_status" class="select select-bordered">
                    <option value="normal">ປົກກະຕິ (ຈ່າຍດີ)</option>
                    <option value="late_payment">ຊັກຊ້າບາງງວດ</option>
                    <option value="bad_debt">ໜີ້ເສຍ (NPL)</option>
                  </select>
                </div>

                <div class="form-control mt-4">
                  <label class="label"><span class="label-text">ໝາຍເຫດເພີ່ມເຕີມ</span></label>
                  <textarea v-model="formCIB.remark" class="textarea textarea-bordered h-24"
                    placeholder="ບົດສະຫຼຸບການປະເມີນ CIB..."></textarea>
                </div>
              </div>
            </div>

            <div v-else-if="checklistTab === 'field'" class="space-y-6 animate-in fade-in">
              <div class="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg flex justify-between items-center shadow-sm">
                <div>
                  <h4 class="font-bold text-amber-800 dark:text-amber-300">ບົດບັນທຶກການລົງພື້ນທີ່ຈິງ (Site Visits)</h4>
                  <p class="text-sm text-amber-600">ສາມາດເພີ່ມໄດ້ຫຼາຍສະຖານທີ່ ເຊັ່ນ: ເຮືອນ, ບ່ອນເຮັດວຽກ</p>
                </div>
                <button class="btn btn-primary btn-sm" @click="addFieldVisit">
                  <span class="icon-[tabler--plus] size-4"></span> ເພີ່ມສະຖານທີ່
                </button>
              </div>

              <div v-for="(visit, index) in formFieldVisits" :key="index"
                class="border rounded-lg p-6 relative bg-white dark:bg-base-100 shadow-sm">
                <button class="btn btn-ghost btn-xs btn-circle absolute top-2 right-2 text-error"
                  @click="removeFieldVisit(index)">
                  <span class="icon-[tabler--trash] size-5"></span>
                </button>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div class="form-control">
                    <label class="label"><span class="label-text font-bold">ປະເພດສະຖານທີ່</span></label>
                    <select v-model="visit.visit_type" class="select select-bordered">
                      <option value="home">ເຮືອນພັກອາໄສ</option>
                      <option value="workplace">ບ່ອນເຮັດວຽກ</option>
                      <option value="other">ສະຖານທີ່ອື່ນໆ (ລະບຸໃນໝາຍເຫດ)</option>
                    </select>
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-bold">ວັນທີລົງພື້ນທີ່</span></label>
                    <input v-model="visit.visit_date" type="datetime-local" class="input input-bordered" />
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-bold">ສະພາບຄວາມເປັນຢູ່ /
                        ລັກສະນະອາຄານ</span></label>
                    <input v-model="visit.living_condition" type="text" placeholder="ເຊັ່ນ: ເຮືອນປູນ 2 ຊັ້ນ, ຫ້ອງແຖວ..."
                      class="input input-bordered" />
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-bold">ທີ່ຢູ່ຕົງກັບເອກະສານແຈ້ງ ຫຼື
                        ບໍ່?</span></label>
                    <select v-model="visit.is_address_correct" class="select select-bordered">
                      <option :value="true">ຕົງກັນ (Yes)</option>
                      <option :value="false">ບໍ່ຕົງກັນ / ຫາບໍ່ພົບ (No)</option>
                    </select>
                  </div>

                  <div class="form-control md:col-span-2 border-t pt-4 mt-2">
                    <label class="label pb-0"><span class="label-text font-bold">ທີ່ຕັ້ງ (GPS Location)</span></label>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div class="flex gap-2">
                        <div class="w-full">
                          <label class="label text-xs"><span class="label-text">Latitude</span></label>
                          <input v-model.number="visit.latitude" type="number" step="any" placeholder="17.XXXXXX"
                            class="input input-bordered input-sm w-full" />
                        </div>
                        <div class="w-full">
                          <label class="label text-xs"><span class="label-text">Longitude</span></label>
                          <input v-model.number="visit.longitude" type="number" step="any" placeholder="102.XXXXXX"
                            class="input input-bordered input-sm w-full" />
                        </div>
                      </div>
                      <div class="flex items-end">
                        <button type="button" class="btn btn-outline btn-info btn-sm w-full gap-2"
                          @click="getCurrentLocation(index)">
                          <span class="icon-[tabler--current-location] size-4"></span> ດຶງທີ່ຕັ້ງປັດຈຸບັນ
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="form-control md:col-span-2 mt-2">
                    <label class="label"><span class="label-text font-bold">ຮູບພາບສະຖານທີ່ຈິງ (ສູງສຸດ 2
                        ຮູບ)</span></label>
                    <div class="grid grid-cols-2 gap-4 mt-2">

                      <div class="border rounded-lg overflow-hidden relative bg-base-200" style="height: 150px;">
                        <div v-if="visit.photo_url_1 || visit.photo_1_preview"
                          class="w-full h-full relative group bg-base-300 flex items-center justify-center">
                          <img :src="visit.photo_1_preview || getFullImageUrl(visit.photo_url_1)"
                            class="max-w-full max-h-full object-contain" />
                          <div
                            class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <button type="button" class="btn btn-error btn-sm btn-circle"
                              @click="removeVisitImage(index, 1)">
                              <span class="icon-[tabler--trash] size-4"></span>
                            </button>
                          </div>
                        </div>
                        <label v-else
                          class="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-base-300 transition-colors">
                          <span class="icon-[tabler--photo-plus] size-8 text-gray-400 mb-2"></span>
                          <span class="text-xs text-gray-500">ຮູບທີ 1 (ປ້າຍບ້ານ/ໜ້າບ້ານ)</span>
                          <input type="file" class="hidden" accept="image/*"
                            @change="(e) => handleVisitImageUpload(index, 1, e)" />
                        </label>
                      </div>

                      <div class="border rounded-lg overflow-hidden relative bg-base-200" style="height: 150px;">
                        <div v-if="visit.photo_url_2 || visit.photo_2_preview"
                          class="w-full h-full relative group bg-base-300 flex items-center justify-center">
                          <img :src="visit.photo_2_preview || getFullImageUrl(visit.photo_url_2)"
                            class="max-w-full max-h-full object-contain" />
                          <div
                            class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <button type="button" class="btn btn-error btn-sm btn-circle"
                              @click="removeVisitImage(index, 2)">
                              <span class="icon-[tabler--trash] size-4"></span>
                            </button>
                          </div>
                        </div>
                        <label v-else
                          class="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-base-300 transition-colors">
                          <span class="icon-[tabler--photo-plus] size-8 text-gray-400 mb-2"></span>
                          <span class="text-xs text-gray-500">ຮູບທີ 2 (ສະພາບລວມ)</span>
                          <input type="file" class="hidden" accept="image/*"
                            @change="(e) => handleVisitImageUpload(index, 2, e)" />
                        </label>
                      </div>

                    </div>
                  </div>

                  <div class="form-control md:col-span-2">
                    <label class="label"><span class="label-text font-bold">ໝາຍເຫດ
                        (ສິ່ງທີ່ພົບເຫັນເພີ່ມເຕີມ)</span></label>
                    <textarea v-model="visit.remarks" class="textarea textarea-bordered"
                      placeholder="ລາຍລະອຽດເພີ່ມເຕີມທີ່ພົບເຫັນ..."></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="checklistTab === 'income'" class="space-y-6 animate-in fade-in">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="border rounded-lg p-4 bg-green-50/50 dark:bg-green-900/10 shadow-sm">
                  <h4 class="font-bold text-green-700 mb-4">1. ການປະເມີນລາຍຮັບ (ລາຍຮັບທີ່ພິສູດໄດ້)</h4>
                  <div class="space-y-3">
                    <div class="form-control">
                      <label class="label"><span class="label-text">ລາຍຮັບສະເລ່ຍຈາກ Statement (ກີບ)</span></label>
                      <input v-model.number="formIncome.average_monthly_income" type="number"
                        class="input input-bordered text-right font-bold text-green-600" />
                    </div>
                    <div class="form-control">
                      <label class="label"><span class="label-text">ລາຍຮັບອື່ນໆທີ່ຢືນຢັນໄດ້ (ກີບ)</span></label>
                      <input v-model.number="formIncome.other_verified_income" type="number"
                        class="input input-bordered text-right" />
                    </div>
                    <div class="divider my-1"></div>
                    <div class="flex justify-between items-center font-bold text-lg">
                      <span>ລວມລາຍຮັບ (A)</span>
                      <span class="text-green-600">{{ formatPrice(totalVerifiedIncome) }}</span>
                    </div>
                  </div>
                </div>

                <div class="border rounded-lg p-4 bg-red-50/50 dark:bg-red-900/10 shadow-sm">
                  <h4 class="font-bold text-red-700 mb-4">2. ພາລະໜີ້ສິນ ແລະ ລາຍຈ່າຍ</h4>
                  <div class="space-y-3">
                    <div class="form-control">
                      <label class="label"><span class="label-text">ຄ່າໃຊ້ຈ່າຍດຳລົງຊີວິດປະເມີນ (ກີບ)</span></label>
                      <input v-model.number="formIncome.estimated_living_expenses" type="number"
                        class="input input-bordered text-right" />
                    </div>
                    <div class="form-control">
                      <label class="label"><span class="label-text">ພາລະໜີ້ສິນເດີມ (ຈາກ CIB) (ກີບ)</span></label>
                      <input v-model.number="formIncome.existing_debt_payments" type="number"
                        class="input input-bordered text-right text-red-500" />
                    </div>
                    <div class="form-control">
                      <label class="label"><span class="label-text font-bold text-primary">ຄ່າງວດໃໝ່ທີ່ສະເໜີຂໍ
                          (ກີບ)</span></label>
                      <input v-model.number="formIncome.proposed_installment" type="number"
                        class="input input-bordered text-right font-bold text-primary border-primary" />
                    </div>
                    <div class="divider my-1"></div>
                    <div class="flex justify-between items-center font-bold text-lg">
                      <span>ລວມພາລະໜີ້ໃໝ່+ເກົ່າ (B)</span>
                      <span class="text-red-500">{{ formatPrice(totalDebtBurden) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="border-2 border-primary rounded-lg p-6 text-center bg-white dark:bg-base-100 shadow-sm">
                <h3 class="text-xl font-bold mb-2">ອັດຕາສ່ວນໜີ້ສິນຕໍ່ລາຍຮັບ (DSR)</h3>
                <div class="text-5xl font-black mb-2"
                  :class="dsrPercentage > 60 ? 'text-error' : (dsrPercentage > 40 ? 'text-warning' : 'text-success')">
                  {{ dsrPercentage.toFixed(2) }}%
                </div>
                <p class="text-gray-500">ສູດຄິດໄລ່: (ລວມພາລະໜີ້ B ÷ ລວມລາຍຮັບ A) × 100</p>
                <div class="mt-4 pt-4 border-t">
                  <div class="form-control max-w-md mx-auto">
                    <label class="label"><span class="label-text font-bold">ວົງເງິນອະນຸມັດສູງສຸດທີ່ເປັນໄປໄດ້
                        (ກີບ)</span></label>
                    <input v-model.number="formIncome.max_approved_amount" type="number"
                      class="input input-bordered text-center text-xl font-bold text-primary" />
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div
            class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3">
            <button class="btn btn-ghost" @click="closeChecklistModal">ປິດ</button>
            <button class="btn btn-primary" @click="saveChecklist" :disabled="isSavingChecklist">
              <span v-if="isSavingChecklist" class="loading loading-spinner loading-xs"></span>
              <span v-else class="icon-[tabler--device-floppy] size-4"></span>
              ບັນທຶກຂໍ້ມູນ {{ checklistTabTitle }}
            </button>
          </div>
        </div>
      </div>
    </teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import Papa from 'papaparse'
import { useLoanApplicationStore } from '@/stores/loanApplication'
import type { LoanApplication, UpdateLoanApplicationDto } from '@/types/loanApplication'
import apiClient from '@/api/apiclient'
import { getFullImageUrl } from '@/utils/url'
import { useChecklistStore } from '@/stores/checklist';
import { checklistApi } from '@/api/checklist';
import { alert } from '@/utils/alert'

const checklistStore = useChecklistStore();
const loanApplicationStore = useLoanApplicationStore()

// Reactive state
const isLoading = computed(() => loanApplicationStore.isLoading)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const dateFrom = ref('')
const dateTo = ref('')

// Modal states
const showDetailsModal = ref(false)
const showCreditScoreModal = ref(false)
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const selectedLoan = ref<LoanApplication | null>(null)
const loanForCreditScore = ref<LoanApplication | null>(null)
const loanToAction = ref<LoanApplication | null>(null)

// Credit score form
const creditScoreForm = reactive({
  monthly_income: 0,
  other_debts: 0,
  age: 0,
  employment_status: ''
})

const creditScoreResult = ref<{
  score: number
  grade: string
  description: string
} | null>(null)

const isCalculating = ref(false)

// Debounce search
let debounceTimer: NodeJS.Timeout | null = null
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

  if (dateFrom.value || dateTo.value) {
    filtered = filtered.filter(loan => {
      const loanDate = new Date(loan.createdAt || '').toISOString().split('T')[0]
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

const formatPrice = (price: number | string | undefined): string => {
  const numPrice = Number(price || 0)
  return new Intl.NumberFormat('lo-LA', {
    style: 'currency',
    currency: 'LAK'
  }).format(numPrice)
}

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('lo-LA')
}

const getScoreColorClass = (score: number): string => {
  if (score >= 750) return 'text-success'
  if (score >= 650) return 'text-info'
  if (score >= 550) return 'text-warning'
  return 'text-error'
}


// ==========================================
// 🟢 CHECKLIST MODAL STATES & LOGIC 🟢
// ==========================================

const showChecklistModal = ref(false)
const selectedChecklistLoan = ref<LoanApplication | null>(null)
const checklistTab = ref<'basic' | 'call' | 'cib' | 'field' | 'income'>('basic')
const isSavingChecklist = ref(false)

const checklistTabTitle = computed(() => {
  const titles = {
    basic: 'ຂໍ້ມູນທົ່ວໄປ',
    call: 'ການໂທຢືນຢັນ',
    cib: 'ປະຫວັດ CIB',
    field: 'ການລົງພື້ນທີ່',
    income: 'ການປະເມີນລາຍຮັບ'
  }
  return titles[checklistTab.value]
})

// 1. Basic Form
const formBasic = reactive({
  cus_contact_method: 'phone',
  verified_first_name: '',
  verified_last_name: '',
  verified_dob: '',
  verified_address: '',
  verified_product_type: '',
  verified_price: 0,
  verified_down_payment: 0,
  verified_monthly_pay: 0,
  has_id_card: false,
  has_census_book: false,
  has_income_doc: false,
  has_other_doc: false,
  other_doc_detail: '',
  cus_credibility_assessment: 'reliable',
  work_company_name: '',
  work_position: '',
  work_years: 0,
  work_salary: 0,
  workplace_assessment: 'good',
  status: 'draft'
})

// 2. Call Logs
interface CallRecord {
  id?: number;
  call_target: string;
  contact_name: string;
  contact_phone: string;
  relationship: string;
  is_info_matching: boolean;
  call_status: string;
  remark: string;
}
const formCalls = ref<CallRecord[]>([])

const addCallRecord = () => {
  formCalls.value.push({
    call_target: 'workplace', contact_name: '', contact_phone: '', relationship: '',
    is_info_matching: true, call_status: 'completed', remark: ''
  })
}
const removeCallRecord = (index: number) => {
  formCalls.value.splice(index, 1)
}

// 3. CIB Form
const formCIB = reactive({
  good_history_count: 0,
  good_history_institutions: '',
  bad_history_count: 0,
  bad_history_institutions: '',
  is_existing_customer: false,
  existing_customer_status: 'normal',
  remark: ''
})

// 4. Field Visit Form
interface FieldVisitRecord {
  id?: number;
  visit_type: string;
  visit_date: string;
  living_condition: string;
  is_address_correct: boolean;
  remarks: string;
  latitude: number | null;
  longitude: number | null;
  photo_url_1?: string | null;
  photo_url_2?: string | null;
  photo_1_file: File | null;
  photo_1_preview: string | null;
  photo_2_file: File | null;
  photo_2_preview: string | null;
}
const formFieldVisits = ref<FieldVisitRecord[]>([])

const addFieldVisit = () => {
  formFieldVisits.value.push({
    visit_type: 'home',
    visit_date: new Date().toISOString().slice(0, 16),
    living_condition: '',
    is_address_correct: true,
    remarks: '',
    latitude: null,
    longitude: null,
    photo_1_file: null,
    photo_1_preview: null,
    photo_2_file: null,
    photo_2_preview: null
  })
}

const removeFieldVisit = (index: number) => {
  formFieldVisits.value.splice(index, 1)
}

// 5. Income Assessment Form
const formIncome = reactive({
  average_monthly_income: 0,
  other_verified_income: 0,
  estimated_living_expenses: 0,
  existing_debt_payments: 0,
  proposed_installment: 0,
  max_approved_amount: 0
})

const getCurrentLocation = (index: number) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        formFieldVisits.value[index].latitude = position.coords.latitude;
        formFieldVisits.value[index].longitude = position.coords.longitude;
      },
      (error) => {
        let msg = "ເກີດຂໍ້ຜິດພາດໃນການດຶງທີ່ຕັ້ງ";
        if (error.code === 1) msg = "ກະລຸນາອະນຸຍາດການເຂົ້າເຖິງ Location (GPS) ໃນ Browser ກ່ອນ";
        alert.error(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  } else {
    alert.error("Browser ຂອງທ່ານບໍ່ຮອງຮັບລະບົບ GPS");
  }
}

const handleVisitImageUpload = (index: number, photoNum: 1 | 2, event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert.error('ຂະໜາດຮູບພາບຕ້ອງນ້ອຍກວ່າ 5MB');
    target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    if (photoNum === 1) {
      formFieldVisits.value[index].photo_1_file = file;
      formFieldVisits.value[index].photo_1_preview = e.target?.result as string;
    } else {
      formFieldVisits.value[index].photo_2_file = file;
      formFieldVisits.value[index].photo_2_preview = e.target?.result as string;
    }
    target.value = '';
  };
  reader.readAsDataURL(file);
}

const removeVisitImage = (index: number, photoNum: 1 | 2) => {
  if (photoNum === 1) {
    formFieldVisits.value[index].photo_1_file = null;
    formFieldVisits.value[index].photo_1_preview = null;
    formFieldVisits.value[index].photo_url_1 = null;
  } else {
    formFieldVisits.value[index].photo_2_file = null;
    formFieldVisits.value[index].photo_2_preview = null;
    formFieldVisits.value[index].photo_url_2 = null;
  }
}

const totalVerifiedIncome = computed(() => {
  return Number(formIncome.average_monthly_income) + Number(formIncome.other_verified_income)
})

const totalDebtBurden = computed(() => {
  return Number(formIncome.existing_debt_payments) + Number(formIncome.proposed_installment)
})

const dsrPercentage = computed(() => {
  if (totalVerifiedIncome.value <= 0) return 0
  return (totalDebtBurden.value / totalVerifiedIncome.value) * 100
})

// === Fetch Data Before Opening Modal ===
const fetchChecklistData = async (loanId: number) => {
  try {
    const res = await apiClient.get(`/checklist/summary/${loanId}`);
    const summaryData = res.data?.data;
    console.log("Fetched checklist summary data:", summaryData);

    if (summaryData) {
      if (summaryData.basic_verification) {
        Object.assign(formBasic, summaryData.basic_verification);
        formBasic.has_id_card = !!summaryData.basic_verification.has_id_card;
        formBasic.has_census_book = !!summaryData.basic_verification.has_census_book;
        formBasic.has_income_doc = !!summaryData.basic_verification.has_income_doc;
        formBasic.has_other_doc = !!summaryData.basic_verification.has_other_doc;
      }

      if (summaryData.call_verifications && summaryData.call_verifications.length > 0) {
        formCalls.value = summaryData.call_verifications;
      } else {
        formCalls.value = [];
        addCallRecord();
      }

      if (summaryData.cib_check) {
        Object.assign(formCIB, summaryData.cib_check);
      }

      if (summaryData.field_visits && summaryData.field_visits.length > 0) {
        formFieldVisits.value = summaryData.field_visits.map((item: any) => ({
          ...item,
          visit_date: item.visit_date ? new Date(item.visit_date).toISOString().slice(0, 16) : '',
          photo_1_file: null,
          photo_1_preview: null,
          photo_2_file: null,
          photo_2_preview: null
        }));
      } else {
        formFieldVisits.value = [];
        addFieldVisit();
      }

      if (summaryData.income_assessment) {
        Object.assign(formIncome, summaryData.income_assessment);
      }
    } else {
      formCalls.value = [];
      addCallRecord();
      formFieldVisits.value = [];
      addFieldVisit();
    }

  } catch (error) {
    console.error("Error fetching checklist data", error);
    formCalls.value = [];
    addCallRecord();
    formFieldVisits.value = [];
    addFieldVisit();
  }
}

// ==========================================
// ✅ ฟังก์ชันเปิด Modal และทำ Mapping ที่ถูกต้อง
// ==========================================
const openChecklistModal = async (loan: LoanApplication) => {
  selectedChecklistLoan.value = loan;
  checklistTab.value = 'basic';

  await checklistStore.fetchSummary(loan.id);
  const raw = (checklistStore.summaryData as any);
  const dbData = raw && typeof raw === 'object' && 'value' in raw ? raw.value : raw;

  if (dbData?.basic_verification) {
    Object.assign(formBasic, dbData.basic_verification);
    formBasic.has_id_card = Boolean(dbData.basic_verification.has_id_card);
    formBasic.has_census_book = Boolean(dbData.basic_verification.has_census_book);
    formBasic.has_income_doc = Boolean(dbData.basic_verification.has_income_doc);
    formBasic.has_other_doc = Boolean(dbData.basic_verification.has_other_doc);

    const workInfo = loan.customer?.customer_work_infos?.[0];
    formBasic.verified_first_name = formBasic.verified_first_name || loan.customer?.first_name || '';
    formBasic.verified_last_name = formBasic.verified_last_name || loan.customer?.last_name || '';
    formBasic.verified_dob = formBasic.verified_dob || (loan.customer?.date_of_birth ? new Date(loan.customer.date_of_birth).toISOString().slice(0, 10) : '');
    formBasic.verified_address = formBasic.verified_address || loan.customer?.address || '';
    formBasic.verified_product_type = formBasic.verified_product_type || loan.product?.product_name || '';
    formBasic.verified_price = formBasic.verified_price || Number(loan.total_amount) || 0;
    formBasic.verified_down_payment = formBasic.verified_down_payment || Number(loan.down_payment) || 0;
    formBasic.verified_monthly_pay = formBasic.verified_monthly_pay || Number(loan.monthly_pay) || 0;
    formBasic.work_company_name = formBasic.work_company_name || workInfo?.company_name || '';
    formBasic.work_position = formBasic.work_position || workInfo?.position || '';
    formBasic.work_years = formBasic.work_years || workInfo?.duration_years || 0;
    formBasic.work_salary = formBasic.work_salary || Number(workInfo?.salary || 0);

  } else {
    let fullDetails: LoanApplication | null = null;
    try {
      fullDetails = await loanApplicationStore.fetchLoanApplicationById(loan.id)
    } catch (error) {
      console.error("Error fetching full loan details:", error);
    }
    const workInfo = fullDetails?.customer?.customer_work_infos?.[0];
    Object.assign(formBasic, {
      cus_contact_method: 'phone',
      verified_first_name: fullDetails?.customer?.first_name || '',
      verified_last_name: fullDetails?.customer?.last_name || '',
      verified_dob: fullDetails?.customer?.date_of_birth ? new Date(fullDetails.customer.date_of_birth).toISOString().slice(0, 10) : '',
      verified_address: loan.customer?.address || '',
      verified_product_type: loan.product?.product_name || '',
      verified_price: Number(loan.total_amount) || 0,
      verified_down_payment: Number(loan.down_payment) || 0,
      verified_monthly_pay: Number(loan.monthly_pay) || 0,
      work_company_name: workInfo?.company_name || '',
      work_position: workInfo?.position || '',
      work_years: workInfo?.duration_years || 0,
      work_salary: Number(workInfo?.salary || 0),
      has_id_card: false, has_census_book: false, has_income_doc: false, has_other_doc: false,
      other_doc_detail: '', cus_credibility_assessment: 'reliable', workplace_assessment: 'good', status: 'draft'
    });
  }

  if (dbData?.call_verifications && dbData.call_verifications.length > 0) {
    formCalls.value = [...dbData.call_verifications];
  } else {
    formCalls.value = [];
    addCallRecord();
  }

  if (dbData?.cib_check) {
    Object.assign(formCIB, dbData.cib_check);
  } else {
    Object.assign(formCIB, {
      good_history_count: 0, good_history_institutions: '', bad_history_count: 0, bad_history_institutions: '',
      is_existing_customer: false, existing_customer_status: 'normal', remark: ''
    });
  }

  if (dbData?.field_visits && dbData.field_visits.length > 0) {
    formFieldVisits.value = dbData.field_visits.map((item: any) => ({
      ...item, visit_date: item.visit_date ? new Date(item.visit_date).toISOString().slice(0, 16) : '',
      photo_1_file: null, photo_1_preview: null, photo_2_file: null, photo_2_preview: null
    }));
  } else {
    formFieldVisits.value = [];
    addFieldVisit();
  }

  if (dbData?.income_assessment) {
    Object.assign(formIncome, dbData.income_assessment);
  } else {
    Object.assign(formIncome, {
      average_monthly_income: Number(loan.customer?.income_per_month || 0),
      existing_debt_payments: Number(loan.customer?.other_debts || 0),
      proposed_installment: Number(loan.monthly_pay || 0),
      max_approved_amount: Number(loan.total_amount || 0),
      other_verified_income: 0, estimated_living_expenses: 0
    });
  }

  showChecklistModal.value = true;
};

// ==========================================
// 🟢 ຊຸດຟັງຊັນບັນທຶກຂໍ້ມູນແຕ່ລະ Tab
// ==========================================
const saveBasicInfo = async (loanId: number) => {
  isSavingChecklist.value = true;
  const formData = {
    ...formBasic,
    full_name: `${formBasic.verified_first_name} ${formBasic.verified_last_name}`.trim()
  }
  try {
    await checklistApi.saveBasicInfo(loanId, formData);
    alert.success('ບັນທຶກຂໍ້ມູນສຳເລັດ', `ຂໍ້ມູນພື້ນຖານຂອງເລກທີ່ສິນເຊື່ອ ${selectedChecklistLoan.value?.loan_id || ''} ຖືກບັນທຶກແລ້ວ.`);
  } catch (err) {
    console.error("Failed to save Basic Info:", err);
    alert.error('ບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ', 'ກະລຸນາລອງໃໝ່ອີກຄັ້ງ.');
  } finally {
    isSavingChecklist.value = false;
  }
}

const saveCallRecords = async (loanId: number) => {
  isSavingChecklist.value = true;
  try {
    const result = await checklistApi.saveCallRecords(loanId, { calls: formCalls.value });
    alert.success('ບັນທຶກການໂທສຳເລັດ', `ບັນທຶກສຳເລັດແລ້ວ.`);
    await fetchChecklistData(loanId);
  } catch (err) {
    console.error("Failed to save call records:", err);
    alert.error('ບັນທຶກຂໍ້ມູນການໂທບໍ່ສຳເລັດ');
  } finally {
    isSavingChecklist.value = false;
  }
}

const saveCIBInfo = async (loanId: number) => {
  isSavingChecklist.value = true;
  try {
    await checklistApi.saveCIBInfo(loanId, formCIB);
    alert.success('ບັນທຶກຂໍ້ມູນ CIB ສຳເລັດ');
  } catch (err) {
    console.error("Failed to save CIB info:", err);
    alert.error('ບັນທຶກຂໍ້ມູນ CIB ບໍ່ສຳເລັດ');
  } finally {
    isSavingChecklist.value = false;
  }
}

// 🟢 ✅ ອັບເດດ: ຟັງຊັນອັບໂຫຼດຮູບກ່ອນບັນທຶກ Field Visits ✅ 🟢
const saveFieldVisits = async (loanId: number) => {
  if (!selectedChecklistLoan.value) return;
  const customerId = selectedChecklistLoan.value.customer_id; // ຕ້ອງການໃຊ້ເປັນ path
  isSavingChecklist.value = true;

  try {
    // 1. ສ້າງ Array ໃໝ່ເພື່ອເກັບຂໍ້ມູນທີ່ຈະສົ່ງເຂົ້າຖານຂໍ້ມູນ (ບໍ່ເອົາ File)
    const processedVisits = [];

    for (const visit of formFieldVisits.value) {
      let finalPhoto1 = visit.photo_url_1;
      let finalPhoto2 = visit.photo_url_2;

      // ຖ້າມີການເລືອກໄຟລ໌ໃໝ່ (photo_1 ຫຼື photo_2)
      if (visit.photo_1_file || visit.photo_2_file) {
        const imgFormData = new FormData();
        const uploadedOrder = []; // ໃຊ້ຈື່ວ່າໄຟລ໌ໃດຖືກແນບກ່ອນ-ຫຼັງ ເພື່ອມາ map ຄືນ

        if (visit.photo_1_file) {
          imgFormData.append('files', visit.photo_1_file);
          uploadedOrder.push('photo1');
        }
        if (visit.photo_2_file) {
          imgFormData.append('files', visit.photo_2_file);
          uploadedOrder.push('photo2');
        }

        // ສົ່ງຮູບໄປ API ທີ່ທ່ານຂຽນໄວ້: router.post('/location/:customer_id/image', ...)
        const uploadRes = await apiClient.post(`/upload/location/${customerId}/image`, imgFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log("Upload response:", uploadRes);
        // ຮັບ URL ກັບຄືນມາ (ສົມມຸດວ່າ Backend ສົ່ງມາເປັນ array ຂອງ urls ໃນ .data ຫຼື .urls)
        const uploadedUrls = uploadRes.data?.data.uploaded || uploadRes.data?.urls || [];

        console.log("Uploaded URLs:", uploadedUrls, "Order:", uploadedOrder);

        // Map URL ທີ່ໄດ້ຄືນໃສ່ຊ່ອງ photo ທີ່ຖືກຕ້ອງ
        uploadedOrder.forEach((photoType, index) => {
          if (uploadedUrls[index]) {
            // ✅ ແກ້ໄຂ: ດຶງ file_url ຈາກ object ທີ່ Backend ສົ່ງມາ
            const fileUrl = uploadedUrls[index].file_url;

            if (photoType === 'photo1') {
              finalPhoto1 = fileUrl;
              visit.photo_url_1 = fileUrl; // ອັບເດດໃນຟອມເພື່ອສະແດງຜົນ
            }
            if (photoType === 'photo2') {
              finalPhoto2 = fileUrl;
              visit.photo_url_2 = fileUrl; // ອັບເດດໃນຟອມເພື່ອສະແດງຜົນ
            }
          }
        });
      }

      // ປະກອບຂໍ້ມູນທີ່ພ້ອມບັນທຶກລົງ Database
      processedVisits.push({
        visit_type: visit.visit_type,
        visit_date: visit.visit_date,
        living_condition: visit.living_condition,
        is_address_correct: visit.is_address_correct ? 1 : 0, // ບາງ Database ຕ້ອງການ 1/0
        remarks: visit.remarks,
        latitude: visit.latitude ? String(visit.latitude) : null,
        longitude: visit.longitude ? String(visit.longitude) : null,
        photo_url_1: finalPhoto1, // ✅ ຕອນນີ້ຈະມີ URL ແລ້ວ!
        photo_url_2: finalPhoto2
      });
    }

    // 2. ສົ່ງ Array ທີ່ປະກອບແລ້ວໄປບັນທຶກ
    await checklistApi.saveFieldVisits(loanId, { visits: processedVisits });

    alert.success('ບັນທຶກຂໍ້ມູນສຳເລັດ', 'ການລົງພື້ນທີ່ຈິງຖືກບັນທຶກແລ້ວ.');
    await fetchChecklistData(loanId); // ໂຫຼດຂໍ້ມູນໃໝ່ເພື່ອອັບເດດໜ້າຈໍ

  } catch (err: any) {
    console.error("Failed to save Field Visit:", err);
    alert.error('ບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ', err.message || 'ກະລຸນາກວດສອບການເຊື່ອມຕໍ່ແລ້ວລອງໃໝ່.');
  } finally {
    isSavingChecklist.value = false;
  }
}

const saveIncomeAssessment = async (loanId: number) => {
  isSavingChecklist.value = true;
  try {
    await checklistApi.saveIncomeAssessment(loanId, formIncome);
    alert.success('ບັນທຶກຂໍ້ມູນປະເມີນລາຍຮັບສຳເລັດ');
  } catch (err) {
    console.error("Failed to save Income Assessment:", err);
    alert.error('ບັນທຶກຂໍ້ມູນປະເມີນລາຍຮັບບໍ່ສຳເລັດ');
  } finally {
    isSavingChecklist.value = false;
  }
}

// 🟢 ຟັງຊັນຫຼັກສຳລັບປຸ່ມບັນທຶກໃນ Modal
const saveChecklist = async () => {
  if (!selectedChecklistLoan.value) return;
  const loanId = selectedChecklistLoan.value.id;

  if (checklistTab.value === 'basic') {
    await saveBasicInfo(loanId);
  } else if (checklistTab.value === 'call') {
    await saveCallRecords(loanId);
  } else if (checklistTab.value === 'cib') {
    await saveCIBInfo(loanId);
  } else if (checklistTab.value === 'field') {
    await saveFieldVisits(loanId);
  } else if (checklistTab.value === 'income') {
    await saveIncomeAssessment(loanId);
  }

  await checklistStore.fetchSummary(loanId);
};

const closeChecklistModal = () => {
  showChecklistModal.value = false;
  selectedChecklistLoan.value = null;
  checklistStore.clearData();
};

const getCustomerName = (loan: LoanApplication): string => {
  if (!loan.customer) return '-'
  return `${loan.customer.first_name || ''} ${loan.customer.last_name || ''}`.trim()
}

const getCustomerPhone = (loan: LoanApplication): string => {
  return loan.customer?.phone || '-'
}

const viewLoanDetails = async (loan: LoanApplication) => {
  let fullDetails: LoanApplication | null = null;
  try {
    if (loan.id) {
      fullDetails = await loanApplicationStore.fetchLoanApplicationById(loan.id);
      selectedLoan.value = fullDetails;
      showDetailsModal.value = true;
    } else {
      selectedLoan.value = loan;
      showDetailsModal.value = true;
    }
  } catch (error: any) {
    console.error("Error in viewLoanDetails:", error);
    alert.error("ກະລຸນາກວດສອບຂໍ້ມູນ", "ເນື່ອງຈາກ: " + (error.response?.data?.message || error.message));
  }
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedLoan.value = null
}

const openCreditScoreModal = async (loan: LoanApplication) => {
  try {
    isCalculating.value = true;
    const res = await apiClient.get(`/checklist/summary/${loan.id}`);
    const summaryData = res.data?.data;

    const errorMsg = [];

    if (!summaryData) {
      alert.error('ກະລຸນາກວດສອບຂໍ້ມູນ Checklist ທັງໝົດໃຫ້ຄົບຖ້ວນກ່ອນຄຳນວນຄະແນນ');
      isCalculating.value = false;
      return;
    }

    if (!summaryData.basic_verification) {
      errorMsg.push("- ຍັງບໍ່ໄດ້ບັນທຶກ 'ຂໍ້ມູນທົ່ວໄປ'");
    } else if (summaryData.basic_verification.status !== 'completed') {
      errorMsg.push("- ຂໍ້ມູນທົ່ວໄປຍັງເປັນ 'ບັນທຶກຮ່າງ (Draft)' ກະລຸນາປ່ຽນເປັນ 'ກວດສອບສຳເລັດ'");
    }
    if (!summaryData.call_verifications || summaryData.call_verifications.length === 0) {
      errorMsg.push("- ຍັງບໍ່ມີປະຫວັດ 'ການໂທຢືນຢັນ'");
    }
    if (!summaryData.cib_check) {
      errorMsg.push("- ຍັງບໍ່ໄດ້ບັນທຶກຜົນ 'ກວດ CIB'");
    }
    if (!summaryData.field_visits || summaryData.field_visits.length === 0) {
      errorMsg.push("- ຍັງບໍ່ມີປະຫວັດ 'ລົງພື້ນທີ່ຈິງ'");
    }
    if (!summaryData.income_assessment) {
      errorMsg.push("- ຍັງບໍ່ໄດ້ 'ປະເມີນລາຍຮັບ (DSR)'");
    }

    if (errorMsg.length > 0) {
      alert.error("ບໍ່ສາມາດຄຳນວນຄະແນນໄດ້", "ເນື່ອງຈາກ:\n" + errorMsg.join('\n'));
      isCalculating.value = false;
      return;
    }

    loanForCreditScore.value = loan
    const verifiedIncome = summaryData.income_assessment;
    creditScoreForm.monthly_income = verifiedIncome.average_monthly_income || loan.customer?.income_per_month || 0;
    creditScoreForm.other_debts = verifiedIncome.existing_debt_payments || loan.customer?.other_debts || 0;
    creditScoreForm.age = loan.customer?.age || 0
    creditScoreForm.employment_status = loan.customer?.occupation || ''

    creditScoreResult.value = loan.credit_score ? {
      score: loan.credit_score,
      grade: getGradeFromScore(loan.credit_score),
      description: getDescriptionFromScore(loan.credit_score)
    } : null

    showCreditScoreModal.value = true

  } catch (error) {
    console.error("Error checking checklist validation", error);
    alert.error('ເກີດຂໍ້ຜິດພາດໃນການກວດສອບ Checklist');
  } finally {
    isCalculating.value = false;
  }
}

const closeCreditScoreModal = () => {
  showCreditScoreModal.value = false
  loanForCreditScore.value = null
  creditScoreResult.value = null
}

const calculateCreditScore = async () => {
  if (!loanForCreditScore.value) return
  isCalculating.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))

    let score = 300
    if (creditScoreForm.monthly_income >= 5000000) score += 200
    else if (creditScoreForm.monthly_income >= 3000000) score += 150
    else if (creditScoreForm.monthly_income >= 2000000) score += 100
    else if (creditScoreForm.monthly_income >= 1000000) score += 50

    const dti = creditScoreForm.monthly_income > 0 ? creditScoreForm.other_debts / creditScoreForm.monthly_income : 1
    if (dti <= 0.2) score += 100
    else if (dti <= 0.3) score += 75
    else if (dti <= 0.4) score += 50
    else if (dti <= 0.5) score += 25

    if (creditScoreForm.age >= 40) score += 50
    else if (creditScoreForm.age >= 30) score += 30
    else if (creditScoreForm.age >= 25) score += 20

    if (creditScoreForm.employment_status === 'employed' || creditScoreForm.employment_status.includes('ພະນັກງານ')) score += 75
    else if (creditScoreForm.employment_status === 'self-employed' || creditScoreForm.employment_status.includes('ທຸລະກິດ')) score += 50
    else if (creditScoreForm.employment_status === 'retired') score += 25

    score = Math.max(300, Math.min(850, Math.round(score)))

    creditScoreResult.value = {
      score: score,
      grade: getGradeFromScore(score),
      description: getDescriptionFromScore(score)
    }

    const updateData: UpdateLoanApplicationDto = { credit_score: score }
    if (loanForCreditScore.value) {
      await loanApplicationStore.updateLoanApplication(loanForCreditScore.value.id, updateData)
      await loanApplicationStore.fetchLoanApplications({ status: 'pending', is_confirmed: 1 })
    }
  } catch (error) {
    console.error('Error calculating credit score:', error)
    alert.error('ເກີດຂໍ້ຜິດພາດການຄຳນວນຄະແນນສິນເຊື່ອ')
  } finally {
    isCalculating.value = false
  }
}

const getGradeFromScore = (score: number): string => {
  if (score >= 750) return 'A'
  if (score >= 700) return 'B'
  if (score >= 650) return 'C'
  if (score >= 600) return 'D'
  return 'F'
}

const getDescriptionFromScore = (score: number): string => {
  if (score >= 750) return 'ດີເລີດ'
  if (score >= 700) return 'ດີ'
  if (score >= 650) return 'ປານກາງ'
  if (score >= 600) return 'ຕ່ຳ'
  return 'ຕ່ຳຫຼາຍ'
}

const approveLoan = (loan: LoanApplication) => {
  loanToAction.value = loan
  showApproveModal.value = true
}

const confirmApproveLoan = async () => {
  if (!loanToAction.value) return
  try {
    const updateData: UpdateLoanApplicationDto = { status: 'approved' }
    await loanApplicationStore.updateLoanApplication(loanToAction.value.id, updateData)
    alert.success('ອະນຸມັດສິນເຊື່ອສຳເລັດແລ້ວ!')
    showApproveModal.value = false
    loanApplicationStore.fetchLoanApplications({ status: 'pending' })
  } catch (error) {
    console.error("Error approving loan:", error)
    alert.error('ການອະນຸມັດສິນເຊື່ອຜິດພາດ!')
  } finally {
    loanToAction.value = null
  }
}

const rejectLoan = (loan: LoanApplication) => {
  loanToAction.value = loan
  showRejectModal.value = true
}

const confirmRejectLoan = async () => {
  if (!loanToAction.value) return
  try {
    const updateData: UpdateLoanApplicationDto = { status: 'rejected' }
    await loanApplicationStore.updateLoanApplication(loanToAction.value.id, updateData)
    alert.success('ປະຕິເສດສິນເຊື່ອສຳເລັດແລ້ວ!')
    showRejectModal.value = false
    loanApplicationStore.fetchLoanApplications({ status: 'pending' })
  } catch (error) {
    console.error("Error rejecting loan:", error)
    alert.error('ການປະຕິເສດສິນເຊື່ອຜິດພາດ!')
  } finally {
    loanToAction.value = null
  }
}

const exportToCSV = () => {
  if (!displayedLoans.value.length) return

  const csvData = displayedLoans.value.map(loan => ({
    'ເລກທີ່ສິນເຊື່ອ': loan.loan_id,
    'ຊື່ລູກຄ້າ': getCustomerName(loan),
    'ເບີໂທ': getCustomerPhone(loan),
    'ຈຳນວນເງິນ': formatPrice(loan.total_amount),
    'ດອກເບ້ຍ (%)': loan.interest_rate_at_apply,
    'ໄລຍະເວລາ (ເດືອນ)': loan.loan_period,
    'ຄະແນນສິນເຊື່ອ': loan.credit_score || '-',
    'ວັນທີ່ສ້າງ': formatDate(loan.createdAt)
  }))

  const csv = Papa.unparse(csvData)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `pending_loans_${new Date().toISOString().split('T')[0]}.csv`
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
    await loanApplicationStore.fetchLoanApplications({
      status: 'pending',
      is_confirmed: 1,
    })
  } catch (e) {
    console.error("Failed to load pending loans", e)
  }
})
</script>
