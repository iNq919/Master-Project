"use client";

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { FaSignOutAlt } from 'react-icons/fa';

const UserInfo = () => {
  const { data: session } = useSession();

  return (
    <div className="2xl:absolute xl:fixed top-4 right-4 z-50 bg-white p-4 rounded-lg shadow-lg border border-gray-200 mb-4">
      <div className="">
        <div className="text-sm">
          <div>
            <strong>Name:</strong> <span className="font-bold">{session?.user?.name}</span>
          </div>
          <div>
            <strong>Email:</strong> <span className="font-bold">{session?.user?.email}</span>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="text-gray-600 hover:text-gray-900 mt-2"
          aria-label="Log Out"
        >
          <FaSignOutAlt size={24} />
        </button>
      </div>
    </div>
  );
};

export default UserInfo;
