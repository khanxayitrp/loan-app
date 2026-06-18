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
        <label class="label">
          <span class="label-text font-medium">ເລກທີ່ຄຳຂໍສິນເຊື່ອ</span>
        </label>
        <input type="text" :value="loanNumber"
          class="input input-bordered w-full bg-gray-100 dark:bg-gray-700 cursor-not-allowed" readonly />
        <p class="text-xs text-gray-500 mt-1">ເລກທີ່ນີ້ຈະຖືກສ້າງອັດຕະໂນມັດເມື່ອທ່ານສົ່ງຄຳຂໍ</p>
      </div>

      <div class="form-control mb-6">
        <label class="label">
          <span class="label-text font-medium">ເລືອກຮ້ານ *</span>
        </label>

        <div class="relative">
          <input v-model="shopSearch" type="text" placeholder="ພິມຊື່ຮ້ານ..."
            class="input input-bordered w-full pl-10 pr-10" @input="debounceShopSearch" @focus="showShopDropdown = true"
            @blur="handleShopBlur" />
          <span class="icon-[tabler--building-store] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
          <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            @click="clearShopSelection">
            <span class="icon-[tabler--x] size-4"></span>
          </button>
        </div>

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
        <label class="label">
          <span class="label-text font-medium">ເລືອກສິນຄ້າ *</span>
        </label>

        <div class="relative">
          <input v-model="productSearch" type="text" placeholder="ພີມຊື່ສິນຄ້າ ຫຼື ລະຫັດ…"
            class="input input-bordered w-full pl-10 pr-10" :disabled="!selectedShop" @input="debounceProductSearch"
            @focus="showProductDropdown = true" @blur="handleProductBlur" />
          <span class="icon-[tabler--search] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
          <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            :disabled="!selectedProduct" @click="clearProductSelection">
            <span class="icon-[tabler--x] size-4"></span>
          </button>
        </div>

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
              <div class="text-xs text-gray-500">{{ product.interest_rate }}% {{ product.interest_rate_type === 'yearly' ? '(ຕໍ່ປີ)' : '(ຕໍ່ເດືອນ)' }}</div>
            </div>
          </div>
        </div>

        <div v-else-if="showProductDropdown && filteredProducts.length === 0 && productSearch"
          class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
          <div class="text-center text-gray-500">ບໍ່ພົບສິນຄ້າ</div>
        </div>
      </div>

      <div v-if="selectedProduct && productVariants.length > 0" class="form-control mb-6">
        <label class="label">
          <span class="label-text font-medium text-gray-800 dark:text-white">ເລືອກ ສີ / ຂະໜາດ (ຕົວເລືອກຍ່ອຍ) *</span>
        </label>
        
        <div v-if="isLoadingVariants" class="text-sm text-gray-500 flex items-center gap-2">
          <span class="loading loading-spinner loading-xs"></span> ກຳລັງໂຫຼດຕົວເລືອກຍ່ອຍ...
        </div>
        
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div v-for="variant in productVariants" :key="variant.id" 
               class="border rounded-lg p-3 cursor-pointer flex justify-between items-center transition-all"
               :class="selectedVariant?.id === variant.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-primary/50'"
               @click="selectVariant(variant)">
            <div>
              <div class="font-medium text-sm text-gray-800 dark:text-white">
                {{ variant.color || 'ບໍ່ລະບຸສີ' }} / {{ variant.size_or_capacity || 'ບໍ່ລະບຸຂະໜາດ' }}
              </div>
              <div class="text-xs text-gray-500">SKU: {{ variant.merchant_sku || variant.system_sku }}</div>
            </div>
            <div class="font-bold text-primary">{{ formatPrice(variant.price) }}</div>
          </div>
        </div>
        
        <label v-if="loanErrors.variant" class="label text-error p-0 pt-1">
          <span class="label-text-alt flex items-center gap-1">
            <span class="icon-[tabler--alert-circle] size-4"></span> {{ loanErrors.variant }}
          </span>
        </label>
      </div>

      <div v-if="selectedProduct && (productVariants.length === 0 || selectedVariant)" class="mb-6">
        <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-4">ລາຍລະອຽດສິນເຊື່ອ</h3>

        <div v-if="productTypeStore.error" class="mb-4">
          <div class="alert alert-warning">
            <span class="icon-[tabler--alert-triangle] size-5"></span>
            <span>ບໍ່ສາມາດໂຫຼດຂໍ້ມູນປະເພດສິນຄ້າ: {{ productTypeStore.error }}</span>
          </div>
        </div>

        <div class="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="col-span-1 lg:col-span-2">
              <label class="text-sm text-gray-500 dark:text-gray-400">ສິນຄ້າ</label>
              <p class="font-medium text-gray-800 dark:text-white">
                {{ selectedProduct.product_name }}
                <span v-if="selectedVariant" class="text-primary text-sm font-semibold ml-1">
                  ({{ selectedVariant.color || 'ບໍ່ລະບຸສີ' }} / {{ selectedVariant.size_or_capacity || 'ບໍ່ລະບຸຂະໜາດ' }})
                </span>
                <span class="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  {{ productTypeDisplay }}
                </span>
              </p>
            </div>

            <div>
              <label class="label p-0 pb-1">
                <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">ລາຄາສິນຄ້າ (ກີບ) *</span>
              </label>
              <input :value="formatCurrencyInput(loanDetails.totalAmount)" @input="handlePriceInput" type="text"
                class="input input-sm input-bordered w-full font-bold text-primary" :class="{ 'input-error': loanErrors.totalAmount }" />
              <label v-if="loanErrors.totalAmount" class="label text-error p-0 pt-1">
                <span class="label-text-alt">{{ loanErrors.totalAmount }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ປະເພດການຄິດໄລ່ດອກເບ້ຍ *</span>
            </label>
            <select v-model="loanDetails.interestType" class="select select-bordered w-full"
              @change="handleCalculationChange">
              <option value="flat_rate">ດອກເບ້ຍຄົງທີ່ (Flat Rate)</option>
              <option value="effective_rate">ຫຼຸດຕົ້ນຫຼຸດດອກ (Effective Rate)</option>
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ຈຳນວນງວດ (ເດືອນ) *</span>
            </label>
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
            <label v-if="loanErrors.termMonths" class="label text-error">
              <span class="label-text-alt">{{ loanErrors.termMonths }}</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ເງີນດາວ (ກີບ)</span>
            </label>
            <input :value="formatCurrencyInput(loanDetails.downPayment)" @input="handleDownPaymentInput" type="text"
              placeholder="ປ້ອນເງີນດາວ" class="input input-bordered w-full"
              :class="{ 'input-error': loanErrors.downPayment }" />
            <label v-if="loanErrors.downPayment" class="label text-error">
              <span class="label-text-alt">{{ loanErrors.downPayment }}</span>
            </label>
            <div class="text-xs text-gray-500 mt-1 flex justify-between">
              <span>ເງີນດາວ: {{ formatPrice(loanDetails.downPayment) }}</span>
              <span class="text-primary font-medium">
                ຍອດຈັດ: {{ formatPrice(Math.max(0, loanDetails.totalAmount - loanDetails.downPayment)) }}
              </span>
            </div>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">
                ດອກເບ້ຍ (%) ອັດຕະໂນມັດ
                <span class="text-primary ml-1">
                  {{ selectedProduct?.interest_rate_type === 'yearly' ? '(ຕໍ່ປີ)' : '(ຕໍ່ເດືອນ)' }}
                </span>
                *
              </span>
            </label>
            <input v-model.number="loanDetails.interestRate" type="number" placeholder="ປ້ອນດອກເບ້ຍ"
              class="input input-bordered w-full bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
              :class="{ 'input-error': loanErrors.interestRate }" min="0" max="100" step="0.01" readonly />
          </div>

          <div class="form-control md:col-span-2">
            <label class="label">
              <span class="label-text font-medium">ຄ່າງວດຕໍ່ເດືອນ (ກີບ) - ປະມານການ</span>
            </label>
            <input :value="formatPrice(loanDetails.monthlyPayment)" type="text"
              class="input input-bordered w-full bg-primary/5 text-primary font-bold dark:bg-gray-700 cursor-not-allowed"
              readonly />
          </div>
        </div>

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
              <span class="font-medium">ເງິນກູ້ (Principal):</span>
              <span class="font-medium text-primary">{{ formatPrice(Math.max(0, loanDetails.totalAmount - loanDetails.downPayment)) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">ດອກເບ້ຍທັງໝົດ:</span>
              <span class="font-medium text-error">{{ formatPrice(calculateTotalInterest()) }}</span>
            </div>
            <div class="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
              <span class="font-medium">ຍອດຊຳລະທັງໝົດ (Total Payment):</span>
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

      <div class="space-y-6">
        <h3 class="text-lg font-medium text-gray-800 dark:text-white">ຂໍ້ມູນລູກຄ້າ</h3>

        <div v-if="foundCustomer" class="flex items-center gap-2 text-success">
          <span class="icon-[tabler--check-circle] size-5"></span>
          <span class="text-sm font-medium">ພົບຂໍ້ມູນລູກຄ້າເກົ່າ</span>
        </div>

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

              <div v-if="customerSearchMessage" class="mt-2">
                <div class="alert text-sm" :class="{
                  'alert-success': foundCustomer,
                  'alert-info': !foundCustomer && customerSearchMessage
                }">
                  <span class="icon-[tabler--info-circle] size-4"></span>
                  <span>{{ customerSearchMessage }}</span>
                </div>
              </div>

              <div v-if="foundCustomer" class="mt-2">
                <button type="button" class="btn btn-sm btn-soft btn-secondary" @click="clearFoundCustomer">
                  <span class="icon-[tabler--x] size-4"></span>
                  ລົບຂໍ້ມູນລູກຄ້າ ແລະ ກໍານົດຂໍ້ມູນໃໝ່
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ຊື່ແທ້ *</span>
            </label>
            <input v-model="customerForm.first_name" type="text" placeholder="ປ້ອນຊື່"
              class="input input-bordered w-full" :class="{ 'input-error': customerErrors.first_name }" required />
            <label v-if="customerErrors.first_name" class="label text-error">
              <span class="label-text-alt">{{ customerErrors.first_name }}</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ນາມສະກຸນ</span>
            </label>
            <input v-model="customerForm.last_name" type="text" placeholder="ປ້ອນນາມສະກຸນ"
              class="input input-bordered w-full" />
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
            <input v-model="customerForm.id_card" type="text" placeholder="ປ້ອນເລกບັດປະຈຳຕົວ"
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

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ແຂວງ *</span>
            </label>
            <select v-model="customerForm.province_id" class="select select-bordered w-full"
                    :class="{ 'select-error': customerErrors.province_id }">
              <option value="" disabled>-- ເລືອກແຂວງ --</option>
              <option v-for="p in addressStore.provinces" :key="p.province_id" :value="p.province_id">
                {{ p.province_name }}
              </option>
            </select>
            <label v-if="customerErrors.province_id" class="label text-error">
              <span class="label-text-alt">{{ customerErrors.province_id }}</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ເມືອງ *</span>
            </label>
            <select v-model="customerForm.district_id" class="select select-bordered w-full"
                    :disabled="!customerForm.province_id || addressStore.loading"
                    :class="{ 'select-error': customerErrors.district_id }">
              <option value="" disabled>{{ addressStore.loading ? 'ກຳລັງໂຫຼດ...' : '-- ເລືອກເມືອງ --' }}</option>
              <option v-for="d in addressStore.districts" :key="d.district_id" :value="d.district_id">
                {{ d.district_name }}
              </option>
            </select>
            <label v-if="customerErrors.district_id" class="label text-error">
              <span class="label-text-alt">{{ customerErrors.district_id }}</span>
            </label>
          </div>
        </div>

        <div class="form-control mt-4">
          <label class="label">
            <span class="label-text font-medium">ບ້ານ / ໜ່ວຍ / ເຮືອນເລກທີ *</span>
          </label>
          <input v-model="customerForm.address" type="text" placeholder="ຕົວຢ່າງ: ບ້ານໂພນໄຊ, ໜ່ວຍ 15"
                 class="input input-bordered w-full" :class="{ 'input-error': customerErrors.address }" />
          <label v-if="customerErrors.address" class="label text-error">
            <span class="label-text-alt">{{ customerErrors.address }}</span>
          </label>
        </div>

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
          <div class="text-xs text-gray-500 mt-1">
            <p>ຕົວຢ່າງ: ພະນັກງານບໍລິສັດ, ຄູ, ແພດ, ທຸລະກິດສ່ວນຕົວ, ກະສິກອນ, ແຮງງານອຸດສາຫະກຳ</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ລາຍຮັບຕໍ່ເດືອນ (ກີບ) *</span>
            </label>
            <input :value="formatCurrencyInput(customerForm.monthly_income)"
              @input="handleCurrencyInput('monthly_income', $event)" type="text" placeholder="ປ້ອນລາຍຮັບຕໍ່ເດືອນ"
              class="input input-bordered w-full" :class="{ 'input-error': customerErrors.monthly_income }" required />
            <div class="text-xs text-gray-500 mt-1">
              <div>ລາຍຮັບຕໍ່เດືອນ (ກີບ): {{ formatPrice(customerForm.monthly_income) }}</div>
            </div>
            <label v-if="customerErrors.monthly_income" class="label text-error">
              <span class="label-text-alt">{{ customerErrors.monthly_income }}</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ໜີ້ສິນອື່ນໆ (ກີບ)</span>
            </label>
            <input :value="formatCurrencyInput(customerForm.other_debts)"
              @input="handleCurrencyInput('other_debts', $event)" type="text" placeholder="ປ້ອນຈຳນວນໜີ້ສິນອື່ນໆ"
              class="input input-bordered w-full" />
            <div class="text-xs text-gray-500 mt-1">
              <div>ໜີ້ສິນອື່ນໆ (ກີບ): {{ formatPrice(customerForm.other_debts) }}</div>
            </div>
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
        <div v-for="(cat, catIndex) in allDocumentCategories" :key="'edit-cat-' + cat.id" 
             class="border rounded-2xl p-5 bg-white shadow-sm border-slate-200">
          
          <div class="flex justify-between items-start mb-4">
            <div>
              <h5 class="font-bold text-slate-800">{{ cat.name }}</h5>
              <p class="text-[11px] text-slate-400 mt-1">{{ cat.description }}</p>
            </div>
            <span v-if="cat.required" class="badge badge-error badge-soft text-[10px] font-bold px-2 py-1">ຕ້ອງການ</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            
            <div v-for="(f, fileIndex) in cat.files" :key="fileIndex" 
                 class="relative aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
              
              <button type="button" @click.stop="removeDocument(cat.id, fileIndex)" 
                class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 z-10 shadow-md hover:scale-110 transition-transform">
                <span class="icon-[tabler--x] size-4"></span>
              </button>

              <img v-if="!f.isPdf" :src="f.preview" class="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity" @click="openInNewTab(f.preview)" />
              <div v-else class="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors" @click="openInNewTab(f.preview)">
                <span class="icon-[tabler--file-type-pdf] size-10 text-red-500 mb-1"></span>
                <span class="text-[10px] text-center truncate px-2 w-full">{{ f.name }}</span>
              </div>

              <div class="absolute bottom-1 left-1 pointer-events-none">
                <span v-if="f.file" class="text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded shadow">ໃໝ່</span>
                <span v-else class="text-[9px] bg-slate-500 text-white px-1.5 py-0.5 rounded shadow">ໄຟລ໌ເດີມ</span>
              </div>
            </div>

            <label class="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-400 transition-all group">
              <input type="file" class="hidden" multiple accept="image/*,.pdf" @change="(e) => handleDocumentUpload(cat.id, e)" />
              <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                <span class="icon-[tabler--plus] size-6 text-slate-400 group-hover:text-indigo-600"></span>
              </div>
              <span class="text-[11px] font-bold text-slate-400 mt-2 group-hover:text-indigo-600">ເພີ່ມໄຟລ໌</span>
            </label>

          </div>
          
          <div class="mt-3 text-[11px] text-gray-500 text-right font-medium border-t pt-3">
            ອັບໂຫຼດແລ້ວ: <span :class="cat.files.length > 0 ? 'text-success' : 'text-error'">{{ cat.files.length }} ໄຟລ໌</span>
          </div>
        </div>

        <div v-if="isSubmitting" class="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-center font-bold text-indigo-700 shadow-sm flex items-center justify-center gap-2">
          <span class="loading loading-spinner loading-sm"></span>
          ກຳລັງອັບໂຫຼດເອກະສານ... ກະລຸນາລໍຖ້າ
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
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200">
          <div class="text-center">
            <div class="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="icon-[tabler--check] size-8 text-success"></span>
            </div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-2">ສ້າງຮ່າງຄຳຂໍສຳເລັດ!</h3>

            <template v-if="!existingCustomerId">
              <p class="text-gray-600 dark:text-gray-400 mb-6">
                ຄຳຂໍສິນເຊື່ອຖືກສ້າງເຂົ້າລະບົບແແລ້ວ ກະລຸນາອັບໂຫຼດເອກະສານຢັ້ງຢືນ.
              </p>
              <button type="button" class="btn btn-primary w-full" @click="switchToDocumentsTab">
                ດຳເນີນການອັບໂຫຼດເອກະສານ
              </button>
            </template>

            <template v-else>
              <p class="text-gray-600 dark:text-gray-400 mb-4">
                ລະບົບພົບວ່າເປັນລູກຄ້າເກົ່າ ທີ່ມີປະຫວັດເອກະສານໃນລະບົບແລ້ວ.
              </p>
              <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-sm text-blue-800 dark:text-blue-200 mb-6 text-left">
                ທ່ານຕ້ອງການໃຊ້ເອກະສານເດີມ ຫຼື ອັບໂຫຼດເອກະສານຊຸດໃໝ່?
                <br><span class="text-xs opacity-70">(ລະບົບອາດຈະຮຽກຮ້ອງບາງເອກະສານໃໝ່ຖ້າອັນເກົ່າໝົດອາຍຸ)</span>
              </div>
              <div class="flex flex-col gap-3">
                <button type="button" class="btn btn-primary w-full" @click="useExistingDocuments">
                  <span class="icon-[tabler--file-check] size-4 mr-2"></span> ໃຊ້ເອກະສານເດີມທີ່ມີຢູ່
                </button>
                <button type="button" class="btn btn-outline btn-secondary w-full" @click="switchToDocumentsTab">
                  <span class="icon-[tabler--upload] size-4 mr-2"></span> ອັບໂຫຼດເອກະສານໃໝ່ເພີ່ມເຕີມ
                </button>
              </div>
            </template>

          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useShopStore } from '@/stores/shop'
import { useProductStore } from '@/stores/product'
import { useProductTypeStore } from '@/stores/productType'
import { useLoanApplicationStore } from '@/stores/loanApplication'
import { alert } from '@/utils/alert'
import type { CreateWithCustomerDto } from '@/types/loanApplication'
import { formatPrice } from '@/utils/formatters'
import type { shopType } from '@/types/shop'
import type { Product } from '@/types/product'
import { useAddressStore } from '@/stores/address';
import { getFullImageUrl } from '@/utils/url';

interface Customer {
  first_name: string
  last_name: string
  phone: string
  id_card: string
  age: number
  province_id: string
  district_id: string
  address: string
  monthly_income: number
  other_debts: number
}

// 🟢 ປ່ຽນແປງ Interface ໃໝ່ເພື່ອຮອງຮັບ Multi-file
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

const shopStore = useShopStore()
const productStore = useProductStore()
const productTypeStore = useProductTypeStore()
const loanApplicationStore = useLoanApplicationStore()
const addressStore = useAddressStore()

const router = useRouter()
const activeTab = ref<'application' | 'documents'>('application')
const isSubmitting = ref(false)
const canAccessDocuments = ref(false)

const loanNumber = ref('LN' + Date.now().toString().slice(-6))

const productVariants = ref<any[]>([])
const selectedVariant = ref<any>(null)
const isLoadingVariants = ref(false)

const getInterestRateByTerm = (months: number): number => {
  if (!months || months <= 6) return 2.50;
  if (months <= 12) return 2.00;
  if (months <= 18) return 1.89;
  if (months <= 24) return 1.75;
  return 1.69;
}

const handleTermChange = () => {
  if (loanDetails.termMonths > 0) {
    loanDetails.interestRate = getInterestRateByTerm(loanDetails.termMonths);
  }
  handleCalculationChange();
}

const loanDetails = reactive({
  totalAmount: 0,
  downPayment: 0,
  interestRate: 0,
  termMonths: 0,
  monthlyPayment: 0,
  interestType: 'flat_rate'
})

const loanErrors = reactive({
  totalAmount: '',
  downPayment: '',
  interestRate: '',
  termMonths: '',
  variant: '' 
})

const calculateInitialLoanDetails = (priceToUse?: number) => {
  if (!selectedProduct.value) return

  const { term, interest_type, price } = selectedProduct.value

  loanDetails.totalAmount = priceToUse !== undefined ? Number(priceToUse) : Number(price || 0)
  loanDetails.termMonths = Number(term || 12)
  loanDetails.downPayment = 0
  loanDetails.interestRate = getInterestRateByTerm(loanDetails.termMonths)
  loanDetails.interestType = interest_type || 'flat_rate'
  loanDetails.monthlyPayment = calculateMonthlyPayment()
}

const calculateMonthlyPayment = (): number => {
  const { totalAmount, downPayment, interestRate, termMonths, interestType } = loanDetails

  if (!totalAmount || !termMonths) return 0

  const principal = Math.max(0, totalAmount - downPayment)
  const isYearly = selectedProduct.value?.interest_rate_type === 'yearly'
  const ratePerMonth = isYearly ? (interestRate / 12) : interestRate

  if (ratePerMonth <= 0) {
    return Math.round(principal / termMonths)
  }

  let monthlyPayment = 0;

  if (interestType === 'flat_rate') {
    const totalInterest = principal * (ratePerMonth / 100) * termMonths
    monthlyPayment = (principal + totalInterest) / termMonths
  } else if (interestType === 'effective_rate') {
    const r = ratePerMonth / 100;
    const n = termMonths;
    monthlyPayment = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  }

  return Math.round(monthlyPayment)
}

const formatCurrencyInput = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined || val === '') return '';
  const num = typeof val === 'string' ? parseInt(val.replace(/,/g, ''), 10) : Math.floor(Number(val));
  if (isNaN(num)) return '';
  return num.toLocaleString('en-US');
};

