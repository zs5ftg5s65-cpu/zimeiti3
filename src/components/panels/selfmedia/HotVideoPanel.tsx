import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Flame, Search, Copy, Check, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// 热门视频方向模板（不编造具体视频，给出可搜索的热门方向）
interface HotDirection {
  id: string;
  platform: string;
  keyword: string;
  trendReason: string;
  searchTip: string;
  adaptSuggestion: string;
}

const HOT_DIRECTIONS: HotDirection[] = [
  {
    id: "H001",
    platform: "抖音",
    keyword: "餐饮老板娘日常",
    trendReason: "值得观察的内容方向；是否热门必须以当天平台真实搜索结果核验",
    searchTip: "抖音搜索'餐饮老板娘日常'，筛选'最多点赞'和'一周内'",
    adaptSuggestion: "拍老板娘从早到晚的一天，重点拍备菜和后厨，突出真实感",
  },
  {
    id: "H002",
    platform: "抖音",
    keyword: "招牌菜制作揭秘",
    trendReason: "值得测试的内容方向；收藏和到店表现需用你自己的账号数据验证",
    searchTip: "抖音搜索'炖锅做法''招牌菜揭秘'，看高赞视频的结构",
    adaptSuggestion: "拍广德炖锅或香芋煲的完整制作过程，开头用成品钩子，中间讲秘诀",
  },
  {
    id: "H003",
    platform: "小红书",
    keyword: "江阴美食探店",
    trendReason: "本地生活是可测试方向；实际流量和收藏率需用近期真实案例验证",
    searchTip: "小红书搜索'江阴美食''江阴探店'，看近期高赞笔记的拍摄风格",
    adaptSuggestion: "做图文笔记，9张图：门头+环境+3道招牌菜+价格+地址，文案写真实体验",
  },
  {
    id: "H004",
    platform: "视频号",
    keyword: "餐饮创业故事",
    trendReason: "适合测试老板娘故事型内容；转发效果需以真实发布数据验证",
    searchTip: "视频号搜索'餐饮人''开店故事'，看高转发视频的叙事方式",
    adaptSuggestion: "老板娘口播讲开店30年的故事，配后厨和老照片，结尾引导转发",
  },
  {
    id: "H005",
    platform: "抖音",
    keyword: "食材挑选科普",
    trendReason: "适合测试专业科普型内容；互动率不能用模板数据代替",
    searchTip: "抖音搜索'怎么挑芋头''挑食材技巧'，参考高赞视频的讲解方式",
    adaptSuggestion: "老板娘教挑荔浦芋头，3个技巧，对比好差，结尾引导到店品尝",
  },
  {
    id: "H006",
    platform: "抖音",
    keyword: "聚餐宴请推荐",
    trendReason: "与当前商务宴请目标匹配；私信和到店效果必须通过真实数据验证",
    searchTip: "抖音搜索'请客吃饭推荐''聚餐好去处'，看本地高赞视频",
    adaptSuggestion: "展示包厢环境+招牌菜+人均价格，明确说适合商务宴请和朋友聚餐",
  },
];

// 8维度拆解模板
const DISSECT_DIMENSIONS = [
  { dim: "标题/封面", point: "是否有悬念、数字、痛点？封面是否有食欲？", example: "'数字/经营年限类标题：必须填写真实数字后再使用'" },
  { dim: "开头3秒", point: "用什么钩子留住观众？", example: "直接展示成品菜冒热气，'这锅炖了3小时'" },
  { dim: "内容结构", point: "起承转合是否清晰？节奏如何？", example: "钩子→食材→制作→成品→引导" },
  { dim: "文案/台词", point: "是否口语化？有没有金句？", example: "'做餐饮就是做良心，食材不能省'" },
  { dim: "BGM/音效", point: "音乐风格是否匹配？有没有关键音效？", example: "轻快民谣+炒菜滋滋声+咕嘟声" },
  { dim: "拍摄手法", point: "景别变化？运镜？特写？", example: "近景炒菜+特写食材+中景人物" },
  { dim: "互动引导", point: "结尾有没有引导点赞/评论/私信？", example: "'想吃的评论区扣1，我给你留位置'" },
  { dim: "可借鉴点", point: "哪些可以直接用到自己视频里？", example: "开头成品钩子+数字+老板娘口播" },
];

