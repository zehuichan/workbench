export type PlaygroundCategoryKey =
  | 'components'
  | 'composables'
  | 'packages'
  | 'scene';

export interface PlaygroundCategory {
  /**
   * Sidebar group names in display order. Each name must equal the
   * `meta.group` of the routes it lists; a route whose group no category
   * claims never appears in the sidebar.
   */
  groups: readonly string[];
  /** Header tab text and category id. */
  key: PlaygroundCategoryKey;
}

/** Header categories in display order. An empty `groups` renders a disabled tab. */
export const PLAYGROUND_CATEGORIES: readonly PlaygroundCategory[] = [
  { key: 'components', groups: ['PlusTable', 'PlusDialog', 'Filters'] },
  { key: 'composables', groups: ['Form', 'Auth', 'WeChat'] },
  { key: 'scene', groups: ['总览', '销售', '采购', '财务'] },
  { key: 'packages', groups: [] },
];
