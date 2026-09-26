
<template>
  <teleport to="body">
    <div id="print-card-container" v-if="isOpen && memberData"
      class="fixed inset-0 z-[120] flex items-center justify-center bg-gray-500/80 backdrop-blur-sm p-4">

      <div
        class="bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden max-w-lg w-full">

        <!-- Header / Controls -->
        <div class="flex justify-between items-center p-4 border-b bg-gray-50">
          <h3 class="text-lg font-bold flex items-center gap-2 text-gray-800">
            <span class="icon-[tabler--id-badge-2] size-5"></span> ພິມບັດສະມາຊິກ
          </h3>
          <div class="flex items-center gap-2">
            <button @click="close" class="btn btn-ghost btn-sm">ປິດ</button>
            <button @click="handlePrint" class="btn btn-primary btn-sm">
              <span class="icon-[tabler--printer] size-4"></span> ສັ່ງພິມ
            </button>
          </div>
        </div>

        <!-- 🌟 Card Canvas (Screen Display) -->
        <div class="p-8 flex justify-center bg-gray-100">

          <!-- 🟢 TARGET FOR PRINTING: We extract the HTML inside this div -->
          <div id="printable-card" class="relative overflow-hidden shadow-xl rounded-xl bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 text-white member-card">

            <!-- Graphic Background -->
            <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div class="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"></div>

            <div class="relative z-10 h-full flex flex-col p-4">
              <!-- Top Row: Logo & Title -->
              <div class="flex justify-between items-start mb-4">
                <div class="flex items-center gap-2">
                  <img src="/image/LOGO INSEE 2026.png" class="h-8 w-8 object-contain bg-white rounded-full p-0.5" alt="Logo" />
                  <div>
                    <h2 class="text-sm font-bold leading-none tracking-wide text-amber-400 m-0 p-0">INSEE</h2>
                    <p class="text-[8px] opacity-80 uppercase tracking-widest m-0 p-0 mt-1">Microfinance</p>
                  </div>
                </div>
                <div class="text-right flex flex-col items-end">
                  <h3 class="text-sm font-black tracking-widest uppercase text-amber-300 m-0 p-0">
                    {{ memberData.membership_tier?.tier_name || 'Standard' }} MEMBER
                  </h3>
                  <p class="text-[9px] font-mono mt-0.5 opacity-90 m-0 p-0 mt-1">{{ memberData.member_code || 'INS-PENDING-000000' }}</p>
                </div>
              </div>

              <!-- Middle Row: User Details -->
              <div class="flex gap-4 items-center flex-1">
                <!-- User Photo -->
                <div class="w-16 h-20 rounded-md bg-white/20 p-1 border border-white/30 shadow-inner flex-shrink-0 flex items-center justify-center overflow-hidden box-border">
                  <img v-if="memberData.profile_image_url" :src="memberData.profile_image_url" class="w-full h-full object-cover rounded-sm block" />
                  <div v-else class="w-full h-full bg-gray-300 flex items-center justify-center rounded-sm">
                    <span style="font-size: 24px; color: #666;">👤</span>
                  </div>
                </div>

                <!-- User Info -->
                <div class="flex-1 space-y-1.5 flex flex-col justify-center">
                  <div class="mb-2">
                    <p class="text-[8px] text-blue-200 uppercase m-0 p-0">ຊື່ ແລະ ນາມສະກຸນ / Name</p>
                    <p class="text-sm font-bold m-0 p-0 mt-0.5">{{ memberData.first_name }} {{ memberData.last_name || '' }}</p>
                  </div>
                  <div class="flex gap-4">
                    <div>
                      <p class="text-[8px] text-blue-200 uppercase m-0 p-0">ວັນເກີດ / DOB</p>
                      <p class="text-xs m-0 p-0 mt-0.5">{{ formatDateOnly(memberData.date_of_birth) }}</p>
                    </div>
                    <div>
                      <p class="text-[8px] text-blue-200 uppercase m-0 p-0">ເພດ / Sex</p>
                      <p class="text-xs m-0 p-0 mt-0.5">{{ memberData.gender === 'Male' ? 'M' : (memberData.gender === 'Female' ? 'F' : '-') }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Bottom Row: Dates, Footer & QR Code -->
              <div class="mt-auto flex justify-between items-end border-t border-white/20 pt-2 pb-1">
                <div class="flex flex-col gap-1.5">
                  <div class="flex gap-4">
                    <div>
                      <p class="text-[7px] text-blue-200 uppercase m-0 p-0">ອອກບັດ / Issue</p>
                      <p class="text-[10px] font-mono m-0 p-0 mt-0.5">{{ formatDateOnly(memberData.card_issue_at) }}</p>
                    </div>
                    <div>
                      <p class="text-[7px] text-blue-200 uppercase m-0 p-0">ໝົດອາຍຸ / Expire</p>
                      <p class="text-[10px] font-mono m-0 p-0 mt-0.5">{{ formatDateOnly(memberData.card_expire_at) }}</p>
                    </div>
                  </div>
                  <div class="text-[6px] opacity-60 font-mono leading-tight m-0 p-0">
                    Property of Insee Microfinance
                  </div>
                </div>
                
                <!-- 🟢 QR Code Container -->
                <div class="bg-white p-0.5 rounded-sm flex items-center justify-center shrink-0">
                  <qrcode-vue :value="verificationUrl" :size="32" level="M" render-as="svg" />
                </div>
              </div>
              
            </div>
          </div>
          <!-- END TARGET -->

        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatDateOnly } from '@/utils/formatters';
