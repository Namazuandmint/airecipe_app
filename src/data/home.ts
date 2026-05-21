import type { Feature, Ingredient, Recipe } from '../types/ui'

export const primaryFeatures: Feature[] = [
  {
    title: '繝ｬ繧ｷ繝皮函謌・',
    description:
      '蝨ｨ蠎ｫ繝ｻ螂ｽ縺ｿ繝ｻ隱ｿ逅・凾髢薙°繧陰I縺檎鍵遶句呵｣懊ｒ菴懈・',
    action: '菴懊ｊ縺溘＞譁咏炊繧呈爾縺・',
    icon: 'spark',
    tone: 'green',
  },
  {
    title: '鬟滓攝逋ｻ骭ｲ',
    description:
      '謇句・蜉帙√Ξ繧ｷ繝ｼ繝域聴蠖ｱ縲∫判蜒剰ｪ崎ｭ倥〒蜀ｷ阡ｵ蠎ｫ縺ｫ霑ｽ蜉',
    action: '鬟滓攝繧定ｿｽ蜉縺吶ｋ',
    icon: 'basket',
    tone: 'yellow',
  },
  {
    title: '雋ｷ縺・黄繝ｪ繧ｹ繝・',
    description:
      '雜ｳ繧翫↑縺・攝譁吶ｒ閾ｪ蜍輔〒繝ｪ繧ｹ繝亥喧縺励※莠育ｮ励〒邨槭ｊ霎ｼ縺ｿ',
    action: '繝ｪ繧ｹ繝医ｒ隕九ｋ',
    icon: 'list',
    tone: 'blue',
  },
  {
    title: '隱ｿ逅・ｱ･豁ｴ',
    description:
      '菴懊▲縺溘Ξ繧ｷ繝斐√♀豌励↓蜈･繧翫∽ｽｿ逕ｨ驥上ｒ縺ｾ縺ｨ繧√※遒ｺ隱・',
    action: '螻･豁ｴ繧帝幕縺・',
    icon: 'clock',
    tone: 'red',
  },
]

export const secondaryFeatures: Feature[] = [
  {
    title: '縺頑ｰ励↓蜈･繧・',
    description: '縺ｾ縺滉ｽ懊ｊ縺溘＞繝ｬ繧ｷ繝斐ｒ菫晏ｭ・',
    action: '菫晏ｭ俶ｸ医∩',
    icon: 'heart',
    tone: 'red',
  },
  {
    title: '繧｢繧ｫ繧ｦ繝ｳ繝郁ｨｭ螳・',
    description: '險隱槭√Ο繧ｰ繧｢繧ｦ繝医√Θ繝ｼ繧ｶ繝ｼ邂｡逅・',
    action: '險ｭ螳・',
    icon: 'settings',
    tone: 'slate',
  },
  {
    title: '縺雁撫縺・粋繧上○',
    description: '豌励↓縺ｪ繧狗せ繧・お繝ｩ繝ｼ繧帝∽ｿ｡',
    action: '騾∽ｿ｡',
    icon: 'message',
    tone: 'violet',
  },
]

export const expiringIngredients: Ingredient[] = [
  { name: '鮓上ｂ繧りｉ', amount: '320g', status: '莉頑律縺ｾ縺ｧ' },
  { name: '蟆乗收闖・', amount: '1譚・', status: '譏取律縺ｾ縺ｧ' },
  { name: '迚帑ｹｳ', amount: '500ml', status: '谿九ｊ2譌･' },
]

export const suggestedRecipes: Recipe[] = [
  {
    name: '鮓剰ｉ縺ｨ蟆乗收闖懊・蜥碁｢ｨ繧ｯ繝ｪ繝ｼ繝辣ｮ',
    meta: '25蛻・/ 邏・20kcal',
    tags: ['譛滄剞蜆ｪ蜈・', '蜥梧ｴ倶ｸｭ', '迚帑ｹｳ豸郁ｲｻ'],
  },
  {
    name: '蜀ｷ阡ｵ蠎ｫ謨ｴ逅・・蜈ｷ縺縺上＆繧鍋ｒ繧・',
    meta: '15蛻・/ 髮｣譏灘ｺｦ縺九ｓ縺溘ｓ',
    tags: ['譎ら洒', '蝨ｨ蠎ｫ豢ｻ逕ｨ'],
  },
]

export const summaryItems = [
  {
    label: '逋ｻ骭ｲ鬟滓攝',
    value: '18',
    note: '3莉ｶ縺ｯ譛滄剞縺瑚ｿ代＞',
  },
  {
    label: '雋ｷ縺・黄繝｡繝｢',
    value: '6',
    note: '莠育ｮ励ヵ繧｣繝ｫ繧ｿ繝ｼ蟇ｾ蠢・',
  },
  {
    label: '縺頑ｰ励↓蜈･繧・',
    value: '12',
    note: '繧医￥菴懊ｋ繝ｬ繧ｷ繝・',
  },
  {
    label: '騾夂衍',
    value: '2',
    note: '雉槫袖譛滄剞縺ｮ遒ｺ隱・',
  },
]
