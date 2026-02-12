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
      <button
        class="tab"
        :class="{ 'tab-active': activeTab === 'application' }"
        @click="switchTab('application')"
      >
        <span class="icon-[tabler--shopping-cart] size-4 mr-2"></span>
        ສ້າງຄຳຂໍ
      </button>
      <button
        class="tab"
        :class="{ 'tab-active': activeTab === 'documents', 'tab-disabled': !canAccessDocuments }"
        :disabled="!canAccessDocuments"
        @click="switchTab('documents')"
      >
        <span class="icon-[tabler--file-upload] size-4 mr-2"></span>
        ເອກະສານ
      </button>
    </div>

    <!-- Tab 1: Create Loan Application -->
    <div v-if="activeTab === 'application'" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <!-- Loan Number Display -->
      <div class="form-control mb-6">
        <label class="label">
          <span class="label-text font-medium">ເລກທີ່ຄຳຂໍສິນເຊື່ອ</span>
        </label>
        <input
          type="text"
          :value="loanNumber"
          class="input input-bordered w-full bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
          readonly
        />
        <p class="text-xs text-gray-500 mt-1">ເລກທີ່ນີ້ຈະຖືກສ້າງອັດຕະໂນມັດເມື່ອທ່ານສົ່ງຄຳຂໍ</p>
      </div>

      <!-- Shop Selection -->
      <div class="form-control mb-6">
        <label class="label">
          <span class="label-text font-medium">ເລືອກຮ້ານ *</span>
        </label>

        <!-- Shop Searchable Dropdown -->
        <div class="relative">
          <input
            v-model="shopSearch"
            type="text"
            placeholder="ພິມຊື່ຮ້ານ..."
            class="input input-bordered w-full pl-10 pr-10"
            @input="debounceShopSearch"
            @focus="showShopDropdown = true"
            @blur="handleShopBlur"
          />
          <span class="icon-[tabler--building-store] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            @click="clearShopSelection"
          >
            <span class="icon-[tabler--x] size-4"></span>
          </button>
        </div>

        <!-- Shop Dropdown -->
        <div
          v-if="showShopDropdown && filteredShops.length > 0"
          class="absolute z-10 mt-1 w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          <div
            v-for="shop in filteredShops"
            :key="shop.id"
            class="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3"
            @click="selectShop(shop)"
          >
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
        <div
          v-else-if="showShopDropdown && filteredShops.length === 0 && shopSearch"
          class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4"
        >
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
          <input
            v-model="productSearch"
            type="text"
            placeholder="ພິມຊື່ສິນຄ້າ ຫຼື ລະຫັດ…"
            class="input input-bordered w-full pl-10 pr-10"
            :disabled="!selectedShop"
            @input="debounceProductSearch"
            @focus="showProductDropdown = true"
            @blur="handleProductBlur"
          />
          <span class="icon-[tabler--search] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            :disabled="!selectedProduct"
            @click="clearProductSelection"
          >
            <span class="icon-[tabler--x] size-4"></span>
          </button>
        </div>

        <!-- Product Dropdown -->
        <div
          v-if="showProductDropdown && filteredProducts.length > 0"
          class="absolute z-10 mt-1 w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            class="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3"
            @click="selectProduct(product)"
          >
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
        <div
          v-else-if="showProductDropdown && filteredProducts.length === 0 && productSearch"
          class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4"
        >
          <div class="text-center text-gray-500">ບໍ່ພົບສິນຄ້າ</div>
        </div>
      </div>

      <!-- Loan Details (shown when product is selected) -->
      <div v-if="selectedProduct" class="mb-6">
  <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-4">ລາຍລະອຽດສິນເຊື່ອ</h3>

  <!-- Product Info (Read-only) -->
  <div class="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="text-sm text-gray-500">ສຶນຄ້າ</label>
        <p class="font-medium">{{ selectedProduct.product_name }}</p>
      </div>
      <div>
        <label class="text-sm text-gray-500">ປະເພດ</label>
        <p>{{ selectedProduct.type_name }}</p>
      </div>
      <div>
        <label class="text-sm text-gray-500">ລາຄາສິນຄ້າ</label>
        <p class="font-medium text-primary">{{ formatPrice(selectedProduct.price) }}</p>
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
      <input
        v-model.number="loanDetails.downPayment"
        type="number"
        placeholder="ປ້ອນເງີນດາວ"
        class="input input-bordered w-full"
        :class="{ 'input-error': loanErrors.downPayment }"
        min="0"
        :max="selectedProduct.price"
        @input="handleDownPaymentChange"
      />
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
      <input
        v-model.number="loanDetails.termMonths"
        type="number"
        placeholder="ຈຳນວນງວດ"
        class="input input-bordered w-full"
        :class="{ 'input-error': loanErrors.termMonths }"
        min="1"
        max="60"
        @input="handleTermMonthsChange"
      />
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
      <input
        v-model.number="loanDetails.interestRate"
        type="number"
        placeholder="ດອກເບ້ຍຕໍ່ປີ"
        class="input input-bordered w-full"
        :class="{ 'input-error': loanErrors.interestRate }"
        min="0"
        max="100"
        step="0.01"
        @input="handleInterestRateChange"
      />
      <label v-if="loanErrors.interestRate" class="label text-error">
        <span class="label-text-alt">{{ loanErrors.interestRate }}</span>
      </label>
    </div>

    <!-- Monthly Payment (Auto-calculated) -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">ຄ່າງວດຕໍ່ເດືອນ (ກີບ)</span>
      </label>
      <input
        :value="formatPrice(loanDetails.monthlyPayment)"
        type="text"
        class="input input-bordered w-full bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
        readonly
      />
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
        <span class="font-medium text-primary">{{ formatPrice(loanDetails.totalAmount - loanDetails.downPayment) }}</span>
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

        <!-- Basic Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ຊື່ ແລະ ນາມສະກຸນ *</span>
            </label>
            <input
              v-model="customerForm.full_name"
              type="text"
              placeholder="ປ້ອນຊື່ ແລະ ນາມສະກຸນ"
              class="input input-bordered w-full"
              :class="{ 'input-error': customerErrors.full_name }"
              required
            />
            <label v-if="customerErrors.full_name" class="label text-error">
              <span class="label-text-alt">{{ customerErrors.full_name }}</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ເບີໂທລະສັບ *</span>
            </label>
            <input
              v-model="customerForm.phone"
              type="tel"
              placeholder="ປ້ອນເບີໂທລະສັບ"
              class="input input-bordered w-full"
              :class="{ 'input-error': customerErrors.phone }"
              required
            />
            <label v-if="customerErrors.phone" class="label text-error">
              <span class="label-text-alt">{{ customerErrors.phone }}</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ເລກບັດປະຈຳຕົວ *</span>
            </label>
            <input
              v-model="customerForm.id_card"
              type="text"
              placeholder="ປ້ອນເລກບັດປະຈຳຕົວ"
              class="input input-bordered w-full"
              :class="{ 'input-error': customerErrors.id_card }"
              required
            />
            <label v-if="customerErrors.id_card" class="label text-error">
              <span class="label-text-alt">{{ customerErrors.id_card }}</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ອາຍຸ *</span>
            </label>
            <input
              v-model.number="customerForm.age"
              type="number"
              placeholder="ປ້ອນອາຍຸ"
              class="input input-bordered w-full"
              :class="{ 'input-error': customerErrors.age }"
              min="18"
              max="100"
              required
            />
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
          <textarea
            v-model="customerForm.address"
            placeholder="ປ້ອນທີ່ຢູ່ຢ່າງລະອຽດ"
            class="textarea textarea-bordered w-full min-h-24"
            :class="{ 'textarea-error': customerErrors.address }"
            required
          ></textarea>
          <label v-if="customerErrors.address" class="label text-error">
            <span class="label-text-alt">{{ customerErrors.address }}</span>
          </label>
        </div>

        <!-- Income Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ລາຍຮັບຕໍ່ເດືອນ (ກີບ) *</span>
            </label>
            <input
              v-model.number="customerForm.monthly_income"
              type="number"
              placeholder="ປ້ອນລາຍຮັບຕໍ່ເດືອນ"
              class="input input-bordered w-full"
              :class="{ 'input-error': customerErrors.monthly_income }"
              min="0"
              required
            />
            <label v-if="customerErrors.monthly_income" class="label text-error">
              <span class="label-text-alt">{{ customerErrors.monthly_income }}</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ໜີ້ສິນອື່ນໆ (ກີບ)</span>
            </label>
            <input
              v-model.number="customerForm.other_debts"
              type="number"
              placeholder="ປ້ອນຈຳນວນໜີ້ສິນອື່ນໆ"
              class="input input-bordered w-full"
              min="0"
            />
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end mt-8">
        <button
          type="button"
          class="btn btn-primary"
          :disabled="!selectedShop || !selectedProduct || isSubmitting"
          @click="openOtpModal"
        >
          <span v-if="isSubmitting" class="loading loading-spinner loading-xs"></span>
          <span v-else>ສົ່ງຄຳຂໍສິນເຊື່ອ</span>
        </button>
      </div>
    </div>

    <!-- Tab 2: Document Upload -->
    <div v-else-if="activeTab === 'documents'" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-6">ອັບໂຫຼດເອກະສານ</h2>

      <div v-if="!canAccessDocuments" class="text-center py-12">
        <div class="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="icon-[tabler--alert-triangle] size-8 text-warning"></span>
        </div>
        <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-2">ຍັງບໍ່ໄດ້ສົ່ງຄຳຂໍ</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          ກະລຸນາສົ່ງຄຳຂໍສິນເຊື່ອໃນແຖບ "ສ້າງຄຳຂໍ" ກ່ອນ
        </p>
        <button
          class="btn btn-primary"
          @click="switchTab('application')"
        >
          ກັບໄປສົ່ງຄຳຂໍ
        </button>
      </div>

      <div v-else class="space-y-6">
        <!-- Required Documents -->
        <div>
          <h3 class="font-medium mb-3">ເອກະສານທີ່ຕ້ອງການ</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="(doc, index) in requiredDocuments"
              :key="index"
              class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4"
            >
              <div class="flex items-center justify-between mb-2">
                <div>
                  <h4 class="font-medium">{{ doc.name }}</h4>
                  <p class="text-xs text-gray-500">{{ doc.description }}</p>
                </div>
                <span
                  v-if="doc.required"
                  class="badge badge-soft badge-error text-xs"
                >
                  ຕ້ອງການ
                </span>
              </div>

              <div v-if="doc.preview" class="mt-2">
                <div class="relative w-full h-32 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                  <img
                    :src="doc.preview"
                    alt="Document preview"
                    class="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    @click="removeDocument(index)"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div v-else class="mt-2">
                <label
                  class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <span class="icon-[tabler--upload] size-8 text-gray-400 mb-2"></span>
                    <p class="text-sm text-gray-500">ຄລິກເພື່ອອັບໂຫຼດ</p>
                    <p class="text-xs text-gray-500 mt-1">JPG, PNG, PDF (ສູງສຸດ 5MB)</p>
                  </div>
                  <input
                    type="file"
                    class="hidden"
                    accept="image/*,.pdf"
                    @change="(event) => handleFileSelect(index, event)"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Optional Documents -->
        <div>
          <h3 class="font-medium mb-3">ເອກະສານເພີ່ມເຕີມ</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="(doc, index) in optionalDocuments"
              :key="index + requiredDocuments.length"
              class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4"
            >
              <div class="flex items-center justify-between mb-2">
                <div>
                  <h4 class="font-medium">{{ doc.name }}</h4>
                  <p class="text-xs text-gray-500">{{ doc.description }}</p>
                </div>
              </div>

              <div v-if="doc.preview" class="mt-2">
                <div class="relative w-full h-32 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                  <img
                    :src="doc.preview"
                    alt="Document preview"
                    class="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    @click="removeDocument(index + requiredDocuments.length)"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div v-else class="mt-2">
                <label
                  class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <span class="icon-[tabler--upload] size-8 text-gray-400 mb-2"></span>
                    <p class="text-sm text-gray-500">ຄລິກເພື່ອອັບໂຫຼດ</p>
                    <p class="text-xs text-gray-500 mt-1">JPG, PNG, PDF (ສູງສຸດ 5MB)</p>
                  </div>
                  <input
                    type="file"
                    class="hidden"
                    accept="image/*,.pdf"
                    @change="(event) => handleFileSelect(index + requiredDocuments.length, event)"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <button
            type="button"
            class="btn btn-primary"
            :disabled="isSubmitting || !allRequiredDocumentsUploaded"
            @click="submitDocuments"
          >
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
            <label class="label">
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
            </label>
          </div>

          <div class="flex justify-between gap-3">
            <button
              type="button"
              class="btn btn-soft btn-secondary"
              @click="closeOtpModal"
            >
              ຍົກເລີກ
            </button>
            <button
              type="button"
              class="btn btn-primary"
              :disabled="!otpCode || otpCode.length !== 6 || isVerifying"
              @click="verifyAndSubmit"
            >
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
            <button
              type="button"
              class="btn btn-primary"
              @click="switchToDocumentsTab"
            >
              ດຳເນີນການອັບໂຫຼດເອກະສານ
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useShopStore } from '@/stores/shop'
import { useProductStore } from '@/stores/product'

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

