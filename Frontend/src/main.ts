import { createApp } from 'vue'
import { createPinia } from 'pinia'
import SolanaWallets from "solana-wallets-vue";

// You can either import the default styles or create your own.
import "solana-wallets-vue/styles.css";
import constants from "@/constants";
import {
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";

const walletOptions = {
  wallets: [
    new PhantomWalletAdapter(),
    new SlopeWalletAdapter(),
    new SolflareWalletAdapter({ network: constants.SOLANA_ENV }),
    new TorusWalletAdapter(),
    new SolletWalletAdapter({ network: constants.SOLANA_ENV }),
    new SolletExtensionWalletAdapter({ network: constants.SOLANA_ENV }),
  ],
  autoConnect: true,
};

import App from './App.vue'
import router from './router'

import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(SolanaWallets, walletOptions)
app.mount('#app')
