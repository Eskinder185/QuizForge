import React from "react";
export default function Segmented<T extends string>({ value, onChange, options }:{ value:T; onChange:(v:T)=>void; options:{value:T; label:string}[] }) {
  return (
    <div className="row panel" style={{ padding: 6 }}>
      {options.map(o=>{
        const active = o.value===value;
        return (
          <button key={o.value} onClick={()=>onChange(o.value)} className={"btn "+(active?"primary":"ghost")}>{o.label}</button>
        );
      })}
    </div>
  );
}
