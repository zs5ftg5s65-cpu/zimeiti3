import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Film, Plus, Trash2, Copy, Check, ChevronDown, ChevronUp, Wand2, Download, RefreshCw, Camera, Mic, Subtitles, Scissors, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import type { SelfMediaStore } from "@/hooks/useSelfMediaStore";
import type { Script, Shot, ContentType } from "@/data/selfmedia3-types";
import { AIDisconnectedBanner, EmptyState, CopyPromptButton } from "./shared";
import { callAI, extractJSON } from "@/lib/aiService";
import { loadAIConfig } from "@/lib/aiConfig";

const CONTENT_TYPES: ContentType[] = ["老板娘口播", "菜品制作", "后厨实拍", "日常vlog", "食材科普", "门店展示", "故事讲述", "团购推荐", "图文笔记"];
const emptyShot = (n:number): Shot => ({ shotNumber:n,time:"",shotSize:"中景",visual:"",action:"",dialogue:"",subtitle:"",sound:"自然环境声 + 轻BGM",shootingNote:"不拍客人",editingNote:"",isRequired:true,status:"未拍" });

type ConfirmFacts = {
  dish: string;
  price: string;
  promotion: string;
  realStory: string;
  storeFeature: string;
  availableMaterials: string;
  forbiddenClaims: string;
};

const EMPTY_FACTS: ConfirmFacts = {
  dish: "", price: "", promotion: "", realStory: "", storeFeature: "", availableMaterials: "", forbiddenClaims: "销量、排名、顾客评价、虚构经历、未经确认的价格",
};

const scriptToText = (s: Script) => [
  `《${s.title}》`,
  `目标用户：${s.targetUser || "未填写"}`,
  `视频目标：${s.goal || "未填写"}`,
  `人物：${s.person || "老板娘"}`,
  `菜品：${s.dish || "未填写"}`,
  `时长：${s.estimatedDuration || "未填写"}`,
  `类型：${s.contentType}`,
  "",
  "【完整口播台词】",
  s.shots.map(x => x.dialogue).filter(Boolean).join(" "),
  "",
  "【逐镜头拍摄执行表】",
  ...s.shots.map(x => [
    `镜头${x.shotNumber}｜${x.time}｜${x.shotSize}｜${x.isRequired ? "必拍" : "可选"}`,
    `画面：${x.visual}`,
    `动作：${x.action}`,
    `台词：${x.dialogue}`,
    `字幕：${x.subtitle}`,
    `声音/BGM：${x.sound}`,
    `拍摄备注：${x.shootingNote}`,
    `剪辑备注：${x.editingNote}`,
    "",
  ].join("\n")),
  `拍摄顺序：${s.shootingOrder || "按镜头顺序"}`,
  `必拍镜头：${s.requiredShots || ""}`,
  `可选镜头：${s.optionalShots || ""}`,
  `素材准备：${s.missingMaterials || ""}`,
].join("\n");

