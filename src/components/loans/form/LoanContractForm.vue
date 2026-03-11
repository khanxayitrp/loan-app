<template>
  <div class="loan-contract-form-container">
    <div v-if="isLoadingForm" class="text-center py-12">
      <div class="loading loading-spinner loading-lg text-primary"></div>
      <p class="mt-2 text-gray-500">ກຳລັງໂຫຼດແບບຟອມ...</p>
    </div>

    <div v-else class="loan-contract-form">
      <div class="print-button-container">
        <!-- <button @click="printForm" class="btn btn-primary btn-sm gap-2 shadow-md">
          <span class="icon-[tabler--printer] size-4"></span>
          ພິມສັນຍາ
        </button> -->
        <button @click="printForm" class="btn btn-primary btn-sm gap-2 shadow-md" :disabled="isGeneratingPDF">
          <span v-if="isGeneratingPDF" class="loading loading-spinner loading-xs"></span>
          <span v-else class="icon-[tabler--printer] size-4"></span>
          {{ isGeneratingPDF ? 'ກຳລັງສ້າງ...' : 'ພິມສັນຍາ / Preview' }}
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
              <!-- <input v-model="formData.customer.maritalStatus" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" /> -->
              <select v-model="formData.customer.maritalStatus" :disabled="!isEditing"
                class="select select-sm select-bordered w-full">
                <option value="">ເລືອກ</option>
                <option value="single">ໂສດ</option>
                <option value="married">ແຕ່ງງານແລ້ວ</option>
                <option value="divorced">ຢ່າຮ້າງ</option>
              </select>
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ອາຊີບ:</span></label>
              <input v-model="formData.customer.occupation" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div>
            <!-- <div class="form-control">
              <label class="label"><span class="label-text font-bold">ສາຍພົວພັນ:</span></label>
              <input v-model="formData.customer.relationship" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" />
            </div> -->

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
                <input v-model="formData.customer.censusAuthorizeBy" type="text" :readonly="!isEditing"
                  class="input input-sm input-bordered w-full" />
              </div>
              <!-- <div class="md:col-span-2">
                <label class="label"><span class="label-text font-bold">ຜູ້ອະນຸມັດປຶ້ມສຳມະໂນຄົວ:</span></label>
                <input v-model="formData.customer.censusAuthorizeBy" type="text" :readonly="!isEditing"
                  class="input input-sm input-bordered w-full" />
              </div> -->
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
              <!-- <input v-model="formData.product.type" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full" /> -->
              <select v-model="formData.product.type" :disabled="!isEditing"
                class="select select-sm select-bordered w-full">
                <option value="">ເລືອກ</option>
                <option value="ສິນຄ້າຄຳ">ສິນຄ້າຄຳ</option>
                <option value="ສິນຄ້າທົ່ວໄປ">ສິນຄ້າທົ່ວໄປ</option>
                <option value="ສິນຄ້າລົດຈັກ">ສິນຄ້າລົດຈັກ</option>
              </select>
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
                <input v-model="formData.product.motorcycle.motorId" type="text" :readonly="!isEditing"
                  class="input input-sm input-bordered w-full" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text font-bold">ສີລົດ (ລົດຈັກ):</span></label>
                <input v-model="formData.product.motorcycle.motorColor" type="text" :readonly="!isEditing"
                  class="input input-sm input-bordered w-full" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text font-bold">ເລກຖັງ (ລົດຈັກ):</span></label>
                <input v-model="formData.product.motorcycle.tankNumber" type="text" :readonly="!isEditing"
                  class="input input-sm input-bordered w-full" />
              </div>
              <!-- <div class="form-control">
                <label class="label"><span class="label-text font-bold">ຄ່າປະກັນໄພ ລົດຈັກ (ກີບ):</span></label>
                <input v-model.number="formData.product.motorcycle.insurance" type="number" :readonly="!isEditing"
                  class="input input-sm input-bordered w-full" />
              </div> -->
              <div class="form-control">
                <label class="label"><span class="label-text font-bold">ໄລຍະຮັບປະກັນລົດ (ເດືອນ):</span></label>
                <input v-model.number="formData.product.motorcycle.motorWarranty" type="number" :readonly="!isEditing"
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
              <label class="label"><span class="label-text font-bold">ສະຖານະພາບ:</span></label>
              <!-- <input v-model="formData.guarantor.maritalStatus" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full bg-white" /> -->
              <select v-model="formData.guarantor.maritalStatus" :disabled="!isEditing"
                class="select select-sm select-bordered w-full">
                <option value="">ເລືອກ</option>
                <option value="single">ໂສດ</option>
                <option value="married">ແຕ່ງງານແລ້ວ</option>
                <option value="divorced">ຢ່າຮ້າງ</option>
              </select>
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">ອາຊີບ:</span></label>
              <input v-model="formData.guarantor.occupation" type="text" :readonly="!isEditing"
                class="input input-sm input-bordered w-full bg-white" />
            </div>
            <div class="form-control">
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
                <input v-model="formData.guarantor.censusAuthorizeBy" type="text" :readonly="!isEditing"
                  class="input input-sm input-bordered w-full" />
              </div>
              <!-- <div class="md:col-span-2">
                <label class="label"><span class="label-text font-bold">ຜູ້ອະນຸມັດປຶ້ມສຳມະໂນຄົວ:</span></label>
                <input v-model="formData.guarantor.censusAuthorizeBy" type="text" :readonly="!isEditing"
                  class="input input-sm input-bordered w-full" />
              </div> -->
              <div>
                <label class="label"><span class="label-text font-bold">ເຮືອນເລກທີ:</span></label>
                <input v-model="formData.guarantor.houseNumber" type="text" :readonly="!isEditing"
                  class="input input-sm input-bordered w-full" />
              </div>
              <div>
                <label class="label"><span class="label-text font-bold">ໜ່ວຍ:</span></label>
                <input v-model="formData.guarantor.unit" type="text" :readonly="!isEditing"
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
                <select v-model="formData.guarantor.residenceStatus" :disabled="!isEditing"
                  class="select select-sm select-bordered w-full">
                  <option value="">ເລືອກ</option>
                  <option value="own">ເຮືອນຕົວເອງ</option>
                  <option value="rent">ເຊົ່າ</option>
                  <option value="family">ຢູ່ກັບຄອບຄົວ</option>
                </select>
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
            ຕົວຢ່າງສັນຍາກູ້ຢືມ
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
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import apiClient from '@/api/apiclient'

