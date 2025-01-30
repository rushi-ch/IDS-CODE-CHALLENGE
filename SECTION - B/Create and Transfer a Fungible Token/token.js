require("dotenv").config();
const {
    Client,
    AccountId,
    PrivateKey,
    TokenCreateTransaction,
    TokenMintTransaction,
    TokenAssociateTransaction,
    TransferTransaction,
    TokenType,
    TokenSupplyType,
    Hbar
} = require("@hashgraph/sdk");

// Load credentials from environment variables
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
const userId = AccountId.fromString(process.env.USER_ID);
const userKey = PrivateKey.fromString(process.env.USER_KEY);

// Initialize Hedera client
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

// Function to create a fungible token
async function createToken() {
    try {
        console.log("Creating token...");
        const tx = new TokenCreateTransaction()
            .setTokenName("MyToken")
            .setTokenSymbol("MTK")
            .setTokenType(TokenType.FungibleCommon)
            .setTreasuryAccountId(operatorId)
            .setInitialSupply(1000)
            .setDecimals(0)
            .setSupplyType(TokenSupplyType.Infinite)
            .setAdminKey(operatorKey)
            .setSupplyKey(operatorKey)
            .freezeWith(client);

        const signedTx = await tx.sign(operatorKey);
        const response = await signedTx.execute(client);
        const receipt = await response.getReceipt(client);
        const tokenId = receipt.tokenId;

        console.log(`Token Created: ${tokenId}`);
        return tokenId;
    } catch (error) {
        console.error("Error creating token:", error);
    }
}

// Function to associate an account with a token
async function associateToken(accountId, accountKey, tokenId) {
    try {
        console.log(`Associating account ${accountId} with token ${tokenId}...`);
        const tx = new TokenAssociateTransaction()
            .setAccountId(accountId)
            .setTokenIds([tokenId])
            .freezeWith(client);

        const signedTx = await tx.sign(accountKey);
        const response = await signedTx.execute(client);
        await response.getReceipt(client);

        console.log(`Account ${accountId} successfully associated with token ${tokenId}`);
    } catch (error) {
        console.error("Error associating token:", error);
    }
}

// Function to transfer tokens
async function transferToken(tokenId, senderId, senderKey, recipientId, amount) {
    try {
        console.log(`Transferring ${amount} tokens from ${senderId} to ${recipientId}...`);
        const tx = new TransferTransaction()
            .addTokenTransfer(tokenId, senderId, -amount)
            .addTokenTransfer(tokenId, recipientId, amount)
            .freezeWith(client);

        const signedTx = await tx.sign(senderKey);
        const response = await signedTx.execute(client);
        await response.getReceipt(client);

        console.log(`Transfer Successful: ${amount} tokens from ${senderId} to ${recipientId}`);
    } catch (error) {
        console.error("Error transferring tokens:", error);
    }
}

// Function to mint additional tokens
async function mintTokens(tokenId, amount) {
    try {
        console.log(`Minting ${amount} additional tokens for ${tokenId}...`);
        const tx = new TokenMintTransaction()
            .setTokenId(tokenId)
            .setAmount(amount)
            .freezeWith(client);

        const signedTx = await tx.sign(operatorKey);
        const response = await signedTx.execute(client);
        await response.getReceipt(client);

        console.log(`Successfully Minted ${amount} additional tokens.`);
    } catch (error) {
        console.error("Error minting tokens:", error);
    }
}

// Execute token operations
(async () => {
    try {
        console.log("Starting Hedera Token Operations...");

        const tokenId = await createToken();
        if (!tokenId) throw new Error("Token creation failed.");

        await associateToken(userId, userKey, tokenId);
        await transferToken(tokenId, operatorId, operatorKey, userId, 50);
        await mintTokens(tokenId, 500);
    } catch (error) {
        console.error("Process Error:", error);
    }
})();
