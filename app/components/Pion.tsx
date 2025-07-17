import { PionType } from "@/types";
import React from "react";

interface PionProps {
  pion: PionType;
  index: number;
  handleClick: (id: number) => void;
}

const Pion = ({ pion, index, handleClick }: PionProps) => {
  const pionClick = (id: number) => {
    handleClick(id);
  };
  return (
    <div onClick={() => pionClick(pion.id)}>
      <button
        className={`btn rounded-full border border-base-500 w-16 h-16  p-4 shadow text-2xl font-bold text-white`}
        style={{ background: pion.color, border: "2px solid black" }}
      >
        {index + 1}
      </button>
    </div>
  );
};

export default Pion;
