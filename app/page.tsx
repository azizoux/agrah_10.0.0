"use client";

import { FolderGit2, Layers, Send, X } from "lucide-react";
import Wrapper from "./components/Wrapper";
import { useEffect, useState } from "react";
import { User } from "@prisma/client";
import {
  addVisitorToParty,
  createParty,
  getUserList,
  listParty,
} from "@/actions";
import { toast } from "react-toastify";
import PartyComponent from "./components/PartyComponent";
import { Party } from "@/types";
import SignIn from "./components/SignIn";
import { useSocket } from "./context/SocketContext";

export default function Home() {
  const [users, setUsers] = useState<User[] | undefined>([]);
  const [parties, setParties] = useState<Party[] | undefined>([]);
  const [username, setUsername] = useState<string>("");
  const [invitedCode, setInvitedCode] = useState("");
  const [player2, setPlayer2] = useState("");

  const fetchUsers = async () => {
    try {
      const users = await getUserList(username);
      setUsers(users);
    } catch (error) {
      console.error(error);
    }
  };
  const fetchParties = async () => {
    try {
      const listParties = await listParty(username);
      setParties(listParties);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    try {
      const isCreated = await createParty(username, player2);
      const modal = document.getElementById("my_modal_3") as HTMLDialogElement;
      if (isCreated) {
        setPlayer2("");
        fetchParties();
        toast.success("Party Crée");
      } else {
        setPlayer2("");
        toast.error("Party non Crée. Une party est encours avec cet joueur");
      }
      modal.close();
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    const uname = localStorage.getItem("username");
    if (uname) setUsername(uname);
    fetchUsers();
    fetchParties();
  }, []);
  useEffect(() => {
    fetchUsers();
    fetchParties();
  }, [username]);
  const handleVisitorCodeSubmit = async (
    inviteCode: string,
    username: string
  ) => {
    try {
      await addVisitorToParty(inviteCode, username);
      toast.success("Party ajouté");
      fetchParties();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {username ? (
        <Wrapper>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-4">
              <p className="font-bold">Visiter une Partie:</p>
              <input
                type="text"
                placeholder="Inserer le code ici...."
                value={invitedCode}
                onChange={(e) => setInvitedCode(e.target.value)}
                className="input input-bordered"
              />
              <button
                className="btn btn-sm btn-primary"
                onClick={() => handleVisitorCodeSubmit(invitedCode, username)}
              >
                <Send className="w-6" />
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div
                className="cursor-pointer border border-accent flex justify-center items-center rounded-xl flex-col p-5"
                onClick={() =>
                  (
                    document.getElementById("my_modal_3") as HTMLDialogElement
                  ).showModal()
                }
              >
                <div className="font-bold text-accent">Creer partie</div>
                <div className="bg-accent-content text-accent  rounded-full p-2">
                  <Layers className="h-6 w-6" />
                </div>
              </div>

              <dialog id="my_modal_3" className="modal">
                <div className="modal-box">
                  <form method="dialog">
                    {/* if there is a button in form, it will close the modal */}
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                      <X className="w-8 h-8" />
                    </button>
                  </form>
                  <h3 className="font-bold text-lg">Nouvelle Partie</h3>
                  <p className="py-4">
                    Choississez un adversaire dans la liste deroulante
                  </p>
                  <div className="space-y-4 md:w-[450px]">
                    {users && (
                      <select
                        className="select select-bordered w-full"
                        value={player2}
                        onChange={(e) => setPlayer2(e.target.value)}
                      >
                        <option value="">Choisir un Adversaire:</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.username}>
                            {user.username}
                          </option>
                        ))}
                      </select>
                    )}

                    <button className="btn btn-primary" onClick={handleSubmit}>
                      Creer Partie <FolderGit2 />
                    </button>
                  </div>
                </div>
              </dialog>

              {/* Listes des factures */}
              {parties &&
                parties.map((party, index) => (
                  <PartyComponent
                    key={index}
                    party={party}
                    fetchParties={fetchParties}
                  />
                ))}
            </div>
          </div>
        </Wrapper>
      ) : (
        <SignIn />
      )}
    </>
  );
}
