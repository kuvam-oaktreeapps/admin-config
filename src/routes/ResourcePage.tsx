import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useParams } from "react-router-dom";
import { useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { KitConfigField } from "../schema";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { useRecoilState } from "recoil";
import { resourcesAtom } from "../atoms";
import { Button } from "primereact/button";
import CreateNewFieldDialog from "../components/CreateNewFieldDialog";

export default function ResourcePage() {
  const params = useParams();

  const dt = useRef<DataTable<any> | null>(null);

  const [resources, setResources] = useRecoilState(resourcesAtom);

  const resource = resources[params.resource || ""];

  const [selection, setSelection] = useState<KitConfigField[]>([]);
  const [dialog, setDialog] = useState(false);
  const [editField, setEditField] = useState<KitConfigField | undefined>(undefined);

  const deleteSelected = () => {
    const selectedNames = selection.map((field) => field.name);

    setResources((resources) => ({
      ...resources,
      [params.resource as string]: {
        ...resource,
        crudFields: resource.crudFields.filter((field) => !selectedNames.includes(field.name)),
      },
    }));

    setSelection([]);
  };

  const openEditDialog = (field: KitConfigField) => {
    setEditField(field);
    setDialog(true);
  };

  const header = (
    <div className="flex justify-content-between">
      <p className="">Resource Fields</p>

      <div>
        <Button
          size="small"
          label="Add New"
          icon="pi pi-plus"
          className="mr-3"
          onClick={() => setDialog((dialog) => !dialog)}
        />
        <Button
          size="small"
          label="Delete Selected"
          severity="danger"
          icon="pi pi-trash"
          onClick={deleteSelected}
          disabled={!selection.length}
        />
      </div>
    </div>
  );

  return (
    <section>
      <CreateNewFieldDialog visible={dialog} setVisible={setDialog} editField={editField} />

      {resource && (
        <Card
          title="Resource Specifications"
          subTitle="Adjust and edit core config of the resource"
          className="my-5 border-1 border-gray-300 shadow-none"
        >
          <p>Resource Name</p>
          <InputText
            value={resource.name}
            onChange={(e) =>
              setResources({
                ...resources,
                [params.resource as string]: { ...resource, name: e.target.value },
              })
            }
            className="w-4 mb-5"
            placeholder="Resource Name"
          />

          <p>Resource URL</p>
          <InputText
            value={resource.url}
            onChange={(e) =>
              setResources({
                ...resources,
                [params.resource as string]: { ...resource, url: e.target.value },
              })
            }
            className="w-4 mb-5"
            placeholder="Resource URL"
          />

          <p>Resource's MongoDB Collection Name</p>
          <InputText
            value={resource.collectionName}
            onChange={(e) =>
              setResources({
                ...resources,
                [params.resource as string]: { ...resource, collectionName: e.target.value },
              })
            }
            className="w-4 mb-5"
            placeholder="Resource's MongoDB Collection Name"
          />

          <p>Exists in only:</p>
          <Dropdown
            value={resource.only}
            options={["webapp", "server", "both"]}
            onChange={(e) =>
              setResources({
                ...resources,
                [params.resource as string]: { ...resource, only: e.value === "both" ? undefined : e.value },
              })
            }
            placeholder="Select a Only"
            className="w-4 mb-5"
          />
        </Card>
      )}

      <DataTable
        ref={dt}
        value={resource?.crudFields}
        selection={selection}
        onSelectionChange={(e) => setSelection(e.value as KitConfigField[])}
        dataKey="name"
        className="datatable-responsive"
        emptyMessage="No entities found."
        header={header}
      >
        <Column selectionMode="multiple" headerStyle={{ width: "4rem" }}></Column>
        <Column
          header="Name"
          body={(row) => (
            <code style={{ padding: 5, backgroundColor: "rgb(246, 246, 246)" }}>{row.name}</code>
          )}
        ></Column>
        <Column field="widget" header="Widget"></Column>
        <Column field="unique" header="Unique"></Column>
        <Column field="required" header="Required"></Column>
        <Column field="inline" header="Inline"></Column>
        <Column field="tableDisplay" header="Table Display"></Column>
        <Column
          field="actions"
          header="Actions"
          body={(field) => (
            <>
              <Button
                onClick={() => openEditDialog(field)}
                className="mr-2"
                icon="pi pi-pencil"
                severity="info"
              />
              <Button icon="pi pi-trash" severity="danger" />
            </>
          )}
        ></Column>
      </DataTable>
    </section>
  );
}
