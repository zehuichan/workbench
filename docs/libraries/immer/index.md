---
title: immer
description: 以「原地修改 draft」处理不可变状态
---

# immer

以「原地修改 draft」的写法处理不可变数据。无需手写 `...spread`，无需引入新的数据结构，仅用普通 JS 对象/数组/Map/Set 即可获得结构共享、引用相等与自动冻结。

> 安装：`npm install immer`　|　仓库：[github.com/immerjs/immer](https://github.com/immerjs/immer)　|　体积：~3 KB gzipped，零依赖

## 交互示例

体验 Immer 的核心能力：原地修改 draft、结构共享、撤销/重做、Map/Set 与 Class 支持。

<demo src="./demo/playground.vue" description="Todo 列表、嵌套对象结构共享、柯里化 reducer、JSON Patches 撤销重做、Map/Set、Class 与异步 recipe。">immer 综合示例</demo>

## 简介

Immer 的核心思想是把「对当前状态打个补丁，得到下一态」这一过程拆成两步：你在 `recipe` 函数里面对一个临时的 `draft` 自由「修改」——增删字段、push、splice、sort 都行——Immer 会用代理记录这些修改，最终基于 base state 产出一份既保留共享部分、又独立于原状态的不可变结果。

- 普通 JS 对象、数组、`Map`、`Set` 直接可用。
- 结构共享：未变动的子树继续共享引用，`===` 仍然成立。
- 自动冻结：返回值默认 deep frozen，意外修改会抛错。
- 支持 JSON Patch / 逆 Patch，天然适合 undo / redo / 协同。
- 体积极小（~3 KB gzipped），TypeScript 支持完整。

## 安装

```bash
npm install immer
pnpm add immer
yarn add immer
```

从 v6 起，Map/Set 与 Patch 支持采用按需启用，需要时分别调用 `enableMapSet()` / `enablePatches()`。

## 快速开始

基础示例：把第二项标记为已完成，并追加一项新 todo。

```ts
import { produce } from 'immer';

const baseState = [
  { title: 'Learn TypeScript', done: true },
  { title: 'Try Immer', done: false },
];

const nextState = produce(baseState, (draft) => {
  draft[1].done = true;
  draft.push({ title: 'Tweet about it', done: false });
});

console.log(baseState[1].done);   // false  —— 原状态不变
console.log(nextState[1].done);   // true
console.log(baseState === nextState); // false
```

与「手写 spread」对比，差异主要在心智负担：

```ts
// 不使用 Immer：每一层都要手动 spread，极易出错
const next = state.slice();
next[1] = { ...next[1], done: true };
next.push({ title: 'Tweet about it', done: false });

// 使用 Immer：直接「原地修改」draft，原 state 不动
const next2 = produce(state, (draft) => {
  draft[1].done = true;
  draft.push({ title: 'Tweet about it', done: false });
});
```

## 核心 API

| API | 返回值 | 说明 |
| --- | --- | --- |
| `produce(base, recipe, listener?)` | `NextState` | 核心函数。在 recipe 内对 draft 自由「修改」，返回不可变的下一态 |
| `produce(recipe, initialState?)` | `CurriedProducer` | 柯里化形式，先传 recipe 得到一个 `(state, ...args) => nextState` 的 reducer |
| `produceWithPatches(base, recipe)` | `[next, patches, inversePatches]` | 同时返回 JSON Patch 与逆 patch，可用于撤销/重做、协同 |
| `applyPatches(base, patches)` | `NextState` | 把若干 JSON Patch 应用到一个状态上，得到新状态 |
| `createDraft(base)` | `Draft` | 手动创建 draft，可在多次同步操作之间共享 |
| `finishDraft(draft, listener?)` | `NextState` | 结束手动 draft，得到最终不可变状态 |
| `current(draft)` | `Snapshot` | 取出 draft 当前快照（不再继续追踪），用于 log/比对 |
| `original(draft)` | `BaseState` | 取出 draft 对应的原始（base）值 |
| `isDraft(value)` | `boolean` | 判断一个值是否为 Immer draft |
| `isDraftable(value)` | `boolean` | 判断 Immer 是否能为该值创建 draft |
| `castDraft / castImmutable` | `T` | TypeScript 辅助：在不变值与 draft 间做「零成本」类型转换 |

## 柯里化 producer

只传 `recipe`，`produce` 会返回一个新的函数，把 base state 留到调用时再传——天然适配 Redux/Vuex 风格的 reducer：

```ts
import { produce } from 'immer';

const todoReducer = produce((draft, action) => {
  switch (action.type) {
    case 'ADD':
      draft.push({ title: action.title, done: false });
      break;
    case 'TOGGLE':
      draft[action.index].done = !draft[action.index].done;
      break;
    case 'REMOVE':
      draft.splice(action.index, 1);
      break;
  }
});

const next = todoReducer(state, { type: 'ADD', title: 'Read docs' });

// 也可以预设默认初值：state 为 undefined 时 fallback
const reducer = produce((d /* draft */) => { /* ... */ }, []);
```

## 常见更新模式

在 `recipe` 里你「想怎么写就怎么写」：

| 场景 | 写法 |
| --- | --- |
| 更新对象字段 | `draft.user.name = "Alice"` |
| 新增 / 删除字段 | `draft.flag = true; delete draft.tmp` |
| 末尾追加元素 | `draft.list.push(item)` |
| 按索引修改 | `draft.list[0].done = true` |
| 删除元素 | `draft.list.splice(idx, 1)` / `draft.list = draft.list.filter(...)` |
| 插入到指定位置 | `draft.list.splice(idx, 0, item)` |
| 排序 | `draft.list.sort((a, b) => a.id - b.id)` |
| 清空 | `draft.list.length = 0` / `draft.list = []` |
| 替换根状态 | `return newState`（仅根 draft，直接 return 整体替换） |
| 产生「无变化」 | 不写任何修改 / `return undefined` → 原对象引用被复用 |
| 取消变更 | `return nothing`（表示「下一态是 undefined」） |

## JSON Patches（撤销/重做、协同）

调用 `enablePatches()` 后，可使用 `produceWithPatches` 同时拿到正向 & 逆向 patch；后续 `applyPatches` 即可在两个状态间任意穿梭：

```ts
import { produceWithPatches, applyPatches, enablePatches } from 'immer';

enablePatches();

const base = { count: 0, todos: [] as string[] };

const [next, patches, inversePatches] = produceWithPatches(base, (draft) => {
  draft.count += 1;
  draft.todos.push('Hello');
});

// patches:        [{ op: 'replace', path: ['count'], value: 1 },
//                  { op: 'add',     path: ['todos', 0], value: 'Hello' }]
// inversePatches: [{ op: 'replace', path: ['count'], value: 0 },
//                  { op: 'remove',  path: ['todos', 0] }]

const undone = applyPatches(next, inversePatches); // === base
const redone = applyPatches(undone, patches);      // === next
```

patches 遵循 [RFC 6902 JSON Patch](https://datatracker.ietf.org/doc/html/rfc6902) 格式（`op`/`path`/`value`），便于通过网络传输或写入历史日志。

## 异步 producer

`recipe` 可以是 `async` 函数；多步异步流程也可以用 `createDraft` / `finishDraft` 手动控制：

```ts
import { produce, createDraft, finishDraft } from 'immer';

// recipe 可以是 async 函数，produce 返回 Promise
const next = await produce(state, async (draft) => {
  const data = await fetch('/api/user').then((r) => r.json());
  draft.user = data;
});

// 或用 createDraft / finishDraft 在多次异步步骤间共享同一个 draft
const draft = createDraft(state);
draft.loading = true;
draft.user = await api.getUser();
draft.loading = false;
const final = finishDraft(draft);
```

## Map / Set

原生 `Map` / `Set` 默认不会被 draft，需要先调用 `enableMapSet()` 显式开启：

```ts
import { produce, enableMapSet } from 'immer';

enableMapSet(); // 全局开启一次即可

const base = new Map<string, number>([['a', 1]]);

const next = produce(base, (draft) => {
  draft.set('b', 2);
  draft.delete('a');
});

console.log([...next.entries()]); // [['b', 2]]
console.log(base === next);       // false，base 仍为 { a: 1 }
```

## Class 与 immerable

自定义类需要在原型/实例上设置 `[immerable] = true`，Immer 才会为其创建 draft、保留 prototype 链：

```ts
import { produce, immerable } from 'immer';

class Todo {
  [immerable] = true;

  constructor(public title: string, public done = false) {}

  toggle() {
    this.done = !this.done;
  }
}

const base = new Todo('Try Immer');

const next = produce(base, (draft) => {
  draft.toggle();
  draft.title = 'Try Immer (updated)';
});

next instanceof Todo; // true
base.done;            // false
next.done;            // true
```

## 配置 & 工具函数

| API | 说明 |
| --- | --- |
| `setAutoFreeze(enabled)` | 开启/关闭自动冻结。默认开启，保证返回值不可变；批量场景可关闭以提升性能 |
| `enableMapSet()` | 启用对原生 Map / Set 的 draft 支持（按需开启，避免捆绑额外代码） |
| `enablePatches()` | 启用 JSON Patch 输出。`produceWithPatches` 与 listener 参数均依赖此开关 |
| `freeze(value, deep?)` | 主动深/浅冻结对象（绕过 produce 直接得到不可变值） |
| `immerable` | Symbol 标记：在自定义类上设 `[immerable] = true`，让 Immer 接管该类实例的 draft |
| `Immer 类` | 可 new 一个独立配置的 Immer 实例：`new Immer({ autoFreeze: false })` |

```ts
import { produce, setAutoFreeze, enableMapSet, enablePatches, freeze, Immer } from 'immer';

// 1) 全局配置（一般在应用启动时调用一次）
enableMapSet();
enablePatches();
setAutoFreeze(true);

// 2) 主动冻结
const safe = freeze({ a: { b: 1 } }, /* deep */ true);

// 3) 创建独立配置的实例（不影响全局）
const noFreezeImmer = new Immer({ autoFreeze: false });
const next = noFreezeImmer.produce(state, (d) => { d.x = 1 });
```

## 常见陷阱

| 坑 | 说明 |
| --- | --- |
| 不要解构后再赋值 | `const { user } = draft; user.name = "x"` 仍可生效；但 `const u = { ...draft.user }` 后修改 u 不会被记录 |
| 根 draft 不能整体替换 | 在 recipe 内写 `draft = newState` 无效；要么 `return newState`，要么逐字段赋值 |
| 同时 mutate + return | 产生异常。要么改 draft，要么返回新值，二者只能选一 |
| 修改了被冻结的对象 | Immer 的输出默认 frozen；后续若需修改请再次走 produce |
| Map/Set 默认未启用 | 需先 `enableMapSet()`，否则把 Map/Set 当作普通对象处理 |
| Patch 默认未启用 | `produceWithPatches`、listener 需先 `enablePatches()` |
| Class 实例需要 [immerable] | 否则 Immer 不会为其创建 draft（保留引用，按「不可 draft」处理） |

## 与 React / Vue 集成

React：直接配合 `useState`，或使用社区 hook：

```ts
import { produce } from 'immer';
import { useState } from 'react';

const [todos, setTodos] = useState<Todo[]>([]);

setTodos(produce((draft) => {
  draft.push({ title: 'Hello', done: false });
}));

// 或使用社区 hook：use-immer
import { useImmer } from 'use-immer';

const [state, update] = useImmer({ count: 0 });
update((draft) => {
  draft.count += 1;
});
```

Vue 3：Immer 与 `ref` 搭配处理「纯数据快照」——把 `produce` 的返回值赋给 `.value` 即可获得引用相等 + 历史可追溯的好处：

```ts
import { ref } from 'vue';
import { produce } from 'immer';

const settings = ref({
  theme: 'light',
  filters: [{ tag: 'work', enabled: true }],
});

function toggleFilter(idx: number) {
  settings.value = produce(settings.value, (draft) => {
    draft.filters[idx].enabled = !draft.filters[idx].enabled;
  });
}
```

## 典型使用场景

| 场景 | 说明 |
| --- | --- |
| Redux / Pinia / Vuex reducer | 把 switch case 内的「手写不可变更新」全部替换为 `produce(state, draft => {...})` |
| React useState | `setState(produce(s => { s.x = 1 }))` 或配合 use-immer 提供的 useImmer hook |
| Vue 3 reactive 之外的纯数据 | 需要「快照 + 引用相等」语义时（如缓存键、props 比对），用 Immer 替代深拷贝 |
| 撤销 / 重做 | `produceWithPatches` 收集 patches & inversePatches，`applyPatches` 即可时光穿梭 |
| 协同 / 增量同步 | 把 JSON Patch 通过网络发送给协作方，`applyPatches` 完成合并 |
| 大量层级的配置树 | 深层修改不再写一连串 `...spread`；同时保持结构共享，节省内存与渲染 |

## 性能与体积

- 体积约 **3 KB gzipped**，无运行时依赖；ES 模块支持 tree shaking。
- 结构共享：未修改的子树共享旧引用，配合 `React.memo` / `shallowRef` 可显著减少渲染。
- 性能「够用就好」：单次 produce 比手写 spread 慢一点点，但远低于深拷贝；多数场景可忽略。
- 性能敏感批处理：可临时 `setAutoFreeze(false)`，或使用 `new Immer({ autoFreeze: false })` 实例。
- 生产环境建议配合 ESLint / TS 严格模式，避免在 produce 外修改 draft。
