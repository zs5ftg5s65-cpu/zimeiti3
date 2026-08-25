# 自媒体3.0 开发前审计报告

> 审计时间：2026-08-24
> 基准版本：工作台2.1_二次修复版
> 审计范围：完整项目源码

## 一、项目技术栈

| 项 | 内容 |
|---|---|
| 构建工具 | Vite 8 |
| 框架 | React 19 + TypeScript 5.9 |
| 样式 | Tailwind CSS 4 + tw-animate-css |
| UI组件 | Radix UI (shadcn风格) + lucide-react |
| 路由 | react-router-dom 7 |
| 动画 | framer-motion 12 |
| 图表 | echarts / recharts |
| 持久化 | @lark-apaas/client-toolkit-lite 的 scopedStorage (localStorage封装) |
| 表单 | react-hook-form + zod |
| Toast | sonner |

## 二、目录结构

```
src/
├── app.tsx                    # 路由入口（单路由 /）
├── index.tsx                  # 应用入口
├── index.css                  # 全局样式（Tailwind 4）
├── config/
│   └── navConfig.ts           # 导航配置（4大模块）
├── data/
│   ├── accounting.ts          # 会计课程数据
│   ├── accountingAnswers.ts
│   ├── english.ts             # 英语课程数据
│   ├── englishAnswers.ts
│   ├── selfmedia.ts           # 自媒体模块静态内容
│   └── selfmedia-daily.ts     # 自媒体30天计划/选题/脚本/素材/账号数据
├── hooks/
│   ├── useStudyProgress.ts    # 30天进度管理（核心）
│   ├── useEnglishReview.ts
│   ├── useSpeech.ts
│   └── use-mobile.ts
├── components/
│   ├── Layout.tsx             # 极简Layout（仅Outlet）
│   ├── StudySidebar.tsx       # 左侧导航
│   ├── TopProgressBar.tsx     # 顶部进度条
│   ├── SpeechControls.tsx
│   ├── panels/
│   │   ├── OverviewPanel.tsx
│   │   ├── DailyCombinedPanel.tsx
│   │   ├── AccountingDetailPanel.tsx
│   │   ├── EnglishDetailPanel.tsx
│   │   ├── EnglishResourcesPanel.tsx
│   │   ├── SelfmediaPanel.tsx        # 自媒体主面板（Tabs组织）
│   │   └── selfmedia/
│   │       ├── HotVideoPanel.tsx     # 热门视频（假数据占位）
│   │       ├── ScriptGeneratorPanel.tsx  # 脚本生成（setTimeout假AI）
│   │       ├── DataReviewPanel.tsx   # 数据复盘
│   │       ├── HistoryPanel.tsx      # 历史记录
│   │       ├── MaterialLibraryPanel.tsx  # 素材库
│   │       └── OperationRefPanel.tsx # 运营参考
│   └── ui/                      # shadcn UI组件
├── lib/
│   └── utils.ts               # cn()工具
└── pages/
    ├── WorkbenchPage/WorkbenchPage.tsx  # 主页面（左侧导航+右侧内容）
    └── NotFoundPage/NotFoundPage.tsx
```

## 三、自媒体模块现状

### 3.1 导航入口（navConfig.ts）
自媒体组下有12个菜单项，映射到4种payload kind：
- `selfmedia-module`：静态内容展示（定位/流程/渠道/拆解/脚本模板/类型）
- `selfmedia-script`：热门/脚本（hot, script）
- `selfmedia-data`：数据/历史/运营（data, history, operation）
- `selfmedia-daily`：30天计划

### 3.2 SelfmediaPanel 架构
- 顶部账号/门店选择器（持久化到 scopedStorage）
- Tabs动态切换：hot / script / material / data / history / operation / reference / daily
- 账号切换时自动联动门店（个人IP→通用）

### 3.3 已有数据模型（selfmedia-daily.ts）
- `ACCOUNT_PROFILE`：账号定位
- `THIRTY_DAY_PLAN`：30天每日计划（30条）
- `TOPIC_LIBRARY`：10个选题
- `SAMPLE_SCRIPTS`：1个示例脚本
- `SAMPLE_ANALYSES`：1个待采集分析（占位）
- `IPublishRecord`：发布记录接口（含完整数据字段）
- `EMPTY_PUBLISH_RECORD`：空记录模板
- `ACCOUNTS` / `STORES` / `ACCOUNT_LIST`：3账号2门店
- `MATERIAL_TYPES` / `SAMPLE_MATERIALS`：10种素材类型+5个示例

