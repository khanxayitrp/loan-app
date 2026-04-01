<template>
  <div class="p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ຈັດການສິນຄ້າ</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">ຈັດການຂໍ້ມູນສິນຄ້າທັງໝົດ</p>
      </div>

      <div class="flex gap-3 w-full sm:w-auto relative">
        <input v-model="searchQuery" type="text" placeholder="ຄົ້ນຫາຊື່ສິນຄ້າ..."
          class="input input-bordered w-full max-w-xs pr-10" @input="debounceSearch" />

        <button v-if="searchQuery" @click="clearSearch"
          class="btn btn-circle btn-ghost btn-sm absolute right-[310px] sm:right-[380px] top-1/2 transform -translate-y-1/2"
          aria-label="ລ້າງການຄົ້ນຫາ">
          <span class="icon-[tabler--x] size-4"></span>
        </button>

        <a href="/templates/product_import_template_v1.xlsx" download="product_import_template.xlsx" target="_blank"
          class="btn btn-outline btn-info whitespace-nowrap">
          <span class="icon-[tabler--file-download] size-5 mr-1"></span>
          ໂຫຼດ Template
        </a>

        <button @click="triggerExcelUpload" class="btn btn-outline btn-success whitespace-nowrap"
          :disabled="isImporting">
          <span v-if="isImporting" class="loading loading-spinner size-4 mr-1"></span>
          <span v-else class="icon-[tabler--file-spreadsheet] size-5 mr-1"></span>
          ນຳເຂົ້າຈາກ Excel
        </button>

        <button @click="openAddProductModal" class="btn btn-gradient btn-primary whitespace-nowrap">
          <span class="icon-[tabler--shopping-bag-plus] size-5 mr-1"></span>
          ເພີ່ມສິນຄ້າໃໝ່
        </button>

        <input ref="excelInput" type="file" accept=".xlsx, .xls, .csv" class="hidden" @change="handleExcelUpload" />
      </div>
    </div>

    <div class="flex flex-wrap gap-3 mb-6">
      <select v-model="statusFilter" class="select select-bordered w-full sm:w-auto" @change="applyFilters">
        <option value="">ທັງໝົດສະຖານະ</option>
        <option value="1">Active</option>
        <option value="0">Inactive</option>
      </select>

      <select v-model="typeFilter" class="select select-bordered w-full sm:w-auto" @change="applyFilters">
        <option value="">ທັງໝົດປະເພດ</option>
        <option v-for="type in productTypes" :key="type.id" :value="type.id.toString()">
          {{ type.type_name }}
        </option>
      </select>

      <select v-model.number="localPageSize" class="select select-bordered w-full sm:w-auto" @change="changePageSize">
        <option :value="10">10 ຕໍ່ໜ້າ</option>
        <option :value="25">25 ຕໍ່ໜ້າ</option>
        <option :value="50">50 ຕໍ່ໜ້າ</option>
      </select>
    </div>

    <div v-if="selectedRows.length > 0" class="flex gap-2 mb-4 text-sm bg-base-200 p-2 rounded-lg items-center">
      <span class="text-gray-600 font-medium ml-2 mr-4">
        ເລືອກ {{ selectedRows.length }} ລາຍການ:
      </span>
      <button v-if="hasInactiveSelected" class="btn btn-sm btn-success" @click="confirmBulkToggle(true)">
        <span class="icon-[tabler--check] size-4"></span> ເປີດໃຊ້ງານທີ່ເລືອກ
      </button>
      <button v-if="hasActiveSelected" class="btn btn-sm btn-error" @click="confirmBulkToggle(false)">
        <span class="icon-[tabler--x] size-4"></span> ປິດໃຊ້ງານທີ່ເລືອກ
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-8">
      <div class="loading loading-spinner"></div>
    </div>

    <div v-else class="w-full overflow-x-auto rounded-lg border border-base-content/10">
      <table class="table table-zebra w-full min-w-max">
        <thead>
          <tr>
            <th class="w-10">
              <input type="checkbox" class="checkbox" :checked="allRowsSelected" :indeterminate.prop="someRowsSelected"
                @change="toggleAllRows" />
            </th>
            <th>ຮູບພາບ</th>
            <th>ຊື່ສິນຄ້າ</th>
            <th>ປະເພດສິນຄ້າ</th>
            <th>ລາຄາ</th>
            <th>ສະຕັອກ</th>
            <th>ສະຖານະ</th>
            <th class="w-32">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in displayedProducts" :key="product.id">
            <td class="w-10">
              <input type="checkbox" class="checkbox" :checked="selectedRows.includes(product.id)"
                @change="toggleRow(product.id)" />
            </td>
            <td class="text-center">
              <div v-if="product.image_url"
                class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                <img :src="getFullImageUrl(product.image_url)" alt="Product image" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <span class="icon-[tabler--box] size-6 text-gray-400"></span>
              </div>
            </td>
            <td class="font-medium">
              <div>{{ product.product_name }}</div>
              <div class="text-xs text-gray-500 font-normal">{{ product.merchant_sku || product.system_sku }}</div>
            </td>
            <td>
              <span class="badge badge-soft badge-primary text-xs">
                {{ getProductTypeName(product.productType_id) }}
              </span>
            </td>
            <td class="font-medium text-success">{{ formatPrice(product.price) }}</td>
            <td>{{ product.stock_quantity || 0 }}</td>
            <td>
              <span class="badge badge-soft" :class="product.is_active ? 'badge-success' : 'badge-error'">
                {{ product.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>
              <div class="flex gap-2">
                <button class="btn btn-circle btn-text btn-sm" @click="openEditProductModal(product as any)"
                  aria-label="Edit product">
                  <span class="icon-[tabler--edit] size-4"></span>
                </button>
                <button class="btn btn-circle btn-text btn-sm"
                  :class="product.is_active ? 'text-error' : 'text-success'"
                  @click="toggleProductStatus(product as any)" aria-label="Toggle status">
                  <span :class="product.is_active ? 'icon-[tabler--toggle-left]' : 'icon-[tabler--toggle-right]'"
                    class="size-4"></span>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="displayedProducts.length === 0">
            <td colspan="8" class="text-center py-8 text-base-content/60">ບໍ່ພົບຂໍ້ມູນສິນຄ້າ</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!isLoading" class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm">
      <div>ສະແດງ {{ startIndex }} - {{ endIndex }} ຈາກ {{ totalProducts }} ລາຍການ</div>
      <div class="flex items-center gap-2">
        <button class="btn btn-sm" :disabled="!hasPreviousPage" @click="previousPage">ກ່ອນໜ້າ</button>
        <span class="px-2">ໜ້າ {{ currentPage }} / {{ totalPages }}</span>
        <button class="btn btn-sm" :disabled="!hasNextPage" @click="nextPage">ຖັດໄປ</button>
      </div>
    </div>

    <teleport to="body">
      <div v-if="showStatusModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
          <h3 class="font-bold text-lg mb-4">{{ productToToggle?.is_active ? 'ປິດການໃຊ້ງານ' : 'ເປີດການໃຊ້ງານ' }}</h3>
          <p class="py-4 text-gray-700 dark:text-gray-300">
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການ {{ productToToggle?.is_active ? 'ປິດ' : 'ເປີດ' }} ການຂາຍ "{{
              productToToggle?.product_name }}" ?
          </p>
          <div class="flex justify-end gap-3 mt-6">
            <button class="btn btn-soft btn-secondary" @click="showStatusModal = false">ຍົກເລີກ</button>
            <button class="btn" :class="productToToggle?.is_active ? 'btn-error' : 'btn-success'"
              @click="confirmToggleStatus">
              {{ productToToggle?.is_active ? 'ປິດການຂາຍ' : 'ເປີດການຂາຍ' }}
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
        <div
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl mx-auto my-auto relative flex flex-col max-h-[90vh]">

          <div class="flex justify-between items-center p-6 border-b border-base-200 shrink-0">
            <h3 class="text-xl font-bold text-gray-800 dark:text-white">
              {{ editingProduct ? 'ແກ້ໄຂສິນຄ້າ' : 'ເພີ່ມສິນຄ້າໃໝ່' }}
            </h3>
            <button @click="closeModal" class="btn btn-circle btn-ghost btn-sm">
              <span class="icon-[tabler--x] size-5"></span>
            </button>
          </div>

          <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">
            <form id="productForm" @submit.prevent="saveProduct" class="space-y-8">

              <div class="form-control">
                <label class="label"><span class="label-text font-bold text-base">ຮູບພາບຫຼັກ *</span></label>
                <div class="flex flex-col sm:flex-row gap-6">
                  <div
                    class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-2 w-full sm:w-48 h-48 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                    @click="triggerFileInput">
                    <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden"
                      @change="handleFileUpload" />
                    <div v-if="!form.image_url" class="text-center">
                      <span class="icon-[tabler--photo-plus] size-10 text-gray-400 mb-2"></span>
                      <p class="text-sm text-gray-500 font-medium">ອັບໂຫຼດຮູບພາບ</p>
                      <p class="text-xs text-gray-400 mt-1">JPG, PNG < 2MB</p>
                    </div>
                    <img v-else :src="getProductImageUrl(form.image_url)"
                      class="w-full h-full object-cover rounded-lg shadow-sm" />
                  </div>
                  <div class="flex-1 flex flex-col justify-center">
                    <div v-if="imageFileInfo.name" class="bg-base-200 p-4 rounded-xl">
                      <p class="text-sm font-bold mb-1">ໄຟລ໌ທີ່ເລືອກ:</p>
                      <p class="text-sm text-gray-600 truncate">{{ imageFileInfo.name }}</p>
                      <p class="text-xs text-gray-500 mt-1">{{ formatFileSize(imageFileInfo.size) }}</p>
                      <button type="button" class="btn btn-xs btn-error btn-outline mt-3"
                        @click.stop="removeImage">ລຶບຮູບພາບ</button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="divider">ຂໍ້ມູນທົ່ວໄປ</div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="form-control">
                  <label class="label"><span class="label-text font-medium">ຊື່ສິນຄ້າ *</span></label>
                  <input v-model="form.product_name" type="text" placeholder="ປ້ອນຊື່ສິນຄ້າ"
                    class="input input-bordered w-full" :class="{ 'input-error': errors.product_name }" required />
                  <label v-if="errors.product_name" class="label text-error"><span class="label-text-alt">{{
                      errors.product_name }}</span></label>
                </div>
                <!-- <div class="form-control">
                  <label class="label"><span class="label-text font-medium">ປະເພດສິນຄ້າ *</span></label>
                  <select v-model="form.productType_id" class="select select-bordered w-full" :class="{ 'select-error': errors.productType_id }" required>
                    <option value="0" disabled>ເລືອກປະເພດສິນຄ້າ</option>
                    <option v-for="type in productTypes" :key="type.id" :value="type.id">{{ type.type_name }}</option>
                  </select>
                </div> -->
                <!-- <div class="grid grid-cols-1 md:grid-cols-2 gap-6"> -->
                <div class="form-control">
                  <label class="label"><span class="label-text font-medium">ປະເພດສິນຄ້າຂອງຮ້ານ *</span></label>
                  <select v-model="form.productType_id" class="select select-bordered w-full" required>
                    <option value="0" disabled>ເລືອກປະເພດສິນຄ້າ</option>
                    <option v-for="type in productTypes" :key="type.id" :value="type.id">{{ type.type_name }}</option>
                  </select>
                </div>

                <div class="form-control border-l-4 border-info pl-3 bg-info/5 rounded-r-lg">
                  <label class="label">
                    <span class="label-text font-bold text-info">ໝວດໝູ່ເທິງແອັບກາງ (Global Category) *</span>
                  </label>
                  <select v-model="form.global_category_id"
                    class="select select-bordered w-full border-info focus:ring-info" required>
                    <option :value="null" disabled>-- ເລືອກໝວດໝູ່ເທິງແອັບ --</option>
                    <option v-for="gCat in globalCategories" :key="gCat.id" :value="gCat.id">
                      {{ gCat.category_name }}
                    </option>
                  </select>
                  <label class="label"><span
                      class="label-text-alt text-gray-500">ໃຊ້ສຳລັບສະແດງສິນຄ້າໃນໜ້າແອັບຫຼັກ</span></label>
                </div>
                <!-- </div> -->
                <div class="form-control">
                  <label class="label"><span class="label-text font-medium">ຍີ່ຫໍ້ (Brand)</span></label>
                  <input v-model="form.product_brand" type="text" placeholder="ເຊັ່ນ: Apple, Samsung"
                    class="input input-bordered w-full" />
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text font-medium">ລຸ້ນ (Model)</span></label>
                  <input v-model="form.product_model" type="text" placeholder="ເຊັ່ນ: iPhone 15 Pro"
                    class="input input-bordered w-full" />
                </div>
              </div>

              <div class="form-control">
                <label class="label"><span class="label-text font-medium">ລາຍລະອຽດສິນຄ້າ</span></label>
                <textarea v-model="form.description" class="textarea textarea-bordered h-24"
                  placeholder="ອະທິບາຍຄຸນສົມບັດຂອງສິນຄ້າ..."></textarea>
              </div>

              <div class="divider">ລາຄາ ແລະ ການຂາຍ</div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 bg-base-200/50 p-4 rounded-xl border border-base-200">
                <div class="form-control">
                  <label class="label"><span class="label-text font-medium">ລາຄາຂາຍ (ກີບ) *</span></label>
                  <input v-model.number="form.price" type="number" class="input input-bordered w-full" min="0"
                    :disabled="form.has_variants" />
                  <label v-if="form.has_variants" class="label"><span
                      class="label-text-alt text-info">ລາຄາຈະຖືກອ້າງອີງຈາກຕາຕະລາງລຸ່ມນີ້</span></label>
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text font-medium">ຈຳນວນສະຕັອກ *</span></label>
                  <input v-model.number="form.stock_quantity" type="number" class="input input-bordered w-full" min="0"
                    :disabled="form.has_variants" />
                  <label v-if="form.has_variants" class="label"><span
                      class="label-text-alt text-info">ສະຕັອກຈະຖືກລວມຈາກຕາຕະລາງອັດຕະໂນມັດ</span></label>
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text font-medium">SKU ຮ້ານຄ້າ (ຫຼັກ)</span></label>
                  <input v-model="form.merchant_sku" type="text" class="input input-bordered w-full"
                    placeholder="ເຊັ່ນ: P-001" />
                </div>
                <div class="form-control md:col-span-3">
                  <label class="label"><span class="label-text font-medium">ປະເພດການຜ່ອນຊຳລະ</span></label>
                  <select v-model="form.allowed_loan_type" class="select select-bordered w-full max-w-xs">
                    <option value="both">ອະນຸຍາດທັງໝົດ (Both)</option>
                    <option value="single_item">ຜ່ອນສິນຄ້າດ່ຽວ (Single Item ເທົ່ານັ້ນ)</option>
                    <option value="bnpl_cart">ຜ່ອນແບບລວມກະຕ່າ (BNPL Cart ເທົ່ານັ້ນ)</option>
                  </select>
                </div>
              </div>

              <div class="form-control border-2 border-primary/20 rounded-2xl p-5 bg-primary/5">
                <label class="label cursor-pointer justify-start gap-4 mb-2">
                  <input type="checkbox" v-model="form.has_variants" class="toggle toggle-primary toggle-lg"
                    @change="generateVariantMatrix" />
                  <div>
                    <span class="label-text font-bold text-lg text-primary">ສິນຄ້າມີຫຼາຍຕົວເລືອກ (ມີສີ, ມີໄຊສ໌)</span>
                    <p class="text-xs text-gray-500 mt-1">ເປີດໃຊ້ງານຖ້າສິນຄ້າຂອງທ່ານມີຫຼາຍສີ ຫຼື ຫຼາຍຂະໜາດທີ່ລາຄາຕ່າງກັນ
                    </p>
                  </div>
                </label>

                <div v-if="form.has_variants" class="mt-4 space-y-5 animate-fade-in">

                  <div v-for="(opt, optIndex) in variantOptions" :key="opt.id"
                    class="p-4 border border-dashed border-primary/30 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                    <div class="flex justify-between items-center mb-3">
                      <input v-model="opt.name" type="text"
                        class="input input-sm input-bordered font-bold w-48 text-primary" placeholder="ເຊັ່ນ: ສີ, ຂະໜາດ"
                        @input="generateVariantMatrix" />
                      <button type="button" @click="removeVariantOption(optIndex)"
                        class="btn btn-ghost btn-sm text-error">
                        <span class="icon-[tabler--trash] size-4"></span> ລຶບຫົວຂໍ້
                      </button>
                    </div>

                    <div class="flex flex-wrap gap-3">
                      <div v-for="(val, valIndex) in opt.values" :key="valIndex" class="flex items-center gap-1">
                        <input v-model="opt.values[valIndex]" type="text"
                          class="input input-sm input-bordered w-32 focus:border-primary" placeholder="ເຊັ່ນ: ສີແດງ, XL"
                          @input="generateVariantMatrix" />
                        <button type="button" @click="removeVariantValue(optIndex, valIndex)"
                          class="btn btn-circle btn-ghost btn-xs text-gray-400 hover:text-error">
                          <span class="icon-[tabler--x] size-4"></span>
                        </button>
                      </div>
                      <button type="button" @click="addVariantValue(optIndex)"
                        class="btn btn-sm btn-outline btn-primary border-dashed">
                        + ເພີ່ມຕົວເລືອກ
                      </button>
                    </div>
                  </div>

                  <button v-if="variantOptions.length < 2" type="button" @click="addVariantOption"
                    class="btn btn-sm btn-block btn-outline btn-primary border-dashed">
                    <span class="icon-[tabler--plus] size-4"></span> ເພີ່ມຫົວຂໍ້ຕົວເລືອກທີ 2
                  </button>

                  <div v-if="form.variants.length > 0"
                    class="overflow-x-auto mt-6 border border-base-300 rounded-xl shadow-inner bg-white dark:bg-base-100">
                    <table class="table table-zebra w-full">
                      <thead class="bg-base-200/60 text-gray-700">
                        <tr>
                          <th v-if="variantOptions.some(o => o.name.includes('ສີ') || o.name.includes('Color'))">ສີ
                            (Color)</th>
                          <th v-if="variantOptions.some(o => o.name.includes('ຂະໜາດ') || o.name.includes('Size'))">ຂະໜາດ
                            (Size)</th>
                          <th class="text-center w-32">ຮູບພາບ</th>
                          <th>ລາຄາ (ກີບ) *</th>
                          <th>ສະຕັອກ *</th>
                          <th>SKU ຍ່ອຍ</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(v, index) in form.variants" :key="index" class="hover:bg-base-200/30">
                          <td v-if="v.color" class="font-bold text-primary">{{ v.color }}</td>
                          <td v-if="v.size_or_capacity" class="font-bold text-secondary">{{ v.size_or_capacity }}</td>

                          <td class="align-middle">
                            <div class="flex flex-col gap-2 items-center justify-center">
                              <div
                                class="w-12 h-12 bg-base-200 rounded-lg border flex items-center justify-center cursor-pointer overflow-hidden hover:border-primary shrink-0 shadow-sm"
                                @click="triggerVariantImage(index)" title="ຄລິກເພື່ອອັບໂຫຼດຮູບພາບ">
                                <img v-if="v.image_url" :src="getProductImageUrl(v.image_url)"
                                  class="w-full h-full object-cover" @error="handleImageError" />
                                <span v-else class="icon-[tabler--photo-plus] text-gray-400 size-5"></span>
                              </div>
                              <input type="file" :id="`variant-img-${index}`" class="hidden"
                                accept="image/jpeg,image/png,image/webp"
                                @change="handleVariantImageUpload($event, index)" />
                              <input v-model="v.image_url" type="text"
                                class="input input-xs input-bordered w-full text-center text-[10px]"
                                placeholder="ວາງ Link..." title="ວາງ Link ຮູບພາບຈາກເວັບ" />
                            </div>
                          </td>

                          <td><input v-model.number="v.price" type="number" class="input input-sm input-bordered w-28"
                              min="0" required /></td>
                          <td><input v-model.number="v.stock_quantity" type="number"
                              class="input input-sm input-bordered w-20 text-center" min="0" required /></td>
                          <td><input v-model="v.merchant_sku" type="text" class="input input-sm input-bordered w-full"
                              placeholder="SKU" /></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                </div>
              </div>
              <div class="divider">ຮູບພາບເພີ່ມເຕີມ (Gallery)</div>

              <div class="form-control">
                <div
                  class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors bg-base-100"
                  @dragover.prevent @dragenter.prevent @drop.prevent="handleGalleryDrop" @click="triggerGalleryInput">
                  <input ref="galleryInput" type="file" accept="image/jpeg,image/png,image/webp" multiple class="hidden"
                    @change="handleGalleryUpload" />
                  <div class="text-center">
                    <div class="bg-base-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span class="icon-[tabler--upload] size-8 text-gray-500"></span>
                    </div>
                    <p class="text-base font-medium text-gray-700">ລາກແລະວາງໄຟລ໌ ຫຼື ຄລິກເພື່ອເລືອກ</p>
                    <p class="text-xs text-gray-400 mt-2">JPG, PNG (ສູງສຸດ 2MB ຕໍ່ໄຟລ໌)</p>
                  </div>
                </div>

                <div v-if="form.gallery.length > 0" class="mt-6 bg-base-200/50 p-4 rounded-xl border border-base-200">
                  <p class="text-sm font-medium mb-3">ຮູບພາບທີ່ເລືອກ ({{ form.gallery.length }} ຮູບ):</p>
                  <div class="flex flex-wrap gap-4">
                    <div v-for="(image, index) in form.gallery" :key="index"
                      class="relative w-24 h-24 rounded-lg border border-gray-300 overflow-hidden group shadow-sm">
                      <img :src="getGalleryImageUrl(image)" :alt="`Gallery ${index + 1}`"
                        class="w-full h-full object-cover transition-transform group-hover:scale-110"
                        @error="handleImageError">
                      <div
                        class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" class="btn btn-circle btn-error btn-sm"
                          @click.stop="removeGalleryImage(index)">
                          <span class="icon-[tabler--trash] size-4"></span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-control bg-base-200 p-4 rounded-xl mt-4">
                <label class="label cursor-pointer justify-start gap-4">
                  <input type="checkbox" v-model="form.is_active" :true-value="1" :false-value="0"
                    class="toggle toggle-success" />
                  <span class="label-text font-bold">ເປີດສະຖານະພ້ອມຂາຍ (Active)</span>
                </label>
              </div>

            </form>
          </div>

          <div class="p-6 border-t border-base-200 bg-base-100 shrink-0 rounded-b-2xl">
            <div class="flex justify-end gap-3">
              <button type="button" @click="closeModal" class="btn btn-ghost">ຍົກເລີກ</button>
              <button type="submit" form="productForm" class="btn btn-primary min-w-[120px]" :disabled="loading">
                <span v-if="loading" class="loading loading-spinner size-5"></span>
                <span v-else class="flex items-center gap-2">
                  <span class="icon-[tabler--device-floppy] size-5"></span>
                  {{ editingProduct ? 'ບັນທຶກການແກ້ໄຂ' : 'ເພີ່ມສິນຄ້າ' }}
                </span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '@/utils/formatters'
