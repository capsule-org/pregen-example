# Capsule Pregenerated Wallet Integration Example

This repository provides an example of integrating Capsule's Pregenerated Wallets (Pregen Wallets) into your application. Pregenerated Wallets allow partners to create wallets on behalf of users using their email addresses. This example demonstrates how to set up the development environment, create pregen wallets, manage user shares, and handle signing of messages and transactions. It also covers the process for users to claim their pregenerated wallets through the Capsule signup flow or manually.

## Getting Started

1. Ensure you have Yarn installed globally. If not, you can install it by running:

   ```bash
   npm install -g yarn
   ```

   or

   ```bash
   corepack enable
   ```

2. Install the dependencies:

   ```bash
   yarn
   ```

3. Add a `.env` or `.env.local` file with the following content:

   ```
   NEXT_PUBLIC_CAPSULE_API_KEY=<your_beta_access_key>
   ```

4. Run the development server:

   ```bash
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

**Note:** This repository specifies Yarn Classic (v1.22.19) in the `package.json` to ensure compatibility. The version file `1.22.19.cjs` is included in the `.yarn/releases` directory, ensuring that the correct Yarn version is used when you install dependencies.

## How Pregen Works

Pregenerated Wallets, or "pregen" wallets, are wallets created by a partner on behalf of a user. They can be created using the user's email, which can then be used to claim the wallets.

### General Integration

- Create a pregen wallet on behalf of a user using their email:

  ```typescript
  await capsule.createWalletPreGen(userEmail);
  ```

- Capsule will create a wallet using your `partnerId` and associate it with `userEmail`.

- You can also set and get the user's share:

  ```typescript
  await capsule.setUserShare(base64Wallet);
  await capsule.getUserShare();
  ```

- You can sign messages and transactions as usual. Capsule will determine if the wallet is a pregen wallet or a regular user wallet:

  ```typescript
  await capsule.signMessage(walletId, messageBase64);
  await capsule.signTransaction(walletId, rlpEncodedTxBase64, chainId);
  ```

- When users with a pregenerated wallet go through the Capsule signup flow using the associated email, their wallet is automatically claimed instead of creating a new wallet.

- Alternatively, pregen wallets can be manually claimed using:

  ```typescript
  await capsule.claimPregenWallet(claimPregenEmail);
  ```
