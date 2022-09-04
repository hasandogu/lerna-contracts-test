/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * trufflesuite.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like @truffle/hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

//const Web3 = require('web3');
/*const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

console.log(web3);
*/
//const web3Provider = new Web3.providers.WebsocketProvider('http://localhost:7545');
//console.log(web3Provider);

//web3.setProvider(new Web3.providers.WebsocketProvider('http://localhost:8546'));


const fs = require('fs-extra');
const path = require('path');

const NODE_ENV = process.env.NODE_ENV || 'development';

console.log(NODE_ENV)

function setupEnvironment(dotenvPath) {

  // https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
  var dotenvFiles = [
    `${dotenvPath}.${NODE_ENV}.local`,
    `${dotenvPath}.${NODE_ENV}`,
    NODE_ENV !== 'test' && `${dotenvPath}.local`,
    dotenvPath,
  ].filter(Boolean);

    // Load environment variables from .env* files. Suppress warnings using silent
  // if this file is missing. dotenv will never modify any environment variables
  // that have already been set. Variable expansion is supported in .env files.
  // https://github.com/motdotla/dotenv
  // https://github.com/motdotla/dotenv-expand
  dotenvFiles.forEach(dotenvFile => {
    console.log(dotenvFile, fs.existsSync(dotenvFile));
    if (fs.existsSync(dotenvFile)) {
      require('dotenv-expand')(
        require('dotenv').config({
          path: dotenvFile,
        })
      );
    }
  });
}

setupEnvironment('../.env');

const HDWalletProvider = require('@truffle/hdwallet-provider');


const gasPrices = {
//  "ganache": 20,
//  "rinkeby": 20,
    "mainnet": 100,
};

//console.log(process.env.MNEMONIC);

function createNetwork(name, networkId) {

  var gasPrice = gasPrices[name] ? gasPrices[name] * 1000000000 : null;

  try {
    return {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, 
        `wss://${name}.infura.io/ws/v3/` + process.env.INFURA_PROJECT_KEY),
//        `https://${name}.infura.io/v3/` + process.env.INFURA_PROJECT_KEY),
//      gas: 50721975, // This should be different for each network?
      gas: 6000000,
      gasPrice,
      network_id: networkId,
      skipDryRun: true, // Skip dry run before migrations? (default: false for public nets )
    // confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 500000, // # of blocks before a deployment times out  (minimum/default: 50)
      networkCheckTimeout: 500000
    };
  } catch (e) {
    return null;
  }
}

module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */

  api_keys: {
    etherscan: process.env.ETHERSCAN_API_KEY
  },

  networks: {
    // Useful for testing. The `development` name is special - truffle uses it by default
    // if it's defined here and no other network is specified at the command line.
    // You should run a client (like ganache-cli, geth or parity) in a separate terminal
    // tab if you use this network and you must also set the `host`, `port` and `network_id`
    // options below to some value.
    //
//    test: {
//         host: "127.0.0.1",     // Localhost (default: none)
//         port: 8545,            // Standard Ethereum port (default: none)
//      provider: () => new HDWalletProvider(process.env.MNEMONIC, 'http://127.0.0.1:7545'),
      // provider: () => new HDWalletProvider({
      //   mnemonic: process.env.MNEMONIC,
      //   providerOrUrl: web3Provider
      // }), 
//      network_id: "*",       // Any network (default: none)
//      timeoutBlocks: 500000, // # of blocks before a deployment times out  (minimum/default: 50)
//      networkCheckTimeout: 500000

// //        disableConfirmationListener: true
//    },
/*    test: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*"       // Any network (default: none)
    }, */
    ganache: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 7545,            // Standard Ethereum port (default: none)
      network_id: "*"       // Any network (default: none)
    },

    mainnet: createNetwork('mainnet', 1),
    ropsten: createNetwork("ropsten", 3),
    rinkeby: createNetwork('rinkeby', 4),
    goerli: createNetwork('goerli', 5),
    
    // Another network with more advanced options...
    // advanced: {
    // port: 8777,             // Custom port
    // network_id: 1342,       // Custom network
    // gas: 8500000,           // Gas sent with each transaction (default: ~6700000)
    // gasPrice: 20000000000,  // 20 gwei (in wei) (default: 100 gwei)
    // from: <address>,        // Account to send txs from (default: accounts[0])
    // websocket: true        // Enable EventEmitter interface for web3 (default: false)
    // },
    // Useful for deploying to a public network.
    // NB: It's important to wrap the provider as a function.
    // ropsten: {
    // provider: () => new HDWalletProvider(mnemonic, `https://ropsten.infura.io/v3/YOUR-PROJECT-ID`),
    // network_id: 3,       // Ropsten's id
    // gas: 5500000,        // Ropsten has a lower block limit than mainnet
    // confirmations: 2,    // # of confs to wait between deployments. (default: 0)
    // timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
    // skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    // },
    // Useful for private networks
    // private: {
    // provider: () => new HDWalletProvider(mnemonic, `https://network.io`),
    // network_id: 2111,   // This network is yours, in the cloud.
    // production: true    // Treats this network as if it was a public net. (default: false)
    // }
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.11",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
       optimizer: {
         enabled: true,
         runs: 200
       },
       evmVersion: "istanbul"
      }
    }
  },

  plugins: [
    "truffle-plugin-verify",
    "truffle-contract-size"
  ],

  // Truffle DB is currently disabled by default; to enable it, change enabled: false to enabled: true
  //
  // Note: if you migrated your contracts prior to enabling this field in your Truffle project and want
  // those previously migrated contracts available in the .db directory, you will need to run the following:
  // $ truffle migrate --reset --compile-all

  db: {
    enabled: false
  }
};
