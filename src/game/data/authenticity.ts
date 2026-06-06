import { AuthenticityRelic, AuthenticityReward } from '../types';

export const AUTHENTICITY_RELICS: AuthenticityRelic[] = [
  {
    id: 'relic_auth_1',
    name: '琥珀雕件·松鹤延年',
    description: '一件声称是清代乾隆年间的琥珀雕件，雕刻有松鹤延年图案。',
    genuineDescription: '真品为乾隆年间宫廷造办处制作，选用上等缅甸血珀，雕工细腻流畅，包浆自然厚重。',
    fakeDescription: '仿品为现代树脂浇注而成，颜色过于均匀，雕工生硬，无岁月痕迹。',
    icon: '🦢',
    isGenuine: false,
    chapterId: 'chapter_5',
    passwordClue: '若为仿品，取"仿"字笔画数的个位',
    passwordDigit: 6,
    digitPosition: 1,
    verified: false,
    verdict: null,
    checkPoints: [
      {
        id: 'cp_1_1',
        name: '材质检查',
        description: '观察琥珀的内部纹理和气泡分布',
        icon: '🔍',
        isGenuine: false,
        genuineEvidence: '天然琥珀内部有自然流淌纹和不规则气泡，纹理灵动自然。',
        fakeEvidence: '仿品内部气泡均匀呈圆形，纹理僵硬刻意，是典型的浇注特征。',
        position: { x: 20, y: 20 },
        checked: false
      },
      {
        id: 'cp_1_2',
        name: '雕工检查',
        description: '检查雕刻的刀法和线条流畅度',
        icon: '🗡️',
        isGenuine: false,
        genuineEvidence: '古代工匠手工雕刻，线条有力且有自然的顿挫变化，刀痕深浅不一。',
        fakeEvidence: '现代机器雕刻，线条过于均匀完美，底部可见平行工具痕迹。',
        position: { x: 60, y: 20 },
        checked: false
      },
      {
        id: 'cp_1_3',
        name: '包浆检查',
        description: '观察表面的包浆和使用痕迹',
        icon: '✨',
        isGenuine: false,
        genuineEvidence: '百年以上的包浆温润内敛，缝隙处有自然积垢，使用痕迹分布合理。',
        fakeEvidence: '表面光泽贼亮刺眼，包浆是人工做旧，缝隙积垢均匀刻意。',
        position: { x: 40, y: 50 },
        checked: false
      },
      {
        id: 'cp_1_4',
        name: '款识检查',
        description: '检查底部的"乾隆年制"款识',
        icon: '📜',
        isGenuine: false,
        genuineEvidence: '乾隆官款字体规整有力，"乾"字左上方有缺笔特征，款识深浅适度。',
        fakeEvidence: '款识字体软弱无力，"乾"字写法错误，刻痕较浅且边缘模糊。',
        position: { x: 80, y: 50 },
        checked: false
      }
    ]
  },
  {
    id: 'relic_auth_2',
    name: '青铜兽面纹鼎',
    description: '一件声称是商代晚期的青铜鼎，饰有精美的兽面纹。',
    genuineDescription: '真品为商代晚期青铜器，采用范铸法铸造，锈色层次分明，纹饰精美。',
    fakeDescription: '仿品为现代失蜡法铸造，锈色单一浮于表面，纹饰模糊不清。',
    icon: '🏺',
    isGenuine: true,
    chapterId: 'chapter_5',
    passwordClue: '若为真品，取"商"字笔画数的个位',
    passwordDigit: 1,
    digitPosition: 2,
    verified: false,
    verdict: null,
    checkPoints: [
      {
        id: 'cp_2_1',
        name: '铸造痕迹检查',
        description: '检查器身的范线和垫片痕迹',
        icon: '🔍',
        isGenuine: true,
        genuineEvidence: '范铸法会在器身留下范线，内部可见不规则垫片，这是商代青铜器的典型特征。',
        fakeEvidence: '失蜡法铸造器身光滑无范线，内部垫片规则整齐，是现代工艺特征。',
        position: { x: 20, y: 20 },
        checked: false
      },
      {
        id: 'cp_2_2',
        name: '铜质检查',
        description: '观察铜质和磨损处的金属色泽',
        icon: '🪙',
        isGenuine: true,
        genuineEvidence: '商代青铜为铜锡铅三元合金，磨损处呈银灰色，敲击声音浑厚重。',
        fakeEvidence: '现代仿品铜质不纯，磨损处呈黄亮色，敲击声音清脆尖利。',
        position: { x: 60, y: 20 },
        checked: false
      },
      {
        id: 'cp_2_3',
        name: '锈色检查',
        description: '检查锈层的层次和附着力',
        icon: '🎨',
        isGenuine: true,
        genuineEvidence: '千年锈色层次分明，从内到外依次为红锈、蓝绿锈、黑锈，锈层坚硬入骨。',
        fakeEvidence: '化学做旧锈色单一，用指甲可刮落，有刺鼻化学气味。',
        position: { x: 40, y: 50 },
        checked: false
      },
      {
        id: 'cp_2_4',
        name: '纹饰检查',
        description: '观察兽面纹的细节和神韵',
        icon: '👁️',
        isGenuine: true,
        genuineEvidence: '商代兽面纹威严神秘，线条刚劲有力，眼睛凸起有神，纹饰有层次感。',
        fakeEvidence: '纹饰线条软弱无力，眼睛无神，整体缺乏商代青铜器的雄浑气势。',
        position: { x: 80, y: 50 },
        checked: false
      }
    ]
  },
  {
    id: 'relic_auth_3',
    name: '粉彩花鸟纹瓶',
    description: '一件声称是清代雍正年间的粉彩瓷瓶，绘有花鸟图案。',
    genuineDescription: '真品为雍正官窑粉彩，胎质细腻洁白，釉色温润，彩料层次丰富。',
    fakeDescription: '仿品为现代注浆胎，釉色过于刺眼，彩料单薄，绘画水准低下。',
    icon: '🏺',
    isGenuine: false,
    chapterId: 'chapter_5',
    passwordClue: '若为仿品，取"瓷"字笔画数的个位',
    passwordDigit: 0,
    digitPosition: 3,
    verified: false,
    verdict: null,
    checkPoints: [
      {
        id: 'cp_3_1',
        name: '胎质检查',
        description: '观察底足露胎处的胎质和修足工艺',
        icon: '🔍',
        isGenuine: false,
        genuineEvidence: '雍正官窑胎质细腻洁白如糯米，修足规整圆滑，俗称"泥鳅背"。',
        fakeEvidence: '现代注浆胎胎质粗松，颜色发灰，修足生硬，可见机器加工痕迹。',
        position: { x: 20, y: 20 },
        checked: false
      },
      {
        id: 'cp_3_2',
        name: '釉色检查',
        description: '观察釉面的光泽和橘皮纹',
        icon: '✨',
        isGenuine: false,
        genuineEvidence: '雍正釉面温润如玉，有自然的橘皮皱，光泽内敛柔和不刺眼。',
        fakeEvidence: '釉面过于光滑平整，玻璃光泽强烈刺眼，是现代电窑烧制特征。',
        position: { x: 60, y: 20 },
        checked: false
      },
      {
        id: 'cp_3_3',
        name: '彩料检查',
        description: '检查粉彩的层次和质感',
        icon: '🎨',
        isGenuine: false,
        genuineEvidence: '雍正粉彩层次丰富，色彩柔和淡雅，花瓣有阴阳向背的立体感。',
        fakeEvidence: '彩料单薄平涂，色彩鲜艳俗气，无层次感，像是印刷品。',
        position: { x: 40, y: 50 },
        checked: false
      },
      {
        id: 'cp_3_4',
        name: '绘画检查',
        description: '观察花鸟的绘画功力和神韵',
        icon: '🖌️',
        isGenuine: false,
        genuineEvidence: '宫廷画师手笔，花鸟栩栩如生，羽毛丝发毕现，构图疏密有致。',
        fakeEvidence: '绘画笨拙呆板，鸟的眼神呆滞，花叶比例失调，无艺术价值。',
        position: { x: 80, y: 50 },
        checked: false
      }
    ]
  },
  {
    id: 'relic_auth_4',
    name: '翡翠扳指',
    description: '一件声称是清代皇室使用的老坑玻璃种翡翠扳指。',
    genuineDescription: '真品为清代皇室遗物，选用上等老坑玻璃种翡翠，通透纯净，翠色欲滴。',
    fakeDescription: '仿品为B+C货翡翠，经过强酸浸泡和染色处理，内部结构已被破坏。',
    icon: '💍',
    isGenuine: true,
    chapterId: 'chapter_5',
    passwordClue: '若为真品，取"翠"字笔画数的个位',
    passwordDigit: 4,
    digitPosition: 4,
    verified: false,
    verdict: null,
    checkPoints: [
      {
        id: 'cp_4_1',
        name: '结构检查',
        description: '用放大镜观察内部的纤维交织结构',
        icon: '🔍',
        isGenuine: true,
        genuineEvidence: '天然翡翠有明显的纤维交织结构，俗称"苍蝇翅"，这是天然翡翠的重要标志。',
        fakeEvidence: 'B货翡翠经过强酸浸泡，内部结构松散，可见网状酸蚀纹，无天然翡翠特征。',
        position: { x: 20, y: 20 },
        checked: false
      },
      {
        id: 'cp_4_2',
        name: '颜色检查',
        description: '观察颜色的分布和形态',
        icon: '🎨',
        isGenuine: true,
        genuineEvidence: '天然翡翠颜色自然，有色根，绿色分布不规则，深浅过渡自然。',
        fakeEvidence: '染色翡翠颜色死板，无层次感，绿色沿裂隙分布，呈蜘蛛网状。',
        position: { x: 60, y: 20 },
        checked: false
      },
      {
        id: 'cp_4_3',
        name: '光泽检查',
        description: '观察表面的光泽和温润感',
        icon: '✨',
        isGenuine: true,
        genuineEvidence: '老坑玻璃种翡翠光泽温润，呈油脂-玻璃光泽，有清凉感，岁月留下自然佩戴痕迹。',
        fakeEvidence: 'B货翡翠光泽怪异，呈树脂光泽，手感较轻，表面有充胶后的凹坑。',
        position: { x: 40, y: 50 },
        checked: false
      },
      {
        id: 'cp_4_4',
        name: '工艺检查',
        description: '检查扳指的形制和打磨工艺',
        icon: '⚒️',
        isGenuine: true,
        genuineEvidence: '清代扳指壁厚均匀，内壁打磨光滑，佩戴舒适，符合当时的形制规范。',
        fakeEvidence: '壁厚不均，内壁粗糙，形制不规整，打磨不到位。',
        position: { x: 80, y: 50 },
        checked: false
      }
    ]
  }
];

