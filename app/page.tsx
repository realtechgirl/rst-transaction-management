"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { EMPTY_TRANSACTION, Milestone, Party, PartyRole, SIDES, STATUSES, Transaction, TRANSACTION_TYPES } from "@/lib/types";
import { loadTransactions, saveTransactions } from "@/lib/storage";

const milestoneDefaults:Record<string,string[]>={
  "Residential Purchase":["Earnest money due","Inspection period ends","Loan application deadline","Loan approval deadline","Appraisal","Final walk-through","Closing"],
  "Residential Listing":["Listing agreement starts","Photos","Live on MLS","Listing agreement expires"],
  "Residential New Construction":["Earnest money due","Design selections","Loan approval","Certificate of occupancy","Final walk-through","Closing"],
  "Vacant Land Purchase":["Earnest money due","Due diligence ends","Survey due","Title review","Closing"],
  "Vacant Land Listing":["Listing agreement starts","Live on MLS","Listing agreement expires"],
  "Residential Lease":["Security deposit due","Move-in funds due","Move-in date"],
  "Rental Listing":["Listing agreement starts","Photos","Live on MLS","Listing agreement expires"]
};
const money=(v:string)=>v?new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(Number(v)):"—";
const uid=()=>crypto.randomUUID();

export default function Home(){
 const [items,setItems]=useState<Transaction[]>([]); const [selected,setSelected]=useState<string>(""); const [editing,setEditing]=useState(false); const [ready,setReady]=useState(false);
 useEffect(()=>{const saved=loadTransactions();setItems(saved);setSelected(saved[0]?.id||"");setReady(true)},[]);
 useEffect(()=>{if(ready)saveTransactions(items)},[items,ready]);
 const current=items.find(x=>x.id===selected);
 const startNew=()=>{setSelected("");setEditing(true)};
 const save=(value:Transaction)=>{setItems(old=>{const exists=old.some(x=>x.id===value.id);return exists?old.map(x=>x.id===value.id?value:x):[value,...old]});setSelected(value.id);setEditing(false)};
 if(!ready)return <main className="p-10">Opening your workspace…</main>;
 return <div className="min-h-screen"><header className="bg-[var(--ink)] text-white px-6 py-5 flex items-center justify-between"><div><p className="text-xs uppercase tracking-[.2em] text-emerald-100">Real Simple Transactions</p><h1 className="text-2xl font-semibold">Transaction Management</h1></div><button onClick={startNew} className="rounded-lg bg-[var(--gold)] px-4 py-2 font-bold">+ New transaction</button></header>
 <main className="mx-auto max-w-7xl p-5 grid gap-5 md:grid-cols-[320px_1fr]">
  <aside className="rounded-xl bg-white shadow-sm border border-stone-200 overflow-hidden"><div className="p-4 border-b"><h2 className="font-bold">Transactions</h2><p className="text-sm text-stone-500">{items.length} total</p></div>{items.length===0?<button onClick={startNew} className="m-4 p-6 border-2 border-dashed rounded-lg text-left text-stone-500">Create your first file to see it here.</button>:items.map(x=><button key={x.id} onClick={()=>{setSelected(x.id);setEditing(false)}} className={`w-full text-left p-4 border-b hover:bg-[var(--sage)] ${selected===x.id?"bg-[var(--sage)]":""}`}><span className="block font-bold">{x.address}</span><span className="text-sm text-stone-600">{x.transactionType} · {x.status}</span></button>)}</aside>
  <section>{editing?<TransactionForm initial={current} onCancel={()=>setEditing(false)} onSave={save}/>:current?<TransactionDetail item={current} onEdit={()=>setEditing(true)}/>:<div className="rounded-xl bg-white border p-10 text-center"><h2 className="text-xl font-bold">Your practical MVP starts here</h2><p className="mt-2 text-stone-600">Create, view, and update every supported transaction type.</p></div>}</section>
 </main></div>
}

