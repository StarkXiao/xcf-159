import { VisitorQuest } from '../types';

export const VISITOR_QUESTS: VisitorQuest[] = [
  {
    id: 'quest_ch1_001',
    chapterId: 'chapter_1',
    title: '照片的主人',
    description: '一位老访客想要找回他失散多年的亲人照片。请帮他收集足够的线索来确认照片的身份。',
    visitorName: '陈老先生',
    visitorAvatar: '👴',
    requiredItems: [
      {
        id: 'quest_item_ch1_001_1',
        name: '老旧照片',
        icon: '📷',
        description: '一张泛黄的全家福照片',
        quantity: 1,
        collected: false,
        source: { type: 'clue', targetId: 'clue_1' }
      },
      {
        id: 'quest_item_ch1_001_2',
        name: '音乐盒',
        icon: '🎵',
        description: '能唤起记忆的音乐盒',
        quantity: 1,
        collected: false,
        source: { type: 'clue', targetId: 'clue_5' }
      }
    ],
    reward: {
      type: 'score',
      value: 100,
      description: '章节评价 +100 分'
    },
    storyAccept: '陈老先生：「年轻人，我在这博物馆里找了很久...这张照片里的人，是我失散多年的家人。你能帮我找到更多关于他们的线索吗？」',
    storyDeliver: '陈老先生：「谢谢你！这张照片...还有这个音乐盒...让我想起了很多往事。你知道吗，这音乐盒里的曲子，是我妻子最喜欢的...」',
    storyComplete: '陈老先生：「原来如此...琥珀的故事让我明白，有些记忆虽然被封存，但从未消失。谢谢你，年轻人。希望你也能找到属于自己的答案。」',
    status: 'available',
    priority: 'common'
  },
  {
    id: 'quest_ch1_002',
    chapterId: 'chapter_1',
    title: '医院的记忆',
    description: '一位护士想要了解当年琥珀住院时的情况。请帮她收集医院相关的线索。',
    visitorName: '张护士',
    visitorAvatar: '👩‍⚕️',
    requiredItems: [
      {
        id: 'quest_item_ch1_002_1',
        name: '医院手环',
        icon: '🏥',
        description: '褪色的医院手环',
        quantity: 1,
        collected: false,
        source: { type: 'clue', targetId: 'clue_4' }
      },
      {
        id: 'quest_item_ch1_002_2',
        name: '日记残页',
        icon: '📜',
        description: '记录着心情的日记',
        quantity: 1,
        collected: false,
        source: { type: 'clue', targetId: 'clue_3' }
      }
    ],
    reward: {
      type: 'score',
      value: 150,
      description: '章节评价 +150 分'
    },
    storyAccept: '张护士：「我在这家医院工作了几十年，见过太多悲欢离合。那个叫琥珀的小女孩...我至今还记得她。你能帮我了解她后来怎么样了吗？」',
    storyDeliver: '张护士：「这个手环...是我亲手给她戴上的。还有这本日记...她总是在病床上写啊写。谢谢你，让我知道她的故事没有就此结束。」',
    storyComplete: '张护士：「原来琥珀最后被这么多人爱着...作为医护人员，最欣慰的就是看到病人能够幸福。这份记忆，我会好好珍藏的。」',
    status: 'available',
    priority: 'rare',
    unlockCondition: {
      requiredClues: ['clue_4']
    }
  },
  {
    id: 'quest_ch2_001',
    chapterId: 'chapter_2',
    title: '画家的遗愿',
    description: '一位艺术系学生想要完成爷爷未完成的画作。请帮他收集创作所需的线索。',
    visitorName: '李明',
    visitorAvatar: '👨‍🎨',
    requiredItems: [
      {
        id: 'quest_item_ch2_001_1',
        name: '画作草稿',
        icon: '🎨',
        description: '未完成的画作草稿',
        quantity: 1,
        collected: false,
        source: { type: 'clue', targetId: 'clue_8' }
      },
      {
        id: 'quest_item_ch2_001_2',
        name: '古籍',
        icon: '📖',
        description: '关于琥珀收藏的古籍',
        quantity: 1,
        collected: false,
        source: { type: 'clue', targetId: 'clue_10' }
      }
    ],
    reward: {
      type: 'score',
      value: 120,
      description: '章节评价 +120 分'
    },
    storyAccept: '李明：「我爷爷是个画家，他生前一直想完成一幅关于琥珀的画，但直到去世都没能完成。我想替他完成这个心愿...」',
    storyDeliver: '李明：「这张草稿...是爷爷的笔迹！还有这本古籍里记载的技法...我终于明白爷爷想要表达什么了。」',
    storyComplete: '李明：「原来爷爷想要画的，不只是琥珀的美，更是那份永恒的爱。谢谢你帮我找到这些线索，我终于可以完成这幅画了。」',
    status: 'available',
    priority: 'common'
  },
  {
    id: 'quest_ch2_002',
    chapterId: 'chapter_2',
    title: '时间的秘密',
    description: '一位古董收藏家对那块停止的怀表很感兴趣。请帮他解开时间背后的秘密。',
    visitorName: '王先生',
    visitorAvatar: '🧐',
    requiredItems: [
      {
        id: 'quest_item_ch2_002_1',
        name: '怀表',
        icon: '⌚',
        description: '停止走动的怀表',
        quantity: 1,
        collected: false,
        source: { type: 'clue', targetId: 'clue_9' }
      },
      {
        id: 'quest_item_ch2_002_2',
        name: '旧信件',
        icon: '✉️',
        description: '爷爷写给琥珀的信',
        quantity: 1,
        collected: false,
        source: { type: 'clue', targetId: 'clue_7' }
      },
      {
        id: 'quest_item_ch2_002_3',
        name: '古老钥匙',
        icon: '🔑',
        description: '雕刻着琥珀花纹的钥匙',
        quantity: 1,
        collected: false,
        source: { type: 'clue', targetId: 'clue_6' }
      }
    ],
    reward: {
      type: 'score',
      value: 200,
      description: '章节评价 +200 分'
    },
    storyAccept: '王先生：「作为一个古董收藏家，我见过无数钟表，但这块怀表...它停止的时间似乎藏着什么特殊的意义。你能帮我找到答案吗？」',
    storyDeliver: '王先生：「3点15分...这封信里提到的时间...还有这把钥匙...我明白了！这是一个关于永恒的约定。时间虽然停止了，但爱永远不会。」',
    storyComplete: '王先生：「干我们这行的，总是在寻找物品背后的故事。今天，你让我看到了最珍贵的故事。这块怀表的价值，不在于它的年代，而在于它承载的爱。」',
    status: 'available',
    priority: 'epic',
    unlockCondition: {
      requiredCompletedQuests: ['quest_ch2_001']
    }
  },
  {
    id: 'quest_ch3_001',
    chapterId: 'chapter_3',
    title: '修复师的传承',
    description: '一位年轻的文物修复师想要学习青铜鼎的修复技艺。请帮他收集修复材料的线索。',
    visitorName: '小周',
    visitorAvatar: '👷',
    requiredItems: [
      {
        id: 'quest_item_ch3_001_1',
        name: '精细砂纸',
        icon: '📜',
        description: '修复用的砂纸',
        quantity: 1,
        collected: false,
        source: { type: 'clue', targetId: 'clue_11' }
      },
      {
        id: 'quest_item_ch3_001_2',
        name: '文物修复胶',
        icon: '🧪',
        description: '专业的修复粘合剂',
        quantity: 1,
        collected: false,
        source: { type: 'clue', targetId: 'clue_12' }
      },
      {
        id: 'quest_item_ch3_001_3',
        name: '青铜补配粉',
        icon: '✨',
        description: '填补用的金属粉末',
        quantity: 1,
        collected: false,
        source: { type: 'clue', targetId: 'clue_13' }
      }
    ],
    reward: {
      type: 'score',
      value: 180,
      description: '章节评价 +180 分'
    },
    storyAccept: '小周：「我师父常说，文物修复是手艺，更是心意。这青铜鼎的修复技艺...我想好好学习，将来也能修复更多国宝。」',
    storyDeliver: '小周：「这些材料...每一样都有讲究。砂纸的粒度、胶水的配比、补配粉的成分...原来修复一件文物，需要这么多心血！」',
    storyComplete: '小周：「谢谢你！我终于理解师父说的心意是什么了。修复文物，就是在修复历史，修复记忆。我一定会把这份技艺传承下去！」',
    status: 'available',
    priority: 'rare'
  },
  {
    id: 'quest_ch3_002',
    chapterId: 'chapter_3',
    title: '千年的约定',
    description: '一位历史教授相信青铜鼎上藏着关于永恒的秘密。请帮他收集所有修复工具的线索来解开谜题。',
    visitorName: '李教授',
    visitorAvatar: '👨‍🏫',
    requiredItems: [
      {
        id: 'quest_item_ch3_002_1',
        name: '抛光软布',
        icon: '🧻',
        description: '抛光用的软布',
        quantity: 1,
        collected: false,
        source: { type: 'clue', targetId: 'clue_14' }
      },
      {
        id: 'quest_item_ch3_002_2',
        name: '专业镊子',
        icon: '🔧',
        description: '处理碎片的镊子',
        quantity: 1,
        collected: false,
        source: { type: 'clue', targetId: 'clue_15' }
      }
    ],
    reward: {
      type: 'score',
      value: 250,
      description: '章节评价 +250 分，并解锁特殊剧情'
    },
    storyAccept: '李教授：「我研究商周青铜器几十年了，这尊青铜鼎...它的铭文里提到了「永恒」。我相信，修复它的过程本身就是在解开这个谜题。」',
    storyDeliver: '李教授：「抛光...是让文物重现光彩。镊子...是小心翼翼地处理每一个碎片。原来，永恒不是一蹴而就的，而是需要细心呵护、耐心等待...」',
    storyComplete: '李教授：「我明白了！青铜鼎告诉我们的永恒，就是一代又一代人的传承。从商周的工匠，到今天的修复师，再到未来的守护者...这就是永恒的真正含义！」',
    status: 'available',
    priority: 'legendary',
    unlockCondition: {
      requiredCompletedQuests: ['quest_ch3_001']
    }
  },
  {
    id: 'quest_ch4_001',
    chapterId: 'chapter_4',
    title: '家族的秘密',
    description: '一位族谱研究者想要解开怀素家族的传承之谜。请帮他收集历史馆的相关线索。',
    visitorName: '赵研究员',
    visitorAvatar: '🔬',
    requiredItems: [
      {
        id: 'quest_item_ch4_001_1',
        name: '青铜鼎铭文拓片',
        icon: '📜',
        description: '记载着铸鼎历史的铭文',
        quantity: 1,
        collected: false,
        source: { type: 'clue', targetId: 'clue_h1' }
      },
      {
        id: 'quest_item_ch4_001_2',
        name: '工匠族谱',
        icon: '📖',
        description: '神秘工匠家族的族谱',
        quantity: 1,
        collected: false,
        source: { type: 'clue', targetId: 'clue_h2' }
      },
      {
        id: 'quest_item_ch4_001_3',
        name: '编钟乐谱',
        icon: '🎵',
        description: '古老的祭祀乐曲',
        quantity: 1,
        collected: false,
        source: { type: 'clue', targetId: 'clue_h3' }
      }
    ],
    reward: {
      type: 'score',
      value: 300,
      description: '章节评价 +300 分'
    },
    storyAccept: '赵研究员：「怀素家族...这个名字在历史上出现过很多次，但他们的传承一直是个谜。这次双馆并行调查，也许能帮我找到答案。」',
    storyDeliver: '赵研究员：「铭文记载的铸鼎年代、族谱里的「永恒」之名、乐谱中的节奏...这些线索正在拼凑出一个惊人的家族史！」',
    storyComplete: '赵研究员：「原来如此！怀素家族从商周时期开始，就一直在追求「永恒」的艺术。无论是青铜铸造，还是后来的琥珀雕刻...他们的血脉里流淌着对美的执着！」',
    status: 'available',
    priority: 'epic'
  },
  {
    id: 'quest_ch4_002',
    chapterId: 'chapter_4',
    title: '艺术的传承',
    description: '一位艺术策展人想要策划一场关于「永恒」主题的展览。请帮他收集艺术馆的相关线索。',
    visitorName: '林女士',
    visitorAvatar: '👩‍💼',
    requiredItems: [
      {
        id: 'quest_item_ch4_002_1',
        name: '琥珀雕件·昆虫',
        icon: '💎',
        description: '精美的琥珀雕件',
        quantity: 1,
        collected: false,
        source: { type: 'clue', targetId: 'clue_a1' }
      },
      {
        id: 'quest_item_ch4_002_2',
        name: '艺术家手札',
        icon: '📔',
        description: '艺术家的创作笔记',
        quantity: 1,
        collected: false,
        source: { type: 'clue', targetId: 'clue_a2' }
      },
      {
        id: 'quest_item_ch4_002_3',
        name: '油画·青铜与琥珀',
        icon: '🎨',
        description: '关于青铜与琥珀的画作',
        quantity: 1,
        collected: false,
        source: { type: 'clue', targetId: 'clue_a3' }
      }
    ],
    reward: {
      type: 'score',
      value: 300,
      description: '章节评价 +300 分'
    },
    storyAccept: '林女士：「我一直在策划一场关于「永恒」主题的展览。琥珀艺术与青铜文明...这两者的结合，一定能震撼人心！」',
    storyDeliver: '林女士：「「永恒工坊」的印记、家族传承的手札、青铜与琥珀的对话...这些展品太棒了！我的展览越来越完整了！」',
    storyComplete: '林女士：「谢谢你帮我收集到这么珍贵的展品和故事。这个展览一定会让更多人理解：永恒不是时间的停止，而是美的传承。」',
    status: 'available',
    priority: 'epic'
  },
  {
    id: 'quest_ch4_003',
    chapterId: 'chapter_4',
    title: '永恒的答案',
    description: '博物馆的老馆长想要找到爷爷留下的最终答案。请帮他收集所有共享线索，揭开最终的秘密。',
    visitorName: '老馆长',
    visitorAvatar: '🧓',
    requiredItems: [
      {
        id: 'quest_item_ch4_003_1',
        name: '礼乐铭文·画家题记',
        icon: '🔗',
        description: '合璧后的铭文与题记',
        quantity: 1,
        collected: false,
        source: { type: 'clue', targetId: 'clue_shared_1' }
      },
      {
        id: 'quest_item_ch4_003_2',
        name: '铸造图谱·创作草图',
        icon: '🗝️',
        description: '交融后的图谱与草图',
        quantity: 1,
        collected: false,
        source: { type: 'clue', targetId: 'clue_shared_2' }
      }
    ],
    reward: {
      type: 'score',
      value: 500,
      description: '章节评价 +500 分，并解锁真结局'
    },
    storyAccept: '老馆长：「我追随老友的遗愿，守护这座博物馆一辈子了。他说过，当历史与艺术交汇时，真正的答案才会显现。你愿意帮我找到它吗？」',
    storyDeliver: '老馆长：「「永恒」这个名字...在两个家族中代代相传...铸造图谱与创作草图...揭示了最终的答案...我明白了！我终于明白老友的心意了！」',
    storyComplete: '老馆长：「永恒...原来就是爱。无论是青铜的厚重，还是琥珀的温润，都是对永恒之爱的追求。老友，你的心意我收到了。这座博物馆，会继续传承这份爱...」',
    status: 'available',
    priority: 'legendary',
    unlockCondition: {
      requiredCompletedQuests: ['quest_ch4_001', 'quest_ch4_002']
    }
  }
];
