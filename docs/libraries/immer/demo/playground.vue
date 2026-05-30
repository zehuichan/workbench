<script setup lang="ts">
import { computed, onMounted, reactive, ref, shallowRef } from 'vue';
import { ElMessage } from 'element-plus';
import {
  applyPatches,
  createDraft,
  current,
  enableMapSet,
  enablePatches,
  finishDraft,
  freeze,
  immerable,
  isDraft,
  original,
  produce,
  produceWithPatches,
  type Patch,
} from 'immer';

onMounted(() => {
  enableMapSet();
  enablePatches();
});

// ── 基础 Todo 列表 ──

interface Todo {
  id: number;
  title: string;
  done: boolean;
}

const todos = shallowRef<readonly Todo[]>([
  freeze({ id: 1, title: 'Learn TypeScript', done: true }),
  freeze({ id: 2, title: 'Try Immer', done: false }),
  freeze({ id: 3, title: 'Tweet about it', done: false }),
] as const);

const todoLogs = ref<string[]>([]);
const newTodoTitle = ref('');
let nextTodoId = 4;

function logTodos(label: string, prev: readonly Todo[], next: readonly Todo[]) {
  todoLogs.value.unshift(
    `${label}  |  prev === next ? ${prev === next}  |  prev[0] === next[0] ? ${prev[0] === next[0]}`,
  );
  if (todoLogs.value.length > 6) todoLogs.value.length = 6;
}

function addTodo() {
  const title = newTodoTitle.value.trim();
  if (!title) {
    ElMessage.warning('请输入标题');
    return;
  }
  const prev = todos.value;
  todos.value = produce(prev, (draft) => {
    draft.push({ id: nextTodoId++, title, done: false });
  });
  logTodos('add', prev, todos.value);
  newTodoTitle.value = '';
}

function toggleTodo(id: number) {
  const prev = todos.value;
  todos.value = produce(prev, (draft) => {
    const t = draft.find((x) => x.id === id);
    if (t) t.done = !t.done;
  });
  logTodos(`toggle #${id}`, prev, todos.value);
}

function removeTodo(id: number) {
  const prev = todos.value;
  todos.value = produce(prev, (draft) => {
    const idx = draft.findIndex((x) => x.id === id);
    if (idx !== -1) draft.splice(idx, 1);
  });
  logTodos(`remove #${id}`, prev, todos.value);
}

function tryDirectMutate() {
  try {
    (todos.value[0] as Todo).title = '直接改我！';
    ElMessage.warning('意外没抛错（请检查 autoFreeze）');
  } catch (e) {
    ElMessage.success(`抛错（符合预期）：${(e as Error).message.split('\n')[0]}`);
  }
}

// ── 嵌套对象更新 ──

interface UserSettings {
  profile: { name: string; email: string };
  preferences: { theme: 'light' | 'dark'; notifications: { email: boolean; push: boolean } };
  tags: string[];
}

const userSettings = ref<UserSettings>(
  freeze<UserSettings>({
    profile: { name: 'Alice', email: 'alice@example.com' },
    preferences: { theme: 'light', notifications: { email: true, push: false } },
    tags: ['admin', 'beta'],
  }, true),
);

const userSettingsBefore = shallowRef(userSettings.value);
const userPatchesLog = ref<string[]>([]);

function deepUpdateName() {
  const prev = userSettings.value;
  userSettings.value = produce(prev, (draft) => {
    draft.profile.name = draft.profile.name === 'Alice' ? 'Bob' : 'Alice';
  });
  recordSettingsChange('profile.name', prev);
}

function toggleTheme() {
  const prev = userSettings.value;
  userSettings.value = produce(prev, (draft) => {
    draft.preferences.theme = draft.preferences.theme === 'light' ? 'dark' : 'light';
  });
  recordSettingsChange('preferences.theme', prev);
}

function togglePush() {
  const prev = userSettings.value;
  userSettings.value = produce(prev, (draft) => {
    draft.preferences.notifications.push = !draft.preferences.notifications.push;
  });
  recordSettingsChange('preferences.notifications.push', prev);
}

function addTag() {
  const prev = userSettings.value;
  userSettings.value = produce(prev, (draft) => {
    draft.tags.push(`tag-${draft.tags.length + 1}`);
  });
  recordSettingsChange('tags[]', prev);
}

