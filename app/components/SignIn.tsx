"use client";
import { login } from "@/actions";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useSocket } from "../context/SocketContext";

const SignIn = () => {
  const [loginName, setLoginName] = useState("");
  const { setUser } = useSocket();
  const [password, setPassword] = useState("");
  const router = useRouter();
  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      console.log({ loginName, password });
      if (loginName && password) {
        const user = await login(loginName, password);
        console.log(user);

        if (user) {
          localStorage.setItem("username", user.username);
          setUser(user);
          setLoginName("");
          setPassword("");
          toast.success("Logged In success");
          router.push("/");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="">
      <form
        className="max-w-md m-auto flex mt-20  flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <p>Se connter a TESKI TIMI</p>
        <input
          className="input input-bordered w-full"
          type="text"
          placeholder="username...."
          value={loginName}
          onChange={(e) => setLoginName(e.target.value)}
        />
        <input
          className="input input-bordered w-full"
          type="password"
          placeholder="password...."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          Login
        </button>
      </form>
    </div>
  );
};

export default SignIn;
