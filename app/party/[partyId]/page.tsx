"use client";
import { getPartyId } from "@/actions";
import Pion from "@/app/components/Pion";
import Wrapper from "@/app/components/Wrapper";
import { data } from "@/constants/data";
import { Party, PionType } from "@/types";
import { useEffect, useState } from "react";

const page = ({ params }: { params: Promise<{ partyId: string }> }) => {
  const [users, setUsers] = useState(data.users);
  const [party, setParty] = useState<Party | undefined>(undefined);
  const [pions, setPions] = useState<PionType[]>([]);
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
  const ajustPionsTypes = () => {
    const newPions = [];
    for (const pion of data.pions) {
      newPions.push({ ...pion, partyId: 0 });
    }
    setPions(newPions);
  };
  useEffect(() => {
    ajustPionsTypes();
    fetchParty();
  }, []);
  const handleClick = async (id: number) => {
    const newPions = [...pions];
    const newParty = { ...party };
    const pionSelected = newPions.find((p) => p.id === id);
    const userTour = users.find((u) => u.id === party.tourId);
    if (pionSelected && userTour && party.isFilling) {
      pionSelected.color = userTour.color;
      const pionIndex = newPions.findIndex((p) => p.id === id);
      newPions[pionIndex] = pionSelected;
      newParty.tourId === 1 ? (newParty.tourId = 2) : (newParty.tourId = 1);
      // await putPion(pionSelected, userTour.id);
      setParty(newParty);
      setPions(newPions);
      // const userFirstPions = await getUserPionById(1);
      // const userSecondPions = await getUserPionById(2);
      // if (userFirstPions?.length === 12 && userSecondPions?.length === 12) {
      //   newParty.isFilling = false;
      //   newParty.isMoving = true;
      //   setParty(newParty);
      // }
    }
  };

  return (
    <Wrapper>
      <div className="flex w-[90%] sm:w-2xl justify-center m-auto">
        <div className="flex  w-xl  justify-between  mt-2">
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
      <div className="flex  w-full  justify-center mt-2">
        <div className="grid grid-cols-5 space-x-1 space-y-1.5">
          {pions &&
            pions.map((item, index) => (
              <Pion key={index} pion={item} handleClick={handleClick} />
            ))}
        </div>
      </div>
    </Wrapper>
  );
};
export default page;
