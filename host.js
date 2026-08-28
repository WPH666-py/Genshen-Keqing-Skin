// ============================================================
// 刻晴（Keqing）动态皮肤插件 · Host（v1 · 可选）
// ------------------------------------------------------------
// 零配置模式（推荐）无需本文件：client.js 已内嵌素材。
// 想要原图画质时，把本文件内容粘贴到 code.host、client.js
// 粘贴到 code.client 一起 define/run 即可。客户端会自动检测
// 到本 Host 并切换为原图素材。
// 唯一需要修改的：把 ASSET_DIR 改成素材文件夹在你机器上的
// 绝对路径（Windows 用正斜杠或双反斜杠）。
// ============================================================
const ASSET_DIR = 'D:/projects-py/原始系列皮肤插件/刻晴动态皮肤插件（独立版）/素材'
const MAX_BYTES = 16 * 1024 * 1024
const ROUTES = [
  { route: '/keqing-skin/wallpaper-1.png', file: '刻晴-校服抱臂.png', type: 'image/png' },
  { route: '/keqing-skin/wallpaper-2.jpg', file: '刻晴-持剑战斗.jpg', type: 'image/jpeg' },
  { route: '/keqing-skin/wallpaper-3.png', file: '刻晴-白衬衫.png', type: 'image/png' },
  { route: '/keqing-skin/burst.mp3', file: '语音-元素爆发·其一.mp3', type: 'audio/ogg' },
]
const join = (dir, name) => dir.replace(/[\\/]+\s*$/, '') + '/' + name

return {
  apply(ctx) {
    const fs = ctx.get('fs')
    const webServer = ctx.get('webServer')
    if (fs === undefined || webServer === undefined) {
      console.error('keqing-skin: host services fs/webServer unavailable')
      return
    }
    const cleanup = []
    const cache = new Map()
    const load = (file) => {
      if (!cache.has(file)) {
        cache.set(file, (async () => {
          const target = await fs.resolve(join(ASSET_DIR, file))
          return await fs.readBytes(target, undefined, MAX_BYTES)
        })())
      }
      return cache.get(file)
    }
    for (const route of ROUTES) {
      try {
        cleanup.push(webServer.register({
          kind: 'exact',
          path: route.route,
          handler: async (req, res) => {
            try {
              const bytes = await load(route.file)
              res.writeHead(200, {
                'Content-Type': route.type,
                'Content-Length': String(bytes.length),
                'Cache-Control': 'no-cache',
              })
              res.end(bytes)
            } catch (error) {
              console.error('keqing-skin: serve failed', route.file, error)
              if (!res.headersSent) {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
              }
              res.end('asset unavailable: ' + route.file)
            }
          },
        }))
      } catch (error) {
        console.error('keqing-skin: route register failed', route.route, error)
      }
    }
    cleanup.push(harness.handle('keqing-urls', () => ({
      walls: ['/keqing-skin/wallpaper-1.png', '/keqing-skin/wallpaper-2.jpg', '/keqing-skin/wallpaper-3.png'],
      burst: '/keqing-skin/burst.mp3',
    })))
    cleanup.push(harness.handle('keqing-status', async () => {
      const status = { walls: [], burstOk: false, detail: '', voiceText: '无处可逃！', skill: '天街巡游' }
      for (const route of ROUTES) {
        try {
          const bytes = await load(route.file)
          if (route.route.includes('wallpaper')) status.walls.push(bytes !== undefined && bytes.length > 0)
          else status.burstOk = bytes !== undefined && bytes.length > 0
        } catch (error) {
          status.detail += String((error && error.message) || error).slice(0, 160) + ' '
        }
      }
      return status
    }))
    cleanup.push(harness.handle('keqing-uninstall', async () => {
      const removed = cleanup.splice(0).map((dispose) => { try { dispose() } catch (e) {} })
      console.log('keqing-skin: host 侧素材路由与 RPC 已全部移除（' + removed.length + ' 项）。插件记录仍存在，如需彻底删除请让 AI 执行 cordis_undefine')
      return { ok: true, removed: removed.length }
    }))
    ctx.effect(() => () => {
      for (const dispose of cleanup.splice(0)) { try { dispose() } catch (e) {} }
    })
  },
}
