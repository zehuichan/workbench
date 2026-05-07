import{B as e,I as t,Q as n,R as r,_ as i,a,d as o,f as s,g as c,ht as l,i as u,p as d,u as f,v as p,w as m,y as h}from"./runtime-core.esm-bundler-DAHneJiJ.js";import{t as g}from"./injection-keys-vtq1A2qT.js";import{t as _}from"./_plugin-vue_export-helper-TcpyXLsZ.js";import{a as v,i as y,n as b,r as x,t as S}from"./code-block-CmA2DAcR.js";var C={class:`doc-anchor-wrap`,"aria-label":`本页目录`},w={class:`docs-footer`},T=72,E=`import { produce } from 'immer';

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
console.log(baseState === nextState); // false`,D=`// 不使用 Immer：每一层都要手动 spread，极易出错
const next = state.slice();
next[1] = { ...next[1], done: true };
next.push({ title: 'Tweet about it', done: false });

// 使用 Immer：直接"原地修改"draft，原 state 不动
const next2 = produce(state, (draft) => {
  draft[1].done = true;
  draft.push({ title: 'Tweet about it', done: false });
});`,O=`import { produce } from 'immer';

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
const reducer = produce((d /* draft */) => { /* ... */ }, []);`,k=`import { produceWithPatches, applyPatches, enablePatches } from 'immer';

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
const redone = applyPatches(undone, patches);      // === next`,A=`import { produce } from 'immer';

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
const final = finishDraft(draft);`,j=`import { produce, enableMapSet } from 'immer';

enableMapSet(); // 全局开启一次即可

const base = new Map<string, number>([['a', 1]]);

const next = produce(base, (draft) => {
  draft.set('b', 2);
  draft.delete('a');
});

console.log([...next.entries()]); // [['b', 2]]
console.log(base === next);       // false，base 仍为 { a: 1 }`,M=`import { produce, immerable } from 'immer';

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
next.done;            // true`,N=`import {
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
const next = noFreezeImmer.produce(state, (d) => { d.x = 1 });`,P=`// 与 React useState 搭配
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
});`,F=`// 与 Vue 3 ref/reactive 配合：Immer 适合"纯数据快照"
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
}`,I=_(h({__name:`docs`,setup(h){let _=m(g),I=[{name:`produce(base, recipe, listener?)`,ret:`NextState`,desc:`核心函数。在 recipe 内对 draft 自由"修改"，返回不可变的下一态`},{name:`produce(recipe, initialState?)`,ret:`CurriedProducer`,desc:`柯里化形式，先传 recipe 得到一个 (state, ...args) => nextState 的 reducer`},{name:`produceWithPatches(base, recipe)`,ret:`[next, patches, inversePatches]`,desc:`同时返回 JSON Patch 与逆 patch，可用于撤销/重做、协同`},{name:`applyPatches(base, patches)`,ret:`NextState`,desc:`把若干 JSON Patch 应用到一个状态上，得到新状态`},{name:`createDraft(base)`,ret:`Draft`,desc:`手动创建 draft，可在多次同步操作之间共享`},{name:`finishDraft(draft, listener?)`,ret:`NextState`,desc:`结束手动 draft，得到最终不可变状态`},{name:`current(draft)`,ret:`Snapshot`,desc:`取出 draft 当前快照（不再继续追踪），用于 log/比对`},{name:`original(draft)`,ret:`BaseState`,desc:`取出 draft 对应的原始（base）值`},{name:`isDraft(value)`,ret:`boolean`,desc:`判断一个值是否为 Immer draft`},{name:`isDraftable(value)`,ret:`boolean`,desc:`判断 Immer 是否能为该值创建 draft（普通对象、数组、Map、Set、带 [immerable] 的类）`},{name:`castDraft / castImmutable`,ret:`T`,desc:`TypeScript 辅助：在不变值与 draft 间做"零成本"类型转换`}],L=[{name:`setAutoFreeze(enabled)`,desc:`开启/关闭自动冻结。默认开启，保证返回值不可变；批量场景可关闭以提升性能`},{name:`enableMapSet()`,desc:`启用对原生 Map / Set 的 draft 支持（按需开启，避免捆绑额外代码）`},{name:`enablePatches()`,desc:`启用 JSON Patch 输出。produceWithPatches 与 listener 参数均依赖此开关`},{name:`freeze(value, deep?)`,desc:`主动深/浅冻结对象（绕过 produce 直接得到不可变值）`},{name:`immerable`,desc:`Symbol 标记：在自定义类上设 [immerable] = true，让 Immer 接管该类实例的 draft`},{name:`Immer 类`,desc:`可 new 一个独立配置的 Immer 实例：new Immer({ autoFreeze: false })`}],R=[{scene:`更新对象字段`,code:`draft.user.name = "Alice"`},{scene:`新增 / 删除字段`,code:`draft.flag = true; delete draft.tmp`},{scene:`末尾追加元素`,code:`draft.list.push(item)`},{scene:`按索引修改`,code:`draft.list[0].done = true`},{scene:`替换数组`,code:`draft.list = newList  // 注意：根 draft 不能整体替换，需 return newList`},{scene:`删除元素`,code:`draft.list.splice(idx, 1)  /  draft.list = draft.list.filter(...)`},{scene:`插入到指定位置`,code:`draft.list.splice(idx, 0, item)`},{scene:`排序`,code:`draft.list.sort((a, b) => a.id - b.id)`},{scene:`清空`,code:`draft.list.length = 0  /  draft.list = []`},{scene:`替换根状态`,code:`return newState  // 直接 return 即可整体替换（仅根 draft）`},{scene:`产生"无变化"`,code:`不写任何修改 / return undefined  →  原对象引用被复用`},{scene:`取消变更`,code:`return nothing  // 表示"下一态是 undefined"`}],z=[{name:`不要解构后再赋值`,desc:`const { user } = draft; user.name = "x" 仍可生效；但 const u = { ...draft.user } 后修改 u 不会被记录`},{name:`根 draft 不能整体替换`,desc:`在 recipe 内写 draft = newState 无效；要么 return newState，要么逐字段赋值`},{name:`同时 mutate + return`,desc:`产生异常。要么改 draft，要么返回新值，二者只能选一`},{name:`修改了被冻结的对象`,desc:`Immer 的输出默认 frozen；后续若需修改请再次走 produce`},{name:`Map/Set 默认未启用`,desc:`需先 enableMapSet()，否则把 Map/Set 当作普通对象处理`},{name:`Patch 默认未启用`,desc:`produceWithPatches、listener 需先 enablePatches()`},{name:`Class 实例需要 [immerable]`,desc:`否则 Immer 不会为其创建 draft（保留引用，按"不可 draft"处理）`}],B=[{name:`Redux / Pinia / Vuex reducer`,desc:`把 switch case 内的"手写不可变更新"全部替换为 produce(state, draft => {...})`},{name:`React useState`,desc:`setState(produce(s => { s.x = 1 })) 或配合 use-immer 提供的 useImmer hook`},{name:`Vue 3 reactive 之外的纯数据`,desc:`需要"快照 + 引用相等"语义时（如缓存键、props 比对），用 Immer 替代深拷贝`},{name:`撤销 / 重做`,desc:`produceWithPatches 收集 patches & inversePatches，applyPatches 即可时光穿梭`},{name:`协同 / 增量同步`,desc:`把 JSON Patch 通过网络发送给协作方，applyPatches 完成合并`},{name:`大量层级的配置树`,desc:`深层修改不再写一连串 ...spread；同时保持结构共享，节省内存与渲染`}],V=[{id:`intro`,label:`简介`},{id:`install`,label:`安装`},{id:`quick-start`,label:`快速开始`},{id:`core-api`,label:`核心 API`},{id:`curried`,label:`柯里化 producer`},{id:`update-patterns`,label:`常见更新模式`},{id:`patches`,label:`JSON Patches`},{id:`async`,label:`异步 producer`},{id:`map-set`,label:`Map / Set`},{id:`classes`,label:`Class 与 immerable`},{id:`config`,label:`配置 & 工具函数`},{id:`pitfalls`,label:`常见陷阱`},{id:`integration`,label:`与 React / Vue 集成`},{id:`use-cases`,label:`典型使用场景`},{id:`performance`,label:`性能与体积`}];function H(e){e.preventDefault()}return(m,h)=>{let g=e(`el-anchor-link`),U=e(`el-anchor`),W=e(`el-table-column`),G=e(`el-table`),K=e(`router-link`);return t(),d(`div`,null,[l(_)?(t(),o(a,{key:0,to:l(_)},[f(`nav`,C,[h[0]||=f(`div`,{class:`doc-anchor-wrap__title`},`本页目录`,-1),p(U,{class:`doc-anchor`,container:`.lab__main`,offset:T,marker:!1,onClickCapture:H},{default:n(()=>[(t(),d(u,null,r(V,e=>p(g,{key:e.id,href:`#${e.id}`,title:e.label},null,8,[`href`,`title`])),64))]),_:1})])],8,[`to`])):s(``,!0),h[32]||=c(`<header class="page-hero" data-v-e6f072d5><h1 class="page-hero__title" data-v-e6f072d5>immer</h1><p class="page-hero__lead" data-v-e6f072d5> 以&quot;原地修改 draft&quot;的写法处理不可变数据。无需手写 <code data-v-e6f072d5>...spread</code>，无需引入新的数据结构，仅用普通 JS 对象/数组/Map/Set 即可获得结构共享、引用相等与自动冻结。 </p><p class="page-hero__hint" data-v-e6f072d5> 安装：<code data-v-e6f072d5>npm install immer</code>　|　仓库：<a href="https://github.com/immerjs/immer" target="_blank" rel="noopener" data-v-e6f072d5>github.com/immerjs/immer</a> 　|　体积：~3 KB gzipped，零依赖 </p></header>`,1),p(l(v),{id:`intro`,class:`doc-section rounded-sm`},{default:n(()=>[p(l(x),{class:`doc-section__header`},{default:n(()=>[p(l(b),{class:`card-title`},{default:n(()=>[...h[1]||=[i(`简介`,-1)]]),_:1})]),_:1}),p(l(y),{class:`doc-section__body`},{default:n(()=>[...h[2]||=[f(`p`,{class:`muted`},[i(` Immer 的核心思想是把"对当前状态打个补丁，得到下一态"这一过程拆成两步：你在 `),f(`code`,null,`recipe`),i(` 函数里面对一个临时的 `),f(`code`,null,`draft`),i(` 自由"修改"——增删字段、push、splice、sort 都行——Immer 会用代理记录这些修改，最终基于 base state 产出一份既保留共享部分、又独立于原状态的不可变结果。 `)],-1),f(`ul`,{class:`bullet-list`},[f(`li`,null,[i(`普通 JS 对象、数组、`),f(`code`,null,`Map`),i(`、`),f(`code`,null,`Set`),i(` 直接可用。`)]),f(`li`,null,[i(`结构共享：未变动的子树继续共享引用，`),f(`code`,null,`===`),i(` 仍然成立。`)]),f(`li`,null,`自动冻结：返回值默认 deep frozen，意外修改会抛错。`),f(`li`,null,`支持 JSON Patch / 逆 Patch，天然适合 undo / redo / 协同。`),f(`li`,null,`体积极小（~3 KB gzipped），TypeScript 支持完整。`)],-1)]]),_:1})]),_:1}),p(l(v),{id:`install`,class:`doc-section rounded-sm`},{default:n(()=>[p(l(x),{class:`doc-section__header`},{default:n(()=>[p(l(b),{class:`card-title`},{default:n(()=>[...h[3]||=[i(`安装`,-1)]]),_:1})]),_:1}),p(l(y),{class:`doc-section__body`},{default:n(()=>[h[4]||=f(`p`,{class:`muted`},`使用 npm / pnpm / yarn 任选其一：`,-1),p(S,{lang:`javascript`,code:`npm install immer
pnpm add immer
yarn add immer`}),h[5]||=f(`p`,{class:`muted`,style:{"margin-top":`14px`}},[i(` 从 v6 起，Map/Set 与 Patch 支持采用按需启用，需要时分别调用 `),f(`code`,null,`enableMapSet()`),i(` / `),f(`code`,null,`enablePatches()`),i(`。 `)],-1)]),_:1})]),_:1}),p(l(v),{id:`quick-start`,class:`doc-section rounded-sm`},{default:n(()=>[p(l(x),{class:`doc-section__header`},{default:n(()=>[p(l(b),{class:`card-title`},{default:n(()=>[...h[6]||=[i(`快速开始`,-1)]]),_:1})]),_:1}),p(l(y),{class:`doc-section__body`},{default:n(()=>[h[7]||=f(`p`,{class:`muted`},`基础示例：把第二项标记为已完成，并追加一项新 todo。`,-1),p(S,{code:E}),h[8]||=f(`p`,{class:`muted`,style:{"margin-top":`14px`}},` 与"手写 spread"对比，差异主要在心智负担： `,-1),p(S,{code:D})]),_:1})]),_:1}),p(l(v),{id:`core-api`,class:`doc-section rounded-sm`},{default:n(()=>[p(l(x),{class:`doc-section__header`},{default:n(()=>[p(l(b),{class:`card-title`},{default:n(()=>[...h[9]||=[i(`核心 API`,-1)]]),_:1})]),_:1}),p(l(y),{class:`doc-section__body`},{default:n(()=>[p(G,{data:I,border:``,stripe:``,size:`small`,class:`doc-table`},{default:n(()=>[p(W,{prop:`name`,label:`API`,"min-width":`280`}),p(W,{prop:`ret`,label:`返回值`,width:`220`}),p(W,{prop:`desc`,label:`说明`,"min-width":`320`})]),_:1})]),_:1})]),_:1}),p(l(v),{id:`curried`,class:`doc-section rounded-sm`},{default:n(()=>[p(l(x),{class:`doc-section__header`},{default:n(()=>[p(l(b),{class:`card-title`},{default:n(()=>[...h[10]||=[i(`柯里化 producer`,-1)]]),_:1})]),_:1}),p(l(y),{class:`doc-section__body`},{default:n(()=>[h[11]||=f(`p`,{class:`muted`},[i(` 只传 `),f(`code`,null,`recipe`),i(`，`),f(`code`,null,`produce`),i(` 会返回一个新的函数，把 base state 留到调用时再传——天然适配 Redux/Vuex 风格的 reducer： `)],-1),p(S,{code:O})]),_:1})]),_:1}),p(l(v),{id:`update-patterns`,class:`doc-section rounded-sm`},{default:n(()=>[p(l(x),{class:`doc-section__header`},{default:n(()=>[p(l(b),{class:`card-title`},{default:n(()=>[...h[12]||=[i(`常见更新模式`,-1)]]),_:1})]),_:1}),p(l(y),{class:`doc-section__body`},{default:n(()=>[h[13]||=f(`p`,{class:`muted`},[i(`在 `),f(`code`,null,`recipe`),i(` 里你"想怎么写就怎么写"：`)],-1),p(G,{data:R,border:``,stripe:``,size:`small`,class:`doc-table`},{default:n(()=>[p(W,{prop:`scene`,label:`场景`,width:`220`}),p(W,{prop:`code`,label:`写法`,"min-width":`420`})]),_:1})]),_:1})]),_:1}),p(l(v),{id:`patches`,class:`doc-section rounded-sm`},{default:n(()=>[p(l(x),{class:`doc-section__header`},{default:n(()=>[p(l(b),{class:`card-title`},{default:n(()=>[...h[14]||=[i(`JSON Patches（撤销/重做、协同）`,-1)]]),_:1})]),_:1}),p(l(y),{class:`doc-section__body`},{default:n(()=>[h[15]||=f(`p`,{class:`muted`},[i(` 调用 `),f(`code`,null,`enablePatches()`),i(` 后，可使用 `),f(`code`,null,`produceWithPatches`),i(` 同时拿到正向 & 逆向 patch；后续 `),f(`code`,null,`applyPatches`),i(` 即可在两个状态间任意穿梭： `)],-1),p(S,{code:k}),h[16]||=f(`p`,{class:`muted`,style:{"margin-top":`14px`}},[i(` patches 遵循 `),f(`a`,{href:`https://datatracker.ietf.org/doc/html/rfc6902`,target:`_blank`,rel:`noopener`},`RFC 6902 JSON Patch`),i(` 格式（`),f(`code`,null,`op`),i(`/`),f(`code`,null,`path`),i(`/`),f(`code`,null,`value`),i(`），便于通过网络传输或写入历史日志。 `)],-1)]),_:1})]),_:1}),p(l(v),{id:`async`,class:`doc-section rounded-sm`},{default:n(()=>[p(l(x),{class:`doc-section__header`},{default:n(()=>[p(l(b),{class:`card-title`},{default:n(()=>[...h[17]||=[i(`异步 producer`,-1)]]),_:1})]),_:1}),p(l(y),{class:`doc-section__body`},{default:n(()=>[h[18]||=f(`p`,{class:`muted`},[f(`code`,null,`recipe`),i(` 可以是 `),f(`code`,null,`async`),i(` 函数；多步异步流程也可以用 `),f(`code`,null,`createDraft`),i(` / `),f(`code`,null,`finishDraft`),i(` 手动控制： `)],-1),p(S,{code:A})]),_:1})]),_:1}),p(l(v),{id:`map-set`,class:`doc-section rounded-sm`},{default:n(()=>[p(l(x),{class:`doc-section__header`},{default:n(()=>[p(l(b),{class:`card-title`},{default:n(()=>[...h[19]||=[i(`Map / Set`,-1)]]),_:1})]),_:1}),p(l(y),{class:`doc-section__body`},{default:n(()=>[h[20]||=f(`p`,{class:`muted`},[i(` 原生 `),f(`code`,null,`Map`),i(` / `),f(`code`,null,`Set`),i(` 默认不会被 draft，需要先调用 `),f(`code`,null,`enableMapSet()`),i(` 显式开启： `)],-1),p(S,{code:j})]),_:1})]),_:1}),p(l(v),{id:`classes`,class:`doc-section rounded-sm`},{default:n(()=>[p(l(x),{class:`doc-section__header`},{default:n(()=>[p(l(b),{class:`card-title`},{default:n(()=>[...h[21]||=[i(`Class 与 immerable`,-1)]]),_:1})]),_:1}),p(l(y),{class:`doc-section__body`},{default:n(()=>[h[22]||=f(`p`,{class:`muted`},[i(` 自定义类需要在原型/实例上设置 `),f(`code`,null,`[immerable] = true`),i(`，Immer 才会为其创建 draft、保留 prototype 链： `)],-1),p(S,{code:M})]),_:1})]),_:1}),p(l(v),{id:`config`,class:`doc-section rounded-sm`},{default:n(()=>[p(l(x),{class:`doc-section__header`},{default:n(()=>[p(l(b),{class:`card-title`},{default:n(()=>[...h[23]||=[i(`配置 & 工具函数`,-1)]]),_:1})]),_:1}),p(l(y),{class:`doc-section__body`},{default:n(()=>[p(G,{data:L,border:``,stripe:``,size:`small`,class:`doc-table`},{default:n(()=>[p(W,{prop:`name`,label:`API`,width:`240`}),p(W,{prop:`desc`,label:`说明`,"min-width":`360`})]),_:1}),p(S,{code:N,style:{"margin-top":`16px`}})]),_:1})]),_:1}),p(l(v),{id:`pitfalls`,class:`doc-section rounded-sm`},{default:n(()=>[p(l(x),{class:`doc-section__header`},{default:n(()=>[p(l(b),{class:`card-title`},{default:n(()=>[...h[24]||=[i(`常见陷阱`,-1)]]),_:1})]),_:1}),p(l(y),{class:`doc-section__body`},{default:n(()=>[p(G,{data:z,border:``,stripe:``,size:`small`,class:`doc-table`},{default:n(()=>[p(W,{prop:`name`,label:`坑`,width:`220`}),p(W,{prop:`desc`,label:`说明`,"min-width":`380`})]),_:1})]),_:1})]),_:1}),p(l(v),{id:`integration`,class:`doc-section rounded-sm`},{default:n(()=>[p(l(x),{class:`doc-section__header`},{default:n(()=>[p(l(b),{class:`card-title`},{default:n(()=>[...h[25]||=[i(`与 React / Vue 集成`,-1)]]),_:1})]),_:1}),p(l(y),{class:`doc-section__body`},{default:n(()=>[h[26]||=f(`p`,{class:`muted`},[i(`React：直接配合 `),f(`code`,null,`useState`),i(`，或使用社区 hook：`)],-1),p(S,{code:P}),h[27]||=f(`p`,{class:`muted`,style:{"margin-top":`16px`}},[i(` Vue 3：Immer 与 `),f(`code`,null,`ref`),i(` 搭配处理"纯数据快照"——把 `),f(`code`,null,`produce`),i(` 的返回值赋给 `),f(`code`,null,`.value`),i(` 即可获得引用相等 + 历史可追溯的好处： `)],-1),p(S,{code:F,lang:`vue`})]),_:1})]),_:1}),p(l(v),{id:`use-cases`,class:`doc-section rounded-sm`},{default:n(()=>[p(l(x),{class:`doc-section__header`},{default:n(()=>[p(l(b),{class:`card-title`},{default:n(()=>[...h[28]||=[i(`典型使用场景`,-1)]]),_:1})]),_:1}),p(l(y),{class:`doc-section__body`},{default:n(()=>[p(G,{data:B,border:``,stripe:``,size:`small`,class:`doc-table`},{default:n(()=>[p(W,{prop:`name`,label:`场景`,width:`240`}),p(W,{prop:`desc`,label:`说明`,"min-width":`360`})]),_:1})]),_:1})]),_:1}),p(l(v),{id:`performance`,class:`doc-section rounded-sm`},{default:n(()=>[p(l(x),{class:`doc-section__header`},{default:n(()=>[p(l(b),{class:`card-title`},{default:n(()=>[...h[29]||=[i(`性能与体积`,-1)]]),_:1})]),_:1}),p(l(y),{class:`doc-section__body`},{default:n(()=>[...h[30]||=[f(`ul`,{class:`bullet-list`},[f(`li`,null,[i(` 体积约 `),f(`strong`,null,`3 KB gzipped`),i(`，无运行时依赖；ES 模块支持 tree shaking。 `)]),f(`li`,null,[i(` 结构共享：未修改的子树共享旧引用，配合 `),f(`code`,null,`React.memo`),i(` / `),f(`code`,null,`shallowRef`),i(` 可显著减少渲染。 `)]),f(`li`,null,` 性能"够用就好"：单次 produce 比手写 spread 慢一点点，但远低于深拷贝；多数场景可忽略。 `),f(`li`,null,[i(` 性能敏感批处理：可临时 `),f(`code`,null,`setAutoFreeze(false)`),i(`，或使用 `),f(`code`,null,`new Immer({ autoFreeze: false })`),i(` 实例。 `)]),f(`li`,null,` 生产环境建议配合 ESLint / TS 严格模式，避免在 produce 外修改 draft。 `)],-1)]]),_:1})]),_:1}),f(`footer`,w,[p(K,{class:`cta`,to:{name:`immer-demo`}},{default:n(()=>[...h[31]||=[i(` 打开交互示例 → `,-1)]]),_:1})])])}}}),[[`__scopeId`,`data-v-e6f072d5`]]);export{I as default};