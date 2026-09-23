import SimpleTransactionEngine from "./simpleTE.js";
import NestedTransactionEngine from "./nestedTE.js";

// * Simple Valid Transaction *

console.log(`\n`, "SIMPLE TRANSACTION: ", `\n`);

const db = new SimpleTransactionEngine();
db.begin();

const transferAmount = 300;

const Ben = db.read("Ben");
const Harrison = db.read("Harrison");

db.write("Ben", Ben - transferAmount);
db.write("Harrison", Harrison + transferAmount);

console.log("Main DB Ben during transaction: ", db.accounts.get("Ben"));
console.log("Main DB Harrison during transaction: ", db.accounts.get("Harrison"));

db.commit();

console.log("Main DB Ben after transaction: ", db.accounts.get("Ben"));
console.log("Main DB Harrison after transaction: ", db.accounts.get("Harrison"));

// * Simple Transaction with Error *

console.log(`\n`, "SIMPLE TRANSACTION (+ ERROR): ", `\n`);

const db2 = new SimpleTransactionEngine();
db2.begin();

const transferAmount2 = 300;

const Ben2 = db2.read("Ben");
const Harrison2 = db2.read("Harrison");

db2.write("Ben", Ben2 - transferAmount);
db2.write("Harrison", Harrison2 + transferAmount);

const systemCrashed = true;

if (systemCrashed) {
  console.log("Error detected! Rolling back...");
  db2.rollback();
}

console.log("Main DB Ben after rollback:", db2.accounts.get("Ben"));

// * Nested Transactions with Count *

console.log(`\n`, "NESTED TRANSACTION: ", `\n`);

function assertEqual(actual, expected, testName) {
  if (actual === expected) {
    console.log(`✅ PASS: ${testName}`);
  } else {
    console.error(`❌ FAIL: ${testName} | Expected: ${expected}, Got: ${actual}`);
  }
}

const store = new NestedTransactionEngine();

console.log("=== 1. Global Store Operations ===");
store.set("a", 10);
store.set("b", 10);
store.set("c", 20);

assertEqual(store.get("a"), 10, "Global GET('a')");
assertEqual(store.count(10), 2, "Global COUNT(10)");
assertEqual(store.count(20), 1, "Global COUNT(20)");

console.log("\n=== 2. Outer Transaction (T1) ===");
store.begin();
store.set("a", 20); // 'a' moves from 10 to 20
store.delete("b");   // 'b' is deleted

assertEqual(store.get("a"), 20, "T1 GET('a') overrode global");
assertEqual(store.get("b"), undefined, "T1 GET('b') tombstoned");
assertEqual(store.count(10), 0, "T1 COUNT(10) dropped to 0");
assertEqual(store.count(20), 2, "T1 COUNT(20) increased to 2");

console.log("\n=== 3. Nested Inner Transaction (T2) ===");
store.begin();
store.set("c", 30); // 'c' moves from 20 to 30
store.set("d", 10); // new key 'd' = 10

assertEqual(store.get("c"), 30, "T2 GET('c') overrode T1");
assertEqual(store.count(10), 1, "T2 COUNT(10) is 1 ('d')");
assertEqual(store.count(20), 1, "T2 COUNT(20) is 1 ('a')");
assertEqual(store.count(30), 1, "T2 COUNT(30) is 1 ('c')");

console.log("\n=== 4. Rollback T2 (Inner) ===");
store.rollback();

assertEqual(store.get("c"), 20, "After Rollback GET('c') back to 20");
assertEqual(store.get("d"), undefined, "After Rollback GET('d') is undefined");
assertEqual(store.count(10), 0, "After Rollback COUNT(10) back to 0");
assertEqual(store.count(20), 2, "After Rollback COUNT(20) back to 2");
assertEqual(store.count(30), 0, "After Rollback COUNT(30) back to 0");

console.log("\n=== 5. Commit T1 (Outer to Global) ===");
store.commit();

assertEqual(store.get("a"), 20, "Committed GET('a') is 20");
assertEqual(store.get("b"), undefined, "Committed GET('b') is deleted");
assertEqual(store.count(10), 0, "Committed COUNT(10) is 0");
assertEqual(store.count(20), 2, "Committed COUNT(20) is 2 ('a' & 'c')");

console.log("\n=== All Tests Finished ===");