import { AudioRecording } from '../types';

export const RECORDINGS: AudioRecording[] = [
  {
    id: 'rec_intro',
    chapterId: 'chapter_1',
    title: '馆长致辞',
    description: '欢迎来到琥珀记忆馆',
    transcript: '欢迎来到琥珀记忆馆。我是这座博物馆的馆长。每一件展品都承载着一段珍贵的记忆，等待着被唤醒。请慢慢探索，收集线索，拼凑出那段被封存的往事...',
    duration: 12,
    frequency: 160,
    unlocked: true,
    played: false
  },
  {
    id: 'rec_ch1_unlock',
    chapterId: 'chapter_1',
    title: '第一章·苏醒',
    description: '第一章解锁时的馆长寄语',
    transcript: '第一章"苏醒的记忆"已经开启。你在博物馆大厅中醒来，周围的一切既熟悉又陌生。那些琥珀展品中，似乎藏着关于一个叫"琥珀"的小女孩的故事。仔细观察每一个角落，线索就隐藏在细节之中。',
    duration: 15,
    frequency: 155,
    unlocked: true,
    played: false
  },
  {
    id: 'rec_ch1_clue_photo',
    chapterId: 'chapter_1',
    title: '照片背后的故事',
    description: '收集到老旧照片后的馆长解读',
    transcript: '这张照片拍摄于1998年的夏天。照片中的小女孩就是琥珀，那一年她刚出生。她的爷爷是一位著名的琥珀收藏家，这座博物馆就是他为小琥珀建立的礼物。照片背面的字迹，是爷爷亲手写下的。',
    duration: 14,
    frequency: 170,
    unlocked: false,
    played: false,
    requiredClues: ['clue_1']
  },
  {
    id: 'rec_ch1_clue_pendant',
    chapterId: 'chapter_1',
    title: '琥珀吊坠的秘密',
    description: '收集到琥珀吊坠后的馆长解读',
    transcript: '这枚琥珀吊坠是爷爷在琥珀八岁生日时送给她的礼物。里面封存的小昆虫，是祖孙二人一起在森林里发现的。爷爷说，最美的瞬间值得被永远保存，就像这只被琥珀封存的小虫一样。',
    duration: 16,
    frequency: 165,
    unlocked: false,
    played: false,
    requiredClues: ['clue_2']
  },
  {
    id: 'rec_ch1_clue_diary',
    chapterId: 'chapter_1',
    title: '日记里的对话',
    description: '收集到日记残页后的馆长解读',
    transcript: '这是爷爷的日记。小琥珀曾经问爷爷，琥珀里的虫子会不会疼。爷爷的回答充满了诗意——它们在最美的时刻被永远保存了下来。这个答案，小琥珀记了一辈子。',
    duration: 13,
    frequency: 175,
    unlocked: false,
    played: false,
    requiredClues: ['clue_3']
  },
  {
    id: 'rec_ch1_clue_bracelet',
    chapterId: 'chapter_1',
    title: '医院手环的记忆',
    description: '收集到医院手环后的馆长解读',
    transcript: '2010年，琥珀生了一场重病。这张医院手环，记录着那段艰难的时光。但即使在最困难的时候，爷爷也一直陪伴在她身边，告诉她要像琥珀一样坚强，永远不放弃希望。',
    duration: 15,
    frequency: 150,
    unlocked: false,
    played: false,
    requiredClues: ['clue_4']
  },
  {
    id: 'rec_ch1_memory_complete',
    chapterId: 'chapter_1',
    title: '记忆拼图·第一章',
    description: '完成第一章记忆拼图后的馆长总结',
    transcript: '恭喜你完成了第一章的记忆拼图。你已经拼凑出了琥珀童年的记忆——出生、成长、生病，以及爷爷无尽的爱。每一个记忆碎片都在诉说着一个关于爱与希望的故事。现在，更深层的记忆正在等待被唤醒...',
    duration: 18,
    frequency: 180,
    unlocked: false,
    played: false,
    requiredMemoryComplete: true
  },
  {
    id: 'rec_ch2_unlock',
    chapterId: 'chapter_2',
    title: '第二章·传承',
    description: '第二章解锁时的馆长寄语',
    transcript: '第二章"爷爷的礼物"已经开启。当你深入博物馆的珍藏馆，你会发现更多关于爷爷和琥珀的故事。这座博物馆本身，就是爷爷留给琥珀最珍贵的遗产。每一件展品都承载着爷爷对孙女深深的爱。',
    duration: 16,
    frequency: 158,
    unlocked: false,
    played: false
  },
  {
    id: 'rec_ch2_clue_letter',
    chapterId: 'chapter_2',
    title: '跨越时空的信件',
    description: '收集到旧信件后的馆长解读',
    transcript: '这封信是爷爷在病重时写给琥珀的。他知道自己时日无多，所以提前写下了这封信，封存在琥珀之中。爷爷说，他的爱会像琥珀一样，永远不变质，永远守护着小琥珀。',
    duration: 17,
    frequency: 168,
    unlocked: false,
    played: false,
    requiredClues: ['clue_7']
  },
  {
    id: 'rec_ch2_clue_painting',
    chapterId: 'chapter_2',
    title: '画中的小天使',
    description: '收集到画作草稿后的馆长解读',
    transcript: '这幅画是爷爷的绝笔。他在病床上，用颤抖的手，画下了他心中最珍贵的画面——站在琥珀中的小天使。这是他送给琥珀最后的礼物，也是他对孙女永恒的祝福。',
    duration: 15,
    frequency: 172,
    unlocked: false,
    played: false,
    requiredClues: ['clue_8']
  },
  {
    id: 'rec_ch2_clue_watch',
    chapterId: 'chapter_2',
    title: '怀表停止的那一刻',
    description: '收集到怀表后的馆长解读',
    transcript: '这块怀表是爷爷的传家宝。指针停在3点15分——那是爷爷离开人世的时刻。但在那一瞬间，爷爷把自己所有的爱和记忆，都封存在了这座博物馆中。他希望琥珀能在这里，永远感受到爷爷的存在。',
    duration: 18,
    frequency: 148,
    unlocked: false,
    played: false,
    requiredClues: ['clue_9']
  },
  {
    id: 'rec_ch2_memory_complete',
    chapterId: 'chapter_2',
    title: '记忆拼图·第二章',
    description: '完成第二章记忆拼图后的馆长总结',
    transcript: '你已经完成了所有的记忆拼图。琥珀的故事完整了——从出生到成长，从生病到康复，从爷爷的陪伴到爷爷的离去。但爷爷的爱从未消失，它被封存在这座博物馆的每一件展品中，等待着被你我这样的有心人发现。愿你也能找到属于自己的"琥珀"，珍藏那些生命中最珍贵的记忆。',
    duration: 22,
    frequency: 185,
    unlocked: false,
    played: false,
    requiredMemoryComplete: true
  },
  {
    id: 'rec_final',
    chapterId: 'chapter_2',
    title: '馆长的告别',
    description: '游戏通关后的最终寄语',
    transcript: '亲爱的访客，感谢你参观了琥珀记忆馆。我相信你已经感受到了琥珀和爷爷之间那份跨越时空的爱。生命中最珍贵的东西，就像琥珀一样，需要被珍藏、被呵护。希望你离开这里之后，也能用心去珍藏属于自己的那份"琥珀记忆"。再见了，有缘人。',
    duration: 20,
    frequency: 190,
    unlocked: false,
    played: false
  }
];
