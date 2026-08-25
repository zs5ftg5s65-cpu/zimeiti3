import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FolderOpen, Upload, Trash2, Search, Image as ImageIcon, Video, X, Eye,
} from "lucide-react";
import { toast } from "sonner";
import type { SelfMediaStore } from "@/hooks/useSelfMediaStore";
import type { MediaItem, MediaType } from "@/data/selfmedia3-types";
import { MEDIA_TYPES } from "@/data/selfmedia3-types";
import { EmptyState } from "./shared";

interface Props { store: SelfMediaStore; }

// 压缩图片为缩略图base64（最大200px）
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
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.6));
        } else resolve("");
      };
      img.onerror = () => resolve("");
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + "B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + "KB";
  return (bytes / 1024 / 1024).toFixed(1) + "MB";
}

export default function MediaLibraryPanel({ store }: Props) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<MediaType | "全部">("全部");
  const [filterUsed, setFilterUsed] = useState<"全部" | "已使用" | "未使用">("全部");
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = store.media.filter(
    (m) => m.accountId === store.currentAccount && m.storeId === store.currentStore &&
      (filterType === "全部" || m.mediaType === filterType) &&
      (filterUsed === "全部" || (filterUsed === "已使用" ? m.isUsed : !m.isUsed)) &&
      (search === "" || m.name.includes(search) || m.description.includes(search) || m.tags.some((t) => t.includes(search))),
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    let added = 0;
    for (const file of Array.from(files)) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      if (!isImage && !isVideo) continue;
      const thumb = isImage ? await makeThumbnail(file) : "";
      store.addMedia({
        name: file.name.replace(/\.[^.]+$/, ""),
        shootDate: new Date().toISOString().slice(0, 10),
        mediaType: "空镜",
        person: "",
        dish: "",
        scene: "",
        fileType: isImage ? "图片" : "视频",
        duration: "",
        fileSize: formatSize(file.size),
        thumbnail: thumb,
        tags: [],
        description: "",
        isUsed: false,
        usedVideoId: "",
        remark: isVideo ? "视频原文件未保存，仅保存素材记录" : "",
        createdAt: Date.now(),
      });
      added++;
    }
    toast.success(`已添加 ${added} 个素材（图片保存缩略图，视频仅保存元数据记录）`);
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-1.5"><FolderOpen className="size-4" />素材库（{filtered.length}）</h3>
        <Button size="sm" onClick={() => fileInputRef.current?.click()}><Upload className="size-3.5 mr-1" />上传</Button>
        <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleUpload} />
      </div>

      <Card className="border-blue-200 bg-blue-50/40">
        <CardContent className="p-2.5 text-xs text-blue-700">
          图片保存压缩缩略图到浏览器本地；<span className="font-medium">视频原文件未保存，仅保存素材记录</span>。非云端存储，清除浏览器数据将丢失，建议定期导出备份。
        </CardContent>
      </Card>

      {/* 筛选 */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索素材..." className="pl-8 h-9" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          {(["全部", ...MEDIA_TYPES] as const).map((t) => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`shrink-0 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${filterType === t ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {(["全部", "已使用", "未使用"] as const).map((u) => (
            <button key={u} onClick={() => setFilterUsed(u)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${filterUsed === u ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>
              {u}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="暂无素材" desc="点击上传按钮添加图片或视频素材" />
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {filtered.map((m) => (
            <Card key={m.id} className="overflow-hidden">
              <div className="aspect-square bg-muted relative cursor-pointer" onClick={() => setPreview(m)}>
                {m.thumbnail ? (
                  <img src={m.thumbnail} alt={m.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {m.fileType === "视频" ? <Video className="size-8 text-muted-foreground/40" /> : <ImageIcon className="size-8 text-muted-foreground/40" />}
                  </div>
                )}
                <Badge variant="secondary" className="absolute top-1 left-1 text-[9px]">{m.mediaType}</Badge>
                {m.isUsed && <Badge className="absolute top-1 right-1 text-[9px] bg-green-100 text-green-700">已用</Badge>}
                <Eye className="size-4 absolute bottom-1 right-1 text-white/80" />
              </div>
              <CardContent className="p-2">
                <p className="text-xs font-medium truncate">{m.name}</p>
                <p className="text-[10px] text-muted-foreground">{m.fileType} · {m.shootDate}</p>
                <div className="flex gap-1 mt-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={(e) => { e.stopPropagation(); store.removeMedia(m.id); toast.success("已删除"); }}>
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 预览/编辑弹窗 */}
      {preview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <Card className="w-full max-w-md max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">素材详情</h4>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPreview(null)}><X className="size-4" /></Button>
              </div>
              {preview.thumbnail && <img src={preview.thumbnail} alt="" className="w-full rounded-lg" />}
              <div>
                <label className="text-xs text-muted-foreground">名称</label>
                <Input value={preview.name} onChange={(e) => { const v = e.target.value; store.updateMedia(preview.id, { name: v }); setPreview({ ...preview, name: v }); }} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">类型</label>
                  <select value={preview.mediaType} onChange={(e) => { const v = e.target.value as MediaType; store.updateMedia(preview.id, { mediaType: v }); setPreview({ ...preview, mediaType: v }); }}
                    className="w-full h-9 px-2 rounded-md border border-input bg-background text-sm">
                    {MEDIA_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">拍摄日期</label>
                  <Input type="date" value={preview.shootDate} onChange={(e) => { const v = e.target.value; store.updateMedia(preview.id, { shootDate: v }); setPreview({ ...preview, shootDate: v }); }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input value={preview.person} onChange={(e) => { const v = e.target.value; store.updateMedia(preview.id, { person: v }); setPreview({ ...preview, person: v }); }} placeholder="人物" />
                <Input value={preview.dish} onChange={(e) => { const v = e.target.value; store.updateMedia(preview.id, { dish: v }); setPreview({ ...preview, dish: v }); }} placeholder="菜品" />
              </div>
              <Input value={preview.scene} onChange={(e) => { const v = e.target.value; store.updateMedia(preview.id, { scene: v }); setPreview({ ...preview, scene: v }); }} placeholder="场景" />
              <Input value={preview.tags.join(",")} onChange={(e) => { const v = e.target.value.split(/[,，]/).map(s => s.trim()).filter(Boolean); store.updateMedia(preview.id, { tags: v }); setPreview({ ...preview, tags: v }); }} placeholder="标签（逗号分隔）" />
              <textarea value={preview.description} onChange={(e) => { const v = e.target.value; store.updateMedia(preview.id, { description: v }); setPreview({ ...preview, description: v }); }} placeholder="描述" rows={2} className="w-full px-2 py-1.5 rounded-md border border-input bg-background text-sm" />
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={preview.isUsed} onChange={(e) => { const v = e.target.checked; store.updateMedia(preview.id, { isUsed: v }); setPreview({ ...preview, isUsed: v }); }} />
                已使用
              </label>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
