import { useState } from "react";
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
import { EmptyState } from "./shared";

interface Props { store: SelfMediaStore; }

const EMPTY: Omit<HotCase, "id" | "accountId" | "storeId"> = {
  platform: "", account: "", title: "", url: "", publishTime: "",
  collectedAt: new Date().toISOString().slice(0, 10), data: "", verified: false, remark: "",
};

export default function HotCasesPanel({ store }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<HotCase>>({});
  const [search, setSearch] = useState("");
  const filtered = store.hotCases.filter(
    (h) => search === "" || h.title.includes(search) || h.account.includes(search),
  );

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
        <Button size="sm" onClick={startNew}><Plus className="size-3.5 mr-1" />添加案例</Button>
      </div>

      <Card className="border-amber-200 bg-amber-50/40">
        <CardContent className="p-2.5 text-xs text-amber-800 space-y-1">
          <p className="font-medium">非实时热门 · 手动添加 · 待核验</p>
          <p>本系统不联网抓取热门数据。所有案例需手动添加，包含平台、账号、原链接、发布时间、采集日期、数据和核验状态。</p>
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
                <p className="text-[10px] text-muted-foreground/60">采集于 {h.collectedAt}</p>
              </CardContent>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
