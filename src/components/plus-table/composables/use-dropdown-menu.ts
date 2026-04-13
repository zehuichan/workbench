import type { DropdownInstance } from 'element-plus';
import { ref } from 'vue';

export function useDropdownMenu() {
  const dropdownRef = ref<DropdownInstance>();

  const position = ref({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
  } as DOMRect);

  const triggerRef = ref({
    getBoundingClientRect: () => position.value,
  });

  function open(event: MouseEvent) {
    const { clientX, clientY } = event;
    position.value = DOMRect.fromRect({
      x: clientX,
      y: clientY,
    });
    dropdownRef.value?.handleOpen();
  }

  function close() {
    dropdownRef.value?.handleClose();
  }

  return { dropdownRef, triggerRef, open, close };
}
