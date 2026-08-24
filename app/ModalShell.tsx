"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

export function ModalShell({eyebrow,title,onClose,children,className=""}:{eyebrow:string;title:string;onClose:()=>void;children:ReactNode;className?:string}){
  const closeRef=useRef<HTMLButtonElement>(null);
  const titleId=useId();

  useEffect(()=>{
    const overflow=document.body.style.overflow;
    const escape=(event:KeyboardEvent)=>{if(event.key==="Escape")onClose()};
    document.body.style.overflow="hidden";
    document.addEventListener("keydown",escape);
    closeRef.current?.focus();
    return()=>{document.body.style.overflow=overflow;document.removeEventListener("keydown",escape)};
  },[onClose]);

  return <div className="world-dialog-backdrop">
    <button className="world-dialog-dismiss" onClick={onClose} aria-label="Cerrar ventana"/>
    <section className={`world-dialog ${className}`.trim()} role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <header className="world-dialog-bar"><div><small>{eyebrow}</small><b id={titleId}>{title}</b></div><button ref={closeRef} className="world-dialog-close" onClick={onClose} aria-label="Cerrar ventana">×</button></header>
      <div className="world-dialog-content">{children}</div>
    </section>
  </div>;
}
