import { ref, watch, onMounted, type Ref } from 'vue';
import { useAddressStore } from '@/stores/address';
import type { SectionAddressData } from '@/types/loanFormSections';

export interface DistrictItem {
  district_id: string | number;
  district_name: string;
}

export function useAddressCascade(
  addressRef: Ref<SectionAddressData | undefined | null>,
  isEditing: Ref<boolean> | boolean
) {
  const addressStore = useAddressStore();
  const localDistricts = ref<DistrictItem[]>([]);

  const loadLocalDistricts = async (provinceId: string | number | undefined | null) => {
    if (!provinceId) {
      localDistricts.value = [];
      return;
    }
    await addressStore.fetchDistricts(String(provinceId));
    localDistricts.value = [...addressStore.districts];
  };

  const handleDistrictChange = () => {
    if (!addressRef.value) return;
    const d = localDistricts.value.find((x) => String(x.district_id) === String(addressRef.value?.district_id));
    if (d) {
      addressRef.value.district = d.district_name;
    }
  };

  onMounted(async () => {
    if (addressRef.value?.province_id) {
      await loadLocalDistricts(addressRef.value.province_id);
    }
  });

  watch(
    () => addressRef.value?.province_id,
    async (newVal) => {
      const editing = typeof isEditing === 'boolean' ? isEditing : isEditing.value;
      if (editing && addressRef.value) {
        addressRef.value.district_id = '';
        addressRef.value.district = '';
        const p = addressStore.provinces.find((x) => String(x.province_id) === String(newVal));
        addressRef.value.province = p ? p.province_name : '';
        if (newVal) {
          await loadLocalDistricts(newVal);
        }
      }
    }
  );

  return {
    localDistricts,
    loadLocalDistricts,
    handleDistrictChange,
    provinces: addressStore.provinces
  };
}
