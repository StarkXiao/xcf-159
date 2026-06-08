import {
  ExhibitionAudioMap,
  ChapterAudioMap,
  MechanismAudioMap
} from '../types';

export const EXHIBITION_AUDIO: ExhibitionAudioMap = {
  exhibition_1: {
    default: {
      atmosphere: 'grand',
      audio: {
        bgm: 'bgm_main',
        ambient: ['ambient_hall', 'ambient_distant_voices'],
        volume: { bgm: 0.4, ambient: 0.2 },
        fadeDuration: 1500
      }
    },
    atmospheres: {
      mysterious: {
        atmosphere: 'mysterious',
        audio: {
          bgm: 'bgm_explore',
          ambient: ['ambient_whisper'],
          volume: { bgm: 0.45, ambient: 0.25 }
        }
      }
    }
  },
  exhibition_2: {
    default: {
      atmosphere: 'nostalgic',
      audio: {
        bgm: 'bgm_mystery',
        ambient: ['ambient_old_photos', 'ambient_soft_wind'],
        volume: { bgm: 0.4, ambient: 0.18 },
        fadeDuration: 1200
      }
    },
    atmospheres: {
      tense: {
        atmosphere: 'tense',
        audio: {
          bgm: 'bgm_tense',
          ambient: ['ambient_ticktock'],
          volume: { bgm: 0.5, ambient: 0.3 }
        }
      }
    }
  },
  exhibition_3: {
    default: {
      atmosphere: 'melancholic',
      audio: {
        bgm: 'bgm_melancholy',
        ambient: ['ambient_hospital'],
        volume: { bgm: 0.35, ambient: 0.2 },
        fadeDuration: 1500
      }
    }
  },
  exhibition_4: {
    default: {
      atmosphere: 'warm',
      audio: {
        bgm: 'bgm_warm',
        ambient: ['ambient_old_room'],
        volume: { bgm: 0.4, ambient: 0.15 },
        fadeDuration: 1000
      }
    }
  },
  exhibition_5: {
    default: {
      atmosphere: 'hopeful',
      audio: {
        bgm: 'bgm_hopeful',
        ambient: ['ambient_gold_glow', 'ambient_memory_fragments'],
        volume: { bgm: 0.45, ambient: 0.2 },
        fadeDuration: 1500
      }
    }
  },
  exhibition_6: {
    default: {
      atmosphere: 'serene',
      audio: {
        bgm: 'bgm_restoration',
        ambient: ['ambient_workshop', 'ambient_soft_brushing'],
        volume: { bgm: 0.35, ambient: 0.25 },
        fadeDuration: 1000
      }
    }
  },
  exhibition_7: {
    default: {
      atmosphere: 'triumphant',
      audio: {
        bgm: 'bgm_triumphant',
        ambient: ['ambient_museum_hall'],
        volume: { bgm: 0.4, ambient: 0.2 },
        fadeDuration: 1500
      }
    }
  },
  exhibition_history_1: {
    default: {
      atmosphere: 'grand',
      audio: {
        bgm: 'bgm_history',
        ambient: ['ambient_ancient_hall'],
        volume: { bgm: 0.45, ambient: 0.2 },
        fadeDuration: 1200
      }
    }
  },
  exhibition_history_2: {
    default: {
      atmosphere: 'mysterious',
      audio: {
        bgm: 'bgm_music',
        ambient: ['ambient_bell_echo'],
        volume: { bgm: 0.4, ambient: 0.25 },
        fadeDuration: 1500
      }
    }
  },
  exhibition_history_3: {
    default: {
      atmosphere: 'warm',
      audio: {
        bgm: 'bgm_craft',
        ambient: ['ambient_forge_embers'],
        volume: { bgm: 0.4, ambient: 0.2 },
        fadeDuration: 1000
      }
    }
  },
  exhibition_art_1: {
    default: {
      atmosphere: 'warm',
      audio: {
        bgm: 'bgm_art',
        ambient: ['ambient_light_refraction', 'ambient_amber_glow'],
        volume: { bgm: 0.4, ambient: 0.22 },
        fadeDuration: 1200
      }
    }
  },
  exhibition_art_2: {
    default: {
      atmosphere: 'melancholic',
      audio: {
        bgm: 'bgm_gallery',
        ambient: ['ambient_brush_strokes'],
        volume: { bgm: 0.38, ambient: 0.18 },
        fadeDuration: 1500
      }
    }
  },
  exhibition_art_3: {
    default: {
      atmosphere: 'hopeful',
      audio: {
        bgm: 'bgm_creative',
        ambient: ['ambient_canvas', 'ambient_inspiration'],
        volume: { bgm: 0.42, ambient: 0.2 },
        fadeDuration: 1000
      }
    }
  },
  exhibition_auth_1: {
    default: {
      atmosphere: 'tense',
      audio: {
        bgm: 'bgm_authenticity',
        ambient: ['ambient_magnifying_glass', 'ambient_silent_focus'],
        volume: { bgm: 0.4, ambient: 0.15 },
        fadeDuration: 1000
      }
    }
  },
  exhibition_auth_final: {
    default: {
      atmosphere: 'triumphant',
      audio: {
        bgm: 'bgm_revelation',
        ambient: ['ambient_treasure_room', 'ambient_gold_shimmer'],
        volume: { bgm: 0.45, ambient: 0.22 },
        fadeDuration: 1500
      }
    }
  },
  exhibition_corridor_entrance: {
    default: {
      atmosphere: 'mysterious',
      audio: {
        bgm: 'bgm_corridor_entrance',
        ambient: ['ambient_memory_fragments', 'ambient_distant_echo'],
        volume: { bgm: 0.4, ambient: 0.25 },
        fadeDuration: 1500
      }
    }
  },
  exhibition_corridor_childhood: {
    default: {
      atmosphere: 'warm',
      audio: {
        bgm: 'bgm_childhood',
        ambient: ['ambient_sunflower_field', 'ambient_butterfly_wings'],
        volume: { bgm: 0.4, ambient: 0.2 },
        fadeDuration: 1200
      }
    }
  },
  exhibition_corridor_youth: {
    default: {
      atmosphere: 'melancholic',
      audio: {
        bgm: 'bgm_youth',
        ambient: ['ambient_whispering_wind', 'ambient_distant_bell'],
        volume: { bgm: 0.38, ambient: 0.22 },
        fadeDuration: 1500
      }
    }
  },
  exhibition_corridor_present: {
    default: {
      atmosphere: 'hopeful',
      audio: {
        bgm: 'bgm_present',
        ambient: ['ambient_floating_memory', 'ambient_time_flow'],
        volume: { bgm: 0.4, ambient: 0.2 },
        fadeDuration: 1000
      }
    }
  },
  exhibition_corridor_ending: {
    default: {
      atmosphere: 'triumphant',
      audio: {
        bgm: 'bgm_eternal',
        ambient: ['ambient_eternal_light', 'ambient_love_essence'],
        volume: { bgm: 0.5, ambient: 0.25 },
        fadeDuration: 2000
      }
    }
  }
};

