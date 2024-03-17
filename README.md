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

### As a partner
- make sure you have your partner api key
- use `await capsule.createWalletPreGen(partnerId, pregenEmail);` in your pregen flow
- there is now a wallet associated with your `partnerId` and with the email
- provide a user registration flow in which the user share of the wallet is available in the context. 
- After the user is logged in, incorporate `await capsule.claimPregenWallet(claimPregenEmail);` into your user flow
- the user now has control of the pregen wallet 