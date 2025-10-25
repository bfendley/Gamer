import * as THREE from 'three';

export class OreoDog extends THREE.Group {
  private readonly head: THREE.Group;
  private readonly tail: THREE.Mesh;
  private readonly legs: THREE.Mesh[] = [];
  private readonly ears: THREE.Mesh[] = [];
  private readonly snout: THREE.Mesh;
  private tailWave = 0;
  private readonly walkCycle = {
    speed: 6,
    amplitude: 0.4,
    offset: Math.PI / 2
  };

  constructor() {
    super();

    const coatMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e1e1e,
      roughness: 0.7,
      metalness: 0.1
    });
    const creamMaterial = new THREE.MeshStandardMaterial({
      color: 0xfaf7f2,
      roughness: 0.4,
      metalness: 0.05
    });

    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(1.6, 1.2, 8, 16),
      coatMaterial
    );
    body.rotation.z = Math.PI / 2;
    body.position.y = 0.8;
    this.add(body);

    this.head = new THREE.Group();
    const skull = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 16, 16),
      coatMaterial
    );
    skull.position.set(1.4, 1.3, 0);
    this.head.add(skull);

    this.snout = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.2, 0.7, 12),
      creamMaterial
    );
    this.snout.rotation.z = Math.PI / 2;
    this.snout.position.set(2.05, 1.1, 0);
    this.head.add(this.snout);

    const nose = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x111111 })
    );
    nose.position.set(2.45, 1.08, 0);
    this.head.add(nose);

    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), eyeMaterial);
    leftEye.position.set(1.75, 1.35, 0.26);
    const rightEye = leftEye.clone();
    rightEye.position.z = -0.26;
    this.head.add(leftEye, rightEye);

    const leftPupil = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), pupilMaterial);
    leftPupil.position.set(1.88, 1.32, 0.3);
    const rightPupil = leftPupil.clone();
    rightPupil.position.z = -0.3;
    this.head.add(leftPupil, rightPupil);

    const earGeometry = new THREE.ConeGeometry(0.25, 0.6, 12);
    const earMaterial = new THREE.MeshStandardMaterial({ color: 0x151515 });
    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(1.45, 1.75, 0.35);
    leftEar.rotation.z = Math.PI / 8;
    const rightEar = leftEar.clone();
    rightEar.position.z = -0.35;
    rightEar.rotation.z = -Math.PI / 8;
    this.ears.push(leftEar, rightEar);
    this.head.add(leftEar, rightEar);

    this.add(this.head);

    this.tail = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.07, 1.1, 10),
      coatMaterial
    );
    this.tail.position.set(-1.6, 1.2, 0);
    this.tail.rotation.z = Math.PI / 3;
    this.add(this.tail);

    const legGeometry = new THREE.CapsuleGeometry(0.22, 0.8, 6, 12);
    const legPositions: Array<[number, number]> = [
      [0.7, 0.4],
      [0.7, -0.4],
      [-0.7, 0.4],
      [-0.7, -0.4]
    ];

    for (const [z, x] of legPositions) {
      const leg = new THREE.Mesh(legGeometry, creamMaterial);
      leg.position.set(x, 0.3, z);
      this.legs.push(leg);
      this.add(leg);
    }

    const collar = new THREE.Mesh(
      new THREE.TorusGeometry(0.7, 0.06, 10, 32),
      new THREE.MeshStandardMaterial({ color: 0xff3b30, metalness: 0.2 })
    );
    collar.position.set(1, 1.0, 0);
    collar.rotation.x = Math.PI / 2;
    this.add(collar);

    const tag = new THREE.Mesh(
      new THREE.CircleGeometry(0.12, 24),
      new THREE.MeshStandardMaterial({ color: 0xf5d142, metalness: 0.6, roughness: 0.3 })
    );
    tag.position.set(1, 0.68, 0.12);
    tag.rotation.y = Math.PI / 2;
    this.add(tag);

    this.castShadow = true;
    this.receiveShadow = true;
  }

  wagTail(delta: number) {
    this.tailWave += delta * 6;
    this.tail.rotation.z = Math.PI / 3 + Math.sin(this.tailWave) * 0.3;
  }

  animateWalk(delta: number, velocity: THREE.Vector3) {
    const speed = velocity.length();
    const cycle = performance.now() / 1000 * this.walkCycle.speed;
    const amount = Math.min(speed * 2, 1) * this.walkCycle.amplitude;

    this.head.position.y = 1.35 + Math.sin(cycle) * 0.05 * amount;
    this.snout.rotation.y = Math.sin(cycle) * 0.1 * amount;

    this.ears.forEach((ear, index) => {
      const direction = index === 0 ? 1 : -1;
      ear.rotation.x = Math.sin(cycle + direction * this.walkCycle.offset) * 0.2 * amount - 0.3;
    });

    this.legs.forEach((leg, index) => {
      const direction = index % 2 === 0 ? 1 : -1;
      leg.rotation.x = Math.sin(cycle + direction * this.walkCycle.offset) * 0.9 * amount;
    });
  }
}
