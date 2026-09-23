class NestedTransactionEngine {
  constructor() {
    this.globalData = new Map();
    this.globalCounts = new Map();
    this.transactionStack = [];
  }

  inTransaction() {
    return this.transactionStack.length > 0;
  }

  set(key, value) {

    const oldValue = this.get(key);
    if (oldValue === value) return;

    if (this.inTransaction()) {

      const currentFrame = this.transactionStack[this.transactionStack.length - 1];
      
      currentFrame.data.set(key, value);

      this._adjustLocalCount(currentFrame.localCounts, oldValue, -1);
      this._adjustLocalCount(currentFrame.localCounts, value, +1);
    } 
    else {

      this._adjustGlobalCount(oldValue, -1);
      this._adjustGlobalCount(value, +1);
      
      this.globalData.set(key, value);
    }
  }

  delete(key) {

    const oldValue = this.get(key);
    if (oldValue === undefined) return;

    if (this.inTransaction()) {

      const currentFrame = this.transactionStack[this.transactionStack.length - 1];

      currentFrame.data.set(key, null);

      this._adjustLocalCount(currentFrame.localCounts, oldValue, -1);
    } 
    else {
      this._adjustGlobalCount(oldValue, -1);
      this.globalData.delete(key);
    }
  }

  get(key) {
    if (this.inTransaction()) {
      for (let i = this.transactionStack.length - 1; i >= 0; i--) {
        const frame = this.transactionStack[i];
        if (frame.data.has(key)) {
          const val = frame.data.get(key);
          return val === null ? undefined : val;  
        }
      }
    }
    return this.globalData.get(key);
  }

  count(value) {
    let total = this.globalCounts.get(value) || 0;

    for (const frame of this.transactionStack) {
      if (frame.localCounts.has(value)) {
        total += frame.localCounts.get(value);
      }
    }

    return total;
  }

  _adjustLocalCount(localMap, val, change) {
    if (val === undefined || val === null) return;
    const current = localMap.get(val) || 0;
    localMap.set(val, current + change)
  }

  _adjustGlobalCount(val, change) {
    if (val === undefined || val === null) return;
    const current = this.globalCounts.get(val) || 0;
    const next = current + change;
    if (next <= 0) {
      this.globalCounts.delete(val);
    } else {
      this.globalCounts.set(val, next);
    }
  }

  begin() {
    this.transactionStack.push({
      data: new Map(),
      localCounts: new Map()
    });
  }

  rollback() {
    if(!this.inTransaction()) return false;
    this.transactionStack.pop();
    return true;
  }

  commit() {
    if (!this.inTransaction()) return false;

    const activeFrame = this.transactionStack.pop();

    if (this.inTransaction()) {
      const parentFrame = this.transactionStack[this.transactionStack.length - 1];
      
      for(const [key, value] of activeFrame.data.entries()) {
        parentFrame.data.set(key, value)
      }

      for (const [val, count] of activeFrame.localCounts.entries()) {
        this._adjustLocalCount(parentFrame.localCounts, val, count);
      }

    } else {
      for (const [key, value] of activeFrame.data.entries()) {
        if (value === null) {
          this.globalData.delete(key);
        } else {
          this.globalData.set(key, value);
        }
      }

      for (const [val, count] of activeFrame.localCounts.entries()) {
        this._adjustGlobalCount(val, count);
      }
    }
  }
}

export default NestedTransactionEngine;