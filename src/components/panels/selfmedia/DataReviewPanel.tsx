import { useState, useRef, useEffect } from "react";
import { scopedStorage } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, BarChart3, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Image as ImageIcon, Sparkles, Save } from "lucide-react";
import { toast } from "sonner";

// 完整视频数据结构（22个字段）
interface VideoData {
  account: string;
  store: string;
  videoId: string;
  title: string;
  publishDate: string;
  publishTime: string;
  duration: string;
  views: number;
  dropOffRate2s: number;
  retentionRate5s: number;
  completionRate: number;
  likes: number;
  comments: number;
  favorites: number;
  shares: number;
  newFollowers: number;
  privateMessages: number;
  storeVisits: number;
  groupPurchases: number;
  adSpend: number;
  adViews: number;
  adConversions: number;
  reviewConclusion: string;
  nextAction: string;
}

const EMPTY_VIDEO_DATA: VideoData = {
  account: "广德光英土菜馆",
  store: "广德光英土菜馆",
  videoId: "",
  title: "",
  publishDate: "",
  publishTime: "",
  duration: "",
  views: 0,
  dropOffRate2s: 0,
  retentionRate5s: 0,
  completionRate: 0,
  likes: 0,
  comments: 0,
  favorites: 0,
  shares: 0,
  newFollowers: 0,
  privateMessages: 0,
  storeVisits: 0,
  groupPurchases: 0,
  adSpend: 0,
  adViews: 0,
  adConversions: 0,
  reviewConclusion: "",
  nextAction: "",
};

// 演示数据 - 明确标注
const DEMO_DATA: VideoData[] = [
  {
    account: "演示账号",
    store: "演示门店",
    videoId: "DEMO001",
    title: "【演示数据】广德炖锅招牌菜展示",
    publishDate: "2026-08-20",
    publishTime: "18:30",
    duration: "45秒",
    views: 3200,
    dropOffRate2s: 35,
    retentionRate5s: 52,
    completionRate: 28,
    likes: 186,
    comments: 42,
    favorites: 89,
    shares: 23,
    newFollowers: 15,
    privateMessages: 8,
    storeVisits: 5,
    groupPurchases: 3,
    adSpend: 0,
    adViews: 0,
    adConversions: 0,
    reviewConclusion: "演示数据：开头钩子有效，收藏率高，可优化CTA引导私信",
    nextAction: "演示数据：优化结尾CTA，增加私信引导",
  },
  {
    account: "演示账号",
    store: "演示门店",
    videoId: "DEMO002",
    title: "【演示数据】老板娘教你挑荔浦芋头",
    publishDate: "2026-08-21",
    publishTime: "12:00",
    duration: "60秒",
    views: 5600,
    dropOffRate2s: 28,
    retentionRate5s: 61,
    completionRate: 35,
    likes: 312,
    comments: 78,
    favorites: 245,
    shares: 56,
    newFollowers: 28,
    privateMessages: 12,
    storeVisits: 8,
    groupPurchases: 5,
    adSpend: 100,
    adViews: 2100,
    adConversions: 3,
    reviewConclusion: "演示数据：科普类内容收藏率高，投流后私信转化提升",
    nextAction: "演示数据：可追加投流，定向江阴本地30-50岁人群",
  },
];

