<script setup lang="ts">
import DemoApiTable from '@/components/demo/demo-api-table.vue';
import DemoBlock from '@/components/demo/demo-block.vue';
import DemoCode from '@/components/demo/demo-code.vue';
import DemoPage from '@/components/demo/demo-page.vue';

defineOptions({ name: 'UseWechatQrAuthDemo' });

const codeDemo = `import { useWechatQrAuth } from '@/composables'

// 登录页：整页跳转 qrconnect（固定回调 /auth/wechat）
const { authorize } = useWechatQrAuth()
authorize('/composables/use-wechat-qr-auth')

// 中间页 /auth/wechat：
// const { code, stateValid, returnTo, clearCallbackParams } = useWechatQrAuth()
// if (stateValid && code) {
//   const token = await exchangeWechatQrCode(code) // stub
//   clearCallbackParams()
// }`;
</script>

<template>
  <DemoPage width="wide">
    <template #description>
      微信开放平台网站应用扫码登录（
      <code>qrconnect</code>
      /
      <code>snsapi_login</code>
      ）。
      <code>useWechatQrAuth</code>
      只做 OAuth 管道；模拟换票在中间页
      <code>/auth/wechat</code>
      调用
      <code>exchangeWechatQrCode</code>
      。需配置
      <code>VITE_WECHAT_OPEN_APPID</code>
      ，并在开放平台登记与
      <code>VITE_WECHAT_QR_REDIRECT_PATH</code>
      （默认
      <code>/auth/wechat</code>
      ）一致的回调。
    </template>

    <template #api>
      <DemoApiTable title="useWechatQrAuth() returns">
        <tr>
          <td><code>code</code></td>
          <td><code>Ref&lt;string | undefined&gt;</code></td>
          <td>URL 上的 OAuth <code>code</code>。</td>
        </tr>
        <tr>
          <td><code>state</code></td>
          <td><code>Ref&lt;string | undefined&gt;</code></td>
          <td>URL 上的 OAuth <code>state</code>。</td>
        </tr>
        <tr>
          <td><code>stateValid</code></td>
          <td><code>Ref&lt;boolean | null&gt;</code></td>
          <td>
            <code>null</code>
            未回调；
            <code>true</code>
            /
            <code>false</code>
            为校验结果。
          </td>
        </tr>
        <tr>
          <td><code>returnTo</code></td>
          <td><code>Ref&lt;string | undefined&gt;</code></td>
          <td>校验通过后从 sessionStorage 取出的回跳 path。</td>
        </tr>
        <tr>
          <td><code>authorize</code></td>
          <td><code>(returnTo?: string) =&gt; void</code></td>
          <td>整页跳转 <code>qrconnect</code>。</td>
        </tr>
        <tr>
          <td><code>clearCallbackParams</code></td>
          <td><code>() =&gt; void</code></td>
          <td>清除 URL <code>code</code>/<code>state</code> 与 storage。</td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="exchangeWechatQrCode(code)">
        <tr>
          <td><code>returns</code></td>
          <td><code>Promise&lt;WechatQrToken&gt;</code></td>
          <td>stub 模拟换票；后续替换为真实后端。</td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="Env">
        <tr>
          <td><code>VITE_WECHAT_OPEN_APPID</code></td>
          <td><code>string</code></td>
          <td>网站应用 AppId（扫码登录）。</td>
        </tr>
        <tr>
          <td><code>VITE_WECHAT_QR_REDIRECT_PATH</code></td>
          <td><code>string</code></td>
          <td>固定回调 path，默认 <code>/auth/wechat</code>。</td>
        </tr>
      </DemoApiTable>
    </template>

    <DemoBlock title="代码演示">
      <template #hint>
        playground 无法真实完成微信扫码。本地验证中间页：先
        <code>authorize</code>
        写入 sessionStorage，或手动写入
        <code>wechat-qr-oauth</code>
        后访问
        <code>/auth/wechat?code=demo&amp;state=...</code>
        。
      </template>
      <DemoCode :code="codeDemo" lang="ts" />
    </DemoBlock>
  </DemoPage>
</template>
