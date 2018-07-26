require('dotenv').config();
// var bip39 = require('bip39')
// var hdkey = require('ethereumjs-wallet/hdkey')
var ethereumwallet = require('ethereumjs-wallet');
var ProviderEngine = require('web3-provider-engine');
var WalletSubprovider = require('web3-provider-engine/subproviders/wallet.js');
var Web3Subprovider = require('web3-provider-engine/subproviders/web3.js');
var Web3 = require('web3');
const FilterSubprovider = require('web3-provider-engine/subproviders/filters.js');

// https://github.com/zmitton/eth-proof/issues/2#issuecomment-378240556
Web3.providers.HttpProvider.prototype.sendAsync =
  Web3.providers.HttpProvider.prototype.send;

// Get our mnemonic and create an hdwallet
// var mnemonic = 'piano file obey immense polar rack great subject clutch camera maid ostrich'
// var hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic))
var wallet = ethereumwallet.fromPrivateKey(
  new Buffer(`${process.env.WALLET_PRIVATE_KEY}`, 'hex')
);

// Get the first account using the standard hd path.
// var wallet_hdpath = "m/44'/60'/0'/0/"
// var wallet = hdwallet.derivePath(wallet_hdpath + '0').getWallet()
var address = '0x' + wallet.getAddress().toString('hex');

var providerUrl = `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`;
var engine = new ProviderEngine();
// filters
engine.addProvider(new FilterSubprovider());

engine.addProvider(new WalletSubprovider(wallet, {}));
engine.addProvider(
  new Web3Subprovider(new Web3.providers.HttpProvider(providerUrl))
);
engine.start(); // Required by the provider engine.

module.exports = {
  networks: {
    rinkeby: {
      network_id: 4,
      provider: engine,
      from: address,
      gas: 4444444
    },
    development: {
      network_id: 5777,
      provider: () => {
        const ganache = require('ganache-cli');
        return new Web3(ganache.provider())._provider;
      },
      from: address,
      gas: 4444444
    }
  }
};
