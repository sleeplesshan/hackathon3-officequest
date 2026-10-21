'use client';
import { useEffect, useRef, useState } from 'react';
export function showDemoDownload() { window.dispatchEvent(new Event('oq:demo-download')); }
export default function DemoDownloadFeedback() {
  const [notice,setNotice]=useState(0),sequence=useRef(0);
  useEffect(()=>{
    let timer:ReturnType<typeof setTimeout>|undefined;
    const show=()=>{clearTimeout(timer);setNotice(++sequence.current);timer=setTimeout(()=>setNotice(0),1400);};
    window.addEventListener('oq:demo-download',show);
    return()=>{clearTimeout(timer);window.removeEventListener('oq:demo-download',show);};
  },[]);
  return notice?<div key={notice} className="download-notice" data-testid="demo-download-notice" role="status" aria-live="polite">다운로드 중</div>:null;
}
