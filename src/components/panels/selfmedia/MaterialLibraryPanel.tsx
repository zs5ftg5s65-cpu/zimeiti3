import { useState, useRef, useEffect } from "react";
import { scopedStorage } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Folder, Upload, Plus, Search, Filter, Image, Video, Check, X, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { MATERIAL_TYPES, STORES, type MaterialType, type StoreType, type IMaterial, SAMPLE_MATERIALS } from "@/data/selfmedia-daily";

export default function MaterialLibraryPanel() {
  const [activeTab, setActiveTab] = useState("library");
  const [materials, setMaterials] = useState<IMaterial[]>(() => {
    try { const raw = scopedStorage.getItem("__selfmedia_materials"); return raw ? JSON.parse(raw) : SAMPLE_MATERIALS; } catch { return SAMPLE_MATERIALS; }
  });
  useEffect(() => { try { scopedStorage.setItem("__selfmedia_materials", JSON.stringify(materials)); } catch {} }, [materials]);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStore, setFilterStore] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; type: string; size: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<IMaterial>>({
    shootDate: "",
    type: "老板娘",
    person: "",
    store: "广德光英土菜馆",
    dish: "",
    scene: "",
    fileType: "图片",
    duration: "",
    description: "",
    isUsed: false,
    usedVideoId: "",
    remark: "",
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    setUploadedFile({
      name: file.name,
      type: isVideo ? "视频" : "图片",
      size: file.size,
    });
    setFormData(prev => ({ ...prev, fileType: isVideo ? "视频" : "图片" }));
    toast.success(`已选择文件：${file.name}`);
    e.target.value = "";
  };

  const filteredMaterials = materials.filter(m => {
    if (filterType !== "all" && m.type !== filterType) return false;
    if (filterStore !== "all" && m.store !== filterStore) return false;
    if (searchQuery && !m.description.includes(searchQuery) && !m.dish.includes(searchQuery) && !m.scene.includes(searchQuery)) return false;
    return true;
  });

  const handleSave = () => {
    if (!formData.shootDate || !formData.type) {
      toast.error("请填写拍摄日期和素材类型");
      return;
    }

    if (editingId) {
      setMaterials(prev => prev.map(m => m.id === editingId ? { ...m, ...formData } as IMaterial : m));
      toast.success("素材已更新");
      setEditingId(null);
    } else {
      const newMaterial: IMaterial = {
        id: `M${Date.now()}`,
        shootDate: formData.shootDate || "",
        type: formData.type as MaterialType,
        person: formData.person || "",
        store: formData.store as StoreType,
        dish: formData.dish || "",
        scene: formData.scene || "",
        fileType: formData.fileType as "图片" | "视频",
        duration: formData.duration || "",
        description: formData.description || "",
        isUsed: formData.isUsed || false,
        usedVideoId: formData.usedVideoId || "",
        remark: formData.remark || "",
      };
      setMaterials(prev => [newMaterial, ...prev]);
      toast.success("素材已添加到素材库");
    }

    setFormData({
      shootDate: "", type: "老板娘", person: "", store: "广德光英土菜馆",
      dish: "", scene: "", fileType: "图片", duration: "", description: "",
      isUsed: false, usedVideoId: "", remark: "",
    });
    setUploadedFile(null);
    setShowAddForm(false);
  };

  const handleEdit = (material: IMaterial) => {
    setFormData(material);
    setEditingId(material.id);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
    toast.success("素材已删除");
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const typeColors: Record<string, string> = {
    "老板娘": "bg-pink-100 text-pink-700",
    "厨师": "bg-blue-100 text-blue-700",
    "后厨": "bg-orange-100 text-orange-700",
    "食材": "bg-green-100 text-green-700",
    "广德炖锅": "bg-red-100 text-red-700",
    "其他菜品": "bg-purple-100 text-purple-700",
    "门店": "bg-yellow-100 text-yellow-700",
    "环境": "bg-cyan-100 text-cyan-700",
    "经营日常": "bg-indigo-100 text-indigo-700",
    "空镜": "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="library"><Folder className="h-4 w-4 mr-1" />素材库（{materials.length}）</TabsTrigger>
          <TabsTrigger value="add"><Plus className="h-4 w-4 mr-1" />添加素材</TabsTrigger>
        </TabsList>

        {/* 素材库列表 */}
        <TabsContent value="library" className="mt-4 space-y-3">
          {/* 筛选和搜索 */}
          <div className="flex gap-2 flex-wrap">
            <div className="flex-1 min-w-[150px]">
              <Input
                placeholder="搜索素材描述/菜品/场景"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue placeholder="素材类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                {MATERIAL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStore} onValueChange={setFilterStore}>
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue placeholder="门店" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部门店</SelectItem>
                {STORES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[450px] pr-4">
            <div className="space-y-2">
              {filteredMaterials.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Folder className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>没有找到匹配的素材</p>
                  </CardContent>
                </Card>
              ) : (
                filteredMaterials.map((material) => (
                  <Card key={material.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={typeColors[material.type] || "bg-gray-100"} variant="secondary">{material.type}</Badge>
                            <Badge variant="outline">{material.store}</Badge>
                            {material.fileType === "视频" ? <Video className="h-4 w-4 text-blue-500" /> : <Image className="h-4 w-4 text-green-500" />}
                            {material.isUsed && <Badge variant="default">已使用</Badge>}
                          </div>
                          <div className="text-sm font-medium">{material.description || "无描述"}</div>
                          <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3">
                            <span>拍摄：{material.shootDate}</span>
                            {material.person && <span>人物：{material.person}</span>}
                            {material.dish && <span>菜品：{material.dish}</span>}
                            {material.scene && <span>场景：{material.scene}</span>}
                            {material.duration && <span>时长：{material.duration}</span>}
                            {material.usedVideoId && <span>用于：{material.usedVideoId}</span>}
                          </div>
                          {material.remark && <div className="text-xs text-muted-foreground mt-1">备注：{material.remark}</div>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(material)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(material.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* 添加/编辑素材 */}
        <TabsContent value="add" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{editingId ? "编辑素材" : "添加新素材"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 文件上传 */}
              <div>
                <label className="text-sm font-medium mb-2 block">上传素材文件</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <div
                  className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadedFile ? (
                    <div className="flex items-center justify-center gap-3">
                      {uploadedFile.type === "视频" ? <Video className="h-6 w-6 text-blue-500" /> : <Image className="h-6 w-6 text-green-500" />}
                      <div className="text-left">
                        <div className="text-sm font-medium">{uploadedFile.name}</div>
                        <div className="text-xs text-muted-foreground">{uploadedFile.type} · {formatSize(uploadedFile.size)}</div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-1" />
                      <p className="text-sm">点击上传图片或视频</p>
                      <p className="text-xs text-muted-foreground">支持 jpg/png/mp4 等格式</p>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">拍摄日期 *</label>
                  <Input type="date" value={formData.shootDate} onChange={(e) => setFormData(prev => ({ ...prev, shootDate: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">素材类型 *</label>
                  <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v as MaterialType }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MATERIAL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">所属门店</label>
                  <Select value={formData.store} onValueChange={(v) => setFormData(prev => ({ ...prev, store: v as StoreType }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STORES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">人物</label>
                  <Input placeholder="如 光英/厨师" value={formData.person} onChange={(e) => setFormData(prev => ({ ...prev, person: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">相关菜品</label>
                  <Input placeholder="如 广德炖锅/香芋煲" value={formData.dish} onChange={(e) => setFormData(prev => ({ ...prev, dish: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">拍摄场景</label>
                  <Input placeholder="如 后厨/门头/包厢" value={formData.scene} onChange={(e) => setFormData(prev => ({ ...prev, scene: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">素材时长（视频）</label>
                  <Input placeholder="如 15秒" value={formData.duration} onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">是否已使用</label>
                  <Select value={formData.isUsed ? "yes" : "no"} onValueChange={(v) => setFormData(prev => ({ ...prev, isUsed: v === "yes" }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">未使用</SelectItem>
                      <SelectItem value="yes">已使用</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.isUsed && (
                  <div className="col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 block">使用的视频ID</label>
                    <Input placeholder="如 V001" value={formData.usedVideoId} onChange={(e) => setFormData(prev => ({ ...prev, usedVideoId: e.target.value }))} />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">素材描述</label>
                <Textarea placeholder="描述素材内容、画面特点、适合用在什么地方..." value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} className="h-20" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">备注</label>
                <Input placeholder="其他备注信息" value={formData.remark} onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))} />
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleSave}>
                  <Check className="h-4 w-4 mr-2" />{editingId ? "保存修改" : "添加素材"}
                </Button>
                {editingId && (
                  <Button variant="outline" onClick={() => { setEditingId(null); setShowAddForm(false); setFormData({ shootDate: "", type: "老板娘", person: "", store: "广德光英土菜馆", dish: "", scene: "", fileType: "图片", duration: "", description: "", isUsed: false, usedVideoId: "", remark: "" }); setUploadedFile(null); }}>
                    取消
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
