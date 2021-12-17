/* eslint-disable no-param-reassign */
import React, { useState } from 'react';
import './App.css';
import Automerge from 'automerge';
import { nanoid } from 'nanoid';
import { encodeBin, useAutomerge } from './lib/useAutomerge';

type Expense = { key: string; name: string; value: number };
type DataT = {
  expenses: Expense[];
};
function App() {
  const [doc, updateDoc] = useAutomerge<DataT>({ expenses: [] });
  const [value, setValue] = useState(0);
  const [name, setName] = useState('');
  return (
    <div>
      <main className="">
        <h1 className="">Pepper</h1>
        <hr className="" />
        <div>
          <div>
            <h2>Expenses</h2>
          </div>
          <ul>
            {doc.expenses.map((e, index) => (
              <li key={e.key}>
                {e.name} - {e.value}{' '}
                <button
                  onClick={() =>
                    updateDoc((d) => {
                      delete d.expenses[index];
                    })
                  }
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div>
            <input
              type="number"
              placeholder="Value"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
            />
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              onClick={() =>
                updateDoc((d) =>
                  d.expenses.push({ key: nanoid(), name, value }),
                )
              }
            >
              Add expense
            </button>
          </div>
          <div>
            <h2>Dump</h2>
            <div>Size dump: {encodeBin(Automerge.save(doc)).length}</div>
            <div>Size json: {JSON.stringify(doc).length}</div>
            <h2>History</h2>
            <div>
              {Automerge.getHistory(doc).map((d) => (
                <div key={d.change.hash}>
                  {d.change.time} - {d.snapshot.expenses.length}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
