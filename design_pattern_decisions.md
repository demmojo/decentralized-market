# Design Patterns

I have applied the following design patterns in my project:

1. **Owner**: I have prevented access of certain functions using my own modifiers as well as OpenZepplin's [[Ownable](https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/ownership/Ownable.sol) smart contract. This helps restrict access to unauthorized users and improves security.
2. **Mortal**: I have provided methods which allow the creator of stores or the market owner to destroy contracts. For example: when the market owner removes a store owner all of his associated Store smart contracts are destroyed. Of course, all of the balance is first withdrawn to the store owner's account. Also, the store owner can remove his own store.
3. **Circuit Breaker**: I have implemented an emergency stop feature during which certain functions are restricted in both the UserRoles and Store smart contracts.
4. **Fail Early and Fail Loud**: Catching errors early using modifiers as well as through the require function allow checking that certain conditions are valid before running functions. 
5. **Withdrawal from Contracts**: Store Owners can withdraw the funds stored on their Store smart contracts.
6. **State Machine**: I have added a 'paused' state in UserRoles smart contract to enable an emergency stop. Store smart contract checks the 'paused' state before some functions are allowed to proceed.


