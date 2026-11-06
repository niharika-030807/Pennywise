import { httpClient } from './httpClient';

export const bankApi = {
  getSupportedBanks: () => httpClient('/bank/supported'),
  getAccounts: () => httpClient('/bank/accounts'),
  connectDemo: (bankName, phoneNumber = '', accountType = 'Savings Account') =>
    httpClient('/bank/connect-demo', {
      method: 'POST',
      body: JSON.stringify({
        bank_name: bankName,
        phone_number: phoneNumber,
        account_type: accountType
      })
    }),
  disconnect: (bankId) =>
    httpClient(`/bank/disconnect/${bankId}`, {
      method: 'POST'
    })
};
