import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class StorageService {

  #secretKey = "79b80065a479e05115762cc56b48a42f7f1092a316499fc2b46a78ffd55f69d6";

  #encryptData(txt: string) {
    return CryptoJS.AES.encrypt(txt, this.#secretKey).toString();
  };

  #decryptData(txtToDecrypt: string) {
    return CryptoJS.AES.decrypt(txtToDecrypt, this.#secretKey).toString(CryptoJS.enc.Utf8);
  };

  storeLocalData<T>(key: string, data: T, stringifyIt = false): void {
    const encryptedData = stringifyIt ? this.#encryptData(JSON.stringify(data)).toString() : this.#encryptData(data as string).toString();
    localStorage.setItem(key, encryptedData);
  };

  getLocalData(key: string, parseIt = false) {
    const decryptedData = localStorage.getItem(key) as string;
    if (!decryptedData) return;
    if (parseIt) {
      return JSON.parse(this.#decryptData(decryptedData));
    } else {
      return this.#decryptData(decryptedData);
    }
  };

  removeLocalData(key: string): void {
    localStorage.removeItem(key);
  };

  clearLocalData(): void {
    localStorage.clear();
  };
}
