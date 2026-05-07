<script setup lang="ts">
import { inject } from 'vue';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/card';
import CodeBlock from '@/components/code-block.vue';
import { LAYOUT_RIGHT_PANEL } from '@/layouts/injection-keys';

const rightPanelMount = inject(LAYOUT_RIGHT_PANEL);

const coreApiRows = [
  {
    name: 'produce(base, recipe, listener?)',
    ret: 'NextState',
    desc: '核心函数。在 recipe 内对 draft 自由"修改"，返回不可变的下一态',
  },
  {
    name: 'produce(recipe, initialState?)',
    ret: 'CurriedProducer',
    desc: '柯里化形式，先传 recipe 得到一个 (state, ...args) => nextState 的 reducer',
  },
  {
    name: 'produceWithPatches(base, recipe)',
    ret: '[next, patches, inversePatches]',
    desc: '同时返回 JSON Patch 与逆 patch，可用于撤销/重做、协同',
  },
  {
    name: 'applyPatches(base, patches)',
    ret: 'NextState',
    desc: '把若干 JSON Patch 应用到一个状态上，得到新状态',
  },
  {
    name: 'createDraft(base)',
    ret: 'Draft',
    desc: '手动创建 draft，可在多次同步操作之间共享',
  },
  {
    name: 'finishDraft(draft, listener?)',
    ret: 'NextState',
    desc: '结束手动 draft，得到最终不可变状态',
  },
  {
    name: 'current(draft)',
    ret: 'Snapshot',
    desc: '取出 draft 当前快照（不再继续追踪），用于 log/比对',
  },
  {
    name: 'original(draft)',
    ret: 'BaseState',
    desc: '取出 draft 对应的原始（base）值',
  },
  {
    name: 'isDraft(value)',
    ret: 'boolean',
    desc: '判断一个值是否为 Immer draft',
  },
  {
    name: 'isDraftable(value)',
    ret: 'boolean',
    desc: '判断 Immer 是否能为该值创建 draft（普通对象、数组、Map、Set、带 [immerable] 的类）',
  },
  {
    name: 'castDraft / castImmutable',
    ret: 'T',
    desc: 'TypeScript 辅助：在不变值与 draft 间做"零成本"类型转换',
  },
];

const configRows = [
  {
    name: 'setAutoFreeze(enabled)',
    desc: '开启/关闭自动冻结。默认开启，保证返回值不可变；批量场景可关闭以提升性能',
  },
  {
    name: 'enableMapSet()',
    desc: '启用对原生 Map / Set 的 draft 支持（按需开启，避免捆绑额外代码）',
  },
  {
    name: 'enablePatches()',
    desc: '启用 JSON Patch 输出。produceWithPatches 与 listener 参数均依赖此开关',
  },
  {
    name: 'freeze(value, deep?)',
    desc: '主动深/浅冻结对象（绕过 produce 直接得到不可变值）',
  },
  {
    name: 'immerable',
    desc: 'Symbol 标记：在自定义类上设 [immerable] = true，让 Immer 接管该类实例的 draft',
  },
  {
    name: 'Immer 类',
    desc: '可 new 一个独立配置的 Immer 实例：new Immer({ autoFreeze: false })',
  },
];

const updatePatternsRows = [
  {
    scene: '更新对象字段',
    code: 'draft.user.name = "Alice"',
  },
  {
    scene: '新增 / 删除字段',
    code: 'draft.flag = true; delete draft.tmp',
  },
  {
    scene: '末尾追加元素',
    code: 'draft.list.push(item)',
  },
  {
    scene: '按索引修改',
    code: 'draft.list[0].done = true',
  },
  {
    scene: '替换数组',
    code: 'draft.list = newList  // 注意：根 draft 不能整体替换，需 return newList',
  },
  {
    scene: '删除元素',
    code: 'draft.list.splice(idx, 1)  /  draft.list = draft.list.filter(...)',
  },
  {
    scene: '插入到指定位置',
    code: 'draft.list.splice(idx, 0, item)',
  },
  {
    scene: '排序',
    code: 'draft.list.sort((a, b) => a.id - b.id)',
  },
  {
    scene: '清空',
    code: 'draft.list.length = 0  /  draft.list = []',
  },
  {
    scene: '替换根状态',
    code: 'return newState  // 直接 return 即可整体替换（仅根 draft）',
  },
  {
    scene: '产生"无变化"',
    code: '不写任何修改 / return undefined  →  原对象引用被复用',
  },
  {
    scene: '取消变更',
    code: 'return nothing  // 表示"下一态是 undefined"',
  },
];

