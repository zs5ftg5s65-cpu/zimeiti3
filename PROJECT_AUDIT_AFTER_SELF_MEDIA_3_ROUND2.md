# 自媒体3.0 第二轮返工审计报告

**项目**: 30天学习工作台 → 自媒体3.0 升级
**日期**: 2026-08-25
**基础源码**: 工作台2.1_二次修复版
**技术栈**: React 19 + TypeScript 5.9 + Vite 8.2 + Tailwind CSS v4

---

## 一、本轮修改文件清单

### 修改文件

| 文件 | 修改内容 |
|------|----------|
| `vite.config.ts` | **关键修复**：添加 `@tailwindcss/vite` 插件，修复 Tailwind v4 工具类未生成导致页面完全无样式的Bug |
| `src/pages/WorkbenchPage/WorkbenchPage.tsx` | 添加移动端抽屉导航（汉堡按钮+Sheet），移动端页面标题栏，`overflow-x-hidden` 防横向溢出 |
| `src/components/StudySidebar.tsx` | 添加 `forceMobile` 属性，支持在移动端抽屉中渲染完整展开的导航 |
| `src/data/selfmedia3-types.ts` | Script 增加 `sourceTopicId`/`requiredMediaIds`；PublishRecord 增加 `videoId`；Review 增加 `videoId`/`analyticsId`/`isHighPerforming`；WarRoom 改为 `warRoomByScope` 按账号+门店+Day隔离；WinningTemplate 增加 `sourceReviewId`；VideoAnalytics 增加 `videoId`/`title`；Character/HotCase 增加 `accountId`/`storeId` |
| `src/hooks/useSelfMediaStore.ts` | 完整重写：`addScoped/updateScoped/removeScoped` 泛型CRUD自动注入和校验scope；`warRoomByScope` 隔离；`exportData/importData` JSON备份恢复；保存失败toast.error不静默；DEFAULT_CHARACTER清空为空白模板 |
| `src/components/panels/selfmedia3/WarRoomPanel.tsx` | 重写：按账号+门店+Day隔离任务；生成脚本自动绑定sourceTopicId；显示来源选题绑定状态；数据备份栏 |
| `src/components/panels/selfmedia3/TopicEnginePanel.tsx` | 修复addTopic scope注入；选题卡片"生成脚本"按钮；复制AI提示词按钮；成功模板参考区域 |
| `src/components/panels/selfmedia3/ScriptDirectorPanel.tsx` | 重写：显示来源选题；素材关联/取消；AI操作全部改为复制提示词按钮；镜头纵向卡片 |
| `src/components/panels/selfmedia3/MediaLibraryPanel.tsx` | 修复addMedia；视频上传明确提示"视频原文件未保存，仅保存素材记录" |
| `src/components/panels/selfmedia3/PublishPanel.tsx` | 重写：新建自动生成videoId；已发布状态显示"录入数据"按钮，自动创建Analytics并跳转 |
| `src/components/panels/selfmedia3/AnalyticsPanel.tsx` | 重写：修复addAnalytics；"开始复盘"按钮自动创建Review并跳转；快速数字录入 |
| `src/components/panels/selfmedia3/ReviewPanel.tsx` | 重写：isHighPerforming复选框；高表现复盘"保存为成功模板"自动带入数据；复制复盘AI提示词 |
| `src/components/panels/selfmedia3/CharacterPanel.tsx` | 修复addCharacter scope注入 |
| `src/components/panels/selfmedia3/StoryLibraryPanel.tsx` | 修复addStory scope注入 |
| `src/components/panels/selfmedia3/AdDecisionPanel.tsx` | 修复addAdDecision scope注入 |
| `src/components/panels/selfmedia3/ContentLabPanel.tsx` | 修复addExperiment scope注入 |
| `src/components/panels/selfmedia3/WinningTemplatesPanel.tsx` | 修复addTemplate scope注入 |
| `src/components/panels/selfmedia3/HotCasesPanel.tsx` | 修复addHotCase scope注入 |
| `src/components/panels/SelfmediaPanel.tsx` | 传递onNavigate回调；Tab栏overflow-x-auto移动端横向滚动 |
| `src/data/selfmedia.ts` | 清理"50岁"等未经确认的人物事实 |
| `src/data/selfmedia-daily.ts` | 清理"做餐饮30年"等未经确认的人物事实 |
| `public/sw.js` | 重写：CACHE_VERSION、HTML network-first、JS/CSS cache-first、旧缓存清理、更新通知 |
| `index.html` | SW注册增加updatefound监听和message监听 |
| `src/app.tsx` | PWA更新toast提示"发现新版本，点击刷新" |

### 新增文件