export default function ScriptDirectorPanel({ store, currentDay = 1 }: { store: SelfMediaStore; currentDay?: number }) {
  const [activeId,setActiveId]=useState<string|null>(null);
  const [showMeta,setShowMeta]=useState(true);
  const [busy,setBusy]=useState(false);
  const [facts,setFacts]=useState<ConfirmFacts>({...EMPTY_FACTS});
  const [factsConfirmed,setFactsConfirmed]=useState(false);
  const filtered=store.scripts.filter(s=>s.accountId===store.currentAccount&&s.storeId===store.currentStore);
  const dayScripts=filtered.filter(s=>s.day===currentDay).sort((a,b)=>b.createdAt-a.createdAt);
  const dayTopic=store.topics.filter(t=>t.accountId===store.currentAccount&&t.storeId===store.currentStore&&t.day===currentDay).sort((a,b)=>b.createdAt-a.createdAt)[0]||null;
  const active=filtered.find(s=>s.id===activeId)||dayScripts[0]||filtered[0]||null;
  const sourceTopic=active?.sourceTopicId?store.topics.find(t=>t.id===active.sourceTopicId):dayTopic;

  const update=(patch:Partial<Script>)=>{if(active)store.updateScript(active.id,{...patch,updatedAt:Date.now()});};
  const newScript=()=>{const s=store.addScript({title:"新脚本",targetUser:"",goal:"",person:"老板娘",dish:"",estimatedDuration:"90秒",contentType:"老板娘口播",shots:[emptyShot(1),emptyShot(2),emptyShot(3)],requiredMediaIds:[],shootingOrder:"",requiredShots:"",optionalShots:"",missingMaterials:"",status:"草稿",createdAt:Date.now(),updatedAt:Date.now()});setActiveId(s.id);setFacts({...EMPTY_FACTS});setFactsConfirmed(false);};
  const makeToday=()=>{if(!dayTopic){toast.error("今天还没有选题");return;}const s=store.createScriptFromTopic(dayTopic,currentDay);if(s){setActiveId(s.id);setFacts({...EMPTY_FACTS,dish:dayTopic.recommendedDish||""});setFactsConfirmed(false);toast.success("今日脚本已建立，请先完成事实确认");}};
  const copyDuplicate=()=>{if(!active)return;const s=store.addScript({...active,title:`${active.title}（副本）`,status:"草稿",createdAt:Date.now(),updatedAt:Date.now()} as Omit<Script,"id"|"accountId"|"storeId">);setActiveId(s.id);toast.success("脚本已复制");};
  const copyFull=async()=>{if(!active)return;await navigator.clipboard.writeText(scriptToText(active));toast.success("完整脚本已复制");};
  const remove=()=>{if(!active)return;if(confirm(`确定删除《${active.title}》吗？`)){store.removeScript(active.id);setActiveId(null);}};
  const updateShot=(i:number,p:Partial<Shot>)=>{if(!active)return;const shots=active.shots.map((x,n)=>n===i?{...x,...p}:x);update({shots});};
  const download=()=>{if(!active)return;const blob=new Blob([scriptToText(active)],{type:"text/plain;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`${active.title||"短视频脚本"}_完整拍摄执行表.txt`;a.click();URL.revokeObjectURL(url);toast.success("完整脚本已下载");};

  const buildPrompt=(action:string)=>{
    const context=sourceTopic?`选题：${sourceTopic.title}\nHook：${sourceTopic.hook}\n痛点：${sourceTopic.painPoint}\n核心观点：${sourceTopic.coreOpinion}\n结构：${sourceTopic.structure}\nCTA：${sourceTopic.cta}\n推荐菜品：${sourceTopic.recommendedDish}`:"";
    const factText=`老板娘已确认事实：\n菜品：${facts.dish||"本条不涉及"}\n价格：${facts.price||"不展示/未确认，不得自行编造"}\n优惠/团购：${facts.promotion||"本条不涉及"}\n真实经历：${facts.realStory||"不使用个人经历"}\n门店真实特点：${facts.storeFeature||"不额外添加"}\n现有素材：${facts.availableMaterials||"以现场可拍素材为准"}\n禁止出现：${facts.forbiddenClaims||"不编造任何事实"}`;
    return `你是资深餐饮实体店短视频编导，同时负责现场拍摄执行。请${action}。\n\n${context}\n\n${factText}\n\n当前脚本：${JSON.stringify({title:active?.title,targetUser:active?.targetUser,goal:active?.goal,person:active?.person,dish:active?.dish,estimatedDuration:active?.estimatedDuration,contentType:active?.contentType,shots:active?.shots})}\n\n【成片标准】\n1. 默认成片约90秒；如果明确要求30秒则严格压缩到30秒。90秒口播正文控制在约260-330个中文字符，必须读得完，镜头时间总和必须约等于成片时长。\n2. 必须生成12-16个镜头。每个镜头必须能让一个普通餐饮老板拿手机直接执行，不能写空泛的“展示一下”“介绍一下”。\n3. 每个镜头必须完整填写：shotNumber、time、shotSize、visual、action、dialogue、subtitle、sound、shootingNote、editingNote、isRequired、status。\n4. 台词必须是老板娘第一人称、自然口语、可以直接照着说；必须把开头Hook、冲突/反差、具体细节、价值信息、转折、菜品/门店展示、结尾CTA完整写出来。不要把“镜头说明”当台词。\n5. 镜头与台词必须一一对应：台词说到什么，画面就拍什么；需要展示锅、食材、成品、后厨动作时，明确写出手机怎么拍、拍什么细节、手怎么动。\n6. 前3秒必须给出明确钩子；中段必须有信息增量；结尾必须有自然行动指令。不要开场自我介绍式废话。\n7. 必须同时给出完整口播台词、逐镜头表、拍摄顺序、必拍镜头、可选镜头、素材准备。\n8. 只使用已确认事实。任何未确认价格、销量、评价、排名、顾客反馈、个人经历不得自行补充。不要输出“【需要老板娘确认】”、不要输出“待确认”、不要留下模棱两可的占位符；未确认内容直接不写。\n9. 严格禁止拍客人、路人正脸和儿童；不要虚构排队、爆单、好评。\n10. 语言要像真实餐饮老板娘说话，不要营销腔、不要AI腔，不要“大家好今天给大家分享”。\n\n必须只输出严格JSON，不要Markdown。JSON必须包含：title,targetUser,goal,person,dish,estimatedDuration,contentType,shots,shootingOrder,requiredShots,optionalShots,missingMaterials。`;
  };

  const aiGenerate=async(action:string, scriptOverride?:Script)=>{
    const target=scriptOverride||active;
    if(!target||busy)return;
    if(!factsConfirmed){toast.error("请先在“老板娘事实确认”里确认本条视频事实，再生成脚本");return;}
    setBusy(true);
    try{
      const oldActive=active;
      const prompt=buildPrompt(action);
      const result=await callAI(prompt,loadAIConfig());
      const d=extractJSON<Record<string,unknown>>(result.content);
      const rawShots=Array.isArray(d.shots)?d.shots:[];
      if(rawShots.length<12)throw new Error("AI返回镜头不足12个，请重新生成");
      const shots=rawShots.slice(0,16).map((x,i)=>{const q=x as Partial<Shot>;return {...emptyShot(i+1),...q,shotNumber:i+1,status:"未拍"};});
      store.updateScript(target.id,{title:String(d.title||target.title),targetUser:String(d.targetUser||target.targetUser),goal:String(d.goal||target.goal),person:String(d.person||target.person||"老板娘"),dish:String(d.dish||target.dish),estimatedDuration:String(d.estimatedDuration||target.estimatedDuration||"90秒"),contentType:(d.contentType||target.contentType) as ContentType,shots,shootingOrder:String(d.shootingOrder||"按镜头1→最后一个镜头顺序拍摄；需要食材/成品/后厨空镜的镜头可集中拍完再剪辑"),requiredShots:String(d.requiredShots||shots.filter(s=>s.isRequired).map(s=>`镜头${s.shotNumber}`).join("、")),optionalShots:String(d.optionalShots||shots.filter(s=>!s.isRequired).map(s=>`镜头${s.shotNumber}`).join("、")),missingMaterials:String(d.missingMaterials||facts.availableMaterials||""),status:"草稿",updatedAt:Date.now()});
      setActiveId(target.id);
      toast.success("已生成可直接拍摄的完整脚本");
      void oldActive;
    }catch(e){toast.error(e instanceof Error?e.message:"AI生成失败");}finally{setBusy(false);}
  };

  const externalPrompt=useMemo(()=>buildPrompt("生成一份可以直接拍摄的完整短视频脚本"),[active?.id,active?.title,active?.targetUser,active?.goal,active?.person,active?.dish,active?.estimatedDuration,active?.contentType,active?.shots,sourceTopic?.id,facts]);

  return <div className="space-y-4 min-w-0" data-sm3-page>
    <AIDisconnectedBanner feature="AI脚本导演" />
    <div className="flex items-center justify-between gap-2 flex-wrap min-w-0"><div className="min-w-0"><h3 className="text-sm font-medium flex items-center gap-1.5"><Film className="size-4 shrink-0"/>脚本导演（{filtered.length}）</h3><p className="text-[10px] text-muted-foreground">Day{currentDay}：{dayScripts.length}条任务脚本</p></div><div className="flex gap-1.5 flex-wrap"><Button size="sm" variant="outline" onClick={makeToday} disabled={!dayTopic}><Wand2 className="size-3.5 mr-1"/>生成今日脚本</Button><Button size="sm" onClick={newScript}><Plus className="size-3.5 mr-1"/>新建脚本</Button></div></div>
    {filtered.length>0&&<div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">{filtered.map(s=><button key={s.id} onClick={()=>{setActiveId(s.id);setFacts({...EMPTY_FACTS,dish:s.dish||""});setFactsConfirmed(false);}} className={`shrink-0 px-3 py-1.5 rounded-md text-xs ${active?.id===s.id?"bg-primary text-primary-foreground":"bg-muted/50"}`}>{s.title.slice(0,12)}{s.day?` · D${s.day}`:" · 自由"}</button>)}</div>}
    {!active?<EmptyState title="暂无脚本" desc="先生成今日脚本或新建自由脚本"/>:<>
      <Card className="border-amber-200 bg-amber-50/40"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ClipboardCheck className="size-4"/>老板娘事实确认（生成前必须确认）</CardTitle></CardHeader><CardContent className="space-y-3"><p className="text-xs text-amber-800">这里确认过的内容才允许进入最终脚本。没有确认的事实，AI会直接不写，不再在脚本里留下“需要确认”的模棱两可文字。</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-2"><Input value={facts.dish} onChange={e=>setFacts({...facts,dish:e.target.value})} placeholder="本条实际拍什么菜品（可留空）"/><Input value={facts.price} onChange={e=>setFacts({...facts,price:e.target.value})} placeholder="实际价格（不展示就填：不展示）"/><Input value={facts.promotion} onChange={e=>setFacts({...facts,promotion:e.target.value})} placeholder="真实优惠/团购信息（没有就留空）"/><Input value={facts.storeFeature} onChange={e=>setFacts({...facts,storeFeature:e.target.value})} placeholder="门店真实特点（例如庭院、包厢等）"/></div><Textarea value={facts.realStory} onChange={e=>setFacts({...facts,realStory:e.target.value})} rows={3} placeholder="真实经历/故事：只写你确认发生过的事情；没有就留空。"/><Textarea value={facts.availableMaterials} onChange={e=>setFacts({...facts,availableMaterials:e.target.value})} rows={2} placeholder="你现在能拍到的素材：食材、锅、成品、后厨、门头、环境等。"/><Textarea value={facts.forbiddenClaims} onChange={e=>setFacts({...facts,forbiddenClaims:e.target.value})} rows={2} placeholder="明确禁止出现的说法，例如：不写销量、不写价格、不写顾客评价。"/><label className="flex items-start gap-2 text-xs text-foreground"><input type="checkbox" checked={factsConfirmed} onChange={e=>setFactsConfirmed(e.target.checked)} className="mt-0.5"/><span>我确认以上内容真实有效；空白项代表本条不使用；生成后不再出现未经确认的事实。</span></label></CardContent></Card>

      <div className="flex gap-2 flex-wrap"><Button size="sm" variant="outline" onClick={copyFull}><Copy className="size-3.5 mr-1"/>复制完整脚本</Button><Button size="sm" variant="outline" onClick={copyDuplicate}><Copy className="size-3.5 mr-1"/>复制成新脚本</Button><Button size="sm" variant="outline" onClick={download}><Download className="size-3.5 mr-1"/>下载完整脚本</Button><Button size="sm" variant="outline" onClick={()=>void aiGenerate("重新生成一份完整90秒脚本") } disabled={busy||!factsConfirmed}><RefreshCw className="size-3.5 mr-1"/>{busy?"AI生成中…":"不满意？重新生成"}</Button><Button size="sm" variant="outline" className="text-destructive" onClick={remove}><Trash2 className="size-3.5 mr-1"/>删除</Button></div>
      {sourceTopic&&<Card className="border-blue-200 bg-blue-50/40"><CardContent className="p-3 min-w-0"><p className="text-[10px] text-blue-600">来源选题</p><p className="text-sm font-medium break-words">{sourceTopic.title}</p><p className="text-xs text-muted-foreground mt-1 break-words">Hook：{sourceTopic.hook}</p></CardContent></Card>}
      <Card><CardHeader className="pb-2 cursor-pointer" onClick={()=>setShowMeta(!showMeta)}><CardTitle className="text-sm flex justify-between">脚本信息{showMeta?<ChevronUp className="size-4"/>:<ChevronDown className="size-4"/>}</CardTitle></CardHeader>{showMeta&&<CardContent className="space-y-2"><Input value={active.title} onChange={e=>update({title:e.target.value})} placeholder="视频标题"/><div className="grid grid-cols-1 sm:grid-cols-2 gap-2"><Input value={active.targetUser} onChange={e=>update({targetUser:e.target.value})} placeholder="目标用户"/><select value={active.contentType} onChange={e=>update({contentType:e.target.value as ContentType})} className="h-9 w-full min-w-0 px-2 rounded-md border bg-background text-sm">{CONTENT_TYPES.map(x=><option key={x}>{x}</option>)}</select></div><div className="grid grid-cols-1 sm:grid-cols-3 gap-2"><Input value={active.person} onChange={e=>update({person:e.target.value})} placeholder="人物"/><Input value={active.dish} onChange={e=>update({dish:e.target.value})} placeholder="菜品"/><Input value={active.estimatedDuration} onChange={e=>update({estimatedDuration:e.target.value})} placeholder="时长"/></div><Textarea value={active.goal} onChange={e=>update({goal:e.target.value})} rows={3} className="whitespace-pre-wrap break-words" placeholder="视频目标"/></CardContent>}</Card>

      <Card className="border-primary/20 bg-primary/[0.02]"><CardContent className="p-3 space-y-2 min-w-0"><p className="text-xs font-medium"><Wand2 className="size-3.5 inline mr-1"/>网页内AI导演</p><p className="text-xs text-muted-foreground">已接入网页AI。直接生成、直接覆盖；不满意可再次生成。下面同时保留可复制的外部AI提示词，方便你需要时去外部AI生成。</p><div className="flex flex-wrap gap-1.5"><Button size="sm" onClick={()=>void aiGenerate("重新生成一份完整90秒脚本")} disabled={busy||!factsConfirmed}>{busy?"生成中…":"AI直接生成完整脚本"}</Button><Button size="sm" variant="outline" onClick={()=>void aiGenerate("只优化前3秒Hook，同时保持后续结构和已确认事实不变")} disabled={busy||!factsConfirmed}>优化Hook</Button><Button size="sm" variant="outline" onClick={()=>void aiGenerate("把整篇改成老板娘自然口语，同时保留全部事实和镜头执行信息")} disabled={busy||!factsConfirmed}>老板娘口语版</Button><Button size="sm" variant="outline" onClick={()=>void aiGenerate("增加真实冲突和反差，但只能使用已确认事实")} disabled={busy||!factsConfirmed}>增加冲突反差</Button><Button size="sm" variant="outline" onClick={()=>void aiGenerate("压缩成严格30秒可拍版本，重新计算台词和时间轴")} disabled={busy||!factsConfirmed}>30秒版</Button><CopyPromptButton prompt={externalPrompt} label="复制外部AI完整提示词"/></div></CardContent></Card>

      <Card className="border-emerald-200 bg-emerald-50/30"><CardContent className="p-3 space-y-2"><p className="text-xs font-medium text-emerald-800">完整脚本预览 · 共 {active.shots.length} 个镜头</p><p className="text-xs text-foreground/80 whitespace-pre-wrap break-words">{active.shots.map(x=>x.dialogue).filter(Boolean).join(" ") || "尚未生成完整台词"}</p></CardContent></Card>

      <div className="space-y-3">{active.shots.map((x,i)=><Card key={i} className="border-l-4 border-l-primary min-w-0"><CardContent className="p-3 space-y-2 min-w-0"><div className="flex justify-between gap-2"><div className="flex gap-1.5 items-center"><Badge>镜头{x.shotNumber}</Badge><Badge variant="outline">{x.shotSize||"中景"}</Badge></div><label className="text-[10px] flex items-center gap-1 shrink-0"><input type="checkbox" checked={x.isRequired} onChange={e=>updateShot(i,{isRequired:e.target.checked})}/>必拍</label></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-2"><Input value={x.time} onChange={e=>updateShot(i,{time:e.target.value})} placeholder="时间"/><Input value={x.shotSize} onChange={e=>updateShot(i,{shotSize:e.target.value})} placeholder="景别"/></div><label className="text-[10px] text-muted-foreground flex items-center gap-1"><Camera className="size-3"/>画面</label><Textarea value={x.visual} onChange={e=>updateShot(i,{visual:e.target.value})} rows={4} className="whitespace-pre-wrap break-words" placeholder="具体拍什么、手机放哪里、拍哪些细节"/><Textarea value={x.action} onChange={e=>updateShot(i,{action:e.target.value})} rows={2} className="whitespace-pre-wrap break-words" placeholder="人物动作"/><div className="bg-primary/[0.03] p-2 rounded min-w-0"><label className="text-[10px] text-muted-foreground flex items-center gap-1"><Mic className="size-3"/>台词（直接照着说）</label><Textarea value={x.dialogue} onChange={e=>updateShot(i,{dialogue:e.target.value})} rows={5} className="whitespace-pre-wrap break-words" placeholder="老板娘可以直接照着说的完整口语"/></div><div className="bg-muted/30 p-2 rounded min-w-0"><label className="text-[10px] text-muted-foreground flex items-center gap-1"><Subtitles className="size-3"/>字幕</label><Textarea value={x.subtitle} onChange={e=>updateShot(i,{subtitle:e.target.value})} rows={2} className="whitespace-pre-wrap break-words"/></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-2"><Textarea value={x.sound} onChange={e=>updateShot(i,{sound:e.target.value})} rows={2} className="whitespace-pre-wrap break-words" placeholder="声音/BGM"/><Textarea value={x.editingNote} onChange={e=>updateShot(i,{editingNote:e.target.value})} rows={2} className="whitespace-pre-wrap break-words" placeholder="剪辑备注"/></div><Textarea value={x.shootingNote} onChange={e=>updateShot(i,{shootingNote:e.target.value})} rows={2} className="whitespace-pre-wrap break-words" placeholder="拍摄备注"/><Button size="sm" variant={x.status==="已拍"?"default":"outline"} onClick={()=>updateShot(i,{status:x.status==="已拍"?"未拍":"已拍"})}>{x.status==="已拍"?<><Check className="size-3 mr-1"/>已拍</>:"标记已拍"}</Button></CardContent></Card>)}</div>

      <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1.5"><Scissors className="size-4"/>拍摄与剪辑执行清单</CardTitle></CardHeader><CardContent className="space-y-2 min-w-0"><Textarea value={active.shootingOrder} onChange={e=>update({shootingOrder:e.target.value})} rows={3} className="whitespace-pre-wrap break-words" placeholder="拍摄顺序"/><Textarea value={active.requiredShots} onChange={e=>update({requiredShots:e.target.value})} rows={3} className="whitespace-pre-wrap break-words" placeholder="必拍镜头清单"/><Textarea value={active.optionalShots} onChange={e=>update({optionalShots:e.target.value})} rows={3} className="whitespace-pre-wrap break-words" placeholder="可选镜头"/><Textarea value={active.missingMaterials} onChange={e=>update({missingMaterials:e.target.value})} rows={3} className="whitespace-pre-wrap break-words" placeholder="拍摄前需要准备的素材"/></CardContent></Card>
    </>}
  </div>;
}
