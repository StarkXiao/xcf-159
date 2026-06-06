import { Howl } from 'howler';
import { store } from '../game/Store';
import { eventBus } from '../game/EventBus';
import { GameSettings, AudioRecording } from '../game/types';

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

  constructor() {
    eventBus.on('audio:play', this.handlePlayAudio.bind(this));
    eventBus.on('settings:update', this.handleSettingsUpdate.bind(this));
    eventBus.on('recording:auto-play', this.handleAutoPlayRecording.bind(this));

    const settings = store.getSettings();
    this.bgmVolume = settings.bgmVolume;
    this.bgmMuted = settings.bgmMuted;
    this.sfxVolume = settings.sfxVolume;
    this.sfxMuted = settings.sfxMuted;
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
                      name === 'sfx_click' ? 800 :
                      name === 'sfx_collect' ? 600 :
                      name === 'sfx_success' ? 523 :
                      name === 'sfx_error' ? 200 :
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
                      name === 'sfx_power_flicker' ? 200 : 440;

    const duration = name === 'bgm_night' ? 12 :
                     name === 'bgm_power_outage' ? 15 :
                     name === 'bgm_emergency' ? 10 :
                     name === 'bgm_blackout_warning' ? 8 :
                     name === 'bgm_blackout_dark' ? 12 :
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

  destroy(): void {
    this.stopBGM();
    this.stopVoice();
    this.sfxCache.forEach(sfx => sfx.unload());
    this.sfxCache.clear();
    this.voiceCache.forEach(voice => voice.unload());
    this.voiceCache.clear();
    eventBus.off('audio:play', this.handlePlayAudio.bind(this));
    eventBus.off('settings:update', this.handleSettingsUpdate.bind(this));
  }
}

export const audioModule = new AudioModule();
