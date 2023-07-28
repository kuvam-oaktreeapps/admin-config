import { TabMenu } from "primereact/tabmenu";
import { useRecoilValue } from "recoil";
import { resourcesAtom } from "../atoms";

export default function Navbar() {
  const resourceParam = window.location.pathname.split("/").at(-1) as string;

  const resources = useRecoilValue(resourcesAtom);

  const resource = resources[resourceParam];

  return (
    <nav>
      {resource && (
        <TabMenu
          model={Object.keys(resources).map((resource) => ({
            label: `${resource}.json`,
            url: `/${resource}`,
            icon: "pi pi-fw pi-file",
          }))}
          activeIndex={Object.keys(resources).findIndex((resource) => resource === resourceParam)}
        />
      )}
    </nav>
  );
}
