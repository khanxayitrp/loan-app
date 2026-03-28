// src/api/global_categories.ts
import apiClient from './apiclient';
import type {
  GlobalCategory,
  CreateGlobalCategoryDto,
  UpdateGlobalCategoryDto
} from '@/types/global_categories';

// ໝາຍເຫດ: ໃຫ້ປ່ຽນ Base URL ນີ້ໃຫ້ກົງກັບ Router ຂອງ Backend ທ່ານ
// ຕົວຢ່າງ: ຖ້າ Backend ໃຊ້ app.use('/api/global-categories', router) ໃຫ້ໃຊ້ '/global-categories'
const BASE_PATH = '/global-categories';

/**
 * ດຶງຂໍ້ມູນໝວດໝູ່ກາງ (Global Categories) ທັງໝົດ
 */
export const getGlobalCategories = async (): Promise<GlobalCategory[]> => {
  try {
    const response = await apiClient.get(BASE_PATH);
    // Backend ຕອບກັບມາເປັນ Array ໂດຍກົງ ຕາມ Controller (res.status(200).json(categories))
    return response.data;
  } catch (error: any) {
    console.error('[API] Error fetching global categories:', error);
    throw new Error(error.response?.data?.message || 'ດຶງຂໍ້ມູນໝວດໝູ່ກາງລົ້ມເຫຼວ');
  }
};

/**
 * ດຶງຂໍ້ມູນໝວດໝູ່ກາງ ຕາມ ID
 */
export const getGlobalCategoryById = async (id: number): Promise<GlobalCategory> => {
  try {
    const response = await apiClient.get(`${BASE_PATH}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`[API] Error fetching global category ${id}:`, error);
    throw new Error(error.response?.data?.message || 'ບໍ່ພົບຂໍ້ມູນໝວດໝູ່');
  }
};

/**
 * ດຶງຂໍ້ມູນໝວດໝູ່ກາງ ຕາມຕົວຫຍໍ້ (Prefix Code) ຕົວຢ່າງ: 'MB', 'FA'
 */
export const getGlobalCategoryByPrefix = async (prefixCode: string): Promise<GlobalCategory> => {
  try {
    const response = await apiClient.get(`${BASE_PATH}/prefix/${prefixCode}`);
    return response.data;
  } catch (error: any) {
    console.error(`[API] Error fetching global category with prefix ${prefixCode}:`, error);
    throw new Error(error.response?.data?.message || 'ບໍ່ພົບຂໍ້ມູນໝວດໝູ່ຈາກ Prefix ນີ້');
  }
};

/**
 * ສ້າງໝວດໝູ່ກາງອັນໃໝ່
 */
export const createGlobalCategory = async (data: CreateGlobalCategoryDto): Promise<GlobalCategory> => {
  try {
    const response = await apiClient.post(BASE_PATH, data);
    return response.data;
  } catch (error: any) {
    console.error('[API] Error creating global category:', error);
    throw new Error(error.response?.data?.message || 'ສ້າງໝວດໝູ່ກາງລົ້ມເຫຼວ');
  }
};

/**
 * ແກ້ໄຂຂໍ້ມູນໝວດໝູ່ກາງ
 */
export const updateGlobalCategory = async (id: number, data: UpdateGlobalCategoryDto): Promise<GlobalCategory> => {
  try {
    const response = await apiClient.put(`${BASE_PATH}/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error(`[API] Error updating global category ${id}:`, error);
    throw new Error(error.response?.data?.message || 'ແກ້ໄຂໝວດໝູ່ກາງລົ້ມເຫຼວ');
  }
};

/**
 * ລຶບຂໍ້ມູນໝວດໝູ່ກາງ
 */
export const deleteGlobalCategory = async (id: number): Promise<boolean> => {
  try {
    await apiClient.delete(`${BASE_PATH}/${id}`);
    return true;
  } catch (error: any) {
    console.error(`[API] Error deleting global category ${id}:`, error);
    throw new Error(error.response?.data?.message || 'ລຶບໝວດໝູ່ກາງລົ້ມເຫຼວ');
  }
};
