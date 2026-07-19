# useWorkWeixin Design

Date: 2026-07-19

## Goal

新增业内标准的企微 H5 JSSDK 初始化 composable `useWorkWeixin`：在企微内置浏览器中完成 `wx.config` + `wx.agentConfig` 双配置；API 形态对齐现有 `useWeixin`。真实后端签名接口暂不接入（同文件 stub）。

## Decisions

| 项 | 选择 |
|----|------|
| 范围 | 仅 JSSDK 双 config 初始化（不含 OAuth、业务 JSAPI 封装） |
| 实现策略 | 镜像 `useWeixin` 独立 composable（方案 1）；不抽共享内核、不改 `useWeixin` |
| 环境检测 | 仅企微 UA：`/wxwork/i` |
| `ready` 语义 | `wx.config` **且** `wx.agentConfig` 都成功后为 `true` |
| 开关 | 独立 `VITE_WW_JSSDK_ENABLED === 'true'`（不复用 `VITE_JSSDK_ENABLED`） |
| 签名拉取 | 两个可替换 stub：`fetchWwJsConfig` + `fetchWwAgentConfig` |
| Demo | API 文档页（描述 + API 表 + 代码块），无真实交互 |
| 测试 | vitest + happy-dom，放在 `composables/__tests__/use-work-weixin/` |

## Out of scope

- 企微网页授权（corpId / OAuth）
- 选人、扫码、打开会话等业务封装
- 抽取 `useWeixin` / `useWorkWeixin` 共享内核
- 引入 `jweixin` npm、新建 `src/api/`
- 修改现有 `useWeixin` 行为

## Target structure

```text
src/composables/
  use-work-weixin/
    use-work-weixin.ts
    index.ts
  index.ts                              # + export use-work-weixin
  __tests__/
    use-work-weixin/use-work-weixin.test.ts
src/views/composables/
  use-work-weixin-demo.vue
src/router/index.ts                     # WeChat 组，order 接在 use-weixin 后
src/env.d.ts                            # VITE_WW_JSSDK_ENABLED + agentConfig
```

## Public API

```ts
const useWorkWeixin: () => [Ref<boolean>, WeixinJsSdk | undefined]
```

| 项 | 约定 |
|----|------|
| 返回值 | `[ready, wx]`，与 `useWeixin` 同形 |
| `ready` | 双 config 成功后为 `true`；任一步失败保持 `false`，并清空 `pending` 以便重试 |
| `wx` | `window.wx`；未注入则为 `undefined` |
| 公开入口 | `@/composables` 只导出 `useWorkWeixin` |
| 内部 stub | `fetchWwJsConfig` / `fetchWwAgentConfig` + `set/reset*Impl`；**不进根 barrel** |
| Env | `VITE_WW_JSSDK_ENABLED === 'true'` 才初始化 |
| UA | 仅 `/wxwork/i` |

### Types (`src/env.d.ts`)

在现有 `WeixinJsSdk` 上追加：

```ts
interface ImportMetaEnv {
  // ...existing
  readonly VITE_WW_JSSDK_ENABLED?: string;
}

interface WeixinJsSdk {
  // ...existing config / ready / error / scanQRCode?
  agentConfig: (config: Record<string, unknown>) => void;
}
```

`agentConfig` 入参为配置对象（含 `corpid` / `agentid` / 签名字段 / `jsApiList`，以及对象内的 `success` / `fail` 回调）。实现侧用 Promise 包装这些回调，保证可测。

## Initialization flow

`createGlobalState` 单例；首次调用自动 `setup()`；并发调用共享同一 `pending` Promise。

```text
guard: VITE_WW_JSSDK_ENABLED === 'true'
    && window.wx
    && /wxwork/i.test(UA)
        │
        ▼
url = encodeURIComponent(location.href.split('#')[0])
        │
        ▼
fetchWwJsConfig(url)  →  wx.config({ debug: false, ...data })
        │
        ▼
await wx.ready
        │
        ▼
fetchWwAgentConfig(url)  →  wx.agentConfig(...)
        │
        ▼
agentConfig success → ready = true
任意失败 → ready = false，pending = null（允许重试）
```

约束：

- 不引入 `jweixin` npm；假定宿主已注入 `window.wx`
- 不新建 `src/api/`；两个 fetch 默认为空 stub（`{ data: {} }`），注释标明待接后端路径（如 `/wechat/ww/jssdk/config`、`/wechat/ww/jssdk/agent-config`）
- 签名 URL 一律去掉 hash，再 `encodeURIComponent`
- 失败时 `console.error` 打日志（对齐 `useWeixin`）

## Testing

镜像 `use-weixin` 测试风格（`vi.resetModules` + stub env/UA/location + mock `window.wx`）：

1. 非企微 UA → 不初始化（不调 fetch / config）
2. `VITE_WW_JSSDK_ENABLED !== 'true'` → 不初始化
3. config + agentConfig 都成功 → `ready === true`；签名 URL 为去 hash 后的 encode 值
4. `wx.error` → `ready === false`
5. `agentConfig` fail → `ready === false`
6. `fetchWwJsConfig` 或 `fetchWwAgentConfig` reject → `ready === false`

## Demo / Playground

- 路由：`composables/use-work-weixin`，`meta: { title: 'use-work-weixin', group: 'WeChat', order: 3 }`（`use-weixin` 为 2）
- 页面：描述 + Returns / Env API 表 + 用法代码块；注明 playground 非企微环境且 stub 未接后端，无法交互演示

## Error handling

| 场景 | 行为 |
|------|------|
| 非企微 / 开关关 / 无 `wx` | 静默跳过，`ready = false` |
| fetch 抛错 | `ready = false`，`pending = null`，`console.error` |
| `wx.error` | 同上，不继续 `agentConfig` |
| `agentConfig` fail | `ready = false`，`pending = null`，`console.error` |

## Success criteria

- `useWorkWeixin` 从 `@/composables` 可导入，返回 `[Ref<boolean>, WeixinJsSdk | undefined]`
- 仅企微 UA + `VITE_WW_JSSDK_ENABLED=true` + 有 `window.wx` 时走双 config
- 单元测试覆盖上述用例且通过
- playground 文档页可访问，侧栏出现在 WeChat 组
- stub / 测试 helper 不从根 barrel 导出
