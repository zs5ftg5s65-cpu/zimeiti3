import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles, Shield, FlaskConical, Rocket, Plus, Trash2, Copy, Check, FileText, Wand2,
} from "lucide-react";
import { toast } from "sonner";
import type { SelfMediaStore } from "@/hooks/useSelfMediaStore";
import type { Topic, TopicRiskLevel, ContentType } from "@/data/selfmedia3-types";
import { AIDisconnectedBanner, FactConfirmTag, EmptyState, CopyPromptButton } from "./shared";
import { buildTopicPrompt } from "./aiPrompts";
import { callAI, extractJSON } from "@/lib/aiService";
import { loadAIConfig } from "@/lib/aiConfig";

const RISK_META: Record<TopicRiskLevel, { icon: typeof Shield; color: string; desc: string }> = {
  "稳妥型": { icon: Shield, color: "text-green-600 bg-green-50 border-green-200", desc: "已验证方向，风险低" },
  "测试型": { icon: FlaskConical, color: "text-blue-600 bg-blue-50 border-blue-200", desc: "新方向小范围测试" },
  "突破型": { icon: Rocket, color: "text-purple-600 bg-purple-50 border-purple-200", desc: "高风险高回报" },
};

const CONTENT_TYPES: ContentType[] = ["老板娘口播", "菜品制作", "后厨实拍", "日常vlog", "食材科普", "门店展示", "故事讲述", "团购推荐", "图文笔记"];

interface Props { store: SelfMediaStore; onNavigate?: (tab: string) => void; currentDay?: number; }

