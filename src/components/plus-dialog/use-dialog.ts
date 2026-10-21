import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue';

import type { PlusDialogMode } from './types';

import { computed, nextTick, ref, shallowRef, toRaw, toValue } from 'vue';

/**
 * The server-paged list that opens the dialog. `rows` hold page `page`, so a
 * row's position in the whole list is `(page - 1) * pageSize + its row index`.
 */
export interface UseDialogList<T extends object> {
  /**
   * Loads a 1-based page into `page`, `rows`, and `total`, resolving once they
   * reflect it. A rejection fails the dialog step that asked for the page.
   */
  loadPage: (page: number) => Promise<void>;
  /** 1-based page currently held in `rows`. */
  page: MaybeRefOrGetter<number>;
  pageSize: MaybeRefOrGetter<number>;
  rows: MaybeRefOrGetter<readonly T[]>;
  /** Row count of the whole list. */
  total: MaybeRefOrGetter<number>;
}

export interface UseDialogApi<T extends object> {
  create?: (form: T) => Promise<void>;
  /** Blank form, called on every `openCreate`. */
  empty: () => T;
  /** Full record behind a list row. The dialog edits the result, never the row. */
  fetch: (row: T) => Promise<T>;
  remove?: (form: T) => Promise<void>;
  /** Persists an edit and resolves to the stored record. */
  save?: (form: T) => Promise<T>;
}

/** Props and v-model listeners of `PlusDialog`'s record contract. */
export interface DialogBindings<T extends object> {
  create?: (form: T) => Promise<void>;
  form: T;
  index: number | undefined;
  load: (index: number) => Promise<T>;
  mode: PlusDialogMode;
  modelValue: boolean;
  'onUpdate:form': (form: T) => void;
  'onUpdate:index': (index: number | undefined) => void;
  'onUpdate:mode': (mode: PlusDialogMode) => void;
  'onUpdate:modelValue': (visible: boolean) => void;
  remove?: (form: T) => Promise<void>;
  save?: (form: T) => Promise<T>;
  total: number;
}

export interface UseDialogReturn<T extends object> {
  /** Spread whole onto `<PlusDialog v-bind="bindings">`. */
  bindings: ComputedRef<DialogBindings<T>>;
  /** The record the dialog edits; slot fields bind to it. */
  form: Ref<T>;
  /**
   * Opens `row` in `mode`. While the dialog is open, the row loads into it in
   * place. Throws when `row` is not in `list.rows`.
   */
  open: (row: T, mode: Exclude<PlusDialogMode, 'create'>) => void;
  /** Opens a blank form from `api.empty`, closing an open dialog first. */
  openCreate: () => Promise<void>;
}

/**
 * Wires a `PlusDialog` to a server-paged list: maps rows to whole-list
 * positions, pages the list while the dialog steps across page edges, and
 * reloads the current page after every save, create, and remove.
 *
 * The list stays owned by the caller; the dialog only reads it and asks for
 * pages through `list.loadPage`. Permissions, actions, and validation stay
 * `PlusDialog` props.
 *
 * @param list Current page of the list that opens the dialog.
 * @param api Record access. Omitting `save`, `create`, or `remove` leaves that
 * `PlusDialog` prop unset.
 *
 * @example
 * const { bindings, form, open, openCreate } = useDialog(
 *   { page, pageSize, rows, total, loadPage },
 *   { empty: emptyOrder, fetch: (row) => getOrder(row.id), save: updateOrder },
 * )
 *
 * // <el-button @click="open(row, 'view')">查看</el-button>
 * // <PlusDialog v-bind="bindings" :permissions="permissions">
 * //   <el-input v-model="form.name" />
 * // </PlusDialog>
 */
export function useDialog<T extends object>(
  list: UseDialogList<T>,
  api: UseDialogApi<T>,
): UseDialogReturn<T> {
  const visible = shallowRef(false);
  const mode = shallowRef<PlusDialogMode>('view');
  const index = shallowRef<number | undefined>(undefined);
  const form = ref(api.empty()) as Ref<T>;

  const reloadPage = (): Promise<void> => list.loadPage(toValue(list.page));

  async function load(target: number): Promise<T> {
    const size = toValue(list.pageSize);
    const targetPage = Math.floor(target / size) + 1;
    if (targetPage !== toValue(list.page)) await list.loadPage(targetPage);
    const row = toValue(list.rows)[target - (targetPage - 1) * size];
    if (!row) {
      throw new Error(
        `[useDialog] No row at index ${target} on page ${targetPage}.`,
      );
    }
    return await api.fetch(row);
  }

  const {
    create: persistCreate,
    remove: persistRemove,
    save: persistSave,
  } = api;

  const save =
    persistSave &&
    (async (record: T): Promise<T> => {
      const saved = await persistSave(record);
      await reloadPage();
      return saved;
    });

  const create =
    persistCreate &&
    (async (record: T): Promise<void> => {
      await persistCreate(record);
      await reloadPage();
    });

  const remove =
    persistRemove &&
    (async (record: T): Promise<void> => {
      await persistRemove(record);
      await reloadPage();
    });

  function open(row: T, nextMode: Exclude<PlusDialogMode, 'create'>): void {
    const raw = toRaw(row);
    const local = toValue(list.rows).findIndex((item) => toRaw(item) === raw);
    if (local === -1) {
      throw new Error(
        '[useDialog] "open" got a row that is not on the current page.',
      );
    }
    mode.value = nextMode;
    index.value = (toValue(list.page) - 1) * toValue(list.pageSize) + local;
    visible.value = true;
  }

  async function openCreate(): Promise<void> {
    // PlusDialog captures the clean baseline only when it opens in create mode.
    if (visible.value) {
      visible.value = false;
      await nextTick();
    }
    form.value = api.empty();
    mode.value = 'create';
    index.value = undefined;
    visible.value = true;
  }

  const listeners = {
    'onUpdate:form': (next: T) => {
      form.value = next;
    },
    'onUpdate:index': (next: number | undefined) => {
      index.value = next;
    },
    'onUpdate:mode': (next: PlusDialogMode) => {
      mode.value = next;
    },
    'onUpdate:modelValue': (next: boolean) => {
      visible.value = next;
    },
  };

  const bindings = computed((): DialogBindings<T> => ({
    ...listeners,
    create,
    form: form.value,
    index: index.value,
    load,
    mode: mode.value,
    modelValue: visible.value,
    remove,
    save,
    total: toValue(list.total),
  }));

  return { bindings, form, open, openCreate };
}
