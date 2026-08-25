import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Plus, Trash2, Edit2, Check, X, Globe, Lock, Store } from "lucide-react";
import { toast } from "sonner";
import type { SelfMediaStore } from "@/hooks/useSelfMediaStore";
import type { Character, ScopeType } from "@/data/selfmedia3-types";
import { EmptyState } from "./shared";

interface Props { store: SelfMediaStore; }

const FIELDS: { key: keyof Character; label: string; type: "text" | "textarea" }[] = [
  { key: "personality", label: "性格", type: "text" },
  { key: "speakingStyle", label: "说话方式", type: "text" },
  { key: "catchphrases", label: "口头禅（逗号分隔）", type: "text" },
  { key: "commonExpressions", label: "常用表达（逗号分隔）", type: "text" },
  { key: "businessExperience", label: "经营经历", type: "textarea" },
  { key: "startupExperience", label: "创业经历", type: "textarea" },
  { key: "hometownExperience", label: "家乡经历", type: "textarea" },
  { key: "openingExperience", label: "开店经历", type: "textarea" },
  { key: "successExperience", label: "成功经历", type: "textarea" },
  { key: "failureExperience", label: "失败经历", type: "textarea" },
  { key: "diningView", label: "餐饮观点", type: "textarea" },
  { key: "priceView", label: "价格观点", type: "textarea" },
  { key: "ingredientView", label: "选材观点", type: "textarea" },
  { key: "serviceView", label: "服务观点", type: "textarea" },
  { key: "stories", label: "经营故事", type: "textarea" },
];

const SCOPE_LABEL: Record<ScopeType, { label: string; icon: typeof Globe; color: string }> = {
  shared: { label: "公共资料", icon: Globe, color: "text-blue-600 bg-blue-50" },
  account: { label: "账号私有", icon: Lock, color: "text-amber-600 bg-amber-50" },
  store: { label: "门店私有", icon: Store, color: "text-purple-600 bg-purple-50" },
};