export const CHAPTER_AUDIO: ChapterAudioMap = {
  chapter_1: {
    storyNodes: {
      chapter_start: {
        nodeType: 'chapter_start',
        audio: {
          sfx: 'sfx_chapter_start',
          volume: { sfx: 0.6 },
          fadeDuration: 500
        }
      },
      chapter_end: {
        nodeType: 'chapter_end',
        audio: {
          bgm: 'bgm_chapter_complete',
          sfx: 'sfx_event_resolve',
          volume: { bgm: 0.45, sfx: 0.5 },
          fadeDuration: 1500
        }
      }
    }
  },
  chapter_2: {
    storyNodes: {
      chapter_start: {
        nodeType: 'chapter_start',
        audio: {
          sfx: 'sfx_door_open',
          volume: { sfx: 0.5 }
        }
      },
      chapter_end: {
        nodeType: 'chapter_end',
        audio: {
          bgm: 'bgm_chapter_complete',
          volume: { bgm: 0.45 },
          fadeDuration: 1500
        }
      },
      key_moment: {
        nodeType: 'key_moment',
        audio: {
          sfx: 'sfx_memory',
          volume: { sfx: 0.6 }
        }
      }
    }
  },
  chapter_3: {
    storyNodes: {
      chapter_start: {
        nodeType: 'chapter_start',
        audio: {
          sfx: 'sfx_door_open',
          volume: { sfx: 0.5 }
        }
      },
      chapter_end: {
        nodeType: 'chapter_end',
        audio: {
          bgm: 'bgm_restoration_complete',
          volume: { bgm: 0.5 },
          fadeDuration: 2000
        }
      }
    }
  },
  chapter_4: {
    storyNodes: {
      chapter_start: {
        nodeType: 'chapter_start',
        audio: {
          sfx: 'sfx_double_door',
          volume: { sfx: 0.6 }
        }
      },
      chapter_end: {
        nodeType: 'chapter_end',
        audio: {
          bgm: 'bgm_dual_hall_complete',
          volume: { bgm: 0.5 },
          fadeDuration: 2000
        }
      }
    }
  },
  chapter_5: {
    storyNodes: {
      chapter_start: {
        nodeType: 'chapter_start',
        audio: {
          sfx: 'sfx_magnify',
          volume: { sfx: 0.5 }
        }
      },
      chapter_end: {
        nodeType: 'chapter_end',
        audio: {
          bgm: 'bgm_truth_revealed',
          volume: { bgm: 0.5 },
          fadeDuration: 2000
        }
      }
    }
  },
  chapter_6: {
    storyNodes: {
      chapter_start: {
        nodeType: 'chapter_start',
        audio: {
          sfx: 'sfx_corridor_open',
          volume: { sfx: 0.6 }
        }
      },
      chapter_end: {
        nodeType: 'chapter_end',
        audio: {
          bgm: 'bgm_memory_complete',
          volume: { bgm: 0.55 },
          fadeDuration: 3000
        }
      },
      memory_complete: {
        nodeType: 'memory_complete',
        audio: {
          bgm: 'bgm_memory_solved',
          sfx: 'sfx_memory_complete',
          volume: { bgm: 0.5, sfx: 0.6 },
          fadeDuration: 2000
        }
      },
      ending_reveal: {
        nodeType: 'ending_reveal',
        audio: {
          bgm: 'bgm_ending',
          volume: { bgm: 0.6 },
          fadeDuration: 3000
        }
      }
    }
  }
};

