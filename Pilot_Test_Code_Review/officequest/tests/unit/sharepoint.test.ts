import { expect, it } from 'vitest';
import { formatBytes, makeSharepointAttachment } from '@/lib/sharepoint';
it.each(['한글 보고서.xlsx','원가 분석 (최종).xlsx','a#b&c+%?.pdf'])('demo attachment preserves filename %s without generating a URL',(name)=>{
  expect(makeSharepointAttachment(name,1024,'f1')).toEqual({id:'f1',kind:'sharepoint',fileName:name,sizeBytes:1024});
});
it('formats file sizes',()=>{expect(formatBytes(1024)).toBe('1.0 KB');expect(formatBytes(1048576)).toBe('1.0 MB');});
