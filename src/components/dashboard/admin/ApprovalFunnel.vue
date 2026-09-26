<template>
  <div class="space-y-6 mt-4">
    <div v-for="(step, index) in funnelSteps" :key="index" class="relative group">
      <!-- Label และตัวเลข -->
      <div class="flex justify-between items-end mb-2">
        <span class="flex items-center gap-3 text-sm font-semibold text-slate-700">
          <span class="flex items-center justify-center w-6 h-6 rounded-full text-xs text-white shadow-sm" :class="step.color">
            {{ index + 1 }}
          </span>
          {{ step.label }}
        </span>
        <div class="text-right">
          <span class="text-lg font-bold text-slate-800">{{ formatNumber(step.value) }}</span>
          <span class="text-sm text-slate-500 ml-2 font-normal">({{ step.percentage }}%)</span>
        </div>
      </div>
      
      <!-- หลอด Funnel / Progress Bar -->
      <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
        <div
          class="h-3 rounded-full transition-all duration-1000 ease-out"
          :class="step.color"
          :style="{ width: `${step.percentage}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAdminDashboardStore } from '@/stores/admin_dashboard'

const store = useAdminDashboardStore()
const { approvalFunnel } = storeToRefs(store)

const formatNumber = (val: number) => {
  return new Intl.NumberFormat('lo-LA').format(val || 0)
}

const funnelSteps = computed(() => {
  // หากยังไม่มีข้อมูล (Loading) หรือข้อมูลว่าง ให้กำหนดค่าเริ่มต้น
  const f = approvalFunnel.value || { totalApplied: 0, preApproved: 0, approved: 0, disbursed: 0 }
  
  // ป้องกัน Error หารด้วยศูนย์ (Division by Zero)
  const total = f.totalApplied > 0 ? f.totalApplied : 1 

  return [
    {
      label: 'ໃບຄຳຂໍທັງໝົດ (Total Applied)',
      value: f.totalApplied,
      percentage: 100, // ขั้นแรกคือ 100% เสมอ
      color: 'bg-slate-400'
    },
    {
      label: 'ຜ່ານກວດສອບ (Pre-approved)',
      value: f.preApproved,
      percentage: Math.round((f.preApproved / total) * 100),
      color: 'bg-sky-400'
    },
    {
      label: 'ອະນຸມັດຈິງ (Approved)',
      value: f.approved,
      percentage: Math.round((f.approved / total) * 100),
      color: 'bg-blue-500'
    },
    {
      label: 'ປ່ອຍສິນເຊື່ອສຳເລັດ (Disbursed)',
      value: f.disbursed,
      percentage: Math.round((f.disbursed / total) * 100),
      color: 'bg-emerald-500'
    }
  ]
})
</script>