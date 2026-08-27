// 英语学习30天课程数据
export interface IVocabWord {
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  exampleCn: string;
}

export interface IReadingMaterial {
  title: string;
  level: string;
  paragraphs: { en: string; cn: string }[];
  vocab: string[];
}

export interface ISpeakingExpression {
  en: string;
  cn: string;
  usage: string;
}

export interface ISpeakingContent {
  topic: string;
  expressions: ISpeakingExpression[];
  dialogue: { en: string; cn: string }[];
  practiceTask: string;
}

export interface IEnglishDay {
  day: number;
  week: number;
  theme: string;
  level: string;
  vocab: IVocabWord[];
  vocabulary?: IVocabWord[];
  category?: string;
  title?: string;
  reading: IReadingMaterial;
  speaking: ISpeakingContent;
  videoTitle: string;
  videoSource: string;
  videoDesc: string;
}

export interface IEnglishResource {
  name: string;
  type: string;
  level: string;
  desc: string;
  url: string;
  category?: string;
  id?: string | number;
}

// 第1-7天详细数据
const day1: IEnglishDay = {
  day: 1, week: 1, theme: "日常生活 Daily Life", level: "B1",
  vocab: [
    { word: "routine", phonetic: "/ruːˈtiːn/", meaning: "n. 日常惯例", example: "My morning routine includes coffee and news.", exampleCn: "我的早晨惯例包括喝咖啡和看新闻。" },
    { word: "schedule", phonetic: "/ˈʃedjuːl/", meaning: "n. 日程表", example: "I have a busy schedule today.", exampleCn: "我今天日程很满。" },
    { word: "commute", phonetic: "/kəˈmjuːt/", meaning: "v. 通勤", example: "She commutes to work by bus.", exampleCn: "她坐公交通勤上班。" },
    { word: "household", phonetic: "/ˈhaʊshəʊld/", meaning: "n. 家庭", example: "We share household chores.", exampleCn: "我们分担家务。" },
    { word: "grocery", phonetic: "/ˈɡrəʊsəri/", meaning: "n. 杂货", example: "I need to buy groceries.", exampleCn: "我需要买杂货。" },
    { word: "laundry", phonetic: "/ˈlɔːndri/", meaning: "n. 洗衣", example: "Laundry day is Sunday.", exampleCn: "周日是洗衣日。" },
    { word: "appliance", phonetic: "/əˈplaɪəns/", meaning: "n. 电器", example: "The kitchen has new appliances.", exampleCn: "厨房有新电器。" },
    { word: "neighbor", phonetic: "/ˈneɪbə/", meaning: "n. 邻居", example: "Our neighbors are friendly.", exampleCn: "我们的邻居很友好。" },
    { word: "suburb", phonetic: "/ˈsʌbɜːb/", meaning: "n. 郊区", example: "They live in the suburbs.", exampleCn: "他们住在郊区。" },
    { word: "traffic", phonetic: "/ˈtræfɪk/", meaning: "n. 交通", example: "The traffic is heavy this morning.", exampleCn: "今早交通很拥堵。" },
    { word: "breakfast", phonetic: "/ˈbrekfəst/", meaning: "n. 早餐", example: "Breakfast is the most important meal.", exampleCn: "早餐是最重要的一餐。" },
    { word: "dinner", phonetic: "/ˈdɪnə/", meaning: "n. 晚餐", example: "We had dinner together.", exampleCn: "我们一起吃了晚餐。" },
    { word: "chore", phonetic: "/tʃɔː/", meaning: "n. 杂务", example: "Doing chores is boring.", exampleCn: "做家务很无聊。" },
    { word: "alarm", phonetic: "/əˈlɑːm/", meaning: "n. 闹钟", example: "The alarm woke me up.", exampleCn: "闹钟把我叫醒了。" },
    { word: "nap", phonetic: "/næp/", meaning: "n. 小睡", example: "I took a nap after lunch.", exampleCn: "午饭后我小睡了一会。" },
    { word: "jog", phonetic: "/dʒɒɡ/", meaning: "v. 慢跑", example: "He jogs every morning.", exampleCn: "他每天早上慢跑。" },
    { word: "shower", phonetic: "/ˈʃaʊə/", meaning: "n. 淋浴", example: "I take a shower before bed.", exampleCn: "我睡前淋浴。" },
    { word: "dishes", phonetic: "/ˈdɪʃɪz/", meaning: "n. 餐具", example: "Please wash the dishes.", exampleCn: "请洗碗。" },
    { word: "trash", phonetic: "/træʃ/", meaning: "n. 垃圾", example: "Take out the trash.", exampleCn: "把垃圾拿出去。" },
    { word: "weekday", phonetic: "/ˈwiːkdeɪ/", meaning: "n. 工作日", example: "I work on weekdays.", exampleCn: "我工作日上班。" },
  ],
  reading: {
    title: "A Day in My Life", level: "B1",
    paragraphs: [
      { en: "My name is Lisa, and I live in a small apartment in the city. Every weekday, my alarm goes off at 6:30 in the morning. I usually hit the snooze button once before getting out of bed.", cn: "我叫丽莎，住在城里的一套小公寓里。每个工作日，我的闹钟早上6:30响起。我通常会按一次贪睡按钮再起床。" },
      { en: "After taking a quick shower, I make breakfast. I usually have eggs and toast, with a cup of coffee. Then I check my phone for messages and the weather forecast.", cn: "快速淋浴后，我做早餐。我通常吃鸡蛋和吐司，配一杯咖啡。然后我查看手机消息和天气预报。" },
      { en: "I leave home at 7:45 and walk to the subway station. The commute takes about 30 minutes. I usually listen to a podcast or read a book on the train.", cn: "我7:45出门，步行到地铁站。通勤大约需要30分钟。我通常在火车上听播客或看书。" },
      { en: "I start work at 8:30. My job is busy but interesting. I have lunch with my colleagues at noon. We often try new restaurants near the office.", cn: "我8:30开始工作。我的工作很忙但很有趣。中午我和同事一起吃午饭。我们经常尝试办公室附近的新餐厅。" },
      { en: "I get home around 6:30 in the evening. Sometimes I cook dinner, sometimes I order takeout. After dinner, I like to relax by watching TV or calling my family.", cn: "我晚上6:30左右到家。有时我做晚饭，有时点外卖。晚饭后，我喜欢看电视或给家人打电话来放松。" },
    ],
    vocab: ["snooze", "forecast", "colleague", "takeout", "relax"],
  },
  speaking: {
    topic: "Talking about your daily routine 谈论你的日常",
    expressions: [
      { en: "I usually wake up at...", cn: "我通常...点醒来", usage: "描述起床时间" },
      { en: "My morning routine is...", cn: "我的早晨惯例是...", usage: "介绍早晨安排" },
      { en: "It takes me about... minutes to get to work.", cn: "我花大约...分钟到公司", usage: "描述通勤时间" },
      { en: "I'm not a morning person.", cn: "我不是早起的人", usage: "表达不喜欢早起" },
      { en: "I like to unwind after work by...", cn: "我喜欢下班后通过...放松", usage: "描述放松方式" },
    ],
    dialogue: [
      { en: "A: What time do you usually get up?", cn: "A: 你通常几点起床？" },
      { en: "B: Around 7 o'clock. I'm not a morning person, so I need at least two alarms.", cn: "B: 大约7点。我不是早起的人，所以我需要至少两个闹钟。" },
      { en: "A: How do you get to work?", cn: "A: 你怎么去上班？" },
      { en: "B: I take the subway. It takes about 20 minutes. How about you?", cn: "B: 我坐地铁。大约20分钟。你呢？" },
      { en: "A: I drive, but the traffic is terrible during rush hour.", cn: "A: 我开车，但高峰期交通很糟糕。" },
    ],
    practiceTask: "用英语描述你昨天的一天，至少用5个今天学的单词，录下来自己听。",
  },
  videoTitle: "Daily Routine in English - Learn English Conversation",
  videoSource: "YouTube",
  videoDesc: "英语日常对话教学，学习如何用英语描述日常生活，包含常用表达和对话练习。",
};