import QrcodeVue from 'qrcode.vue'; // 🟢 Import QR Code Library

const props = defineProps<{ isOpen: boolean; memberData: any }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const close = () => emit('close');

// 🟢 ສ້າງ Verification URL ສຳລັບ QR Code ອັດຕະໂນມັດ
const verificationUrl = computed(() => {
  const baseUrl = window.location.origin; // ຈະດຶງໂດເມນປັດຈຸບັນ ເຊັ່ນ https://admin.insee.la
  // ຖ້າຕ້ອງການ Fixed URL ໃຫ້ປ່ຽນເປັນ const baseUrl = 'https://app.insee.la';
  return props.memberData?.member_code ? `${baseUrl}/verify/${props.memberData.member_code}` : baseUrl;
});

// 🟢 JAVASCRIPT ISOLATED PRINT STRATEGY
const handlePrint = () => {
  const cardElement = document.getElementById('printable-card');
  if (!cardElement) return;

  const cardHtml = cardElement.outerHTML;

  // 1. Create a hidden iframe
  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'fixed';
  printFrame.style.right = '0';
  printFrame.style.bottom = '0';
  printFrame.style.width = '0';
  printFrame.style.height = '0';
  printFrame.style.border = '0';
  document.body.appendChild(printFrame);

  const printDoc = printFrame.contentWindow?.document;
  if (!printDoc) return;

  // 2. Inject Tailwind CDN and Custom Isolation CSS
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Member Card</title>
        <!-- Use a lightweight Tailwind CDN just for the iframe styling -->
        <script src="https://cdn.tailwindcss.com"><\/script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;700;900&display=swap');
          
          /* Force exact colors and hide everything else */
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-family: 'Noto Sans Lao', sans-serif;
          }
          
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            width: 85.6mm !important;
            height: 53.98mm !important;
            overflow: hidden !important;
          }

          /* Strip the rounded corners and shadow for printing so it bleeds to the edge */
          .member-card {
            width: 85.6mm !important;
            height: 53.98mm !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            margin: 0 !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            box-sizing: border-box !important;
          }

          @page {
            size: 85.6mm 53.98mm; 
            margin: 0 !important;
          }
        </style>
      </head>
      <body>
        ${cardHtml}
      </body>
    </html>
  `;

  printDoc.open();
  printDoc.write(htmlContent);
  printDoc.close();

  // 3. Wait for images/fonts to load, then print and destroy iframe
  setTimeout(() => {
    printFrame.contentWindow?.focus();
    printFrame.contentWindow?.print();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(printFrame);
    }, 500);
  }, 500); // 500ms delay ensures images and SVG are rendered
};
</script>

<style scoped>
/* Only required for screen display */
.member-card {
  width: 85.6mm;
  height: 53.98mm;
  box-sizing: border-box;
}
</style>
