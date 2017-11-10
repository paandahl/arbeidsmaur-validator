import {LegalEntity} from "./shared";
import {shareholders} from "./handler_specs/shareholders_handlers";
import ShareTransaction = shareholders.ShareTransaction;
import {getByIdNumber} from "./utils";

function ownerToPublicShareholder(owner: LegalEntity, date: Date, shareNumbers: string): shareholders.ShareHolder {
  return {
    id: owner.id,
    type: owner.type,
    email: owner.email,
    name: owner.name,
    address: owner.address!,
    idNumber: owner.idNumber,
    contactIdNumber: owner.contactIdNumber,
    contactName: owner.contactName,
    // idNumber: owner.idNumber = owner.type === EntityType.Company ?
    //   owner.idNumber : formatDate(idNumberToBirthDate(owner.idNumber)),
    numberOfShares: 0,
    listedDate: date,
    lastUpdate: date,
    shareNumbers,
  };
}

export function shareNumbersToString(shares: number[]) {
  shares.sort((n1, n2) => n1 < n2 ? -1 : 1);
  let series = '';
  const addSeries = (from: number, to: number) => {
    if (!series) series = (from === to) ? `${from}` : `${from}-${to}`;
    else series = (from === to) ? `${series},${from}` : `${series},${from}-${to}`;
  };
  let from = shares[0];
  let previous = shares[0];
  for (let i = 1; i < shares.length; i++) {
    if (shares[i] !== previous + 1) {
      addSeries(from, previous);
      from = shares[i];
    }
    previous = shares[i];
  }
  addSeries(from, shares[shares.length - 1]);
  return series;
}

export function parseShareNumbersString(series: string) {
  const shares: number[] = [];
  const parts = series.split(',');
  for (const part of parts) {
    if (part.includes('-')) {
      const from = parseInt(part.split('-')[0]);
      const to = parseInt(part.split('-')[1]);
      for (let i = from; i <= to; i++) {
        shares.push(i);
      }
    } else {
      shares.push(parseInt(part));
    }
  }
  return shares;
}

export function removeShares(shareArray: number[], toRemove: number[], failFast = true) {
  for (const remove of toRemove) {
    const index = shareArray.indexOf(remove);
    if (index === -1 && !failFast) continue;
    shareArray.splice(index, 1);
  }
}

interface BlockOfShares {
  introducedDate: Date
  shares: number[]
}

// calculates share blocks for an owner
// transactions: all transactions, sorted by date
export function shareBlocksForOwner(transactions: shareholders.ShareTransaction[], ownerIdNumber: string) {
  const shareBlocks: BlockOfShares[] = [];
  for (const transaction of transactions) {
    if (transaction.buyerIdNumber === ownerIdNumber) {
      shareBlocks.push({
        introducedDate: transaction.transactionTime,
        shares: parseShareNumbersString(transaction.shareNumbers),
      });
    } else if (transaction.sellerIdNumber === ownerIdNumber) {
      const soldShares = parseShareNumbersString(transaction.shareNumbers);
      for (const shareBlock of shareBlocks) {
        removeShares(shareBlock.shares, soldShares, false);
      }
    }
  }
  return shareBlocks;
}

// calculates number of shares, and shareNumbers for each owner
// transactions is assumed to be sorted by date
export function shareHoldersFromTransactions(transactions: ShareTransaction[],
    owners: LegalEntity[], atTime?: Date): shareholders.ShareHolder[] {
  const shareHolders = new Map<string, shareholders.ShareHolder>();
  const sharesOwned = new Map<string, number[]>();
  for (const transaction of transactions) {
    if (atTime && transaction.transactionTime > atTime) break;
    let buyer = shareHolders.get(transaction.buyerIdNumber);
    if (!buyer) {
      const owner = getByIdNumber(transaction.buyerIdNumber, owners);
      if (!owner) throw 'In conversion: couldnt find buyer with id ' + transaction.buyerIdNumber + ' in owner list.';
      buyer = ownerToPublicShareholder(owner, transaction.transactionTime, '');
      shareHolders.set(transaction.buyerIdNumber, buyer);
    }
    buyer.numberOfShares += transaction.numberOfShares;
    buyer.lastUpdate = transaction.transactionTime;
    let shares = sharesOwned.get(transaction.buyerIdNumber);
    if (!shares) shares = [];
    shares = shares.concat(parseShareNumbersString(transaction.shareNumbers));
    sharesOwned.set(transaction.buyerIdNumber, shares);
    if (transaction.sellerIdNumber) {
      const seller = shareHolders.get(transaction.sellerIdNumber);
      if (!seller) throw 'In conversion, couldnt find seller with id: ' + transaction.sellerIdNumber;
      seller.numberOfShares -= transaction.numberOfShares;
      seller.lastUpdate = transaction.transactionTime;
      const sellerShares = sharesOwned.get(transaction.sellerIdNumber)!;
      const soldShares = parseShareNumbersString(transaction.shareNumbers);
      removeShares(sellerShares, soldShares);
    }
  }
  let shareholderArr = Array.from(shareHolders.values());
  shareholderArr.forEach(sh => sh.shareNumbers = shareNumbersToString(sharesOwned.get(sh.idNumber)!));
  return shareholderArr;
}

// transactions is assumed to be sorted by date
export function ownersWithChanges(owners: LegalEntity[], transactions: ShareTransaction[], fromTime: Date) {
  const entityMap = new Map<string, LegalEntity>();
  owners.forEach(o => entityMap.set(o.idNumber, o));
  const changedOwnerMap = new Map<string, LegalEntity>();
  for (const transaction of transactions) {
    if (transaction.transactionTime < fromTime) continue;
    changedOwnerMap.set(transaction.buyerIdNumber, entityMap.get(transaction.buyerIdNumber)!);
    if (transaction.sellerIdNumber) {
      changedOwnerMap.set(transaction.sellerIdNumber, entityMap.get(transaction.sellerIdNumber)!);
    }
  }
  return Array.from(changedOwnerMap.values());
}

/* Sort transactions chronologically by transactionDate */
export function sortTransactions(transactions: ShareTransaction[]) {
  transactions.sort((t1, t2) => t1.transactionTime > t2.transactionTime ? 1 : -1);
}