const pitfallRows = [
  {
    name: '不要解构后再赋值',
    desc: 'const { user } = draft; user.name = "x" 仍可生效；但 const u = { ...draft.user } 后修改 u 不会被记录',
  },
  {
    name: '根 draft 不能整体替换',
    desc: '在 recipe 内写 draft = newState 无效；要么 return newState，要么逐字段赋值',
  },
  {
    name: '同时 mutate + return',
    desc: '产生异常。要么改 draft，要么返回新值，二者只能选一',
  },
  {
    name: '修改了被冻结的对象',
    desc: 'Immer 的输出默认 frozen；后续若需修改请再次走 produce',
  },
  {
    name: 'Map/Set 默认未启用',
    desc: '需先 enableMapSet()，否则把 Map/Set 当作普通对象处理',
  },
  {
    name: 'Patch 默认未启用',
    desc: 'produceWithPatches、listener 需先 enablePatches()',
  },
  {
    name: 'Class 实例需要 [immerable]',
    desc: '否则 Immer 不会为其创建 draft（保留引用，按"不可 draft"处理）',
  },
];

const useCaseRows = [
  {
    name: 'Redux / Pinia / Vuex reducer',
    desc: '把 switch case 内的"手写不可变更新"全部替换为 produce(state, draft => {...})',
  },
  {
    name: 'React useState',
    desc: 'setState(produce(s => { s.x = 1 })) 或配合 use-immer 提供的 useImmer hook',
  },
  {
    name: 'Vue 3 reactive 之外的纯数据',
    desc: '需要"快照 + 引用相等"语义时（如缓存键、props 比对），用 Immer 替代深拷贝',
  },
  {
    name: '撤销 / 重做',
    desc: 'produceWithPatches 收集 patches & inversePatches，applyPatches 即可时光穿梭',
  },
  {
    name: '协同 / 增量同步',
    desc: '把 JSON Patch 通过网络发送给协作方，applyPatches 完成合并',
  },
  {
    name: '大量层级的配置树',
    desc: '深层修改不再写一连串 ...spread；同时保持结构共享，节省内存与渲染',
  },
];

const tocItems = [
  { id: 'intro', label: '简介' },
  { id: 'install', label: '安装' },
  { id: 'quick-start', label: '快速开始' },
  { id: 'core-api', label: '核心 API' },
  { id: 'curried', label: '柯里化 producer' },
  { id: 'update-patterns', label: '常见更新模式' },
  { id: 'patches', label: 'JSON Patches' },
  { id: 'async', label: '异步 producer' },
  { id: 'map-set', label: 'Map / Set' },
  { id: 'classes', label: 'Class 与 immerable' },
  { id: 'config', label: '配置 & 工具函数' },
  { id: 'pitfalls', label: '常见陷阱' },
  { id: 'integration', label: '与 React / Vue 集成' },
  { id: 'use-cases', label: '典型使用场景' },
  { id: 'performance', label: '性能与体积' },
] as const;

const DOC_ANCHOR_OFFSET = 72;

function onDocAnchorClick(e: MouseEvent) {
  e.preventDefault();
}

const quickStart = `import { produce } from 'immer';

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
console.log(baseState === nextState); // false`;

const compare = `// 不使用 Immer：每一层都要手动 spread，极易出错
const next = state.slice();
next[1] = { ...next[1], done: true };
next.push({ title: 'Tweet about it', done: false });

// 使用 Immer：直接"原地修改"draft，原 state 不动
const next2 = produce(state, (draft) => {
  draft[1].done = true;
  draft.push({ title: 'Tweet about it', done: false });
});`;

const curriedExample = `import { produce } from 'immer';

// 把 recipe 柯里化为一个 reducer：(state, action) => nextState
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
const reducer = produce((d /* draft */) => { /* ... */ }, []);`;

const patchesExample = `import { produceWithPatches, applyPatches, enablePatches } from 'immer';

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
const redone = applyPatches(undone, patches);      // === next`;

const asyncExample = `import { produce } from 'immer';

// recipe 可以是 async 函数，produce 返回 Promise
const next = await produce(state, async (draft) => {
  const data = await fetch('/api/user').then((r) => r.json());
  draft.user = data;
});

// 或用 createDraft / finishDraft 在多次异步步骤间共享同一个 draft
import { createDraft, finishDraft } from 'immer';

const draft = createDraft(state);
draft.loading = true;
draft.user = await api.getUser();
draft.loading = false;
const final = finishDraft(draft);`;