## 四、问题清单（需在3.0中修复）

### 4.1 假AI问题
| 文件 | 问题 | 严重度 |
|---|---|---|
| ScriptGeneratorPanel.tsx | `setTimeout(1000)` 模拟AI生成，输出固定模板 | 高 |
| HotVideoPanel.tsx | "今日热门"无真实联网数据，使用占位 | 高 |
| DataReviewPanel.tsx | 数据复盘可能基于mock | 中 |

### 4.2 功能缺失
- 无今日作战台（首页直接看今日任务）
- 无AI选题引擎（三档选题）
- 无老板娘人物库（CharacterMemory）
- 无真实故事库（StoryLibrary）
- 无脚本导演（逐镜头拍摄执行表）
- 无发布管理（PublishManager）
- 无数据诊断（VideoAnalytics，含投流ROI）
- 无内容实验室（Hook A/B/C测试）
- 无成功模板库（WinningTemplates）
- 无多账号多门店数据隔离（accountId/storeId未贯穿所有实体）

### 4.3 持久化问题
- 选题/脚本/素材/发布/数据均未持久化（刷新丢失）
- 仅账号/门店选择和学习进度持久化
- 素材上传仅存内存（File对象），刷新丢失

### 4.4 移动端问题
- 固定桌面布局：左侧sidebar + 右侧max-w-4xl内容
- 脚本使用横向表格/列表，非纵向卡片
- 数据录入无快速数字输入
- 无PWA支持（无manifest、无service worker）
- viewport已设置但无移动端专项适配

### 4.5 虚假数据
- SAMPLE_ANALYSES 标注"待采集"但仍展示为内容
- HotVideoPanel 可能声称"今日热门"
- 5个SAMPLE_MATERIALS标注"演示素材"

## 五、import/export 扫描

### 核心依赖链
```
WorkbenchPage → SelfmediaPanel → [HotVideoPanel, ScriptGeneratorPanel, DataReviewPanel, HistoryPanel, OperationRefPanel, MaterialLibraryPanel]
SelfmediaPanel → data/selfmedia (MOCK_SELFMEDIA_MODULES)
SelfmediaPanel → data/selfmedia-daily (MOCK_SELFMEDIA_DAILY, ACCOUNTS, STORES)
```

### 未使用/潜在问题
- `@lark-apaas/client-toolkit-lite` 仅用了 scopedStorage
- echarts/recharts 已安装但自媒体模块未使用
- framer-motion 大量使用，移动端需注意性能

## 六、路由与状态

- 单页应用，无多路由（仅 `/` 和 `*`）
- 导航状态通过 `selectedId` + scopedStorage 管理
- 30天进度通过 `useStudyProgress` hook 管理，currentDay 持久化
- 自媒体模块内部状态均为组件内 useState，无全局状态

## 七、TODO/未实现按钮

- ScriptGeneratorPanel：上传素材后"等待AI分析"——无实际分析
- HotVideoPanel：热门视频侦察——无真实数据
- MaterialLibraryPanel：上传/删除——仅内存操作
- DataReviewPanel：投流建议——基于mock数据

## 八、开发策略

1. **不重构整个项目**：保留英语/会计/30天/导航/UI体系
2. **新建 selfmedia3 子目录**：所有3.0新组件放 `src/components/panels/selfmedia3/`
3. **新建数据层**：`src/data/selfmedia3-types.ts` + `src/hooks/useSelfMediaStore.ts`
4. **重写 SelfmediaPanel**：作为3.0入口，整合新Tabs，保留旧reference静态内容
5. **扩展 navConfig**：在自媒体组下新增3.0菜单项
6. **PWA**：添加 manifest.json + 简易 service worker + index.html 引用
7. **移动端**：StudySidebar 已有 use-mobile hook，检查并优化；内容区纵向卡片布局
8. **禁止假AI**：所有AI功能显示"AI能力未连接"，提供手动录入+复制到外部AI
9. **禁止虚假热门**：改为"热门案例库（待核验）"

## 九、保留清单（不可删除/修改）

- 英语模块全部文件
- 会计模块全部文件
- 30天学习进度系统（useStudyProgress）
- 原有导航结构（navConfig，仅新增不删除）
- 原有UI组件（ui/目录）
- 原有视觉风格（Tailwind配置、颜色体系）
- OverviewPanel / DailyCombinedPanel / TopProgressBar / StudySidebar
