import { Howl } from 'howler';
import { store } from '../game/Store';
import { eventBus } from '../game/EventBus';
import {
  GameSettings,
  AudioRecording,
  SceneAudioState,
  ExhibitionAtmosphere,
  PuzzlePhase,
  StoryNodeType,
  AudioLayerConfig
} from '../game/types';
import {
  EXHIBITION_AUDIO,
  CHAPTER_AUDIO,
  MECHANISM_AUDIO,
  POWER_OUTAGE_AUDIO,
  NIGHT_MODE_AUDIO,
  AMBIENT_FREQUENCY_MAP,
  AMBIENT_DURATION_MAP
} from '../game/data/sceneAudio';

export class AudioModule {
  private bgm: Howl | null = null;
  private sfxCache: Map<string, Howl> = new Map();
  private currentBgmName: string = '';
  private bgmVolume: number = 0.5;
  private bgmMuted: boolean = false;
  private sfxVolume: number = 0.7;
  private sfxMuted: boolean = false;
  private voiceCache: Map<string, Howl> = new Map();
  private currentVoice: Howl | null = null;
  private currentVoiceId: string = '';
  private voiceVolume: number = 0.8;
  private voiceMuted: boolean = false;
  private bgmWasPlaying: boolean = false;
  private bgmVolumeBeforeVoice: number = 0.5;

  private ambientCache: Map<string, Howl> = new Map();
  private activeAmbientTracks: Map<string, Howl> = new Map();
  private ambientVolume: number = 0.3;
  private ambientMuted: boolean = false;

  private sceneState: SceneAudioState = {
    currentExhibition: '',
    currentAtmosphere: 'grand',
    currentPuzzlePhase: null,
    currentStoryNode: null,
    activeAmbientTracks: [],
    activeMechanismId: null
  };

  private isNightModeActive: boolean = false;

  constructor() {
    eventBus.on('audio:play', this.handlePlayAudio.bind(this));
    eventBus.on('settings:update', this.handleSettingsUpdate.bind(this));
    eventBus.on('recording:auto-play', this.handleAutoPlayRecording.bind(this));

    const settings = store.getSettings();
    this.bgmVolume = settings.bgmVolume;
    this.bgmMuted = settings.bgmMuted;
    this.sfxVolume = settings.sfxVolume;
    this.sfxMuted = settings.sfxMuted;

    this.setupSceneEventListeners();
  }

  private handleAutoPlayRecording(data: { recordingId: string }): void {
    const recording = store.getRecordingById(data.recordingId);
    if (recording && recording.unlocked && !recording.played) {
      this.playVoice(data.recordingId);
    }
  }

  private handlePlayAudio(data: { type: 'bgm' | 'sfx'; name: string }): void {
    if (data.type === 'bgm') {
      this.playBGM(data.name);
    } else {
      this.playSFX(data.name);
    }
  }

  private handleSettingsUpdate(data: { settings: GameSettings }): void {
    this.applySettings(data.settings);
  }

  private applySettings(settings: GameSettings): void {
    this.bgmVolume = settings.bgmVolume;
    this.bgmMuted = settings.bgmMuted;
    this.sfxVolume = settings.sfxVolume;
    this.sfxMuted = settings.sfxMuted;

    if (this.bgm) {
      this.bgm.volume(this.bgmMuted ? 0 : this.bgmVolume);
      this.bgm.mute(this.bgmMuted);
    }

    this.sfxCache.forEach(sfx => {
      sfx.volume(this.sfxVolume);
      sfx.mute(this.sfxMuted);
    });

    this.ambientCache.forEach(ambient => {
      ambient.volume(this.ambientVolume);
      ambient.mute(this.ambientMuted);
    });

    this.activeAmbientTracks.forEach(ambient => {
      ambient.volume(this.ambientMuted ? 0 : this.ambientVolume);
      ambient.mute(this.ambientMuted);
    });
  }

  playBGM(name: string): void {
    if (this.currentBgmName === name && this.bgm) return;

    this.stopBGM();

    const volume = this.bgmMuted ? 0 : this.bgmVolume;
    this.bgm = this.createAudio(name, true, volume);
    this.bgm.mute(this.bgmMuted);
    this.currentBgmName = name;
    this.bgm.play();
  }

  stopBGM(): void {
    if (this.bgm) {
      const currentVol = this.bgmMuted ? 0 : this.bgmVolume;
      this.bgm.fade(currentVol, 0, 500);
      setTimeout(() => {
        this.bgm?.stop();
        this.bgm?.unload();
        this.bgm = null;
      }, 500);
    }
    this.currentBgmName = '';
  }