const mapSetExample = `import { produce, enableMapSet } from 'immer';

enableMapSet(); // 全局开启一次即可

const base = new Map<string, number>([['a', 1]]);

const next = produce(base, (draft) => {
  draft.set('b', 2);
  draft.delete('a');
});

console.log([...next.entries()]); // [['b', 2]]
console.log(base === next);       // false，base 仍为 { a: 1 }`;

const classesExample = `import { produce, immerable } from 'immer';

class Todo {
  // 让 Immer 接管该类的实例
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
next.done;            // true`;

const configExample = `import {
  produce,
  setAutoFreeze,
  enableMapSet,
  enablePatches,
  freeze,
  Immer,
} from 'immer';

// 1) 全局配置（一般在应用启动时调用一次）
enableMapSet();
enablePatches();
setAutoFreeze(true);

// 2) 主动冻结
const safe = freeze({ a: { b: 1 } }, /* deep */ true);

// 3) 创建独立配置的实例（不影响全局）
const noFreezeImmer = new Immer({ autoFreeze: false });
const next = noFreezeImmer.produce(state, (d) => { d.x = 1 });`;

const reactExample = `// 与 React useState 搭配
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
});`;

const vueExample = `// 与 Vue 3 ref/reactive 配合：Immer 适合"纯数据快照"
import { ref } from 'vue';
import { produce } from 'immer';

interface Settings {
  theme: 'light' | 'dark';
  filters: { tag: string; enabled: boolean }[];
}

const settings = ref<Settings>({
  theme: 'light',
  filters: [{ tag: 'work', enabled: true }],
});

function toggleFilter(idx: number) {
  // 替换 .value，触发 Vue 的响应式更新；
  // 同时通过 produce 保留旧引用、便于做 history / undo。
  settings.value = produce(settings.value, (draft) => {
    draft.filters[idx].enabled = !draft.filters[idx].enabled;
  });
}`;
</script>

