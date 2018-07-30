# go-fucking-crypto-do-it

Also known as (a.k.a.) `cryptotasks`. Heavily inspired by [gofuckingdoit](https://gofuckingdoit.com); this is a noble attempt to replicate the same service in Ethereum's blockchain using smart contracts and VueJS.  

The project is developed using [truffle](https://truffleframework.com/) and [VueJS](https://vuejs.org/). 

## Truffle Setup

Rename `.env.example` to `.env` and set the values needed.

> The wallet provider requires the private key in order to create the wallet. If you want to get a wallet from a mnemonic phrase you can change this behavior from the `truffle.js` file.

> Currently, the project works in Rinkeby network via the [Infura API](https://infura.io/), for test purposes. This will change later to use the mainnet.

> The development network runs on ganache-cli. Make sure to install `ganache-cli` package globally before running the tests.

``` bash
# install dependencies
npm install

# (sudo) npm i -g ganache-cli
ganache-cli

# test contract's behavior
truffle test

# compile contracts
truffle compile

# migrate contracts to rinkeby network
truffle migrate --network rinkeby
```

## Build Setup

``` bash
# serve with hot reload at localhost:8080 (or 192.168.10.10:8080 if your development environment runs on vagrant)
# check composer.json `dev` script to change it according to your setup
npm run dev

# build for production with minification
npm run build
```

## Documentation

All contracts are well documented according to [ENSF](https://github.com/ethereum/wiki/wiki/Ethereum-Natural-Specification-Format). Contract `TaskCore.sol` contains details for the inherited contracts as well.