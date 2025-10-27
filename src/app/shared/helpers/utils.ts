import { WritableSignal, signal } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import * as CryptoJS from 'crypto-js';
import { Observable, isObservable, of } from 'rxjs';

export function localStorageSignal<T>(
  initialValue: T,
  localStorageKey: string
): WritableSignal<T> {
  const secretKey =
    '79b80065a479e05115762cc56b48a42f7f1092a316499fc2b46a78ffd55f69d6';
  const encryptData = (txt: string) =>
    CryptoJS.AES.encrypt(txt, secretKey).toString();
  const decryptData = (txtToDecrypt: string) =>
    CryptoJS.AES.decrypt(txtToDecrypt, secretKey).toString(CryptoJS.enc.Utf8);

  const storedValueRaw = localStorage.getItem(localStorageKey);
  if (storedValueRaw) {
    try {
      const decryptedValue = decryptData(storedValueRaw);
      initialValue = JSON.parse(decryptedValue);
    } catch (e) {
      console.error('Failed to parse stored value');
    }
  } else if (initialValue !== null) {
    // Only store if not null.
    const encryptedInitialValue = encryptData(JSON.stringify(initialValue));
    localStorage.setItem(localStorageKey, encryptedInitialValue);
  }

  /* Override the signal's setter: The original setter of the signal is overridden (or monkey-patched). The new setter not only updates the signal's value but also updates the localStorage with the new value.*/
  const writableSignal = signal(initialValue);
  const setter = writableSignal.set;
  writableSignal.set = (value: T) => {
    if (value === null) {
      localStorage.removeItem(localStorageKey); // Remove item if value is set to null.
    } else {
      const encryptedValue = encryptData(JSON.stringify(value));
      localStorage.setItem(localStorageKey, encryptedValue);
    }
    setter(value);
  };
  return writableSignal;

  /* This function returns writableSignal, which is a signal that can hold the value. This signal is now linked to localStorage, meaning any updates to it are both reflected in-memory and persisted in localStorage.*/

  /* monkey-patches the `set` method of the writableSignal. This means it modifies the `set` method of the writableSignal to also store the new value in the localStorage whenever set is called. This WritableSignal will keep its value in sync with the localStorage.

  Monkey patching is a technique that allows to change or extend the behaviour of existing code at runtime without directly modifying the source code. This can be useful when the code is closed-source or the developer doesn’t have access to the original code.

  Benefits of monkey patching:
    - Persistence: The state of the signal is persisted across page reloads and browser sessions.
    - Synchronization: Changes to the signal are automatically reflected in localStorage, ensuring that the stored data is always up-to-date.

  The term `monkey patching` comes from the idea of a monkey `patching` a codebase, just as a monkey might tinker with a tool.

  Example:
    class OriginalClass {
      originalMethod() {
        console.log('Original Method');
      }
    }

    OriginalClass.prototype.newMethod = function() {
      console.log('New Method');
    };

    let obj = new OriginalClass();
    obj.newMethod();

  https://dev.to/himankbhalla/what-is-monkey-patching-4pf
  */
}

/* Usage:
const userSettings = localStorageSignal({ theme: "light", lang: "en" }, "user-settings");
// Any changes made to userSettings via userSettings.set() will automatically update localStorage. */


export type MaybeObservable<T> = T | Observable<T>;

export function asObservable<T>(value: MaybeObservable<T>) {
  return isObservable(value) ? value : of(value);
}

export function randomBgColor() {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return `#${randomColor}`;
}

export function randomBgColorRGB() {
  // Generate a random integer between 0 and 255 for each color component
  const red = Math.floor(Math.random() * 256);
  const green = Math.floor(Math.random() * 256);
  const blue = Math.floor(Math.random() * 256);

  // Return the color in RGB format
  return `${red}, ${green}, ${blue}`;
}

export function randomTextColor() {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return getContrastYIQ(randomColor);
}

function getContrastYIQ(hexcolor: string) {
  const r = parseInt(hexcolor.slice(0, 2), 16);
  const g = parseInt(hexcolor.slice(2, 4), 16);
  const b = parseInt(hexcolor.slice(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#000' : '#fff';
}
