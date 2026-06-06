import { Character } from '../types';

export const CHARACTERS: Character[] = [
  {
    id: 'char_amber',
    name: '林琥珀',
    avatar: '👧',
    description: '故事的主角，一个热爱艺术的小女孩。她的笑容如同琥珀一般温暖明亮，对世界充满好奇。琥珀从小就与爷爷感情深厚，经常在博物馆中陪伴爷爷工作。',
    role: '主角',
    chapterId: 'chapter_1',
    unlocked: true,
    relationships: [
      { targetId: 'char_grandpa', relationshipType: 'family', description: '最亲爱的爷爷' },
      { targetId: 'char_mother', relationshipType: 'family', description: '温柔的母亲' },
      { targetId: 'char_father', relationshipType: 'family', description: '忙碌的父亲' }
    ],
    relatedClues: ['clue_1', 'clue_2', 'clue_3', 'clue_4', 'clue_5', 'clue_6', 'clue_10', 'clue_cor_1', 'clue_cor_2', 'clue_cor_3', 'clue_cor_4', 'clue_cor_5', 'clue_cor_6', 'clue_cor_7', 'clue_cor_8', 'clue_cor_choice_1', 'clue_cor_choice_2', 'clue_cor_choice_3'],
    relatedEvents: ['event_amber_birth', 'event_amber_childhood', 'event_amber_hospital', 'event_corridor_start', 'event_corridor_childhood', 'event_memory_sort_1', 'event_corridor_youth', 'event_branch_1', 'event_corridor_present', 'event_memory_sort_final', 'event_branch_final', 'event_ending_true', 'event_ending_good', 'event_ending_neutral', 'event_ending_bad']
  },
  {
    id: 'char_grandpa',
    name: '林永恒',
    avatar: '👴',
    description: '琥珀的爷爷，一位资深的文物收藏家与博物馆馆长。他将一生的心血都倾注在这座博物馆上，希望能够将美好的记忆永恒保存。爷爷对琥珀的爱深沉而内敛，用独特的方式守护着孙女的成长。',
    role: '关键人物',
    chapterId: 'chapter_2',
    unlocked: false,
    relationships: [
      { targetId: 'char_amber', relationshipType: 'family', description: '最疼爱的孙女' },
      { targetId: 'char_father', relationshipType: 'family', description: '儿子' },
      { targetId: 'char_artisan_huai', relationshipType: 'mysterious', description: '神秘的先祖？' }
    ],
    relatedClues: ['clue_6', 'clue_7', 'clue_8', 'clue_9', 'clue_10', 'clue_cor_1', 'clue_cor_6', 'clue_cor_8'],
    relatedEvents: ['event_grandpa_museum', 'event_grandpa_gift', 'event_grandpa_letter', 'event_corridor_start', 'event_corridor_childhood', 'event_corridor_present', 'event_memory_sort_final', 'event_branch_final', 'event_ending_true', 'event_ending_good']
  },
  {
    id: 'char_mother',
    name: '陈婉清',
    avatar: '👩',
    description: '琥珀的母亲，一位优雅的艺术史学者。她温柔善良，用艺术的方式教育琥珀，培养了琥珀对美的感知力。在琥珀生病期间，她始终陪伴在女儿身边，给予最温暖的关怀。',
    role: '家人',
    chapterId: 'chapter_1',
    unlocked: false,
    relationships: [
      { targetId: 'char_amber', relationshipType: 'family', description: '心爱的女儿' },
      { targetId: 'char_father', relationshipType: 'family', description: '丈夫' },
      { targetId: 'char_grandpa', relationshipType: 'family', description: '公公' }
    ],
    relatedClues: ['clue_1', 'clue_3'],
    relatedEvents: ['event_amber_childhood', 'event_amber_hospital']
  },
  {
    id: 'char_father',
    name: '林承业',
    avatar: '👨',
    description: '琥珀的父亲，一位忙碌的企业家。虽然工作繁忙，但他始终将家人放在心中第一位。他继承了父亲对文物的热爱，用自己的方式支持着博物馆的运营。',
    role: '家人',
    chapterId: 'chapter_1',
    unlocked: false,
    relationships: [
      { targetId: 'char_amber', relationshipType: 'family', description: '疼爱的女儿' },
      { targetId: 'char_mother', relationshipType: 'family', description: '妻子' },
      { targetId: 'char_grandpa', relationshipType: 'family', description: '父亲' }
    ],
    relatedClues: ['clue_1', 'clue_5'],
    relatedEvents: ['event_amber_childhood']
  },
  {
    id: 'char_artisan_huai',
    name: '怀素',
    avatar: '🏺',
    description: '商周时期的神秘青铜工匠，传说中他铸造的青铜器件件都是精品。他的家族世代传承着精湛的铸造技艺，而"永恒"这个名字也在家族中代代相传。据说他精通青铜与玉石的奥秘，追求将瞬间的美化作永恒。',
    role: '历史人物',
    chapterId: 'chapter_4',
    unlocked: false,
    relationships: [
      { targetId: 'char_artist_yong', relationshipType: 'mysterious', description: '同一家族的传人？' },
      { targetId: 'char_grandpa', relationshipType: 'mysterious', description: '家族先祖？' }
    ],
    relatedClues: ['clue_h1', 'clue_h2', 'clue_h3'],
    relatedEvents: ['event_huai_casting', 'event_huai_legacy']
  },
  {
    id: 'char_artist_yong',
    name: '永恒',
    avatar: '🎨',
    description: '神秘的琥珀艺术家，自称"永恒工坊"的传人。他的作品融合了传统与现代，将琥珀之美发挥到极致。据说他的家族历史可以追溯到商周时期，世代都在追求"永恒之美"。',
    role: '历史人物',
    chapterId: 'chapter_4',
    unlocked: false,
    relationships: [
      { targetId: 'char_artisan_huai', relationshipType: 'mysterious', description: '同一家族的传人？' }
    ],
    relatedClues: ['clue_a1', 'clue_a2', 'clue_a3'],
    relatedEvents: ['event_yong_artwork', 'event_yong_philosophy']
  },
  {
    id: 'char_ding',
    name: '青铜鼎',
    avatar: '⚱️',
    description: '一尊来自商周时期的青铜重器，见证了无数王朝的兴衰。它身上的铭文记载着古老的秘密，而千年之后，它将与琥珀相遇，共同揭示一个关于永恒的秘密。经过精心修复，它重新焕发了昔日的光彩。',
    role: '文物',
    chapterId: 'chapter_3',
    unlocked: false,
    relationships: [
      { targetId: 'char_amber', relationshipType: 'mysterious', description: '跨越千年的相遇' },
      { targetId: 'char_artisan_huai', relationshipType: 'teacher', description: '铸造者' }
    ],
    relatedClues: ['clue_11', 'clue_12', 'clue_13', 'clue_14', 'clue_15'],
    relatedEvents: ['event_ding_cast', 'event_ding_discovery', 'event_ding_restoration']
  }
];
