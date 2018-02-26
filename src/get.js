const Promise = require('bluebird'),
    {
        NULL_HASH
    } = require('./constant'),
    {
        Entry
    } = require('./entry'),
    {
        toHex
    } = require('./util');

function getChainHead(factomd, chainId) {
    return factomd.chainHead(toHex(chainId));
}

async function getFirstEntry(factomd, chainId) {
    const chainHead = await getChainHead(factomd, chainId);
    let keymr = chainHead.chainhead;
    let entryBlock;
    while (keymr !== NULL_HASH) {
        entryBlock = await factomd.entryBlock(keymr);
        keymr = entryBlock.header.prevkeymr;
    }

    return factomd.entry(entryBlock.entrylist[0].entryhash)
        .then(toEntry);
}

// TODO: Paginated version
async function getAllEntriesOfChain(factomd, chainId) {
    const allEntries = [];
    const chainHead = await getChainHead(factomd, chainId);

    if (chainHead.chainhead === '' && chainHead.chaininprocesslist) {
        throw 'Chain not yet included in a Directory Block';
    }

    let keymr = chainHead.chainhead;
    while (keymr !== NULL_HASH) {
        const {
            entries,
            prevkeymr
        } = await getAllEntriesOfEntryBlock(factomd, keymr);
        allEntries.push(...entries.reverse());

        keymr = prevkeymr;
    }

    return Promise.resolve(allEntries.reverse());
}

async function getAllEntriesOfEntryBlock(factomd, keymr) {
    const entryBlock = await factomd.entryBlock(keymr);

    const entries = await Promise.map(entryBlock.entrylist.map(e => e.entryhash), factomd.entry);

    return {
        entries: entries.map(toEntry),
        prevkeymr: entryBlock.header.prevkeymr
    };
}

function toEntry(entry) {
    return new Entry.Builder()
        .chainId(entry.chainid, 'hex')
        .extIds(entry.extids, 'hex')
        .content(entry.content, 'hex')
        .build();
}

function getBalance(factomd, address) {
    // TODO: detect type of X and redirect
    // TODO: implement https://github.com/FactomProject/factom/blob/a0a55096f9d2aeb5cb63b8b5a714a285f3a100b3/addresses.go#L43
    return factomd.entryCreditBalance(address)
        .then(res => res.balance);
}

function getProperties(factomd) {
    return factomd.properties();
}


// async function chainExists(chainId) {
//     return factomd.chainHead(chainId)
//         .then(() => true)
//         .catch(() => false);
// }

module.exports = {
    getAllEntriesOfChain,
    getAllEntriesOfEntryBlock,
    getFirstEntry,
    getChainHead,
    getBalance,
    getProperties
};