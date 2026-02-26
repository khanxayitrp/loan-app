<template>
  <div class="loan-contract-form-container">
    <div v-if="isLoadingForm" class="text-center py-12">
      <div class="loading loading-spinner loading-lg text-primary"></div>
      <p class="mt-2 text-gray-500">ກຳລັງໂຫຼດແບບຟອມ...</p>
    </div>

    <div v-else class="loan-contract-form">
      <div class="print-button-container">
        <button @click="printForm" class="btn btn-primary btn-sm gap-2 shadow-md">
          <span class="icon-[tabler--printer] size-4"></span>
          ພິມສັນຍາ
        </button>
      </div>

      <div v-if="!isEditing" class="edit-button-container">
        <button @click="enableEdit" class="btn btn-warning btn-sm gap-2 shadow-md">
          <span class="icon-[tabler--pencil] size-4"></span>
          ແກ້ໄຂຂໍ້ມູນ
        </button>
      </div>

      <div class="contract-header">
        <div class="header-logo-section">
          <img src="/image/LOGO INSEE.png" alt="INSEE Logo" class="logo-img" />
          <div class="state-motto">
            ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ<br />
            ສັນຕິພາບ ເອກະລາດ ປະຊາທິປະໄຕ ເອກະພາບ ວັດທະນາຖາວອນ
          </div>
        </div>

        <h1 class="contract-title">ຂໍ້ມູນສັນຍາກູ້ຢືມປະເພດສິນເຊື່ອຊົມໃຊ້</h1>

        <div
          class="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 flex flex-wrap gap-6 justify-center items-center">
          <div class="flex items-center gap-2">
            <span class="font-bold">ເລກທີສັນຍາ:</span>
            <input v-model="formData.contractNumber" type="text" :readonly="!isEditing"
              class="input input-sm input-bordered w-40 text-center font-semibold" placeholder="_______" />
          </div>
          <div class="flex items-center gap-2">
            <span class="font-bold">ນະຄອນຫຼວງວຽງຈັນ, ວັນທີ:</span>
            <input v-model="formData.contractDate.day" type="text" :readonly="!isEditing"
              class="input input-sm input-bordered w-14 text-center" placeholder="DD" />
            <span>/</span>
            <input v-model="formData.contractDate.month" type="text" :readonly="!isEditing"
              class="input input-sm input-bordered w-14 text-center" placeholder="MM" />
            <span>/</span>
            <input v-model="formData.contractDate.year" type="text" :readonly="!isEditing"
              class="input input-sm input-bordered w-20 text-center" placeholder="YYYY" />
          </div>
        </div>

        <div class="flex justify-center gap-6 mb-8">
          <label class="cursor-pointer flex items-center gap-2">
            <input type="checkbox" v-model="formData.productType.gold" :disabled="!isEditing"
              class="checkbox checkbox-primary" />
            <span class="font-medium">ສິນຄ້າຄຳ</span>
          </label>
          <label class="cursor-pointer flex items-center gap-2">
            <input type="checkbox" v-model="formData.productType.general" :disabled="!isEditing"
              class="checkbox checkbox-primary" />
            <span class="font-medium">ສິນຄ້າທົ່ວໄປ</span>
          </label>
          <label class="cursor-pointer flex items-center gap-2">
            <input type="checkbox" v-model="formData.productType.motorcycle" :disabled="!isEditing"
              class="checkbox checkbox-primary" />
            <span class="font-medium">ສິນຄ້າລົດຈັກ</span>
          </label>
        </div>
      </div>

      <form @submit.prevent="saveForm" class="space-y-8">
        <section class="form-section">
          <h3 class="section-title">I. ຂໍ້ມູນສ່ວນຕົວລູກຄ້າ</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="form-control lg:col-span-2">
              <label class="label"><span class="label-text font-bold">ຊື່ ແລະ ນາມສະກຸນ:</span></label>
              <input v-model="formData.customer.fullname" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ວັນເດືອນປີເກີດ:</span></label>
              <input v-model="formData.customer.dob" type="date" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ເບີໂທລະສັບມືຖື:</span></label>
              <input v-model="formData.customer.phone" type="tel" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ເພດ:</span></label>
              <select v-model="formData.customer.gender" :disabled="!isEditing"
                class="select select-sm select-bordered w-full">
                <option value="">ເລືອກ</option>
                <option value="male">ຊາຍ</option>
                <option value="female">ຍິງ</option>
              </select>
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ສະຖານະພາບ:</span></label>
              <input v-model="formData.customer.maritalStatus" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ອາຊີບ:</span></label>
              <input v-model="formData.customer.occupation" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ສາຍພົວພັນ:</span></label>
              <input v-model="formData.customer.relationship" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ບັດປະຈຳຕົວ/Passport:</span></label>
              <input v-model="formData.customer.idCard" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ວັນເດືອນປີອອກ:</span></label>
              <input v-model="formData.customer.idCardIssueDate" type="date" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ປຶ້ມສຳມະໂນຄົວ ເລກທີ:</span></label>
              <input v-model="formData.customer.censusBook" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ວັນເດືອນປີໝົດອາຍຸ:</span></label>
              <input v-model="formData.customer.idCardExpiryDate" type="date" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>

            <div class="form-control lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-3 rounded mt-2">
              <div class="md:col-span-2">
                <label class="label"><span class="label-text font-bold">ສະຖານທີ່ອອກເອກະສານ:</span></label>
                <input v-model="formData.customer.idCardPlace" type="text" :readonly="!isEditing"
                  class="input input-sm input-bordered w-full" />
              </div>
              <div>
                <label class="label"><span class="label-text font-bold">ເຮືອນເລກທີ:</span></label>
                <input v-model="formData.customer.houseNumber" type="text" :readonly="!isEditing"
                  class="input input-sm input-bordered w-full" />
              </div>
              <div>
                <label class="label"><span class="label-text font-bold">ໜ່ວຍ:</span></label>
                <input v-model="formData.customer.unit" type="text" :readonly="!isEditing"
                  class="input input-sm input-bordered w-full" />
              </div>
              <div>
                <label class="label"><span class="label-text font-bold">ບ້ານ:</span></label>
                <input v-model="formData.customer.address.village" type="text" :readonly="!isEditing"
                  class="input input-sm input-bordered w-full" />
              </div>
              <div>
                <label class="label"><span class="label-text font-bold">ເມືອງ:</span></label>
                <input v-model="formData.customer.address.district" type="text" :readonly="!isEditing"
                  class="input input-sm input-bordered w-full" />
              </div>
              <div>
                <label class="label"><span class="label-text font-bold">ແຂວງ:</span></label>
                <input v-model="formData.customer.address.province" type="text" :readonly="!isEditing"
                  class="input input-sm input-bordered w-full" />
              </div>
              <div>
                <label class="label"><span class="label-text font-bold">ຈຳນວນປີທີ່ອາໄສ:</span></label>
                <input v-model.number="formData.customer.residenceYears" type="number" :readonly="!isEditing"
                  class="input input-sm input-bordered w-full" />
              </div>
              <div class="md:col-span-2">
                <label class="label"><span class="label-text font-bold">ອາໄສຢູ່ກັບ:</span></label>
                <input v-model="formData.customer.liveWith" type="text" :readonly="!isEditing"
                  class="input input-sm input-bordered w-full" />
              </div>
              <div class="md:col-span-2">
                <label class="label"><span class="label-text font-bold">ສະຖານະການຢູ່ອາໄສ:</span></label>
                <select v-model="formData.customer.residenceStatus" :disabled="!isEditing"
                  class="select select-sm select-bordered w-full">
                  <option value="">ເລືອກ</option>
                  <option value="own">ເຮືອນຕົວເອງ</option>
                  <option value="rent">ເຊົ່າ</option>
                  <option value="family">ຢູ່ກັບຄອບຄົວ</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section class="form-section">
          <h3 class="section-title">II. ຂໍ້ມູນຫ້ອງການບ່ອນເຮັດວຽກ ລູກຄ້າ</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="form-control lg:col-span-2">
              <label class="label"><span class="label-text font-bold">ຊື່ອົງການ/ບໍລິສັດ:</span></label>
              <input v-model="formData.work.companyName" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
            <div class="form-control lg:col-span-2">
              <label class="label"><span class="label-text font-bold">ປະເພດຂອງທຸລະກິດ:</span></label>
              <input v-model="formData.work.businessType" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ບ້ານ:</span></label>
              <input v-model="formData.work.address.village" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ເມືອງ:</span></label>
              <input v-model="formData.work.address.district" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
            <div class="form-control lg:col-span-2">
              <label class="label"><span class="label-text font-bold">ແຂວງ:</span></label>
              <input v-model="formData.work.address.province" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ປີການເຮັດວຽກ:</span></label>
              <input v-model.number="formData.work.workYears" type="number" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ຕຳແໜ່ງ:</span></label>
              <input v-model="formData.work.position" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
            <div class="form-control lg:col-span-2">
              <label class="label"><span class="label-text font-bold">ເງິນເດືອນ/ລາຍຮັບຕໍ່ເດືອນ (ກີບ):</span></label>
              <input v-model.number="formData.work.salary" type="number" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ມື້ເງິນເດືອນອອກ (ວັນທີ):</span></label>
              <input v-model.number="formData.work.salaryDay" type="number" min="1" max="31" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ພະນັກງານທັງໝົດຈຳນວນ:</span></label>
              <input v-model.number="formData.work.totalEmployees" type="number" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
            <div class="form-control lg:col-span-2">
              <label class="label"><span class="label-text font-bold">ລາຍໄດ້ອື່ນໆ (ຖ້າມີ):</span></label>
              <input v-model.number="formData.work.otherIncome" type="number" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
            <div class="form-control lg:col-span-4">
              <label class="label"><span class="label-text font-bold">ແຫຼ່ງທີ່ມາຂອງລາຍໄດ້ອື່ນໆ:</span></label>
              <input v-model="formData.work.otherIncomeSource" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
          </div>
        </section>

        <section class="form-section">
          <h3 class="section-title">III. ຕາຕະລາງລາຍລະອຽດຂອງສິນຄ້າກູ້</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="form-control lg:col-span-2">
              <label class="label"><span class="label-text font-bold">ລາຍລະອຽດສິນຄ້າ:</span></label>
              <input v-model="formData.product.description" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ປະເພດສິນຄ້າ:</span></label>
              <input v-model="formData.product.type" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ຍີ່ຫໍ້ສິນຄ້າ:</span></label>
              <input v-model="formData.product.brand" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ລຸ້ນສິນຄ້າ:</span></label>
              <input v-model="formData.product.model" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ລາຄາສິນຄ້າ (ກີບ):</span></label>
              <input v-model.number="formData.product.price" type="number" :readonly="!isEditing"
                @input="calculateLoanDetails" class="input input-sm input-bordered w-full" />
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ເງິນວາງດາວ (ກີບ):</span></label>
              <input v-model.number="formData.product.downPayment" type="number" :readonly="!isEditing"
                @input="calculateLoanDetails" class="input input-sm input-bordered w-full" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold text-primary">ວົງເງິນອະນຸມັດ (ກີບ):</span></label>
              <input v-model.number="formData.product.approvedAmount" type="number" readonly
                class="input input-sm input-bordered w-full bg-blue-50 text-blue-700 font-bold" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ອັດຕາດອກເບ້ຍ (%):</span></label>
              <input v-model.number="formData.product.interestRate" type="number" step="0.01" :readonly="!isEditing"
                @input="calculateLoanDetails" class="input input-sm input-bordered w-full" />
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ຈຳນວນງວດທີ່ກູ້ (ເດືອນ):</span></label>
              <input v-model.number="formData.product.loanTerm" type="number" :readonly="!isEditing"
                @input="calculateLoanDetails" class="input input-sm input-bordered w-full" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold text-primary">ຈຳນວນດອກເບ້ຍທັງໝົດ
                  (ກີບ):</span></label>
              <input v-model.number="formData.product.totalInterest" type="number" readonly
                class="input input-sm input-bordered w-full bg-blue-50 text-blue-700 font-bold" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ຄ່າທຳນຽມ CIB/ອື່ນໆ (ກີບ):</span></label>
              <input v-model.number="formData.product.fee" type="number" :readonly="!isEditing"
                @input="calculateLoanDetails" class="input input-sm input-bordered w-full" />
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-bold text-primary">ຄ່າງວດລາຍເດືອນ (ກີບ):</span></label>
              <input v-model.number="formData.product.monthlyPayment" type="number" readonly
                class="input input-sm input-bordered w-full bg-blue-50 text-blue-700 font-bold" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold text-primary">ຄ່າງວດເດືອນທຳອິດ
                  (+ຄ່າທຳນຽມ):</span></label>
              <input v-model.number="formData.product.firstInstallment" type="number" readonly
                class="input input-sm input-bordered w-full bg-blue-50 text-blue-700 font-bold" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ມື້ກຳນົດການຊຳລະ (ທຸກວັນທີ):</span></label>
              <input v-model.number="formData.product.paymentDay" type="number" min="1" max="31" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>

            <template v-if="formData.productType.motorcycle">
              <div class="form-control">
                <label class="label"><span class="label-text font-bold">ເລກຈັກ (ລົດຈັກ):</span></label>
                <input v-model="formData.product.motorcycle.engineNo" type="text" :readonly="!isEditing"
                  class="input input-sm input-bordered w-full" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text font-bold">ສີລົດ (ລົດຈັກ):</span></label>
                <input v-model="formData.product.motorcycle.color" type="text" :readonly="!isEditing"
                  class="input input-sm input-bordered w-full" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text font-bold">ເລກຖັງ (ລົດຈັກ):</span></label>
                <input v-model="formData.product.motorcycle.chassisNo" type="text" :readonly="!isEditing"
                  class="input input-sm input-bordered w-full" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text font-bold">ຄ່າປະກັນໄພ ລົດຈັກ (ກີບ):</span></label>
                <input v-model.number="formData.product.motorcycle.insurance" type="number" :readonly="!isEditing"
                  class="input input-sm input-bordered w-full" />
              </div>
            </template>
          </div>
        </section>

        <section class="form-section">
          <h3 class="section-title">IV. ຂໍ້ມູນຮ້ານຄ້າຕົວແທນ</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ຊື່ຮ້ານຄ້າຕົວແທນ:</span></label>
              <input v-model="formData.shop.name" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ສາຂາ:</span></label>
              <input v-model="formData.shop.branch" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ລະຫັດຮ້ານຄ້າ:</span></label>
              <input v-model="formData.shop.code" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
          </div>
        </section>

        <section class="form-section">
          <h3 class="section-title flex items-center gap-4 flex-wrap">
            V. ຂໍ້ມູນສ່ວນຕົວຂອງ
            <label class="cursor-pointer flex items-center gap-2 text-sm font-normal bg-gray-100 px-2 py-1 rounded">
              <input type="checkbox" v-model="formData.hasGuarantor" :disabled="!isEditing"
                class="checkbox checkbox-sm" />
              ຜູ້ຄ້ຳປະກັນ
            </label>
            <label class="cursor-pointer flex items-center gap-2 text-sm font-normal bg-gray-100 px-2 py-1 rounded">
              <input type="checkbox" v-model="formData.hasReference" :disabled="!isEditing"
                class="checkbox checkbox-sm" />
              ຜູ້ອ້າງອີງ
            </label>
            <span class="text-sm font-normal text-gray-500">(ຖ້າມີ)</span>
          </h3>

          <div v-if="formData.hasGuarantor || formData.hasReference"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border">
            <div class="form-control lg:col-span-2">
              <label class="label"><span class="label-text font-bold">ຊື່ ແລະ ນາມສະກຸນ:</span></label>
              <input v-model="formData.guarantor.fullname" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full bg-white" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ວັນເດືອນປີເກີດ:</span></label>
              <input v-model="formData.guarantor.dob" type="date" :readonly="!isEditing"
                class="input input-sm input-bordered w-full bg-white" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ເບີໂທລະສັບມືຖື:</span></label>
              <input v-model="formData.guarantor.phone" type="tel" :readonly="!isEditing"
                class="input input-sm input-bordered w-full bg-white" />
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ເພດ:</span></label>
              <select v-model="formData.guarantor.gender" :disabled="!isEditing"
                class="select select-sm select-bordered w-full bg-white">
                <option value="">ເລືອກ</option>
                <option value="male">ຊາຍ</option>
                <option value="female">ຍິງ</option>
              </select>
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ອາຊີບ:</span></label>
              <input v-model="formData.guarantor.occupation" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full bg-white" />
            </div>
            <div class="form-control lg:col-span-2">
              <label class="label"><span class="label-text font-bold">ສາຍພົວພັນ:</span></label>
              <input v-model="formData.guarantor.relationship" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full bg-white" />
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ບັດປະຈຳຕົວ/Passport:</span></label>
              <input v-model="formData.guarantor.idCard" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full bg-white" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ວັນເດືອນປີອອກ:</span></label>
              <input v-model="formData.guarantor.idCardIssueDate" type="date" :readonly="!isEditing"
                class="input input-sm input-bordered w-full bg-white" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ປຶ້ມສຳມະໂນຄົວ ເລກທີ:</span></label>
              <input v-model="formData.guarantor.censusBook" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full bg-white" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ວັນເດືອນປີອອກ:</span></label>
              <input v-model="formData.guarantor.censusBookIssueDate" type="date" :readonly="!isEditing"
                class="input input-sm input-bordered w-full bg-white" />
            </div>

            <div
              class="form-control lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-3 rounded mt-2 border">
              <div class="md:col-span-2">
                <label class="label"><span class="label-text font-bold">ສະຖານທີ່ອອກເອກະສານ:</span></label>
                <input v-model="formData.guarantor.idCardPlace" type="text" :readonly="!isEditing"
                  class="input input-sm input-bordered w-full" />
              </div>
              <div>
                <label class="label"><span class="label-text font-bold">ເຮືອນເລກທີ:</span></label>
                <input v-model="formData.guarantor.houseNumber" type="text" :readonly="!isEditing"
                  class="input input-sm input-bordered w-full" />
              </div>
              <div>
                <label class="label"><span class="label-text font-bold">ບ້ານ:</span></label>
                <input v-model="formData.guarantor.address.village" type="text" :readonly="!isEditing"
                  class="input input-sm input-bordered w-full" />
              </div>
              <div>
                <label class="label"><span class="label-text font-bold">ເມືອງ:</span></label>
                <input v-model="formData.guarantor.address.district" type="text" :readonly="!isEditing"
                  class="input input-sm input-bordered w-full" />
              </div>
              <div class="md:col-span-2">
                <label class="label"><span class="label-text font-bold">ແຂວງ:</span></label>
                <input v-model="formData.guarantor.address.province" type="text" :readonly="!isEditing"
                  class="input input-sm input-bordered w-full" />
              </div>
              <div>
                <label class="label"><span class="label-text font-bold">ຈຳນວນປີທີ່ອາໄສ:</span></label>
                <input v-model.number="formData.guarantor.residenceYears" type="number" :readonly="!isEditing"
                  class="input input-sm input-bordered w-full" />
              </div>
              <div class="md:col-span-2">
                <label class="label"><span class="label-text font-bold">ອາໄສຢູ່ກັບ:</span></label>
                <input v-model="formData.guarantor.liveWith" type="text" :readonly="!isEditing"
                  class="input input-sm input-bordered w-full" />
              </div>
              <div class="md:col-span-2">
                <label class="label"><span class="label-text font-bold">ສະຖານະການຢູ່ອາໄສ:</span></label>
                <input v-model="formData.guarantor.residenceStatus" type="text" :readonly="!isEditing"
                  class="input input-sm input-bordered w-full" />
              </div>
            </div>
          </div>
          <p v-else class="text-gray-500 italic mt-4 ml-2">ບໍ່ມີຂໍ້ມູນຜູ້ຄ້ຳປະກັນ/ອ້າງອີງ</p>
        </section>

        <section v-if="formData.hasGuarantor || formData.hasReference" class="form-section">
          <h3 class="section-title">VI. ຂໍ້ມູນຫ້ອງການບ່ອນເຮັດວຽກຂອງຜູ້ຄ້ຳປະກັນ</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="form-control lg:col-span-2">
              <label class="label"><span class="label-text font-bold">ຊື່ອົງການ/ບໍລິສັດ:</span></label>
              <input v-model="formData.guarantorWork.companyName" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
            <div class="form-control lg:col-span-2">
              <label class="label"><span class="label-text font-bold">ປະເພດຂອງທຸລະກິດ:</span></label>
              <input v-model="formData.guarantorWork.businessType" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ບ້ານ:</span></label>
              <input v-model="formData.guarantorWork.address.village" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ເມືອງ:</span></label>
              <input v-model="formData.guarantorWork.address.district" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
            <div class="form-control lg:col-span-2">
              <label class="label"><span class="label-text font-bold">ແຂວງ:</span></label>
              <input v-model="formData.guarantorWork.address.province" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ປີການເຮັດວຽກ:</span></label>
              <input v-model.number="formData.guarantorWork.workYears" type="number" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ຕຳແໜ່ງ:</span></label>
              <input v-model="formData.guarantorWork.position" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
            <div class="form-control lg:col-span-2">
              <label class="label"><span class="label-text font-bold">ເງິນເດືອນ/ລາຍຮັບຕໍ່ເດືອນ (ກີບ):</span></label>
              <input v-model.number="formData.guarantorWork.salary" type="number" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ມື້ເງິນເດືອນອອກ (ວັນທີ):</span></label>
              <input v-model.number="formData.guarantorWork.salaryDay" type="number" min="1" max="31"
                :readonly="!isEditing" class="input input-sm input-bordered w-full" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ພະນັກງານທັງໝົດຈຳນວນ:</span></label>
              <input v-model.number="formData.guarantorWork.totalEmployees" type="number" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
            <div class="form-control lg:col-span-2">
              <label class="label"><span class="label-text font-bold">ລາຍໄດ້ອື່ນໆ (ຖ້າມີ):</span></label>
              <input v-model.number="formData.guarantorWork.otherIncome" type="number" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
            <div class="form-control lg:col-span-4">
              <label class="label"><span class="label-text font-bold">ແຫຼ່ງທີ່ມາຂອງລາຍໄດ້ອື່ນໆ:</span></label>
              <input v-model="formData.guarantorWork.otherIncomeSource" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
          </div>
        </section>

        <div v-if="isEditing" class="flex justify-end gap-4 mt-8 pt-4 border-t">
          <button type="button" class="btn btn-ghost" @click="cancelEdit">
            ຍົກເລີກ
          </button>
          <button type="submit" class="btn btn-success text-white" :disabled="isSaving">
            <span v-if="isSaving" class="loading loading-spinner loading-xs"></span>
            {{ isSaving ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກການແກ້ໄຂ' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import apiClient from '@/api/apiclient'

const props = defineProps<{
  loanContractId?: number
  loanContract?: any | null
  isEditing?: boolean
}>()

const emit = defineEmits<{
  (e: 'save-form', customerId: number, formData: any): void
  (e: 'form-updated', formData: any): void
  (e: 'cancel-edit'): void
  (e: 'enable-edit'): void
}>()

const isLoadingForm = ref(false)
const isSaving = ref(false)
const isEditing = ref(props.isEditing || false)

const formData = reactive({
  contractNumber: '',
  contractDate: { day: '', month: '', year: '' },
  productType: { gold: false, general: false, motorcycle: false },
  customer: {
    fullname: '', dob: '', phone: '', gender: '', maritalStatus: '',
    idCard: '', idCardIssueDate: '', idCardExpiryDate: '', idCardPlace: '',
    censusBook: '', houseNumber: '', unit: '',
    address: { village: '', district: '', province: '' },
    residenceYears: null as number | null, liveWith: '', residenceStatus: '',
    occupation: '', relationship: ''
  },
  work: {
    companyName: '', businessType: '',
    address: { village: '', district: '', province: '' },
    workYears: null as number | null, position: '', salary: null as number | null,
    salaryDay: null as number | null, totalEmployees: null as number | null,
    otherIncome: null as number | null, otherIncomeSource: ''
  },
  product: {
    description: '', type: '', brand: '', model: '',
    price: null as number | null, downPayment: null as number | null,
    approvedAmount: null as number | null, interestRate: null as number | null,
    loanTerm: null as number | null, totalInterest: null as number | null,
    fee: 20000, monthlyPayment: null as number | null,
    firstInstallment: null as number | null, paymentDay: null as number | null,
    motorcycle: { engineNo: '', chassisNo: '', color: '', insurance: null as number | null }
  },
  shop: { name: '', branch: '', code: '' },
  hasGuarantor: false,
  hasReference: false,
  guarantor: {
    fullname: '', dob: '', phone: '', gender: '', idCard: '', idCardIssueDate: '',
    censusBook: '', censusBookIssueDate: '', idCardPlace: '', houseNumber: '',
    address: { village: '', district: '', province: '' },
    residenceYears: null as number | null, liveWith: '', residenceStatus: '',
    occupation: '', relationship: ''
  },
  guarantorWork: {
    companyName: '', businessType: '',
    address: { village: '', district: '', province: '' },
    workYears: null as number | null, position: '', salary: null as number | null,
    salaryDay: null as number | null, totalEmployees: null as number | null,
    otherIncome: null as number | null, otherIncomeSource: ''
  }
})

const calculateLoanDetails = () => {
  const price = formData.product.price || 0
  const downPayment = formData.product.downPayment || 0
  const loanTerm = formData.product.loanTerm || 1
  const interestRate = formData.product.interestRate || 0

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

    formData.product.firstInstallment = formData.product.monthlyPayment + (formData.product.fee || 0)
  }
}

const printForm = async () => {
  try {
    const response = await apiClient.post('/pdf/generate-loan-contract', {
      formData: formData,
      contractId: props.loanContract?.id || props.loanContractId
    }, { timeout: 60000, responseType: 'blob' })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `contract-${props.loanContract?.id || 'draft'}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error: any) {
    alert('ເກີດຂໍ້ຜິດພາດໃນການສ້າງ PDF: ' + (error.response?.data?.message || error.message))
  }
}

const enableEdit = () => {
  isEditing.value = true
  emit('enable-edit')
}

const saveForm = async () => {
  if (!props.loanContract?.customer_id) return alert('ບໍ່ພົບຂໍ້ມູນລູກຄ້າ')
  isSaving.value = true
  try {
    emit('save-form', props.loanContract.customer_id, formData)
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

const loadDataFromProps = () => {
  if (!props.loanContract) return
  const contract = props.loanContract

  // Load Contract Info
  formData.contractNumber = contract.contract_number || ''
  if (contract.contract_date) {
    const date = new Date(contract.contract_date)
    formData.contractDate.day = date.getDate().toString().padStart(2, '0')
    formData.contractDate.month = (date.getMonth() + 1).toString().padStart(2, '0')
    formData.contractDate.year = date.getFullYear().toString()
  }

  // Load Customer
  if (contract.customer) {
    formData.customer.fullname = `${contract.customer.first_name || ''} ${contract.customer.last_name || ''}`.trim()
    formData.customer.dob = contract.customer.date_of_birth || ''
    formData.customer.phone = contract.customer.phone || ''
    formData.customer.idCard = contract.customer.identity_number || ''
    formData.customer.address.village = contract.customer.village || ''
    formData.customer.address.district = contract.customer.district || ''
    formData.customer.address.province = contract.customer.province || ''
    formData.customer.occupation = contract.customer.occupation || ''
    formData.customer.gender = contract.customer.gender || ''
    formData.customer.maritalStatus = contract.customer.marital_status || ''
  }

  // Load Work
  if (contract.work) {
    formData.work.companyName = contract.work.company_name || ''
    formData.work.businessType = contract.work.business_type || ''
    formData.work.position = contract.work.position || ''
    formData.work.salary = parseFloat(contract.work.salary) || null
    formData.work.address.village = contract.work.village || ''
    formData.work.address.district = contract.work.district || ''
    formData.work.address.province = contract.work.province || ''
  }

  // Load Product
  if (contract.product) {
    formData.product.description = contract.product.description || ''
    formData.product.type = contract.product.type || ''
    formData.product.brand = contract.product.brand || ''
    formData.product.model = contract.product.model || ''
    formData.product.price = parseFloat(contract.product.price) || null
    formData.product.downPayment = parseFloat(contract.down_payment) || null
    formData.product.loanTerm = contract.loan_period || null
    formData.product.interestRate = parseFloat(contract.interest_rate) || null
    formData.product.fee = parseFloat(contract.fee) || 20000
    formData.product.paymentDay = contract.payment_day || null
  }

  // Load Shop
  if (contract.shop) {
    formData.shop.name = contract.shop.name || ''
    formData.shop.branch = contract.shop.branch || ''
    formData.shop.code = contract.shop.code || ''
  }

  // Load Guarantor
  if (contract.guarantor) {
    formData.hasGuarantor = true
    formData.guarantor.fullname = contract.guarantor.name || ''
    formData.guarantor.phone = contract.guarantor.phone || ''
    formData.guarantor.idCard = contract.guarantor.identity_number || ''
    formData.guarantor.relationship = contract.guarantor.relationship || ''
    if (contract.guarantor.work) {
      formData.guarantorWork.companyName = contract.guarantor.work.company_name || ''
    }
  }

  calculateLoanDetails()
}

watch(() => props.loanContract, (newVal) => { if (newVal) loadDataFromProps() }, { deep: true })
watch(() => props.isEditing, (newVal) => { isEditing.value = newVal })

onMounted(() => { loadDataFromProps() })
</script>

<style scoped>
.loan-contract-form-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Noto Sans Lao', 'Phetsarath OT', sans-serif;
}

.loan-contract-form {
  background: white;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

/* Print Button Layout Restored */
.print-button-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 100;
}

/* Edit Button Layout Restored */
.edit-button-container {
  position: fixed;
  top: 130px;
  right: 20px;
  z-index: 100;
}

.contract-header {
  text-align: center;
  margin-bottom: 30px;
}

.header-logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.logo-img {
  width: 70px;
  height: 70px;
  object-fit: contain;
}

.state-motto {
  font-weight: bold;
  font-size: 14px;
  line-height: 1.5;
}

.contract-title {
  font-size: 22px;
  font-weight: bold;
  margin: 20px 0;
  text-decoration: underline;
  color: #1f2937;
}

.form-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e5e7eb;
  color: #374151;
}

@media print {

  .print-button-container,
  .edit-button-container {
    display: none !important;
  }
}
</style>
