import type { InquiryChannel, InquiryStatus } from '../../types/db';
import { Badge } from '../ui/Badge';

export function InquiryStatusBadge({ status }: { status: InquiryStatus }) {
  if (status === 'new') return <Badge tone="red">New</Badge>;
  if (status === 'contacted') return <Badge tone="amber">Contacted</Badge>;
  return <Badge tone="green">Closed</Badge>;
}

export function InquiryChannelBadge({ channel }: { channel: InquiryChannel }) {
  if (channel === 'whatsapp') {
    return <Badge tone="green">WhatsApp</Badge>;
  }
  return <Badge tone="neutral">Website</Badge>;
}
