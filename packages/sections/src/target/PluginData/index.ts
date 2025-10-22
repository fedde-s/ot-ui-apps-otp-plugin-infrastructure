import { lazy } from "react";

export const definition = {
  id: "plugin",
  name: "Plugin Data",
  shortName: "PD",
  hasData: () => true,
};

// Components
export { default as Summary } from "./Summary";
export const getBodyComponent = () => lazy(() => import("./Body")); 