const handleCurrencyInput = (field: 'monthly_income' | 'other_debts', event: Event) => {
  const target = event.target as HTMLInputElement;
  const cursorPosition = target.selectionStart;
  const originalLength = target.value.length;

  const rawValue = target.value.replace(/,/g, '').replace(/[^\d]/g, '');
  const numericValue = parseInt(rawValue, 10);

  if (!isNaN(numericValue) && rawValue !== '') {
    customerForm[field] = numericValue;
  } else {
    customerForm[field] = 0;
  }

  target.value = formatCurrencyInput(customerForm[field]) || '';

  const newLength = target.value.length;
  const lengthDiff = newLength - originalLength;
  if (cursorPosition !== null) {
    target.setSelectionRange(cursorPosition + lengthDiff, cursorPosition + lengthDiff);
  }
};

const handlePriceInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const cursorPosition = target.selectionStart;
  const originalLength = target.value.length;

  const rawValue = target.value.replace(/,/g, '').replace(/[^\d]/g, '');
  const numericValue = parseInt(rawValue, 10);

  if (!isNaN(numericValue) && rawValue !== '') {
    loanDetails.totalAmount = numericValue;
    if (loanDetails.downPayment > loanDetails.totalAmount) {
      loanDetails.downPayment = loanDetails.totalAmount;
    }
  } else {
    loanDetails.totalAmount = 0;
  }

  target.value = formatCurrencyInput(loanDetails.totalAmount) || '';

  const newLength = target.value.length;
  const lengthDiff = newLength - originalLength;
  if (cursorPosition !== null) {
    target.setSelectionRange(cursorPosition + lengthDiff, cursorPosition + lengthDiff);
  }

  handleCalculationChange();
};

const handleDownPaymentInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const cursorPosition = target.selectionStart;
  const originalLength = target.value.length;

  const rawValue = target.value.replace(/,/g, '').replace(/[^\d]/g, '');
  const numericValue = parseInt(rawValue, 10);

  if (!isNaN(numericValue) && rawValue !== '') {
    if (numericValue > loanDetails.totalAmount) {
      loanDetails.downPayment = loanDetails.totalAmount;
    } else {
      loanDetails.downPayment = numericValue;
    }
  } else {
    loanDetails.downPayment = 0;
  }

  target.value = formatCurrencyInput(loanDetails.downPayment) || '';

  const newLength = target.value.length;
  const lengthDiff = newLength - originalLength;
  if (cursorPosition !== null) {
    target.setSelectionRange(cursorPosition + lengthDiff, cursorPosition + lengthDiff);
  }

  handleCalculationChange();
};

const calculateTotalPayment = (): number => {
  return loanDetails.monthlyPayment * loanDetails.termMonths
}

const calculateTotalInterest = (): number => {
  const totalPayment = calculateTotalPayment()
  const loanAmount = Math.max(0, loanDetails.totalAmount - loanDetails.downPayment)
  return totalPayment - loanAmount
}

const validateLoanDetails = (): boolean => {
  Object.keys(loanErrors).forEach(key => {
    loanErrors[key as keyof typeof loanErrors] = ''
  })
  let isValid = true

  if (productVariants.value.length > 0 && !selectedVariant.value) {
    loanErrors.variant = 'ກະລຸນາເລືອກ ສີ / ຂະໜາດ ຂອງສິນຄ້າ';
    isValid = false;
  }

  if (loanDetails.totalAmount <= 0) { loanErrors.totalAmount = 'ລາຄາສິນຄ້າຕ້ອງຫຼາຍກວ່າ 0'; isValid = false }
  if (loanDetails.downPayment < 0) { loanErrors.downPayment = 'ເງິນດາວຕ້ອງບໍ່ຕິດລົບ'; isValid = false }
  if (loanDetails.downPayment > loanDetails.totalAmount) { loanErrors.downPayment = 'ເງິນດາວຕ້ອງໜ້ອຍກວ່າລາຄາສິນຄ້າ'; isValid = false }
  if (loanDetails.interestRate < 0 || loanDetails.interestRate > 100) { loanErrors.interestRate = 'ดອກເບ້ຍຕ້ອງຢູ່ລະຫວ່າງ 0-100%'; isValid = false }
  if (!loanDetails.termMonths || loanDetails.termMonths <= 0) { loanErrors.termMonths = 'ກະລຸນາເລືອກຈຳນວນງວດ'; isValid = false }

  return isValid
}