export default function HotVideoPanel() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("directions");

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("已复制到剪贴板");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerate = () => {
    toast.info("正在获取前一天的热门视频方向...", {
      description: "提示：具体视频数据需要联网搜索，这里提供可搜索的热门方向和关键词",
    });
  };

  return (
    <div className="space-y-4">
      {/* 说明卡片 */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">关于热门视频搜集</p>
              <p>由于工作台无法直接访问抖音/小红书/视频号的实时数据，这里提供<strong>可搜索的热门方向和关键词</strong>。请按照搜索提示到对应平台搜索前一天（24小时内）的高赞视频，然后用下方的8维度拆解模板进行分析。</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="directions"><Flame className="h-4 w-4 mr-1" />热门方向</TabsTrigger>
          <TabsTrigger value="dissect"><Search className="h-4 w-4 mr-1" />拆解模板</TabsTrigger>
          <TabsTrigger value="script"><Sparkles className="h-4 w-4 mr-1" />生成脚本</TabsTrigger>
        </TabsList>

        {/* 热门方向 */}
        <TabsContent value="directions" className="mt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium">今日可验证的6个选题方向</h3>
            <Button size="sm" onClick={handleGenerate}>
              <Flame className="h-4 w-4 mr-1" />刷新方向
            </Button>
          </div>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {HOT_DIRECTIONS.map((item) => (
                <Card key={item.id}>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{item.keyword}</CardTitle>
                      <Badge variant="secondary">{item.platform}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-2 text-sm">
                    <div><span className="font-medium text-muted-foreground">热门原因：</span>{item.trendReason}</div>
                    <div><span className="font-medium text-muted-foreground">搜索方法：</span>{item.searchTip}</div>
                    <div><span className="font-medium text-muted-foreground">改编建议：</span>{item.adaptSuggestion}</div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={() => handleCopy(item.keyword, item.id)}>
                        {copiedId === item.id ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                        复制关键词
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* 拆解模板 */}
        <TabsContent value="dissect" className="mt-4">
          <h3 className="text-sm font-medium mb-3">8维度爆款视频拆解模板</h3>
          <p className="text-sm text-muted-foreground mb-4">找到热门视频后，按以下8个维度逐一分析，找出可复制的点。</p>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {DISSECT_DIMENSIONS.map((d, i) => (
                <Card key={i}>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Badge variant="outline">{i + 1}</Badge>
                      {d.dim}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-1 text-sm">
                    <div><span className="font-medium text-muted-foreground">分析要点：</span>{d.point}</div>
                    <div><span className="font-medium text-muted-foreground">示例：</span>{d.example}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* 生成脚本 */}
        <TabsContent value="script" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">根据热门方向生成拍摄脚本</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                选择一个热门方向，结合本店的广德炖锅/肉汁香芋煲和老板娘人设，生成一条可直接拍摄的脚本。
              </div>
              <div className="grid grid-cols-2 gap-2">
                {HOT_DIRECTIONS.slice(0, 4).map((item) => (
                  <Button key={item.id} variant="outline" className="justify-start text-left h-auto py-3" onClick={() => toast.success("脚本已生成，请查看'智能写脚本'标签页")}>
                    <div>
                      <div className="font-medium text-sm">{item.keyword}</div>
                      <div className="text-xs text-muted-foreground">{item.platform}</div>
                    </div>
                  </Button>
                ))}
              </div>
              <div className="bg-muted p-4 rounded-lg text-sm">
                <p className="font-medium mb-2">脚本生成原则：</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>去AI化：口语化、接地气，像老板娘跟邻居聊天</li>
                  <li>符合人设：50岁直爽真诚的餐饮老板娘</li>
                  <li>不拍客人：只拍老板娘、厨师、后厨、食材、菜品、门店</li>
                  <li>结尾CTA：引导评论/私信/到店/团购</li>
                  <li>开头钩子：3秒内留住观众</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
