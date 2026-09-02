import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiClient from '@/api/apiclient';
import * as customerApi from '@/api/customer'; // 👈 นำเข้า customerApi

export const useCustomerStore = defineStore('customer', () => {
  const customers = ref<any[]>([]);
  const currentCustomer = ref<any>(null);

  // 🌟 Pagination & Loading States
  const isLoading = ref(false);
  const isLoadingMore = ref(false);
  const totalRecords = ref(0);
  const nextCursor = ref<number | null>(null);
  const hasNextPage = ref(false);

  // เก็บ Filter ปัจจุบันไว้ใช้เวลา Load More
  const lastFilters = ref<any>({});

  const canLoadMore = computed(() => hasNextPage.value && nextCursor.value !== null);

  // 🟢 1. ดึงข้อมูลครั้งแรก หรือเมื่อมีการ Filter/Search ใหม่
  const fetchCustomers = async (filters: any = {}) => {
    isLoading.value = true;
    lastFilters.value = { ...filters };
    try {
      const res = await apiClient.get('/customer', { params: filters });
      const responseData = res.data?.data || res.data || [];
      const meta = res.data?.meta || {};

      customers.value = responseData;
      totalRecords.value = meta.total || responseData.length;
      nextCursor.value = meta.nextCursor || null;
      hasNextPage.value = meta.hasNextPage || false;

      return responseData;
    } catch (error) {
      console.error('Failed to fetch customers', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // 🟢 2. ดึงข้อมูลเพิ่มและนำมาต่อท้าย (Append)
  const loadMoreCustomers = async () => {
    if (!canLoadMore.value || isLoadingMore.value) return;

    isLoadingMore.value = true;
    try {
      const params = { ...lastFilters.value, cursor: nextCursor.value };
      const res = await apiClient.get('/customer', { params });

      const newData = res.data?.data || res.data || [];
      const meta = res.data?.meta || {};

      customers.value = [...customers.value, ...newData]; // ต่อท้าย Array เดิม
      nextCursor.value = meta.nextCursor || null;
      hasNextPage.value = meta.hasNextPage || false;
    } catch (error) {
      console.error('Failed to load more customers', error);
      throw error;
    } finally {
      isLoadingMore.value = false;
    }
  };

  // 🟢 3. ดึงข้อมูลลูกค้า 1 คน (รายละเอียด)
  const fetchCustomerById = async (id: number) => {
    isLoading.value = true;
    try {
      const res = await apiClient.get(`/customer/${id}`);
      currentCustomer.value = res.data?.data || res.data;
      return currentCustomer.value;
    } catch (error) {
      console.error(`Failed to fetch customer ${id}`, error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // 🟢 4. อัปเดตข้อมูลลูกค้า (รองรับ FormData อัตโนมัติ)
  const updateCustomer = async (id: number, payload: any) => {
    try {
      const res = await apiClient.patch(`/customer/${id}`, payload, {
        headers: payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
      });
      return res.data;
    } catch (error) {
      console.error(`Failed to update customer ${id}`, error);
      throw error;
    }
  };
  // 🟢 เพิ่ม Action สำหรับเปลี่ยนสถานะ KYC (Bulk / Single)
  const updateKycStatus = async (customer_ids: number[], status: customerApi.KycStatusUpdate) => {
    isLoading.value = true;
    try {
      const res = await customerApi.updateKycStatus(customer_ids, status);
      return res;
    } catch (error) {
      console.error('Failed to update KYC status', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // ==========================================
  // 📍 Location APIs
  // ==========================================
  const fetchLocations = async (customerId: number) => {
    const res = await apiClient.get(`/customer-locations/${customerId}/locations`);
    return res.data;
  };

  const addLocation = async (customerId: number, data: any) => {
    const res = await apiClient.post(`/customer-locations/${customerId}/locations`, data);
    return res.data;
  };

  const editLocation = async (locationId: number, data: any) => {
    const res = await apiClient.put(`/customer-locations/${locationId}`, data);
    return res.data;
  };

  const removeLocation = async (locationId: number) => {
    const res = await apiClient.delete(`/customer-locations/${locationId}`);
    return res.data;
  };

  return {
    customers,
    currentCustomer,
    isLoading,
    isLoadingMore,
    totalRecords,
    nextCursor,
    hasNextPage,
    canLoadMore,
    fetchCustomers,
    loadMoreCustomers,
    fetchCustomerById,
    updateCustomer,
    updateKycStatus,
    fetchLocations,
    addLocation,
    editLocation,
    removeLocation
  };
});
