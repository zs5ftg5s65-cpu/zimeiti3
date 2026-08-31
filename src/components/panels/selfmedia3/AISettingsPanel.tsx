import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, CheckCircle2, CircleAlert, Save, Wifi } from "lucide-react";
import { toast } from "sonner";
import { callAI } from "@/lib/aiService";
import { loadAIConfig, saveAIConfig } from "@/lib/aiConfig";

export default function AISettingsPanel() {
  const [config, setConfig] = useState(loadAIConfig);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const test = async () => {
    setTesting(true); setStatus("idle");
    try {
      await callAI("只返回两个字：连接成功", config);
      setStatus("ok"); toast.success("AI连接成功");
    } catch (e) {
      setStatus("error"); toast.error(e instanceof Error ? e.message : "AI连接失败");
    } finally { setTesting(false); }
  };
  return <div className="space-y-4">
    <Card className="border-primary/20 bg-primary/[0.03]">
      <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Bot className="size-4" />AI连接设置</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground">工作台通过安全API代理调用外部AI。API Key不保存在浏览器、不写入localStorage。</div>
        <div><label className="text-xs font-medium">AI接口地址</label><Input className="mt-1" value={config.endpoint} onChange={e => setConfig({ ...config, endpoint: e.target.value })} placeholder="/api/ai" /></div>
        <div><label className="text-xs font-medium">模型</label><Input className="mt-1" value={config.model} onChange={e => setConfig({ ...config, model: e.target.value })} placeholder="deepseek-chat" /></div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={() => { saveAIConfig(config); toast.success("AI设置已保存"); }}><Save className="size-3.5 mr-1" />保存设置</Button>
          <Button size="sm" variant="outline" disabled={testing} onClick={test}><Wifi className="size-3.5 mr-1" />{testing ? "连接测试中…" : "测试AI连接"}</Button>
          {status === "ok" && <Badge className="gap-1"><CheckCircle2 className="size-3" />已连接</Badge>}
          {status === "error" && <Badge variant="destructive" className="gap-1"><CircleAlert className="size-3" />连接失败</Badge>}
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-3 text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">当前推荐部署方式</p>
        <p>Vercel Serverless API + DeepSeek API。部署环境变量配置 DEEPSEEK_API_KEY，前端只访问 /api/ai。</p>
        <p>如果接口尚未部署，工作台仍可使用原来的复制Prompt模式，不会阻断手动工作流。</p>
      </CardContent>
    </Card>
  </div>;
}
