import { Chapter, Exhibition, Mechanism } from '../types';
import { GAME_CONFIG } from '../config';

export const CHAPTERS: Chapter[] = [
  {
    id: 'chapter_1',
    title: '第一章：苏醒的记忆',
    description: '你在一座陌生的博物馆中醒来，周围陈列着各种琥珀展品。你需要找到线索，拼凑出关于"琥珀"的记忆。',
    exhibitions: ['exhibition_1', 'exhibition_2', 'exhibition_3'],
    requiredClues: ['clue_2', 'clue_3', 'clue_4'],
    storyText: '记忆碎片在你脑海中逐渐清晰——小女孩琥珀、她的家人、那些温暖的时光...',
    completed: false,
    unlocked: true
  },
  {
    id: 'chapter_2',
    title: '第二章：爷爷的礼物',
    description: '深入博物馆，你发现了更多关于琥珀和她爷爷的故事。原来这座博物馆，是爷爷送给琥珀最后的礼物。',
    exhibitions: ['exhibition_4', 'exhibition_5'],
    requiredClues: ['clue_7', 'clue_8', 'clue_9'],
    storyText: '爷爷的爱如同琥珀一般，历经岁月而不褪色。那些被封存的记忆，如今在你眼前一一展现...',
    completed: false,
    unlocked: false
  },
  {
    id: 'chapter_3',
    title: '第三章：文物修复室',
    description: '博物馆深处隐藏着一间神秘的文物修复室。一件破损的青铜鼎等待着你亲手修复，让千年文物重焕光彩。',
    exhibitions: ['exhibition_6', 'exhibition_7'],
    requiredClues: ['clue_11', 'clue_12', 'clue_13', 'clue_14', 'clue_15'],
    storyText: '当最后一道工序完成，青铜鼎恢复了昔日的辉煌。你仿佛穿越千年，亲手触摸到了那段辉煌的历史。文物的修复，亦是记忆的修复...',
    completed: false,
    unlocked: false
  },
  {
    id: 'chapter_4',
    title: '第四章：双馆并行调查',
    description: '博物馆的最深处隐藏着两座神秘展馆——历史馆与艺术馆。你需要在两馆间交叉取证，共享线索，共同推进联动机关，揭开尘封千年的秘密。',
    exhibitions: ['exhibition_history_1', 'exhibition_history_2', 'exhibition_history_3', 'exhibition_art_1', 'exhibition_art_2', 'exhibition_art_3', 'exhibition_auth_1'],
    requiredClues: ['clue_h1', 'clue_h2', 'clue_h3', 'clue_a1', 'clue_a2', 'clue_a3', 'clue_shared_1', 'clue_shared_2'],
    storyText: '当历史与艺术交汇，真相终于浮出水面。原来青铜鼎与琥珀，有着千丝万缕的联系...',
    completed: false,
    unlocked: false,
    isDualHall: true,
    historyExhibitions: ['exhibition_history_1', 'exhibition_history_2', 'exhibition_history_3'],
    artExhibitions: ['exhibition_art_1', 'exhibition_art_2', 'exhibition_art_3'],
    dualHallStoryText: {
      history: '穿越千年的青铜文明，诉说着王朝的兴衰与匠人的执着...',
      art: '流光溢彩的琥珀艺术，封存着永恒的美丽与动人的故事...',
      combined: '历史与艺术在此刻交融，青铜的厚重与琥珀的温润，共同谱写了一曲跨越时空的交响乐章。原来爷爷一直想告诉你的是——美，从来都有千种面貌，但爱，始终如一。'
    }
  },
  {
    id: 'chapter_5',
    title: '第五章：真伪鉴定',
    description: '博物馆深处藏着爷爷一生的鉴定笔记。四件珍贵藏品等待着你的慧眼——是真品还是仿品？每一个细节都关乎真相，每一次判断都在推导密码。辨伪存真，揭开爷爷的终极秘密。',
    exhibitions: ['exhibition_auth_1', 'exhibition_auth_final'],
    requiredClues: ['clue_auth_1', 'clue_auth_2', 'clue_auth_3', 'clue_auth_4', 'clue_auth_final'],
    storyText: '当最后一件藏品的鉴定结果尘埃落定，你终于明白了爷爷的良苦用心。辨伪存真，不仅是文物工作者的天职，更是对历史的尊重，对文明的守护。爷爷用一生践行的信念，现在交到了你的手中...',
    completed: false,
    unlocked: false,
    isAuthenticity: true
  },
  {
    id: 'chapter_6',
    title: '第六章：记忆回廊',
    description: '博物馆的最深处隐藏着一条神秘的记忆回廊。在这里，你需要将散落的记忆碎片按时间顺序重新排列，穿越不同的记忆场景，面对关键的人生抉择。你的每一个选择都将导向不同的结局——是坚守初心，还是顺应命运？真相，等待你亲手揭开。',
    exhibitions: ['exhibition_corridor_entrance', 'exhibition_corridor_childhood', 'exhibition_corridor_youth', 'exhibition_corridor_present', 'exhibition_corridor_ending'],
    requiredClues: ['clue_cor_1', 'clue_cor_2', 'clue_cor_3', 'clue_cor_4', 'clue_cor_5', 'clue_cor_6', 'clue_cor_7', 'clue_cor_8'],
    storyText: '当所有记忆碎片归位，当所有选择尘埃落定，你终于明白了琥珀记忆馆存在的真正意义。记忆不会因为时间的流逝而褪色，选择不会因为重来而失去价值。每一段记忆都值得被珍藏，每一次选择都是成长的印记。',
    completed: false,
    unlocked: false,
    isMemoryCorridor: true,
    memoryPhases: [
      {
        phase: 1,
        name: '回廊入口',
        exhibitionId: 'exhibition_corridor_entrance',
        description: '记忆回廊的入口，一扇神秘的大门等待着你。',
        requiredClues: ['clue_cor_1']
      },
      {
        phase: 2,
        name: '童年记忆',
        exhibitionId: 'exhibition_corridor_childhood',
        description: '穿越回琥珀的童年时光，重温那些无忧无虑的日子。',
        requiredClues: ['clue_cor_2', 'clue_cor_3']
      },
      {
        phase: 3,
        name: '青春抉择',
        exhibitionId: 'exhibition_corridor_youth',
        description: '站在人生的十字路口，面对影响一生的重要选择。',
        requiredClues: ['clue_cor_4', 'clue_cor_5']
      },
      {
        phase: 4,
        name: '此刻重逢',
        exhibitionId: 'exhibition_corridor_present',
        description: '回到现在，所有的记忆碎片即将拼凑完整。',
        requiredClues: ['clue_cor_6', 'clue_cor_7', 'clue_cor_8']
      }
    ],
    branchChoices: ['branch_cor_1', 'branch_cor_2'],
    endings: ['ending_true', 'ending_good', 'ending_neutral', 'ending_bad']
  }
];

