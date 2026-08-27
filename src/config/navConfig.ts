// EXPORTS: NavItem, NAV_CONFIG
export interface NavItem {
  id: string;
  label: string;
  icon?: string;
  type: 'group' | 'stage' | 'item';
  children?: NavItem[];
  /** 业务类型，用于映射右侧面板 */
  payload?: {
    kind:
      | 'accounting-day'
      | 'english-day'
      | 'english-resources'
      | 'english-tools'
      | 'selfmedia-module'
      | 'selfmedia-script'
      | 'selfmedia-data'
      | 'selfmedia-daily'
      | 'overview-schedule'
      | 'overview-checkin'
      | 'review-center';
    day?: number;
    moduleId?: string;
  };
}

const accountingStages = [
  {
    start: 1,
    end: 5,
    title: '第一阶段：会计基础与建账',
  },
  {
    start: 6,
    end: 12,
    title: '第二阶段：日常业务核算',
  },
  {
    start: 13,
    end: 18,
    title: '第三阶段：月末处理与报表',
  },
  {
    start: 19,
    end: 25,
    title: '第四阶段：税务申报',
  },
  {
    start: 26,
    end: 30,
    title: '第五阶段：综合实战',
  },
];

const englishWeeks = [
  { start: 1, end: 7, title: '第1周：唤醒语感 + 口语破冰' },
  { start: 8, end: 14, title: '第2周：话题拓展 + 流利度提升' },
  { start: 15, end: 21, title: '第3周：深度输入 + 表达升级' },
  { start: 22, end: 28, title: '第4周：实战应用 + 综合输出' },
];

