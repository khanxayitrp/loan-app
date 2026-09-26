<template>
  <LoanApplicationDetailsModal
    :show="show"
    :loanId="draftId"
    :isDraft="true"
    @close="emit('close')"
    @updated="emit('updated')"
    @refresh="emit('refresh')"
  />
</template>

<script setup lang="ts">
import LoanApplicationDetailsModal from '../detail/LoanApplicationDetailsModal.vue';

defineProps<{
  show: boolean;
  draftId?: number | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'updated'): void;
  (e: 'refresh'): void;
}>();
</script>
