<template>
  <div class="request-form-container">
    <!-- Loading State -->
    <div v-if="isLoadingForm" class="text-center py-12">
      <div class="loading loading-spinner loading-lg text-primary"></div>
      <p class="mt-2 text-gray-500">ກຳລັງໂຫຼດແບບຟອມ...</p>
    </div>

    <!-- Form Content -->
    <div v-else class="loan-request-form">
      <!-- ✅ Print Button - แสดงเสมอ (ไม่อยู่ใน no-print) -->
      <div class="print-button-container">
        <button @click="printForm" class="btn btn-primary btn-sm gap-2">
          <span class="icon-[tabler--printer] size-4"></span>
          ພິມແບບຟອມ
        </button>
      </div>

      <!-- ✅ Edit Button - แสดงเมื่อไม่ใช่โหมดแก้ไข -->
      <div v-if="!isEditing" class="edit-button-container">
        <button @click="enableEdit" class="btn btn-warning btn-sm gap-2">
          <span class="icon-[tabler--pencil] size-4"></span>
          ແກ້ໄຂຂໍ້ມູນ
        </button>
      </div>

      <!-- Header -->
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
        <!-- Section I: ຂໍ້ມູນລູກຄ້າ -->
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

        <!-- Section II: ຂໍ້ມູນບ່ອນເຮັດວຽກ -->
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
            </div>
          </div>
        </section>

        <!-- Section III: ລາຍລະອຽດສິນຄ້າ -->
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
              </div>
              <div class="form-group">
                <label>8. ວາງດາວ:</label>
                <input v-model.number="formData.product.downPayment" type="number" :readonly="!isEditing"
                  :class="{ 'has-data': formData.product.downPayment, 'readonly-field': !isEditing }"
                  @input="calculateLoanDetails" />
              </div>
              <div class="form-group">
                <label>13. ວົງເງິນອະນຸມັດ:</label>
                <input v-model.number="formData.product.approvedAmount" type="number" readonly
                  :class="{ 'has-data': formData.product.approvedAmount }" class="readonly-field calculated-field" />
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
                <label>9. ອັດຕາດອກເບ້ຍ (%):</label>
                <input v-model.number="formData.product.interestRate" type="number" step="0.01" :readonly="!isEditing"
                  :class="{ 'has-data': formData.product.interestRate, 'readonly-field': !isEditing }"
                  @input="calculateLoanDetails" />
              </div>
              <div class="form-group">
                <label>14. ຈຳນວນດອກເບ້ຍທັງຫມົດ:</label>
                <input v-model.number="formData.product.totalInterest" type="number" readonly
                  :class="{ 'has-data': formData.product.totalInterest }" class="readonly-field calculated-field" />
              </div>
            </div>
            <div class="product-row">
              <div class="form-group">
                <label>4. ຄ່າທຳນຽມ/(CIB):</label>
                <input v-model.number="formData.product.fee" type="number" :readonly="!isEditing"
                  :class="{ 'has-data': formData.product.fee, 'readonly-field': !isEditing }" />
                <small>20,000 ກີບ</small>
              </div>
              <div class="form-group">
                <label>10. ຄ່າງວດເດືອນທຳອິດ:</label>
                <input v-model.number="formData.product.firstInstallment" type="number" :readonly="!isEditing"
                  :class="{ 'has-data': formData.product.firstInstallment, 'readonly-field': !isEditing }" />
              </div>
            </div>
            <div class="product-row">
              <div class="form-group">
                <label>5. ຄ່າງວດລາຍເດືອນ: <span class="required">*</span></label>
                <input v-model.number="formData.product.monthlyPayment" type="number" required readonly
                  :class="{ 'has-data': formData.product.monthlyPayment }" class="readonly-field calculated-field" />
              </div>
              <div class="form-group">
                <label>11. ການຊຳລະຄ່າງວດທຸກໆວັນທີ່:</label>
                <input v-model.number="formData.product.paymentDay" type="number" min="1" max="31"
                  :readonly="!isEditing"
                  :class="{ 'has-data': formData.product.paymentDay, 'readonly-field': !isEditing }" />
                <small>ຂອງແຕ່ລະເດືອນ</small>
              </div>
            </div>
            <div class="product-row">
              <div class="form-group full-width">
                <label>6. ຮ້ານຄ້າທີ່ເລືອກ:</label>
                <input v-model="formData.product.store" type="text" :readonly="!isEditing"
                  :class="{ 'has-data': formData.product.store, 'readonly-field': !isEditing }" />
              </div>
            </div>
          </div>
        </section>

        <!-- Section IV: ຜູ້ຄຳ້ປະກັນ/ຜູ້ອ້າງອີງ -->
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

          <!-- ✅ แก้ไข: แสดงข้อมูลผู้ค้ำถ้ามีข้อมูลจริง ไม่ใช่แค่ checkbox -->
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
            <!-- Work Info for Guarantor -->
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
            </div>
          </div>
        </section>

        <!-- Consent -->
        <div class="consent-section">
          <p>
            <strong>ໝາຍເຫດ:</strong> ຂ້າພະເຈົ້າ, ຜູ້ກູ້ ແລະ/ຫລື ຜູ້ຄ້ຳປະກັນ (ຖ້າມີ),
            ເຫັນດີ ແລະ ຍິນຍອມໃຫ້ ສກຈບ ອິນຊີ ກວດສອບປະຫວັດໃນບົດລາຍງານ CIB
            ຕາມຂໍ້ມູນທີ່ໄດ້ສະແດງຂ້າງເທິງ.
          </p>
        </div>

        <p class="conclusion">ດັ່ງນັ້ນ, ຈື່ງສະເຫນີມາຍັງທ່ານພິຈາລະນາຕາມທາງຄວນດ້ວຍ</p>

        <!-- Signatures -->
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

        <!-- ✅ Actions - แสดงเมื่อเป็นโหมดแก้ไข -->
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed, h, createApp } from 'vue'
import type { LoanApplication } from '@/types/loanApplication'
import RequestPrintTemplate from './RequestPrintTemplate.vue' // ✅ Import template
// import { createApp, h } from 'vue' // ✅ สำหรับสร้าง print window
import html2pdf from 'html2pdf.js'
import apiClient from '@/api/apiclient'

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

