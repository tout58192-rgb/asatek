import type { InquiryChannel, InquiryStatus } from '../../types/db';
import { Badge } from '../ui/Badge';

export function InquiryStatusBadge({ status }: { status: InquiryStatus }) {
  if (status === 'new') return <Badge tone="red">New</Badge>;
  if (status === 'contacted') return <Badge tone="amber">Contacted</Badge>;
  if (status === 'confirmed') return <Badge tone="green">Confirmed</Badge>;
  if (status === 'dispatched') return <Badge tone="amber">Dispatched</Badge>;
  if (status === 'completed') return <Badge tone="green">Completed</Badge>;
  if (status === 'skipped') return <Badge tone="amber">Skipped</Badge>;
  if (status === 'cancelled') return <Badge tone="red">Cancelled</Badge>;
  return <Badge tone="neutral">Closed</Badge>;
}

export function InquiryChannelBadge({ channel }: { channel: InquiryChannel }) {
  if (channel === 'whatsapp') {
    return <Badge tone="green">WhatsApp</Badge>;
  }
  return <Badge tone="neutral">Website</Badge>;
}