// 🟢 เปลี่ยนจากเดิม ให้มี toRaw ด้วย
import { ref, reactive, computed, onMounted, toRaw } from 'vue'
import { useProductStore } from '@/stores/product'
import { useGlobalCategoryStore } from '@/stores/global_categories';
import { useShopStore } from '@/stores/shop'
import { getFullImageUrl } from '@/utils/url'
import { alert } from '@/utils/alert'
// 🟢 Import API สำหรับอัปโหลดรูป Variant แบบ Pre-upload
import { uploadVariantImage } from '@/api/upload'
import { importProductsFromExcel } from '@/api/product' // 🟢 นำเข้าฟังก์ชันที่เพิ่งสร้าง
import type { Product, ProductType } from '@/types/product'

interface ImageFileInfo {
  name: string
  type: string
  size: number
}

// Stores
const productStore = useProductStore()
const shopStore = useShopStore()
const globalCategoryStore = useGlobalCategoryStore();

// Modal state
const showModal = ref(false)
const showStatusModal = ref(false)
const editingProduct = ref<Product | null>(null)
const productToToggle = ref<Product | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const galleryInput = ref<HTMLInputElement | null>(null)
const loading = ref(false)

// Filter states
const searchQuery = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const localPageSize = ref(10)

// 🟢 Form state (Clean Data Structure)
const form = reactive({
  product_name: '',
  description: '',
  product_brand: '',
  product_model: '',
  productType_id: 0,
  price: 0,
  image_url: '',
  gallery: [] as string[],
  is_active: 1,

  // -- ฟิลด์ใหม่ --
  global_category_id: null as number | null,
  merchant_sku: '',
  stock_quantity: 0,
  allowed_loan_type: 'both' as 'single_item' | 'bnpl_cart' | 'both',

  // -- ตัวแปรสำหรับ Variant Generator --
  has_variants: false,
  variants: [] as any[]
})

