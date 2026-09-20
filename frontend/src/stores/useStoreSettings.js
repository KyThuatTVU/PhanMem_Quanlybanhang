import { create } from 'zustand';

const defaultSettings = {
  STORE_NAME: 'Tạp Hóa Vũ An',
  STORE_PHONE: '',
  STORE_ADDRESS: '',
  INVOICE_FOOTER: '',
  BANK_NAME: '',
  BANK_ACCOUNT: '',
  BANK_ACCOUNT_NAME: '',
  OWNER_QR_CONTENT: '',
  OWNER_QR_IMAGE: '',
};

let savedSettings = JSON.parse(localStorage.getItem('store_settings') || 'null');
if (!savedSettings || savedSettings.STORE_NAME === 'Tạp Hóa An Khang') {
  savedSettings = { ...(savedSettings || {}), STORE_NAME: 'Tạp Hóa Vũ An' };
  localStorage.setItem('store_settings', JSON.stringify(savedSettings));
}

export const useStoreSettings = create((set) => ({
  settings: { ...defaultSettings, ...(savedSettings || {}) },
  setSettings: (settings) => {
    const nextSettings = { ...defaultSettings, ...settings };
    if (nextSettings.STORE_NAME === 'Tạp Hóa An Khang') {
      nextSettings.STORE_NAME = 'Tạp Hóa Vũ An';
    }
    localStorage.setItem('store_settings', JSON.stringify(nextSettings));
    set({ settings: nextSettings });
  },
}));
