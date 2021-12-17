import React, { useEffect } from 'react';
import Automerge, { BinaryDocument } from 'automerge';
import {Buffer} from 'buffer';
export const encodeBin = (binary: Uint8Array): string =>
  // const decoder = new TextDecoder('utf8');
  // const b64encoded = Buffer.from(decoder.decode(u8));
  Buffer.from(binary).toString('base64');

export const decodeBin = (b64Str: string): Uint8Array => {
  return new Uint8Array(Buffer.from(b64Str, 'base64'));
};
type AutomergeSetStateAction<D, T = Automerge.Proxy<D>> = {
  (message: string, callback: Automerge.ChangeFn<T>): void;
  (callback: Automerge.ChangeFn<T>): void;
};

const STORAGE_KEY = 'hello';
export function useAutomerge<T = unknown>(
  initValue: T,
): // initialDoc: T | (() => T),
[Automerge.FreezeObject<T>, AutomergeSetStateAction<T>] {
  const [doc, setDoc] = React.useState(() => {
    const initData = window.localStorage.getItem(STORAGE_KEY);
    const initBinary = initData != null && decodeBin(initData);
    if (initBinary) return Automerge.load<T>(initBinary as BinaryDocument);
    return Automerge.from<T>(initValue);
  });

  useEffect(() => {
    console.log('I changed');
    window.localStorage.setItem(STORAGE_KEY, encodeBin(Automerge.save(doc)));
  }, [doc]);
  return [
    doc,
    React.useCallback(
      ((message: any, updater: any) => {
        console.time('record');
        console.log('Hey');
        // optional message
        setDoc(Automerge.change(doc, message, updater));
        console.timeLog('record');

        console.timeEnd('record');
      }) as AutomergeSetStateAction<T>,
      [doc],
    ),
  ];
}
