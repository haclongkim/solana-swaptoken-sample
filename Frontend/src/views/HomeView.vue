<script>
  import { computed, ref, watchEffect } from "vue";
  import { useLocalStorage } from "@vueuse/core";
  import { clusterApiUrl, Connection, Keypair, PublicKey, SystemProgram, TransactionInstruction, sendAndConfirmTransaction } from "@solana/web3.js";
  import { AnchorProvider, Program, fetchIdl } from "@project-serum/anchor";
  import { useAnchorWallet, useWallet, WalletMultiButton } from "solana-wallets-vue";
  import constants from "@/constants";
  import idl from "../assets/idl.json";

  const programID = new PublicKey(constants.SMARTCONTRACT);
  const preflightCommitment = "processed";

  export default {
    components: {
      WalletMultiButton
    },
    setup() {
      const dark = ref(true);
      const wallet = useAnchorWallet();
      const connection = new Connection(
        clusterApiUrl("devnet"),
        preflightCommitment
      );
      const provider = computed(() => {
        if (!wallet.value) return;
        return new AnchorProvider(connection, wallet.value, {
          preflightCommitment
        });
      });
      const program = computed(() => {
        if (!provider.value) return;
        return new Program(idl, programID, provider.value);
      });

      return {
        connection,
        program,
        provider,
        dark,
        counterPublicKey: constants.SMARTCONTRACT,
      };
    },

    data() {
      return {
        selected: "SOL",
        amount: 0,
        rate: 10,
        token_result: "MOVE"
      };
    },
    methods: {
      async onClick() {
        console.log(this.selected)
        console.log(`Using program ${programID.toBase58()}`);
        const programInfo = await this.connection.getAccountInfo(programID);
      },
      async swapSolToToken() {
        const instructionData = Buffer.from(
          Uint8Array.of(
            1,
            ...new BN(this.rate * this.amount).toArray("le", 8)
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
              pubkey: vault,
              isSigner: false,
              isWritable: true,
            },
            {
              pubkey: vaultAta.address,
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
          `Finish swap Sol to Token, more info:  \nhttps://solscan.io/tx/${swapSig}`
        );
      },
      async airdropSOL() {
        const wallet = useAnchorWallet();

        const { publicKey, sendTransaction } = useWallet();
        const version = await this.connection.getVersion();
        console.log("Connection to cluster established:", version);
        console.log(this.program, this.provider, this.connection)
        if (!publicKey.value) return;
        const signature = await this.connection.requestAirdrop(publicKey.value, 1000000000);

        const tx = await this.connection.confirmTransaction(signature, "processed");
      },
      onChange() {
        if (this.selected === "SOL") {
          this.rate = 10;
          this.token_result = "MOVE";
        } else {
          this.rate = 0.1;
          this.token_result = "SOL";
        }
      }
    }
  };
</script>

<template>
    <div class="h-screen w-screen flex" :class="dark ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-700'">
        <!-- Top-Right Corner. -->
        <div class="absolute top-0 right-0 p-8 flex space-x-8">            <!-- Dark Button. -->
            <button @click="dark = !dark" class="rounded-full p-3"
                    :class="          dark            ? 'bg-white/10 hover:bg-white/20 text-gray-200'            : 'bg-black/10 hover:bg-black/20 text-gray-600'        ">
                <svg v-if="dark" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                </svg>
            </button>            <!-- Solana Wallets Vue. -->
            <wallet-multi-button :dark="dark"></wallet-multi-button>
        </div>        <!-- Centered. -->
        <div class="m-auto w-full max-w-md p-1">
            <div class="shadow-xl rounded-xl" :class="dark ? 'bg-gray-700' : 'bg-white'">
                <div class="p-8 text-center">
                    <div>
                        <button  class="flex-1 py-4 px-2 rounded-bl-xl" :class="dark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'" @click="airdropSOL">Airdrop 1 SOL</button>
                    </div>
                    <p :class="dark ? 'text-white' : 'text-gray-900'">Swap {{selected}} to {{token_result}}</p>
                    <br>
                    <input type="text" v-model="amount" :class="dark ? 'text-gray-900' : 'text-gray-900'">
                    <select v-model="selected" @change="onChange" :class="dark ? 'text-gray-900' : 'text-gray-900'">
                        <option value="SOL">SOL</option>
                        <option value="MOVE">MOVE</option>
                    </select>
                    <span :class="dark ? 'text-white' : 'text-gray-900'"> = {{amount * rate}} {{token_result}}</span>
                    <div>
                        <button  class="flex-1 py-4 px-2 rounded-bl-xl" :class="dark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'" @click="onClick">SWAP</button>
                    </div>
                </div>
            </div>
            <div class="text-sm mt-8"><p class="text-xs font-semibold text-gray-400">Wallet address:</p>
                <p>{{ $wallet.publicKey.value?.toBase58() ?? "Not connected" }}</p>
                <p class="text-xs font-semibold text-gray-400 mt-4">Program address:</p>
                <p>{{ counterPublicKey ?? "Not created" }}</p></div>
        </div>
    </div>
</template>
