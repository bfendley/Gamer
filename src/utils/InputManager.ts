export type Direction = 'forward' | 'backward' | 'left' | 'right';

const KEY_MAP: Record<string, Direction | 'bark'> = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'backward',
  ArrowDown: 'backward',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
  Space: 'bark'
};

export class InputManager {
  private readonly pressed = new Set<string>();
  private barkListeners: Array<() => void> = [];

  constructor() {
    window.addEventListener('keydown', (event) => this.onKeyDown(event));
    window.addEventListener('keyup', (event) => this.onKeyUp(event));
  }

  private onKeyDown(event: KeyboardEvent) {
    const mapped = KEY_MAP[event.code];
    if (!mapped) return;
    event.preventDefault();

    if (mapped === 'bark') {
      this.barkListeners.forEach((listener) => listener());
      return;
    }

    this.pressed.add(mapped);
  }

  private onKeyUp(event: KeyboardEvent) {
    const mapped = KEY_MAP[event.code];
    if (!mapped || mapped === 'bark') return;
    event.preventDefault();
    this.pressed.delete(mapped);
  }

  public isPressed(direction: Direction): boolean {
    return this.pressed.has(direction);
  }

  public onBark(listener: () => void) {
    this.barkListeners.push(listener);
  }
}
