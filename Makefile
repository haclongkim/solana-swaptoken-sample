nvm:
	curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
	. ~/.profile
	nvm install 16.14.0
rust:
	curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
	. ~/.profile
solana:
	sh -c "$$(curl -sSfL https://release.solana.com/v1.14.6/install)"
test:
	. ~/.profile
	