const day2: IEnglishDay = {
  day: 2, week: 1, theme: "餐饮与美食 Food & Restaurant", level: "B1",
  vocab: [
    { word: "menu", phonetic: "/ˈmenjuː/", meaning: "n. 菜单", example: "Can I see the menu?", exampleCn: "我能看一下菜单吗？" },
    { word: "appetizer", phonetic: "/ˈæpɪtaɪzə/", meaning: "n. 开胃菜", example: "We ordered appetizers first.", exampleCn: "我们先点了开胃菜。" },
    { word: "dessert", phonetic: "/dɪˈzɜːt/", meaning: "n. 甜点", example: "I want chocolate cake for dessert.", exampleCn: "我想要巧克力蛋糕当甜点。" },
    { word: "delicious", phonetic: "/dɪˈlɪʃəs/", meaning: "adj. 美味的", example: "This soup is delicious.", exampleCn: "这汤很美味。" },
    { word: "spicy", phonetic: "/ˈspaɪsi/", meaning: "adj. 辣的", example: "I don't like spicy food.", exampleCn: "我不喜欢辣的食物。" },
    { word: "flavor", phonetic: "/ˈfleɪvə/", meaning: "n. 味道", example: "This dish has a rich flavor.", exampleCn: "这道菜味道浓郁。" },
    { word: "ingredient", phonetic: "/ɪnˈɡriːdiənt/", meaning: "n. 食材", example: "Fresh ingredients are important.", exampleCn: "新鲜食材很重要。" },
    { word: "recipe", phonetic: "/ˈresɪpi/", meaning: "n. 食谱", example: "Can you share the recipe?", exampleCn: "你能分享食谱吗？" },
    { word: "chef", phonetic: "/ʃef/", meaning: "n. 厨师", example: "The chef is famous.", exampleCn: "这位厨师很有名。" },
    { word: "waiter", phonetic: "/ˈweɪtə/", meaning: "n. 服务员", example: "The waiter brought the bill.", exampleCn: "服务员拿来了账单。" },
    { word: "reservation", phonetic: "/ˌrezəˈveɪʃn/", meaning: "n. 预订", example: "I made a reservation for two.", exampleCn: "我预订了两人位。" },
    { word: "bill", phonetic: "/bɪl/", meaning: "n. 账单", example: "Can we have the bill?", exampleCn: "我们能买单吗？" },
    { word: "tip", phonetic: "/tɪp/", meaning: "n. 小费", example: "We left a 15% tip.", exampleCn: "我们留了15%的小费。" },
    { word: "cuisine", phonetic: "/kwɪˈziːn/", meaning: "n. 菜系", example: "I love Chinese cuisine.", exampleCn: "我喜欢中国菜。" },
    { word: "vegetarian", phonetic: "/ˌvedʒəˈteəriən/", meaning: "n. 素食者", example: "She is a vegetarian.", exampleCn: "她是素食者。" },
    { word: "portion", phonetic: "/ˈpɔːʃn/", meaning: "n. 一份", example: "The portions are large here.", exampleCn: "这里的菜量很大。" },
    { word: "season", phonetic: "/ˈsiːzn/", meaning: "v. 调味", example: "Season the meat with salt.", exampleCn: "用盐给肉调味。" },
    { word: "marinate", phonetic: "/ˈmærɪneɪt/", meaning: "v. 腌制", example: "Marinate the chicken overnight.", exampleCn: "把鸡肉腌制过夜。" },
    { word: "stew", phonetic: "/stjuː/", meaning: "n. 炖菜 v. 炖", example: "This beef stew is amazing.", exampleCn: "这炖牛肉太棒了。" },
    { word: "steam", phonetic: "/stiːm/", meaning: "v. 蒸", example: "Steam the fish for 10 minutes.", exampleCn: "把鱼蒸10分钟。" },
  ],
  reading: {
    title: "Chinese Food Culture", level: "B1",
    paragraphs: [
      { en: "Chinese cuisine is one of the most popular food cultures in the world. It has a long history of over 5,000 years. Different regions in China have their own unique cooking styles and flavors.", cn: "中国菜是世界上最受欢迎的饮食文化之一。它有着5000多年的悠久历史。中国不同地区有自己独特的烹饪风格和口味。" },
      { en: "The most famous regional cuisines include Cantonese, Sichuan, Shandong, and Huaiyang. Cantonese food is known for being fresh and light. Sichuan food is famous for being spicy and numbing. Shandong food features seafood and soups. Huaiyang food is delicate and sweet.", cn: "最著名的地方菜系包括粤菜、川菜、鲁菜和淮扬菜。粤菜以清淡新鲜著称。川菜以麻辣闻名。鲁菜以海鲜和汤品为特色。淮扬菜精致偏甜。" },
      { en: "In Chinese culture, food is not just about eating. It is a way to bring family and friends together. Important holidays always feature special dishes. For example, dumplings are eaten during Spring Festival, and mooncakes during Mid-Autumn Festival.", cn: "在中国文化中，食物不仅仅是为了吃。它是家人和朋友团聚的方式。重要节日总有特色菜。例如，春节吃饺子，中秋节吃月饼。" },
      { en: "Chinese restaurants around the world often adapt their menus to local tastes. However, authentic Chinese food is much more diverse than what most foreigners experience. From street food to fine dining, Chinese cuisine offers something for everyone.", cn: "世界各地的中餐馆经常根据当地口味调整菜单。然而，正宗的中国菜比大多数外国人体验到的更加多样化。从街头小吃到高级餐厅，中国菜适合每个人。" },
    ],
    vocab: ["cuisine", "authentic", "diverse", "numbing", "delicate"],
  },
  speaking: {
    topic: "Ordering food at a restaurant 在餐厅点餐",
    expressions: [
      { en: "I'd like to order...", cn: "我想点...", usage: "点餐时使用" },
      { en: "What do you recommend?", cn: "你推荐什么？", usage: "询问推荐" },
      { en: "Could I have the bill, please?", cn: "请买单", usage: "结账时使用" },
      { en: "Is this dish spicy?", cn: "这道菜辣吗？", usage: "询问口味" },
      { en: "It's on me.", cn: "我请客", usage: "表示请客" },
    ],
    dialogue: [
      { en: "A: Good evening! Do you have a reservation?", cn: "A: 晚上好！有预订吗？" },
      { en: "B: Yes, under the name Wang. A table for four.", cn: "B: 有，姓王。四人桌。" },
      { en: "A: Here are your menus. Can I get you started with something to drink?", cn: "A: 这是菜单。先来点喝的吗？" },
      { en: "B: I'll have a beer, and she'll have tea. What's the house specialty?", cn: "B: 我要啤酒，她要茶。招牌菜是什么？" },
      { en: "A: Our braised pork belly is very popular. It's slow-cooked for three hours.", cn: "A: 我们的红烧肉很受欢迎。慢炖了三个小时。" },
    ],
    practiceTask: "角色扮演：一人当服务员，一人当顾客，练习点餐对话，至少用5个今天学的单词。",
  },
  videoTitle: "English at the Restaurant - Ordering Food Conversation",
  videoSource: "YouTube",
  videoDesc: "餐厅英语对话教学，学习点餐、询问推荐、结账等实用表达。",
};

// 第3-7天数据（精简结构，保持完整）
const day3: IEnglishDay = {
  day: 3, week: 1, theme: "工作与职业 Work & Career", level: "B1",
  vocab: [
    { word: "colleague", phonetic: "/ˈkɒliːɡ/", meaning: "n. 同事", example: "My colleagues are helpful.", exampleCn: "我的同事很乐于助人。" },
    { word: "deadline", phonetic: "/ˈdedlaɪn/", meaning: "n. 截止日期", example: "The deadline is Friday.", exampleCn: "截止日期是周五。" },
    { word: "meeting", phonetic: "/ˈmiːtɪŋ/", meaning: "n. 会议", example: "We have a meeting at 3.", exampleCn: "我们3点有个会。" },
    { word: "project", phonetic: "/ˈprɒdʒekt/", meaning: "n. 项目", example: "I'm working on a new project.", exampleCn: "我在做一个新项目。" },
    { word: "promotion", phonetic: "/prəˈməʊʃn/", meaning: "n. 晋升", example: "She got a promotion.", exampleCn: "她升职了。" },
    { word: "salary", phonetic: "/ˈsæləri/", meaning: "n. 薪水", example: "The salary is good.", exampleCn: "薪水不错。" },
    { word: "interview", phonetic: "/ˈɪntəvjuː/", meaning: "n. 面试", example: "I have an interview tomorrow.", exampleCn: "我明天有面试。" },
    { word: "resume", phonetic: "/ˈrezjumeɪ/", meaning: "n. 简历", example: "Send me your resume.", exampleCn: "把你的简历发给我。" },
    { word: "overtime", phonetic: "/ˈəʊvətaɪm/", meaning: "n. 加班", example: "I worked overtime yesterday.", exampleCn: "我昨天加班了。" },
    { word: "vacation", phonetic: "/vəˈkeɪʃn/", meaning: "n. 假期", example: "I'm on vacation next week.", exampleCn: "我下周休假。" },
    { word: "boss", phonetic: "/bɒs/", meaning: "n. 老板", example: "My boss is strict.", exampleCn: "我老板很严格。" },
    { word: "client", phonetic: "/ˈklaɪənt/", meaning: "n. 客户", example: "We have a new client.", exampleCn: "我们有新客户了。" },
    { word: "report", phonetic: "/rɪˈpɔːt/", meaning: "n. 报告", example: "Finish the report by Monday.", exampleCn: "周一前完成报告。" },
    { word: "email", phonetic: "/ˈiːmeɪl/", meaning: "n. 邮件", example: "Check your email.", exampleCn: "查收你的邮件。" },
    { word: "office", phonetic: "/ˈɒfɪs/", meaning: "n. 办公室", example: "I work in an office.", exampleCn: "我在办公室工作。" },
    { word: "department", phonetic: "/dɪˈpɑːtmənt/", meaning: "n. 部门", example: "Which department are you in?", exampleCn: "你在哪个部门？" },
    { word: "experience", phonetic: "/ɪkˈspɪəriəns/", meaning: "n. 经验", example: "She has 5 years of experience.", exampleCn: "她有5年经验。" },
    { word: "skill", phonetic: "/skɪl/", meaning: "n. 技能", example: "Communication skills are important.", exampleCn: "沟通技能很重要。" },
    { word: "task", phonetic: "/tɑːsk/", meaning: "n. 任务", example: "Complete this task first.", exampleCn: "先完成这个任务。" },
    { word: "teamwork", phonetic: "/ˈtiːmwɜːk/", meaning: "n. 团队合作", example: "Teamwork is essential.", exampleCn: "团队合作很重要。" },
  ],
  reading: {
    title: "Finding the Right Job", level: "B1",
    paragraphs: [
      { en: "Finding the right job is not easy. Many people spend years trying to figure out what they want to do. Some know from childhood, while others discover their passion later in life.", cn: "找到合适的工作并不容易。许多人花了很多年才弄清楚自己想做什么。有些人从小就知道，而另一些人后来才发现自己的热情所在。" },
      { en: "When looking for a job, it is important to consider both your interests and your skills. A job that matches your personality will make you happier. However, you also need to think about salary and work-life balance.", cn: "找工作时，考虑兴趣和技能都很重要。与你性格匹配的工作会让你更快乐。然而，你也需要考虑薪水和工作生活平衡。" },
      { en: "The job interview is your chance to show who you are. Prepare by researching the company and practicing common questions. Dress professionally and arrive early. Most importantly, be yourself and ask good questions.", cn: "面试是你展示自己的机会。通过研究公司和练习常见问题来准备。穿着专业，提前到达。最重要的是，做你自己，并提出好问题。" },
      { en: "Once you get the job, the learning continues. Every workplace has its own culture and rules. Be patient with yourself as you learn. Ask for feedback and try to improve. A good career is built step by step.", cn: "一旦得到工作，学习仍在继续。每个工作场所有自己的文化和规则。学习时对自己有耐心。寻求反馈并努力改进。好的职业是一步步建立起来的。" },
    ],
    vocab: ["passion", "personality", "balance", "feedback", "culture"],
  },
  speaking: {
    topic: "Talking about your job 谈论你的工作",
    expressions: [
      { en: "I work as a...", cn: "我是做...的", usage: "介绍职业" },
      { en: "I've been working here for... years.", cn: "我在这里工作了...年", usage: "描述工作年限" },
      { en: "My job involves...", cn: "我的工作包括...", usage: "描述工作内容" },
      { en: "The best part of my job is...", cn: "我工作最好的部分是...", usage: "描述工作优点" },
      { en: "I'm thinking about changing careers.", cn: "我在考虑转行", usage: "表达职业变动想法" },
    ],
    dialogue: [
      { en: "A: What do you do for a living?", cn: "A: 你做什么工作？" },
      { en: "B: I'm a marketing manager at a tech company. I've been there for three years.", cn: "B: 我是一家科技公司的市场经理。我在那里三年了。" },
      { en: "A: That sounds interesting. What does a typical day look like?", cn: "A: 听起来很有趣。典型的一天是什么样的？" },
      { en: "B: I usually have meetings in the morning, then work on campaigns in the afternoon. It's busy but rewarding.", cn: "B: 我通常上午开会，下午做推广活动。很忙但很有成就感。" },
    ],
    practiceTask: "用英语介绍你的工作（或理想工作），包括职位、工作内容、喜欢和不喜欢的地方。",
  },
  videoTitle: "Job Interview English - Common Questions and Answers",
  videoSource: "YouTube",
  videoDesc: "英语面试常见问题和回答技巧，学习如何用英语介绍自己和工作经历。",
};