// ✅ Print form with template
// const printForm = () => {
//   // ✅ วิธีที่ 1: ใช้ window.print() โดยตรง (ง่าย)
//   // window.print()

//   // ✅ วิธีที่ 2: สร้าง print window แยก (แนะนำ)
//   const printWindow = window.open('', '_blank', 'width=800,height=600')

//   if (!printWindow) {
//     alert('ກະລຸນາອະນຸຍາດ popup ເພື່ອພິມແບບຟອມ')
//     return
//   }

//   // ✅ สร้าง Vue app ใน print window
//   const printApp = createApp({
//     render: () => h(RequestPrintTemplate, {
//       formData: formData
//     })
//   })

//   // ✅ Mount และ print
//   const container = printWindow.document.createElement('div')
//   printWindow.document.body.appendChild(container)
//   printApp.mount(container)

//   // ✅ รอให้ render เสร็จแล้ว print
//   setTimeout(() => {
//     printWindow.focus()
//     printWindow.print()
//     printWindow.close()
//   }, 500)
// }
// RequestForm.vue

const printForm = async () => {
  try {
    const response = await apiClient.post('/pdf/generate-loan-pdf', {
      formData: formData,
      loanId: props.loanApplication?.loan_id || props.loanApplication?.id
    }, {
      timeout: 60000,
      responseType: 'blob' // ✅ สำคัญ: รับเป็น blob
    });

    // ✅ ดาวน์โหลด PDF
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `loan-${props.loanApplication?.loan_id || 'draft'}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

  } catch (error: any) {
    console.error('❌ Error generating PDF:', error);
    alert('ເກີດຂໍ້ຜິດພາດໃນການສ້າງ PDF: ' + (error.response?.data?.message || error.message));
  }
};



// const printForm = async () => {
//   try {
//     console.log('🖨️ Starting PDF generation...')

//     const tempDiv = document.createElement('div')
//     tempDiv.style.position = 'absolute'
//     tempDiv.style.left = '-9999px'
//     tempDiv.style.backgroundColor = '#ffffff' // ✅ Force white
//     document.body.appendChild(tempDiv)

//     const printComponent = h(RequestPrintTemplate, { formData })
//     const app = createApp({ render: () => printComponent })
//     app.mount(tempDiv)

//     await new Promise(resolve => setTimeout(resolve, 500))

//     const element = tempDiv.querySelector('.print-template') as HTMLElement
//     if (!element) throw new Error('Print template not found')

//     // ✅ CRITICAL: Force hex colors
//     const style = document.createElement('style')
//     style.textContent = `
//       .print-template,
//       .print-template *,
//       .print-template *::before,
//       .print-template *::after {
//         background-color: #ffffff !important;
//         background: #ffffff !important;
//         color: #000000 !important;
//         border-color: #000000 !important;
//         box-shadow: none !important;
//         --tw-bg-opacity: 1 !important;
//       }
//       table, tbody, tr, td, th {
//         background-color: #ffffff !important;
//         color: #000000 !important;
//       }
//     `
//     element.insertBefore(style, element.firstChild)

//     const opt = {
//       margin: 10,
//       filename: `loan-${props.loanApplication?.loan_id || 'draft'}.pdf`,
//       image: { type: 'jpeg', quality: 0.95 },
//       html2canvas: {
//         scale: 2,
//         backgroundColor: '#ffffff',
//         logging: false,
//         onclone: (clonedDoc: Document) => {
//           const el = clonedDoc.querySelector('.print-template')
//           el?.querySelectorAll('*').forEach((e: any) => {
//             e.style.backgroundColor = '#ffffff'
//             e.style.color = '#000000'
//           })
//         }
//       },
//       jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
//     }

//     await html2pdf().set(opt).from(element).save()
//     console.log('✅ PDF created!')

//     app.unmount()
//     document.body.removeChild(tempDiv)

//   } catch (error: any) {
//     console.error('❌ PDF Error:', error)
//     alert('ເກີດຂໍ້ຜິດພາດ: ' + error.message)
//   }
// }
// Form Data
const formData = reactive({
  customer: {
    fullname: '',
    dob: '',
    age: null as number | null,
    occupation: '',
    phone: '',
    address: { village: '', district: '', province: '' },
    idCard: '',
    censusNo: '',
    unit: '',
    issuePlace: '',
    issueDate: ''
  },
  work: {
    companyName: '',
    address: { village: '', district: '', province: '' },
    phone: '',
    businessType: '',
    businessDetail: '',
    durationMonths: null as number | null,
    durationYears: null as number | null,
    department: '',
    position: '',
    salary: null as number | null
  },
  product: {
    type: '',
    price: null as number | null,
    loanTerm: null as number | null,
    fee: 20000,
    monthlyPayment: null as number | null,
    store: '',
    brand: '',
    downPayment: null as number | null,
    interestRate: null as number | null,
    firstInstallment: null as number | null,
    paymentDay: null as number | null,
    model: '',
    approvedAmount: null as number | null,
    totalInterest: null as number | null
  },
  hasGuarantor: false,
  hasReference: false,
  guarantor: {
    name: '',
    dob: '',
    age: null as number | null,
    occupation: '',
    phone: '',
    address: { village: '', district: '', province: '' },
    idCard: '',
    relationship: '',
    relationshipOther: '',
    work: {
      companyName: '',
      address: { village: '', district: '', province: '' },
      position: '',
      phone: '',
      salary: null as number | null
    }
  },
  signatures: {
    borrowerDate: '',
    guarantorDate: '',
    staffDate: ''
  }
})

// ✅ Computed - ตรวจสอบว่ามีข้อมูลผู้ค้ำจริงหรือไม่
const hasGuarantorData = computed(() => {
  const g = formData.guarantor
  return !!(g.name || g.phone || g.idCard || g.occupation || g.work.companyName)
})

// ✅ Helper Function - แปลง Address String เป็น Object
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

// ✅ Load data from props - แก้ไขให้ตรงกับโครงสร้างข้อมูลจริง
const loadDataFromProps = () => {
  if (!props.loanApplication) {
    console.log('⚠️ No loan application data')
    return
  }

  const loan = props.loanApplication
  console.log('📝 Loading data from loan application:', loan)

  // ============================================
  // ✅ 1. Customer Data
  // ============================================
  if (loan.customer) {
    console.log('📝 Loading customer ', loan.customer)

    // Name
    formData.customer.fullname = `${loan.customer.first_name || ''} ${loan.customer.last_name || ''}`.trim()

    // Basic Info
    formData.customer.dob = loan.customer.date_of_birth || ''
    formData.customer.age = loan.customer.age || null
    formData.customer.occupation = loan.customer.occupation || ''
    formData.customer.phone = loan.customer.phone || ''
    formData.customer.idCard = loan.customer.identity_number || ''
    formData.customer.censusNo = loan.customer.census_number || ''
    formData.customer.unit = loan.customer.unit || ''
    formData.customer.issuePlace = loan.customer.issue_place || ''
    formData.customer.issueDate = loan.customer.issue_date || ''

    // Address - Parse from string
    const customerAddress = parseAddress(loan.customer.address)
    formData.customer.address.village = customerAddress.village
    formData.customer.address.district = customerAddress.district
    formData.customer.address.province = customerAddress.province
  }

  // ============================================
  // ✅ 2. Work Info - แก้ไข: ใช้ customer_work_infos[0]
  // ============================================
  const workInfo = loan.customer?.customer_work_infos?.[0]
  if (workInfo) {
    console.log('📝 Loading work info:', workInfo)

    formData.work.companyName = workInfo.company_name || ''
    formData.work.phone = workInfo.phone || ''
    formData.work.businessType = workInfo.business_type || ''
    formData.work.businessDetail = workInfo.business_detail || ''
    formData.work.durationMonths = workInfo.duration_months || null
    formData.work.durationYears = workInfo.duration_years || null
    formData.work.department = workInfo.department || ''
    formData.work.position = workInfo.position || ''
    formData.work.salary = parseFloat(workInfo.salary) || null

    // Work Address - Parse from string
    const workAddress = parseAddress(workInfo.address)
    formData.work.address.village = workAddress.village
    formData.work.address.district = workAddress.district
    formData.work.address.province = workAddress.province
  }

  // ============================================
  // ✅ 3. Product Data
  // ============================================
  if (loan.product) {
    console.log('📝 Loading product data:', loan.product)

    formData.product.type = loan.product.product_name || ''
    formData.product.price = parseFloat(loan.product.price) || parseFloat(loan.total_amount) || null
    formData.product.store = loan.product.partner_id?.toString() || ''
    formData.product.brand = loan.product.brand || ''
    formData.product.model = loan.product.model || ''
  }

  // Loan Details
  formData.product.loanTerm = loan.loan_period || null
  formData.product.monthlyPayment = parseFloat(loan.monthly_pay) || null
  formData.product.interestRate = parseFloat(loan.interest_rate_at_apply) || null
  formData.product.downPayment = parseFloat(loan.down_payment) || null
  formData.product.fee = parseFloat(loan.fee) || 20000
  formData.product.firstInstallment = parseFloat(loan.first_installment_amount) || null
  formData.product.paymentDay = loan.payment_day || null

  // Calculate loan details
  calculateLoanDetails()

  // ============================================
  // ✅ 4. Guarantor Data - แก้ไข: ใช้ loan_guarantors[0]
  // ============================================
  const guarantor = loan.loan_guarantors?.[0]
  if (guarantor) {
    console.log('📝 Loading guarantor data:', guarantor)

    formData.hasGuarantor = true
    formData.guarantor.name = guarantor.name || ''
    formData.guarantor.phone = guarantor.phone || ''
    formData.guarantor.idCard = guarantor.identity_number || ''
    formData.guarantor.occupation = guarantor.occupation || ''
    formData.guarantor.relationship = guarantor.relationship || ''
    formData.guarantor.dob = guarantor.date_of_birth || ''

    // Guarantor Address - Parse from string
    const guarantorAddress = parseAddress(guarantor.address)
    formData.guarantor.address.village = guarantorAddress.village
    formData.guarantor.address.district = guarantorAddress.district
    formData.guarantor.address.province = guarantorAddress.province

    // Guarantor Work Info
    formData.guarantor.work.companyName = guarantor.work_company_name || ''
    formData.guarantor.work.position = guarantor.work_position || ''
    formData.guarantor.work.salary = parseFloat(guarantor.work_salary) || null
    formData.guarantor.work.phone = guarantor.work_phone || ''

    // Parse guarantor work address
    const guarantorWorkAddress = parseAddress(guarantor.work_address)
    formData.guarantor.work.address.village = guarantorWorkAddress.village
    formData.guarantor.work.address.district = guarantorWorkAddress.district
    formData.guarantor.work.address.province = guarantorWorkAddress.province
  }

  // ============================================
  // ✅ 5. Signatures
  // ============================================
  formData.signatures.borrowerDate = loan.borrower_signature_date || ''
  formData.signatures.guarantorDate = loan.guarantor_signature_date || ''
  formData.signatures.staffDate = loan.staff_signature_date || ''

  console.log('✅ Form data loaded successfully')
  console.log('✅ Final formData:', formData)
}

// Calculate age from DOB
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

// Calculate loan details
const calculateLoanDetails = () => {
  const price = formData.product.price || 0
  const downPayment = formData.product.downPayment || 0
  const loanTerm = formData.product.loanTerm || 1
  const interestRate = formData.product.interestRate || 0


  // วงเงินอนุมัติ = ราคา - เงินดาว
  formData.product.approvedAmount = price - downPayment

  if (formData.product.approvedAmount > 0 && loanTerm > 0) {
    const loanAmount = formData.product.approvedAmount

    // 1. ຄິດໄລ່ດອກເບ້ຍລວມ (Flat Rate)
    const theoreticalTotalInterest = loanAmount * (interestRate / 100) * (loanTerm / 12)

    // 2. ຄິດໄລ່ຄ່າງວດຕໍ່ເດືອນ
    const monthlyPayment = (loanAmount + theoreticalTotalInterest) / loanTerm
    formData.product.monthlyPayment = Math.round(monthlyPayment)

    // 3. ຄິດໄລ່ດອກເບ້ຍຕົວຈິງຈາກຍອດຊຳລະລວມ
    const totalPayment = formData.product.monthlyPayment * loanTerm
    formData.product.totalInterest = totalPayment - loanAmount

    formData.product.firstInstallment = monthlyPayment + formData.product.fee
  }
}

// ✅ Enable Edit Mode
const enableEdit = () => {
  isEditing.value = true
  emit('enable-edit')
}

// Save form
const saveForm = async () => {
  if (!props.loanApplication?.customer_id) {
    console.error('❌ Missing customer_id')
    alert('ບໍ່ພົບຂໍ້ມູນລູກຄ້າ')
    return
  }

  isSaving.value = true
  try {
    console.log('💾 Saving form ', formData)
    emit('save-form', props.loanApplication.customer_id, formData)
  } catch (error) {
    console.error('Error saving form:', error)
    alert('ເກີດຂໍ້ຜິດພາດ: ' + error)
  } finally {
    isSaving.value = false
  }
}

// Cancel edit
const cancelEdit = () => {
  emit('cancel-edit')
  isEditing.value = false
  loadDataFromProps() // Reset form data
}



// Watch for prop changes
watch(() => props.loanApplication, (newVal) => {
  if (newVal) {
    console.log('🔄 Loan application changed, reloading...')
    loadDataFromProps()
  }
}, { deep: true })

watch(() => props.isEditing, (newVal) => {
  isEditing.value = newVal
})

// Mounted
onMounted(() => {
  console.log('🎯 RequestForm mounted')
  loadDataFromProps()
})
</script>

<style scoped>
/* Print Button - Fixed Position */
.print-button-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 100;
}

/* Edit Button - Fixed Position */
.edit-button-container {
  position: fixed;
  top: 140px;
  right: 20px;
  z-index: 100;
}

/* Form Container */
.request-form-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  font-family: 'Noto Sans Lao', 'Phetsarath OT', sans-serif;
}

