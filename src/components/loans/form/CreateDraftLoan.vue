<template>
  <div class="p-6 max-w-4xl mx-auto">
    <div class="flex items-center gap-3 mb-6">
      <div class="p-2 bg-primary/10 rounded-lg">
        <span class="icon-[tabler--credit-card] size-6 text-primary"></span>
      </div>
      <div>
        <h2 class="text-xl font-bold text-gray-800 dark:text-white">ສ້າງຮ່າງຂໍສິນເຊື່ອ</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">ສຳລັບລູກຄ້າ walk-in</p>
      </div>
    </div>

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

    <div v-if="activeTab === 'application'"
      class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">

      <div class="form-control mb-6">
        <label class="label"><span class="label-text font-medium">ເລກທີ່ຄຳຂໍສິນເຊື່ອ</span></label>
        <input type="text" :value="loanNumber"
          class="input input-bordered w-full bg-gray-100 dark:bg-gray-700 cursor-not-allowed" readonly />
        <p class="text-xs text-gray-500 mt-1">ເລກທີ່ນີ້ຈະຖືກສ້າງອັດຕະໂນມັດເມື່ອທ່ານສົ່ງຄຳຂໍ</p>
      </div>

      <div class="form-control mb-6">
        <label class="label"><span class="label-text font-medium">ເລືອກຮ້ານ *</span></label>
        <div class="relative">
          <input v-model="shopSearch" type="text" placeholder="ພິມຊື່ຮ້ານ..."
            class="input input-bordered w-full pl-10 pr-10" @input="debounceShopSearch" @focus="showShopDropdown = true"
            @blur="handleShopBlur" />
          <span
            class="icon-[tabler--building-store] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
          <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            @click="clearShopSelection"><span class="icon-[tabler--x] size-4"></span></button>
        </div>
        <div v-if="showShopDropdown && filteredShops.length > 0"
          class="absolute z-10 mt-1 w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div v-for="shop in filteredShops" :key="shop.id"
            class="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3"
            @click="selectShop(shop)">
            <div class="w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center"><span
                class="icon-[tabler--building-store] size-4 text-gray-400"></span></div>
            <div class="flex-1">
              <div class="font-medium">{{ shop.shop_name }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">{{ shop.shop_owner }}</div>
            </div>
          </div>
        </div>
        <div v-else-if="showShopDropdown && filteredShops.length === 0 && shopSearch"
          class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
          <div class="text-center text-gray-500">ບໍ່ພົບຮ້ານ</div>
        </div>
      </div>

      <div class="form-control mb-6">
        <label class="label"><span class="label-text font-medium">ເລືອກສິນຄ້າ *</span></label>
        <div class="relative">
          <input v-model="productSearch" type="text" placeholder="ພີມຊື່ສິນຄ້າ ຫຼື ລະຫັດ…"
            class="input input-bordered w-full pl-10 pr-10" :disabled="!selectedShop" @input="debounceProductSearch"
            @focus="showProductDropdown = true" @blur="handleProductBlur" />
          <span class="icon-[tabler--search] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
          <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            :disabled="!selectedProduct" @click="clearProductSelection"><span
              class="icon-[tabler--x] size-4"></span></button>
        </div>
        <div v-if="showProductDropdown && filteredProducts.length > 0"
          class="absolute z-10 mt-1 w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div v-for="product in filteredProducts" :key="product.id"
            class="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3"
            @click="selectProduct(product)">
            <div class="w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center"><span
                class="icon-[tabler--box] size-4 text-gray-400"></span></div>
            <div class="flex-1">
              <div class="font-medium">{{ product.product_name }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">{{ product.type_name }}</div>
            </div>
            <div class="text-right">
              <div class="font-medium text-primary">{{ formatPrice(product.price) }}</div>
              <div class="text-xs text-gray-500">{{ product.interest_rate }}% {{ product.interest_rate_type === 'yearly'
                ? '(ຕໍ່ປີ)' : '(ຕໍ່ເດືອນ)' }}</div>
            </div>
          </div>
        </div>
        <div v-else-if="showProductDropdown && filteredProducts.length === 0 && productSearch"
          class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
          <div class="text-center text-gray-500">ບໍ່ພົບສິນຄ້າ</div>
        </div>
      </div>

      <div v-if="selectedProduct && productVariants.length > 0" class="form-control mb-6">
        <label class="label"><span class="label-text font-medium text-gray-800 dark:text-white">ເລືອກ ສີ / ຂະໜາດ
            (ຕົວເລືອກຍ່ອຍ) *</span></label>
        <div v-if="isLoadingVariants" class="text-sm text-gray-500 flex items-center gap-2"><span
            class="loading loading-spinner loading-xs"></span> ກຳລັງໂຫຼດຕົວເລືອກຍ່ອຍ...</div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div v-for="variant in productVariants" :key="variant.id"
            class="border rounded-lg p-3 cursor-pointer flex justify-between items-center transition-all"
            :class="selectedVariant?.id === variant.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-primary/50'"
            @click="selectVariant(variant)">
            <div>
              <div class="font-medium text-sm text-gray-800 dark:text-white">{{ variant.color || 'ບໍ່ລະບຸສີ' }} / {{
                variant.size_or_capacity || 'ບໍ່ລະບຸຂະໜາດ' }}</div>
              <div class="text-xs text-gray-500">SKU: {{ variant.merchant_sku || variant.system_sku }}</div>
            </div>
            <div class="font-bold text-primary">{{ formatPrice(variant.price) }}</div>
          </div>
        </div>
        <label v-if="loanErrors.variant" class="label text-error p-0 pt-1"><span
            class="label-text-alt flex items-center gap-1"><span class="icon-[tabler--alert-circle] size-4"></span> {{
              loanErrors.variant }}</span></label>
      </div>

      <div v-if="selectedProduct && (productVariants.length === 0 || selectedVariant)"
        class="mb-6 border-t border-gray-200 pt-6">
        <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-4">ລາຍລະອຽດສິນເຊື່ອ</h3>

        <div class="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="col-span-1 lg:col-span-2">
              <label class="text-sm text-gray-500 dark:text-gray-400">ສິນຄ້າ</label>
              <p class="font-medium text-gray-800 dark:text-white">
                {{ selectedProduct.product_name }}
                <span v-if="selectedVariant" class="text-primary text-sm font-semibold ml-1">({{ selectedVariant.color
                  || 'ບໍ່ລະບຸສີ' }} / {{ selectedVariant.size_or_capacity || 'ບໍ່ລະບຸຂະໜາດ' }})</span>
                <span class="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">{{
                  productTypeDisplay }}</span>
              </p>
            </div>
            <div>
              <label class="label p-0 pb-1"><span
                  class="text-sm text-gray-500 dark:text-gray-400 font-medium">ລາຄາສິນຄ້າ (ກີບ) *</span></label>
              <input :value="formatCurrencyInput(loanDetails.totalAmount)" @input="handlePriceInput" type="text"
                class="input input-sm input-bordered w-full font-bold text-primary"
                :class="{ 'input-error': loanErrors.totalAmount }" />
              <label v-if="loanErrors.totalAmount" class="label text-error p-0 pt-1"><span class="label-text-alt">{{
                loanErrors.totalAmount }}</span></label>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-control">
            <label class="label"><span class="label-text font-medium">ປະເພດການຄິດໄລ່ດອກເບ້ຍ *</span></label>
            <select v-model="loanDetails.interestType" class="select select-bordered w-full"
              @change="handleCalculationChange">
              <option value="flat_rate">ດອກເບ້ຍຄົງທີ່ (Flat Rate)</option>
              <option value="effective_rate">ຫຼຸດຕົ້ນຫຼຸດດອກ (Effective Rate)</option>
            </select>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text font-medium">ຈຳນວນງວດ (ເດືອນ) *</span></label>
            <select v-model.number="loanDetails.termMonths" class="select select-bordered w-full"
              :class="{ 'select-error': loanErrors.termMonths }" @change="handleTermChange">
              <option value="0" disabled>ເລືອກຈຳນວນງວດ</option>
              <option value="6">6 ເດືອນ</option>
              <option value="12">12 ເດືອນ</option>
              <option value="18">18 ເດືອນ</option>
              <option value="24">24 ເດືອນ</option>
              <option value="36">36 ເດືອນ</option>
              <option value="48">48 ເດືອນ</option>
            </select>
            <label v-if="loanErrors.termMonths" class="label text-error"><span class="label-text-alt">{{
              loanErrors.termMonths }}</span></label>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text font-medium">ເງີນດາວ (ກີບ)</span></label>
            <input :value="formatCurrencyInput(loanDetails.downPayment)" @input="handleDownPaymentInput" type="text"
              placeholder="ປ້ອນເງີນດາວ" class="input input-bordered w-full"
              :class="{ 'input-error': loanErrors.downPayment }" />
            <label v-if="loanErrors.downPayment" class="label text-error"><span class="label-text-alt">{{
              loanErrors.downPayment }}</span></label>
            <div class="text-xs text-gray-500 mt-1 flex justify-between">
              <span>ເງີນດາວ: {{ formatPrice(loanDetails.downPayment) }}</span>
              <span class="text-primary font-medium">ຍອດຈັດ: {{ formatPrice(Math.max(0, loanDetails.totalAmount -
                loanDetails.downPayment)) }}</span>
            </div>
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ດອກເບ້ຍ (%) ອັດຕະໂນມັດ<span class="text-primary ml-1">{{
                selectedProduct?.interest_rate_type === 'yearly' ? '(ຕໍ່ປີ)' : '(ຕໍ່ເດືອນ)' }}</span> *</span>
            </label>
            <input v-model.number="loanDetails.interestRate" type="number"
              class="input input-bordered w-full bg-gray-100 dark:bg-gray-700 cursor-not-allowed" min="0" max="100"
              step="0.01" readonly />
          </div>
          <div class="form-control md:col-span-2">
            <label class="label"><span class="label-text font-medium">ຄ່າງວດຕໍ່ເດືອນ (ກີບ) - ປະມານການ</span></label>
            <input :value="formatPrice(loanDetails.monthlyPayment)" type="text"
              class="input input-bordered w-full bg-primary/5 text-primary font-bold dark:bg-gray-700 cursor-not-allowed"
              readonly />
          </div>
        </div>
      </div>

      <div class="space-y-6 border-t border-gray-200 pt-6">
        <h3 class="text-lg font-medium text-gray-800 dark:text-white">ຂໍ້ມູນລູກຄ້າ</h3>

        <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div class="flex items-start gap-3">
            <div class="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg"><span
                class="icon-[tabler--search] size-5 text-blue-600 dark:text-blue-400"></span></div>
            <div class="flex-1">
              <h4 class="font-medium text-blue-900 dark:text-blue-100 mb-2">ຄົ້ນຫາຂໍ້ມູນລູກຄ້າເກົ່າ</h4>
              <p class="text-sm text-blue-700 dark:text-blue-300 mb-3">ປ້ອນເບີໂທລະສັບເພື່ອຄົ້ນຫາຂໍ້ມູນລູກຄ້າທີ່ມີຢູ່ແລ້ວ
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
              <div v-if="customerSearchMessage" class="mt-2">
                <div class="alert text-sm"
                  :class="{ 'alert-success': foundCustomer, 'alert-info': !foundCustomer && customerSearchMessage }">
                  <span class="icon-[tabler--info-circle] size-4"></span> <span>{{ customerSearchMessage }}</span>
                </div>
              </div>
              <div v-if="foundCustomer" class="mt-2">
                <button type="button" class="btn btn-sm btn-soft btn-secondary" @click="clearFoundCustomer">
                  <span class="icon-[tabler--x] size-4"></span> ລົບຂໍ້ມູນລູກຄ້າ ແລະ ກໍານົດຂໍ້ມູນໃໝ່
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-control">
            <label class="label"><span class="label-text font-medium">ຊື່ແທ້ *</span></label>
            <input v-model="customerForm.first_name" type="text" placeholder="ປ້ອນຊື່"
              class="input input-bordered w-full" :class="{ 'input-error': customerErrors.first_name }" />
            <label v-if="customerErrors.first_name" class="label text-error"><span class="label-text-alt">{{
              customerErrors.first_name }}</span></label>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text font-medium">ນາມສະກຸນ</span></label>
            <input v-model="customerForm.last_name" type="text" placeholder="ປ້ອນນາມສະກຸນ"
              class="input input-bordered w-full" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text font-medium">ເບີໂທລະສັບ *</span></label>
            <input v-model="customerForm.phone" type="tel" placeholder="ປ້ອນເບີໂທລະສັບ"
              class="input input-bordered w-full" :class="{ 'input-error': customerErrors.phone }" maxlength="11" />
            <label v-if="customerErrors.phone" class="label text-error"><span class="label-text-alt">{{
              customerErrors.phone }}</span></label>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text font-medium">ເລກບັດປະຈຳຕົວ</span></label>
            <input v-model="customerForm.id_card" type="text" placeholder="ປ້ອນເລກບັດປະຈຳຕົວ (ຖ້າມີ)"
              class="input input-bordered w-full" :class="{ 'input-error': customerErrors.id_card }" />
            <label v-if="customerErrors.id_card" class="label text-error"><span class="label-text-alt">{{
              customerErrors.id_card }}</span></label>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text font-medium">ອາຍຸ *</span></label>
            <input v-model.number="customerForm.age" type="number" placeholder="ປ້ອນອາຍຸ"
              class="input input-bordered w-full" :class="{ 'input-error': customerErrors.age }" min="18" max="100" />
            <label v-if="customerErrors.age" class="label text-error"><span class="label-text-alt">{{ customerErrors.age
                }}</span></label>
          </div>
          <!-- 🟢 ປຸ່ມຮັບເລກບັນຊີທະນາຄານໃໝ່ທີ່ເພີ່ມເຂົ້າ -->
          <!-- 🟢 ເອົາເຄື່ອງໝາຍ * ອອກ ແລະ ບໍ່ບັງຄັບປ້ອນ -->
          <div class="form-control">
            <label class="label"><span class="label-text font-medium">ເລກບັນຊີທະນາຄານ (BCEL)</span></label>
            <input v-model="customerForm.account_number" type="text" placeholder="ປ້ອນເລກບັນຊີ (ຖ້າມີ)"
              class="input input-bordered w-full" :class="{ 'input-error': customerErrors.account_number }" />
            <label v-if="customerErrors.account_number" class="label text-error"><span class="label-text-alt">{{
              customerErrors.account_number }}</span></label>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div class="form-control">
            <label class="label"><span class="label-text font-medium">ແຂວງ *</span></label>
            <select v-model="customerForm.province_id" class="select select-bordered w-full"
              :class="{ 'select-error': customerErrors.province_id }">
              <option value="" disabled>-- ເລືອກແຂວງ --</option>
              <option v-for="p in addressStore.provinces" :key="p.province_id" :value="p.province_id">{{ p.province_name
                }}</option>
            </select>
            <label v-if="customerErrors.province_id" class="label text-error"><span class="label-text-alt">{{
              customerErrors.province_id }}</span></label>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text font-medium">ເມືອງ *</span></label>
            <select v-model="customerForm.district_id" class="select select-bordered w-full"
              :disabled="!customerForm.province_id || addressStore.loading"
              :class="{ 'select-error': customerErrors.district_id }">
              <option value="" disabled>{{ addressStore.loading ? 'ກຳລັງໂຫຼດ...' : '-- ເລືອກເມືອງ --' }}</option>
              <option v-for="d in addressStore.districts" :key="d.district_id" :value="d.district_id">{{ d.district_name
                }}</option>
            </select>
            <label v-if="customerErrors.district_id" class="label text-error"><span class="label-text-alt">{{
              customerErrors.district_id }}</span></label>
          </div>
        </div>
        <div class="form-control mt-4">
          <label class="label"><span class="label-text font-medium">ບ້ານ / ໜ່ວຍ / ເຮືອນເລກທີ *</span></label>
          <input v-model="customerForm.address" type="text" placeholder="ຕົວຢ່າງ: ບ້ານໂພນໄຊ, ໜ່ວຍ 15"
            class="input input-bordered w-full" :class="{ 'input-error': customerErrors.address }" />
          <label v-if="customerErrors.address" class="label text-error"><span class="label-text-alt">{{
            customerErrors.address }}</span></label>
        </div>

        <div class="form-control mt-4">
          <label class="label">
            <span class="label-text font-medium">ອາຊີບ <span class="text-primary">*</span></span>
            <span class="text-xs text-gray-500 ml-1">(ຂໍ້ມູນສຳຄັນສຳລັບການພິຈາລະນາສິນເຊື່ອ)</span>
          </label>
          <input v-model="customerForm.occupation" type="text"
            placeholder="ປ້ອນອາຊີບ (ຕົວຢ່າງ: ພະນັກງານລັດ, ທຸລະກິດສ່ວນຕົວ, ກະສິກອນ)" class="input input-bordered w-full"
            :class="{ 'input-error': customerErrors.occupation }" />
          <label v-if="customerErrors.occupation" class="label text-error"><span class="label-text-alt">{{
            customerErrors.occupation }}</span></label>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div class="form-control">
            <label class="label"><span class="label-text font-medium">ລາຍຮັບຕໍ່ເດືອນ (ກີບ) *</span></label>
            <input :value="formatCurrencyInput(customerForm.monthly_income)"
              @input="handleCurrencyInput('monthly_income', $event)" type="text" placeholder="ປ້ອນລາຍຮັບຕໍ່ເດືອນ"
              class="input input-bordered w-full" :class="{ 'input-error': customerErrors.monthly_income }" />
            <label v-if="customerErrors.monthly_income" class="label text-error"><span class="label-text-alt">{{
              customerErrors.monthly_income }}</span></label>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text font-medium">ໜີ້ສິນອື່ນໆ (ກີບ)</span></label>
            <input :value="formatCurrencyInput(customerForm.other_debts)"
              @input="handleCurrencyInput('other_debts', $event)" type="text" placeholder="ປ້ອນຈຳນວນໜີ້ສິນອື່ນໆ"
              class="input input-bordered w-full" />
          </div>
        </div>

      </div>

      <div class="flex justify-end mt-8">
        <button type="button" class="btn btn-primary"
          :disabled="!selectedShop || !selectedProduct || (productVariants.length > 0 && !selectedVariant) || isSubmitting"
          @click="handleDirectSubmit">
          <span v-if="isSubmitting" class="loading loading-spinner loading-xs"></span>
          <span v-else>ສົ່ງຄຳຂໍສິນເຊື່ອ</span>
        </button>
      </div>
    </div>

    <div v-else-if="activeTab === 'documents'"
      class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-6">ອັບໂຫຼດເອກະສານ</h2>

      <div v-if="!canAccessDocuments" class="text-center py-12">
        <div class="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4"><span
            class="icon-[tabler--alert-triangle] size-8 text-warning"></span></div>
        <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-2">ຍັງບໍ່ໄດ້ສົ່ງຄຳຂໍ</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">ກະລຸນາສົ່ງຄຳຂໍສິນເຊື່ອໃນແຖບ "ສ້າງຄຳຂໍ" ກ່ອນ</p>
        <button class="btn btn-primary" @click="switchTab('application')">ກັບໄປສົ່ງຄຳຂໍ</button>
      </div>

      <div v-else class="space-y-6">
        <div v-for="(cat, catIndex) in allDocumentCategories" :key="'edit-cat-' + cat.id"
          class="border rounded-2xl p-5 bg-white shadow-sm border-slate-200">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h5 class="font-bold text-slate-800">{{ cat.name }}</h5>
              <p class="text-[11px] text-slate-400 mt-1">{{ cat.description }}</p>
            </div>
            <span v-if="cat.required"
              class="badge badge-error badge-soft text-[10px] font-bold px-2 py-1">ຕ້ອງການ</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            <div v-for="(f, fileIndex) in cat.files" :key="fileIndex"
              class="relative aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
              <button type="button" @click.stop="removeDocument(cat.id, fileIndex)"
                class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 z-10 shadow-md hover:scale-110 transition-transform">
                <span class="icon-[tabler--x] size-4"></span>
              </button>
              <img v-if="!f.isPdf" :src="f.preview"
                class="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
                @click="openInNewTab(f.preview)" />
              <div v-else
                class="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors"
                @click="openInNewTab(f.preview)">
                <span class="icon-[tabler--file-type-pdf] size-10 text-red-500 mb-1"></span>
                <span class="text-[10px] text-center truncate px-2 w-full">{{ f.name }}</span>
              </div>
              <div class="absolute bottom-1 left-1 pointer-events-none">
                <span v-if="f.file" class="text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded shadow">ໃໝ່</span>
                <span v-else class="text-[9px] bg-slate-500 text-white px-1.5 py-0.5 rounded shadow">ໄຟລ໌ເດີມ</span>
              </div>
            </div>

            <label
              class="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-400 transition-all group">
              <input type="file" class="hidden" multiple accept="image/*,.pdf"
                @change="(e) => handleDocumentUpload(cat.id, e)" />
              <div
                class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                <span class="icon-[tabler--plus] size-6 text-slate-400 group-hover:text-indigo-600"></span>
              </div>
              <span class="text-[11px] font-bold text-slate-400 mt-2 group-hover:text-indigo-600">ເພີ່ມໄຟລ໌</span>
            </label>
          </div>

          <div class="mt-3 text-[11px] text-gray-500 text-right font-medium border-t pt-3">
            ອັບໂຫຼດແລ້ວ: <span :class="cat.files.length > 0 ? 'text-success' : 'text-error'">{{ cat.files.length }}
              ໄຟລ໌</span>
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <button type="button" class="btn btn-primary" :disabled="isSubmitting || !allRequiredDocumentsUploaded"
            @click="submitDocuments">
            <span v-if="isSubmitting" class="loading loading-spinner loading-xs"></span>
            <span v-else>ບັນທຶກເອກະສານ ແລະ ສຳເລັດ</span>
          </button>
        </div>
      </div>
    </div>

    <teleport to="body">
      <div v-if="showSuccessModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200">
          <div class="text-center">
            <div class="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4"><span
                class="icon-[tabler--check] size-8 text-success"></span></div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-2">ສ້າງຮ່າງຄຳຂໍສຳເລັດ!</h3>

            <template v-if="!existingCustomerId">
              <p class="text-gray-600 dark:text-gray-400 mb-6">ຄຳຂໍສິນເຊື່ອຖືກສ້າງເຂົ້າລະບົບແແລ້ວ
                ກະລຸນາອັບໂຫຼດເອກະສານຢັ້ງຢືນ.</p>
              <button type="button" class="btn btn-primary w-full"
                @click="switchToDocumentsTab">ດຳເນີນການອັບໂຫຼດເອກະສານ</button>
            </template>

            <template v-else>
              <p class="text-gray-600 dark:text-gray-400 mb-4">ລະບົບພົບວ່າເປັນລູກຄ້າເກົ່າ ທີ່ມີປະຫວັດເອກະສານໃນລະບົບແລ້ວ.
              </p>
              <div
                class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-sm text-blue-800 dark:text-blue-200 mb-6 text-left">
                ທ່ານຕ້ອງການໃຊ້ເອກະສານເດີມ ຫຼື ອັບໂຫຼດເອກະສານຊຸດໃໝ່?
              </div>
              <div class="flex flex-col gap-3">
                <button type="button" class="btn btn-primary w-full" @click="useExistingDocuments"><span
                    class="icon-[tabler--file-check] size-4 mr-2"></span> ໃຊ້ເອກະສານເດີມທີ່ມີຢູ່</button>
                <button type="button" class="btn btn-outline btn-secondary w-full" @click="switchToDocumentsTab"><span
                    class="icon-[tabler--upload] size-4 mr-2"></span> ອັບໂຫຼດເອກະສານໃໝ່ເພີ່ມເຕີມ</button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
// ==========================================
// 🟢 1. Imports & Interfaces
// ==========================================
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useShopStore } from '@/stores/shop'
import { useProductStore } from '@/stores/product'
import { useProductTypeStore } from '@/stores/productType'
import { useLoanApplicationStore } from '@/stores/loanApplication'
import { useAddressStore } from '@/stores/address';
import { alert } from '@/utils/alert'
import { formatPrice, normalizePhoneNumber, formatStandardPhoneNumber } from '@/utils/formatters'
import { getFullImageUrl } from '@/utils/url';
import type { CreateWithCustomerDto } from '@/types/loanApplication'
import type { shopType } from '@/types/shop'
import type { Product } from '@/types/product'

interface UploadedFile {
  id?: number;
  file: File | null;
  preview: string;
  isPdf: boolean;
  name: string;
}

interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  files: UploadedFile[];
}

