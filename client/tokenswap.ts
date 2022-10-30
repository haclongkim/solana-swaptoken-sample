import {
  Keypair,
  Connection,
  PublicKey,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
  SystemProgram,
} from "@solana/web3.js";
import {
  Account,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import fs from "mz/fs";
import path from "path";

import { getPayer, getRpcUrl, createKeypairFromFile } from "./utils";
import { BN } from "bn.js";

let connection: Connection;
let mint: PublicKey;
let payer: Keypair;
let payerAta: Account;
let programId: PublicKey;
let pool: PublicKey;
let poolAta: Account;
const DECIMALS = 9;
const SOL_AMOUNT_TO_SWAP = 0.1;
const PROGRAM_PATH = path.resolve(__dirname, "../target/deploy");
const PROGRAM_SO_PATH = path.join(PROGRAM_PATH, "solana_swaptoken_sample.so");
const PROGRAM_KEYPAIR_PATH = path.join(PROGRAM_PATH, "solana_swaptoken_sample-keypair.json");

export async function establishConnection(): Promise<void> {
  const rpcUrl = await getRpcUrl();
  connection = new Connection(rpcUrl, "confirmed");
  const version = await connection.getVersion();
  console.log("Connection to cluster established:", rpcUrl, " Version: ", version);
}

export async function establishPayer(): Promise<void> {
  if (!payer) {
    payer = await getPayer();
  }

  await airdropSolIfNeeded(payer.publicKey);
  console.log("Using payer", payer.publicKey.toBase58());
}

export async function airdropSolIfNeeded(benificier: PublicKey) {
  const balance = await connection.getBalance(benificier);
  console.log("Current balance is", balance / LAMPORTS_PER_SOL);
  if (balance < LAMPORTS_PER_SOL) {
    console.log("Airdropping 1 SOL...");
    const sig = await connection.requestAirdrop(benificier, LAMPORTS_PER_SOL);
    await connection.confirmTransaction(sig);
    console.log(
      "Current balance after airdrop: ",
      (await connection.getBalance(benificier)) / LAMPORTS_PER_SOL
    );
  }
}

export async function establishMint(): Promise<void> {
  mint = await createMint(
    connection,
    payer,
    payer.publicKey,
    payer.publicKey,
    DECIMALS
  );
  console.log(`Using mint ${mint.toBase58()}`);
}

export async function establishPayerAta(): Promise<void> {
  payerAta = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );
  console.log(`Using payerAta ${payerAta.address.toBase58()}`);
}

export async function mintToPayerAta(): Promise<void> {
  await mintTo(
    connection,
    payer,
    mint,
    payerAta.address,
    payer,
    1000 * LAMPORTS_PER_SOL
  );
  console.log(`Mint 1000 tokens to payerAta ${payerAta.address.toBase58()}`);
}

export async function checkProgramHashBeenDeployed(): Promise<void> {
  // Read program id from keypair file
  try {
    const programKeypair = await createKeypairFromFile(PROGRAM_KEYPAIR_PATH);
    programId = programKeypair.publicKey;
  } catch (err) {
    const errMsg = (err as Error).message;
    throw new Error(
      `Failed to read program keypair at '${PROGRAM_KEYPAIR_PATH}' due to error: ${errMsg}. Program may need to be deployed with \`solana program deploy dist/program/tokenswap.so\``
    );
  }

  // Check if the program has been deployed
  const programInfo = await connection.getAccountInfo(programId);
  if (programInfo === null) {
    if (fs.existsSync(PROGRAM_SO_PATH)) {
      throw new Error(
        "Program needs to be deployed with `solana program deploy dist/program/tokenswap.so`"
      );
    } else {
      throw new Error("Program needs to be built and deployed");
    }
  } else if (!programInfo.executable) {
    throw new Error(`Program is not executable`);
  }

  console.log(`Using program ${programId.toBase58()}`);
}

export async function establishVault(): Promise<void> {
  const [poolAddress] = await PublicKey.findProgramAddress(
    [Buffer.from("pool"), mint.toBuffer()],
    programId
  );
  pool = poolAddress;
  console.log(`Using pool ${pool.toBase58()}`);
}

export async function establishVaultAta(): Promise<void> {
  poolAta = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    pool,
    true
  );
  console.log(`Using poolAta ${poolAta.address.toBase58()}`);
}

export async function mintToVaultAta(): Promise<void> {
  await mintTo(
    connection,
    payer,
    mint,
    poolAta.address,
    payer,
    1000 * LAMPORTS_PER_SOL
  );
  console.log(`Mint 1000 tokens to poolAta ${poolAta.address.toBase58()}`);
}

export async function initialize(): Promise<void> {
  const instructionData = Buffer.from(Uint8Array.of(0));
  const instruction = new TransactionInstruction({
    keys: [
      {
        pubkey: payer.publicKey,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: pool,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: mint,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    programId,
    data: instructionData,
  });

  const txSig = await sendAndConfirmTransaction(
    connection,
    new Transaction().add(instruction),
    [payer]
  );
  console.log(
    `Finish initialize, more info: \nhttps://solscan.io/tx/${txSig}?cluster=devnet`
  );

  await airdropSolIfNeeded(pool); //airdrop after create pool on-chain
}

export async function swapSolToToken(): Promise<void> {
  const instructionData = Buffer.from(
    Uint8Array.of(
      1,
      ...new BN(SOL_AMOUNT_TO_SWAP * LAMPORTS_PER_SOL).toArray("le", 8)
    )
  );

  const instruction = new TransactionInstruction({
    keys: [
      {
        pubkey: payer.publicKey,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: payerAta.address,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: programId,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: mint,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: pool,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: poolAta.address,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    programId,
    data: instructionData,
  });

  const swapSig = await sendAndConfirmTransaction(
    connection,
    new Transaction().add(instruction),
    [payer]
  );
  console.log(
    `Finish swap Sol to Token, more info:  \nhttps://solscan.io/tx/${swapSig}?cluster=devnet`
  );
}

export async function swapTokenToSol(): Promise<void> {
  const instructionData = Buffer.from(
    Uint8Array.of(
      2,
      ...new BN(SOL_AMOUNT_TO_SWAP * 10 * LAMPORTS_PER_SOL).toArray("le", 8)
    )
  );

  const instruction = new TransactionInstruction({
    keys: [
      {
        pubkey: payer.publicKey,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: payerAta.address,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: programId,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: mint,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: pool,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: poolAta.address,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
    ],
    programId,
    data: instructionData,
  });
  const swapSig = await sendAndConfirmTransaction(
    connection,
    new Transaction().add(instruction),
    [payer]
  );
  console.log(
    `Finish swap Token to SOL, more info: \nhttps://solscan.io/tx/${swapSig}?cluster=devnet`
  );
}
