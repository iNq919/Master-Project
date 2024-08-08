"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res.error) {
        setError("Invalid Credentials");
        return;
      }

      router.replace("dashboard");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="grid place-items-center h-screen bg-gray-100">
      <Card className="p-8 max-w-sm w-full shadow-lg border border-gray-200">
        <h1 className="text-xl font-bold mb-6">Zaloguj się!</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="E-Mail"
            required
          />
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Hasło"
            required
          />
          <Button type="submit" className="bg-blue-600 text-white font-bold py-2">
            Zaloguj
          </Button>
          {error && (
            <Alert variant="error" className="mt-4">
              {error}
            </Alert>
          )}
          <Link href="/register" className="text-sm mt-3 text-right">
            Nie masz jeszcze konta? <span className="underline">Zarejestruj się!</span>
          </Link>
        </form>
      </Card>
    </div>
  );
}
