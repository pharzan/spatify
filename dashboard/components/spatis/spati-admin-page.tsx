"use client";

import { Resource } from "ra-core";
import { Admin } from "@/components/admin";
import { authProvider } from "@/lib/ra/auth-provider";
import { dataProvider } from "@/lib/ra/data-provider";
import {
  AmenityCreate,
  AmenityEdit,
  AmenityList,
  SpatiCreate,
  SpatiEdit,
  SpatiList,
} from "@/components/spatis/resources";

export const SpatiAdminPage = () => {
  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      requireAuth
      title="Späti Admin"
    >
      <Resource
        name="spatis"
        list={SpatiList}
        edit={SpatiEdit}
        create={SpatiCreate}
        recordRepresentation="name"
        options={{ label: "Spätis" }}
      />
      <Resource
        name="amenities"
        list={AmenityList}
        edit={AmenityEdit}
        create={AmenityCreate}
        recordRepresentation="name"
        options={{ label: "Amenities" }}
      />
    </Admin>
  );
};
