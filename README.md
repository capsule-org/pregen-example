# Pregen Wallet Example

## Getting Started

Install the dependencies:

```bash
yarn
```

Run the development server:
```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How Pregen Works

Pregenerated Wallets or pregen, are wallets that are created by a partner on behalf of a user. They can be created with an email which then can be used to claim them.

### General Integration

- create a pregen wallet on behalf of a user using an email the user controls

```typescript
 await capsule.createWalletPreGen(userEmail);
```

- Capsule will create a wallet using your `partnerId` and associate to `userEmail`
- You can also set and get the user share

```typescript
 await capsule.setUserShare(base64Wallet)
 await capsule.getUserShare()
```

- You can also sign messages and transactions as usual, Capsule will know if it is for a pregen wallet or a regular user wallet:

```typescript
await capsule.signMessage(walletId, messageBase64)
await capsule.signTransaction(walletId, rlpEncodedTxBase64, chainId)
```

- When users with a pregenerated wallet go through the capsule signup flow using the associated email, their wallet is automatically claimed instead of creating a new wallet.

Alternatively, pregen wallets can be "manually" claimed using:

```typescript
await capsule.claimPregenWallet(claimPregenEmail)
```