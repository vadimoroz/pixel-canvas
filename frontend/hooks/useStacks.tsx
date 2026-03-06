"use client";

import { useState, useEffect, useCallback } from "react";
import { AppConfig, UserSession, showConnect } from "@stacks/connect";

const appConfig = new AppConfig(["store_write", "publish_data"]);
export const userSession = new UserSession({ appConfig });

export function useStacks() {
  const [address, setAddress] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (userSession.isUserSignedIn()) {
      const data = userSession.loadUserData();
      setAddress(data.profile.stxAddress.mainnet);
    }
  }, []);

  const connect = useCallback(() => {
    showConnect({
      appDetails: {
        name: "Pixel Canvas",
        icon: typeof window !== "undefined" ? `${window.location.origin}/icon.png` : "",
      },
      userSession,
      onFinish: () => {
        const data = userSession.loadUserData();
        setAddress(data.profile.stxAddress.mainnet);
      },
    });
  }, []);

  const disconnect = useCallback(() => {
    userSession.signUserOut();
    setAddress(null);
  }, []);

  return { address, connect, disconnect, mounted };
}
