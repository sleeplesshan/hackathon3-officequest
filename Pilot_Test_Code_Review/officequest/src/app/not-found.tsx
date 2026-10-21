import Link from 'next/link';
export default function NotFound(){return <main className="not-found"><h1>요청한 항목을 찾을 수 없어요</h1><p>주소를 확인하거나 대시보드에서 다시 시작해 주세요.</p><Link className="btn pri" href="/">대시보드로</Link></main>;}
