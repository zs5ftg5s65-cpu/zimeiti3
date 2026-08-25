import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Award, Plus, Trash2, Edit2, Check, X, Copy,
} from "lucide-react";
import { toast } from "sonner";
import type { SelfMediaStore } from "@/hooks/useSelfMediaStore";
import type { WinningTemplate, ContentType } from "@/data/selfmedia3-types";
import { EmptyState } from "./shared";

interface Props { store: SelfMediaStore; }

const CONTENT_TYPES: ContentType[] = ["老板娘口播", "菜品制作", "后厨实拍", "日常vlog", "食材科普", "门店展示", "故事讲述", "团购推荐", "图文笔记"];

const EMPTY: Omit<WinningTemplate, "id" | "accountId" | "storeId" | "createdAt"> = {
  sourceVideoId: "", theme: "", contentType: "老板娘口播", hookStructure: "",
  shotStructure: "", person: "老板娘", duration: "", cta: "", realData: "", successReason: "",
};

export default function WinningTemplatesPanel({ store }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<WinningTemplate>>({});
  const filtered = store.templates.filter(
    (t) => t.accountId === store.currentAccount && t.storeId === store.currentStore,
  );

  const startNew = () => {
    const t = store.addTemplate({ ...EMPTY, createdAt: Date.now() });
    setEditingId(t.id);
    setDraft(t);
  };
  const startEdit = (t: WinningTemplate) => { setEditingId(t.id); setDraft({ ...t }); };
  const save = () => {
    if (!editingId) return;
    if (!draft.theme?.trim()) { toast.error("请填写主题"); return; }
    store.updateTemplate(editingId, draft);
    setEditingId(null);
    toast.success("模板已保存，选题引擎将自动读取");
  };
  const copyTemplate = (t: WinningTemplate) => {
    const text = `主题：${t.theme}\n类型：${t.contentType}\nHook结构：${t.hookStructure}\n镜头结构：${t.shotStructure}\nCTA：${t.cta}\n成功原因：${t.successReason}`;
    navigator.clipboard.writeText(text);
    toast.success("模板已复制");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-1.5"><Award className="size-4" />成功模板库（{filtered.length}）</h3>
        <Button size="sm" onClick={startNew}><Plus className="size-3.5 mr-1" />保存模板</Button>
      </div>

      <Card className="border-green-200 bg-green-50/40">
        <CardContent className="p-2.5 text-xs text-green-700">
          高表现视频可保存为成功模板。选题引擎生成新选题时会自动读取这些模板的Hook结构和镜头结构。
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState title="暂无成功模板" desc="当某条视频表现好时，将其结构保存为模板" action={<Button size="sm" onClick={startNew}>保存第一个</Button>} />
      ) : (
        filtered.map((t) => (
          <Card key={t.id}>
            {editingId === t.id ? (
              <CardContent className="p-3 space-y-2">
                <Input value={draft.theme || ""} onChange={(e) => setDraft({ ...draft, theme: e.target.value })} placeholder="主题 *" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={draft.contentType} onChange={(e) => setDraft({ ...draft, contentType: e.target.value as ContentType })}
                    className="h-9 px-2 rounded-md border border-input bg-background text-sm">
                    {CONTENT_TYPES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <Input value={draft.duration || ""} onChange={(e) => setDraft({ ...draft, duration: e.target.value })} placeholder="时长" />
                </div>
                <Input value={draft.sourceVideoId || ""} onChange={(e) => setDraft({ ...draft, sourceVideoId: e.target.value })} placeholder="来源视频ID" />
                <div>
                  <label className="text-xs text-muted-foreground">Hook结构</label>
                  <Textarea value={draft.hookStructure || ""} onChange={(e) => setDraft({ ...draft, hookStructure: e.target.value })} rows={2} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">镜头结构</label>
                  <Textarea value={draft.shotStructure || ""} onChange={(e) => setDraft({ ...draft, shotStructure: e.target.value })} rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={draft.person || ""} onChange={(e) => setDraft({ ...draft, person: e.target.value })} placeholder="人物" />
                  <Input value={draft.cta || ""} onChange={(e) => setDraft({ ...draft, cta: e.target.value })} placeholder="CTA" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">真实数据</label>
                  <Textarea value={draft.realData || ""} onChange={(e) => setDraft({ ...draft, realData: e.target.value })} placeholder="这条视频的真实数据表现" rows={2} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">成功原因分析</label>
                  <Textarea value={draft.successReason || ""} onChange={(e) => setDraft({ ...draft, successReason: e.target.value })} rows={2} />
                </div>
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
                      <h4 className="text-sm font-semibold">{t.theme}</h4>
                      <Badge variant="secondary" className="text-[10px]">{t.contentType}</Badge>
                      {t.duration && <Badge variant="outline" className="text-[10px]">{t.duration}</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyTemplate(t)}><Copy className="size-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(t)}><Edit2 className="size-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => { store.removeTemplate(t.id); toast.success("已删除"); }}><Trash2 className="size-3.5" /></Button>
                  </div>
                </div>
                {t.hookStructure && <p className="text-xs"><span className="text-muted-foreground">Hook：</span>{t.hookStructure}</p>}
                {t.shotStructure && <p className="text-xs"><span className="text-muted-foreground">镜头：</span>{t.shotStructure}</p>}
                {t.cta && <p className="text-xs"><span className="text-muted-foreground">CTA：</span>{t.cta}</p>}
                {t.successReason && <p className="text-xs text-green-700">{t.successReason}</p>}
              </CardContent>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
