"use client";

export function reportIssueUrl(kind:string,id:number|string,name:string){
  const title=encodeURIComponent(`[dato] ${kind} #${id} ${name}`);
  const body=encodeURIComponent(`Describe qué está mal en esta ficha:\n\n\n---\nURL: ${window.location.href}`);
  return `https://github.com/CidZigon/ascencion-ro-guia/issues/new?title=${title}&body=${body}`;
}

export function ReportIssueLink({kind,id,name,label}:{kind:string;id:number|string;name:string;label:string}){
  return <a className="report-issue-link" href={reportIssueUrl(kind,id,name)} target="_blank" rel="noreferrer">{label}</a>;
}
