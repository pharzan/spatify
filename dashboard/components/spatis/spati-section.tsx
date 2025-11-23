"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ExternalLinkIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  createSpati,
  deleteSpati,
  listSpatis,
  updateSpati,
  type CreateSpatiPayload,
  type Spati,
  type SpatiId,
  type UpdateSpatiPayload,
} from "@/lib/api/spatis";
import { listAmenities, type Amenity } from "@/lib/api/amenities";
import {
  adminSpatiLocationSchema,
  type AdminSpatiLocationFormValues,
} from "@/lib/validations/admin";

import { queryKeys } from "./query-keys";

const emptySpatiFormValues: AdminSpatiLocationFormValues = {
  name: "",
  address: "",
  description: "",
  hours: "",
  type: "",
  rating: "0",
  latitude: "0",
  longitude: "0",
  amenityIds: [],
};

type NormalizedSpati = Spati & { amenityIds: string[] };

const normalizeSpati = (spati: Spati): NormalizedSpati => ({
  ...spati,
  amenityIds:
    (spati as NormalizedSpati).amenityIds ??
    spati.amenities?.map((amenity) => amenity.id) ??
    [],
});

const toFormValues = (
  spati: NormalizedSpati,
): AdminSpatiLocationFormValues => ({
  name: spati.name ?? "",
  address: spati.address ?? "",
  description: spati.description ?? "",
  hours: spati.hours ?? "",
  type: spati.type ?? "",
  rating: spati.rating != null ? String(spati.rating) : "0",
  latitude: spati.latitude != null ? String(spati.latitude) : "0",
  longitude: spati.longitude != null ? String(spati.longitude) : "0",
  amenityIds: spati.amenityIds ?? [],
});

const getToastErrorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";

type DeleteSpatiVariables = { id: SpatiId; name?: string };