export const MECHANISM_AUDIO: MechanismAudioMap = {
  mech_1: {
    phases: {
      puzzle_active: {
        phase: 'puzzle_active',
        audio: {
          bgm: 'bgm_puzzle',
          ambient: ['ambient_lock_mechanism'],
          volume: { bgm: 0.45, ambient: 0.2 },
          fadeDuration: 800
        }
      },
      puzzle_solved: {
        phase: 'puzzle_solved',
        audio: {
          sfx: 'sfx_unlock',
          volume: { sfx: 0.7 }
        }
      }
    }
  },
  mech_2: {
    phases: {
      puzzle_active: {
        phase: 'puzzle_active',
        audio: {
          bgm: 'bgm_memory_puzzle',
          ambient: ['ambient_memory_fragments'],
          volume: { bgm: 0.45, ambient: 0.25 },
          fadeDuration: 800
        }
      },
      memory_reconstruction: {
        phase: 'memory_reconstruction',
        audio: {
          bgm: 'bgm_memory_reconstruct',
          volume: { bgm: 0.5 },
          fadeDuration: 1200
        }
      },
      puzzle_solved: {
        phase: 'puzzle_solved',
        audio: {
          sfx: 'sfx_memory_complete',
          volume: { sfx: 0.7 }
        }
      }
    }
  },
  mech_3: {
    phases: {
      puzzle_active: {
        phase: 'puzzle_active',
        audio: {
          bgm: 'bgm_puzzle',
          volume: { bgm: 0.45 },
          fadeDuration: 800
        }
      },
      puzzle_solved: {
        phase: 'puzzle_solved',
        audio: {
          sfx: 'sfx_door_open',
          volume: { sfx: 0.7 }
        }
      }
    }
  },
  mech_4: {
    phases: {
      puzzle_active: {
        phase: 'puzzle_active',
        audio: {
          bgm: 'bgm_restoration',
          ambient: ['ambient_restoration_process'],
          volume: { bgm: 0.4, ambient: 0.3 },
          fadeDuration: 800
        }
      },
      puzzle_solved: {
        phase: 'puzzle_solved',
        audio: {
          bgm: 'bgm_restoration_complete',
          sfx: 'sfx_glow',
          volume: { bgm: 0.5, sfx: 0.6 },
          fadeDuration: 1500
        }
      }
    }
  },
  mech_5: {
    phases: {
      puzzle_active: {
        phase: 'puzzle_active',
        audio: {
          bgm: 'bgm_puzzle',
          volume: { bgm: 0.45 },
          fadeDuration: 800
        }
      },
      puzzle_solved: {
        phase: 'puzzle_solved',
        audio: {
          sfx: 'sfx_success',
          volume: { sfx: 0.7 }
        }
      }
    }
  },
  mech_linked_1: {
    phases: {
      puzzle_active: {
        phase: 'puzzle_active',
        audio: {
          bgm: 'bgm_linked_puzzle',
          volume: { bgm: 0.45 },
          fadeDuration: 800
        }
      },
      puzzle_solved: {
        phase: 'puzzle_solved',
        audio: {
          sfx: 'sfx_link_unlock',
          volume: { sfx: 0.7 }
        }
      }
    }
  },
  mech_linked_2: {
    phases: {
      puzzle_active: {
        phase: 'puzzle_active',
        audio: {
          bgm: 'bgm_linked_puzzle',
          volume: { bgm: 0.48 },
          fadeDuration: 800
        }
      },
      puzzle_solved: {
        phase: 'puzzle_solved',
        audio: {
          sfx: 'sfx_link_unlock',
          volume: { sfx: 0.7 }
        }
      }
    }
  },
  mech_linked_final: {
    phases: {
      puzzle_active: {
        phase: 'puzzle_active',
        audio: {
          bgm: 'bgm_final_puzzle',
          volume: { bgm: 0.5 },
          fadeDuration: 1000
        }
      },
      puzzle_solved: {
        phase: 'puzzle_solved',
        audio: {
          bgm: 'bgm_triumphant',
          sfx: 'sfx_success',
          volume: { bgm: 0.5, sfx: 0.7 },
          fadeDuration: 2000
        }
      }
    }
  },
  mech_authenticity: {
    phases: {
      puzzle_active: {
        phase: 'puzzle_active',
        audio: {
          bgm: 'bgm_authenticity_puzzle',
          ambient: ['ambient_silent_focus'],
          volume: { bgm: 0.4, ambient: 0.15 },
          fadeDuration: 800
        }
      },
      investigation: {
        phase: 'investigation',
        audio: {
          bgm: 'bgm_investigation',
          volume: { bgm: 0.38 },
          fadeDuration: 600
        }
      },
      puzzle_solved: {
        phase: 'puzzle_solved',
        audio: {
          sfx: 'sfx_success',
          volume: { sfx: 0.7 }
        }
      }
    }
  },
  mech_auth_final: {
    phases: {
      puzzle_active: {
        phase: 'puzzle_active',
        audio: {
          bgm: 'bgm_revelation_puzzle',
          volume: { bgm: 0.5 },
          fadeDuration: 1000
        }
      },
      puzzle_solved: {
        phase: 'puzzle_solved',
        audio: {
          bgm: 'bgm_truth_revealed',
          sfx: 'sfx_event_resolve',
          volume: { bgm: 0.55, sfx: 0.6 },
          fadeDuration: 2000
        }
      }
    }
  },
  mech_cor_entrance: {
    phases: {
      puzzle_active: {
        phase: 'puzzle_active',
        audio: {
          bgm: 'bgm_corridor_puzzle',
          volume: { bgm: 0.45 },
          fadeDuration: 1000
        }
      },
      puzzle_solved: {
        phase: 'puzzle_solved',
        audio: {
          sfx: 'sfx_corridor_open',
          volume: { sfx: 0.8 }
        }
      }
    }
  },
  mech_cor_memory_1: {
    phases: {
      memory_reconstruction: {
        phase: 'memory_reconstruction',
        audio: {
          bgm: 'bgm_memory_reconstruct',
          ambient: ['ambient_memory_flow'],
          volume: { bgm: 0.5, ambient: 0.25 },
          fadeDuration: 1000
        }
      },
      puzzle_solved: {
        phase: 'puzzle_solved',
        audio: {
          sfx: 'sfx_memory_complete',
          volume: { sfx: 0.7 }
        }
      }
    }
  },
  mech_cor_branch_1: {
    phases: {
      branch_choice: {
        phase: 'branch_choice',
        audio: {
          bgm: 'bgm_choice',
          ambient: ['ambient_heartbeat'],
          volume: { bgm: 0.45, ambient: 0.3 },
          fadeDuration: 800
        }
      },
      puzzle_solved: {
        phase: 'puzzle_solved',
        audio: {
          sfx: 'sfx_choice_made',
          volume: { sfx: 0.6 }
        }
      }
    }
  },
  mech_cor_memory_final: {
    phases: {
      memory_reconstruction: {
        phase: 'memory_reconstruction',
        audio: {
          bgm: 'bgm_memory_final',
          volume: { bgm: 0.55 },
          fadeDuration: 1500
        }
      },
      puzzle_solved: {
        phase: 'puzzle_solved',
        audio: {
          bgm: 'bgm_memory_complete',
          sfx: 'sfx_memory_complete',
          volume: { bgm: 0.55, sfx: 0.7 },
          fadeDuration: 2000
        }
      }
    }
  },
  mech_cor_branch_final: {
    phases: {
      branch_choice: {
        phase: 'branch_choice',
        audio: {
          bgm: 'bgm_final_choice',
          volume: { bgm: 0.5 },
          fadeDuration: 1000
        }
      },
      puzzle_solved: {
        phase: 'puzzle_solved',
        audio: {
          sfx: 'sfx_choice_made',
          volume: { sfx: 0.7 }
        }
      }
    }
  },
  mech_cor_ending: {
    phases: {
      puzzle_active: {
        phase: 'puzzle_active',
        audio: {
          bgm: 'bgm_ending_puzzle',
          volume: { bgm: 0.5 },
          fadeDuration: 1000
        }
      },
      puzzle_solved: {
        phase: 'puzzle_solved',
        audio: {
          bgm: 'bgm_eternal',
          sfx: 'sfx_success',
          volume: { bgm: 0.6, sfx: 0.8 },
          fadeDuration: 3000
        }
      }
    }
  }
};

