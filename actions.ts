"use server";
import { randomBytes } from "crypto";
import { Pion, User } from "./generated/prisma";
import prisma from "./lib/prisma";
import { Party } from "./types";
import { tabs } from "./constants/tab";

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
        isFilling: true,
        tourId: existingUser.id,
      },
    });
    if (party) {
      for (const pion of tabs) {
        const cretedPion = await prisma.pion.create({
          data: {
            abs: pion.abs,
            ord: pion.ord,
            color: pion.color,
            partyId: party.id,
          },
        });
      }
    }
    return true;
  } catch (error) {
    console.error(error);
  }
}
export async function updateParty(
  partyId: number,
  isFilling: boolean,
  isMoving: boolean,
  isCutting: boolean,
  tourId: number
) {
  try {
    const updatedParty = await prisma.party.update({
      where: {
        id: partyId,
      },
      data: {
        isFilling,
        isMoving,
        isCutting,
        tourId,
      },
    });
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
        pions: true,
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
        pions: true,
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
export async function createPion(pion: Pion, userTourId: number) {
  try {
    const cretedPion = await prisma.pion.create({
      data: {
        abs: pion.abs,
        ord: pion.ord,
        color: pion.color,
        partyId: pion.partyId,
      },
    });
    if (!cretedPion) {
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
  }
}

export async function updatePion(pion: Pion, userTourId: number) {
  try {
    const cretedPion = await prisma.pion.update({
      where: {
        id: pion.id,
      },
      data: {
        abs: pion.abs,
        ord: pion.ord,
        color: pion.color,
        partyId: pion.partyId,
      },
    });
    if (!cretedPion) {
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
  }
}
