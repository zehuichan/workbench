import{Gt as e,H as t,Jt as n,R as r,b as i,ft as a,l as o,nt as s,p as c,u as l,ut as u,v as d,w as f,xt as p,y as m}from"./chunks/runtime-core.esm-bundler.D1rrvi5M.js";import{f as h,m as g}from"./chunks/es.CKDDWwOB.js";import{t as _}from"./chunks/plugin-vue_export-helper.dQSkT9tV.js";import{t as v}from"./chunks/plus-table.Cswitrxt.js";var y={class:`demo-toolbar`},b={class:`demo-toolbar`},x={class:`demo-statusbar`},S={class:`demo-statusbar__item`},C={class:`demo-statusbar__item`},w={class:`demo-statusbar__item demo-statusbar__item--grow`},T={class:`demo-table-title`},E=_(i({__name:`playground`,setup(i){let _=[`技术部`,`产品部`,`设计部`,`市场部`],E={技术部:[`张三`,`李四`],产品部:[`王五`,`赵六`],设计部:[`陈七`,`周八`],市场部:[`周八`,`陈七`]},D=[`前端组`,`后端组`,`UI组`,`运营组`],O=[{label:`待开始`,value:`pending`},{label:`进行中`,value:`active`},{label:`已完成`,value:`done`}],k=[{label:`高`,value:`high`},{label:`中`,value:`medium`},{label:`低`,value:`low`}],A={pending:{label:`待开始`,type:`info`},active:{label:`进行中`,type:`warning`},done:{label:`已完成`,type:`success`}},j=1;function M(e){let t=[`pending`,`active`,`done`],n=[`low`,`medium`,`high`],r=_[e%_.length],i=E[r];return{id:j++,name:`任务 ${e+1} — ${[`需求评审`,`接口开发`,`联调测试`,`UI 走查`,`性能优化`][e%5]}`,status:t[e%3],priority:n[e%3],amount:1e3+e%20*500,department:r,assignee:i[e%i.length],team:D[e%D.length],remark:`备注 ${e+1}`}}let N=a(Array.from({length:30},(e,t)=>M(t))),P=a(1),F=a(10),I=o(()=>N.value.length),L=o({get:()=>{let e=(P.value-1)*F.value;return N.value.slice(e,e+F.value)},set:e=>{let t=(P.value-1)*F.value,n=Math.min(F.value,Math.max(N.value.length-t,0)),r=[...N.value];r.splice(t,n,...e),N.value=r}}),R=a(),z=a(`cell`),B=a(`change`),V=a(`—`),H=a(`—`),U=u(new Set),W=a(!0),G=a(!0),K=a(`none`),q=o(()=>K.value===`none`?!1:K.value===`container`?{mode:`container`}:!0),J=o(()=>R.value?.getModifiedRows().length??0),Y=[{key:`Ctrl+S`,override:!0,handler:()=>{Z()}},{key:`Ctrl+D`,override:!0,when:e=>e.rowIndex>=0,handler:e=>{R.value?.duplicateRow(e.rowIndex,{id:j++})}}];function X(e){V.value=`行 ${e.rowIndex+1} / ${e.prop}：${JSON.stringify(e.oldValue)} → ${JSON.stringify(e.value)}`}async function Z(){let e=await R.value?.validate();H.value=e?.valid?`OK`:`${e?.errors.length} 个错误`}function Q(){R.value?.clearValidate(),H.value=`—`}function $(){R.value?.insertRow(M(N.value.length))}async function ee(e,t){await R.value?.commitRowEdit(t)&&U.delete(e.id)}function te(e,t){R.value?.startRowEdit(t),U.add(e.id)}function ne(e,t){R.value?.cancelRowEdit(t),U.delete(e.id)}let re=[{type:`index`,label:`#`,width:50,fixed:`left`},{prop:`id`,label:`ID`,width:70,fixed:`left`,settingDisabled:!0},{prop:`name`,label:`任务名称`,minWidth:200,editable:!0,component:`input`,required:!0,rules:[{min:2,max:50,message:`长度 2–50`}]},{prop:`status`,label:`状态`,width:110,editable:!0,component:`select`,componentProps:{options:O},render:({value:e})=>{let t=A[String(e)]??{label:`未知`,type:`info`};return f(h,{type:t.type,size:`small`,disableTransitions:!0},()=>t.label)}},{prop:`priority`,label:`优先级`,width:110,editable:!0,component:`select`,componentProps:{options:k},formatter:e=>({high:`高`,medium:`中`,low:`低`})[e.priority]??``,dependencies:{triggerFields:[`status`],disabled:e=>e.status===`done`}},{prop:`amount`,label:`金额`,align:`right`,width:130,editable:!0,component:`input-number`,componentProps:{min:0,step:100,controls:!1},formatter:e=>`¥ ${(e.amount??0).toLocaleString(`zh-CN`)}`,rules:[{type:`number`,min:0,message:`金额不能为负`}]},{label:`组织信息`,children:[{prop:`department`,label:`部门`,width:120,editable:!0,component:`select`,componentProps:{options:_.map(e=>({label:e,value:e}))}},{prop:`assignee`,label:`负责人`,width:130,editable:!0,component:`select`,dependencies:{triggerFields:[`department`],required:e=>e.status===`active`,componentProps:e=>({options:(E[e.department]??[]).map(e=>({label:e,value:e}))}),trigger:(e,t)=>{(E[e.department]??[]).includes(e.assignee)||t.setValue(`assignee`,void 0)}}},{prop:`team`,label:`团队`,width:110}]},{prop:`remark`,label:`备注`,minWidth:140,editable:!0},{type:`operation`,label:`操作`,width:190,fixed:`right`,align:`center`,render:({row:e,rowIndex:t})=>{let n=e,r=[];return z.value===`row`&&(U.has(n.id)?r.push(f(g,{link:!0,type:`primary`,size:`small`,onClick:()=>ee(n,t)},()=>`保存`),f(g,{link:!0,size:`small`,onClick:()=>ne(n,t)},()=>`取消`)):r.push(f(g,{link:!0,type:`primary`,size:`small`,onClick:()=>te(n,t)},()=>`编辑`))),r.push(f(g,{link:!0,size:`small`,onClick:()=>R.value?.duplicateRow(t,{id:j++})},()=>`复制`),f(g,{link:!0,type:`danger`,size:`small`,onClick:()=>R.value?.removeRow(t)},()=>`删除`)),f(`span`,r)}}];return(i,a)=>{let o=t(`el-radio-button`),u=t(`el-radio-group`),f=t(`el-divider`),h=t(`el-checkbox`),_=t(`el-input`);return r(),c(`div`,null,[l(`div`,y,[a[21]||=l(`span`,{class:`label`},`编辑模式`,-1),m(u,{modelValue:z.value,"onUpdate:modelValue":a[0]||=e=>z.value=e,size:`small`},{default:s(()=>[m(o,{value:`none`},{default:s(()=>[...a[11]||=[d(`none`,-1)]]),_:1}),m(o,{value:`cell`},{default:s(()=>[...a[12]||=[d(`cell`,-1)]]),_:1}),m(o,{value:`row`},{default:s(()=>[...a[13]||=[d(`row`,-1)]]),_:1}),m(o,{value:`table`},{default:s(()=>[...a[14]||=[d(`table`,-1)]]),_:1})]),_:1},8,[`modelValue`]),m(f,{direction:`vertical`}),a[22]||=l(`span`,{class:`label`},`校验时机`,-1),m(u,{modelValue:B.value,"onUpdate:modelValue":a[1]||=e=>B.value=e,size:`small`},{default:s(()=>[m(o,{value:`change`},{default:s(()=>[...a[15]||=[d(`change`,-1)]]),_:1}),m(o,{value:`blur`},{default:s(()=>[...a[16]||=[d(`blur`,-1)]]),_:1}),m(o,{value:`manual`},{default:s(()=>[...a[17]||=[d(`manual`,-1)]]),_:1})]),_:1},8,[`modelValue`]),m(f,{direction:`vertical`}),m(p(g),{size:`small`,type:`primary`,onClick:Z},{default:s(()=>[...a[18]||=[d(`校验`,-1)]]),_:1}),m(p(g),{size:`small`,onClick:Q},{default:s(()=>[...a[19]||=[d(`清除校验`,-1)]]),_:1}),m(p(g),{size:`small`,onClick:$},{default:s(()=>[...a[20]||=[d(`插入行`,-1)]]),_:1})]),l(`div`,b,[m(p(g),{size:`small`,disabled:!R.value?.canUndo,onClick:a[2]||=e=>R.value?.undo()},{default:s(()=>[...a[23]||=[d(` 撤销 Ctrl+Z `,-1)]]),_:1},8,[`disabled`]),m(p(g),{size:`small`,disabled:!R.value?.canRedo,onClick:a[3]||=e=>R.value?.redo()},{default:s(()=>[...a[24]||=[d(` 重做 Ctrl+Shift+Z `,-1)]]),_:1},8,[`disabled`]),m(h,{modelValue:W.value,"onUpdate:modelValue":a[4]||=e=>W.value=e,size:`small`},{default:s(()=>[...a[25]||=[d(`启用撤销重做`,-1)]]),_:1},8,[`modelValue`]),m(f,{direction:`vertical`}),m(h,{modelValue:G.value,"onUpdate:modelValue":a[5]||=e=>G.value=e,size:`small`},{default:s(()=>[...a[26]||=[d(`启用脏数据追踪`,-1)]]),_:1},8,[`modelValue`]),m(p(g),{size:`small`,disabled:!G.value,onClick:a[6]||=e=>R.value?.resetTracking()},{default:s(()=>[...a[27]||=[d(` 重置脏标记 `,-1)]]),_:1},8,[`disabled`]),m(f,{direction:`vertical`}),a[31]||=l(`span`,{class:`label`},`自适应高度`,-1),m(u,{modelValue:K.value,"onUpdate:modelValue":a[7]||=e=>K.value=e,size:`small`},{default:s(()=>[m(o,{value:`none`},{default:s(()=>[...a[28]||=[d(`关闭`,-1)]]),_:1}),m(o,{value:`viewport`},{default:s(()=>[...a[29]||=[d(`viewport`,-1)]]),_:1}),m(o,{value:`container`},{default:s(()=>[...a[30]||=[d(`container`,-1)]]),_:1})]),_:1},8,[`modelValue`])]),l(`div`,x,[l(`span`,S,[a[32]||=l(`span`,{class:`demo-statusbar__k`},`校验`,-1),d(n(H.value),1)]),a[35]||=l(`span`,{class:`demo-statusbar__sep`},`|`,-1),l(`span`,C,[a[33]||=l(`span`,{class:`demo-statusbar__k`},`脏行数`,-1),d(n(J.value),1)]),a[36]||=l(`span`,{class:`demo-statusbar__sep`},`|`,-1),l(`span`,w,[a[34]||=l(`span`,{class:`demo-statusbar__k`},`cell-change`,-1),d(n(V.value),1)])]),l(`div`,{class:e({"demo-container-box":K.value===`container`})},[m(p(v),{ref_key:`tableRef`,ref:R,data:L.value,"onUpdate:data":a[8]||=e=>L.value=e,page:P.value,"onUpdate:page":a[9]||=e=>P.value=e,"page-size":F.value,"onUpdate:pageSize":a[10]||=e=>F.value=e,columns:re,total:I.value,"edit-mode":z.value,"validate-on":B.value,adaptive:q.value,history:W.value,"history-limit":50,"dirty-tracking":G.value,hotkeys:Y,"row-key":`id`,"column-setting":``,"settings-key":`docs-playground`,border:``,onCellChange:X},{toolbar:s(()=>[l(`span`,T,`任务管理（`+n(I.value)+` 条）`,1)]),"header-name":s(()=>[...a[37]||=[l(`span`,{style:{color:`var(--el-color-primary)`}},`任务名称`,-1)]]),"editor-remark":s(({value:e,setValue:t})=>[m(_,{"model-value":e,placeholder:`自定义编辑器插槽…`,size:`small`,"onUpdate:modelValue":t},null,8,[`model-value`,`onUpdate:modelValue`])]),_:1},8,[`data`,`page`,`page-size`,`total`,`edit-mode`,`validate-on`,`adaptive`,`history`,`dirty-tracking`])],2),a[38]||=l(`p`,{class:`demo-hint`},[d(` 提示：在列设置里隐藏「任务名称」（必填列）后点击「校验」，仍会报出该列的必填错误——校验不因列被隐藏而失效。 `),l(`code`,null,`Ctrl+S`),d(` 触发校验、`),l(`code`,null,`Ctrl+D`),d(` 复制当前行为自定义热键（`),l(`code`,null,`hotkeys`),d(` prop）示例。 `)],-1)])}}}),[[`__scopeId`,`data-v-49dcd79f`]]),D=`<script setup lang="ts">
import { computed, h, reactive, ref } from 'vue';
import { ElButton, ElTag } from 'element-plus';

import { PlusTable } from '@labs/plus-table';
import type {
  CellChangePayload,
  EditMode,
  HotkeyBinding,
  PlusTableColumn,
  ValidateOn,
} from '@labs/plus-table';

// ──── 数据 ────

interface TaskRow {
  id: number;
  name: string;
  status: 'pending' | 'active' | 'done';
  priority: 'low' | 'medium' | 'high';
  amount: number;
  department: string;
  assignee: string;
  team: string;
  remark: string;
  [key: string]: unknown;
}

const departments = ['技术部', '产品部', '设计部', '市场部'];
const departmentAssignees: Record<string, string[]> = {
  技术部: ['张三', '李四'],
  产品部: ['王五', '赵六'],
  设计部: ['陈七', '周八'],
  市场部: ['周八', '陈七'],
};
const teams = ['前端组', '后端组', 'UI组', '运营组'];

const statusOptions = [
  { label: '待开始', value: 'pending' },
  { label: '进行中', value: 'active' },
  { label: '已完成', value: 'done' },
];
const priorityOptions = [
  { label: '高', value: 'high' },
  { label: '中', value: 'medium' },
  { label: '低', value: 'low' },
];

const statusMap: Record<string, { label: string; type: 'info' | 'warning' | 'success' }> = {
  pending: { label: '待开始', type: 'info' },
  active: { label: '进行中', type: 'warning' },
  done: { label: '已完成', type: 'success' },
};

let nextId = 1;

function createRow(seed: number): TaskRow {
  const statuses: TaskRow['status'][] = ['pending', 'active', 'done'];
  const priorities: TaskRow['priority'][] = ['low', 'medium', 'high'];
  const dept = departments[seed % departments.length]!;
  const candidates = departmentAssignees[dept]!;
  return {
    id: nextId++,
    name: \`任务 \${seed + 1} — \${['需求评审', '接口开发', '联调测试', 'UI 走查', '性能优化'][seed % 5]}\`,
    status: statuses[seed % 3]!,
    priority: priorities[seed % 3]!,
    amount: 1000 + (seed % 20) * 500,
    department: dept,
    assignee: candidates[seed % candidates.length]!,
    team: teams[seed % teams.length]!,
    remark: \`备注 \${seed + 1}\`,
  };
}

const allData = ref<TaskRow[]>(Array.from({ length: 30 }, (_, i) => createRow(i)));

// ──── 分页（服务端驱动模拟：父级切片，组件不切片）────

const page = ref(1);
const pageSize = ref(10);
const total = computed(() => allData.value.length);

const pagedData = computed<TaskRow[]>({
  get: () => {
    const start = (page.value - 1) * pageSize.value;
    return allData.value.slice(start, start + pageSize.value);
  },
  // 行结构变更（增删移复制）回传当前页数组，这里合并回全量数据
  set: (rows) => {
    const start = (page.value - 1) * pageSize.value;
    const currentLen = Math.min(
      pageSize.value,
      Math.max(allData.value.length - start, 0),
    );
    const next = [...allData.value];
    next.splice(start, currentLen, ...rows);
    allData.value = next;
  },
});

// ──── 控制状态 ────

const tableRef = ref<InstanceType<typeof PlusTable>>();
const editMode = ref<EditMode>('cell');
const validateOn = ref<ValidateOn>('change');
const changeLog = ref('—');
const validationResult = ref('—');
/** row 模式下处于编辑态的行 id（仅供操作列 UI 切换按钮） */
const editingIds = reactive(new Set<number>());

// ──── 撤销重做 / 脏追踪 / 自适应模式 ────

const historyEnabled = ref(true);
const dirtyEnabled = ref(true);
const adaptiveMode = ref<'none' | 'viewport' | 'container'>('none');

const adaptiveProp = computed(() => {
  if (adaptiveMode.value === 'none') return false;
  if (adaptiveMode.value === 'container') return { mode: 'container' as const };
  return true;
});

const dirtyCount = computed(() => tableRef.value?.getModifiedRows().length ?? 0);

// ──── 自定义热键：Ctrl+S 触发校验、Ctrl+D 复制当前行 ────

const hotkeys: HotkeyBinding[] = [
  {
    key: 'Ctrl+S',
    override: true,
    handler: () => {
      void handleValidate();
    },
  },
  {
    key: 'Ctrl+D',
    override: true,
    when: (ctx) => ctx.rowIndex >= 0,
    handler: (ctx) => {
      tableRef.value?.duplicateRow(ctx.rowIndex, { id: nextId++ });
    },
  },
];

function onCellChange(payload: CellChangePayload) {
  changeLog.value = \`行 \${payload.rowIndex + 1} / \${payload.prop}：\${JSON.stringify(payload.oldValue)} → \${JSON.stringify(payload.value)}\`;
}

async function handleValidate() {
  const result = await tableRef.value?.validate();
  validationResult.value = result?.valid ? 'OK' : \`\${result?.errors.length} 个错误\`;
}

function handleClearValidate() {
  tableRef.value?.clearValidate();
  validationResult.value = '—';
}

function handleInsertRow() {
  tableRef.value?.insertRow(createRow(allData.value.length));
}

// ──── row 模式行编辑 ────

async function saveRow(row: TaskRow, rowIndex: number) {
  const ok = await tableRef.value?.commitRowEdit(rowIndex);
  if (ok) editingIds.delete(row.id);
}

function editRow(row: TaskRow, rowIndex: number) {
  tableRef.value?.startRowEdit(rowIndex);
  editingIds.add(row.id);
}

function cancelRow(row: TaskRow, rowIndex: number) {
  tableRef.value?.cancelRowEdit(rowIndex);
  editingIds.delete(row.id);
}

// ──── 列配置 ────

const columns: PlusTableColumn[] = [
  { type: 'index', label: '#', width: 50, fixed: 'left' },
  { prop: 'id', label: 'ID', width: 70, fixed: 'left', settingDisabled: true },
  {
    prop: 'name',
    label: '任务名称',
    minWidth: 200,
    editable: true,
    component: 'input',
    required: true,
    rules: [{ min: 2, max: 50, message: '长度 2–50' }],
  },
  {
    prop: 'status',
    label: '状态',
    width: 110,
    editable: true,
    component: 'select',
    componentProps: { options: statusOptions },
    render: ({ value }) => {
      const info = statusMap[String(value)] ?? { label: '未知', type: 'info' as const };
      return h(ElTag, { type: info.type, size: 'small', disableTransitions: true }, () => info.label);
    },
  },
  {
    prop: 'priority',
    label: '优先级',
    width: 110,
    editable: true,
    component: 'select',
    componentProps: { options: priorityOptions },
    formatter: (row) =>
      ({ high: '高', medium: '中', low: '低' } as Record<string, string>)[row.priority] ?? '',
    dependencies: {
      triggerFields: ['status'],
      // 已完成的任务不允许再改优先级
      disabled: (row) => row.status === 'done',
    },
  },
  {
    prop: 'amount',
    label: '金额',
    align: 'right',
    width: 130,
    editable: true,
    component: 'input-number',
    componentProps: { min: 0, step: 100, controls: false },
    formatter: (row) => \`¥ \${(row.amount ?? 0).toLocaleString('zh-CN')}\`,
    rules: [{ type: 'number', min: 0, message: '金额不能为负' }],
  },
  {
    label: '组织信息',
    children: [
      {
        prop: 'department',
        label: '部门',
        width: 120,
        editable: true,
        component: 'select',
        componentProps: { options: departments.map((d) => ({ label: d, value: d })) },
      },
      {
        prop: 'assignee',
        label: '负责人',
        width: 130,
        editable: true,
        component: 'select',
        dependencies: {
          triggerFields: ['department'],
          // 进行中的任务必须有负责人
          required: (row) => row.status === 'active',
          // 候选人随部门联动
          componentProps: (row) => ({
            options: (departmentAssignees[row.department as string] ?? []).map(
              (name) => ({ label: name, value: name }),
            ),
          }),
          // 换部门后清空负责人
          trigger: (row, api) => {
            const candidates = departmentAssignees[row.department as string] ?? [];
            if (!candidates.includes(row.assignee as string)) {
              api.setValue('assignee', undefined);
            }
          },
        },
      },
      { prop: 'team', label: '团队', width: 110 },
    ],
  },
  {
    prop: 'remark',
    label: '备注',
    minWidth: 140,
    editable: true,
  },
  {
    type: 'operation',
    label: '操作',
    width: 190,
    fixed: 'right',
    align: 'center',
    render: ({ row, rowIndex }) => {
      const task = row as TaskRow;
      const buttons = [];
      if (editMode.value === 'row') {
        if (editingIds.has(task.id)) {
          buttons.push(
            h(ElButton, { link: true, type: 'primary', size: 'small', onClick: () => saveRow(task, rowIndex) }, () => '保存'),
            h(ElButton, { link: true, size: 'small', onClick: () => cancelRow(task, rowIndex) }, () => '取消'),
          );
        } else {
          buttons.push(
            h(ElButton, { link: true, type: 'primary', size: 'small', onClick: () => editRow(task, rowIndex) }, () => '编辑'),
          );
        }
      }
      buttons.push(
        h(ElButton, { link: true, size: 'small', onClick: () => tableRef.value?.duplicateRow(rowIndex, { id: nextId++ }) }, () => '复制'),
        h(ElButton, { link: true, type: 'danger', size: 'small', onClick: () => tableRef.value?.removeRow(rowIndex) }, () => '删除'),
      );
      return h('span', buttons);
    },
  },
];
<\/script>

<template>
  <div>
    <div class="demo-toolbar">
      <span class="label">编辑模式</span>
      <el-radio-group v-model="editMode" size="small">
        <el-radio-button value="none">none</el-radio-button>
        <el-radio-button value="cell">cell</el-radio-button>
        <el-radio-button value="row">row</el-radio-button>
        <el-radio-button value="table">table</el-radio-button>
      </el-radio-group>

      <el-divider direction="vertical" />
      <span class="label">校验时机</span>
      <el-radio-group v-model="validateOn" size="small">
        <el-radio-button value="change">change</el-radio-button>
        <el-radio-button value="blur">blur</el-radio-button>
        <el-radio-button value="manual">manual</el-radio-button>
      </el-radio-group>

      <el-divider direction="vertical" />
      <el-button size="small" type="primary" @click="handleValidate">校验</el-button>
      <el-button size="small" @click="handleClearValidate">清除校验</el-button>
      <el-button size="small" @click="handleInsertRow">插入行</el-button>
    </div>

    <div class="demo-toolbar">
      <el-button size="small" :disabled="!tableRef?.canUndo" @click="tableRef?.undo()">
        撤销 Ctrl+Z
      </el-button>
      <el-button size="small" :disabled="!tableRef?.canRedo" @click="tableRef?.redo()">
        重做 Ctrl+Shift+Z
      </el-button>
      <el-checkbox v-model="historyEnabled" size="small">启用撤销重做</el-checkbox>

      <el-divider direction="vertical" />
      <el-checkbox v-model="dirtyEnabled" size="small">启用脏数据追踪</el-checkbox>
      <el-button size="small" :disabled="!dirtyEnabled" @click="tableRef?.resetTracking()">
        重置脏标记
      </el-button>

      <el-divider direction="vertical" />
      <span class="label">自适应高度</span>
      <el-radio-group v-model="adaptiveMode" size="small">
        <el-radio-button value="none">关闭</el-radio-button>
        <el-radio-button value="viewport">viewport</el-radio-button>
        <el-radio-button value="container">container</el-radio-button>
      </el-radio-group>
    </div>

    <div class="demo-statusbar">
      <span class="demo-statusbar__item">
        <span class="demo-statusbar__k">校验</span>{{ validationResult }}
      </span>
      <span class="demo-statusbar__sep">|</span>
      <span class="demo-statusbar__item">
        <span class="demo-statusbar__k">脏行数</span>{{ dirtyCount }}
      </span>
      <span class="demo-statusbar__sep">|</span>
      <span class="demo-statusbar__item demo-statusbar__item--grow">
        <span class="demo-statusbar__k">cell-change</span>{{ changeLog }}
      </span>
    </div>

    <div :class="{ 'demo-container-box': adaptiveMode === 'container' }">
      <PlusTable
        ref="tableRef"
        v-model:data="pagedData"
        v-model:page="page"
        v-model:page-size="pageSize"
        :columns="columns"
        :total="total"
        :edit-mode="editMode"
        :validate-on="validateOn"
        :adaptive="adaptiveProp"
        :history="historyEnabled"
        :history-limit="50"
        :dirty-tracking="dirtyEnabled"
        :hotkeys="hotkeys"
        row-key="id"
        column-setting
        settings-key="docs-playground"
        border
        @cell-change="onCellChange"
      >
        <template #toolbar>
          <span class="demo-table-title">任务管理（{{ total }} 条）</span>
        </template>

        <template #header-name>
          <span style="color: var(--el-color-primary)">任务名称</span>
        </template>

        <template #editor-remark="{ value, setValue }">
          <el-input
            :model-value="(value as string)"
            placeholder="自定义编辑器插槽…"
            size="small"
            @update:model-value="setValue"
          />
        </template>
      </PlusTable>
    </div>

    <p class="demo-hint">
      提示：在列设置里隐藏「任务名称」（必填列）后点击「校验」，仍会报出该列的必填错误——校验不因列被隐藏而失效。
      <code>Ctrl+S</code> 触发校验、<code>Ctrl+D</code> 复制当前行为自定义热键（<code>hotkeys</code> prop）示例。
    </p>
  </div>
</template>

<style scoped lang="scss">
.demo-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;

  .label {
    font-size: 12px;
    font-weight: 500;
    color: var(--vp-c-text-2, #666);
  }
}

.demo-statusbar {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px;
  padding: 8px 12px;
  margin-bottom: 12px;
  font-size: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  font-variant-numeric: tabular-nums;

  &__k {
    margin-right: 4px;
    font-weight: 600;
  }

  &__sep {
    margin: 0 8px;
    color: var(--el-border-color);
  }

  &__item--grow {
    flex: 1 1 200px;
    min-width: 0;
  }
}

.demo-table-title {
  margin-right: auto;
  font-size: 13px;
  font-weight: 600;
}

.demo-container-box {
  height: 320px;
  padding: 8px;
  margin-bottom: 12px;
  border: 1px dashed var(--el-border-color);
  border-radius: 4px;
}

.demo-hint {
  margin: 12px 0 0;
  font-size: 12px;
  color: var(--vp-c-text-2, #666);

  code {
    padding: 0 4px;
  }
}
</style>
`;const O=JSON.parse(`{"title":"PlusTable 综合示例","description":"PlusTable 综合交互示例，涵盖编辑模式、热键、撤销重做、脏数据追踪、联动、分页等完整功能","frontmatter":{"title":"PlusTable 综合示例","description":"PlusTable 综合交互示例，涵盖编辑模式、热键、撤销重做、脏数据追踪、联动、分页等完整功能"},"headers":[],"relativePath":"components/plus-table/playground.md","filePath":"components/plus-table/playground.md"}`);var k=i({name:`components/plus-table/playground.md`,setup(e){return(e,n)=>{let i=t(`ClientOnly`),a=t(`DemoBlock`);return r(),c(`div`,null,[n[0]||=l(`h1`,{id:`综合示例`,tabindex:`-1`},[d(`综合示例 `),l(`a`,{class:`header-anchor`,href:`#综合示例`,"aria-label":`Permalink to “综合示例”`},`​`)],-1),n[1]||=l(`p`,null,`涵盖编辑模式切换、校验时机、字段联动、多级表头、行操作、列设置、撤销重做、脏数据追踪、自定义热键、自适应高度与分页。先点击表格区域聚焦，再用键盘导航与热键。`,-1),m(a,{title:`交互示例`,description:`完整功能演示：编辑模式 / 热键 / 撤销重做 / 脏追踪 / 校验 / 联动 / 行操作 / 列设置 / 自适应高度 / 分页。`,source:p(D)},{default:s(()=>[m(i,null,{default:s(()=>[m(E)]),_:1})]),_:1},8,[`source`])])}}});export{O as __pageData,k as default};