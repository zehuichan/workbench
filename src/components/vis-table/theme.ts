import { useCssVar } from '@vueuse/core';

const theme = {
  bodyStyle: {
    bgColor: '#fff',
    lineHeight: 22,
  },
  headerStyle: {
    color: () =>
      useCssVar('--el-text-color-primary', document.documentElement).value,
    fontWeight: 400,
    bgColor: () =>
      useCssVar('--el-fill-color-light', document.documentElement).value,
  },
  rowHeaderStyle: {
    color: () =>
      useCssVar('--el-text-color-primary', document.documentElement).value,
    fontWeight: 400,
  },
  cornerHeaderStyle: {
    color: () =>
      useCssVar('--el-text-color-primary', document.documentElement).value,
    fontWeight: 400,
  },
  defaultStyle: {
    borderColor: () =>
      useCssVar('--el-border-color-light', document.documentElement).value,
    fontSize: 12,
    padding: [4, 8, 4, 8],
  },
  selectionStyle: {
    cellBorderLineWidth: 1,
  },
};

export { theme };
