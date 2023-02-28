import { ContractSystem, testAddress } from "ton-emulator";
import { toNano, beginCell, contractAddress, Address, fromNano, OpenedContract } from "ton";
import { NftCollection } from "./output/sample_NftCollection";
import { NftItem } from "./output/sample_NftItem";

describe("Collection contract", () => {
    const OFFCHAIN_CONTENT_PREFIX = 0x01;
    const string_first = "https://s.getgems.io/nft-staging/c/628f6ab8077060a7a8d52d63/";
    let newContent = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeStringRefTail(string_first).endCell();
    let body = beginCell().storeUint(0, 32).storeStringTail("Mint").endCell();

    var system: ContractSystem;
    var contract: OpenedContract<NftCollection>;
    var owner: any;
    var nonOwner: any;
    var track: any;

    var contract_0: OpenedContract<NftItem>;
    var track_0: any;

    beforeAll(async () => {
        // Create ContractSystem and deploy contract
        system = await ContractSystem.create();
        owner = system.treasure("owner");
        nonOwner = system.treasure("non-owner");

        contract = await system.open(
            await NftCollection.fromInit(owner.address, newContent, {
                $$type: "RoyaltyParams",
                numerator: 100n, // 100n = 10%
                denominator: 1000n,
                destination: owner.address,
            })
        );

        track = await system.track(contract.address);

        await contract.send(owner, { value: toNano(1) }, "Mint");
        await contract.send(owner, { value: toNano(1) }, "Mint");
        await contract.send(owner, { value: toNano(1) }, "Mint");
        await system.run();

        let myAddress = await contract.getGetNftAddressByIndex(2n);
        if (myAddress !== null) {
            contract_0 = await system.open(await NftItem.fromAddress(myAddress));
            track_0 = await system.track(contract_0.address);
        }
    });

    it("Test for minting", async () => {
        await contract.send(owner, { value: toNano(1) }, "Mint");
        await system.run();
        // expect(track.events()).toMatchInlineSnapshot();

        // Check counter
        expect((await contract.getGetCollectionData()).next_item_index).toMatchInlineSnapshot(`4n`);

        // Increment counter
        await contract.send(owner, { value: toNano(1) }, "Mint");
        await system.run();
        expect((await contract.getGetCollectionData()).next_item_index).toMatchInlineSnapshot(`5n`);
        // expect(track.events()).toMatchSnapshot();

        // Non-owner
        await contract.send(nonOwner, { value: toNano(1) }, "Mint");
        await system.run();
    });

    it("Transfer", async () => {
        await contract.send(owner, { value: toNano(1) }, "Mint");
        await contract.send(owner, { value: toNano(1) }, "Mint");
        await contract.send(owner, { value: toNano(1) }, "Mint");
        await system.run();
        expect((await contract.getGetCollectionData()).next_item_index).toMatchInlineSnapshot(`9n`);

        let nft_item = await contract.getGetNftAddressByIndex(3n);

        expect((await contract_0.getGetNftData()).owner_address).toMatchInlineSnapshot(`
            Address {
              "hash": {
                "data": [
                  8,
                  251,
                  113,
                  73,
                  85,
                  207,
                  242,
                  193,
                  43,
                  152,
                  226,
                  250,
                  180,
                  109,
                  138,
                  243,
                  71,
                  180,
                  184,
                  57,
                  200,
                  120,
                  203,
                  182,
                  211,
                  83,
                  248,
                  185,
                  200,
                  179,
                  129,
                  220,
                ],
                "type": "Buffer",
              },
              "toRaw": [Function],
              "toRawString": [Function],
              "toString": [Function],
              "toStringBuffer": [Function],
              "workChain": 0,
              Symbol(nodejs.util.inspect.custom): [Function],
            }
        `);
        if (nft_item !== null) {
            await contract_0.send(
                owner,
                { value: toNano(1) },
                {
                    $$type: "Transfer",
                    query_id: 12n,
                    new_owner: nonOwner.address,
                    response_destination: owner.address,
                    custom_payload: null,
                    forward_amount: toNano("0.1"),
                    forward_payload: newContent, // any cell
                }
            );
        }
    });
});