// คำนวณค่างวดต่อเดือน
const calculateMonthlyPayment = (): number => {
  const { totalAmount, downPayment, interestRate, termMonths } = loanDetails

  if (!totalAmount || !interestRate || !termMonths) return 0

  const loanAmount = totalAmount - downPayment
  const monthlyRate = interestRate / 100 / 12

  // สูตรคำนวณผ่อนชำระ: P * r * (1+r)^n / ((1+r)^n - 1)
  const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
                         (Math.pow(1 + monthlyRate, termMonths) - 1)

  return Math.round(monthlyPayment)
}

// คำนวณยอดชำระทั้งหมด
const calculateTotalPayment = (): number => {
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

// Product selection
const productSearch = ref('')
const showProductDropdown = ref(false)
const selectedProduct = ref<Product | null>(null)


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
  monthly_income: 0,
  other_debts: 0
})

const customerErrors = reactive({
  full_name: '',
  phone: '',
  id_card: '',
  age: '',
  address: '',
  monthly_income: ''
})

// Documents
const requiredDocuments = ref<Document[]>([
  { id: 'id_card', name: 'ບັດປະຈຳຕົວ', description: 'ຮູບຖ່າຍບັດປະຈຳຕົວທັງໜ້າ-ຫຼັງ', required: true, file: null, preview: null },
  { id: 'household', name: 'ໃບຄອບຄົວ', description: 'ໃບຄອບຄົວຫຼືເອກະສານຢືນຢັນທີ່ຢູ່', required: true, file: null, preview: null }
])

