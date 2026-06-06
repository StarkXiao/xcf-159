declare module 'howler' {
  export class Howl {
    constructor(options: {
      src: string[];
      volume?: number;
      loop?: boolean;
      autoplay?: boolean;
      format?: string[];
      onload?: () => void;
      onloaderror?: (id: number, error: unknown) => void;
      onplayerror?: (id: number, error: unknown) => void;
    });
    play(id?: number): number;
    pause(id?: number): void;
    stop(id?: number): void;
    volume(vol?: number, id?: number): number;
    mute(muted: boolean, id?: number): void;
    fade(from: number, to: number, duration: number, id?: number): void;
    seek(seek?: number, id?: number): number;
    duration(id?: number): number;
    playing(id?: number): boolean;
    once(event: string, callback: () => void, id?: number): void;
    on(event: string, callback: () => void, id?: number): void;
    off(event: string, callback?: () => void, id?: number): void;
    unload(): void;
  }
}