.loan-request-form {
  background: white;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

/* Header */
.form-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
  text-align: center;
}

.emblem {
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-text h2 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.header-text p {
  margin: 5px 0 0;
  font-size: 14px;
}

/* Title */
.form-title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin: 20px 0 10px;
  text-decoration: underline;
}

.form-subtitle {
  text-align: center;
  font-size: 18px;
  margin-bottom: 20px;
}

/* Recipient */
.recipient-section {
  margin-bottom: 30px;
  line-height: 1.8;
}

/* Sections */
.form-section {
  margin-bottom: 30px;
  border: 1px solid #333;
  padding: 20px;
}

.section-title {
  margin-top: 0;
  border-bottom: 1px solid #333;
  padding-bottom: 10px;
  margin-bottom: 20px;
  font-weight: bold;
}

.subsection-title {
  font-weight: 600;
  margin: 10px 0;
  font-size: 14px;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: bold;
  margin-bottom: 5px;
  font-size: 14px;
}

.required {
  color: red;
}

/* Inputs */
.form-group input,
.form-group select,
.form-group textarea {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #0066cc;
  box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1);
}

/* Has Data - Green highlight */
.has-data {
  background-color: #e8f5e9 !important;
  border-color: #4caf50 !important;
}

/* Readonly Fields */
.readonly-field {
  background-color: #f5f5f5 !important;
  cursor: not-allowed;
}

