import { TabMenu } from "primereact/tabmenu";
import { useRecoilValue } from "recoil";
import { resourcesAtom } from "../atoms";
import { Button } from "primereact/button";
import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { fetcher } from "../fetcher";
import useCliConfig from "../hooks/useCliConfig";
import { useNavigate, useLocation } from "react-router-dom";
export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const resourceParam = location.pathname.split('/')[1];
  const resources = useRecoilValue(resourcesAtom);

  const [visible, setVisible] = useState(false);
  const [resourceName, setResourceName] = useState("");

  const { refetchResources } = useCliConfig();

  const { mutate } = fetcher.useMutation("/config/create");

  const createNewResource = async () => {
    if (Object.keys(resources).includes(resourceName)) {
      alert("Resource already exists");
      return;
    }

    await mutate({ name: resourceName.toLowerCase() });
    await refetchResources();
    navigate(`/${resourceName.toLowerCase()}`);

    setVisible(false);
    setResourceName("");
  };

  return (
    <nav className="flex">
      <Dialog
        visible={visible}
        onHide={() => setVisible(false)}
        header="Add New Resource"
        footer={
          <div>
            <Button label="Save" icon="pi pi-check" onClick={() => createNewResource()} />
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setVisible(false)}
              className="p-button-text"
            />
          </div>
        }
        style={{ width: "50vw" }}
        breakpoints={{ "960px": "75vw", "641px": "100vw" }}
      >
        <p className="font-bold">Resource name</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createNewResource();
          }}
        >
          <InputText
            value={resourceName}
            onChange={(e) => setResourceName(e.target.value.trim().toLowerCase())}
            className="w-full"
            placeholder="products, users, customers, etc."
            autoFocus
          />
        </form>
      </Dialog>

      <TabMenu
        className="w-full mr-5"
        onTabChange={(e) => {
          navigate(`/${e.value.label?.split(".")[0]}`);
        }}
        model={Object.keys(resources).map((resource) => ({
          label: resource,
          icon: "pi pi-fw pi-file",
        }))}
        activeIndex={Object.keys(resources).findIndex((resource) => resource === resourceParam)}
      />

      <Button icon="pi pi-plus" className="px-5" severity="success" onClick={() => setVisible(true)} />
    </nav>
  );
}
