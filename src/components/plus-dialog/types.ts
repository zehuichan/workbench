/**
 * Record-dialog modes. Title and footer buttons change by mode.
 * Create hides pager and record actions.
 */
export type PlusDialogMode = 'create' | 'edit' | 'view';

/** Presentation shape remembered across opens. */
export type PlusDialogShape = 'center' | 'fullscreen' | 'side';

/**
 * Optional footer business action (row op or drill-down entry).
 * Inserted between refresh and save in edit mode; before refresh in view mode.
 * Create mode never shows these.
 */
export interface PlusDialogAction<T extends object = Record<string, unknown>> {
  /** How to treat a failed `when`. Default `hide`. */
  fallback?: 'disable' | 'hide';
  handler: (form: T) => Promise<void> | void;
  key: string;
  label: string;
  /** When false, apply `fallback` (default hide). */
  when?: (form: T) => boolean;
}

export interface PlusDialogPermissions {
  edit?: boolean;
  remove?: boolean;
  view?: boolean;
}

export interface PlusDialogSlotProps<
  T extends object = Record<string, unknown>,
> {
  form: T;
  /** True while the current record is being loaded. */
  loading: boolean;
  mode: PlusDialogMode;
  readonly: boolean;
  /** True while save, create, or remove is awaiting persistence. */
  submitting: boolean;
}
