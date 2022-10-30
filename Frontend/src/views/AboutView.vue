<script setup lang="ts">
  import { WalletMultiButton } from "solana-wallets-vue";
</script>

<template>
  <main id="home">
    <wallet-multi-button></wallet-multi-button>

    <div>
      <button @click="airdropSOL">Airdrop 1 SOL</button>
    </div>
    <div>Selected: {{ selected }}</div>

    <select v-model="selected" @change="onChange">
      <option disabled value="">Please select one</option>
      <option>SOL</option>
      <option>MOVE</option>
    </select>
    <input type="text" v-model="amount">
    <span> = {{amount * rate}} {{token_result}}</span>
    <div>
      <button @click="onClick">SWAP</button>
    </div>
  </main>
</template>
<script lang="ts">
  import constants from "@/constants";
  import { computed } from "vue";
  import { useWallet, useAnchorWallet } from "solana-wallets-vue";
  import { PublicKey, clusterApiUrl, Connection, Keypair, SystemProgram, Transaction } from "@solana/web3.js";
  const programID = new PublicKey(constants.SMARTCONTRACT);
  const preflightCommitment = "processed";

  export default {
    data() {
      const wallet = useAnchorWallet();
      const connection = new Connection(
              clusterApiUrl(constants.SOLANA_ENV),
              preflightCommitment
      );
      // const provider = computed(() => {
      //   if (!wallet.value) return;
      //   return new AnchorProvider(connection, wallet.value, {
      //     preflightCommitment,
      //   });
      // });
      // const program = computed(() => {
      //   if (!provider.value) return;
      //   return new Program(idl, programID, provider.value);
      // });
      return {
        // program,
        // provider,
        connection,
        selected: "SOL",
        amount: 0,
        rate: 10,
        token_result: "MOVE"
      };
    },
    methods: {
      async onClick() {
        console.log(this.selected)
      },
      async airdropSOL() {
        const connection = new Connection(clusterApiUrl(constants.SOLANA_ENV));
        const { wallet, publicKey, sendTransaction } = useWallet();
        const version = await connection.getVersion();
        console.log("Connection to cluster established:", version);
        console.log(this.program, this.provider, this.connection)
        if (!publicKey.value) return;
        const signature = await connection.requestAirdrop(publicKey, 1);

        console.log(await connection.confirmTransaction(signature, "processed"));
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