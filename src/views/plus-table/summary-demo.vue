<script setup lang="ts">
import { ref } from 'vue';
import DemoApiTable from '@/components/demo/demo-api-table.vue';
import DemoBlock from '@/components/demo/demo-block.vue';
import DemoPage from '@/components/demo/demo-page.vue';
import { defineColumns, PlusTable, useSummaries } from '@/components/plus-table';

defineOptions({ name: 'SummaryDemo' });

const cargoRows = ref([
  { id: 1, name: '纸箱 A', piece: 10, weight: 12.5, amount: 320 },
  { id: 2, name: '木箱 B', piece: 4, weight: 48.2, amount: 1560.5 },
  { id: 3, name: '托盘 C', piece: 2, weight: 105.75, amount: 880 },
]);

const feeRows = ref([
  { id: 1, name: '运费', currency: 'CNY', amount: 1200 },
  { id: 2, name: '报关', currency: 'CNY', amount: 350.5 },
  { id: 3, name: '海运', currency: 'USD', amount: 420 },
  { id: 4, name: '码头费', currency: 'USD', amount: 85.25 },
  { id: 5, name: '保险', currency: 'EUR', amount: 60 },
]);

const cargoColumns = defineColumns([
  { type: 'index', label: '#', width: 56 },
  { prop: 'name', label: '品名', minWidth: 140 },
  {
    prop: 'piece',
    label: '件数',
    width: 100,
    editable: true,
    component: 'input-number',
    componentProps: { min: 0, controls: false },
  },
  {
    prop: 'weight',
    label: '重量 (kg)',
    width: 120,
    editable: true,
    component: 'input-number',
    componentProps: { min: 0, step: 0.1, controls: false },
  },
  {
    prop: 'amount',
    label: '金额',
    width: 120,
    editable: true,
    component: 'input-number',
    componentProps: { min: 0, step: 0.01, controls: false },
  },
]);

const feeColumns = defineColumns([
  { type: 'index', label: '#', width: 56 },
  { prop: 'name', label: '费用', minWidth: 120 },
  { prop: 'currency', label: '币种', width: 100 },
  {
    prop: 'amount',
    label: '金额',
    width: 140,
    editable: true,
    component: 'input-number',
    componentProps: { min: 0, step: 0.01, controls: false },
  },
]);

const { summaryMethod: cargoSummary } = useSummaries({
  piece: 0,
  weight: 1,
  amount: 2,
});

const { summaryMethod: feeSummary } = useSummaries(
  { amount: 2 },
  {
    groupBy: 'currency',
  },
);
</script>

<template>
  <DemoPage width="wide">
    <template #description>
      <code>useSummaries</code> 返回可直接绑到 <code>summary-method</code> 的函数（经
      <code>$attrs</code> 透传给 <code>el-table</code>），同时需传 <code>show-summary</code>。数组 /
      对象配置做按列求和；<code>groupBy</code> 做分组合计。
    </template>

    <template #api>
      <DemoApiTable title="useSummaries(columns, options?)" :headers="['参数', '类型', '说明']">
        <tr>
          <td><code>columns</code></td>
          <td>
            <code
              >MaybeRefOrGetter&lt;string[] | Record&lt;prop, number |
              SummaryColumnOptions&gt;&gt;</code
            >
          </td>
          <td>
            必填。数组：参与求和的列；对象：每列精度数字或
            <code>{ precision, value, format }</code>。
          </td>
        </tr>
        <tr>
          <td><code>options.label</code></td>
          <td><code>string</code></td>
          <td>默认 <code>'合计'</code>。首列文案。</td>
        </tr>
        <tr>
          <td><code>options.precision</code></td>
          <td><code>number</code></td>
          <td>默认 <code>2</code>。未单独指定时的小数位。</td>
        </tr>
        <tr>
          <td><code>options.groupBy</code></td>
          <td><code>keyof T | (row) =&gt; string</code></td>
          <td>可选。分组键；给定后每列输出每组一行的堆叠内容。</td>
        </tr>
        <tr>
          <td><code>options.groupLabelProp</code></td>
          <td><code>keyof T</code></td>
          <td>显示分组键的列；<code>groupBy</code> 为字段名时默认就是它。</td>
        </tr>
        <tr>
          <td><code>options.groupLabel</code></td>
          <td><code>(key, rows) =&gt; string</code></td>
          <td>可选。分组键文案，默认 <code>String(key)</code>。</td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="返回值" :headers="['名称', '类型', '说明']">
        <tr>
          <td><code>summaryMethod</code></td>
          <td><code>SummaryMethod&lt;T&gt;</code></td>
          <td>绑到 <code>:summary-method</code>；需同时传 <code>show-summary</code>。</td>
        </tr>
      </DemoApiTable>
    </template>

    <DemoBlock title="按列求和">
      <template #hint>
        件数 0 位、重量 1 位、金额 2 位。编辑单元格后合计行随当前页
        <code>data</code> 重算。
      </template>
      <PlusTable
        :data="cargoRows"
        :columns="cargoColumns"
        row-key="id"
        mode="cell"
        border
        show-summary
        :summary-method="cargoSummary"
      />
    </DemoBlock>

    <DemoBlock title="按币种分组合计">
      <template #hint>
        <code>groupBy: 'currency'</code> +
        <code>groupLabel</code> 映射币种名；合计行在币种列与金额列各堆叠一组。
      </template>
      <PlusTable
        :data="feeRows"
        :columns="feeColumns"
        row-key="id"
        mode="cell"
        border
        show-summary
        :summary-method="feeSummary"
      />
    </DemoBlock>
  </DemoPage>
</template>
