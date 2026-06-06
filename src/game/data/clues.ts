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
  }
];
