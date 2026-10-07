export class ObjectPool {
  constructor(createFn, resetFn = null, initialSize = 16) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.freeList = [];
    this.activeList = [];

    this.prewarm(initialSize);
  }

  prewarm(count) {
    for (let i = 0; i < count; i++) {
      const item = this.createFn();
      if (this.resetFn) {
        this.resetFn(item);
      }
      this.freeList.push(item);
    }
  }

  acquire() {
    const item = this.freeList.length > 0 ? this.freeList.pop() : this.createFn();
    this.activeList.push(item);
    return item;
  }

  release(item) {
    const index = this.activeList.indexOf(item);
    if (index !== -1) {
      const last = this.activeList.pop();
      if (index < this.activeList.length) {
        this.activeList[index] = last;
      }
    }
    if (this.resetFn) {
      this.resetFn(item);
    }
    this.freeList.push(item);
  }

  releaseAt(index) {
    if (index < 0 || index >= this.activeList.length) return;
    const item = this.activeList[index];
    const last = this.activeList.pop();
    if (index < this.activeList.length) {
      this.activeList[index] = last;
    }
    if (this.resetFn) {
      this.resetFn(item);
    }
    this.freeList.push(item);
  }

  releaseAll() {
    while (this.activeList.length > 0) {
      const item = this.activeList.pop();
      if (this.resetFn) {
        this.resetFn(item);
      }
      this.freeList.push(item);
    }
  }
}
