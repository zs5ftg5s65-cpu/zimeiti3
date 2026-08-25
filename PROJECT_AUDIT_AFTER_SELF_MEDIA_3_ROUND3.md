# 自媒体3.0 第三轮修复审计报告

**日期**：2026-08-25
**版本**：自媒体3.0 · 第三轮最终版
**基础**：工作台2.1 二次修复版 + 第一轮 + 第二轮

---

## 一、本轮修复内容

### 1. JSON 导入 scope 隔离（最高优先级）

**问题**：第二轮的 `importData()` 直接调用 `setTopics(d.topics)` 等，绕过了 addScoped/updateScoped/removeScoped 的账号+门店隔离，可导入其他账号数据。

**修复**：
- 重写 `importData()`：导入前先调用 `previewImport()` 校验 version 和数据结构
- 所有 11 个 scoped 实体（topics/stories/scripts/media/publishes/analytics/reviews/adDecisions/experiments/templates/hotCases）只导入 `accountId === currentAccount && storeId === currentStore` 的记录
- characters 特殊处理：只导入 `scopeType=shared` + 当前 scope 私有
- warRoomByScope 只合并当前 scope 的 key
- 按 id 合并而非覆盖，不会删除已有数据
- 其他账号/门店数据自动跳过，返回明确提示消息

### 2. shared 人物资料重构（scopeType）

**问题**：第二轮用 `accountId === "bosslady"` 代表共享资料，是 hack 写法。

**修复**：
- Character 类型新增 `scopeType: "account" | "store" | "shared"`
- 新增 `isCharacterVisible(c, accountId, storeId)` 函数：
  - `shared`：所有账号可见
  - `account`：仅同账号可见
  - `store`：需同账号同门店
- 默认老板娘资料 `scopeType=shared`，accountId=bosslady/storeId=common
- 旧数据自动迁移：bosslady+common → shared，其余 → account
- 新增 `getVisibleCharacters()`：返回当前 scope 私有 + shared 人物
- Character CRUD 独立实现：addCharacter 接受 scopeType 参数；shared 人物所有账号可编辑（默认记录不可删除）；私有人物校验 scope

### 3. AI Prompt 读取规则

**修复**：`aiPrompts.ts` 的 `contextBlock()` 改用 `store.getVisibleCharacters()`，只读取当前 scope 私有 + shared 人物资料，禁止读取其他账号/门店私人资料。

### 4. 模板反哺选题方向

**新增**：TopicEnginePanel 增加【根据成功模板生成选题方向（A/B/C）】按钮。
- 读取当前 scope 的真实 WinningTemplates 数据
- 从模板的 hookStructure/contentType/shotStructure/cta/realData 生成 3 个结构化候选：
  - A 稳妥型：延续验证方向，保持 Hook 和 CTA
  - B 测试型：保持结构，测试新 Hook 角度
  - C 突破型：延伸到故事讲述类型
- 非随机生成，非假数据，每个方向标注依据的模板主题和真实数据
- 点击"采用此方向"自动带入手动添加表单

### 5. 导入前预览确认

**新增**：DataBackupBar 重写。
- 选择 JSON 文件后不直接导入，先显示预览面板：
  - 本文件各实体总数（选题/人物/故事/脚本/素材/发布/数据/复盘/投流/实验/模板/案例/作战台）
  - 当前账号、当前门店
  - 各实体可导入数、跳过数、shared 数
  - 其他 scope 数据提示
- 【确认导入】按钮才真正写入
- 【取消】按钮放弃

### 6. 三种导出范围

**新增**：
- 【导出全部数据】：所有账号+门店+shared
- 【导出当前账号】：当前 accountId 所有门店 + shared
- 【导出当前门店】：当前 accountId + currentStore + shared
- 每种导出文件名标注范围

### 7. ESLint 配置

