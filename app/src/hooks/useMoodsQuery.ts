import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { components } from "../generated/api-types";

const API_BASE_URL =
    process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3333";

export type Mood = components["schemas"]["Mood"];
export type MoodsResponse = components["schemas"]["PublicMoodsResponse"];

export const moodKeys = {
    all: ["moods"] as const,
    list: () => [...moodKeys.all, "list"] as const,
};

const fetchMoods = async (): Promise<MoodsResponse> => {
    console.log("Fetching moods from:", `${API_BASE_URL}/moods`);
    try {
        const response = await fetch(`${API_BASE_URL}/moods`, {
            headers: {
                "Accept": "application/json",
            },
        });

        console.log("Moods response status:", response.status);

        if (!response.ok) {
            const message = await response.text().catch(() => "");
            console.error("Moods fetch failed:", message);
            throw new Error(message || "Failed to fetch moods");
        }

        const json = await response.json();
        console.log("Moods fetched count:", json.length);
        return json;
    } catch (error) {
        console.error("Moods fetch error:", error);
        throw error;
    }
};

export const useMoodsQuery = (
    options?: UseQueryOptions<MoodsResponse, Error>
) =>
    useQuery<MoodsResponse, Error>({
        queryKey: moodKeys.list(),
        queryFn: fetchMoods,
        ...options,
    });
