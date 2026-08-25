import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Plus, Trash2, Edit2, Check, X, Search } from "lucide-react";
import { toast } from "sonner";
import type { SelfMediaStore } from "@/hooks/useSelfMediaStore";
import type { Story, ContentType } from "@/data/selfmedia3-types";
import { EmptyState, FactConfirmTag } from "./shared";

const CONTENT_TYPES: ContentType[] = ["老板娘口播", "菜品制作", "后厨实拍", "日常vlog", "食材科普", "门店展示", "故事讲述", "团购推荐", "图文笔记"];

interface Props { store: SelfMediaStore; }

const EMPTY: Omit<Story, "id" | "accountId" | "storeId" | "createdAt"> = {
  title: "", happenedTime: "", location: "", people: "", process: "", problem: "",
  solution: "", result: "", bossView: "", shootDirection: "", suitableContentType: "故事讲述",
  hasShot: false, relatedVideoId: "", authenticityConfirmed: false, remark: "",
};

export default function StoryLibraryPanel({ store }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Story>>({});
  const [search, setSearch] = useState("");

  const filtered = store.stories.filter(
    (s) => s.accountId === store.currentAccount && s.storeId === store.currentStore &&
      (search === "" || s.title.includes(search) || s.process.includes(search)),
  );

  const startNew = () => {
    const s = store.addStory({ ...EMPTY, createdAt: Date.now() });
    setEditingId(s.id);
    setDraft(s);
  };
  const startEdit = (s: Story) => { setEditingId(s.id); setDraft({ ...s }); };
  const save = () => {
    if (!editingId) return;
    if (!draft.title?.trim()) { toast.error("请填写故事标题"); return; }
    store.updateStory(editingId, draft);
    setEditingId(null);
    toast.success("故事已保存");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium flex items-center gap-1.5"><BookOpen className="size-4" />真实故事库（{filtered.length}）</h3>
        <Button size="sm" onClick={startNew}><Plus className="size-3.5 mr-1" />新增故事</Button>
      </div>

      <div className="relative">
        <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索故事..." className="pl-8 h-9" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="暂无故事" desc="真实故事是AI写脚本的核心素材，请添加老板娘真实经历" />
      ) : (
        filtered.map((s) => (
          <Card key={s.id}>
            {editingId === s.id ? (
              <CardContent className="p-3 space-y-2">
                <Input value={draft.title || ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="故事标题 *" />
                <div className="grid grid-cols-2 gap-2">
                  <Input value={draft.happenedTime || ""} onChange={(e) => setDraft({ ...draft, happenedTime: e.target.value })} placeholder="发生时间" />
                  <Input value={draft.location || ""} onChange={(e) => setDraft({ ...draft, location: e.target.value })} placeholder="地点" />
                </div>
                <Input value={draft.people || ""} onChange={(e) => setDraft({ ...draft, people: e.target.value })} placeholder="涉及人物" />
                <Textarea value={draft.process || ""} onChange={(e) => setDraft({ ...draft, process: e.target.value })} placeholder="事情经过" rows={3} />
                <div className="grid grid-cols-2 gap-2">
                  <Textarea value={draft.problem || ""} onChange={(e) => setDraft({ ...draft, problem: e.target.value })} placeholder="当时问题" rows={2} />
                  <Textarea value={draft.solution || ""} onChange={(e) => setDraft({ ...draft, solution: e.target.value })} placeholder="解决方式" rows={2} />
                </div>
                <Input value={draft.result || ""} onChange={(e) => setDraft({ ...draft, result: e.target.value })} placeholder="结果" />
                <Textarea value={draft.bossView || ""} onChange={(e) => setDraft({ ...draft, bossView: e.target.value })} placeholder="老板娘真实观点" rows={2} />
                <Input value={draft.shootDirection || ""} onChange={(e) => setDraft({ ...draft, shootDirection: e.target.value })} placeholder="可拍方向" />
                <select value={draft.suitableContentType} onChange={(e) => setDraft({ ...draft, suitableContentType: e.target.value as ContentType })}
                  className="w-full h-9 px-2 rounded-md border border-input bg-background text-sm">
                  {CONTENT_TYPES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={draft.authenticityConfirmed || false} onChange={(e) => setDraft({ ...draft, authenticityConfirmed: e.target.checked })} />
                  真实性已确认（老板娘核实）
                </label>
                <Textarea value={draft.remark || ""} onChange={(e) => setDraft({ ...draft, remark: e.target.value })} placeholder="备注" rows={2} />
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
                      <h4 className="text-sm font-semibold">{s.title}</h4>
                      {s.authenticityConfirmed ? (
                        <Badge variant="outline" className="text-[10px] border-green-200 text-green-600">已确认</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-600">待确认</Badge>
                      )}
                      {s.hasShot && <Badge variant="secondary" className="text-[10px]">已拍</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.happenedTime} · {s.location}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(s)}><Edit2 className="size-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => { store.removeStory(s.id); toast.success("已删除"); }}><Trash2 className="size-3.5" /></Button>
                  </div>
                </div>
                <p className="text-xs text-foreground/80 line-clamp-3">{s.process}</p>
                {s.bossView && <p className="text-xs text-primary/80">观点：{s.bossView}</p>}
                {!s.authenticityConfirmed && <FactConfirmTag text="此故事尚未经老板娘确认，写脚本时需标注" />}
              </CardContent>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
