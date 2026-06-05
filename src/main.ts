import './style.css';
import { Game } from './game/Game';

let game: Game | null = null;

window.addEventListener('load', () => {
  game = new Game();
});

window.addEventListener('beforeunload', () => {
  if (game) {
    game.destroy();
    game = null;
  }
});