// ==========================================
// 🟢 2. Store & Global State Setup
// ==========================================
const shopStore = useShopStore()
const productStore = useProductStore()
const productTypeStore = useProductTypeStore()
const loanApplicationStore = useLoanApplicationStore()
const addressStore = useAddressStore()
const router = useRouter()

const activeTab = ref<'application' | 'documents'>('application')
const isSubmitting = ref(false)
const canAccessDocuments = ref(false)
const showSuccessModal = ref(false)
const loanNumber = ref('LN' + Date.now().toString().slice(-6))

// ==========================================
// 🟢 3. Shop & Product Selection Logic
// ==========================================
const shopSearch = ref('')
const showShopDropdown = ref(false)
const selectedShop = ref<shopType | null>(null)

const productSearch = ref('')
const showProductDropdown = ref(false)
const selectedProduct = ref<Product | null>(null)
const selectedProductType = ref<string>('')

const productVariants = ref<any[]>([])
const selectedVariant = ref<any>(null)
const isLoadingVariants = ref(false)

const filteredShops = computed(() => {
  let shopsArray = shopStore.shops
  if (shopsArray && typeof shopsArray === 'object' && !Array.isArray(shopsArray)) shopsArray = Object.values(shopsArray)
  if (!shopSearch.value) return Array.isArray(shopsArray) ? shopsArray : []
  const query = shopSearch.value.toLowerCase()
  return Array.isArray(shopsArray) ? shopsArray.filter(shop => shop.shop_name?.toLowerCase().includes(query) || shop.shop_owner?.toLowerCase().includes(query)) : []
})