function TransactionDetail({item,onEdit}:{item:Transaction,onEdit:()=>void}){
 return <div className="grid gap-4"><div className="rounded-xl bg-white border p-6"><div className="flex justify-between gap-4"><div><span className="text-sm font-bold text-emerald-800">{item.status}</span><h2 className="text-2xl font-bold mt-1">{item.address}</h2><p>{[item.city,item.state,item.postalCode].filter(Boolean).join(", ")}</p></div><button onClick={onEdit} className="h-fit border rounded-lg px-4 py-2 font-bold">Edit</button></div><div className="grid sm:grid-cols-3 gap-4 mt-6"><Fact label="Type" value={item.transactionType}/><Fact label="Side" value={item.side}/><Fact label="Price" value={money(item.purchasePrice)}/><Fact label="Effective" value={item.effectiveDate||"—"}/><Fact label="Closing" value={item.closingDate||"—"}/><Fact label="MLS" value={item.mlsNumber||"—"}/></div></div>
 <div className="grid lg:grid-cols-2 gap-4"><Panel title="People">{item.parties.length?item.parties.map(p=><div key={p.id} className="py-3 border-b last:border-0"><b>{p.name}</b><span className="block text-sm text-stone-500">{p.role}{p.company?` · ${p.company}`:""}</span></div>):<Empty text="No contacts added"/>}</Panel><Panel title="Important dates">{item.milestones.length?item.milestones.map(m=><div key={m.id} className="py-3 border-b last:border-0 flex justify-between"><span>{m.label}</span><span className="text-stone-500">{m.dueDate||"Not set"}</span></div>):<Empty text="No dates added"/>}</Panel></div>{item.notes&&<Panel title="Notes"><p className="whitespace-pre-wrap">{item.notes}</p></Panel>}</div>
}
function TransactionForm({initial,onSave,onCancel}:{initial?:Transaction,onSave:(x:Transaction)=>void,onCancel:()=>void}){
 const now=new Date().toISOString(); const [v,setV]=useState<Transaction>(initial?structuredClone(initial):{...structuredClone(EMPTY_TRANSACTION),id:uid(),createdAt:now,updatedAt:now});
 const set=(key:keyof Transaction,value:unknown)=>setV(x=>({...x,[key]:value}));
 const addParty=()=>set("parties",[...v.parties,{id:uid(),role:"Client",name:"",company:"",email:"",phone:""}]);
 const updateParty=(id:string,key:keyof Party,value:string)=>set("parties",v.parties.map(p=>p.id===id?{...p,[key]:value}:p));
 const loadDates=()=>set("milestones",milestoneDefaults[v.transactionType].map(label=>({id:uid(),label,dueDate:"",status:"Not started"} as Milestone)));
 const submit=(e:FormEvent)=>{e.preventDefault();onSave({...v,updatedAt:new Date().toISOString()})};
 return <form onSubmit={submit} className="grid gap-4"><Panel title={initial?"Update transaction":"Create transaction"}><div className="grid sm:grid-cols-2 gap-4"><Field label="Street address" required value={v.address} onChange={x=>set("address",x)}/><Select label="Transaction type" value={v.transactionType} options={[...TRANSACTION_TYPES]} onChange={x=>set("transactionType",x)}/><Field label="City" value={v.city} onChange={x=>set("city",x)}/><Field label="State" value={v.state} onChange={x=>set("state",x)}/><Field label="ZIP code" value={v.postalCode} onChange={x=>set("postalCode",x)}/><Field label="County" value={v.county} onChange={x=>set("county",x)}/><Select label="Side" value={v.side} options={[...SIDES]} onChange={x=>set("side",x)}/><Select label="Status" value={v.status} options={[...STATUSES]} onChange={x=>set("status",x)}/><Field label="Effective date" type="date" value={v.effectiveDate} onChange={x=>set("effectiveDate",x)}/><Field label="Closing / move-in date" type="date" value={v.closingDate} onChange={x=>set("closingDate",x)}/><Field label="Purchase / list / monthly price" type="number" value={v.purchasePrice} onChange={x=>set("purchasePrice",x)}/><Field label="MLS number" value={v.mlsNumber} onChange={x=>set("mlsNumber",x)}/><Field label="Financing type" value={v.financingType} onChange={x=>set("financingType",x)}/><Field label="TC fee" type="number" value={v.tcFee} onChange={x=>set("tcFee",x)}/></div></Panel>
 <Panel title="People"><div className="grid gap-4">{v.parties.map(p=><div key={p.id} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-stone-50 rounded-lg"><Select label="Role" value={p.role} options={["Client","Agent","Cooperating Agent","Title / Escrow","Lender"]} onChange={x=>updateParty(p.id,"role",x as PartyRole)}/><Field label="Name" value={p.name} onChange={x=>updateParty(p.id,"name",x)}/><Field label="Company" value={p.company} onChange={x=>updateParty(p.id,"company",x)}/><Field label="Email" type="email" value={p.email} onChange={x=>updateParty(p.id,"email",x)}/><Field label="Phone" value={p.phone} onChange={x=>updateParty(p.id,"phone",x)}/></div>)}<button type="button" onClick={addParty} className="border-2 border-dashed rounded-lg p-3 font-bold text-emerald-900">+ Add person</button></div></Panel>
 <Panel title="Important dates"><button type="button" onClick={loadDates} className="mb-3 border rounded-lg px-3 py-2 font-bold">Load suggested dates for this type</button>{v.milestones.map(m=><div key={m.id} className="grid grid-cols-[1fr_160px] gap-3 mb-3"><Field label="Milestone" value={m.label} onChange={x=>set("milestones",v.milestones.map(a=>a.id===m.id?{...a,label:x}:a))}/><Field label="Due date" type="date" value={m.dueDate} onChange={x=>set("milestones",v.milestones.map(a=>a.id===m.id?{...a,dueDate:x}:a))}/></div>)}</Panel>
 <Panel title="Notes"><textarea className="w-full border rounded-lg p-3 min-h-28" value={v.notes} onChange={e=>set("notes",e.target.value)}/></Panel><div className="flex justify-end gap-3"><button type="button" onClick={onCancel} className="px-4 py-2">Cancel</button><button className="bg-[var(--ink)] text-white rounded-lg px-5 py-2 font-bold">Save transaction</button></div></form>
}
function Panel({title,children}:{title:string,children:React.ReactNode}){return <section className="rounded-xl bg-white border border-stone-200 p-5"><h3 className="font-bold text-lg mb-4">{title}</h3>{children}</section>}
function Fact({label,value}:{label:string,value:string}){return <div><span className="text-xs uppercase text-stone-500 font-bold">{label}</span><span className="block mt-1">{value}</span></div>}
function Empty({text}:{text:string}){return <p className="text-stone-500">{text}</p>}
function Field({label,value,onChange,type="text",required=false}:{label:string,value:string,onChange:(x:string)=>void,type?:string,required?:boolean}){return <div className="field"><label>{label}</label><input required={required} type={type} value={value} onChange={e=>onChange(e.target.value)}/></div>}
function Select({label,value,options,onChange}:{label:string,value:string,options:string[],onChange:(x:string)=>void}){return <div className="field"><label>{label}</label><select value={value} onChange={e=>onChange(e.target.value)}>{options.map(x=><option key={x}>{x}</option>)}</select></div>}
