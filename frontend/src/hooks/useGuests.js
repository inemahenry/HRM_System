import { useContext } from "react";
import GuestContext from "../context/GuestContextApi";

export function useGuests() {
  const guestContext = useContext(GuestContext);

  if (!guestContext) {
    throw new Error("useGuests must be used within a GuestProvider.");
  }

  return guestContext;
}

export default useGuests;
