import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Headphones,
  Tv,
  Lightbulb,
  ExternalLink,
  Wrench,
  Smartphone,
  Globe,
} from 'lucide-react';
import { MOCK_ENGLISH_RESOURCES } from '@/data/english';

interface EnglishResourcesPanelProps {
  showTools?: boolean;
}

const tools = [
  {
    category: '背单词',
    icon: Smartphone,
    items: [
      { name: '墨墨背单词', desc: '艾宾浩斯遗忘曲线，自定义词书' },
      { name: '不背单词', desc: '真实语境例句，颜值高' },
      { name: 'Anki', desc: '开源卡片工具，自定义度极高' },
    ],
  },
  {
    category: '听力 / 播客',
    icon: Headphones,
    items: [
      { name: '小宇宙 / Apple Podcasts', desc: '播客 App，搜索英文节目' },
      { name: '每日英语听力', desc: '海量素材，支持逐句精听' },
      { name: 'Spotify', desc: '英文播客和有声书资源丰富' },
    ],
  },
  {
    category: '口语 / 发音',
    icon: Globe,
    items: [
      { name: 'Cambly / italki', desc: '外教一对一口语练习' },
      { name: '英语流利说', desc: 'AI 打分，跟读练习' },
      { name: 'ELSA Speak', desc: 'AI 发音纠错，精准到音素' },
    ],
  },
  {
    category: '阅读 / 写作',
    icon: Lightbulb,
    items: [
      { name: 'The New York Times', desc: '权威英文新闻' },
      { name: 'Medium', desc: '各类主题英文文章' },
      { name: 'Grammarly', desc: '英文语法检查和写作助手' },
    ],
  },
];

function ResourceCard({
  resource,
  index,
  icon: Icon,
}: {
  resource: any;
  index: number;
  icon: any;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-[11px]">
              {resource.level}
            </Badge>
            <Icon className="size-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-sm font-semibold mt-2">{resource.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground leading-relaxed">{resource.description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function EnglishResourcesPanel({ showTools = false }: EnglishResourcesPanelProps) {
  const podcasts = MOCK_ENGLISH_RESOURCES.filter((r) => r.category === 'podcast');
  const tvshows = MOCK_ENGLISH_RESOURCES.filter((r) => r.category === 'tvshow');
  const teds = MOCK_ENGLISH_RESOURCES.filter((r) => r.category === 'ted');

  if (showTools) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-5"
      >
        <Card className="border-info/20 bg-info/[0.02]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="size-5 text-info" />
              学习平台与工具推荐
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80">
              根据你的基础（四六级已过）和学习目标（口语+工作场景应用），推荐以下工具组合，
              选择 2-3 个坚持使用比下载一堆 App 更有效。
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {tools.map((group, gi) => (
            <Card key={gi}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <group.icon className="size-4 text-foreground/70" />
                  {group.category}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {group.items.map((item, ii) => (
                  <div key={ii} className="p-3 rounded-lg bg-muted/30 border border-border/40">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <ExternalLink className="size-3.5 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-primary/20 bg-primary/[0.02]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="size-4 text-primary" />
              学习建议
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-foreground/85 list-disc list-inside">
              <li>不要贪多，每个类别选 1 个工具坚持用 30 天</li>
              <li>利用碎片时间（洗菜、走路、饭后）听播客磨耳朵</li>
              <li>晚上学完后大声朗读当天内容，录下来回听找问题</li>
              <li>周末用完整的 1 集剧/TED 做精听训练</li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card className="border-info/20 bg-info/[0.02]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">推荐英语学习资源清单</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground/80">
            精选适合四六级后水平的播客、美剧和 TED，内容有趣不枯燥，既能学英语又能涨知识。
            建议每个类别选 1-2 个深入听/看，不要贪多。
          </p>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Headphones className="size-4 text-info" />
          播客推荐
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {podcasts.map((r, i) => (
            <ResourceCard key={r.id} resource={r} index={i} icon={Headphones} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Tv className="size-4 text-info" />
          美剧 / 英剧推荐
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {tvshows.map((r, i) => (
            <ResourceCard key={r.id} resource={r} index={i} icon={Tv} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Lightbulb className="size-4 text-info" />
          TED 推荐主题
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {teds.map((r, i) => (
            <ResourceCard key={r.id} resource={r} index={i} icon={Lightbulb} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
