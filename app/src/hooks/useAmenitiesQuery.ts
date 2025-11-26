import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { components } from "../generated/api-types";

const API_BASE_URL =
    process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3333";

export type Amenity = components["schemas"]["Amenity"];
export type AmenitiesResponse = components["schemas"]["PublicAmenitiesResponse"];

export const amenityKeys = {
    all: ["amenities"] as const,
    list: () => [...amenityKeys.all, "list"] as const,
};

const fetchAmenities = async (): Promise<AmenitiesResponse> => {
    console.log("Fetching amenities from:", `${API_BASE_URL}/amenities`);
    try {
        const response = await fetch(`${API_BASE_URL}/amenities`, {
            headers: {
                "Accept": "application/json",
            },
        });

        console.log("Amenities response status:", response.status);

        if (!response.ok) {
            const message = await response.text().catch(() => "");
            console.error("Amenities fetch failed:", message);
            throw new Error(message || "Failed to fetch amenities");
        }

        const json = await response.json();
        console.log("Amenities fetched count:", json.length);
        return json;
    } catch (error) {
        console.error("Amenities fetch error:", error);
        throw error;
    }
};

export const useAmenitiesQuery = (
    options?: UseQueryOptions<AmenitiesResponse, Error>
) =>
    useQuery<AmenitiesResponse, Error>({
        queryKey: amenityKeys.list(),
        queryFn: fetchAmenities,
        ...options,
    });
