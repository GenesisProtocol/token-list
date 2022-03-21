import { Request, Response } from 'express'
import metadata from '../assets/metadata.json'
import { getAddress, getAbi } from '@genesisprotocol/helpers'
import { ethers } from 'ethers'

const BASE_URL = 'https://tokens.usegenesis.com/files/'

interface IToken {
    name: string
    symbol: string
    logoURI: string
    chainId: number
    address: string
    decimals: number
}

interface IProviderMap {
    [chain: number]: ethers.providers.JsonRpcProvider
}

const providers: IProviderMap = {
    80001: new ethers.providers.JsonRpcProvider('https://polygon-mumbai.g.alchemy.com/v2/j1fnCMVcSRSqnQhQYs2lMVyEkV5H0snv'),
    43113: new ethers.providers.JsonRpcProvider('https://speedy-nodes-nyc.moralis.io/06ed7fbdf4f5dbcd408458b2/avalanche/testnet'),
    // 43114: new ethers.providers.JsonRpcProvider('https://speedy-nodes-nyc.moralis.io/06ed7fbdf4f5dbcd408458b2/avalanche/mainnet'),
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
        'logoURI': BASE_URL + 'avax.svg',
    },
}

const tokenListPromise = (async () => {
    const entries = Object.entries(tokenMap)
    const tokens: IToken[] = []

    await Promise.all(entries.map(async ([name, data]) => {
        await Promise.all(chains.map(async (chainId: string) => {
            const chainIdInteger = parseInt(chainId)

            const contract = new ethers.Contract(
                getAddress({ chain: chainIdInteger, name }),
                await getAbi({ name }),
                providers[chainIdInteger],
            )

            return tokens.push({
                ...data,
                chainId: chainIdInteger,
                decimals: parseInt(await contract.decimals()),
                address: contract.address,
            })
        }))
    }))

    return {
        ...metadata,
        tokens,
    }
})()

export default async function handler(req: Request, res: Response) {
    const tokenList = await tokenListPromise

    tokenList.timestamp = new Date().toISOString()

    res.status(200).json(tokenList)
}
