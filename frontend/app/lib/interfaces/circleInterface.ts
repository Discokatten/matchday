export interface Circle {
  id: string;
  matchId: string;
  createdAt: string;
  membershipActive: boolean;
}
export type CircleErrorResponse = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
};
