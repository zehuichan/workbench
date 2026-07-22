# useWechatQrAuth Design

Date: 2026-07-22

## Goal

在 workbench 新增 **微信开放平台网站应用扫码登录**（`qrconnect` + `snsapi_login`）前端 composable：整页跳转、固定回调、校验 `state`、从 URL 暴露 `code`。换票（后端用 `code` 换 token）本期不做。不引入弹窗。现有 H5 网页授权 `useWechatAuth` 保持不变。

## Decisions

| 项 | 选择 |
|----|------|
| 与 H5 OAuth 关系 | 新建 `useWechatQrAuth`，不扩展 / 合并 `useWechatAuth` |
| 跳转方式 | 整页 `location.href`（无弹窗、无 `openWindow`） |
| `redirect_uri` | 固定回调 path（默认 `/auth/wechat`），可配置 |
| `state` | `crypto.randomUUID()`，跳转前写入 `sessionStorage`，回调时校验 |
| 换票 | 不做；预留 `clearCallbackParams`，demo 里 `watch(code)` + TODO |
| Demo | API 文档页 + 固定回调路由落地页 |
| 测试 | vitest + happy-dom，放在 `composables/__tests__/use-wechat-qr-auth/` |

## Non-goals

- 后端换票 / 登录态写入
- 弹窗 + `localStorage` + `window.close`（vue-element-admin `SocialSignin` 模式）
- 修改 `useWechatAuth` / `useWechat` 行为
- QQ 等其它第三方登录

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
    use-wechat-qr-auth.ts
    index.ts
  index.ts                              # re-export
  __tests__/
    use-wechat-qr-auth/use-wechat-qr-auth.test.ts
src/views/composables/
  use-wechat-qr-auth-demo.vue           # API docs
  wechat-qr-auth-callback.vue           # 固定回调落地（用 composable）
src/router/index.ts                     # demo + /auth/wechat
src/env.d.ts                            # VITE_WECHAT_OPEN_APPID 等
```

## Public API

```ts
function useWechatQrAuth(): {
  code: Ref<string | undefined>
  state: Ref<string | undefined>
  /** null = 尚未出现回调参数；true/false = 已校验 */
  stateValid: Ref<boolean | null>
  returnTo: Ref<string | undefined>
  authorize: (returnTo?: string) => void
  /** 清掉 URL 上的 code/state（换票成功后的接入点） */
  clearCallbackParams: () => void
}
```

### Behavior

**`authorize(returnTo?)`**

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

**回调同步（composable 内）**

- 用 `useUrlSearchParams('history')` 读 `code`、`state`
- 与 `sessionStorage` 中保存的 `state` 比对 → `stateValid`
- `returnTo` 从 sessionStorage 取出（校验通过后再暴露；失败可为 `undefined`）
- 无回调参数时：`code`/`state` 为 `undefined`，`stateValid === null`

**`clearCallbackParams`**

- 从 history URL 移除 `code`、`state`（保留其它 query）
- 清除 `sessionStorage` 中的 `wechat-qr-oauth` 条目
- 不负责跳转；业务可在换票成功后自行 `router.replace(returnTo)`

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
| `/auth/wechat` | 固定回调落地页（`wechat-qr-auth-callback.vue`） |
| playground composables 路由 | `use-wechat-qr-auth` API demo（group: WeChat） |

回调页职责（本期）：

- 调用 `useWechatQrAuth()`
- 展示 `code` / `stateValid` / `returnTo`（便于 playground 验证）
- 注释或文案标明：换票以后再接；成功后应 `clearCallbackParams` + 跳转 `returnTo`

不在回调页调用后端。

## Tests

- `authorize()` URL 含 `qrconnect`、`scope=snsapi_login`、`appid`、`#wechat_redirect`；`redirect_uri` 为固定 path、无 `#`
- `authorize` 将 `state`（及可选 `returnTo`）写入 `sessionStorage`
- URL 含匹配的 `code`/`state` → `stateValid === true`，`code` 同步
- URL `state` 与 sessionStorage 不一致 → `stateValid === false`
- 无回调参数 → `stateValid === null`
- `clearCallbackParams` 移除 URL 的 `code`/`state` 并清 sessionStorage

## Demo

- `use-wechat-qr-auth-demo.vue`：API 文档 + 用法示例（`authorize('/somewhere')`、watch `code`、TODO 换票）
- 说明需配置 `VITE_WECHAT_OPEN_APPID`，并在微信开放平台登记回调域名 / 与 `VITE_WECHAT_QR_REDIRECT_PATH` 一致

## Out of scope follow-ups

- 后端换票 API + 登录态
- 回调页自动换票成功后跳转
- 与 `useWechatAuth` 抽公共 OAuth 构建器（体量上来后再做）