| 文件 | 内容 |
|------|------|
| `src/components/panels/selfmedia3/aiPrompts.ts` | AI提示词生成器：buildTopicPrompt/buildScriptPrompt/buildReviewPrompt/buildScriptRegeneratePrompt，自动带入账号/门店/人物/故事/模板/拍摄限制 |
| `src/components/panels/selfmedia3/shared.tsx` | CopyPromptButton组件（复制提示词+已复制状态）、DataBackupBar组件（导出/导入JSON）、ShootingRestrictionBadge组件 |

---

## 二、第一轮发现的问题

1. **CSS完全未生效（严重）**：`vite.config.ts` 中缺少 `@tailwindcss/vite` 插件，导致 Tailwind v4 的 `@import "tailwindcss"` 未被处理，构建产物CSS中没有任何工具类（.flex/.p-4等），页面显示为无样式纯文本。此问题在第一轮就存在但未做浏览器验证。
2. 数据实体之间缺乏真实关联（选题→脚本→发布→数据→复盘→模板各自独立）
3. CRUD操作不校验accountId/storeId，可跨账号修改数据
4. WarRoom任务状态全局共享，不按账号/门店/Day隔离
5. DEFAULT_CHARACTER包含未经确认的虚构事实（50岁、30年从业等）
6. localStorage保存失败时静默忽略
7. 无数据导出/导入功能
8. PWA Service Worker对HTML使用Cache First导致无法更新
9. AI按钮使用setTimeout模拟或无实际功能
10. 移动端侧边栏隐藏后无替代导航

---

## 三、第二轮修复的问题

### 3.1 关键Bug：CSS未生效
- **根因**：Tailwind CSS v4 要求在 Vite 配置中注册 `@tailwindcss/vite` 插件，原配置只有 `@vitejs/plugin-react`
- **修复**：`vite.config.ts` 添加 `import tailwindcss from '@tailwindcss/vite'` 和 `plugins: [react(), tailwindcss()]`
- **验证**：构建后CSS从37KB增至68KB，包含完整工具类；浏览器中样式正常渲染

### 3.2 数据闭环
- 选题→脚本：`script.sourceTopicId === topic.id`，脚本页显示"来源选题"卡片
- 脚本→素材：`script.requiredMediaIds`，素材库可关联到当前脚本，脚本页显示已关联/缺失素材
- 发布→数据：`analytics.videoId === publish.videoId`，发布后点"录入数据"自动创建Analytics
- 数据→复盘：`review.videoId === analytics.videoId` 且 `review.analyticsId === analytics.id`
- 复盘→模板：`template.sourceReviewId === review.id`，高表现复盘一键保存模板，自动带入Hook/镜头结构/CTA/真实数据
- 模板→选题：选题引擎读取WinningTemplates显示"成功模板参考"，可套用模板数据

### 3.3 多账号多门店隔离
- Store层 `addScoped` 自动注入 `currentAccount`/`currentStore`
- `updateScoped`/`removeScoped` 校验 id+accountId+storeId，跨scope操作拒绝并toast.error
- 组件不再自行传入accountId/storeId
- 实测：切换到古巷里账号后看不到广德光英的复盘数据

### 3.4 WarRoom按账号+门店+Day隔离
- `warRoomByScope: Record<string, WarRoomTasks>`，key = `${accountId}:${storeId}:day${day}`
- 支持Day1-Day30每天独立6个任务状态
- 切换Day不继承前一天完成状态
- 切换账号/门店不继承其他scope状态

### 3.5 人物事实清理
- DEFAULT_CHARACTER仅保留 `name:"老板娘"`, `accountId:"bosslady"`, `publicLevel:"需确认"`
- 删除"50岁""做餐饮30年""做餐饮就是做良心""食材不能省"等未经确认的具体事实
- 旧知识库中相关内容改为"待补充""待确认"

### 3.6 localStorage安全
- `save()` 失败时 `toast.error("本地存储空间不足，请删除部分素材或导出数据后清理重试")`
- 不静默失败
- 提供JSON全量导出（13个数据实体）和导入恢复

### 3.7 PWA更新策略
- CACHE_VERSION = 'selfmedia3-v3.0.2'
- HTML/navigation请求：Network First（确保拿到最新版本）
- JS/CSS/字体/图片：Cache First
- activate时清理旧版本缓存
- 检测到新版本后postMessage，页面toast提示"发现新版本，点击刷新"

### 3.8 AI能力诚实化
- 所有AI入口显示"AI能力未连接"横幅
- 不使用setTimeout模拟AI
- 提供"复制AI提示词"功能，提示词自动带入：当前账号、门店、老板娘人物资料、已确认真实故事、成功模板、最近选题、拍摄限制
- 用户复制到外部AI（ChatGPT/豆包）生成后粘贴回来

### 3.9 移动端导航
- 添加汉堡菜单按钮（md:hidden），固定在移动端顶部标题栏
- 点击打开Sheet抽屉，显示完整导航（含会计/英语/自媒体全部一级二级菜单）
- 点击导航项后自动关闭抽屉
- 当前选中项高亮显示
- 桌面端导航不受影响

