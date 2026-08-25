import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Calendar, Video, FileText, Search } from "lucide-react";

interface HistoryRecord {
  id: string;
  date: string;
  type: "video" | "script" | "analysis";
  title: string;
  platform?: string;
  status: "已发布" | "草稿" | "已分析";
  summary: string;
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    pms?: number;
    storeVisits?: number;
  };
}

const MOCK_HISTORY: HistoryRecord[] = [
  {
    id: "H001",
    date: "2026-08-22",
    type: "video",
    title: "开饭店的一天vlog",
    platform: "抖音",
    status: "已发布",
    summary: "跟拍老板娘从早到晚的一天，重点拍备菜和后厨",
    metrics: { views: 8900, likes: 520, comments: 134, pms: 6, storeVisits: 3 },
  },
  {
    id: "H002",
    date: "2026-08-21",
    type: "video",
    title: "老板娘教你挑荔浦芋头",
    platform: "抖音+小红书",
    status: "已发布",
    summary: "3招挑出粉糯荔浦芋头，结尾引导到店品尝香芋煲",
    metrics: { views: 5600, likes: 312, comments: 78, pms: 12, storeVisits: 8 },
  },
  {
    id: "H003",
    date: "2026-08-20",
    type: "video",
    title: "广德炖锅招牌菜展示",
    platform: "抖音+视频号",
    status: "已发布",
    summary: "成品钩子+食材展示+慢炖过程+老板娘口播",
    metrics: { views: 3200, likes: 186, comments: 42, pms: 8, storeVisits: 5 },
  },
  {
    id: "H004",
    date: "2026-08-22",
    type: "script",
    title: "商务宴请推荐脚本",
    status: "草稿",
    summary: "展示包厢环境+招牌菜+人均价格，引导私信订包厢",
  },
  {
    id: "H005",
    date: "2026-08-21",
    type: "analysis",
    title: "热门视频拆解：餐饮老板娘日常",
    platform: "抖音",
    status: "已分析",
    summary: "拆解了3条高赞老板娘日常视频，总结出可复制的结构",
  },
];

export default function HistoryPanel() {
  const [activeTab, setActiveTab] = useState("all");

  const filteredHistory = activeTab === "all"
    ? MOCK_HISTORY
    : MOCK_HISTORY.filter(h => h.type === activeTab);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4" />;
      case "script": return <FileText className="h-4 w-4" />;
      case "analysis": return <Search className="h-4 w-4" />;
      default: return <History className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "video": return "视频";
      case "script": return "脚本";
      case "analysis": return "拆解";
      default: return type;
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all"><History className="h-4 w-4 mr-1" />全部</TabsTrigger>
          <TabsTrigger value="video"><Video className="h-4 w-4 mr-1" />视频</TabsTrigger>
          <TabsTrigger value="script"><FileText className="h-4 w-4 mr-1" />脚本</TabsTrigger>
          <TabsTrigger value="analysis"><Search className="h-4 w-4 mr-1" />拆解</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">历史记录（{filteredHistory.length}条）</h3>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-1" />按日期筛选
            </Button>
          </div>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {filteredHistory.map((record) => (
                <Card key={record.id}>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {getTypeIcon(record.type)}
                        {record.title}
                      </CardTitle>
                      <Badge variant={record.status === "已发布" ? "default" : record.status === "草稿" ? "secondary" : "outline"}>
                        {record.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{record.date}</span>
                      <span>·</span>
                      <span>{getTypeLabel(record.type)}</span>
                      {record.platform && <><span>·</span><span>{record.platform}</span></>}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-2">
                    <p className="text-sm text-muted-foreground">{record.summary}</p>
                    {record.metrics && (
                      <div className="grid grid-cols-5 gap-2 pt-2">
                        <div className="text-center">
                          <div className="font-bold text-sm">{record.metrics.views?.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">播放</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-sm">{record.metrics.likes}</div>
                          <div className="text-xs text-muted-foreground">点赞</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-sm">{record.metrics.comments}</div>
                          <div className="text-xs text-muted-foreground">评论</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-sm">{record.metrics.pms}</div>
                          <div className="text-xs text-muted-foreground">私信</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-sm">{record.metrics.storeVisits}</div>
                          <div className="text-xs text-muted-foreground">到店</div>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline">查看详情</Button>
                      <Button size="sm" variant="outline">复制复用</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
