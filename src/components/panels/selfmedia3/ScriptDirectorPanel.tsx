import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Film, Plus, Trash2, Copy, Check, ChevronDown, ChevronUp,
  Wand2, Clock, Camera, Mic, Subtitles, Volume2, Scissors, Link2,
} from "lucide-react";
import { toast } from "sonner";
import type { SelfMediaStore } from "@/hooks/useSelfMediaStore";
import type { Script, Shot, ContentType } from "@/data/selfmedia3-types";
import { AIDisconnectedBanner, EmptyState, FactConfirmTag, CopyPromptButton } from "./shared";
import { buildScriptPrompt, buildScriptRegeneratePrompt } from "./aiPrompts";

const CONTENT_TYPES: ContentType[] = ["老板娘口播", "菜品制作", "后厨实拍", "日常vlog", "食材科普", "门店展示", "故事讲述", "团购推荐", "图文笔记"];

function emptyShot(n: number): Shot {
  return {
    shotNumber: n, time: "", shotSize: "中景", visual: "", action: "", dialogue: "",
    subtitle: "", sound: "", shootingNote: "", editingNote: "", isRequired: true, status: "未拍",
  };
}

interface Props { store: SelfMediaStore; }
export default function ScriptDirectorPanel({ store }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showMeta, setShowMeta] = useState(true);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const filtered = store.scripts.filter(
    (s) => s.accountId === store.currentAccount && s.storeId === store.currentStore,
  );
  const active = filtered.find((s) => s.id === activeId) || filtered[0] || null;

  // 来源选题
  const sourceTopic = active?.sourceTopicId
    ? store.topics.find((t) => t.id === active.sourceTopicId)
    : null;

  // 已关联素材
  const linkedMedia = active
    ? store.media.filter((m) => active.requiredMediaIds.includes(m.id))
    : [];
  // 可关联素材（当前账号门店下未关联的）
  const availableMedia = active
    ? store.media.filter((m) => m.accountId === store.currentAccount && m.storeId === store.currentStore && !active.requiredMediaIds.includes(m.id))
    : [];

  const createScript = () => {
    const s = store.addScript({
      title: "新脚本", targetUser: "", goal: "", person: "老板娘", dish: "",
      estimatedDuration: "45秒", contentType: "老板娘口播",
      shots: [emptyShot(1), emptyShot(2), emptyShot(3)],
      requiredMediaIds: [],
      shootingOrder: "", requiredShots: "", optionalShots: "", missingMaterials: "",
      status: "草稿", createdAt: Date.now(), updatedAt: Date.now(),
    });
    setActiveId(s.id);
    toast.success("已创建新脚本");
  };

  const updateActive = (patch: Partial<Script>) => {
    if (!active) return;
    store.updateScript(active.id, { ...patch, updatedAt: Date.now() });
  };

  const copyScript = () => {
    if (!active) return;
    const copy = store.addScript({
      ...active,
      title: active.title + "（副本）",
      status: "草稿",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as Omit<Script, "id" | "accountId" | "storeId">);
    setActiveId(copy.id);
    toast.success("脚本已复制");
  };

  const deleteScript = () => {
    if (!active) return;
    deleteScriptById(active.id);
  };
  const deleteScriptById = (id: string) => {
    const target = filtered.find((s) => s.id === id);
    if (!target) return;
    const hasLinks = target.sourceTopicId || (target.requiredMediaIds?.length ?? 0) > 0;
    const msg = hasLinks
      ? `脚本"${target.title}"已关联选题/素材，删除脚本不会删除关联数据。确定删除吗？`
      : `确定删除脚本"${target.title}"吗？此操作不可撤销。`;
    if (window.confirm(msg)) {
      store.removeScript(id);
      if (activeId === id) {
        const remaining = filtered.filter((s) => s.id !== id);
        setActiveId(remaining[0]?.id || null);
      }
      toast.success("脚本已删除");
    }
  };

  const updateShot = (idx: number, patch: Partial<Shot>) => {
    if (!active) return;
    const shots = [...active.shots];
    shots[idx] = { ...shots[idx], ...patch };
    updateActive({ shots });
  };

  const addShot = () => {
    if (!active) return;
    updateActive({ shots: [...active.shots, emptyShot(active.shots.length + 1)] });
  };

  const removeShot = (idx: number) => {
    if (!active) return;
    const shots = active.shots.filter((_, i) => i !== idx).map((s, i) => ({ ...s, shotNumber: i + 1 }));
    updateActive({ shots });
  };

  const moveShot = (idx: number, dir: -1 | 1) => {
    if (!active) return;
    const shots = [...active.shots];
    const target = idx + dir;
    if (target < 0 || target >= shots.length) return;
    [shots[idx], shots[target]] = [shots[target], shots[idx]];
    shots.forEach((s, i) => (s.shotNumber = i + 1));
    updateActive({ shots });
  };

  const copyText = (text: string, label: string) => {
    if (!text) { toast.error("无内容可复制"); return; }
    navigator.clipboard.writeText(text);
    toast.success(`${label}已复制`);
  };

  const linkMedia = (mediaId: string) => {
    if (!active) return;
    updateActive({ requiredMediaIds: [...active.requiredMediaIds, mediaId] });
    toast.success("素材已关联");
  };

  const unlinkMedia = (mediaId: string) => {
    if (!active) return;
    updateActive({ requiredMediaIds: active.requiredMediaIds.filter((id) => id !== mediaId) });
  };

  return (
    <div className="space-y-4">
      <AIDisconnectedBanner feature="AI脚本导演" />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-1.5"><Film className="size-4" />脚本导演（{filtered.length}）</h3>
        <Button size="sm" onClick={createScript}><Plus className="size-3.5 mr-1" />新建脚本</Button>
      </div>

      {filtered.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 items-center">
          {filtered.map((s) => (
            <div key={s.id} className="flex items-center shrink-0">
              <button
                onClick={() => setActiveId(s.id)}
                className={`shrink-0 px-3 py-1.5 rounded-l-md text-xs font-medium transition-colors ${
                  active?.id === s.id ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {s.title.slice(0, 10)}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteScriptById(s.id);
                }}
                className={`shrink-0 px-2 py-1.5 rounded-r-md text-xs transition-colors border-l ${
                  active?.id === s.id ? "bg-primary/80 text-primary-foreground hover:bg-destructive" : "bg-muted/50 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                }`}
                title="删除脚本"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {active && (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={copyScript} className="flex-1 gap-1.5">
            <Copy className="size-3.5" /> 复制脚本
          </Button>
          <Button size="sm" variant="outline" onClick={deleteScript} className="flex-1 gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/5">
            <Trash2 className="size-3.5" /> 删除脚本
          </Button>
        </div>
      )}

      {!active ? (
        <EmptyState title="暂无脚本" desc="点击新建脚本开始创建拍摄执行表" action={<Button size="sm" onClick={createScript}>新建脚本</Button>} />
      ) : (
        <>
          {/* 来源选题 */}
          {sourceTopic && (
            <Card className="border-blue-200 bg-blue-50/40">
              <CardContent className="p-3">
                <p className="text-[10px] text-blue-600 font-medium">来源选题</p>
                <p className="text-sm font-medium">{sourceTopic.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Hook：{sourceTopic.hook}</p>
              </CardContent>
            </Card>
          )}

          {/* 脚本元信息 */}
          <Card>
            <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowMeta(!showMeta)}>
              <CardTitle className="text-sm flex items-center justify-between">
                <span>脚本信息</span>
                {showMeta ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </CardTitle>
            </CardHeader>
            {showMeta && (
              <CardContent className="space-y-2 pt-0">
                <Input value={active.title} onChange={(e) => updateActive({ title: e.target.value })} placeholder="视频标题" />
                <div className="grid grid-cols-2 gap-2">
                  <Input value={active.targetUser} onChange={(e) => updateActive({ targetUser: e.target.value })} placeholder="目标用户" />
                  <select value={active.contentType} onChange={(e) => updateActive({ contentType: e.target.value as ContentType })}
                    className="h-9 px-2 rounded-md border border-input bg-background text-sm">
                    {CONTENT_TYPES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input value={active.person} onChange={(e) => updateActive({ person: e.target.value })} placeholder="人物" />
                  <Input value={active.dish} onChange={(e) => updateActive({ dish: e.target.value })} placeholder="菜品" />
                  <Input value={active.estimatedDuration} onChange={(e) => updateActive({ estimatedDuration: e.target.value })} placeholder="时长" />
                </div>
                <Textarea value={active.goal} onChange={(e) => updateActive({ goal: e.target.value })} placeholder="本条视频目标" rows={2} />
              </CardContent>
            )}
          </Card>

          {/* AI操作 — 复制提示词到外部AI */}
          <Card>
            <CardContent className="p-3 space-y-2">
              <p className="text-xs font-medium flex items-center gap-1"><Wand2 className="size-3.5" />外部AI工作流</p>
              <p className="text-xs text-muted-foreground">复制提示词到外部AI生成后粘贴回来。下方按钮分别复制对应操作的提示词。</p>
              <div className="flex flex-wrap gap-1.5">
                <CopyPromptButton prompt={buildScriptPrompt(store, sourceTopic || undefined)} label="生成完整脚本" />
                <CopyPromptButton prompt={buildScriptRegeneratePrompt(store, active, "重新生成Hook")} label="重生成Hook" />
                <CopyPromptButton prompt={buildScriptRegeneratePrompt(store, active, "重新生成结尾")} label="重生成结尾" />
                <CopyPromptButton prompt={buildScriptRegeneratePrompt(store, active, "改为30秒版")} label="30秒版" />
                <CopyPromptButton prompt={buildScriptRegeneratePrompt(store, active, "改为60秒版")} label="60秒版" />
                <CopyPromptButton prompt={buildScriptRegeneratePrompt(store, active, "改为老板娘口语版")} label="口语版" />
                <CopyPromptButton prompt={buildScriptRegeneratePrompt(store, active, "更真实、去掉AI腔")} label="更真实" />
                <CopyPromptButton prompt={buildScriptRegeneratePrompt(store, active, "增加冲突和反差")} label="更有冲突" />
              </div>
            </CardContent>
          </Card>

          {/* 已关联素材 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-1"><Link2 className="size-4" />素材关联（{linkedMedia.length}）</span>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowMediaPicker(!showMediaPicker)}>
                  {showMediaPicker ? "收起" : "关联素材"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {linkedMedia.length === 0 && <p className="text-xs text-muted-foreground">尚未关联素材，拍摄前请从素材库关联</p>}
              {linkedMedia.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-2 p-2 bg-muted/30 rounded">
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{m.name}</p>
                    <p className="text-[10px] text-muted-foreground">{m.fileType} · {m.scene || "—"}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 text-xs text-red-500" onClick={() => unlinkMedia(m.id)}>取消</Button>
                </div>
              ))}
              {showMediaPicker && (
                <div className="space-y-1.5 pt-2 border-t">
                  {availableMedia.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">素材库中暂无可关联素材，先去素材库上传</p>
                  ) : (
                    availableMedia.slice(0, 10).map((m) => (
                      <div key={m.id} className="flex items-center justify-between gap-2 p-2 border rounded">
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{m.name}</p>
                          <p className="text-[10px] text-muted-foreground">{m.fileType} · {m.scene || "—"}</p>
                        </div>
                        <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => linkMedia(m.id)}>关联</Button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 逐镜头纵向卡片 */}
          <div className="space-y-3">
            {active.shots.map((shot, idx) => (
              <Card key={idx} className={`border-l-4 ${shot.status === "已拍" ? "border-l-green-500 opacity-70" : "border-l-primary"}`}>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={shot.isRequired ? "default" : "secondary"} className="text-xs">镜头{shot.shotNumber}</Badge>
                      <Badge variant="outline" className="text-[10px]">{shot.shotSize}</Badge>
                      {shot.status === "已拍" && <Badge className="text-[10px] bg-green-100 text-green-700">已拍</Badge>}
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveShot(idx, -1)} disabled={idx === 0}><ChevronUp className="size-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveShot(idx, 1)} disabled={idx === active.shots.length - 1}><ChevronDown className="size-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removeShot(idx)}><Trash2 className="size-3.5" /></Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1">
                      <Clock className="size-3 text-muted-foreground" />
                      <Input value={shot.time} onChange={(e) => updateShot(idx, { time: e.target.value })} placeholder="时间" className="h-8 text-xs" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Camera className="size-3 text-muted-foreground" />
                      <Input value={shot.shotSize} onChange={(e) => updateShot(idx, { shotSize: e.target.value })} placeholder="景别" className="h-8 text-xs" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground flex items-center gap-1"><Camera className="size-2.5" />画面</label>
                    <Textarea value={shot.visual} onChange={(e) => updateShot(idx, { visual: e.target.value })} placeholder="画面描述" rows={2} className="text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">人物动作</label>
                    <Input value={shot.action} onChange={(e) => updateShot(idx, { action: e.target.value })} placeholder="动作" className="h-8 text-xs" />
                  </div>
                  <div className="bg-primary/[0.03] rounded-md p-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-muted-foreground flex items-center gap-1"><Mic className="size-2.5" />台词</label>
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copyText(shot.dialogue, "台词")}><Copy className="size-3" /></Button>
                    </div>
                    <Textarea value={shot.dialogue} onChange={(e) => updateShot(idx, { dialogue: e.target.value })} placeholder="老板娘说的话" rows={2} className="text-xs bg-transparent border-0 p-0 focus-visible:ring-0" />
                  </div>
                  <div className="bg-muted/30 rounded-md p-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-muted-foreground flex items-center gap-1"><Subtitles className="size-2.5" />字幕</label>
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copyText(shot.subtitle, "字幕")}><Copy className="size-3" /></Button>
                    </div>
                    <Input value={shot.subtitle} onChange={(e) => updateShot(idx, { subtitle: e.target.value })} placeholder="字幕文字" className="h-7 text-xs bg-transparent border-0 p-0 focus-visible:ring-0" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-muted-foreground flex items-center gap-1"><Volume2 className="size-2.5" />声音/BGM</label>
                      <Input value={shot.sound} onChange={(e) => updateShot(idx, { sound: e.target.value })} className="h-8 text-xs" />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground flex items-center gap-1"><Scissors className="size-2.5" />剪辑备注</label>
                      <Input value={shot.editingNote} onChange={(e) => updateShot(idx, { editingNote: e.target.value })} className="h-8 text-xs" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">拍摄备注</label>
                    <Input value={shot.shootingNote} onChange={(e) => updateShot(idx, { shootingNote: e.target.value })} className="h-8 text-xs" />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Button size="sm" variant={shot.status === "已拍" ? "default" : "outline"} className="h-7 text-xs flex-1"
                      onClick={() => updateShot(idx, { status: shot.status === "已拍" ? "未拍" : "已拍" })}>
                      {shot.status === "已拍" ? <><Check className="size-3 mr-1" />已拍</> : "标记已拍"}
                    </Button>
                    <label className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <input type="checkbox" checked={shot.isRequired} onChange={(e) => updateShot(idx, { isRequired: e.target.checked })} />
                      必拍
                    </label>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button variant="outline" className="w-full" onClick={addShot}><Plus className="size-3.5 mr-1" />添加镜头</Button>

          {/* 拍摄总结 */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">拍摄总结</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div>
                <label className="text-xs text-muted-foreground">拍摄顺序</label>
                <Textarea value={active.shootingOrder} onChange={(e) => updateActive({ shootingOrder: e.target.value })} rows={2} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">必拍镜头</label>
                <Textarea value={active.requiredShots} onChange={(e) => updateActive({ requiredShots: e.target.value })} rows={2} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">可选镜头</label>
                <Textarea value={active.optionalShots} onChange={(e) => updateActive({ optionalShots: e.target.value })} rows={2} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">缺失素材</label>
                <Textarea value={active.missingMaterials} onChange={(e) => updateActive({ missingMaterials: e.target.value })} rows={2} />
              </div>
              <FactConfirmTag text="如脚本中涉及具体时间、价格、经历，需老板娘确认后再拍摄" />
            </CardContent>
          </Card>

          <div className="flex gap-1.5 flex-wrap">
            {(["草稿", "已定稿", "拍摄中", "已拍摄", "已发布"] as const).map((st) => (
              <Button key={st} size="sm" variant={active.status === st ? "default" : "outline"} className="text-xs h-8"
                onClick={() => updateActive({ status: st })}>{st}</Button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
