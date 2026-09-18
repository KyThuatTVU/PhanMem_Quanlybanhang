import { create } from 'zustand';

const defaultSettings = {
  STORE_NAME: 'Tạp Hóa An Khang',
  STORE_PHONE: '',
  STORE_ADDRESS: '',
  INVOICE_FOOTER: '',
  BANK_NAME: '',
  BANK_ACCOUNT: '',
  BANK_ACCOUNT_NAME: '',
  OWNER_QR_CONTENT: '',
  OWNER_QR_IMAGE: '',
};

const savedSettings = JSON.parse(localStorage.getItem('store_settings') || 'null');

export const useStoreSettings = create((set) => ({
  settings: { ...defaultSettings, ...(savedSettings || {}) },
  setSettings: (settings) => {
    const nextSettings = { ...defaultSettings, ...settings };
    localStorage.setItem('store_settings', JSON.stringify(nextSettings));
    set({ settings: nextSettings });
  },
}));
