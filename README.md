## Prerequisite (can use make command to setup)

- Install nvm
- Install node (v16 recommended)
- Install the latest Rust stable from https://rustup.rs/
- Install Solana v1.7.11 or later from https://docs.solana.com/cli/install-solana-cli-tools
- Install anchor

## Quick Start

- Build Rust
- Set Environment
- Run Client

## devnet Installation

```bash
yarn install
yarn build
yarn deploy
```

## devnet testing

Test swap 1 SOL to 0.1 Token

```bash
yarn start 1
```

Result:
```
Connection to cluster established: https://api.devnet.solana.com  Version:  { 'feature-set': 4011803773, 'solana-core': '1.13.3' }
Current balance is 7.78712888
Using payer DAgNVqxxh6PWT4jgkck5ouEHNHhm5wfNo4aJxRsHbAAj
Using mint 4ShB7DkrDndSa4XPvN29xFJC93iZhuqPyzdXAg556cHW
Using payerAta GxvzhwirxtQKJVumgYgtYZuVgc18ZtzXL18mhRoT7mJ7
Mint 1000 tokens to payerAta GxvzhwirxtQKJVumgYgtYZuVgc18ZtzXL18mhRoT7mJ7
Using program 6ntHGx3KUp7mJAvwfXvzfVDRNTM5CQgQtp54srW3jL4m
Using pool EkuVzNfRwCqJ2wgkhFPeKoXqQpWdoUdHw4a7TyTGXBee
Using poolAta 2EMUYjWgAAa4ecaTCHN1H3xP5W6X28GePfwRhHatvmkS
Mint 1000 tokens to poolAta 2EMUYjWgAAa4ecaTCHN1H3xP5W6X28GePfwRhHatvmkS
Finish initialize, more info:
https://solscan.io/tx/4wHMqB7JZzmvbvWbAHLWonMP5xzrgdoCHqrFcH5PoD7Z5e6Ge96Qkb8rytJHeCepRVDnymsSaXYDBsKSGPZHN6zU?cluster=devnet
Current balance is 0.00155904
Airdropping 1 SOL...
Current balance after airdrop:  1.00155904
Finish swap Sol to Token, more info:
https://solscan.io/tx/nCxi4sXXE6kLWG5dFKmDg5F6efbjdRxv58ucDUF2cbDDHTphqF62qgjPXxzG7hj7o7y9z4tbzCMzUubZ6vZZwY8?cluster=devnet
Success
Done in 19.90s.
```


Test swap 1 Token to 0.1 SOL

```bash
yarn start 2
```

Result:
```
Connection to cluster established: https://api.devnet.solana.com  Version:  { 'feature-set': 4011803773, 'solana-core': '1.13.3' }
Current balance is 7.69426808
Using payer DAgNVqxxh6PWT4jgkck5ouEHNHhm5wfNo4aJxRsHbAAj
Using mint EuqrPNbXgEgetQ99HH1oFTuqgkM9PBMgjNeDkiAAHMLw
Using payerAta SvArvaD4QnCYxbu1QfyijaK76VTKaJ3pfocKthLVK6a
Mint 1000 tokens to payerAta SvArvaD4QnCYxbu1QfyijaK76VTKaJ3pfocKthLVK6a
Using program 6ntHGx3KUp7mJAvwfXvzfVDRNTM5CQgQtp54srW3jL4m
Using pool 6XwiSUazjRXK7m74SXqmLoYz9cZmkbGkP6WrpPkdk5f6
Using poolAta 27Qmhjwzz4bCTwZHYeaPH7RuJ56ntJgY1p1HsB4vip8s
Mint 1000 tokens to poolAta 27Qmhjwzz4bCTwZHYeaPH7RuJ56ntJgY1p1HsB4vip8s
Finish initialize, more info:
https://solscan.io/tx/58f5aJvZc4jFHCGUofhnsHZefYEKNuZrXL5pcj24UQTSFfnadihM6quPms42wX45hyzr3J1wnA9AKXcnnEVSLfqF?cluster=devnet
Current balance is 0.00155904
Airdropping 1 SOL...
Current balance after airdrop:  1.00155904
Finish swap Token to SOL, more info:
https://solscan.io/tx/4mLCT5WtDJzM7TSFXmAfo1hmHBLMmQcuRsDEsmXmiL2MwL6zQtRtmo5VvK6WtmEh7PCUuzjSbYCThLGn7Nc6zNSN?cluster=devnet
Success
Done in 17.38s.
```


## Issues
- Contract copy trên mạng, cấu trúc code đang không phù hợp với anchor nên không generate được IDL file, tương ứng với việc không chạy được `anchor test`
- Chưa làm hoàn chỉnh giao diện

![image](https://raw.githubusercontent.com/haclongkim/solana-swaptoken-sample/master/Screenshot_15.png)