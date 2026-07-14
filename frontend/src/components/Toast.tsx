import { useEffect, useRef, useState } from "react";

type ToastType = "success" | "error";
interface ToastEvent { message: string; type: ToastType }

let dispatch: (e: ToastEvent) => void = () => {};

export function toast(message: string, type: ToastType = "success") {
  dispatch({ message, type });
}

export function Toast() {
  const [state, setState] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: "", type: "success", visible: false,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    dispatch = ({ message, type }) => {
      clearTimeout(timerRef.current);
      setState({ message, type, visible: true });
      timerRef.current = setTimeout(() => setState((s) => ({ ...s, visible: false })), 2800);
    };
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div className={`toast${state.visible ? " show" : ""}${state.type === "error" ? " error" : ""}`}>
      {state.message}
    </div>
  );
}
