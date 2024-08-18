"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import Link from "next/link";

export default function VerifyPage() {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const router = useRouter();

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          verificationCode,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMessage(data.message);
        setTimeout(() => router.push("/"), 2000);
      } else {
        const { error } = await res.json();
        setError(error);
      }
    } catch (error) {
      setError("Błąd podczas weryfikacji: " + error.message);
    }
  };

  return (
    <div className="grid place-items-center h-screen bg-gray-100">
      <Card className="p-8 max-w-sm w-full shadow-lg border border-gray-200">
        <h1 className="text-xl font-bold mb-6">Weryfikacja konta</h1>

        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="E-Mail"
            required
          />
          <Input
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            type="text"
            placeholder="Kod weryfikacyjny"
            required
          />
          <Button type="submit" className="bg-blue-600 text-white font-bold py-2">
            Potwierdź kod
          </Button>
          {successMessage && (
            <Alert variant="success" className="mt-4">
              {successMessage}
            </Alert>
          )}
          {error && (
            <Alert variant="error" className="mt-4">
              {error}
            </Alert>
          )}
          <Link href="/" className="text-sm mt-3 text-right">
            Masz już konto? <span className="underline">Zaloguj się!</span>
          </Link>
        </form>
      </Card>
    </div>
  );
}
