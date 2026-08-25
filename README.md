# 30天成长学习工作台

一个整合会计实操、每日英语、自媒体运营三大模块的个人成长学习工作台。

## 项目简介

本项目为98年女生（四六级已过，在妈妈光英老板娘的江阴徽菜馆工作）定制的30天学习工作台，包含：

- **会计实操30天课程**：5阶段从建账到报税，每天有学习任务、知识点、视频、课后作业（含可隐藏答案）
- **每日英语进阶**：B1→B2+水平，每天20单词+短文/口语视频+阅读小测+口语练习+复习模式
- **自媒体运营**：今日热门视频侦察、智能写脚本、数据复盘与投流建议、历史记录、运营参考

## 技术栈

- React 19 + TypeScript 5.9
- Vite 8
- Tailwind CSS 4
- shadcn/ui 组件库
- Framer Motion 动画
- React Router 7
- Web Speech API（语音朗读）
- localStorage（进度持久化）

## 项目结构

```
study-workbench-src/
├── package.json              # 项目依赖
├── vite.config.ts            # Vite配置
├── tsconfig.json             # TypeScript配置
├── index.html                # HTML入口
├── README.md                 # 本文件
└── src/
    ├── index.tsx             # 应用入口
    ├── app.tsx               # 路由配置
    ├── index.css             # 全局样式
    ├── config/
    │   └── navConfig.ts      # 导航配置
    ├── lib/
    │   └── utils.ts          # 工具函数
    ├── hooks/
    │   ├── useStudyProgress.ts   # 学习进度Hook
    │   ├── useSpeech.ts          # 语音朗读Hook
    │   ├── useEnglishReview.ts   # 英语复习Hook
    │   └── use-mobile.ts         # 移动端检测Hook
    ├── data/
    │   ├── accounting.ts         # 会计30天课程数据
    │   ├── accountingAnswers.ts  # 会计课后作业答案
    │   ├── english.ts            # 英语30天课程数据
    │   ├── englishAnswers.ts     # 英语课后作业答案
    │   ├── selfmedia.ts          # 自媒体运营参考数据
    │   └── selfmedia-daily.ts    # 自媒体每日数据
    ├── components/
    │   ├── Layout.tsx            # 布局组件
    │   ├── StudySidebar.tsx      # 学习侧边栏（每日导航）
    │   ├── TopProgressBar.tsx    # 顶部进度条
    │   ├── SpeechControls.tsx    # 语音控制组件
    │   └── panels/
    │       ├── OverviewPanel.tsx          # 总览面板
    │       ├── DailyCombinedPanel.tsx     # 每日融合面板
    │       ├── AccountingDetailPanel.tsx  # 会计详情面板
    │       ├── EnglishDetailPanel.tsx     # 英语详情面板
    │       ├── EnglishResourcesPanel.tsx  # 英语资源面板
    │       ├── SelfmediaPanel.tsx         # 自媒体主面板
    │       └── selfmedia/
    │           ├── HotVideoPanel.tsx       # 热门视频侦察
    │           ├── ScriptGeneratorPanel.tsx # 智能写脚本
    │           ├── DataReviewPanel.tsx     # 数据复盘
    │           ├── HistoryPanel.tsx        # 历史记录
    │           └── OperationRefPanel.tsx   # 运营参考
    └── pages/
        ├── WorkbenchPage/
        │   └── WorkbenchPage.tsx   # 工作台主页
        └── NotFoundPage/
            └── NotFoundPage.tsx    # 404页面
```

## 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 功能说明

### 会计实操模块
- 30天课程，5个阶段：基础建账→日常核算→月末报表→税务申报→综合实战
- 每天包含：学习任务、知识点、推荐视频、课后作业（含可隐藏参考答案）、实操作业
- 进度自动保存，支持打卡

### 每日英语模块
- 30天进阶课程，从B1到B2+水平
- 每天包含：20个单词（带翻译）、英语短文（带翻译，可隐藏）、口语视频、阅读小测（含答案）、口语练习（含参考示例）
- 支持语音朗读（Web Speech API）
- 复习模式：单词复习、错题复习、艾宾浩斯复习计划

### 自媒体运营模块
- 今日热门视频侦察：AI生成3个热门餐饮视频方向+8维度拆解+1个完整脚本
- 智能写脚本：输入文字/图片/视频，生成适配门店的拍摄脚本（去AI化、口语化）
- 数据复盘：上传后台截图自动识别数据，给出投流建议
- 历史记录：保存每日侦察和脚本
- 运营参考：账号定位、工作流程、搜集渠道、拆解模板、脚本模板、爆款类型

## 注意事项

1. **UI组件**：本项目使用shadcn/ui组件库，需要单独安装。运行 `npx shadcn@latest init` 初始化，然后按需添加组件。
2. **英语数据文件**：`english.ts` 和 `englishAnswers.ts` 包含30天完整课程数据，文件较大，已单独提供。
3. **AI能力**：自媒体模块的热门视频侦察、智能写脚本、数据复盘功能需要接入AI服务，本代码中使用模拟数据，实际使用时需替换为真实API调用。
4. **语音朗读**：使用浏览器原生Web Speech API，需要浏览器支持。

## 门店信息

- 门店：江阴徽菜馆（光英老板娘）
- 主营：广德炖锅、肉汁香芋煲（荔浦芋头）等砂锅菜品
- 人设：50岁直爽真诚的餐饮老板娘
- 运营者：98年女生（老板娘女儿），四六级已过
