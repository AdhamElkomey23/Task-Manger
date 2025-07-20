import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to my-tasks as the default authenticated view
    setLocation("/my-tasks");
  }, [setLocation]);

  return null;
}