function recordSettingsChange(field: string, prev: UserSettings) {
  const next = userSettings.value;
  const lines = [
    `${field}：`,
    `  profile === ?         ${prev.profile === next.profile}`,
    `  preferences === ?     ${prev.preferences === next.preferences}`,
    `  notifications === ?   ${prev.preferences.notifications === next.preferences.notifications}`,
    `  tags === ?            ${prev.tags === next.tags}`,
  ];
  userPatchesLog.value.unshift(lines.join('\n'));
  if (userPatchesLog.value.length > 4) userPatchesLog.value.length = 4;
  userSettingsBefore.value = next;
}

// ── 柯里化 reducer ──

interface CounterState {
  count: number;
  history: number[];
}

type CounterAction =
  | { type: 'INC' }
  | { type: 'DEC' }
  | { type: 'ADD'; payload: number }
  | { type: 'RESET' };

const counterReducer = produce<CounterState, [CounterAction]>(
  (draft, action) => {
    switch (action.type) {
      case 'INC':
        draft.history.push(draft.count);
        draft.count += 1;
        break;
      case 'DEC':
        draft.history.push(draft.count);
        draft.count -= 1;
        break;
      case 'ADD':
        draft.history.push(draft.count);
        draft.count += action.payload;
        break;
      case 'RESET':
        draft.count = 0;
        draft.history.length = 0;
        break;
    }
  },
);

const counterState = ref<CounterState>({ count: 0, history: [] });
const counterAdd = ref(5);

function dispatch(action: CounterAction) {
  counterState.value = counterReducer(counterState.value, action);
}

// ── JSON Patches & 撤销/重做 ──

interface DocState {
  title: string;
  body: string;
  tags: string[];
}

const docState = ref<DocState>({
  title: '我的文档',
  body: 'Hello Immer！',
  tags: ['notes'],
});
const docTitleInput = ref('');
const docBodyInput = ref('');
const docTagInput = ref('');

interface HistoryEntry {
  label: string;
  patches: Patch[];
  inverse: Patch[];
}

const docHistory = reactive<{ stack: HistoryEntry[]; cursor: number }>({
  stack: [],
  cursor: -1,
});

function applyDocChange(label: string, recipe: (d: DocState) => void) {
  const [next, patches, inverse] = produceWithPatches(docState.value, recipe);
  if (!patches.length) return;
  if (docHistory.cursor < docHistory.stack.length - 1) {
    docHistory.stack.splice(docHistory.cursor + 1);
  }
  docHistory.stack.push({ label, patches, inverse });
  docHistory.cursor = docHistory.stack.length - 1;
  docState.value = next;
}

function setDocTitle() {
  const t = docTitleInput.value.trim();
  if (!t) return;
  applyDocChange(`title="${t}"`, (d) => { d.title = t; });
  docTitleInput.value = '';
}

function setDocBody() {
  const b = docBodyInput.value;
  if (!b) return;
  applyDocChange('body=…', (d) => { d.body = b; });
  docBodyInput.value = '';
}

function addDocTag() {
  const t = docTagInput.value.trim();
  if (!t) return;
  applyDocChange(`+tag "${t}"`, (d) => { d.tags.push(t); });
  docTagInput.value = '';
}

function removeDocTag(idx: number) {
  applyDocChange(`-tag[${idx}]`, (d) => { d.tags.splice(idx, 1); });
}

function undoDoc() {
  if (docHistory.cursor < 0) return;
  const entry = docHistory.stack[docHistory.cursor];
  docState.value = applyPatches(docState.value, entry.inverse);
  docHistory.cursor--;
}

function redoDoc() {
  if (docHistory.cursor >= docHistory.stack.length - 1) return;
  docHistory.cursor++;
  const entry = docHistory.stack[docHistory.cursor];
  docState.value = applyPatches(docState.value, entry.patches);
}

const canUndo = computed(() => docHistory.cursor >= 0);
const canRedo = computed(() => docHistory.cursor < docHistory.stack.length - 1);

const lastPatchView = computed(() => {
  if (docHistory.cursor < 0) return '— 暂无 patch —';
  const e = docHistory.stack[docHistory.cursor];
  return [
    `# ${e.label}`,
    'patches:',
    JSON.stringify(e.patches, null, 2),
    'inversePatches:',
    JSON.stringify(e.inverse, null, 2),
  ].join('\n');
});

// ── Map / Set ──

