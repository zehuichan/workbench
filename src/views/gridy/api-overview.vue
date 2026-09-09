<script setup lang="ts">
import DemoApiTable from '@/components/demo/demo-api-table.vue';
import DemoPage from '@/components/demo/demo-page.vue';

defineOptions({ name: 'GridyApiOverview' });
</script>

<template>
  <DemoPage width="wide">
    <template #description>
      Gridy 是可编辑数据网格：单元格常驻编辑控件、行增删、校验、分页与树形。UI 控件走 Element
      Plus，字符串
      <code>component</code>
      名与 Filters / PlusTable 共用
      <code>initComponentAdapter</code>
      组件表。交互演示见侧栏「基础编辑」。
    </template>

    <template #api>
      <DemoApiTable title="Props">
        <tr>
          <td><code>modelValue</code> / <code>v-model</code></td>
          <td><code>GridyRecord[]</code></td>
          <td>表格数据。分页时只放当前页。</td>
        </tr>
        <tr>
          <td><code>columns</code></td>
          <td><code>GridyColumn[]</code></td>
          <td>
            必填。数组顺序即渲染顺序。特殊列
            <code>type: 'selection' | 'index' | 'action' | 'expand'</code>
            ，其余为数据列。
          </td>
        </tr>
        <tr>
          <td><code>row-key</code></td>
          <td><code>string | (row, index) =&gt; string | number</code></td>
          <td>行主键；缺省按行对象引用生成稳定 key。</td>
        </tr>
        <tr>
          <td><code>disabled</code></td>
          <td><code>boolean</code></td>
          <td>只读展示：隐藏编辑入口，保留浏览能力。</td>
        </tr>
        <tr>
          <td><code>add-button</code></td>
          <td><code>boolean | { text?: string }</code></td>
          <td>底部「添加一行」。默认开启；<code>false</code> 隐藏。</td>
        </tr>
        <tr>
          <td><code>toolbar</code></td>
          <td><code>boolean | GridyToolbarConfig</code></td>
          <td>
            工具栏。可配 <code>title</code> / <code>items</code>，或用 <code>#toolbar</code>。
          </td>
        </tr>
        <tr>
          <td><code>pagination</code></td>
          <td><code>GridyPagination</code></td>
          <td>
            后端分页：组件不切片，翻页 emit
            <code>pageChange</code>。
          </td>
        </tr>
        <tr>
          <td><code>size</code></td>
          <td><code>'large' | 'middle' | 'small'</code></td>
          <td>
            默认 <code>small</code>。<code>middle</code> 对应 Element Plus <code>default</code>。
          </td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="数据列关键字段">
        <tr>
          <td><code>field</code></td>
          <td><code>string</code></td>
          <td>行对象字段名。</td>
        </tr>
        <tr>
          <td><code>component</code></td>
          <td><code>ComponentType | Component</code></td>
          <td>
            编辑控件。内置：<code>input</code> / <code>textarea</code> / <code>input-number</code> /
            <code>select</code> / <code>date-picker</code> / <code>time-picker</code> /
            <code>switch</code> / <code>checkbox</code>。
          </td>
        </tr>
        <tr>
          <td><code>rules</code></td>
          <td><code>GridyColumnRule</code></td>
          <td>
            <code>'required'</code> / <code>'selectRequired'</code> / Zod schema / 自定义函数。
          </td>
        </tr>
        <tr>
          <td><code>modelProp</code></td>
          <td><code>string</code></td>
          <td>自定义组件 v-model prop 名，默认 <code>modelValue</code>。</td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="Events" :headers="['名称', '载荷', '说明']">
        <tr>
          <td><code>change</code></td>
          <td><code>value, meta</code></td>
          <td>
            <code>meta.type</code> 为 <code>add</code> / <code>remove</code> / <code>update</code>。
          </td>
        </tr>
        <tr>
          <td><code>pageChange</code></td>
          <td><code>page, pageSize</code></td>
          <td>翻页或改每页条数。</td>
        </tr>
        <tr>
          <td><code>selectionChange</code></td>
          <td><code>keys, rows</code></td>
          <td>勾选变化。</td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="Slots" :headers="['名称', '说明']">
        <tr>
          <td><code>cell-[field]</code></td>
          <td>
            自定义单元格；参数含 <code>value</code> / <code>setValue</code> / <code>error</code>。
          </td>
        </tr>
        <tr>
          <td><code>action</code></td>
          <td>自定义操作列；缺省渲染配置式 / 默认删除按钮。</td>
        </tr>
        <tr>
          <td><code>toolbar</code> / <code>title</code> / <code>emptyText</code></td>
          <td>工具栏、标题、空态。</td>
        </tr>
      </DemoApiTable>
    </template>
  </DemoPage>
</template>
