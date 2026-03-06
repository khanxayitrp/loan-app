<template>
  <div class="p-6 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="p-2 bg-primary/10 rounded-lg">
        <span class="icon-[tabler--credit-card] size-6 text-primary"></span>
      </div>
      <div>
        <h2 class="text-xl font-bold text-gray-800 dark:text-white">ສ້າງຮ່າງຂໍສິນເຊື່ອ</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">ສຳລັບລູກຄ້າ walk-in</p>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="tabs tabs-boxed mb-6">
      <button class="tab" :class="{ 'tab-active': activeTab === 'application' }" @click="switchTab('application')">
        <span class="icon-[tabler--shopping-cart] size-4 mr-2"></span>
        ສ້າງຄຳຂໍ
      </button>
      <button class="tab" :class="{ 'tab-active': activeTab === 'documents', 'tab-disabled': !canAccessDocuments }"
        :disabled="!canAccessDocuments" @click="switchTab('documents')">
        <span class="icon-[tabler--file-upload] size-4 mr-2"></span>
        ເອກະສານ
      </button>
    </div>

    <!-- Tab 1: Create Loan Application -->
    <div v-if="activeTab === 'application'"
      class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <!-- Loan Number Display -->
      <div class="form-control mb-6">
        <label class="label">
          <span class="label-text font-medium">ເລກທີ່ຄຳຂໍສິນເຊື່ອ</span>
        </label>
        <input type="text" :value="loanNumber"
          class="input input-bordered w-full bg-gray-100 dark:bg-gray-700 cursor-not-allowed" readonly />
        <p class="text-xs text-gray-500 mt-1">ເລກທີ່ນີ້ຈະຖືກສ້າງອັດຕະໂນມັດເມື່ອທ່ານສົ່ງຄຳຂໍ</p>
      </div>

      <!-- Shop Selection -->
      <div class="form-control mb-6">
        <label class="label">
          <span class="label-text font-medium">ເລືອກຮ້ານ *</span>
        </label>

        <!-- Shop Searchable Dropdown -->
        <div class="relative">
          <input v-model="shopSearch" type="text" placeholder="ພິມຊື່ຮ້ານ..."
            class="input input-bordered w-full pl-10 pr-10" @input="debounceShopSearch" @focus="showShopDropdown = true"
            @blur="handleShopBlur" />
          <span
            class="icon-[tabler--building-store] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
          <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            @click="clearShopSelection">
            <span class="icon-[tabler--x] size-4"></span>
          </button>
        </div>

        <!-- Shop Dropdown -->
        <div v-if="showShopDropdown && filteredShops.length > 0"
          class="absolute z-10 mt-1 w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div v-for="shop in filteredShops" :key="shop.id"
            class="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3"
            @click="selectShop(shop)">
            <div class="w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <span class="icon-[tabler--building-store] size-4 text-gray-400"></span>
            </div>
            <div class="flex-1">
              <div class="font-medium">{{ shop.shop_name }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">{{ shop.owner_name }}</div>
            </div>
          </div>
        </div>

        <!-- No results -->
        <div v-else-if="showShopDropdown && filteredShops.length === 0 && shopSearch"
          class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
          <div class="text-center text-gray-500">ບໍ່ພົບຮ້ານ</div>
        </div>
      </div>

      <!-- Product Selection -->
      <div class="form-control mb-6">
        <label class="label">
          <span class="label-text font-medium">ເລືອກສິນຄ້າ *</span>
        </label>

        <!-- Product Searchable Dropdown -->
        <div class="relative">
          <input v-model="productSearch" type="text" placeholder="ພິມຊື່ສິນຄ້າ ຫຼື ລະຫັດ…"
            class="input input-bordered w-full pl-10 pr-10" :disabled="!selectedShop" @input="debounceProductSearch"
            @focus="showProductDropdown = true" @blur="handleProductBlur" />
          <span class="icon-[tabler--search] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
          <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            :disabled="!selectedProduct" @click="clearProductSelection">
            <span class="icon-[tabler--x] size-4"></span>
          </button>
        </div>

        <!-- Product Dropdown -->
        <div v-if="showProductDropdown && filteredProducts.length > 0"
          class="absolute z-10 mt-1 w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div v-for="product in filteredProducts" :key="product.id"
            class="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3"
            @click="selectProduct(product)">
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
        <div v-else-if="showProductDropdown && filteredProducts.length === 0 && productSearch"
          class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
          <div class="text-center text-gray-500">ບໍ່ພົບສິນຄ້າ</div>
        </div>
      </div>

      <!-- Loan Details (shown when product is selected) -->
      <div v-if="selectedProduct" class="mb-6">
        <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-4">ລາຍລະອຽດສິນເຊື່ອ</h3>
        <!-- ✅ แสดง error ถ้าโหลดไม่สำเร็จ -->
        <div v-if="productTypeStore.error" class="mb-4">
          <div class="alert alert-warning">
            <span class="icon-[tabler--alert-triangle] size-5"></span>
            <span>ບໍ່ສາມາດໂຫຼດຂໍ້ມູນປະເພດສິນຄ້າ: {{ productTypeStore.error }}</span>
          </div>
        </div>

        <!-- Product Info (Read-only) -->
        <div class="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="text-sm text-gray-500 dark:text-gray-400">ສິນຄ້າ</label>
              <p class="font-medium text-gray-800 dark:text-white">
                {{ selectedProduct.product_name }}
              </p>
            </div>
            <!-- Product Type -->
            <div class="flex flex-col">
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                ປະເພດ
              </label>
              <div class="flex items-center gap-2">
                <span class="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {{ productTypeDisplay }}
                </span>
                <span v-if="productTypeStore.isLoading" class="loading loading-spinner loading-xs text-primary">
                </span>
              </div>
            </div>
            <div>
              <label class="text-sm text-gray-500 dark:text-gray-400">ລາຄາສິນຄ້າ</label>
              <p class="font-medium text-primary">
                {{ formatPrice(selectedProduct.price) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Editable Loan Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Down Payment -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ເງີນດາວ (ກີບ)</span>
            </label>
            <input v-model.number="loanDetails.downPayment" type="number" placeholder="ປ້ອນເງີນດາວ"
              class="input input-bordered w-full" :class="{ 'input-error': loanErrors.downPayment }" min="0"
              :max="selectedProduct.price" @input="handleDownPaymentChange" />
            <label v-if="loanErrors.downPayment" class="label text-error">
              <span class="label-text-alt">{{ loanErrors.downPayment }}</span>
            </label>
            <div class="text-xs text-gray-500 mt-1">
              <div>ເງີນດາວ (ກີບ): {{ formatPrice(loanDetails.downPayment) }}</div>
              <div class="text-primary font-medium">
                ເງິນກູ້: {{ formatPrice(loanDetails.totalAmount - loanDetails.downPayment) }}
              </div>
            </div>
          </div>

          <!-- Term Months -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ຈຳນວນງວດ (ເດືອນ) *</span>
            </label>
            <input v-model.number="loanDetails.termMonths" type="number" placeholder="ຈຳນວນງວດ"
              class="input input-bordered w-full" :class="{ 'input-error': loanErrors.termMonths }" min="1" max="60"
              @input="handleTermMonthsChange" />
            <label v-if="loanErrors.termMonths" class="label text-error">
              <span class="label-text-alt">{{ loanErrors.termMonths }}</span>
            </label>
            <div class="text-xs text-gray-500 mt-1">
              ໄລຍະເວລາ: {{ loanDetails.termMonths }} ເດືອນ
            </div>
          </div>

          <!-- Interest Rate (Read-only or editable) -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ດອກເບ້ຍ (%) *</span>
            </label>
            <input v-model.number="loanDetails.interestRate" type="number" placeholder="ດອກເບ້ຍຕໍ່ປີ"
              class="input input-bordered w-full" :class="{ 'input-error': loanErrors.interestRate }" min="0" max="100"
              step="0.01" @input="handleInterestRateChange" />
            <label v-if="loanErrors.interestRate" class="label text-error">
              <span class="label-text-alt">{{ loanErrors.interestRate }}</span>
            </label>
          </div>

          <!-- Monthly Payment (Auto-calculated) -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ຄ່າງວດຕໍ່ເດືອນ (ກີບ)</span>
            </label>
            <input :value="formatPrice(loanDetails.monthlyPayment)" type="text"
              class="input input-bordered w-full bg-gray-100 dark:bg-gray-700 cursor-not-allowed" readonly />
            <div class="text-xs text-gray-500 mt-1">
              ຄ່າງວດ: {{ formatPrice(loanDetails.monthlyPayment) }}/ເດືອນ
            </div>
          </div>
        </div>

        <!-- Loan Summary -->
        <div class="mt-6 p-4 bg-primary/5 dark:bg-primary/10 rounded-lg">
          <h4 class="font-medium text-gray-800 dark:text-white mb-3">ສະຫຼຸບການຜ່ອນ</h4>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">ລາຄາສິນຄ້າ:</span>
              <span class="font-medium">{{ formatPrice(loanDetails.totalAmount) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">ເງີນດາວ:</span>
              <span class="font-medium text-success">-{{ formatPrice(loanDetails.downPayment) }}</span>
            </div>
            <div class="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
              <span class="font-medium">ເງິນກູ້:</span>
              <span class="font-medium text-primary">{{ formatPrice(loanDetails.totalAmount - loanDetails.downPayment)
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">ດອກເບ້ຍທັງໝົດ ({{ loanDetails.interestRate }}%):</span>
              <span class="font-medium text-error">{{ formatPrice(calculateTotalInterest()) }}</span>
            </div>
            <div class="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
              <span class="font-medium">ຍອດຊຳລະທັງໝົດ:</span>
              <span class="font-medium text-primary">{{ formatPrice(calculateTotalPayment()) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">ຄ່າງວດຕໍ່ເດືອນ:</span>
              <span class="font-medium text-primary">{{ formatPrice(loanDetails.monthlyPayment) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">ຈຳນວນງວດ:</span>
              <span class="font-medium">{{ loanDetails.termMonths }} ເດືອນ</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer Information -->
      <div class="space-y-6">
        <h3 class="text-lg font-medium text-gray-800 dark:text-white">ຂໍ້ມູນລູກຄ້າ</h3>

        <div v-if="foundCustomer" class="flex items-center gap-2 text-success">
          <span class="icon-[tabler--check-circle] size-5"></span>
          <span class="text-sm font-medium">ພົບຂໍ້ມູນລູກຄ້າເກົ່າ</span>
        </div>

        <!-- ✅ Phone Search Section -->
        <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div class="flex items-start gap-3">
            <div class="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
              <span class="icon-[tabler--search] size-5 text-blue-600 dark:text-blue-400"></span>
            </div>
            <div class="flex-1">
              <h4 class="font-medium text-blue-900 dark:text-blue-100 mb-2">
                ຄົ້ນຫາຂໍ້ມູນລູກຄ້າເກົ່າ
              </h4>
              <p class="text-sm text-blue-700 dark:text-blue-300 mb-3">
                ປ້ອນເບີໂທລະສັບເພື່ອຄົ້ນຫາຂໍ້ມູນລູກຄ້າທີ່ມີຢູ່ແລ້ວ
              </p>

              <div class="flex gap-2">
                <div class="flex-1">
                  <input v-model="customerSearchPhone" type="tel" placeholder="ປ້ອນເບີໂທລະສັບ (020/20 XXXX XXXX)"
                    class="input input-bordered w-full" :disabled="isSearchingCustomer"
                    @keyup.enter="searchCustomerByPhone" />
                </div>
                <button type="button" class="btn btn-primary" :disabled="!customerSearchPhone || isSearchingCustomer"
                  @click="searchCustomerByPhone">
                  <span v-if="isSearchingCustomer" class="loading loading-spinner loading-xs"></span>
                  <span v-else class="icon-[tabler--search] size-4"></span>
                  <span>ຄົ້ນຫາ</span>
                </button>
              </div>

              <!-- ✅ Search Result Messages -->
              <div v-if="customerSearchMessage" class="mt-2">
                <div class="alert text-sm" :class="{
                  'alert-success': foundCustomer,
                  'alert-info': !foundCustomer && customerSearchMessage
                }">
                  <span class="icon-[tabler--info-circle] size-4"></span>
                  <span>{{ customerSearchMessage }}</span>
                </div>
              </div>

              <!-- ✅ Clear Customer Button -->
              <div v-if="foundCustomer" class="mt-2">
                <button type="button" class="btn btn-sm btn-soft btn-secondary" @click="clearFoundCustomer">
                  <span class="icon-[tabler--x] size-4"></span>
                  ລົບຂໍ້ມູນລູກຄ້າ ແລະ ກໍານົດຂໍ້ມູນໃໝ່
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Basic Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ຊື່ ແລະ ນາມສະກຸນ *</span>
            </label>
            <input v-model="customerForm.full_name" type="text" placeholder="ປ້ອນຊື່ ແລະ ນາມສະກຸນ"
              class="input input-bordered w-full" :class="{ 'input-error': customerErrors.full_name }" required />
            <label v-if="customerErrors.full_name" class="label text-error">
              <span class="label-text-alt">{{ customerErrors.full_name }}</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ເບີໂທລະສັບ *</span>
            </label>
            <input v-model="customerForm.phone" type="tel" placeholder="ປ້ອນເບີໂທລະສັບ"
              class="input input-bordered w-full" :class="{ 'input-error': customerErrors.phone }" required />
            <label v-if="customerErrors.phone" class="label text-error">
              <span class="label-text-alt">{{ customerErrors.phone }}</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ເລກບັດປະຈຳຕົວ *</span>
            </label>
            <input v-model="customerForm.id_card" type="text" placeholder="ປ້ອນເລກບັດປະຈຳຕົວ"
              class="input input-bordered w-full" :class="{ 'input-error': customerErrors.id_card }" required />
            <label v-if="customerErrors.id_card" class="label text-error">
              <span class="label-text-alt">{{ customerErrors.id_card }}</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ອາຍຸ *</span>
            </label>
            <input v-model.number="customerForm.age" type="number" placeholder="ປ້ອນອາຍຸ"
              class="input input-bordered w-full" :class="{ 'input-error': customerErrors.age }" min="18" max="100"
              required />
            <label v-if="customerErrors.age" class="label text-error">
              <span class="label-text-alt">{{ customerErrors.age }}</span>
            </label>
          </div>
        </div>

        <!-- Address -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ທີ່ຢູ່ *</span>
          </label>
          <textarea v-model="customerForm.address" placeholder="ປ້ອນທີ່ຢູ່ຢ່າງລະອຽດ"
            class="textarea textarea-bordered w-full min-h-24" :class="{ 'textarea-error': customerErrors.address }"
            required></textarea>
          <label v-if="customerErrors.address" class="label text-error">
            <span class="label-text-alt">{{ customerErrors.address }}</span>
          </label>
        </div>

        <!-- ✅ Occupation Field (เพิ่มใหม่) -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ອາຊີບ <span class="text-primary">*</span></span>
            <span class="text-xs text-gray-500 ml-1">(ຂໍ້ມູນສຳຄັນສຳລັບການພິຈາລະນາສິນເຊື່ອ)</span>
          </label>
          <input v-model="customerForm.occupation" type="text"
            placeholder="ປ້ອນອາຊີບ (ຕົວຢ່າງ: ພະນັກງານລັດ, ທຸລະກິດສ່ວນຕົວ, ກະສິກອນ, ແຮງງານ)"
            class="input input-bordered w-full" :class="{ 'input-error': customerErrors.occupation }" required />
          <label v-if="customerErrors.occupation" class="label text-error">
            <span class="label-text-alt">{{ customerErrors.occupation }}</span>
          </label>
          <!-- คำแนะนำเพิ่มเติม -->
          <div class="text-xs text-gray-500 mt-1">
            <p>ຕົວຢ່າງ: ພະນັກງານບໍລິສັດ, ຄູ, ແພດ, ທຸລະກິດສ່ວນຕົວ, ກະສິກອນ, ແຮງງານອຸດສາຫະກຳ</p>
          </div>
        </div>

        <!-- Income Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ລາຍຮັບຕໍ່ເດືອນ (ກີບ) *</span>
            </label>
            <input v-model.number="customerForm.monthly_income" type="number" placeholder="ປ້ອນລາຍຮັບຕໍ່ເດືອນ"
              class="input input-bordered w-full" :class="{ 'input-error': customerErrors.monthly_income }" min="0"
              required />
            <div class="text-xs text-gray-500 mt-1">
              <div>ລາຍຮັບຕໍ່ເດືອນ (ກີບ): {{ formatPrice(customerForm.monthly_income) }}</div>
              <!-- <div class="text-primary font-medium">
          ເງິນກູ້: {{ formatPrice(loanDetails.totalAmount - loanDetails.downPayment) }}
        </div> -->
            </div>
            <label v-if="customerErrors.monthly_income" class="label text-error">
              <span class="label-text-alt">{{ customerErrors.monthly_income }}</span>
            </label>
          </div>


          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ໜີ້ສິນອື່ນໆ (ກີບ)</span>
            </label>
            <input v-model.number="customerForm.other_debts" type="number" placeholder="ປ້ອນຈຳນວນໜີ້ສິນອື່ນໆ"
              class="input input-bordered w-full" min="0" />
            <div class="text-xs text-gray-500 mt-1">
              <div>ໜີ້ສິນອື່ນໆ (ກີບ): {{ formatPrice(customerForm.other_debts) }}</div>
              <!-- <div class="text-primary font-medium">
          ເງິນກູ້: {{ formatPrice(loanDetails.totalAmount - loanDetails.downPayment) }}
        </div> -->
            </div>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end mt-8">
        <button type="button" class="btn btn-primary" :disabled="!selectedShop || !selectedProduct || isSubmitting"
          @click="openOtpModal">
          <span v-if="isSubmitting" class="loading loading-spinner loading-xs"></span>
          <span v-else>ສົ່ງຄຳຂໍສິນເຊື່ອ</span>
        </button>
      </div>
    </div>

    <!-- Tab 2: Document Upload -->
    <div v-else-if="activeTab === 'documents'"
      class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-6">ອັບໂຫຼດເອກະສານ</h2>

      <div v-if="!canAccessDocuments" class="text-center py-12">
        <div class="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="icon-[tabler--alert-triangle] size-8 text-warning"></span>
        </div>
        <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-2">ຍັງບໍ່ໄດ້ສົ່ງຄຳຂໍ</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          ກະລຸນາສົ່ງຄຳຂໍສິນເຊື່ອໃນແຖບ "ສ້າງຄຳຂໍ" ກ່ອນ
        </p>
        <button class="btn btn-primary" @click="switchTab('application')">
          ກັບໄປສົ່ງຄຳຂໍ
        </button>
      </div>

      <div v-else class="space-y-6">
        <!-- Required Documents -->
        <div>
          <h3 class="font-medium mb-3">ເອກະສານທີ່ຕ້ອງການ</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="(doc, index) in requiredDocuments" :key="index"
              class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <div>
                  <h4 class="font-medium">{{ doc.name }}</h4>
                  <p class="text-xs text-gray-500">{{ doc.description }}</p>
                </div>
                <span v-if="doc.required" class="badge badge-soft badge-error text-xs">
                  ຕ້ອງການ
                </span>
              </div>

              <div v-if="doc.preview" class="mt-2">
                <div class="relative w-full h-32 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                  <img :src="doc.preview" alt="Document preview" class="w-full h-full object-contain" />
                  <button type="button"
                    class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    @click="removeDocument(index)">
                    ×
                  </button>
                </div>
              </div>

              <div v-else class="mt-2">
                <label
                  class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <span class="icon-[tabler--upload] size-8 text-gray-400 mb-2"></span>
                    <p class="text-sm text-gray-500">ຄລິກເພື່ອອັບໂຫຼດ</p>
                    <p class="text-xs text-gray-500 mt-1">JPG, PNG, PDF (ສູງສຸດ 5MB)</p>
                  </div>
                  <input type="file" class="hidden" accept="image/*,.pdf"
                    @change="(event) => handleFileSelect(index, event)" />
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Optional Documents -->
        <div>
          <h3 class="font-medium mb-3">ເອກະສານເພີ່ມເຕີມ</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="(doc, index) in optionalDocuments" :key="index + requiredDocuments.length"
              class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <div>
                  <h4 class="font-medium">{{ doc.name }}</h4>
                  <p class="text-xs text-gray-500">{{ doc.description }}</p>
                </div>
              </div>

              <div v-if="doc.preview" class="mt-2">
                <div class="relative w-full h-32 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                  <img :src="doc.preview" alt="Document preview" class="w-full h-full object-contain" />
                  <button type="button"
                    class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    @click="removeDocument(index + requiredDocuments.length)">
                    ×
                  </button>
                </div>
              </div>

              <div v-else class="mt-2">
                <label
                  class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <span class="icon-[tabler--upload] size-8 text-gray-400 mb-2"></span>
                    <p class="text-sm text-gray-500">ຄລິກເພື່ອອັບໂຫຼດ</p>
                    <p class="text-xs text-gray-500 mt-1">JPG, PNG, PDF (ສູງສຸດ 5MB)</p>
                  </div>
                  <input type="file" class="hidden" accept="image/*,.pdf"
                    @change="(event) => handleFileSelect(index + requiredDocuments.length, event)" />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <button type="button" class="btn btn-primary" :disabled="isSubmitting || !allRequiredDocumentsUploaded"
            @click="submitDocuments">
            <span v-if="isSubmitting" class="loading loading-spinner loading-xs"></span>
            <span v-else>ບັນທຶກເອກະສານ</span>
          </button>
        </div>
      </div>
    </div>

    <!-- OTP Verification Modal -->
    <teleport to="body">
      <div v-if="showOtpModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
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
              <span class="font-medium">{{ maskPhone(customerForm.phone) }}</span>
            </p>
            <p class="text-sm text-gray-500 mt-2">
              ລະຫັດຈະໝົດອາຍຸໃນອີກ {{ otpCountdown }} ວິນາທີ
            </p>
          </div>

          <div class="form-control mb-6">
            <!-- <label class="label">
              <span class="label-text font-medium">ລະຫັດ OTP *</span>
            </label>
            <input
              v-model="otpCode"
              type="text"
              placeholder="ປ້ອນລະຫັດ OTP"
              class="input input-bordered w-full text-center text-2xl tracking-widest"
              maxlength="6"
              @input="handleOtpInput"
              required
            />
            <label v-if="otpError" class="label text-error">
              <span class="label-text-alt">{{ otpError }}</span>
            </label> -->
            <label class="label">
              <span class="label-text font-medium">ລະຫັດ OTP *</span>
            </label>
            <div class="flex space-x-3" data-pin-input='{"availableCharsRE": "^[0-9]+$"}'>
              <input type="tel" class="pin-input input input-bordered w-full text-center text-2xl" placeholder="○"
                data-pin-input-item autocomplete="one-time-code" required />
              <input type="tel" class="pin-input input input-bordered w-full text-center text-2xl" placeholder="○"
                data-pin-input-item required />
              <input type="tel" class="pin-input input input-bordered w-full text-center text-2xl" placeholder="○"
                data-pin-input-item required />
              <input type="tel" class="pin-input input input-bordered w-full text-center text-2xl" placeholder="○"
                data-pin-input-item required />
              <input type="tel" class="pin-input input input-bordered w-full text-center text-2xl" placeholder="○"
                data-pin-input-item required />
              <input type="tel" class="pin-input input input-bordered w-full text-center text-2xl" placeholder="○"
                data-pin-input-item required />
            </div>
            <label v-if="otpError" class="label text-error">
              <span class="label-text-alt">{{ otpError }}</span>
            </label>
          </div>

          <div class="flex justify-between gap-3">
            <button type="button" class="btn btn-soft btn-secondary" @click="closeOtpModal">
              ຍົກເລີກ
            </button>
            <button type="button" class="btn btn-primary" :disabled="!otpCode || otpCode.length !== 6 || isVerifying"
              @click="verifyAndSubmit">
              <span v-if="isVerifying" class="loading loading-spinner loading-xs"></span>
              <span v-else>ຢືນຢັນ ແລະ ສົ່ງ</span>
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Success Modal -->
    <teleport to="body">
      <div v-if="showSuccessModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
          <div class="text-center">
            <div class="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="icon-[tabler--check] size-8 text-success"></span>
            </div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-2">ສົ່ງຄຳຂໍສຳເລັດ!</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              ຄຳຂໍສິນເຊື່ອຂອງທ່ານຖືກສົ່ງເຂົ້າລະບົບແລ້ວ
            </p>
            <button type="button" class="btn btn-primary" @click="switchToDocumentsTab">
              ດຳເນີນການອັບໂຫຼດເອກະສານ
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useShopStore } from '@/stores/shop'
import { useProductStore } from '@/stores/product'
import { useProductTypeStore } from '@/stores/productType' // ✅ เพิ่ม import
import { useLoanApplicationStore } from '@/stores/loanApplication'
import { requestOtpForCustomer } from '@/api/customer'; // Import function จาก api/customer
import { alert } from '@/utils/alert'
import type { CreateWithCustomerDto } from '@/types/loanApplication'
// Types
interface Shop {
  id: number
  shop_name: string
  owner_name: string
}

interface Product {
  id: number
  product_name: string
  type_name: string
  productType_id: string
  price: number
  interest_rate: number
  term: number
  shop_id: number
}

interface Customer {
  full_name: string
  phone: string
  id_card: string
  age: number
  address: string
  monthly_income: number
  other_debts: number
}

interface Document {
  id: string
  name: string
  description: string
  required: boolean
  file: File | null
  preview: string | null
}

// Stores
const shopStore = useShopStore()
const productStore = useProductStore()
const productTypeStore = useProductTypeStore() // ✅ เพิ่ม store
const loanApplicationStore = useLoanApplicationStore() // ✅

// Reactive state
const router = useRouter()
const activeTab = ref<'application' | 'documents'>('application')
const isSubmitting = ref(false)
const isVerifying = ref(false)
const canAccessDocuments = ref(false)

// Loan number (auto-generated)
const loanNumber = ref('LN' + Date.now().toString().slice(-6))

// เพิ่มในส่วนของ reactive state
const loanDetails = reactive({
  totalAmount: 0,        // ราคาสินค้า (อ่านอย่างเดียว)
  downPayment: 0,        // เงินดาวน์ (แก้ไขได้)
  interestRate: 0,       // ดอกเบี้ย (%) (แก้ไขได้)
  termMonths: 0,         // จำนวนงวด (แก้ไขได้)
  monthlyPayment: 0      // ค่างวดต่อเดือน (คำนวณอัตโนมัติ)
})

const loanErrors = reactive({
  downPayment: '',
  interestRate: '',
  termMonths: ''
})

// คำนวณค่าเริ่มต้นเมื่อเลือกสินค้า
const calculateInitialLoanDetails = () => {
  if (!selectedProduct.value) return

  const { price, interest_rate, term } = selectedProduct.value

  loanDetails.totalAmount = price
  loanDetails.interestRate = interest_rate
  loanDetails.termMonths = term
  loanDetails.downPayment = 0
  loanDetails.monthlyPayment = calculateMonthlyPayment()
}

// คำนวณค่างวดต่อเดือน (Flat Rate)
const calculateMonthlyPayment = (): number => {
  const { totalAmount, downPayment, interestRate, termMonths } = loanDetails

  // ตรวจสอบข้อมูลจำเป็น (ยอมรับดอกเบี้ย 0%)
  if (!totalAmount || !termMonths) return 0

  const loanAmount = totalAmount - downPayment

  // สูตรคำนวณดอกเบี้ยคงที่ (Flat Rate)
  // ดอกเบี้ยทั้งหมด = เงินต้น * (อัตราดอกเบี้ยต่อปี / 100) * (จำนวนปี)
  const totalInterest = loanAmount * (interestRate / 100) * (termMonths / 12)

  // ยอดเงินรวมที่ต้องจ่าย = เงินต้น + ดอกเบี้ยทั้งหมด
  const totalPaymentWithInterest = loanAmount + totalInterest

  // ค่างวดต่อเดือน = ยอดเงินรวม / จำนวนงวด
  const monthlyPayment = totalPaymentWithInterest / termMonths

  return Math.round(monthlyPayment)
}

// คำนวณยอดชำระทั้งหมด
const calculateTotalPayment = (): number => {
  // ยอดชำระจริง = ค่างวดต่อเดือน (ปัดเศษแล้ว) * จำนวนงวด
  return loanDetails.monthlyPayment * loanDetails.termMonths
}

// คำนวณดอกเบี้ยทั้งหมด
const calculateTotalInterest = (): number => {
  const totalPayment = calculateTotalPayment()
  const loanAmount = loanDetails.totalAmount - loanDetails.downPayment
  return totalPayment - loanAmount
}

// ตรวจสอบความถูกต้องของข้อมูล
const validateLoanDetails = (): boolean => {
  Object.keys(loanErrors).forEach(key => {
    loanErrors[key as keyof typeof loanErrors] = ''
  })

  let isValid = true

  if (loanDetails.downPayment < 0) {
    loanErrors.downPayment = 'เงินดาวน์ต้องไม่ติดลบ'
    isValid = false
  }

  if (loanDetails.downPayment > loanDetails.totalAmount) {
    loanErrors.downPayment = 'เงินดาวน์ต้องน้อยกว่าราคาสินค้า'
    isValid = false
  }

  if (loanDetails.interestRate < 0 || loanDetails.interestRate > 100) {
    loanErrors.interestRate = 'ดอกเบี้ยต้องอยู่ระหว่าง 0-100%'
    isValid = false
  }

  if (loanDetails.termMonths < 1 || loanDetails.termMonths > 60) {
    loanErrors.termMonths = 'จำนวนงวดต้องอยู่ระหว่าง 1-60 เดือน'
    isValid = false
  }

  return isValid
}

// จัดการเมื่อเปลี่ยนเงินดาวน์
const handleDownPaymentChange = () => {
  validateLoanDetails()
  loanDetails.monthlyPayment = calculateMonthlyPayment()
}

// จัดการเมื่อเปลี่ยนจำนวนงวด
const handleTermMonthsChange = () => {
  validateLoanDetails()
  loanDetails.monthlyPayment = calculateMonthlyPayment()
}

// จัดการเมื่อเปลี่ยนดอกเบี้ย
const handleInterestRateChange = () => {
  validateLoanDetails()
  loanDetails.monthlyPayment = calculateMonthlyPayment()
}


// Shop selection
const shopSearch = ref('')
const showShopDropdown = ref(false)
const selectedShop = ref<Shop | null>(null)
const selectedProductType = ref<string>('') // ✅ เพิ่ม state สำหรับชื่อประเภท

// Product selection
const productSearch = ref('')
const showProductDropdown = ref(false)
const selectedProduct = ref<Product | null>(null)

// ✅ Customer Search State
const customerSearchPhone = ref('')
const isSearchingCustomer = ref(false)
const foundCustomer = ref<any>(null)
const customerSearchMessage = ref('')
const allowEditFoundCustomer = ref(false)
const existingCustomerId = ref<number | undefined>(undefined)

// ✅ ค้นหาลูกค้าจากเบอร์โทร
const searchCustomerByPhone = async () => {
  if (!customerSearchPhone.value || customerSearchPhone.value.trim().length < 8) {
    customerSearchMessage.value = 'ກະລຸນາປ້ອນເບີໂທລະສັບທີ່ຖືກຕ້ອງ'
    return
  }

  isSearchingCustomer.value = true
  customerSearchMessage.value = ''
  foundCustomer.value = null

  try {
    console.log('🔍 Searching customer by phone:', customerSearchPhone.value)

    const customer = await loanApplicationStore.fetchCustomerByPhone(customerSearchPhone.value.trim())

    if (customer) {
      console.log('✅ Customer found:', customer)

      foundCustomer.value = customer
      existingCustomerId.value = customer.id
      customerSearchMessage.value = `ພົບຂໍ້ມູນລູກຄ້າ: ${customer.first_name} ${customer.last_name}`

      // ✅ เติมข้อมูลลูกค้าในฟอร์ม
      customerForm.full_name = `${customer.first_name} ${customer.last_name}`.trim()
      customerForm.phone = customer.phone
      customerForm.id_card = customer.identity_number || ''
      customerForm.address = customer.address || ''
      customerForm.occupation = customer.occupation || ''
      customerForm.monthly_income = customer.income_per_month || 0
      customerForm.age = customer.age || 18

      // ✅ Clear errors
      Object.keys(customerErrors).forEach(key => {
        customerErrors[key as keyof typeof customerErrors] = ''
      })

    } else {
      console.log('ℹ️ Customer not found')
      customerSearchMessage.value = 'ບໍ່ພົບຂໍ້ມູນລູກຄ້າ - ສາມາດປ້ອນຂໍ້ມູນໃໝ່ໄດ້'

      // ✅ เติมเฉพาะเบอร์โทร
      customerForm.phone = customerSearchPhone.value.trim()
    }

  } catch (error: any) {
    console.error('❌ Search customer failed:', error)
    customerSearchMessage.value = 'ເກີດຂໍ້ຜິດພາດການຄົ້ນຫາ'
  } finally {
    isSearchingCustomer.value = false
  }
}

// ✅ ล้างข้อมูลลูกค้าที่พบ
const clearFoundCustomer = () => {
  foundCustomer.value = null
  existingCustomerId.value = undefined
  customerSearchMessage.value = ''
  allowEditFoundCustomer.value = false

  // ✅ ล้างฟอร์ม (ยกเว้นเบอร์โทร)
  const phone = customerForm.phone
  customerForm.full_name = ''
  customerForm.phone = phone
  customerForm.id_card = ''
  customerForm.address = ''
  customerForm.occupation = ''
  customerForm.monthly_income = 0
  customerForm.age = 18
  customerForm.other_debts = 0
}


// อัปเดตค่าอัตโนมัติเมื่อมีการเปลี่ยนแปลง
watch(() => [loanDetails.downPayment, loanDetails.interestRate, loanDetails.termMonths], () => {
  loanDetails.monthlyPayment = calculateMonthlyPayment()
})

// ตั้งค่าเริ่มต้นเมื่อเลือกสินค้า
watch(selectedProduct, () => {
  if (selectedProduct.value) {
    calculateInitialLoanDetails()
  }
})

// Customer form
const customerForm = reactive({
  full_name: '',
  phone: '',
  id_card: '',
  age: 18,
  address: '',
  occupation: '', // ✅ เพิ่มฟิลด์อาชีพ
  monthly_income: 0,
  other_debts: 0
})

const customerErrors = reactive({
  full_name: '',
  phone: '',
  id_card: '',
  age: '',
  address: '',
  occupation: '', // ✅ เพิ่มฟิลด์อาชีพ
  monthly_income: ''
})

// Documents
const requiredDocuments = ref<Document[]>([
  { id: 'id_card', name: 'ບັດປະຈຳຕົວ', description: 'ຮູບຖ່າຍບັດປະຈຳຕົວທັງໜ້າ-ຫຼັງ', required: true, file: null, preview: null },
  { id: 'house_reg', name: 'ປື້ມສຳມະໂນຄົວ', description: 'ໃບຄອບຄົວຫຼືເອກະສານຢືນຢັນທີ່ຢູ່', required: true, file: null, preview: null }
])

const optionalDocuments = ref<Document[]>([
  { id: 'salary_slip', name: 'ຫຼັກຖານລາຍຮັບ', description: 'ໃບເງິນເດືອນ ຫຼື ໃບຮັບລາຍຮັບ', required: false, file: null, preview: null },
  { id: 'other', name: 'ເອກະສານອື່ນໆ', description: 'ເອກະສານອື່ນໆທີ່ກ່ຽວຂ້ອງ', required: false, file: null, preview: null }
])

// Modals
const showOtpModal = ref(false)
const showSuccessModal = ref(false)

// OTP verification
const otpCode = ref('')
const otpError = ref('')
const otpCountdown = ref(5)
let otpTimer: NodeJS.Timeout | null = null

// Computed properties
const filteredShops = computed(() => {
  // ตรวจสอบว่า shops เป็น Array หรือไม่
  let shopsArray = shopStore.shops

  // ถ้าเป็น Object → แปลงเป็น Array
  if (shopsArray && typeof shopsArray === 'object' && !Array.isArray(shopsArray)) {
    console.warn('[CreateLoan] Converting shops object to array')
    shopsArray = Object.values(shopsArray)
  }

  // ถ้าไม่มี search query → return ทั้งหมด
  if (!shopSearch.value) {
    return Array.isArray(shopsArray) ? shopsArray : []
  }

  // ค้นหาร้าน
  const query = shopSearch.value.toLowerCase()
  return Array.isArray(shopsArray)
    ? shopsArray.filter(shop =>
      shop.shop_name?.toLowerCase().includes(query) ||
      shop.shop_owner?.toLowerCase().includes(query)
    )
    : []
})

// ✅ แก้ไข computed property สำหรับ products
const filteredProducts = computed(() => {
  if (!selectedShop.value) return []

  // ตรวจสอบว่า products เป็น Array
  let productsArray = productStore.products

  if (productsArray && typeof productsArray === 'object' && !Array.isArray(productsArray)) {
    console.warn('[CreateLoan] Converting products object to array')
    productsArray = Object.values(productsArray)
  }

  if (!productSearch.value) {
    return Array.isArray(productsArray) ? productsArray : []
  }

  const query = productSearch.value.toLowerCase()
  return Array.isArray(productsArray)
    ? productsArray.filter(product =>
      product.product_name?.toLowerCase().includes(query) ||
      product.type_name?.toLowerCase().includes(query) ||
      product.id?.toString().includes(query)
    )
    : []
})

const allRequiredDocumentsUploaded = computed(() => {
  return requiredDocuments.value.every(doc => doc.file !== null)
})

// Utility functions
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('lo-LA', {
    style: 'currency',
    currency: 'LAK'
  }).format(price)
}

const maskPhone = (phone: string): string => {
  if (phone.length <= 4) return phone
  const visible = phone.slice(-4)
  const masked = '*'.repeat(phone.length - 4)
  return `${masked}${visible}`
}

// Tab switching
const switchTab = (tab: 'application' | 'documents') => {
  if (tab === 'documents' && !canAccessDocuments.value) {
    return
  }
  activeTab.value = tab
}

const switchToDocumentsTab = () => {
  activeTab.value = 'documents'
  showSuccessModal.value = false
}

// Shop search debounce
let shopSearchTimer: NodeJS.Timeout | null = null
const debounceShopSearch = () => {
  if (shopSearchTimer) {
    clearTimeout(shopSearchTimer)
  }
  shopSearchTimer = setTimeout(() => {
    // Search is handled by computed property
  }, 300)
}

// Product search debounce
let productSearchTimer: NodeJS.Timeout | null = null
const debounceProductSearch = () => {
  if (productSearchTimer) {
    clearTimeout(productSearchTimer)
  }
  productSearchTimer = setTimeout(() => {
    // Search is handled by computed property
  }, 300)
}

// Shop selection
const selectShop = async (shop: Shop) => {
  console.group('🏪 Shop Selected')
  console.log('Shop ID:', shop.id)
  console.log('Shop Name:', shop.shop_name)
  console.groupEnd()

  selectedShop.value = shop
  shopSearch.value = shop.shop_name
  showShopDropdown.value = false

  // ✅ Clear product selection
  selectedProduct.value = null
  productSearch.value = ''
  selectedProductType.value = ''

  // ✅ Clear loan details
  loanDetails.totalAmount = 0
  loanDetails.downPayment = 0
  loanDetails.interestRate = 0
  loanDetails.termMonths = 0
  loanDetails.monthlyPayment = 0

  console.log('🔄 Loading products for shop:', shop.id)

  // ✅ Load products (store จะ clear products เก่าอัตโนมัติ)
  try {
    await productStore.fetchProducts({ shop_id: shop.id })
    console.log('✅ Products loaded:', productStore.products.length)
  } catch (error) {
    console.error('❌ Failed to load products:', error)
  }
}

const clearShopSelection = () => {
  selectedShop.value = null
  shopSearch.value = ''
  selectedProduct.value = null
  productSearch.value = ''
}

const handleShopBlur = () => {
  setTimeout(() => {
    showShopDropdown.value = false
  }, 200)
}

// Product selection
const selectProduct = async (product: Product) => {

  // ✅ Debug ดูว่า product ที่ส่งเข้ามามีอะไรบ้าง
  console.group('🎯 selectProduct called')
  console.log('product parameter:', product)
  console.log('Has productType_id:', 'productType_id' in product)
  console.log('productType_id value:', product.productType_id)
  console.log('Keys in product:', Object.keys(product))
  console.groupEnd()

  selectedProduct.value = product
  productSearch.value = product.product_name
  showProductDropdown.value = false

  // ✅ ตั้งค่าเริ่มต้นสำหรับการผ่อนชำระ
  calculateInitialLoanDetails()

  // ✅ ใช้ productType_id จาก product
  const productTypeId = product.productType_id
  // ✅ โหลดข้อมูลประเภทสินค้า
  if (productTypeId) {
    console.log('📡 Loading ProductType ID:', productTypeId)
    try {
      await productTypeStore.fetchProductTypeById(productTypeId)

      // ✅ เก็บชื่อประเภทสินค้า
      if (productTypeStore.productType) {
        selectedProductType.value = productTypeStore.productType.type_name
        console.log('✅ Product type loaded:', selectedProductType.value)
      }
    } catch (error) {
      console.error('❌ Failed to load product type:', error)
      selectedProductType.value = product.type_name || 'ບໍ່ລະບຸ'
    }
  } else {
    // ✅ ถ้าไม่มี product_type_id ใช้ type_name จาก product
    selectedProductType.value = product.type_name || 'ບໍ່ລະບຸ'
  }
}

// ✅ Computed property สำหรับข้อมูลประเภทสินค้า
const productTypeDisplay = computed(() => {
  if (productTypeStore.isLoading) {
    return 'ກຳລັງໂຫຼດ...'
  }

  if (selectedProductType.value) {
    return selectedProductType.value
  }

  if (selectedProduct.value?.type_name) {
    return selectedProduct.value.type_name
  }

  return 'ບໍ່ລະບຸປະເພດ'
})
// ✅ Debug watcher
watch(() => selectedProduct.value, (newProduct) => {
  if (newProduct) {
    console.log('🔍 Selected Product:', {
      id: newProduct.id,
      name: newProduct.product_name,
      type_id: newProduct.product_type_id,
      type_name: newProduct.type_name
    })
  }
}, { immediate: true })

watch(() => productTypeStore.productType, (newType) => {
  if (newType) {
    console.log('🔍 Product Type Loaded:', {
      id: newType.id,
      name: newType.type_name
    })
  }
}, { immediate: true })

const clearProductSelection = () => {
  selectedProduct.value = null
  productSearch.value = ''
  selectedProductType.value = '' // ✅ เคลียร์ product type
}

const handleProductBlur = () => {
  setTimeout(() => {
    showProductDropdown.value = false
  }, 200)
}

// Customer form validation
const validateCustomerForm = (): boolean => {
  Object.keys(customerErrors).forEach(key => {
    customerErrors[key as keyof typeof customerErrors] = ''
  })

  let isValid = true

  if (!customerForm.full_name.trim()) {
    customerErrors.full_name = 'ກະລຸນາປ້ອນຊື່ ແລະ ນາມສະກຸນ'
    isValid = false
  }

  const phoneRegex = /^[\d\-\+\(\)\s]{8,15}$/
  if (!customerForm.phone.trim()) {
    customerErrors.phone = 'ກະລຸນາປ້ອນເບີໂທລະສັບ'
    isValid = false
  } else if (!phoneRegex.test(customerForm.phone)) {
    customerErrors.phone = 'ເບີໂທລະສັບບໍ່ຖືກຕ້ອງ'
    isValid = false
  }

  if (!customerForm.id_card.trim()) {
    customerErrors.id_card = 'ກະລຸນາປ້ອນເລກບັດປະຈຳຕົວ'
    isValid = false
  }

  if (customerForm.age < 18 || customerForm.age > 100) {
    customerErrors.age = 'ອາຍຸຕ້ອງຢູ່ລະຫວ່າງ 18-100 ປີ'
    isValid = false
  }

  if (!customerForm.address.trim()) {
    customerErrors.address = 'ກະລຸນາປ້ອນທີ່ຢູ່'
    isValid = false
  }
  // ✅ ตรวจสอบอาชีพ (ไม่บังคับ แต่แนะนำให้กรอก)
  if (!customerForm.occupation.trim()) {
    // ไม่บังคับ แต่แสดงคำแนะนำ
    customerErrors.occupation = 'ກະລຸນາປ້ອນອາຊີບ (ຂໍ້ມູນສຳຄັນສຳລັບການພິຈາລະນາສິນເຊື່ອ)'
    isValid = false // ถ้าต้องการบังคับให้เปิดใช้งานบรรทัดนี้
  }

  if (customerForm.monthly_income <= 0) {
    customerErrors.monthly_income = 'ລາຍຮັບຕ້ອງຫຼາຍກວ່າ 0'
    isValid = false
  }

  return isValid
}

// ✅ ฟังก์ชันหลักในการ Setup PIN Input
const setupPinInputs = async () => {
  await nextTick() // รอให้ DOM render ช่อง input ครบก่อน

  const inputs = document.querySelectorAll('[data-pin-input-item]')

  if (inputs.length === 0) return

  let code = ''

  inputs.forEach((input, index) => {
    // ล้างค่าเก่าเมื่อเปิด modal ใหม่
    input.value = ''

    // เมื่อพิมพ์ตัวเลข → โฟกัสช่องถัดไปอัตโนมัติ
    input.addEventListener('input', (e) => {
      if (e.target.value.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus()
      }

      // รวมค่าทั้งหมดเป็น otpCode
      code = Array.from(inputs).map(inp => inp.value).join('')
      otpCode.value = code

      // ล้าง error เมื่อเริ่มกรอกใหม่
      if (otpError.value) otpError.value = ''
    })

    // อนุญาตให้กด Backspace แล้วโฟกัสช่องก่อนหน้า
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && input.value === '' && index > 0) {
        inputs[index - 1].focus()
      }
    })
  })
}

// OTP functions
const startOtpCountdown = () => {
  otpCountdown.value = 5

  if (otpTimer) {
    clearInterval(otpTimer)
  }

  otpTimer = setInterval(() => {
    otpCountdown.value--
    if (otpCountdown.value <= 0) {
      if (otpTimer) {
        clearInterval(otpTimer)
        otpTimer = null
      }
    }
  }, 1000)
}
// ✅ Watch เมื่อ Modal เปิด → Setup PIN Input
watch(showOtpModal, async (newValue) => {
  if (newValue) {
    otpCode.value = ''
    otpError.value = ''
    await setupPinInputs()        // สำคัญมาก!
  }
})

// const handleOtpInput = (event: Event) => {
//   const target = event.target as HTMLInputElement
//   target.value = target.value.replace(/\D/g, '').slice(0, 6)
//   otpCode.value = target.value
// }

const openOtpModal = async () => {
  if (!selectedShop.value || !selectedProduct.value || !validateCustomerForm()) {
    return
  }
  console.log('check data on customer :', customerForm)
  // ✅ Request OTP โดยใช้ phone จาก customerForm (สมมติ customerForm มี phone)
  try {
    await requestOtpForCustomer({ phone: customerForm.phone });
    console.log('✅ OTP requested successfully');
    // แสดง message หรือ toast ถ้าต้องการ เช่น alert('OTP ถูกส่งไปยังเบอร์โทรศัพท์ของคุณแล้ว');
  } catch (error) {
    console.error('❌ Failed to request OTP:', error);
    // Handle error เช่น แสดง alert('ไม่สามารถขอ OTP ได้ กรุณาลองใหม่');
    return; // ถ้า error ไม่เปิด modal
  }
  showOtpModal.value = true
  startOtpCountdown()
}

const closeOtpModal = () => {
  showOtpModal.value = false
  otpCode.value = ''
  otpError.value = ''
  if (otpTimer) {
    clearInterval(otpTimer)
    otpTimer = null
  }
}

const verifyAndSubmit = async () => {
  // ✅ Validate OTP
  if (!otpCode.value || otpCode.value.length !== 6) {
    otpError.value = 'ກະລຸນາປ້ອນລະຫັດ OTP 6 ຕົວ'
    return
  }

  // ✅ Validate phone
  if (!customerForm.phone) {
    otpError.value = 'ບໍ່ພົບເບີໂທລະສັບ'
    return
  }

  isVerifying.value = true
  otpError.value = ''

  try {
    console.log('📋 Customer data before submit:', customerForm)

    // ✅ Submit loan application (Backend จะ verify OTP เอง)
    await submitLoanApplication()

    // ✅ Success
    showOtpModal.value = false
    showSuccessModal.value = true
    canAccessDocuments.value = true

    console.log('✅ OTP verified and loan application submitted successfully')

  } catch (error: any) {
    console.error('❌ Submit failed:', error)

    // ✅ แสดง error message
    let errorMessage = 'ເກີດຂໍ້ຜິດພາດການຢືນຢັນ OTP'

    if (error.message) {
      errorMessage = error.message
    }

    // ✅ ตรวจสอบ error จาก backend
    if (error.includes?.('OTP')) {
      errorMessage = 'ລະຫັດ OTP ບໍ່ຖືກຕ້ອງ ຫຼື ໝົດອາຍຸ'
    }

    otpError.value = errorMessage

  } finally {
    isVerifying.value = false
  }
}

// ✅ Submit loan application - เรียก API จริง
const submitLoanApplication = async () => {
  try {
    // ✅ Validate
    if (!validateLoanDetails()) {
      throw new Error('ກະລຸນາກວດສອບຂໍ້ມູນສິນເຊື່ອ')
    }

    if (!selectedShop.value || !selectedProduct.value) {
      throw new Error('ກະລຸນາເລືອກຮ້ານ ແລະ ສິນຄ້າ')
    }

    // ✅ แยกชื่อ-นามสกุล
    const nameParts = customerForm.full_name.trim().split(' ')
    const firstName = nameParts[0] || customerForm.full_name
    const lastName = nameParts.slice(1).join(' ') || ''

    // ✅ เตรียมข้อมูลตามที่ Backend ต้องการ
    const data: CreateWithCustomerDto = {
      // Customer
      phone: customerForm.phone.trim(),
      otp: otpCode.value.trim(), // ✅ ส่ง OTP ไปให้ Backend verify
      identity_number: customerForm.id_card.trim(),
      first_name: firstName,
      last_name: lastName,
      address: customerForm.address.trim(),
      occupation: customerForm.occupation?.trim() || 'ບໍ່ລະບຸ',
      income_per_month: customerForm.monthly_income,

      // Loan
      product_id: selectedProduct.value.id,
      quantity: 1,
      total_amount: loanDetails.totalAmount - loanDetails.downPayment, // เงินกู้
      loan_period: loanDetails.termMonths,
      interest_rate_at_apply: loanDetails.interestRate,
      monthly_pay: loanDetails.monthlyPayment,
      existing_customer_id: existingCustomerId.value // ✅ ส่ง customer_id ถ้าพบลูกค้าเดิม
    }

    console.log('📤 Submitting loan application:', {
      ...data,
      otp: '******', // ซ่อน OTP ใน log
      has_existing_customer: !!existingCustomerId.value
    })

    // ✅ เรียก API จริง
    const result = await loanApplicationStore.createWithCustomer(data)

    console.log('✅ Loan application created:', result)

    return result

  } catch (error: any) {
    console.error('❌ Submit loan application failed:', error)
    throw error
  }
}

// Document upload handlers
const handleFileSelect = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert.error('ຂະໜາດໄຟລ໌ຕ້ອງນ້ອຍກວ່າ 5MB')
      return
    }

    if (!file.type.match(/^(image\/.*|application\/pdf)$/)) {
      alert.error('ກະລຸນາເລືອກໄຟລ໌ຮູບພາບ ຫຼື PDF')
      return
    }

    const allDocs = [...requiredDocuments.value, ...optionalDocuments.value]
    const reader = new FileReader()
    reader.onload = (e) => {
      allDocs[index].file = file
      allDocs[index].preview = e.target?.result as string

      if (index < requiredDocuments.value.length) {
        requiredDocuments.value = [...allDocs.slice(0, requiredDocuments.value.length)]
      } else {
        optionalDocuments.value = [...allDocs.slice(requiredDocuments.value.length)]
      }
    }
    reader.readAsDataURL(file)
  }
}

const removeDocument = (index: number) => {
  const allDocs = [...requiredDocuments.value, ...optionalDocuments.value]
  allDocs[index].file = null
  allDocs[index].preview = null

  if (index < requiredDocuments.value.length) {
    requiredDocuments.value = [...allDocs.slice(0, requiredDocuments.value.length)]
  } else {
    optionalDocuments.value = [...allDocs.slice(requiredDocuments.value.length)]
  }
}

// Submit documents
const submitDocuments = async () => {
  if (!allRequiredDocumentsUploaded.value) {
    alert.error('ກະລຸນາອັບໂຫຼດເອກະສານທີ່ຕ້ອງການທັງໝົດ')
    return
  }

  // ✅ ตรวจสอบว่ามี currentLoanApplication และ loan_id แล้ว
  const currentLoan = loanApplicationStore.currentLoanApplication

  console.log('this currentLoan is ', currentLoan)
  if (!currentLoan || !currentLoan.id) {
    console.error('❌ No current loan application found')
    alert.error('ບໍ່ພົບຂໍ້ມູນຄຳຂໍສິນເຊື່ອ', 'ກະລຸນາສ້າງຄຳຂໍໃໝ່.')
    return
  }

  isSubmitting.value = true
  try {
    // ✅ ใช้ loan_id จาก currentLoanApplication แทน loan_number

    // const payload = {
    //   loan_id: currentLoan.id, // ✅ ใช้ loan_id จริงจากฐานข้อมูล
    //   documents: [...requiredDocuments.value, ...optionalDocuments.value]
    //     .filter(doc => doc.file)
    //     .map(doc => ({
    //       document_type: doc.id,
    //       file: doc.file
    //     }))
    // }
    // ✅ รวมเอกสารทั้งหมดที่มีไฟล์
    const allDocs = [...requiredDocuments.value, ...optionalDocuments.value].filter(doc => doc.file)

    // ✅ อัปโหลดทีละไฟล์พร้อมประเภท
    for (const doc of allDocs) {
      if (doc.file) {
        await loanApplicationStore.uploadDocument(currentLoan.id, doc.file, doc.id)
      }
    }

    // console.log('📤 Submitting documents with payload:', payload)

    // await new Promise(resolve => setTimeout(resolve, 2000))

    console.log('✅ Documents submitted successfully for loan ID:', currentLoan.id)

    alert.success('ບັນທຶກເອກະສານສຳເລັດ!')

    // ✅ ดึงข้อมูลเอกสารใหม่จาก store
    await loanApplicationStore.fetchDocuments(currentLoan.id)

    // ✅ รีเฟรชข้อมูล Loan Application
    await loanApplicationStore.fetchLoanApplicationById(currentLoan.id)

    router.push({ name: 'PendingLoans' })

  } catch (error) {
    console.error('Failed to submit documents:', error)
    alert.error('ເກີດຂໍ້ຜິດພາດການບັນທຶກເອກະສານ')
  } finally {
    isSubmitting.value = false
  }
}

// Load data on mount
onMounted(async () => {
  await shopStore.fetchAllShop()
})

// Cleanup timer on unmount
onUnmounted(() => {
  if (otpTimer) {
    clearInterval(otpTimer)
  }
})
</script>

<style scoped>
.tab-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
