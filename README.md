# dsh-session-migrator

DeepSeek Harness 跨设备 Session 迁移插件。它复用 Harness Web 自带的 `/export` 导出能力，并新增 `/session-import` 命令，把导出的 ZIP、解压目录或单个 `session.jsonl` 解析、校验并写入另一台设备的 Session 持久层，同时将所有 Session 的 `cwd` 映射到指定工作区。

## 能力

- 导入 Web GUI `/export` 生成的 ZIP。
- 导入已经解压的导出目录。
- 导入单个 `session.jsonl`。
- 支持导出包中的所有 `subagents/<id>/session.jsonl`。
- 支持 `media/` 中的 PNG、JPEG、WebP 和 GIF 附件，并校验内容寻址 ID 不变。
- 在写入前使用 Harness 自己的 `Session.create()` 完整验证 Header、事件序号、事件格式和会话边界。
- 将根 Session 与子 Session 一起映射到目标工作区并加入 Workspace 会话列表。
- 检测目标设备上的 Session ID 冲突；不覆盖已有历史，而是自动为整棵 Session/子代理树生成新 ID，并同步重写父子 lineage 与 Harness provenance 引用。
- Web 可视化导入：侧栏底部提供“导入会话”，支持选择 ZIP/JSONL、选择完整导出文件夹，以及把文件/文件夹拖进页面后投放到目标工作区。
- 限制归档体积、JSONL 体积、文件数并拒绝不安全归档路径。

## 安装到 Web profile

在插件目录执行依赖安装，然后通过 DSH 的 profile 插件管理器安装：

```bash
cd /path/to/dsh-session-migrator
pnpm install

dsh plugin --profile web add /path/to/dsh-session-migrator
```

重启正在运行的 `dsh web`。本插件是 Host 插件，不修改 Harness Web shell，也不需要单独启动 Vite 服务。

## 导出（源设备）

在要迁移的会话中执行 Harness 内置命令：

```text
/export
```

也可以点击 Session 标题栏中的 **Session log**。Web GUI 会下载：

```text
dsh-session-<session-id>.zip
```

导出默认包含全部子代理 Session 和被引用的图片附件。

## 导入（目标设备）

### 可视化导入

重启 `dsh web` 后，侧栏底部会出现 **导入会话**。可以：

1. 点击按钮选择 ZIP/JSONL；
2. 点击“选择导出文件夹”选择完整导出目录；
3. 直接把 ZIP、JSONL 或导出文件夹拖进 Harness 页面。

界面随后列出所有 Workspace，把文件释放到目标 Workspace 卡片即可导入。若相同 Session 已导入过，会自动作为一棵新的克隆会话树导入，不覆盖旧会话。

### 命令导入

先在目标工作区打开任意 Session，然后执行：

```text
/session-import "/absolute/path/dsh-session-xxx.zip"
```

未提供 `--workspace` 时，插件使用当前 Session 的工作区。显式指定工作区：

```text
/session-import "/absolute/path/dsh-session-xxx.zip" --workspace "/absolute/path/to/project"
```

也支持目录与 JSONL：

```text
/session-import "/path/to/unpacked-export" --workspace "/path/to/project"
/session-import "/path/to/session.jsonl" --workspace "/path/to/project"
```

目标工作区必须已经存在且是目录。导入完成后若侧边栏没有立即刷新，请刷新当前 GUI 页面；随后可从该 Workspace 打开导入的根 Session，并继续对话。

## 冲突策略

目标设备不存在冲突时保留原始 Session ID。只要导入树中任一 ID 已存在，本次导入就为整棵树生成新的 UUID，并重写 Header `id`、`parentSession`、插件 provenance 的 `senderSessionId` 以及结构化 Session Reference；已有日志永远不会被覆盖。

历史消息、工具参数和工具结果属于模型原始对话内容，插件不会对其中看起来像 Session ID 的任意文本做盲目替换，以免篡改会话语义。克隆后如果模型尝试复用历史子代理 ID，可先调用 `list_agents` 重新获取克隆树当前的子代理地址。

## 数据与安全说明

Session 导出包可能包含：完整提示词、模型输出、工具调用、工作区绝对路径、系统上下文以及图片。请把 ZIP 当作敏感数据处理。

导入只迁移会话日志和日志引用的图片，不复制源项目文件。`cwd` 会改成目标工作区，但要让会话真正继续完成原任务，目标工作区本身的项目内容也应通过 Git、同步盘或其他方式单独迁移并保持相容。

当前写入后端是 append-only，且没有公开删除 API。插件会先完整解析和验证全部 Session，再导入附件，最后逐个写入 Session；极端情况下如果写盘在中途失败，已成功写入的前缀 Session 不会自动删除。重新执行时会检测冲突并生成一套新的克隆 ID，因此应先检查是否已有部分会话，避免留下不需要的重复副本。

## 开发测试

```bash
pnpm test
```

核心模块位于 `core.js`，Cordis 命令入口位于 `index.js`，profile bundle 位于 `cordis.patch.yml`。
