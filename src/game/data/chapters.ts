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
    description: '一条金色的长廊，两侧的玻璃柜中封存着无数美好的记忆。琥珀色的光芒让你感到无比温暖。',
    unlocked: false,
    hotspots: [
      { id: 'hs_9', x: 200, y: 400, width: 120, height: 120, type: 'clue', targetId: 'clue_6', hint: '古老钥匙', activated: false },
      { id: 'hs_10', x: 450, y: 500, width: 120, height: 120, type: 'clue', targetId: 'clue_10', hint: '古籍', activated: false },
      { id: 'hs_final', x: 350, y: 800, width: 150, height: 150, type: 'mechanism', targetId: 'mech_3', hint: '最终之门', activated: false },
      { id: 'hs_back_4', x: 50, y: 1050, width: 120, height: 100, type: 'exit', targetId: 'exhibition_4', hint: '返回珍藏馆', activated: false }
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
    reward: 'ending',
    hint: '怀表停止的时间...',
    solved: false,
    displayName: '最终之门'
  }
];
