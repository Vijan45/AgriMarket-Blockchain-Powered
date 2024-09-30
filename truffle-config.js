require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
    networks: {
        development: {
            host: "127.0.0.1",
            port: 8545,
            network_id: "*",
        },
        rskTestnet: {  // Change 'testnet' to 'rskTestnet'
            provider: () =>
                new HDWalletProvider({
                    mnemonic: {
                        phrase: process.env.MNEMONIC,
                    },
                    providerOrUrl: `https://public-node.testnet.rsk.co`,
                    chainId: 31, // RSK Testnet ID
                    pollingInterval: 15000,
                }),
            network_id: 31, // RSK Testnet ID
            gas: 2500000,
            gasPrice: 60000000, // 60 Gwei in tRBTC
            confirmations: 2,
            timeoutBlocks: 60000,
            skipDryRun: true,
        },
    },

    compilers: {
        solc: {
            version: "0.8.20",
        },
    },

    db: {
        enabled: false,
    },
};
