"use client";

import { Fragment } from "react";
import { required, minValue, maxValue } from "ra-core";
import { Badge } from "@/components/ui/badge";
import { List } from "@/components/admin/list";
import { Create } from "@/components/admin/create";
import { Edit } from "@/components/admin/edit";
import { SimpleForm } from "@/components/admin/simple-form";
import { TextInput } from "@/components/admin/text-input";
import { NumberInput } from "@/components/admin/number-input";
import { ReferenceArrayInput } from "@/components/admin/reference-array-input";
import { AutocompleteArrayInput } from "@/components/admin/autocomplete-array-input";
import { DataTable } from "@/components/admin/data-table";
import { EditButton } from "@/components/admin/edit-button";
import { DeleteButton } from "@/components/admin/delete-button";
import { SearchInput } from "@/components/admin/search-input";
import type {
  AmenityRecord,
  SpatiRecord,
} from "@/lib/ra/data-provider";

const spatiFilters = [
  <SearchInput source="q" alwaysOn key="q" />,
  <TextInput
    key="type"
    source="type"
    label="Type"
    helperText="Filter by category (e.g. kiosk, grocery, cafe)"
  />,
];

export const SpatiList = () => (
  <List
    filters={spatiFilters}
    sort={{ field: "name", order: "ASC" }}
    pagination={false}
  >
    <DataTable<SpatiRecord>
      rowClick="edit"
      bulkActionButtons={false}
      storeKey="spatis.datatable"
    >
      <DataTable.Col<SpatiRecord>
        source="name"
        label="Name"
        render={(record) => (
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-muted-foreground text-xs">
              {record.address}
            </div>
          </div>
        )}
      />
      <DataTable.Col<SpatiRecord>
        source="type"
        label="Type"
        render={(record) =>
          record.type ? (
            <Badge variant="secondary" className="capitalize">
              {record.type}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          )
        }
      />
      <DataTable.NumberCol<SpatiRecord>
        source="rating"
        label="Rating"
        options={{
          maximumFractionDigits: 1,
          minimumFractionDigits: 1,
        }}
      />
      <DataTable.Col<SpatiRecord>
        source="latitude"
        label="Coordinates"
        render={(record) => (
          <div className="text-sm leading-tight">
            <div>
              {record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}
            </div>
            <div className="text-muted-foreground text-xs">
              {record.hours}
            </div>
          </div>
        )}
      />
      <DataTable.Col<SpatiRecord>
        source="amenityIds"
        label="Amenities"
        render={(record) =>
          record.amenities?.length ? (
            <div className="flex flex-wrap gap-1">
              {record.amenities.map((amenity) => (
                <Badge variant="outline" key={amenity.id}>
                  {amenity.name}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground text-xs">None</span>
          )
        }
      />
      <DataTable.Col<SpatiRecord>
        label="Actions"
        disableSort
        headerClassName="text-right"
        cellClassName="text-right"
        render={(record) => (
          <div
            className="flex items-center justify-end gap-2"
            onClick={(event) => event.stopPropagation()}
          >
            <EditButton record={record} />
            <DeleteButton record={record} />
          </div>
        )}
      />
    </DataTable>
  </List>
);

export const SpatiEdit = () => (
  <Edit>
    <SimpleForm>
      <SpatiFormFields />
    </SimpleForm>
  </Edit>
);

export const SpatiCreate = () => (
  <Create>
    <SimpleForm>
      <SpatiFormFields />
    </SimpleForm>
  </Create>
);

const SpatiFormFields = () => (
  <Fragment>
    <TextInput source="name" label="Name" validate={required()} />
    <TextInput source="address" label="Address" validate={required()} />
    <TextInput
      source="description"
      label="Description"
      multiline
      rows={3}
      validate={required()}
    />
    <TextInput
      source="hours"
      label="Hours"
      placeholder="e.g. 8:00–22:00 daily"
    />
    <TextInput
      source="type"
      label="Type"
      placeholder="kiosk, grocery, etc."
    />
    <NumberInput
      source="rating"
      label="Rating"
      step="0.1"
      validate={[required(), minValue(0), maxValue(5)]}
    />
    <div className="grid grid-cols-2 gap-4">
      <NumberInput
        source="latitude"
        label="Latitude"
        step="0.0001"
        validate={required()}
      />
      <NumberInput
        source="longitude"
        label="Longitude"
        step="0.0001"
        validate={required()}
      />
    </div>
    <ReferenceArrayInput
      label="Amenities"
      reference="amenities"
      source="amenityIds"
    >
      <AutocompleteArrayInput />
    </ReferenceArrayInput>
  </Fragment>
);

const amenityFilters = [
  <SearchInput source="q" alwaysOn key="q" />,
];

export const AmenityList = () => (
  <List
    filters={amenityFilters}
    sort={{ field: "name", order: "ASC" }}
    pagination={false}
  >
    <DataTable<AmenityRecord>
      rowClick="edit"
      bulkActionButtons={false}
      storeKey="amenities.datatable"
    >
      <DataTable.Col<AmenityRecord> source="name" label="Amenity" />
      <DataTable.Col<AmenityRecord>
        label="Actions"
        disableSort
        headerClassName="text-right"
        cellClassName="text-right"
        render={(record) => (
          <div
            className="flex items-center justify-end gap-2"
            onClick={(event) => event.stopPropagation()}
          >
            <EditButton record={record} />
            <DeleteButton record={record} />
          </div>
        )}
      />
    </DataTable>
  </List>
);

export const AmenityEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" label="Name" validate={required()} />
    </SimpleForm>
  </Edit>
);

export const AmenityCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" label="Name" validate={required()} />
    </SimpleForm>
  </Create>
);