const optionalDocuments = ref<Document[]>([
  { id: 'income', name: 'ຫຼັກຖານລາຍຮັບ', description: 'ໃບເງິນເດືອນ ຫຼື ໃບຮັບລາຍຮັບ', required: false, file: null, preview: null },
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
const selectShop = (shop: Shop) => {
  selectedShop.value = shop
  shopSearch.value = shop.shop_name
  showShopDropdown.value = false
  // Clear product selection when shop changes
  selectedProduct.value = null
  productSearch.value = ''
  // Load products for selected shop
  productStore.fetchProducts({ shop_id: shop.id })
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
const selectProduct = (product: Product) => {
  selectedProduct.value = product
  productSearch.value = product.product_name
  showProductDropdown.value = false

  // ✅ ตั้งค่าเริ่มต้นสำหรับการผ่อนชำระ
  calculateInitialLoanDetails()
}

const clearProductSelection = () => {
  selectedProduct.value = null
  productSearch.value = ''
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

  if (customerForm.monthly_income <= 0) {
    customerErrors.monthly_income = 'ລາຍຮັບຕ້ອງຫຼາຍກວ່າ 0'
    isValid = false
  }

  return isValid
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
  }, 60000)
}

const handleOtpInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  target.value = target.value.replace(/\D/g, '').slice(0, 6)
  otpCode.value = target.value
}

