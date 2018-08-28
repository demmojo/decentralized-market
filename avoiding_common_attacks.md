# Avoiding Common Attacks

I have set out to avoid a number common attacks as well as practiced some general safe guidelines:

1. Reentrancy: I have used `transfer()` function instead of `call.value()` to prevent issues with reentrancy. Also, I have made sure to call `transfer` after all the internal work has been completed.
2. Restricted user functions: Only the market owner is allowed to remove other administrators. Furthermore, only the owner has the ability to emergency stop the market.
3. Pull over push: The store balance has to be withdrawn by the store owner. This also reduces issues with gas limit and the frequency of external calls. 
4. Marking visibility of state variables and functions explicitly: This facilitates error catching of false assumptions on who can access a variable or call a function.
5. Limiting external calls: I have used only one external call from the UserRoles smart contract to the Store smart contract. I have also limited the usage of the Ownable smart contract by OpenZepplin and built some of my own modifiers.


