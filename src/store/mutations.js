import { MUTATION_TYPES } from '../util/constants';

function resetUser(state, web3Status = {}) {
  const user = {
    balance: '0.00',
    coinbase: '',
    email: '',
    firstName: '',
    gravatar: '',
    hasCoinbase: false,
    hasWeb3InjectedBrowser: false,
    isConnectedToApprovedNetwork: false,
    isLoggedIn: false,
    lastName: '',
  };

  const userCopy = state.user;
  Object.assign(userCopy, user, web3Status);
  state.user = userCopy;
}

function getHash(stringValue) {
  let hash = 0;
  let characterCode;

  if (stringValue) {
    if (stringValue.length === 0) return hash;

    for (let i = 0; i < stringValue.length; i++) {
      characterCode = stringValue.charCodeAt(i);
      hash = (hash << 5) - hash + characterCode;
      hash |= 0; // Convert to 32-bit integer
    }
  }

  return hash;
}

function assignPropertyTo(hashObject, key, value) {
  Object.assign(hashObject, {
    [key]: value,
  });
}

function getUserBalance(state, userCopy) {
  return new Promise(function(resolve, reject) {
    state.web3.instance().eth.getBalance(state.user.coinbase, (err, res) => {
      if (!err) {
        resolve(state.web3.instance().fromWei(res.toNumber()));
      } else {
        console.error(err);
      }
    });
  });
}

export default {
  [MUTATION_TYPES.REGISTER_WEB3_INSTANCE](state, payload) {
    const result = payload.result;

    const web3Copy = state.web3;
    web3Copy.instance = () => result.web3;
    web3Copy.address = result.address
      ? result.address.toString()
      : web3Copy.address;
    web3Copy.coinbase = result.coinbase
      ? result.coinbase.toString()
      : web3Copy.coinbase;
    web3Copy.networkId = result.networkId
      ? result.networkId.toString()
      : web3Copy.networkId;
    web3Copy.error = result.web3Error ? result.web3Error : web3Copy.error;
    web3Copy.isInjected = result.hasInjectedWeb3
      ? result.hasInjectedWeb3
      : web3Copy.isInjected;

    state.web3 = web3Copy;

    if (payload.callback) payload.callback(state);
  },
  [MUTATION_TYPES.UPDATE_WEB3_PROPERTIES](state, payload) {
    for (var i = payload.properties.length - 1; i >= 0; i--) {
      state.web3[payload.properties[i]] = payload.values[i];
      if (state.user[payload.properties[i]])
        state.user[payload.properties[i]] = payload.values[i];
    }
  },
};
