import React, { FC } from 'react';
import { UserState } from '../lib/types';

interface Props {
  users: UserState[];
  currentUserId: string;
}

const UserList: FC<Props> = ({ users, currentUserId }) => {
  return (
    <div className="bg-[#1e2124] rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-semibold text-white">Users in Room</h3>
      <div className="space-y-3">
        {users.map((user) => (
          <div 
            key={user.uid}
            className="flex items-center justify-between p-3 rounded-lg bg-[#2c2f33] hover:bg-[#2c2f33]/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400 font-medium">
                    {user.name[0].toUpperCase()}
                  </span>
                </div>
                {user.isHost && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">
                    {user.name}
                  </span>
                  {user.uid === currentUserId && (
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                </div>
                {user.location && (
                  <div className="text-sm text-gray-400 flex items-center gap-2">
                    {user.location.country && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{user.location.country}</span>
                      </div>
                    )}
                    {user.location.gps && (
                      <div className="flex items-center gap-1" title={`${user.location.gps.latitude}, ${user.location.gps.longitude}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>GPS Available</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList; 