const filteredProducts = computed(() => {
  if (!selectedShop.value) return []
  let productsArray = productStore.products
  if (productsArray && typeof productsArray === 'object' && !Array.isArray(productsArray)) productsArray = Object.values(productsArray)
  if (!productSearch.value) return Array.isArray(productsArray) ? productsArray : []
  const query = productSearch.value.toLowerCase()
  return Array.isArray(productsArray) ? productsArray.filter(product => product.product_name?.toLowerCase().includes(query) || product.type_name?.toLowerCase().includes(query) || product.id?.toString().includes(query)) : []
})

const productTypeDisplay = computed(() => {
  if (productTypeStore.isLoading) return 'ກຳລັງໂຫຼດ...'
  if (selectedProductType.value) return selectedProductType.value
  if (selectedProduct.value?.type_name) return selectedProduct.value.type_name
  return 'ບໍ່ລະບຸປະເພດ'
})

let shopSearchTimer: NodeJS.Timeout | null = null
const debounceShopSearch = () => {
  if (shopSearchTimer) clearTimeout(shopSearchTimer)
  shopSearchTimer = setTimeout(() => { }, 300)
}

let productSearchTimer: NodeJS.Timeout | null = null
const debounceProductSearch = () => {
  if (productSearchTimer) clearTimeout(productSearchTimer)
  productSearchTimer = setTimeout(async () => {
    if (!selectedShop.value) return;
    try { await productStore.fetchProducts({ shop_id: selectedShop.value.id, search: productSearch.value, limit: 50 }); showProductDropdown.value = true; }
    catch (error) { console.error('Failed to search products:', error); }
  }, 500)
}

