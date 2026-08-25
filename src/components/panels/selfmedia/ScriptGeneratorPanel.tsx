import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wand2, Copy, Check, X, Image, Video, FileText, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";
import { SAMPLE_SCRIPTS, TOPIC_LIBRARY } from "@/data/selfmedia-daily";

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  file: File;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function ScriptGeneratorPanel() {
  const [inputText, setInputText] = useState("");
  const [generatedScript, setGeneratedScript] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: UploadedFile[] = Array.from(files).map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      type: type,
      size: file.size,
      file: file,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    toast.success(`已上传 ${newFiles.length} 个素材，等待AI分析`);
    e.target.value = "";
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleGenerate = () => {
    if (!inputText.trim() && uploadedFiles.length === 0) {
      toast.error("请输入脚本需求或上传素材");
      return;
    }

    setIsGenerating(true);
    setGeneratedScript("");

    setTimeout(() => {
      const fileList = uploadedFiles.length > 0
        ? `\n\n【已上传素材】\n${uploadedFiles.map(f => `- ${f.name} (${f.type}, ${formatFileSize(f.size)}) - 等待AI分析内容`).join("\n")}`
        : "";

      const script = `【拍摄脚本】根据你的需求生成
${fileList}

注意：本脚本为模板生成，上传的图片/视频素材需要接入AI视觉分析能力后才能自动提取内容。当前版本请根据素材内容手动调整脚本。

镜头1（0-3秒）钩子：
画面：招牌菜特写，热气腾腾
台词："在江阴，这锅广德炖锅为什么一直有人惦记？我给你看它怎么做。"
字幕：广德炖锅｜为什么值得看

镜头2（3-8秒）引入：
画面：老板娘面对镜头，身后是门店
台词："我是光英，做徽菜馆的老板娘，今天跟你聊这锅炖锅。"
字幕：光英老板娘｜徽菜馆

镜头3（8-25秒）主体：
画面：食材展示→后厨制作→成品
台词："我们家这锅具体用了什么食材、炖多久，只按今天真实制作情况来讲。"
字幕：真实食材｜真实制作过程

镜头4（25-40秒）升华：
画面：成品端上桌，老板娘介绍
台词："做餐饮就是做良心，食材不能省，老客人吃的就是这份放心"
字幕：做餐饮就是做良心

镜头5（40-50秒）CTA：
画面：老板娘面对镜头微笑
台词："想了解今天这锅怎么做的，可以留言；最近要请客，也可以私信问当天的包厢和菜品情况。"
字幕：留言了解｜私信咨询

【BGM建议】轻快民谣+炒菜滋滋声
【拍摄备注】不拍客人正脸，自然光，不要过度美颜
【去AI化说明】台词口语化，像跟邻居聊天，不用书面语`;

      setGeneratedScript(script);
      setIsGenerating(false);
      toast.success("脚本模板已生成！请根据实际素材内容调整");
    }, 1000);
  };

  const handleCopy = () => {
    if (!generatedScript) return;
    navigator.clipboard.writeText(generatedScript);
    setCopied(true);
    toast.success("脚本已复制");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId);
    const topic = TOPIC_LIBRARY.find(t => t.id === topicId);
    if (topic) {
      setInputText(`选题：${topic.title}\n目标客户：${topic.targetCustomer}\n核心内容：${topic.coreContent}`);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate"><Wand2 className="h-4 w-4 mr-1" />智能写脚本</TabsTrigger>
          <TabsTrigger value="library"><FileText className="h-4 w-4 mr-1" />选题库</TabsTrigger>
          <TabsTrigger value="samples"><Sparkles className="h-4 w-4 mr-1" />脚本示例</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">输入需求，生成拍摄脚本</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">文字描述（菜品/主题/想表达的内容）</label>
                <Textarea
                  placeholder="例如：我想拍一条广德炖锅的视频，突出食材新鲜和慢炖工艺，结尾引导到店..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="h-32"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">上传素材（可选）</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, "图片")}
                  />
                  <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => imageInputRef.current?.click()}>
                    <Image className="h-5 w-5" />
                    <span className="text-xs">上传图片</span>
                  </Button>

                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, "视频")}
                  />
                  <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => videoInputRef.current?.click()}>
                    <Video className="h-5 w-5" />
                    <span className="text-xs">上传视频</span>
                  </Button>

                  <input
                    ref={textInputRef}
                    type="file"
                    accept=".txt,.doc,.docx,.pdf"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, "文本")}
                  />
                  <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => textInputRef.current?.click()}>
                    <Upload className="h-5 w-5" />
                    <span className="text-xs">上传文字</span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  上传图片/视频后，将显示文件信息。AI视觉分析需接入对应API后自动提取素材内容。
                </p>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">已上传素材（{uploadedFiles.length}个）</div>
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between bg-muted p-3 rounded-lg">
                      <div className="flex items-center gap-3 min-w-0">
                        {file.type === "图片" ? <Image className="h-4 w-4 shrink-0" /> : file.type === "视频" ? <Video className="h-4 w-4 shrink-0" /> : <FileText className="h-4 w-4 shrink-0" />}
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{file.name}</div>
                          <div className="text-xs text-muted-foreground">{file.type} · {formatFileSize(file.size)} · 等待AI分析</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleRemoveFile(file.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs space-y-1">
                <p className="font-medium text-amber-800">脚本生成说明：</p>
                <p className="text-amber-700">去AI化：口语化、接地气，符合50岁老板娘人设</p>
                <p className="text-amber-700">不拍客人：只拍老板娘、厨师、后厨、食材、菜品、门店</p>
                <p className="text-amber-700">结构：钩子(3秒)→引入→主体→升华→CTA引导</p>
                <p className="text-amber-700">上传的图片/视频素材需AI视觉分析能力才能自动提取内容，当前版本生成模板脚本</p>
              </div>

              <Button className="w-full" onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>生成中...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />生成拍摄脚本
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {generatedScript && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">生成的脚本</CardTitle>
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  复制
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <pre className="text-sm whitespace-pre-wrap font-sans">{generatedScript}</pre>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="library" className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">选题库（{TOPIC_LIBRARY.length}个选题）</h3>
            <Badge variant="secondary">点击选题生成脚本</Badge>
          </div>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {TOPIC_LIBRARY.map((topic) => (
                <Card
                  key={topic.id}
                  className={`cursor-pointer transition-colors ${selectedTopic === topic.id ? "border-primary" : ""}`}
                  onClick={() => handleTopicSelect(topic.id)}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{topic.title}</CardTitle>
                      <Badge variant={topic.priority === "高" ? "default" : "secondary"}>{topic.priority}优先级</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-2 text-sm">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline">{topic.contentType}</Badge>
                      {topic.bossOnCamera && <Badge variant="outline">老板娘出镜</Badge>}
                      {topic.needChef && <Badge variant="outline">需厨师</Badge>}
                      {topic.needDish && <Badge variant="outline">需菜品</Badge>}
                    </div>
                    <div><span className="text-muted-foreground">目标客户：</span>{topic.targetCustomer}</div>
                    <div><span className="text-muted-foreground">开头钩子：</span>{topic.hook}</div>
                    <div><span className="text-muted-foreground">CTA：</span>{topic.cta}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="samples" className="mt-4">
          <ScrollArea className="h-[550px] pr-4">
            <div className="space-y-4">
              {SAMPLE_SCRIPTS.map((script) => (
                <Card key={script.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{script.topic}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{script.videoType}</Badge>
                      <Badge variant="outline">时长：{script.targetDuration}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-primary/5 p-3 rounded-lg text-sm">
                      <span className="font-medium">开头钩子：</span>{script.openingHook}
                    </div>
                    <div className="space-y-2">
                      {script.shots.map((shot) => (
                        <div key={shot.shotNumber} className="border-l-2 border-primary pl-3 py-1">
                          <div className="text-sm font-medium">镜头{shot.shotNumber}（{shot.duration}）- {shot.shotType}</div>
                          <div className="text-xs text-muted-foreground">画面：{shot.visual}</div>
                          <div className="text-xs text-muted-foreground">台词：{shot.dialogue}</div>
                          <div className="text-xs text-muted-foreground">字幕：{shot.subtitle}</div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-primary/5 p-3 rounded-lg text-sm">
                      <span className="font-medium">结尾CTA：</span>{script.closingCTA}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