const handleCalculationChange = () => {
  validateLoanDetails()
  loanDetails.monthlyPayment = calculateMonthlyPayment()
}

const shopSearch = ref('')
const showShopDropdown = ref(false)
const selectedShop = ref<shopType | null>(null)
const selectedProductType = ref<string>('')

const productSearch = ref('')
const showProductDropdown = ref(false)
const selectedProduct = ref<Product | null>(null)

const customerSearchPhone = ref('')
const isSearchingCustomer = ref(false)
const foundCustomer = ref<any>(null)
const customerSearchMessage = ref('')
const allowEditFoundCustomer = ref(false)
const existingCustomerId = ref<number | undefined>(undefined)

// const searchCustomerByPhone = async () => {
//   if (!customerSearchPhone.value || customerSearchPhone.value.trim().length < 8) {
//     customerSearchMessage.value = 'ກະລຸນາປ້ອນເບີໂທລະສັບທີ່ຖືກຕ້ອງ'
//     return
//   }

//   isSearchingCustomer.value = true
//   customerSearchMessage.value = ''
//   foundCustomer.value = null

//   try {
//     const customer = await loanApplicationStore.fetchCustomerByPhone(customerSearchPhone.value.trim())

//     if (customer) {
//       foundCustomer.value = customer
//       existingCustomerId.value = customer.id
//       customerSearchMessage.value = `ພົບຂໍ້ມູນລູກຄ້າ: ${customer.first_name} ${customer.last_name}`

