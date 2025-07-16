import { Party } from "@/types";
import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import React from "react";

interface PartyProps {
  party: Party;
}

const PartyComponent = ({ party }: PartyProps) => {
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    return date.toLocaleDateString("fr-FR", options);
  }

  return (
    <div className="bg-base-200/90 p-5 rounded-xl space-y-2 shadow">
      <div className="flex justify-between items-center w-full">
        <div>
          <div className="text-md font-bold uppercase">
            {party.player1.username}
          </div>
          <div>
            Point:
            <span className="text-primary font-semibold ml-2">
              {party.player1.score}
            </span>
          </div>
        </div>
        <div className="text-red-500 font-bold text-2xl">VS</div>
        <div>
          <div className="text-md font-bold uppercase">
            {party.player2.username}
          </div>
          <div>
            Point:
            <span className="text-primary font-semibold ml-2">
              {party.player2.score}
            </span>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center w-full">
        <div>Crée le: {formatDate(party.createdAt.toString())}</div>
        <div>Tour: {party.tourId}</div>
      </div>
      <div className="flex justify-between items-center w-full">
        <div>
          <div className="stat-title">
            <div className="uppercase text-sm">{party.inviteCode}</div>
          </div>
        </div>
        <Link href={`/party/${party.id}`} className="btn btn-accent btn-sm">
          Plus
          <SquareArrowOutUpRight className="w-4" />
        </Link>
      </div>
    </div>
  );
};

export default PartyComponent;
