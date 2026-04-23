// hooks/useActivityTracker.ts
import { useEffect } from 'react';
import { useLocation } from 'react-router';

interface UserActivity {
  pageViews: Record<string, number>;
  lastVisited: string;
  themePreference: 'light' | 'dark';
  interactions: number;
}

const COOKIE_NAME = 'tb_user_activity';
const COOKIE_EXPIRY_DAYS = 30;

export function useActivityTracker() {
  const location = useLocation();

  // Helper to get current cookie data
  const getActivityData = (): UserActivity => {
    const match = document.cookie.match(new RegExp('(^| )' + COOKIE_NAME + '=([^;]+)'));
    if (match) {
      try {
        return JSON.parse(decodeURIComponent(match[2]));
      } catch (e) {
        console.error("Failed to parse activity cookie");
      }
    }
    return { pageViews: {}, lastVisited: new Date().toISOString(), themePreference: 'light', interactions: 0 };
  };

  // Helper to save cookie data
  const saveActivityData = (data: UserActivity) => {
    const d = new Date();
    d.setTime(d.getTime() + (COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000));
    const expires = "expires="+ d.toUTCString();
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(data))};${expires};path=/`;
  };

  // Track Page Views
  useEffect(() => {
    const data = getActivityData();
    const currentPath = location.pathname;
    
    data.pageViews[currentPath] = (data.pageViews[currentPath] || 0) + 1;
    data.lastVisited = new Date().toISOString();
    
    saveActivityData(data);
  }, [location.pathname]);

  // Track Click Interactions
  useEffect(() => {
    const handleGlobalClick = () => {
      const data = getActivityData();
      data.interactions += 1;
      saveActivityData(data);
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  return { getActivityData };
}