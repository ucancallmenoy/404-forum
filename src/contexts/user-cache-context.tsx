"use client";
import { createContext, useContext, useCallback, ReactNode } from 'react';
import { UserProfile } from '@/types/users';

interface UserCacheContextType {
  getUsers: (userIds: string[]) => Promise<UserProfile[]>;
  getUserFromCache: (userId: string) => UserProfile | undefined;
  fetchAndCacheUser: (userId: string) => Promise<UserProfile | undefined>;
}

const UserCacheContext = createContext<UserCacheContextType | undefined>(undefined);

const userCache = new Map<string, UserProfile>();
const pendingRequests = new Map<string, Promise<UserProfile[]>>();

export function UserCacheProvider({ children }: { children: ReactNode }) {
  const batchFetchUsers = useCallback(async (userIds: string[]): Promise<UserProfile[]> => {
    const uncachedIds = userIds.filter(id => !userCache.has(id));
    
    if (uncachedIds.length === 0) {
      return userIds.map(id => userCache.get(id)!).filter(Boolean);
    }

    const batchKey = uncachedIds.sort().join(',');
    
    if (pendingRequests.has(batchKey)) {
      await pendingRequests.get(batchKey);
      return userIds.map(id => userCache.get(id)!).filter(Boolean);
    }

    const promise = fetch(`/api/users?ids=${uncachedIds.join(',')}`);
    pendingRequests.set(batchKey, promise.then(res => res.json()));
    
    try {
      const users = await pendingRequests.get(batchKey);
      if (users) {
        users.forEach((user: UserProfile) => userCache.set(user.id, user));
      }
      pendingRequests.delete(batchKey);
      return userIds.map(id => userCache.get(id)!).filter(Boolean);
    } catch (error) {
      pendingRequests.delete(batchKey);
      throw error;
    }
  }, []);

  // Add this single-user fetcher
  const fetchAndCacheUser = useCallback(async (userId: string): Promise<UserProfile | undefined> => {
    if (userCache.has(userId)) {
      return userCache.get(userId);
    }
    const res = await fetch(`/api/users?id=${userId}`);
    if (res.ok) {
      const user = await res.json();
      if (user && user.id) {
        userCache.set(user.id, user);
        return user;
      }
    }
    return undefined;
  }, []);

  const getUserFromCache = useCallback((userId: string) => {
    return userCache.get(userId);
  }, []);

  return (
    <UserCacheContext.Provider value={{ 
      getUsers: batchFetchUsers, 
      getUserFromCache,
      fetchAndCacheUser
    }}>
      {children}
    </UserCacheContext.Provider>
  );
}

export const useUserCache = () => {
  const context = useContext(UserCacheContext);
  if (!context) throw new Error('useUserCache must be used within UserCacheProvider');
  return context;
};