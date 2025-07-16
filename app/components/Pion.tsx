import { PionType } from "@/types";
import React from "react";

interface PionProps {
  pion: PionType;
  handleClick: (id: number) => void;
}

const Pion = ({ pion, handleClick }: PionProps) => {
  const pionClick = (id: number) => {
    handleClick(id);
  };
  return (
    <div onClick={() => pionClick(pion.id)}>
      <button
        className={`btn rounded-full border border-base-500  w-20 h-20  p-4 shadow`}
        style={{ background: "#e5e7eb", border: "2px solid black" }}
      >
        {pion.id}
      </button>
    </div>
  );
};

export default Pion;