// 第4-7天使用类似结构，为节省空间使用构建函数
const themes = [
  { theme: "旅行与出行 Travel", words: ["luggage","passport","flight","hotel","tourist","souvenir","itinerary","boarding","customs","departure","arrival","delay","reservation","sightseeing","guide","currency","exchange","backpack","journey","adventure"] },
  { theme: "健康与健身 Health & Fitness", words: ["exercise","workout","nutrition","vitamin","protein","calorie","hydration","stamina","flexible","muscle","jogging","yoga","meditation","symptom","diagnosis","prescription","recovery","immune","wellness","routine"] },
  { theme: "购物与消费 Shopping", words: ["discount","bargain","receipt","refund","exchange","customer","quality","brand","price","budget","expense","afford","luxury","essential","promotion","clearance","coupon","membership","online","delivery"] },
  { theme: "娱乐与休闲 Entertainment", words: ["concert","exhibition","museum","gallery","performance","ticket","seat","audience","actor","actress","plot","scene","genre","comedy","drama","documentary","streaming","subscription","hobby","leisure"] },
];

function buildVocab(words: string[]): IVocabWord[] {
  const meanings: Record<string, { phonetic: string; meaning: string; example: string; exampleCn: string }> = {
    luggage: { phonetic: "/ˈlʌɡɪdʒ/", meaning: "n. 行李", example: "Check your luggage at the counter.", exampleCn: "在柜台托运行李。" },
    passport: { phonetic: "/ˈpɑːspɔːt/", meaning: "n. 护照", example: "Don't forget your passport.", exampleCn: "别忘了护照。" },
    flight: { phonetic: "/flaɪt/", meaning: "n. 航班", example: "Our flight is delayed.", exampleCn: "我们的航班延误了。" },
    hotel: { phonetic: "/həʊˈtel/", meaning: "n. 酒店", example: "We booked a hotel online.", exampleCn: "我们在网上订了酒店。" },
    tourist: { phonetic: "/ˈtʊərɪst/", meaning: "n. 游客", example: "The city is full of tourists.", exampleCn: "城里到处是游客。" },
    souvenir: { phonetic: "/ˌsuːvəˈnɪə/", meaning: "n. 纪念品", example: "I bought a souvenir for my mom.", exampleCn: "我给妈妈买了纪念品。" },
    itinerary: { phonetic: "/aɪˈtɪnərəri/", meaning: "n. 行程", example: "Here's our travel itinerary.", exampleCn: "这是我们的旅行行程。" },
    boarding: { phonetic: "/ˈbɔːdɪŋ/", meaning: "n. 登机", example: "Boarding starts at 9.", exampleCn: "9点开始登机。" },
    customs: { phonetic: "/ˈkʌstəmz/", meaning: "n. 海关", example: "Go through customs first.", exampleCn: "先过海关。" },
    departure: { phonetic: "/dɪˈpɑːtʃə/", meaning: "n. 出发", example: "Departure time is 8am.", exampleCn: "出发时间是早上8点。" },
    arrival: { phonetic: "/əˈraɪvl/", meaning: "n. 到达", example: "Arrival is at noon.", exampleCn: "中午到达。" },
    delay: { phonetic: "/dɪˈleɪ/", meaning: "n. 延误", example: "There's a 2-hour delay.", exampleCn: "延误2小时。" },
    reservation: { phonetic: "/ˌrezəˈveɪʃn/", meaning: "n. 预订", example: "I have a reservation.", exampleCn: "我有预订。" },
    sightseeing: { phonetic: "/ˈsaɪtsiːɪŋ/", meaning: "n. 观光", example: "We went sightseeing.", exampleCn: "我们去观光了。" },
    guide: { phonetic: "/ɡaɪd/", meaning: "n. 导游", example: "Our guide was very knowledgeable.", exampleCn: "我们的导游很博学。" },
    currency: { phonetic: "/ˈkʌrənsi/", meaning: "n. 货币", example: "Exchange currency at the bank.", exampleCn: "在银行换货币。" },
    exchange: { phonetic: "/ɪksˈtʃeɪndʒ/", meaning: "v. 兑换", example: "Exchange dollars for euros.", exampleCn: "把美元换成欧元。" },
    backpack: { phonetic: "/ˈbækpæk/", meaning: "n. 背包", example: "I travel with a backpack.", exampleCn: "我背着背包旅行。" },
    journey: { phonetic: "/ˈdʒɜːni/", meaning: "n. 旅程", example: "The journey takes 3 hours.", exampleCn: "旅程需要3小时。" },
    adventure: { phonetic: "/ədˈventʃə/", meaning: "n. 冒险", example: "Life is an adventure.", exampleCn: "生活是一场冒险。" },
    exercise: { phonetic: "/ˈeksəsaɪz/", meaning: "n. 锻炼", example: "Exercise every day.", exampleCn: "每天锻炼。" },
    workout: { phonetic: "/ˈwɜːkaʊt/", meaning: "n. 健身", example: "I do a morning workout.", exampleCn: "我晨练。" },
    nutrition: { phonetic: "/njuˈtrɪʃn/", meaning: "n. 营养", example: "Good nutrition is key.", exampleCn: "好营养是关键。" },
    vitamin: { phonetic: "/ˈvɪtəmɪn/", meaning: "n. 维生素", example: "Take vitamin C daily.", exampleCn: "每天吃维生素C。" },
    protein: { phonetic: "/ˈprəʊtiːn/", meaning: "n. 蛋白质", example: "Eggs are high in protein.", exampleCn: "鸡蛋富含蛋白质。" },
    calorie: { phonetic: "/ˈkæləri/", meaning: "n. 卡路里", example: "Count your calories.", exampleCn: "计算卡路里。" },
    hydration: { phonetic: "/haɪˈdreɪʃn/", meaning: "n. 补水", example: "Hydration is important.", exampleCn: "补水很重要。" },
    stamina: { phonetic: "/ˈstæmɪnə/", meaning: "n. 耐力", example: "Running builds stamina.", exampleCn: "跑步增强耐力。" },
    flexible: { phonetic: "/ˈfleksəbl/", meaning: "adj. 灵活的", example: "Yoga makes you flexible.", exampleCn: "瑜伽让你灵活。" },
    muscle: { phonetic: "/ˈmʌsl/", meaning: "n. 肌肉", example: "Build muscle with weights.", exampleCn: "用哑铃练肌肉。" },
    jogging: { phonetic: "/ˈdʒɒɡɪŋ/", meaning: "n. 慢跑", example: "Jogging is good for the heart.", exampleCn: "慢跑对心脏好。" },
    yoga: { phonetic: "/ˈjəʊɡə/", meaning: "n. 瑜伽", example: "I practice yoga.", exampleCn: "我练瑜伽。" },
    meditation: { phonetic: "/ˌmedɪˈteɪʃn/", meaning: "n. 冥想", example: "Meditation reduces stress.", exampleCn: "冥想减压。" },
    symptom: { phonetic: "/ˈsɪmptəm/", meaning: "n. 症状", example: "Describe your symptoms.", exampleCn: "描述你的症状。" },
    diagnosis: { phonetic: "/ˌdaɪəɡˈnəʊsɪs/", meaning: "n. 诊断", example: "The doctor gave a diagnosis.", exampleCn: "医生给出了诊断。" },
    prescription: { phonetic: "/prɪˈskrɪpʃn/", meaning: "n. 处方", example: "Get the prescription filled.", exampleCn: "按处方拿药。" },
    recovery: { phonetic: "/rɪˈkʌvəri/", meaning: "n. 恢复", example: "Recovery takes time.", exampleCn: "恢复需要时间。" },
    immune: { phonetic: "/ɪˈmjuːn/", meaning: "adj. 免疫的", example: "Boost your immune system.", exampleCn: "增强免疫系统。" },
    wellness: { phonetic: "/ˈwelnəs/", meaning: "n. 健康", example: "Wellness is a lifestyle.", exampleCn: "健康是一种生活方式。" },
    routine: { phonetic: "/ruːˈtiːn/", meaning: "n. 惯例", example: "Stick to your routine.", exampleCn: "坚持你的惯例。" },
    discount: { phonetic: "/ˈdɪskaʊnt/", meaning: "n. 折扣", example: "There's a 20% discount.", exampleCn: "有8折优惠。" },
    bargain: { phonetic: "/ˈbɑːɡən/", meaning: "n. 便宜货", example: "This is a bargain.", exampleCn: "这很划算。" },
    receipt: { phonetic: "/rɪˈsiːt/", meaning: "n. 收据", example: "Keep the receipt.", exampleCn: "保留收据。" },
    refund: { phonetic: "/ˈriːfʌnd/", meaning: "n. 退款", example: "Can I get a refund?", exampleCn: "我能退款吗？" },
    return_exchange: { phonetic: "/ɪksˈtʃeɪndʒ/", meaning: "v. 退换", example: "I want to exchange this.", exampleCn: "我想换这个。" },
    customer: { phonetic: "/ˈkʌstəmə/", meaning: "n. 顾客", example: "The customer is always right.", exampleCn: "顾客永远是对的。" },
    quality: { phonetic: "/ˈkwɒləti/", meaning: "n. 质量", example: "Good quality lasts longer.", exampleCn: "好质量更耐用。" },
    brand: { phonetic: "/brænd/", meaning: "n. 品牌", example: "I like this brand.", exampleCn: "我喜欢这个品牌。" },
    price: { phonetic: "/praɪs/", meaning: "n. 价格", example: "The price is reasonable.", exampleCn: "价格合理。" },
    budget: { phonetic: "/ˈbʌdʒɪt/", meaning: "n. 预算", example: "Stay within budget.", exampleCn: "控制在预算内。" },
    expense: { phonetic: "/ɪkˈspens/", meaning: "n. 开支", example: "Cut down on expenses.", exampleCn: "削减开支。" },
    afford: { phonetic: "/əˈfɔːd/", meaning: "v. 负担得起", example: "I can't afford this.", exampleCn: "我买不起这个。" },
    luxury: { phonetic: "/ˈlʌkʃəri/", meaning: "n. 奢侈品", example: "It's a luxury item.", exampleCn: "这是奢侈品。" },
    essential: { phonetic: "/ɪˈsenʃl/", meaning: "n. 必需品", example: "Buy essentials first.", exampleCn: "先买必需品。" },
    promotion: { phonetic: "/prəˈməʊʃn/", meaning: "n. 促销", example: "The promotion ends Sunday.", exampleCn: "促销周日结束。" },
    clearance: { phonetic: "/ˈklɪərəns/", meaning: "n. 清仓", example: "Clearance sale!", exampleCn: "清仓大甩卖！" },
    coupon: { phonetic: "/ˈkuːpɒn/", meaning: "n. 优惠券", example: "Use this coupon.", exampleCn: "用这张优惠券。" },
    membership: { phonetic: "/ˈmembəʃɪp/", meaning: "n. 会员", example: "Membership has benefits.", exampleCn: "会员有福利。" },
    online: { phonetic: "/ˌɒnˈlaɪn/", meaning: "adj. 在线的", example: "I shop online.", exampleCn: "我网购。" },
    delivery: { phonetic: "/dɪˈlɪvəri/", meaning: "n. 配送", example: "Free delivery over 50.", exampleCn: "满50免配送费。" },
    concert: { phonetic: "/ˈkɒnsət/", meaning: "n. 音乐会", example: "We went to a concert.", exampleCn: "我们去听了音乐会。" },
    exhibition: { phonetic: "/ˌeksɪˈbɪʃn/", meaning: "n. 展览", example: "The art exhibition is great.", exampleCn: "艺术展很棒。" },
    museum: { phonetic: "/mjuˈziːəm/", meaning: "n. 博物馆", example: "Visit the museum.", exampleCn: "参观博物馆。" },
    gallery: { phonetic: "/ˈɡæləri/", meaning: "n. 画廊", example: "The gallery opens at 10.", exampleCn: "画廊10点开门。" },
    performance: { phonetic: "/pəˈfɔːməns/", meaning: "n. 表演", example: "The performance was amazing.", exampleCn: "表演太棒了。" },
    ticket: { phonetic: "/ˈtɪkɪt/", meaning: "n. 票", example: "Buy tickets in advance.", exampleCn: "提前买票。" },
    seat: { phonetic: "/siːt/", meaning: "n. 座位", example: "Our seats are in row 5.", exampleCn: "我们的座位在5排。" },
    audience: { phonetic: "/ˈɔːdiəns/", meaning: "n. 观众", example: "The audience clapped.", exampleCn: "观众鼓掌了。" },
    actor: { phonetic: "/ˈæktə/", meaning: "n. 男演员", example: "He is a famous actor.", exampleCn: "他是著名演员。" },
    actress: { phonetic: "/ˈæktrəs/", meaning: "n. 女演员", example: "The actress won an award.", exampleCn: "女演员获奖了。" },
    plot: { phonetic: "/plɒt/", meaning: "n. 情节", example: "The plot is confusing.", exampleCn: "情节很混乱。" },
    scene: { phonetic: "/siːn/", meaning: "n. 场景", example: "That scene was emotional.", exampleCn: "那个场景很感人。" },
    genre: { phonetic: "/ˈʒɒnrə/", meaning: "n. 类型", example: "What genre is this movie?", exampleCn: "这电影是什么类型？" },
    comedy: { phonetic: "/ˈkɒmədi/", meaning: "n. 喜剧", example: "I love romantic comedies.", exampleCn: "我喜欢浪漫喜剧。" },
    drama: { phonetic: "/ˈdrɑːmə/", meaning: "n. 剧情片", example: "This drama is intense.", exampleCn: "这部剧很紧张。" },
    documentary: { phonetic: "/ˌdɒkjuˈmentri/", meaning: "n. 纪录片", example: "Watch a documentary about nature.", exampleCn: "看一部自然纪录片。" },
    streaming: { phonetic: "/ˈstriːmɪŋ/", meaning: "n. 流媒体", example: "I use streaming services.", exampleCn: "我用流媒体服务。" },
    subscription: { phonetic: "/səbˈskrɪpʃn/", meaning: "n. 订阅", example: "Cancel your subscription.", exampleCn: "取消订阅。" },
    hobby: { phonetic: "/ˈhɒbi/", meaning: "n. 爱好", example: "My hobby is painting.", exampleCn: "我的爱好是画画。" },
    leisure: { phonetic: "/ˈleʒə/", meaning: "n. 休闲", example: "Leisure time is important.", exampleCn: "休闲时间很重要。" },
    // 第2周：人际关系
    friendship: { phonetic: "/ˈfrendʃɪp/", meaning: "n. 友谊", example: "Their friendship lasted for years.", exampleCn: "他们的友谊持续了多年。" },
    trust: { phonetic: "/trʌst/", meaning: "n./v. 信任", example: "Trust is the foundation of any relationship.", exampleCn: "信任是任何关系的基础。" },
    support: { phonetic: "/səˈpɔːt/", meaning: "v./n. 支持", example: "I will support you no matter what.", exampleCn: "无论如何我都会支持你。" },
    communicate: { phonetic: "/kəˈmjuːnɪkeɪt/", meaning: "v. 沟通", example: "We need to communicate more often.", exampleCn: "我们需要更经常地沟通。" },
    understand: { phonetic: "/ˌʌndəˈstænd/", meaning: "v. 理解", example: "I understand how you feel.", exampleCn: "我理解你的感受。" },
    respect: { phonetic: "/rɪˈspekt/", meaning: "n./v. 尊重", example: "Respect others and earn respect.", exampleCn: "尊重他人，赢得尊重。" },
    boundary: { phonetic: "/ˈbaʊndri/", meaning: "n. 界限", example: "Set clear boundaries in relationships.", exampleCn: "在关系中设定清晰的界限。" },
    compromise: { phonetic: "/ˈkɒmprəmaɪz/", meaning: "n./v. 妥协", example: "A good marriage requires compromise.", exampleCn: "好的婚姻需要妥协。" },
    empathy: { phonetic: "/ˈempəθi/", meaning: "n. 同理心", example: "Show empathy towards others.", exampleCn: "对他人表现出同理心。" },
    conflict: { phonetic: "/ˈkɒnflɪkt/", meaning: "n. 冲突", example: "They resolved the conflict peacefully.", exampleCn: "他们和平解决了冲突。" },
    resolve: { phonetic: "/rɪˈzɒlv/", meaning: "v. 解决", example: "Let's resolve this issue together.", exampleCn: "我们一起解决这个问题。" },
    apologize: { phonetic: "/əˈpɒlədʒaɪz/", meaning: "v. 道歉", example: "You should apologize for being late.", exampleCn: "你应该为迟到道歉。" },
    forgive: { phonetic: "/fəˈɡɪv/", meaning: "v. 原谅", example: "Learning to forgive is important.", exampleCn: "学会原谅很重要。" },
    gratitude: { phonetic: "/ˈɡrætɪtjuːd/", meaning: "n. 感激", example: "She expressed her gratitude to everyone.", exampleCn: "她向所有人表达了感激。" },
    companion: { phonetic: "/kəmˈpæniən/", meaning: "n. 伴侣", example: "A dog is a loyal companion.", exampleCn: "狗是忠诚的伴侣。" },
    relative: { phonetic: "/ˈrelətɪv/", meaning: "n. 亲戚", example: "We visit relatives during holidays.", exampleCn: "我们在假期拜访亲戚。" },
    acquaintance: { phonetic: "/əˈkweɪntəns/", meaning: "n. 熟人", example: "He is just an acquaintance, not a close friend.", exampleCn: "他只是个熟人，不是密友。" },
    mentor: { phonetic: "/ˈmentɔː/", meaning: "n. 导师", example: "My mentor gave me valuable advice.", exampleCn: "我的导师给了我宝贵的建议。" },
    network: { phonetic: "/ˈnetwɜːk/", meaning: "n. 人脉网络", example: "Build a strong professional network.", exampleCn: "建立强大的职业人脉。" },
    socialize: { phonetic: "/ˈsəʊʃəlaɪz/", meaning: "v. 社交", example: "I like to socialize with friends on weekends.", exampleCn: "我喜欢周末和朋友社交。" },
    // 第3周：科技
    device: { phonetic: "/dɪˈvaɪs/", meaning: "n. 设备", example: "This device is very easy to use.", exampleCn: "这个设备很容易使用。" },
    application: { phonetic: "/ˌæplɪˈkeɪʃn/", meaning: "n. 应用程序", example: "Download the application on your phone.", exampleCn: "在手机上下载这个应用。" },
    software: { phonetic: "/ˈsɒftweə/", meaning: "n. 软件", example: "The software needs an update.", exampleCn: "软件需要更新。" },
    database: { phonetic: "/ˈdeɪtəbeɪs/", meaning: "n. 数据库", example: "All records are stored in a database.", exampleCn: "所有记录都存储在数据库中。" },
    algorithm: { phonetic: "/ˈælɡərɪðəm/", meaning: "n. 算法", example: "The algorithm recommends videos based on your interests.", exampleCn: "算法根据你的兴趣推荐视频。" },
    artificial: { phonetic: "/ˌɑːtɪˈfɪʃl/", meaning: "adj. 人工的", example: "Artificial intelligence is changing the world.", exampleCn: "人工智能正在改变世界。" },
    virtual: { phonetic: "/ˈvɜːtʃuəl/", meaning: "adj. 虚拟的", example: "We had a virtual meeting yesterday.", exampleCn: "我们昨天开了一个虚拟会议。" },
    reality: { phonetic: "/riˈæləti/", meaning: "n. 现实", example: "Virtual reality feels very real.", exampleCn: "虚拟现实感觉非常真实。" },
    innovation: { phonetic: "/ˌɪnəˈveɪʃn/", meaning: "n. 创新", example: "Innovation drives business growth.", exampleCn: "创新推动业务增长。" },
    automation: { phonetic: "/ˌɔːtəˈmeɪʃn/", meaning: "n. 自动化", example: "Automation saves time and reduces errors.", exampleCn: "自动化节省时间并减少错误。" },
    cybersecurity: { phonetic: "/ˈsaɪbəsɪˌkjʊərəti/", meaning: "n. 网络安全", example: "Companies invest heavily in cybersecurity.", exampleCn: "公司在网络安全上投入巨资。" },
    privacy: { phonetic: "/ˈprɪvəsi/", meaning: "n. 隐私", example: "Protect your privacy online.", exampleCn: "在网上保护你的隐私。" },
    platform: { phonetic: "/ˈplætfɔːm/", meaning: "n. 平台", example: "This platform connects buyers and sellers.", exampleCn: "这个平台连接买家和卖家。" },
    gadget: { phonetic: "/ˈɡædʒɪt/", meaning: "n. 小工具", example: "He loves buying new electronic gadgets.", exampleCn: "他喜欢买新的电子小玩意。" },
    upgrade: { phonetic: "/ˌʌpˈɡreɪd/", meaning: "v./n. 升级", example: "I need to upgrade my computer.", exampleCn: "我需要升级我的电脑。" },
    download: { phonetic: "/ˌdaʊnˈləʊd/", meaning: "v. 下载", example: "You can download the app for free.", exampleCn: "你可以免费下载这个应用。" },
    upload: { phonetic: "/ˌʌpˈləʊd/", meaning: "v. 上传", example: "Please upload your photo here.", exampleCn: "请在这里上传你的照片。" },
    wireless: { phonetic: "/ˈwaɪələs/", meaning: "adj. 无线的", example: "Wireless internet is available everywhere.", exampleCn: "无线网络随处可用。" },
    interface: { phonetic: "/ˈɪntəfeɪs/", meaning: "n. 界面", example: "The user interface is very intuitive.", exampleCn: "用户界面非常直观。" },
    // 第4周：环境
    climate: { phonetic: "/ˈklaɪmət/", meaning: "n. 气候", example: "Climate change affects everyone.", exampleCn: "气候变化影响每个人。" },
    pollution: { phonetic: "/pəˈluːʃn/", meaning: "n. 污染", example: "Air pollution is a serious problem in cities.", exampleCn: "空气污染是城市的严重问题。" },
    recycle: { phonetic: "/ˌriːˈsaɪkl/", meaning: "v. 回收利用", example: "We should recycle paper and plastic.", exampleCn: "我们应该回收纸张和塑料。" },
    sustainable: { phonetic: "/səˈsteɪnəbl/", meaning: "adj. 可持续的", example: "Sustainable development is crucial for the future.", exampleCn: "可持续发展对未来至关重要。" },
    renewable: { phonetic: "/rɪˈnjuːəbl/", meaning: "adj. 可再生的", example: "Solar power is a renewable energy source.", exampleCn: "太阳能是可再生能源。" },
    ecosystem: { phonetic: "/ˈiːkəʊsɪstəm/", meaning: "n. 生态系统", example: "The forest ecosystem is very fragile.", exampleCn: "森林生态系统非常脆弱。" },
    biodiversity: { phonetic: "/ˌbaɪəʊdaɪˈvɜːsəti/", meaning: "n. 生物多样性", example: "We must protect biodiversity.", exampleCn: "我们必须保护生物多样性。" },
    conservation: { phonetic: "/ˌkɒnsəˈveɪʃn/", meaning: "n. 保护", example: "Wildlife conservation requires global effort.", exampleCn: "野生动物保护需要全球努力。" },
    emission: { phonetic: "/ɪˈmɪʃn/", meaning: "n. 排放", example: "Carbon emissions contribute to global warming.", exampleCn: "碳排放导致全球变暖。" },
    carbon: { phonetic: "/ˈkɑːbən/", meaning: "n. 碳", example: "We need to reduce our carbon footprint.", exampleCn: "我们需要减少碳足迹。" },
    organic: { phonetic: "/ɔːˈɡænɪk/", meaning: "adj. 有机的", example: "Organic food is healthier but more expensive.", exampleCn: "有机食品更健康但更贵。" },
    deforestation: { phonetic: "/diːˌfɒrɪˈsteɪʃn/", meaning: "n. 森林砍伐", example: "Deforestation destroys animal habitats.", exampleCn: "森林砍伐破坏了动物栖息地。" },
    endangered: { phonetic: "/ɪnˈdeɪndʒəd/", meaning: "adj. 濒危的", example: "Pandas are an endangered species.", exampleCn: "熊猫是濒危物种。" },
    habitat: { phonetic: "/ˈhæbɪtæt/", meaning: "n. 栖息地", example: "The wetland is a habitat for many birds.", exampleCn: "湿地是许多鸟类的栖息地。" },
    preserve: { phonetic: "/prɪˈzɜːv/", meaning: "v. 保护", example: "We must preserve natural resources.", exampleCn: "我们必须保护自然资源。" },
    reduce: { phonetic: "/rɪˈdjuːs/", meaning: "v. 减少", example: "Reduce waste by using reusable bags.", exampleCn: "使用可重复使用的袋子来减少浪费。" },
    reuse: { phonetic: "/ˌriːˈjuːz/", meaning: "v. 重复使用", example: "Reuse containers instead of throwing them away.", exampleCn: "重复使用容器而不是扔掉。" },
    "eco-friendly": { phonetic: "/ˌiːkəʊˈfrendli/", meaning: "adj. 环保的", example: "This is an eco-friendly product.", exampleCn: "这是一个环保产品。" },
    greenhouse: { phonetic: "/ˈɡriːnhaʊs/", meaning: "n. 温室", example: "Greenhouse gases trap heat in the atmosphere.", exampleCn: "温室气体在大气中捕获热量。" },
    awareness: { phonetic: "/əˈweənəs/", meaning: "n. 意识", example: "Environmental awareness is growing.", exampleCn: "环保意识正在增强。" },
    // 第5周：教育
    curriculum: { phonetic: "/kəˈrɪkjələm/", meaning: "n. 课程", example: "The school updated its curriculum this year.", exampleCn: "学校今年更新了课程。" },
    assessment: { phonetic: "/əˈsesmənt/", meaning: "n. 评估", example: "The final assessment includes a written exam.", exampleCn: "最终评估包括笔试。" },
    literacy: { phonetic: "/ˈlɪtərəsi/", meaning: "n. 读写能力", example: "Literacy rates have improved worldwide.", exampleCn: "全球识字率有所提高。" },
    numeracy: { phonetic: "/ˈnjuːmərəsi/", meaning: "n. 计算能力", example: "Basic numeracy skills are essential.", exampleCn: "基本计算能力是必不可少的。" },
    critical: { phonetic: "/ˈkrɪtɪkl/", meaning: "adj. 批判性的", example: "Critical thinking is an important skill.", exampleCn: "批判性思维是一项重要技能。" },
    analytical: { phonetic: "/ˌænəˈlɪtɪkl/", meaning: "adj. 分析的", example: "She has strong analytical skills.", exampleCn: "她有很强的分析能力。" },
    research: { phonetic: "/rɪˈsɜːtʃ/", meaning: "n./v. 研究", example: "The research shows promising results.", exampleCn: "研究显示出有希望的结果。" },
    thesis: { phonetic: "/ˈθiːsɪs/", meaning: "n. 论文", example: "She is writing her master's thesis.", exampleCn: "她正在写硕士论文。" },
    seminar: { phonetic: "/ˈsemɪnɑː/", meaning: "n. 研讨会", example: "I attended a seminar on marketing.", exampleCn: "我参加了一个营销研讨会。" },
    lecture: { phonetic: "/ˈlektʃə/", meaning: "n. 讲座", example: "The professor gave an interesting lecture.", exampleCn: "教授做了一个有趣的讲座。" },
    tutorial: { phonetic: "/tjuːˈtɔːriəl/", meaning: "n. 辅导课", example: "We have a small group tutorial every week.", exampleCn: "我们每周有一次小组辅导课。" },
    scholarship: { phonetic: "/ˈskɒləʃɪp/", meaning: "n. 奖学金", example: "She won a scholarship to study abroad.", exampleCn: "她获得了出国留学的奖学金。" },
    enrollment: { phonetic: "/ɪnˈrəʊlmənt/", meaning: "n. 注册入学", example: "Enrollment for next semester starts soon.", exampleCn: "下学期注册即将开始。" },
    graduation: { phonetic: "/ˌɡrædʒuˈeɪʃn/", meaning: "n. 毕业", example: "After graduation, she found a job in Shanghai.", exampleCn: "毕业后，她在上海找到了工作。" },
    diploma: { phonetic: "/dɪˈpləʊmə/", meaning: "n. 文凭", example: "He received a diploma in accounting.", exampleCn: "他获得了会计文凭。" },
    vocational: { phonetic: "/vəʊˈkeɪʃənl/", meaning: "adj. 职业的", example: "Vocational training prepares students for specific jobs.", exampleCn: "职业培训为学生从事特定工作做准备。" },
    apprenticeship: { phonetic: "/əˈprentɪʃɪp/", meaning: "n. 学徒期", example: "He completed an apprenticeship as a chef.", exampleCn: "他完成了厨师学徒期。" },
    motivation: { phonetic: "/ˌməʊtɪˈveɪʃn/", meaning: "n. 动力", example: "Motivation is key to learning success.", exampleCn: "动力是学习成功的关键。" },
    discipline: { phonetic: "/ˈdɪsəplɪn/", meaning: "n. 自律", example: "Learning a language requires discipline.", exampleCn: "学习一门语言需要自律。" },
    knowledge: { phonetic: "/ˈnɒlɪdʒ/", meaning: "n. 知识", example: "Knowledge is power.", exampleCn: "知识就是力量。" },
    // 复习周
    review: { phonetic: "/rɪˈvjuː/", meaning: "v./n. 复习", example: "Review what you learned today.", exampleCn: "复习今天学的内容。" },
    practice: { phonetic: "/ˈpræktɪs/", meaning: "n./v. 练习", example: "Practice makes perfect.", exampleCn: "熟能生巧。" },
    summary: { phonetic: "/ˈsʌməri/", meaning: "n. 总结", example: "Write a summary of the article.", exampleCn: "写一篇文章总结。" },
    progress: { phonetic: "/ˈprəʊɡres/", meaning: "n. 进步", example: "You have made great progress.", exampleCn: "你取得了很大进步。" },
    achievement: { phonetic: "/əˈtʃiːvmənt/", meaning: "n. 成就", example: "Learning English is a great achievement.", exampleCn: "学会英语是一项伟大的成就。" },
    confidence: { phonetic: "/ˈkɒnfɪdəns/", meaning: "n. 信心", example: "Speaking practice builds confidence.", exampleCn: "口语练习建立信心。" },
    fluency: { phonetic: "/ˈfluːənsi/", meaning: "n. 流利度", example: "Her English fluency improved a lot.", exampleCn: "她的英语流利度提高了很多。" },
    accuracy: { phonetic: "/ˈækjərəsi/", meaning: "n. 准确性", example: "Grammar accuracy is important in writing.", exampleCn: "语法准确性在写作中很重要。" },
    pronunciation: { phonetic: "/prəˌnʌnsiˈeɪʃn/", meaning: "n. 发音", example: "Your pronunciation is very clear.", exampleCn: "你的发音很清晰。" },
    vocabulary: { phonetic: "/vəˈkæbjələri/", meaning: "n. 词汇量", example: "Reading helps expand your vocabulary.", exampleCn: "阅读有助于扩大词汇量。" },
    comprehension: { phonetic: "/ˌkɒmprɪˈhenʃn/", meaning: "n. 理解力", example: "Listening comprehension takes time to improve.", exampleCn: "听力理解需要时间提高。" },
    expression: { phonetic: "/ɪkˈspreʃn/", meaning: "n. 表达", example: "This expression is commonly used in daily life.", exampleCn: "这个表达在日常生活中很常用。" },
    conversation: { phonetic: "/ˌkɒnvəˈseɪʃn/", meaning: "n. 对话", example: "Let's practice having a conversation in English.", exampleCn: "我们练习用英语对话。" },
    presentation: { phonetic: "/ˌpreznˈteɪʃn/", meaning: "n. 演示", example: "She gave a great presentation yesterday.", exampleCn: "她昨天做了一个很棒的演示。" },
    discussion: { phonetic: "/dɪˈskʌʃn/", meaning: "n. 讨论", example: "We had a lively discussion about the topic.", exampleCn: "我们就这个话题进行了热烈讨论。" },
    debate: { phonetic: "/dɪˈbeɪt/", meaning: "n./v. 辩论", example: "The debate lasted for two hours.", exampleCn: "辩论持续了两个小时。" },
    negotiation: { phonetic: "/nɪˌɡəʊʃiˈeɪʃn/", meaning: "n. 谈判", example: "Negotiation skills are useful in business.", exampleCn: "谈判技巧在商业中很有用。" },
    persuasion: { phonetic: "/pəˈsweɪʒn/", meaning: "n. 说服", example: "Persuasion is an important communication skill.", exampleCn: "说服是一项重要的沟通技巧。" },
    interaction: { phonetic: "/ˌɪntərˈækʃn/", meaning: "n. 互动", example: "Classroom interaction helps students learn.", exampleCn: "课堂互动帮助学生学习。" },
    feedback: { phonetic: "/ˈfiːdbæk/", meaning: "n. 反馈", example: "Please give me feedback on my writing.", exampleCn: "请给我的写作提反馈。" },
  };
  return words.map(w => ({
    word: w,
    phonetic: meanings[w]?.phonetic || "/.../",
    meaning: meanings[w]?.meaning || w,
    example: meanings[w]?.example || `Example with ${w}.`,
    exampleCn: meanings[w]?.exampleCn || `包含${w}的例句。`,
  }));
}

