# 自媒体3.0 Phase 3 第二轮变更记录

基线：自媒体二次修复3-Phase3版

本轮继续只处理：今日任务 → 今日选题 → 今日完整脚本的数据闭环，不进入联网/外部AI实现。

## 已完成

1. 新增统一 `buildCompleteScriptFromTopic()`：根据当前Day任务与选题生成可直接执行的8镜头完整拍摄脚本，不再创建3个空镜头骨架。
2. `useSelfMediaStore` 新增 `createScriptFromTopic()` 统一入口：按当前账号+门店+选题+Day查重，已有脚本直接复用，没有则创建并绑定 `sourceTopicId/day`。
3. 今日作战台的“采用”改为“采用并自动生成今日完整脚本”；生成后脚本自动进入当前Day脚本链路。
4. 今日作战台的“生成完整脚本”改为使用统一完整脚本生成器。
5. 选题引擎的“采用并生成完整脚本”与“生成脚本”统一走同一生成入口。
6. 脚本导演增加“自动生成今日完整脚本”按钮，并优先打开当前Day脚本；自由脚本仍然独立存在。
7. 新增 `setWarRoomTask()`：把任务状态设置为指定值而非简单toggle，避免重复生成/重复点击导致“已完成”被误切回未完成。

## 数据兼容

- 未修改、重命名或删除现有 localStorage key。
- 未修改 `__sm3_war_room_by_scope` 的结构。
- 未修改 `__app_current_day`、`__app_study_progress`、`__app_word_learning` 等既有学习key。
- `Topic.day` / `Script.day` 继续为可选字段。
- 新生成脚本复用现有 `__sm3_scripts` 数据，不新增持久化key。

## 本轮未做

- 真实外部AI API
- 联网热门视频自动采集
- 视频上传/视频AI拆解

这些仍作为后续阶段，当前先把离线数据闭环和完整脚本结构打牢。
