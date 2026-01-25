
import { WalletAccount } from '../types';

const STORAGE_KEY = 'wallet_system_data';

export const storage = {
  getAccounts: (): WalletAccount[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveAccount: (account: WalletAccount) => {
    const accounts = storage.getAccounts();
    const index = accounts.findIndex(a => a.accountId === account.accountId);
    if (index > -1) {
      accounts[index] = account;
    } else {
      accounts.push(account);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  },

  findAccount: (accountId: string): WalletAccount | undefined => {
    return storage.getAccounts().find(a => a.accountId === accountId);
  },

  generateAccountId: () => {
    return `WAL-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
};
