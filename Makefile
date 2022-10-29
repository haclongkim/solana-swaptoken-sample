nvm:
	curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
	. ~/.profile
	nvm install 16.14.0
libssl:
	wget http://nz2.archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2.16_amd64.deb
	sudo dpkg -i libssl1.1_1.1.1f-1ubuntu2.16_amd64.deb
lib-ubuntu:
	sudo apt update
	sudo apt install build-essential
	sudo apt-get install libudev-dev libusb-1.0
	sudo apt install llvm clang
rust:
	curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
	. ~/.profile
solana:
	sh -c "$$(curl -sSfL https://release.solana.com/v1.14.6/install)"
spl-token:
	npm install @solana/spl-token
use-devnet:
	solana config set --url https://api.devnet.solana.com
use-mainnet:
	solana config set --url https://api.mainnet-beta.solana.com
gen-wallet:
	solana-keygen new --outfile ~/my-solana-wallet/my_wallet.json
	solana-keygen pubkey ~/my-solana-wallet/my_wallet.json
	solana config set --keypair ~/my-solana-wallet/my_wallet.json
	solana airdrop 1
create-token:
	spl-token create-token --decimals 10
build-contract:
	cd contract && cargo build && cargo build-bpf --manifest-path=./Cargo.toml --bpf-out-dir=dist/contract
test-contract:
	cargo test-bpf --manifest-path=./contract/Cargo.toml
deploy-contract:
	solana program deploy contract/dist/contract/solana_swaptoken_sample.so
test:
	. ~/.profile
	