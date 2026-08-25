import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  TrendingUp, Plus, Trash2, Edit2, Check, X, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import type { SelfMediaStore } from "@/hooks/useSelfMediaStore";
import type { AdDecision } from "@/data/selfmedia3-types";
import { EmptyState } from "./shared";

interface Props { store: SelfMediaStore; }

const DECISIONS: AdDecision["decision"][] = ["继续投流", "停止投流", "观望", "数据不足"];

const EMPTY: Omit<AdDecision, "id" | "accountId" | "storeId" | "createdAt"> = {
  analyticsId: "", naturalValidation: "", smallBudgetTest: "",
  beforeAfterCompare: "", decision: "数据不足", reason: "",
};

export default function AdDecisionPanel({ store }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<AdDecision>>({});
  const filtered = store.adDecisions.filter(
    (a) => a.accountId === store.currentAccount && a.storeId === store.currentStore,
  );

  const startNew = () => {
    const a = store.addAdDecision({ ...EMPTY, createdAt: Date.now() });
    setEditingId(a.id);
    setDraft(a);
  };
  const startEdit = (a: AdDecision) => { setEditingId(a.id); setDraft({ ...a }); };
  const save = () => {
    if (!editingId) return;
    store.updateAdDecision(editingId, draft);
    setEditingId(null);
    toast.success("投流判断已保存");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-1.5"><TrendingUp className="size-4" />投流判断（{filtered.length}）</h3>
        <Button size="sm" onClick={startNew}><Plus className="size-3.5 mr-1" />新增判断</Button>
      </div>

      <Card className="border-red-200 bg-red-50/40">
        <CardContent className="p-2.5 text-xs text-red-700 space-y-1">
          <p className="font-medium flex items-center gap-1"><AlertTriangle className="size-3" />投流纪律</p>
          <p>不能只看播放量。必须综合：自然播放、2秒跳失、5秒留存、完播、互动率、涨粉、私信、到店、团购、成本。</p>
          <p>流程：自然验证 → 小额测试 → 投流前后比较 → 继续/停止。没有真实转化数据时，禁止建议大额投流。</p>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState title="暂无投流判断" desc="基于真实数据手动记录投流决策过程" action={<Button size="sm" onClick={startNew}>新增</Button>} />
      ) : (
        filtered.map((a) => (
          <Card key={a.id}>
            {editingId === a.id ? (
              <CardContent className="p-3 space-y-2">
                <Input value={draft.analyticsId || ""} onChange={(e) => setDraft({ ...draft, analyticsId: e.target.value })} placeholder="关联数据记录ID" />
                <div>
                  <label className="text-xs text-muted-foreground">自然验证结论</label>
                  <Textarea value={draft.naturalValidation || ""} onChange={(e) => setDraft({ ...draft, naturalValidation: e.target.value })} placeholder="自然流量下的数据表现是否达标？" rows={2} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">小额测试建议</label>
                  <Textarea value={draft.smallBudgetTest || ""} onChange={(e) => setDraft({ ...draft, smallBudgetTest: e.target.value })} placeholder="建议测试金额、时长、目标" rows={2} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">投流前后比较</label>
                  <Textarea value={draft.beforeAfterCompare || ""} onChange={(e) => setDraft({ ...draft, beforeAfterCompare: e.target.value })} placeholder="投流前后关键指标对比" rows={2} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">决策</label>
                  <select value={draft.decision} onChange={(e) => setDraft({ ...draft, decision: e.target.value as AdDecision["decision"] })}
                    className="w-full h-9 px-2 rounded-md border border-input bg-background text-sm">
                    {DECISIONS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">决策理由</label>
                  <Textarea value={draft.reason || ""} onChange={(e) => setDraft({ ...draft, reason: e.target.value })} rows={2} />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={save}><Check className="size-3.5 mr-1" />保存</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><X className="size-3.5 mr-1" />取消</Button>
                </div>
              </CardContent>
            ) : (
              <CardContent className="p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <Badge variant={a.decision === "继续投流" ? "default" : a.decision === "停止投流" ? "destructive" : "secondary"} className="text-xs">
                    {a.decision}
                  </Badge>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(a)}><Edit2 className="size-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => { store.removeAdDecision(a.id); toast.success("已删除"); }}><Trash2 className="size-3.5" /></Button>
                  </div>
                </div>
                {a.naturalValidation && <p className="text-xs"><span className="text-muted-foreground">自然验证：</span>{a.naturalValidation}</p>}
                {a.smallBudgetTest && <p className="text-xs"><span className="text-muted-foreground">小额测试：</span>{a.smallBudgetTest}</p>}
                {a.beforeAfterCompare && <p className="text-xs"><span className="text-muted-foreground">前后比较：</span>{a.beforeAfterCompare}</p>}
                {a.reason && <p className="text-xs text-primary/80">{a.reason}</p>}
              </CardContent>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
