import{H as e,R as t,b as n,d as r,ft as i,nt as a,p as o,u as s,v as c,xt as l,y as u}from"./chunks/runtime-core.esm-bundler.D1rrvi5M.js";import"./chunks/es.CKDDWwOB.js";import{t as d}from"./chunks/plus-table.CQ7lEmFH.js";var f=n({__name:`basic`,setup(e){let n=i([{id:1,name:`需求评审`,amount:1200,status:`pending`},{id:2,name:`接口开发`,amount:3400,status:`active`},{id:3,name:`联调测试`,amount:800,status:`done`}]),a=[{type:`selection`,width:55},{type:`index`,label:`#`,width:55},{prop:`id`,label:`ID`,width:80},{prop:`name`,label:`名称`,editable:!0,editor:`input`,required:!0},{prop:`amount`,label:`金额`,align:`right`,width:140,editable:!0,editor:{type:`input-number`,props:{min:0,step:100,controls:!1}},formatter:e=>`¥ ${(e.amount??0).toLocaleString(`zh-CN`)}`},{prop:`status`,label:`状态`,width:140,editable:!0,editor:{type:`select`,props:{options:[{label:`待开始`,value:`pending`},{label:`进行中`,value:`active`},{label:`已完成`,value:`done`}]}},formatter:e=>({pending:`待开始`,active:`进行中`,done:`已完成`})[e.status]??``}];return(e,i)=>(t(),r(l(d),{data:n.value,"onUpdate:data":i[0]||=e=>n.value=e,columns:a,"row-key":`id`,border:``},null,8,[`data`]))}}),p=`<script setup lang="ts">
// @ts-nocheck — demo 展示日常写法：data/columns 均不做显式泛型标注
import { ref } from 'vue';

import { PlusTable } from '@labs/plus-table';

const data = ref([
  { id: 1, name: '需求评审', amount: 1200, status: 'pending' },
  { id: 2, name: '接口开发', amount: 3400, status: 'active' },
  { id: 3, name: '联调测试', amount: 800, status: 'done' },
]);

const columns = [
  { type: 'selection', width: 55 },
  { type: 'index', label: '#', width: 55 },
  { prop: 'id', label: 'ID', width: 80 },
  {
    prop: 'name',
    label: '名称',
    editable: true,
    editor: 'input',
    required: true,
  },
  {
    prop: 'amount',
    label: '金额',
    align: 'right',
    width: 140,
    editable: true,
    editor: { type: 'input-number', props: { min: 0, step: 100, controls: false } },
    formatter: (row) => \`¥ \${(row.amount ?? 0).toLocaleString('zh-CN')}\`,
  },
  {
    prop: 'status',
    label: '状态',
    width: 140,
    editable: true,
    editor: {
      type: 'select',
      props: {
        options: [
          { label: '待开始', value: 'pending' },
          { label: '进行中', value: 'active' },
          { label: '已完成', value: 'done' },
        ],
      },
    },
    formatter: (row) =>
      ({ pending: '待开始', active: '进行中', done: '已完成' } as Record<string, string>)[
        row.status
      ] ?? '',
  },
];
<\/script>

<template>
  <PlusTable v-model:data="data" :columns="columns" row-key="id" border />
</template>
`;const m=JSON.parse(`{"title":"PlusTable 基础用法","description":"PlusTable 基础用法示例","frontmatter":{"title":"PlusTable 基础用法","description":"PlusTable 基础用法示例"},"headers":[],"relativePath":"components/plus-table/basic.md","filePath":"components/plus-table/basic.md"}`);var h=n({name:`components/plus-table/basic.md`,setup(n){return(n,r)=>{let i=e(`ClientOnly`),d=e(`DemoBlock`);return t(),o(`div`,null,[r[0]||=s(`h1`,{id:`基础用法`,tabindex:`-1`},[c(`基础用法 `),s(`a`,{class:`header-anchor`,href:`#基础用法`,"aria-label":`Permalink to “基础用法”`},`​`)],-1),u(d,{title:`基础用法`,description:`配置式列 + cell 编辑模式：双击 / Enter / F2 进入编辑，直接打字覆盖输入。`,source:l(p)},{default:a(()=>[u(i,null,{default:a(()=>[u(f)]),_:1})]),_:1},8,[`source`])])}}});export{m as __pageData,h as default};