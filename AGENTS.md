# AGENTS.md — 给 AI 的自动安装说明

本仓库是「刻晴（Keqing）动态皮肤插件」，用于 DeepSeek Harness（DSH）。任何 AI 助手拿到本仓库后，请按下面步骤在用户当前 DSH 会话中自动安装。

## 安装（推荐：零配置）

1. 读取 `client.js`（约 140KB，包含 3 张壁纸与「雷厉风行！」大招语音的 base64 内嵌素材）。
2. 调用 `cordis_define`：
   - `plugin.kind: "new"`，`idPrefix: "keqing"`（或任意 3–6 位小写字母）
   - `name: "刻晴动态皮肤"`，`purpose: "原神刻晴动态皮肤：点击播放元素爆发语音与特效，支持切换壁纸"`
   - `code.client` = `client.js` 的全部内容
3. 调用 `cordis_run`（mode: `run`）；如返回 awaiting-approval，提示用户在授权卡片上允许。
4. 完成后告知用户：页面右下角出现刻晴挂件（最大 320×430px 自适应画框，整张立绘完整展示）；左键点击释放元素爆发「天街巡游」（语音「雷厉风行！」+ 雷光特效）；🖼 切换壁纸；右键菜单（释放大招 / 切换壁纸 / 收起 / 一键卸载）。

## 可选：全画质模式（需要本机素材文件）

如果用户想要原图画质（1080×2048 等）：

1. 把 `素材/` 文件夹放到用户电脑任意位置，读取 `host.js`，把其中 `ASSET_DIR` 改为该素材文件夹的绝对路径。
2. `cordis_define` 时同时提供 `code.host`（`host.js` 内容）与 `code.client`（`client.js` 内容，同一个包）。
3. `cordis_run`；客户端会自动检测 Host 并切换为原图素材。

## 字段速查

- 大招技能名：元素爆发「天街巡游」
- 大招语音（其一）：雷厉风行！（BWIKI 原文件：`https://patchwiki.biligame.com/images/ys/b/bd/rogvhc1yk82jdpolwede3ukp28lb7th.mp3`）
- 壁纸三张：校服·抱臂 / 持剑·战斗 / 白衬衫·桌面
- 卸载：右键菜单「一键卸载」（仅移除 UI 与路由）；彻底删除插件记录需 `cordis_undefine <pluginId>`

## 常见注意

- 不要修改 `client.js` 的素材（base64）部分，除非用户要求更换。
- 如果 `cordis_run` 报 Client 解析错误，通常是粘贴时截断或混入了 Markdown 代码块标记；重新完整粘贴纯文本。
- 该插件是动态插件（进程内），DSH 重启后需重新 define/run 才能恢复。