//       customerForm.first_name = customer.first_name || ''
//       customerForm.last_name = customer.last_name || ''
//       customerForm.phone = customer.phone
//       customerForm.id_card = customer.identity_number || ''
//       customerForm.address = customer.address || ''
//       customerForm.province_id = customer.province_id || ''
//       if (customer.province_id) await addressStore.fetchDistricts(customer.province_id)
//       customerForm.district_id = customer.district_id || ''
//       customerForm.occupation = customer.occupation || ''
//       customerForm.monthly_income = Math.floor(Number(customer.income_per_month)) || 0
//       customerForm.other_debts = Math.floor(Number(customer.other_debts)) || 0
//       customerForm.age = customer.age || 18

//       Object.keys(customerErrors).forEach(key => {
//         customerErrors[key as keyof typeof customerErrors] = ''
//       })
//     } else {
//       customerSearchMessage.value = 'ບໍ່ພົບຂໍ້ມູນລູກຄ້າ - ສາມາດປ້ອນຂໍ້ມູນໃໝ່ໄດ້'
//       customerForm.phone = customerSearchPhone.value.trim()
//     }
//   } catch (error: any) {
//     customerSearchMessage.value = 'ເກີດຂໍ້ຜິດພາດການຄົ້ນຫາ'
//   } finally {
//     isSearchingCustomer.value = false
//   }
// }

const searchCustomerByPhone = async () => {
  if (!customerSearchPhone.value || customerSearchPhone.value.trim().length < 8) {
    customerSearchMessage.value = 'ກະລຸນາປ້ອນເບີໂທລະສັບທີ່ຖືກຕ້ອງ'
    return
  }

  isSearchingCustomer.value = true
  customerSearchMessage.value = ''
  foundCustomer.value = null
  
  // 🟢 1. สิ่งที่หายไป: ต้องรีเซ็ต ID ลูกค้าเก่าทิ้งทุกครั้งที่เริ่มค้นหาใหม่
  existingCustomerId.value = undefined

  try {
    const customer = await loanApplicationStore.fetchCustomerByPhone(customerSearchPhone.value.trim())

    if (customer) {
      foundCustomer.value = customer
      // 🟢 2. ถ้าเจอลูกค้าเก่า ค่อยเซ็ต ID ให้มัน
      existingCustomerId.value = customer.id
      customerSearchMessage.value = `ພົບຂໍ້ມູນລູກຄ້າ: ${customer.first_name} ${customer.last_name}`

      customerForm.first_name = customer.first_name || ''
      customerForm.last_name = customer.last_name || ''
      customerForm.phone = customer.phone
      customerForm.id_card = customer.identity_number || ''
      customerForm.address = customer.address || ''
      customerForm.province_id = customer.province_id || ''
      if (customer.province_id) await addressStore.fetchDistricts(customer.province_id)
      customerForm.district_id = customer.district_id || ''
      customerForm.occupation = customer.occupation || ''
      customerForm.monthly_income = Math.floor(Number(customer.income_per_month)) || 0
      customerForm.other_debts = Math.floor(Number(customer.other_debts)) || 0
      customerForm.age = customer.age || 18

      Object.keys(customerErrors).forEach(key => {
        customerErrors[key as keyof typeof customerErrors] = ''
      })
    } else {
      customerSearchMessage.value = 'ບໍ່ພົບຂໍ້ມູນລູກຄ້າ - ສາມາດປ້ອນຂໍ້ມູນໃໝ່ໄດ້'
      customerForm.phone = customerSearchPhone.value.trim()
      // 🟢 3. ถ้าไม่เจอลูกค้าเก่า ต้องมั่นใจว่า ID เป็น undefined เพื่อให้ระบบสร้างลูกค้าใหม่
      existingCustomerId.value = undefined
    }
  } catch (error: any) {
    // ຖ້າເປັນ 404 (ບໍ່ພົບ) ໃຫ້ສະແດງວ່າບໍ່ພົບຂໍ້ມູນ (ເປັນເລື່ອງປົກກະຕິຂອງລູກຄ້າໃໝ່)
    if (error.response?.status === 404) {
        customerSearchMessage.value = 'ບໍ່ພົບຂໍ້ມູນລູກຄ້າ - ສາມາດປ້ອນຂໍ້ມູນໃໝ່ໄດ້'
    } else {
        // ແຕ່ຖ້າເປັນ Error ອື່ນ (ເຊັ່ນ 500) ໃຫ້ດຶງຂໍ້ຄວາມມາແຈ້ງເຕືອນ
        const backendMessage = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດການຄົ້ນຫາ';
        customerSearchMessage.value = backendMessage;
    }
    existingCustomerId.value = undefined
  } finally {
    isSearchingCustomer.value = false
  }
}

const clearFoundCustomer = () => {
  foundCustomer.value = null
  existingCustomerId.value = undefined
  customerSearchMessage.value = ''
  allowEditFoundCustomer.value = false

  const phone = customerForm.phone
  
  customerForm.first_name = ''
  customerForm.last_name = ''
  customerForm.phone = phone
  customerForm.id_card = ''
  customerForm.address = ''
  customerForm.province_id = ''
  customerForm.district_id = ''
  customerForm.occupation = ''
  customerForm.monthly_income = 0
  customerForm.age = 18
  customerForm.other_debts = 0
}

watch(() => [loanDetails.totalAmount, loanDetails.downPayment, loanDetails.interestRate, loanDetails.termMonths, loanDetails.interestType], () => {
  loanDetails.monthlyPayment = calculateMonthlyPayment()
})

