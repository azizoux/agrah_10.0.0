import { Pion } from "@prisma/client";
import { Party } from "@/types";

export function getPionIndexById(pionId: number, party: Party) {
  return party.pions.findIndex((p) => p.id === pionId) + 1;
}

export function getPionIndexByCoord(abs: number, ord: number, party: Party) {
  return party.pions.findIndex((p) => p.abs === abs && p.ord === ord) + 1;
}

export function getNearCases(pionId: number, party: Party) {
  let nearCases = [];
  const pion = party.pions.find((p) => p.id === pionId);
  if (pion) {
    let { abs, ord } = pion;
    let x1 = abs + 1;
    let x2 = abs - 1;
    let y1 = ord + 1;
    let y2 = ord - 1;
    if (x1 >= 0 && x1 <= 5) {
      let key = getPionIndexByCoord(x1, ord, party);
      nearCases.push(key);
    }
    if (x2 >= 0 && x2 <= 5) {
      let key = getPionIndexByCoord(x2, ord, party);
      nearCases.push(key);
    }

    if (0 <= y1 && y1 <= 4) {
      let key = getPionIndexByCoord(abs, y1, party);
      nearCases.push(key);
    }

    if (0 <= y2 && y2 <= 4) {
      let key = getPionIndexByCoord(abs, y2, party);
      nearCases.push(key);
    }
    return nearCases;
  }
  return [];
}

// Renvoi la liste des cases occupees
export function getNotEmptyCases(party: Party) {
  const notEmptyCases: number[] = [];
  party.pions.forEach((p) => {
    if (p.color === party.player1.color || p.color === party.player2.color) {
      notEmptyCases.push(getPionIndexById(p.id, party));
    }
  });
  return notEmptyCases;
}
// Test si une case est vide
export function isEmpty(pionId: number, party: Party) {
  const pionIndex = getPionIndexById(pionId, party);
  return getNotEmptyCases(party).includes(pionIndex) ? false : true;
}
// Renvoi la liste des cases vide frontiere a une case donnee
export function getEmptyNearCases(pionId: number, party: Party) {
  let emptyNearCases: number[] = [];
  let filledCases = getNotEmptyCases(party);
  let nearCases = getNearCases(pionId, party);
  nearCases.forEach((nc) => {
    if (!filledCases.includes(nc)) {
      emptyNearCases.push(nc);
    }
  });
  return emptyNearCases;
}

// Retourne la liste des pions d'un player donnee
export function getPlayerPions(playerId: number, party: Party) {
  const playerPions: number[] = [];
  const players = [party.player1, party.player2];
  const player = players.find((p) => p.id === playerId);
  if (player) {
    party.pions
      .filter((p) => p.color === player.color)
      .forEach((el) => {
        playerPions.push(getPionIndexById(el.id, party));
      });
    return playerPions;
  }
  return [];
}

// Function utils pour verifications des alignement

export function isAlignedY(pionId: number, playerId: number, party: Party) {
  const pion = party.pions.find((p) => p.id === pionId);
  if (pion) {
    let { abs, ord } = pion;
    let current_pions: number[] = getPlayerPions(playerId, party);
    let x1 = abs + 1;
    let x2 = abs + 2;
    let x3 = abs - 1;
    let x4 = abs - 2;
    let pointAligned = [];
    if (0 <= x1 && x1 <= 5) {
      let c = getPionIndexByCoord(x1, ord, party);
      if (current_pions.includes(c)) {
        pointAligned.push(c);
        if (0 <= x2 && x2 <= 5) {
          c = getPionIndexByCoord(x2, ord, party);
          if (current_pions.includes(c)) pointAligned.push(c);
        }
      }
    }

    if (0 <= x3 && x3 <= 5) {
      let key = getPionIndexByCoord(x3, ord, party);
      if (current_pions.includes(key)) {
        pointAligned.push(key);
        if (0 <= x4 && x4 <= 5) {
          key = getPionIndexByCoord(x4, ord, party);
          if (current_pions.includes(key)) pointAligned.push(key);
        }
      }
    }

    if (pointAligned.length >= 2) return true;
    return false;
  }
}

export function isAlignedX(pionId: number, playerId: number, party: Party) {
  const pion = party.pions.find((p) => p.id === pionId);
  if (pion) {
    let { abs, ord } = pion;
    let current_pions: number[] = getPlayerPions(playerId, party);
    let y1 = ord + 1;
    let y2 = ord + 2;
    let y3 = ord - 1;
    let y4 = ord - 2;
    let pointAligned = [];
    if (0 <= y1 && y1 <= 4) {
      let key = getPionIndexByCoord(abs, y1, party);
      if (current_pions.includes(key)) {
        pointAligned.push(key);
        if (0 < y2 && y2 <= 4) {
          key = getPionIndexByCoord(abs, y2, party);
          if (current_pions.includes(key)) pointAligned.push(key);
        }
      }
    }

    if (0 <= y3 && y3 <= 4) {
      let key = getPionIndexByCoord(abs, y3, party);
      if (current_pions.includes(key)) {
        pointAligned.push(key);
        if (0 <= y4 && y4 <= 4) {
          key = getPionIndexByCoord(abs, y4, party);
          if (current_pions.includes(key)) pointAligned.push(key);
        }
      }
    }
    if (pointAligned.length >= 2) return true;
    return false;
  }
}

