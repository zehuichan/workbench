import PlusDialog from './plus-dialog.vue';

export { PlusDialog };
export { useUnsavedChanges } from './composables';
export type {
  UseUnsavedChangesOptions,
  UseUnsavedChangesReturn,
} from './composables';
export { default as PlusDialogFooter } from './plus-dialog-footer.vue';

export { default as PlusDialogHeader } from './plus-dialog-header.vue';
export type {
  PlusDialogAction,
  PlusDialogMode,
  PlusDialogPermissions,
  PlusDialogShape,
  PlusDialogSlotProps,
} from './types';
export { useDialog } from './use-dialog';
export type {
  DialogBindings,
  UseDialogApi,
  UseDialogList,
  UseDialogReturn,
} from './use-dialog';

export default PlusDialog;
