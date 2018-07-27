require('dotenv').config();
const HDWalletProvider = require('truffle-hdwallet-provider-privkey');
const ethereumwallet = require('ethereumjs-wallet');

const privateKey = `${process.env.WALLET_PRIVATE_KEY}`;
const wallet = ethereumwallet.fromPrivateKey(new Buffer(privateKey, 'hex'));
const address = '0x' + wallet.getAddress().toString('hex');

module.exports = {
  networks: {
    rinkeby: {
      network_id: 4,
      provider: () => {
        return new HDWalletProvider(
          privateKey,
          `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
        );
      },
      from: address,
      gas: 4500000,
      gasPrice: 10000000000,
    },
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
    },
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  mocha: {
    bail: true,
    useColors: true,
  },
};
