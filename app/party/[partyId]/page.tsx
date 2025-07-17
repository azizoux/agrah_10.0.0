"use client";
import { getPartyId, updateParty, updatePion } from "@/actions";
import Pion from "@/app/components/Pion";
import Wrapper from "@/app/components/Wrapper";

import { Party } from "@/types";
import {
  getCurrentUser,
  getEmptyNearCases,
  getNearCases,
  getNotEmptyCases,
  getPionIndexById,
  getPlayerPions,
  getSecondUser,
  getUserTour,
  isAligned,
  isAlignedX,
  isAlignedY,
  isEmpty,
  isTitike,
  isUserTour,
  isWinAlignedX,
  togglePlayerTour,
} from "@/utils/agrah";
import { useEffect, useState } from "react";

const page = ({ params }: { params: Promise<{ partyId: string }> }) => {
  const [party, setParty] = useState<Party | undefined>(undefined);
  const [username, setUsername] = useState("");
  const fetchParty = async () => {
    try {
      const { partyId } = await params;
      const fetchedParty = await getPartyId(Number(partyId));
      if (fetchedParty) {
        setParty(fetchedParty);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchParty();
    const uname = localStorage.getItem("username");
    if (uname) setUsername(uname);
  }, []);
  console.log("current user:", username);

  const handleClick = async (id: number) => {
    if (party) {
      let newParty = { ...party };
      const currentUser = getCurrentUser(username, party);
      const secondUser = getSecondUser(username, party);
      const userTour = getUserTour(party);
      const pionIndex = getPionIndexById(id, party);
      const pionSelected = party.pions.find((p) => p.id === id);
      console.log("selected pion:", pionSelected, id);

      if (
        party.isFilling &&
        currentUser &&
        secondUser &&
        pionSelected &&
        userTour
      ) {
        if (
          !isEmpty(id, party) ||
          isAligned(id, currentUser.id, party) ||
          !isUserTour(username, party)
        ) {
          console.log("La case occupé ou alignement non autorisé!");
          //   playSound(alarmSounds, 500);
          return;
        } else {
          newParty.pions[pionIndex - 1].color = currentUser.color;
          if (
            getPlayerPions(currentUser.id, party).length === 12 &&
            getPlayerPions(secondUser.id, party).length === 12
          ) {
            newParty.isFilling = false;
            newParty.isMoving = true;
            console.log("+++++++Fin des depots des pions++++++++++", party);
          }
          newParty = togglePlayerTour(newParty);
          setUsername(username === "azizoux" ? "haroun" : "azizoux");
          //   playSound(puttingSounds, 500);
          const isUpdated = await updatePion(pionSelected, userTour.id);
          if (isUpdated) {
            await updateParty(
              newParty.id,
              newParty.isFilling,
              newParty.isMoving,
              newParty.isCutting,
              newParty.tourId
            );
            setParty(newParty);
          }
        }
      }
      if (party.isMoving) {
        console.log("pion index", isTitike(id, 1, party), id);
      }
      if (party.isCutting) {
        console.log("pion index", getPionIndexById(id, party));
      }
    }
  };

  return (
    <Wrapper>
      <div className="flex w-full sm:w-lg justify-center m-auto">
        <div className="flex  w-xl  justify-between items-center  mb-1 border border-base-300 rounded-2xl p-4">
          <div>
            <div
              className="text-sm sm:text-lg font-bold uppercase"
              style={{ color: party?.player1.color }}
            >
              {party?.player1.username}
            </div>
            <div>
              <span className="font-semibold">Score:</span>{" "}
              <span
                className="text-sm sm:text-xl font-bold text-white rounded-full p-1"
                style={{ background: party?.player1.color }}
              >
                {party?.player1.score}
              </span>{" "}
              /{" "}
              <span className="text-xl font-bold">
                {party?.player1.gameLimit}
              </span>
            </div>
          </div>
          <div>
            Tour$:
            <span className="p-2 rounded-full bg-amber-500 font-semibold text-lg">
              {party?.tourNumber}
            </span>
          </div>
          <div>
            <div
              className="text-lg font-bold uppercase"
              style={{ color: party?.player2.color }}
            >
              {party?.player2.username}
            </div>
            <div>
              <span className="font-semibold">Score:</span>{" "}
              <span
                className="text-xl font-bold text-white rounded-full p-1"
                style={{ background: party?.player2.color }}
              >
                {party?.player2.score}
              </span>{" "}
              /{" "}
              <span className="text-xl font-bold">
                {party?.player2.gameLimit}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex  w-full  justify-center  mt-2">
        <div className="grid grid-cols-5 space-x-1 space-y-1.5">
          {party?.pions.map((item, index) => (
            <Pion
              key={index}
              pion={item}
              handleClick={handleClick}
              index={index}
            />
          ))}
        </div>
      </div>
    </Wrapper>
  );
};
export default page;
