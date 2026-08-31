import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FolderOpen, Upload, Trash2, Search, Image as ImageIcon, Video, X, Eye, Sparkles, Loader2, FileVideo } from "lucide-react";
import { toast } from "sonner";
import type { SelfMediaStore } from "@/hooks/useSelfMediaStore";
import type { MediaItem, MediaType, VideoAnalysis } from "@/data/selfmedia3-types";
import { MEDIA_TYPES } from "@/data/selfmedia3-types";
import { getVideoFile, saveVideoFile, deleteVideoFile } from "@/lib/videoStorage";
import { analyzeVideoWithAI, captureVideoFrames } from "@/lib/videoAnalysis";
import { EmptyState } from "./shared";

interface Props { store: SelfMediaStore; }

function makeThumbnail(file: File): Promise<string> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) { resolve(""); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const max = 200;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        canvas.width = Math.max(1, img.width * scale); canvas.height = Math.max(1, img.height * scale);
        const ctx = canvas.getContext("2d");
        if (ctx) { ctx.drawImage(img, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL("image/jpeg", 0.6)); }
        else resolve("");
      };
      img.onerror = () => resolve(""); img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(""); reader.readAsDataURL(file);
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + "B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + "KB";
  return (bytes / 1024 / 1024).toFixed(1) + "MB";
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "";
  const s = Math.round(seconds); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const ANALYSIS_FIELDS: Array<[keyof VideoAnalysis, string]> = [
  ["summary", "视频总结"], ["hook", "Hook / 核心钩子"], ["opening3s", "开头3秒"], ["opening5s", "前5秒"],
  ["person", "人物"], ["persona", "人设"], ["structure", "内容结构"], ["conflict", "冲突"], ["contrast", "反差"],
  ["emotion", "情绪"], ["dialogue", "台词"], ["shots", "镜头拆解"], ["pacing", "节奏"], ["subtitles", "字幕"],
  ["cta", "CTA / 行动引导"], ["highlights", "爆点"], ["weaknesses", "问题"], ["copyPoints", "可复制点"],
  ["avoidPoints", "不适合复制的点"], ["adaptation", "适合我的改造方式"],
];

