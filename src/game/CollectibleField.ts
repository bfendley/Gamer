import * as THREE from 'three';

export interface Collectible {
  mesh: THREE.Mesh;
  collected: boolean;
}

export class CollectibleField {
  private readonly biscuits: Collectible[] = [];
  private readonly bounds: THREE.Box3;

  constructor(private readonly scene: THREE.Scene, areaSize = 30) {
    this.bounds = new THREE.Box3(
      new THREE.Vector3(-areaSize / 2, 0, -areaSize / 2),
      new THREE.Vector3(areaSize / 2, 3, areaSize / 2)
    );
    this.spawnBiscuits();
  }

  private spawnBiscuits() {
    const biscuitMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4a373,
      roughness: 0.5,
      metalness: 0.1
    });

    const sprinkleMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffc857,
      emissiveIntensity: 0.6
    });

    const biscuitGeometry = new THREE.CylinderGeometry(0.4, 0.5, 0.2, 16);
    const sprinkleGeometry = new THREE.TorusGeometry(0.2, 0.05, 8, 24);

    for (let i = 0; i < 12; i++) {
      const mesh = new THREE.Mesh(biscuitGeometry, biscuitMaterial);
      mesh.position.set(
        THREE.MathUtils.randFloat(this.bounds.min.x + 2, this.bounds.max.x - 2),
        0.3,
        THREE.MathUtils.randFloat(this.bounds.min.z + 2, this.bounds.max.z - 2)
      );
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const sprinkle = new THREE.Mesh(sprinkleGeometry, sprinkleMaterial);
      sprinkle.rotation.x = Math.PI / 2;
      sprinkle.position.y = 0.2;
      mesh.add(sprinkle);

      this.biscuits.push({ mesh, collected: false });
      this.scene.add(mesh);
    }
  }

  update(delta: number) {
    this.biscuits.forEach(({ mesh, collected }) => {
      if (collected) return;
      mesh.rotation.y += delta;
      mesh.position.y = 0.3 + Math.sin(performance.now() / 500) * 0.05;
    });
  }

  checkCollisions(position: THREE.Vector3, radius: number): number {
    let collectedCount = 0;
    const center = position.clone();
    this.biscuits.forEach((biscuit) => {
      if (biscuit.collected) return;
      const distance = biscuit.mesh.position.distanceTo(center);
      if (distance < radius) {
        biscuit.collected = true;
        this.scene.remove(biscuit.mesh);
        collectedCount += 1;
      }
    });
    return collectedCount;
  }

  remaining(): number {
    return this.biscuits.filter((biscuit) => !biscuit.collected).length;
  }
}
