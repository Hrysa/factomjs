const assert = require('chai').assert,
    { Transaction } = require('../src/transaction'),
    { DirectoryBlock, EntryCreditBlock, FactoidBlock, AdminBlock, EntryBlock } = require('../src/blocks'),
    get = require('../src/get'),
    factomdjs = require('factomdjs');

const nconf = require('nconf').file({ file: `${__dirname}/config.json` });
const factomd = new factomdjs.Factomd();
factomd.setFactomNode(nconf.get('factomd-url'));

describe('Get information from Factom blockchain', function() {

    it('should get entry', async function() {
        const entry = await get.getEntry(factomd, 'ec92aa51b34b992b3472c54ce005a3baf7fbdddd8bb6d786aad19304830559b0');

        assert.equal(entry.extIds[0].toString(), 'PrimeNumbers.txt');
    });

    it('should get all entries', async function() {
        this.timeout(5000);
        const entries = await get.getAllEntriesOfChain(factomd, 'f48d2160c5d8178720d8c83b89a62599ab6a8b9dbec9fbece5229f787d1e8b44');

        assert.isAtLeast(entries.length, 7);
    });

    it('should get balance', async function() {
        const ecBalance = await get.getBalance(factomd, 'EC2vXWYkAPduo3oo2tPuzA44Tm7W6Cj7SeBr3fBnzswbG5rrkSTD');
        const ecBalance2 = await get.getBalance(factomd, 'Es32PjobTxPTd73dohEFRegMFRLv3X5WZ4FXEwNN8kE2pMDfeMym');
        const fctBalance = await get.getBalance(factomd, 'FA29jNtT88wGjs9YLQch8ur4VFaTDkuiDwWe1YmksPDJuh3tAczG');
        const fctBalance2 = await get.getBalance(factomd, 'Fs2w6VL6cwBqt6SpUyPLvdo9TK834gCr52Y225z8C5aHPAFav36X');

        assert.typeOf(ecBalance, 'number');
        assert.typeOf(ecBalance2, 'number');
        assert.typeOf(fctBalance, 'number');
        assert.typeOf(fctBalance2, 'number');
    });

    it('should get Transaction', async function() {
        this.timeout(5000);

        const transaction = await get.getTransaction(factomd, '63fe4275064427f11e0dcfc3ff2d56adf88ba12c2646bc0d03d03a02ff7d2727');

        assert.instanceOf(transaction, Transaction);
        assert.equal(transaction.id, '63fe4275064427f11e0dcfc3ff2d56adf88ba12c2646bc0d03d03a02ff7d2727');
        assert.equal(transaction.timestamp, 1525490539106);
        assert.equal(transaction.totalInputs, 400012000);
        assert.equal(transaction.totalFactoidOutputs, 400000000);
        assert.equal(transaction.totalEntryCreditOutputs, 0);
        assert.equal(transaction.feesPaid, 12000);
        assert.lengthOf(transaction.inputs, 1);
        assert.lengthOf(transaction.factoidOutputs, 1);
        assert.lengthOf(transaction.entryCreditOutputs, 0);
        assert.equal(transaction.rcds[0].toString('hex'), '011bcb4c8a771c2869ddf554655414e56bdf360663f33960039a9aa43ac5820306')
        assert.equal(transaction.signatures[0].toString('hex'), '8a3f90a2b47efda21b801d2dc7f8dbbbfe9c0a65cb37aea4a998632ab7578aa965c8b5893f069030c4411a76dddc357270c0d835a31ea4fd34290a925d4c5501')
        assert.equal(transaction.inputs[0].address, 'FA3syRxpYEvFFvoN4ZfNRJVQdumLpTK4CMmMUFmKGeqyTNgsg4uH');
        assert.equal(transaction.inputs[0].amount, 400012000);
        assert.equal(transaction.factoidOutputs[0].address, 'FA3cnxxcRxm6RQs2hpExdEPo9utyeBZecWKeKa1pFDCrRoQh9aVw');
        assert.equal(transaction.factoidOutputs[0].amount, 400000000);
    });

    it('should get Transaction with block context', async function() {
        this.timeout(5000);

        const txWithContext = await get.getTransactionWithBlockContext(factomd, 'ba6865982698f552739109335ad27f94a482c9c85839344f0833c058662d7d90');

        assert.instanceOf(txWithContext.transaction, Transaction);
        assert.equal(txWithContext.includedInTransactionBlock, 'e3a598d40526f45fc44c19891962813f61479b530fe9866d69ffd9fecec7cf49');
        assert.equal(txWithContext.includedInDirectoryBlock, '964e83ab665169d44f270eca8e6a403a7fbcddd049d200f0fef9d071c83a47f3');
        assert.equal(txWithContext.includedInDirectoryBlockHeight, 27615);
    });

    it('should get heights', async function() {
        const heights = await get.getHeights(factomd);

        assert.isNumber(heights.directoryBlockHeight);
        assert.ok(heights.directoryBlockHeight !== 0);
        assert.isNumber(heights.leaderHeight);
        assert.ok(heights.leaderHeight !== 0);
        assert.isNumber(heights.entryBlockHeight);
        assert.ok(heights.entryBlockHeight !== 0);
        assert.isNumber(heights.entryHeight);
        assert.ok(heights.entryHeight !== 0);
    });

    function assertDirectoryBlock(db) {
        assert.instanceOf(db, DirectoryBlock);
        assert.equal(db.keyMR, 'f55a19d9562843b642f1a20b34fcbb71e70f438c4d98d223fc2228ca2dd0c54a');
        assert.equal(db.height, 21537);
        assert.equal(db.previousBlockKeyMR, 'b37bf4eee21547773c74fa099c643588835e4ada9a4a8c22f0dd171e22710bf5');
        assert.equal(db.timestamp, 1521348840);
        assert.equal(db.adminBlockRef, '643f3a4f0a5fd7a44374affe47fd052a845a078482319ad6540aa7f1f714bb9e');
        assert.equal(db.entryCreditBlockRef, 'f4540b4170666a47b1287c4d0843b91d5a0ebcf8433c40b674d017f146503256');
        assert.equal(db.factoidBlockRef, 'baf6e92932f4ba0f81baacf7b7d7726d6f7f3a4da0c43bfdaf846a843c8f2301');
        assert.lengthOf(db.entryBlockRefs, 23);
    }

    it('should get Directory Block', async function() {
        const byKeyMR = await get.getDirectoryBlock(factomd, 'f55a19d9562843b642f1a20b34fcbb71e70f438c4d98d223fc2228ca2dd0c54a');
        assertDirectoryBlock(byKeyMR);

        const byHeight = await get.getDirectoryBlock(factomd, 21537);
        assertDirectoryBlock(byHeight);

        assert.equal(byHeight.fullHash, 'd435f58a88eb9967e8be864af7015a9a01a50f716181a8bee5e86593bc4a0f8d');
        assert.equal(byHeight.previousFullHash, 'f0dc9915ff0db78648a8366a1768332c74d28913f3ae4699d4fab7dc6d935b31');
        assert.equal(byHeight.bodyKeyMR, '6243865ba04b031423a2d6b48335c571b48499e71b7630f233e885f832bfdd30');
    });

    function assertEntryCreditBlock(ecb) {
        assert.instanceOf(ecb, EntryCreditBlock);
        assert.equal(ecb.fullHash, 'b6d6252f0abef42feee77706cceee490c7ade1f1e6574ede2e2f9979e96282a5');
        assert.equal(ecb.headerHash, '29692e986e12fbc6d9cf688cedb40a73caa0e04611a7fec39ba1227ffa03aefc');
        assert.equal(ecb.bodyHash, '50527bd50bb3e8e39e941f582601e58f2529bae0dfb68da0cc1a0ab7c5f0e889');
        assert.equal(ecb.previousFullHash, 'ec9dad3cd4e8dfa9ac6c9637a2a310b87ef57594af2e9959010fe1f29a0934f5');
        assert.equal(ecb.previousHeaderHash, 'a111e3d4ca813450e8f987ac868ba7e01687e9b108321b1dfa5d0f0e612a0f6c');
        assert.equal(ecb.directoryBlockHeight, 21650);
        assert.equal(ecb.headerExpansionArea, '');
        assert.equal(ecb.bodySize, 239633);
        assert.equal(ecb.objectCount, 1759);
        assert.lengthOf(ecb.commits, 1749);
        assert.lengthOf(ecb.minuteIndexes, 11);
    }

    it('should get Entry Credit Block', async function() {
        this.timeout(5000);

        const byHeaderHash = await get.getEntryCreditBlock(factomd, '29692e986e12fbc6d9cf688cedb40a73caa0e04611a7fec39ba1227ffa03aefc');
        assertEntryCreditBlock(byHeaderHash);

        const byHeight = await get.getEntryCreditBlock(factomd, 21650);
        assertEntryCreditBlock(byHeight);
    });

    function assertFactoidBlock(fb) {
        assert.instanceOf(fb, FactoidBlock);
        assert.equal(fb.keyMR, 'e0715c82f88423a5ce23eb4c8d71700f3dacc5e557adea4d166f5c51683c950a');
        assert.equal(fb.previousBlockKeyMR, '9b7083a4f428019de3bd12c0c84ffd9ec5767878047aba0d65f2886e5516f86c');
        assert.equal(fb.bodyMR, 'd2e2151814cd4a1bbe12e65e8720583118c0594f6ad1e84db096e1c8bffde9ec');
        assert.equal(fb.entryCreditRate, 1000);
        assert.equal(fb.directoryBlockHeight, 21658);
        assert.equal(fb.ledgerKeyMR, '5429704740e3dad6e05f2aca56bf350b647f7612911919d9356d2e9a8d0e58fa');
        assert.equal(fb.previousLedgerKeyMR, '9c3063e4f450227c031f18b9caf6803ae267f27a96bf97b15c734ddf36f4cc9a');
        assert.lengthOf(fb.transactions, 1);

    }

    it('should get Factoid Block', async function() {
        const byKeyMR = await get.getFactoidBlock(factomd, 'e0715c82f88423a5ce23eb4c8d71700f3dacc5e557adea4d166f5c51683c950a');
        assertFactoidBlock(byKeyMR);

        const byHeight = await get.getFactoidBlock(factomd, 21658);
        assertFactoidBlock(byHeight);
    });

    it('should get Entry Block', async function() {

        const eb = await get.getEntryBlock(factomd, '3944669331eea620f7f3ec67864a03a646a104f17e36aec3e0f5bdf638f16883');

        assert.instanceOf(eb, EntryBlock);
        assert.equal(eb.keyMR, '3944669331eea620f7f3ec67864a03a646a104f17e36aec3e0f5bdf638f16883');
        assert.equal(eb.previousBlockKeyMR, '1af04b34c3a0113d14aa0fcbb8c609864fa2e8f24dd04e9814aa7e5a40376a70');
        assert.equal(eb.timestamp, 1521429840);
        assert.equal(eb.directoryBlockHeight, 21672);
        assert.equal(eb.chainId, '3f69bdf3b4769ff53407580b882ee01e0c365f6deffba4ed8d4651b24e65389a');
        assert.equal(eb.sequenceNumber, 1168);
        assert.lengthOf(eb.entryRefs, 50);

    });

    function assertAdminBlock(ab) {
        assert.instanceOf(ab, AdminBlock);
        assert.equal(ab.backReferenceHash, 'd6d21564d9b1b1e55fa308890821ed4151ded40a33cb3cf8edaecf2b63e32236');
        assert.equal(ab.lookupHash, 'c98beb0b3cbfbb090acdd238ca17725119eb43f1df5ef117ffbdc59f050508e6');
        assert.equal(ab.previousBackReferenceHash, 'a24beb7bcd0d47857fcd0b570ea3c16704daf3377d9b9588c6305e9271539eea');
        assert.equal(ab.directoryBlockHeight, 21662);
        assert.equal(ab.headerExpansionArea, '');
        assert.equal(ab.headerExpansionSize, 0);
        assert.equal(ab.bodySize, 387);
        assert.lengthOf(ab.entries, 3);
    }

    it('should get Admin Block', async function() {
        const byHash = await get.getAdminBlock(factomd, 'c98beb0b3cbfbb090acdd238ca17725119eb43f1df5ef117ffbdc59f050508e6');
        assertAdminBlock(byHash);

        const byHeight = await get.getAdminBlock(factomd, 21662);
        assertAdminBlock(byHeight);
    });

});