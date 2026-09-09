import { todayUtc } from '../../common/prisma-scalars';

export function autoExpire(row: {
  end_date: Date;
  status?: string | null;
}): string {
  const status = row.status ?? 'Active';
  return status === 'Active' && row.end_date < todayUtc() ? 'Expired' : status;
}
