class SimpleTransactionEngine {
  constructor() {

    this.accounts = new Map([
      ["Ben", 1000],
      ["Harrison", 200]
    ]);

    this.stagingTable = null;
    this.isTransactionActive = false;
  }

  begin() {
    if (this.isTransactionActive) {
      throw new Error("A Transaction is already running!")
    }
    this.stagingTable = new Map();
    this.isTransactionActive = true;
    console.log("--> Transaction Started.")
  }

  read(key) {
    if (this.isTransactionActive && this.stagingTable.has(key)) {
      return this.stagingTable.get(key);
    }
    return this.accounts.get(key); 
  }

  write(key, value) {
    if(!this.isTransactionActive) {
      throw new Error("Cannot write outside of an active Transaction");
    }
    this.stagingTable.set(key, value);
    console.log(`[Staging Table] Staged: Set ${key} = ${value}`);
  }

  commit() {
    if (!this.isTransactionActive) return;

    for (const [key, value] of this.stagingTable.entries()) {
      this.accounts.set(key, value);
    }

    this.stagingTable = null;
    this.isTransactionActive = false;
    console.log("--> SUCCESS: Transaction Committed to Main Data!");
  }

  rollback() {
    if (!this.isTransactionActive) return;

    this.stagingTable = null;
    this.isTransactionActive = false;
    console.log("--> CANCEL: Staging Table discarded. No changes applied.");
  }
}

export default SimpleTransactionEngine;