/* Calculated Fields */
.calculated-field {
  background-color: #e3f2fd !important;
  font-weight: 600;
  color: #1976d2;
}

/* Address Group */
.address-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.address-group span {
  white-space: nowrap;
  font-size: 14px;
}

.address-group input {
  flex: 1;
  min-width: 100px;
}

/* Duration Group - แก้ไขให้ไม่ล้น */
.duration-group {
  display: flex;
  gap: 10px;
  width: 100%;
  /* ✅ จำกัดความกว้างให้เต็ม parent */
  max-width: 100%;
  /* ✅ ป้องกันการขยายเกิน */
}

.duration-group input {
  flex: 1;
  /* ✅ แบ่งพื้นที่เท่าๆ กัน */
  min-width: 0;
  /* ✅ ป้องกันการขยายเกิน */
  width: 1%;
  /* ✅ บังคับให้หดตาม container */
}

/* Product Grid */
.product-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.product-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

/* Checkbox */
.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-right: 15px;
  font-weight: normal;
}

/* Relationship Group */
.relationship-group {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.relationship-group label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: normal;
}

/* Consent */
.consent-section {
  margin: 20px 0;
  padding: 15px;
  background: #f9f9f9;
  border-left: 4px solid #333;
}

/* Conclusion */
.conclusion {
  text-align: center;
  font-weight: bold;
  margin: 20px 0;
}

