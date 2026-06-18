<template>
  <teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">

        <div class="flex justify-between items-center p-5 border-b border-base-200 bg-base-100/50 rounded-t-2xl">
          <h3 class="text-xl font-bold flex items-center gap-2 text-primary">
            <span class="icon-[tabler--info-square-rounded] size-6"></span>
            ຄູ່ມືການຄຳນວນຄະແນນສິນເຊື່ອ (Credit Scoring Guide)
          </h3>
          <button @click="close" class="btn btn-ghost btn-sm btn-circle text-gray-500 hover:bg-gray-200">
            <span class="icon-[tabler--x] size-5"></span>
          </button>
        </div>

        <div class="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50 dark:bg-gray-900">
          <div class="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-200 shadow-sm">
            <table class="table table-sm w-full text-sm">
              <thead>
                <tr class="bg-primary text-white text-sm">
                  <th class="py-3 px-4 w-1/4">ປັດໄຈປະເມີນ (Factor)</th>
                  <th class="py-3 px-4 w-2/5">ເງື່ອນໄຂ (Condition)</th>
                  <th class="py-3 px-2 text-center border-l border-white/20">ຄະແນນ <br><span class="text-xs font-normal opacity-80">ທົ່ວໄປ/ລົດຈັກ</span></th>
                  <th class="py-3 px-2 text-center border-l border-white/20">ຄະແນນ <br><span class="text-xs font-normal text-amber-200">ສິນຄ້າຄຳ</span></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr>
                  <td rowspan="5" class="align-top font-bold text-gray-700 bg-gray-50/50 px-4 py-3 border-r">1. ອາຍຸ (Age)</td>
                  <td class="px-4 py-2">25 - 35 ປີ</td>
                  <td class="text-center font-bold text-success border-l">20</td>
                  <td class="text-center font-bold text-success border-l bg-amber-50/30">15</td>
                </tr>
                <tr>
                  <td class="px-4 py-2">36 - 45 ປີ</td>
                  <td class="text-center font-bold text-success border-l">18</td>
                  <td class="text-center font-bold text-success border-l bg-amber-50/30">13</td>
                </tr>
                <tr>
                  <td class="px-4 py-2">46 - 55 ປີ</td>
                  <td class="text-center font-bold text-warning border-l">12</td>
                  <td class="text-center font-bold text-warning border-l bg-amber-50/30">12</td>
                </tr>
                <tr>
                  <td class="px-4 py-2">18 - 24 ປີ</td>
                  <td class="text-center font-bold text-warning border-l">10</td>
                  <td class="text-center font-bold text-warning border-l bg-amber-50/30">10</td>
                </tr>
                <tr>
                  <td class="px-4 py-2 border-b">56 ປີ ຂຶ້ນໄປ</td>
                  <td class="text-center font-bold text-error border-l">8</td>
                  <td class="text-center font-bold text-error border-l bg-amber-50/30">8</td>
                </tr>

                <tr>
                  <td rowspan="4" class="align-top font-bold text-gray-700 bg-gray-50/50 px-4 py-3 border-r">2. ອາຍຸການເຮັດວຽກ (Job Tenure)</td>
                  <td class="px-4 py-2">≥ 3 ປີ ຂຶ້ນໄປ</td>
                  <td class="text-center font-bold text-success border-l">20</td>
                  <td class="text-center font-bold text-success border-l bg-amber-50/30">15</td>
                </tr>
                <tr>
                  <td class="px-4 py-2">1 - 3 ປີ</td>
                  <td class="text-center font-bold text-success border-l">15</td>
                  <td class="text-center font-bold text-success border-l bg-amber-50/30">12</td>
                </tr>
                <tr>
                  <td class="px-4 py-2">6 - 12 ເດືອນ</td>
                  <td class="text-center font-bold text-warning border-l">10</td>
                  <td class="text-center font-bold text-warning border-l bg-amber-50/30">10</td>
                </tr>
                <tr>
                  <td class="px-4 py-2 border-b">< 6 ເດືອນ</td>
                  <td class="text-center font-bold text-error border-l">5</td>
                  <td class="text-center font-bold text-error border-l bg-amber-50/30">5</td>
                </tr>

                <tr>
                  <td rowspan="5" class="align-top font-bold text-gray-700 bg-gray-50/50 px-4 py-3 border-r">3. ພາລະໜີ້ສິນ (DSR)</td>
                  <td class="px-4 py-2">≤ 30% ຂອງລາຍຮັບ</td>
                  <td class="text-center font-bold text-success border-l">25</td>
                  <td class="text-center font-bold text-success border-l bg-amber-50/30">25</td>
                </tr>
                <tr><td class="px-4 py-2">≤ 40% ຂອງລາຍຮັບ</td><td class="text-center font-bold text-success border-l">20</td><td class="text-center font-bold text-success border-l bg-amber-50/30">20</td></tr>
                <tr><td class="px-4 py-2">≤ 50% ຂອງລາຍຮັບ</td><td class="text-center font-bold text-warning border-l">15</td><td class="text-center font-bold text-warning border-l bg-amber-50/30">15</td></tr>
                <tr><td class="px-4 py-2">≤ 60% ຂອງລາຍຮັບ</td><td class="text-center font-bold text-warning border-l">10</td><td class="text-center font-bold text-warning border-l bg-amber-50/30">10</td></tr>
                <tr><td class="px-4 py-2 border-b">> 60% ຂອງລາຍຮັບ</td><td class="text-center font-bold text-error border-l">5</td><td class="text-center font-bold text-error border-l bg-amber-50/30">5</td></tr>

                <tr>
                  <td rowspan="5" class="align-top font-bold text-gray-700 bg-gray-50/50 px-4 py-3 border-r">4. ປະຫວັດສິນເຊື່ອ (CIB)</td>
                  <td class="px-4 py-2">ດີຫຼາຍ (ບໍ່ມີຊັກຊ້າ)</td>
                  <td class="text-center font-bold text-success border-l">20</td>
                  <td class="text-center font-bold text-success border-l bg-amber-50/30">20</td>
                </tr>
                <tr><td class="px-4 py-2">ດີ (ຊັກຊ້າ < 30 ວັນ)</td><td class="text-center font-bold text-success border-l">15</td><td class="text-center font-bold text-success border-l bg-amber-50/30">15</td></tr>
                <tr><td class="px-4 py-2">ປານກາງ (ຊັກຊ້າ 30-60 ວັນ)</td><td class="text-center font-bold text-warning border-l">10</td><td class="text-center font-bold text-warning border-l bg-amber-50/30">10</td></tr>
                <tr><td class="px-4 py-2">ສ່ຽງສູງ (ຊັກຊ້າ 60-90 ວັນ)</td><td class="text-center font-bold text-error border-l">5</td><td class="text-center font-bold text-error border-l bg-amber-50/30">5</td></tr>
                <tr><td class="px-4 py-2 border-b">ບໍ່ດີ (> 90 ວັນ / Blacklist)</td><td class="text-center font-bold text-error border-l">0</td><td class="text-center font-bold text-error border-l bg-amber-50/30">0</td></tr>

                <tr>
                  <td rowspan="4" class="align-top font-bold text-gray-700 bg-gray-50/50 px-4 py-3 border-r">
                    5. ເງິນວາງດາວ<br>(Down Payment)<br>
                    <span class="text-xs font-normal text-primary mt-1 block">ສຳລັບທົ່ວໄປ/ລົດຈັກ</span>
                  </td>
                  <td class="px-4 py-2">≥ 30% ຂຶ້ນໄປ</td>
                  <td class="text-center font-bold text-success border-l">15</td>
                  <td rowspan="4" class="text-center text-gray-400 border-l bg-gray-100 italic align-middle">ບໍ່ນຳໃຊ້</td>
                </tr>
                <tr><td class="px-4 py-2">≥ 20%</td><td class="text-center font-bold text-success border-l">12</td></tr>
                <tr><td class="px-4 py-2">≥ 10%</td><td class="text-center font-bold text-warning border-l">8</td></tr>
                <tr><td class="px-4 py-2 border-b">< 10%</td><td class="text-center font-bold text-error border-l">5</td></tr>

                <tr>
                  <td rowspan="5" class="align-top font-bold text-amber-700 bg-amber-50/50 px-4 py-3 border-r border-b">
                    5. ອັດຕາສ່ວນເງິນກູ້<br>(LTV)<br>
                    <span class="text-xs font-normal text-amber-600 mt-1 block">ສຳລັບສິນຄ້າຄຳ</span>
                  </td>
                  <td class="px-4 py-2 bg-amber-50/10">≤ 60%</td>
                  <td rowspan="5" class="text-center text-gray-400 border-l bg-gray-100 italic align-middle border-b">ບໍ່ນຳໃຊ້</td>
                  <td class="text-center font-bold text-success border-l bg-amber-50/30">25</td>
                </tr>
                <tr><td class="px-4 py-2 bg-amber-50/10">≤ 70%</td><td class="text-center font-bold text-success border-l bg-amber-50/30">20</td></tr>
                <tr><td class="px-4 py-2 bg-amber-50/10">≤ 80%</td><td class="text-center font-bold text-warning border-l bg-amber-50/30">15</td></tr>
                <tr><td class="px-4 py-2 bg-amber-50/10">≤ 90%</td><td class="text-center font-bold text-warning border-l bg-amber-50/30">10</td></tr>
                <tr><td class="px-4 py-2 border-b bg-amber-50/10">> 90%</td><td class="text-center font-bold text-error border-l bg-amber-50/30 border-b">5</td></tr>
                
                <tr class="bg-gray-100 font-bold">
                    <td colspan="2" class="px-4 py-3 text-right text-gray-600 uppercase">ຄະແນນລວມສູງສຸດ (Max Total Score) :</td>
                    <td class="text-center text-lg text-primary border-l border-white">100</td>
                    <td class="text-center text-lg text-amber-600 border-l border-white bg-amber-100">100</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-6 border-t pt-6">
            <h4 class="font-bold text-lg mb-4 text-center">ເກນການຕັດສິນໃຈ (Decision Criteria)</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-success/10 border border-success/30 rounded-xl p-4 text-center">
                <div class="text-success font-black text-2xl mb-1">80 - 100</div>
                <div class="badge badge-success text-white mb-2">APPROVE</div>
                <p class="text-sm text-gray-600">ອະນຸມັດໄດ້ທັນທີ, ລູກຄ້າມີຄວາມສ່ຽງຕ່ຳຫຼາຍ</p>
              </div>
              <div class="bg-warning/10 border border-warning/30 rounded-xl p-4 text-center">
                <div class="text-warning font-black text-2xl mb-1">65 - 79</div>
                <div class="badge badge-warning text-white mb-2">CONDITIONAL</div>
                <p class="text-sm text-gray-600">ອະນຸມັດແບບມີເງື່ອນໄຂ (ເຊັ່ນ: ຕ້ອງເພີ່ມເງິນດາວ ຫຼື ຂໍຄົນຄ້ຳ)</p>
              </div>
              <div class="bg-error/10 border border-error/30 rounded-xl p-4 text-center">
                <div class="text-error font-black text-2xl mb-1">< 65</div>
                <div class="badge badge-error text-white mb-2">REJECT</div>
                <p class="text-sm text-gray-600">ປະຕິເສດ, ລູກຄ້າມີຄວາມສ່ຽງສູງເກີນໄປ</p>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-base-200 bg-base-100 flex justify-end rounded-b-2xl">
          <button class="btn btn-primary" @click="close">ຮັບຊາບ / ປິດໜ້າຈໍ</button>
        </div>

      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
defineProps<{ isOpen: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const close = () => emit('close');
</script>