const errors = reactive({
  product_name: '',
  product_brand: '',
  product_model: '',
  productType_id: '',
  price: ''
})

// ดึงข้อมูลหมวดหมู่เฉพาะที่ Active มาใช้งาน
const globalCategories = computed(() => globalCategoryStore.activeCategories);

// 🟢 State สำหรับ UI สร้างตัวเลือก
const variantOptions = ref([
  { id: 1, name: 'ສີ (Color)', values: [''] }
])

const addVariantOption = () => {
  if (variantOptions.value.length < 2) {
    variantOptions.value.push({ id: Date.now(), name: 'ຂະໜາດ (Size)', values: [''] })
  }
}

const removeVariantOption = (index: number) => {
  variantOptions.value.splice(index, 1)
  generateVariantMatrix()
}

const addVariantValue = (optIndex: number) => {
  variantOptions.value[optIndex]!.values.push('')
}

const removeVariantValue = (optIndex: number, valIndex: number) => {
  variantOptions.value[optIndex]!.values.splice(valIndex, 1)
  if (variantOptions.value[optIndex]!.values.length === 0) {
    variantOptions.value[optIndex]!.values.push('')
  }
  generateVariantMatrix()
}

// 🟢 🌟 Core Logic: สร้าง Matrix อัตโนมัติ
const generateVariantMatrix = () => {
  if (!form.has_variants) {
    form.variants = []
    return
  }

  const validOptions = variantOptions.value.map(opt => ({
    name: opt.name,
    values: opt.values.filter(v => v.trim() !== '')
  })).filter(opt => opt.values.length > 0)

  if (validOptions.length === 0) {
    form.variants = []
    return
  }

  let matrix: any[] = [{}]
  validOptions.forEach(option => {
    const newMatrix: any[] = []
    matrix.forEach(existingRow => {
      option.values.forEach(value => {
        const isColor = option.name.includes('ສີ') || option.name.toLowerCase().includes('color')
        newMatrix.push({
          ...existingRow,
          [isColor ? 'color' : 'size_or_capacity']: value
        })
      })
    })
    matrix = newMatrix
  })

  form.variants = matrix.map((row, index) => {
    const existing = form.variants.find(v => v.color === row.color && v.size_or_capacity === row.size_or_capacity)
    return {
      id: existing?.id || undefined, // 🟢 เพิ่มบรรทัดนี้: จำ ID เดิมไว้เพื่อให้ Backend รู้ว่าต้อง Update ไม่ใช่ Create
      color: row.color || '',
      size_or_capacity: row.size_or_capacity || '',
      merchant_sku: existing?.merchant_sku || `${form.merchant_sku || 'SKU'}-${index + 1}`,
      price: existing?.price || form.price || 0,
      stock_quantity: existing?.stock_quantity || 0,
      weight_gram: existing?.weight_gram || 0,
      image_url: existing?.image_url || '',
      file: existing?.file || null // 🌟 จำ File object ไว้ถ้าเคยเลือกแล้ว
    }
  })
}