const openOtpModal = () => {
  if (!selectedShop.value || !selectedProduct.value || !validateCustomerForm()) {
    return
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
  if (!otpCode.value || otpCode.value.length !== 6) {
    otpError.value = 'ກະລຸນາປ້ອນລະຫັດ OTP 6 ຕົວ'
    return
  }

  isVerifying.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    if (otpCode.value === '123456') {
      // Submit loan application
      await submitLoanApplication()
      showOtpModal.value = false
      showSuccessModal.value = true
      canAccessDocuments.value = true // ✅ เปิดใช้งานแท็บเอกสารเมื่อส่งคำขอสำเร็จ
    } else {
      otpError.value = 'ລະຫັດ OTP ບໍ່ຖືກຕ້ອງ'
    }
  } catch (error) {
    console.error('OTP verification failed:', error)
    otpError.value = 'ເກີດຂໍ້ຜິດພາດການຢືນຢັນ OTP'
  } finally {
    isVerifying.value = false
  }
}

// Submit loan application
const submitLoanApplication = async () => {
  // ตรวจสอบข้อมูลสินเชื่อ
  if (!validateLoanDetails()) {
    alert('กรุณาตรวจสอบข้อมูลสินเชื่อ')
    return
  }

  const loanApplication = {
    loan_number: loanNumber.value,
    shop: selectedShop.value,
    product: selectedProduct.value,
    customer: { ...customerForm },
    loan_details: {
      product_price: loanDetails.totalAmount,
      down_payment: loanDetails.downPayment,
      loan_amount: loanDetails.totalAmount - loanDetails.downPayment,
      interest_rate: loanDetails.interestRate,
      term_months: loanDetails.termMonths,
      monthly_payment: loanDetails.monthlyPayment,
      total_payment: calculateTotalPayment(),
      total_interest: calculateTotalInterest()
    }
  }

  console.log('Submitting loan application:', loanApplication)

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
}

// Document upload handlers
const handleFileSelect = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert('ຂະໜາດໄຟລ໌ຕ້ອງນ້ອຍກວ່າ 5MB')
      return
    }

    if (!file.type.match(/^(image\/.*|application\/pdf)$/)) {
      alert('ກະລຸນາເລືອກໄຟລ໌ຮູບພາບ ຫຼື PDF')
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
    alert('ກະລຸນາອັບໂຫຼດເອກະສານທີ່ຕ້ອງການທັງໝົດ')
    return
  }

  isSubmitting.value = true
  try {
    const loanApplication = {
      loan_number: loanNumber.value,
      shop: selectedShop.value,
      product: selectedProduct.value,
      customer: { ...customerForm },
      documents: [...requiredDocuments.value, ...optionalDocuments.value].filter(doc => doc.file)
    }

    console.log('Submitting documents:', loanApplication)
    await new Promise(resolve => setTimeout(resolve, 2000))

    alert('ບັນທຶກເອກະສານສຳເລັດ!')
    router.push({ name: 'PendingLoans' })

  } catch (error) {
    console.error('Failed to submit documents:', error)
    alert('ເກີດຂໍ້ຜິດພາດການບັນທຶກເອກະສານ')
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
