import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Target, Plus, Trash2, Edit2, Check, X, AlertCircle, Award,
} from "lucide-react";
import { toast } from "sonner";
import type { SelfMediaStore } from "@/hooks/useSelfMediaStore";
import type { Review } from "@/data/selfmedia3-types";
import { AIDisconnectedBanner, EmptyState, CopyPromptButton } from "./shared";
import { buildReviewPrompt } from "./aiPrompts";

interface Props { store: SelfMediaStore; }

const EMPTY: Omit<Review, "id" | "accountId" | "storeId" | "createdAt" | "isManual"> = {
  analyticsId: "", videoId: "", openingProblem: "", retentionProblem: "", topicProblem: "",
  contentProblem: "", personProblem: "", conversionProblem: "",
  biggestProblem: "", evidence: "", mustChange: "", keepUnchanged: "", isHighPerforming: false,
};

export default function ReviewPanel({ store }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Review>>({});

  const filtered = store.reviews.filter(
    (r) => r.accountId === store.currentAccount && r.storeId === store.currentStore,
  );

  const startNew = () => {
    const r = store.addReview({ ...EMPTY, createdAt: Date.now(), isManual: true });
    setEditingId(r.id);
    setDraft(r);
  };

  const startEdit = (r: Review) => { setEditingId(r.id); setDraft({ ...r }); };

  const save = () => {
    if (!editingId) return;
    if (!draft.biggestProblem?.trim()) { toast.error("请填写最大问题"); return; }
    store.updateReview(editingId, draft);
    setEditingId(null);
    toast.success("复盘已保存");
  };

  // 复盘→模板闭环：自动带入videoId/主题/Hook/镜头结构/CTA/真实数据/成功原因
  const handleSaveTemplate = (r: Review) => {
    const analytics = store.analytics.find((a) => a.id === r.analyticsId);
    // 查找关联脚本（通过videoId或sourceTopicId链）
    const linkedScript = store.scripts.find((s) => {
      if (s.sourceTopicId) {
        const topic = store.topics.find((t) => t.id === s.sourceTopicId);
        return topic && analytics && topic.title === (analytics.title || "");
      }
      return false;
    }) || store.scripts.find((s) => s.accountId === store.currentAccount && s.storeId === store.currentStore);

    const realData = analytics
      ? `播放${analytics.views} · 点赞${analytics.likes} · 评论${analytics.comments} · 收藏${analytics.favorites} · 转发${analytics.shares} · 涨粉${analytics.newFollowers} · 私信${analytics.privateMessages} · 到店${analytics.storeVisits} · 团购${analytics.groupPurchases}`
      : "数据未关联";

    store.addTemplate({
      sourceVideoId: r.videoId || "",
      sourceReviewId: r.id,
      theme: analytics?.title || linkedScript?.title || "未命名主题",
      contentType: linkedScript?.contentType || "老板娘口播",
      hookStructure: linkedScript?.shots[0]?.dialogue || "",
      shotStructure: linkedScript ? `${linkedScript.shots.length}个镜头：${linkedScript.shots.map((s) => s.visual || s.dialogue.slice(0, 10)).filter(Boolean).join(" → ")}` : "",
      person: linkedScript?.person || "老板娘",
      duration: linkedScript?.estimatedDuration || "",
      cta: linkedScript?.goal || "",
      realData,
      successReason: r.keepUnchanged ? `有效部分：${r.keepUnchanged}` : "",
      createdAt: Date.now(),
    });
    toast.success("已保存为成功模板，选题引擎将自动参考");
  };

  // 构建复盘AI提示词
  const getReviewPrompt = (r: Review) => {
    const analytics = store.analytics.find((a) => a.id === r.analyticsId);
    const dataStr = analytics
      ? `标题：${analytics.title || "—"}\n播放：${analytics.views}\n2秒跳失：${analytics.dropOff2s}%\n5秒留存：${analytics.retention5s}%\n完播：${analytics.completionRate}%\n点赞：${analytics.likes}\n评论：${analytics.comments}\n收藏：${analytics.favorites}\n转发：${analytics.shares}\n涨粉：${analytics.newFollowers}\n私信：${analytics.privateMessages}\n到店：${analytics.storeVisits}\n团购：${analytics.groupPurchases}\n投流金额：${analytics.adSpend}\n投流转化：${analytics.adConversions}`
      : "数据未关联，请先录入数据";
    return buildReviewPrompt(store, dataStr);
  };

  return (
    <div className="space-y-4">
      <AIDisconnectedBanner feature="AI复盘" />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-1.5"><Target className="size-4" />AI复盘（{filtered.length}）</h3>
        <Button size="sm" onClick={startNew}><Plus className="size-3.5 mr-1" />手动复盘</Button>
      </div>

      <Card className="border-amber-200 bg-amber-50/40">
        <CardContent className="p-2.5 text-xs text-amber-800 space-y-1">
          <p className="font-medium flex items-center gap-1"><AlertCircle className="size-3" />复盘纪律</p>
          <p>禁止写"表现很好""继续努力""内容不错"等无行动价值的结论。必须写出：最大问题 + 证据 + 下一条必须改什么 + 不要改什么。</p>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState title="暂无复盘" desc="基于真实数据手动填写复盘，或复制到外部AI生成后粘贴" action={<Button size="sm" onClick={startNew}>开始复盘</Button>} />
      ) : (
        filtered.map((r) => (
          <Card key={r.id}>
            {editingId === r.id ? (
              <CardContent className="p-3 space-y-2">
                <Input value={draft.analyticsId || ""} onChange={(e) => setDraft({ ...draft, analyticsId: e.target.value })} placeholder="关联数据记录ID" />
                <div>
                  <label className="text-xs text-muted-foreground">最大问题 *</label>
                  <Textarea value={draft.biggestProblem || ""} onChange={(e) => setDraft({ ...draft, biggestProblem: e.target.value })} placeholder="这条视频最大的问题是什么？" rows={2} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">证据（用数据说话）</label>
                  <Textarea value={draft.evidence || ""} onChange={(e) => setDraft({ ...draft, evidence: e.target.value })} placeholder="如：2秒跳失65%，说明开头没抓住人" rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">开头问题</label>
                    <Textarea value={draft.openingProblem || ""} onChange={(e) => setDraft({ ...draft, openingProblem: e.target.value })} rows={2} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">留存问题</label>
                    <Textarea value={draft.retentionProblem || ""} onChange={(e) => setDraft({ ...draft, retentionProblem: e.target.value })} rows={2} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">选题问题</label>
                    <Textarea value={draft.topicProblem || ""} onChange={(e) => setDraft({ ...draft, topicProblem: e.target.value })} rows={2} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">内容问题</label>
                    <Textarea value={draft.contentProblem || ""} onChange={(e) => setDraft({ ...draft, contentProblem: e.target.value })} rows={2} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">人物问题</label>
                    <Textarea value={draft.personProblem || ""} onChange={(e) => setDraft({ ...draft, personProblem: e.target.value })} rows={2} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">转化问题</label>
                    <Textarea value={draft.conversionProblem || ""} onChange={(e) => setDraft({ ...draft, conversionProblem: e.target.value })} rows={2} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">下一条必须改变什么 *</label>
                  <Textarea value={draft.mustChange || ""} onChange={(e) => setDraft({ ...draft, mustChange: e.target.value })} placeholder="具体可执行的改动" rows={2} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">下一条不需要改变什么</label>
                  <Textarea value={draft.keepUnchanged || ""} onChange={(e) => setDraft({ ...draft, keepUnchanged: e.target.value })} placeholder="保留有效的部分" rows={2} />
                </div>
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={draft.isHighPerforming || false} onChange={(e) => setDraft({ ...draft, isHighPerforming: e.target.checked })} />
                  标记为高表现视频（可保存为成功模板）
                </label>
                <div className="flex gap-2">
                  <Button size="sm" onClick={save}><Check className="size-3.5 mr-1" />保存</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><X className="size-3.5 mr-1" />取消</Button>
                </div>
              </CardContent>
            ) : (
              <CardContent className="p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px]">手动复盘</Badge>
                      {r.analyticsId && <Badge variant="secondary" className="text-[10px]">关联数据</Badge>}
                      {r.isHighPerforming && <Badge className="text-[10px] bg-green-100 text-green-700"><Award className="size-2.5 mr-0.5" />高表现</Badge>}
                    </div>
                    <p className="text-sm font-semibold mt-1.5">{r.biggestProblem}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(r)}><Edit2 className="size-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => { store.removeReview(r.id); toast.success("已删除"); }}><Trash2 className="size-3.5" /></Button>
                  </div>
                </div>
                {r.evidence && <p className="text-xs text-muted-foreground">证据：{r.evidence}</p>}
                {r.mustChange && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-2">
                    <p className="text-xs font-medium text-red-700">必须改：{r.mustChange}</p>
                  </div>
                )}
                {r.keepUnchanged && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-2">
                    <p className="text-xs font-medium text-green-700">不要改：{r.keepUnchanged}</p>
                  </div>
                )}
                <div className="flex gap-2 flex-wrap pt-1">
                  <CopyPromptButton prompt={getReviewPrompt(r)} label="复制复盘AI提示词" />
                  {r.isHighPerforming && (
                    <Button size="sm" className="h-8 text-xs" onClick={() => handleSaveTemplate(r)}>
                      <Award className="size-3.5 mr-1" />保存为成功模板
                    </Button>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