// 🟢 ฟังก์ชันจัดการรูปภาพ Variant (Hybrid: Base64 Preview -> File Object)
const triggerVariantImage = (index: number) => {
  document.getElementById(`variant-img-${index}`)?.click()
}

const handleVariantImageUpload = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      alert.error('ຂະໜາດໄຟລ໌ຕ້ອງນ້ອຍກວ່າ 2MB')
      return
    }
    // เก็บไฟล์ไว้รอ Pre-upload ตอนกด Save
    form.variants[index].file = file;
    // สร้าง URL จำลองเพื่อให้เห็นรูปทันที
    form.variants[index].image_url = URL.createObjectURL(file);
  }
}

const imageFileInfo = reactive<ImageFileInfo>({
  name: '',
  type: '',
  size: 0
})

// Checkbox & Selection
const selectedRows = ref<number[]>([])

const allRowsSelected = computed(() => {
  return displayedProducts.value.length > 0 &&
    displayedProducts.value.every(product => selectedRows.value.includes(product.id))
})

const someRowsSelected = computed(() => {
  return selectedRows.value.length > 0 && !allRowsSelected.value
})

const hasInactiveSelected = computed(() => {
  return selectedRows.value.some(id => {
    const product = displayedProducts.value.find(p => p.id === id);
    return product && product.is_active === 0;
  });
});

