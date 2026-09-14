import { ContractStatus } from '@repo/schemas';
import { todayUtc } from '../../common/prisma-scalars';

export function autoExpire(row: {
  end_date: Date;
  status?: number | null;
}): ContractStatus {
  const status = (row.status ?? ContractStatus.Active) as ContractStatus;
  return status === ContractStatus.Active && row.end_date < todayUtc()
    ? ContractStatus.Expired
    : status;
}