const handleShopBlur = () => setTimeout(() => { showShopDropdown.value = false }, 200)
const handleProductBlur = () => setTimeout(() => { showProductDropdown.value = false }, 200)

const selectShop = async (shop: shopType) => {
  selectedShop.value = shop; shopSearch.value = shop.shop_name; showShopDropdown.value = false
  clearProductSelection()
  try { await productStore.fetchProducts({ shop_id: shop.id, limit: 50 }) }
  catch (error) { console.error('Failed to load products:', error) }
}

const clearShopSelection = () => {
  selectedShop.value = null; shopSearch.value = ''; clearProductSelection()
}

const selectProduct = async (product: Product) => {
  selectedProduct.value = product; productSearch.value = product.product_name; showProductDropdown.value = false
  selectedVariant.value = null; productVariants.value = []; loanErrors.variant = ''
  isLoadingVariants.value = true

  try {
    const variants = await productStore.fetchVariantsByProductId(product.id)
    productVariants.value = variants || []
    if (productVariants.value.length === 0) calculateInitialLoanDetails(Number(product.price))
    else { loanDetails.totalAmount = 0; loanDetails.monthlyPayment = 0 }
  } catch (error) {
    calculateInitialLoanDetails(Number(product.price))
  } finally { isLoadingVariants.value = false }

  if (product.productType_id) {
    try {
      await productTypeStore.fetchProductTypeById(product.productType_id)
      if (productTypeStore.productType) selectedProductType.value = productTypeStore.productType.type_name
    } catch (error) { selectedProductType.value = product.type_name || 'ບໍ່ລະບຸ' }
  } else { selectedProductType.value = product.type_name || 'ບໍ່ລະບຸ' }
}

