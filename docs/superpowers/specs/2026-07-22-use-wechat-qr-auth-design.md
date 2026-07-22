# useWechatQrAuth Design

Date: 2026-07-22

## Goal

在 workbench 新增 **微信开放平台网站应用扫码登录**（`qrconnect` + `snsapi_login`）：

1. **`useWechatQrAuth`**：整页跳转、固定回调、校验 `state`、从 URL 暴露 `code`（OAuth 管道，不换票）
2. **中间页 `/auth/wechat`**：编排模拟换票（stub），展示结果，清参

不引入弹窗。现有 H5 网页授权 `useWechatAuth` 保持不变。

## Decisions

| 项 | 选择 |
|----|------|
| 与 H5 OAuth 关系 | 新建 `useWechatQrAuth`，不扩展 / 合并 `useWechatAuth` |
| 跳转方式 | 整页 `location.href`（无弹窗、无 `openWindow`） |
| `redirect_uri` | 固定回调 path（默认 `/auth/wechat`），可配置 |
| `state` | `crypto.randomUUID()`，跳转前写入 `sessionStorage`，回调时校验 |
| 职责边界 | composable = OAuth 管道；中间页 = 换票编排 |
| 换票 | 同目录 stub `exchangeWechatQrCode(code)`，**仅中间页调用**；不进 composable |
| Demo | API 文档页 + 固定回调中间页（展示换票结果） |
| 测试 | vitest：composable 单测 + stub 单测；中间页逻辑保持薄 |

## Non-goals

- 真实后端换票 API / 持久化登录态（cookie、JWT 落库等）
- 弹窗 + `localStorage` + `window.close`（vue-element-admin `SocialSignin` 模式）
- 修改 `useWechatAuth` / `useWechat` 行为
- QQ 等其它第三方登录
- composable 内自动换票或暴露 `token` / `exchanging`

## Background

| | `useWechatAuth`（已有） | `useWechatQrAuth`（本期） |
|---|---|---|
| 场景 | 微信内 H5 / 公众号网页授权 | PC 网站扫码登录 |
| 接口 | `oauth2/authorize` | `qrconnect` |
| scope | `snsapi_base` / `snsapi_userinfo` | `snsapi_login`（固定） |
| 跳转 | 整页 | 整页 |
| 回调 | 业务 path 可变 | 固定回调 path |

## Target structure

```text
src/composables/
  use-wechat-qr-auth/
    use-wechat-qr-auth.ts               # OAuth only
    exchange-wechat-qr-code.ts          # stub；供中间页调用
    index.ts                            # export composable + stub + types
  index.ts                              # re-export
  __tests__/
    use-wechat-qr-auth/
      use-wechat-qr-auth.test.ts
      exchange-wechat-qr-code.test.ts
src/views/composables/
  use-wechat-qr-auth-demo.vue           # API docs
  wechat-qr-auth-callback.vue           # 中间页：编排换票
src/router/index.ts                     # demo + /auth/wechat
src/env.d.ts                            # VITE_WECHAT_OPEN_APPID 等
```

不新建 `src/api/` 微信换票接口；stub 与 composable 同目录但**互不调用**，后续 stub 可整文件替换为真实 API 客户端。

## Public API

### `useWechatQrAuth`（OAuth 管道）

```ts
function useWechatQrAuth(): {
  code: Ref<string | undefined>
  state: Ref<string | undefined>
  /** null = 尚未出现回调参数；true/false = 已校验 */
  stateValid: Ref<boolean | null>
  returnTo: Ref<string | undefined>
  authorize: (returnTo?: string) => void
  /** 清掉 URL 上的 code/state，并清 sessionStorage oauth 条目 */
  clearCallbackParams: () => void
}
```

### `exchangeWechatQrCode`（stub，中间页用）

```ts
type WechatQrToken = {
  accessToken: string
  openid: string
}

/** TODO: 接真实后端 POST /api/auth/wechat/qr */
async function exchangeWechatQrCode(code: string): Promise<WechatQrToken>
```

实现要点：`delay(300)` 后返回 mock token；`code` 为空则 throw。

## Behavior

### `authorize(returnTo?)`