export const AUTHENTICITY_REWARDS: AuthenticityReward[] = [
  {
    type: 'score',
    value: 1000,
    description: '成功鉴定所有藏品，获得1000分',
    claimed: false
  },
  {
    type: 'clue',
    value: 'clue_auth_final',
    description: '获得隐藏线索：博物馆的秘密',
    claimed: false
  },
  {
    type: 'unlock',
    value: 'exhibition_auth_final',
    description: '解锁珍品密室',
    claimed: false
  },
  {
    type: 'story',
    value: '原来这些藏品中，真品是爷爷从海外抢救回国的珍贵文物，而仿品则是他用于研究和教学的样本。\n\n爷爷一生致力于文物保护事业，他常说：\n"辨伪存真，是文物工作者的天职。\n每一件真品背后，都有一段不该被遗忘的历史。"',
    description: '解锁隐藏剧情',
    claimed: false
  }
];

export const AUTHENTICITY_CLUES = [
  {
    id: 'clue_auth_1',
    name: '文物鉴定笔记',
    description: '一本泛黄的鉴定笔记，记录着爷爷对每件藏品的鉴定要点和心得。扉页写着："鉴宝如鉴心，真伪在细节。"',
    icon: '📓',
    chapterId: 'chapter_5',
    isMemory: false,
    collected: false
  },
  {
    id: 'clue_auth_2',
    name: '放大镜',
    description: '爷爷生前使用过的放大镜，镜片经过特殊处理，可以更清晰地观察文物细节。手柄上刻着"求真"二字。',
    icon: '🔍',
    chapterId: 'chapter_5',
    isMemory: false,
    collected: false
  },
  {
    id: 'clue_auth_3',
    name: '紫外灯',
    description: '专业的紫外荧光灯，用于检测文物是否经过人工处理。在紫外线下，天然宝石和处理过的宝石会呈现不同的荧光反应。',
    icon: '💡',
    chapterId: 'chapter_5',
    isMemory: false,
    collected: false
  },
  {
    id: 'clue_auth_4',
    name: '爷爷的收藏证书',
    description: '一份由权威机构颁发的收藏证书，上面记录着爷爷捐献的文物清单。背面写着："这些文物，本就属于国家，属于人民。"',
    icon: '📜',
    chapterId: 'chapter_5',
    isMemory: true,
    memoryOrder: 1,
    collected: false
  },
  {
    id: 'clue_auth_final',
    name: '博物馆的秘密',
    description: '原来这座博物馆不仅是爷爷送给你的礼物，更是他一生心血的结晶。\n\n这里的每一件真品，都是他从海外拍卖会上不惜重金抢救回国的。\n而那些仿品，是他用于教学和研究的样本，帮助无数人学习文物鉴定知识。\n\n爷爷用一生践行着"辨伪存真、守护文明"的信念。\n现在，这份使命交到了你的手中...',
    icon: '🗝️',
    chapterId: 'chapter_5',
    isMemory: true,
    memoryOrder: 2,
    collected: false
  }
];
