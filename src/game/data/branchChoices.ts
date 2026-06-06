import { BranchChoice } from '../types';

export const BRANCH_CHOICES: BranchChoice[] = [
  {
    id: 'branch_cor_1',
    chapterId: 'chapter_6',
    text: '站在人生的十字路口，你手中拿着两份沉甸甸的通知书。一边是父母期望的重点大学，一边是自己梦寐以求的艺术学院。你会如何选择？',
    description: '青春的抉择将决定琥珀未来的人生轨迹。每一个选择都有其代价和收获，没有绝对的对错。',
    choices: [
      {
        id: 'choice_study_art',
        text: '追逐梦想——选择艺术学院',
        consequence: '你决定遵从内心的声音，追逐自己的艺术梦想。父母虽然有些担忧，但最终还是选择了支持你。这将是一条充满挑战但也充满激情的道路。',
        leadsToEnding: 'ending_true',
        unlocksClue: 'clue_cor_choice_1'
      },
      {
        id: 'choice_study_major',
        text: '顺从期望——选择重点大学',
        consequence: '你不想让父母失望，选择了重点大学。虽然心中有些遗憾，但你告诉自己，只要努力，在哪里都可以追求艺术。这是一条更稳妥但也更循规蹈矩的道路。',
        leadsToEnding: 'ending_good',
        unlocksClue: 'clue_cor_choice_2'
      },
      {
        id: 'choice_give_up_dream',
        text: '迷茫逃避——放弃两者',
        consequence: '你感到前所未有的迷茫，索性放弃了两个选择。你告诉自己，也许我还没准备好。但逃避并不能解决问题，有些选择一旦错过，就再也回不来了。',
        leadsToEnding: 'ending_neutral',
        unlocksClue: 'clue_cor_choice_3'
      }
    ],
    selectedChoiceId: null,
    madeAt: null,
    requiredClues: ['clue_cor_4', 'clue_cor_5'],
    unlocked: false
  },
  {
    id: 'branch_cor_2',
    chapterId: 'chapter_6',
    text: '站在记忆回廊的尽头，你终于拼凑出了琥珀完整的人生故事。现在，你需要做出最后的选择——该如何处理这些珍贵的记忆？',
    description: '最终的抉择将决定琥珀记忆馆的命运，以及你与这些记忆的羁绊。',
    choices: [
      {
        id: 'choice_remember_forever',
        text: '永恒珍藏——成为记忆的守护者',
        consequence: '你决定继承爷爷的遗志，成为琥珀记忆馆的守护者。你将这些珍贵的记忆永远珍藏在这里，让更多的人能够感受到这份跨越时空的爱与温暖。',
        leadsToEnding: 'ending_true',
        unlocksExhibition: 'exhibition_corridor_ending'
      },
      {
        id: 'choice_pass_on',
        text: '薪火相传——将记忆传递下去',
        consequence: '你选择将这些记忆整理成册，出版成书，让更多的人知道琥珀和爷爷的故事。虽然博物馆最终还是关闭了，但这个故事会通过文字永远流传下去。',
        leadsToEnding: 'ending_good',
        unlocksExhibition: 'exhibition_corridor_ending'
      },
      {
        id: 'choice_let_go',
        text: '随风而逝——让记忆回归时光',
        consequence: '你认为记忆应该随主人而去，不应该被永远禁锢。你选择让这些记忆消散在风中，让琥珀和爷爷真正地安息。也许有些故事，只属于特定的时光。',
        leadsToEnding: 'ending_neutral',
        unlocksExhibition: 'exhibition_corridor_ending'
      },
      {
        id: 'choice_forget_everything',
        text: '彻底遗忘——销毁所有记忆',
        consequence: '你被这些沉重的记忆压得喘不过气，选择将它们全部销毁。你告诉自己，忘记过去才能更好地前行。但你没有意识到，有些东西一旦失去，就再也找不回来了。',
        leadsToEnding: 'ending_bad'
      }
    ],
    selectedChoiceId: null,
    madeAt: null,
    requiredClues: ['clue_cor_6', 'clue_cor_7', 'clue_cor_8'],
    unlocked: false
  }
];
