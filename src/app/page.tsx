'use client';

import type Capsule from '@usecapsule/web-sdk';
import { CapsuleEthersSigner } from '@usecapsule/ethers-v6-integration';
import { useEffect, useState } from 'react';

export default function Home() {
  const [capsule, setCapsule] = useState<Capsule>();
  const [email, setEmail] = useState<string>('');
  const [walletId, setWalletId] = useState<string>('');
  const [userShare, setUserShare] = useState<string>('');
  const [userCreated, setUserCreated] = useState<boolean>(false);
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
        CapsuleModule.Environment.BETA,
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
    setUserCreated(true)
  }

  const createPregenWallet = async (): Promise<void> => {
    if (!capsule) {
      throw new Error('Capsule not instantiated');
    }
    const [pregenWallet, recovery] = await capsule.createWalletPreGen(email);
    setWalletId(pregenWallet.id)
    const fetchedUserShare = await capsule.getUserShare()
    if (!!fetchedUserShare) {
      await capsule.setUserShare(fetchedUserShare)
      setUserShare(fetchedUserShare)
    }

  }

  const verifyEmailandClaim = async (): Promise<void> => {
    if (!capsule) {
      throw new Error('Capsule not instantiated');
    }
    const url = await capsule.verifyEmail(verificationCode);
    setPasskeyCreationUrl(url);
    window.open(url, 'popup', 'popup=true,width=400,height=500');

    // capsule.waitForPasskeyAndCreateWallet checks to see if there is a
    // pregenerated wallet for the current email.
    // if there is one, the wallet is claimed; otherwise a new wallet is created.
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
    const wallets=capsule.getWallets()
    const base64EncodedMessage = Buffer.from(JSON.stringify(message)).toString('base64')
    const signature = await capsule.signMessage(walletId, base64EncodedMessage);
    setSignature(signature.toString);
    setWalletAddress(wallets[walletId].address);
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
      <h2>You can use youremail+SOME_STRING@youremail.com to create many pregen wallets that can be claimed (which you need to have access to the email for).</h2>
      
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
      {userShare &&
        <p className="m-2">
          Pregen Succeeded! User Share: {userShare}
        </p>
      }
      <button
        className="m-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        onClick={createAccount}
      >
        Create Account after pregen
      </button>
      {userCreated &&
        <p className="m-2">
          Account Created! Check your email for a verificaton code
        </p>
      }
      <input
        className="border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-5 pt-5 backdrop-blur-2xl dark:bg-zinc-800/30 dark:from-inherit lg:bg-gray-200 lg:p-4"
        name="verificationCode"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value)}
        placeholder="Enter the verification code"
      />
      <button
        className="m-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        onClick={verifyEmailandClaim}
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
      <button
        onClick={logout}
        className="m-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
      >
        Logout
      </button>
    </main> : <p className="text-lg">Loading...</p>;
  ;
}