<template>
  <div>
    <Teleport v-if="rightPanelMount" :to="rightPanelMount">
      <nav class="doc-anchor-wrap" aria-label="本页目录">
        <div class="doc-anchor-wrap__title">本页目录</div>
        <el-anchor
          class="doc-anchor"
          container=".lab__main"
          :offset="DOC_ANCHOR_OFFSET"
          :marker="false"
          @click.capture="onDocAnchorClick"
        >
          <el-anchor-link
            v-for="item in tocItems"
            :key="item.id"
            :href="`#${item.id}`"
            :title="item.label"
          />
        </el-anchor>
      </nav>
    </Teleport>

    <header class="page-hero">
      <h1 class="page-hero__title">immer</h1>
      <p class="page-hero__lead">
        以"原地修改 draft"的写法处理不可变数据。无需手写
        <code>...spread</code>，无需引入新的数据结构，仅用普通 JS
        对象/数组/Map/Set 即可获得结构共享、引用相等与自动冻结。
      </p>
      <p class="page-hero__hint">
        安装：<code>npm install immer</code>　|　仓库：<a
          href="https://github.com/immerjs/immer"
          target="_blank"
          rel="noopener"
          >github.com/immerjs/immer</a
        >
        　|　体积：~3 KB gzipped，零依赖
      </p>
    </header>

    <Card id="intro" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">简介</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">
          Immer 的核心思想是把"对当前状态打个补丁，得到下一态"这一过程拆成两步：你在
          <code>recipe</code> 函数里面对一个临时的 <code>draft</code>
          自由"修改"——增删字段、push、splice、sort 都行——Immer
          会用代理记录这些修改，最终基于 base state
          产出一份既保留共享部分、又独立于原状态的不可变结果。
        </p>
        <ul class="bullet-list">
          <li>普通 JS 对象、数组、<code>Map</code>、<code>Set</code> 直接可用。</li>
          <li>结构共享：未变动的子树继续共享引用，<code>===</code> 仍然成立。</li>
          <li>自动冻结：返回值默认 deep frozen，意外修改会抛错。</li>
          <li>支持 JSON Patch / 逆 Patch，天然适合 undo / redo / 协同。</li>
          <li>体积极小（~3 KB gzipped），TypeScript 支持完整。</li>
        </ul>
      </CardContent>
    </Card>

    <Card id="install" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">安装</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">使用 npm / pnpm / yarn 任选其一：</p>
        <CodeBlock
          lang="javascript"
          :code="`npm install immer\npnpm add immer\nyarn add immer`"
        />
        <p class="muted" style="margin-top: 14px">
          从 v6 起，Map/Set 与 Patch 支持采用按需启用，需要时分别调用
          <code>enableMapSet()</code> / <code>enablePatches()</code>。
        </p>
      </CardContent>
    </Card>

    <Card id="quick-start" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">快速开始</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">基础示例：把第二项标记为已完成，并追加一项新 todo。</p>
        <CodeBlock :code="quickStart" />
        <p class="muted" style="margin-top: 14px">
          与"手写 spread"对比，差异主要在心智负担：
        </p>
        <CodeBlock :code="compare" />
      </CardContent>
    </Card>

    <Card id="core-api" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">核心 API</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <el-table
          :data="coreApiRows"
          border
          stripe
          size="small"
          class="doc-table"
        >
          <el-table-column prop="name" label="API" min-width="280" />
          <el-table-column prop="ret" label="返回值" width="220" />
          <el-table-column prop="desc" label="说明" min-width="320" />
        </el-table>
      </CardContent>
    </Card>

    <Card id="curried" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">柯里化 producer</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">
          只传 <code>recipe</code>，<code>produce</code>
          会返回一个新的函数，把 base state 留到调用时再传——天然适配
          Redux/Vuex 风格的 reducer：
        </p>
        <CodeBlock :code="curriedExample" />
      </CardContent>
    </Card>

    <Card id="update-patterns" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">常见更新模式</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">在 <code>recipe</code> 里你"想怎么写就怎么写"：</p>
        <el-table
          :data="updatePatternsRows"
          border
          stripe
          size="small"
          class="doc-table"
        >
          <el-table-column prop="scene" label="场景" width="220" />
          <el-table-column prop="code" label="写法" min-width="420" />
        </el-table>
      </CardContent>
    </Card>

    <Card id="patches" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">JSON Patches（撤销/重做、协同）</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">
          调用 <code>enablePatches()</code> 后，可使用
          <code>produceWithPatches</code> 同时拿到正向 & 逆向 patch；后续
          <code>applyPatches</code> 即可在两个状态间任意穿梭：
        </p>
        <CodeBlock :code="patchesExample" />
        <p class="muted" style="margin-top: 14px">
          patches 遵循 <a
            href="https://datatracker.ietf.org/doc/html/rfc6902"
            target="_blank"
            rel="noopener"
            >RFC 6902 JSON Patch</a
          > 格式（<code>op</code>/<code>path</code>/<code>value</code>），便于通过网络传输或写入历史日志。
        </p>
      </CardContent>
    </Card>

    <Card id="async" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">异步 producer</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">
          <code>recipe</code> 可以是 <code>async</code> 函数；多步异步流程也可以用
          <code>createDraft</code> / <code>finishDraft</code> 手动控制：
        </p>
        <CodeBlock :code="asyncExample" />
      </CardContent>
    </Card>

    <Card id="map-set" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">Map / Set</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">
          原生 <code>Map</code> / <code>Set</code> 默认不会被 draft，需要先调用
          <code>enableMapSet()</code> 显式开启：
        </p>
        <CodeBlock :code="mapSetExample" />
      </CardContent>
    </Card>

    <Card id="classes" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">Class 与 immerable</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">
          自定义类需要在原型/实例上设置
          <code>[immerable] = true</code>，Immer 才会为其创建 draft、保留 prototype
          链：
        </p>
        <CodeBlock :code="classesExample" />
      </CardContent>
    </Card>

    <Card id="config" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">配置 & 工具函数</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <el-table
          :data="configRows"
          border
          stripe
          size="small"
          class="doc-table"
        >
          <el-table-column prop="name" label="API" width="240" />
          <el-table-column prop="desc" label="说明" min-width="360" />
        </el-table>
        <CodeBlock :code="configExample" style="margin-top: 16px" />
      </CardContent>
    </Card>

    <Card id="pitfalls" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">常见陷阱</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <el-table
          :data="pitfallRows"
          border
          stripe
          size="small"
          class="doc-table"
        >
          <el-table-column prop="name" label="坑" width="220" />
          <el-table-column prop="desc" label="说明" min-width="380" />
        </el-table>
      </CardContent>
    </Card>

    <Card id="integration" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">与 React / Vue 集成</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">React：直接配合 <code>useState</code>，或使用社区 hook：</p>
        <CodeBlock :code="reactExample" />
        <p class="muted" style="margin-top: 16px">
          Vue 3：Immer 与 <code>ref</code> 搭配处理"纯数据快照"——把
          <code>produce</code> 的返回值赋给 <code>.value</code>
          即可获得引用相等 + 历史可追溯的好处：
        </p>
        <CodeBlock :code="vueExample" lang="vue" />
      </CardContent>
    </Card>

    <Card id="use-cases" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">典型使用场景</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <el-table
          :data="useCaseRows"
          border
          stripe
          size="small"
          class="doc-table"
        >
          <el-table-column prop="name" label="场景" width="240" />
          <el-table-column prop="desc" label="说明" min-width="360" />
        </el-table>
      </CardContent>
    </Card>

    <Card id="performance" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">性能与体积</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <ul class="bullet-list">
          <li>
            体积约 <strong>3 KB gzipped</strong>，无运行时依赖；ES 模块支持 tree shaking。
          </li>
          <li>
            结构共享：未修改的子树共享旧引用，配合 <code>React.memo</code> /
            <code>shallowRef</code> 可显著减少渲染。
          </li>
          <li>
            性能"够用就好"：单次 produce 比手写 spread 慢一点点，但远低于深拷贝；多数场景可忽略。
          </li>
          <li>
            性能敏感批处理：可临时
            <code>setAutoFreeze(false)</code>，或使用
            <code>new Immer({ autoFreeze: false })</code> 实例。
          </li>
          <li>
            生产环境建议配合 ESLint / TS 严格模式，避免在 produce 外修改 draft。
          </li>
        </ul>
      </CardContent>
    </Card>

    <footer class="docs-footer">
      <router-link class="cta" :to="{ name: 'immer-demo' }">
        打开交互示例 →
      </router-link>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.doc-section {
  margin-bottom: 24px;
  padding: 0;
  overflow: hidden;
  scroll-margin-top: 72px;
  gap: 0;
  border: 1px solid var(--separator);
  border-radius: var(--radius-sm);
}

