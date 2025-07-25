import {
  deletePartyById,
  getInitUserScore,
  getPartyById,
  getUserById,
} from "@/actions";
import { Party } from "@/types";
import { SquareArrowOutUpRight, Trash } from "lucide-react";
import Link from "next/link";
import React from "react";
import { toast } from "react-toastify";

interface PartyProps {
  party: Party;
  fetchParties: () => void;
}

const PartyComponent = ({ party, fetchParties }: PartyProps) => {
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    return date.toLocaleDateString("fr-FR", options);
  }
  const handleDeleteParty = async (id: number) => {
    try {
      const isConfirmed = window.confirm(
        "Êtes-vous sûr de vouloir supprimer ce Jeu ?"
      );
      if (isConfirmed) {
        const party = await getPartyById(id);
        if (party) {
          const player1 = await getInitUserScore(party.player1.id);
          const player2 = await getInitUserScore(party.player2.id);
          console.log({ player1, player2 });
        }
        await deletePartyById(id);
        fetchParties();
        toast.success("Delete success");
      }
    } catch (error) {
      console.error(error);
    }
  };
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
            <div className=" text-sm text-primary font-bold border border-base-400 p-2 bg-base-200/50 rounded-xl">
              {party.inviteCode}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            onClick={() => handleDeleteParty(party.id)}
            className="btn btn-error btn-sm text-white font-bold"
          >
            Supp <Trash className="w-4" color="white" />
          </div>
          <Link href={`/party/${party.id}`} className="btn btn-primary btn-sm">
            Plus
            <SquareArrowOutUpRight className="w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PartyComponent;
