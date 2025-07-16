"use client";
import { data } from "@/constants/data";
import { PionType } from "@/types";
import { useEffect, useState } from "react";
import Pion from "../components/Pion";
import Wrapper from "../components/Wrapper";

export default function page() {
  const [users, setUsers] = useState(data.users);
  const [party, setParty] = useState(data.party);
  const [pions, setPions] = useState<PionType[]>([]);
  const ajustPionsTypes = () => {
    const newPions = [];
    for (const pion of data.pions) {
      newPions.push({ ...pion, partyId: 0 });
    }
    setPions(newPions);
  };
  useEffect(() => {
    ajustPionsTypes();
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
      <div className="flex  w-full h-screen justify-center items-center">
        <div className="grid grid-cols-5 space-x-1 space-y-1.5">
          {pions &&
            pions.map((item, index) => (
              <Pion key={index} pion={item} handleClick={handleClick} />
            ))}
        </div>
      </div>
    </Wrapper>
  );
}