export default function CharacterPanel({ store }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Character>>({});
  const visibleChars = store.getVisibleCharacters();

  const startEdit = (c: Character) => { setEditingId(c.id); setDraft({ ...c }); };
  const startNew = () => {
    const c = store.addCharacter({
      name: "", tags: [], personality: "", speakingStyle: "",
      catchphrases: [], commonExpressions: [], businessExperience: "", startupExperience: "",
      hometownExperience: "", openingExperience: "", successExperience: "", failureExperience: "",
      diningView: "", priceView: "", ingredientView: "", serviceView: "", stories: "",
      publicLevel: "需确认", hasShot: false, relatedVideoIds: [],
      scopeType: "account",
      createdAt: Date.now(), updatedAt: Date.now(),
    });
    setEditingId(c.id);
    setDraft(c);
  };
  const save = () => {
    if (!editingId) return;
    const patch: Partial<Character> = { ...draft, updatedAt: Date.now() };
    if (typeof draft.catchphrases === "string") patch.catchphrases = (draft.catchphrases as string).split(/[,，]/).map(s => s.trim()).filter(Boolean);
    if (typeof draft.commonExpressions === "string") patch.commonExpressions = (draft.commonExpressions as string).split(/[,，]/).map(s => s.trim()).filter(Boolean);
    store.updateCharacter(editingId, patch);
    setEditingId(null);
    toast.success("已保存");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-1.5"><User className="size-4" />老板娘人物库（{visibleChars.length}）</h3>
        <Button size="sm" onClick={startNew}><Plus className="size-3.5 mr-1" />新增人物</Button>
      </div>
      <p className="text-xs text-muted-foreground">公共资料所有账号可见；私有资料仅当前账号/门店可见。</p>
      {visibleChars.length === 0 ? (
        <EmptyState title="暂无人物资料" desc="点击新增人物开始建立人物资料库" />
      ) : (
        visibleChars.map((c) => {
          const scope = SCOPE_LABEL[c.scopeType || "account"];
          const ScopeIcon = scope.icon;
          return (
          <Card key={c.id}>
            {editingId === c.id ? (
              <CardContent className="p-3 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs text-muted-foreground">姓名</label>
                    <Input value={draft.name || ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
                  <div><label className="text-xs text-muted-foreground">标签（逗号分隔）</label>
                    <Input value={Array.isArray(draft.tags) ? draft.tags.join(",") : ""} onChange={(e) => setDraft({ ...draft, tags: e.target.value.split(/[,，]/).map(s => s.trim()).filter(Boolean) })} /></div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">资料可见范围{editingId && store.characters.some(c => c.id === editingId) ? "（创建后锁定，不可修改）" : ""}</label>
                  <div className="flex gap-2 mt-1">
                    {(["account", "store", "shared"] as ScopeType[]).map((st) => {
                      const s = SCOPE_LABEL[st];
                      const Icon = s.icon;
                      const isEditing = editingId && store.characters.some(c => c.id === editingId);
                      return (
                        <button key={st} disabled={!!isEditing} onClick={() => !isEditing && setDraft({ ...draft, scopeType: st })}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs border ${isEditing ? "opacity-50 cursor-not-allowed " : ""}${draft.scopeType === st ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
                          <Icon className="size-3" />{s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {FIELDS.map((f) => (
                  <div key={f.key}>
                    <label className="text-xs text-muted-foreground">{f.label}</label>
                    {f.type === "text" ? (
                      <Input value={(draft[f.key] as string) || ""} onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })} />
                    ) : (
                      <Textarea value={(draft[f.key] as string) || ""} onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })} rows={2} />
                    )}
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button size="sm" onClick={save}><Check className="size-3.5 mr-1" />保存</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><X className="size-3.5 mr-1" />取消</Button>
                </div>
              </CardContent>
            ) : (
              <>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="text-sm flex items-center gap-1.5">
                        {c.name || "未命名"}
                        <Badge variant="outline" className={`text-[10px] ${scope.color} border-transparent`}>
                          <ScopeIcon className="size-2.5 mr-0.5" />{scope.label}
                        </Badge>
                      </CardTitle>
                      <div className="flex gap-1 flex-wrap mt-1">
                        {c.tags.map((t, i) => <Badge key={i} variant="secondary" className="text-[10px]">{t}</Badge>)}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {(c.scopeType === "shared" ? store.currentAccount === "bosslady" : true) ? (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(c)}><Edit2 className="size-3.5" /></Button>
                          {c.id !== "char_bosslady_default" && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => { store.removeCharacter(c.id); toast.success("已删除"); }}><Trash2 className="size-3.5" /></Button>
                          )}
                        </>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">只读</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-1.5 text-xs">
                  {c.personality && <p><span className="text-muted-foreground">性格：</span>{c.personality}</p>}
                  {c.speakingStyle && <p><span className="text-muted-foreground">说话方式：</span>{c.speakingStyle}</p>}
                  {c.catchphrases.length > 0 && <p><span className="text-muted-foreground">口头禅：</span>{c.catchphrases.join(" / ")}</p>}
                  {c.businessExperience && <p><span className="text-muted-foreground">经营经历：</span>{c.businessExperience}</p>}
                  {c.startupExperience && <p><span className="text-muted-foreground">创业经历：</span>{c.startupExperience}</p>}
                  {c.diningView && <p><span className="text-muted-foreground">餐饮观点：</span>{c.diningView}</p>}
                  {c.ingredientView && <p><span className="text-muted-foreground">选材观点：</span>{c.ingredientView}</p>}
                  {c.stories && <p><span className="text-muted-foreground">经营故事：</span>{c.stories}</p>}
                  <Badge variant="outline" className="text-[10px] mt-1">公开程度：{c.publicLevel}</Badge>
                </CardContent>
              </>
            )}
          </Card>
          );
        })
      )}
    </div>
  );
}
