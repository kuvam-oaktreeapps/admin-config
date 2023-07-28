import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { KitConfigField } from "../schema";
import { useState } from "react";
import { InputSwitch } from "primereact/inputswitch";
import { Dropdown } from "primereact/dropdown";
import { widgets } from "../constants";
import { resourcesAtom } from "../atoms";
import { useRecoilState } from "recoil";
import { useParams } from "react-router-dom";

interface Props {
  editField?: KitConfigField;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

export default function CreateNewFieldDialog({ editField, visible, setVisible }: Props) {
  const params = useParams();

  const [resources, setResources] = useRecoilState(resourcesAtom);

  const resource = resources[params.resource as string];

  const [field, setField] = useState<KitConfigField>(
    editField || {
      name: "",
      inline: false,
      tableDisplay: false,
      widget: "InputText",
      options: [],
      required: false,
      unique: false,
    }
  );

  const saveField = () => {
    setResources((resources) => ({
      ...resources,
      [params.resource as string]: {
        ...resource,
        crudFields: [
          ...(resource.crudFields || []),
          {
            ...field,
            options: field.options.filter((option) => option.name && option.value),
          },
        ],
      },
    }));

    setVisible(false);
  };

  return (
    <Dialog
      header={editField ? `Edit field '${editField?.name}'` : "Add New Field"}
      visible={visible}
      className="w-7"
      onHide={() => setVisible(false)}
      footer={
        <div>
          <Button
            label="Cancel"
            icon="pi pi-times"
            onClick={() => setVisible(false)}
            className="p-button-text"
          />
          <Button
            disabled={!field.name.length}
            label="Save"
            icon="pi pi-check"
            onClick={saveField}
            autoFocus
            severity="success"
          />
        </div>
      }
    >
      <p className="font-bold">Field Name</p>
      <InputText
        className="w-full mb-5"
        value={field.name}
        onChange={(e) => setField((field) => ({ ...field, name: e.target.value.trim() }))}
        placeholder="profilePic, firstName, lastName, etc."
      />

      <div className="w-full flex align-items-center">
        <p className="font-bold mr-3">Is Inline</p>
        <InputSwitch
          checked={field.inline}
          onChange={(e) => setField((field) => ({ ...field, inline: !!e.value }))}
        />
      </div>

      <div className="w-full flex align-items-center">
        <p className="font-bold mr-3">Is Required</p>
        <InputSwitch
          checked={field.required}
          onChange={(e) => setField((field) => ({ ...field, required: !!e.value }))}
        />
      </div>

      <div className="w-full flex align-items-center">
        <p className="font-bold mr-3">Is Unique</p>
        <InputSwitch
          checked={field.unique}
          onChange={(e) => setField((field) => ({ ...field, unique: !!e.value }))}
        />
      </div>

      <div className="w-full flex align-items-center">
        <p className="font-bold mr-3">Table Display</p>
        <InputSwitch
          checked={field.tableDisplay}
          onChange={(e) => setField((field) => ({ ...field, tableDisplay: !!e.value }))}
        />
      </div>

      <p className="font-bold">Widget</p>
      <Dropdown
        className="w-full mb-5"
        value={field.widget}
        options={widgets}
        onChange={(e) => setField((field) => ({ ...field, widget: e.value }))}
      />

      {["RadioButton", "MultiSelect", "Dropdown"].includes(field.widget || "") && (
        <>
          <p className="font-bold">Options</p>
          <div>
            {field.options.map((option, index) => (
              <div className="w-full flex flex-row gap-3">
                <div className="w-full">
                  <p>Name</p>
                  <InputText
                    value={option.name}
                    onChange={(e) => {
                      const newOptions = [...field.options];
                      newOptions[index].name = e.target.value;

                      setField((field) => ({ ...field, options: newOptions }));
                    }}
                    placeholder="New York"
                    className="w-full mb-5"
                  />
                </div>

                <div className="w-full">
                  <p>Value</p>
                  <InputText
                    value={option.value}
                    onChange={(e) => {
                      const newOptions = [...field.options];
                      newOptions[index].value = e.target.value;

                      setField((field) => ({ ...field, options: newOptions }));
                    }}
                    placeholder="NY"
                    className="w-full mb-5"
                  />
                </div>
              </div>
            ))}

            <center>
              <Button
                label="Add"
                icon="pi pi-plus"
                className="p-button-text"
                onClick={() =>
                  setField((field) => ({ ...field, options: [...field.options, { name: "", value: "" }] }))
                }
              />
            </center>
          </div>
        </>
      )}
    </Dialog>
  );
}