const props = defineProps<{
  loanContractId?: number
  loanApplication?: any | null
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
    censusBook: '', censusAuthorizeBy: '', houseNumber: '', unit: '',
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
    motorcycle: { motorId: '', tankNumber: '', motorColor: '', insurance: null as number | null, motorWarranty: null as number | null }
  },
  shop: { name: '', branch: '', code: '' },
  hasGuarantor: false,
  hasReference: false,
  guarantor: {
    fullname: '', dob: '', phone: '', gender: '', maritalStatus: '', idCard: '', idCardIssueDate: '',
    censusBook: '', censusBookIssueDate: '', idCardPlace: '', censusAuthorizeBy: '', houseNumber: '', unit: '',
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
    const theoreticalTotalInterest = loanAmount * (interestRate / 100) * (loanTerm / 12)
    const monthlyPayment = (loanAmount + theoreticalTotalInterest) / loanTerm
    formData.product.monthlyPayment = Math.round(monthlyPayment)
    const totalPayment = formData.product.monthlyPayment * loanTerm
    formData.product.totalInterest = totalPayment - loanAmount
    formData.product.firstInstallment = formData.product.monthlyPayment + (formData.product.fee || 0)
  }
}
const isGeneratingPDF = ref(false)
const showPdfPreview = ref(false)
const pdfPreviewUrl = ref('')

