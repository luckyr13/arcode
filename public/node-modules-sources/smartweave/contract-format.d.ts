/*
*  https://github.com/ArweaveTeam/SmartWeave/blob/master/CONTRACT-GUIDE.md
*/

declare class ContractError extends Error {
}

declare function ContractAssert(cond: boolean, message: string): void;


declare namespace SmartWeave {
  const contracts: {
    readContractState(contractId: string): Promise<any>;
  };
  const transaction: {
    id: string;
    owner: any;
    target: any;
    quantity: any;
    reward: any;
    tags: { name: string, value: any }[];
  };
  const block: {
    height: number;
    indep_hash: string;
    timestamp: number;
  };
  const arweave: {
    crypto(): any;
    utils(): any;
    ar(): any;
    wallets(): any;
  }
}

declare interface ContractInteraction {
  input: Record<string, any>;
  caller: string;
}

declare interface ContractHandlerResult {
  result?: any
  state?: any
}
