import * as THREE from 'three';

export class Road {
  constructor(scene) {
    this.scene = scene;
    this.segmentLength = 28;
    this.segmentCount = 10;
    this.roadWidth = 11.4;
    this.lanes = [-3.4, 0, 3.4];

    this.segments = [];
    this.frontZ = 0;

    this.checkpointInterval = 250;
    this.nextCheckpointZ = -this.checkpointInterval;
    this.checkpointGroup = null;
    this.checkpointBannerMat = null;
    this.checkpointAnimTimer = 0;

    this._buildSharedSegments();
    this._buildCheckpointGate();
    this.reset();
  }

  _buildSharedSegments() {
    const groundGeo = new THREE.PlaneGeometry(180, this.segmentLength);
    groundGeo.rotateX(-Math.PI / 2);

    const asphaltGeo = new THREE.PlaneGeometry(this.roadWidth, this.segmentLength);
    asphaltGeo.rotateX(-Math.PI / 2);

    const shoulderGeo = new THREE.BoxGeometry(0.48, 0.14, this.segmentLength / 2);
    const dashGeo = new THREE.PlaneGeometry(0.2, 4.2);
    dashGeo.rotateX(-Math.PI / 2);

    const groundMatA = new THREE.MeshLambertMaterial({ color: 0x132032 });
    const groundMatB = new THREE.MeshLambertMaterial({ color: 0x162438 });
    const asphaltMatA = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const asphaltMatB = new THREE.MeshLambertMaterial({ color: 0x222e42 });
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
    const curbRedMat = new THREE.MeshLambertMaterial({ color: 0xef4444 });
    const curbWhiteMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });

    for (let i = 0; i < this.segmentCount; i++) {
      const group = new THREE.Group();
      const isEven = i % 2 === 0;

      const ground = new THREE.Mesh(groundGeo, isEven ? groundMatA : groundMatB);
      ground.position.y = -0.04;
      ground.receiveShadow = true;
      group.add(ground);

      const asphalt = new THREE.Mesh(asphaltGeo, isEven ? asphaltMatA : asphaltMatB);
      asphalt.position.y = 0;
      asphalt.receiveShadow = true;
      group.add(asphalt);

      const edgeX = this.roadWidth / 2 + 0.22;
      const halfSeg = this.segmentLength / 4;

      const leftCurb1 = new THREE.Mesh(shoulderGeo, curbRedMat);
      leftCurb1.position.set(-edgeX, 0.06, -halfSeg);
      const leftCurb2 = new THREE.Mesh(shoulderGeo, curbWhiteMat);
      leftCurb2.position.set(-edgeX, 0.06, halfSeg);

      const rightCurb1 = new THREE.Mesh(shoulderGeo, curbRedMat);
      rightCurb1.position.set(edgeX, 0.06, -halfSeg);
      const rightCurb2 = new THREE.Mesh(shoulderGeo, curbWhiteMat);
      rightCurb2.position.set(edgeX, 0.06, halfSeg);

      group.add(leftCurb1, leftCurb2, rightCurb1, rightCurb2);

      const dividerX = [-1.7, 1.7];
      const dashZOffsets = [-9.5, 0, 9.5];
      for (let lx = 0; lx < dividerX.length; lx++) {
        for (let dz = 0; dz < dashZOffsets.length; dz++) {
          const dash = new THREE.Mesh(dashGeo, dashMat);
          dash.position.set(dividerX[lx], 0.015, dashZOffsets[dz]);
          group.add(dash);
        }
      }

      this.scene.add(group);
      this.segments.push(group);
    }
  }

  _buildCheckpointGate() {
    this.checkpointGroup = new THREE.Group();

    const pillarGeo = new THREE.BoxGeometry(0.45, 5.2, 0.45);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      roughness: 0.3,
      flatShading: true,
    });

    const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
    leftPillar.position.set(-this.roadWidth / 2 - 0.35, 2.6, 0);
    const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
    rightPillar.position.set(this.roadWidth / 2 + 0.35, 2.6, 0);

    const bannerGeo = new THREE.BoxGeometry(this.roadWidth + 1.4, 0.95, 0.5);
    this.checkpointBannerMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
    });
    const banner = new THREE.Mesh(bannerGeo, this.checkpointBannerMat);
    banner.position.set(0, 4.9, 0);

    const lineGeo = new THREE.PlaneGeometry(this.roadWidth, 1.1);
    lineGeo.rotateX(-Math.PI / 2);
    const lineMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.45,
    });
    const roadLine = new THREE.Mesh(lineGeo, lineMat);
    roadLine.position.set(0, 0.02, 0);

    this.checkpointGroup.add(leftPillar, rightPillar, banner, roadLine);
    this.scene.add(this.checkpointGroup);
  }

  reset() {
    for (let i = 0; i < this.segmentCount; i++) {
      const z = (1 - i) * this.segmentLength;
      this.segments[i].position.z = z;
      this.frontZ = z;
    }

    this.nextCheckpointZ = -this.checkpointInterval;
    this.checkpointAnimTimer = 0;
    if (this.checkpointGroup) {
      this.checkpointGroup.position.set(0, 0, this.nextCheckpointZ);
      this.checkpointGroup.scale.set(1, 1, 1);
    }
    if (this.checkpointBannerMat) {
      this.checkpointBannerMat.color.setHex(0x22d3ee);
    }
  }

  triggerCheckpointAnimation() {
    this.checkpointAnimTimer = 0.45;
    if (this.checkpointBannerMat) {
      this.checkpointBannerMat.color.setHex(0xfacc15);
    }
  }

  update(dt, carZ) {
    const recycleThreshold = carZ + this.segmentLength * 1.35;

    for (let i = 0; i < this.segmentCount; i++) {
      const seg = this.segments[i];
      if (seg.position.z > recycleThreshold) {
        this.frontZ -= this.segmentLength;
        seg.position.z = this.frontZ;
      }
    }

    if (this.checkpointAnimTimer > 0) {
      this.checkpointAnimTimer -= dt;
      const pulse = 1 + Math.sin(this.checkpointAnimTimer * 24) * 0.08;
      this.checkpointGroup.scale.set(1, pulse, 1);
      if (this.checkpointAnimTimer <= 0 && this.checkpointBannerMat) {
        this.checkpointGroup.scale.set(1, 1, 1);
        this.checkpointBannerMat.color.setHex(0x22d3ee);
      }
    }

    if (this.checkpointGroup.position.z > carZ + 12) {
      this.nextCheckpointZ -= this.checkpointInterval;
      this.checkpointGroup.position.z = this.nextCheckpointZ;
      this.checkpointGroup.scale.set(1, 1, 1);
      if (this.checkpointBannerMat) {
        this.checkpointBannerMat.color.setHex(0x22d3ee);
      }
    }
  }
}
