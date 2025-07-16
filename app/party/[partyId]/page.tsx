"use client";
import { getPartyId, updateParty, updatePion } from "@/actions";
import Pion from "@/app/components/Pion";
import Wrapper from "@/app/components/Wrapper";

import { Party } from "@/types";
import { useEffect, useState } from "react";

const page = ({ params }: { params: Promise<{ partyId: string }> }) => {
  const [party, setParty] = useState<Party | undefined>(undefined);
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
  }, []);

  const handleClick = async (id: number) => {
    if (party) {
      const newParty = { ...party };
      const users = [party.player1, party.player2];
      const userTour = users.find((u) => u.id === party.tourId);
      const pionSelected = party.pions.find((p) => p.id === id);
      if (party.isFilling && userTour && pionSelected) {
        const newTabs = [...party.pions];
        const pionIndex = newTabs.findIndex((p) => p.id === id);
        newTabs[pionIndex].color = userTour.color;
        pionSelected.color = userTour.color;
        newParty.tourId === newParty.player1Id
          ? (newParty.tourId = newParty.player2Id)
          : (newParty.tourId = newParty.player1Id);

        const isCreated = await updatePion(pionSelected, userTour.id);
        if (isCreated) {
          const nbrePionPlayer1 = party.pions.filter(
            (p) => p.color === party.player1.color
          ).length;
          const nbrePionPlayer2 = party.pions.filter(
            (p) => p.color === party.player2.color
          ).length;
          if (nbrePionPlayer1 === 12 && nbrePionPlayer2 === 12) {
            newParty.isFilling = false;
            newParty.isMoving = true;
          }
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
      if (party.isMoving) {
        console.log("mouving pion", id);
      }
      if (party.isCutting) {
        console.log("mouving pion", id);
      }
    }
  };

  return (
    <Wrapper>
      <div className="flex w-[90%] sm:w-2xl justify-center m-auto">
        <div className="flex  w-xl  justify-between items-center  mb-1 border border-base-300 rounded-2xl p-4">
          <div>
            <div
              className="text-lg font-bold uppercase"
              style={{ color: party?.player1.color }}
            >
              {party?.player1.username}
            </div>
            <div>
              <span className="font-semibold">Score:</span>{" "}
              <span
                className="text-xl font-bold text-white rounded-full p-1"
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