const clearProductSelection = () => {
  selectedProduct.value = null; productSearch.value = ''; selectedProductType.value = ''
  selectedVariant.value = null; productVariants.value = []; loanErrors.variant = ''
  loanDetails.totalAmount = 0; loanDetails.downPayment = 0; loanDetails.interestRate = 0; loanDetails.termMonths = 0; loanDetails.monthlyPayment = 0;
}

const selectVariant = (variant: any) => {
  selectedVariant.value = variant; loanErrors.variant = ''; calculateInitialLoanDetails(variant.price)
}

// ==========================================
// 🟢 4. Loan Details & Calculations
// ==========================================
const loanDetails = reactive({
  totalAmount: 0, downPayment: 0, interestRate: 0, termMonths: 0, monthlyPayment: 0, interestType: 'flat_rate'
})
const loanErrors = reactive({
  totalAmount: '', downPayment: '', interestRate: '', termMonths: '', variant: ''
})

const getInterestRateByTerm = (months: number): number => {
  if (!months || months <= 6) return 2.50; if (months <= 12) return 2.00; if (months <= 18) return 1.89; if (months <= 24) return 1.75; return 1.69;
}

const calculateInitialLoanDetails = (priceToUse?: number) => {
  if (!selectedProduct.value) return
  loanDetails.totalAmount = priceToUse !== undefined ? Number(priceToUse) : Number(selectedProduct.value.price || 0)
  loanDetails.termMonths = Number(selectedProduct.value.term || 12)
  loanDetails.downPayment = 0
  loanDetails.interestRate = getInterestRateByTerm(loanDetails.termMonths)
  loanDetails.interestType = selectedProduct.value.interest_type || 'flat_rate'
  loanDetails.monthlyPayment = calculateMonthlyPayment()
}