/* Signatures */
.signatures-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-top: 40px;
}

.signature-box {
  text-align: center;
}

.signature-box h4 {
  margin-bottom: 60px;
  border-bottom: 1px solid #333;
  padding-bottom: 10px;
  font-weight: bold;
}

.signature-line {
  border-bottom: 1px solid #000;
  margin-bottom: 10px;
}

.signature-box input {
  max-width: 150px;
  margin-left: 10px;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 40px;
  padding: 20px;
}

.btn {
  padding: 12px 30px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #0066cc;
  color: white;
}

.btn-primary:hover {
  background: #0052a3;
}

.btn-warning {
  background: #ffc107;
  color: #000;
}

.btn-warning:hover {
  background: #e0a800;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Print Styles */
@media print {

  .print-button-container,
  .edit-button-container,
  .form-actions,
  .no-print {
    display: none !important;
  }

  .loan-request-form {
    box-shadow: none;
    padding: 0;
  }

  .form-section {
    break-inside: avoid;
  }

  .signatures-section {
    break-inside: avoid;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .print-button-container {
    top: 10px;
    right: 10px;
  }

  .edit-button-container {
    top: 60px;
    right: 10px;
  }

  .loan-request-form {
    padding: 20px;
  }

  .product-row {
    grid-template-columns: 1fr;
  }

  .signatures-section {
    grid-template-columns: 1fr;
  }

  .address-group {
    flex-direction: column;
    align-items: stretch;
  }

}

/* ✅ เพิ่ม: CSS สำหรับ html2pdf (ใช้สีแบบเก่า) */
</style>