// 🟢 ແກ້ໄຂ Function printForm ໃໝ່
const printForm = async () => {
  if (isGeneratingPDF.value) return; // ປ້ອງກັນການກົດຊ້ຳ

  isGeneratingPDF.value = true; // ເປີດໜ້າຕ່າງ Loading

  try {
    const response = await apiClient.post('/pdf/generate-loan-contract', {
      formData: formData,
      contractId: props.loanContract?.id || props.loanContractId || props.loanApplication?.id
    }, { timeout: 60000, responseType: 'blob' })

    // ສ້າງ URL ຈາກ Blob (PDF Data)
    const blob = new Blob([response.data], { type: 'application/pdf' });
    pdfPreviewUrl.value = window.URL.createObjectURL(blob);

    // ເປີດ Modal Preview
    showPdfPreview.value = true;

  } catch (error: any) {
    console.error('PDF Generation Error:', error);
    alert('ເກີດຂໍ້ຜິດພາດໃນການສ້າງ PDF: ' + (error.response?.data?.message || error.message))
  } finally {
    isGeneratingPDF.value = false; // ປິດໜ້າຕ່າງ Loading
  }
}

// 🟢 ເພີ່ມ Function ສຳລັບການດາວໂຫຼດຈາກໜ້າ Preview
const downloadPdf = () => {
  if (!pdfPreviewUrl.value) return;

  const link = document.createElement('a');
  link.href = pdfPreviewUrl.value;

  const fileId = props.loanContract?.id || props.loanContractId || props.loanApplication?.id || 'draft';
  link.setAttribute('download', `contract-${fileId}.pdf`);

  document.body.appendChild(link);
  link.click();
  link.remove();
}

// 🟢 ເພີ່ມ Function ສຳລັບປິດໜ້າ Preview ແລະ ຄືນຄ່າໜ່ວຍຄວາມຈຳ (Memory)
const closePdfPreview = () => {
  showPdfPreview.value = false;

  // ລຶບ Object URL ເພື່ອບໍ່ໃຫ້ກິນ Memory ຂອງ Browser
  if (pdfPreviewUrl.value) {
    setTimeout(() => {
      window.URL.revokeObjectURL(pdfPreviewUrl.value);
      pdfPreviewUrl.value = '';
    }, 100);
  }
}
// const printForm = async () => {
//   try {
//     const response = await apiClient.post('/pdf/generate-loan-contract', {
//       formData: formData,
//       contractId: props.loanContract?.id || props.loanContractId || props.loanApplication?.id
//     }, { timeout: 60000, responseType: 'blob' })

//     const url = window.URL.createObjectURL(new Blob([response.data]))
//     const link = document.createElement('a')
//     link.href = url
//     link.setAttribute('download', `contract-${props.loanContract?.id || 'draft'}.pdf`)
//     document.body.appendChild(link)
//     link.click()
//     link.remove()
//     window.URL.revokeObjectURL(url)
//   } catch (error: any) {
//     alert('ເກີດຂໍ້ຜິດພາດໃນການສ້າງ PDF: ' + (error.response?.data?.message || error.message))
//   }
// }

const enableEdit = () => {
  isEditing.value = true
  emit('enable-edit')
}