export default function TopicEnginePanel({ store, onNavigate, currentDay = 1 }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Topic>>({
    riskLevel: "稳妥型",
    contentType: "老板娘口播",
    involvesCustomer: false,
    estimatedDuration: "30-60秒",
    shootingDifficulty: "中等",
  });

  const filtered = store.topics.filter(
    (t) => t.accountId === store.currentAccount && t.storeId === store.currentStore,
  );
  const dayTopics = filtered.filter((t) => t.day === currentDay);
  const freeTopics = filtered.filter((t) => t.day == null);

  const handleSave = () => {
    if (!form.title?.trim()) { toast.error("请填写选题标题"); return; }
    store.addTopic({
      title: form.title,
      day: currentDay,
      riskLevel: form.riskLevel || "稳妥型",
      targetUser: form.targetUser || "",
      painPoint: form.painPoint || "",
      contentType: form.contentType || "老板娘口播",
      coreOpinion: form.coreOpinion || "",
      recommendedStore: form.recommendedStore || "",
      recommendedPerson: form.recommendedPerson || "老板娘",
      recommendedDish: form.recommendedDish || "",
      hook: form.hook || "",
      structure: form.structure || "",
      cta: form.cta || "",
      reason: form.reason || "",
      risk: form.risk || "",
      factsToConfirm: form.factsToConfirm || "",
      involvesCustomer: form.involvesCustomer || false,
      estimatedDuration: form.estimatedDuration || "30-60秒",
      shootingDifficulty: form.shootingDifficulty || "中等",
      status: "待采用",
      createdAt: Date.now(),
    });
    toast.success("选题已保存");
    setShowForm(false);
    setForm({ riskLevel: "稳妥型", contentType: "老板娘口播", involvesCustomer: false, estimatedDuration: "30-60秒", shootingDifficulty: "中等" });
  };

  // 选题→脚本闭环：统一由store生成完整可执行脚本
  const [aiGenerating, setAiGenerating] = useState(false);

  const handleAIGenerate = async () => {
    if (aiGenerating) return;
    setAiGenerating(true);
    try {
      const result = await callAI(buildTopicPrompt(store, currentDay) + "\n\n【机器读取要求】最后只返回JSON数组，不要Markdown，不要解释。", loadAIConfig());
      const raw = extractJSON<unknown>(result.content);
      const list = Array.isArray(raw) ? raw : Array.isArray((raw as { topics?: unknown[] })?.topics) ? (raw as { topics: unknown[] }).topics : [];
      if (!list.length) throw new Error("AI没有返回有效选题");
      list.slice(0, 3).forEach((item, index) => {
        const t = (item || {}) as Record<string, unknown>;
        store.addTopic({
          day: currentDay, title: String(t.title || `Day${currentDay} AI选题${index + 1}`),
          riskLevel: (t.riskLevel || ["稳妥型", "测试型", "突破型"][index]) as TopicRiskLevel,
          targetUser: String(t.targetUser || ""), painPoint: String(t.painPoint || ""),
          contentType: (t.contentType || "老板娘口播") as ContentType, coreOpinion: String(t.coreOpinion || ""),
          recommendedStore: String(t.recommendedStore || ""), recommendedPerson: String(t.recommendedPerson || "老板娘"),
          recommendedDish: String(t.recommendedDish || ""), hook: String(t.hook || ""), structure: String(t.structure || ""),
          cta: String(t.cta || ""), reason: String(t.reason || "AI根据今日Day任务生成"), risk: String(t.risk || ""),
          factsToConfirm: String(t.factsToConfirm || ""), involvesCustomer: Boolean(t.involvesCustomer),
          estimatedDuration: String(t.estimatedDuration || "30-60秒"), shootingDifficulty: (t.shootingDifficulty || "中等") as "简单" | "中等" | "较难",
          status: "待采用", createdAt: Date.now() + index,
        });
      });
      toast.success(`AI已生成${Math.min(3, list.length)}个Day${currentDay}选题`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "AI生成失败");
    } finally { setAiGenerating(false); }
  };

  const handleCreateScript = (topicId: string) => {
    const script = store.createScriptFromTopic(topicId, currentDay);
    if (!script) return;
    toast.success("已生成完整脚本，共8个必拍镜头");
  };

  const handleAdopt = (topicId: string) => {
    store.updateTopic(topicId, { status: "已采用" });
    const script = store.createScriptFromTopic(topicId, currentDay);
    if (script) toast.success("已采用，并自动生成今日完整脚本");
    else toast.success("选题已采用");
  };

  // 模板参考生成器：从成功模板读取，生成选题建议
  const templateSuggestions = store.templates
    .filter((t) => t.accountId === store.currentAccount && t.storeId === store.currentStore)
    .slice(0, 3);

  // 根据成功模板数据生成3个候选方向（非AI，基于真实模板数据的结构化推导）
  const [generatedDirections, setGeneratedDirections] = useState<Array<{
    riskLevel: TopicRiskLevel;
    title: string;
    contentType: ContentType;
    hook: string;
    structure: string;
    cta: string;
    reason: string;
    basedOnTheme: string;
  }> | null>(null);

  const generateDirectionsFromTemplates = () => {
    const tpls = store.templates.filter(
      (t) => t.accountId === store.currentAccount && t.storeId === store.currentStore,
    );
    if (tpls.length === 0) {
      toast.error("暂无成功模板，请先在复盘中保存高表现视频为模板");
      return;
    }
    // 取最新的模板作为主要参考
    const main = tpls[0];
    const hookParts = (main.hookStructure || "").split(/[→\->\n]/).map(s => s.trim()).filter(Boolean);
    const baseHook = hookParts[0] || main.hookStructure || "";
    const directions = [
      {
        riskLevel: "稳妥型" as TopicRiskLevel,
        title: `${main.theme}（延续验证版）`,
        contentType: main.contentType,
        hook: baseHook,
        structure: main.shotStructure,
        cta: main.cta,
        reason: `基于成功模板"${main.theme}"的已验证方向，保持Hook结构和CTA不变，替换具体菜品/故事细节。真实数据：${main.realData || "见模板"}`,
        basedOnTheme: main.theme,
      },
      {
        riskLevel: "测试型" as TopicRiskLevel,
        title: `${main.theme}（换角度测试版）`,
        contentType: main.contentType,
        hook: hookParts.length > 1 ? hookParts[1] : baseHook,
        structure: main.shotStructure,
        cta: main.cta,
        reason: `基于模板"${main.theme}"，保持镜头结构和CTA，测试新的Hook开头角度。用同一结构不同切入点做A/B对比。`,
        basedOnTheme: main.theme,
      },
      {
        riskLevel: "突破型" as TopicRiskLevel,
        title: `${main.theme}（跨界延伸版）`,
        contentType: "故事讲述" as ContentType,
        hook: baseHook,
        structure: `开头冲突→故事展开→观点输出→${main.cta}`,
        cta: main.cta,
        reason: `基于模板"${main.theme}"验证的Hook方向，延伸到故事讲述类型，加入老板娘真实经历增强信任。注意：涉及具体经历需老板娘确认。`,
        basedOnTheme: main.theme,
      },
    ];
    setGeneratedDirections(directions);
    toast.success(`已根据${tpls.length}个成功模板生成3个方向`);
  };

  const adoptDirection = (d: NonNullable<typeof generatedDirections>[number]) => {
    setForm({
      ...form,
      title: d.title,
      riskLevel: d.riskLevel,
      contentType: d.contentType,
      hook: d.hook,
      structure: d.structure,
      cta: d.cta,
      reason: d.reason,
    });
    setShowForm(true);
    toast.success("已带入方向，可在此基础上修改");
  };
  const handleUseTemplate = (tpl: typeof templateSuggestions[number]) => {
    setForm({
      ...form,
      title: `参考模板：${tpl.theme}`,
      contentType: tpl.contentType,
      hook: tpl.hookStructure,
      structure: tpl.shotStructure,
      cta: tpl.cta,
      reason: `基于成功模板（${tpl.theme}），该方向已验证有效`,
    });
    setShowForm(true);
    toast.success("已带入模板数据，可在此基础上修改");
  };

  const handleCopy = (t: Topic) => {
    const text = `标题：${t.title}\n类型：${t.contentType}\nHook：${t.hook}\n结构：${t.structure}\nCTA：${t.cta}`;
    navigator.clipboard.writeText(text);
    setCopiedId(t.id);
    toast.success("已复制");
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-4">
      <AIDisconnectedBanner feature="AI选题引擎" />

      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardContent className="p-3 space-y-1.5">
          <p className="text-xs font-medium">Day {currentDay} 今日选题任务</p>
          <p className="text-xs text-foreground/80">{store.currentAccount === "guangdeguangying" ? "广德光英土菜馆" : store.currentAccount === "guxiangli" ? "古巷里土菜馆" : "老板娘个人IP"} · 当前30天计划内容</p>
          <p className="text-xs text-muted-foreground">已绑定今日选题：{dayTopics.length} 个；自由选题：{freeTopics.length} 个。新增选题默认绑定当前 Day。</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 space-y-2">
          <p className="text-xs font-medium flex items-center gap-1"><Wand2 className="size-3.5" />外部AI工作流</p>
          <p className="text-xs text-muted-foreground">已支持真实外部AI：连接成功后可直接生成并保存今日Day选题；未连接时仍可复制Prompt到外部AI。</p>
          <Button size="sm" onClick={handleAIGenerate} disabled={aiGenerating}><Sparkles className="size-3.5 mr-1" />{aiGenerating ? "AI生成中…" : "AI直接生成今日3个选题"}</Button>
          <CopyPromptButton prompt={buildTopicPrompt(store, currentDay)} label="复制选题AI提示词" />
        </CardContent>
      </Card>

      {templateSuggestions.length > 0 && (
        <Card className="border-green-200 bg-green-50/40">
          <CardHeader className="pb-2"><CardTitle className="text-xs flex items-center gap-1"><Shield className="size-3.5 text-green-600" />成功模板参考（从你的高表现视频读取）</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {templateSuggestions.map((tpl) => (
              <div key={tpl.id} className="flex items-center justify-between gap-2 p-2 bg-background rounded border">
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{tpl.theme}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{tpl.hookStructure}</p>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs shrink-0" onClick={() => handleUseTemplate(tpl)}>套用</Button>
              </div>
            ))}
            <Button size="sm" className="w-full h-8 text-xs mt-1" onClick={generateDirectionsFromTemplates}>
              <Wand2 className="size-3 mr-1" />根据成功模板生成选题方向（A/B/C）
            </Button>
          </CardContent>
        </Card>
      )}
      {generatedDirections && (
        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader className="pb-2"><CardTitle className="text-xs flex items-center gap-1"><Sparkles className="size-3.5 text-purple-600" />模板反哺选题方向（基于真实模板数据）</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {generatedDirections.map((d, i) => {
              const m = RISK_META[d.riskLevel];
              return (
                <div key={i} className="p-2 bg-background rounded border space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className={`text-[10px] ${m.color}`}>{d.riskLevel}</Badge>
                    <span className="text-xs font-medium flex-1 truncate">{d.title}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Hook：{d.hook || "—"}</p>
                  <p className="text-[10px] text-muted-foreground">CTA：{d.cta || "—"}</p>
                  <p className="text-[10px] text-muted-foreground">依据：{d.reason}</p>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => adoptDirection(d)}>采用此方向</Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">选题库（{filtered.length}）</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="size-3.5 mr-1" />{showForm ? "收起" : "手动添加选题"}
        </Button>
      </div>

      {/* 三档说明 */}
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(RISK_META) as TopicRiskLevel[]).map((r) => {
          const m = RISK_META[r];
          return (
            <div key={r} className={`p-2 rounded-lg border text-center ${m.color}`}>
              <m.icon className="size-4 mx-auto" />
              <p className="text-xs font-medium mt-1">{r}</p>
              <p className="text-[10px] opacity-70">{m.desc}</p>
            </div>
          );
        })}
      </div>

      {showForm && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">手动添加选题</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">标题 *</label>
                <Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="选题标题" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">风险档位</label>
                <select value={form.riskLevel} onChange={(e) => setForm({ ...form, riskLevel: e.target.value as TopicRiskLevel })}
                  className="w-full h-9 px-2 rounded-md border border-input bg-background text-sm">
                  {(Object.keys(RISK_META) as TopicRiskLevel[]).map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">内容类型</label>
                <select value={form.contentType} onChange={(e) => setForm({ ...form, contentType: e.target.value as ContentType })}
                  className="w-full h-9 px-2 rounded-md border border-input bg-background text-sm">
                  {CONTENT_TYPES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">预计时长</label>
                <Input value={form.estimatedDuration || ""} onChange={(e) => setForm({ ...form, estimatedDuration: e.target.value })} placeholder="30-60秒" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">目标用户</label>
              <Input value={form.targetUser || ""} onChange={(e) => setForm({ ...form, targetUser: e.target.value })} placeholder="如：30-50岁实体老板" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">用户痛点</label>
              <Input value={form.painPoint || ""} onChange={(e) => setForm({ ...form, painPoint: e.target.value })} placeholder="用户的核心痛点" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Hook（开头钩子）</label>
              <Textarea value={form.hook || ""} onChange={(e) => setForm({ ...form, hook: e.target.value })} placeholder="前3秒抓住注意力的话" rows={2} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">内容结构</label>
              <Textarea value={form.structure || ""} onChange={(e) => setForm({ ...form, structure: e.target.value })} placeholder="镜头1→镜头2→..." rows={2} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">CTA（行动号召）</label>
              <Input value={form.cta || ""} onChange={(e) => setForm({ ...form, cta: e.target.value })} placeholder="评论区扣1/私信/团购" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">推荐菜品</label>
                <Input value={form.recommendedDish || ""} onChange={(e) => setForm({ ...form, recommendedDish: e.target.value })} placeholder="广德炖锅" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">拍摄难度</label>
                <select value={form.shootingDifficulty} onChange={(e) => setForm({ ...form, shootingDifficulty: e.target.value as Topic["shootingDifficulty"] })}
                  className="w-full h-9 px-2 rounded-md border border-input bg-background text-sm">
                  <option>简单</option><option>中等</option><option>较难</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">推荐理由</label>
              <Textarea value={form.reason || ""} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={2} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">风险</label>
              <Input value={form.risk || ""} onChange={(e) => setForm({ ...form, risk: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">需要确认的事实</label>
              <Textarea value={form.factsToConfirm || ""} onChange={(e) => setForm({ ...form, factsToConfirm: e.target.value })} placeholder="如涉及具体时间、价格、经历，需老板娘确认" rows={2} />
            </div>
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={form.involvesCustomer} onChange={(e) => setForm({ ...form, involvesCustomer: e.target.checked })} />
              涉及客人（系统将强制提醒：不拍客人正脸）
            </label>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>保存选题</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>取消</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {filtered.length === 0 ? (
        <EmptyState title="暂无选题" desc="点击上方按钮手动添加，或复制到外部AI生成后粘贴" />
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => {
            const m = RISK_META[t.riskLevel];
            return (
              <Card key={t.id} className="border-l-4" >
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] ${m.color}`}>{t.riskLevel}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{t.contentType}</Badge>
                        <Badge variant="outline" className="text-[10px]">{t.status}</Badge>
                      </div>
                      <h4 className="text-sm font-semibold mt-1.5">{t.title}</h4>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(t)}>
                        {copiedId === t.id ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => { store.removeTopic(t.id); toast.success("已删除"); }}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <p><span className="text-foreground/70">目标：</span>{t.targetUser || "—"}</p>
                    <p><span className="text-foreground/70">痛点：</span>{t.painPoint || "—"}</p>
                    <p><span className="text-foreground/70">Hook：</span>{t.hook || "—"}</p>
                    <p><span className="text-foreground/70">CTA：</span>{t.cta || "—"}</p>
                  </div>
                  {t.factsToConfirm && <FactConfirmTag text={t.factsToConfirm} />}
                  <div className="flex gap-1.5 flex-wrap pt-1">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleAdopt(t.id)}>采用并生成完整脚本</Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleCreateScript(t.id)}>
                      <FileText className="size-3 mr-1" />生成脚本
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => store.updateTopic(t.id, { status: "已放弃" })}>放弃</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
