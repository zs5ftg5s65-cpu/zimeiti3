import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Target, Lightbulb, Video, Users, TrendingUp } from "lucide-react";
import { ACCOUNT_PROFILE, THIRTY_DAY_PLAN, TOPIC_LIBRARY } from "@/data/selfmedia-daily";

export default function OperationRefPanel() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile"><Target className="h-4 w-4 mr-1" />账号定位</TabsTrigger>
          <TabsTrigger value="plan"><BookOpen className="h-4 w-4 mr-1" />30天计划</TabsTrigger>
          <TabsTrigger value="topics"><Lightbulb className="h-4 w-4 mr-1" />选题库</TabsTrigger>
          <TabsTrigger value="tips"><TrendingUp className="h-4 w-4 mr-1" />运营技巧</TabsTrigger>
        </TabsList>

        {/* 账号定位 */}
        <TabsContent value="profile" className="mt-4">
          <ScrollArea className="h-[550px] pr-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">账号基本信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div><span className="text-muted-foreground">账号名称：</span>{ACCOUNT_PROFILE.accountName}</div>
                    <div><span className="text-muted-foreground">运营人物：</span>{ACCOUNT_PROFILE.person}</div>
                    <div><span className="text-muted-foreground">所在地区：</span>{ACCOUNT_PROFILE.region}</div>
                    <div><span className="text-muted-foreground">所属行业：</span>{ACCOUNT_PROFILE.industry}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">人物特点：</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {ACCOUNT_PROFILE.personTraits.map((t, i) => (
                        <Badge key={i} variant="secondary">{t}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">核心菜品：</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {ACCOUNT_PROFILE.coreDishes.map((d, i) => (
                        <Badge key={i}>{d}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">目标客户与用户痛点</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium">目标客户：</span>
                    <ul className="list-disc list-inside mt-1 text-muted-foreground">
                      {ACCOUNT_PROFILE.targetCustomers.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                  <div>
                    <span className="font-medium">用户痛点：</span>
                    <ul className="list-disc list-inside mt-1 text-muted-foreground">
                      {ACCOUNT_PROFILE.userPainPoints.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">拍摄限制与禁止内容</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-green-600">可以拍摄：</span>
                    <ul className="list-disc list-inside mt-1 text-muted-foreground">
                      {ACCOUNT_PROFILE.shootingRestrictions.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                  <div>
                    <span className="font-medium text-red-600">禁止内容：</span>
                    <ul className="list-disc list-inside mt-1 text-muted-foreground">
                      {ACCOUNT_PROFILE.forbiddenContent.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">商业目标</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {ACCOUNT_PROFILE.businessGoals.map((g, i) => (
                      <Badge key={i} variant="outline" className="px-3 py-1">{g}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* 30天计划 */}
        <TabsContent value="plan" className="mt-4">
          <ScrollArea className="h-[550px] pr-4">
            <div className="space-y-3">
              {THIRTY_DAY_PLAN.map((plan) => (
                <Card key={plan.day}>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">第{plan.day}天：{plan.dailyTheme}</CardTitle>
                      <Badge variant="secondary">第{plan.week}周</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">{plan.stage}</div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-2 text-sm">
                    <div><span className="text-muted-foreground">当日目标：</span>{plan.dailyGoal}</div>
                    <div><span className="text-muted-foreground">内容类型：</span>{plan.contentType}</div>
                    <div><span className="text-muted-foreground">拍摄任务：</span>{plan.shootingTask}</div>
                    <div><span className="text-muted-foreground">必须产出：</span>{plan.mustProduce}</div>
                    <div><span className="text-muted-foreground">成功标准：</span>{plan.successCriteria}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* 选题库 */}
        <TabsContent value="topics" className="mt-4">
          <ScrollArea className="h-[550px] pr-4">
            <div className="space-y-3">
              {TOPIC_LIBRARY.map((topic) => (
                <Card key={topic.id}>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{topic.title}</CardTitle>
                      <Badge variant={topic.priority === "高" ? "default" : "secondary"}>{topic.priority}优先级</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-2 text-sm">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline">{topic.contentType}</Badge>
                      {topic.bossOnCamera && <Badge variant="outline">老板娘出镜</Badge>}
                      {topic.needChef && <Badge variant="outline">需厨师</Badge>}
                      {topic.involvesCustomer && <Badge variant="destructive">涉及客人(虚化)</Badge>}
                    </div>
                    <div><span className="text-muted-foreground">开头钩子：</span>{topic.hook}</div>
                    <div><span className="text-muted-foreground">核心内容：</span>{topic.coreContent}</div>
                    <div><span className="text-muted-foreground">镜头建议：</span>{topic.shotSuggestions}</div>
                    <div><span className="text-muted-foreground">CTA：</span>{topic.cta}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* 运营技巧 */}
        <TabsContent value="tips" className="mt-4">
          <ScrollArea className="h-[550px] pr-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Video className="h-5 w-5" />拍摄技巧
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="font-medium">1. 开头3秒决定生死</div>
                  <p className="text-muted-foreground">第一帧必须有食欲冲击（成品菜冒热气）或悬念（数字/痛点），不要铺垫。</p>
                  <div className="font-medium">2. 自然光优于美颜</div>
                  <p className="text-muted-foreground">餐饮视频靠食欲感，过度美颜会让菜品失真。用窗边自然光，菜品拍得有光泽。</p>
                  <div className="font-medium">3. 声音很重要</div>
                  <p className="text-muted-foreground">炒菜滋滋声、炖煮咕嘟声、切菜声，这些ASMR音效能大幅提升完播率。</p>
                  <div className="font-medium">4. 字幕要大</div>
                  <p className="text-muted-foreground">目标客户30-50岁，字幕字号要大，关键信息用黄色或红色突出。</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-5 w-5" />人设打造
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="font-medium">1. 口语化，像跟邻居聊天</div>
                  <p className="text-muted-foreground">不要念稿子，用"我跟你说""说实话""你知道吗"等口语化表达。</p>
                  <div className="font-medium">2. 有记忆点</div>
                  <p className="text-muted-foreground">固定开场白或口头禅，比如"我是光英，开饭店30年了"，反复强化。</p>
                  <div className="font-medium">3. 真实不完美</div>
                  <p className="text-muted-foreground">不用追求每条都完美，偶尔的小失误反而更真实，拉近和观众的距离。</p>
                  <div className="font-medium">4. 价值观输出</div>
                  <p className="text-muted-foreground">"做餐饮就是做良心""食材不能省"，这类金句容易被转发和记住。</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />发布与运营
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="font-medium">1. 发布时间</div>
                  <p className="text-muted-foreground">抖音：11:00-13:00、17:00-19:00；视频号：20:00-22:00；小红书：12:00、20:00。</p>
                  <div className="font-medium">2. 话题标签</div>
                  <p className="text-muted-foreground">每条带3-5个标签：#江阴美食 #徽菜 #广德炖锅 #老板娘日常 #本地美食。</p>
                  <div className="font-medium">3. 评论区运营</div>
                  <p className="text-muted-foreground">发布后1小时内回复前10条评论，用提问引导更多互动，置顶引导到店的评论。</p>
                  <div className="font-medium">4. 私信转化</div>
                  <p className="text-muted-foreground">私信设置自动回复：地址、电话、营业时间、包厢预订方式，引导加微信。</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />投流技巧
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="font-medium">1. 什么时候投</div>
                  <p className="text-muted-foreground">自然播放5000+、私信5条以上、收藏率3%以上的视频才值得投流。</p>
                  <div className="font-medium">2. 投多少</div>
                  <p className="text-muted-foreground">先投100元测试，ROI正的话追加到300-500元，单条不超过1000元。</p>
                  <div className="font-medium">3. 怎么定向</div>
                  <p className="text-muted-foreground">地区：江阴+周边30公里；年龄：30-50岁；兴趣：美食、餐饮、本地生活。</p>
                  <div className="font-medium">4. 优化目标</div>
                  <p className="text-muted-foreground">选"私信咨询"或"门店引流"，不要选"播放量"，那是浪费钱。</p>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
