import { Howl, Howler } from 'howler';
import { store } from '../game/Store';
import { eventBus } from '../game/EventBus';
import { GameSettings } from '../game/types';

export class AudioModule {
  private bgm: Howl | null = null;
  private sfxCache: Map<string, Howl> = new Map();
  private currentBgmName: string = '';

  constructor() {
    eventBus.on('audio:play', this.handlePlayAudio.bind(this));
    eventBus.on('settings:update', this.handleSettingsUpdate.bind(this));

    const settings = store.getSettings();
    this.applySettings(settings);
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
    Howler.volume(settings.bgmMuted ? 0 : settings.bgmVolume);
    Howler.mute(settings.bgmMuted || settings.sfxMuted);
  }

  playBGM(name: string): void {
    if (this.currentBgmName === name && this.bgm) return;

    this.stopBGM();

    const settings = store.getSettings();
    this.bgm = this.createAudio(name, true, settings.bgmVolume);
    this.currentBgmName = name;
    this.bgm.play();
  }

  stopBGM(): void {
    if (this.bgm) {
      this.bgm.fade(Howler.volume(), 0, 500);
      setTimeout(() => {
        this.bgm?.stop();
        this.bgm?.unload();
        this.bgm = null;
      }, 500);
    }
    this.currentBgmName = '';
  }

  playSFX(name: string): void {
    const settings = store.getSettings();
    if (settings.sfxMuted) return;

    let sfx = this.sfxCache.get(name);
    if (!sfx) {
      sfx = this.createAudio(name, false, settings.sfxVolume);
      this.sfxCache.set(name, sfx);
    }
    sfx.play();
  }

  private createAudio(name: string, loop: boolean, volume: number): Howl {
    const frequency = name === 'bgm_main' ? 220 :
                      name === 'bgm_mystery' ? 180 :
                      name === 'sfx_click' ? 800 :
                      name === 'sfx_collect' ? 600 :
                      name === 'sfx_success' ? 523 :
                      name === 'sfx_error' ? 200 :
                      name === 'sfx_unlock' ? 440 : 440;

    const duration = loop ? 8 : 0.3;

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
    Howler.volume(volume);
  }

  setSFXVolume(volume: number): void {
    this.sfxCache.forEach(sfx => {
      sfx.volume(volume);
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

  destroy(): void {
    this.stopBGM();
    this.sfxCache.forEach(sfx => sfx.unload());
    this.sfxCache.clear();
    eventBus.off('audio:play', this.handlePlayAudio.bind(this));
    eventBus.off('settings:update', this.handleSettingsUpdate.bind(this));
  }
}

export const audioModule = new AudioModule();