watch(selectedProduct, () => {
  if (selectedProduct.value) {
    calculateInitialLoanDetails()
  }
})


const customerForm = reactive({
  first_name: '', last_name: '', phone: '', id_card: '', age: 18, province_id: '', district_id: '', address: '', occupation: '', monthly_income: 0, other_debts: 0
})

const customerErrors = reactive({
  first_name: '', phone: '', id_card: '', province_id: '', district_id: '', age: '', address: '', occupation: '', monthly_income: ''
})

// 🟢 ປັບໂຄງສ້າງຂໍ້ມູນ Array ເປັນແບບໃໝ່ (ຮອງຮັບ Multi-file)
const requiredDocuments = ref<DocumentCategory[]>([
  { id: 'id_card', name: 'ບັດປະຈຳຕົວ', description: 'ຮູບຖ່າຍບັດປະຈຳຕົວທັງໜ້າ-ຫຼັງ', required: true, files: [] },
  { id: 'house_reg', name: 'ປື້ມສຳມະໂນຄົວ', description: 'ໃບຄອບຄົວຫຼືເອກະສານຢືນຢັນທີ່ຢູ່', required: true, files: [] }
])

const optionalDocuments = ref<DocumentCategory[]>([
  { id: 'salary_slip', name: 'ຫຼັກຖານລາຍຮັບ', description: 'ໃບເງິນເດືອນ ຫຼື ໃບຮັບລາຍຮັບ', required: false, files: [] },
  { id: 'other', name: 'ເອກະສານອື່ນໆ', description: 'ເອກະສານອື່ນໆທີ່ກ່ຽວຂ້ອງ', required: false, files: [] }
])

// 🟢 ລວມ Array ເພື່ອໃຫ້ໃຊ້ງານງ່າຍໃນ Template
const allDocumentCategories = computed(() => [...requiredDocuments.value, ...optionalDocuments.value]);

const showSuccessModal = ref(false)

const filteredShops = computed(() => {
  let shopsArray = shopStore.shops
  if (shopsArray && typeof shopsArray === 'object' && !Array.isArray(shopsArray)) {
    shopsArray = Object.values(shopsArray)
  }
  if (!shopSearch.value) return Array.isArray(shopsArray) ? shopsArray : []

  const query = shopSearch.value.toLowerCase()
  return Array.isArray(shopsArray)
    ? shopsArray.filter(shop => shop.shop_name?.toLowerCase().includes(query) || shop.shop_owner?.toLowerCase().includes(query))
    : []
})

const filteredProducts = computed(() => {
  if (!selectedShop.value) return []
  let productsArray = productStore.products
  if (productsArray && typeof productsArray === 'object' && !Array.isArray(productsArray)) {
    productsArray = Object.values(productsArray)
  }
  if (!productSearch.value) return Array.isArray(productsArray) ? productsArray : []

  const query = productSearch.value.toLowerCase()
  return Array.isArray(productsArray)
    ? productsArray.filter(product => product.product_name?.toLowerCase().includes(query) || product.type_name?.toLowerCase().includes(query) || product.id?.toString().includes(query))
    : []
})

// 🟢 ກວດສອບວ່າມີຮູບໃນໝວດໝູ່ທີ່ບັງຄັບແລ້ວ ຫຼື ຍັງ
const allRequiredDocumentsUploaded = computed(() => {
  return requiredDocuments.value.every(cat => cat.files.length > 0)
})

const switchTab = (tab: 'application' | 'documents') => {
  if (tab === 'documents' && !canAccessDocuments.value) return
  activeTab.value = tab
}

const switchToDocumentsTab = async () => {
  activeTab.value = 'documents'
  showSuccessModal.value = false

  if (existingCustomerId.value) {
    try {
      await loanApplicationStore.fetchDocuments(existingCustomerId.value);
      const currentDocs = loanApplicationStore.currentDocuments || [];

      // ເຄລຍຂໍ້ມູນເກົ່າກ່ອນ
      requiredDocuments.value.forEach(c => c.files = []);
      optionalDocuments.value.forEach(c => c.files = []);

      // ຈັດລຽງໄຟລ໌ລົງໃນໝວດໝູ່
      currentDocs.forEach(serverDoc => {
        const docType = serverDoc.document_type || serverDoc.doc_type;
        const targetCat = allDocumentCategories.value.find(d => d.id === docType);
        
        if (targetCat && serverDoc.file_url) {
          targetCat.files.push({
            id: serverDoc.id,
            file: null, // ໄຟລ໌ຈາກ Server
            preview: getFullImageUrl(serverDoc.file_url) || '',
            isPdf: serverDoc.file_url?.toLowerCase().endsWith('.pdf') || false,
            name: serverDoc.original_filename || serverDoc.file_name || 'Document'
          });
        }
      });
    } catch (e) {
      console.warn("ບໍ່ສາມາດດຶງເອກະສານເກົ່າໄດ້", e);
    }
  }
}

const useExistingDocuments = async () => {
  // 🟢 ກໍລະນີທີ່ລູກຄ້າເລືອກໃຊ້ເອກະສານເດີມ
  // ຄວນມີ API ບອກຫຼັງບ້ານໃຫ້ Copy ເອກະສານຈາກ Customer ID ມາໃສ່ Loan ID ໃໝ່
  // ຖ້າຫຼັງບ້ານທ່ານອອກແບບໃຫ້ດຶງຈາກ Customer ຢູ່ແລ້ວ ກໍສາມາດຂ້າມໄປໄດ້ເລີຍ
  showSuccessModal.value = false;
  alert.success('ສຳເລັດ', 'ບັນທຶກຮ່າງຄຳຂໍ ແລະ ນຳໃຊ້ເອກະສານເດີມຮຽບຮ້ອຍແລ້ວ');
  router.push({ name: 'ListDraftLoans' });
}

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
    
    try {
      await productStore.fetchProducts({ 
        shop_id: selectedShop.value.id,
        search: productSearch.value,
        limit: 50
      });
      showProductDropdown.value = true;
    } catch (error) {
      console.error('Failed to search products:', error);
    }
  }, 500)
}

watch(() => customerForm.province_id, async (newVal) => {
  customerForm.district_id = '';
  if (newVal) {
    await addressStore.fetchDistricts(newVal);
  } else {
    addressStore.districts = [];
  }
});

const selectShop = async (shop: shopType) => {
  selectedShop.value = shop
  shopSearch.value = shop.shop_name
  showShopDropdown.value = false

  selectedProduct.value = null
  productSearch.value = ''
  selectedProductType.value = ''

  selectedVariant.value = null
  productVariants.value = []
  loanErrors.variant = ''

  loanDetails.totalAmount = 0
  loanDetails.downPayment = 0
  loanDetails.interestRate = 0
  loanDetails.termMonths = 0
  loanDetails.monthlyPayment = 0

  try {
    await productStore.fetchProducts({ 
      shop_id: shop.id,
      limit: 50 
    })
  } catch (error) {
    console.error('❌ Failed to load products:', error)
  }
}

