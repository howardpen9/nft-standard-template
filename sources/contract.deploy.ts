import { beginCell, contractAddress, toNano } from "ton";
import { testAddress } from "ton-emulator";
import { SampleTactContract, storeAdd } from "./output/sample_SampleTactContract";
import { deploy } from "./utils/deploy";
import { printAddress, printDeploy, printHeader } from "./utils/print";

(async () => {

    // Parameters
    let owner = testAddress('some-owner'); // Replace owner with your address
    let packed = beginCell().store(storeAdd({ $$type: 'Add', amount: 10n })).endCell(); // Replace if you want another message used
    let init = await SampleTactContract.init(owner);
    let address = contractAddress(0, init);
    let deployAmount = toNano(10);
    let testnet = true;

    // Print basics
    printHeader('SampleTactContract');
    printAddress(address);
    // printDeploy(init, deployAmount, packed, testnet);
    
    // Do deploy
    await deploy(init, deployAmount, packed, testnet)
})();