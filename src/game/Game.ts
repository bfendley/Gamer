import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { InputManager } from '../utils/InputManager';
import { OreoDog } from './OreoDog';
import { CollectibleField } from './CollectibleField';
import { SunCycle } from './SunCycle';
import { Hud } from '../ui/Hud';

export class Game {
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly clock = new THREE.Clock();
  private readonly oreo = new OreoDog();
  private readonly input = new InputManager();
  private readonly collectibles: CollectibleField;
  private readonly hud = new Hud();
  private readonly sunCycle: SunCycle;
  private readonly orbit: OrbitControls;
  private readonly velocity = new THREE.Vector3();
  private readonly cameraTarget = new THREE.Vector3();
  private readonly listener = new THREE.AudioListener();
  private barkSound?: THREE.Audio;
  private bonesCollected = 0;

  constructor(private readonly container: HTMLElement) {
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.set(6, 4, 8);
    this.camera.add(this.listener);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    this.scene.background = new THREE.Color(0xa1c4fd);
    this.scene.fog = new THREE.Fog(0xa1c4fd, 20, 60);

    this.createEnvironment();

    this.scene.add(this.oreo);
    this.oreo.position.set(0, 0, 0);

    this.collectibles = new CollectibleField(this.scene);
    this.sunCycle = new SunCycle(this.scene);

    this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbit.target.set(0, 1, 0);
    this.orbit.enablePan = false;
    this.orbit.maxDistance = 20;
    this.orbit.minDistance = 6;

    this.input.onBark(() => this.bark());
    this.loadAudio();

    window.addEventListener('resize', () => this.onResize());
  }

  private createEnvironment() {
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(30, 64),
      new THREE.MeshStandardMaterial({ color: 0x7fc18a, roughness: 0.8 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const plaza = new THREE.Mesh(
      new THREE.RingGeometry(5, 6.2, 48),
      new THREE.MeshStandardMaterial({ color: 0xf8ede3, roughness: 0.6 })
    );
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.y = 0.02;
    this.scene.add(plaza);

    const stage = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.5, 0.3, 32),
      new THREE.MeshStandardMaterial({ color: 0x2d2a32, roughness: 0.4, metalness: 0.6 })
    );
    stage.position.set(0, 0.15, 0);
    stage.receiveShadow = true;
    stage.castShadow = true;
    this.scene.add(stage);

    const trophy = new THREE.Mesh(
      new THREE.ConeGeometry(0.6, 1.2, 24),
      new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 })
    );
    trophy.position.set(0, 1, 0);
    this.scene.add(trophy);

    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.2, 24),
      new THREE.MeshStandardMaterial({ color: 0xf5f5f5 })
    );
    pedestal.position.set(0, 0.6, 0);
    this.scene.add(pedestal);

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 400;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = THREE.MathUtils.randFloatSpread(40);
      positions[i * 3 + 1] = Math.random() * 8 + 2;
      positions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(40);
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true, opacity: 0.6 })
    );
    this.scene.add(particles);
  }

  private async loadAudio() {
    const audioLoader = new THREE.AudioLoader();
    const barkBuffer = await audioLoader.loadAsync('https://cdn.jsdelivr.net/gh/mdn/webaudio-examples/audio-analyser/viper.ogg');
    this.barkSound = new THREE.Audio(this.listener);
    this.barkSound.setBuffer(barkBuffer);
    this.barkSound.setVolume(0.2);
  }

  private bark() {
    this.barkSound?.stop();
    this.barkSound?.play();
  }

  start() {
    this.clock.start();
    this.renderer.setAnimationLoop(() => this.update());
  }

  private update() {
    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    this.updateMovement(delta);
    this.oreo.wagTail(delta);
    this.collectibles.update(delta);
    this.sunCycle.update(delta);
    this.hud.updateTime(elapsed);
    this.hud.updateMood(this.sunCycle.getMood());

    this.renderer.render(this.scene, this.camera);
  }

  private updateMovement(delta: number) {
    const acceleration = new THREE.Vector3();
    const speed = 6;

    if (this.input.isPressed('forward')) acceleration.z -= 1;
    if (this.input.isPressed('backward')) acceleration.z += 1;
    if (this.input.isPressed('left')) acceleration.x -= 1;
    if (this.input.isPressed('right')) acceleration.x += 1;

    acceleration.normalize().multiplyScalar(speed * delta);
    this.velocity.add(acceleration);
    this.velocity.multiplyScalar(0.9);

    this.oreo.position.add(new THREE.Vector3(this.velocity.x, 0, this.velocity.z));
    this.oreo.position.y = 0;

    if (this.velocity.lengthSq() > 0.0001) {
      const direction = Math.atan2(this.velocity.x, this.velocity.z);
      this.oreo.rotation.y = direction;
    }

    this.oreo.animateWalk(delta, this.velocity);
    this.bonesCollected += this.collectibles.checkCollisions(this.oreo.position, 1.2);
    this.hud.updateBones(this.bonesCollected);

    this.updateCamera(delta);
  }

  private updateCamera(delta: number) {
    const offset = new THREE.Vector3(6, 4, 6).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.oreo.rotation.y);
    const desired = this.oreo.position.clone().add(offset);
    this.camera.position.lerp(desired, 0.05);

    this.cameraTarget.lerp(this.oreo.position.clone().add(new THREE.Vector3(0, 1.2, 0)), 0.08);
    this.camera.lookAt(this.cameraTarget);
    this.orbit.target.copy(this.cameraTarget);
    this.orbit.update();
  }

  private onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
