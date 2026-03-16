import { defineStore } from 'pinia';
import {
  createDeliveryReceipt,
  getDeliveryReceiptByApplicationId,
  updateDeliveryReceipt,
  getLatestReceiptId
} from '@/api/delivery_receipt';
import type {
  DeliveryReceipt,
  CreateDeliveryReceiptDto,
  UpdateDeliveryReceiptDto
} from '@/types/delivery_receipt';

export const useDeliveryReceiptStore = defineStore('deliveryReceipt', {
  state: () => ({
    currentReceipt: null as DeliveryReceipt | null, // ເກັບໃບຮັບສິນຄ້າຂອງໃບຄຳຂໍປັດຈຸບັນ
    latestReceiptData: null as any,
    isLoading: false,
    isSaving: false,
    error: null as string | null,
  }),

  getters: {
    hasReceipt: (state) => state.currentReceipt !== null,
    isApproved: (state) => state.currentReceipt?.status === 'approved',
  },

  actions: {
    /**
     * ດຶງຂໍ້ມູນໃບຮັບສິນຄ້າຕາມ Application ID
     */
    async fetchReceiptByApplicationId(applicationId: number) {
      this.isLoading = true;
      this.error = null;
      try {
        const receipt = await getDeliveryReceiptByApplicationId(applicationId);
        this.currentReceipt = receipt;
        console.log('[Store] Fetched Delivery Receipt:', receipt);
        return receipt;
      } catch (error: any) {
        console.error('[Store] Fetch Delivery Receipt Error:', error);
        this.error = error.message;
        this.currentReceipt = null;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
 async fetchLatestReceiptId() {
      try {
        const data = await getLatestReceiptId();
        this.latestReceiptData = data;
        return data;
      } catch (error: any) {
        console.error('[Store] Fetch Last Receipt ID Error:', error);
        return null;
      }
    },
    /**
     * ສ້າງໃບຮັບສິນຄ້າໃໝ່
     */
    async createReceipt(applicationId: number, data: CreateDeliveryReceiptDto) {
      this.isSaving = true;
      this.error = null;
      try {
        const newReceipt = await createDeliveryReceipt(applicationId, data);
        this.currentReceipt = newReceipt;
        console.log('[Store] Created Delivery Receipt:', newReceipt);
        return newReceipt;
      } catch (error: any) {
        console.error('[Store] Create Delivery Receipt Error:', error);
        this.error = error.message;
        throw error;
      } finally {
        this.isSaving = false;
      }
    },

    /**
     * ອັບເດດໃບຮັບສິນຄ້າ
     */
    async updateReceipt(receiptId: number, data: UpdateDeliveryReceiptDto) {
      this.isSaving = true;
      this.error = null;
      try {
        const updatedReceipt = await updateDeliveryReceipt(receiptId, data);
        this.currentReceipt = updatedReceipt;
        console.log('[Store] Updated Delivery Receipt:', updatedReceipt);
        return updatedReceipt;
      } catch (error: any) {
        console.error('[Store] Update Delivery Receipt Error:', error);
        this.error = error.message;
        throw error;
      } finally {
        this.isSaving = false;
      }
    },

    /**
     * ລ້າງຂໍ້ມູນ (Clear State) ເວລາປິດ Modal
     */
    clearCurrentReceipt() {
      this.currentReceipt = null;
      this.error = null;
    }
  }
});
