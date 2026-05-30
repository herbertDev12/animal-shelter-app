export type TopUser = {
  rank: number;
  id: string;
  name: string;
  email: string;
  totalRevenue: number;
};

export type TopUsersTableProps = {
  data: TopUser[];
};