1. 生成 `state = crypto.randomUUID()`
2. 写入 `sessionStorage` 键（约定名：`wechat-qr-oauth`），值 JSON：`{ state, returnTo? }`
3. 拼 `redirect_uri = origin + redirectPath`（History，无 hash）
   - `redirectPath` 来自 `import.meta.env.VITE_WECHAT_QR_REDIRECT_PATH`，缺省 `'/auth/wechat'`
   - 规范为以 `/` 开头
4. 整页跳转：

```text
https://open.weixin.qq.com/connect/qrconnect
  ?appid={VITE_WECHAT_OPEN_APPID}
  &redirect_uri={encodeURIComponent(redirect_uri)}
  &response_type=code
  &scope=snsapi_login
  &state={state}
  #wechat_redirect
```

### 回调同步（composable 内）

- 用 `useUrlSearchParams('history')` 读 `code`、`state`
- 与 `sessionStorage` 中保存的 `state` 比对 → `stateValid`
- `returnTo` 从 sessionStorage 取出（校验通过后再暴露；失败可为 `undefined`）
- 无回调参数时：`code`/`state` 为 `undefined`，`stateValid === null`
- **不**调用 `exchangeWechatQrCode`

### `clearCallbackParams`

- 从 history URL 移除 `code`、`state`（保留其它 query）
- 清除 `sessionStorage` 中的 `wechat-qr-oauth` 条目
- 不负责跳转

### 中间页编排（`wechat-qr-auth-callback.vue`）

1. 调用 `useWechatQrAuth()`
2. 当 `stateValid === true` 且有 `code` → 调 `exchangeWechatQrCode(code)`（本轮只触发一次）
3. 本地 UI 状态：`exchanging` / `token` / `exchangeError`（页面内 `ref`，不进 composable）
4. **成功后**调用 `clearCallbackParams()`（避免刷新重复用同一 `code`）
5. 有 `returnTo` 时提供「前往」按钮；**不**自动 `router.replace`
6. `stateValid === false` 时展示错误，不换票
7. 文案标明当前为 stub，替换 `exchange-wechat-qr-code.ts` 即可接真实后端

## Environment & types

`src/env.d.ts` 增加：

```ts
readonly VITE_WECHAT_OPEN_APPID?: string
/** 固定回调 path，默认 /auth/wechat */
readonly VITE_WECHAT_QR_REDIRECT_PATH?: string
```

说明：

- `VITE_WECHAT_APPID`：继续给 H5 `useWechatAuth`（公众号）
- `VITE_WECHAT_OPEN_APPID`：网站应用扫码登录 AppId（可与公众号不同）

## Router

| path | 用途 |
|------|------|
| `/auth/wechat` | 中间页（`wechat-qr-auth-callback.vue`） |
| playground composables 路由 | `use-wechat-qr-auth` API demo（group: WeChat） |

## Tests

**`useWechatQrAuth`**

- `authorize()` URL 含 `qrconnect`、`scope=snsapi_login`、`appid`、`#wechat_redirect`；`redirect_uri` 为固定 path、无 `#`
- `authorize` 将 `state`（及可选 `returnTo`）写入 `sessionStorage`
- URL 含匹配的 `code`/`state` → `stateValid === true`，`code` 同步
- URL `state` 与 sessionStorage 不一致 → `stateValid === false`
- 无回调参数 → `stateValid === null`
- `clearCallbackParams` 移除 URL 的 `code`/`state` 并清 sessionStorage
- 不断言任何换票行为（composable 不依赖 stub）

**`exchangeWechatQrCode`**

- 有效 `code` → resolve mock `accessToken` / `openid`
- 空 `code` → reject

中间页编排以薄 UI 为主，不强制组件单测；行为由上述单元 + 手工 playground 覆盖。

## Demo

- `use-wechat-qr-auth-demo.vue`：API 文档 + 用法示例（`authorize` → 回调中间页换票）
- 说明：本地可构造 `/auth/wechat?code=demo&state=...`（需 sessionStorage 中有匹配 `state`）验证中间页
- 需配置 `VITE_WECHAT_OPEN_APPID`，并在微信开放平台登记回调域名 / 与 `VITE_WECHAT_QR_REDIRECT_PATH` 一致

## Out of scope follow-ups

- 真实后端换票 API + 持久化登录态
- 中间页换票成功后自动 `router.replace(returnTo)`（可选增强）
- 与 `useWechatAuth` 抽公共 OAuth 构建器（体量上来后再做）
