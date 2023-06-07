import { beginCell, contractAddress, toNano, Cell, Address } from "ton";
import { testAddress } from "ton-emulator";
import { deploy } from "./utils/deploy";
import { printAddress, printDeploy, printHeader } from "./utils/print";
// ================================================================= //
import { NftCollection } from "./output/sample_NftCollection";
// ================================================================= //
(async () => {
    const OFFCHAIN_CONTENT_PREFIX = 0x01;
    const stringURL_MetaData = "https://s.getgems.io/nft-staging/c/628f6ab8077060a7a8d52d63/";
    let newContent = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeStringRefTail(stringURL_MetaData).endCell();
    let body = beginCell()
                    .storeUint(0, 32)
                    .storeStringTail("Mint")
                .endCell();

    // Parameters
    let owner = Address.parse("kQAdZc3GlI8w_25dAjSZFOKJEB0A88bQU2f3BH6YTgiGLKPh"); // Replace owner with your address
    let init = await NftCollection.init(owner, newContent, {
        $$type: "RoyaltyParams",
        numerator: 350n, // 350n = 35%
        denominator: 1000n,
        destination: owner,
    });

    let address = contractAddress(0, init);
    let deployAmount = toNano("0.5");
    let testnet = true;

    printHeader("sampleNFT_Contract");
    printAddress(address);
    // printDeploy(init, deployAmount, packed, testnet);

    // Do deploy
    await deploy(init, deployAmount, body, testnet);
})();
