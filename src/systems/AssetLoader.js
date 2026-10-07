export class AssetRegistry {
  constructor() {
    this.models = new Map();
    this.basePath = '/assets/';
  }

  registerTemplate(key, object3d) {
    this.models.set(key, object3d);
  }

  createInstance(key) {
    const template = this.models.get(key);
    return template ? template.clone(true) : null;
  }
}

export const assetRegistry = new AssetRegistry();
