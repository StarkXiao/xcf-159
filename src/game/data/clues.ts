import { Clue } from '../types';
import { AUTHENTICITY_CLUES } from './authenticity';

export const CLUES: Clue[] = [
  {
    id: 'clue_1',
    name: '老旧照片',
    description: '一张泛黄的全家福照片，照片中的小女孩手里握着一颗琥珀。背面写着：1998年夏，我们的小琥珀诞生了。',
    icon: '📷',
    chapterId: 'chapter_1',
    isMemory: false,
    collected: false,
    supplementaryDescription: '仔细观察照片，你发现那个小女孩的眼睛里闪烁着好奇的光芒。她手中的琥珀吊坠看起来非常特别，似乎封存着某种古老的秘密。照片的边缘有些磨损，说明它被经常拿出来观看。这家人背后的建筑看起来像是一座博物馆的入口。',
    mechanismPurpose: [
      {
        mechanismId: 'mech_1',
        mechanismName: '古老密码锁',
        purpose: '提供密码线索：照片上的年份1998',
        exhibitionId: 'exhibition_2'
      }
    ]
  },
  {
    id: 'clue_2',
    name: '琥珀吊坠',
    description: '一颗封存着小昆虫的琥珀吊坠，边缘已经被摩挲得十分光滑。似乎是某个人的珍爱之物。',
    icon: '💎',
    chapterId: 'chapter_1',
    isMemory: true,
    memoryOrder: 1,
    collected: false,
    supplementaryDescription: '用放大镜仔细观察，琥珀中的昆虫保持着完美的形态，翅膀上的纹理清晰可见。吊坠的背面刻有一个小小的「林」字，暗示着它的主人。琥珀的温度似乎比周围的物体略高，仿佛蕴含着某种温暖的能量。',
    mechanismPurpose: [
      {
        mechanismId: 'mech_2',
        mechanismName: '记忆机关',
        purpose: '记忆排序第1位：琥珀吊坠的记忆',
        exhibitionId: 'exhibition_4'
      }
    ]
  },
  {
    id: 'clue_3',
    name: '日记残页',
    description: '日记的一页，字迹有些模糊：今天小琥珀问我，琥珀里的虫子会不会疼。我告诉她，它们在最美的时刻被永远保存了下来。',
    icon: '📜',
    chapterId: 'chapter_1',
    isMemory: true,
    memoryOrder: 2,
    collected: false,
    supplementaryDescription: '这页日记的墨水已经有些褪色，但依然能感受到字里行间的温情。页面的角落有淡淡的泪痕印记，记录下某个悲伤的时刻。从纸张的质地来看，这是一本相当昂贵的日记本，主人一定非常珍视这些记录。',
    mechanismPurpose: [
      {
        mechanismId: 'mech_2',
        mechanismName: '记忆机关',
        purpose: '记忆排序第2位：日记的记忆',
        exhibitionId: 'exhibition_4'
      }
    ]
  },
  {
    id: 'clue_4',
    name: '医院手环',
    description: '一个褪色的医院手环，上面写着"林琥珀"的名字，日期是2010年。手环内侧刻着细小的字：永远的小公主。',
    icon: '🏥',
    chapterId: 'chapter_1',
    isMemory: true,
    memoryOrder: 3,
    collected: false,
    mechanismPurpose: [
      {
        mechanismId: 'mech_2',
        mechanismName: '记忆机关',
        purpose: '记忆排序第3位：医院手环的记忆',
        exhibitionId: 'exhibition_4'
      }
    ]
  },
  {
    id: 'clue_5',
    name: '音乐盒',
    description: '一个精致的木质音乐盒，打开后会播放一首温柔的摇篮曲。底部刻着：给我最爱的琥珀，八岁生日快乐。',
    icon: '🎵',
    chapterId: 'chapter_1',
    isMemory: false,
    collected: false,
    supplementaryDescription: '音乐盒的木质表面有着精美的雕花，是手工制作的痕迹。里面的机芯依然运转流畅，音符清晰动听。仔细听，这首摇篮曲似乎有些特别，旋律中隐藏着某种规律。或许这是爷爷专门为小琥珀创作的曲子。',
    mechanismPurpose: []
  },
  {
    id: 'clue_6',
    name: '古老钥匙',
    description: '一把古铜色的钥匙，钥匙柄上雕刻着精美的琥珀花纹。这应该能打开某个重要的锁。',
    icon: '🔑',
    chapterId: 'chapter_2',
    isMemory: false,
    collected: false,
    supplementaryDescription: '钥匙的金属表面有着明显的使用痕迹，但齿部依然锋利。钥匙柄上的琥珀花纹与琥珀吊坠上的图案惊人地相似，暗示着它们来自同一个工匠之手。钥匙的尖端似乎还残留着某种古老的油脂。',
    mechanismPurpose: [
      {
        mechanismId: 'mech_3',
        mechanismName: '修复室之门',
        purpose: '开启修复室大门的钥匙',
        exhibitionId: 'exhibition_5'
      }
    ]
  },
  {
    id: 'clue_7',
    name: '旧信件',
    description: '一封封存的信件，墨迹已有些晕染：亲爱的琥珀，当你读到这封信时，爷爷已经在很远的地方了。但爷爷的爱，永远像琥珀一样，封存着，不变质。',
    icon: '✉️',
    chapterId: 'chapter_2',
    isMemory: true,
    memoryOrder: 1,
    collected: false,
    mechanismPurpose: []
  },
  {
    id: 'clue_8',
    name: '画作草稿',
    description: '一幅未完成的画作，画中是一个站在琥珀中的小女孩。角落有签名：给我的小天使，爷爷画。',
    icon: '🎨',
    chapterId: 'chapter_2',
    isMemory: true,
    memoryOrder: 2,
    collected: false,
    mechanismPurpose: []
  },
  {
    id: 'clue_9',
    name: '怀表',
    description: '一块已经停止走动的怀表，指针停在3点15分。表盖内贴着一张祖孙二人的合影。',
    icon: '⌚',
    chapterId: 'chapter_2',
    isMemory: true,
    memoryOrder: 3,
    collected: false,
    mechanismPurpose: [
      {
        mechanismId: 'mech_3',
        mechanismName: '修复室之门',
        purpose: '提供密码线索：怀表停止的时间315',
        exhibitionId: 'exhibition_5'
      }
    ]
  },
  {
    id: 'clue_10',
    name: '古籍',
    description: '一本关于琥珀收藏的古籍，其中一页被折起：传说中，将珍贵的记忆封存在琥珀中，便可以永恒保存。这是我留给小琥珀最后的礼物。',
    icon: '📖',
    chapterId: 'chapter_2',
    isMemory: false,
    collected: false,
    mechanismPurpose: [
      {
        mechanismId: 'mech_5',
        mechanismName: '青铜密码',
        purpose: '提供商周时期的历史背景知识',
        exhibitionId: 'exhibition_7'
      }
    ]
  },
  {
    id: 'clue_11',
    name: '精细砂纸',
    description: '用于打磨文物表面的氧化层和锈迹，粒度均匀，不会损伤文物本体。这是文物修复的第一步，细心打磨才能露出文物本来的面貌。',
    icon: '📜',
    chapterId: 'chapter_3',
    isMemory: false,
    collected: false,
    mechanismPurpose: [
      {
        mechanismId: 'mech_4',
        mechanismName: '青铜鼎修复',
        purpose: '修复材料第1步：打磨氧化层',
        exhibitionId: 'exhibition_6'
      }
    ]
  },
  {
    id: 'clue_12',
    name: '文物修复胶',
    description: '特制的可逆性粘合剂，用于粘结断裂的文物部件，日后可安全溶解去除。修复师的巧手加上专业的粘合剂，让破碎的文物重获完整。',
    icon: '🧪',
    chapterId: 'chapter_3',
    isMemory: false,
    collected: false,
    mechanismPurpose: [
      {
        mechanismId: 'mech_4',
        mechanismName: '青铜鼎修复',
        purpose: '修复材料第2步：粘结断裂部件',
        exhibitionId: 'exhibition_6'
      }
    ]
  },
  {
    id: 'clue_13',
    name: '青铜补配粉',
    description: '与青铜鼎成分相近的金属粉末，用于填补缺失的部分，使修复处浑然一体。每一次填补，都是对历史的尊重。',
    icon: '✨',
    chapterId: 'chapter_3',
    isMemory: false,
    collected: false,
    mechanismPurpose: [
      {
        mechanismId: 'mech_4',
        mechanismName: '青铜鼎修复',
        purpose: '修复材料第3步：填补缺失部分',
        exhibitionId: 'exhibition_6'
      }
    ]
  },
  {
    id: 'clue_14',
    name: '抛光软布',
    description: '超细纤维材质的软布，用于最后抛光，恢复文物原有的光泽。最后的打磨，让千年文物焕发新生。',
    icon: '🧻',
    chapterId: 'chapter_3',
    isMemory: false,
    collected: false,
    mechanismPurpose: [
      {
        mechanismId: 'mech_4',
        mechanismName: '青铜鼎修复',
        purpose: '修复材料第4步：抛光恢复光泽',
        exhibitionId: 'exhibition_6'
      }
    ]
  },
  {
    id: 'clue_15',
    name: '专业镊子',
    description: '精密不锈钢镊子，用于处理细小的碎片和残留物。每一个碎片都承载着历史的记忆，需要小心翼翼地归位。',
    icon: '🔧',
    chapterId: 'chapter_3',
    isMemory: false,
    collected: false,
    mechanismPurpose: [
      {
        mechanismId: 'mech_4',
        mechanismName: '青铜鼎修复',
        purpose: '修复材料第5步：处理细小碎片',
        exhibitionId: 'exhibition_6'
      }
    ]
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
    isShared: false,
    mechanismPurpose: [
      {
        mechanismId: 'mech_linked_1',
        mechanismName: '联动机关·青铜琥珀锁',
        purpose: '提供青铜铸造年份线索',
        exhibitionId: 'exhibition_history_1',
        hallType: 'history'
      },
      {
        mechanismId: 'mech_linked_final',
        mechanismName: '联动机关·千年永恒锁',
        purpose: '历史馆关键线索',
        exhibitionId: 'exhibition_history_3',
        hallType: 'history'
      }
    ]
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
    linkedClueId: 'clue_a2',
    mechanismPurpose: [
      {
        mechanismId: 'mech_linked_1',
        mechanismName: '联动机关·青铜琥珀锁',
        purpose: '提供"永恒"家族传承线索',
        exhibitionId: 'exhibition_history_1',
        hallType: 'history'
      },
      {
        mechanismId: 'mech_linked_final',
        mechanismName: '联动机关·千年永恒锁',
        purpose: '解锁共享线索clue_shared_1',
        exhibitionId: 'exhibition_history_3',
        hallType: 'history'
      }
    ]
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
    linkedClueId: 'clue_a3',
    mechanismPurpose: [
      {
        mechanismId: 'mech_linked_2',
        mechanismName: '联动机关·音律调色锁',
        purpose: '提供礼乐节奏线索',
        exhibitionId: 'exhibition_history_2',
        hallType: 'history'
      },
      {
        mechanismId: 'mech_linked_final',
        mechanismName: '联动机关·千年永恒锁',
        purpose: '解锁共享线索clue_shared_2',
        exhibitionId: 'exhibition_history_3',
        hallType: 'history'
      }
    ]
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
    isShared: false,
    mechanismPurpose: [
      {
        mechanismId: 'mech_linked_1',
        mechanismName: '联动机关·青铜琥珀锁',
        purpose: '提供琥珀诞生年份线索',
        exhibitionId: 'exhibition_art_1',
        hallType: 'art'
      },
      {
        mechanismId: 'mech_linked_final',
        mechanismName: '联动机关·千年永恒锁',
        purpose: '艺术馆关键线索',
        exhibitionId: 'exhibition_art_3',
        hallType: 'art'
      }
    ]
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
    linkedClueId: 'clue_h2',
    mechanismPurpose: [
      {
        mechanismId: 'mech_linked_1',
        mechanismName: '联动机关·青铜琥珀锁',
        purpose: '提供艺术家家族传承线索',
        exhibitionId: 'exhibition_art_1',
        hallType: 'art'
      },
      {
        mechanismId: 'mech_linked_final',
        mechanismName: '联动机关·千年永恒锁',
        purpose: '解锁共享线索clue_shared_1',
        exhibitionId: 'exhibition_art_3',
        hallType: 'art'
      }
    ]
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
    linkedClueId: 'clue_h3',
    mechanismPurpose: [
      {
        mechanismId: 'mech_linked_2',
        mechanismName: '联动机关·音律调色锁',
        purpose: '提供画作色调线索',
        exhibitionId: 'exhibition_art_2',
        hallType: 'art'
      },
      {
        mechanismId: 'mech_linked_final',
        mechanismName: '联动机关·千年永恒锁',
        purpose: '解锁共享线索clue_shared_2',
        exhibitionId: 'exhibition_art_3',
        hallType: 'art'
      }
    ]
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
    requiredClueFromOtherHall: 'clue_a2',
    mechanismPurpose: [
      {
        mechanismId: 'mech_linked_2',
        mechanismName: '联动机关·音律调色锁',
        purpose: '合璧线索：揭示家族传承秘密',
        exhibitionId: 'exhibition_history_2',
        hallType: 'history'
      },
      {
        mechanismId: 'mech_linked_final',
        mechanismName: '联动机关·千年永恒锁',
        purpose: '最终密码线索：永恒',
        exhibitionId: 'exhibition_history_3',
        hallType: 'history'
      }
    ]
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
    requiredClueFromOtherHall: 'clue_h3',
    mechanismPurpose: [
      {
        mechanismId: 'mech_linked_2',
        mechanismName: '联动机关·音律调色锁',
        purpose: '交融线索：揭示节奏与色调的呼应',
        exhibitionId: 'exhibition_art_2',
        hallType: 'art'
      },
      {
        mechanismId: 'mech_linked_final',
        mechanismName: '联动机关·千年永恒锁',
        purpose: '提供最终密码答案：永恒',
        exhibitionId: 'exhibition_art_3',
        hallType: 'art'
      }
    ]
  },
  ...AUTHENTICITY_CLUES,
  {
    id: 'clue_cor_1',
    name: '回廊钥匙',
    description: '一把古铜色的钥匙，钥匙柄上刻着"记忆"两个字。这是开启记忆回廊的唯一钥匙。握着它，你能感受到一股温暖的力量，仿佛有无数的记忆在呼唤着你。',
    icon: '🗝️',
    chapterId: 'chapter_6',
    isMemory: true,
    memoryOrder: 1,
    collected: false,
    mechanismPurpose: [
      {
        mechanismId: 'mech_cor_entrance',
        mechanismName: '记忆回廊之门',
        purpose: '提供密码线索：记忆',
        exhibitionId: 'exhibition_corridor_entrance'
      },
      {
        mechanismId: 'mech_cor_memory_final',
        mechanismName: '完整记忆拼图',
        purpose: '记忆排序第1位：回廊钥匙的记忆',
        exhibitionId: 'exhibition_corridor_present'
      }
    ]
  },
  {
    id: 'clue_cor_2',
    name: '向日葵花语',
    description: '一片干枯的向日葵花瓣，夹在一本童话书中。花瓣背面写着一行小字："送给我的小太阳——爷爷。"向日葵的花语是"沉默的爱"，就像爷爷对琥珀的爱一样，深沉而温暖。',
    icon: '🌻',
    chapterId: 'chapter_6',
    isMemory: true,
    memoryOrder: 2,
    collected: false,
    mechanismPurpose: [
      {
        mechanismId: 'mech_cor_memory_1',
        mechanismName: '童年记忆排序',
        purpose: '童年记忆排序第1位：向日葵花田',
        exhibitionId: 'exhibition_corridor_childhood'
      },
      {
        mechanismId: 'mech_cor_memory_final',
        mechanismName: '完整记忆拼图',
        purpose: '记忆排序第2位：向日葵花语的记忆',
        exhibitionId: 'exhibition_corridor_present'
      }
    ]
  },
  {
    id: 'clue_cor_3',
    name: '蝴蝶标本',
    description: '一只制作精美的蝴蝶标本，翅膀上的花纹依然清晰可见。标签上写着："八岁生日，和爷爷一起制作。"这只蝴蝶是琥珀童年最珍贵的回忆之一，象征着那些无忧无虑的美好时光。',
    icon: '🦋',
    chapterId: 'chapter_6',
    isMemory: true,
    memoryOrder: 3,
    collected: false,
    mechanismPurpose: [
      {
        mechanismId: 'mech_cor_memory_1',
        mechanismName: '童年记忆排序',
        purpose: '童年记忆排序第2位：蝴蝶标本',
        exhibitionId: 'exhibition_corridor_childhood'
      },
      {
        mechanismId: 'mech_cor_memory_final',
        mechanismName: '完整记忆拼图',
        purpose: '记忆排序第3位：蝴蝶标本的记忆',
        exhibitionId: 'exhibition_corridor_present'
      }
    ]
  },
  {
    id: 'clue_cor_4',
    name: '大学录取通知书',
    description: '一张名牌大学的录取通知书，专业是金融管理。这是父母为琥珀规划的人生道路——稳定、体面、前途光明。通知书的边缘已经被反复摩挲得有些发皱，承载着父母沉甸甸的期望。',
    icon: '📨',
    chapterId: 'chapter_6',
    isMemory: true,
    memoryOrder: 4,
    collected: false,
    mechanismPurpose: [
      {
        mechanismId: 'mech_cor_branch_1',
        mechanismName: '青春的抉择',
        purpose: '选择"重点大学"的依据',
        exhibitionId: 'exhibition_corridor_youth'
      },
      {
        mechanismId: 'mech_cor_memory_final',
        mechanismName: '完整记忆拼图',
        purpose: '记忆排序第4位：大学录取通知书的记忆',
        exhibitionId: 'exhibition_corridor_present'
      }
    ]
  },
  {
    id: 'clue_cor_5',
    name: '艺术学院邀请函',
    description: '一封来自国外著名艺术学院的邀请函，上面写着琥珀的作品展现出了惊人的天赋。这是琥珀梦寐以求的机会，是她追寻艺术梦想的大门。信封上散发着淡淡的松节油香气，那是她最爱的味道。',
    icon: '🎨',
    chapterId: 'chapter_6',
    isMemory: true,
    memoryOrder: 5,
    collected: false,
    mechanismPurpose: [
      {
        mechanismId: 'mech_cor_branch_1',
        mechanismName: '青春的抉择',
        purpose: '选择"艺术梦想"的依据',
        exhibitionId: 'exhibition_corridor_youth'
      },
      {
        mechanismId: 'mech_cor_memory_final',
        mechanismName: '完整记忆拼图',
        purpose: '记忆排序第5位：艺术学院邀请函的记忆',
        exhibitionId: 'exhibition_corridor_present'
      }
    ]
  },
  {
    id: 'clue_cor_6',
    name: '爷爷的遗言',
    description: '一段爷爷在病床上录下的音频文字记录："小琥珀，爷爷要走了。但爷爷的爱永远不会消失，它被封存在这座博物馆的每一件展品中。记住，最珍贵的不是文物本身，而是它们承载的记忆。替爷爷守护好这些记忆，好吗？"',
    icon: '📼',
    chapterId: 'chapter_6',
    isMemory: true,
    memoryOrder: 6,
    collected: false,
    mechanismPurpose: [
      {
        mechanismId: 'mech_cor_branch_final',
        mechanismName: '最终的抉择',
        purpose: '坚定守护记忆的决心',
        exhibitionId: 'exhibition_corridor_present'
      },
      {
        mechanismId: 'mech_cor_memory_final',
        mechanismName: '完整记忆拼图',
        purpose: '记忆排序第6位：爷爷遗言的记忆',
        exhibitionId: 'exhibition_corridor_present'
      }
    ]
  },
  {
    id: 'clue_cor_7',
    name: '母亲的家书',
    description: '一封母亲写给琥珀的信，字里行间充满了爱与理解："亲爱的女儿，无论你选择哪条路，妈妈都支持你。你不需要成为我们期待的样子，你只需要成为你自己。追逐梦想吧，我们永远是你最坚实的后盾。"',
    icon: '💌',
    chapterId: 'chapter_6',
    isMemory: true,
    memoryOrder: 7,
    collected: false,
    mechanismPurpose: [
      {
        mechanismId: 'mech_cor_branch_final',
        mechanismName: '最终的抉择',
        purpose: '获得家人支持的力量',
        exhibitionId: 'exhibition_corridor_present'
      },
      {
        mechanismId: 'mech_cor_memory_final',
        mechanismName: '完整记忆拼图',
        purpose: '记忆排序第7位：母亲家书的记忆',
        exhibitionId: 'exhibition_corridor_present'
      }
    ]
  },
  {
    id: 'clue_cor_8',
    name: '琥珀的日记',
    description: '琥珀的日记本，最后一页写着："今天我终于明白了爷爷为什么要建这座博物馆。记忆是我们最珍贵的财富，它让我们永远不会忘记那些爱过的人和事。我也要像爷爷一样，把最珍贵的记忆永远珍藏。永恒，就是被永远记住。"',
    icon: '📔',
    chapterId: 'chapter_6',
    isMemory: true,
    memoryOrder: 8,
    collected: false,
    mechanismPurpose: [
      {
        mechanismId: 'mech_cor_branch_final',
        mechanismName: '最终的抉择',
        purpose: '理解"永恒"的真正含义',
        exhibitionId: 'exhibition_corridor_present'
      },
      {
        mechanismId: 'mech_cor_memory_final',
        mechanismName: '完整记忆拼图',
        purpose: '记忆排序第8位：琥珀日记的记忆',
        exhibitionId: 'exhibition_corridor_present'
      },
      {
        mechanismId: 'mech_cor_ending',
        mechanismName: '结局之门',
        purpose: '提供最终密码线索：永恒',
        exhibitionId: 'exhibition_corridor_ending'
      }
    ]
  },
  {
    id: 'clue_cor_choice_1',
    name: '追梦的勇气',
    description: '当你选择追逐艺术梦想的那一刻，你感受到了琥珀心中的那份勇气和坚定。这是她人生中第一次为自己的选择负责，也是她成长的开始。这条路上会有很多困难，但她知道，只要有家人的支持，她什么都不怕。',
    icon: '✨',
    chapterId: 'chapter_6',
    isMemory: false,
    collected: false,
    branchChoiceId: 'branch_cor_1',
    isEndingClue: true,
    endingId: 'ending_true',
    mechanismPurpose: [
      {
        mechanismId: 'mech_cor_branch_final',
        mechanismName: '最终的抉择',
        purpose: '达成真结局的关键线索',
        exhibitionId: 'exhibition_corridor_present'
      }
    ]
  },
  {
    id: 'clue_cor_choice_2',
    name: '责任与担当',
    description: '当你选择重点大学的那一刻，你感受到了琥珀心中的那份成熟与担当。她选择了一条更稳妥的道路，但这并不意味着放弃梦想。她会在完成学业的同时，继续追求自己热爱的艺术。这是另一种形式的勇敢。',
    icon: '💪',
    chapterId: 'chapter_6',
    isMemory: false,
    collected: false,
    branchChoiceId: 'branch_cor_1',
    isEndingClue: true,
    endingId: 'ending_good',
    mechanismPurpose: [
      {
        mechanismId: 'mech_cor_branch_final',
        mechanismName: '最终的抉择',
        purpose: '达成好结局的关键线索',
        exhibitionId: 'exhibition_corridor_present'
      }
    ]
  },
  {
    id: 'clue_cor_choice_3',
    name: '迷茫的代价',
    description: '当你选择逃避的那一刻，你感受到了琥珀心中的那份恐惧和迷茫。她还没有准备好面对人生的重大选择，她需要更多的时间来认识自己。但有些机会一旦错过，就再也不会回来了。',
    icon: '😔',
    chapterId: 'chapter_6',
    isMemory: false,
    collected: false,
    branchChoiceId: 'branch_cor_1',
    isEndingClue: true,
    endingId: 'ending_neutral',
    mechanismPurpose: [
      {
        mechanismId: 'mech_cor_branch_final',
        mechanismName: '最终的抉择',
        purpose: '达成普通结局的关键线索',
        exhibitionId: 'exhibition_corridor_present'
      }
    ]
  },
  {
    id: 'clue_blackout_1',
    name: '紧急备用钥匙',
    description: '在黑暗中摸到的一把冰冷的钥匙，上面刻着"紧急出口"的字样。这应该是为突发情况准备的备用钥匙。',
    icon: '🔑',
    chapterId: 'chapter_1',
    isMemory: false,
    collected: false,
    mechanismPurpose: [
      {
        mechanismId: 'mech_blackout_emergency',
        mechanismName: '紧急开关面板',
        purpose: '紧急出口钥匙',
        exhibitionId: 'exhibition_1'
      }
    ]
  },
  {
    id: 'clue_blackout_2',
    name: '应急灯使用说明',
    description: '一张泛黄的说明书，详细说明了应急照明系统的操作方法。上面有爷爷的笔迹："琥珀，记住，黑暗中永远不要放弃希望。"',
    icon: '📋',
    chapterId: 'chapter_1',
    isMemory: true,
    memoryOrder: 4,
    collected: false,
    mechanismPurpose: [
      {
        mechanismId: 'mech_blackout_generator',
        mechanismName: '发电机控制面板',
        purpose: '提供应急照明系统操作指南',
        exhibitionId: 'exhibition_1'
      }
    ]
  },
  {
    id: 'clue_blackout_3',
    name: '泛黄的老照片',
    description: '手电筒光照亮了一张老照片，照片中是年幼的琥珀和爷爷在博物馆的合影。背面写着："无论发生什么，爷爷永远在你身边。"',
    icon: '📷',
    chapterId: 'chapter_1',
    isMemory: true,
    memoryOrder: 5,
    collected: false,
    mechanismPurpose: [
      {
        mechanismId: 'mech_blackout_final',
        mechanismName: '主电源恢复开关',
        purpose: '提供情感支持和勇气',
        exhibitionId: 'exhibition_1'
      }
    ]
  },
  {
    id: 'clue_blackout_emergency',
    name: '紧急开关操作记录',
    description: '成功启动紧急开关后找到的一份记录，详细记载了博物馆电力系统的布局。原来爷爷早就预料到可能会发生这种情况。',
    icon: '📜',
    chapterId: 'chapter_1',
    isMemory: false,
    collected: false,
    mechanismPurpose: [
      {
        mechanismId: 'mech_blackout_generator',
        mechanismName: '发电机控制面板',
        purpose: '提供电力系统布局线索',
        exhibitionId: 'exhibition_1'
      }
    ]
  },
  {
    id: 'clue_blackout_final',
    name: '爷爷的最后留言',
    description: '在电力恢复前找到的一卷磁带，里面是爷爷的声音："琥珀，如果你听到这段录音，说明你已经通过了考验。记住，最黑暗的时刻，也是最接近光明的时刻。这座博物馆，以及我所有的记忆，现在都交给你了。"',
    icon: '📼',
    chapterId: 'chapter_1',
    isMemory: true,
    memoryOrder: 6,
    collected: false,
    mechanismPurpose: [
      {
        mechanismId: 'mech_blackout_final',
        mechanismName: '主电源恢复开关',
        purpose: '提供密码线索：琥珀',
        exhibitionId: 'exhibition_1'
      }
    ]
  }
];
