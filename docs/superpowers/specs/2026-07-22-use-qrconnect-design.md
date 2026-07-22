# useQrconnect Design

Date: 2026-07-22

## Goal

新增与 `useWechatAuth` **同款 API** 的 PC 扫码登录 composable：`qrconnect` + `snsapi_login`。中间页 `/auth/wechat` 做 playground 模拟换票。

## Decisions

| 项                       | 选择                                                                       |
| ------------------------ | -------------------------------------------------------------------------- |
| API                      | 与 `useWechatAuth` 相同 tuple：`[code, authorize]`                         |
| 差异                     | endpoint=`qrconnect`，scope=`snsapi_login`，AppId=`VITE_WECHAT_OPEN_APPID` |
| 默认 `redirect_uri` path | `/auth/wechat`（或 `VITE_WECHAT_QR_REDIRECT_PATH`）                        |
| `state`                  | `crypto.randomUUID()`（同 useWechatAuth）                                  |
| 换票                     | 仅中间页 stub；不进 composable                                             |

## Public API

```ts
function useQrconnect(): [Ref<string | undefined>, (redirect?: string) => void];
```

## Files

```text
src/composables/use-qrconnect/use-qrconnect.ts
src/composables/use-qrconnect/index.ts
src/composables/__tests__/use-qrconnect/use-qrconnect.test.ts
src/views/composables/use-qrconnect-demo.vue
src/views/composables/qrconnect-callback.vue
src/router/index.ts   # /auth/wechat + demo
src/env.d.ts          # VITE_WECHAT_OPEN_APPID, VITE_WECHAT_QR_REDIRECT_PATH
```
