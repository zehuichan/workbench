<script setup lang="ts">
import type { UseDialogReturn } from '../../use-dialog';
import type { PagedRow } from './paged-records';

import PlusDialog from '../../plus-dialog.vue';

const { dialog } = defineProps<{
  dialog: UseDialogReturn<PagedRow>;
}>();
</script>

<template>
  <PlusDialog
    v-bind="dialog.bindings.value"
    shape-storage-key="workbench:plus-dialog:shape:use-dialog-test"
  />
</template>
