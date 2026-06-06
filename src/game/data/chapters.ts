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
    completed: false
  },
  {
    id: 'chapter_2',
    title: '第二章：爷爷的礼物',
    description: '深入博物馆，你发现了更多关于琥珀和她爷爷的故事。原来这座博物馆，是爷爷送给琥珀最后的礼物。',
    exhibitions: ['exhibition_4', 'exhibition_5'],
    requiredClues: ['clue_7', 'clue_8', 'clue_9'],
    storyText: '爷爷的爱如同琥珀一般，历经岁月而不褪色。那些被封存的记忆，如今在你眼前一一展现...',
    completed: false
  },
  {
    id: 'chapter_3',
    title: '第三章：文物修复室',
    description: '博物馆深处隐藏着一间神秘的文物修复室。一件破损的青铜鼎等待着你亲手修复，让千年文物重焕光彩。',
    exhibitions: ['exhibition_6', 'exhibition_7'],
    requiredClues: ['clue_11', 'clue_12', 'clue_13', 'clue_14', 'clue_15'],
    storyText: '当最后一道工序完成，青铜鼎恢复了昔日的辉煌。你仿佛穿越千年，亲手触摸到了那段辉煌的历史。文物的修复，亦是记忆的修复...',
    completed: false
  },
  {
    id: 'chapter_4',
    title: '第四章：双馆并行调查',
    description: '博物馆的最深处隐藏着两座神秘展馆——历史馆与艺术馆。你需要在两馆间交叉取证，共享线索，共同推进联动机关，揭开尘封千年的秘密。',
    exhibitions: ['exhibition_history_1', 'exhibition_history_2', 'exhibition_history_3', 'exhibition_art_1', 'exhibition_art_2', 'exhibition_art_3'],
    requiredClues: ['clue_h1', 'clue_h2', 'clue_h3', 'clue_a1', 'clue_a2', 'clue_a3', 'clue_shared_1', 'clue_shared_2'],
    storyText: '当历史与艺术交汇，真相终于浮出水面。原来青铜鼎与琥珀，有着千丝万缕的联系...',
    completed: false,
    isDualHall: true,
    historyExhibitions: ['exhibition_history_1', 'exhibition_history_2', 'exhibition_history_3'],
    artExhibitions: ['exhibition_art_1', 'exhibition_art_2', 'exhibition_art_3'],
    dualHallStoryText: {
      history: '穿越千年的青铜文明，诉说着王朝的兴衰与匠人的执着...',
      art: '流光溢彩的琥珀艺术，封存着永恒的美丽与动人的故事...',
      combined: '历史与艺术在此刻交融，青铜的厚重与琥珀的温润，共同谱写了一曲跨越时空的交响乐章。原来爷爷一直想告诉你的是——美，从来都有千种面貌，但爱，始终如一。'
    }
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
    reward: 'chapter_4_complete',
    hint: '历史与艺术的交汇处，是爷爷想要告诉你的答案...',
    solved: false,
    displayName: '联动机关·千年永恒锁',
    isLinked: true,
    requiredHistoryClues: ['clue_h1', 'clue_h2', 'clue_h3', 'clue_shared_1', 'clue_shared_2'],
    requiredArtClues: ['clue_a1', 'clue_a2', 'clue_a3', 'clue_shared_1', 'clue_shared_2'],
    linkedProgress: 0
  }
];
