require('dotenv').config();

const HDWalletProvider = require('truffle-hdwallet-provider-privkey');
const Web3 = require('web3');
const compiledFactory = require('./build/TaskFactory.json');

const provider = new HDWalletProvider(
  process.env.WALLET_PRIVATE_KEY,
  `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  const result = await new web3.eth.Contract(
    JSON.parse(compiledFactory.interface)
  )
    .deploy({
      data: '0x' + compiledFactory.bytecode,
      arguments: [process.env.CONTRACT_OWNER, process.env.CONTRACT_OWNER]
    })
    .send({ from: accounts[0], gas: 1000000 });

  console.log('Contract deployed to', result.options.address);
};

deploy();
