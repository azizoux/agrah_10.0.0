import { Pion, Party as PrismaParty, User } from "./generated/prisma";

export interface Party extends PrismaParty {
  player1: User;
  player2: User;
  pions: Pion[];
}

export type PionType = {
  id: number;
  abs: number;
  ord: number;
  color: string;
  partyId: number;
};
// export type party = {
//   isFilling: boolean;
//   isMoving: boolean;
//   isCutting: boolean;
//   tourId: number;
//   tourNumber: number;
//   selected: string;
//   firstPlayer: number;
// };