export default function MediaLibraryPanel({ store }: Props) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<MediaType | "全部">("全部");
  const [filterUsed, setFilterUsed] = useState<"全部" | "已使用" | "未使用">("全部");
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = store.media.filter((m) =>
    m.accountId === store.currentAccount && m.storeId === store.currentStore &&
    (filterType === "全部" || m.mediaType === filterType) &&
    (filterUsed === "全部" || (filterUsed === "已使用" ? m.isUsed : !m.isUsed)) &&
    (search === "" || m.name.includes(search) || m.description.includes(search) || m.tags.some((t) => t.includes(search))),
  );

  useEffect(() => {
    let active = true;
    setVideoUrl(""); setAnalysis(null); setTranscript("");
    if (!preview?.fileRefId || preview.fileType !== "视频") return;
    getVideoFile(preview.fileRefId).then((blob) => {
      if (!active || !blob) return;
      setVideoUrl(URL.createObjectURL(blob));
    }).catch(() => toast.error("无法读取本地视频文件"));
    const existing = store.videoAnalyses.filter((a) => a.mediaId === preview.id && a.accountId === store.currentAccount && a.storeId === store.currentStore).sort((a, b) => b.updatedAt - a.updatedAt)[0];
    if (existing) { setAnalysis(existing); setTranscript(existing.transcript); }
    return () => { active = false; setVideoUrl((old) => { if (old) URL.revokeObjectURL(old); return ""; }); };
  }, [preview?.id, preview?.fileRefId, preview?.fileType, store.videoAnalyses, store.currentAccount, store.currentStore]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    let added = 0;
    try {
      for (const file of Array.from(files)) {
        const isImage = file.type.startsWith("image/"); const isVideo = file.type.startsWith("video/");
        if (!isImage && !isVideo) continue;
        const id = `media_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
        const thumb = isImage ? await makeThumbnail(file) : "";
        const base = {
          id, name: file.name.replace(/\.[^.]+$/, ""), shootDate: new Date().toISOString().slice(0, 10), mediaType: "空镜" as MediaType,
          person: "", dish: "", scene: "", fileType: isImage ? "图片" as const : "视频" as const,
          duration: "", fileSize: formatSize(file.size), thumbnail: thumb, tags: [], description: "", isUsed: false, usedVideoId: "", remark: "", createdAt: Date.now(),
        };
        const created = store.addMedia(base);
        if (isVideo) {
          await saveVideoFile(created.id, file);
          try {
            const meta = await captureVideoFrames(file, 1);
            store.updateMedia(created.id, { fileRefId: created.id, duration: formatDuration(meta.duration), videoWidth: meta.width, videoHeight: meta.height, analysisStatus: "未分析", remark: "视频原文件保存在浏览器IndexedDB，拆解记录保存在工作台" });
          } catch {
            store.updateMedia(created.id, { fileRefId: created.id, analysisStatus: "未分析", remark: "视频原文件保存在浏览器IndexedDB" });
          }
        }
        added++;
      }
      toast.success(`已添加 ${added} 个素材；视频原文件已保存到浏览器本地`);
    } catch (err) { toast.error(err instanceof Error ? err.message : "上传失败"); }
    finally { setUploading(false); e.target.value = ""; }
  };

  const runAnalysis = async () => {
    if (!preview?.fileRefId || preview.fileType !== "视频") return;
    setAnalyzing(true);
    store.updateMedia(preview.id, { analysisStatus: "分析中" });
    try {
      const blob = await getVideoFile(preview.fileRefId);
      if (!blob) throw new Error("找不到本地视频文件，请重新上传该视频");
      const meta = await captureVideoFrames(blob, 6);
      const result = await analyzeVideoWithAI({ name: preview.name, duration: meta.duration, transcript, frames: meta.frames });
      const now = Date.now();
      const existing = store.videoAnalyses.find((a) => a.mediaId === preview.id && a.accountId === store.currentAccount && a.storeId === store.currentStore);
      const payload = {
        mediaId: preview.id, transcript, frameCount: meta.frames.length, status: "已完成" as const,
        summary: String(result.summary || ""), hook: String(result.hook || ""), opening3s: String(result.opening3s || ""), opening5s: String(result.opening5s || ""),
        person: String(result.person || ""), persona: String(result.persona || ""), structure: String(result.structure || ""), conflict: String(result.conflict || ""), contrast: String(result.contrast || ""),
        emotion: String(result.emotion || ""), dialogue: String(result.dialogue || ""), shots: String(result.shots || ""), pacing: String(result.pacing || ""), subtitles: String(result.subtitles || ""), cta: String(result.cta || ""),
        highlights: String(result.highlights || ""), weaknesses: String(result.weaknesses || ""), copyPoints: String(result.copyPoints || ""), avoidPoints: String(result.avoidPoints || ""), adaptation: String(result.adaptation || ""),
        updatedAt: now,
      };
      if (existing) store.updateVideoAnalysis(existing.id, payload); else store.addVideoAnalysis({ ...payload, createdAt: now });
      store.updateMedia(preview.id, { analysisStatus: "已分析", duration: formatDuration(meta.duration), videoWidth: meta.width, videoHeight: meta.height });
      setAnalysis({ ...(existing || {} as VideoAnalysis), id: existing?.id || "pending", accountId: store.currentAccount, storeId: store.currentStore, createdAt: existing?.createdAt || now, ...payload });
      toast.success("视频AI拆解完成");
    } catch (err) {
      store.updateMedia(preview.id, { analysisStatus: "分析失败" });
      toast.error(err instanceof Error ? err.message : "视频AI分析失败");
    } finally { setAnalyzing(false); }
  };

  const remove = async (m: MediaItem) => {
    if (m.fileRefId) await deleteVideoFile(m.fileRefId).catch(() => undefined);
    store.removeMedia(m.id);
    store.videoAnalyses.filter((a) => a.mediaId === m.id).forEach((a) => store.removeVideoAnalysis(a.id));
    if (preview?.id === m.id) setPreview(null);
    toast.success("已删除");
  };

  return <div className="space-y-4">
    <div className="flex items-center justify-between gap-2">
      <h3 className="text-sm font-medium flex items-center gap-1.5"><FolderOpen className="size-4" />素材库（{filtered.length}）</h3>
      <Button size="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()}><Upload className="size-3.5 mr-1" />{uploading ? "上传中…" : "上传"}</Button>
      <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleUpload} />
    </div>
    <Card className="border-blue-200 bg-blue-50/40"><CardContent className="p-2.5 text-xs text-blue-700">图片保存压缩缩略图；<span className="font-medium">视频原文件保存到浏览器IndexedDB</span>，拆解结果单独保存。清除浏览器数据会丢失本地视频，重要素材请备份。</CardContent></Card>
    <div className="space-y-2">
      <div className="relative"><Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索素材..." className="pl-8 h-9" /></div>
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">{(["全部", ...MEDIA_TYPES] as const).map((t) => <button key={t} onClick={() => setFilterType(t)} className={`shrink-0 px-2.5 py-1 rounded-md text-[11px] font-medium ${filterType === t ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"}`}>{t}</button>)}</div>
      <div className="flex gap-1.5">{(["全部", "已使用", "未使用"] as const).map((u) => <button key={u} onClick={() => setFilterUsed(u)} className={`px-2.5 py-1 rounded-md text-[11px] font-medium ${filterUsed === u ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"}`}>{u}</button>)}</div>
    </div>
    {filtered.length === 0 ? <EmptyState title="暂无素材" desc="点击上传按钮添加图片或视频素材" /> : <div className="grid grid-cols-2 gap-2">{filtered.map((m) => <Card key={m.id} className="overflow-hidden"><div className="aspect-square bg-muted relative cursor-pointer" onClick={() => setPreview(m)}>{m.thumbnail ? <img src={m.thumbnail} alt={m.name} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center">{m.fileType === "视频" ? <Video className="size-8 text-muted-foreground/40" /> : <ImageIcon className="size-8 text-muted-foreground/40" />}</div>}<Badge variant="secondary" className="absolute top-1 left-1 text-[9px]">{m.mediaType}</Badge>{m.fileType === "视频" && m.analysisStatus === "已分析" && <Badge className="absolute bottom-1 left-1 text-[9px]">AI已拆解</Badge>}{m.isUsed && <Badge className="absolute top-1 right-1 text-[9px]">已用</Badge>}<Eye className="size-4 absolute bottom-1 right-1 text-white/80" /></div><CardContent className="p-2"><p className="text-xs font-medium truncate">{m.name}</p><p className="text-[10px] text-muted-foreground">{m.fileType} · {m.duration || ""} · {m.shootDate}</p><div className="flex gap-1 mt-1"><Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={(e) => { e.stopPropagation(); void remove(m); }}><Trash2 className="size-3" /></Button></div></CardContent></Card>)}</div>}

    {preview && <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3" onClick={() => setPreview(null)}><Card className="w-full max-w-lg max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}><CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-sm flex items-center gap-2"><FileVideo className="size-4" />{preview.name}</CardTitle><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPreview(null)}><X className="size-4" /></Button></div></CardHeader><CardContent className="p-4 pt-0 space-y-3">
      {preview.fileType === "视频" ? <>
        {videoUrl ? <video src={videoUrl} controls playsInline className="w-full rounded-lg bg-black max-h-72" /> : <div className="rounded-lg bg-muted p-8 text-center text-xs text-muted-foreground">正在读取本地视频…</div>}
        <div className="rounded-lg border p-3 space-y-2"><div className="flex items-center justify-between"><div><p className="text-sm font-medium">AI完整视频拆解</p><p className="text-[11px] text-muted-foreground">自动抽取最多6个关键画面；如果视频有口播，建议粘贴转写稿，AI会结合画面+台词分析。</p></div><Badge variant={preview.analysisStatus === "已分析" ? "default" : "secondary"}>{preview.analysisStatus || "未分析"}</Badge></div><Textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="可选：粘贴视频口播/字幕转写。没有也可以直接分析画面。" rows={4} /><Button className="w-full" disabled={analyzing || !videoUrl} onClick={() => void runAnalysis()}>{analyzing ? <><Loader2 className="size-4 mr-1 animate-spin" />正在抽帧并调用AI…</> : <><Sparkles className="size-4 mr-1" />{analysis ? "重新AI拆解" : "AI完整拆解视频"}</>}</Button></div>
        {analysis && <div className="space-y-2"><div className="text-xs text-muted-foreground">已分析 {analysis.frameCount} 个关键画面 · 更新时间 {new Date(analysis.updatedAt).toLocaleString()}</div>{ANALYSIS_FIELDS.map(([key, label]) => <Card key={String(key)}><CardContent className="p-3"><p className="text-xs font-semibold mb-1">{label}</p><p className="text-xs whitespace-pre-wrap leading-5">{String(analysis[key] || "暂无")}</p></CardContent></Card>)}</div>}
      </> : preview.thumbnail && <img src={preview.thumbnail} alt={preview.name} className="w-full rounded-lg" />}
      <div className="grid grid-cols-2 gap-2"><Input value={preview.name} onChange={(e) => { const v = e.target.value; store.updateMedia(preview.id, { name: v }); setPreview({ ...preview, name: v }); }} /><select value={preview.mediaType} onChange={(e) => { const v = e.target.value as MediaType; store.updateMedia(preview.id, { mediaType: v }); setPreview({ ...preview, mediaType: v }); }} className="h-9 px-2 rounded-md border border-input bg-background text-sm">{MEDIA_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
      <Input value={preview.scene} onChange={(e) => { const v = e.target.value; store.updateMedia(preview.id, { scene: v }); setPreview({ ...preview, scene: v }); }} placeholder="场景" />
    </CardContent></Card></div>}
  </div>;
}
