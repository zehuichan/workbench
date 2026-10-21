import { ref } from 'vue';

import { useDialog } from '../../use-dialog';

export interface PagedRow {
  id: number;
  name: string;
}

export const PAGE_SIZE = 3;

/**
 * In-memory server-paged list of `count` rows wired to `useDialog`.
 * `fetch` appends `-detail` to the name so tests can tell a fetched record from its row.
 */
export function createPagedRecords(count = 7) {
  let nextId = count + 1;
  const store: PagedRow[] = Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `R${i + 1}`,
  }));
  const page = ref(1);
  const rows = ref<PagedRow[]>([]);
  const total = ref(0);

  async function loadPage(nextPage: number): Promise<void> {
    await Promise.resolve();
    page.value = nextPage;
    const start = (nextPage - 1) * PAGE_SIZE;
    rows.value = store
      .slice(start, start + PAGE_SIZE)
      .map((row) => ({ ...row }));
    total.value = store.length;
  }

  const dialog = useDialog(
    { page, pageSize: PAGE_SIZE, rows, total, loadPage },
    {
      empty: () => ({ id: 0, name: '' }),
      fetch: async (row) => ({ ...row, name: `${row.name}-detail` }),
      save: async (form) => {
        const i = store.findIndex((row) => row.id === form.id);
        store[i] = { ...form };
        return { ...form };
      },
      create: async (form) => {
        store.push({ ...form, id: nextId++ });
      },
      remove: async (form) => {
        store.splice(
          store.findIndex((row) => row.id === form.id),
          1,
        );
      },
    },
  );

  function rowAt(i: number): PagedRow {
    const row = rows.value[i];
    if (!row) throw new Error(`row ${i} is not on page ${page.value}`);
    return row;
  }

  return { dialog, loadPage, page, rowAt, rows, total };
}
