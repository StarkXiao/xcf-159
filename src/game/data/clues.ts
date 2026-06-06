import { Clue } from '../types';

export const CLUES: Clue[] = [
  {
    id: 'clue_1',
    name: '老旧照片',
    description: '一张泛黄的全家福照片，照片中的小女孩手里握着一颗琥珀。背面写着：1998年夏，我们的小琥珀诞生了。',
    icon: '📷',
    chapterId: 'chapter_1',
    isMemory: false,
    collected: false
  },
  {
    id: 'clue_2',
    name: '琥珀吊坠',
    description: '一颗封存着小昆虫的琥珀吊坠，边缘已经被摩挲得十分光滑。似乎是某个人的珍爱之物。',
    icon: '💎',
    chapterId: 'chapter_1',
    isMemory: true,
    memoryOrder: 1,
    collected: false
  },
  {
    id: 'clue_3',
    name: '日记残页',
    description: '日记的一页，字迹有些模糊：今天小琥珀问我，琥珀里的虫子会不会疼。我告诉她，它们在最美的时刻被永远保存了下来。',
    icon: '📜',
    chapterId: 'chapter_1',
    isMemory: true,
    memoryOrder: 2,
    collected: false
  },
  {
    id: 'clue_4',
    name: '医院手环',
    description: '一个褪色的医院手环，上面写着"林琥珀"的名字，日期是2010年。手环内侧刻着细小的字：永远的小公主。',
    icon: '🏥',
    chapterId: 'chapter_1',
    isMemory: true,
    memoryOrder: 3,
    collected: false
  },
  {
    id: 'clue_5',
    name: '音乐盒',
    description: '一个精致的木质音乐盒，打开后会播放一首温柔的摇篮曲。底部刻着：给我最爱的琥珀，八岁生日快乐。',
    icon: '🎵',
    chapterId: 'chapter_1',
    isMemory: false,
    collected: false
  },
  {
    id: 'clue_6',
    name: '古老钥匙',
    description: '一把古铜色的钥匙，钥匙柄上雕刻着精美的琥珀花纹。这应该能打开某个重要的锁。',
    icon: '🔑',
    chapterId: 'chapter_2',
    isMemory: false,
    collected: false
  },
  {
    id: 'clue_7',
    name: '旧信件',
    description: '一封封存的信件，墨迹已有些晕染：亲爱的琥珀，当你读到这封信时，爷爷已经在很远的地方了。但爷爷的爱，永远像琥珀一样，封存着，不变质。',
    icon: '✉️',
    chapterId: 'chapter_2',
    isMemory: true,
    memoryOrder: 1,
    collected: false
  },
  {
    id: 'clue_8',
    name: '画作草稿',
    description: '一幅未完成的画作，画中是一个站在琥珀中的小女孩。角落有签名：给我的小天使，爷爷画。',
    icon: '🎨',
    chapterId: 'chapter_2',
    isMemory: true,
    memoryOrder: 2,
    collected: false
  },
  {
    id: 'clue_9',
    name: '怀表',
    description: '一块已经停止走动的怀表，指针停在3点15分。表盖内贴着一张祖孙二人的合影。',
    icon: '⌚',
    chapterId: 'chapter_2',
    isMemory: true,
    memoryOrder: 3,
    collected: false
  },
  {
    id: 'clue_10',
    name: '古籍',
    description: '一本关于琥珀收藏的古籍，其中一页被折起：传说中，将珍贵的记忆封存在琥珀中，便可以永恒保存。这是我留给小琥珀最后的礼物。',
    icon: '📖',
    chapterId: 'chapter_2',
    isMemory: false,
    collected: false
  },
  {
    id: 'clue_11',
    name: '精细砂纸',
    description: '用于打磨文物表面的氧化层和锈迹，粒度均匀，不会损伤文物本体。这是文物修复的第一步，细心打磨才能露出文物本来的面貌。',
    icon: '📜',
    chapterId: 'chapter_3',
    isMemory: false,
    collected: false
  },
  {
    id: 'clue_12',
    name: '文物修复胶',
    description: '特制的可逆性粘合剂，用于粘结断裂的文物部件，日后可安全溶解去除。修复师的巧手加上专业的粘合剂，让破碎的文物重获完整。',
    icon: '🧪',
    chapterId: 'chapter_3',
    isMemory: false,
    collected: false
  },
  {
    id: 'clue_13',
    name: '青铜补配粉',
    description: '与青铜鼎成分相近的金属粉末，用于填补缺失的部分，使修复处浑然一体。每一次填补，都是对历史的尊重。',
    icon: '✨',
    chapterId: 'chapter_3',
    isMemory: false,
    collected: false
  },
  {
    id: 'clue_14',
    name: '抛光软布',
    description: '超细纤维材质的软布，用于最后抛光，恢复文物原有的光泽。最后的打磨，让千年文物焕发新生。',
    icon: '🧻',
    chapterId: 'chapter_3',
    isMemory: false,
    collected: false
  },
  {
    id: 'clue_15',
    name: '专业镊子',
    description: '精密不锈钢镊子，用于处理细小的碎片和残留物。每一个碎片都承载着历史的记忆，需要小心翼翼地归位。',
    icon: '🔧',
    chapterId: 'chapter_3',
    isMemory: false,
    collected: false
  },
  {
    id: 'clue_h1',
    name: '青铜鼎铭文拓片',
    description: '一张精心拓印的青铜鼎铭文。上面的文字记载着："周王十二年，铸鼎于宗庙，匠人怀素监造"。这是解开历史的钥匙。',
    icon: '📜',
    chapterId: 'chapter_4',
    isMemory: false,
    collected: false,
    hallOrigin: 'history',
    isShared: false
  },
  {
    id: 'clue_h2',
    name: '工匠族谱',
    description: '一本泛黄的工匠族谱，记载着一个神秘工匠家族的传承。其中一页写着："怀素之子，名唤永恒，精通青铜与玉石的奥秘"。这似乎与某个艺术家有渊源...',
    icon: '📖',
    chapterId: 'chapter_4',
    isMemory: true,
    memoryOrder: 1,
    collected: false,
    hallOrigin: 'history',
    isShared: true,
    linkedClueId: 'clue_a2'
  },
  {
    id: 'clue_h3',
    name: '编钟乐谱',
    description: '一卷古老的乐谱，记载着祭祀时演奏的乐曲。乐谱的节奏似乎与某种艺术创作的节奏有着奇妙的呼应...',
    icon: '🎵',
    chapterId: 'chapter_4',
    isMemory: true,
    memoryOrder: 2,
    collected: false,
    hallOrigin: 'history',
    isShared: true,
    linkedClueId: 'clue_a3'
  },
  {
    id: 'clue_a1',
    name: '琥珀雕件·昆虫',
    description: '一枚精美的琥珀雕件，里面封存着一只远古的昆虫。雕工细腻，栩栩如生。底部刻着"永恒工坊"的印记。',
    icon: '💎',
    chapterId: 'chapter_4',
    isMemory: false,
    collected: false,
    hallOrigin: 'art',
    isShared: false
  },
  {
    id: 'clue_a2',
    name: '艺术家手札',
    description: '一位艺术家的创作手札。其中写道："我的家族世代从事艺术创作，可追溯到商周时期的一位青铜工匠..."。这与某个工匠家族似乎有关联...',
    icon: '📔',
    chapterId: 'chapter_4',
    isMemory: true,
    memoryOrder: 1,
    collected: false,
    hallOrigin: 'art',
    isShared: true,
    linkedClueId: 'clue_h2'
  },
  {
    id: 'clue_a3',
    name: '油画·青铜与琥珀',
    description: '一幅题为《青铜与琥珀》的油画。画面中，厚重的青铜鼎与温润的琥珀交相辉映。画作的色彩节奏与某种古乐的旋律有着奇妙的共鸣...',
    icon: '🎨',
    chapterId: 'chapter_4',
    isMemory: true,
    memoryOrder: 2,
    collected: false,
    hallOrigin: 'art',
    isShared: true,
    linkedClueId: 'clue_h3'
  },
  {
    id: 'clue_shared_1',
    name: '礼乐铭文·画家题记',
    description: '【需要同时拥有工匠族谱和艺术家手札后才能完整解读：铭文与题记合璧，揭示了一个惊人的秘密：这位青铜工匠与琥珀艺术家竟是同一家族的传人。' +
                 '族谱记载"永恒"这个名字，在两个家族中代代相传，他们追求的是——将永恒的美。这是解开第一阶段联动机关的关键线索。',
    icon: '🔗',
    chapterId: 'chapter_4',
    isMemory: true,
    memoryOrder: 3,
    collected: false,
    hallOrigin: 'history',
    isShared: true,
    requiredClueFromOtherHall: 'clue_a2'
  },
  {
    id: 'clue_shared_2',
    name: '铸造图谱·创作草图',
    description: '【需要同时拥有编钟乐谱和油画后才能完整解读：铸造图谱与创作草图交融，揭示了最终的答案：青铜铸造的图谱与艺术创作的草图，在"永恒"家族代代相传的秘技——' +
                 '无论是青铜的厚重，还是琥珀的温润，都是对"永恒"的追求。这是解开最终联动机关的核心线索。答案就是——"永恒"。',
    icon: '🗝️',
    chapterId: 'chapter_4',
    isMemory: true,
    memoryOrder: 4,
    collected: false,
    hallOrigin: 'art',
    isShared: true,
    requiredClueFromOtherHall: 'clue_h3'
  }
];
