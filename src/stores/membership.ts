
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { fetchApplicationsAPI, updateKycStatusBulkAPI } from '@/api/membership';
import type { MembershipApplication, FetchApplicationsParams } from '@/types/membership';

export const useMembershipStore = defineStore('membership', () => {
  const applications = ref<MembershipApplication[]>([]);
  const isLoading = ref(false);
  const isLoadingMore = ref(false);
  const totalRecords = ref(0);
  const nextCursor = ref<number | null>(null);
  const canLoadMore = ref(false);

  const fetchApplications = async (filters: FetchApplicationsParams = {}, loadMore = false) => {
    if (loadMore) {
      isLoadingMore.value = true;
    } else {
      isLoading.value = true;
    }

    try {
      const params: FetchApplicationsParams = { ...filters };
      if (loadMore && nextCursor.value) {
        params.cursor = nextCursor.value;
      }

      const response = await fetchApplicationsAPI(params);

      if (loadMore) {
        applications.value = [...applications.value, ...response.data];
      } else {
        applications.value = response.data;
      }

      totalRecords.value = response.meta.total;
      nextCursor.value = response.meta.nextCursor;
      canLoadMore.value = response.meta.hasNextPage;

    } catch (error) {
      console.error('Failed to fetch applications:', error);
      throw error;
    } finally {
      isLoading.value = false;
      isLoadingMore.value = false;
    }
  };

  const loadMoreApplications = async (filters: FetchApplicationsParams = {}) => {
    if (canLoadMore.value && !isLoadingMore.value) {
      await fetchApplications(filters, true);
    }
  };

  const updateKycStatus = async (ids: number[], status: string) => {
    await updateKycStatusBulkAPI(ids, status);
    
    // ອັບເດດ State ໃນ Store ໂດຍບໍ່ຕ້ອງຫຼິ້ນ API ໃໝ່ທັງໝົດກໍໄດ້
    applications.value = applications.value.map(app => {
      if (ids.includes(app.customer.id)) {
        return { ...app, customer: { ...app.customer, kyc_status: status } };
      }
      return app;
    });
  };

  return {
    applications,
    isLoading,
    isLoadingMore,
    totalRecords,
    canLoadMore,
    fetchApplications,
    loadMoreApplications,
    updateKycStatus
  };
});
