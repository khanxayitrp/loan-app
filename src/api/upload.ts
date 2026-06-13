// src/api/upload.ts
import apiClient from './apiclient'

/**
 * อัปโหลดเอกสารเดี่ยวสำหรับ Loan Application
 * @param applicationId - ID ของ Loan Application
 * @param file - ไฟล์เอกสาร
 * @param docType - ประเภทเอกสาร (id_card, household, income, other)
 */
export const uploadApplicationDocument = async (
  customerId: number,
  file: File,
  docType: string
): Promise<any> => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('doc_type', docType)

    const response = await apiClient.post(
      `/upload/application/${customerId}/document`,
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
 * อัปโหลดเอกสารหลายไฟล์สำหรับลูกค้า
 * @param customerId - ID ของ ลูกค้า (Customer)
 * @param files - รายการไฟล์เอกสาร
 * @param docTypes - รายการประเภทเอกสาร
 */
export const uploadMultipleApplicationDocuments = async (
  customerId: number,
  files: File[],
  docTypes: string[]
): Promise<any> => {
  try {
    if (files.length !== docTypes.length) {
      throw new Error('ຈຳນວນໄຟລ໌ ແລະ ປະເພດເອກະສານຕ້ອງເທົ່າກັນ')
    }

    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append('files', file); 
      // 🟢 แนบ doc_types คู่ไปกับไฟล์ เพื่อให้หลังบ้านรู้ว่าไฟล์ไหนคือเอกสารอะไร
      formData.append('doc_types', docTypes[index] || 'other'); 
    });

    // 🟢 เปลี่ยน URL เป็น /upload/application/${customerId}/documents ตาม Swagger
    const response = await apiClient.post(
      `/upload/application/${customerId}/documents`, 
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );

    console.log('[Upload API] Multiple documents uploaded successfully');
    return { success: true, documents: response.data };

  } catch (error: any) {
    console.error('[Upload API] Upload multiple documents failed:', error);
    throw error;
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

/**
 * อัปโหลดรูปภาพย่อย (Variant Image) แบบ Pre-upload
 * @param file - ไฟล์รูปภาพของ Variant
 */
export const uploadVariantImage = async (file: File): Promise<any> => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    // หมายเหตุ: ตรวจสอบให้แน่ใจว่า Base URL ของ router ฝั่ง Backend คือ /upload หรือไม่
    // ถ้าระบบของคุณ mount เป็น app.use('/api/upload', ...) ให้ใช้ '/upload/variant-image'
    // แต่ถ้า mount เป็น app.use('/api', ...) ให้ใช้ '/variant-image'
    const response = await apiClient.post(
      '/upload/variant-image',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    )

    console.log('[Upload API] Variant image uploaded:', response.data)
    return response.data
  } catch (error: any) {
    console.error('[Upload API] Upload variant image failed:', error)

    // ดักจับกรณี Backend พ่น Error ออกมาเป็นหน้า HTML
    if (error.response?.data instanceof Blob) {
      const contentType = error.response.headers['content-type']
      if (contentType?.includes('text/html')) {
        throw new Error('ເຊີບເວີສົ່ງຄືນໜ້າ HTML ແທນ JSON (ອາດຈະເກີດຈາກ Route ຜິດ)')
      }
    }

    throw new Error(
      error.response?.data?.message ||
      'ອັບໂຫຼດຮູບພາບຕົວເລືອກລົ້ມເຫຼວ'
    )
  }
}
