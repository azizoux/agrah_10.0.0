"use client";
import { getPartyId, updateParty, updatePion } from "@/actions";
import Pion from "@/app/components/Pion";
import Wrapper from "@/app/components/Wrapper";
import { useSocket } from "@/app/context/SocketContext";

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
  isWinAligned,
  isWinAlignedX,
  togglePlayerTour,
} from "@/utils/agrah";
import { useEffect, useState } from "react";

const page = ({ params }: { params: Promise<{ partyId: string }> }) => {
  const [selectedPionIndex, setSelectedPionIndex] = useState(0);
  const { party, setParty, socket, isConnected, username } = useSocket();

  const fetchParty = async () => {
    try {
      const { partyId } = await params;
      if (!party) {
        const fetchedParty = await getPartyId(Number(partyId));
        if (fetchedParty) {
          setParty(fetchedParty);
          socket?.emit("sendParty", fetchedParty);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchParty();
  }, []);

  const handleClick = async (id: number) => {
    if (!party) {
      console.log("Party not found error...");
      return;
    }
    let newParty = { ...party };
    const pionSelected = newParty.pions.find((p) => p.id === id);
    if (!pionSelected) {
      console.log("Pion selected not found error...");
      return;
    }
    const currentUser = getCurrentUser(username, party);
    const secondUser = getSecondUser(username, party);
    if (!currentUser || !secondUser) {
      console.log("Users not found error...");
      return;
    }
    if (!isUserTour(newParty)) {
      console.log("Its not tour to player...");
      return;
    }
    const userTour = getUserTour(party);
    if (!userTour) {
      console.log("User tour error...");
      return;
    }
    const pionIndex = getPionIndexById(id, party);
    if (party.isFilling) {
      if (!isEmpty(id, party) || isAligned(id, currentUser.id, party)) {
        console.log("La case occupé ou alignement non autorisé!");
        //   playSound(alarmSounds, 500);
        return;
      }
      newParty.pions[pionIndex - 1].color = currentUser.color;
      if (
        getPlayerPions(currentUser.id, newParty).length === 12 &&
        getPlayerPions(secondUser.id, newParty).length === 12
      ) {
        newParty.isFilling = false;
        newParty.isMoving = true;
        console.log("+++++++Fin des depots des pions++++++++++", party);
      }
      newParty = togglePlayerTour(newParty);
      //   playSound(puttingSounds, 500);
      const isUpdated = await updatePion(pionSelected, userTour.id);
      if (isUpdated) {
        setParty(newParty);
        await updateParty(
          newParty.id,
          newParty.isFilling,
          newParty.isMoving,
          newParty.isCutting,
          newParty.tourId
        );
        socket?.emit("sendParty", newParty);
      }
    }
    if (party.isMoving) {
      if (!userTour) {
        console.log("Its not tour to player...");
        return;
      }
      const pionIndex = newParty.pions.findIndex((p) => p.id === id);
      if (!selectedPionIndex && isEmpty(id, newParty)) {
        console.log("Select an empty case to move");

        return;
      }
      const currentUserPions = getPlayerPions(currentUser.id, party);
      console.log("currentUserPions", currentUserPions);

      if (!currentUserPions.includes(pionIndex + 1) && !selectedPionIndex) {
        console.log("Le pion " + id + " choisit n'est pas votre pions");
        //   playSound(alarmSounds, 500);
        return;
      }
      if (isTitike(id, currentUser.id, newParty)) {
        console.log("isTitike: ", isTitike(id, currentUser.id, newParty));
        // playSound(alarmSounds, 500);
        return;
      }
      if (selectedPionIndex === 0 && !isEmpty(id, newParty)) {
        newParty.pions[pionIndex].color = "orange";
        setSelectedPionIndex(pionIndex);
        // playSound([moveSounds[0]], 1000);
        socket?.emit("sendParty", newParty);
        return;
      } else if (selectedPionIndex && isEmpty(id, newParty)) {
        let nearEmptyPions = getEmptyNearCases(id, newParty);
        if (nearEmptyPions.includes(selectedPionIndex + 1)) {
          newParty.pions[pionIndex].color = currentUser.color;
          newParty.pions[selectedPionIndex].color = "gray";
          setSelectedPionIndex(0);
          if (isWinAligned(id, currentUser.id, newParty)) {
            newParty.isMoving = false;
            newParty.isCutting = true;
            //   playSound(fireSounds, 1500);
            socket?.emit("sendParty", newParty);
            return;
          }
          // playSound([moveSounds[1]], 1000);
          newParty = togglePlayerTour(newParty);
          socket?.emit("sendParty", newParty);
        }
      } else {
        newParty.pions[selectedPionIndex].color = currentUser.color;
        setSelectedPionIndex(0);
        // playSound(alarmSounds, 500);
        socket?.emit("sendParty", newParty);
      }
    }
    if (party.isCutting) {
      // console.log("Cutting Pion party executed");
      const secondUserPions = getPlayerPions(secondUser.id, newParty);
      const pionIndex = newParty.pions.findIndex((p) => p.id === id);
      if (!secondUserPions.includes(pionIndex + 1)) {
        console.log("Veuillez choisir un pion de l'adversaire");
        // playSound(alarmSounds, 500);
        return;
      }
      newParty.pions[pionIndex].color = "gray";
      newParty.isMoving = true;
      newParty.isCutting = false;
      //   playSound(cutSounds, 1500);
      newParty = togglePlayerTour(newParty);
      socket?.emit("sendParty", newParty);
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
              {party?.tourNumber}{" "}
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
      <div className="flex w-full justify-center  mt-2 bg-base-200/90 p-4 sm:w-lg shadow m-auto rounded-2xl">
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
