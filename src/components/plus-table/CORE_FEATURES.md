# 表格核心功能

- 配置式列：列配置驱动；扩展 `editable`、`component`、`componentProps`、`render`、`rules`、`required`、`dependencies`、`hidden`、多级 `children`；
- 数据：`v-model:data`；插入、删除、移动、复制行（由父数据驱动）
- 编辑模式：`cell` / `row` / `manual`；内部另有全表可编 `all`；进入/确认/取消、编辑值快照
- 内置编辑器：字符串 key 映射 Element Plus 组件（`adapter`）
- 校验：async-validator；表级 + 列级；依赖列可动态 `rules`/`required`；`validate`、`scrollToFirstError`
- 单元格联动：`triggerFields`；动态 `disabled`、`componentProps`、`trigger`、`rules`
- 脏数据：修改标记；导出变更行/格；与撤销栈同步
- 键盘：方向键、Tab、Enter；撤销/重做；可扩展 `hotkeys`
- 导航与焦点：`activeRowIndex` / `activeColIndex`、`navigate`、`focusCell`；行列下标对应当前 `data` 索引
- 列设置：显隐、排序、列宽；可选本地持久化
- 样式：激活行/格、校验错误、脏行/格 class
- 分页：传 `total` 显示底栏；不对 `data` 切片（服务端分页）
- 自适应：视口剩余高度 → `maxHeight`
- 上下文：`provide` 注入编辑/校验/联动/列设置 API 供单元格子组件使用
