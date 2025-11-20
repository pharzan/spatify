import type { DataProvider, Identifier, SortPayload } from "ra-core";
import { HttpError } from "ra-core";
import get from "lodash/get";
import {
  createSpati as createSpatiRequest,
  deleteSpati as deleteSpatiRequest,
  listSpatis,
  updateSpati as updateSpatiRequest,
  type Spati,
  type SpatiId,
} from "@/lib/api/spatis";
import {
  createAmenity as createAmenityRequest,
  deleteAmenity as deleteAmenityRequest,
  listAmenities,
  updateAmenity as updateAmenityRequest,
  type Amenity,
  type AmenityId,
} from "@/lib/api/amenities";
import { apiFetch } from "@/lib/api/client";

export type SpatiRecord = Spati & {
  amenityIds: string[];
};

export type AmenityRecord = Amenity;

type FilterValues = Record<string, unknown>;

const normalizeSpati = (spati: Spati): SpatiRecord => ({
  ...spati,
  amenityIds: spati.amenities?.map((amenity) => amenity.id) ?? [],
});

const fetchSpatis = async () => {
  const response = await listSpatis();
  return response.map(normalizeSpati);
};

const fetchAmenities = async () => {
  return listAmenities();
};

const applyFilters = <T extends { [key: string]: unknown }>(
  data: T[],
  filter?: FilterValues,
) => {
  if (!filter || Object.keys(filter).length === 0) {
    return data;
  }

  return data.filter((record) =>
    Object.entries(filter).every(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return true;
      }

      if (key === "q" && typeof value === "string") {
        const haystacks = Object.values(record)
          .filter((field) => typeof field === "string")
          .map((field) => (field as string).toLowerCase());
        const query = value.toLowerCase();
        return haystacks.some((field) => field.includes(query));
      }

      const recordValue = get(record, key);
      if (Array.isArray(recordValue)) {
        return recordValue.includes(value);
      }

      if (typeof recordValue === "string") {
        return recordValue.toLowerCase().includes(String(value).toLowerCase());
      }

      return recordValue === value;
    }),
  );
};

const sortRecords = <T>(data: T[], sort?: SortPayload) => {
  if (!sort?.field) {
    return data;
  }

  const sorted = [...data].sort((a, b) => {
    const aValue = get(a as object, sort.field);
    const bValue = get(b as object, sort.field);
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return -1;
    if (bValue == null) return 1;

    if (typeof aValue === "number" && typeof bValue === "number") {
      return aValue - bValue;
    }

    return String(aValue).localeCompare(String(bValue));
  });

  return sort.order === "DESC" ? sorted.reverse() : sorted;
};

const findRequiredRecord = async <T extends { id: Identifier }>(
  fetcher: () => Promise<T[]>,
  id: Identifier,
) => {
  const list = await fetcher();
  const record = list.find((item) => item.id === id);
  if (!record) {
    throw new HttpError(`Record ${id} not found`, 404, {
      id,
    });
  }
  return record;
};

export const dataProvider: DataProvider = {
  async getList(resource, params) {
    const { sort, filter } = params;
    if (resource === "spatis") {
      const data = await fetchSpatis();
      const filtered = applyFilters(data, filter);
      const sorted = sortRecords(filtered, sort);

      return {
        data: sorted,
        total: filtered.length,
      };
    }

    if (resource === "amenities") {
      const data = await fetchAmenities();
      const filtered = applyFilters(data, filter);
      const sorted = sortRecords(filtered, sort);
      return {
        data: sorted,
        total: filtered.length,
      };
    }

    throw new HttpError(`Unknown resource ${resource}`, 404, undefined);
  },

  async getOne(resource, params) {
    if (resource === "spatis") {
      const record = await findRequiredRecord(fetchSpatis, params.id);
      return { data: record };
    }

    if (resource === "amenities") {
      const record = await findRequiredRecord(fetchAmenities, params.id);
      return { data: record };
    }

    throw new HttpError(`Unknown resource ${resource}`, 404, undefined);
  },

  async getMany(resource, params) {
    const ids = params.ids;
    if (resource === "spatis") {
      const spatis = await fetchSpatis();
      return { data: spatis.filter((spati) => ids.includes(spati.id)) };
    }
    if (resource === "amenities") {
      const amenities = await fetchAmenities();
      return { data: amenities.filter((amenity) => ids.includes(amenity.id)) };
    }
    throw new HttpError(`Unknown resource ${resource}`, 404, undefined);
  },

  async getManyReference(resource, params) {
    return this.getList(resource, {
      ...params,
      filter: {
        ...(params.filter ?? {}),
        [params.target]: params.id,
      },
    });
  },

  async update(resource, params) {
    if (resource === "spatis") {
      const updated = await updateSpatiRequest(params.id as SpatiId, params.data);
      return { data: normalizeSpati(updated) };
    }

    if (resource === "amenities") {
      const updated = await updateAmenityRequest(params.id as AmenityId, params.data);
      return { data: updated };
    }

    throw new HttpError(`Unknown resource ${resource}`, 404, undefined);
  },

  async updateMany(resource, params) {
    const results = await Promise.all(
      params.ids.map((id) =>
        this.update(resource, {
          ...params,
          id,
          data: params.data,
        }),
      ),
    );
    return { data: results.map((result) => result.data.id as Identifier) };
  },

  async create(resource, params) {
    if (resource === "spatis") {
      const created = await createSpatiRequest(params.data);
      return { data: normalizeSpati(created) };
    }

    if (resource === "amenities") {
      const created = await createAmenityRequest(params.data);
      return { data: created };
    }

    throw new HttpError(`Unknown resource ${resource}`, 404, undefined);
  },

  async delete(resource, params) {
    if (resource === "spatis") {
      await deleteSpatiRequest(params.id as SpatiId);
      return { data: { id: params.id } };
    }

    if (resource === "amenities") {
      await deleteAmenityRequest(params.id as AmenityId);
      return { data: { id: params.id } };
    }

    throw new HttpError(`Unknown resource ${resource}`, 404, undefined);
  },

  async deleteMany(resource, params) {
    await Promise.all(
      params.ids.map((id) =>
        apiFetch(`/admin/${resource}/${id}`, {
          method: "DELETE",
        }),
      ),
    );
    return { data: params.ids };
  },
};
