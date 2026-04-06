import type { Component } from 'vue';
import type { RouteLocationRaw } from 'vue-router';
import { BookOpen, FileSpreadsheet, SquareTerminal } from 'lucide-vue-next';

export interface NavItem {
  name: string;
  label: string;
  icon: Component;
  to: RouteLocationRaw;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    title: 'PlusTable',
    items: [
      {
        name: 'plus-table-docs',
        label: '文档',
        icon: BookOpen,
        to: { name: 'plus-table-docs' },
      },
      {
        name: 'plus-table-demo',
        label: '示例',
        icon: SquareTerminal,
        to: { name: 'plus-table-demo' },
      },
    ],
  },
  {
    title: 'hucre',
    items: [
      {
        name: 'hucre-docs',
        label: '文档',
        icon: BookOpen,
        to: { name: 'hucre-docs' },
      },
      {
        name: 'hucre-demo',
        label: '示例',
        icon: FileSpreadsheet,
        to: { name: 'hucre-demo' },
      },
    ],
  },
];