  playSFX(name: string): void {
    if (this.sfxMuted) return;

    let sfx = this.sfxCache.get(name);
    if (!sfx) {
      sfx = this.createAudio(name, false, this.sfxVolume);
      sfx.mute(this.sfxMuted);
      this.sfxCache.set(name, sfx);
    }
    sfx.play();
  }

  private createAudio(name: string, loop: boolean, volume: number): Howl {
    const frequency = name === 'bgm_main' ? 220 :
                      name === 'bgm_mystery' ? 180 :
                      name === 'bgm_explore' ? 200 :
                      name === 'bgm_night' ? 110 :
                      name === 'bgm_power_outage' ? 90 :
                      name === 'bgm_emergency' ? 130 :
                      name === 'bgm_blackout_warning' ? 150 :
                      name === 'bgm_blackout_dark' ? 70 :
                      name === 'bgm_melancholy' ? 165 :
                      name === 'bgm_warm' ? 247 :
                      name === 'bgm_hopeful' ? 294 :
                      name === 'bgm_tense' ? 196 :
                      name === 'bgm_restoration' ? 233 :
                      name === 'bgm_triumphant' ? 330 :
                      name === 'bgm_history' ? 196 :
                      name === 'bgm_music' ? 262 :
                      name === 'bgm_craft' ? 220 :
                      name === 'bgm_art' ? 277 :
                      name === 'bgm_gallery' ? 185 :
                      name === 'bgm_creative' ? 311 :
                      name === 'bgm_authenticity' ? 175 :
                      name === 'bgm_revelation' ? 349 :
                      name === 'bgm_corridor_entrance' ? 165 :
                      name === 'bgm_childhood' ? 392 :
                      name === 'bgm_youth' ? 233 :
                      name === 'bgm_present' ? 294 :
                      name === 'bgm_eternal' ? 330 :
                      name === 'bgm_puzzle' ? 220 :
                      name === 'bgm_memory_puzzle' ? 247 :
                      name === 'bgm_memory_reconstruct' ? 262 :
                      name === 'bgm_restoration_complete' ? 349 :
                      name === 'bgm_chapter_complete' ? 330 :
                      name === 'bgm_dual_hall_complete' ? 370 :
                      name === 'bgm_truth_revealed' ? 392 :
                      name === 'bgm_memory_complete' ? 415 :
                      name === 'bgm_memory_solved' ? 349 :
                      name === 'bgm_ending' ? 330 :
                      name === 'bgm_linked_puzzle' ? 233 :
                      name === 'bgm_final_puzzle' ? 262 :
                      name === 'bgm_authenticity_puzzle' ? 208 :
                      name === 'bgm_investigation' ? 185 :
                      name === 'bgm_revelation_puzzle' ? 247 :
                      name === 'bgm_corridor_puzzle' ? 220 :
                      name === 'bgm_memory_final' ? 294 :
                      name === 'bgm_choice' ? 208 :
                      name === 'bgm_final_choice' ? 233 :
                      name === 'bgm_ending_puzzle' ? 262 :
                      name === 'sfx_click' ? 800 :
                      name === 'sfx_collect' ? 600 :
                      name === 'sfx_success' ? 523 :
                      name === 'sfx_error' ? 200 :
                      name === 'sfx_error_incomplete' ? 300 :
                      name === 'sfx_error_format' ? 250 :
                      name === 'sfx_error_partial' ? 350 :
                      name === 'sfx_error_wrong' ? 150 :
                      name === 'sfx_error_exhausted' ? 100 :
                      name === 'sfx_unlock' ? 440 :
                      name === 'sfx_night_start' ? 150 :
                      name === 'sfx_day_start' ? 660 :
                      name === 'sfx_event_resolve' ? 587 :
                      name === 'sfx_mechanism_reset' ? 250 :
                      name === 'sfx_footsteps' ? 120 :
                      name === 'sfx_whisper' ? 180 :
                      name === 'sfx_glow' ? 784 :
                      name === 'sfx_musicbox' ? 659 :
                      name === 'sfx_pages' ? 900 :
                      name === 'sfx_float' ? 523 :
                      name === 'sfx_breath' ? 200 :
                      name === 'sfx_ticktock' ? 330 :
                      name === 'sfx_amber' ? 440 :
                      name === 'sfx_power_failure' ? 80 :
                      name === 'sfx_power_restore' ? 350 :
                      name === 'sfx_emergency_light' ? 600 :
                      name === 'sfx_fuse_blow' ? 90 :
                      name === 'sfx_creak' ? 100 :
                      name === 'sfx_distant_thud' ? 60 :
                      name === 'sfx_whisper_echo' ? 170 :
                      name === 'sfx_power_flicker' ? 200 :
                      name === 'sfx_chapter_start' ? 523 :
                      name === 'sfx_door_open' ? 440 :
                      name === 'sfx_memory' ? 659 :
                      name === 'sfx_memory_complete' ? 784 :
                      name === 'sfx_double_door' ? 392 :
                      name === 'sfx_magnify' ? 880 :
                      name === 'sfx_corridor_open' ? 587 :
                      name === 'sfx_link_unlock' ? 494 :
                      name === 'sfx_choice_made' ? 523 : 440;

    const duration = name === 'bgm_night' ? 12 :
                     name === 'bgm_power_outage' ? 15 :
                     name === 'bgm_emergency' ? 10 :
                     name === 'bgm_blackout_warning' ? 8 :
                     name === 'bgm_blackout_dark' ? 12 :
                     name === 'bgm_melancholy' ? 10 :
                     name === 'bgm_warm' ? 10 :
                     name === 'bgm_hopeful' ? 12 :
                     name === 'bgm_tense' ? 8 :
                     name === 'bgm_restoration' ? 12 :
                     name === 'bgm_triumphant' ? 12 :
                     name === 'bgm_history' ? 12 :
                     name === 'bgm_music' ? 10 :
                     name === 'bgm_craft' ? 12 :
                     name === 'bgm_art' ? 10 :
                     name === 'bgm_gallery' ? 10 :
                     name === 'bgm_creative' ? 12 :
                     name === 'bgm_authenticity' ? 10 :
                     name === 'bgm_revelation' ? 12 :
                     name === 'bgm_corridor_entrance' ? 10 :
                     name === 'bgm_childhood' ? 10 :
                     name === 'bgm_youth' ? 10 :
                     name === 'bgm_present' ? 12 :
                     name === 'bgm_eternal' ? 15 :
                     name === 'bgm_puzzle' ? 8 :
                     name === 'bgm_memory_puzzle' ? 10 :
                     name === 'bgm_memory_reconstruct' ? 12 :
                     name === 'bgm_restoration_complete' ? 12 :
                     name === 'bgm_chapter_complete' ? 12 :
                     name === 'bgm_dual_hall_complete' ? 15 :
                     name === 'bgm_truth_revealed' ? 15 :
                     name === 'bgm_memory_complete' ? 15 :
                     name === 'bgm_memory_solved' ? 12 :
                     name === 'bgm_ending' ? 20 :
                     name === 'bgm_linked_puzzle' ? 10 :
                     name === 'bgm_final_puzzle' ? 12 :
                     name === 'bgm_authenticity_puzzle' ? 10 :
                     name === 'bgm_investigation' ? 8 :
                     name === 'bgm_revelation_puzzle' ? 10 :
                     name === 'bgm_corridor_puzzle' ? 10 :
                     name === 'bgm_memory_final' ? 15 :
                     name === 'bgm_choice' ? 8 :
                     name === 'bgm_final_choice' ? 10 :
                     name === 'bgm_ending_puzzle' ? 12 :
                     name === 'sfx_footsteps' ? 0.6 :
                     name === 'sfx_whisper' ? 1.2 :
                     name === 'sfx_glow' ? 0.8 :
                     name === 'sfx_musicbox' ? 2.0 :
                     name === 'sfx_pages' ? 0.5 :
                     name === 'sfx_float' ? 0.8 :
                     name === 'sfx_breath' ? 1.5 :
                     name === 'sfx_ticktock' ? 0.4 :
                     name === 'sfx_amber' ? 1.5 :
                     name === 'sfx_night_start' ? 1.5 :
                     name === 'sfx_day_start' ? 1.0 :
                     name === 'sfx_event_resolve' ? 0.8 :
                     name === 'sfx_mechanism_reset' ? 0.8 :
                     name === 'sfx_power_failure' ? 2.5 :
                     name === 'sfx_power_restore' ? 2.0 :
                     name === 'sfx_emergency_light' ? 1.0 :
                     name === 'sfx_fuse_blow' ? 1.5 :
                     name === 'sfx_creak' ? 2.0 :
                     name === 'sfx_distant_thud' ? 1.2 :
                     name === 'sfx_whisper_echo' ? 2.5 :
                     name === 'sfx_power_flicker' ? 0.3 :
                     name === 'sfx_error_incomplete' ? 0.4 :
                     name === 'sfx_error_format' ? 0.5 :
                     name === 'sfx_error_partial' ? 0.6 :
                     name === 'sfx_error_wrong' ? 0.8 :
                     name === 'sfx_error_exhausted' ? 1.2 :
                     name === 'sfx_chapter_start' ? 1.0 :
                     name === 'sfx_door_open' ? 0.8 :
                     name === 'sfx_memory' ? 1.2 :
                     name === 'sfx_memory_complete' ? 1.5 :
                     name === 'sfx_double_door' ? 1.0 :
                     name === 'sfx_magnify' ? 0.6 :
                     name === 'sfx_corridor_open' ? 1.5 :
                     name === 'sfx_link_unlock' ? 0.8 :
                     name === 'sfx_choice_made' ? 1.0 :
                     loop ? 8 : 0.3;

    return new Howl({
      src: [this.generateTone(frequency, duration, loop)],
      loop,
      volume,
      format: ['wav']
    });
  }

