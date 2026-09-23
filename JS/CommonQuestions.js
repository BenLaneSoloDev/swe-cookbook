
// * Arrays, Maps & Objects are passed by reference *
{
  const transactionStack = [];
  const currentFrame = transactionStack[transactionStack.length - 1];
  currentFrame.set(key, value); // Edits the orirignal transactionStack variable
}