import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Plus, Trash2, Edit2, Check, X, Copy, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import type { SelfMediaStore } from "@/hooks/useSelfMediaStore";
import { uid } from "@/hooks/useSelfMediaStore";
import type { PublishRecord, PublishStatus, Platform, ContentType } from "@/data/selfmedia3-types";
import { EmptyState } from "./shared";

const STATUSES: PublishStatus[] = ["待发布", "已发布", "已删除", "复用中"];
const PLATFORMS: Platform[] = ["抖音", "视频号", "小红书"];
const CONTENT_TYPES: ContentType[] = ["老板娘口播", "菜品制作", "后厨实拍", "日常vlog", "食材科普", "门店展示", "故事讲述", "团购推荐", "图文笔记"];

interface Props { store: SelfMediaStore; onNavigate?: (tab: string) => void; }
export default function PublishPanel({ store, onNavigate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<PublishRecord>>({});

  const filtered = store.publishes.filter(
    (p) => p.accountId === store.currentAccount && p.storeId === store.currentStore,
  );

  const startNew = () => {
    const p = store.addPublish({
      videoId: uid("vid"),
      title: "", platform: "抖音", publishDate: new Date().toISOString().slice(0, 10),
      publishTime: "18:00", videoType: "老板娘口播", duration: "", copywriting: "",
      hashtags: [], cta: "", status: "待发布", createdAt: Date.now(),
    });
    setEditingId(p.id);
    setDraft(p);
  };

  const startEdit = (p: PublishRecord) => { setEditingId(p.id); setDraft({ ...p }); };

  const save = () => {
    if (!editingId) return;
    store.updatePublish(editingId, draft);
    setEditingId(null);
    toast.success("已保存");
  };

  const copyCopywriting = (p: PublishRecord) => {
    const text = `${p.title}\n\n${p.copywriting}\n\n${p.hashtags.map((h) => `#${h}`).join(" ")}\n\n${p.cta}`;
    navigator.clipboard.writeText(text);
    toast.success("文案已复制");
  };

  // 发布→数据闭环：自动创建或进入对应VideoAnalytics
  const handleEnterData = (p: PublishRecord) => {
    if (!p.videoId) {
      const newVideoId = uid("vid");
      store.updatePublish(p.id, { videoId: newVideoId });
      p = { ...p, videoId: newVideoId };
    }
    // 查找是否已有对应analytics
    const existing = store.analytics.find(
      (a) => a.videoId === p.videoId && a.accountId === store.currentAccount && a.storeId === store.currentStore,
    );
    if (!existing) {
      store.addAnalytics({
        publishId: p.id,
        videoId: p.videoId!,
        title: p.title,
        publishTime: p.publishDate,
        views: 0, dropOff2s: 0, retention5s: 0, completionRate: 0,
        likes: 0, comments: 0, favorites: 0, shares: 0,
        newFollowers: 0, privateMessages: 0, storeVisits: 0, groupPurchases: 0,
        adSpend: 0, adViews: 0, adConversions: 0,
        recordedAt: Date.now(),
      });
      toast.success("已创建数据记录，请录入数据");
    } else {
      toast.success("已有数据记录，直接进入");
    }
    onNavigate?.("analytics");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-1.5"><Send className="size-4" />发布管理（{filtered.length}）</h3>
        <Button size="sm" onClick={startNew}><Plus className="size-3.5 mr-1" />新增发布</Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="暂无发布记录" desc="点击新增发布，记录发布计划和文案" />
      ) : (
        filtered.map((p) => (
          <Card key={p.id}>
            {editingId === p.id ? (
              <CardContent className="p-3 space-y-2">
                <Input value={draft.title || ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="视频标题" />
                <div className="grid grid-cols-3 gap-2">
                  <select value={draft.platform} onChange={(e) => setDraft({ ...draft, platform: e.target.value as Platform })}
                    className="h-9 px-2 rounded-md border border-input bg-background text-sm">
                    {PLATFORMS.map((pl) => <option key={pl}>{pl}</option>)}
                  </select>
                  <Input type="date" value={draft.publishDate || ""} onChange={(e) => setDraft({ ...draft, publishDate: e.target.value })} />
                  <Input type="time" value={draft.publishTime || ""} onChange={(e) => setDraft({ ...draft, publishTime: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select value={draft.videoType} onChange={(e) => setDraft({ ...draft, videoType: e.target.value as ContentType })}
                    className="h-9 px-2 rounded-md border border-input bg-background text-sm">
                    {CONTENT_TYPES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <Input value={draft.duration || ""} onChange={(e) => setDraft({ ...draft, duration: e.target.value })} placeholder="时长" />
                </div>
                <Textarea value={draft.copywriting || ""} onChange={(e) => setDraft({ ...draft, copywriting: e.target.value })} placeholder="发布文案" rows={3} />
                <Input value={(draft.hashtags || []).join(",")} onChange={(e) => setDraft({ ...draft, hashtags: e.target.value.split(/[,，\s]+/).filter(Boolean) })} placeholder="话题（逗号分隔）" />
                <Input value={draft.cta || ""} onChange={(e) => setDraft({ ...draft, cta: e.target.value })} placeholder="CTA行动号召" />
                <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as PublishStatus })}
                  className="h-9 px-2 rounded-md border border-input bg-background text-sm">
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <div className="flex gap-2">
                  <Button size="sm" onClick={save}><Check className="size-3.5 mr-1" />保存</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><X className="size-3.5 mr-1" />取消</Button>
                </div>
              </CardContent>
            ) : (
              <CardContent className="p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm font-semibold">{p.title || "未命名"}</h4>
                      <Badge variant="outline" className="text-[10px]">{p.platform}</Badge>
                      <Badge variant={p.status === "已发布" ? "default" : "secondary"} className="text-[10px]">{p.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.publishDate} {p.publishTime} · {p.videoType}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyCopywriting(p)}><Copy className="size-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(p)}><Edit2 className="size-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => { store.removePublish(p.id); toast.success("已删除"); }}><Trash2 className="size-3.5" /></Button>
                  </div>
                </div>
                {p.copywriting && <p className="text-xs text-foreground/80 line-clamp-2">{p.copywriting}</p>}
                {p.hashtags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {p.hashtags.map((h, i) => <Badge key={i} variant="secondary" className="text-[10px]">#{h}</Badge>)}
                  </div>
                )}
                <div className="flex gap-1.5 flex-wrap">
                  {STATUSES.map((s) => (
                    <Button key={s} size="sm" variant={p.status === s ? "default" : "outline"} className="h-6 text-[10px] px-2"
                      onClick={() => store.updatePublish(p.id, { status: s })}>{s}</Button>
                  ))}
                </div>
                {p.status === "已发布" && (
                  <Button size="sm" className="w-full h-8 text-xs" onClick={() => handleEnterData(p)}>
                    <BarChart3 className="size-3.5 mr-1" />录入数据
                  </Button>
                )}
              </CardContent>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