const mapState = shallowRef<ReadonlyMap<string, number>>(
  new Map([
    ['apple', 3],
    ['banana', 5],
  ]),
);
const setState = shallowRef<ReadonlySet<string>>(new Set(['admin', 'beta']));

const mapKeyInput = ref('');
const mapValInput = ref(1);
const setItemInput = ref('');

function mapSet() {
  const key = mapKeyInput.value.trim();
  if (!key) return;
  const val = mapValInput.value;
  mapState.value = produce(mapState.value, (draft) => {
    draft.set(key, val);
  });
  mapKeyInput.value = '';
}

function mapDelete(key: string) {
  mapState.value = produce(mapState.value, (draft) => {
    draft.delete(key);
  });
}

function setAdd() {
  const item = setItemInput.value.trim();
  if (!item) return;
  setState.value = produce(setState.value, (draft) => {
    draft.add(item);
  });
  setItemInput.value = '';
}

function setDelete(item: string) {
  setState.value = produce(setState.value, (draft) => {
    draft.delete(item);
  });
}

const mapEntries = computed(() => [...mapState.value.entries()]);
const setItems = computed(() => [...setState.value]);

// ── Class & immerable ──

class Note {
  static [immerable] = true;

  id: number;
  title: string;
  pinned: boolean;

  constructor(id: number, title: string, pinned = false) {
    this.id = id;
    this.title = title;
    this.pinned = pinned;
  }

  togglePin() {
    this.pinned = !this.pinned;
  }
}

const noteState = ref<Note>(new Note(1, '欢迎使用 Immer'));

function togglePinViaProduce() {
  noteState.value = produce(noteState.value, (draft) => {
    draft.togglePin();
  });
}

function renameNote() {
  noteState.value = produce(noteState.value, (draft) => {
    draft.title = `Note 更新于 ${new Date().toLocaleTimeString()}`;
  });
}

const noteIsInstance = computed(() => noteState.value instanceof Note);

// ── original / current / isDraft ──

const inspectInput = ref(JSON.stringify({ user: { name: 'Alice' }, tags: ['a', 'b'] }, null, 2));
const inspectOutput = ref('');

type InspectShape = { user?: { name?: string }; tags?: unknown[]; [key: string]: unknown };

function runInspect() {
  try {
    const base = JSON.parse(inspectInput.value) as InspectShape;
    const lines: string[] = [];
    produce(base, (draft) => {
      lines.push(`isDraft(draft):       ${isDraft(draft)}`);
      lines.push(`isDraft(base):        ${isDraft(base)}`);
      if (draft.user) draft.user.name = 'Bob';
      if (Array.isArray(draft.tags)) draft.tags.push('c');
      lines.push(`current(draft):       ${JSON.stringify(current(draft))}`);
      lines.push(`original(draft):      ${JSON.stringify(original(draft))}`);
      lines.push(`original === base:    ${original(draft) === base}`);
    });
    inspectOutput.value = lines.join('\n');
  } catch (e) {
    inspectOutput.value = `解析/执行失败：${(e as Error).message}`;
  }
}

// ── 异步 recipe ──

const asyncState = ref<{ loading: boolean; user: string | null; error: string | null }>({
  loading: false,
  user: null,
  error: null,
});

async function runAsyncDemo() {
  asyncState.value = produce(asyncState.value, (d) => {
    d.loading = true;
    d.user = null;
    d.error = null;
  });

  try {
    const draft = createDraft(asyncState.value);
    await new Promise((r) => setTimeout(r, 600));
    draft.user = `Alice (${new Date().toLocaleTimeString()})`;
    draft.loading = false;
    asyncState.value = finishDraft(draft);
  } catch (e) {
    asyncState.value = produce(asyncState.value, (d) => {
      d.loading = false;
      d.error = (e as Error).message;
    });
  }
}
</script>

