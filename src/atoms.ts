import { atom } from "recoil";
import { KitConfigScreen } from "./schema";

export const resourcesAtom = atom<{ [key: string]: KitConfigScreen }>({
  key: "resources",
  default: {},
});
