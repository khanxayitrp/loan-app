<template>
  <div class="request-form-container">
    <div v-if="isLoadingForm" class="text-center py-12">
      <div class="loading loading-spinner loading-lg text-primary"></div>
      <p class="mt-2 text-gray-500">ກຳລັງໂຫຼດແບບຟອມ...</p>
    </div>

    <div v-else class="loan-request-form">
      <div class="print-button-container">
        <button @click="printForm" class="btn btn-primary btn-sm gap-2">
          <span class="icon-[tabler--printer] size-4"></span>
          ພິມແບບຟອມ
        </button>
      </div>

      <div v-if="!isEditing" class="edit-button-container">
        <button @click="enableEdit" class="btn btn-warning btn-sm gap-2">
          <span class="icon-[tabler--pencil] size-4"></span>
          ແກ້ໄຂຂໍ້ມູນ
        </button>
      </div>

      <div class="form-header">
        <div class="emblem">
          <img src="/image/LOGO INSEE.png" alt="ສັນຍາລັກ" class="w-16 h-16" />
        </div>
        <div class="header-text">
          <h2 class="text-lg font-bold">ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ</h2>
          <p class="text-sm">ສັນຕິພາບ ເອກະລາດ ປະຊາທິປະໄຕ ເອກະພາບ ວັດທະນາຖາວອນ</p>
        </div>
      </div>

      <h1 class="form-title">ໃບສະເໜີຂໍກູ້ຢືມປະເພດສິນເຊື່ອເພື່ອການຊົມໃຊ້</h1>
      <h3 class="form-subtitle">ອອນລາຍ ອ໋ອບລາຍ</h3>

      <div class="recipient-section">
        <p><strong>ຮຽນ:</strong> ທ່ານຄະນະອຳນວຍການ ສະຖາບັນການເງິນຈຸລະພາກທີ່ບໍ່ຮັບເງິນຝາກ ອິນຊີ ຈໍາກັດ</p>
        <p><strong>ເລື່ອງ:</strong> ຂໍກູ້ຢືມປະເພດສິນເຊື່ອຊົມໃຊ້ ປະເພດ: ສິນຄ້າຄຳ ສິນຄ້າທົ່ວໄປ ສິນຄ້າລົດຈັກ</p>
      </div>

      <form @submit.prevent="saveForm">
        <section class="form-section">
          <h3 class="section-title">I. ຂໍ້ມູນລູກຄ້າ:</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>ຊື່ ທ້າວ/ນາງ: <span class="required">*</span></label>
              <input v-model="formData.customer.fullname" type="text" required :readonly="!isEditing"
                :class="{ 'has-data': formData.customer.fullname, 'readonly-field': !isEditing }"
                placeholder="ປ້ອນຊື່" />
            </div>
            <div class="form-group">
              <label>ວັນເດືອນປີເກີດ: <span class="required">*</span></label>
              <input v-model="formData.customer.dob" type="date" required :readonly="!isEditing"
                :class="{ 'has-data': formData.customer.dob, 'readonly-field': !isEditing }" @change="calculateAge" />
            </div>
            <div class="form-group">
              <label>ອາຍຸ: <span class="required">*</span></label>
              <input v-model.number="formData.customer.age" type="number" min="18" required readonly
                :class="{ 'has-data': formData.customer.age }" class="readonly-field" />
            </div>
            <div class="form-group">
              <label>ອາຊີບ: <span class="required">*</span></label>
              <input v-model="formData.customer.occupation" type="text" required :readonly="!isEditing"
                :class="{ 'has-data': formData.customer.occupation, 'readonly-field': !isEditing }"
                placeholder="ອາຊີບ" />
            </div>
            <div class="form-group">
              <label>ເບີໂທ: <span class="required">*</span></label>
              <input v-model="formData.customer.phone" type="tel" required :readonly="!isEditing"
                :class="{ 'has-data': formData.customer.phone, 'readonly-field': !isEditing }"
                placeholder="020XXXXXXXX" />
            </div>
            <div class="form-group full-width">
              <label>ທີ່ຢູ່ປັດຈຸບັນ: <span class="required">*</span></label>
              <div class="address-group">
                <span>ບ້ານ</span>
                <input v-model="formData.customer.address.village" type="text" :readonly="!isEditing"
                  :class="{ 'has-data': formData.customer.address.village, 'readonly-field': !isEditing }"
                  placeholder="ບ້ານ" />
                <span>ເມືອງ</span>
                <input v-model="formData.customer.address.district" type="text" :readonly="!isEditing"
                  :class="{ 'has-data': formData.customer.address.district, 'readonly-field': !isEditing }"
                  placeholder="ເມືອງ" />
                <span>ແຂວງ</span>
                <input v-model="formData.customer.address.province" type="text" :readonly="!isEditing"
                  :class="{ 'has-data': formData.customer.address.province, 'readonly-field': !isEditing }"
                  placeholder="ແຂວງ" />
              </div>
            </div>
            <div class="form-group">
              <label>ເລກບັດປະຈຳຕົວ: <span class="required">*</span></label>
              <input v-model="formData.customer.idCard" type="text" required :readonly="!isEditing"
                :class="{ 'has-data': formData.customer.idCard, 'readonly-field': !isEditing }" placeholder="ເລກບັດ" />
            </div>
            <div class="form-group">
              <label>ເລກທີ່ສຳມະໂນຄົວ:</label>
              <input v-model="formData.customer.censusNo" type="text" :readonly="!isEditing"
                :class="{ 'has-data': formData.customer.censusNo, 'readonly-field': !isEditing }"
                placeholder="ເລກສຳມະໂນຄົວ" />
            </div>
            <div class="form-group">
              <label>ໜ່ວຍ:</label>
              <input v-model="formData.customer.unit" type="text" :readonly="!isEditing"
                :class="{ 'has-data': formData.customer.unit, 'readonly-field': !isEditing }" />
            </div>
            <div class="form-group">
              <label>ສະຖານທີ່ອອກ:</label>
              <input v-model="formData.customer.issuePlace" type="text" :readonly="!isEditing"
                :class="{ 'has-data': formData.customer.issuePlace, 'readonly-field': !isEditing }" />
            </div>
            <div class="form-group">
              <label>ວັນທີ່ອອກ:</label>
              <input v-model="formData.customer.issueDate" type="date" :readonly="!isEditing"
                :class="{ 'has-data': formData.customer.issueDate, 'readonly-field': !isEditing }" />
            </div>
          </div>
        </section>

        <section class="form-section">
          <h3 class="section-title">II. ຂໍ້ມູນບ່ອນເຮັດວຽກ:</h3>
          <div class="form-grid">
            <div class="form-group full-width">
              <label>ຊື່ບໍລິສັດ/ຮ້ານ: <span class="required">*</span></label>
              <input v-model="formData.work.companyName" type="text" required :readonly="!isEditing"
                :class="{ 'has-data': formData.work.companyName, 'readonly-field': !isEditing }" />
            </div>
            <div class="form-group full-width">
              <label>ທີ່ຢູ່ຫ້ອງການ:</label>
              <div class="address-group">
                <span>ບ້ານ</span>
                <input v-model="formData.work.address.village" type="text" :readonly="!isEditing"
                  :class="{ 'has-data': formData.work.address.village, 'readonly-field': !isEditing }" />
                <span>ເມືອງ</span>
                <input v-model="formData.work.address.district" type="text" :readonly="!isEditing"
                  :class="{ 'has-data': formData.work.address.district, 'readonly-field': !isEditing }" />
                <span>ແຂວງ</span>
                <input v-model="formData.work.address.province" type="text" :readonly="!isEditing"
                  :class="{ 'has-data': formData.work.address.province, 'readonly-field': !isEditing }" />
              </div>
            </div>
            <div class="form-group">
              <label>ເບີໂທ:</label>
              <input v-model="formData.work.phone" type="tel" :readonly="!isEditing"
                :class="{ 'has-data': formData.work.phone, 'readonly-field': !isEditing }" />
            </div>
            <div class="form-group">
              <label>ປະເພດທຸລະກິດ:</label>
              <input v-model="formData.work.businessType" type="text" :readonly="!isEditing"
                :class="{ 'has-data': formData.work.businessType, 'readonly-field': !isEditing }" />
            </div>
            <div class="form-group">
              <label>ລາຍລະອຽດທຸລະກິດ:</label>
              <input v-model="formData.work.businessDetail" type="text" :readonly="!isEditing"
                :class="{ 'has-data': formData.work.businessDetail, 'readonly-field': !isEditing }" />
            </div>
            <div class="form-group">
              <label>ໄລຍະການເຮັດວຽກ:</label>
              <div class="duration-group">
                <input v-model.number="formData.work.durationMonths" type="number" placeholder="ເດືອນ"
                  :readonly="!isEditing"
                  :class="{ 'has-data': formData.work.durationMonths, 'readonly-field': !isEditing }" />
                <input v-model.number="formData.work.durationYears" type="number" placeholder="ປີ"
                  :readonly="!isEditing"
                  :class="{ 'has-data': formData.work.durationYears, 'readonly-field': !isEditing }" />
              </div>
            </div>
            <div class="form-group">
              <label>ພະແນກ:</label>
              <input v-model="formData.work.department" type="text" :readonly="!isEditing"
                :class="{ 'has-data': formData.work.department, 'readonly-field': !isEditing }" />
            </div>
            <div class="form-group">
              <label>ຕຳແໜ່ງ:</label>
              <input v-model="formData.work.position" type="text" :readonly="!isEditing"
                :class="{ 'has-data': formData.work.position, 'readonly-field': !isEditing }" />
            </div>
            <div class="form-group">
              <label>ເງິນເດືອນ: <span class="required">*</span></label>
              <input v-model.number="formData.work.salary" type="number" required :readonly="!isEditing"
                :class="{ 'has-data': formData.work.salary, 'readonly-field': !isEditing }" />
              <div class="text-xs text-gray-500 mt-1" v-if="formData.work.salary">
                {{ formatPrice(formData.work.salary) }} ກີບ
              </div>
            </div>
          </div>
        </section>

        <section class="form-section">
          <h3 class="section-title">III. ລາຍລະອຽດສິນຄ້າ:</h3>
          <div class="product-grid">
            <div class="product-row">
              <div class="form-group">
                <label>1. ປະເພດສິນຄ້າ: <span class="required">*</span></label>
                <select v-model="formData.product.type" required :disabled="!isEditing"
                  :class="{ 'has-data': formData.product.type, 'readonly-field': !isEditing }">
                  <option value="">ເລືອກປະເພດ</option>
                  <option value="gold">ສິນຄ້າຄຳ</option>
                  <option value="general">ສິນຄ້າທົ່ວໄປ</option>
                  <option value="motorcycle">ສິນຄ້າລົດຈັກ</option>
                </select>
              </div>
              <div class="form-group">
                <label>7. ຍີ່ຫໍ້:</label>
                <input v-model="formData.product.brand" type="text" :readonly="!isEditing"
                  :class="{ 'has-data': formData.product.brand, 'readonly-field': !isEditing }" />
              </div>
              <div class="form-group">
                <label>12. ລຸ້ນສິນຄ້າ:</label>
                <input v-model="formData.product.model" type="text" :readonly="!isEditing"
                  :class="{ 'has-data': formData.product.model, 'readonly-field': !isEditing }" />
              </div>
            </div>
            <div class="product-row">
              <div class="form-group">
                <label>2. ລາຄາສິນຄ້າ: <span class="required">*</span></label>
                <input v-model.number="formData.product.price" type="number" required :readonly="!isEditing"
                  :class="{ 'has-data': formData.product.price, 'readonly-field': !isEditing }"
                  @input="calculateLoanDetails" />
                <div class="text-xs text-gray-500 mt-1" v-if="formData.product.price">
                  {{ formatPrice(formData.product.price) }} ກີບ
                </div>
              </div>
              <div class="form-group">
                <label>8. ວາງດາວ:</label>
                <input v-model.number="formData.product.downPayment" type="number" :readonly="!isEditing"
                  :class="{ 'has-data': formData.product.downPayment, 'readonly-field': !isEditing }"
                  @input="calculateLoanDetails" />
                <div class="text-xs text-gray-500 mt-1" v-if="formData.product.downPayment">
                  {{ formatPrice(formData.product.downPayment) }} ກີບ
                </div>
              </div>
              <div class="form-group">
                <label>13. ວົງເງິນອະນຸມັດ:</label>
                <input v-model.number="formData.product.approvedAmount" type="number" readonly
                  :class="{ 'has-data': formData.product.approvedAmount }" class="readonly-field calculated-field" />
                <div class="text-xs text-gray-500 mt-1" v-if="formData.product.approvedAmount">
                  {{ formatPrice(formData.product.approvedAmount) }} ກີບ
                </div>
              </div>
            </div>
            <div class="product-row">
              <div class="form-group">
                <label>3. ໄລະຍະເວລາກູ້: <span class="required">*</span></label>
                <input v-model.number="formData.product.loanTerm" type="number" placeholder="ເດືອນ" required
                  :readonly="!isEditing"
                  :class="{ 'has-data': formData.product.loanTerm, 'readonly-field': !isEditing }"
                  @input="calculateLoanDetails" />
              </div>
              <div class="form-group">
                <label>
                  9. ອັດຕາດອກເບ້ຍ (%)
                  <span class="text-primary font-normal ml-1">
                    {{ formData.product.interestRateType === 'yearly' ? '(ຕໍ່ປີ)' : '(ຕໍ່ເດືອນ)' }}
                  </span>:
                </label>
                <input v-model.number="formData.product.interestRate" type="number" step="0.01" :readonly="!isEditing"
                  :class="{ 'has-data': formData.product.interestRate, 'readonly-field': !isEditing }"
                  @input="calculateLoanDetails" />
              </div>
              <div class="form-group">
                <label>14. ຈຳນວນດອກເບ້ຍທັງຫມົດ:</label>
                <input v-model.number="formData.product.totalInterest" type="number" readonly
                  :class="{ 'has-data': formData.product.totalInterest }" class="readonly-field calculated-field" />
                <div class="text-xs text-gray-500 mt-1" v-if="formData.product.totalInterest">
                  {{ formatPrice(formData.product.totalInterest) }} ກີບ
                </div>
              </div>
            </div>
            <div class="product-row">
              <div class="form-group">
                <label>4. ຄ່າທຳນຽມ/(CIB):</label>
                <input v-model.number="formData.product.fee" type="number" :readonly="!isEditing"
                  :class="{ 'has-data': formData.product.fee, 'readonly-field': !isEditing }" @input="calculateLoanDetails" />
                <div class="text-xs text-gray-500 mt-1" v-if="formData.product.fee">
                  {{ formatPrice(formData.product.fee) }} ກີບ
                </div>
              </div>
              <div class="form-group">
                <label>10. ຄ່າງວດເດືອນທຳອິດ:</label>
                <input v-model.number="formData.product.firstInstallment" type="number" readonly
                  :class="{ 'has-data': formData.product.firstInstallment }" class="readonly-field calculated-field" />
                <div class="text-xs text-gray-500 mt-1" v-if="formData.product.firstInstallment">
                  {{ formatPrice(formData.product.firstInstallment) }} ກີບ
                </div>
              </div>
            </div>
            <div class="product-row">
              <div class="form-group">
                <label>5. ຄ່າງວດລາຍເດືອນ: <span class="required">*</span></label>
                <input v-model.number="formData.product.monthlyPayment" type="number" required readonly
                  :class="{ 'has-data': formData.product.monthlyPayment }" class="readonly-field calculated-field" />
                <div class="text-xs text-gray-500 mt-1" v-if="formData.product.monthlyPayment">
                  {{ formatPrice(formData.product.monthlyPayment) }} ກີບ
                </div>
              </div>
              <div class="form-group">
                <label>11. ການຊຳລະຄ່າງວດທຸກໆວັນທີ່:</label>
                <input v-model.number="formData.product.paymentDay" type="number" min="1" max="31"
                  :readonly="!isEditing"
                  :class="{ 'has-data': formData.product.paymentDay, 'readonly-field': !isEditing }" />
                <small>ຂອງແຕ່ລະເດືອນ</small>
              </div>
              <div class="form-group">
                <label>6. ຮ້ານຄ້າທີ່ເລືອກ:</label>
                <input v-model="formData.product.store" type="text" :readonly="!isEditing"
                  :class="{ 'has-data': formData.product.store, 'readonly-field': !isEditing }" />
              </div>
            </div>
          </div>
        </section>

        <section class="form-section">
          <h3 class="section-title">
            IV. ຂໍ້ມູນສ່ວນຕົວຂອງ
            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.hasGuarantor" :disabled="!isEditing" />
              ຜູ້ຄຳ້ປະກັນ
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.hasReference" :disabled="!isEditing" />
              ຜູ້ອ້າງອີງ
            </label>
            (ຖ້າມີ)
          </h3>

          <div v-if="hasGuarantorData || formData.hasGuarantor || formData.hasReference" class="form-grid">
            <div class="form-group">
              <label>ຊື່ ທ້າວ/ນາງ:</label>
              <input v-model="formData.guarantor.name" type="text" :readonly="!isEditing"
                :class="{ 'has-data': formData.guarantor.name, 'readonly-field': !isEditing }" />
            </div>
            <div class="form-group">
              <label>ວັນເດືອນປີເກີດ:</label>
              <input v-model="formData.guarantor.dob" type="date" :readonly="!isEditing"
                :class="{ 'has-data': formData.guarantor.dob, 'readonly-field': !isEditing }" />
            </div>
            <div class="form-group">
              <label>ອາຍຸ:</label>
              <input v-model.number="formData.guarantor.age" type="number" :readonly="!isEditing"
                :class="{ 'has-data': formData.guarantor.age, 'readonly-field': !isEditing }" />
            </div>
            <div class="form-group">
              <label>ອາຊີບ:</label>
              <input v-model="formData.guarantor.occupation" type="text" :readonly="!isEditing"
                :class="{ 'has-data': formData.guarantor.occupation, 'readonly-field': !isEditing }" />
            </div>
            <div class="form-group">
              <label>ເບີໂທ:</label>
              <input v-model="formData.guarantor.phone" type="tel" :readonly="!isEditing"
                :class="{ 'has-data': formData.guarantor.phone, 'readonly-field': !isEditing }" />
            </div>
            <div class="form-group full-width">
              <label>ທີ່ຢູ່ປະຈຸບັນ:</label>
              <div class="address-group">
                <span>ບ້ານ</span>
                <input v-model="formData.guarantor.address.village" type="text" :readonly="!isEditing"
                  :class="{ 'has-data': formData.guarantor.address.village, 'readonly-field': !isEditing }" />
                <span>ເມືອງ</span>
                <input v-model="formData.guarantor.address.district" type="text" :readonly="!isEditing"
                  :class="{ 'has-data': formData.guarantor.address.district, 'readonly-field': !isEditing }" />
                <span>ແຂວງ</span>
                <input v-model="formData.guarantor.address.province" type="text" :readonly="!isEditing"
                  :class="{ 'has-data': formData.guarantor.address.province, 'readonly-field': !isEditing }" />
              </div>
            </div>
            <div class="form-group">
              <label>ເລກບັດປະຈຳຕົວ:</label>
              <input v-model="formData.guarantor.idCard" type="text" :readonly="!isEditing"
                :class="{ 'has-data': formData.guarantor.idCard, 'readonly-field': !isEditing }" />
            </div>
            <div class="form-group">
              <label>ຄວາມສຳພັນ:</label>
              <div class="relationship-group">
                <label>
                  <input type="radio" v-model="formData.guarantor.relationship" value="parent" :disabled="!isEditing" />
                  ພໍ່ແມ່
                </label>
                <label>
                  <input type="radio" v-model="formData.guarantor.relationship" value="spouse" :disabled="!isEditing" />
                  ຄູ່ສົມລົດ
                </label>
                <label>
                  <input type="radio" v-model="formData.guarantor.relationship" value="other" :disabled="!isEditing" />
                  ອື່ນໆ
                </label>
                <input v-if="formData.guarantor.relationship === 'other'" v-model="formData.guarantor.relationshipOther"
                  type="text" placeholder="ລະບຸ" :readonly="!isEditing"
                  :class="{ 'has-data': formData.guarantor.relationshipOther, 'readonly-field': !isEditing }" />
              </div>
            </div>
            <div class="form-group full-width">
              <h4 class="subsection-title">ສະຖານທີ່ເຮັດວຽກ (ຜູ້ຄ້ຳປະກັນ):</h4>
            </div>
            <div class="form-group full-width">
              <label>ຊື່ບໍລິສັດ/ຮ້ານ:</label>
              <input v-model="formData.guarantor.work.companyName" type="text" :readonly="!isEditing"
                :class="{ 'has-data': formData.guarantor.work.companyName, 'readonly-field': !isEditing }" />
            </div>
            <div class="form-group full-width">
              <label>ທີ່ຢູ່:</label>
              <div class="address-group">
                <span>ບ້ານ</span>
                <input v-model="formData.guarantor.work.address.village" type="text" :readonly="!isEditing"
                  :class="{ 'has-data': formData.guarantor.work.address.village, 'readonly-field': !isEditing }" />
                <span>ເມືອງ</span>
                <input v-model="formData.guarantor.work.address.district" type="text" :readonly="!isEditing"
                  :class="{ 'has-data': formData.guarantor.work.address.district, 'readonly-field': !isEditing }" />
                <span>ແຂວງ</span>
                <input v-model="formData.guarantor.work.address.province" type="text" :readonly="!isEditing"
                  :class="{ 'has-data': formData.guarantor.work.address.province, 'readonly-field': !isEditing }" />
              </div>
            </div>
            <div class="form-group">
              <label>ຕຳແໜ່ງ:</label>
              <input v-model="formData.guarantor.work.position" type="text" :readonly="!isEditing"
                :class="{ 'has-data': formData.guarantor.work.position, 'readonly-field': !isEditing }" />
            </div>
            <div class="form-group">
              <label>ໂທລະສັບ:</label>
              <input v-model="formData.guarantor.work.phone" type="tel" :readonly="!isEditing"
                :class="{ 'has-data': formData.guarantor.work.phone, 'readonly-field': !isEditing }" />
            </div>
            <div class="form-group">
              <label>ເງິນເດືອນ:</label>
              <input v-model.number="formData.guarantor.work.salary" type="number" :readonly="!isEditing"
                :class="{ 'has-data': formData.guarantor.work.salary, 'readonly-field': !isEditing }" />
              <div class="text-xs text-gray-500 mt-1" v-if="formData.guarantor.work.salary">
                {{ formatPrice(formData.guarantor.work.salary) }} ກີບ
              </div>
            </div>
          </div>
        </section>

        <div class="consent-section">
          <p>
            <strong>ໝາຍເຫດ:</strong> ຂ້າພະເຈົ້າ, ຜູ້ກູ້ ແລະ/ຫລື ຜູ້ຄ້ຳປະກັນ (ຖ້າມີ),
            ເຫັນດີ ແລະ ຍິນຍອມໃຫ້ ສກຈບ ອິນຊີ ກວດສອບປະຫວັດໃນບົດລາຍງານ CIB ຕາມຂໍ້ມູນທີ່ໄດ້ສະແດງຂ້າງເທິງ.
          </p>
        </div>

        <p class="conclusion">ດັ່ງນັ້ນ, ຈື່ງສະເຫນີມາຍັງທ່ານພິຈາລະນາຕາມທາງຄວນດ້ວຍ</p>

        <div class="signatures-section">
          <div class="signature-box">
            <h4>ເຊັນຜູ້ຂໍກູ້ (ລູກຄ້າ):</h4>
            <div class="signature-line"></div>
            <p>
              ວັນທີ່:
              <input v-model="formData.signatures.borrowerDate" type="date" :readonly="!isEditing"
                :class="{ 'has-data': formData.signatures.borrowerDate, 'readonly-field': !isEditing }" />
            </p>
          </div>
          <div class="signature-box">
            <h4>ເຊັນຜູ້ຄ້ຳປະກັນ (ຖ້າມີ):</h4>
            <div class="signature-line"></div>
            <p>
              ວັນທີ່:
              <input v-model="formData.signatures.guarantorDate" type="date" :readonly="!isEditing"
                :class="{ 'has-data': formData.signatures.guarantorDate, 'readonly-field': !isEditing }" />
            </p>
          </div>
          <div class="signature-box">
            <h4>ພະນັກງານ (ອິນຊີ):</h4>
            <div class="signature-line"></div>
            <p>
              ວັນທີ່:
              <input v-model="formData.signatures.staffDate" type="date" :readonly="!isEditing"
                :class="{ 'has-data': formData.signatures.staffDate, 'readonly-field': !isEditing }" />
            </p>
          </div>
        </div>

        <div v-if="isEditing" class="form-actions no-print">
          <button type="submit" class="btn btn-success" :disabled="isSaving">
            <span v-if="isSaving" class="loading loading-spinner loading-xs mr-2"></span>
            {{ isSaving ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກການປ່ຽນແປງ' }}
          </button>
          <button type="button" class="btn btn-secondary" @click="cancelEdit">
            ຍົກເລີກ
          </button>
        </div>
      </form>
    </div>

    <teleport to="body">
      <div v-if="isGeneratingPDF"
        class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-white transition-opacity duration-300">
        <span class="loading loading-spinner loading-lg text-primary mb-4"></span>
        <h2 class="text-xl font-bold tracking-wide">ກຳລັງສ້າງເອກະສານ PDF...</h2>
        <p class="text-sm mt-2 opacity-80">ກະລຸນາລໍຖ້າຈັກໜ້ອຍ ລະບົບກຳລັງປະມວນຜົນຂໍ້ມູນ</p>
      </div>
    </teleport>

    <teleport to="body">
      <div v-if="showPdfPreview"
        class="fixed inset-0 z-[9998] flex items-center justify-center bg-black/80 p-4 sm:p-6 transition-opacity duration-300">
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
          <div
            class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <h3 class="text-lg font-bold flex items-center gap-2 text-gray-800 dark:text-white">
              <span class="icon-[tabler--file-type-pdf] text-error size-6"></span>
              ຕົວຢ່າງແບບຟອມຂໍກູ້
            </h3>
            <div class="flex gap-3">
              <button @click="downloadPdf" class="btn btn-primary btn-sm gap-2 shadow-sm">
                <span class="icon-[tabler--download] size-4"></span> ດາວໂຫຼດ
              </button>
              <button @click="closePdfPreview"
                class="btn btn-ghost btn-sm btn-circle text-gray-500 hover:text-error hover:bg-error/10">
                <span class="icon-[tabler--x] size-5"></span>
              </button>
            </div>
          </div>
          <div class="flex-1 w-full bg-gray-300 dark:bg-gray-800 relative">
            <iframe v-if="pdfPreviewUrl" :src="pdfPreviewUrl" class="w-full h-full border-none"
              title="PDF Preview"></iframe>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue'
import type { LoanApplication } from '@/types/loanApplication'
import apiClient from '@/api/apiclient'

// 🟢 1. ຢ່າລືມ Import ຟັງຊັນ formatPrice
import { formatPrice } from '@/utils/formatters'

// Props
const props = defineProps<{
  loanApplicationId?: number
  loanApplication?: LoanApplication | null
  isEditing?: boolean
}>()

// Emits
const emit = defineEmits<{
  (e: 'save-form', customerId: number, formData: any): void
  (e: 'form-updated', formData: any): void
  (e: 'cancel-edit'): void
  (e: 'enable-edit'): void
}>()

// State
const isLoadingForm = ref(false)
const isSaving = ref(false)
const isEditing = ref(props.isEditing || false)

const isGeneratingPDF = ref(false)
const showPdfPreview = ref(false)
const pdfPreviewUrl = ref('')

const printForm = async () => {
  if (isGeneratingPDF.value) return;
  isGeneratingPDF.value = true;

  try {
    const response = await apiClient.post('/pdf/generate-loan-pdf', {
      formData: formData,
      loanId: props.loanApplication?.loan_id || props.loanApplication?.id
    }, {
      timeout: 60000,
      responseType: 'blob'
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    pdfPreviewUrl.value = window.URL.createObjectURL(blob);
    showPdfPreview.value = true;

  } catch (error: any) {
    console.error('❌ Error generating PDF:', error);
    alert('ເກີດຂໍ້ຜິດພາດໃນການສ້າງ PDF: ' + (error.response?.data?.message || error.message));
  } finally {
    isGeneratingPDF.value = false;
  }
};

const downloadPdf = () => {
  if (!pdfPreviewUrl.value) return;
  const link = document.createElement('a');
  link.href = pdfPreviewUrl.value;
  link.setAttribute('download', `loan-request-${props.loanApplication?.loan_id || 'draft'}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

const closePdfPreview = () => {
  showPdfPreview.value = false;
  if (pdfPreviewUrl.value) {
    setTimeout(() => {
      window.URL.revokeObjectURL(pdfPreviewUrl.value);
      pdfPreviewUrl.value = '';
    }, 100);
  }
}

// 🟢 Form Data ພ້ອມ Hidden State ສຳລັບ Interest Type
const formData = reactive({
  customer: {
    fullname: '', dob: '', age: null as number | null, occupation: '', phone: '',
    address: { village: '', district: '', province: '' },
    idCard: '', censusNo: '', unit: '', issuePlace: '', issueDate: ''
  },
  work: {
    companyName: '', address: { village: '', district: '', province: '' },
    phone: '', businessType: '', businessDetail: '', durationMonths: null as number | null,
    durationYears: null as number | null, department: '', position: '', salary: null as number | null
  },
  product: {
    type: '', price: null as number | null, loanTerm: null as number | null, fee: 20000,
    monthlyPayment: null as number | null, store: '', brand: '', downPayment: null as number | null,
    interestRate: null as number | null,
    interestType: 'flat_rate',       // Hidden State
    interestRateType: 'monthly',     // Hidden State
    firstInstallment: null as number | null,
    paymentDay: null as number | null, model: '', approvedAmount: null as number | null, totalInterest: null as number | null
  },
  hasGuarantor: false, hasReference: false,
  guarantor: {
    name: '', dob: '', age: null as number | null, occupation: '', phone: '',
    address: { village: '', district: '', province: '' }, idCard: '', relationship: '', relationshipOther: '',
    work: { companyName: '', address: { village: '', district: '', province: '' }, position: '', phone: '', salary: null as number | null }
  },
  signatures: { borrowerDate: '', guarantorDate: '', staffDate: '' }
})

const hasGuarantorData = computed(() => {
  const g = formData.guarantor
  return !!(g.name || g.phone || g.idCard || g.occupation || g.work.companyName)
})

const parseAddress = (addressStr: string) => {
  if (!addressStr || typeof addressStr !== 'string') {
    return { village: '', district: '', province: '' }
  }
  const parts = addressStr.split(',').map(p => p.trim())
  return {
    village: parts[0] || '',
    district: parts[1] || '',
    province: parts[2] || ''
  }
}

// 🟢 Helper Function ສຳລັບແປງຄ່າເປັນ Number ຢ່າງປອດໄພ
const safeNumber = (val: any): number | null => {
  if (val === null || val === undefined || val === '') return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
}

// 🟢 ດຶງຂໍ້ມູນຈາກ JSON ມາໃສ່ໃນ Form ໃຫ້ຄົບຖ້ວນ
const loadDataFromProps = () => {
  if (!props.loanApplication) {
    console.log('⚠️ No loan application data')
    return
  }

  // 🟢 ໃຊ້ 'any' ເພື່ອຂ້າມຜ່ານຂໍ້ຈຳກັດຂອງ TypeScript ໃນບາງ Field ທີ່ອາດຈະມີ/ບໍ່ມີໃນ Type ເດີມ
  const loan: any = props.loanApplication;
  console.log('📝 Loading data from loan application:', loan)

  if (loan.customer) {
    formData.customer.fullname = `${loan.customer.first_name || ''} ${loan.customer.last_name || ''}`.trim()
    formData.customer.dob = loan.customer.date_of_birth || ''

    // Age
    if (loan.customer.age) {
      formData.customer.age = safeNumber(loan.customer.age);
    } else if (loan.customer.date_of_birth) {
      const birthDate = new Date(loan.customer.date_of_birth);
      const ageDifMs = Date.now() - birthDate.getTime();
      const ageDate = new Date(ageDifMs);
      formData.customer.age = Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    formData.customer.occupation = loan.customer.occupation || ''
    formData.customer.phone = loan.customer.phone || ''
    formData.customer.idCard = loan.customer.identity_number || ''
    formData.customer.censusNo = loan.customer.census_number || ''
    formData.customer.unit = loan.customer.unit || ''
    formData.customer.issuePlace = loan.customer.issue_place || ''
    formData.customer.issueDate = loan.customer.issue_date || ''

    const customerAddress = parseAddress(loan.customer.address)
    formData.customer.address.village = customerAddress.village
    formData.customer.address.district = customerAddress.district
    formData.customer.address.province = customerAddress.province

    // 🟢 ດຶງຂໍ້ມູນວຽກ (ຮອງຮັບທັງ customer_work_infos ແລະ work_info)
    const workInfo = loan.customer.customer_work_infos?.[0] || loan.customer.work_info?.[0] || {};
    if (workInfo && Object.keys(workInfo).length > 0) {
      formData.work.companyName = workInfo.company_name || ''
      formData.work.phone = workInfo.phone || ''
      formData.work.businessType = workInfo.business_type || ''
      formData.work.businessDetail = workInfo.business_detail || ''
      formData.work.durationMonths = safeNumber(workInfo.duration_months)
      formData.work.durationYears = safeNumber(workInfo.duration_years)
      formData.work.department = workInfo.department || ''
      formData.work.position = workInfo.position || ''
      formData.work.salary = safeNumber(workInfo.salary)

      const workAddr = parseAddress(workInfo.address || workInfo.location)
      formData.work.address.village = workAddr.village
      formData.work.address.district = workAddr.district
      formData.work.address.province = workAddr.province
    }
  }

  if (loan.product) {
    formData.product.type = loan.product.product_name || ''
    formData.product.price = safeNumber(loan.product.price) || safeNumber(loan.total_amount) || null
    formData.product.store = loan.product.partner?.shop_name?.toString() || ''
    formData.product.brand = loan.product.brand || ''
    formData.product.model = loan.product.model || ''
  }

  formData.product.loanTerm = safeNumber(loan.loan_period)
  formData.product.monthlyPayment = safeNumber(loan.monthly_pay)
  formData.product.interestRate = safeNumber(loan.interest_rate_at_apply)
  formData.product.downPayment = safeNumber(loan.down_payment) || 0
  formData.product.fee = safeNumber(loan.fee) || 20000
  formData.product.firstInstallment = safeNumber(loan.first_installment_amount)
  formData.product.paymentDay = safeNumber(loan.payment_day) || 1

  // 🟢 ໂຫຼດປະເພດດອກເບ້ຍມາເກັບໄວ້
  formData.product.interestType = loan.interest_type || 'flat_rate'
  formData.product.interestRateType = loan.interest_rate_type || 'monthly'

  // ຄິດໄລ່ຄ່າງວດອັດຕະໂນມັດຫຼັງຈາກໂຫຼດຂໍ້ມູນ
  calculateLoanDetails()

  const guarantor = loan.loan_guarantors?.[0]
  if (guarantor) {
    formData.hasGuarantor = true
    formData.guarantor.name = guarantor.name || ''
    formData.guarantor.phone = guarantor.phone || ''
    formData.guarantor.idCard = guarantor.identity_number || ''
    formData.guarantor.occupation = guarantor.occupation || ''
    formData.guarantor.relationship = guarantor.relationship || ''
    formData.guarantor.dob = guarantor.date_of_birth || ''
    formData.guarantor.age = guarantor.age || ''

    const guarantorAddress = parseAddress(guarantor.address || '')
    formData.guarantor.address.village = guarantorAddress.village
    formData.guarantor.address.district = guarantorAddress.district
    formData.guarantor.address.province = guarantorAddress.province

    formData.guarantor.work.companyName = guarantor.work_company_name || ''
    formData.guarantor.work.position = guarantor.work_position || ''
    formData.guarantor.work.salary = safeNumber(guarantor.work_salary)
    formData.guarantor.work.phone = guarantor.work_phone || ''

    // ຮອງຮັບທັງ work_location ແລະ work_address
    const guarantorWorkAddress = parseAddress(guarantor.work_location || guarantor.work_address || '')
    formData.guarantor.work.address.village = guarantorWorkAddress.village
    formData.guarantor.work.address.district = guarantorWorkAddress.district
    formData.guarantor.work.address.province = guarantorWorkAddress.province
  }

  // ຈັດການວັນທີໃຫ້ເປັນ Format YYYY-MM-DD
  formData.signatures.borrowerDate = loan.borrower_signature_date ? (new Date(loan.borrower_signature_date).toISOString().split('T')[0] || '') : ''
  formData.signatures.guarantorDate = loan.guarantor_signature_date ? (new Date(loan.guarantor_signature_date).toISOString().split('T')[0] || '') : ''
  formData.signatures.staffDate = loan.staff_signature_date ? (new Date(loan.staff_signature_date).toISOString().split('T')[0] || '') : ''
}

const calculateAge = () => {
  if (formData.customer.dob) {
    const today = new Date()
    const birthDate = new Date(formData.customer.dob)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    formData.customer.age = age
  }
}

// 🟢 ສູດການຄິດໄລ່ດອກເບ້ຍ ຮອງຮັບທັງ Flat ແລະ Effective
const calculateLoanDetails = () => {
  const price = formData.product.price || 0
  const downPayment = formData.product.downPayment || 0
  const loanTerm = formData.product.loanTerm || 1
  const interestRate = formData.product.interestRate || 0

  const interestType = formData.product.interestType || 'flat_rate'
  const interestRateType = formData.product.interestRateType || 'monthly'

  formData.product.approvedAmount = price - downPayment

  if (formData.product.approvedAmount > 0 && loanTerm > 0) {
    const principal = formData.product.approvedAmount

    // ແປງດອກເບ້ຍເປັນຕໍ່ເດືອນສະເໝີ
    const isYearly = interestRateType === 'yearly'
    const ratePerMonth = isYearly ? (interestRate / 12) : interestRate

    if (ratePerMonth <= 0) {
      formData.product.monthlyPayment = Math.round(principal / loanTerm)
    } else {
      let monthlyPayment = 0

      if (interestType === 'flat_rate') {
        const totalInterest = principal * (ratePerMonth / 100) * loanTerm
        monthlyPayment = (principal + totalInterest) / loanTerm
      } else if (interestType === 'effective_rate') {
        const r = ratePerMonth / 100
        const n = loanTerm
        monthlyPayment = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      }

      formData.product.monthlyPayment = Math.round(monthlyPayment)
    }

    const totalPayment = formData.product.monthlyPayment * loanTerm
    formData.product.totalInterest = totalPayment - principal
    formData.product.firstInstallment = formData.product.monthlyPayment + (formData.product.fee || 0)
  }
}

const enableEdit = () => {
  isEditing.value = true
  emit('enable-edit')
}

const saveForm = async () => {
  if (!props.loanApplication?.customer_id) {
    alert('ບໍ່ພົບຂໍ້ມູນລູກຄ້າ')
    return
  }

  isSaving.value = true
  try {
    emit('save-form', props.loanApplication.customer_id, formData)
  } catch (error) {
    alert('ເກີດຂໍ້ຜິດພາດ: ' + error)
  } finally {
    isSaving.value = false
  }
}

const cancelEdit = () => {
  emit('cancel-edit')
  isEditing.value = false
  loadDataFromProps()
}

watch(() => props.loanApplication, (newVal) => {
  if (newVal) {
    loadDataFromProps()
  }
}, { deep: true })

watch(() => props.isEditing, (newVal) => {
  isEditing.value = newVal
})

onMounted(() => {
  loadDataFromProps()
})
</script>

<style scoped>
.print-button-container { position: fixed; top: 80px; right: 20px; z-index: 100; }
.edit-button-container { position: fixed; top: 140px; right: 20px; z-index: 100; }
.request-form-container { max-width: 1200px; margin: 0 auto; padding: 20px; background: white; font-family: 'Noto Sans Lao', 'Phetsarath OT', sans-serif; }
.loan-request-form { background: white; padding: 40px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); border-radius: 8px; }
.form-header { display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 20px; text-align: center; }
.emblem { display: flex; align-items: center; justify-content: center; }
.header-text h2 { margin: 0; font-size: 18px; font-weight: bold; }
.header-text p { margin: 5px 0 0; font-size: 14px; }
.form-title { text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0 10px; text-decoration: underline; }
.form-subtitle { text-align: center; font-size: 18px; margin-bottom: 20px; }
.recipient-section { margin-bottom: 30px; line-height: 1.8; }
.form-section { margin-bottom: 30px; border: 1px solid #333; padding: 20px; }
.section-title { margin-top: 0; border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 20px; font-weight: bold; }
.subsection-title { font-weight: 600; margin: 10px 0; font-size: 14px; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
.form-group { display: flex; flex-direction: column; }
.form-group.full-width { grid-column: 1 / -1; }
.form-group label { font-weight: bold; margin-bottom: 5px; font-size: 14px; }
.required { color: red; }
.form-group input, .form-group select, .form-group textarea { padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; transition: all 0.3s ease; }
.form-group input:focus, .form-group select:focus { outline: none; border-color: #0066cc; box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1); }
.has-data { background-color: #e8f5e9 !important; border-color: #4caf50 !important; }
.readonly-field { background-color: #f5f5f5 !important; cursor: not-allowed; }
.calculated-field { background-color: #e3f2fd !important; font-weight: 600; color: #1976d2; }
.address-group { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.address-group span { white-space: nowrap; font-size: 14px; }
.address-group input { flex: 1; min-width: 100px; }
.duration-group { display: flex; gap: 10px; width: 100%; max-width: 100%; }
.duration-group input { flex: 1; min-width: 0; width: 1%; }
.product-grid { display: flex; flex-direction: column; gap: 15px; }
.product-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
.checkbox-label { display: inline-flex; align-items: center; gap: 5px; margin-right: 15px; font-weight: normal; }
.relationship-group { display: flex; gap: 15px; align-items: center; flex-wrap: wrap; }
.relationship-group label { display: flex; align-items: center; gap: 5px; font-weight: normal; }
.consent-section { margin: 20px 0; padding: 15px; background: #f9f9f9; border-left: 4px solid #333; }
.conclusion { text-align: center; font-weight: bold; margin: 20px 0; }
.signatures-section { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-top: 40px; }
.signature-box { text-align: center; }
.signature-box h4 { margin-bottom: 60px; border-bottom: 1px solid #333; padding-bottom: 10px; font-weight: bold; }
.signature-line { border-bottom: 1px solid #000; margin-bottom: 10px; }
.signature-box input { max-width: 150px; margin-left: 10px; }
.form-actions { display: flex; gap: 15px; justify-content: center; margin-top: 40px; padding: 20px; }
.btn { padding: 12px 30px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: bold; transition: all 0.3s ease; }
.btn-primary { background: #0066cc; color: white; }
.btn-primary:hover { background: #0052a3; }
.btn-warning { background: #ffc107; color: #000; }
.btn-warning:hover { background: #e0a800; }
.btn-success { background: #28a745; color: white; }
.btn-success:hover:not(:disabled) { background: #218838; transform: translateY(-2px); }
.btn-secondary { background: #6c757d; color: white; }
.btn-secondary:hover { background: #5a6268; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
@media print { .print-button-container, .edit-button-container, .form-actions, .no-print { display: none !important; } .loan-request-form { box-shadow: none; padding: 0; } .form-section { break-inside: avoid; } .signatures-section { break-inside: avoid; } }
@media (max-width: 768px) { .print-button-container { top: 10px; right: 10px; } .edit-button-container { top: 60px; right: 10px; } .loan-request-form { padding: 20px; } .product-row { grid-template-columns: 1fr; } .signatures-section { grid-template-columns: 1fr; } .address-group { flex-direction: column; align-items: stretch; } }
</style>
