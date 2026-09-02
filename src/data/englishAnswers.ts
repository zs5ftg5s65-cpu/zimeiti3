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

// 30天答案数据
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

// 第1天详细答案（手写，更精准）
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
    { en: "After work, I like to unwind by cooking or listening to music.", cn: "下班后，我喜欢做饭或听音乐来放松。" },
  ],
  vocabQuiz: [
    { word: "routine", options: ["路线", "日常惯例", "路由器", "例行公事"], correctIndex: 1 },
    { word: "commute", options: ["沟通", "通勤", "社区", "交换"], correctIndex: 1 },
    { word: "grocery", options: ["杂货", "食品杂货店", "两者都是", "都不是"], correctIndex: 2 },
    { word: "appliance", options: ["申请", "电器", "外观", "上诉"], correctIndex: 1 },
    { word: "chore", options: ["合唱", "杂务", "选择", " choreography"], correctIndex: 1 },
  ],
};

// 第2天详细答案
MOCK_ENGLISH_ANSWERS[2] = {
  day: 2,
  readingQuiz: [
    { question: "Which Chinese cuisine is known for being spicy and numbing?", options: ["Cantonese", "Sichuan", "Shandong", "Huaiyang"], correctIndex: 1, explanation: "文章提到'Sichuan food is famous for being spicy and numbing.'" },
    { question: "What food is eaten during Spring Festival according to the article?", options: ["Mooncakes", "Dumplings", "Zongzi", "Noodles"], correctIndex: 1, explanation: "文章提到'dumplings are eaten during Spring Festival'。" },
    { question: "What does the article say about Chinese restaurants around the world?", options: ["They all serve authentic food", "They often adapt menus to local tastes", "They only serve Cantonese food", "They are all very expensive"], correctIndex: 1, explanation: "文章提到'Chinese restaurants around the world often adapt their menus to local tastes.'" },
  ],
  speakingExamples: [
    { en: "I'd like to order the braised pork belly and a bowl of rice.", cn: "我想点红烧肉和一碗米饭。" },
    { en: "What do you recommend? I'm not familiar with this cuisine.", cn: "你推荐什么？我不太熟悉这个菜系。" },
    { en: "Could we have the bill, please? We're ready to go.", cn: "请买单，我们准备走了。" },
    { en: "Is this dish very spicy? I can only handle mild spice.", cn: "这道菜很辣吗？我只能吃微辣。" },
    { en: "The food is delicious! It's on me tonight.", cn: "食物太美味了！今晚我请客。" },
  ],
  vocabQuiz: [
    { word: "cuisine", options: ["厨房", "菜系", "烹饪", "厨师"], correctIndex: 1 },
    { word: "appetizer", options: ["主菜", "开胃菜", "甜点", "饮料"], correctIndex: 1 },
    { word: "ingredient", options: ["成分", "食材", "两者都是", "都不是"], correctIndex: 2 },
    { word: "marinate", options: ["腌制", "婚姻", "海洋", "标记"], correctIndex: 0 },
    { word: "portion", options: ["部分", "一份（食物）", "港口", "肖像"], correctIndex: 1 },
  ],
};

// 第3天详细答案
MOCK_ENGLISH_ANSWERS[3] = {
  day: 3,
  readingQuiz: [
    { question: "According to the article, what should you consider when looking for a job?", options: ["Only salary", "Only interests", "Both interests and skills, plus salary and balance", "Only the company name"], correctIndex: 2, explanation: "文章提到'it is important to consider both your interests and your skills... you also need to think about salary and work-life balance.'" },
    { question: "What should you do to prepare for a job interview?", options: ["Wear casual clothes", "Research the company and practice questions", "Arrive late to seem busy", "Don't ask any questions"], correctIndex: 1, explanation: "文章提到'Prepare by researching the company and practicing common questions. Dress professionally and arrive early.'" },
    { question: "What is the main idea of the last paragraph?", options: ["You should quit your job if it's hard", "Learning continues even after you get the job", "All workplaces are the same", "You don't need feedback"], correctIndex: 1, explanation: "最后一段的主题是'Once you get the job, the learning continues.'，强调入职后仍需学习。" },
  ],
  speakingExamples: [
    { en: "I work as a marketing specialist at a small company.", cn: "我在一家小公司做市场专员。" },
    { en: "I've been working here for two years now.", cn: "我在这里工作两年了。" },
    { en: "My job involves creating content and managing social media.", cn: "我的工作包括创作内容和管理社交媒体。" },
    { en: "The best part of my job is the creative freedom I have.", cn: "我工作最好的部分是拥有创作自由。" },
    { en: "Sometimes I work overtime, but overall the work-life balance is good.", cn: "有时我会加班，但总体工作生活平衡还不错。" },
  ],
  vocabQuiz: [
    { word: "deadline", options: ["死线", "截止日期", "死亡线", "终点线"], correctIndex: 1 },
    { word: "colleague", options: ["大学", "同事", "收藏品", "学院"], correctIndex: 1 },
    { word: "promotion", options: ["促销", "晋升", "两者都是", "都不是"], correctIndex: 2 },
    { word: "resume", options: ["恢复", "简历", "摘要", "继续"], correctIndex: 1 },
    { word: "teamwork", options: ["团队工作", "团队合作", "两者都是", "都不是"], correctIndex: 2 },
  ],
};

// 兼容界面旧字段：将 speakingExamples 自动映射为口语示范列表。
for (let i = 1; i <= 30; i++) {
  const item = MOCK_ENGLISH_ANSWERS[i];
  item.speakingSamples = item.speakingExamples.map((x) => `${x.en} | ${x.cn}`);
}