- 新增 `eslint.config.js`（flat config，ESM）
- 使用 @eslint/js recommended + typescript-eslint recommended + react-hooks recommended
- 修复 2 个 error（input.tsx/textarea.tsx 空接口改为 type alias）
- 修复自有代码中的 unused vars warnings（selfmedia3 面板、useSelfMediaStore、aiPrompts）
- 最终结果：**0 errors，11 warnings**（均为旧代码 selfmedia/english/WorkbenchPage 中的未使用变量，不影响功能）

### 8. CharacterPanel scopeType UI

- 新建人物时可选择可见范围：账号私有/门店私有/公共资料
- 人物卡片显示范围标签（公共资料/账号私有/门店私有）
- 默认老板娘资料不可删除

---

## 二、第一轮发现的问题（历史记录）

1. 自媒体模块从 2.0 升级到 3.0，新增 13 个面板
2. PWA manifest/service worker/icons 缺失
3. 数据持久化不完整
4. 移动端适配不足
5. Tailwind v4 插件缺失（第二轮修复）

---

## 三、第二轮修复的问题（历史记录）

1. 数据闭环打通：选题→脚本→素材→发布→数据→复盘→模板→选题
2. Store 层多账号多门店 scope 强制隔离（addScoped/updateScoped/removeScoped）
3. WarRoom 按 accountId+storeId+Day 隔离
4. 清理未经确认的默认人物事实（"50岁""30年"等）
5. localStorage 配额错误提示 + JSON 导出导入
6. PWA 更新策略（HTML Network First / JS-CSS Cache First / CACHE_VERSION）
7. AI 提示词生成器（外部 AI 工作流）
8. 移动端抽屉导航
9. vite.config.ts 添加 @tailwindcss/vite 插件（关键 Bug）

---

## 四、数据闭环验证

| 环节 | 关联字段 | 状态 |
|------|----------|------|
| 选题→脚本 | `script.sourceTopicId === topic.id` | ✅ 已验证 |
| 脚本→素材 | `script.requiredMediaIds[]` → `media.id` | ✅ 已验证 |
| 发布→数据 | `analytics.videoId === publish.videoId` | ✅ 已验证 |
| 数据→复盘 | `review.videoId + review.analyticsId` | ✅ 已验证 |
| 复盘→模板 | `template.sourceReviewId === review.id` | ✅ 已验证 |
| 模板→选题 | TopicEngine 读取真实 WinningTemplates | ✅ 本轮新增 |

---

## 五、多账号隔离

- 3 个账号：guxiangli（古巷里）、guangdeguangying（广德光英）、bosslady（老板娘个人IP）
- 所有 add* 方法由 store 统一注入 currentAccount/currentStore，组件无法覆盖
- update*/remove* 内部校验 id+accountId+storeId，跨 scope 拒绝并 toast.error
- importData 只导入当前 scope + shared
- 逻辑测试 8/8 通过

## 六、多门店隔离

- 2 个门店：guxiangli、guangdeguangying（个人IP用 common）
- 同账号隔离机制，storeId 参与所有 scope 校验

## 七、Day 隔离

- WarRoom key: `${accountId}_${storeId}_${day}`
- Day1-Day30 每天独立保存 topic/script/shoot/publish/data/review 完成状态
- 切换 Day 不继承，切换账号/门店不继承

## 八、数据持久化

- 所有实体存储在 localStorage（key 前缀 `__app____sm3_`）
- 保存失败（配额超限）toast.error 提示，不静默
- 刷新页面数据不丢失
- 支持 JSON 导出（三种范围）和导入（预览+scope过滤）

## 九、JSON 导入导出

- 导出：全部 / 当前账号 / 当前门店（均含 shared 人物）
- 导入：version 校验 → 结构校验 → 预览统计 → 用户确认 → scope 过滤 → 按 id 合并
- 其他账号/门店数据自动跳过并提示

## 十、PWA

