// src/stores/address.ts
import { defineStore } from 'pinia';
import { addressApi } from '@/api/address';

export const useAddressStore = defineStore('address', {
  state: () => ({
    provinces: [] as any[],
    districts: [] as any[],
    loading: false
  }),
  actions: {
    async fetchProvinces() {
      this.loading = true;
      try {
        const res = await addressApi.getProvinces();
        
        // ✅ แก้ไขตรงนี้: ตรวจสอบว่าข้อมูลอยู่ที่ไหน
        // ถ้า res.data เป็น Array ให้ใช้เลย ถ้าไม่ใช่ค่อยไปหาใน res.data.data
        this.provinces = Array.isArray(res.data) ? res.data : (res.data.data || []);
        
        console.log('Successfully loaded provinces:', this.provinces);
      } catch (error) {
        console.error('Failed to fetch provinces:', error);
        this.provinces = []; // ป้องกันการเป็น undefined
      } finally {
        this.loading = false;
      }
    },

    async fetchDistricts(provinceId: string) {
      this.loading = true;
      try {
        const res = await addressApi.getDistricts(provinceId);
        
        // ✅ แก้ไขตรงนี้เหมือนกัน
        this.districts = Array.isArray(res.data) ? res.data : (res.data.data || []);
        
      } catch (error) {
        console.error('Failed to fetch districts:', error);
        this.districts = [];
      } finally {
        this.loading = false;
      }
    }
  }
});