const calculateMonthlyPayment = (): number => {
  const { totalAmount, downPayment, interestRate, termMonths, interestType } = loanDetails
  if (!totalAmount || !termMonths) return 0
  const principal = Math.max(0, totalAmount - downPayment)
  const isYearly = selectedProduct.value?.interest_rate_type === 'yearly'
  const ratePerMonth = isYearly ? (interestRate / 12) : interestRate

  if (ratePerMonth <= 0) return Math.round(principal / termMonths)

  if (interestType === 'flat_rate') {
    const totalInterest = principal * (ratePerMonth / 100) * termMonths
    return Math.round((principal + totalInterest) / termMonths)
  } else {
    const r = ratePerMonth / 100; const n = termMonths;
    return Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1))
  }
}

const handleTermChange = () => {
  if (loanDetails.termMonths > 0) loanDetails.interestRate = getInterestRateByTerm(loanDetails.termMonths);
  handleCalculationChange();
}
const handleCalculationChange = () => { validateLoanDetails(); loanDetails.monthlyPayment = calculateMonthlyPayment() }
const calculateTotalPayment = (): number => loanDetails.monthlyPayment * loanDetails.termMonths
const calculateTotalInterest = (): number => calculateTotalPayment() - Math.max(0, loanDetails.totalAmount - loanDetails.downPayment)

const validateLoanDetails = (): boolean => {
  Object.keys(loanErrors).forEach(key => { loanErrors[key as keyof typeof loanErrors] = '' })
  let isValid = true
  if (productVariants.value.length > 0 && !selectedVariant.value) { loanErrors.variant = 'ກະລຸນາເລືອກ ສີ / ຂະໜາດ ຂອງສິນຄ້າ'; isValid = false; }
  if (loanDetails.totalAmount <= 0) { loanErrors.totalAmount = 'ລາຄາສິນຄ້າຕ້ອງຫຼາຍກວ່າ 0'; isValid = false }
  if (loanDetails.downPayment < 0) { loanErrors.downPayment = 'ເງິນດາວຕ້ອງບໍ່ຕິດລົບ'; isValid = false }
  if (loanDetails.downPayment > loanDetails.totalAmount) { loanErrors.downPayment = 'ເງິນດາວຕ້ອງໜ້ອຍກວ່າລາຄາສິນຄ້າ'; isValid = false }
  if (!loanDetails.termMonths || loanDetails.termMonths <= 0) { loanErrors.termMonths = 'ກະລຸນາເລືອກຈຳນວນງວດ'; isValid = false }
  return isValid
}

const handlePriceInput = (e: Event) => {
  const target = e.target as HTMLInputElement; const num = parseInt(target.value.replace(/\D/g, ''), 10);
  loanDetails.totalAmount = isNaN(num) ? 0 : num;
  if (loanDetails.downPayment > loanDetails.totalAmount) loanDetails.downPayment = loanDetails.totalAmount;
  handleCalculationChange();
}
const handleDownPaymentInput = (e: Event) => {
  const target = e.target as HTMLInputElement; const num = parseInt(target.value.replace(/\D/g, ''), 10);
  loanDetails.downPayment = isNaN(num) ? 0 : (num > loanDetails.totalAmount ? loanDetails.totalAmount : num);
  handleCalculationChange();
}
const formatCurrencyInput = (val: number | string | null | undefined): string => {
  if (!val) return ''; return Number(val).toLocaleString('en-US');
}

watch(() => [loanDetails.totalAmount, loanDetails.downPayment, loanDetails.interestRate, loanDetails.termMonths, loanDetails.interestType], () => {
  loanDetails.monthlyPayment = calculateMonthlyPayment()
})
watch(selectedProduct, () => { if (selectedProduct.value) calculateInitialLoanDetails() })

// ==========================================
// 🟢 5. Customer Logic
// ==========================================
const customerSearchPhone = ref('')
const isSearchingCustomer = ref(false)
const foundCustomer = ref<any>(null)
const customerSearchMessage = ref('')
const existingCustomerId = ref<number | undefined>(undefined)

const customerForm = reactive({
  first_name: '', last_name: '', phone: '', id_card: '', account_number: '', age: 18, province_id: '', district_id: '', address: '', occupation: '', monthly_income: 0, other_debts: 0
})
const customerErrors = reactive({
  first_name: '', phone: '', id_card: '', account_number: '', province_id: '', district_id: '', age: '', address: '', occupation: '', monthly_income: ''
})

const handleCurrencyInput = (field: 'monthly_income' | 'other_debts', event: Event) => {
  const target = event.target as HTMLInputElement; const num = parseInt(target.value.replace(/\D/g, ''), 10);
  customerForm[field] = isNaN(num) ? 0 : num;
}

watch(() => customerForm.province_id, async (newVal) => {
  customerForm.district_id = '';
  if (newVal) await addressStore.fetchDistricts(newVal); else addressStore.districts = [];
});

const searchCustomerByPhone = async () => {
  if (!customerSearchPhone.value) { customerSearchMessage.value = 'ກະລຸນາປ້ອນເບີໂທລະສັບ'; return; }
  isSearchingCustomer.value = true; customerSearchMessage.value = ''; foundCustomer.value = null; existingCustomerId.value = undefined;

  try {
    const cleanSearchPhone = normalizePhoneNumber(customerSearchPhone.value);
    const customer = await loanApplicationStore.fetchCustomerByPhone(cleanSearchPhone);
    if (customer) {
      foundCustomer.value = customer; existingCustomerId.value = customer.id;
      customerSearchMessage.value = `ພົບຂໍ້ມູນລູກຄ້າ: ${customer.first_name} ${customer.last_name}`
      customerForm.first_name = customer.first_name || ''; customerForm.last_name = customer.last_name || '';
      customerForm.phone = customer.phone; customerForm.id_card = customer.identity_number || '';
      customerForm.account_number = customer.account_number || '';
      customerForm.province_id = customer.province_id || '';
      if (customer.province_id) await addressStore.fetchDistricts(customer.province_id)
      customerForm.district_id = customer.district_id || ''; customerForm.address = customer.address || '';
      customerForm.occupation = customer.occupation || ''; customerForm.monthly_income = Math.floor(Number(customer.income_per_month)) || 0;
      customerForm.other_debts = Math.floor(Number(customer.other_debts)) || 0; customerForm.age = customer.age || 18;
    } else {
      customerSearchMessage.value = 'ບໍ່ພົບຂໍ້ມູນລູກຄ້າ - ສາມາດປ້ອນຂໍ້ມູນໃໝ່ໄດ້'
      customerForm.phone = customerSearchPhone.value.trim()
    }
  } catch (error: any) {
    if (error.response?.status === 404) customerSearchMessage.value = 'ບໍ່ພົບຂໍ້ມູນລູກຄ້າ - ສາມາດປ້ອນຂໍ້ມູນໃໝ່ໄດ້'
    else customerSearchMessage.value = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດການຄົ້ນຫາ';
  } finally { isSearchingCustomer.value = false }
}