<template>
  <div>
    <!-- ── 基础 Todo ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <span class="demo-section__title">基础：produce + Todo 列表</span>
      </template>
      <p class="demo-hint">
        每次点击都会调用 <code>produce</code> 产生新数组；未变动的子项保持引用相等。
      </p>
      <div class="demo-field-row">
        <span class="demo-field-label">新建</span>
        <div class="demo-field-controls">
          <el-input
            v-model="newTodoTitle"
            size="small"
            placeholder="输入标题…"
            class="demo-input-fixed"
            @keyup.enter="addTodo"
          />
          <el-button size="small" type="primary" @click="addTodo">添加</el-button>
          <el-divider direction="vertical" class="demo-field-divider" />
          <el-button size="small" @click="tryDirectMutate">尝试直接修改（应抛错）</el-button>
        </div>
      </div>

      <ul class="todo-list">
        <li v-for="t in todos" :key="t.id" class="todo-item">
          <el-checkbox :model-value="t.done" size="small" @change="toggleTodo(t.id)" />
          <span class="todo-item__title" :class="{ done: t.done }">{{ t.title }}</span>
          <span class="todo-item__meta">#{{ t.id }}</span>
          <el-button size="small" link @click="removeTodo(t.id)">删除</el-button>
        </li>
      </ul>

      <el-divider />
      <div class="demo-log-block">
        <div class="demo-log-block__title">引用对比日志（最新 6 条）</div>
        <pre v-if="todoLogs.length" class="code-block"><code>{{ todoLogs.join('\n') }}</code></pre>
        <p v-else class="muted">操作 todo 后会显示前后状态的引用比对。</p>
      </div>
    </el-card>

    <!-- ── 嵌套对象更新 ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <span class="demo-section__title">嵌套对象 & 结构共享</span>
      </template>
      <p class="demo-hint">
        修改深层字段时，未触及的兄弟节点保持原引用——这是 Immer 区别于深拷贝的关键。
      </p>
      <div class="demo-field-row">
        <span class="demo-field-label">操作</span>
        <div class="demo-field-controls">
          <el-button size="small" type="primary" @click="deepUpdateName">切换 name</el-button>
          <el-button size="small" @click="toggleTheme">切换 theme</el-button>
          <el-button size="small" @click="togglePush">切换 notifications.push</el-button>
          <el-button size="small" @click="addTag">追加 tag</el-button>
        </div>
      </div>

      <pre class="code-block code-block--state"><code>{{ JSON.stringify(userSettings, null, 2) }}</code></pre>

      <div class="demo-log-block">
        <div class="demo-log-block__title">引用对比日志（最新 4 次）</div>
        <pre v-if="userPatchesLog.length" class="code-block"><code>{{ userPatchesLog.join('\n\n') }}</code></pre>
        <p v-else class="muted">操作后会显示哪些子树被替换、哪些保留了原引用。</p>
      </div>
    </el-card>

    <!-- ── 柯里化 reducer ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <span class="demo-section__title">柯里化 producer：(state, action) =&gt; nextState</span>
      </template>
      <p class="demo-hint">
        把 <code>produce</code> 当成 reducer 工厂——非常适合 Redux / Pinia 风格的 store。
      </p>
      <div class="demo-counter">
        <div class="demo-counter__display">
          <span class="demo-counter__label">count</span>
          <span class="demo-counter__value">{{ counterState.count }}</span>
        </div>
        <div class="demo-field-controls">
          <el-button size="small" @click="dispatch({ type: 'DEC' })">−</el-button>
          <el-button size="small" type="primary" @click="dispatch({ type: 'INC' })">+</el-button>
          <el-divider direction="vertical" class="demo-field-divider" />
          <el-input-number
            v-model="counterAdd"
            size="small"
            :controls="false"
            class="demo-input-fixed-sm"
          />
          <el-button size="small" @click="dispatch({ type: 'ADD', payload: counterAdd })">
            +N
          </el-button>
          <el-divider direction="vertical" class="demo-field-divider" />
          <el-button size="small" @click="dispatch({ type: 'RESET' })">重置</el-button>
        </div>
      </div>
      <p class="muted" style="margin-top: 14px">
        history（自动随每次 dispatch 追加）：
        <span class="demo-history">[{{ counterState.history.join(', ') }}]</span>
      </p>
    </el-card>

    <!-- ── Patches & Undo / Redo ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <span class="demo-section__title">JSON Patches：撤销 / 重做</span>
      </template>
      <p class="demo-hint">
        每次修改通过 <code>produceWithPatches</code> 同时生成正向和逆向 patch；保存到栈即可时光穿梭。
      </p>

      <div class="demo-field-stack">
        <div class="demo-field-row">
          <span class="demo-field-label">title</span>
          <div class="demo-field-controls">
            <el-input
              v-model="docTitleInput"
              size="small"
              :placeholder="docState.title"
              class="demo-input-fixed"
              @keyup.enter="setDocTitle"
            />
            <el-button size="small" type="primary" @click="setDocTitle">应用</el-button>
          </div>
        </div>

        <div class="demo-field-row">
          <span class="demo-field-label">body</span>
          <div class="demo-field-controls">
            <el-input
              v-model="docBodyInput"
              size="small"
              :placeholder="docState.body"
              class="demo-input-fixed"
              @keyup.enter="setDocBody"
            />
            <el-button size="small" type="primary" @click="setDocBody">应用</el-button>
          </div>
        </div>

        <div class="demo-field-row">
          <span class="demo-field-label">tags</span>
          <div class="demo-field-controls">
            <el-tag
              v-for="(tag, i) in docState.tags"
              :key="`${tag}-${i}`"
              size="small"
              :disable-transitions="true"
              closable
              @close="removeDocTag(i)"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-model="docTagInput"
              size="small"
              placeholder="新 tag"
              class="demo-input-fixed-sm"
              @keyup.enter="addDocTag"
            />
            <el-button size="small" @click="addDocTag">添加</el-button>
          </div>
        </div>

        <div class="demo-field-row">
          <span class="demo-field-label">历史</span>
          <div class="demo-field-controls">
            <el-button size="small" :disabled="!canUndo" @click="undoDoc">← 撤销</el-button>
            <el-button size="small" :disabled="!canRedo" @click="redoDoc">重做 →</el-button>
            <span class="demo-log">
              cursor {{ docHistory.cursor + 1 }} / {{ docHistory.stack.length }}
            </span>
          </div>
        </div>
      </div>

      <pre class="code-block code-block--state"><code>{{ JSON.stringify(docState, null, 2) }}</code></pre>

      <div class="demo-log-block">
        <div class="demo-log-block__title">最近一次 patches</div>
        <pre class="code-block"><code>{{ lastPatchView }}</code></pre>
      </div>
    </el-card>

    <!-- ── Map / Set ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <span class="demo-section__title">Map / Set（需 enableMapSet）</span>
      </template>
      <p class="demo-hint">
        在 <code>recipe</code> 内 <code>set/get/delete/add</code> 都能正常工作。
      </p>

      <div class="demo-field-row">
        <span class="demo-field-label">Map</span>
        <div class="demo-field-controls">
          <el-input
            v-model="mapKeyInput"
            size="small"
            placeholder="key"
            class="demo-input-fixed-sm"
          />
          <el-input-number
            v-model="mapValInput"
            size="small"
            :controls="false"
            class="demo-input-fixed-sm"
          />
          <el-button size="small" type="primary" @click="mapSet">set</el-button>
        </div>
      </div>

      <div class="demo-pill-row">
        <span v-for="[k, v] in mapEntries" :key="k" class="demo-pill">
          {{ k }} = {{ v }}
          <el-button size="small" link @click="mapDelete(k)">×</el-button>
        </span>
        <span v-if="!mapEntries.length" class="muted">空 Map</span>
      </div>

      <el-divider />

      <div class="demo-field-row">
        <span class="demo-field-label">Set</span>
        <div class="demo-field-controls">
          <el-input
            v-model="setItemInput"
            size="small"
            placeholder="item"
            class="demo-input-fixed"
            @keyup.enter="setAdd"
          />
          <el-button size="small" type="primary" @click="setAdd">add</el-button>
        </div>
      </div>

      <div class="demo-pill-row">
        <span v-for="item in setItems" :key="item" class="demo-pill">
          {{ item }}
          <el-button size="small" link @click="setDelete(item)">×</el-button>
        </span>
        <span v-if="!setItems.length" class="muted">空 Set</span>
      </div>
    </el-card>

    <!-- ── Class & immerable ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <span class="demo-section__title">Class & immerable</span>
      </template>
      <p class="demo-hint">
        在类上设 <code>static [immerable] = true</code> 后，<code>produce</code> 会
        保留 prototype，调用方法/赋值字段都会被记录。
      </p>
      <div class="demo-field-row">
        <span class="demo-field-label">操作</span>
        <div class="demo-field-controls">
          <el-button size="small" type="primary" @click="togglePinViaProduce">
            togglePin
          </el-button>
          <el-button size="small" @click="renameNote">rename</el-button>
        </div>
      </div>
      <pre class="code-block code-block--state"><code>id:       {{ noteState.id }}
