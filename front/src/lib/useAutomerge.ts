import React, { useEffect } from 'react';
import Automerge, { BinaryDocument } from 'automerge';
import { Buffer } from 'buffer';
import axios from 'axios';
import findLastIndex from 'lodash/findLastIndex';
// TOODOOOOO MAKE THE API CALL TO s3

export const encodeBin = (binary: Uint8Array): string =>
  // const decoder = new TextDecoder('utf8');
  // const b64encoded = Buffer.from(decoder.decode(u8));
  Buffer.from(binary).toString('base64');

export const decodeBin = (b64Str: string): Uint8Array =>
  new Uint8Array(Buffer.from(b64Str, 'base64'));
type AutomergeSetStateAction<D, T = Automerge.Proxy<D>> = {
  (message: string, callback: Automerge.ChangeFn<T>): void;
  (callback: Automerge.ChangeFn<T>): void;
};

const api = axios.create({
  baseURL: 'http://localhost:2729/dev/',
});

const saveDoc = async (doc: Automerge.FreezeObject<any>) => {
  const response = await api.get<{ putUrl: string; getUrl: string }>('bucket');
  const { putUrl } = response.data;
  const binaries = Automerge.save(doc);
  console.log('Sending ', binaries);
  return axios.put(putUrl, binaries);
};

const getLatestDoc = async () => {
  const response = await api.get<{ putUrl: string; getUrl: string }>('bucket');
  const { getUrl } = response.data;
  const file = await axios.get(getUrl, { responseType: 'arraybuffer' });
  const bytes = new Uint8Array(file.data);
  const firstNoneZero = bytes.findIndex((b) => b !== 0);
  const firstNoneZeroRight = findLastIndex(bytes, (b: number) => b !== 0);
  console.log(
    { firstNoneZero, firstNoneZeroRight },
    bytes,
    bytes.slice(firstNoneZero, firstNoneZeroRight + 1),
  );
  return bytes.slice(firstNoneZero, firstNoneZeroRight + 1); // for some reason s3 is adding 3 empty byres before the file
};

const STORAGE_KEY = 'hello';
export function useAutomerge<T = unknown>(
  initValue: T,
): // initialDoc: T | (() => T),
[Automerge.FreezeObject<T>, AutomergeSetStateAction<T>] {
  const [doc, setDoc] = React.useState(() => {
    const initData = window.localStorage.getItem(STORAGE_KEY);
    // const initBinary = initData != null && decodeBin(initData);
    // if (initBinary) return Automerge.load<T>(initBinary as BinaryDocument);
    return Automerge.from<T>(initValue);
  });

  useEffect(() => {
    getLatestDoc().then((data) => {
      console.log(data);
      const upToDateDoc = Automerge.load<T>(data as BinaryDocument);
      setDoc(upToDateDoc);
    });
  }, []);

  // useEffect(() => {
  //   console.log('I changed');
  //   window.localStorage.setItem(STORAGE_KEY, encodeBin(Automerge.save(doc)));
  //   saveDoc(doc)
  //     .then(() => getLatestDoc())
  //     .then(console.log);
  // }, [doc]);
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
