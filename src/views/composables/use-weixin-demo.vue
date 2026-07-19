<script setup lang="ts">
import DemoApiTable from '@/components/demo/demo-api-table.vue';
import DemoPage from '@/components/demo/demo-page.vue';

defineOptions({ name: 'UseWeixinDemo' });
</script>

<template>
  <DemoPage width="wide">
    <template #description>
      微信 JSSDK 初始化（<code>createGlobalState</code>，全局只
      <code>wx.config</code> 一次）。签名 URL 取
      <code>location.href.split('#')[0]</code>。非微信环境或
      <code>VITE_JSSDK_ENABLED !== 'true'</code> 时跳过。当前
      <code>fetchWxJsConfig</code> 为 stub（空
      <code>data</code>），待接 <code>/wechat/jssdk/config</code>。
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
          <td>
            <code>window.wx</code> 引用；未注入脚本时为
            <code>undefined</code>。
          </td>
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
  </DemoPage>
</template>