.doc-section__header {
  padding: 16px 24px;
  background: var(--muted);
  border-bottom: 1px solid var(--separator);
}

.doc-section__body {
  padding: 24px;
}

.card-title {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: -0.2px;
  color: var(--foreground);

  &::before {
    content: '';
    display: inline-block;
    width: 3px;
    height: 14px;
    margin-right: 8px;
    vertical-align: -1px;
    border-radius: 0;
    background: var(--foreground);
  }
}

.muted {
  margin: 0 0 16px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--muted-foreground);

  code {
    padding: 2px 7px;
    font-size: 12px;
    font-weight: 500;
    background: var(--muted);
    border: 1px solid var(--border);
    border-radius: 0;
    color: var(--foreground);
  }

  a {
    color: var(--foreground);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-color: var(--border);

    &:hover {
      text-decoration-color: var(--foreground);
    }
  }
}

.doc-table {
  width: 100%;
}

.bullet-list {
  margin: 0;
  padding-left: 20px;
  font-size: 12px;
  line-height: 1.75;
  color: var(--foreground);

  li {
    margin-bottom: 6px;

    &::marker {
      color: var(--muted-foreground);
    }
  }

  code {
    padding: 2px 7px;
    font-size: 12px;
    font-weight: 500;
    background: var(--muted);
    border: 1px solid var(--border);
    border-radius: 0;
  }

  strong {
    font-weight: 600;
    color: var(--foreground);
  }
}

.docs-footer {
  padding: 32px 0 16px;
  text-align: center;
}

.cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 24px;
  font-size: 12px;
  font-weight: 400;
  font-family:
    'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    monospace;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: var(--primary-foreground);
  background: var(--primary);
  border-radius: 0;
  text-decoration: none;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
}

.doc-anchor-wrap {
  &__title {
    margin: 0 0 14px;
    padding-bottom: 10px;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.65px;
    text-transform: uppercase;
    color: var(--muted-foreground);
    border-bottom: 1px solid var(--border);
  }

  :deep(.doc-anchor.el-anchor) {
    --el-anchor-bg-color: transparent;
    background-color: transparent;
  }

  :deep(.el-anchor.el-anchor--vertical .el-anchor__list) {
    display: block;
    padding-left: 0;
  }

  :deep(.el-anchor__item) {
    display: block;
    padding-left: 10px;
    border-left: 1px solid var(--border);
  }

  :deep(.el-anchor__link) {
    display: block;
    box-sizing: border-box;
    max-width: 100%;
    padding: 5px 10px;
    font-size: 12px;
    line-height: 1.45;
    white-space: normal;
    word-break: break-word;
    color: var(--muted-foreground);
    text-decoration: none;
    border-left: 2px solid transparent;
    margin-left: -12px;
    padding-left: 12px;
    transition:
      color 0.2s,
      border-color 0.2s;

    &:hover {
      color: var(--foreground);
      border-left-color: var(--border);
    }
  }

  :deep(.el-anchor__link.is-active) {
    color: var(--foreground);
    border-left-color: var(--foreground);
  }
}
</style>