title:    {{ noteState.title }}
pinned:   {{ noteState.pinned }}
是否仍是 Note 实例： {{ noteIsInstance }}</code></pre>
    </el-card>

    <!-- ── original / current / isDraft ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <span class="demo-section__title">original / current / isDraft</span>
      </template>
      <p class="demo-hint">
        在 <code>recipe</code> 内可调用 <code>current(draft)</code> 取快照、
        <code>original(draft)</code> 取原值、<code>isDraft</code> 判断身份。
      </p>
      <el-input
        v-model="inspectInput"
        type="textarea"
        :autosize="{ minRows: 4, maxRows: 8 }"
        placeholder="JSON 形式的 base state"
      />
      <div class="demo-field-stack demo-field-stack--follow">
        <div class="demo-field-row">
          <span class="demo-field-label">操作</span>
          <div class="demo-field-controls">
            <el-button size="small" type="primary" @click="runInspect">运行</el-button>
          </div>
        </div>
      </div>
      <pre v-if="inspectOutput" class="code-block" style="margin-top: 12px"><code>{{ inspectOutput }}</code></pre>
    </el-card>

    <!-- ── 异步 producer ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <span class="demo-section__title">异步 recipe</span>
      </template>
      <p class="demo-hint">
        recipe 可以是 async 函数；下例先把 <code>loading</code> 置 true，等待 600ms 后写入 user。
      </p>
      <div class="demo-field-row">
        <span class="demo-field-label">操作</span>
        <div class="demo-field-controls">
          <el-button
            size="small"
            type="primary"
            :loading="asyncState.loading"
            @click="runAsyncDemo"
          >
            模拟拉取 user
          </el-button>
        </div>
      </div>
      <pre class="code-block code-block--state"><code>{{ JSON.stringify(asyncState, null, 2) }}</code></pre>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.demo-section {
  margin-bottom: 24px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--border);

  :deep(.el-card__header) {
    padding: 16px 24px;
    background: var(--muted);
    border-bottom: 1px solid var(--border);
  }

  :deep(.el-card__body) {
    padding: 24px;
  }
}

