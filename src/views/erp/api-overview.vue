<script setup lang="ts">
import DemoApiTable from '@/components/demo/demo-api-table.vue';
import DemoPage from '@/components/demo/demo-page.vue';

defineOptions({ name: 'ErpApiOverview' });
</script>

<template>
  <DemoPage width="wide">
    <template #description>
      <code>useEmitEffect</code> 公开 API 参考。用于单据草稿：表头变更驱动明细副作用，再汇总。交互与场景见侧栏其它
      demo。
    </template>

    <template #api>
      <DemoApiTable title="Options">
        <tr>
          <td><code>rules</code></td>
          <td><code>EmitEffectRules&lt;H, L&gt;</code></td>
          <td>必填。表头副作用、建行、行重算与汇总规则。</td>
        </tr>
        <tr>
          <td><code>initialDraft</code></td>
          <td><code>DocumentDraft&lt;H, L&gt;</code></td>
          <td>必填。初始草稿；内部会 <code>cloneDeep</code>，作为 <code>reset()</code> 默认基线。</td>
        </tr>
        <tr>
          <td><code>confirm</code></td>
          <td>
            <code>(confirmation) =&gt; boolean | Promise&lt;boolean&gt;</code>
          </td>
          <td>
            可选。mutation 带确认时调用；返回
            <code>false</code> 则不提交。未提供时默认通过。
          </td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="Return">
        <tr>
          <td><code>draft</code></td>
          <td><code>Ref&lt;DocumentDraft&lt;H, L&gt;&gt;</code></td>
          <td>当前草稿（header / lines / summary / dirty）。</td>
        </tr>
        <tr>
          <td><code>changeHeader</code></td>
          <td><code>(field, value) =&gt; Promise&lt;boolean&gt;</code></td>
          <td>
            改表头并跑
            <code>headerRules[field]</code>；确认取消时返回
            <code>false</code>，草稿不变。
          </td>
        </tr>
        <tr>
          <td><code>changeCell</code></td>
          <td>
            <code>(command: DetailChangeCommand) =&gt; Promise&lt;boolean&gt;</code>
          </td>
          <td>
            改明细格；若
            <code>prop</code> 在
            <code>sourceFields</code> 内，标记为
            <code>manual</code> 后重算该行。
          </td>
        </tr>
        <tr>
          <td><code>addLine</code></td>
          <td><code>(id: string) =&gt; void</code></td>
          <td>用 <code>rules.createLine</code> 追加行并重算汇总。</td>
        </tr>
        <tr>
          <td><code>removeLine</code></td>
          <td><code>(id: string) =&gt; void</code></td>
          <td>按行 <code>id</code> 删除并重算汇总。</td>
        </tr>
        <tr>
          <td><code>reset</code></td>
          <td><code>(next?: DocumentDraft) =&gt; void</code></td>
          <td>
            重置为
            <code>next</code> 或初始
            <code>initialDraft</code>（深拷贝）。
          </td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="EmitEffectRules">
        <tr>
          <td><code>sourceFields</code></td>
          <td><code>string[]</code></td>
          <td>
            追踪继承 / 人工来源的明细字段；单元格改这些字段时写入
            <code>fieldSources[prop] = 'manual'</code>。
          </td>
        </tr>
        <tr>
          <td><code>headerRules</code></td>
          <td><code>Record&lt;string, HeaderEmitRule&gt;</code></td>
          <td>
            表头字段 → 副作用规则；
            <code>changeHeader</code> 未配置字段会抛错。
          </td>
        </tr>
        <tr>
          <td><code>createLine</code></td>
          <td><code>(draft, id) =&gt; L</code></td>
          <td>新建明细行（含默认字段与 <code>fieldSources</code>）。</td>
        </tr>
        <tr>
          <td><code>recalculateLine</code></td>
          <td><code>(line, header) =&gt; L</code></td>
          <td>
            单行派生重算（金额、本币等）；表头 / 明细变更与增删行后都会走到。
          </td>
        </tr>
        <tr>
          <td><code>summarize</code></td>
          <td><code>(lines, header) =&gt; DocumentSummary</code></td>
          <td>根据当前行与表头生成汇总。</td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="HeaderEmitRule">
        <tr>
          <td><code>policy</code></td>
          <td><code>EmitEffectPolicy</code></td>
          <td>
            <code>'force' | 'inherit' | 'recalculate'</code>，见下表。
          </td>
        </tr>
        <tr>
          <td><code>requiresConfirmation</code></td>
          <td><code>boolean</code></td>
          <td>
            可选。为 true 且有受影响行时生成
            <code>EmitEffectConfirmation</code>，走
            <code>confirm</code>。
          </td>
        </tr>
        <tr>
          <td><code>apply</code></td>
          <td>
            <code>(line, nextHeader, previousHeader) =&gt; HeaderLineEffect</code>
          </td>
          <td>
            对每一明细行产出 patch /
            sourcePatch / preservedFields。
          </td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="HeaderLineEffect" :headers="['名称', '类型', '说明']">
        <tr>
          <td><code>patch</code></td>
          <td><code>Record&lt;string, unknown&gt;</code></td>
          <td>可选。合并到该行字段。</td>
        </tr>
        <tr>
          <td><code>sourcePatch</code></td>
          <td><code>Record&lt;string, FieldSource&gt;</code></td>
          <td>可选。合并到 <code>line.fieldSources</code>。</td>
        </tr>
        <tr>
          <td><code>preservedFields</code></td>
          <td><code>string[]</code></td>
          <td>
            可选。本行保留的人工值字段；计入确认文案的
            <code>preservedCount</code>。
          </td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="Policy" :headers="['值', '说明']">
        <tr>
          <td><code>force</code></td>
          <td>强制覆盖明细对应字段（如币种），不因 manual 跳过。</td>
        </tr>
        <tr>
          <td><code>inherit</code></td>
          <td>
            仅同步
            <code>inherited</code> 行；
            <code>manual</code> 行保留并记入
            <code>preservedFields</code>。
          </td>
        </tr>
        <tr>
          <td><code>recalculate</code></td>
          <td>
            按业务重算派生值（如单价）；常配合
            <code>requiresConfirmation</code>。
          </td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="Types · DocumentDraft">
        <tr>
          <td><code>header</code></td>
          <td><code>H</code></td>
          <td>表头字段对象。</td>
        </tr>
        <tr>
          <td><code>lines</code></td>
          <td><code>L[]</code></td>
          <td>明细行列表。</td>
        </tr>
        <tr>
          <td><code>summary</code></td>
          <td><code>DocumentSummary</code></td>
          <td><code>Record&lt;string, number&gt;</code> 汇总。</td>
        </tr>
        <tr>
          <td><code>dirty</code></td>
          <td><code>boolean</code></td>
          <td>是否有未保存变更；mutation 提交后为 <code>true</code>。</td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="Types · DocumentLine">
        <tr>
          <td><code>id</code></td>
          <td><code>string</code></td>
          <td>行唯一标识。</td>
        </tr>
        <tr>
          <td><code>fieldSources</code></td>
          <td><code>Record&lt;string, FieldSource&gt;</code></td>
          <td>
            字段来源：
            <code>'inherited' | 'manual'</code>。
          </td>
        </tr>
        <tr>
          <td><code>[field]</code></td>
          <td><code>unknown</code></td>
          <td>业务字段（数量、单价、仓库等）。</td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="Types · DetailChangeCommand">
        <tr>
          <td><code>rowId</code></td>
          <td><code>string</code></td>
          <td>目标行 <code>id</code>。</td>
        </tr>
        <tr>
          <td><code>prop</code></td>
          <td><code>string</code></td>
          <td>变更字段名。</td>
        </tr>
        <tr>
          <td><code>value</code> / <code>oldValue</code></td>
          <td><code>unknown</code></td>
          <td>新值与旧值（供调用方对照）。</td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="Types · EmitEffectConfirmation">
        <tr>
          <td><code>affectedCount</code></td>
          <td><code>number</code></td>
          <td>实际发生变化的行数。</td>
        </tr>
        <tr>
          <td><code>preservedCount</code></td>
          <td><code>number</code></td>
          <td>保留人工值的行数。</td>
        </tr>
        <tr>
          <td><code>fields</code></td>
          <td><code>string[]</code></td>
          <td>受影响的明细字段名列表。</td>
        </tr>
        <tr>
          <td><code>message</code></td>
          <td><code>string</code></td>
          <td>默认确认文案，可直接用于对话框。</td>
        </tr>
      </DemoApiTable>
    </template>
  </DemoPage>
</template>
