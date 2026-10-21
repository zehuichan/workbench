export interface MockRecord {
  amount: number;
  id: number;
  name: string;
  note: string;
  owner: string;
}

const DELAY_MS = 300;

let nextId = 24;

const store: MockRecord[] = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  name: `记录 ${i + 1}`,
  owner: i % 2 === 0 ? 'Alice' : 'Bob',
  amount: (i + 1) * 100,
  note: '',
}));

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), DELAY_MS);
  });
}

export function getTotal(): number {
  return store.length;
}

export async function fetchPage(
  page: number,
  pageSize: number,
): Promise<{ rows: MockRecord[]; total: number }> {
  const start = (page - 1) * pageSize;
  return delay({
    rows: store.slice(start, start + pageSize).map((row) => ({ ...row })),
    total: store.length,
  });
}

export async function getById(id: number): Promise<MockRecord> {
  const row = store.find((item) => item.id === id);
  if (!row) throw new Error(`[mock-records] Record ${id} not found.`);
  return delay({ ...row });
}

export async function updateRecord(form: MockRecord): Promise<MockRecord> {
  const index = store.findIndex((row) => row.id === form.id);
  if (index === -1)
    throw new Error(`[mock-records] Record ${form.id} not found.`);
  const next = { ...form };
  store[index] = next;
  return delay({ ...next });
}

export async function insertRecord(
  form: Omit<MockRecord, 'id'>,
): Promise<MockRecord> {
  const next: MockRecord = { ...form, id: nextId++ };
  store.push(next);
  return delay({ ...next });
}

export async function removeRecord(form: MockRecord): Promise<void> {
  const index = store.findIndex((row) => row.id === form.id);
  if (index === -1)
    throw new Error(`[mock-records] Record ${form.id} not found.`);
  store.splice(index, 1);
  await delay(undefined);
}

export function emptyRecord(): MockRecord {
  return {
    id: 0,
    name: '',
    owner: 'Alice',
    amount: 0,
    note: '',
  };
}
