import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useNavigate, useParams } from "react-router-dom";
import { useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { KitConfigField } from "../schema";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { useRecoilState, useRecoilValue } from "recoil";
import { projectHasOnlyAtom, resourcesAtom } from "../atoms";
import { Button } from "primereact/button";
import CreateNewFieldDialog from "../components/CreateNewFieldDialog";
import { fetcher } from "../fetcher";
import useCliConfig from "../hooks/useCliConfig";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import {Tag} from "primereact/tag";

export default function ResourcePage({}) {
  const navigate = useNavigate();
  const params = useParams();
  const dt = useRef<DataTable<any> | null>(null);
  const [resources, setResources] = useRecoilState(resourcesAtom);
  const projectHasOnly = useRecoilValue(projectHasOnlyAtom);
  const resource = resources[params.resource || ""];
  const { refetchResources } = useCliConfig();

  const [selection, setSelection] = useState<KitConfigField[]>([]);
  const [dialog, setDialog] = useState(false);
  const [editField, setEditField] = useState<KitConfigField | undefined>(undefined);

  const { mutate: removeResource } = fetcher.useMutation("/config/delete");
  const { mutate: updateResource, isLoading: isUpdating } = fetcher.useMutation("/config/update");

  const { resources: configResources, refetchResources: refetchConfigResources } = useCliConfig({
    localState: true,
  });

  const contentIsChanged =
    JSON.stringify(configResources[params.resource || ""]) !== JSON.stringify(resource);

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

  const getSeverity = (value: any) => {
    if(value){
      return 'success';
    } else {
      return 'danger';
    }
  };

  const statusBodyTemplate = (rowData: any, fieldName: string) => {
    return <Tag value={rowData[fieldName] == true ? "Yes" : "No"} severity={getSeverity(rowData[fieldName])} />;
  };

  const deleteResource = async () => {
    confirmDialog({
      message: "Deleting a resource will delete all of its data. Are you sure you want to continue?",
      header: "Delete Confirmation",
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        if (params.resource) {
          removeResource({ name: params.resource?.toLowerCase() });
          await refetchResources();
          navigate("/");
        }
      },
      reject: () => {},
    });
  };

  const saveChanges = async () => {
    const oldResourceName = configResources[params.resource as string].name.toLowerCase();
    await updateResource({ name: oldResourceName, resource });
    refetchConfigResources();
    refetchResources();
  };

  const openEditDialog = (field: KitConfigField) => {
    setEditField(field);
    setDialog(true);
  };

  const dtHeader = (
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

  const saveChangesButton = (
    <Button
      loading={isUpdating}
      label="Save Changes"
      className="mt-3"
      disabled={!contentIsChanged}
      onClick={saveChanges}
    />
  );

  return (
    <section>
      <ConfirmDialog />

      <CreateNewFieldDialog
        visible={dialog}
        setVisible={setDialog}
        editField={editField}
        setEditField={setEditField}
      />

      {saveChangesButton}

      {resource && (
        <Card
          header={
            <div className="px-4 pt-2 flex justify-content-between align-items-center">
              <div>
                <h2 className="font-bold">Resource Specifications</h2>
                <p className="text-sm text-gray-500">Adjust and edit core config of the resource</p>
              </div>

              <Button icon="pi pi-trash" severity="danger" onClick={deleteResource} />
            </div>
          }
          className="my-5 border-1 border-gray-300 shadow-none"
        >
          <div className="flex gap-5">
            <div className="w-full">
              <p>Resource URL</p>
              <InputText
                value={resource.url}
                onChange={(e) =>
                  setResources({
                    ...resources,
                    [params.resource as string]: { ...resource, url: e.target.value },
                  })
                }
                className="w-full"
                placeholder="Resource URL"
              />
            </div>

            {(projectHasOnly === "server" || projectHasOnly === undefined) && (
              <div className="w-full">
                <p>MongoDB Collection Name</p>
                <InputText
                  value={resource.collectionName}
                  onChange={(e) =>
                    setResources({
                      ...resources,
                      [params.resource as string]: { ...resource, collectionName: e.target.value },
                    })
                  }
                  className="w-full"
                  placeholder="MongoDB Collection Name"
                />
              </div>
            )}

            <div className="w-full">
              <p>Exists in only:</p>
              <Dropdown
                value={projectHasOnly ? projectHasOnly : resource.only === undefined ? "both" : resource.only}
                disabled={!!projectHasOnly}
                options={["webapp", "server", "both"]}
                onChange={(e) =>
                  setResources((resources) => ({
                    ...resources,
                    [params.resource as string]: {
                      ...resource,
                      only: e.value === "both" ? undefined : e.value,
                    },
                  }))
                }
                placeholder="Select a Only"
                className="w-full"
              />
            </div>
          </div>
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
        header={dtHeader}
      >
        <Column selectionMode="multiple" headerStyle={{ width: "4rem" }}></Column>
        <Column
          header="Name"
          body={(row) => (
            <code style={{ padding: 5, backgroundColor: "rgb(246, 246, 246)" }}>{row.name}</code>
          )}
        ></Column>
        <Column field="widget" header="Widget"></Column>
        <Column field="unique" header="Unique" body={(rowData) => statusBodyTemplate(rowData, "unique")}></Column>
        <Column field="required" header="Required" body={(rowData) => statusBodyTemplate(rowData, "required")}></Column>
        <Column field="inline" header="Inline" body={(rowData) => statusBodyTemplate(rowData, "inline")}></Column>
        <Column field="tableDisplay" header="Table Display" body={(rowData) => statusBodyTemplate(rowData, "tableDisplay")}></Column>
        <Column
          field="actions"
          header="Actions"
          body={(row) => (
            <>
              <Button
                onClick={() => openEditDialog(row)}
                className="mr-2"
                icon="pi pi-pencil"
                severity="info"
              />
              <Button
                icon="pi pi-trash"
                severity="danger"
                onClick={() =>
                  setResources((resources) => ({
                    ...resources,
                    [params.resource as string]: {
                      ...resource,
                      crudFields: resource.crudFields.filter((field) => field.name !== row.name),
                    },
                  }))
                }
              />
            </>
          )}
        ></Column>
      </DataTable>

      {saveChangesButton}
    </section>
  );
}
