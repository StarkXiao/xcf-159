import { Ending } from '../types';

export const ENDINGS: Ending[] = [
  {
    id: 'ending_true',
    chapterId: 'chapter_6',
    title: '真结局：永恒的记忆',
    description: '你找到了所有记忆碎片，做出了最符合琥珀心意的选择。真正的结局即将揭晓。',
    storyText: '当你输入"永恒"两个字的那一刻，整个记忆回廊被金色的光芒笼罩。所有的记忆碎片在空中飞舞，最终汇聚成琥珀的身影——从童年到青春，从欢笑到泪水，每一个瞬间都在你眼前闪过。你终于明白了爷爷建造这座博物馆的真正意义：记忆不会因为时间的流逝而消失，爱不会因为生命的终结而褪色。琥珀的故事，你的故事，每一个用心生活的人的故事，都值得被永恒珍藏。而你，成为了这些记忆的守护者。',
    type: 'true',
    unlockConditions: {
      requiredClues: ['clue_cor_1', 'clue_cor_2', 'clue_cor_3', 'clue_cor_4', 'clue_cor_5', 'clue_cor_6', 'clue_cor_7', 'clue_cor_8'],
      requiredChoices: ['choice_study_art', 'choice_remember_forever'],
      requiredMemoryComplete: true
    },
    unlocked: false,
    achieved: false,
    icon: '🌟',
    epilogueText: '多年以后，你成为了琥珀记忆馆的新馆长。每天，你都会在各个展厅间穿梭，向访客们讲述琥珀和爷爷的故事。你知道，只要还有人记得，这些记忆就永远不会消失。而在某个阳光明媚的午后，你会在向日葵花田旁，看到一个熟悉的身影在微笑——那是琥珀，那是爷爷，那是所有被爱与记忆守护的时光。'
  },
  {
    id: 'ending_good',
    chapterId: 'chapter_6',
    title: '好结局：传承的心愿',
    description: '你找到了大部分记忆碎片，做出了正确的选择。虽然略有遗憾，但琥珀的心愿已经达成。',
    storyText: '金色的光芒缓缓升起，你拼凑出了琥珀大部分的记忆。虽然有一些细节已经模糊，但核心的故事依然清晰：爷爷对琥珀的爱，琥珀对梦想的追求，以及那些温暖的时光。你选择了传承爷爷的心愿，让这座博物馆继续守护着那些珍贵的记忆。琥珀的故事，将被更多人知晓和铭记。',
    type: 'good',
    unlockConditions: {
      requiredClues: ['clue_cor_1', 'clue_cor_2', 'clue_cor_3', 'clue_cor_4', 'clue_cor_6', 'clue_cor_8'],
      requiredChoices: ['choice_study_art', 'choice_remember_forever']
    },
    unlocked: false,
    achieved: false,
    icon: '💫',
    epilogueText: '你将琥珀记忆馆打理得井井有条，每年都有越来越多的访客慕名而来。虽然你偶尔会想，那些缺失的记忆碎片到底记录了什么，但你知道，有时候遗憾也是一种美。重要的是，你守护了最珍贵的东西——爱与传承。'
  },
  {
    id: 'ending_neutral',
    chapterId: 'chapter_6',
    title: '普通结局：时光的过客',
    description: '你完成了基本的探索，但还有很多记忆等待被发现。琥珀的故事只揭开了一角。',
    storyText: '你完成了记忆回廊的探索，了解了琥珀故事的大致轮廓。但那些更细腻、更深刻的情感，那些藏在细节中的秘密，依然等待着被发现。你站在回廊的尽头，看着那些未被收集的记忆碎片在远处闪烁。也许有一天，你会回来，继续这段未完的旅程。',
    type: 'neutral',
    unlockConditions: {
      requiredClues: ['clue_cor_1', 'clue_cor_2', 'clue_cor_4', 'clue_cor_6']
    },
    unlocked: false,
    achieved: false,
    icon: '🌙',
    epilogueText: '你离开了琥珀记忆馆，回到了自己的生活。但偶尔，你会在某个瞬间想起那个温暖的地方，想起琥珀和爷爷的故事。也许在某个晴朗的周末，你会再次推开那扇古老的大门，继续探索那些未被发现的秘密。记忆，永远在等待着被唤醒。'
  },
  {
    id: 'ending_bad',
    chapterId: 'chapter_6',
    title: '坏结局：遗忘的代价',
    description: '你在关键的选择中走错了方向，导致重要的记忆永远消失。琥珀的故事，将被遗忘在时光的长河中。',
    storyText: '当你做出最后那个选择的瞬间，记忆回廊开始崩塌。那些曾经闪耀的记忆碎片一个个化为尘埃，消散在空气中。你试图抓住它们，但一切都太晚了。琥珀的故事，爷爷的爱，那些珍贵的时光，都因为你的选择而永远消失。你站在空荡荡的回廊中，只剩下无尽的悔恨和空虚。',
    type: 'bad',
    unlockConditions: {
      requiredChoices: ['choice_give_up_dream', 'choice_forget_everything']
    },
    unlocked: false,
    achieved: false,
    icon: '💔',
    epilogueText: '琥珀记忆馆渐渐荒废，再也没有人记得这里曾经收藏着怎样动人的故事。蛛网爬满了展柜，灰尘覆盖了照片。偶尔会有路人经过，好奇地看着这栋废弃的建筑，但没有人知道，这里曾经封存着最珍贵的记忆。而你，余生都会在"如果当初"的追问中度过。'
  }
];
