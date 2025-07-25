"use server";
import { randomBytes } from "crypto";
import { Pion, User } from "@prisma/client";
import prisma from "./lib/prisma";
import { Party } from "./types";
import { tabs } from "./constants/tab";

export async function login(
  username: string,
  password: string
): Promise<User | undefined> {
  try {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
      include: {
        ownedParties: true,
        playedParties1: true,
        playedParties2: true,
      },
    });
    const isValidPassword = user?.password === password;
    if (!user || !isValidPassword) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    console.error(error);
  }
}

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
export async function getUserById(userId: number) {
  if (!userId) return;
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    return existingUser;
  } catch (error) {
    console.error(error);
  }
}
export async function getInitUserScore(userId: number) {
  if (!userId) return;
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (existingUser) {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          score: 0,
        },
      });
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
export async function getPartyByPlayer(player1Id: number, player2Id: number) {
  if (!player1Id || !player2Id) return;
  let isPlaying = true;
  try {
    let existingParty = await prisma.party.findFirst({
      where: {
        player1Id: player1Id,
      },
    });
    if (existingParty) return existingParty;

    existingParty = await prisma.party.findFirst({
      where: {
        player1Id: player2Id,
      },
    });
    if (existingParty) return existingParty;

    existingParty = await prisma.party.findFirst({
      where: {
        player2Id: player1Id,
      },
    });
    if (existingParty) return existingParty;

    existingParty = await prisma.party.findFirst({
      where: {
        player2Id: player2Id,
      },
    });
    if (existingParty) return existingParty;

    return false;
  } catch (error) {
    console.error(error);
  }
}
export async function getPartyById(partyId: number) {
  if (!partyId) return;
  try {
    let existingParty = await prisma.party.findFirst({
      where: {
        id: partyId,
      },
      include: {
        player1: true,
        player2: true,
      },
    });

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
      const users: User[] = await prisma.user.findMany({});
      const filteredUsers = users.filter((user) => user.id !== existingUser.id);
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
      console.log("a Party is ongoing with a player");
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
  tourId: number,
  tourNumber: number
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
        tourNumber,
      },
    });
  } catch (error) {
    console.error(error);
  }
}

export async function updateUser(
  id: number,
  score: number,
  gameLimit: number,
  winNumber: number
) {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        score,
        gameLimit,
        winNumber,
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

    const invitedParties = await prisma.party.findMany({
      where: {
        player2Id: existingUser.id,
      },
      include: {
        player1: true,
        player2: true,
        pions: true,
      },
    });

    const visitedParties = await prisma.party.findMany({
      where: {
        visitors: {
          some: {
            userId: existingUser.id,
          },
        },
      },
      include: {
        player1: true,
        player2: true,
        pions: true,
      },
    });

    return [...parties, ...invitedParties, ...visitedParties];
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export async function deletePartyById(partyId: number) {
  try {
    const existingParty = await prisma.party.findUnique({
      where: {
        id: partyId,
      },
      include: {
        pions: true,
      },
    });
    if (!existingParty) throw new Error("Party not found on deleting action!");
    for (const p of existingParty.pions) {
      await prisma.pion.delete({
        where: {
          id: p.id,
        },
      });
    }
    await prisma.party.delete({
      where: {
        id: partyId,
      },
    });
    console.log(`Party avec l'ID ${partyId} supprimé avec succès.`);
  } catch (error) {
    console.error(error);
    throw new Error();
  }
}
export async function addVisitorToParty(inviteCode: string, username: string) {
  try {
    const existingParty = await prisma.party.findUnique({
      where: {
        inviteCode: inviteCode,
      },
    });
    if (!existingParty)
      throw new Error("Party not found on addVisitorToParty action!");

    const user = await getUserByUsername(username);
    if (!user) throw new Error("User not found!");
    if (
      existingParty.ownerId === user.id ||
      existingParty.player2Id === user.id
    )
      throw new Error("You already taking part of this party!");
    const existingVisitor = await prisma.visitorUser.findFirst({
      where: {
        userId: user.id,
        partyId: existingParty.id,
      },
    });

    if (existingVisitor) {
      throw new Error("Visiteur déjà existant pour cette party.");
    }

    await prisma.visitorUser.create({
      data: {
        userId: user.id,
        partyId: existingParty.id,
      },
    });

    console.log("Visiteur ajouté avec succès a la partie.");
  } catch (error) {
    console.error("Erreur dans addVisitorToParty:", error);
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
