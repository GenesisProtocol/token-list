import metadata from '../../assets/metadata.json'
import { getAddress, getABI } from '@genesisprotocol/helpers'
import { ethers } from 'ethers'

const BASE_URL = 'https://tokens.usegenesis.com/'

const providers = {
    80001: new ethers.providers.JsonRpcProvider('https://polygon-mumbai.g.alchemy.com/v2/j1fnCMVcSRSqnQhQYs2lMVyEkV5H0snv')
}

const chains = Object.keys(providers)

const tokenMap = {
    'GenesisToken': {
        'name': 'Genesis',
        'symbol': 'GEN',
        'logoURI': 'https://cdns-images.dzcdn.net/images/artist/c0ed2cf09c7bf072111d614fc4557b66/500x500.jpg',
    },
    'Dai': {
        'name': 'Dai',
        'symbol': 'DAI',
        'logoURI': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
    },
    'WrappedBtc': {
        'name': 'Wrapped Bitcoin',
        'symbol': 'wBTC',
        'logoURI': BASE_URL + 'wbtc.png',
    },
    'WrappedEth': {
        'name': 'Wrapped Ethereum',
        'symbol': 'wETH',
        'logoURI': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
    },
    'WrappedAvax': {
        'name': 'Wrapped Avalanche',
        'symbol': 'wAVAX',
        'logoURI': BASE_URL + 'avax.png',
    },
}

const tokenListPromise = (async () => {
    const entries = Object.entries(tokenMap)
    let tokens = []

    await Promise.all(entries.map(async ([name, data]) => {
        await Promise.all(chains.map(async chainId => {
            const [address, abi] = await Promise.all([
                getAddress({ chain: parseInt(chainId), name }),
                getABI({ name }),
            ])

            const contract = new ethers.Contract(
                address,
                abi,
                providers['80001']
            )

            return tokens.push({
                ...data,
                chainId,
                decimals: await contract.decimals(),
                address,
            })
        }))
    }))

    return {
        ...metadata,
        tokens,
    }
})()

export default async function handler(req, res) {
    const tokenList = await tokenListPromise

    tokenList.timestamp = new Date().toISOString()

    res.status(200).json(tokenList)
}
