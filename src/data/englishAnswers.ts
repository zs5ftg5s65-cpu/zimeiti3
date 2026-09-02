// 英语学习30天答案数据
export interface IReadingQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface IVocabQuizItem {
  word: string;
  options: string[];
  correctIndex: number;
  meaning?: string;
}

export interface IEnglishAnswerKey {
  day: number;
  readingQuiz: IReadingQuizQuestion[];
  speakingExamples: { en: string; cn: string }[];
  speakingSamples?: string[];
  vocabQuiz: IVocabQuizItem[];
}

function generateDayAnswers(day: number): IEnglishAnswerKey {
  const themes = [
    "日常生活", "餐饮美食", "工作职业", "旅行出行", "健康健身",
    "购物消费", "娱乐休闲", "人际关系", "科技生活", "环境自然",
    "教育学习", "综合复习",
  ];
  const theme = themes[Math.min(Math.floor((day - 1) / 3), themes.length - 1)];
  const quizQuestions: IReadingQuizQuestion[] = [
    { question: `根据阅读文章，关于${theme}以下哪个说法是正确的？`, options: [`${theme}对大多数人来说不重要`, `${theme}需要长期坚持和练习`, `${theme}只有专业人士才需要`, `${theme}可以在一天内学会`], correctIndex: 1, explanation: "文章强调了任何技能或习惯都需要时间和持续的努力，不是一蹴而就的。" },
    { question: `文章中提到的关于${theme}的建议是什么？`, options: ["尽可能快地完成", "从小处开始，逐步建立习惯", "只在有时间的时候做", "必须花钱请专业老师"], correctIndex: 1, explanation: "文章建议从简单的小步骤开始，建立可持续的习惯，而不是追求速成。" },
    { question: `根据文章，${theme}中最常见的错误是什么？`, options: ["太有耐心", "期望立竿见影，放弃得太早", "练习得太多", "记录得太详细"], correctIndex: 1, explanation: "很多人因为看不到即时效果而过早放弃，文章强调坚持的重要性。" },
  ];
  const speakingExamples = [
    { en: `In my opinion, ${theme} is very important for personal growth.`, cn: `在我看来，${theme}对个人成长非常重要。` },
    { en: `I started paying attention to ${theme} about a year ago.`, cn: `我大约一年前开始关注${theme}。` },
    { en: "The biggest challenge for me is staying consistent.", cn: "对我来说最大的挑战是保持坚持。" },
    { en: "I would recommend starting with small steps every day.", cn: "我建议每天从一小步开始。" },
    { en: "Over time, you will see the benefits of your efforts.", cn: "随着时间推移，你会看到努力的回报。" },
  ];
  const vocabQuiz: IVocabQuizItem[] = [
    { word: "routine", options: ["路线", "日常惯例", "路由器", "例行公事"], correctIndex: 1 },
    { word: "delicious", options: ["危险的", "美味的", "困难的", "不同的"], correctIndex: 1 },
    { word: "colleague", options: ["大学", "同事", "收藏品", "学院"], correctIndex: 1 },
    { word: "itinerary", options: ["行程", "文学", "迭代", "意图"], correctIndex: 0 },
    { word: "nutrition", options: ["营养", "通知", "核心理念", "中立"], correctIndex: 0 },
  ];
  return { day, readingQuiz: quizQuestions, speakingExamples, vocabQuiz };
}

export const MOCK_ENGLISH_ANSWERS: Record<number, IEnglishAnswerKey> = {};
for (let i = 1; i <= 30; i++) MOCK_ENGLISH_ANSWERS[i] = generateDayAnswers(i);

MOCK_ENGLISH_ANSWERS[1] = {
  day: 1,
  readingQuiz: [
    { question: "What time does Lisa's alarm go off?", options: ["6:00", "6:30", "7:00", "7:30"], correctIndex: 1, explanation: "文章第一段明确提到'my alarm goes off at 6:30 in the morning'。" },
    { question: "How does Lisa get to work?", options: ["By car", "By bus", "By subway", "By bike"], correctIndex: 2, explanation: "文章提到'I walk to the subway station. The commute takes about 30 minutes.'，所以是坐地铁。" },
    { question: "What does Lisa usually do after dinner?", options: ["Go for a walk", "Watch TV or call family", "Read a book", "Clean the apartment"], correctIndex: 1, explanation: "文章最后一段提到'After dinner, I like to relax by watching TV or calling my family.'" },
  ],
  speakingExamples: [
    { en: "I usually wake up at 7 o'clock, but I hit the snooze button a few times.", cn: "我通常7点醒，但会按几次贪睡按钮。" },
    { en: "My morning routine is pretty simple: shower, breakfast, and check my phone.", cn: "我的早晨惯例很简单：淋浴、早餐、看手机。" },
    { en: "It takes me about 20 minutes to get to work by subway.", cn: "我坐地铁到公司大约20分钟。" },
    { en: "I'm not a morning person at all. I need coffee to function.", cn: "我完全不是早起的人。我需要咖啡才能正常运转。" },
    { en: "After dinner, I usually relax for a while and call my family.", cn: "晚饭后，我通常放松一会儿，然后给家人打电话。" },
  ],
  vocabQuiz: [
    { word: "routine", options: ["路线", "日常惯例", "路由器", "例行公事"], correctIndex: 1 },
    { word: "alarm", options: ["闹钟", "警报员", "手表", "提醒事项"], correctIndex: 0 },
    { word: "snooze", options: ["关闭", "贪睡/稍后提醒", "起床", "工作"], correctIndex: 1 },
    { word: "commute", options: ["通勤", "交流", "社区", "公司"], correctIndex: 0 },
    { word: "relax", options: ["休息、放松", "返回", "重复", "离开"], correctIndex: 0 },
  ],
};

// 兼容旧字段：历史数据可能使用 speakingSamples；运行时统一补齐为 speakingExamples 的可展示格式。
for (let i = 1; i <= 30; i++) {
  const item = MOCK_ENGLISH_ANSWERS[i];
  item.speakingSamples = item.speakingExamples.map((x) => `${x.en} | ${x.cn}`);
}