const hasActiveSelected = computed(() => {
  return selectedRows.value.some(id => {
    const product = displayedProducts.value.find(p => p.id === id);
    return product && product.is_active === 1;
  });
});

const toggleAllRows = () => {
  if (allRowsSelected.value) {
    selectedRows.value = selectedRows.value.filter(
      id => !displayedProducts.value.some(product => product.id === id)
    )
  } else {
    const newSelections = displayedProducts.value.map(product => product.id)
    selectedRows.value = [...new Set([...selectedRows.value, ...newSelections])]
  }
}

const toggleRow = (productId: number) => {
  const index = selectedRows.value.indexOf(productId)
  if (index > -1) {
    selectedRows.value.splice(index, 1)
  } else {
    selectedRows.value.push(productId)
  }
}

// Computed properties
const isLoading = computed(() => productStore.isLoading)
const displayedProducts = computed(() => productStore.displayedProductsWithFullUrls)
const totalProducts = computed(() => productStore.total)
const totalPages = computed(() => productStore.totalPages)
const startIndex = computed(() => productStore.startIndex)
const endIndex = computed(() => productStore.endIndex)
const hasPreviousPage = computed(() => productStore.hasPreviousPage)
const hasNextPage = computed(() => productStore.hasNextPage)
const currentPage = computed(() => productStore.currentPage)
const pageSize = computed(() => productStore.pageSize)
const productTypes = computed(() => productStore.productTypes)

// Utilities
const isBase64 = (str: string): boolean => {
  return str.startsWith('data:') || str.startsWith('blob:') // 🟢 เพิ่ม blob:
}

const getProductImageUrl = (url: string): string => {
  if (!url) return '';
  if (isBase64(url)) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return getFullImageUrl(url) || '';
}

const getGalleryImageUrl = (url: string): string => {
  return getProductImageUrl(url);
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  if (!isBase64(target.src)) {
    target.src = '/images/placeholder.png'
  }
}

const getProductTypeName = (productTypeId: number): string => {
  const type = productTypes.value.find(t => t.id === Number(productTypeId))
  return type ? type.type_name : `Type ID: ${productTypeId}`
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const validateForm = (): boolean => {
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
  let isValid = true

  if (!form.product_name.trim()) { errors.product_name = 'ກະລຸນາປ້ອນຊື່ສິນຄ້າ'; isValid = false }
  if (form.productType_id <= 0) { errors.productType_id = 'ກະລຸນາເລືອກປະເພດສິນຄ້າ'; isValid = false }
  // ถ้าระบบไม่ได้ใช้ variants ราคาหลักต้องมากกว่า 0
  if (!form.has_variants && form.price <= 0) { errors.price = 'ລາຄາຕ້ອງຫຼາຍກວ່າ 0'; isValid = false }

  return isValid
}

// Filters & Pagination
const applyFilters = () => {
  selectedRows.value = []
  productStore.changePage(1)
  const currentShopId = shopStore.currentShop?.id;
  if (!currentShopId) return;
  productStore.fetchProducts({
    shop_id: currentShopId,
    page: 1,
    limit: localPageSize.value,
    search: searchQuery.value,
    status: statusFilter.value,
    type: typeFilter.value
  })
}

const changePageSize = () => {
  selectedRows.value = []
  productStore.changePageSize(localPageSize.value)
  const currentShopId = shopStore.currentShop?.id;
  if (!currentShopId) return;
  productStore.fetchProducts({
    shop_id: currentShopId,
    page: 1,
    limit: localPageSize.value,
    search: searchQuery.value,
    status: statusFilter.value,
    type: typeFilter.value
  })
}

const clearSearch = () => {
  searchQuery.value = ''
  applyFilters()
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null
const debounceSearch = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    applyFilters()
  }, 300)
}

