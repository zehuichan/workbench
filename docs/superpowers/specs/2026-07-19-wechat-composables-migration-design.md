# WeChat Composables Migration Design

Date: 2026-07-19

## Goal

将 `gd-holen-front-wap` 的 `useAuth` / `useWeixin` 迁移到 workbench `src/composables/`，转成 TypeScript，对齐现有 composable 目录约定；补单元测试与仅 API 文档的 playground 页面。真实微信后端接口暂不接入。

## Decisions

| 项                   | 选择                                                      |
| -------------------- | --------------------------------------------------------- |
| 迁移策略             | 忠实迁移 + 最小适配（方案 1）                             |
| `wxconfig`           | 同文件内 stub + `TODO`，后续再接真实 API                  |
| OAuth `redirect_uri` | History 模式（适配 workbench `createWebHistory`）         |
| Demo                 | 仅 API 文档展示（`DemoPage` + `DemoApiTable`），无交互块  |
| 测试                 | vitest + happy-dom，放在 `composables/__tests__/`         |
| 环境变量解析         | 不迁 `wrapperEnv`；`VITE_JSSDK_ENABLED === 'true'` 即开启 |

## Source → Target

| 源（gd-holen-front-wap）      | 目标（workbench）                          |
| ----------------------------- | ------------------------------------------ |
| `src/hooks/core/useAuth.js`   | `src/composables/use-auth/use-auth.ts`     |
| `src/hooks/core/useWeixin.js` | `src/composables/use-weixin/use-weixin.ts` |
| `@/api/wechat` `wxconfig`     | stub（不新建 `src/api/`）                  |

## Target structure

```text
src/composables/
  use-auth/
    use-auth.ts
    index.ts
  use-weixin/
    use-weixin.ts
    index.ts
  index.ts                         # 增加 re-export
  __tests__/
    use-auth/use-auth.test.ts
    use-weixin/use-weixin.test.ts
src/views/composables/
  use-auth-demo.vue                # API docs only
  use-weixin-demo.vue              # API docs only
src/router/index.ts                # 注册两条 Composables 路由
src/env.d.ts                       # VITE_WECHAT_* + window.wx 最小声明
```

## Public API

### `useAuth`

```ts
type WechatOAuthScope = 'snsapi_base' | 'snsapi_userinfo';

function useAuth(
  scope?: WechatOAuthScope, // default 'snsapi_userinfo'
): [Ref<string | undefined>, (redirect?: string) => void];
```

行为：

- `code`：经 `useUrlSearchParams('history')` 同步 URL 上的 OAuth `code`
- `authorize(redirect?)`：跳转微信网页授权
  - `redirect_uri` 使用 History 拼法：`origin + pathname(+redirect) + search`，**不**拼 `#/...`
  - `redirect` 若提供：规范为以 `/` 开头的 path，替换当前 pathname
  - `appid`：`import.meta.env.VITE_WECHAT_APPID`
  - `state`：`Date.now()`；结尾 `#wechat_redirect`

### `useWeixin`

```ts
const useWeixin: () => [Ref<boolean>, typeof window.wx | undefined];
```

行为（`createGlobalState`，全局只配一次）：

- 非微信 UA / `VITE_JSSDK_ENABLED !== 'true'` / 无 `window.wx` → 不初始化，`ready = false`
- 签名 URL：`location.href.split('#')[0]`
- 调用同文件 stub `wxconfig(url)`（`TODO: 接 /wechat/jssdk/config`）
- stub resolve 后 `wx.config` → `wx.ready` 置 `ready = true`；`wx.error` / 请求失败则 `ready = false` 并允许重试（清 `pending`）

根 barrel `src/composables/index.ts` 增加：

- `useAuth`（及必要类型）
- `useWeixin`

## Environment & types

`src/env.d.ts` 扩展：

```ts
interface ImportMetaEnv {
  readonly VITE_WECHAT_APPID?: string;
  readonly VITE_JSSDK_ENABLED?: string;
}

interface Window {
  wx?: WeixinJsSdk; // 最小声明即可，或宽松 any 别名
}
```

不引入 `jweixin` npm 依赖。

## Tests

**`useAuth`**

- URL 含 `?code=` 时 `code` 同步
- `authorize()` 跳转含 `appid`、`scope`、`response_type=code`，`redirect_uri` 无 `#`
- `authorize('/login')` 的 `redirect_uri` pathname 为 `/login`

**`useWeixin`**

- 非微信 UA → 不调 stub，`ready === false`
- `VITE_JSSDK_ENABLED !== 'true'` → 不初始化
- mock 微信 UA + `window.wx` + stub resolve → `wx.config` / `wx.ready`，`ready === true`
- stub reject 或 `wx.error` → `ready === false`

## Demo（API docs only）

两页均使用 `DemoPage`：

- `#description`：用途、History OAuth / JSSDK 约束、stub 说明
- `#api`：`DemoApiTable` 列出参数、返回值、相关环境变量
- **不**使用 `DemoBlock`，不触发真实授权或 JSSDK 调用

路由（`group: 'Composables'`）：

| path                     | name                     | title       | order        |
| ------------------------ | ------------------------ | ----------- | ------------ |
| `composables/use-auth`   | `composables-use-auth`   | `useAuth`   | 接在现有之后 |
| `composables/use-weixin` | `composables-use-weixin` | `useWeixin` | 再后一位     |

## Out of scope

- 不新增 axios / `src/api/wechat` 真实请求层
- 不迁 `wrapperEnv`、不改 workbench 全局路由模式
- 不改 gd-holen-front-wap 源仓库
- 不做交互式微信授权 / 扫码 playground
- 不引入微信 JSSDK npm 包

## Success criteria

1. `@/composables` 可导入 `useAuth` / `useWeixin`
2. 相关单元测试通过
3. playground 侧栏可打开两页 API 文档
4. `vue-tsc` / 既有 composable 测试不被破坏