function buildReading(theme: string, day: number): IReadingMaterial {
  const readings: Record<string, IReadingMaterial> = {
    "旅行与出行 Travel": {
      title: "Tips for First-Time Travelers", level: "B1",
      paragraphs: [
        { en: "Traveling to a new place can be exciting but also stressful. With some preparation, you can make your trip smooth and enjoyable. Here are some tips for first-time travelers.", cn: "去新地方旅行既令人兴奋又可能有压力。做好准备，你可以让旅程顺利愉快。以下是给首次旅行者的建议。" },
        { en: "First, plan your itinerary but leave some free time. It is good to have a general plan, but you don't want to rush from one place to another. Leave time to explore and relax.", cn: "首先，规划行程但留出一些自由时间。有大致计划是好的，但你不想从一个地方赶到另一个地方。留出时间探索和放松。" },
        { en: "Second, pack light. You don't need as much as you think. Bring comfortable clothes and shoes. Roll your clothes instead of folding them to save space. Always keep important documents in your carry-on.", cn: "第二，轻装出行。你不需要想象中那么多东西。带舒适的衣服和鞋子。卷衣服而不是叠起来以节省空间。重要文件始终放在随身行李中。" },
        { en: "Finally, be open to new experiences. Try local food, talk to locals, and learn a few words of the language. The best memories often come from unexpected moments. Travel is about the journey, not just the destination.", cn: "最后，对新体验保持开放。尝试当地食物，和当地人交谈，学几句当地语言。最美好的回忆往往来自意想不到的时刻。旅行重在过程，不仅仅是目的地。" },
      ],
      vocab: ["itinerary", "pack", "carry-on", "destination", "explore"],
    },
    "健康与健身 Health & Fitness": {
      title: "Building Healthy Habits", level: "B1",
      paragraphs: [
        { en: "Good health is the foundation of a happy life. Many people want to be healthier but don't know where to start. The key is to build small habits that you can maintain over time.", cn: "健康是幸福生活的基础。许多人想更健康但不知道从哪里开始。关键是建立可以长期坚持的小习惯。" },
        { en: "Start with what you eat. You don't need a strict diet. Instead, focus on adding more vegetables, fruits, and whole grains to your meals. Drink plenty of water throughout the day. Avoid processed foods and sugary drinks.", cn: "从饮食开始。你不需要严格的节食。相反，专注于在餐食中添加更多蔬菜、水果和全谷物。全天多喝水。避免加工食品和含糖饮料。" },
        { en: "Exercise is also important. Find an activity you enjoy, whether it's walking, dancing, swimming, or yoga. Aim for at least 30 minutes of moderate exercise most days. Start slowly and gradually increase the intensity.", cn: "锻炼也很重要。找到你喜欢的活动，无论是散步、跳舞、游泳还是瑜伽。大多数日子目标是至少30分钟的适度运动。慢慢开始，逐渐增加强度。" },
        { en: "Sleep and rest are often overlooked. Adults need 7-9 hours of sleep per night. Good sleep improves mood, memory, and immune function. Create a bedtime routine and avoid screens before bed. Remember, health is a lifelong journey, not a quick fix.", cn: "睡眠和休息经常被忽视。成年人每晚需要7-9小时睡眠。良好的睡眠改善情绪、记忆力和免疫功能。建立睡前惯例，睡前避免屏幕。记住，健康是一生的旅程，不是快速修复。" },
      ],
      vocab: ["foundation", "maintain", "processed", "moderate", "overlooked"],
    },
    "购物与消费 Shopping": {
      title: "Smart Shopping Habits", level: "B1",
      paragraphs: [
        { en: "We all need to buy things, but shopping smart can save you money and reduce stress. With advertising everywhere, it is easy to buy things you don't really need. Here is how to become a smarter shopper.", cn: "我们都需要买东西，但聪明购物可以省钱并减少压力。广告无处不在，很容易买到你并不真正需要的东西。以下是如何成为更聪明的购物者。" },
        { en: "Before you go shopping, make a list and stick to it. This prevents impulse buying. Set a budget for yourself and don't exceed it. If you see something you want but didn't plan for, wait 24 hours before buying it.", cn: "购物前，列个清单并坚持执行。这可以防止冲动消费。为自己设定预算，不要超支。如果你看到想要但没计划买的东西，等24小时再买。" },
        { en: "Compare prices before buying. The same product may be cheaper at another store or online. Look for sales and use coupons. However, don't buy something just because it is on sale if you don't need it. A bargain is only a bargain if you need it.", cn: "购买前比较价格。同一产品在另一家店或网上可能更便宜。寻找促销并使用优惠券。但是，如果不需要，不要仅仅因为打折就买。便宜货只有在你需要时才是便宜货。" },
        { en: "Consider quality over quantity. A well-made item may cost more upfront but lasts longer. Read reviews before buying expensive items. Keep receipts in case you need to return or exchange something. Smart shopping is about making informed decisions.", cn: "考虑质量而非数量。做工好的东西可能前期花费更多但更耐用。买贵的东西前先看评价。保留收据以防需要退换。聪明购物就是做出明智的决定。" },
      ],
      vocab: ["impulse", "exceed", "bargain", "upfront", "informed"],
    },
    "娱乐与休闲 Entertainment": {
      title: "The Importance of Leisure Time", level: "B1",
      paragraphs: [
        { en: "In today's busy world, many people forget to relax. We work long hours and fill our free time with chores and responsibilities. However, leisure time is essential for mental health and overall well-being.", cn: "在当今忙碌的世界，许多人忘记了放松。我们长时间工作，把空闲时间填满家务和责任。然而，休闲时间对心理健康和整体福祉至关重要。" },
        { en: "Leisure doesn't have to be expensive or elaborate. It can be as simple as reading a book, taking a walk, or listening to music. The important thing is to do something you enjoy that takes your mind off work and stress.", cn: "休闲不一定需要昂贵或精心安排。可以像读书、散步或听音乐一样简单。重要的是做你喜欢的事，让大脑从工作和压力中解脱出来。" },
        { en: "Hobbies are a great way to spend leisure time. They can be creative, like painting or writing, or active, like sports or gardening. Hobbies help you develop new skills and meet people with similar interests. They give you something to look forward to.", cn: "爱好是度过休闲时间的好方式。可以是创造性的，如绘画或写作，也可以是活跃的，如运动或园艺。爱好帮助你发展新技能，结识志同道合的人。它们给你期待的东西。" },
        { en: "Entertainment like movies, music, and games can also be relaxing. However, balance is important. Too much screen time can leave you feeling tired. Try to mix passive entertainment with active hobbies. Make time for fun every day, even if it is just 15 minutes.", cn: "电影、音乐和游戏等娱乐也可以放松。然而，平衡很重要。太多屏幕时间会让你感到疲惫。尝试将被动娱乐和主动爱好结合起来。每天留出时间玩乐，哪怕只有15分钟。" },
      ],
      vocab: ["essential", "elaborate", "creative", "passive", "balance"],
    },
  };
  return readings[theme] || readings["旅行与出行 Travel"];
}

