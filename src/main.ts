import './styles/main.css';
import { Game } from './game/Game';

const app = document.getElementById('app');

if (!app) {
  throw new Error('Missing app container');
}

const game = new Game(app);
game.start();

export default game;
