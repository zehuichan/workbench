<script setup lang="ts">
import DemoApiTable from '@/components/demo/demo-api-table.vue';
import DemoBlock from '@/components/demo/demo-block.vue';
import DemoCode from '@/components/demo/demo-code.vue';
import DemoPage from '@/components/demo/demo-page.vue';

defineOptions({ name: 'UseWechatDemo' });

const codeDemo = `import { watch } from 'vue'
import { useWechat } from '@/composables'

const [ready, $wx] = useWechat()

watch(ready, (ok) => {
  if (!ok) return
  $wx?.scanQRCode?.({ needResult: 1, success: console.log })
})`;
</script>

<template>
  <DemoPage width="wide">
    <template #description>
      微信 JSSDK 初始化（<code>createGlobalState</code>，全局只
      <code>wx.config</code> 一次）。非微信环境或
      <code>VITE_JSSDK_ENABLED !== 'true'</code> 时跳过。签名暂走 <code>getJsApiTicket</code>。
    </template>

    <template #api>
      <DemoApiTable title="Returns (tuple)">
        <tr>
          <td><code>[0] ready</code></td>
          <td><code>Ref&lt;boolean&gt;</code></td>
          <td><code>wx.ready</code> 之后为 <code>true</code>。</td>
        </tr>
        <tr>
          <td><code>[1] wx</code></td>
          <td><code>WeixinJsSdk | undefined</code></td>
          <td><code>window.wx</code> 引用；未注入脚本时为 <code>undefined</code>。</td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="Env">
        <tr>
          <td><code>VITE_JSSDK_ENABLED</code></td>
          <td><code>string</code></td>
          <td>仅当值为 <code>'true'</code> 时初始化。</td>
        </tr>
      </DemoApiTable>
    </template>

    <DemoBlock title="代码演示">
      <template #hint>
        playground 非微信环境且 JSSDK 配置仍为
        stub，无法交互演示；此处仅展示用法。需微信内置浏览器、
        <code>VITE_JSSDK_ENABLED=true</code>，并注入 <code>window.wx</code>。
      </template>
      <DemoCode :code="codeDemo" lang="ts" />
    </DemoBlock>
  </DemoPage>
</template>
