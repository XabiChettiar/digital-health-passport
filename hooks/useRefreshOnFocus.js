// Import hook that detects when a screen comes into focus
import { useFocusEffect } from "@react-navigation/native";

// Import useCallback to memoize the function
import { useCallback } from "react";

/*
  Custom Hook: useRefreshOnFocus

  Purpose:
  Automatically triggers a refresh function whenever
  the screen becomes active (focused).

  This is useful for:
  - Reloading data from Supabase
  - Refreshing medical records
  - Updating medication lists
  - Ensuring latest data is shown when user returns to screen
*/

export default function useRefreshOnFocus(refreshFunction) {
  
  // useFocusEffect runs every time the screen gains focus
  useFocusEffect(
    
    // useCallback ensures the function reference remains stable
    // preventing unnecessary re-renders
    useCallback(() => {
      
      // Call the passed refresh function
      // Example: fetchMedicalInfo(), fetchMedications(), etc.
      refreshFunction();

      // No cleanup function required in this case
    }, [])
  );
}