export const POWER_OUTAGE_AUDIO = {
  warning: {
    bgm: 'bgm_blackout_warning',
    sfx: 'sfx_power_flicker',
    volume: { bgm: 0.4, sfx: 0.6 }
  },
  outage: {
    bgm: 'bgm_blackout_dark',
    ambient: ['ambient_darkness', 'ambient_distant_creak'],
    volume: { bgm: 0.35, ambient: 0.25 }
  },
  recovery: {
    bgm: 'bgm_emergency',
    sfx: 'sfx_power_restore',
    volume: { bgm: 0.4, sfx: 0.6 }
  },
  complete: {
    sfx: 'sfx_power_restore',
    volume: { sfx: 0.7 }
  }
};

export const NIGHT_MODE_AUDIO = {
  bgm: 'bgm_night',
  ambient: ['ambient_night_wind', 'ambient_crickets'],
  volume: { bgm: 0.35, ambient: 0.2 }
};

export const AMBIENT_FREQUENCY_MAP: Record<string, number> = {
  ambient_hall: 120,
  ambient_distant_voices: 180,
  ambient_whisper: 90,
  ambient_old_photos: 100,
  ambient_soft_wind: 80,
  ambient_ticktock: 330,
  ambient_hospital: 150,
  ambient_old_room: 95,
  ambient_gold_glow: 784,
  ambient_memory_fragments: 659,
  ambient_workshop: 110,
  ambient_soft_brushing: 900,
  ambient_museum_hall: 130,
  ambient_ancient_hall: 140,
  ambient_bell_echo: 523,
  ambient_forge_embers: 200,
  ambient_light_refraction: 440,
  ambient_amber_glow: 440,
  ambient_brush_strokes: 800,
  ambient_canvas: 700,
  ambient_inspiration: 587,
  ambient_magnifying_glass: 300,
  ambient_silent_focus: 60,
  ambient_treasure_room: 160,
  ambient_gold_shimmer: 659,
  ambient_distant_echo: 170,
  ambient_sunflower_field: 523,
  ambient_butterfly_wings: 880,
  ambient_whispering_wind: 196,
  ambient_distant_bell: 392,
  ambient_floating_memory: 494,
  ambient_time_flow: 262,
  ambient_eternal_light: 523,
  ambient_love_essence: 659,
  ambient_lock_mechanism: 250,
  ambient_memory_flow: 349,
  ambient_restoration_process: 220,
  ambient_darkness: 55,
  ambient_distant_creak: 100,
  ambient_night_wind: 75,
  ambient_crickets: 4000,
  ambient_heartbeat: 66
};

