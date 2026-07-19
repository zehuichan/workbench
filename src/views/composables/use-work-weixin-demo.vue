<script setup lang="ts">
import DemoApiTable from '@/components/demo/demo-api-table.vue';
import DemoBlock from '@/components/demo/demo-block.vue';
import DemoCode from '@/components/demo/demo-code.vue';
import DemoPage from '@/components/demo/demo-page.vue';

defineOptions({ name: 'UseWorkWeixinDemo' });

const codeDemo = `import { watch } from 'vue'
import { useWorkWeixin } from '@/composables'

const [ready, $wx] = useWorkWeixin()

watch(ready, (ok) => {
  if (!ok) return
  $wx?.scanQRCode?.({ needResult: 1, success: console.log })
})`;
</script>

<template>
  <DemoPage width="wide">
    <template #description>
      企微 JSSDK 初始化（<code>createGlobalState</code>，全局
      <code>wx.config</code> + <code>wx.agentConfig</code> 各一次）。
      <code>ready</code> 仅在双配置都成功后为
      <code>true</code>。签名 URL 取
      <code>location.href.split('#')[0]</code>。非企微环境或
      <code>VITE_WW_JSSDK_ENABLED !== 'true'</code> 时跳过。当前
      <code>fetchWwJsConfig</code> /
      <code>fetchWwAgentConfig</code> 为 stub（空
      <code>data</code>），待接后端签名接口。
    </template>

    <template #api>
      <DemoApiTable title="Returns (tuple)">
        <tr>
          <td><code>[0] ready</code></td>
          <td><code>Ref&lt;boolean&gt;</code></td>
          <td>
            <code>wx.config</code> 与
            <code>wx.agentConfig</code> 都成功后为
            <code>true</code>。
          </td>
        </tr>
        <tr>
          <td><code>[1] wx</code></td>
          <td><code>WeixinJsSdk | undefined</code></td>
          <td>
            <code>window.wx</code> 引用；未注入脚本时为
            <code>undefined</code>。
          </td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="Env">
        <tr>
          <td><code>VITE_WW_JSSDK_ENABLED</code></td>
          <td><code>string</code></td>
          <td>仅当值为 <code>'true'</code> 时初始化。</td>
        </tr>
      </DemoApiTable>
    </template>

    <DemoBlock title="代码演示">
      <template #hint>
        playground 非企微环境且 JSSDK 配置仍为 stub，无法交互演示；此处仅展示用法。需企微内置浏览器（UA 含
        <code>wxwork</code>）、
        <code>VITE_WW_JSSDK_ENABLED=true</code>，并注入
        <code>window.wx</code>。
      </template>
      <DemoCode :code="codeDemo" lang="ts" />
    </DemoBlock>
  </DemoPage>
</template>
