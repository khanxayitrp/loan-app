<template>
  <LoanApplicationDetailsModal
    :show="show"
    :loanId="loanId"
    :isDraft="false"
    :openInEdit="openInEdit"
    :isAuditorView="isAuditorView"
    :isPendingView="isPendingView"
    @close="emit('close')"
    @updated="emit('updated')"
    @refresh="emit('refresh')"
  />
</template>

<script setup lang="ts">
import LoanApplicationDetailsModal from './LoanApplicationDetailsModal.vue';

defineProps<{
  show: boolean;
  loanId?: number | null;
  openInEdit?: boolean;
  isAuditorView?: boolean;
  isPendingView?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'updated'): void;
  (e: 'refresh'): void;
}>();
</script>
