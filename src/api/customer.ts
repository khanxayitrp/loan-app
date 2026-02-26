// src/api/customer.ts
import apiClient from '@/api/apiClient'; // หรือ path ที่ apiClient ของคุณอยู่ (ปรับตามโครงสร้างโปรเจกต์)

// Interface สำหรับ request bodies และ responses (เหมือนเดิม)
interface RequestOtpBody {
  phone: string;
}

// Interface สำหรับส่ง OTP Verify
export interface OtpVerifyBody {
  phoneNumber: string;
  otp: string;
}

// Interface สำหรับ Response จาก Backend
export interface OtpVerifyResponse {
  success: boolean;
  message: string;
  // เพิ่มข้อมูลอื่นๆ ถ้า backend ส่งกลับมา เช่น user data, token ฯลฯ
}

/**
 * Request OTP for customer
 * @param data { phone: string }
 * @returns Promise<any> - Response จาก API (e.g., { message: 'OTP sent' })
 */
export const requestOtpForCustomer = async (data: RequestOtpBody): Promise<any> => {
  try {
    const response = await apiClient.post('customer/otp/request', data); // ใช้ apiClient ที่มี interceptors
    return response.data;
  } catch (error) {
    console.error('Failed to request OTP:', error);
    throw error;
  }
};

export const verifyOTP = async (data: OtpVerifyBody): Promise<OtpVerifyResponse> => {
  try {
    // ✅ แก้ path ให้ match กับ backend (จาก log: /api/otp/verify)
    const response = await apiClient.post('/otp/verify', data); // ถ้า baseURL รวม /api แล้ว
    console.log('verify get this : ', response.data); // log data แทน response เต็ม
    return response.data;
  } catch (error: any) {
    console.error('Failed to verify OTP:', error);
    // ✅ เพิ่ม handle error response เพื่อเห็น message จาก backend
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw error;
  }
};

/**
 * ค้นหาลูกค้าจากเบอร์โทรศัพท์
 */
export const searchCustomerByPhone = async (phone: string) => {
  try {
    const response = await apiClient.get(`/customer/search`, {
      params: { phone }
    })

    console.log('[API] Customer search result:', response.data)

    if (response.data?.customer) {
      return response.data.customer
    }

    if (response.data?.data) {
      return response.data.data
    }

    return null

  } catch (error: any) {
    // 404 = ไม่พบลูกค้า (ไม่ใช่ error)
    if (error.response?.status === 404) {
      return null
    }

    console.error('[API] Search customer failed:', error)
    throw error
  }
}


/**
 * ค้นหาลูกค้าจาก first_name & last_name
 */
export const searchCustomerByFullname = async (first_name: string, last_name: string) => {
  try {
    const response = await apiClient.get(`/customers/search`, {
      params: { first_name, last_name }
    })

    console.log('[API] Customer search result:', response.data)

    if (response.data?.customer) {
      return response.data.customer
    }

    if (response.data?.data) {
      return response.data.data
    }

    return null

  } catch (error: any) {
    // 404 = ไม่พบลูกค้า (ไม่ใช่ error)
    if (error.response?.status === 404) {
      return null
    }

    console.error('[API] Search customer failed:', error)
    throw error
  }
}
// เพิ่ม functions อื่นๆ ถ้าต้องการ

/**
 * ✅ ดึงรายการ Location ของลูกค้า
 */
export const getCustomerLocations = async (customerId: number) => {
  const response = await apiClient.get(`/customer-locations/${customerId}/locations`)
  return response.data
}

/**
 * ✅ สร้าง Location ใหม่
 */
export const createCustomerLocation = async (
  customerId: number,
  data: {
    location_type: 'home' | 'work' | 'other'
    address: string
    latitude?: number
    longitude?: number
    is_primary: number  // ✅ เป็น number
    map_url?: string
  }
) => {
  const response = await apiClient.post(
    `/customer-locations/${customerId}/locations`,
    data
  )
  return response.data
}

/**
 * ✅ อัปเดต Location
 */
export const updateCustomerLocation = async (
  locationId: number,
  data: {
    address?: string
    latitude?: number
    longitude?: number
    location_type?: 'home' | 'work' | 'other'
    is_primary?: number  // ✅ เป็น number
    map_url?: string
  }
) => {
  const response = await apiClient.put(
    `/customer-locations/${locationId}`,
    data
  )
  return response.data
}

/**
 * ✅ ลบ Location
 */
export const deleteCustomerLocation = async (locationId: number) => {
  const response = await apiClient.delete(`/customer-locations/${locationId}`)
  return response.data
}
