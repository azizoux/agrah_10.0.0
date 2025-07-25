"use client";
import { getPartyId, updateParty, updatePion, updateUser } from "@/actions";
import Pion from "@/app/components/Pion";
import Wrapper from "@/app/components/Wrapper";
import { useSocket } from "@/app/context/SocketContext";

import {
  getCurrentUser,
  getEmptyNearCases,
  getPionIndexById,
  getPlayerPions,
  getSecondUser,
  getUserTour,
  isAligned,
  isEmpty,
  isTitike,
  isUserTour,
  isWinAligned,
  togglePlayerTour,
} from "@/utils/agrah";
import { OctagonX } from "lucide-react";
import { useEffect, useState } from "react";

const page = ({ params }: { params: Promise<{ partyId: string }> }) => {
  const [selectedPionIndex, setSelectedPionIndex] = useState(0);
  const { party, setParty, socket, user } = useSocket();

  const fetchParty = async () => {
    try {
      const { partyId } = await params;
      const fetchedParty = await getPartyId(Number(partyId));
      if (fetchedParty) {
        setParty(fetchedParty);
        socket?.emit("joinParty", fetchedParty.id);
        // Envoyer un message à cette room
        socket?.emit("sendParty", {
          roomId: fetchedParty.id,
          data: fetchedParty,
        });
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
    console.log(user);
    if (!user) {
      console.log("User not connected...");
      return;
    }
    let newParty = { ...party };
    const pionSelected = newParty.pions.find((p) => p.id === id);
    if (!pionSelected) {
      console.log("Pion selected not found error...");
      return;
    }
    const currentUser = getCurrentUser(user.username, party);
    const secondUser = getSecondUser(user.username, party);
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
          newParty.tourId,
          newParty.tourNumber
        );
        socket?.emit("sendParty", {
          roomId: newParty.id,
          data: newParty,
        });
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
        setSelectedPionIndex(pionIndex + 1);
        // playSound([moveSounds[0]], 1000);
        socket?.emit("sendParty", {
          roomId: newParty.id,
          data: newParty,
        });
        return;
      } else if (selectedPionIndex && isEmpty(id, newParty)) {
        let nearEmptyPions = getEmptyNearCases(id, newParty);
        if (nearEmptyPions.includes(selectedPionIndex)) {
          newParty.pions[pionIndex].color = currentUser.color;
          newParty.pions[selectedPionIndex - 1].color = "gray";
          setSelectedPionIndex(0);
          if (isWinAligned(id, currentUser.id, newParty)) {
            newParty.isMoving = false;
            newParty.isCutting = true;
            //   playSound(fireSounds, 1500);
            socket?.emit("sendParty", {
              roomId: newParty.id,
              data: newParty,
            });
            return;
          }
          // playSound([moveSounds[1]], 1000);
          newParty = togglePlayerTour(newParty);
          socket?.emit("sendParty", {
            roomId: newParty.id,
            data: newParty,
          });
        }
      } else {
        newParty.pions[selectedPionIndex - 1].color = currentUser.color;
        setSelectedPionIndex(0);
        // playSound(alarmSounds, 500);
        socket?.emit("sendParty", {
          roomId: newParty.id,
          data: newParty,
        });
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
      socket?.emit("sendParty", {
        roomId: newParty.id,
        data: newParty,
      });
    }
  };
  const handleGameOver = async () => {
    const confirmRunning = confirm("Voulez vous fuir la partie?");
    if (!confirmRunning) return;
    if (!party) {
      console.log("Party not found error...");
      return;
    }
    let newParty = { ...party };
    let points = 0;
    if (!user) {
      console.log("User not connected...");
      return;
    }
    const currentUser = getCurrentUser(user.username, party);
    const secondUser = getSecondUser(user.username, party);
    if (!currentUser || !secondUser) {
      console.log("Users not found error...");
      return;
    }
    if (!isUserTour(newParty)) {
      console.log("Its not tour to player...");
      return;
    }
    points = secondUser.score + 1;
    let pionNumber = getPlayerPions(secondUser.id, newParty).length;
    // console.log("pionNumber", pionNumber);
    if (pionNumber === 12 || newParty.isFilling === true) {
      points++;
    }
    secondUser.score = points;
    secondUser.winNumber++;
    newParty.tourNumber++;
    currentUser.lostNumber++;
    newParty.tourId = secondUser.id;
    newParty.isFilling = true;
    newParty.isMoving = false;
    newParty.isCutting = false;
    for (let i = 0; i < 30; i++) {
      newParty.pions[i].color = "gray";
      await updatePion(newParty.pions[i], currentUser.id);
    }

    if (secondUser.score >= currentUser.gameLimit) {
      currentUser.gameLimit--;
      secondUser.score = 0;
      currentUser.score = 0;
    }
    if (currentUser.gameLimit === 0) {
      currentUser.gameLimit = 7;
      secondUser.gameLimit = 7;
      newParty.tourNumber = 1;
      console.log("Le joueur " + currentUser.username + " a un djidji !!!");
    }
    await updateParty(
      newParty.id,
      newParty.isFilling,
      newParty.isMoving,
      newParty.isCutting,
      newParty.tourId,
      newParty.tourNumber
    );
    await updateUser(
      currentUser.id,
      currentUser.score,
      currentUser.gameLimit,
      currentUser.winNumber
    );
    await updateUser(
      secondUser.id,
      secondUser.score,
      secondUser.gameLimit,
      secondUser.winNumber
    );
    console.log("Le joueur " + currentUser.username + " a perdu !!!");
    socket?.emit("sendParty", {
      roomId: newParty.id,
      data: newParty,
    });
  };

  return (
    <Wrapper>
      <div className="flex flex-col w-full sm:w-lg justify-center m-auto">
        <div className="flex w-xl  justify-between items-center  mb-1 border border-base-300 rounded-2xl p-4">
          <div>
            <div
              className="text-sm sm:text-lg font-bold uppercase"
              style={{ color: party?.player1.color }}
            >
              <span>{party?.player1.username}</span>
              <span>
                (
                {
                  party?.pions.filter((p) => p.color === party?.player1.color)
                    .length
                }
                )
              </span>
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
            <div className="flex flex-col items-center font-bold ">
              <span>***Tour de***</span>
              {party && (
                <span
                  className="bg-amber-800 text-white py-1 px-2 rounded-2xl"
                  style={{
                    backgroundColor: getUserTour(party)?.color,
                  }}
                >
                  {getUserTour(party)?.username}
                </span>
              )}
            </div>
          </div>
          <div>
            <div
              className="text-lg font-bold uppercase"
              style={{ color: party?.player2.color }}
            >
              <span>{party?.player2.username}</span>
              <span>
                (
                {
                  party?.pions.filter((p) => p.color === party?.player2.color)
                    .length
                }
                )
              </span>
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
      <button
        className="bg-amber-500 p-4 rounded-full shadow-2xl flex justify-center items-center m-auto cursor-pointer mt-4 "
        onClick={handleGameOver}
      >
        <OctagonX className="w-12 h-12" color="white" />
      </button>
    </Wrapper>
  );
};
export default page;
