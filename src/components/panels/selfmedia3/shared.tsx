import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ZapOff, Download, Upload, Copy, Check, FileJson, X } from "lucide-react";
import { toast } from "sonner";
import type { SelfMediaStore } from "@/hooks/useSelfMediaStore";
import type { ExportData, ImportPreview } from "@/hooks/useSelfMediaStore";
import { accountName, storeName } from "@/data/selfmedia3-types";

// AI能力未连接提示条
export function AIDisconnectedBanner({ feature }: { feature: string }) {
  return (
    <Card className="border-amber-200 bg-amber-50/60">
      <CardContent className="p-3 flex items-start gap-2">
        <ZapOff className="size-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 space-y-0.5">
          <p className="font-medium">AI能力未连接 — {feature}</p>
          <p>当前未接入AI接口。你可以手动填写内容、保存，或复制到外部AI工具生成后粘贴回来。</p>
        </div>
      </CardContent>
    </Card>
  );
}

// 拍摄限制提示
export function ShootingRestrictionBadge() {
  return (
    <Badge variant="outline" className="border-red-200 text-red-600 bg-red-50">
      <AlertTriangle className="size-3 mr-1" />不拍客人·不编造
    </Badge>
  );
}

// 需要确认事实标签
export function FactConfirmTag({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-md p-2 text-xs text-orange-700">
      <span className="font-medium">【需要老板娘确认】</span> {text}
    </div>
  );
}

// 空状态
export function EmptyState({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-10 space-y-2">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {desc && <p className="text-xs text-muted-foreground/70">{desc}</p>}
      {action}
    </div>
  );
}

// 数字输入快速录入行
export function QuickNumberInput({
  label, value, onChange, suffix,
}: { label: string; value: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-muted-foreground w-16 shrink-0">{label}</label>
      <input
        type="number"
        inputMode="numeric"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        placeholder="0"
        className="flex-1 h-9 px-2 rounded-md border border-input bg-background text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
      />
      {suffix && <span className="text-xs text-muted-foreground w-8">{suffix}</span>}
    </div>
  );
}

// 复制AI提示词按钮
export function CopyPromptButton({ prompt, label = "复制AI提示词" }: { prompt: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="sm"
      variant="outline"
      className="text-xs h-8"
      onClick={() => {
        navigator.clipboard.writeText(prompt);
        setCopied(true);
        toast.success("AI提示词已复制，粘贴到外部AI工具即可");
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="size-3 mr-1 text-green-500" /> : <Copy className="size-3 mr-1" />}
      {copied ? "已复制" : label}
    </Button>
  );
}

const ENTITY_LABELS: Record<string, string> = {
  topics: "选题", characters: "人物", stories: "故事", scripts: "脚本", media: "素材",
  publishes: "发布", analytics: "数据", reviews: "复盘", adDecisions: "投流",
  experiments: "实验", templates: "模板", hotCases: "案例", warRoomByScope: "作战台",
};

// 数据导出/导入（含scope选择和导入预览）
export function DataBackupBar({ store }: { store: SelfMediaStore }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [pendingImport, setPendingImport] = useState<ExportData | null>(null);

  const doExport = (scope: "all" | "account" | "store") => {
    const data = store.exportData(scope);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const scopeLabel = scope === "all" ? "全部" : scope === "account" ? "当前账号" : "当前门店";
    a.download = `自媒体3.0备份_${scopeLabel}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
    toast.success(`已导出${scopeLabel}数据`);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result as string) as ExportData;
        const p = store.previewImport(imported);
        if (!p.valid) {
          toast.error(p.message);
          return;
        }
        setPreview(p);
        setPendingImport(imported);
      } catch {
        toast.error("文件解析失败，请选择有效的备份JSON");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const confirmImport = () => {
    if (!pendingImport) return;
    const result = store.importData(pendingImport);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
    setPreview(null);
    setPendingImport(null);
  };

  const cancelImport = () => {
    setPreview(null);
    setPendingImport(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        <div className="relative">
          <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => setShowExportMenu(!showExportMenu)}>
            <Download className="size-3 mr-1" />导出数据
          </Button>
          {showExportMenu && (
            <div className="absolute top-full left-0 mt-1 z-30 bg-card border border-border rounded-md shadow-lg py-1 min-w-[140px]">
              <button className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent" onClick={() => doExport("all")}>导出全部数据</button>
              <button className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent" onClick={() => doExport("account")}>导出当前账号</button>
              <button className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent" onClick={() => doExport("store")}>导出当前门店</button>
            </div>
          )}
        </div>
        <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => fileRef.current?.click()}>
          <Upload className="size-3 mr-1" />导入数据
        </Button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFile} />
      </div>

      {/* 导入预览 */}
      {preview && (
        <Card className="border-blue-200 bg-blue-50/40">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium flex items-center gap-1.5"><FileJson className="size-4 text-blue-600" />导入预览</p>
              <button onClick={cancelImport} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
            </div>
            <div className="text-xs space-y-1">
              <p>当前账号：<span className="font-medium">{accountName(preview.currentAccount)}</span> ｜ 当前门店：<span className="font-medium">{storeName(preview.currentStore)}</span></p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-2">
                {Object.entries(ENTITY_LABELS).map(([key, label]) => {
                  const total = preview.totalCounts[key] || 0;
                  const imp = preview.importCounts[key] || 0;
                  const skip = preview.skippedCounts[key] || 0;
                  const inv = preview.invalidCounts[key] || 0;
                  if (total === 0) return null;
                  return (
                    <p key={key}>
                      {label}：共{total}条
                      {imp > 0 && <span className="text-green-600"> → 导入{imp}</span>}
                      {skip > 0 && <span className="text-amber-600"> · 跳过{skip}</span>}
                      {inv > 0 && <span className="text-red-500"> · 无效{inv}</span>}
                    </p>
                  );
                })}
              </div>
              {(preview.hasOtherScopeData || preview.hasInvalidData) && (
                <p className={`mt-1 ${preview.hasInvalidData ? "text-red-500" : "text-amber-600"}`}>⚠ {preview.message}</p>
              )}
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" className="h-8 text-xs" onClick={confirmImport}>确认导入</Button>
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={cancelImport}>取消</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
