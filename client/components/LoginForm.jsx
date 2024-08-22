"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import Link from "next/link";
import { Alert } from "../components/ui/alert";
import ReCAPTCHA from "react-google-recaptcha";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!recaptchaToken) {
      setError("Please complete the reCAPTCHA.");
      return;
    }

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

      router.replace("/dashboard");
    } catch (error) {
      console.log(error);
    }
  };

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  return (
    <div className="flex flex-col justify-center items-center gap-y-10 h-screen bg-gray-100">
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

          <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
            onChange={handleRecaptchaChange}
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
