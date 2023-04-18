const targetAddress = '0xa20E37363aE57c4C4bb9D7BFD9db266191a5310c';
const knownWords = ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?"]; // Replace with your known words

const bip39 = require('bip39');
const fs = require('fs');
const { hdkey } = require('ethereumjs-wallet')

const data = fs.readFileSync('english.txt', 'utf8');
const bip39Words = data.trim().split(/\r?\n/);

const missingWordIndices = knownWords.reduce((acc, word, index) => {
    if (word === '?') {
        acc.push(index);
    }
    return acc;
}, []);

const totalCombinations = Math.pow(bip39Words.length, missingWordIndices.length);
let combinationsChecked = 0;
let lastPercentage = 0;

const logProgress = () => {
    combinationsChecked++;
    const currentPercentage = Math.floor((combinationsChecked / totalCombinations) * 100);
    if (currentPercentage !== lastPercentage) {
        console.log(`${currentPercentage}% completed`);
        lastPercentage = currentPercentage;
    }
};

const searchWithProgress = (missingWordIndices, currentDepth = 0, currentWords = [...knownWords]) => {
    if (currentDepth === missingWordIndices.length) {
        logProgress();
        const seedPhrase = currentWords.join(' ');

        const seed = bip39.mnemonicToSeedSync(seedPhrase);
        const hdwallet = hdkey.fromMasterSeed(seed);
        const myWallet = hdwallet.derivePath("m/44'/60'/0'/0/0").getWallet();
        const address = myWallet.getChecksumAddressString();

        if (address === targetAddress) {
            console.log(`Found seed phrase: ${seedPhrase}`);
            console.log(`Derived address: ${address}`);
            return true;
        } else {
            return false;
        }

    }

    for (const word of bip39Words) {
        currentWords[missingWordIndices[currentDepth]] = word;
        if (searchWithProgress(missingWordIndices, currentDepth + 1, currentWords)) {
            return true;
        }
    }
    return false;
};

searchWithProgress(missingWordIndices);