const previousPage = () => {
  if (hasPreviousPage.value) {
    selectedRows.value = []
    productStore.changePage(currentPage.value - 1)
  }
}

const nextPage = () => {
  if (hasNextPage.value) {
    selectedRows.value = []
    productStore.changePage(currentPage.value + 1)
  }
}

// Modals & Actions
const openAddProductModal = () => {
  editingProduct.value = null
  resetForm()
  showModal.value = true
}

const openEditProductModal = async (product: any) => {
  editingProduct.value = product
  loading.value = true // แนะนำให้เปิด loading ระหว่างดึงข้อมูล

  try {
    // 🟢 1. ดึงข้อมูลแบบเต็ม (Full Details) จาก Backend ผ่าน Store
    const fullProduct = await productStore.fetchProductById(product.id)

    // 🟢 2. Map ข้อมูลพื้นฐาน
    form.product_name = fullProduct.product_name || ''
    form.description = fullProduct.description || ''
    form.product_brand = fullProduct.brand || ''
    form.product_model = fullProduct.model || ''
    form.productType_id = fullProduct.productType_id || 0
    form.global_category_id = fullProduct.global_category_id || null
    form.merchant_sku = fullProduct.merchant_sku || ''
    form.allowed_loan_type = fullProduct.allowed_loan_type || 'both'
    form.price = Number(fullProduct.price) || 0
    form.stock_quantity = Number(fullProduct.stock_quantity) || 0
    form.is_active = fullProduct.is_active ? 1 : 0
    form.image_url = fullProduct.image_url || ''

    // จัดการรูปภาพหลัก (Preview)
    if (fullProduct.image_url) {
      imageFileInfo.name = 'product-image.jpg'
      imageFileInfo.type = 'image/jpeg'
      imageFileInfo.size = 0
    } else {
      removeImage() // ล้างค่า Preview เดิม
    }

    // จัดการ Gallery (รองรับทั้งเคสที่ Store แปลงมาแล้ว และเคสที่ Backend ส่งมาตรงๆ)
    form.gallery = Array.isArray(fullProduct.gallery) && fullProduct.gallery.length > 0
      ? fullProduct.gallery
      : (fullProduct.product_galleries?.map((g: any) => getProductImageUrl(g.image_url)) || [])

    // =======================================================
    // 🟢 3. 🌟 จัดการ Variants และ Reverse Mapping
    // =======================================================
    const variants = fullProduct.product_variants || []

    if (variants.length > 0) {
      form.has_variants = true

      // 3.1 ใส่ข้อมูลลงตาราง Matrix
      form.variants = variants.map((v: any) => ({
        id: v.id, // เก็บ ID ไว้ เพื่อให้รู้ว่าตัวนี้เป็นของเดิม (เผื่ออัปเดต)
        color: v.color || '',
        size_or_capacity: v.size_or_capacity || '',
        merchant_sku: v.merchant_sku || '',
        price: Number(v.price) || 0,
        stock_quantity: Number(v.stock_quantity) || 0,
        weight_gram: Number(v.weight_gram) || 0,
        image_url: v.image_url || '',
        file: null // ไม่มีไฟล์ Local เพราะเป็นข้อมูลจาก Server
      }))

      // 3.2 สร้างหัวข้อ option กลับคืนมา (สี, ไซส์) ให้ UI ทำงานต่อได้
      // ดึงค่าสีที่ไม่ซ้ำกัน
      const uniqueColors = [...new Set(variants.map((v: any) => v.color).filter(Boolean))] as string[]
      // ดึงค่าไซส์ที่ไม่ซ้ำกัน
      const uniqueSizes = [...new Set(variants.map((v: any) => v.size_or_capacity).filter(Boolean))] as string[]

      const rebuiltOptions = []
      if (uniqueColors.length > 0) {
        rebuiltOptions.push({ id: 1, name: 'ສີ (Color)', values: uniqueColors })
      }
      if (uniqueSizes.length > 0) {
        rebuiltOptions.push({ id: 2, name: 'ຂະໜາດ (Size)', values: uniqueSizes })
      }

      // นำหัวข้อที่สร้างกลับ ไปใส่ใน State ของ UI
      if (rebuiltOptions.length > 0) {
        variantOptions.value = rebuiltOptions
      } else {
        variantOptions.value = [{ id: 1, name: 'ສີ (Color)', values: [''] }]
      }

    } else {
      // ถ้าไม่มี Variant เลย ให้เคลียร์ค่า
      form.has_variants = false
      form.variants = []
      variantOptions.value = [{ id: 1, name: 'ສີ (Color)', values: [''] }]
    }

  } catch (error) {
    console.error('❌ Error loading product details:', error)
    alert.error('ເກີດຂໍ້ຜິດພາດ', 'ບໍ່ສາມາດດຶງຂໍ້ມູນສິນຄ້າໄດ້')
  } finally {
    loading.value = false
  }

  showModal.value = true
}
// const openEditProductModal = async (product: any) => {
//   editingProduct.value = product
//   try {
//     const gallery = await productStore.fetchProductGallery(product.id)
//     form.product_name = product.product_name
//     form.description = product.description || ''
//     form.product_brand = product.brand || ''
//     form.product_model = product.model || ''
//     form.productType_id = product.productType_id
//     form.price = Number(product.price)
//     form.stock_quantity = Number(product.stock_quantity) || 0
//     form.merchant_sku = product.merchant_sku || ''
//     form.allowed_loan_type = product.allowed_loan_type || 'both'
//     form.global_category_id = product.global_category_id || null

//     form.image_url = product.image_url || ''
//     form.gallery = gallery.map((item: any) => item.image_url) || []
//     form.is_active = product.is_active ? 1 : 0

//     if (product.image_url) {
//       imageFileInfo.name = 'product-image.jpg'
//       imageFileInfo.type = 'image/jpeg'
//       imageFileInfo.size = 0
//     }

//     // 🟢 ถ้าระบบแก้ไขสามารถดึง Variants ได้ ก็เอามา Map ตรงนี้
//     // (ตอนนี้เราเน้นที่การเพิ่มใหม่ ถ้ามีข้อมูล variants ในตัวแปร product ก็สามารถ set กลับมาได้)
//     form.has_variants = false;
//     form.variants = [];