function buildSpeaking(theme: string): ISpeakingContent {
  const speakings: Record<string, ISpeakingContent> = {
    "旅行与出行 Travel": {
      topic: "At the airport 在机场",
      expressions: [
        { en: "Where is the check-in counter?", cn: "值机柜台在哪里？", usage: "询问值机位置" },
        { en: "I'd like to check in for flight...", cn: "我想办理...航班的值机", usage: "办理值机" },
        { en: "How many bags are you checking?", cn: "您要托运几件行李？", usage: "询问托运行李" },
        { en: "Is my flight on time?", cn: "我的航班准点吗？", usage: "询问航班状态" },
        { en: "Where is gate...?", cn: "...登机口在哪里？", usage: "询问登机口" },
      ],
      dialogue: [
        { en: "A: Good morning! Where are you flying to today?", cn: "A: 早上好！您今天飞哪里？" },
        { en: "B: I'm flying to Beijing. Here's my passport and booking confirmation.", cn: "B: 我飞北京。这是我的护照和预订确认。" },
        { en: "A: Thank you. How many bags would you like to check?", cn: "A: 谢谢。您要托运几件行李？" },
        { en: "B: Just one suitcase. Can I have a window seat?", cn: "B: 就一个行李箱。能给我靠窗的座位吗？" },
        { en: "A: Sure. Here's your boarding pass. Gate 12, boarding at 9:30.", cn: "A: 好的。这是您的登机牌。12号登机口，9:30登机。" },
      ],
      practiceTask: "模拟机场值机对话，练习询问航班信息、座位选择、登机口等。",
    },
    "健康与健身 Health & Fitness": {
      topic: "At the doctor's 看医生",
      expressions: [
        { en: "I've been feeling...", cn: "我一直感觉...", usage: "描述症状" },
        { en: "How long have you had these symptoms?", cn: "这些症状多久了？", usage: "医生询问" },
        { en: "I'd like to run some tests.", cn: "我想做些检查", usage: "医生说" },
        { en: "Take this medicine three times a day.", cn: "这药一天吃三次", usage: "医嘱" },
        { en: "You should get more rest.", cn: "你应该多休息", usage: "建议" },
      ],
      dialogue: [
        { en: "A: What seems to be the problem?", cn: "A: 哪里不舒服？" },
        { en: "B: I've had a headache and a sore throat for two days. I feel tired.", cn: "B: 我头痛喉咙痛两天了。感觉很累。" },
        { en: "A: Let me check your temperature. You have a slight fever. It's probably a cold.", cn: "A: 我量一下体温。有点发烧。可能是感冒。" },
        { en: "B: Should I take any medicine?", cn: "B: 我需要吃药吗？" },
        { en: "A: I'll prescribe something. Drink plenty of water and rest for a few days.", cn: "A: 我开点药。多喝水，休息几天。" },
      ],
      practiceTask: "角色扮演看医生，练习描述症状、理解医嘱、询问用药方法。",
    },
    "购物与消费 Shopping": {
      topic: "At a clothing store 在服装店",
      expressions: [
        { en: "Can I try this on?", cn: "我能试穿吗？", usage: "询问试穿" },
        { en: "Where is the fitting room?", cn: "试衣间在哪里？", usage: "询问试衣间" },
        { en: "Do you have this in a different size?", cn: "这个有其他尺码吗？", usage: "询问尺码" },
        { en: "How much is this?", cn: "这个多少钱？", usage: "询问价格" },
        { en: "I'll take it.", cn: "我要了。", usage: "决定购买" },
      ],
      dialogue: [
        { en: "A: Can I help you find something?", cn: "A: 需要帮忙吗？" },
        { en: "B: I'm looking for a casual jacket. Something light for spring.", cn: "B: 我在找休闲夹克。春天穿的轻薄款。" },
        { en: "A: How about this one? It comes in three colors. Would you like to try it on?", cn: "A: 这件怎么样？有三个颜色。要试穿吗？" },
        { en: "B: Yes, in medium please. Where is the fitting room?", cn: "B: 好的，中号。试衣间在哪里？" },
        { en: "A: Right over there. Let me know if you need a different size.", cn: "A: 在那边。如果需要换尺码告诉我。" },
      ],
      practiceTask: "模拟服装店购物对话，练习询问商品、试穿、尺码、价格和购买。",
    },
    "娱乐与休闲 Entertainment": {
      topic: "Making weekend plans 制定周末计划",
      expressions: [
        { en: "What are you doing this weekend?", cn: "这周末你做什么？", usage: "询问计划" },
        { en: "Do you want to...?", cn: "你想...吗？", usage: "邀请" },
        { en: "That sounds like fun!", cn: "听起来很有趣！", usage: "回应邀请" },
        { en: "I'm not really into...", cn: "我不太喜欢...", usage: "委婉拒绝" },
        { en: "Let's meet at...", cn: "我们在...见吧", usage: "约定见面" },
      ],
      dialogue: [
        { en: "A: Hey, do you have plans for Saturday?", cn: "A: 嘿，周六有计划吗？" },
        { en: "B: Not yet. Why? What did you have in mind?", cn: "B: 还没有。怎么了？你有什么想法？" },
        { en: "A: There's a new movie out. Want to go see it? We could grab dinner after.", cn: "A: 有部新电影上映了。想去看吗？之后可以吃晚饭。" },
        { en: "B: Sure! What time works for you?", cn: "B: 好啊！你什么时间方便？" },
        { en: "A: How about 7pm? Let's meet at the cinema entrance.", cn: "A: 7点怎么样？电影院门口见。" },
      ],
      practiceTask: "和朋友用英语讨论周末计划，练习邀请、接受/拒绝、约定时间地点。",
    },
  };
  return speakings[theme] || speakings["旅行与出行 Travel"];
}