export const SpatiSection = () => {
  const queryClient = useQueryClient();
  const { data: amenities } = useQuery<Amenity[]>({
    queryKey: queryKeys.amenities,
    queryFn: () => listAmenities(),
  });
  const spatiQuery = useQuery<NormalizedSpati[]>({
    queryKey: queryKeys.spatis,
    queryFn: async () => {
      const items = await listSpatis();
      return items.map(normalizeSpati);
    },
  });

  const form = useForm<AdminSpatiLocationFormValues>({
    resolver: zodResolver(adminSpatiLocationSchema),
    defaultValues: emptySpatiFormValues,
  });
  const { errors } = form.formState;
  const [editing, setEditing] = useState<NormalizedSpati | null>(null);
  const [isAutofillingCoords, setIsAutofillingCoords] = useState(false);

  useEffect(() => {
    if (editing) {
      form.reset(toFormValues(editing));
    } else {
      form.reset(emptySpatiFormValues);
    }
  }, [editing, form]);

  const createMutation = useMutation({
    mutationFn: (values: CreateSpatiPayload) => createSpati(values),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.spatis });
      form.reset(emptySpatiFormValues);
      toast.success("Späti created", {
        description: `Added "${variables.name || "Späti"}" to the list.`,
      });
    },
    onError: (error) => {
      toast.error("Failed to create Späti", {
        description: getToastErrorMessage(error),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: SpatiId; data: UpdateSpatiPayload }) =>
      updateSpati(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.spatis });
      setEditing(null);
      form.reset(emptySpatiFormValues);
      const updatedName = variables.data.name || "Späti";
      toast.success("Späti updated", {
        description: `Saved changes for "${updatedName}".`,
      });
    },
    onError: (error) => {
      toast.error("Failed to update Späti", {
        description: getToastErrorMessage(error),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }: DeleteSpatiVariables) => deleteSpati(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.spatis });
      if (editing && editing.id) {
        setEditing(null);
      }
      toast.success("Späti deleted", {
        description: `Removed "${variables.name || "Späti"}".`,
      });
    },
    onError: (error) => {
      toast.error("Failed to delete Späti", {
        description: getToastErrorMessage(error),
      });
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    const imageFile =
      values.image instanceof FileList ? values.image[0] : values.image;

    const payload = {
      ...adminSpatiLocationSchema.parse(values),
      image: imageFile,
      removeImage: values.removeImage,
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id as SpatiId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  });

  const handleAutofillCoordinates = async () => {
    const address = form.getValues("address")?.trim();
    if (!address) {
      toast.error("Address required", {
        description: "Enter an address before attempting to autofill.",
      });
      return;
    }

    setIsAutofillingCoords(true);
    try {
      const params = new URLSearchParams({
        q: address,
        format: "json",
        limit: "1",
      });
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      );
      if (!response.ok) {
        throw new Error("Lookup failed, please try again.");
      }
      const [match] = (await response.json()) as
        | { lat: string; lon: string }[]
        | [];
      if (!match) {
        toast.error("No coordinates found", {
          description: "Nominatim could not find a match for that address.",
        });
        return;
      }
      form.setValue("latitude", match.lat);
      form.setValue("longitude", match.lon);
      toast.success("Coordinates updated", {
        description: "Latitude and longitude were filled from the address.",
      });
    } catch (error) {
      toast.error("Failed to autofill", {
        description: getToastErrorMessage(error),
      });
    } finally {
      setIsAutofillingCoords(false);
    }
  };

  const handleOpenCoordinatesInMaps = () => {
    const parseCoordinate = (value: unknown) => {
      if (typeof value === "number") {
        return value;
      }
      if (typeof value !== "string") {
        return NaN;
      }
      return Number(value.replace(",", ".").trim());
    };

    const latitude = parseCoordinate(form.getValues("latitude"));
    const longitude = parseCoordinate(form.getValues("longitude"));

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      toast.error("Invalid coordinates", {
        description: "Enter valid latitude and longitude before opening maps.",
      });
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const mutationError =
    createMutation.error || updateMutation.error || deleteMutation.error;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Spätis</h2>
        <p className="text-muted-foreground">
          View locations and add or edit entries with instant React Query
          updates.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Locations</CardTitle>
            <CardDescription>
              {spatiQuery.isLoading
                ? "Loading spätis..."
                : `${spatiQuery.data?.length ?? 0} total`}
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {spatiQuery.isError ? (
              <p className="text-sm text-destructive">
                Failed to load spätis. Please try again.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Amenities</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spatiQuery.data?.map((spati) => (
                    <TableRow key={spati.id}>
                      <TableCell>
                        <div className="font-medium">{spati.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {spati.address}
                        </div>
                      </TableCell>
                      <TableCell>
                        {spati.imageUrl ? (
                          <img
                            src={spati.imageUrl}
                            alt={spati.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted" />
                        )}
                      </TableCell>
                      <TableCell>
                        {spati.type ? (
                          <Badge variant="secondary" className="capitalize">
                            {spati.type}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {typeof spati.rating === "number"
                          ? spati.rating.toFixed(1)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {spati.amenities?.length ? (
                          <div className="flex flex-wrap gap-1">
                            {spati.amenities.map((amenity) => (
                              <Badge key={amenity.id} variant="outline">
                                {amenity.name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            None
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditing(spati)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => {
                            if (
                              spati.id &&
                              window.confirm("Delete this Späti?")
                            ) {
                              deleteMutation.mutate({
                                id: spati.id as SpatiId,
                                name: spati.name,
                              });
                            }
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{editing ? "Edit Späti" : "New Späti"}</CardTitle>
            <CardDescription>
              {editing
                ? "Update the selected location"
                : "Fill the form to add a new Späti"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="spati-name">Name</Label>
                  <Input id="spati-name" {...form.register("name")} />
                  {errors.name?.message ? (
                    <p className="text-xs text-destructive">
                      {errors.name.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="spati-image">Image</Label>
                  <Input
                    id="spati-image"
                    type="file"
                    accept="image/*"
                    {...form.register("image")}
                  />
                  {editing?.imageUrl && !form.watch("removeImage") && (
                    <div className="flex items-center gap-4 rounded-md border p-2">
                      <img
                        src={editing.imageUrl}
                        alt="Current image"
                        className="h-10 w-10 rounded object-cover"
                      />
                      <div className="flex-1 text-sm text-muted-foreground">
                        Current image
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => form.setValue("removeImage", true)}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                  {form.watch("removeImage") && (
                    <div className="text-sm text-muted-foreground">
                      Image will be removed on save.{" "}
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0"
                        onClick={() => form.setValue("removeImage", false)}
                      >
                        Undo
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="spati-address">Address</Label>
                  <Input id="spati-address" {...form.register("address")} />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="w-fit"
                    onClick={handleAutofillCoordinates}
                    disabled={isAutofillingCoords}
                  >
                    {isAutofillingCoords
                      ? "Looking up coordinates…"
                      : "Autofill coordinates"}
                  </Button>
                  {errors.address?.message ? (
                    <p className="text-xs text-destructive">
                      {errors.address.message}
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="spati-description">Description</Label>
                  <Textarea
                    id="spati-description"
                    rows={3}
                    {...form.register("description")}
                  />
                  {errors.description?.message ? (
                    <p className="text-xs text-destructive">
                      {errors.description.message}
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="spati-hours">Hours</Label>
                  <Input id="spati-hours" {...form.register("hours")} />
                  {errors.hours?.message ? (
                    <p className="text-xs text-destructive">
                      {errors.hours.message}
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="spati-type">Type</Label>
                  <Input id="spati-type" {...form.register("type")} />
                  {errors.type?.message ? (
                    <p className="text-xs text-destructive">
                      {errors.type.message}
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="spati-rating">Rating</Label>
                  <Input
                    id="spati-rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    {...form.register("rating")}
                  />
                  {errors.rating?.message ? (
                    <p className="text-xs text-destructive">
                      {errors.rating.message}
                    </p>
                  ) : null}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="spati-latitude">Latitude</Label>
                    <Input
                      id="spati-latitude"
                      type="number"
                      step="0.0000001"
                      {...form.register("latitude")}
                    />
                    {errors.latitude?.message ? (
                      <p className="text-xs text-destructive">
                        {errors.latitude.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="spati-longitude">Longitude</Label>
                    <Input
                      id="spati-longitude"
                      type="number"
                      step="0.0000001"
                      {...form.register("longitude")}
                    />
                    {errors.longitude?.message ? (
                      <p className="text-xs text-destructive">
                        {errors.longitude.message}
                      </p>
                    ) : null}
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="link"
                  className="w-fit px-0 text-sm cursor-pointer"
                  onClick={handleOpenCoordinatesInMaps}
                  title="Opens coordinates in a new Google Maps tab"
                >
                  Open in Google Maps (new tab)
                  <ExternalLinkIcon aria-hidden="true" className="size-3.5" />
                </Button>
                <div className="space-y-2">
                  <Label>Amenities</Label>
                  <Controller
                    control={form.control}
                    name="amenityIds"
                    render={({ field }) => (
                      <div className="flex flex-wrap gap-3">
                        {amenities?.map((amenity) => {
                          const checked = field.value?.includes(amenity.id);
                          return (
                            <label
                              key={amenity.id}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(value) => {
                                  const next = value
                                    ? [...(field.value ?? []), amenity.id]
                                    : (field.value ?? []).filter(
                                        (id) => id !== amenity.id,
                                      );
                                  field.onChange(next);
                                }}
                              />
                              {amenity.name}
                            </label>
                          );
                        })}
                        {!amenities?.length && (
                          <p className="text-xs text-muted-foreground">
                            No amenities available yet.
                          </p>
                        )}
                      </div>
                    )}
                  />
                  {errors.amenityIds?.message ? (
                    <p className="text-xs text-destructive">
                      {errors.amenityIds.message}
                    </p>
                  ) : null}
                </div>
              </div>
              {mutationError ? (
                <p className="text-sm text-destructive">
                  {mutationError instanceof Error
                    ? mutationError.message
                    : "Something went wrong. Please try again."}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {editing
                    ? updateMutation.isPending
                      ? "Saving..."
                      : "Save changes"
                    : createMutation.isPending
                      ? "Creating..."
                      : "Create Späti"}
                </Button>
                {editing ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditing(null)}
                    disabled={updateMutation.isPending}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