//   } catch (error) {
//     console.error('❌ Error loading product details:', error)
//   }
//   showModal.value = true
// }

const closeModal = () => {
  showModal.value = false
  editingProduct.value = null
}

const resetForm = () => {
  form.product_name = ''
  form.description = ''
  form.product_brand = ''
  form.product_model = ''
  form.productType_id = 0
  form.price = 0
  form.stock_quantity = 0
  form.merchant_sku = ''
  form.allowed_loan_type = 'both'
  form.global_category_id = null
  form.image_url = ''
  form.gallery = []
  form.is_active = 1

  form.has_variants = false
  form.variants = []
  variantOptions.value = [{ id: 1, name: 'ສີ (Color)', values: [''] }]

  imageFileInfo.name = ''
  imageFileInfo.type = ''
  imageFileInfo.size = 0

  if (fileInput.value) fileInput.value.value = ''
  if (galleryInput.value) galleryInput.value.value = ''
}

const toggleProductStatus = (product: Product) => {
  productToToggle.value = product
  showStatusModal.value = true
}

const confirmToggleStatus = async () => {
  if (productToToggle.value) {
    const isDeactivating = productToToggle.value.is_active === 1;
    try {
      const newStatus = isDeactivating ? 0 : 1;
      const newStatusBool = !isDeactivating;
      await productStore.toggleProductStatus(productToToggle.value.id, newStatusBool)
      alert.success('ປ່ຽນສະຖານະສຳເລັດ!')
      productToToggle.value.is_active = newStatus as any
      await applyFilters()
    } catch (error: any) {
      alert.error('ເກີດຂໍ້ຜິດພາດການປ່ຽນສະຖານະ')
    }
  }
  showStatusModal.value = false
  productToToggle.value = null
}

const confirmBulkToggle = async (isActive: boolean) => {
  const actionText = isActive ? 'ເປີດການໃຊ້ງານ' : 'ປິດການໃຊ້ງານ'
  const confirm = await alert.confirm(
    `ຢືນຢັນການ${actionText}`,
    `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການ${actionText}ສິນຄ້າທີ່ເລືອກໄວ້ຈຳນວນ ${selectedRows.value.length} ລາຍການ?`,
    'ຢືນຢັນ', 'ຍົກເລີກ'
  )

  if (confirm) {
    try {
      await productStore.toggleMultipleStatus(selectedRows.value, isActive)
      alert.success(`${actionText}ສຳເລັດ!`)
      applyFilters()
    } catch (error) {
      alert.error(`ເກີດຂໍ້ຜິດພາດໃນການ${actionText}`)
    }
  }
}

// 🟢 🌟 Core Logic: Save Product (Pre-upload Variants + Generate Payload)
const saveProduct = async () => {
  if (!validateForm()) return
  loading.value = true

  try {
    let productId: number
    const currentShopId = shopStore.currentShop?.id;
    if (!currentShopId) throw new Error("Shop ID not found");

    // ========================================================
    // 🌟 ขั้นตอนที่ 1: อัปโหลดรูปภาพ Variants (Bulletproof Pre-upload)
    // ========================================================
    if (form.has_variants && form.variants.length > 0) {
      for (let i = 0; i < form.variants.length; i++) {
        if (form.variants[i].file) {
          try {
            // 🟢 🌟 หัวใจสำคัญ: ใช้ toRaw() เพื่อถอด Proxy ออก เอาไฟล์ดิบๆ ส่งไปอัปโหลด!
            const rawFile = toRaw(form.variants[i].file);
            const uploadRes = await uploadVariantImage(rawFile);

            const realUrl = uploadRes.file_url || uploadRes.fileUrl || uploadRes.data?.file_url || uploadRes.data?.fileUrl;

            if (realUrl) {
              form.variants[i].image_url = realUrl;
              form.variants[i].file = null;
            }
          } catch (error) {
            console.error('Failed to upload variant image:', error)
            alert.error('ເກີດຂໍ້ຜິດພາດ', 'ບໍ່ສາມາດອັບໂຫຼດຮູບພາບຕົວເລືອກໄດ້')
            loading.value = false
            return
          }
        }

        // 🛡️ เซฟตี้ด่านสุดท้าย
        const currentUrl = form.variants[i].image_url;
        if (currentUrl && (currentUrl.startsWith('blob:') || currentUrl.startsWith('data:'))) {
          form.variants[i].image_url = '';
        }
      }
    }

    // ========================================================
    // 🌟 ขั้นตอนที่ 2: จัดเตรียม Payload
    // ========================================================
    const payload = {
      product_name: form.product_name,
      description: form.description,
      brand: form.product_brand,
      model: form.product_model,
      productType_id: form.productType_id,
      global_category_id: form.global_category_id,
      merchant_sku: form.merchant_sku,
      allowed_loan_type: form.allowed_loan_type,
      is_active: form.is_active,

      price: form.has_variants && form.variants.length > 0 ? form.variants[0].price : form.price,
      stock_quantity: form.has_variants ? form.variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0) : form.stock_quantity,

      variants: form.has_variants ? form.variants.map(v => ({
        id: v.id, // 🟢 เพิ่มบรรทัดนี้: ส่ง ID กลับไปให้ Backend ด้วย!
        color: v.color,
        size_or_capacity: v.size_or_capacity,
        merchant_sku: v.merchant_sku,
        price: v.price,
        stock_quantity: v.stock_quantity,
        weight_gram: v.weight_gram,
        image_url: v.image_url // ✅ ตอนนี้การันตีได้ 100% ว่าจะไม่มีคำว่า blob: โผล่มาตรงนี้
      })) : []
    };

    if (editingProduct.value) {
      await productStore.updateProduct(editingProduct.value.id, payload)
      productId = editingProduct.value.id
    } else {
      const newProduct = await productStore.createProduct({
        ...payload,
        shop_id: currentShopId
      } as any)
      productId = newProduct.id
    }

    // ========================================================
    // 🌟 ขั้นตอนที่ 3: อัปโหลดรูปภาพหลักและ Gallery (ใช้ Logic เดิมที่ใช้งานได้ดีอยู่แล้ว)
    // ========================================================
    if (form.image_url && form.image_url.startsWith('data:image/')) {
      try {
        const base64Response = await fetch(form.image_url)
        const blob = await base64Response.blob()
        if (blob.size >= 1024) {
          const file = new File([blob], 'main-image.jpg', { type: 'image/jpeg' })
          const uploadResp = await productStore.uploadProductImage(productId, file)
          if (uploadResp.success) {
            await productStore.updateProduct(productId, { image_url: uploadResp.data?.file_url || uploadResp.file_url })
          }
        }
      } catch (error) {
        console.error('Error uploading main image:', error)
      }
    }

    const newGalleryImages = form.gallery.filter(img => img.startsWith('data:image/'))
    if (newGalleryImages.length > 0) {
      try {
        const galleryFiles = await Promise.all(
          newGalleryImages.map(async (img, index) => {
            const response = await fetch(img)
            const blob = await response.blob()
            const timestamp = Date.now()
            return new File([blob], `gallery-${timestamp}-${index}.jpg`, { type: 'image/jpeg' })
          })
        )
        const uploadGalleryResp = await productStore.uploadProductGallery(productId, galleryFiles)
        if (uploadGalleryResp.success) {
          const uploadedUrls = uploadGalleryResp.data?.uploaded || []
          if (uploadedUrls.length > 0) {
            const existingUrls = form.gallery.filter(img => img.startsWith('http'))
            const allGalleryUrls = [
              ...existingUrls.map(url => ({ file_url: url })),
              ...uploadedUrls.map((img: any) => ({ file_url: img.file_url }))
            ]
            await productStore.addProductGallery(productId, allGalleryUrls as any)
          }
        }
      } catch (error: any) {
        console.error('❌ Error in gallery upload:', error)
      }
    } else if (form.gallery.length > 0) {
      try {
        const existingUrls = form.gallery.filter(img => img.startsWith('http')).map(url => ({ file_url: url }))
        if (existingUrls.length > 0) {
          await productStore.addProductGallery(productId, existingUrls as any)
        }
      } catch (error) {
        console.error('Error syncing existing gallery:', error)
      }
    }

    const message = editingProduct.value ? 'ແກ້ໄຂສິນຄ້າສຳເລັດ!' : 'ເພີ່ມສິນຄ້າສຳເລັດ!'
    alert.success(message)
    closeModal()
    await applyFilters()

  } catch (error) {
    console.error('Error saving product:', error)
    alert.error('ເກີດຂໍ້ຜິດພາດການບັນທຶກສິນຄ້າ')
  } finally {
    loading.value = false
  }
}