const clearFoundCustomer = () => {
  foundCustomer.value = null; existingCustomerId.value = undefined; customerSearchMessage.value = '';
  const phone = customerForm.phone;
  Object.assign(customerForm, { first_name: '', last_name: '', phone, id_card: '', account_number: '', address: '', province_id: '', district_id: '', occupation: '', monthly_income: 0, age: 18, other_debts: 0 })
}

const validateCustomerForm = (): boolean => {
  Object.keys(customerErrors).forEach(key => { customerErrors[key as keyof typeof customerErrors] = '' })
  let isValid = true

  if (!customerForm.first_name.trim()) { customerErrors.first_name = 'ກະລຸນາປ້ອນຊື່ແທ້'; isValid = false }

  if (!customerForm.phone.trim()) {
    customerErrors.phone = 'ກະລຸນາປ້ອນເບີໂທລະສັບ'; isValid = false;
  } else {
    const normalizedPhone = normalizePhoneNumber(customerForm.phone);
    if (normalizedPhone.length < 7 || normalizedPhone.length > 8) { customerErrors.phone = 'ເບີໂທລະສັບບໍ່ຖືກຕ້ອງ (ຕົວຢ່າງ: 020 99887766)'; isValid = false; }
  }

  // if (!customerForm.account_number.trim()) { customerErrors.account_number = 'ກະລຸນາປ້ອນເລກບັນຊີທະນາຄານ'; isValid = false }

  if (customerForm.age < 18 || customerForm.age > 100) { customerErrors.age = 'ອາຍຸຕ້ອງຢູ່ລະຫວ່າງ 18-100 ປີ'; isValid = false }
  if (!customerForm.province_id) { customerErrors.province_id = 'ກະລຸນາເລືອກແຂວງ'; isValid = false }
  if (!customerForm.district_id) { customerErrors.district_id = 'ກະລຸນາເລືອກເມືອງ'; isValid = false }
  if (!customerForm.address.trim()) { customerErrors.address = 'ກະລຸນາປ້ອນທີ່ຢູ່'; isValid = false }
  if (!customerForm.occupation.trim()) { customerErrors.occupation = 'ກະລຸນາປ້ອນອາຊີບ (ຂໍ້ມູນສຳຄັນສຳລັບການພິຈາລະນາສິນເຊື່ອ)'; isValid = false }
  if (customerForm.monthly_income <= 0) { customerErrors.monthly_income = 'ລາຍຮັບຕ້ອງຫຼາຍກວ່າ 0'; isValid = false }

  return isValid
}

// ==========================================
// 🟢 6. Submission Logic
// ==========================================
const handleDirectSubmit = async () => {
  if (!selectedShop.value || !selectedProduct.value || !validateCustomerForm() || !validateLoanDetails()) return
  isSubmitting.value = true
  try {
    if (!existingCustomerId.value && customerForm.phone) {
      try {
        const cleanPhoneCheck = normalizePhoneNumber(customerForm.phone);
        const checkCustomer = await loanApplicationStore.fetchCustomerByPhone(cleanPhoneCheck);
        if (checkCustomer && checkCustomer.id) existingCustomerId.value = checkCustomer.id;
      } catch (err) { /* proceed as new customer */ }
    }

    await submitLoanApplication();
    showSuccessModal.value = true; canAccessDocuments.value = true;
  } catch (error: any) {
    alert.error('ເກີດຂໍ້ຜິດພາດການສົ່ງຄຳຂໍ', error.response?.data?.message || error.message || 'ກະລຸນາລອງໃໝ່ອີກຄັ້ງ');
  } finally { isSubmitting.value = false }
}

const submitLoanApplication = async () => {
  const cleanSubmitPhone = normalizePhoneNumber(customerForm.phone);
  const standardizedPhone = formatStandardPhoneNumber(cleanSubmitPhone);

  const data: CreateWithCustomerDto & { account_number?: string } = {
    phone: standardizedPhone,
    otp: '',
    identity_number: customerForm.id_card.trim(),
    first_name: customerForm.first_name.trim(),
    last_name: customerForm.last_name.trim(),
    account_number: customerForm.account_number.trim(),
    province_id: customerForm.province_id,
    district_id: customerForm.district_id,
    address: customerForm.address.trim(),
    occupation: customerForm.occupation?.trim() || 'ບໍ່ລະບຸ',
    income_per_month: customerForm.monthly_income,
    product_id: selectedProduct.value!.id,
    variant_id: selectedVariant.value?.id || null,
    quantity: 1,
    total_amount: loanDetails.totalAmount,
    loan_period: loanDetails.termMonths,
    interest_rate_at_apply: loanDetails.interestRate,
    monthly_pay: loanDetails.monthlyPayment,
    down_payment: loanDetails.downPayment,
    interest_type: loanDetails.interestType,
    interest_rate_type: selectedProduct.value?.interest_rate_type || 'monthly',
    existing_customer_id: existingCustomerId.value
  }
  return await loanApplicationStore.createWithCustomer(data)
}

// ==========================================
// 🟢 7. Documents Logic
// ==========================================
const requiredDocuments = ref<DocumentCategory[]>([
  { id: 'id_card', name: 'ບັດປະຈຳຕົວ/ສຳມະໂນຄົວ', description: 'ຮູບຖ່າຍເອກະສານຢັ້ງຢືນຕົວຕົນທັງໜ້າ-ຫຼັງ', required: true, files: [] },
  { id: 'house_reg', name: 'ປື້ມສຳມະໂນຄົວ', description: 'ໃບຄອບຄົວຫຼືເອກະສານຢືນຢັນທີ່ຢູ່', required: false, files: [] }
])

