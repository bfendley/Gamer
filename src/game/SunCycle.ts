import * as THREE from 'three';

export class SunCycle {
  private elapsed = 0;
  private readonly duration: number;
  private readonly hemisphere: THREE.HemisphereLight;
  private readonly sun: THREE.DirectionalLight;

  constructor(scene: THREE.Scene, durationSeconds = 240) {
    this.duration = durationSeconds;

    this.hemisphere = new THREE.HemisphereLight(0xb1e1ff, 0x7cfc00, 0.3);
    scene.add(this.hemisphere);

    this.sun = new THREE.DirectionalLight(0xffffff, 1.4);
    this.sun.position.set(10, 15, 5);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.camera.near = 0.1;
    this.sun.shadow.camera.far = 60;
    this.sun.shadow.camera.left = -20;
    this.sun.shadow.camera.right = 20;
    this.sun.shadow.camera.top = 20;
    this.sun.shadow.camera.bottom = -20;
    scene.add(this.sun);
  }

  update(delta: number) {
    this.elapsed += delta;
    const progress = (this.elapsed % this.duration) / this.duration;
    const angle = progress * Math.PI * 2;

    this.sun.position.set(
      Math.cos(angle) * 25,
      Math.sin(angle) * 25,
      Math.sin(angle * 0.7) * 15
    );
    this.sun.intensity = 0.8 + Math.max(Math.sin(angle), 0) * 1.2;

    const skyColor = new THREE.Color().setHSL(0.6 - 0.2 * Math.cos(angle), 0.6, 0.6 + 0.2 * Math.sin(angle));
    const groundColor = new THREE.Color().setHSL(0.33, 0.5, 0.5);
    this.hemisphere.color.copy(skyColor);
    this.hemisphere.groundColor.copy(groundColor);
  }

  getMood(): string {
    const angle = ((this.elapsed % this.duration) / this.duration) * Math.PI * 2;
    if (Math.sin(angle) > 0.5) return 'Euphoric';
    if (Math.sin(angle) > -0.2) return 'Chill';
    return 'Determined';
  }
}
