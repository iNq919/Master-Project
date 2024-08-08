"use client";

import { useSession, signOut } from "next-auth/react";
import { FaSignOutAlt } from "react-icons/fa";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const UserInfo = () => {
  const { data: session } = useSession();

  return (
    <div className="relative w-full md:flex-wrap flex items-center space-x-4 bg-white rounded-lg">
      <Avatar className="cursor-pointer" aria-label="User Info">
        <AvatarImage src={session?.user?.image || '/placeholder-user.jpg'} />
        <AvatarFallback>{session?.user?.name?.charAt(0) || 'U'}</AvatarFallback>
      </Avatar>
      <div className="flex-1 text-sm">
        <div className="flex flex-col space-y-1">
          <div>
            <strong>Imię:</strong> <span className="font-medium">{session?.user?.name}</span>
          </div>
          <div>
            <strong>E-Mail:</strong> <span className="font-medium">{session?.user?.email}</span>
          </div>
        </div>
      </div>
      <Button
        onClick={() => signOut()}
        className="ml-4 max-[600px]:ml-0"
        variant="outline"
        aria-label="Log Out"
      >
        <FaSignOutAlt className="mr-2 max-[600px]:mr-0" size={16} />
        <span className="max-[600px]:hidden">Wyloguj się</span>
      </Button>
    </div>
  );
};

export default UserInfo;