.demo-section__title {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: -0.2px;
  color: var(--foreground);
}

.demo-field-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.demo-field-stack--follow {
  margin-top: 14px;
}

.demo-field-row {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  align-items: center;
  column-gap: 16px;
}

.demo-field-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--muted-foreground);
  line-height: 1.35;
  text-align: right;
}

.demo-field-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-height: 30px;
}

.demo-field-divider {
  flex-shrink: 0;
  align-self: center;
  height: 26px;
  margin: 0 4px;
}

.demo-input-fixed {
  width: 240px;
}

.demo-input-fixed-sm {
  width: 120px;
}

.demo-hint {
  margin: 0 0 14px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--muted-foreground);

  code {
    padding: 2px 6px;
    font-size: 12px;
    background: var(--muted);
    border: 1px solid var(--border);
    border-radius: 0;
    color: var(--foreground);
  }
}

.demo-log {
  font-size: 12px;
  color: var(--muted-foreground);
  font-variant-numeric: tabular-nums;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.muted {
  margin: 0;
  font-size: 12px;
  color: var(--muted-foreground);
}

.todo-list {
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
  border: 1px solid var(--border);
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  font-size: 12px;

  &:last-child {
    border-bottom: 0;
  }

  &__title {
    flex: 1;
    color: var(--foreground);

    &.done {
      color: var(--muted-foreground);
      text-decoration: line-through;
    }
  }

  &__meta {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 11px;
    color: var(--muted-foreground);
  }
}

.demo-log-block {
  margin-top: 16px;

  &__title {
    margin-bottom: 8px;
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--muted-foreground);
    font-family: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }
}

.code-block {
  margin: 0;
  padding: 16px 20px;
  font-size: 12px;
  line-height: 1.6;
  overflow-x: auto;
  color: var(--foreground);
  background: var(--muted);
  border-radius: 0;
  border: 1px solid var(--border);

  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    white-space: pre;
  }
}

.code-block--state {
  margin-top: 16px;
  max-height: 320px;
}

.demo-counter {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.demo-counter__display {
  display: inline-flex;
  align-items: baseline;
  gap: 10px;
  padding: 8px 16px;
  border: 1px solid var(--border);
  background: var(--muted);
}

.demo-counter__label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--muted-foreground);
  font-family: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.demo-counter__value {
  font-size: 24px;
  font-weight: 600;
  color: var(--foreground);
  font-variant-numeric: tabular-nums;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.demo-history {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: var(--foreground);
}

.demo-pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.demo-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: 0;
}
</style>