- manifest.json 存在
- sw.js 存在，CACHE_VERSION = selfmedia3-v3.0.3
- HTML: Network First；JS/CSS/字体/图片: Cache First
- 新版本检测后提示"发现新版本，点击刷新"
- 可安装到主屏幕（Safari → 添加到主屏幕）
- **不声称完全离线**：数据在 localStorage，清除浏览器数据会丢失

## 十一、移动端导航

- 第二轮已完成：iPhone 竖屏时左侧栏隐藏，顶部汉堡按钮打开抽屉导航
- 包含全部一级/二级导航（英语/会计/30天学习/自媒体）
- 点击导航项自动关闭抽屉
- 脚本纵向卡片，数据快速数字输入

## 十二、AI 真实能力状态

**当前没有真实 AI API。**

- 所有 AI 功能显示"AI能力未连接"提示
- AI 通过**外部 AI Prompt 工作流**实现：
  - 选题引擎：复制完整提示词（含账号/门店/人物/故事/模板/最近选题/拍摄限制）→ 粘贴到外部 AI → 手动添加
  - 脚本导演：同上
  - AI 复盘：同上
- 模板反哺选题方向是**基于真实模板数据的结构化推导**，不是 AI 生成
- 没有 setTimeout 模拟 AI，没有 MOCK_DATA 假分析

## 十三、未完成能力

- 真实 AI API 接入（需后端/API Key）
- 云端素材存储（视频原文件未保存，仅保存素材元数据；图片以 base64 存 localStorage，有容量限制）
- 真实联网热门数据采集（热门案例库仅支持手动添加，标注"待核验"）
- 真实 OCR
- PWA 完全离线（当前为 App Shell 缓存，非完整离线应用）

## 十四、已知限制

1. **localStorage 容量限制**：浏览器通常 5-10MB，大量图片/视频素材可能超限，已提供导出备份和配额错误提示
2. **视频原文件未保存**：素材库视频仅保存元数据，页面明确提示"视频原文件未保存，仅保存素材记录"
3. **JS 包体积**：911KB（gzip 279KB），超 500KB 警告，未做代码分割（不影响功能）
4. **ESLint 11 warnings**：均为旧代码未使用变量，不影响构建和运行
5. **数据存储在浏览器本地**：清除浏览器数据/换浏览器/换设备数据不互通，需用 JSON 导出导入迁移

## 十五、Build 结果

```
> tsc -b && vite build
✓ 2275 modules transformed.
dist/index.html                   1.97 kB │ gzip:   0.86 kB
dist/assets/index-1KS9sSks.css   68.42 kB │ gzip:  11.75 kB
dist/assets/index-Bt_2Zq32.js   911.66 kB │ gzip: 278.86 kB
✓ built in 25.03s
```

- TypeScript: **0 errors**
- Vite build: **success**

## 十六、ESLint 结果

- ESLint: **已配置**（eslint.config.js, flat config, ESLint 9）
- `npm run lint` 结果：**0 errors, 11 warnings**
- 11 warnings 均为旧代码（selfmedia/english/WorkbenchPage/app.tsx）中的未使用变量，非本轮引入

## 十七、测试结果

| 测试项 | 结果 |
|--------|------|
| TypeScript 编译 | ✅ 0 errors |
| Vite 构建 | ✅ success |
| ESLint | ✅ 0 errors |
| isCharacterVisible 逻辑测试 | ✅ 8/8 passed |
| 页面加载（首页/英语/会计/30天/自媒体） | ✅ 正常 |
| 今日作战台显示 | ✅ 正常 |
| 选题引擎显示 | ✅ 正常 |
| PWA manifest/sw.js | ✅ 存在 |
| SW 缓存策略 | ✅ HTML Network First / JS-CSS Cache First |
| 数据闭环字段关联 | ✅ 代码审查通过 |
| scope 隔离 CRUD | ✅ 代码审查通过 |
| 导入 scope 过滤 | ✅ 代码审查通过 |
| 导出三种范围 | ✅ 代码审查通过 |
| 模板反哺选题方向 | ✅ 代码审查通过 |