const clearShopSelection = () => {
  selectedShop.value = null
  shopSearch.value = ''
  selectedProduct.value = null
  productSearch.value = ''
  selectedVariant.value = null
  productVariants.value = []
  loanErrors.variant = ''
}

const selectVariant = (variant: any) => {
  selectedVariant.value = variant
  loanErrors.variant = ''
  calculateInitialLoanDetails(variant.price) 
}

const selectProduct = async (product: Product) => {
  selectedProduct.value = product
  productSearch.value = product.product_name
  showProductDropdown.value = false

  selectedVariant.value = null
  productVariants.value = []
  loanErrors.variant = ''

  isLoadingVariants.value = true
  try {
    const variants = await productStore.fetchVariantsByProductId(product.id)
    productVariants.value = variants || []
    
    if (productVariants.value.length === 0) {
      calculateInitialLoanDetails(Number(product.price))
    } else {
      loanDetails.totalAmount = 0
      loanDetails.monthlyPayment = 0
    }
  } catch (error) {
    console.error('Failed to load variants:', error)
    calculateInitialLoanDetails(Number(product.price)) 
  } finally {
    isLoadingVariants.value = false
  }

  const productTypeId = product.productType_id
  if (productTypeId) {
    try {
      await productTypeStore.fetchProductTypeById(productTypeId)
      if (productTypeStore.productType) {
        selectedProductType.value = productTypeStore.productType.type_name
      }
    } catch (error) {
      selectedProductType.value = product.type_name || 'ບໍ່ລະບຸ'
    }
  } else {
    selectedProductType.value = product.type_name || 'ບໍ່ລະບຸ'
  }
}

const productTypeDisplay = computed(() => {
  if (productTypeStore.isLoading) return 'ກຳລັງໂຫຼດ...'
  if (selectedProductType.value) return selectedProductType.value
  if (selectedProduct.value?.type_name) return selectedProduct.value.type_name
  return 'ບໍ່ລະບຸປະເພດ'
})

const clearProductSelection = () => {
  selectedProduct.value = null
  productSearch.value = ''
  selectedProductType.value = ''
  selectedVariant.value = null
  productVariants.value = []
  loanErrors.variant = ''
}

const handleShopBlur = () => {
  setTimeout(() => { showShopDropdown.value = false }, 200)
}

const handleProductBlur = () => {
  setTimeout(() => { showProductDropdown.value = false }, 200)
}

const validateCustomerForm = (): boolean => {
  Object.keys(customerErrors).forEach(key => {
    customerErrors[key as keyof typeof customerErrors] = ''
  })

  let isValid = true

  if (!customerForm.first_name.trim()) { customerErrors.first_name = 'ກະລຸນາປ້ອນຊື່ແທ້'; isValid = false }
  
  const phoneRegex = /^[\d\-\+\(\)\s]{8,15}$/
  if (!customerForm.phone.trim()) { customerErrors.phone = 'ກະລຸນາປ້ອນເບີໂທລະສັບ'; isValid = false }
  else if (!phoneRegex.test(customerForm.phone)) { customerErrors.phone = 'ເບີໂທລະສັບບໍ່ຖືກຕ້ອງ'; isValid = false }
  
  if (!customerForm.id_card.trim()) { customerErrors.id_card = 'ກະລຸນາປ້ອນເລກບັດປະຈຳຕົວ'; isValid = false }
  if (customerForm.age < 18 || customerForm.age > 100) { customerErrors.age = 'ອາຍຸຕ້ອງຢູ່ລະຫວ່າງ 18-100 ປີ'; isValid = false }
  
  if (!customerForm.province_id) { customerErrors.province_id = 'ກະລຸນາເລືອກແຂວງ'; isValid = false }
  if (!customerForm.district_id) { customerErrors.district_id = 'ກະລຸນາເລືອກເມືອງ'; isValid = false }
  
  if (!customerForm.address.trim()) { customerErrors.address = 'ກະລຸນາປ້ອນທີ່ຢູ່'; isValid = false }
  if (!customerForm.occupation.trim()) { customerErrors.occupation = 'ກະລຸນາປ້ອນອາຊີບ (ຂໍ້ມູນສຳຄັນສຳລັບການພິຈາລະນາສິນເຊື່ອ)'; isValid = false }
  if (customerForm.monthly_income <= 0) { customerErrors.monthly_income = 'ລາຍຮັບຕ້ອງຫຼາຍກວ່າ 0'; isValid = false }

  return isValid
}

const handleDirectSubmit = async () => {
  if (!selectedShop.value || !selectedProduct.value || !validateCustomerForm() || !validateLoanDetails()) return

  isSubmitting.value = true
  try {

    // =========================================================
    // 🟢 เพิ่มโค้ดดักจับตรงนี้: ถ้าพนักงานไม่ได้กดค้นหา แต่กรอกเบอร์ลงไปเลย
    // ให้ระบบแอบเอาเบอร์ไปเช็คหลังบ้านก่อนว่ามีลูกค้าคนนี้อยู่แล้วหรือไม่
    // =========================================================
    if (!existingCustomerId.value && customerForm.phone) {
      try {
        const checkCustomer = await loanApplicationStore.fetchCustomerByPhone(customerForm.phone.trim());
        if (checkCustomer && checkCustomer.id) {
          // ถ้ามีเบอร์นี้ในระบบแล้ว ให้ผูก ID ให้เลย Backend จะได้ไม่ Error เบอร์ซ้ำ
          existingCustomerId.value = checkCustomer.id;
        }
      } catch (err) {
        // ถ้าไม่เจอ หรือ error ก็ปล่อยผ่านให้เป็นลูกค้าใหม่ตามปกติ
        console.log("No existing customer found, proceeding as new customer.");
      }
    }
    // =========================================================
    const result = await submitLoanApplication();
    const resData = result as any;
    console.log('✅ Loan application submitted successfully:', resData);

    // if (resData.existing_customer_id) {
    //     existingCustomerId.value = resData.existing_customer_id;
    // } else if (resData.customer?.id) {
    //     existingCustomerId.value = resData.customer.id;
    // } else if (result.application?.customer_id) {
    //     existingCustomerId.value = result.application.customer_id;
    // } else if (resData.data?.customer_id) {
    //     existingCustomerId.value = resData.data.customer_id;
    // }

    showSuccessModal.value = true
    canAccessDocuments.value = true
  } catch (error: any) {
    console.error('❌ Failed to submit loan application:', error)
    // 🌟 ແກ້ໄຂບ່ອນນີ້: ດຶງຂໍ້ຄວາມ Error ຈາກຫຼັງບ້ານມາສະແດງ
    const backendMessage = error.response?.data?.message || error.message || 'ກະລຸນາລອງໃໝ່ອີກຄັ້ງ';
    alert.error('ເກີດຂໍ້ຜິດພາດການສົ່ງຄຳຂໍ', backendMessage);
  } finally {
    isSubmitting.value = false
  }
}

