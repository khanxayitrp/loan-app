// src/api/upload.ts
import apiClient from './apiclient'

/**
 * อัปโหลดเอกสารเดี่ยวสำหรับ Loan Application
 * @param applicationId - ID ของ Loan Application
 * @param file - ไฟล์เอกสาร
 * @param docType - ประเภทเอกสาร (id_card, household, income, other)
 */
export const uploadApplicationDocument = async (
  applicationId: number,
  file: File,
  docType: string
): Promise<any> => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('doc_type', docType)

    const response = await apiClient.post(
      `/upload/application/${applicationId}/document`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    )

    console.log('[Upload API] Single document uploaded:', response.data)
    return response.data
  } catch (error: any) {
    console.error('[Upload API] Upload single document failed:', error)
    throw new Error(
      error.response?.data?.message ||
      `ອັບໂຫຼດເອກະສານລົ້ມເຫຼວ: ${docType}`
    )
  }
}

/**
 * อัปโหลดเอกสารหลายไฟล์สำหรับ Loan Application
 * @param applicationId - ID ของ Loan Application
 * @param files - รายการไฟล์เอกสาร
 * @param docTypes - รายการประเภทเอกสาร (ต้องมีจำนวนเท่ากับไฟล์)
 */
export const uploadMultipleApplicationDocuments = async (
  applicationId: number,
  files: File[],
  docTypes: string[]
): Promise<any> => {
  try {
    if (files.length !== docTypes.length) {
      throw new Error('ຈຳນວນໄຟລ໌ ແລະ ປະເພດເອກະສານຕ້ອງເທົ່າກັນ')
    }

    // อัปโหลดทีละไฟล์พร้อมประเภท
    const uploadPromises = files.map((file, index) =>
      uploadApplicationDocument(applicationId, file, docTypes[index])
    )

    const results = await Promise.all(uploadPromises)
    console.log('[Upload API] Multiple documents uploaded:', results.length)
    return { success: true, documents: results }
  } catch (error: any) {
    console.error('[Upload API] Upload multiple documents failed:', error)
    throw error
  }
}

/**
 * ดึงรายการเอกสารทั้งหมดของ Loan Application
 * @param applicationId - ID ของ Loan Application
 */
export const getApplicationDocuments = async (applicationId: number): Promise<any> => {
  try {
    const response = await apiClient.get(
      `/upload/application/${applicationId}/documents`
    )

    console.log('[Upload API] Documents fetched:', response.data)
    return response.data
  } catch (error: any) {
    console.error('[Upload API] Fetch documents failed:', error)
    throw new Error(
      error.response?.data?.message ||
      'ດຶງຂໍ້ມູນເອກະສານລົ້ມເຫຼວ'
    )
  }
}

/**
 * ลบเอกสาร
 * @param documentId - ID ของเอกสาร
 */
export const deleteDocument = async (documentId: number): Promise<any> => {
  try {
    const response = await apiClient.delete(
      `/upload/document/${documentId}`
    )

    console.log('[Upload API] Document deleted:', documentId)
    return response.data
  } catch (error: any) {
    console.error('[Upload API] Delete document failed:', error)
    throw new Error(
      error.response?.data?.message ||
      'ລຶບເອກະສານລົ້ມເຫຼວ'
    )
  }
}

/**
 * แทนที่เอกสาร (อัปโหลดใหม่แทนที่เอกสารเดิม)
 * @param documentId - ID ของเอกสาร
 * @param file - ไฟล์ใหม่
 */
export const replaceDocument = async (
  documentId: number,
  file: File
): Promise<any> => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.put(
      `/upload/document/${documentId}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    )

    console.log('[Upload API] Document replaced:', documentId)
    return response.data
  } catch (error: any) {
    console.error('[Upload API] Replace document failed:', error)
    throw new Error(
      error.response?.data?.message ||
      'ແທນທີ່ເອກະສານລົ້ມເຫຼວ'
    )
  }
}

/**
 * อัปโหลดหลักฐานการชำระเงิน
 * @param transactionId - ID ของธุรกรรม
 * @param file - ไฟล์หลักฐาน
 */
export const uploadPaymentProof = async (
  transactionId: number,
  file: File
): Promise<any> => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post(
      `/upload/payment/${transactionId}/proof`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    )

    console.log('[Upload API] Payment proof uploaded:', transactionId)
    return response.data
  } catch (error: any) {
    console.error('[Upload API] Upload payment proof failed:', error)
    throw new Error(
      error.response?.data?.message ||
      'ອັບໂຫຼດຫຼັກຖານການຊຳລະລົ້ມເຫຼວ'
    )
  }
}
