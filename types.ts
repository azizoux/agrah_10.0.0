import { Pion, Party as PrismaParty, User as PrismaUser } from "@prisma/client";

export interface Party extends PrismaParty {
  player1: User;
  player2: User;
  pions: Pion[];
}

export interface User extends PrismaUser {
  ownedParties: Party;
  playedParties1: Party;
  playedParties2: Party;
}

export type PionType = {
  id: number;
  abs: number;
  ord: number;
  color: string;
  partyId: number;
};
export interface OnlineUser {
  sockedId: string;
  username: string;
}
