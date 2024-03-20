'use client';

import type Capsule from '@usecapsule/web-sdk';
import { CapsuleEthersSigner } from '@usecapsule/ethers-v6-integration';
import { useEffect, useState } from 'react';

export default function Home() {
  const [capsule, setCapsule] = useState<Capsule>();
  const [email, setEmail] = useState<string>('');
  const [signature, setSignature] = useState<string>();
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [passkeyCreationUrl, setPasskeyCreationUrl] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string | undefined>('');
  const [recoverySecret, setRecoverySecret] = useState<string>('');
  const [passkeyLoginUrl, setPasskeyLoginUrl] = useState<string>('');
  const [userIsLoggedIn, setUserIsLoggedIn] = useState<boolean>(false);
  const [messageToSign, setMessageToSign] = useState<string>('');

  const CAPSULE_API_KEY = process.env.NEXT_PUBLIC_CAPSULE_API_KEY;
  if (!CAPSULE_API_KEY) {
    throw new Error('NEXT_PUBLIC_CAPSULE_API_KEY is undefined');
  }

  async function loadCapsule() {
    if (!capsule) {
      const CapsuleModule = await import('@usecapsule/web-sdk');
      const loadedInstance = new CapsuleModule.default(
        CapsuleModule.Environment.DEVELOPMENT,
        CAPSULE_API_KEY
      );
      setCapsule(loadedInstance);
    }
  }

  useEffect(() => {
    loadCapsule();
  });

  const checkIfLoggedIn = async (): Promise<void> => {
    if (!capsule) {
      throw new Error('Capsule not instantiated');
    }
    const loggedIn = await capsule.isFullyLoggedIn();
    setUserIsLoggedIn(loggedIn);
  }

  // capsule.checkIfUserExists(email) can be used to determine if create or login should be
  // called for a given email address
  const createAccount = async (): Promise<void> => {
    if (!capsule) {
      throw new Error('Capsule not instantiated');
    }
    await capsule.createUser(email);
  }

  const createPregenWallet = async (): Promise<void> => {
    if (!capsule) {
      throw new Error('Capsule not instantiated');
    }
    await capsule.createWalletPreGen(email);
  }

  const claimPregenWallet = async (): Promise<void> => {
    if (!capsule) {
      throw new Error('Capsule not instantiated');
    }
    await capsule.claimPregenWallet(email);
  }

  const verifyEmail = async (): Promise<void> => {
    if (!capsule) {
      throw new Error('Capsule not instantiated');
    }
    const url = await capsule.verifyEmail(verificationCode);
    setPasskeyCreationUrl(url);
    window.open(url, 'popup', 'popup=true,width=400,height=500');

    const recoverySecret = await capsule.waitForPasskeyAndCreateWallet();
    setWalletAddress(Object.values(capsule.getWallets())[0].address);
    setRecoverySecret(recoverySecret);
  }

  const verifyEmailandClaim = async (): Promise<void> => {
    if (!capsule) {
      throw new Error('Capsule not instantiated');
    }
    const url = await capsule.verifyEmail(verificationCode);
    setPasskeyCreationUrl(url);
    window.open(url, 'popup', 'popup=true,width=400,height=500');

    const recoverySecret = await capsule.waitForPasskeyAndCreateWallet();
    setWalletAddress(Object.values(capsule.getWallets())[0].address);
    setRecoverySecret(recoverySecret);
  }

  const initiateLogin = async (): Promise<void> => {
    if (!capsule) {
      throw new Error('Capsule not instantiated');
    }
    const url = await capsule.initiateUserLogin(email);
    setPasskeyLoginUrl(url);
    window.open(url, 'popup', 'popup=true,width=400,height=500');

    await capsule.waitForLoginAndSetup();
    setWalletAddress(Object.values(capsule.getWallets())[0].address);
  }

  const signMessage = async (message: string) => {
    if (!capsule) {
      throw new Error('Capsule not instantiated');
    }
    const signer = new CapsuleEthersSigner(capsule);
    const signature = await signer.signMessage(message);
    setSignature(signature);
    setWalletAddress(Object.values(capsule.getWallets())[0].address);
  };

  const logout = async () => {
    if (!capsule) {
      throw new Error('Capsule not instantiated');
    }
    await capsule.logout();
  };

  return capsule ? 
    <main className="m-5 flex flex-col gap-4">
      <h1>Pregen</h1>
      <h2>To test this out, create a pregenerated wallet below, then verify that email and complete the passkey flow</h2>
      <h2>You can use SOME_EMAIL@test.usecapsule.com to bypass email verification if you'd like to try this many times.</h2>
      
      <input
        className="border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-5 pt-5 backdrop-blur-2xl dark:bg-zinc-800/30 dark:from-inherit lg:bg-gray-200 lg:p-4"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
      />
      <button
        className="m-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        onClick={createPregenWallet}
      >
        Create Pregen Wallet
      </button>
      <button
        className="m-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        onClick={checkIfLoggedIn}
      >
        Check if User Is Logged In
      </button>
      <p className="m-2">
        {userIsLoggedIn ? 'User is logged in' : 'User is not logged in'}
      </p>
      <input
        className="border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-5 pt-5 backdrop-blur-2xl dark:bg-zinc-800/30 dark:from-inherit lg:bg-gray-200 lg:p-4"
        name="verificationCode"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value)}
        placeholder="Enter the verification code"
      />
      <button
        className="m-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        onClick={verifyEmail}
      >
        Verify Email
      </button>
      {passkeyCreationUrl &&
        <p className="m-2">
          Passkey Creation URL: {passkeyCreationUrl}
        </p>
      }
      {recoverySecret &&
        <p className="m-2">
          Recovery Secret: {recoverySecret}
        </p>
      }
      {walletAddress &&
        <p className="m-2">
          Wallet Address: {walletAddress}
        </p>
      }
      <input
        className="border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-5 pt-5 backdrop-blur-2xl dark:bg-zinc-800/30 dark:from-inherit lg:bg-gray-200 lg:p-4"
        name="messageToSign"
        value={messageToSign}
        onChange={(e) => setMessageToSign(e.target.value)}
        placeholder="Message to sign"
      />
      <button
        className="m-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        onClick={() => signMessage(messageToSign)}
      >
        Sign Message
      </button>
      {signature &&
        <p className="m-2">
          Signature: {signature}
        </p>
      }
      <input
        className="border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-5 pt-5 backdrop-blur-2xl dark:bg-zinc-800/30 dark:from-inherit lg:bg-gray-200 lg:p-4"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
      />
      <button
        className="m-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        onClick={initiateLogin}
      >
        Initiate Login
      </button>
      {passkeyLoginUrl &&
        <p className="m-2">
          Passkey Login URL: {passkeyLoginUrl}
        </p>
      }
      {/* TODO: add conditional checks */}
      <button
        className="m-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        onClick={verifyEmailandClaim}
      >
        Claim Pregen Wallet
      </button>
      <button
        onClick={logout}
        className="m-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
      >
        Logout
      </button>
    </main> : <p className="text-lg">Loading...</p>;
  ;
}
