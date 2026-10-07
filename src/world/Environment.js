import * as THREE from 'three';

export class Environment {
  constructor(scene) {
    this.scene = scene;
    this.spanZ = 260;

    this.treeCount = 56;
    this.rockCount = 36;
    this.postCount = 28;
    this.mountainCount = 18;

    this.treeData = [];
    this.rockData = [];
    this.postData = [];
    this.mountainData = [];

    this._dummy = new THREE.Object3D();

    this._buildInstancedProps();
    this.reset();
  }

  _buildInstancedProps() {
    const trunkGeo = new THREE.CylinderGeometry(0.22, 0.32, 1.4, 6);
    trunkGeo.translate(0, 0.7, 0);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5c4033, flatShading: true });

    const foliageGeo = new THREE.ConeGeometry(1.45, 3.8, 6);
    foliageGeo.translate(0, 2.9, 0);
    const foliageMat = new THREE.MeshLambertMaterial({ color: 0x15803d, flatShading: true });

    this.trunkInstanced = new THREE.InstancedMesh(trunkGeo, trunkMat, this.treeCount);
    this.foliageInstanced = new THREE.InstancedMesh(foliageGeo, foliageMat, this.treeCount);
    this.trunkInstanced.frustumCulled = false;
    this.foliageInstanced.frustumCulled = false;
    this.scene.add(this.trunkInstanced, this.foliageInstanced);

    const rockGeo = new THREE.DodecahedronGeometry(1.1, 0);
    rockGeo.translate(0, 0.65, 0);
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x475569, flatShading: true });

    this.rockInstanced = new THREE.InstancedMesh(rockGeo, rockMat, this.rockCount);
    this.rockInstanced.frustumCulled = false;
    this.scene.add(this.rockInstanced);

    const postGeo = new THREE.BoxGeometry(0.18, 1.1, 0.18);
    postGeo.translate(0, 0.55, 0);
    const postMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

    this.postInstanced = new THREE.InstancedMesh(postGeo, postMat, this.postCount);
    this.postInstanced.frustumCulled = false;
    this.scene.add(this.postInstanced);

    const mountainGeo = new THREE.ConeGeometry(14, 24, 5);
    mountainGeo.translate(0, 11, 0);
    const mountainMat = new THREE.MeshLambertMaterial({ color: 0x1e293b, flatShading: true });

    this.mountainInstanced = new THREE.InstancedMesh(mountainGeo, mountainMat, this.mountainCount);
    this.mountainInstanced.frustumCulled = false;
    this.scene.add(this.mountainInstanced);
  }

  reset() {
    this.treeData.length = 0;
    this.rockData.length = 0;
    this.postData.length = 0;
    this.mountainData.length = 0;

    for (let i = 0; i < this.treeCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * (8.5 + (i * 7.3) % 24);
      const z = 15 - (i / this.treeCount) * this.spanZ;
      const scale = 0.75 + ((i * 13) % 10) * 0.065;
      this.treeData.push({ x, z, scale, rotY: (i * 1.7) % Math.PI });
    }

    for (let i = 0; i < this.rockCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * (7.8 + ((i * 11.1) % 20));
      const z = 15 - (i / this.rockCount) * this.spanZ;
      const scale = 0.6 + ((i * 9) % 10) * 0.09;
      this.rockData.push({ x, z, scale, rotY: i * 2.1 });
    }

    for (let i = 0; i < this.postCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * 6.55;
      const z = 15 - Math.floor(i / 2) * (this.spanZ / (this.postCount / 2));
      this.postData.push({ x, z, scale: 1, rotY: 0 });
    }

    for (let i = 0; i < this.mountainCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * (36 + ((i * 9) % 28));
      const z = 20 - (i / this.mountainCount) * this.spanZ;
      const scale = 0.85 + ((i * 7) % 8) * 0.14;
      this.mountainData.push({ x, z, scale, rotY: i * 1.1 });
    }

    this._syncAllMatrices();
  }

  _syncAllMatrices() {
    this._updateGroupMatrices(this.treeData, [this.trunkInstanced, this.foliageInstanced]);
    this._updateGroupMatrices(this.rockData, [this.rockInstanced]);
    this._updateGroupMatrices(this.postData, [this.postInstanced]);
    this._updateGroupMatrices(this.mountainData, [this.mountainInstanced]);
  }

  _updateGroupMatrices(dataList, instancedMeshes) {
    const dummy = this._dummy;
    for (let i = 0; i < dataList.length; i++) {
      const item = dataList[i];
      dummy.position.set(item.x, 0, item.z);
      dummy.rotation.set(0, item.rotY, 0);
      dummy.scale.setScalar(item.scale);
      dummy.updateMatrix();
      for (let m = 0; m < instancedMeshes.length; m++) {
        instancedMeshes[m].setMatrixAt(i, dummy.matrix);
      }
    }
    for (let m = 0; m < instancedMeshes.length; m++) {
      instancedMeshes[m].instanceMatrix.needsUpdate = true;
    }
  }

  update(carZ) {
    const behindZ = carZ + 18;
    let treesMoved = false;
    let rocksMoved = false;
    let postsMoved = false;
    let mountainsMoved = false;

    for (let i = 0; i < this.treeData.length; i++) {
      const item = this.treeData[i];
      if (item.z > behindZ) {
        item.z -= this.spanZ;
        treesMoved = true;
      }
    }
    if (treesMoved) {
      this._updateGroupMatrices(this.treeData, [this.trunkInstanced, this.foliageInstanced]);
    }

    for (let i = 0; i < this.rockData.length; i++) {
      const item = this.rockData[i];
      if (item.z > behindZ) {
        item.z -= this.spanZ;
        rocksMoved = true;
      }
    }
    if (rocksMoved) {
      this._updateGroupMatrices(this.rockData, [this.rockInstanced]);
    }

    for (let i = 0; i < this.postData.length; i++) {
      const item = this.postData[i];
      if (item.z > behindZ) {
        item.z -= this.spanZ;
        postsMoved = true;
      }
    }
    if (postsMoved) {
      this._updateGroupMatrices(this.postData, [this.postInstanced]);
    }

    for (let i = 0; i < this.mountainData.length; i++) {
      const item = this.mountainData[i];
      if (item.z > behindZ + 12) {
        item.z -= this.spanZ;
        mountainsMoved = true;
      }
    }
    if (mountainsMoved) {
      this._updateGroupMatrices(this.mountainData, [this.mountainInstanced]);
    }
  }
}