// Upload handlers
const triggerFileInput = () => {
  if (fileInput.value) fileInput.value.click()
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      alert.error('ຂະໜາດໄຟລ໌ຕ້ອງນ້ອຍກວ່າ 2MB')
      target.value = ''
      return
    }
    if (!file.type.startsWith('image/')) {
      alert.error('ກະລຸນາເລືອກໄຟລ໌ຮູບພາບເທົ່ານັ້ນ')
      target.value = ''
      return
    }
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        form.image_url = e.target?.result as string
        imageFileInfo.name = file.name
        imageFileInfo.type = file.type
        imageFileInfo.size = file.size
      }
      reader.readAsDataURL(file)
    } catch (error) {
      alert.error('ເກີດຂໍ້ຜິດພາດໃນການອ່ານໄຟລ໌')
    }
  }
}

const removeImage = () => {
  form.image_url = ''
  imageFileInfo.name = ''
  imageFileInfo.type = ''
  imageFileInfo.size = 0
  if (fileInput.value) fileInput.value.value = ''
}

const triggerGalleryInput = () => {
  if (galleryInput.value) galleryInput.value.click()
}

const handleGalleryUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  await processGalleryFiles(files)
}

const handleGalleryDrop = async (event: DragEvent) => {
  const files = Array.from(event.dataTransfer?.files || [])
  await processGalleryFiles(files)
}

const processGalleryFiles = async (files: File[]) => {
  const validImages: string[] = []
  for (const file of files) {
    if (file.size > 2 * 1024 * 1024) continue
    if (!file.type.startsWith('image/')) continue
    try {
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error('Error reading file'))
        reader.readAsDataURL(file)
      })
      validImages.push(base64)
    } catch (error) { }
  }
  form.gallery.push(...validImages)
  if (galleryInput.value) galleryInput.value.value = ''
}

const removeGalleryImage = (index: number) => {
  form.gallery.splice(index, 1)
}

// Excel Import
const excelInput = ref<HTMLInputElement | null>(null);
const isImporting = ref(false);

const triggerExcelUpload = () => {
  if (excelInput.value) excelInput.value.click();
}

const handleExcelUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv' // .csv
  ];

  if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx')) {
    alert.error('ປະເພດໄຟລ໌ບໍ່ຖືກຕ້ອງ', 'ກະລຸນາເລືອກໄຟລ໌ Excel (.xlsx, .xls) ຫຼື CSV');
    target.value = '';
    return;
  }

  const currentShopId = shopStore.currentShop?.id;
  if (!currentShopId) {
    alert.error('ບໍ່ພົບຂໍ້ມູນຮ້ານຄ້າ');
    return;
  }

  isImporting.value = true;

  try {
    // 🟢 เรียกใช้ API จาก src/api/product.ts แทนการใช้ apiClient โดยตรง
    const result = await importProductsFromExcel(file, currentShopId);

    if (result.success) {
      alert.success('ນຳເຂົ້າສິນຄ້າສຳເລັດ!', `ນຳເຂົ້າທັງໝົດ ${result.importedCount || 0} ລາຍການ`);
      applyFilters(); // โหลดตารางใหม่เพื่อให้ข้อมูลที่เพิ่ง Import แสดงขึ้นมา
    }
  } catch (error: any) {
    console.error('Import error:', error);
    alert.error('ນຳເຂົ້າບໍ່ສຳເລັດ', error.message);
  } finally {
    isImporting.value = false;
    target.value = ''; // รีเซ็ต input เพื่อให้สามารถอัปโหลดไฟล์เดิมซ้ำได้ถ้าต้องการ
  }
}

onMounted(async () => {
  try {
    await shopStore.fetchCurrentShop()
    const currentShop = shopStore.currentShop
    if (!currentShop || !currentShop.id) {
      alert.error('ບໍ່ພົບຂໍ້ມູນຮ້ານຄ້າ', 'ກະລຸນາເລືອກຮ້ານຄ້າກ່ອນ')
      return
    }
    await Promise.all([
      productStore.fetchProducts({ shop_id: currentShop.id, page: 1, limit: localPageSize.value }),
      productStore.fetchProductTypes(),
      globalCategoryStore.fetchCategories() // 🟢 โหลดหมวดหมู่กลางที่นี่
    ])
  } catch (error) {
    alert.error('ເກີດຂໍ້ຜິດພາດ', 'ບໍ່ສາມາດບໍໂຫຼດຂໍ້ມູນໄດ້')
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}
</style>