  private generateTone(frequency: number, duration: number, loop: boolean): string {
    const sampleRate = 44100;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new AudioContext().createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * (loop ? 0 : 3));
      const tone = Math.sin(2 * Math.PI * frequency * t) * 0.3;
      const overtone = Math.sin(2 * Math.PI * frequency * 2 * t) * 0.1;
      data[i] = (tone + overtone) * envelope;
    }

    const wav = this.bufferToWav(buffer);
    return 'data:audio/wav;base64,' + btoa(wav);
  }

  playNightEventSFX(eventType: string): void {
    const sfxMap: Record<string, string> = {
      anomaly: 'sfx_glow',
      sound: 'sfx_whisper',
      figure: 'sfx_footsteps',
      whisper: 'sfx_breath'
    };
    const sfxName = sfxMap[eventType] || 'sfx_click';
    this.playSFX(sfxName);
  }

  private bufferToWav(buffer: AudioBuffer): string {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1;
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const dataLength = buffer.length * blockAlign;
    const bufferLength = 44 + dataLength;

    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);

    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    const channelData = buffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }

    let binary = '';
    const bytes = new Uint8Array(arrayBuffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return binary;
  }

  setBGMVolume(volume: number): void {
    this.bgmVolume = volume;
    if (this.bgm && !this.bgmMuted) {
      this.bgm.volume(volume);
    }
  }

  setSFXVolume(volume: number): void {
    this.sfxVolume = volume;
    this.sfxCache.forEach(sfx => {
      if (!this.sfxMuted) {
        sfx.volume(volume);
      }
    });
  }

  toggleBGM(): boolean {
    const settings = store.getSettings();
    const newMuted = !settings.bgmMuted;
    store.updateSettings({ bgmMuted: newMuted });
    return !newMuted;
  }

  toggleSFX(): boolean {
    const settings = store.getSettings();
    const newMuted = !settings.sfxMuted;
    store.updateSettings({ sfxMuted: newMuted });
    return !newMuted;
  }

  getBGMMuted(): boolean {
    return this.bgmMuted;
  }

  getSFXMuted(): boolean {
    return this.sfxMuted;
  }

  getBGMVolume(): number {
    return this.bgmVolume;
  }

  getSFXVolume(): number {
    return this.sfxVolume;
  }

  playVoice(recordingId: string): boolean {
    const recording = store.getRecordingById(recordingId);
    if (!recording || !recording.unlocked) return false;

    this.stopVoice();

    this.bgmWasPlaying = this.bgm !== null && this.currentBgmName !== '';
    if (this.bgmWasPlaying && this.bgm) {
      this.bgmVolumeBeforeVoice = this.bgm.volume();
      this.bgm.fade(this.bgmVolumeBeforeVoice, this.bgmVolumeBeforeVoice * 0.2, 500);
    }

    const volume = this.voiceMuted ? 0 : this.voiceVolume;
    let voice = this.voiceCache.get(recordingId);
    if (!voice) {
      voice = this.createVoiceAudio(recording, volume);
      this.voiceCache.set(recordingId, voice);
    } else {
      voice.volume(volume);
      voice.mute(this.voiceMuted);
    }

    voice.once('end', () => {
      this.handleVoiceEnd();
    });

    voice.play();
    this.currentVoice = voice;
    this.currentVoiceId = recordingId;

    store.markRecordingAsPlayed(recordingId);
    eventBus.emit('voice:play', { recordingId });

    return true;
  }

  private createVoiceAudio(recording: AudioRecording, volume: number): Howl {
    return new Howl({
      src: [this.generateVoiceTone(recording.frequency, recording.duration)],
      loop: false,
      volume,
      format: ['wav']
    });
  }

  private generateVoiceTone(frequency: number, duration: number): string {
    const sampleRate = 44100;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new AudioContext().createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 0.5) * 0.5 + 0.5;
      const tone = Math.sin(2 * Math.PI * frequency * t) * 0.25;
      const overtone1 = Math.sin(2 * Math.PI * frequency * 1.5 * t) * 0.1;
      const overtone2 = Math.sin(2 * Math.PI * frequency * 2 * t) * 0.08;
      const tremolo = 1 + Math.sin(2 * Math.PI * 3 * t) * 0.05;
      data[i] = (tone + overtone1 + overtone2) * envelope * tremolo;
    }

    const wav = this.bufferToWav(buffer);
    return 'data:audio/wav;base64,' + btoa(wav);
  }

  pauseVoice(): void {
    if (this.currentVoice) {
      this.currentVoice.pause();
      eventBus.emit('voice:pause', { recordingId: this.currentVoiceId });
    }
  }

  resumeVoice(): void {
    if (this.currentVoice) {
      this.currentVoice.play();
      eventBus.emit('voice:resume', { recordingId: this.currentVoiceId });
    }
  }

  stopVoice(): void {
    if (this.currentVoice) {
      this.currentVoice.stop();
      this.handleVoiceEnd();
    }
  }

  private handleVoiceEnd(): void {
    if (this.bgmWasPlaying && this.bgm) {
      this.bgm.fade(this.bgm.volume(), this.bgmVolumeBeforeVoice, 500);
      this.bgmWasPlaying = false;
    }
    const endedId = this.currentVoiceId;
    this.currentVoice = null;
    this.currentVoiceId = '';
    eventBus.emit('voice:end', { recordingId: endedId });
  }

  getVoiceProgress(): number {
    if (this.currentVoice) {
      return this.currentVoice.seek() as number;
    }
    return 0;
  }

  getVoiceDuration(): number {
    if (this.currentVoice) {
      return this.currentVoice.duration();
    }
    return 0;
  }

  isVoicePlaying(): boolean {
    return this.currentVoice !== null && this.currentVoice.playing();
  }

  getCurrentVoiceId(): string {
    return this.currentVoiceId;
  }

  setVoiceVolume(volume: number): void {
    this.voiceVolume = volume;
    if (this.currentVoice && !this.voiceMuted) {
      this.currentVoice.volume(volume);
    }
  }

  toggleVoice(): boolean {
    this.voiceMuted = !this.voiceMuted;
    if (this.currentVoice) {
      this.currentVoice.mute(this.voiceMuted);
    }
    return !this.voiceMuted;
  }

  getVoiceMuted(): boolean {
    return this.voiceMuted;
  }

  getVoiceVolume(): number {
    return this.voiceVolume;
  }

  private setupSceneEventListeners(): void {
    eventBus.on('exhibition:enter', (data: { exhibitionId: string }) => {
      this.handleExhibitionEnter(data.exhibitionId);
    });

    eventBus.on('chapter:enter', (data: { chapterId: string }) => {
      this.handleStoryNode(data.chapterId, 'chapter_start');
    });

    eventBus.on('chapter:complete', (data: { chapterId: string }) => {
      this.handleStoryNode(data.chapterId, 'chapter_end');
    });

    eventBus.on('mechanism:open', (data: { mechanismId: string }) => {
      this.handlePuzzlePhase(data.mechanismId, 'puzzle_active');
    });

    eventBus.on('mechanism:solve', (data: { mechanismId: string }) => {
      this.handlePuzzlePhase(data.mechanismId, 'puzzle_solved');
    });

    eventBus.on('memory:start', (data: { chapterId: string }) => {
      const chapter = store.getChapterById(data.chapterId);
      if (chapter && chapter.memoryPhases) {
        const firstPhaseExhibition = chapter.memoryPhases[0]?.exhibitionId;
        if (firstPhaseExhibition) {
          const mech = store.getMechanisms().find(m => 
            store.getExhibitionById(firstPhaseExhibition)?.hotspots.some(h => 
              h.type === 'mechanism' && h.targetId === m.id && m.type === 'memory_sort'
            )
          );
          if (mech) {
            this.handlePuzzlePhase(mech.id, 'memory_reconstruction');
          }
        }
      }
    });

    eventBus.on('memory:complete', (data: { chapterId: string; success: boolean }) => {
      this.handleStoryNode(data.chapterId, 'memory_complete');
    });

    eventBus.on('poweroutage:start', () => {
      this.handlePowerOutage('warning');
    });

    eventBus.on('poweroutage:event-trigger', (data: { eventId: string; event: any }) => {
      if (data.event.phase === 'outage') {
        this.handlePowerOutage('outage');
      } else if (data.event.phase === 'recovery') {
        this.handlePowerOutage('recovery');
      }
    });

    eventBus.on('poweroutage:end', () => {
      this.handlePowerOutage('complete');
    });

    eventBus.on('exhibition:mode-change', (data: { mode: string }) => {
      this.handleNightModeChange(data.mode === 'night');
    });

    eventBus.on('game:reset', () => {
      this.resetSceneAudio();
    });

    const currentExhibition = store.getCurrentExhibition();
    if (currentExhibition) {
      this.sceneState.currentExhibition = currentExhibition.id;
      this.sceneState.currentAtmosphere = EXHIBITION_AUDIO[currentExhibition.id]?.default.atmosphere || 'grand';
    }
  }

  private handleExhibitionEnter(exhibitionId: string): void {
    if (this.sceneState.currentExhibition === exhibitionId) return;

    this.sceneState.currentExhibition = exhibitionId;
    this.sceneState.currentPuzzlePhase = null;
    this.sceneState.activeMechanismId = null;

    const exhibitionConfig = EXHIBITION_AUDIO[exhibitionId];
    if (!exhibitionConfig) return;

    const audioConfig = this.isNightModeActive
      ? { ...NIGHT_MODE_AUDIO, fadeDuration: 1500 }
      : exhibitionConfig.default.audio;

    this.sceneState.currentAtmosphere = exhibitionConfig.default.atmosphere;

    this.applyAudioLayerConfig(audioConfig);
    eventBus.emit('sceneaudio:exhibition-changed', { exhibitionId, atmosphere: this.sceneState.currentAtmosphere });
  }

  private handleStoryNode(chapterId: string, nodeType: StoryNodeType): void {
    this.sceneState.currentStoryNode = nodeType;

    const chapterConfig = CHAPTER_AUDIO[chapterId];
    const storyConfig = chapterConfig?.storyNodes[nodeType];

    if (storyConfig) {
      this.applyAudioLayerConfig(storyConfig.audio, true);
      eventBus.emit('sceneaudio:story-node', { chapterId, nodeType });
    }

    if (nodeType === 'chapter_end') {
      setTimeout(() => {
        this.sceneState.currentStoryNode = null;
      }, storyConfig?.audio.fadeDuration || 2000);
    }
  }

  private handlePuzzlePhase(mechanismId: string, phase: PuzzlePhase): void {
    this.sceneState.currentPuzzlePhase = phase;
    this.sceneState.activeMechanismId = mechanismId;

    const mechanismConfig = MECHANISM_AUDIO[mechanismId];
    const phaseConfig = mechanismConfig?.phases[phase];

    if (phaseConfig) {
      this.applyAudioLayerConfig(phaseConfig.audio, phase !== 'puzzle_solved');
      eventBus.emit('sceneaudio:puzzle-phase', { mechanismId, phase });
    }

    if (phase === 'puzzle_solved') {
      setTimeout(() => {
        this.sceneState.currentPuzzlePhase = null;
        this.sceneState.activeMechanismId = null;
        this.restoreExhibitionAudio();
      }, phaseConfig?.audio.fadeDuration || 1500);
    }
  }

  private handlePowerOutage(phase: 'warning' | 'outage' | 'recovery' | 'complete'): void {
    const audioConfig = POWER_OUTAGE_AUDIO[phase];
    if (audioConfig) {
      this.applyAudioLayerConfig(audioConfig, true);
      eventBus.emit('sceneaudio:power-outage', { phase });
    }

    if (phase === 'complete') {
      setTimeout(() => {
        this.restoreExhibitionAudio();
      }, 1000);
    }
  }

  private handleNightModeChange(isNight: boolean): void {
    this.isNightModeActive = isNight;

    if (isNight) {
      this.applyAudioLayerConfig(NIGHT_MODE_AUDIO);
    } else {
      this.restoreExhibitionAudio();
    }

    eventBus.emit('sceneaudio:night-mode', { isNight });
  }

  private restoreExhibitionAudio(): void {
    const exhibitionId = this.sceneState.currentExhibition;
    const exhibitionConfig = EXHIBITION_AUDIO[exhibitionId];

    if (!exhibitionConfig) return;

    const audioConfig = this.isNightModeActive
      ? { ...NIGHT_MODE_AUDIO, fadeDuration: 1000 }
      : exhibitionConfig.default.audio;

    this.applyAudioLayerConfig(audioConfig);
  }

  private applyAudioLayerConfig(config: AudioLayerConfig, temporary: boolean = false): void {
    const fadeDuration = config.fadeDuration || 1000;
    const bgmVol = (config.volume?.bgm ?? 0.4) * this.bgmVolume;
    const sfxVol = (config.volume?.sfx ?? 0.7) * this.sfxVolume;
    const ambientVol = (config.volume?.ambient ?? 0.3) * this.ambientVolume;

    if (config.bgm && config.bgm !== this.currentBgmName) {
      this.crossfadeBGM(config.bgm, bgmVol, fadeDuration);
    } else if (config.bgm && this.bgm) {
      const targetVol = this.bgmMuted ? 0 : bgmVol;
      this.bgm.fade(this.bgm.volume() as number, targetVol, fadeDuration);
    }

    if (config.sfx) {
      this.playSFXWithVolume(config.sfx, sfxVol);
    }

    if (config.ambient && config.ambient.length > 0) {
      this.updateAmbientTracks(config.ambient, ambientVol, fadeDuration);
    } else if (!temporary && this.activeAmbientTracks.size > 0) {
      this.stopAllAmbient(fadeDuration);
    }
  }

  private crossfadeBGM(newBgmName: string, targetVolume: number, duration: number): void {
    const oldBgm = this.bgm;
    const oldBgmName = this.currentBgmName;

    const finalVolume = this.bgmMuted ? 0 : targetVolume;

    const newBgm = this.createAudio(newBgmName, true, 0);
    newBgm.mute(this.bgmMuted);
    newBgm.once('play', () => {
      newBgm.fade(0, finalVolume, duration);
    });
    newBgm.play();

    if (oldBgm && oldBgmName) {
      oldBgm.fade(oldBgm.volume() as number, 0, duration);
      setTimeout(() => {
        oldBgm.stop();
        oldBgm.unload();
      }, duration);
    }

    this.bgm = newBgm;
    this.currentBgmName = newBgmName;
  }

  private updateAmbientTracks(trackNames: string[], targetVolume: number, fadeDuration: number): void {
    const tracksToAdd = trackNames.filter(name => !this.activeAmbientTracks.has(name));
    const tracksToRemove = Array.from(this.activeAmbientTracks.keys()).filter(name => !trackNames.includes(name));

    tracksToRemove.forEach(name => {
      const track = this.activeAmbientTracks.get(name);
      if (track) {
        track.fade(track.volume() as number, 0, fadeDuration);
        setTimeout(() => {
          track.stop();
          this.activeAmbientTracks.delete(name);
        }, fadeDuration);
      }
    });

    tracksToAdd.forEach(name => {
      const track = this.playAmbient(name, targetVolume);
      if (track) {
        this.activeAmbientTracks.set(name, track);
      }
    });

    this.sceneState.activeAmbientTracks = trackNames;
  }

  playAmbient(name: string, volume?: number): Howl | null {
    if (this.ambientMuted) return null;

    const vol = this.ambientMuted ? 0 : (volume ?? this.ambientVolume);
    let ambient = this.ambientCache.get(name);

    if (!ambient) {
      ambient = this.createAmbientAudio(name, vol);
      ambient.mute(this.ambientMuted);
      this.ambientCache.set(name, ambient);
    } else {
      ambient.volume(vol);
      ambient.mute(this.ambientMuted);
    }

    if (!ambient.playing()) {
      ambient.play();
    }

    return ambient;
  }

  stopAmbient(name: string, fadeDuration: number = 500): void {
    const track = this.activeAmbientTracks.get(name);
    if (track) {
      track.fade(track.volume() as number, 0, fadeDuration);
      setTimeout(() => {
        track.stop();
        this.activeAmbientTracks.delete(name);
      }, fadeDuration);
    }
  }

  stopAllAmbient(fadeDuration: number = 500): void {
    this.activeAmbientTracks.forEach((track) => {
      track.fade(track.volume() as number, 0, fadeDuration);
    });
    setTimeout(() => {
      this.activeAmbientTracks.forEach(track => track.stop());
      this.activeAmbientTracks.clear();
      this.sceneState.activeAmbientTracks = [];
    }, fadeDuration);
  }

  private createAmbientAudio(name: string, volume: number): Howl {
    const frequency = AMBIENT_FREQUENCY_MAP[name] || 220;
    const duration = AMBIENT_DURATION_MAP[name] || 3;

    return new Howl({
      src: [this.generateAmbientTone(frequency, duration, name)],
      loop: true,
      volume,
      format: ['wav']
    });
  }

  private generateAmbientTone(frequency: number, duration: number, name: string): string {
    const sampleRate = 44100;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new AudioContext().createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let sample = 0;

      if (name.includes('wind') || name.includes('hall') || name.includes('room')) {
        const noise = (Math.random() * 2 - 1) * 0.3;
        const filteredNoise = noise * Math.exp(-t * 0.5);
        const drift = Math.sin(2 * Math.PI * (frequency * 0.5 + Math.sin(t * 0.2) * 10) * t) * 0.1;
        sample = filteredNoise + drift;
      } else if (name.includes('cricket')) {
        const chirpRate = 4;
        const chirpPhase = (t * chirpRate) % 1;
        const chirpEnvelope = Math.exp(-chirpPhase * 10) * (1 - chirpPhase);
        sample = Math.sin(2 * Math.PI * frequency * t) * chirpEnvelope * 0.3;
      } else if (name.includes('heartbeat')) {
        const beatPhase = (t / 1.2) % 1;
        const beatEnvelope = Math.exp(-beatPhase * 8) * (1 - beatPhase * 0.5);
        sample = Math.sin(2 * Math.PI * frequency * t) * beatEnvelope * 0.4;
      } else if (name.includes('ticktock')) {
        const tickPhase = (t / 0.4) % 1;
        const tickEnvelope = Math.exp(-tickPhase * 20);
        sample = Math.sin(2 * Math.PI * frequency * t) * tickEnvelope * 0.25;
      } else if (name.includes('memory') || name.includes('glow') || name.includes('light')) {
        const shimmer = Math.sin(2 * Math.PI * (frequency * 1.5) * t) * 0.1;
        const base = Math.sin(2 * Math.PI * frequency * t) * 0.2;
        const slowMod = 1 + Math.sin(2 * Math.PI * 0.3 * t) * 0.3;
        sample = (base + shimmer) * slowMod;
      } else if (name.includes('darkness') || name.includes('silent')) {
        const lowDrone = Math.sin(2 * Math.PI * frequency * t) * 0.2;
        const noise = (Math.random() * 2 - 1) * 0.05;
        sample = lowDrone + noise;
      } else if (name.includes('brush') || name.includes('canvas')) {
        const noise = (Math.random() * 2 - 1) * 0.4;
        const envelope = Math.sin(t * Math.PI / duration);
        sample = noise * envelope * 0.3;
      } else {
        const tone = Math.sin(2 * Math.PI * frequency * t) * 0.25;
        const overtone = Math.sin(2 * Math.PI * frequency * 1.5 * t) * 0.1;
        const tremolo = 1 + Math.sin(2 * Math.PI * 2 * t) * 0.1;
        sample = (tone + overtone) * tremolo;
      }

      data[i] = sample;
    }

    const wav = this.bufferToWav(buffer);
    return 'data:audio/wav;base64,' + btoa(wav);
  }

  private playSFXWithVolume(name: string, volume: number): void {
    if (this.sfxMuted) return;

    let sfx = this.sfxCache.get(name);
    if (!sfx) {
      sfx = this.createAudio(name, false, volume);
      sfx.mute(this.sfxMuted);
      this.sfxCache.set(name, sfx);
    } else {
      sfx.volume(volume);
    }
    sfx.play();
  }

  setAtmosphere(atmosphere: ExhibitionAtmosphere): void {
    const exhibitionId = this.sceneState.currentExhibition;
    const exhibitionConfig = EXHIBITION_AUDIO[exhibitionId];

    if (!exhibitionConfig) return;

    const atmosphereConfig = exhibitionConfig.atmospheres?.[atmosphere];
    if (atmosphereConfig) {
      this.sceneState.currentAtmosphere = atmosphere;
      this.applyAudioLayerConfig(atmosphereConfig.audio);
      eventBus.emit('sceneaudio:atmosphere-changed', { atmosphere });
    }
  }

  getSceneState(): SceneAudioState {
    return { ...this.sceneState };
  }

  getCurrentAtmosphere(): ExhibitionAtmosphere {
    return this.sceneState.currentAtmosphere;
  }

  setAmbientVolume(volume: number): void {
    this.ambientVolume = volume;
    this.activeAmbientTracks.forEach(track => {
      if (!this.ambientMuted) {
        track.volume(volume);
      }
    });
  }

  getAmbientVolume(): number {
    return this.ambientVolume;
  }

  toggleAmbient(): boolean {
    this.ambientMuted = !this.ambientMuted;
    this.activeAmbientTracks.forEach(track => {
      track.mute(this.ambientMuted);
    });
    return !this.ambientMuted;
  }

  getAmbientMuted(): boolean {
    return this.ambientMuted;
  }

  resetSceneAudio(): void {
    this.isNightModeActive = false;
    this.sceneState = {
      currentExhibition: '',
      currentAtmosphere: 'grand',
      currentPuzzlePhase: null,
      currentStoryNode: null,
      activeAmbientTracks: [],
      activeMechanismId: null
    };
    this.stopAllAmbient();
    this.stopBGM();
  }

  destroy(): void {
    this.stopBGM();
    this.stopVoice();
    this.stopAllAmbient();
    this.sfxCache.forEach(sfx => sfx.unload());
    this.sfxCache.clear();
    this.voiceCache.forEach(voice => voice.unload());
    this.voiceCache.clear();
    this.ambientCache.forEach(ambient => ambient.unload());
    this.ambientCache.clear();
    eventBus.off('audio:play', this.handlePlayAudio.bind(this));
    eventBus.off('settings:update', this.handleSettingsUpdate.bind(this));
    eventBus.off('recording:auto-play', this.handleAutoPlayRecording.bind(this));
  }
}

export const audioModule = new AudioModule();
