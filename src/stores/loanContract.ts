import { defineStore } from 'pinia'
import { ref } from 'vue'
// 🟢 เพิ่ม updateLoanContract ในส่วนของ import
import { getLoanContract, getLoanContracts, saveLoanContract, updateLoanContract } from '@/api/loanContract'
import type { LoanContract, CreateLoanContractRequest } from '@/types/loanContract'

export const useLoanContractStore = defineStore('loanContract', () => {
  const contracts = ref<LoanContract[]>([])
  const currentContract = ref<LoanContract | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchContracts = async (filters: { status?: string } = {}) => {
    isLoading.value = true
    error.value = null
    try {
      const data = await getLoanContracts(filters)
      contracts.value = data
      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch loan contracts'
      contracts.value = []
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchContract = async (loanId: number) => {
    isLoading.value = true
    error.value = null
    try {
      const data = await getLoanContract(loanId)
      currentContract.value = data
      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch loan contract'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createContract = async (loanId: number, data: CreateLoanContractRequest) => {
    isLoading.value = true
    error.value = null
    try {
      const savedContract = await saveLoanContract(loanId, data)
      currentContract.value = savedContract
      return savedContract
    } catch (err: any) {
      error.value = err.message || 'Failed to save loan contract'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 🟢 เพิ่มฟังก์ชันสำหรับ Update Contract
  const updateContract = async (loanId: number, data: Partial<CreateLoanContractRequest>) => {
    isLoading.value = true
    error.value = null
    try {
      const updatedContract = await updateLoanContract(loanId, data)
      currentContract.value = updatedContract // อัปเดต state ปัจจุบัน
      return updatedContract
    } catch (err: any) {
      error.value = err.message || 'Failed to update loan contract'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    contracts,
    currentContract,
    isLoading,
    error,
    fetchContracts,
    fetchContract,
    createContract,
    updateContract // 🟢 อย่าลืม return ฟังก์ชันออกไปให้ Component ใช้งาน
  }
})