export const EXHIBITIONS: Exhibition[] = [
  {
    id: 'exhibition_1',
    name: '博物馆大厅',
    bgColor: GAME_CONFIG.COLORS.DARK_BROWN,
    description: '你站在博物馆的中央大厅，四周是高大的展示柜，琥珀在射灯下散发着温暖的光芒。',
    unlocked: true,
    hotspots: [
      { id: 'hs_1', x: 150, y: 500, width: 120, height: 120, type: 'clue', targetId: 'clue_1', hint: '一张老旧照片', activated: false },
      { id: 'hs_2', x: 500, y: 450, width: 120, height: 120, type: 'clue', targetId: 'clue_5', hint: '一个音乐盒', activated: false },
      { id: 'hs_exit_1', x: 600, y: 900, width: 100, height: 150, type: 'exit', targetId: 'exhibition_2', hint: '前往西侧展厅', activated: false },
      { id: 'hs_exit_2', x: 50, y: 900, width: 100, height: 150, type: 'exit', targetId: 'exhibition_3', hint: '前往东侧展厅', activated: false }
    ]
  },
  {
    id: 'exhibition_2',
    name: '西侧展厅',
    bgColor: GAME_CONFIG.COLORS.DEEP_PURPLE,
    description: '西侧展厅陈列着各种琥珀首饰。墙上挂着一些老照片，记录着一个小女孩的成长。',
    unlocked: true,
    hotspots: [
      { id: 'hs_3', x: 200, y: 400, width: 120, height: 120, type: 'clue', targetId: 'clue_2', hint: '琥珀吊坠', activated: false },
      { id: 'hs_4', x: 450, y: 550, width: 120, height: 120, type: 'clue', targetId: 'clue_3', hint: '日记残页', activated: false },
      { id: 'hs_mech_1', x: 550, y: 300, width: 140, height: 140, type: 'mechanism', targetId: 'mech_1', hint: '一个上锁的展示柜', activated: false },
      { id: 'hs_back_1', x: 50, y: 1050, width: 120, height: 100, type: 'exit', targetId: 'exhibition_1', hint: '返回大厅', activated: false }
    ]
  },
  {
    id: 'exhibition_3',
    name: '东侧展厅',
    bgColor: GAME_CONFIG.COLORS.BRONZE,
    description: '东侧展厅是一个医疗主题的展区，展示着一些医疗器械和旧病历。空气中弥漫着淡淡的消毒水味。',
    unlocked: true,
    hotspots: [
      { id: 'hs_5', x: 300, y: 500, width: 120, height: 120, type: 'clue', targetId: 'clue_4', hint: '医院手环', activated: false },
      { id: 'hs_back_2', x: 600, y: 1050, width: 120, height: 100, type: 'exit', targetId: 'exhibition_1', hint: '返回大厅', activated: false }
    ]
  },
  {
    id: 'exhibition_4',
    name: '珍藏馆',
    bgColor: GAME_CONFIG.COLORS.DARK_BG,
    description: '珍藏馆的大门缓缓打开，这里陈列着爷爷最珍贵的收藏。每一件展品都承载着深厚的情感。',
    unlocked: false,
    hotspots: [
      { id: 'hs_6', x: 150, y: 450, width: 120, height: 120, type: 'clue', targetId: 'clue_7', hint: '旧信件', activated: false },
      { id: 'hs_7', x: 400, y: 350, width: 120, height: 120, type: 'clue', targetId: 'clue_8', hint: '画作草稿', activated: false },
      { id: 'hs_8', x: 550, y: 550, width: 120, height: 120, type: 'clue', targetId: 'clue_9', hint: '怀表', activated: false },
      { id: 'hs_mech_2', x: 350, y: 750, width: 140, height: 140, type: 'mechanism', targetId: 'mech_2', hint: '一个神秘的机关', activated: false },
      { id: 'hs_back_3', x: 50, y: 1050, width: 120, height: 100, type: 'exit', targetId: 'exhibition_1', hint: '返回大厅', activated: false }
    ]
  },
  {
    id: 'exhibition_5',
    name: '回忆长廊',
    bgColor: GAME_CONFIG.COLORS.AMBER,
    description: '一条金色的长廊，两侧的玻璃柜中封存着无数美好的记忆。琥珀色的光芒让你感到无比温暖。长廊尽头有一扇神秘的门...',
    unlocked: false,
    hotspots: [
      { id: 'hs_9', x: 200, y: 400, width: 120, height: 120, type: 'clue', targetId: 'clue_6', hint: '古老钥匙', activated: false },
      { id: 'hs_10', x: 450, y: 500, width: 120, height: 120, type: 'clue', targetId: 'clue_10', hint: '古籍', activated: false },
      { id: 'hs_final', x: 350, y: 800, width: 150, height: 150, type: 'mechanism', targetId: 'mech_3', hint: '修复室之门', activated: false },
      { id: 'hs_back_4', x: 50, y: 1050, width: 120, height: 100, type: 'exit', targetId: 'exhibition_4', hint: '返回珍藏馆', activated: false },
      { id: 'hs_to_restoration', x: 600, y: 1050, width: 120, height: 100, type: 'exit', targetId: 'exhibition_6', hint: '前往修复室', activated: false }
    ]
  },
  {
    id: 'exhibition_6',
    name: '文物修复室',
    bgColor: GAME_CONFIG.COLORS.BRONZE,
    description: '一间专业的文物修复工作室，空气中弥漫着淡淡的化学试剂气味。工作台上摆放着各种精密的修复工具和材料。一件破损的青铜鼎静静等待着重焕光彩。',
    unlocked: false,
    hotspots: [
      { id: 'hs_11', x: 100, y: 300, width: 110, height: 110, type: 'clue', targetId: 'clue_11', hint: '精细砂纸', activated: false },
      { id: 'hs_12', x: 280, y: 250, width: 110, height: 110, type: 'clue', targetId: 'clue_12', hint: '文物修复胶', activated: false },
      { id: 'hs_13', x: 460, y: 300, width: 110, height: 110, type: 'clue', targetId: 'clue_13', hint: '青铜补配粉', activated: false },
      { id: 'hs_14', x: 150, y: 500, width: 110, height: 110, type: 'clue', targetId: 'clue_14', hint: '抛光软布', activated: false },
      { id: 'hs_15', x: 480, y: 500, width: 110, height: 110, type: 'clue', targetId: 'clue_15', hint: '专业镊子', activated: false },
      { id: 'hs_mech_restoration', x: 300, y: 750, width: 160, height: 160, type: 'mechanism', targetId: 'mech_4', hint: '开始修复青铜鼎', activated: false },
      { id: 'hs_back_5', x: 50, y: 1050, width: 120, height: 100, type: 'exit', targetId: 'exhibition_5', hint: '返回回忆长廊', activated: false }
    ]
  },
  {
    id: 'exhibition_7',
    name: '青铜珍品馆',
    bgColor: GAME_CONFIG.COLORS.DARK_BROWN,
    description: '修复完成的青铜鼎被移至这里展出。柔和的灯光下，一件件青铜珍品散发着神秘而庄严的气息，诉说着中华民族五千年的文明史。',
    unlocked: false,
    hotspots: [
      { id: 'hs_relic_display', x: 300, y: 500, width: 160, height: 160, type: 'mechanism', targetId: 'mech_5', hint: '欣赏修复后的青铜鼎', activated: false },
      { id: 'hs_back_6', x: 50, y: 1050, width: 120, height: 100, type: 'exit', targetId: 'exhibition_6', hint: '返回修复室', activated: false }
    ]
  },
  {
    id: 'exhibition_history_1',
    name: '历史馆·青铜王朝',
    bgColor: GAME_CONFIG.COLORS.BRONZE,
    description: '这里陈列着商周时期的青铜重器。每一件器物都诉说着那个辉煌时代的故事。墙上的铭文记载着一位神秘工匠的传奇。',
    unlocked: false,
    hallType: 'history',
    linkedExhibitionId: 'exhibition_art_1',
    phase: 1,
    hotspots: [
      { id: 'hs_h1_1', x: 150, y: 400, width: 120, height: 120, type: 'clue', targetId: 'clue_h1', hint: '青铜鼎铭文拓片', activated: false },
      { id: 'hs_h1_2', x: 450, y: 500, width: 120, height: 120, type: 'clue', targetId: 'clue_h2', hint: '工匠族谱', activated: false },
      { id: 'hs_h1_link', x: 300, y: 700, width: 140, height: 140, type: 'mechanism', targetId: 'mech_linked_1', hint: '联动机关·青铜锁', activated: false },
      { id: 'hs_h1_to_h2', x: 600, y: 900, width: 100, height: 150, type: 'exit', targetId: 'exhibition_history_2', hint: '前往礼乐厅', activated: false },
      { id: 'hs_h1_to_art', x: 50, y: 900, width: 100, height: 150, type: 'exit', targetId: 'exhibition_art_1', hint: '前往艺术馆', activated: false },
      { id: 'hs_h1_back', x: 300, y: 1100, width: 120, height: 100, type: 'exit', targetId: 'exhibition_7', hint: '返回青铜珍品馆', activated: false }
    ]
  },
  {
    id: 'exhibition_history_2',
    name: '历史馆·礼乐厅',
    bgColor: GAME_CONFIG.COLORS.DARK_BROWN,
    description: '恢宏的编钟静静伫立，仿佛还能听到千年前的礼乐回响。这里展示着古代贵族的礼仪制度与音乐文化。',
    unlocked: false,
    hallType: 'history',
    linkedExhibitionId: 'exhibition_art_2',
    phase: 2,
    hotspots: [
      { id: 'hs_h2_1', x: 200, y: 450, width: 120, height: 120, type: 'clue', targetId: 'clue_h3', hint: '编钟乐谱', activated: false },
      { id: 'hs_h2_2', x: 500, y: 350, width: 120, height: 120, type: 'clue', targetId: 'clue_shared_1', hint: '礼乐铭文（需艺术馆线索）', activated: false },
      { id: 'hs_h2_link', x: 350, y: 650, width: 140, height: 140, type: 'mechanism', targetId: 'mech_linked_2', hint: '联动机关·音律锁', activated: false },
      { id: 'hs_h2_to_h3', x: 600, y: 900, width: 100, height: 150, type: 'exit', targetId: 'exhibition_history_3', hint: '前往匠作坊', activated: false },
      { id: 'hs_h2_to_art', x: 50, y: 900, width: 100, height: 150, type: 'exit', targetId: 'exhibition_art_2', hint: '前往艺术馆', activated: false },
      { id: 'hs_h2_back', x: 300, y: 1100, width: 120, height: 100, type: 'exit', targetId: 'exhibition_history_1', hint: '返回青铜王朝', activated: false }
    ]
  },
  {
    id: 'exhibition_history_3',
    name: '历史馆·匠作坊',
    bgColor: GAME_CONFIG.COLORS.DARK_BG,
    description: '还原了古代青铜铸造作坊的场景。炉火虽已熄灭，但匠人的智慧与执着仿佛还在空气中流淌。',
    unlocked: false,
    hallType: 'history',
    linkedExhibitionId: 'exhibition_art_3',
    phase: 3,
    hotspots: [
      { id: 'hs_h3_1', x: 150, y: 400, width: 120, height: 120, type: 'clue', targetId: 'clue_shared_2', hint: '铸造图谱（需艺术馆线索）', activated: false },
      { id: 'hs_h3_link', x: 300, y: 600, width: 160, height: 160, type: 'mechanism', targetId: 'mech_linked_final', hint: '联动机关·千年之锁', activated: false },
      { id: 'hs_h3_to_auth', x: 320, y: 900, width: 120, height: 150, type: 'exit', targetId: 'exhibition_auth_1', hint: '前往文物鉴定室', activated: false },
      { id: 'hs_h3_to_art', x: 50, y: 900, width: 100, height: 150, type: 'exit', targetId: 'exhibition_art_3', hint: '前往艺术馆', activated: false },
      { id: 'hs_h3_back', x: 600, y: 900, width: 120, height: 100, type: 'exit', targetId: 'exhibition_history_2', hint: '返回礼乐厅', activated: false }
    ]
  },
  {
    id: 'exhibition_art_1',
    name: '艺术馆·琥珀殿堂',
    bgColor: GAME_CONFIG.COLORS.AMBER,
    description: '温润的琥珀在灯光下散发着迷人的光芒。这里收藏着古今中外的琥珀艺术珍品，每一件都封存着永恒的美。',
    unlocked: false,
    hallType: 'art',
    linkedExhibitionId: 'exhibition_history_1',
    phase: 1,
    hotspots: [
      { id: 'hs_a1_1', x: 150, y: 400, width: 120, height: 120, type: 'clue', targetId: 'clue_a1', hint: '琥珀雕件·昆虫', activated: false },
      { id: 'hs_a1_2', x: 450, y: 500, width: 120, height: 120, type: 'clue', targetId: 'clue_a2', hint: '艺术家手札', activated: false },
      { id: 'hs_a1_link', x: 300, y: 700, width: 140, height: 140, type: 'mechanism', targetId: 'mech_linked_1', hint: '联动机关·琥珀锁', activated: false },
      { id: 'hs_a1_to_a2', x: 600, y: 900, width: 100, height: 150, type: 'exit', targetId: 'exhibition_art_2', hint: '前往画廊', activated: false },
      { id: 'hs_a1_to_history', x: 50, y: 900, width: 100, height: 150, type: 'exit', targetId: 'exhibition_history_1', hint: '前往历史馆', activated: false },
      { id: 'hs_a1_back', x: 300, y: 1100, width: 120, height: 100, type: 'exit', targetId: 'exhibition_7', hint: '返回青铜珍品馆', activated: false }
    ]
  },
  {
    id: 'exhibition_art_2',
    name: '艺术馆·时光画廊',
    bgColor: GAME_CONFIG.COLORS.DEEP_PURPLE,
    description: '一幅幅以琥珀为主题的画作悬挂两侧。画中的光影流转，仿佛将时间凝固在每一笔色彩之中。',
    unlocked: false,
    hallType: 'art',
    linkedExhibitionId: 'exhibition_history_2',
    phase: 2,
    hotspots: [
      { id: 'hs_a2_1', x: 200, y: 450, width: 120, height: 120, type: 'clue', targetId: 'clue_a3', hint: '油画·青铜与琥珀', activated: false },
      { id: 'hs_a2_2', x: 500, y: 350, width: 120, height: 120, type: 'clue', targetId: 'clue_shared_1', hint: '画家题记（需历史馆线索）', activated: false },
      { id: 'hs_a2_link', x: 350, y: 650, width: 140, height: 140, type: 'mechanism', targetId: 'mech_linked_2', hint: '联动机关·调色锁', activated: false },
      { id: 'hs_a2_to_a3', x: 600, y: 900, width: 100, height: 150, type: 'exit', targetId: 'exhibition_art_3', hint: '前往创作室', activated: false },
      { id: 'hs_a2_to_history', x: 50, y: 900, width: 100, height: 150, type: 'exit', targetId: 'exhibition_history_2', hint: '前往历史馆', activated: false },
      { id: 'hs_a2_back', x: 300, y: 1100, width: 120, height: 100, type: 'exit', targetId: 'exhibition_art_1', hint: '返回琥珀殿堂', activated: false }
    ]
  },
  {
    id: 'exhibition_art_3',
    name: '艺术馆·创作室',
    bgColor: GAME_CONFIG.COLORS.WARM_ORANGE,
    description: '艺术家的创作空间，散落着未完成的作品和各种工具。空气中似乎还残留着松节油和琥珀的混合香气。',
    unlocked: false,
    hallType: 'art',
    linkedExhibitionId: 'exhibition_history_3',
    phase: 3,
    hotspots: [
      { id: 'hs_a3_1', x: 150, y: 400, width: 120, height: 120, type: 'clue', targetId: 'clue_shared_2', hint: '创作草图（需历史馆线索）', activated: false },
      { id: 'hs_a3_link', x: 300, y: 600, width: 160, height: 160, type: 'mechanism', targetId: 'mech_linked_final', hint: '联动机关·永恒之锁', activated: false },
      { id: 'hs_a3_to_history', x: 50, y: 900, width: 100, height: 150, type: 'exit', targetId: 'exhibition_history_3', hint: '前往历史馆', activated: false },
      { id: 'hs_a3_back', x: 600, y: 900, width: 120, height: 100, type: 'exit', targetId: 'exhibition_art_2', hint: '返回时光画廊', activated: false }
    ]
  },
  {
    id: 'exhibition_auth_1',
    name: '文物鉴定室',
    bgColor: GAME_CONFIG.COLORS.DARK_BG,
    description: '一间专业的文物鉴定工作室，配备了放大镜、紫外灯等专业设备。工作台上摆放着四件待鉴定的珍贵藏品，每一件都关系到一个重大的秘密。墙上挂着爷爷的鉴定笔记，记录着他一生的心血与智慧。',
    unlocked: false,
    hotspots: [
      { id: 'hs_auth_1', x: 100, y: 350, width: 120, height: 120, type: 'clue', targetId: 'clue_auth_1', hint: '爷爷的鉴定笔记', activated: false },
      { id: 'hs_auth_2', x: 300, y: 250, width: 120, height: 120, type: 'clue', targetId: 'clue_auth_2', hint: '专用放大镜', activated: false },
      { id: 'hs_auth_3', x: 500, y: 350, width: 120, height: 120, type: 'clue', targetId: 'clue_auth_3', hint: '紫外荧光灯', activated: false },
      { id: 'hs_auth_4', x: 200, y: 550, width: 120, height: 120, type: 'clue', targetId: 'clue_auth_4', hint: '收藏证书', activated: false },
      { id: 'hs_mech_auth', x: 350, y: 750, width: 160, height: 160, type: 'mechanism', targetId: 'mech_authenticity', hint: '开始藏品真伪鉴定', activated: false },
      { id: 'hs_back_auth', x: 50, y: 1050, width: 120, height: 100, type: 'exit', targetId: 'exhibition_history_3', hint: '返回匠作坊', activated: false }
    ]
  },
  {
    id: 'exhibition_auth_final',
    name: '爷爷的珍藏密室',
    bgColor: GAME_CONFIG.COLORS.GOLD,
    description: '鉴定室深处的密室，这里陈列着爷爷一生最珍贵的收藏。每一件文物都承载着深厚的历史意义，每一件背后都有一段动人的故事。柔和的灯光洒在文物上，仿佛在诉说着千年的时光。',
    unlocked: false,
    hotspots: [
      { id: 'hs_final_story', x: 300, y: 500, width: 160, height: 160, type: 'mechanism', targetId: 'mech_auth_final', hint: '了解爷爷的故事', activated: false },
      { id: 'hs_back_final', x: 50, y: 1050, width: 120, height: 100, type: 'exit', targetId: 'exhibition_auth_1', hint: '返回鉴定室', activated: false }
    ]
  },
  {
    id: 'exhibition_corridor_entrance',
    name: '记忆回廊·入口',
    bgColor: GAME_CONFIG.COLORS.DEEP_PURPLE,
    description: '一条幽深的走廊在你面前延伸，两侧的墙面闪烁着琥珀色的微光。墙上镶嵌着无数发光的碎片，每一片都封存着一段记忆。走廊尽头，一扇刻满符文的大门静静伫立，等待着被唤醒。空气中弥漫着熟悉而遥远的气息，仿佛时光在这里停滞。',
    unlocked: false,
    hotspots: [
      { id: 'hs_cor_1', x: 150, y: 400, width: 120, height: 120, type: 'clue', targetId: 'clue_cor_1', hint: '回廊钥匙', activated: false },
      { id: 'hs_cor_mech_1', x: 350, y: 650, width: 160, height: 160, type: 'mechanism', targetId: 'mech_cor_entrance', hint: '开启记忆回廊', activated: false },
      { id: 'hs_cor_back_1', x: 50, y: 1050, width: 120, height: 100, type: 'exit', targetId: 'exhibition_auth_final', hint: '返回珍藏密室', activated: false }
    ]
  },
  {
    id: 'exhibition_corridor_childhood',
    name: '记忆回廊·童年',
    bgColor: GAME_CONFIG.COLORS.AMBER,
    description: '温暖的琥珀色光芒包裹着你，你仿佛穿越回了琥珀的童年时光。眼前是一片金色的向日葵花田，年幼的琥珀正追逐着一只蝴蝶。爷爷站在不远处，微笑着看着她，手中握着那枚熟悉的琥珀吊坠。空气中弥漫着阳光和花香的味道。',
    unlocked: false,
    hotspots: [
      { id: 'hs_cor_2', x: 100, y: 350, width: 120, height: 120, type: 'clue', targetId: 'clue_cor_2', hint: '向日葵花语', activated: false },
      { id: 'hs_cor_3', x: 550, y: 450, width: 120, height: 120, type: 'clue', targetId: 'clue_cor_3', hint: '蝴蝶标本', activated: false },
      { id: 'hs_cor_mech_2', x: 320, y: 700, width: 160, height: 160, type: 'mechanism', targetId: 'mech_cor_memory_1', hint: '排列童年记忆碎片', activated: false },
      { id: 'hs_cor_back_2', x: 50, y: 1050, width: 120, height: 100, type: 'exit', targetId: 'exhibition_corridor_entrance', hint: '返回回廊入口', activated: false },
      { id: 'hs_cor_to_youth', x: 600, y: 1050, width: 120, height: 100, type: 'exit', targetId: 'exhibition_corridor_youth', hint: '前往青春回廊', activated: false }
    ]
  },
  {
    id: 'exhibition_corridor_youth',
    name: '记忆回廊·青春',
    bgColor: GAME_CONFIG.COLORS.WARM_ORANGE,
    description: '场景切换到青春校园。十六岁的琥珀站在人生的十字路口，手中拿着大学录取通知书和一封来自国外艺术学院的邀请函。一边是父母的期望，一边是自己的梦想。她的眼中闪烁着迷茫与坚定，这是一个将改变她一生的选择。',
    unlocked: false,
    hotspots: [
      { id: 'hs_cor_4', x: 150, y: 350, width: 120, height: 120, type: 'clue', targetId: 'clue_cor_4', hint: '大学录取通知书', activated: false },
      { id: 'hs_cor_5', x: 500, y: 400, width: 120, height: 120, type: 'clue', targetId: 'clue_cor_5', hint: '艺术学院邀请函', activated: false },
      { id: 'hs_cor_mech_3', x: 320, y: 650, width: 160, height: 160, type: 'mechanism', targetId: 'mech_cor_branch_1', hint: '面对人生的第一次抉择', activated: false },
      { id: 'hs_cor_back_3', x: 50, y: 1050, width: 120, height: 100, type: 'exit', targetId: 'exhibition_corridor_childhood', hint: '返回童年回廊', activated: false },
      { id: 'hs_cor_to_present', x: 600, y: 1050, width: 120, height: 100, type: 'exit', targetId: 'exhibition_corridor_present', hint: '前往此刻回廊', activated: false }
    ]
  },
  {
    id: 'exhibition_corridor_present',
    name: '记忆回廊·此刻',
    bgColor: GAME_CONFIG.COLORS.DARK_BG,
    description: '回到现在，你站在记忆回廊的核心区域。四周漂浮着所有收集到的记忆碎片，它们按照时间顺序排列，形成一条璀璨的星河。你看到琥珀在不同阶段的样子：童年的纯真、青春的迷茫、成年后的坚定。现在，你需要做出最后的选择，揭开真正的结局。',
    unlocked: false,
    hotspots: [
      { id: 'hs_cor_6', x: 100, y: 350, width: 120, height: 120, type: 'clue', targetId: 'clue_cor_6', hint: '爷爷的遗言', activated: false },
      { id: 'hs_cor_7', x: 350, y: 300, width: 120, height: 120, type: 'clue', targetId: 'clue_cor_7', hint: '母亲的家书', activated: false },
      { id: 'hs_cor_8', x: 550, y: 380, width: 120, height: 120, type: 'clue', targetId: 'clue_cor_8', hint: '琥珀的日记', activated: false },
      { id: 'hs_cor_mech_4', x: 200, y: 650, width: 160, height: 160, type: 'mechanism', targetId: 'mech_cor_memory_final', hint: '拼凑完整的记忆', activated: false },
      { id: 'hs_cor_mech_5', x: 480, y: 650, width: 160, height: 160, type: 'mechanism', targetId: 'mech_cor_branch_final', hint: '做出最终抉择', activated: false },
      { id: 'hs_cor_back_4', x: 50, y: 1050, width: 120, height: 100, type: 'exit', targetId: 'exhibition_corridor_youth', hint: '返回青春回廊', activated: false }
    ]
  },
  {
    id: 'exhibition_corridor_ending',
    name: '记忆回廊·终章',
    bgColor: GAME_CONFIG.COLORS.GOLD,
    description: '金色的光芒笼罩着整个空间，你站在记忆回廊的尽头。一扇通往结局的大门在你面前缓缓打开。你的每一个选择，每一段记忆，都在此刻汇聚成最终的答案。琥珀的故事将如何收尾？一切，都取决于你。',
    unlocked: false,
    hotspots: [
      { id: 'hs_cor_ending', x: 300, y: 500, width: 200, height: 200, type: 'mechanism', targetId: 'mech_cor_ending', hint: '揭开最终结局', activated: false },
      { id: 'hs_cor_back_5', x: 50, y: 1050, width: 120, height: 100, type: 'exit', targetId: 'exhibition_corridor_present', hint: '返回此刻回廊', activated: false }
    ]
  }
];

