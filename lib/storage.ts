import { Transaction } from "./types";
const KEY="rst-transactions-v1";

export function loadTransactions():Transaction[]{
  if(typeof window==="undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
export function saveTransactions(items:Transaction[]){ localStorage.setItem(KEY,JSON.stringify(items)); }
