"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

const CrispChat = () => {
  useEffect(() => {
    Crisp.configure("d7bd9715-2e8b-4739-b9a9-6dbbb61e1ca5");
  });

  return null;
};

export default CrispChat;