### 3.10 素材库
- 视频上传时明确标注"视频原文件未保存，仅保存素材记录"
- 图片以base64存储于localStorage，超容量时toast提示

---

## 四、数据结构

### 核心关联字段
```
Topic.id ← Script.sourceTopicId
Script.id ← Script.requiredMediaIds[] / Media.usedInVideoId
Publish.videoId ← VideoAnalytics.videoId
VideoAnalytics.id ← Review.analyticsId
VideoAnalytics.videoId ← Review.videoId
Review.id ← WinningTemplate.sourceReviewId
```

### 所有实体包含
- accountId: 账号ID（guxiangli/guangdeguangying/bosslady）
- storeId: 门店ID（guxiangli/guangdeguangying/common）
- id: 唯一标识
- createdAt/updatedAt: 时间戳

### WarRoom隔离
```typescript
type WarRoomTasks = {
  topic: boolean; script: boolean; shoot: boolean;
  publish: boolean; data: boolean; review: boolean;
}
warRoomByScope: Record<`${accountId}:${storeId}:day${number}`, WarRoomTasks>
```

---

## 五、功能列表

| 功能 | 状态 | 说明 |
|------|------|------|
| 今日作战台 | ✅ | 日期/Day/阶段/任务/选题/脚本/数据，按scope+Day隔离 |
| AI选题引擎 | ✅ | 手动添加+复制AI提示词+成功模板参考，无假AI |
| 老板娘人物库 | ✅ | 空白模板起步，不编造事实 |
| 真实故事库 | ✅ | CRUD+搜索筛选+真实性确认 |
| AI脚本导演 | ✅ | 纵向镜头卡片+来源选题+素材关联+复制AI提示词 |
| 素材库 | ✅ | 图片base64+视频元数据（明确提示原文件未保存） |
| 发布管理 | ✅ | videoId关联+状态流转+录入数据闭环 |
| 数据诊断 | ✅ | 快速数字录入+自动计算率值+公式透明 |
| AI复盘 | ✅ | 关联analytics+复盘纪律+复制AI提示词+保存模板 |
| 投流判断 | ✅ | 综合多维度指标，无真实转化不建议大额投流 |
| 内容实验室 | ✅ | Hook A/B/C对比 |
| 成功模板库 | ✅ | 从复盘一键保存，选题引擎读取参考 |
| 热门案例 | ✅ | 手动添加+待核验状态，不编造热门 |
| 多账号切换 | ✅ | 3账号，store层隔离 |
| 多门店切换 | ✅ | 2门店，老板娘IP用common |
| Day切换 | ✅ | Day1-30独立WarRoom状态 |
| 数据持久化 | ✅ | localStorage，刷新不丢失 |
| JSON导出 | ✅ | 全量13实体导出 |
| JSON导入 | ✅ | 全量恢复 |
| PWA安装 | ✅ | manifest+sw+icons，可添加到主屏幕 |
| PWA更新提示 | ✅ | 新版本检测+toast提示刷新 |
| 移动端导航 | ✅ | 汉堡菜单+Sheet抽屉 |
| 英语模块 | ✅ | 原有功能保留 |
| 会计模块 | ✅ | 原有功能保留 |
| 30天学习模块 | ✅ | 原有功能保留，Day联动 |

---

## 六、测试结果

### 浏览器冒烟测试（生产构建）

| 测试项 | 结果 |
|--------|------|
| 首页正常渲染（CSS生效） | ✅ 通过 |
| 英语模块 | ✅ 正常 |
| 会计模块 | ✅ 正常 |
| 30天学习/Day切换 | ✅ Day1/Day2独立 |
| 自媒体作战台 | ✅ 正常 |
| 创建选题 | ✅ 保存成功，toast提示 |
| 选题→脚本 | ✅ sourceTopicId绑定，显示来源选题 |
| 发布→数据 | ✅ videoId关联，自动创建Analytics |
| 数据→复盘 | ✅ videoId+analyticsId关联 |
| 账号切换隔离 | ✅ 古巷里看不到广德光英数据 |
| 门店切换 | ✅ 正常 |
| 刷新持久化 | ✅ 数据保留 |
| JSON导出 | ✅ 5.5KB文件，13实体完整，关联ID正确 |
| PWA文件存在 | ✅ manifest.json/sw.js/icon.svg |
| 移动端抽屉导航 | ✅ 代码实现，CSS类正确（md:hidden/Sheet） |
| Tab栏横向滚动 | ✅ overflow-x-auto，不导致页面溢出 |