const optionalDocuments = ref<DocumentCategory[]>([
  { id: 'salary_slip', name: 'ຫຼັກຖານລາຍຮັບ', description: 'ໃບເງິນເດືອນ ຫຼື ໃບຮັບລາຍຮັບ', required: false, files: [] },
  { id: 'other', name: 'ເອກະສານອື່ນໆ', description: 'ເອກະສານອື່ນໆທີ່ກ່ຽວຂ້ອງ', required: false, files: [] }
])

const allDocumentCategories = computed(() => [...requiredDocuments.value, ...optionalDocuments.value]);
const allRequiredDocumentsUploaded = computed(() => requiredDocuments.value.every(cat => !cat.required || cat.files.length > 0))

const switchTab = (tab: 'application' | 'documents') => { if (tab === 'documents' && !canAccessDocuments.value) return; activeTab.value = tab }

const switchToDocumentsTab = async () => {
  activeTab.value = 'documents'; showSuccessModal.value = false;
  if (existingCustomerId.value) {
    try {
      await loanApplicationStore.fetchDocuments(existingCustomerId.value);
      const currentDocs = loanApplicationStore.currentDocuments || [];
      requiredDocuments.value.forEach(c => c.files = []); optionalDocuments.value.forEach(c => c.files = []);
      currentDocs.forEach(serverDoc => {
        const docType = serverDoc.document_type || serverDoc.doc_type;
        const targetCat = allDocumentCategories.value.find(d => d.id === docType);
        if (targetCat && serverDoc.file_url) {
          targetCat.files.push({ id: serverDoc.id, file: null, preview: getFullImageUrl(serverDoc.file_url) || '', isPdf: serverDoc.file_url?.toLowerCase().endsWith('.pdf') || false, name: serverDoc.original_filename || serverDoc.file_name || 'Document' });
        }
      });
    } catch (e) { console.warn("ບໍ່ສາມາດດຶງເອກະສານເກົ່າໄດ້", e); }
  }
}

const useExistingDocuments = async () => {
  showSuccessModal.value = false; alert.success('ສຳເລັດ', 'ບັນທຶກຮ່າງຄຳຂໍ ແລະ ນຳໃຊ້ເອກະສານເດີມຮຽບຮ້ອຍແລ້ວ');
  router.push({ name: 'ListDraftLoans' });
}

const handleDocumentUpload = async (typeId: string, event: Event) => {
  const target = event.target as HTMLInputElement; const files = target.files;
  if (!files || files.length === 0) return;
  const category = allDocumentCategories.value.find(c => c.id === typeId); if (!category) return;
  for (let i = 0; i < files.length; i++) {
    const file = files[i]; if (!file) continue;
    if (file.size > 5 * 1024 * 1024) { alert.error(`ໄຟລ໌ ${file.name} ໃຫຍ່ເກີນໄປ (ສູງສຸດ 5MB)`); continue; }
    const isPdf = file.type === 'application/pdf'; const reader = new FileReader();
    reader.onload = (e) => { category.files.push({ file: file, preview: (e.target?.result as string) || '', isPdf: isPdf, name: file.name }); };
    reader.readAsDataURL(file);
  }
  target.value = '';
}

const removeDocument = (typeId: string, fileIndex: number) => {
  const category = allDocumentCategories.value.find(c => c.id === typeId);
  if (category && category.files[fileIndex]) category.files.splice(fileIndex, 1);
}
const openInNewTab = (url: string | null | undefined) => { if (url) window.open(url, '_blank'); };

const submitDocuments = async () => {
  if (!allRequiredDocumentsUploaded.value) { alert.error('ກະລຸນາອັບໂຫຼດເອກະສານທີ່ຕ້ອງການທັງໝົດ'); return }
  const currentLoan = loanApplicationStore.currentLoanApplication
  if (!currentLoan || !currentLoan.id) { alert.error('ບໍ່ພົບຂໍ້ມູນຄຳຂໍສິນເຊື່ອ', 'ກະລຸນາສ້າງຄຳຂໍໃໝ່.'); return }

  isSubmitting.value = true
  try {
    const filesToUpload: File[] = []; const docTypesArray: string[] = [];
    for (const cat of allDocumentCategories.value) {
      for (const f of cat.files) {
        if (f.file) {
          const fileObj = f.file instanceof File ? f.file : new File([f.file as Blob], f.name || 'document.pdf', { type: f.file?.type });
          filesToUpload.push(fileObj); docTypesArray.push(cat.id);
        }
      }
    }
    if (filesToUpload.length > 0) await loanApplicationStore.uploadMultipleDocuments(currentLoan.customer_id, currentLoan.id, filesToUpload, docTypesArray);

    alert.success('ບັນທຶກເອກະສານສຳເລັດ!')
    await loanApplicationStore.fetchDocuments(currentLoan.customer_id)
    await loanApplicationStore.fetchLoanApplicationById(currentLoan.id)
    router.push({ name: 'ListDraftLoans' })
  } catch (error: any) {
    alert.error('ເກີດຂໍ້ຜິດພາດການບັນທຶກເອກະສານ', error.response?.data?.message || error.message || 'ກະລຸນາກວດສອບ Backend ຂອງທ່ານ');
  } finally { isSubmitting.value = false }
}

// ==========================================
// 🟢 8. Lifecycle Hooks
// ==========================================
onMounted(async () => {
  existingCustomerId.value = undefined; foundCustomer.value = null; customerSearchPhone.value = ''; customerSearchMessage.value = '';
  Object.assign(customerForm, { first_name: '', last_name: '', phone: '', id_card: '', account_number: '', address: '', province_id: '', district_id: '', occupation: '', monthly_income: 0, age: 18, other_debts: 0 });
  await shopStore.fetchAllShop();
  await addressStore.fetchProvinces();
})
</script>

<style scoped>
.tab-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.address-grid-custom {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  align-items: center;
}

.input-sub {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.select-addr {
  width: 100%;
}

@media (max-width: 768px) {
  .address-grid-custom {
    grid-template-columns: 1fr;
  }
}
</style>
