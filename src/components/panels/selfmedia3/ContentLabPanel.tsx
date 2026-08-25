import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FlaskConical, Plus, Trash2, Edit2, Check, X, Trophy,
} from "lucide-react";
import { toast } from "sonner";
import type { SelfMediaStore } from "@/hooks/useSelfMediaStore";
import type { LabExperiment, LabVariant } from "@/data/selfmedia3-types";
import { QuickNumberInput, EmptyState } from "./shared";

interface Props { store: SelfMediaStore; }

function emptyVariant(v: "A" | "B" | "C"): LabVariant {
  return {
    version: v, hook: "", views: 0, dropOff2s: 0, retention5s: 0, completionRate: 0,
    likes: 0, favorites: 0, shares: 0, newFollowers: 0, privateMessages: 0,
    storeVisits: 0, groupPurchases: 0,
  };
}

// 综合评分：完播*0.3 + 互动率*0.3 + 涨粉率*0.2 + 到店团购*0.2
function scoreVariant(v: LabVariant): number {
  const views = v.views || 1;
  const engagement = (v.likes + v.favorites + v.shares) / views * 100;
  const followerRate = v.newFollowers / views * 100;
  const conversion = (v.storeVisits + v.groupPurchases) / views * 100;
  return v.completionRate * 0.3 + engagement * 0.3 + followerRate * 0.2 + conversion * 0.2;
}

export default function ContentLabPanel({ store }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<LabExperiment>>({});
  const filtered = store.experiments.filter(
    (e) => e.accountId === store.currentAccount && e.storeId === store.currentStore,
  );

  const startNew = () => {
    const exp = store.addExperiment({
      theme: "", variants: [emptyVariant("A"), emptyVariant("B"), emptyVariant("C")],
      bestHook: "", worstHook: "", recommendedStructure: "", createdAt: Date.now(),
    });
    setEditingId(exp.id);
    setDraft(exp);
  };
  const startEdit = (e: LabExperiment) => { setEditingId(e.id); setDraft({ ...e, variants: e.variants.map(v => ({ ...v })) }); };
  const updateVariant = (idx: number, patch: Partial<LabVariant>) => {
    if (!draft.variants) return;
    const variants = draft.variants.map((v, i) => i === idx ? { ...v, ...patch } : v);
    setDraft({ ...draft, variants });
  };
  const save = () => {
    if (!editingId) return;
    if (!draft.theme?.trim()) { toast.error("请填写实验主题"); return; }
    // 自动计算最佳/最差Hook
    if (draft.variants && draft.variants.length > 0) {
      const scored = draft.variants.map(v => ({ v, s: scoreVariant(v) })).sort((a, b) => b.s - a.s);
      const best = scored[0];
      const worst = scored[scored.length - 1];
      const patch: Partial<LabExperiment> = {
        ...draft,
        bestHook: best.v.views > 0 ? `${best.v.version}: ${best.v.hook || "(无Hook)"}` : "",
        worstHook: worst.v.views > 0 ? `${worst.v.version}: ${worst.v.hook || "(无Hook)"}` : "",
        recommendedStructure: best.v.views > 0 ? `参考${best.v.version}版本结构，完播${best.v.completionRate}%` : "",
      };
      store.updateExperiment(editingId, patch);
    } else {
      store.updateExperiment(editingId, draft);
    }
    setEditingId(null);
    toast.success("实验已保存，已自动比较Hook");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-1.5"><FlaskConical className="size-4" />内容实验室（{filtered.length}）</h3>
        <Button size="sm" onClick={startNew}><Plus className="size-3.5 mr-1" />新建实验</Button>
      </div>

      <Card className="border-blue-200 bg-blue-50/40">
        <CardContent className="p-2.5 text-xs text-blue-700">
          同一主题测试 Hook A/B/C，录入真实数据后自动比较最佳/最差Hook。评分=完播×0.3+互动×0.3+涨粉×0.2+转化×0.2。
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState title="暂无实验" desc="创建A/B/C实验，测试不同Hook的真实表现" action={<Button size="sm" onClick={startNew}>新建实验</Button>} />
      ) : (
        filtered.map((exp) => (
          <Card key={exp.id}>
            {editingId === exp.id ? (
              <CardContent className="p-3 space-y-3">
                <Input value={draft.theme || ""} onChange={(e) => setDraft({ ...draft, theme: e.target.value })} placeholder="实验主题 *" />
                {draft.variants?.map((v, idx) => (
                  <div key={v.version} className="border border-border/50 rounded-lg p-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="text-xs">Hook {v.version}</Badge>
                      <Input value={v.hook} onChange={(e) => updateVariant(idx, { hook: e.target.value })} placeholder="Hook文案" className="h-8 text-xs flex-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <QuickNumberInput label="播放" value={v.views} onChange={(val) => updateVariant(idx, { views: val })} />
                      <QuickNumberInput label="完播%" value={v.completionRate} onChange={(val) => updateVariant(idx, { completionRate: val })} suffix="%" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <QuickNumberInput label="2秒跳失%" value={v.dropOff2s} onChange={(val) => updateVariant(idx, { dropOff2s: val })} suffix="%" />
                      <QuickNumberInput label="5秒留存%" value={v.retention5s} onChange={(val) => updateVariant(idx, { retention5s: val })} suffix="%" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <QuickNumberInput label="点赞" value={v.likes} onChange={(val) => updateVariant(idx, { likes: val })} />
                      <QuickNumberInput label="收藏" value={v.favorites} onChange={(val) => updateVariant(idx, { favorites: val })} />
                      <QuickNumberInput label="转发" value={v.shares} onChange={(val) => updateVariant(idx, { shares: val })} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <QuickNumberInput label="涨粉" value={v.newFollowers} onChange={(val) => updateVariant(idx, { newFollowers: val })} />
                      <QuickNumberInput label="私信" value={v.privateMessages} onChange={(val) => updateVariant(idx, { privateMessages: val })} />
                      <QuickNumberInput label="到店" value={v.storeVisits} onChange={(val) => updateVariant(idx, { storeVisits: val })} />
                    </div>
                    <QuickNumberInput label="团购" value={v.groupPurchases} onChange={(val) => updateVariant(idx, { groupPurchases: val })} />
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button size="sm" onClick={save}><Check className="size-3.5 mr-1" />保存并比较</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><X className="size-3.5 mr-1" />取消</Button>
                </div>
              </CardContent>
            ) : (
              <CardContent className="p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-semibold">{exp.theme}</h4>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(exp)}><Edit2 className="size-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => { store.removeExperiment(exp.id); toast.success("已删除"); }}><Trash2 className="size-3.5" /></Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1 text-center">
                  {exp.variants.map((v) => (
                    <div key={v.version} className="p-2 rounded bg-muted/30">
                      <p className="text-xs font-bold">Hook {v.version}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{v.hook || "—"}</p>
                      <p className="text-xs font-bold tabular-nums mt-1">{v.views.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">播放 · 完播{v.completionRate}%</p>
                    </div>
                  ))}
                </div>
                {exp.bestHook && (
                  <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 rounded p-1.5">
                    <Trophy className="size-3.5" />最佳：{exp.bestHook}
                  </div>
                )}
                {exp.worstHook && (
                  <div className="text-xs text-red-600 bg-red-50 rounded p-1.5">最差：{exp.worstHook}</div>
                )}
                {exp.recommendedStructure && <p className="text-xs text-primary/80">推荐：{exp.recommendedStructure}</p>}
              </CardContent>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