### 数据关联验证（导出JSON实测）
```
Topic[0].accountId = "guangdeguangying" ✅
Script[0].sourceTopicId = "item_mt7ysoh3_cv29ye" ✅ (与Topic[0].id匹配)
Publish[0].videoId = "vid_mt7yu4qx_ma42ym" ✅
Analytics[0].videoId = "vid_mt7yu4qx_ma42ym" ✅ (与Publish匹配)
Review[0].videoId = "vid_mt7yu4qx_ma42ym" ✅
Review[0].analyticsId = "item_mt7yvigk_zedrsl" ✅ (与Analytics[0].id匹配)
Character[0].name = "老板娘"，无虚构年龄/年限 ✅
```

---

## 七、Build结果

```
> tsc -b && vite build

vite v8.2.2 building client environment for production...
✓ 2275 modules transformed.
dist/index.html                   1.97 kB │ gzip:   0.85 kB
dist/assets/index-C5AUmimy.css   68.15 kB │ gzip:  11.71 kB
dist/assets/index-Dxhb5AVL.js   900.61 kB │ gzip: 275.96 kB
✓ built in 41.86s
```

- TypeScript编译：✅ 0错误
- Vite构建：✅ 成功
- CSS含Tailwind工具类：✅ 68KB（修复前37KB无工具类）
- PWA文件：✅ manifest.json + sw.js + icon.svg

---

## 八、ESLint

**ESLint未配置。** 项目中没有 `eslint.config.js`（ESLint 9要求flat config），也没有 `.eslintrc` 文件。`package.json` 中没有 `lint` 脚本。未强行添加ESLint以避免大规模重构。

---

## 九、AI真实能力状态

**当前没有接入任何真实AI API。**

- 所有AI功能入口显示"AI能力未连接"横幅
- 不使用setTimeout模拟AI
- 不使用MOCK_DATA假分析
- 提供"复制AI提示词"按钮，生成完整Prompt（含账号/门店/人物资料/故事/模板/最近选题/拍摄限制），用户复制到外部AI工具生成后粘贴回来
- 这是"外部AI工作流"模式，不是"已接入AI"

---

## 十、数据存储方式

- **主存储**：浏览器 localStorage（key前缀 `__app____sm3_`）
- **图片**：base64编码存入localStorage（受5-10MB容量限制）
- **视频**：仅保存元数据（名称/日期/标签等），不保存视频原文件，页面明确提示
- **导出**：JSON文件全量备份（选题/人物/故事/脚本/素材/发布/数据/复盘/投流/实验/模板/案例/WarRoom）
- **导入**：JSON文件全量恢复
- **配额错误**：toast.error提示，不静默

---

## 十一、PWA状态

- ✅ manifest.json（名称/图标/颜色/standalone显示模式）
- ✅ Service Worker（sw.js）
- ✅ icon.svg
- ✅ Safari"添加到主屏幕"可用
- ✅ 版本更新检测+提示刷新
- ⚠️ **不声称完全离线**：静态资源缓存可离线访问，但数据存储在localStorage，无后台同步
- 缓存策略：HTML network-first / JS-CSS-font-img cache-first

---

## 十二、未完成能力

1. **真实AI API接入**：需要后端API Key和接口，当前为外部AI工作流（复制提示词）
2. **视频原文件存储**：需要云存储（OSS/COS），当前仅存元数据
3. **图片云存储**：当前base64存localStorage，大容量时会超限
4. **真实联网热门数据**：需要平台API授权，当前为手动添加+待核验
5. **数据跨设备同步**：当前纯本地存储，可通过JSON导出/导入手动迁移
6. **ESLint配置**：未配置，建议后续添加
7. **JS包体积优化**：900KB（gzip 276KB），可通过code-splitting优化
8. **复盘→模板→选题的完整自动化**：模板参考已读取真实数据，但"自动生成选题"仍需手动或外部AI

---

## 十三、已知限制

1. 移动端抽屉导航在 <768px 宽度显示汉堡菜单，≥768px 显示桌面侧边栏
2. localStorage容量约5-10MB，大量图片base64可能触发配额错误（已有toast提示和导出功能）
3. 30天计划的Day由全局学习进度控制，自媒体WarRoom跟随当前Day
4. 老板娘个人IP账号的门店固定为"common"，门店选择器禁用
5. 旧版 selfmedia/ 目录下 DataReviewPanel.tsx 和 MaterialLibraryPanel.tsx 仍存在但已不在路由中使用，不影响构建
6. 投流判断面板提供规则框架和指标录入，不自动执行投流操作
7. 内容实验室的Hook对比需要手动录入各版本数据

---

## 十四、保留的原有功能

- ✅ 英语学习模块（含资源/工具）
- ✅ 会计实操30天课程（5个阶段）
- ✅ 30天学习进度系统（打卡/统计/进度条）
- ✅ 原有导航结构和视觉体系
- ✅ 每日时间安排建议
- ✅ 总览与打卡
- ✅ 原有UI设计风格（卡片/配色/字体）