const saveForm = async () => {
  // หา customer_id ตัวล่าสุดไม่ว่าจะมาจากไหน
  const customerId = props.loanContract?.customer_id
    || props.loanContract?.data?.customer_id
    || props.loanApplication?.customer_id;

  if (!customerId) return alert('ບໍ່ພົບຂໍ້ມູນລູກຄ້າ')

  isSaving.value = true
  try {
    emit('save-form', customerId, formData)
  } catch (error: any) {
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

// -----------------------------------------------------
// ฟังก์ชันหลัก: โหลดข้อมูล (พิจารณา Contract ก่อน Application)
// -----------------------------------------------------
const loadDataFromProps = () => {
  console.log('🔄 [LoanContractForm] Checking Props...', {
    loanContract: props.loanContract,
    loanApplication: props.loanApplication
  });

  // 1. เช็คเชิงลึกว่า loanContract มีข้อมูลจริงไหม (หา property 'id')
  let contractData = null;
  let hasRealContract = false;

  if (props.loanContract) {
    if (props.loanContract.data?.data?.id) {
      contractData = props.loanContract.data.data;
      hasRealContract = true;
    } else if (props.loanContract.data?.id) {
      contractData = props.loanContract.data;
      hasRealContract = true;
    } else if (props.loanContract.id) {
      contractData = props.loanContract;
      hasRealContract = true;
    }
  }

  // 2. ตัดสินใจว่าจะใช้ Source ไหน
  const isFromContract = hasRealContract;
  const sourceData = isFromContract ? contractData : props.loanApplication;

  if (!sourceData) {
    console.warn('⚠️ [LoanContractForm] ບໍ່ພົບຂໍ້ມູນທັງ Contract ແລະ Application');
    return;
  }

  console.log(`✅ [Decision] ດຶງຂໍ້ມູນຈາກ: ${isFromContract ? 'LoanContract (ມີສັນຍາແລ້ວ)' : 'LoanApplication (ໃຊ້ໃບຄຳຂໍແທນ)'}`);
  console.log('📦 [Source Data]:', sourceData);

  // -----------------------------------------------------
  // กรณี 1: ดึงจาก Loan Contract (ฐานข้อมูลสัญญากู้)
  // -----------------------------------------------------
  if (isFromContract) {
    formData.contractNumber = sourceData.loan_contract_number || sourceData.contract_number || ''
    const sDate = sourceData.contract_date || sourceData.createdAt || sourceData.created_at
    if (sDate) {
      const d = new Date(sDate)
      formData.contractDate.day = d.getDate().toString().padStart(2, '0')
      formData.contractDate.month = (d.getMonth() + 1).toString().padStart(2, '0')
      formData.contractDate.year = d.getFullYear().toString()
    }

    formData.customer.fullname = sourceData.cus_full_name || ''
    formData.customer.gender = sourceData.cus_sex || ''
    formData.customer.dob = sourceData.cus_date_of_birth || ''
    formData.customer.phone = sourceData.cus_phone || ''
    formData.customer.maritalStatus = sourceData.cus_marital_status || ''
    formData.customer.idCard = sourceData.cus_id_pass_number || ''
    formData.customer.idCardIssueDate = sourceData.cus_id_pass_date || ''
    formData.customer.censusBook = sourceData.cus_census_number || ''
    formData.customer.censusAuthorizeBy = sourceData.cus_census_authorize_by || ''
    formData.customer.houseNumber = sourceData.cus_house_number || ''
    formData.customer.unit = sourceData.cus_unit || ''
    formData.customer.residenceYears = sourceData.cus_lived_year || null
    formData.customer.liveWith = sourceData.cus_lived_with || ''
    formData.customer.residenceStatus = sourceData.cus_lived_situation || ''

    const addr = parseAddress(sourceData.cus_address)
    formData.customer.address.village = addr.village
    formData.customer.address.district = addr.district
    formData.customer.address.province = addr.province

    formData.work.companyName = sourceData.cus_company_name || ''
    formData.work.businessType = sourceData.cus_company_businessType || ''
    formData.work.workYears = sourceData.cus_company_workYear || null
    formData.work.position = sourceData.cus_position || ''
    formData.work.salary = sourceData.cus_income || null
    formData.work.salaryDay = sourceData.cus_payroll_date || null
    formData.work.totalEmployees = sourceData.cus_company_emp_number || null
    formData.work.otherIncome = sourceData.cus_income_other || null
    formData.work.otherIncomeSource = sourceData.cus_income_other_source || ''

    const workAddr = parseAddress(sourceData.cus_company_location)
    formData.work.address.village = workAddr.village
    formData.work.address.district = workAddr.district
    formData.work.address.province = workAddr.province

    formData.product.description = sourceData.product_detail || ''
    formData.product.brand = sourceData.product_brand || ''
    formData.product.model = sourceData.product_model || ''
    formData.product.price = parseFloat(sourceData.product_price) || null
    formData.product.downPayment = parseFloat(sourceData.product_down_payment) || null
    formData.product.approvedAmount = parseFloat(sourceData.total_amount) || null
    formData.product.interestRate = parseFloat(sourceData.interest_rate_at_apply) || null
    formData.product.loanTerm = sourceData.loan_period || null
    formData.product.totalInterest = parseFloat(sourceData.total_interest) || null
    formData.product.fee = parseFloat(sourceData.fee as string) || 0;
    formData.product.monthlyPayment = parseFloat(sourceData.monthly_pay) || null
    formData.product.firstInstallment = parseFloat(sourceData.first_installment_amount) || null
    formData.product.paymentDay = sourceData.payment_day || null

    formData.shop.branch = sourceData.shop_branch || ''
    formData.shop.code = sourceData.shop_id || ''

    if (sourceData.ref_name) {
      formData.hasGuarantor = true
      formData.guarantor.fullname = sourceData.ref_name || ''
      formData.guarantor.dob = sourceData.ref_date_of_birth || ''
      formData.guarantor.phone = sourceData.ref_phone || ''
      formData.guarantor.gender = sourceData.ref_sex || ''
      formData.guarantor.maritalStatus = sourceData.ref_marital_status || ''
      formData.guarantor.idCard = sourceData.ref_id_pass_number || ''
      formData.guarantor.idCardIssueDate = sourceData.ref_id_pass_date || ''
      formData.guarantor.censusBook = sourceData.ref_census_number || ''
      formData.guarantor.censusBookIssueDate = sourceData.ref_census_created || ''
      formData.guarantor.censusAuthorizeBy = sourceData.ref_census_authorize_by || ''
      formData.guarantor.houseNumber = sourceData.ref_house_number || ''
      formData.guarantor.unit = sourceData.ref_unit || ''
      formData.guarantor.residenceYears = sourceData.ref_lived_year || null
      formData.guarantor.liveWith = sourceData.ref_lived_with || ''
      formData.guarantor.residenceStatus = sourceData.ref_lived_situation || ''
      formData.guarantor.occupation = sourceData.ref_occupation || ''
      formData.guarantor.relationship = sourceData.ref_relationship || ''

      const refAddr = parseAddress(sourceData.ref_address)
      formData.guarantor.address.village = refAddr.village
      formData.guarantor.address.district = refAddr.district
      formData.guarantor.address.province = refAddr.province

      formData.guarantorWork.companyName = sourceData.ref_company_name || ''
      formData.guarantorWork.businessType = sourceData.ref_company_businessType || ''
      formData.guarantorWork.workYears = sourceData.ref_company_workYear || null
      formData.guarantorWork.position = sourceData.ref_position || ''
      formData.guarantorWork.salary = sourceData.ref_income || null
      formData.guarantorWork.salaryDay = sourceData.ref_payroll_date || null
      formData.guarantorWork.totalEmployees = sourceData.ref_company_emp_number || null
      formData.guarantorWork.otherIncome = sourceData.ref_income_other || null
      formData.guarantorWork.otherIncomeSource = sourceData.ref_income_other_source || ''

      const refWorkAddr = parseAddress(sourceData.ref_company_location)
      formData.guarantorWork.address.village = refWorkAddr.village
      formData.guarantorWork.address.district = refWorkAddr.district
      formData.guarantorWork.address.province = refWorkAddr.province
    }
  }
  // -----------------------------------------------------
  // กรณี 2: Fallback ดึงจาก Loan Application
  // -----------------------------------------------------
  else {
    formData.contractNumber = sourceData.loan_id || ''
    const sDate = sourceData.createdAt || sourceData.created_at
    if (sDate) {
      const d = new Date(sDate)
      formData.contractDate.day = d.getDate().toString().padStart(2, '0')
      formData.contractDate.month = (d.getMonth() + 1).toString().padStart(2, '0')
      formData.contractDate.year = d.getFullYear().toString()
    }

    if (sourceData.customer) {
      formData.customer.fullname = `${sourceData.customer.first_name || ''} ${sourceData.customer.last_name || ''}`.trim()
      formData.customer.dob = sourceData.customer.date_of_birth || ''
      formData.customer.phone = sourceData.customer.phone || ''
      formData.customer.idCard = sourceData.customer.identity_number || ''
      formData.customer.censusBook = sourceData.customer.census_number || ''
      formData.customer.idCardPlace = sourceData.customer.issue_place || ''
      formData.customer.idCardIssueDate = sourceData.customer.issue_date || ''
      formData.customer.occupation = sourceData.customer.occupation || ''
      formData.customer.unit = sourceData.customer.unit || ''

      const addr = parseAddress(sourceData.customer.address)
      formData.customer.address.village = addr.village
      formData.customer.address.district = addr.district
      formData.customer.address.province = addr.province

      const workInfo = sourceData.customer.customer_work_infos?.[0];
      if (workInfo) {
        formData.work.companyName = workInfo.company_name || ''
        formData.work.businessType = workInfo.business_type || ''
        formData.work.position = workInfo.position || ''
        formData.work.salary = parseFloat(workInfo.salary) || null
        formData.work.workYears = workInfo.duration_years || null

        const workAddr = parseAddress(workInfo.address)
        formData.work.address.village = workAddr.village
        formData.work.address.district = workAddr.district
        formData.work.address.province = workAddr.province
      }
    }

    if (sourceData.product) {
      formData.product.description = sourceData.product.product_name || ''
      formData.product.brand = sourceData.product.brand || ''
      formData.product.model = sourceData.product.model || ''
      formData.product.price = parseFloat(sourceData.product.price) || null
      formData.product.interestRate = parseFloat(sourceData.product.interest_rate || sourceData.interest_rate_at_apply) || null

      if (sourceData.product.partner) {
        formData.shop.name = sourceData.product.partner.shop_name || ''
        formData.shop.branch = sourceData.product.partner.address || ''
        formData.shop.code = sourceData.product.partner.shop_id || ''
      }
    }

    // ดึงค่าอื่นๆ ที่อยู่ในระดับ Application โดยตรง
    formData.product.downPayment = parseFloat(sourceData.down_payment) || 0
    formData.product.approvedAmount = parseFloat(sourceData.total_amount) || 0
    formData.product.loanTerm = sourceData.loan_period || 1
    formData.product.monthlyPayment = parseFloat(sourceData.monthly_pay) || 0
    formData.product.fee = parseFloat(sourceData.fee) || 20000
    formData.product.paymentDay = sourceData.payment_day || 1

    const guarantor = sourceData.loan_guarantors?.[0]
    if (guarantor) {
      formData.hasGuarantor = true
      formData.guarantor.fullname = guarantor.name || ''
      formData.guarantor.phone = guarantor.phone || ''
      formData.guarantor.idCard = guarantor.identity_number || ''
      formData.guarantor.occupation = guarantor.occupation || ''
      formData.guarantor.relationship = guarantor.relationship || ''

      const gAddr = parseAddress(guarantor.address)
      formData.guarantor.address.village = gAddr.village
      formData.guarantor.address.district = gAddr.district
      formData.guarantor.address.province = gAddr.province

      formData.guarantorWork.companyName = guarantor.work_company_name || ''
      formData.guarantorWork.position = guarantor.work_position || ''
      formData.guarantorWork.salary = parseFloat(guarantor.work_salary) || null

      const gWorkAddr = parseAddress(guarantor.work_location)
      formData.guarantorWork.address.village = gWorkAddr.village
      formData.guarantorWork.address.district = gWorkAddr.district
      formData.guarantorWork.address.province = gWorkAddr.province
    }
  }

  // -----------------------------------------------------
  // เช็คประเภทรถมอเตอร์ไซค์
  // -----------------------------------------------------
  formData.product.motorcycle.motorId = sourceData.motorId || sourceData.motor_id || ''
  formData.product.motorcycle.motorColor = sourceData.motorColor || sourceData.motor_color || ''
  formData.product.motorcycle.tankNumber = sourceData.tankNumber || sourceData.tank_number || ''
  formData.product.motorcycle.motorWarranty = sourceData.motorWarranty || sourceData.motor_warranty || null

  if (formData.product.motorcycle.motorId || formData.product.motorcycle.tankNumber) {
    formData.productType.motorcycle = true;
    formData.productType.gold = false;
    formData.productType.general = false;
  } else {
    formData.productType.general = true;
  }

  calculateLoanDetails()
}

watch(
  () => [props.loanContract, props.loanApplication],
  () => {
    loadDataFromProps()
  },
  { deep: true, immediate: true }
)

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

.print-button-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 100;
}

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