export const AMBIENT_DURATION_MAP: Record<string, number> = {
  ambient_hall: 4,
  ambient_distant_voices: 3,
  ambient_whisper: 2,
  ambient_old_photos: 5,
  ambient_soft_wind: 6,
  ambient_ticktock: 0.4,
  ambient_hospital: 4,
  ambient_old_room: 5,
  ambient_gold_glow: 1.5,
  ambient_memory_fragments: 2,
  ambient_workshop: 5,
  ambient_soft_brushing: 0.5,
  ambient_museum_hall: 4,
  ambient_ancient_hall: 5,
  ambient_bell_echo: 3,
  ambient_forge_embers: 4,
  ambient_light_refraction: 2,
  ambient_amber_glow: 1.5,
  ambient_brush_strokes: 0.3,
  ambient_canvas: 4,
  ambient_inspiration: 3,
  ambient_magnifying_glass: 1,
  ambient_silent_focus: 8,
  ambient_treasure_room: 5,
  ambient_gold_shimmer: 2,
  ambient_distant_echo: 4,
  ambient_sunflower_field: 6,
  ambient_butterfly_wings: 0.2,
  ambient_whispering_wind: 5,
  ambient_distant_bell: 2,
  ambient_floating_memory: 3,
  ambient_time_flow: 4,
  ambient_eternal_light: 6,
  ambient_love_essence: 5,
  ambient_lock_mechanism: 2,
  ambient_memory_flow: 3,
  ambient_restoration_process: 5,
  ambient_darkness: 10,
  ambient_distant_creak: 2,
  ambient_night_wind: 7,
  ambient_crickets: 0.1,
  ambient_heartbeat: 1.2
};

