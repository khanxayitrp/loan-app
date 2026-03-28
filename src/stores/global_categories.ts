// src/stores/global_categories.ts
import { defineStore } from 'pinia';
import {
  getGlobalCategories,
  getGlobalCategoryById,
  createGlobalCategory,
  updateGlobalCategory,
  deleteGlobalCategory
} from '@/api/global_categories';
import type {
  GlobalCategory,
  CreateGlobalCategoryDto,
  UpdateGlobalCategoryDto
} from '@/types/global_categories';

export const useGlobalCategoryStore = defineStore('globalCategory', {
  state: () => ({
    categories: [] as GlobalCategory[],
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    // 🟢 ກັ່ນຕອງເອົາສະເພາະໝວດໝູ່ທີ່ເປີດໃຊ້ງານ (Active) ເພື່ອໄປສະແດງໃນ Dropdown
    activeCategories: (state) => {
      return state.categories.filter(category => category.is_active !== 0 && category.is_active !== false);
    },

    // 🟢 ແປງ Array ເປັນ Object Map { id: 'category_name' } ເພື່ອໃຫ້ງ່າຍຕອນສະແດງຜົນໃນຕາຕະລາງ
    categoryMap: (state) => {
      return state.categories.reduce((map, category) => {
        map[category.id] = category.category_name;
        return map;
      }, {} as Record<number, string>);
    }
  },

  actions: {
    /**
     * ດຶງຂໍ້ມູນໝວດໝູ່ກາງທັງໝົດຈາກ API ມາເກັບໄວ້ໃນ Store
     */
    async fetchCategories() {
      this.isLoading = true;
      this.error = null;
      try {
        const data = await getGlobalCategories();
        this.categories = data || [];
        console.log('[Store] Global categories loaded:', this.categories.length);
      } catch (error: any) {
        console.error('[Store] Failed to fetch global categories:', error);
        this.error = error.message || 'ດຶງຂໍ້ມູນໝວດໝູ່ກາງລົ້ມເຫຼວ';
        // ບໍ່ throw error ຕໍ່ເພື່ອບໍ່ໃຫ້ໜ້າເວັບ crash, ໃຫ້ UI ຈັດການສະແດງ error ເອງ
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * ສ້າງໝວດໝູ່ກາງໃໝ່
     */
    async addCategory(data: CreateGlobalCategoryDto) {
      this.isLoading = true;
      this.error = null;
      try {
        const newCategory = await createGlobalCategory(data);
        // ເພີ່ມຂໍ້ມູນໃໝ່ເຂົ້າໄປໃນ state ໂດຍກົງ (ບໍ່ຕ້ອງ fetch ໃໝ່ທັງໝົດ)
        this.categories.push(newCategory);
        return newCategory;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * ແກ້ໄຂຂໍ້ມູນໝວດໝູ່ກາງ
     */
    async editCategory(id: number, data: UpdateGlobalCategoryDto) {
      this.isLoading = true;
      this.error = null;
      try {
        const updatedCategory = await updateGlobalCategory(id, data);
        // ອັບເດດຂໍ້ມູນໃນ state
        const index = this.categories.findIndex(c => c.id === id);
        if (index !== -1) {
          this.categories[index] = { ...this.categories[index], ...updatedCategory };
        }
        return updatedCategory;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * ລຶບໝວດໝູ່ກາງ
     */
    async removeCategory(id: number) {
      this.isLoading = true;
      this.error = null;
      try {
        await deleteGlobalCategory(id);
        // ລຶບອອກຈາກ state
        this.categories = this.categories.filter(c => c.id !== id);
        return true;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    }
  }
});
