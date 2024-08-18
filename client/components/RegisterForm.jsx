"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import Link from "next/link";
import { Check, X } from "lucide-react";

const PasswordCriteria = ({ password }) => {
  const criteria = [
    { label: "Co najmniej 6 znaków", met: password.length >= 6 },
    { label: "Zawiera wielką literę", met: /[A-Z]/.test(password) },
    { label: "Zawiera małą literę", met: /[a-z]/.test(password) },
    { label: "Zawiera liczbę", met: /\d/.test(password) },
    { label: "Zawiera znak specjalny", met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="mt-2 space-y-1">
      {criteria.map((item) => (
        <div key={item.label} className="flex items-center text-xs">
          {item.met ? (
            <Check className="size-4 text-green-500 mr-2" />
          ) : (
            <X className="size-4 text-gray-500 mr-2" />
          )}
          <span className={item.met ? "text-green-500" : "text-gray-400"}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const PasswordStrengthMeter = ({ password }) => {
  const getStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength++;
    if (pass.match(/\d/)) strength++;
    if (pass.match(/[^a-zA-Z\d]/)) strength++;
    return strength;
  };

  const strength = getStrength(password);

  const getColor = (strength) => {
    if (strength === 0) return "bg-red-500";
    if (strength === 1) return "bg-red-400";
    if (strength === 2) return "bg-yellow-500";
    if (strength === 3) return "bg-yellow-400";
    return "bg-green-500";
  };

  const getStrengthText = (strength) => {
    if (strength === 0) return "Bardzo słabe";
    if (strength === 1) return "Słabe";
    if (strength === 2) return "Dopuszczalne";
    if (strength === 3) return "Dobre";
    return "Silne";
  };

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-400">Siła hasła</span>
        <span className="text-xs text-gray-400">{getStrengthText(strength)}</span>
      </div>

      <div className="flex space-x-1">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className={`h-1 w-1/4 rounded-full transition-colors duration-300 
              ${index < strength ? getColor(strength) : "bg-gray-600"}
            `}
          />
        ))}
      </div>
      <PasswordCriteria password={password} />
    </div>
  );
};

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const validatePassword = (password) => {
    return (
      password.length >= 6 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setError("Wszystkie pola są wymagane.");
      return;
    }

    if (!validatePassword(password)) {
      setError("Hasło nie spełnia wymagań bezpieczeństwa.");
      return;
    }

    try {
      const resUserExists = await fetch("/api/userExists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const { user } = await resUserExists.json();

      if (user) {
        setError("Użytkownik już istnieje.");
        return;
      }

      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      if (res.ok) {
        const form = e.target;
        form.reset();
        router.push("/");
      } else {
        console.log("Rejestracja użytkownika nie powiodła się.");
      }
    } catch (error) {
      console.log("Błąd podczas rejestracji: ", error);
    }
  };

  return (
    <div className="grid place-items-center h-screen bg-gray-100">
      <Card className="p-8 max-w-sm w-full shadow-lg border border-gray-200">
        <h1 className="text-xl font-bold mb-6">Zarejestruj się!</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="Imię i nazwisko"
            required
          />
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
          <PasswordStrengthMeter password={password} />
          <Button type="submit" className="bg-blue-600 text-white font-bold py-2">
            Rejestracja
          </Button>
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