export const NAV_CONFIG: NavItem[] = [
  {
    id: 'overview',
    label: '总览与打卡',
    icon: 'layout-dashboard',
    type: 'group',
    children: [
      {
        id: 'overview-schedule',
        label: '每日时间安排建议',
        type: 'item',
        payload: { kind: 'overview-schedule' },
      },
      {
        id: 'overview-checkin',
        label: '30天学习进度打卡表',
        type: 'item',
        payload: { kind: 'overview-checkin' },
      },
      {
        id: 'review-center',
        label: '复习中心',
        type: 'item',
        payload: { kind: 'review-center' },
      },
    ],
  },
  {
    id: 'accounting',
    label: '会计实操30天课程',
    icon: 'calculator',
    type: 'group',
    children: accountingStages.map((s) => ({
      id: `accounting-stage-${s.start}`,
      label: s.title,
      type: 'stage' as const,
      children: Array.from({ length: s.end - s.start + 1 }, (_, i) => s.start + i).map((d) => ({
        id: `accounting-day-${d}`,
        label: `第${d}天`,
        type: 'item' as const,
        payload: { kind: 'accounting-day' as const, day: d },
      })),
    })),
  },
  {
    id: 'english',
    label: '英语学习方案',
    icon: 'languages',
    type: 'group',
    children: [
      {
        id: 'english-tools',
        label: '学习平台与工具',
        type: 'item',
        payload: { kind: 'english-tools' },
      },
      ...englishWeeks.map((w) => ({
        id: `english-week-${w.start}`,
        label: w.title,
        type: 'stage' as const,
        children: Array.from({ length: w.end - w.start + 1 }, (_, i) => w.start + i).map(
          (d) => ({
            id: `english-day-${d}`,
            label: `第${d}天`,
            type: 'item' as const,
            payload: { kind: 'english-day' as const, day: d },
          }),
        ),
      })),
      {
        id: 'english-day-29',
        label: '第29天：综合测试与输出',
        type: 'item',
        payload: { kind: 'english-day', day: 29 },
      },
      {
        id: 'english-day-30',
        label: '第30天：学习总结与展望',
        type: 'item',
        payload: { kind: 'english-day', day: 30 },
      },
      {
        id: 'english-resources',
        label: '推荐英语学习资源清单',
        type: 'item',
        payload: { kind: 'english-resources' },
      },
    ],
  },
  {
    id: 'selfmedia',
    label: '自媒体运营',
    icon: 'video',
    type: 'group',
    children: [
      {
        id: 'selfmedia3-warroom',
        label: '今日作战台',
        type: 'item',
        payload: { kind: 'selfmedia-script', moduleId: 'warroom' },
      },
      {
        id: 'selfmedia3-stage-core',
        label: '自媒体3.0 · 创作中枢',
        type: 'stage',
        children: [
          {
            id: 'selfmedia3-topic',
            label: 'AI选题引擎',
            type: 'item',
            payload: { kind: 'selfmedia-script', moduleId: 'topic' },
          },
          {
            id: 'selfmedia3-character',
            label: '老板娘人物库',
            type: 'item',
            payload: { kind: 'selfmedia-script', moduleId: 'character' },
          },
          {
            id: 'selfmedia3-story',
            label: '真实故事库',
            type: 'item',
            payload: { kind: 'selfmedia-script', moduleId: 'story' },
          },
          {
            id: 'selfmedia3-script',
            label: 'AI脚本导演',
            type: 'item',
            payload: { kind: 'selfmedia-script', moduleId: 'script' },
          },
          {
            id: 'selfmedia3-media',
            label: '素材库',
            type: 'item',
            payload: { kind: 'selfmedia-script', moduleId: 'media' },
          },
          {
            id: 'selfmedia3-publish',
            label: '发布管理',
            type: 'item',
            payload: { kind: 'selfmedia-data', moduleId: 'history' },
          },
        ],
      },
      {
        id: 'selfmedia3-stage-data',
        label: '自媒体3.0 · 数据与复盘',
        type: 'stage',
        children: [
          {
            id: 'selfmedia3-analytics',
            label: '数据诊断',
            type: 'item',
            payload: { kind: 'selfmedia-data', moduleId: 'data' },
          },
          {
            id: 'selfmedia3-review',
            label: 'AI复盘',
            type: 'item',
            payload: { kind: 'selfmedia-data', moduleId: 'review' },
          },
          {
            id: 'selfmedia3-ad',
            label: '投流判断',
            type: 'item',
            payload: { kind: 'selfmedia-data', moduleId: 'ad' },
          },
          {
            id: 'selfmedia3-lab',
            label: '内容实验室',
            type: 'item',
            payload: { kind: 'selfmedia-data', moduleId: 'lab' },
          },
          {
            id: 'selfmedia3-templates',
            label: '成功模板库',
            type: 'item',
            payload: { kind: 'selfmedia-data', moduleId: 'templates' },
          },
          {
            id: 'selfmedia3-hotcases',
            label: '热门案例库',
            type: 'item',
            payload: { kind: 'selfmedia-script', moduleId: 'hot' },
          },
        ],
      },
      {
        id: 'selfmedia-daily',
        label: '30天自媒体成长计划',
        type: 'item',
        payload: { kind: 'selfmedia-daily' },
      },
      {
        id: 'selfmedia-stage-knowledge',
        label: '知识库（静态参考）',
        type: 'stage',
        children: [
          {
            id: 'selfmedia-positioning',
            label: '账号定位',
            type: 'item',
            payload: { kind: 'selfmedia-module', moduleId: 'selfmedia-positioning' },
          },
          {
            id: 'selfmedia-workflow',
            label: '每日工作流程',
            type: 'item',
            payload: { kind: 'selfmedia-module', moduleId: 'selfmedia-workflow' },
          },
          {
            id: 'selfmedia-sources',
            label: '视频搜集渠道与关键词',
            type: 'item',
            payload: { kind: 'selfmedia-module', moduleId: 'selfmedia-sources' },
          },
          {
            id: 'selfmedia-dissect',
            label: '爆款视频拆解模板',
            type: 'item',
            payload: { kind: 'selfmedia-module', moduleId: 'selfmedia-dissect' },
          },
          {
            id: 'selfmedia-script',
            label: '拍摄脚本模板',
            type: 'item',
            payload: { kind: 'selfmedia-module', moduleId: 'selfmedia-script' },
          },
          {
            id: 'selfmedia-types',
            label: '适合的5种爆款视频类型',
            type: 'item',
            payload: { kind: 'selfmedia-module', moduleId: 'selfmedia-types' },
          },
          {
            id: 'selfmedia-operation-ref',
            label: '运营参考资料库',
            type: 'item',
            payload: { kind: 'selfmedia-data', moduleId: 'operation' },
          },
        ],
      },
    ],
  },
];
