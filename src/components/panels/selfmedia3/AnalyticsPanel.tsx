import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart3, Plus, Trash2, Edit2, X, Save, ClipboardCheck,
} from "lucide-react";
import { toast } from "sonner";
import type { SelfMediaStore } from "@/hooks/useSelfMediaStore";
import type { VideoAnalytics } from "@/data/selfmedia3-types";
import { computeMetrics } from "@/data/selfmedia3-types";
import { QuickNumberInput, EmptyState } from "./shared";

interface Props { store: SelfMediaStore; onNavigate?: (tab: string) => void; }

const EMPTY: Omit<VideoAnalytics, "id" | "accountId" | "storeId" | "recordedAt"> = {
  publishId: "", videoId: "", title: "", publishTime: new Date().toISOString().slice(0, 10),
  views: 0, dropOff2s: 0, retention5s: 0, completionRate: 0,
  likes: 0, comments: 0, favorites: 0, shares: 0, newFollowers: 0,
  privateMessages: 0, storeVisits: 0, groupPurchases: 0,
  adSpend: 0, adViews: 0, adConversions: 0,
};

const pct = (v: number) => `${v.toFixed(2)}%`;

export default function AnalyticsPanel({ store, onNavigate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<VideoAnalytics>>({});

  const filtered = store.analytics.filter(
    (a) => a.accountId === store.currentAccount && a.storeId === store.currentStore,
  );

  const startNew = () => {
    const a = store.addAnalytics({ ...EMPTY, recordedAt: Date.now() });
    setEditingId(a.id);
    setDraft(a);
  };

  const startEdit = (a: VideoAnalytics) => { setEditingId(a.id); setDraft({ ...a }); };

  const save = () => {
    if (!editingId) return;
    store.updateAnalytics(editingId, draft);
    setEditingId(null);
    toast.success("数据已保存");
  };

  // 数据→复盘闭环：自动创建或进入对应Review
  const handleStartReview = (a: VideoAnalytics) => {
    const existing = store.reviews.find(
      (r) => r.analyticsId === a.id && r.accountId === store.currentAccount && r.storeId === store.currentStore,
    );
    if (existing) {
      toast.success("已有复盘记录，直接进入");
    } else {
      store.addReview({
        videoId: a.videoId || "",
        analyticsId: a.id,
        openingProblem: "", retentionProblem: "", topicProblem: "",
        contentProblem: "", personProblem: "", conversionProblem: "",
        biggestProblem: "", evidence: "", mustChange: "", keepUnchanged: "",
        isHighPerforming: false, isManual: true, createdAt: Date.now(),
      });
      toast.success("已创建复盘记录");
    }
    onNavigate?.("review");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-1.5"><BarChart3 className="size-4" />数据诊断（{filtered.length}）</h3>
        <Button size="sm" onClick={startNew}><Plus className="size-3.5 mr-1" />录入数据</Button>
      </div>

      <Card className="border-blue-200 bg-blue-50/40">
        <CardContent className="p-2.5 text-xs text-blue-700 space-y-1">
          <p>所有数据手动录入，无自动抓取。公式透明：</p>
          <p>点赞率=点赞/播放 · 完播率手动填写 · 投流ROI=投流转化/投流金额</p>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState title="暂无数据" desc="点击录入数据，记录每条视频的真实表现" action={<Button size="sm" onClick={startNew}>录入第一条</Button>} />
      ) : (
        filtered.map((a) => {
          const m = computeMetrics(a);
          return (
            <Card key={a.id}>
              {editingId === a.id ? (
                <CardContent className="p-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="date" value={draft.publishTime || ""} onChange={(e) => setDraft({ ...draft, publishTime: e.target.value })} />
                    <Input value={draft.publishId || ""} onChange={(e) => setDraft({ ...draft, publishId: e.target.value })} placeholder="关联发布记录ID" />
                  </div>
                  <Input value={draft.title || ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="视频标题" />
                  <div className="grid grid-cols-2 gap-2">
                    <QuickNumberInput label="播放量" value={draft.views || 0} onChange={(v) => setDraft({ ...draft, views: v })} />
                    <QuickNumberInput label="点赞" value={draft.likes || 0} onChange={(v) => setDraft({ ...draft, likes: v })} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <QuickNumberInput label="评论" value={draft.comments || 0} onChange={(v) => setDraft({ ...draft, comments: v })} />
                    <QuickNumberInput label="收藏" value={draft.favorites || 0} onChange={(v) => setDraft({ ...draft, favorites: v })} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <QuickNumberInput label="转发" value={draft.shares || 0} onChange={(v) => setDraft({ ...draft, shares: v })} />
                    <QuickNumberInput label="涨粉" value={draft.newFollowers || 0} onChange={(v) => setDraft({ ...draft, newFollowers: v })} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <QuickNumberInput label="私信" value={draft.privateMessages || 0} onChange={(v) => setDraft({ ...draft, privateMessages: v })} />
                    <QuickNumberInput label="到店" value={draft.storeVisits || 0} onChange={(v) => setDraft({ ...draft, storeVisits: v })} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <QuickNumberInput label="团购" value={draft.groupPurchases || 0} onChange={(v) => setDraft({ ...draft, groupPurchases: v })} />
                    <QuickNumberInput label="2秒跳失%" value={draft.dropOff2s || 0} onChange={(v) => setDraft({ ...draft, dropOff2s: v })} suffix="%" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <QuickNumberInput label="5秒留存%" value={draft.retention5s || 0} onChange={(v) => setDraft({ ...draft, retention5s: v })} suffix="%" />
                    <QuickNumberInput label="完播率%" value={draft.completionRate || 0} onChange={(v) => setDraft({ ...draft, completionRate: v })} suffix="%" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <QuickNumberInput label="投流金额" value={draft.adSpend || 0} onChange={(v) => setDraft({ ...draft, adSpend: v })} />
                    <QuickNumberInput label="投流播放" value={draft.adViews || 0} onChange={(v) => setDraft({ ...draft, adViews: v })} />
                    <QuickNumberInput label="投流转化" value={draft.adConversions || 0} onChange={(v) => setDraft({ ...draft, adConversions: v })} />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={save}><Save className="size-3.5 mr-1" />保存</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><X className="size-3.5 mr-1" />取消</Button>
                  </div>
                </CardContent>
              ) : (
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold">{a.title || a.publishTime} · 播放 {a.views.toLocaleString()}</p>
                      <div className="flex gap-1 flex-wrap mt-1">
                        <Badge variant="secondary" className="text-[10px]">点赞率 {pct(m.likeRate)}</Badge>
                        <Badge variant="secondary" className="text-[10px]">完播 {pct(a.completionRate)}</Badge>
                        <Badge variant="secondary" className="text-[10px]">涨粉 {m.followerRate.toFixed(2)}%</Badge>
                        {a.adSpend > 0 && <Badge className="text-[10px]">ROI {m.adROI.toFixed(2)}</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(a)}><Edit2 className="size-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => { store.removeAnalytics(a.id); toast.success("已删除"); }}><Trash2 className="size-3.5" /></Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-center">
                    <div><p className="text-sm font-bold tabular-nums">{a.likes}</p><p className="text-[10px] text-muted-foreground">点赞</p></div>
                    <div><p className="text-sm font-bold tabular-nums">{a.comments}</p><p className="text-[10px] text-muted-foreground">评论</p></div>
                    <div><p className="text-sm font-bold tabular-nums">{a.favorites}</p><p className="text-[10px] text-muted-foreground">收藏</p></div>
                    <div><p className="text-sm font-bold tabular-nums">{a.shares}</p><p className="text-[10px] text-muted-foreground">转发</p></div>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-center">
                    <div><p className="text-sm font-bold tabular-nums">{a.newFollowers}</p><p className="text-[10px] text-muted-foreground">涨粉</p></div>
                    <div><p className="text-sm font-bold tabular-nums">{a.privateMessages}</p><p className="text-[10px] text-muted-foreground">私信</p></div>
                    <div><p className="text-sm font-bold tabular-nums">{a.storeVisits}</p><p className="text-[10px] text-muted-foreground">到店</p></div>
                    <div><p className="text-sm font-bold tabular-nums">{a.groupPurchases}</p><p className="text-[10px] text-muted-foreground">团购</p></div>
                  </div>
                  {(a.dropOff2s > 0 || a.retention5s > 0) && (
                    <div className="text-[11px] text-muted-foreground">
                      2秒跳失 {pct(a.dropOff2s)} · 5秒留存 {pct(a.retention5s)} · 完播 {pct(a.completionRate)}
                    </div>
                  )}
                  <Button size="sm" className="w-full h-8 text-xs" onClick={() => handleStartReview(a)}>
                    <ClipboardCheck className="size-3.5 mr-1" />开始复盘
                  </Button>
                </CardContent>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}
