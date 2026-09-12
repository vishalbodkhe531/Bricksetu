import { useReducer } from "react";

export type AdvanceState = {
  isOpen: boolean;
  workerId: string;
  workerName: string;
  amount: string;
  dateGiven: string;
  reason: string;
};

export type AdvanceAction =
  | { type: "open"; workerId: string; workerName: string }
  | { type: "close" }
  | { type: "setField"; field: keyof AdvanceState; value: string };

const initialAdvanceState: AdvanceState = {
  isOpen: false,
  workerId: "",
  workerName: "",
  amount: "",
  dateGiven: new Date().toISOString().split("T")[0],
  reason: "",
};

function advanceReducer(
  state: AdvanceState,
  action: AdvanceAction,
): AdvanceState {
  switch (action.type) {
    case "open":
      return {
        ...initialAdvanceState,
        isOpen: true,
        workerId: action.workerId,
        workerName: action.workerName,
      };
    case "close":
      return initialAdvanceState;
    case "setField":
      return { ...state, [action.field]: action.value };
    default:
      return state;
  }
}

export function useAdvanceForm() {
  const [state, dispatch] = useReducer(advanceReducer, initialAdvanceState);

  const openAdvance = (workerId: string, workerName: string) => {
    dispatch({ type: "open", workerId, workerName });
  };

  const closeAdvance = () => {
    dispatch({ type: "close" });
  };

  const setField = (field: keyof AdvanceState, value: string) => {
    dispatch({ type: "setField", field, value });
  };

  return {
    state,
    openAdvance,
    closeAdvance,
    setField,
  };
}
