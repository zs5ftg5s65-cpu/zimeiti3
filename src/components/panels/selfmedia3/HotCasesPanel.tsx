import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Flame, Plus, Trash2, Edit2, Check, X, ExternalLink, Search,
} from "lucide-react";
import { toast } from "sonner";
import type { SelfMediaStore } from "@/hooks/useSelfMediaStore";
import type { HotCase } from "@/data/selfmedia3-types";
import { EmptyState, ShootingRestrictionBadge } from "./shared";
import { fetchHotCandidates, buildHotAnalysisPrompt, normalizeHotAnalysis } from "@/lib/hotService";
import { callAI, extractJSON } from "@/lib/aiService";
import { loadAIConfig } from "@/lib/aiConfig";
import { THIRTY_DAY_PLAN } from "@/data/selfmedia-daily";
import { scopedStorage } from "@/lib/storage";
import type { ContentType } from "@/data/selfmedia3-types";

interface Props { store: SelfMediaStore; currentDay?: number; }

const EMPTY: Omit<HotCase, "id" | "accountId" | "storeId"> = {
  platform: "", account: "", title: "", url: "", publishTime: "",
  collectedAt: new Date().toISOString().slice(0, 10), data: "", verified: false, remark: "",
};

export default function HotCasesPanel({ store, currentDay = 1 }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<HotCase>>({});
  const [search, setSearch] = useState("");
  const [collecting, setCollecting] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const todayPlan = useMemo(() => THIRTY_DAY_PLAN.find((d) => d.day === currentDay), [currentDay]);
  const autoCollectionStarted = useRef(false);
  const filtered = store.hotCases.filter(
    (h) => search === "" || h.title.includes(search) || h.account.includes(search),
  );


  const collectYesterday = async () => {
    if (collecting) return;
    setCollecting(true);
    try {
      const keywords = ["餐饮老板娘", "实体店老板", "餐饮经营", "本地生活", "土菜馆", "餐饮创业", store.currentAccount === "bosslady" ? "老板娘IP" : "餐饮门店"];
      const result = await fetchHotCandidates(keywords);
      const existing = new Set(store.hotCases.map((h) => h.url).filter(Boolean));
      let added = 0;
      for (const item of result.items) {
        if (existing.has(item.url)) continue;
        store.addHotCase({ ...item, remark: item.remark || "联网搜索候选；热度需回原平台核验。" });
        existing.add(item.url);
        added++;
      }
      toast.success(`已获取${result.items.length}条联网候选，新增${added}条（昨日：${result.date}）`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "联网采集失败");
    } finally { setCollecting(false); }
  };

  useEffect(() => {
    if (autoCollectionStarted.current) return;
    autoCollectionStarted.current = true;
    const today = new Date().toISOString().slice(0, 10);
    const key = "__sm3_hot_last_auto_collect";
    const last = scopedStorage.getItem(key);
    if (last === today) return;
    // 每个自然日首次进入热门案例页时自动尝试采集；失败不写入日期，方便稍后重试。
    void (async () => {
      try {
        const keywords = ["餐饮老板娘", "实体店老板", "餐饮经营", "本地生活", "土菜馆", "餐饮创业", store.currentAccount === "bosslady" ? "老板娘IP" : "餐饮门店"];
        const result = await fetchHotCandidates(keywords);
        const existing = new Set(store.hotCases.map((h) => h.url).filter(Boolean));
        let added = 0;
        for (const item of result.items) {
          if (existing.has(item.url)) continue;
          store.addHotCase({ ...item, remark: item.remark || "联网搜索候选；热度需回原平台核验。" });
          existing.add(item.url);
          added++;
        }
        scopedStorage.setItem(key, today);
        if (added > 0) toast.success(`今日热门自动采集完成：新增${added}条`);
      } catch {
        // 自动采集失败不打扰用户；页面按钮可手动重试。
      }
    })();
  }, [store.currentAccount, store.currentStore, store.hotCases, store]);

  const analyzeHot = async (h: HotCase) => {
    if (analyzingId) return;
    setAnalyzingId(h.id);
    store.updateHotCase(h.id, { analysisStatus: "分析中" });
    try {
      const task = todayPlan ? `Day${currentDay}｜${todayPlan.dailyTheme}｜目标：${todayPlan.dailyGoal}｜选题方向：${todayPlan.topic}｜拍摄：${todayPlan.shootingTask}` : `Day${currentDay}`;
      const chars = store.getVisibleCharacters().map((c) => `${c.name}｜${c.personality}｜${c.speakingStyle}`).join("\n");
      const prompt = buildHotAnalysisPrompt(h, task, chars || "暂无人物资料");
      const result = await callAI(prompt, loadAIConfig());
      const analysis = normalizeHotAnalysis(extractJSON<Record<string, unknown>>(result.content));
      store.updateHotCase(h.id, { analysisStatus: "已分析", analysis, remark: h.remark || "" });
      toast.success("AI热门案例拆解完成");
    } catch (error) {
      store.updateHotCase(h.id, { analysisStatus: "分析失败" });
      toast.error(error instanceof Error ? error.message : "AI拆解失败");
    } finally { setAnalyzingId(null); }
  };

  const generateFromHot = async (h: HotCase) => {
    if (!h.analysis || generatingId) return;
    setGeneratingId(h.id);
    try {
      const topicResult = await callAI(`请把下面热门案例的可迁移结构改造成我的原创餐饮老板娘账号Day${currentDay}选题。不得照抄标题和台词，不得编造事实。\n\n案例：${h.title}\n平台：${h.platform}\nAI拆解：${JSON.stringify(h.analysis)}\n今日任务：${todayPlan?.dailyTheme || ""}｜${todayPlan?.dailyGoal || ""}\n请只返回JSON：{"title":"","riskLevel":"测试型","targetUser":"","painPoint":"","contentType":"老板娘口播","coreOpinion":"","recommendedStore":"","recommendedPerson":"老板娘","recommendedDish":"","hook":"","structure":"","cta":"","reason":"","risk":"","factsToConfirm":"","involvesCustomer":false,"estimatedDuration":"45秒","shootingDifficulty":"中等"}`, loadAIConfig());
      const t = extractJSON<Record<string, unknown>>(topicResult.content);
      const topic = store.addTopic({
        day: currentDay, title: String(t.title || `Day${currentDay}热门案例改造`), riskLevel: (t.riskLevel || "测试型") as "稳妥型" | "测试型" | "突破型",
        targetUser: String(t.targetUser || ""), painPoint: String(t.painPoint || ""), contentType: (t.contentType || "老板娘口播") as ContentType, coreOpinion: String(t.coreOpinion || ""),
        recommendedStore: String(t.recommendedStore || ""), recommendedPerson: String(t.recommendedPerson || "老板娘"), recommendedDish: String(t.recommendedDish || ""), hook: String(t.hook || ""), structure: String(t.structure || ""),
        cta: String(t.cta || ""), reason: `参考${h.platform}案例《${h.title}》，经AI拆解后原创改造`, risk: String(t.risk || ""), factsToConfirm: String(t.factsToConfirm || ""),
        involvesCustomer: Boolean(t.involvesCustomer), estimatedDuration: String(t.estimatedDuration || "45秒"), shootingDifficulty: (t.shootingDifficulty || "中等") as "简单" | "中等" | "较难", status: "待采用", createdAt: Date.now(),
      });
      const script = store.createScriptFromTopic(topic.id, currentDay);
      store.updateHotCase(h.id, { generatedTopicId: topic.id, generatedScriptId: script?.id });
      toast.success(script ? "已生成Day专属原创选题+完整脚本" : "已生成Day专属原创选题");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "原创内容生成失败");
    } finally { setGeneratingId(null); }
  };

  const startNew = () => {
    const h = store.addHotCase({ ...EMPTY });
    setEditingId(h.id);
    setDraft(h);
  };
  const startEdit = (h: HotCase) => { setEditingId(h.id); setDraft({ ...h }); };
  const save = () => {
    if (!editingId) return;
    if (!draft.title?.trim()) { toast.error("请填写标题"); return; }
    store.updateHotCase(editingId, draft);
    setEditingId(null);
    toast.success("案例已保存");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-1.5"><Flame className="size-4" />热门案例库（{store.hotCases.length}）</h3>
        <div className="flex gap-1.5">
          <Button size="sm" variant="secondary" onClick={collectYesterday} disabled={collecting}><Flame className="size-3.5 mr-1" />{collecting ? "联网采集中…" : "获取昨日热门"}</Button>
          <Button size="sm" onClick={startNew}><Plus className="size-3.5 mr-1" />添加案例</Button>
        </div>
      </div>

      <Card className="border-amber-200 bg-amber-50/40">
        <CardContent className="p-2.5 text-xs text-amber-800 space-y-1">
          <p className="font-medium">联网候选 + 手动案例 · 热度待核验</p>
          <p>点击“获取昨日热门”会联网搜索抖音、小红书、视频号相关公开页面。搜索结果不是官方热榜；没有真实平台热度数据时，系统不会虚构播放/点赞。</p>
        </CardContent>
      </Card>

      <div className="relative">
        <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索案例..." className="pl-8 h-9" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="暂无案例" desc="手动添加你看到的爆款案例，标注来源链接和数据" action={<Button size="sm" onClick={startNew}>添加案例</Button>} />
      ) : (
        filtered.map((h) => (
          <Card key={h.id}>
            {editingId === h.id ? (
              <CardContent className="p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input value={draft.platform || ""} onChange={(e) => setDraft({ ...draft, platform: e.target.value })} placeholder="平台（抖音/视频号/小红书）" />
                  <Input value={draft.account || ""} onChange={(e) => setDraft({ ...draft, account: e.target.value })} placeholder="账号" />
                </div>
                <Input value={draft.title || ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="标题 *" />
                <Input value={draft.url || ""} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="原链接" />
                <div className="grid grid-cols-2 gap-2">
                  <Input type="date" value={draft.publishTime || ""} onChange={(e) => setDraft({ ...draft, publishTime: e.target.value })} placeholder="发布时间" />
                  <Input type="date" value={draft.collectedAt || ""} onChange={(e) => setDraft({ ...draft, collectedAt: e.target.value })} placeholder="采集日期" />
                </div>
                <Textarea value={draft.data || ""} onChange={(e) => setDraft({ ...draft, data: e.target.value })} placeholder="数据（播放/点赞/评论等）" rows={2} />
                <Textarea value={draft.remark || ""} onChange={(e) => setDraft({ ...draft, remark: e.target.value })} placeholder="备注/拆解分析" rows={2} />
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={draft.verified || false} onChange={(e) => setDraft({ ...draft, verified: e.target.checked })} />
                  已核验（数据真实可信）
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
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">{h.platform || "未知平台"}</Badge>
                      {h.verified ? (
                        <Badge className="text-[10px] bg-green-100 text-green-700">已核验</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-600">待核验</Badge>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold mt-1.5">{h.title}</h4>
                    <p className="text-xs text-muted-foreground">@{h.account || "未知"} · {h.publishTime}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {h.url && (
                      <a href={h.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-7 w-7 rounded hover:bg-muted">
                        <ExternalLink className="size-3.5" />
                      </a>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(h)}><Edit2 className="size-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => { store.removeHotCase(h.id); toast.success("已删除"); }}><Trash2 className="size-3.5" /></Button>
                  </div>
                </div>
                {h.data && <p className="text-xs text-muted-foreground">数据：{h.data}</p>}
                {h.remark && <p className="text-xs text-foreground/80">{h.remark}</p>}
                <div className="flex gap-1.5 flex-wrap pt-1">
                  <Button size="sm" variant="outline" onClick={() => analyzeHot(h)} disabled={analyzingId === h.id}>{analyzingId === h.id ? "AI拆解中…" : h.analysisStatus === "已分析" ? "重新AI拆解" : "AI完整拆解"}</Button>
                  {h.analysis && <Button size="sm" onClick={() => generateFromHot(h)} disabled={generatingId === h.id}>{generatingId === h.id ? "生成中…" : "改造成我的Day专属脚本"}</Button>}
                  <ShootingRestrictionBadge />
                </div>
                {h.analysis && (
                  <div className="rounded-md bg-muted/40 p-2.5 text-xs space-y-1.5">
                    <p><b>为什么值得参考：</b>{h.analysis.summary}</p>
                    <p><b>Hook：</b>{h.analysis.hook}</p>
                    <p><b>结构：</b>{h.analysis.structure}</p>
                    <p><b>可迁移：</b>{h.analysis.copyPoints}</p>
                    <p><b>不能照抄：</b>{h.analysis.avoidPoints}</p>
                    <p><b>Day{currentDay}改造：</b>{h.analysis.adaptation}</p>
                    <p><b>与今日任务：</b>{h.analysis.fitToTodayTask}</p>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground/60">采集于 {h.collectedAt}{h.sourceType === "web_search" ? " · 联网搜索候选" : ""}</p>
              </CardContent>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