const videoTitles = [
  { title: "Travel English - At the Airport Conversation", source: "YouTube", desc: "机场英语对话教学，学习值机、安检、登机等实用表达。" },
  { title: "Health English - At the Doctor's Office", source: "YouTube", desc: "看医生英语对话，学习描述症状、理解医嘱的常用表达。" },
  { title: "Shopping English - At the Store Conversation", source: "YouTube", desc: "购物英语对话，学习询问商品、试穿、砍价、结账等表达。" },
  { title: "Leisure English - Talking About Hobbies", source: "YouTube", desc: "谈论爱好和休闲活动的英语对话，学习邀请和约定表达。" },
];

// 生成第4-7天
const day4to7: IEnglishDay[] = themes.map((t, i) => ({
  day: i + 4,
  week: 1,
  theme: t.theme,
  level: "B1",
  vocab: buildVocab(t.words),
  reading: buildReading(t.theme, i + 4),
  speaking: buildSpeaking(t.theme),
  videoTitle: videoTitles[i].title,
  videoSource: videoTitles[i].source,
  videoDesc: videoTitles[i].desc,
}));

// 第8-30天：使用模板生成，每周一个主题，难度逐渐提升
const weekThemes = [
  { week: 2, theme: "人际关系 Relationships", level: "B1+", words: ["friendship","trust","support","communicate","understand","respect","boundary","compromise","empathy","conflict","resolve","apologize","forgive","gratitude","companion","relative","acquaintance","mentor","network","socialize"] },
  { week: 3, theme: "科技与数字生活 Technology", level: "B2", words: ["device","application","software","database","algorithm","artificial","virtual","reality","innovation","automation","cybersecurity","privacy","streaming","platform","gadget","upgrade","download","upload","wireless","interface"] },
  { week: 4, theme: "环境与自然 Environment", level: "B2", words: ["climate","pollution","recycle","sustainable","renewable","ecosystem","biodiversity","conservation","emission","carbon","organic","deforestation","endangered","habitat","preserve","reduce","reuse","eco-friendly","greenhouse","awareness"] },
  { week: 5, theme: "教育与学习 Education", level: "B2+", words: ["curriculum","assessment","literacy","numeracy","critical","analytical","research","thesis","seminar","lecture","tutorial","scholarship","enrollment","graduation","diploma","vocational","apprenticeship","motivation","discipline","knowledge"] },
];

