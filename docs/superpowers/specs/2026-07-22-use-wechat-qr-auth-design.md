# useWechatQrAuth Design

Date: 2026-07-22

## Goal

在 workbench 新增 **微信开放平台网站应用扫码登录**（`qrconnect` + `snsapi_login`）前端 composable：整页跳转、固定回调、校验 `state`、从 URL 暴露 `code`，并走一遍 **模拟换票**（stub，不打真实后端）。不引入弹窗。现有 H5 网页授权 `useWechatAuth` 保持不变。

## Decisions

| 项 | 选择 |
|----|------|
| 与 H5 OAuth 关系 | 新建 `useWechatQrAuth`，不扩展 / 合并 `useWechatAuth` |
| 跳转方式 | 整页 `location.href`（无弹窗、无 `openWindow`） |
| `redirect_uri` | 固定回调 path（默认 `/auth/wechat`），可配置 |
| `state` | `crypto.randomUUID()`，跳转前写入 `sessionStorage`，回调时校验 |
| 换票 | 同文件 stub `exchangeWechatQrCode(code)`；`stateValid === true` 后由 composable 自动触发一次 |
| Demo | API 文档页 + 固定回调路由落地页（展示换票结果） |
| 测试 | vitest + happy-dom，放在 `composables/__tests__/use-wechat-qr-auth/` |

## Non-goals

- 真实后端换票 API / 持久化登录态（cookie、JWT 落库等）
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
    use-wechat-qr-auth.ts               # composable + 同文件 stub exchangeWechatQrCode
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

不新建 `src/api/` 微信换票接口；stub 留在 composable 同文件，后续再抽到真实 API。

## Public API

```ts
type WechatQrToken = {
  accessToken: string
  openid: string
}

function useWechatQrAuth(): {
  code: Ref<string | undefined>
  state: Ref<string | undefined>
  /** null = 尚未出现回调参数；true/false = 已校验 */
  stateValid: Ref<boolean | null>
  returnTo: Ref<string | undefined>
  /** 模拟换票进行中 */
  exchanging: Ref<boolean>
  /** 模拟换票结果；失败为 undefined */
  token: Ref<WechatQrToken | undefined>
  /** 模拟换票错误信息 */
  exchangeError: Ref<string | undefined>
  authorize: (returnTo?: string) => void
  /** 手动触发换票（一般不用；自动路径已覆盖） */
  exchange: () => Promise<WechatQrToken | undefined>
  /** 清掉 URL 上的 code/state，并清 sessionStorage oauth 条目 */
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

**模拟换票 stub `exchangeWechatQrCode(code)`（同文件，带 `TODO: 接真实后端`）**

```ts
async function exchangeWechatQrCode(code: string): Promise<WechatQrToken> {
  // TODO: POST /api/auth/wechat/qr 用 code 换票
  await delay(300)
  if (!code) throw new Error('missing code')
  return {
    accessToken: `mock-access-token-${code.slice(0, 8)}`,
    openid: `mock-openid-${code.slice(0, 8)}`,
  }
}
```

**自动换票（composable 内）**

1. 当 `stateValid === true` 且存在 `code`，且本轮尚未换过 → 调用 stub
2. 设置 `exchanging`；成功写入 `token`，失败写入 `exchangeError`
3. **成功后自动** `clearCallbackParams()`（避免刷新重复用同一 `code`）
4. **不自动** `router.replace(returnTo)`——交给回调页 / 业务决定（playground 可按钮跳转或文案提示）

**`exchange()`**

- 手动入口：要求当前 `stateValid === true` 且有 `code`；否则 no-op / 返回 `undefined`
- 与自动路径共用同一 stub 与状态字段

**`clearCallbackParams`**

- 从 history URL 移除 `code`、`state`（保留其它 query）
- 清除 `sessionStorage` 中的 `wechat-qr-oauth` 条目
- 不清除已得到的 `token`（登录结果保留到页面离开）
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

- 调用 `useWechatQrAuth()`（自动模拟换票）
- 展示 `code` / `stateValid` / `returnTo` / `exchanging` / `token` / `exchangeError`
- 换票成功后提供「前往 returnTo」按钮（有 `returnTo` 时）；不强制自动跳转
- 文案标明当前为 stub 换票，替换 stub 即可接真实后端

不在回调页直接 `fetch` 后端；只消费 composable。

## Tests

- `authorize()` URL 含 `qrconnect`、`scope=snsapi_login`、`appid`、`#wechat_redirect`；`redirect_uri` 为固定 path、无 `#`
- `authorize` 将 `state`（及可选 `returnTo`）写入 `sessionStorage`
- URL 含匹配的 `code`/`state` → `stateValid === true`，`code` 同步
- URL `state` 与 sessionStorage 不一致 → `stateValid === false`，且不触发换票
- 无回调参数 → `stateValid === null`
- `stateValid === true` 时自动调用 stub → `token` 有值，`exchanging` 结束为 `false`，URL `code`/`state` 被清掉
- stub reject → `exchangeError` 有值，`token` 仍为 `undefined`
- `clearCallbackParams` 移除 URL 的 `code`/`state` 并清 sessionStorage，不清除已有 `token`

## Demo

- `use-wechat-qr-auth-demo.vue`：API 文档 + 用法示例（`authorize`、自动换票、`token`）
- 可用「模拟回调」说明：本地把 URL 拼成 `/auth/wechat?code=demo&state=...`（需先 `authorize` 写入 session，或测试里直接种 session）验证落地页
- 说明需配置 `VITE_WECHAT_OPEN_APPID`，并在微信开放平台登记回调域名 / 与 `VITE_WECHAT_QR_REDIRECT_PATH` 一致

## Out of scope follow-ups

- 真实后端换票 API + 持久化登录态
- 回调页换票成功后自动 `router.replace(returnTo)`（可选增强）
- 与 `useWechatAuth` 抽公共 OAuth 构建器（体量上来后再做）