export function isWinAlignedX(pionId: number, playerId: number, party: Party) {
  const pion = party.pions.find((p) => p.id === pionId);
  if (pion) {
    let { abs, ord } = pion;
    let current_pions: number[] = getPlayerPions(playerId, party);
    let y1 = ord + 1;
    let y2 = ord + 2;
    let y3 = ord + 3;
    let y4 = ord - 1;
    let y5 = ord - 2;
    let y6 = ord - 3;
    let pionAligned = [];
    if (0 <= y1 && y1 <= 4) {
      let key = getPionIndexByCoord(abs, y1, party);
      if (current_pions.includes(key)) {
        pionAligned.push(key);
        if (0 < y2 && y2 <= 4) {
          key = getPionIndexByCoord(abs, y2, party);
          if (current_pions.includes(key)) {
            pionAligned.push(key);
            if (0 < y3 && y3 <= 4) {
              let key = getPionIndexByCoord(abs, y3, party);
              if (current_pions.includes(key)) {
                pionAligned.push(key);
              }
            }
          }
        }
      }
    }

    if (0 <= y4 && y4 <= 4) {
      let key = getPionIndexByCoord(abs, y4, party);
      if (current_pions.includes(key)) {
        pionAligned.push(key);
        if (0 <= y5 && y5 <= 4) {
          key = getPionIndexByCoord(abs, y5, party);
          if (current_pions.includes(key)) {
            pionAligned.push(key);
            if (0 <= y6 && y6 <= 4) {
              let key = getPionIndexByCoord(abs, y6, party);
              if (current_pions.includes(key)) {
                pionAligned.push(key);
              }
            }
          }
        }
      }
    }
    if (pionAligned.length === 2) return true;
    return false;
  }
}

export function isWinAlignedY(pionId: number, playerId: number, party: Party) {
  const pion = party.pions.find((p) => p.id === pionId);
  if (pion) {
    let { abs, ord } = pion;
    let current_pions: number[] = getPlayerPions(playerId, party);
    let x1 = abs + 1;
    let x2 = abs + 2;
    let x3 = abs + 3;
    let x4 = abs - 1;
    let x5 = abs - 2;
    let x6 = abs - 3;
    let pionAligned = [];
    if (0 <= x1 && x1 <= 5) {
      let c = getPionIndexByCoord(x1, ord, party);
      if (current_pions.includes(c)) {
        pionAligned.push(c);
        if (0 <= x2 && x2 <= 5) {
          let c = getPionIndexByCoord(x2, ord, party);
          if (current_pions.includes(c) === true) {
            pionAligned.push(c);
            if (0 <= x3 && x3 <= 5) {
              let c = getPionIndexByCoord(x3, ord, party);
              if (current_pions.includes(c)) {
                pionAligned.push(c);
              }
            }
          }
        }
      }
    }

    if (0 <= x4 && x4 <= 5) {
      let key = getPionIndexByCoord(x4, ord, party);
      if (current_pions.includes(key)) {
        pionAligned.push(key);
        if (0 <= x5 && x5 <= 5) {
          let key = getPionIndexByCoord(x5, ord, party);
          if (current_pions.includes(key)) {
            pionAligned.push(key);
            if (0 <= x6 && x6 <= 5) {
              let c = getPionIndexByCoord(x6, ord, party);
              if (current_pions.includes(c)) {
                pionAligned.push(c);
              }
            }
          }
        }
      }
    }
    if (pionAligned.length === 2) return true;
    return false;
  }
}

// Function permettant de changer de tour
export function togglePlayerTour(party: Party) {
  const newParty = { ...party };
  newParty.tourId =
    party.tourId === party.player1.id ? party.player2.id : party.player1.id;
  return newParty;
}

// Verifie si la case est dans un alignement au moins trois case occupe
//par les pions du meme player
export function isAligned(pionId: number, playerId: number, party: Party) {
  if (
    isAlignedX(pionId, playerId, party) ||
    isAlignedY(pionId, playerId, party)
  ) {
    return true;
  }

  return false;
}

// Aligment gagnant
export function isWinAligned(pionId: number, playerId: number, party: Party) {
  if (
    isAlignedX(pionId, playerId, party) &&
    isAlignedY(pionId, playerId, party)
  ) {
    if (
      !isWinAlignedX(pionId, playerId, party) ||
      !isWinAlignedY(pionId, playerId, party)
    )
      return false;
  }
  if (
    isWinAlignedX(pionId, playerId, party) ||
    isWinAlignedY(pionId, playerId, party)
  )
    return true;
  return false;
}

// function to verify if its titike
export function isTitike(pionId: number, playerId: number, party: Party) {
  if (isEmpty(pionId, party)) {
    return false;
  }
  if (
    isAlignedX(pionId, playerId, party) &&
    isAlignedY(pionId, playerId, party)
  ) {
    return false;
  }
  if (isWinAligned(pionId, playerId, party)) {
    let arrow: number[] = [];
    const nearCases = getNearCases(pionId, party);
    let current_pions = getPlayerPions(playerId, party);
    nearCases.forEach((p) => {
      if (current_pions.includes(p)) {
        arrow.push(p);
      }
    });
    if (arrow.length === 3) {
      return true;
    }
  }
  return false;
}
export function getCurrentUser(username: string, party: Party) {
  const users = [party.player1, party.player2];
  const currentUser = users.find((u) => u.username === username);
  return currentUser;
}
export function getSecondUser(username: string, party: Party) {
  const users = [party.player1, party.player2];
  const secondUser = users.find((u) => u.username !== username);
  return secondUser;
}
export function getUserTour(party: Party) {
  const users = [party.player1, party.player2];
  const userTour = users.find((u) => u.id === party.tourId);
  return userTour;
}
export function isUserTour(party: Party) {
  const users = [party.player1, party.player2];
  const localUserName = localStorage.getItem("username");
  const userTour = users.find((u) => u.username === localUserName);
  if (userTour) {
    return userTour.id === party.tourId;
  }
  return false;
}
