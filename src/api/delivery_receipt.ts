import apiClient from './apiclient';
import type {
  DeliveryReceipt,
  CreateDeliveryReceiptDto,
  UpdateDeliveryReceiptDto,
  DeliveryReceiptResponse,
  DeliveryReceiptArrayResponse
} from '@/types/delivery_receipt';

// ປ່ຽນໃຫ້ກົງກັບ Base Route ທີ່ທ່ານຕັ້ງໃນ index.ts ຂອງ Backend
const BASE_URL = '/delivery-receipt';

/**
 * ບັນທຶກໃບຮັບສິນຄ້າໃໝ່ (Create)
 */
export const createDeliveryReceipt = async (
  applicationId: number,
  data: CreateDeliveryReceiptDto
): Promise<DeliveryReceipt> => {
  try {
    const response = await apiClient.post<DeliveryReceiptResponse>(`${BASE_URL}/${applicationId}`, {
      delivery_receipt: data // Backend ຮັບຄ່າຜ່ານ object ຊື່ delivery_receipt
    });
    const responseData = response.data.data as any;
    return Array.isArray(responseData) ? responseData[0] : responseData;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create delivery receipt');
  }
};

/**
 * ດຶງຂໍ້ມູນໃບຮັບສິນຄ້າຕາມ Application ID
 */
export const getDeliveryReceiptByApplicationId = async (
  application_Id: number
): Promise<DeliveryReceipt | null> => {
  try {
    const response = await apiClient.get<DeliveryReceiptArrayResponse>(`${BASE_URL}/application/${application_Id}`);
    console.log('API response for getDeliveryReceiptByApplicationId:', response.data.data);
    // ເນື່ອງຈາກເຮົາຕົກລົງກັນວ່າເປັນ 1-to-1 ແຕ່ Backend ໃຊ້ findAll ມັນຈຶ່ງສົ່ງມາເປັນ Array
    // ດັ່ງນັ້ນເຮົາຈະດຶງເອົາ Index ທີ 0 ອອກມາໃຊ້
    // 🟢 ປັບປຸງການດຶງຂໍ້ມູນໃຫ້ຮອງຮັບທຸກຮູບແບບທີ່ Backend ອາດຈະສົ່ງມາ
    const rawData = response.data?.data || response.data;

    if (rawData) {
      if (Array.isArray(rawData) && rawData.length > 0) {
        return rawData[0] || null; // ຖ້າເປັນ Array ເອົາໂຕທຳອິດ, ຖ້າບໍ່ມີໃຫ້ສົ່ງ null
      } else if (!Array.isArray(rawData) && (rawData as any).id) {
        return rawData; // ຖ້າເປັນ Object ກໍ່ Return ເລີຍ
      }
    }

    return null;
  } catch (error: any) {
    // ຖ້າ Backend ສົ່ງ 404 Not Found ມາ, ໃຫ້ return null ແທນການຖິ້ມ Error
    // ເພາະມັນແປວ່າໃບຄຳຂໍນີ້ຍັງບໍ່ທັນໄດ້ສ້າງໃບຮັບສິນຄ້າ
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw new Error(error.response?.data?.message || 'Failed to fetch delivery receipt');
  }
};

/**
 * ອັບເດດໃບຮັບສິນຄ້າ
 */
export const updateDeliveryReceipt = async (
  id: number,
  data: UpdateDeliveryReceiptDto
): Promise<DeliveryReceipt> => {
  try {
    const response = await apiClient.put<DeliveryReceiptResponse>(`${BASE_URL}/application/${id}`, data);
    return response.data.data as any;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update delivery receipt');
  }
};

/**
 * ດຶງຂໍ້ມູນໃບຮັບສິນຄ້າຕາມ Application ID
 */
export const getLatestReceiptId = async (): Promise<DeliveryReceipt | null> => {
  try {
    const response = await apiClient.get<DeliveryReceiptArrayResponse>(`${BASE_URL}/receipt/latest`);

    return response.data.data[0] || null;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch last receipt ID');
  }
};
