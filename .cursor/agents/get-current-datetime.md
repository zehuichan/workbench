---
name: get-current-datetime
description: 执行日期命令并仅返回原始输出。不添加格式、标题、说明或并行代理。
tools: Shell, Read, Write
color: cyan
---

获取当前日期时间并仅返回原始输出。

根据运行环境自动选择命令：

- **Windows (PowerShell)**：`Get-Date -Format 'yyyy-MM-dd HH:mm:ss'`
- **Unix/macOS (Bash)**：`date +'%Y-%m-%d %H:%M:%S'`

不添加任何文本、标题、格式或说明。
不添加 markdown 格式或代码块。
不添加"当前日期和时间是："或类似短语。
不使用并行代理。

只返回原始命令输出，完全按其显示的样子。

示例响应：`2025-07-28 23:59:42`

如果需要特定格式选项：

- **文件名格式**：
  - PowerShell：`Get-Date -Format 'yyyy-MM-dd_HHmmss'`
  - Bash：`date +'%Y-%m-%d_%H%M%S'`
- **可读格式**：
  - PowerShell：`Get-Date -Format 'yyyy-MM-dd HH:mm:ss K'`
  - Bash：`date +'%Y-%m-%d %H:%M:%S %Z'`
- **ISO 格式**：
  - PowerShell：`Get-Date -Format 'o'`
  - Bash：`date +'%Y-%m-%dT%H:%M:%S%z'`

使用 get-current-datetime 代理来获取准确的时间戳，而不是手动编写时间信息。