export default function DataReviewPanel({ account = "广德光英土菜馆", store = "广德光英土菜馆" }: { account?: string; store?: string }) {
  const [activeTab, setActiveTab] = useState("upload");
  const [manualData, setManualData] = useState<VideoData>(EMPTY_VIDEO_DATA);
  const [uploadedScreenshot, setUploadedScreenshot] = useState<string | null>(null);
  const [savedRecords, setSavedRecords] = useState<VideoData[]>(() => {
    try { const raw = scopedStorage.getItem("__selfmedia_data_records"); return raw ? JSON.parse(raw) : []; } catch { return []; }
  });
  useEffect(() => { try { scopedStorage.setItem("__selfmedia_data_records", JSON.stringify(savedRecords)); } catch {} }, [savedRecords]);
  useEffect(() => { setManualData(prev => ({ ...prev, account, store })); }, [account, store]);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedScreenshot(event.target?.result as string);
      toast.success("数据截图已上传，等待AI/OCR分析");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleInputChange = (field: keyof VideoData, value: string | number) => {
    setManualData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveRecord = () => {
    if (!manualData.title && !manualData.videoId) {
      toast.error("请至少填写视频ID或标题");
      return;
    }
    const newRecord = { ...manualData, account, store, videoId: manualData.videoId || `REC${Date.now()}` };
    setSavedRecords(prev => [...prev, newRecord]);
    setManualData(EMPTY_VIDEO_DATA);
    setUploadedScreenshot(null);
    toast.success("数据记录已保存");
  };

  const calculateRates = (data: VideoData) => {
    const views = data.views || 1;
    return {
      likeRate: ((data.likes / views) * 100).toFixed(1),
      commentRate: ((data.comments / views) * 100).toFixed(1),
      favoriteRate: ((data.favorites / views) * 100).toFixed(1),
      shareRate: ((data.shares / views) * 100).toFixed(1),
      followerRate: ((data.newFollowers / views) * 100).toFixed(1),
      pmRate: ((data.privateMessages / views) * 100).toFixed(2),
      storeRate: ((data.storeVisits / views) * 100).toFixed(2),
      groupRate: ((data.groupPurchases / views) * 100).toFixed(2),
    };
  };

  // 多维度投流建议（13个维度）
  const getAdSuggestion = (data: VideoData) => {
    const rates = calculateRates(data);
    const scores: { dimension: string; value: string; pass: boolean; weight: number }[] = [
      { dimension: "自然播放量", value: data.views.toLocaleString(), pass: data.views >= 3000, weight: 10 },
      { dimension: "2秒跳失率", value: `${data.dropOffRate2s}%`, pass: data.dropOffRate2s <= 40, weight: 15 },
      { dimension: "5秒留存率", value: `${data.retentionRate5s}%`, pass: data.retentionRate5s >= 50, weight: 15 },
      { dimension: "完播率", value: `${data.completionRate}%`, pass: data.completionRate >= 25, weight: 15 },
      { dimension: "点赞率", value: `${rates.likeRate}%`, pass: parseFloat(rates.likeRate) >= 3, weight: 8 },
      { dimension: "收藏率", value: `${rates.favoriteRate}%`, pass: parseFloat(rates.favoriteRate) >= 2, weight: 8 },
      { dimension: "转发率", value: `${rates.shareRate}%`, pass: parseFloat(rates.shareRate) >= 0.5, weight: 7 },
      { dimension: "涨粉率", value: `${rates.followerRate}%`, pass: parseFloat(rates.followerRate) >= 0.3, weight: 5 },
      { dimension: "私信率", value: `${rates.pmRate}%`, pass: parseFloat(rates.pmRate) >= 0.1, weight: 8 },
      { dimension: "到店转化", value: `${data.storeVisits}人`, pass: data.storeVisits >= 3, weight: 5 },
      { dimension: "团购转化", value: `${data.groupPurchases}单`, pass: data.groupPurchases >= 2, weight: 4 },
    ];

    const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
    const earnedWeight = scores.filter(s => s.pass).reduce((sum, s) => sum + s.weight, 0);
    const score = Math.round((earnedWeight / totalWeight) * 100);

    let level: string;
    let color: string;
    let reason: string;
    let suggestion: string;
    let budget: string;
    let icon: React.ReactNode;

    if (score >= 75) {
      level = "强烈建议投流";
      color = "text-green-600";
      icon = <TrendingUp className="h-5 w-5 text-green-600" />;
      reason = "综合评分高，内容质量和转化能力都达标，投流可放大效果";
      suggestion = "建议先小预算测试（100元），观察投流后私信率和到店转化，ROI为正则追加到300-500元";
      budget = "100-500元（分阶段）";
    } else if (score >= 55) {
      level = "可以考虑投流";
      color = "text-amber-600";
      icon = <BarChart3 className="h-5 w-5 text-amber-600" />;
      reason = "综合评分中等，部分维度达标，建议先优化薄弱环节再投流";
      suggestion = "建议先优化未达标的维度（如完播率或CTA），然后用50-100元小预算测试";
      budget = "50-100元（测试）";
    } else {
      level = "暂不建议投流";
      color = "text-red-600";
      icon = <TrendingDown className="h-5 w-5 text-red-600" />;
      reason = "综合评分较低，内容质量或转化能力未达投流标准，投流会浪费预算";
      suggestion = "先优化内容：重点改善2秒跳失率和5秒留存率，提升开头钩子质量，自然数据达标后再投流";
      budget = "0元（先优化内容）";
    }

    // 投流成本和实际成交分析
    const roiAnalysis = data.adSpend > 0
      ? `已投流${data.adSpend}元，带来${data.adViews}次播放和${data.adConversions}次转化，单转化成本${data.adConversions > 0 ? (data.adSpend / data.adConversions).toFixed(0) : "∞"}元`
      : "尚未投流，建议先小预算测试";

    return { level, color, reason, suggestion, budget, icon, score, scores, roiAnalysis };
  };

  const inputFields: { key: keyof VideoData; label: string; type: string; placeholder?: string }[] = [
    { key: "videoId", label: "视频ID", type: "text", placeholder: "如 V001" },
    { key: "title", label: "视频标题", type: "text", placeholder: "视频标题" },
    { key: "publishDate", label: "发布日期", type: "date" },
    { key: "publishTime", label: "发布时间", type: "time" },
    { key: "duration", label: "视频时长", type: "text", placeholder: "如 45秒" },
    { key: "views", label: "播放量", type: "number" },
    { key: "dropOffRate2s", label: "2秒跳失率(%)", type: "number" },
    { key: "retentionRate5s", label: "5秒留存率(%)", type: "number" },
    { key: "completionRate", label: "完播率(%)", type: "number" },
    { key: "likes", label: "点赞数", type: "number" },
    { key: "comments", label: "评论数", type: "number" },
    { key: "favorites", label: "收藏数", type: "number" },
    { key: "shares", label: "转发数", type: "number" },
    { key: "newFollowers", label: "涨粉数", type: "number" },
    { key: "privateMessages", label: "私信数", type: "number" },
    { key: "storeVisits", label: "到店人数", type: "number" },
    { key: "groupPurchases", label: "团购核销数", type: "number" },
    { key: "adSpend", label: "投流金额(元)", type: "number" },
    { key: "adViews", label: "投流后播放", type: "number" },
    { key: "adConversions", label: "投流后转化", type: "number" },
  ];

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload"><Upload className="h-4 w-4 mr-1" />数据录入</TabsTrigger>
          <TabsTrigger value="history"><BarChart3 className="h-4 w-4 mr-1" />历史记录</TabsTrigger>
          <TabsTrigger value="advice"><Sparkles className="h-4 w-4 mr-1" />投流建议</TabsTrigger>
        </TabsList>

        {/* 数据录入 */}
        <TabsContent value="upload" className="mt-4 space-y-4">
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-sm text-amber-800">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>工作台无内置AI/OCR能力。上传截图后请手动填写数据，或接入外部OCR API后自动识别。</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">上传数据截图 + 手动填写</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 截图上传 */}
              <div>
                <label className="text-sm font-medium mb-2 block">后台数据截图（可选）</label>
                <input
                  ref={screenshotInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleScreenshotUpload}
                />
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => screenshotInputRef.current?.click()}
                >
                  {uploadedScreenshot ? (
                    <div className="space-y-2">
                      <img src={uploadedScreenshot} alt="数据截图" className="max-h-48 mx-auto rounded" />
                      <p className="text-xs text-green-600">截图已上传，等待AI/OCR分析（需接入外部API）</p>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">点击上传数据截图</p>
                      <p className="text-xs text-muted-foreground">支持抖音创作者中心、视频号助手截图</p>
                    </>
                  )}
                </div>
              </div>

              {/* 手动填写表单 */}
              <div>
                <label className="text-sm font-medium mb-2 block">手动填写数据（22项）</label>
                <div className="grid grid-cols-2 gap-3">
                  {inputFields.map(field => (
                    <div key={field.key}>
                      <label className="text-xs text-muted-foreground mb-1 block">{field.label}</label>
                      <Input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={manualData[field.key] as string | number}
                        onChange={(e) => handleInputChange(field.key, field.type === "number" ? Number(e.target.value) : e.target.value)}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3 space-y-2">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">复盘结论</label>
                    <Textarea
                      placeholder="总结这条视频的表现，优点和不足..."
                      value={manualData.reviewConclusion}
                      onChange={(e) => handleInputChange("reviewConclusion", e.target.value)}
                      className="h-20"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">下一步动作</label>
                    <Textarea
                      placeholder="下一条视频的改进方向..."
                      value={manualData.nextAction}
                      onChange={(e) => handleInputChange("nextAction", e.target.value)}
                      className="h-20"
                    />
                  </div>
                </div>
              </div>

              <Button className="w-full" onClick={handleSaveRecord}>
                <Save className="h-4 w-4 mr-2" />保存数据记录
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 历史记录 */}
        <TabsContent value="history" className="mt-4 space-y-4">
          {/* 演示数据标注 */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-sm text-red-800">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>以下为演示数据，非真实账号数据。真实数据请在"数据录入"页手动填写。</span>
              </div>
            </CardContent>
          </Card>

          {/* 用户保存的真实记录 */}
          {savedRecords.filter(r => r.account === account && r.store === store).length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">真实记录（{savedRecords.length}条）</h4>
              {savedRecords.filter(r => r.account === account && r.store === store).map((record) => (
                <Card key={record.videoId} className="cursor-pointer hover:border-primary" onClick={() => { setSelectedVideo(record); setActiveTab("advice"); }}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-sm">{record.title || record.videoId}</div>
                        <div className="text-xs text-muted-foreground">{record.publishDate} {record.publishTime}</div>
                      </div>
                      <Badge variant="default">真实数据</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-3 text-center">
                      <div><div className="font-bold">{record.views.toLocaleString()}</div><div className="text-xs text-muted-foreground">播放</div></div>
                      <div><div className="font-bold">{record.likes}</div><div className="text-xs text-muted-foreground">点赞</div></div>
                      <div><div className="font-bold">{record.privateMessages}</div><div className="text-xs text-muted-foreground">私信</div></div>
                      <div><div className="font-bold">{record.storeVisits}</div><div className="text-xs text-muted-foreground">到店</div></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* 演示数据 */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">演示数据（{DEMO_DATA.length}条）</h4>
            {DEMO_DATA.map((record) => (
              <Card key={record.videoId} className="cursor-pointer opacity-70 hover:opacity-100" onClick={() => { setSelectedVideo(record); setActiveTab("advice"); }}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-sm">{record.title}</div>
                      <div className="text-xs text-muted-foreground">{record.publishDate} {record.publishTime}</div>
                    </div>
                    <Badge variant="destructive">演示数据</Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-3 text-center">
                    <div><div className="font-bold">{record.views.toLocaleString()}</div><div className="text-xs text-muted-foreground">播放</div></div>
                    <div><div className="font-bold">{record.likes}</div><div className="text-xs text-muted-foreground">点赞</div></div>
                    <div><div className="font-bold">{record.privateMessages}</div><div className="text-xs text-muted-foreground">私信</div></div>
                    <div><div className="font-bold">{record.storeVisits}</div><div className="text-xs text-muted-foreground">到店</div></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 投流建议 */}
        <TabsContent value="advice" className="mt-4 space-y-4">
          {selectedVideo ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    {getAdSuggestion(selectedVideo).icon}
                    <span className={getAdSuggestion(selectedVideo).color}>
                      {getAdSuggestion(selectedVideo).level}
                    </span>
                    <Badge variant="outline">综合评分 {getAdSuggestion(selectedVideo).score}/100</Badge>
                    {selectedVideo.videoId.startsWith("DEMO") && <Badge variant="destructive">演示数据</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div><span className="font-medium text-muted-foreground">判断依据：</span>{getAdSuggestion(selectedVideo).reason}</div>
                  <div><span className="font-medium text-muted-foreground">投流分析：</span>{getAdSuggestion(selectedVideo).roiAnalysis}</div>
                  <div><span className="font-medium text-muted-foreground">具体建议：</span>{getAdSuggestion(selectedVideo).suggestion}</div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-xs text-muted-foreground">建议预算</div>
                      <div className="font-bold text-lg">{getAdSuggestion(selectedVideo).budget}</div>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-xs text-muted-foreground">视频标题</div>
                      <div className="font-bold text-sm truncate">{selectedVideo.title}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 13维度评分详情 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">13维度评分详情</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getAdSuggestion(selectedVideo).scores.map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {s.pass ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />}
                          <span>{s.dimension}</span>
                          <span className="text-muted-foreground text-xs">（权重{s.weight}%）</span>
                        </div>
                        <span className={s.pass ? "text-green-600 font-medium" : "text-red-600 font-medium"}>{s.value}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>投流成本分析</span>
                      </div>
                      <span className="text-muted-foreground">{getAdSuggestion(selectedVideo).roiAnalysis.split("，")[0]}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 投流设置建议 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">投流设置建议</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">投放平台</span><span className="font-medium">抖音DOU+ / 视频号推广</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">定向地区</span><span className="font-medium">江阴市 + 周边30公里</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">定向年龄</span><span className="font-medium">30-50岁</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">定向性别</span><span className="font-medium">不限（略偏男性）</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">兴趣标签</span><span className="font-medium">美食、餐饮、本地生活、商务</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">优化目标</span><span className="font-medium">私信咨询 / 门店引流</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">投放策略</span><span className="font-medium">小预算测试→数据验证→追加投放</span></div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>请先在"数据录入"填写数据并保存，或在"历史记录"中选择一条视频</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
