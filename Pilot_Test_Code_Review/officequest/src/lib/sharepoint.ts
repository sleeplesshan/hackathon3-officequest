import type { Attachment } from './types';
export { formatBytes } from './format';
// Demo attachment metadata only: never construct a real external URL.
export const makeSharepointAttachment = (fileName:string,sizeBytes:number,id=fileName):Attachment => ({id,kind:'sharepoint',fileName,sizeBytes});
export const attachmentForFile = makeSharepointAttachment;