export const MECHANISMS: Mechanism[] = [
  {
    id: 'mech_1',
    type: 'password',
    answer: '1998',
    reward: 'exhibition_4',
    hint: '照片上的年份...',
    solved: false,
    displayName: '古老密码锁'
  },
  {
    id: 'mech_2',
    type: 'sequence',
    answer: [1, 2, 3],
    reward: 'exhibition_5',
    hint: '按记忆顺序排列...',
    solved: false,
    displayName: '记忆机关'
  },
  {
    id: 'mech_3',
    type: 'password',
    answer: '315',
    reward: 'exhibition_6',
    hint: '怀表停止的时间...',
    solved: false,
    displayName: '修复室之门'
  },
  {
    id: 'mech_4',
    type: 'restoration',
    answer: [1, 2, 3, 4, 5],
    reward: 'exhibition_7',
    hint: '按照正确的修复顺序操作...',
    solved: false,
    displayName: '青铜鼎修复',
    relicId: 'relic_bronze_ding'
  },
  {
    id: 'mech_5',
    type: 'password',
    answer: '1046',
    reward: 'unlock_chapter_4',
    hint: '商周时期开始的年份...',
    solved: false,
    displayName: '青铜密码'
  },
  {
    id: 'mech_linked_1',
    type: 'linked',
    answer: '1212',
    reward: 'unlock_phase_2',
    hint: '青铜的铸造年份与琥珀的诞生年份，交替排列...',
    solved: false,
    displayName: '联动机关·青铜琥珀锁',
    isLinked: true,
    requiredHistoryClues: ['clue_h1', 'clue_h2'],
    requiredArtClues: ['clue_a1', 'clue_a2'],
    linkedProgress: 0,
    hallOrigin: 'history'
  },
  {
    id: 'mech_linked_2',
    type: 'linked',
    answer: [1, 3, 2, 4],
    reward: 'unlock_phase_3',
    hint: '按照礼乐的节奏与画作的色调交替排列...',
    solved: false,
    displayName: '联动机关·音律调色锁',
    isLinked: true,
    requiredHistoryClues: ['clue_h3', 'clue_shared_1'],
    requiredArtClues: ['clue_a3', 'clue_shared_1'],
    linkedProgress: 0,
    hallOrigin: 'art'
  },
  {
    id: 'mech_linked_final',
    type: 'linked',
    answer: '永恒',
    reward: 'unlock_chapter_5',
    hint: '历史与艺术的交汇处，是爷爷想要告诉你的答案...',
    solved: false,
    displayName: '联动机关·千年永恒锁',
    isLinked: true,
    requiredHistoryClues: ['clue_h1', 'clue_h2', 'clue_h3', 'clue_shared_1', 'clue_shared_2'],
    requiredArtClues: ['clue_a1', 'clue_a2', 'clue_a3', 'clue_shared_1', 'clue_shared_2'],
    linkedProgress: 0
  },
  {
    id: 'mech_authenticity',
    type: 'authenticity',
    answer: '6104',
    reward: 'unlock_auth_final',
    hint: '根据每件藏品的鉴定结果，按照藏品顺序推导四位密码。正确判断藏品真伪后，会获得对应的数字和位置线索。',
    solved: false,
    displayName: '藏品真伪鉴定',
    authenticityRelicIds: ['relic_auth_1', 'relic_auth_2', 'relic_auth_3', 'relic_auth_4']
  },
  {
    id: 'mech_auth_final',
    type: 'password',
    answer: '永恒',
    reward: 'start_memory_corridor',
    hint: '爷爷一生追求的答案...',
    solved: false,
    displayName: '爷爷的终极秘密'
  },
  {
    id: 'mech_cor_entrance',
    type: 'password',
    answer: '记忆',
    reward: 'exhibition_corridor_childhood',
    hint: '回廊的钥匙上刻着两个字...',
    solved: false,
    displayName: '记忆回廊之门',
    memoryCorridorPhase: {
      phase: 1
    }
  },
  {
    id: 'mech_cor_memory_1',
    type: 'memory_sort',
    answer: [2, 3],
    reward: 'unlock_corridor_phase_2',
    hint: '按照记忆的时间顺序排列碎片：追逐蝴蝶的午后、将蝴蝶制作成标本...',
    solved: false,
    displayName: '童年记忆排序',
    memoryCorridorPhase: {
      phase: 2,
      fragmentIds: ['clue_cor_2', 'clue_cor_3']
    }
  },
  {
    id: 'mech_cor_branch_1',
    type: 'branch_choice',
    answer: 'choice_study_art',
    reward: 'unlock_corridor_phase_3',
    hint: '站在人生的十字路口，你会如何选择？',
    solved: false,
    displayName: '青春的抉择',
    branchChoiceId: 'branch_cor_1',
    memoryCorridorPhase: {
      phase: 3
    }
  },
  {
    id: 'mech_cor_memory_final',
    type: 'memory_sort',
    answer: [1, 2, 3, 4, 5, 6, 7, 8],
    reward: 'unlock_corridor_final',
    hint: '将所有记忆碎片按照时间顺序重新排列：童年的向日葵花田、追逐蝴蝶的午后、将蝴蝶制作成标本、收到大学录取通知书、收到艺术学院邀请函、爷爷的遗言、母亲的家书、琥珀的日记...',
    solved: false,
    displayName: '完整记忆拼图',
    memoryCorridorPhase: {
      phase: 4,
      fragmentIds: ['clue_cor_1', 'clue_cor_2', 'clue_cor_3', 'clue_cor_4', 'clue_cor_5', 'clue_cor_6', 'clue_cor_7', 'clue_cor_8']
    }
  },
  {
    id: 'mech_cor_branch_final',
    type: 'branch_choice',
    answer: 'choice_remember_forever',
    reward: 'unlock_ending_hall',
    hint: '面对最后的抉择，你会选择什么？',
    solved: false,
    displayName: '最终的抉择',
    branchChoiceId: 'branch_cor_2',
    memoryCorridorPhase: {
      phase: 4
    }
  },
  {
    id: 'mech_cor_ending',
    type: 'password',
    answer: '永恒',
    reward: 'complete_memory_corridor',
    hint: '当所有记忆归位，当所有选择尘埃落定，答案就是...',
    solved: false,
    displayName: '结局之门'
  },
  {
    id: 'mech_blackout_emergency',
    type: 'sequence',
    answer: [3, 1, 2],
    reward: 'clue_blackout_emergency',
    hint: '按照紧急程度排序：红色按钮、黄色开关、绿色手柄',
    solved: false,
    displayName: '紧急开关面板'
  },
  {
    id: 'mech_blackout_generator',
    type: 'password',
    answer: '1998',
    reward: 'unlock_emergency_exit',
    hint: '发电机启动密码是博物馆建成的年份',
    solved: false,
    displayName: '发电机控制面板'
  },
  {
    id: 'mech_blackout_final',
    type: 'password',
    answer: '琥珀',
    reward: 'clue_blackout_final',
    hint: '在最黑暗的时刻，你最想见到的人是谁？',
    solved: false,
    displayName: '主电源恢复开关'
  }
];