function buildWeekDay(weekTheme: typeof weekThemes[0], dayInWeek: number, overallDay: number): IEnglishDay {
  const subThemes = ["基础词汇与阅读","口语对话","听力练习","写作表达","综合应用"];
  return {
    day: overallDay,
    week: weekTheme.week,
    theme: `${weekTheme.theme} - ${subThemes[dayInWeek - 1]}`,
    level: weekTheme.level,
    vocab: buildVocab(weekTheme.words.slice((dayInWeek - 1) * 4, dayInWeek * 4)),
    reading: buildReading(weekTheme.theme.split(" ")[0], overallDay),
    speaking: buildSpeaking(weekTheme.theme.split(" ")[0]),
    videoTitle: `${weekTheme.theme} English Lesson - Day ${overallDay}`,
    videoSource: "YouTube",
    videoDesc: `${weekTheme.theme}主题英语学习，包含词汇、阅读、口语和听力练习。`,
  };
}

// 生成第8-30天（每周5天学习，周末复习）
const day8to30: IEnglishDay[] = [];
let overallDay = 8;
for (const wt of weekThemes) {
  for (let d = 1; d <= 5; d++) {
    if (overallDay <= 30) {
      day8to30.push(buildWeekDay(wt, d, overallDay));
      overallDay++;
    }
  }
}
// 补齐到30天
while (overallDay <= 30) {
  day8to30.push({
    day: overallDay,
    week: 5,
    theme: `综合复习与应用 Review & Practice - Day ${overallDay}`,
    level: "B2+",
    vocab: buildVocab(["review","practice","summary","progress","achievement","confidence","fluency","accuracy","pronunciation","vocabulary","comprehension","expression","conversation","presentation","discussion","debate","negotiation","persuasion","interaction","feedback"]),
    reading: buildReading("综合", overallDay),
    speaking: buildSpeaking("综合"),
    videoTitle: `English Review & Practice - Day ${overallDay}`,
    videoSource: "YouTube",
    videoDesc: "综合复习课程，巩固前几周所学内容，进行口语和写作综合练习。",
  });
  overallDay++;
}