export const HINT_AUDIO_MAP: Record<string, { sfx: string; voiceLine?: string; volume: number }> = {
  'hint_mechanism_low': {
    sfx: 'sfx_hint_gentle',
    volume: 0.4
  },
  'hint_mechanism_medium': {
    sfx: 'sfx_hint_notice',
    volume: 0.5
  },
  'hint_mechanism_high': {
    sfx: 'sfx_hint_urgent',
    volume: 0.6
  },
  'hint_mechanism_critical': {
    sfx: 'sfx_hint_urgent',
    volume: 0.7
  },
  'hint_memory_low': {
    sfx: 'sfx_memory_hint',
    volume: 0.4
  },
  'hint_memory_medium': {
    sfx: 'sfx_memory_hint',
    volume: 0.5
  },
  'hint_memory_high': {
    sfx: 'sfx_memory_hint',
    volume: 0.6
  },
  'hint_memory_critical': {
    sfx: 'sfx_memory_hint',
    volume: 0.7
  },
  'hint_exploration_low': {
    sfx: 'sfx_whisper',
    volume: 0.35
  },
  'hint_exploration_medium': {
    sfx: 'sfx_whisper',
    volume: 0.45
  },
  'hint_exploration_high': {
    sfx: 'sfx_whisper',
    volume: 0.55
  },
  'hint_exploration_critical': {
    sfx: 'sfx_whisper',
    volume: 0.65
  },
  'hint_progress_low': {
    sfx: 'sfx_hint_gentle',
    volume: 0.4
  },
  'hint_progress_medium': {
    sfx: 'sfx_hint_notice',
    volume: 0.5
  },
  'hint_progress_high': {
    sfx: 'sfx_hint_urgent',
    volume: 0.6
  },
  'hint_navigation_low': {
    sfx: 'sfx_hint_gentle',
    volume: 0.35
  },
  'hint_navigation_medium': {
    sfx: 'sfx_hint_notice',
    volume: 0.45
  },
  'hint_navigation_high': {
    sfx: 'sfx_hint_urgent',
    volume: 0.55
  },
  'hint_manual': {
    sfx: 'sfx_click',
    volume: 0.5
  },
  'hint_display': {
    sfx: 'sfx_hint_appear',
    volume: 0.4
  },
  'hint_dismiss': {
    sfx: 'sfx_click',
    volume: 0.3
  }
};