const submitLoanApplication = async () => {
  try {
    if (!validateLoanDetails()) throw new Error('ກະລຸນາກວດສອບຂໍ້ມູນສິນເຊື່ອ')
    if (!selectedShop.value || !selectedProduct.value) throw new Error('ກະລຸນາເລືອກຮ້ານ ແລະ ສິນຄ້າ')

    const data: CreateWithCustomerDto = {
      phone: customerForm.phone.trim(),
      otp: '',
      identity_number: customerForm.id_card.trim(),
      first_name: customerForm.first_name.trim(), 
      last_name: customerForm.last_name.trim(),   

      province_id: customerForm.province_id,
      district_id: customerForm.district_id,

      address: customerForm.address.trim(),
      occupation: customerForm.occupation?.trim() || 'ບໍ່ລະບຸ',
      income_per_month: customerForm.monthly_income,

      product_id: selectedProduct.value.id,
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

    const result = await loanApplicationStore.createWithCustomer(data)
    return result
  } catch (error: any) {
    throw error
  }
}

// 🟢 ຟັງຊັນອັບໂຫຼດຮອງຮັບຫຼາຍໄຟລ໌
const handleDocumentUpload = async (typeId: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files || files.length === 0) return;

  const category = allDocumentCategories.value.find(c => c.id === typeId);
  if (!category) return;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // 🟢 ເພີ່ມບັນທັດນີ້: ເພື່ອກວດສອບວ່າ file ບໍ່ແມ່ນ undefined ກ່ອນເອົາໄປໃຊ້ງານ
    if (!file) continue;
    
    if (file.size > 5 * 1024 * 1024) {
      alert.error(`ໄຟລ໌ ${file.name} ໃຫຍ່ເກີນໄປ (ສູງສຸດ 5MB)`);
      continue;
    }

    const isPdf = file.type === 'application/pdf';
    const reader = new FileReader();
    
    reader.onload = (e) => {
      category.files.push({
        file: file,
        preview: (e.target?.result as string) || '',
        isPdf: isPdf,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  }
  target.value = ''; // ຣີເຊັດ input
}

// 🟢 ຟັງຊັນລຶບໄຟລ໌ສະເພາະຕົວ
const removeDocument = (typeId: string, fileIndex: number) => {
  const category = allDocumentCategories.value.find(c => c.id === typeId);
  if (category && category.files[fileIndex]) {
    category.files.splice(fileIndex, 1);
  }
}

// ເປີດໄຟລ໌ໃນແຖບໃໝ່
const openInNewTab = (url: string | null | undefined) => {
  if (url) window.open(url, '_blank');
};

const submitDocuments = async () => {
  if (!allRequiredDocumentsUploaded.value) {
    alert.error('ກະລຸນາອັບໂຫຼດເອກະສານທີ່ຕ້ອງການທັງໝົດ')
    return
  }
  
  const currentLoan = loanApplicationStore.currentLoanApplication
  if (!currentLoan || !currentLoan.id) {
    alert.error('ບໍ່ພົບຂໍ້ມູນຄຳຂໍສິນເຊື່ອ', 'ກະລຸນາສ້າງຄຳຂໍໃໝ່.')
    return
  }

  isSubmitting.value = true
  try {
    const filesToUpload: File[] = [];
    const docTypesArray: string[] = [];
    const existingDocIds: number[] = []; // 🟢 ເພີ່ມ Array ເກັບ ID ຂອງເອກະສານເກົ່າ

    for (const cat of allDocumentCategories.value) {
      for (const f of cat.files) {
        if (f.file) {
          // 🟢 ໄຟລ໌ໃໝ່
          const fileObj = f.file instanceof File ? f.file : new File([f.file as Blob], f.name || 'document.pdf', { type: f.file?.type });
          filesToUpload.push(fileObj);
          docTypesArray.push(cat.id);
        } else if (f.id) {
          // 🟢 ໄຟລ໌ເກົ່າທີ່ດຶງມາຈາກລະບົບ
          existingDocIds.push(f.id);
        }
      }
    }

    // 🟢 ຍິງ API ອັບໂຫຼດສະເພາະເມື່ອມີ "ໄຟລ໌ໃໝ່"
    if (filesToUpload.length > 0) {
      await loanApplicationStore.uploadMultipleDocuments(
        currentLoan.customer_id, 
        currentLoan.id, 
        filesToUpload,
        docTypesArray
      );
    }

    // 🟢 (ທາງເລືອກ) ຖ້າຫຼັງບ້ານຕ້ອງການໃຫ້ສົ່ງ existingDocIds ໄປຜູກກັບ Loan ID ໃໝ່
    // ຖ້າບໍ່ຈຳເປັນ, ລະບົບຈະຖືວ່າສຳເລັດເລີຍ
    
    alert.success('ບັນທຶກເອກະສານສຳເລັດ!')
    
    // 🟢 ແກ້ໄຂການ Fetch ເອກະສານຫຼັງຈາກບັນທຶກ: ໃຊ້ ID ໃຫ້ຖືກຕ້ອງ
    // ຖ້າເອກະສານຜູກກັບລູກຄ້າ ໃຫ້ໃຊ້ currentLoan.customer_id
    await loanApplicationStore.fetchDocuments(currentLoan.customer_id) 
    
    await loanApplicationStore.fetchLoanApplicationById(currentLoan.id)
    router.push({ name: 'ListDraftLoans' })
    
  } catch (error: any) {
    console.error('Error submitting documents:', error)
    // 🌟 ແກ້ໄຂບ່ອນນີ້: ດຶງຂໍ້ຄວາມ Error ຈາກຫຼັງບ້ານມາສະແດງ
    const backendMessage = error.response?.data?.message || error.message || 'ກະລຸນາກວດສອບ Backend ຂອງທ່ານ';
    alert.error('ເກີດຂໍ້ຜິດພາດການບັນທຶກເອກະສານ', backendMessage);
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  // 🟢 ล้างข้อมูลฟอร์มและ ID ให้สะอาดหมดจดทุกครั้งที่เข้ามาหน้านี้ใหม่
  existingCustomerId.value = undefined;
  foundCustomer.value = null;
  customerSearchPhone.value = '';
  customerSearchMessage.value = '';
  
  customerForm.first_name = '';
  customerForm.last_name = '';
  customerForm.phone = '';
  customerForm.id_card = '';
  customerForm.address = '';
  customerForm.province_id = '';
  customerForm.district_id = '';
  customerForm.occupation = '';
  customerForm.monthly_income = 0;
  customerForm.other_debts = 0;
  customerForm.age = 18;

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