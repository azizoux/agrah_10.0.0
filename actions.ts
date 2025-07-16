"use server";
import { randomBytes } from "crypto";
import { data } from "./constants/data";
import { User } from "./generated/prisma";
import prisma from "./lib/prisma";
import { Party, PionType } from "./types";

export async function getUserByUsername(username: string) {
  if (!username) return;
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    return existingUser;
  } catch (error) {
    console.error(error);
  }
}
export async function getPartyByPlayer(player1Id: number, player2Id: number) {
  if (!player1Id || !player2Id) return;
  try {
    let existingParty = await prisma.party.findFirst({
      where: {
        player1Id: player1Id,
        player2Id: player2Id,
      },
    });
    if (!existingParty) {
      existingParty = await prisma.party.findFirst({
        where: {
          player1Id: player2Id,
          player2Id: player1Id,
        },
      });
    }
    return existingParty;
  } catch (error) {
    console.error(error);
  }
}
export async function getUserList(
  username: string
): Promise<User[] | undefined> {
  if (!username) return;
  try {
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      const users = await prisma.user.findMany({});
      const filteredUsers = users.filter((u) => u.id !== existingUser.id);
      return filteredUsers;
    }
    return [];
  } catch (error) {
    console.error(error);
  }
}
function generateUniqueCode(): string {
  return randomBytes(6).toString("hex");
}

export async function createParty(username: string, player2: string) {
  if (!username) return;
  try {
    const existingUser = await getUserByUsername(username);
    const invitedPlayer = await getUserByUsername(player2);
    if (!existingUser || !invitedPlayer) throw new Error("Users not found!");
    const existingParty = await getPartyByPlayer(
      existingUser.id,
      invitedPlayer.id
    );
    if (existingParty) {
      return false;
    }

    const inviteCode = generateUniqueCode();
    const party = await prisma.party.create({
      data: {
        name: "party",
        inviteCode,
        ownerId: existingUser.id,
        player1Id: existingUser.id,
        player2Id: invitedPlayer.id,
      },
    });
    return true;
  } catch (error) {
    console.error(error);
  }
}

export async function listParty(
  username: string
): Promise<Party[] | undefined> {
  if (!username) return;
  try {
    const existingUser = await getUserByUsername(username);
    if (!existingUser) throw new Error("Users not found!");
    const parties = await prisma.party.findMany({
      where: {
        ownerId: existingUser.id,
      },
      include: {
        player1: true,
        player2: true,
      },
    });

    return parties;
  } catch (error) {
    console.error(error);
  }
}

export async function getPartyId(partyId: number): Promise<Party | undefined> {
  try {
    const party = await prisma.party.findUnique({
      where: { id: partyId },
      include: {
        player1: true,
        player2: true,
      },
    });
    if (!party) {
      throw new Error("Facture non trouvée");
    }
    return party;
  } catch (error) {
    console.error(error);
  }
}
