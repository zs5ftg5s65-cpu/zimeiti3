// EXPORTS: ISelfmediaModule, MOCK_SELFMEDIA_MODULES
// 自媒体运营参考资料数据

export interface ISelfmediaModule {
  id: string;
  title: string;
  description: string;
  type: 'positioning' | 'workflow' | 'sources' | 'dissectTemplate' | 'scriptTemplate' | 'videoTypes';
  sections?: { title: string; items: string[] }[];
  steps?: { order: number; title: string; duration: string; description: string }[];
  sources?: { platform: string; keywords: string[]; filter: string }[];
  tableHeaders?: string[];
  tableRows?: string[][];
  videoTypes?: { name: string; description: string; example: string }[];
}

export const MOCK_SELFMEDIA_MODULES: ISelfmediaModule[] = [
  {
    id: 'selfmedia-positioning',
    title: '账号定位与人设',
    description: '明确账号定位、目标受众和内容方向，是做好自媒体的第一步。',
    type: 'positioning',
    sections: [
      {
        title: '账号基本信息',
        items: [
          '账号名称：建议包含"徽菜""老板娘""江阴"等关键词，方便搜索',
          '头像：老板娘真人照片或门店招牌，真实亲切',
          '简介：一句话说清楚你是谁、卖什么、在哪',
          '背景图：门店环境或招牌菜品，营造烟火气',
        ],
      },
      {
        title: '人设定位',
        items: [
          '核心人设：直爽真诚的徽菜馆老板娘（光英）— 具体年龄、从业年限等待老板娘本人确认',
          '性格标签：实在、勤快、爱唠嗑、有烟火气',
          '内容风格：真实不做作，像跟邻居聊天一样',
          '差异化：江阴本地徽菜馆，主打广德炖锅和肉汁香芋煲',
        ],
      },
      {
        title: '目标受众',
        items: [
          '本地食客：江阴及周边，25-55岁，喜欢家常菜',
          '美食爱好者：关注餐饮创业、后厨揭秘的人群',
          '餐饮同行：学习经验、交流心得的从业者',
          '潜在顾客：被菜品吸引、想来打卡的人',
        ],
      },
      {
        title: '内容方向',
        items: [
          '老板娘日常：开店、备菜、招呼客人的真实记录',
          '菜品制作：招牌菜做法揭秘、后厨实拍',
          '餐饮创业：开店经验、踩坑分享、经营心得',
          '本地美食：江阴美食、徽菜文化介绍',
        ],
      },
    ],
  },
  {
    id: 'selfmedia-workflow',
    title: '每日工作流程',
    description: '每天30分钟完成自媒体内容生产，高效不费力。',
    type: 'workflow',
    steps: [
      {
        order: 1,
        title: '搜集热门视频',
        duration: '10分钟',
        description: '在抖音、小红书、视频号搜索餐饮类热门视频，筛选3个可借鉴的视频。',
      },
      {
        order: 2,
        title: '拆解爆款逻辑',
        duration: '10分钟',
        description: '分析视频的钩子、结构、文案、BGM、拍摄手法，找出可复制的点。',
      },
      {
        order: 3,
        title: '编写拍摄脚本',
        duration: '10分钟',
        description: '结合本店菜品和人设，改编出一条适合自己的拍摄脚本。',
      },
    ],
  },
  {
    id: 'selfmedia-sources',
    title: '视频搜集渠道与关键词',
    description: '从三大平台搜集热门餐饮视频，关键词和筛选标准都给你准备好了。',
    type: 'sources',
    sources: [
      {
        platform: '抖音',
        keywords: ['餐饮创业', '老板娘日常', '后厨揭秘', '徽菜', '炖锅', '砂锅', '广德炖锅', '餐饮人', '开店vlog', '特色菜制作', '江阴美食', '江苏美食'],
        filter: '点赞≥1万，发布≤24小时，内容可借鉴（非纯探店/纯吃播）',
      },
      {
        platform: '小红书',
        keywords: ['餐饮开店', '老板娘IP', '后厨日常', '特色菜做法', '开店vlog'],
        filter: '点赞≥500，发布≤24小时，图文/视频均可',
      },
      {
        platform: '视频号',
        keywords: ['餐饮老板', '美食制作', '家乡味道'],
        filter: '点赞≥1000，发布≤24小时，适合中老年受众',
      },
    ],
  },
  {
    id: 'selfmedia-dissect',
    title: '爆款视频拆解模板',
    description: '用这个模板拆解任何爆款视频，快速找到可复制的逻辑。',
    type: 'dissectTemplate',
    tableHeaders: ['拆解维度', '分析要点', '示例'],
    tableRows: [
      ['标题/封面', '是否有悬念、数字、痛点？封面是否清晰有食欲？', '"数字/经营年限类标题：必须填写真实数字后再使用"'],
      ['开头3秒', '用什么钩子留住观众？（提问/反差/结果前置）', '直接展示成品菜，"这锅炖了3小时"'],
      ['内容结构', '起承转合是否清晰？节奏如何？', '痛点→做法→成果→引导'],
      ['文案/台词', '是否口语化？有没有金句？', '老板娘真实口头表达（待确认，不要编造）'],
      ['BGM/音效', '音乐风格是否匹配？有没有关键音效？', '轻快民谣+炒菜滋滋声'],
      ['拍摄手法', '景别变化？运镜？特写？', '近景炒菜+特写食材+中景人物'],
      ['互动引导', '结尾有没有引导点赞/评论/关注？', '"你们家乡有这道菜吗？评论区告诉我"'],
      ['可借鉴点', '哪些可以直接用到自己的视频里？', '开头直接展示成品+数字钩子'],
    ],
  },
  {
    id: 'selfmedia-script',
    title: '拍摄脚本模板',
    description: '套用这个模板，10分钟写出一条可直接拍摄的脚本。',
    type: 'scriptTemplate',
    tableHeaders: ['环节', '时长', '内容要点', '画面/台词示例'],
    tableRows: [
      ['钩子（0-3秒）', '3秒', '悬念/数字/反差/痛点，留住观众', '"这锅肉汁香芋煲，我们家卖了20年"'],
      ['引入（3-8秒）', '5秒', '交代背景，建立信任', '我是光英，江阴开徽菜馆的老板娘'],
      ['主体（8-40秒）', '32秒', '核心内容：做法/故事/揭秘', '展示食材→烹饪过程→成品特写'],
      ['升华（40-50秒）', '10秒', '金句/情感/价值观', '老板娘真实观点（待确认，不要编造）'],
      ['引导（50-55秒）', '5秒', '互动引导+门店信息', '"想来吃的朋友，评论区扣1，我给你留位置"'],
    ],
  },
  {
    id: 'selfmedia-types',
    title: '适合的5种爆款视频类型',
    description: '这5种类型最适合餐饮老板娘人设，照着拍就有流量。',
    type: 'videoTypes',
    videoTypes: [
      {
        name: '菜品制作揭秘型',
        description: '展示招牌菜的完整制作过程，突出食材和手艺',
        example: '"广德炖锅的秘密，今天后厨实拍给你看"',
      },
      {
        name: '老板娘日常vlog型',
        description: '记录开店一天的真实生活，有烟火气有人情味',
        example: '"餐饮老板娘的一天：从备菜到打烊"',
      },
      {
        name: '餐饮创业故事型',
        description: '分享开店经历、踩坑经验、经营心得',
        example: '"开饭店10年，我踩过的3个大坑"',
      },
      {
        name: '食材挑选科普型',
        description: '教观众怎么挑好食材，建立专业信任',
        example: '"买芋头别只看大小，老板娘教你3招挑粉糯的"',
      },
      {
        name: '客人互动暖心型',
        description: '记录和客人的温暖互动，体现人情味',
        example: '"老客人带孩子来吃饭，孩子说还是这个味道"',
      },
    ],
  },
];