export const MOCK_ENGLISH_DAYS: IEnglishDay[] = [
  day1, day2, day3, ...day4to7, ...day8to30,
].slice(0, 30);

export const MOCK_ENGLISH_RESOURCES: IEnglishResource[] = [
  { name: "BBC Learning English", type: "网站", level: "B1-B2", desc: "BBC官方英语学习网站，包含大量免费课程、视频和音频。", url: "https://www.bbc.co.uk/learningenglish" },
  { name: "VOA Learning English", type: "网站", level: "B1-B2", desc: "美国之音慢速英语，适合听力练习，新闻内容丰富。", url: "https://learningenglish.voanews.com" },
  { name: "TED Talks", type: "视频", level: "B2+", desc: "各领域精彩演讲，配有字幕，适合听力和词汇提升。", url: "https://www.ted.com/talks" },
  { name: "EnglishPod", type: "播客", level: "B1-B2", desc: "情景对话播客，每集一个主题，配有文本和词汇解释。", url: "https://www.englishpod.com" },
  { name: "Duolingo", type: "APP", level: "A1-B1", desc: "游戏化背单词和语法练习，适合碎片化学习。", url: "https://www.duolingo.com" },
  { name: "Anki", type: "APP", level: "全等级", desc: "间隔重复记忆卡片软件，自定义单词卡片，高效记忆。", url: "https://apps.ankiweb.net" },
  { name: "Netflix (Language Learning)", type: "视频", level: "B1+", desc: "用双语字幕看美剧英剧，沉浸式学习地道表达。", url: "https://www.netflix.com" },
  { name: "Grammarly", type: "工具", level: "B1+", desc: "英语写作语法检查工具，实时纠正语法和拼写错误。", url: "https://www.grammarly.com" },
  { name: "Cambridge Dictionary", type: "词典", level: "全等级", desc: "权威英语词典，含发音、例句和用法说明。", url: "https://dictionary.cambridge.org" },
  { name: "HelloTalk", type: "APP", level: "B1+", desc: "语言交换APP，和母语者聊天，练习口语和写作。", url: "https://www.hellotalk.com" },
];
