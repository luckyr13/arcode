export const greeterContract = {
  name: 'greeter.js',
  stateName: 'greeter.json',
  contract: `/*******************************************************************************
 *  Greeter contract
 *  @author: luckyr13
 *  You can learn more about Arweave smart contracts here:
 *    https://github.com/ArweaveTeam/SmartWeave/blob/master/CONTRACT-GUIDE.md
********************************************************************************/

/**
 * Main contract function
 * @param {any} state              Smart contract latest state.
 * @param action                   Contract interaction.
 * @param {any} action.input       The user controlled input to the contract.
 * @param {string} action.caller   Wallet address of the user interacting with the contract.
 * @return {any}                   The output depends on the desired action.
*/
export function handle (state, action) {
  const input = action.input;
  const caller = action.caller;
  const option = input.function;
  
  // Greet users
  if (option === 'greet') {
    const greeting = state.greeting;
    return { result: greeting };
  } // Define greeting message
  else if (option === 'update_greeting') {
    const owner = state.owner;
    const newGreeting = input.greeting;
    ContractAssert(caller === owner, 'Caller must be the owner.');
    ContractAssert(newGreeting, 'Please introduce a new greeting message.');
    ContractAssert(newGreeting !== state.greeting, 'Please introduce a different greeting message.');
    ContractAssert(typeof newGreeting === 'string', \`Greeting must be a string.\`);
    state.greeting = newGreeting;
    return { state };
  }

  throw new ContractError(\`Wrong option: "\${option}"\`)
}`,
  state: `{
  "owner": "YOUR_ARWEAVE_ADDRESS",
  "greeting": ""
}`
}