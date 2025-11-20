"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  useAmenitiesQuery,
  useCreateAmenityMutation,
  useDeleteAmenityMutation,
} from "@/lib/api/amenities";
import type { Amenity } from "@/lib/api/amenities";
import {
  useCreateSpatiMutation,
  useDeleteSpatiMutation,
  useSpatisQuery,
  useUpdateSpatiMutation,
  type Spati,
} from "@/lib/api/spatis";

type SpatiFormValues = Parameters<ReturnType<typeof useCreateSpatiMutation>["mutate"]>[0];

const emptyFormValues: SpatiFormValues = {
  name: "",
  description: "",
  latitude: 0,
  longitude: 0,
  address: "",
  hours: "",
  type: "",
  rating: 0,
  amenityIds: [],
};

export const SpatiAdminPage = () => {
  const [editing, setEditing] = useState<Spati | null>(null);
  const form = useForm<SpatiFormValues>({
    defaultValues: emptyFormValues,
  });
  const amenityForm = useForm<{ name: string }>({
    defaultValues: { name: "" },
  });

  const { data: spatis = [], isLoading, error, refetch, isFetching } = useSpatisQuery();
  const createMutation = useCreateSpatiMutation();
  const updateMutation = useUpdateSpatiMutation();
  const deleteMutation = useDeleteSpatiMutation();
  const {
    data: amenities = [],
    isLoading: areAmenitiesLoading,
    error: amenitiesError,
    refetch: refetchAmenities,
    isFetching: areAmenitiesFetching,
  } = useAmenitiesQuery();
  const createAmenityMutation = useCreateAmenityMutation({
    onSuccess: () => {
      amenityForm.reset();
    },
  });
  const deleteAmenityMutation = useDeleteAmenityMutation();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error || updateMutation.error || deleteMutation.error;
  const amenityMutationError =
    createAmenityMutation.error || deleteAmenityMutation.error || null;

  useEffect(() => {
    if (editing) {
      form.reset({
        name: editing.name,
        description: editing.description,
        latitude: editing.latitude,
        longitude: editing.longitude,
        address: editing.address,
        hours: editing.hours,
        type: editing.type,
        rating: editing.rating,
        amenityIds: editing.amenities?.map((amenity) => amenity.id) ?? [],
      });
    } else {
      form.reset(emptyFormValues);
    }
  }, [editing, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data: values });
      setEditing(null);
    } else {
      await createMutation.mutateAsync(values);
      form.reset(emptyFormValues);
    }
  });

  const handleDelete = async (spati: Spati) => {
    const confirmed = window.confirm(`Delete "${spati.name}"? This cannot be undone.`);
    if (!confirmed) return;

    await deleteMutation.mutateAsync(spati.id);
    if (editing?.id === spati.id) {
      setEditing(null);
    }
  };

  const onCreateAmenity = amenityForm.handleSubmit(async (values) => {
    await createAmenityMutation.mutateAsync(values);
  });

  const handleDeleteAmenity = async (amenity: Amenity) => {
    const confirmed = window.confirm(
      `Delete amenity "${amenity.name}"? This will remove it from all Spätis.`,
    );
    if (!confirmed) return;

    await deleteAmenityMutation.mutateAsync(amenity.id);
  };

  const listStateLabel = useMemo(() => {
    if (isLoading) return "Loading spatis…";
    if (error) return "Unable to load spatis";
    if (spatis.length === 0) return "No spatis found";
    return `${spatis.length} spatis`;
  }, [error, isLoading, spatis.length]);
  const amenityListStateLabel = useMemo(() => {
    if (areAmenitiesLoading) return "Loading amenities…";
    if (amenitiesError) return "Unable to load amenities";
    if (amenities.length === 0) return "No amenities yet";
    return `${amenities.length} amenity${amenities.length === 1 ? "" : "ies"}`;
  }, [amenities.length, amenitiesError, areAmenitiesLoading]);

  return (
    <div className="bg-muted/40 min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Späti Admin</h1>
          <p className="text-muted-foreground mt-1">
            Create, update, and delete Späti locations backed by the REST API.
          </p>
        </div>
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Failed to load list</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        ) : null}
        {mutationError ? (
          <Alert variant="destructive">
            <AlertTitle>Request failed</AlertTitle>
            <AlertDescription>{mutationError.message}</AlertDescription>
          </Alert>
        ) : null}
        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <Card className="shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle>Späti management</CardTitle>
              <CardDescription>
                Review the catalog, edit existing entries, and onboard new locations from a single
                workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 2xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Catalog
                    </p>
                    <h3 className="text-xl font-semibold leading-tight">All Spätis</h3>
                    <p className="text-sm text-muted-foreground">{listStateLabel}</p>
                  </div>
                  <Button
                    onClick={() => refetch()}
                    variant="outline"
                    size="sm"
                    disabled={isFetching}
                  >
                    Refresh
                  </Button>
                </div>
                <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Coordinates</TableHead>
                        <TableHead>Amenities</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {spatis.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">
                            {isLoading ? "Loading…" : "No entries yet. Create one using the form."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        spatis.map((spati) => {
                          const isDeleting =
                            deleteMutation.isPending && deleteMutation.variables === spati.id;
                          const spatiAmenities = spati.amenities ?? [];
                          return (
                            <TableRow
                              key={spati.id}
                              data-state={editing?.id === spati.id ? "selected" : undefined}
                            >
                              <TableCell>
                                <div className="font-medium">{spati.name}</div>
                                <div className="text-muted-foreground text-xs">{spati.address}</div>
                              </TableCell>
                              <TableCell className="capitalize">{spati.type || "—"}</TableCell>
                              <TableCell>{spati.rating.toFixed(1)}</TableCell>
                              <TableCell className="text-sm">
                                <div className="leading-none">
                                  {spati.latitude.toFixed(4)}, {spati.longitude.toFixed(4)}
                                </div>
                                <div className="text-muted-foreground text-xs">{spati.hours}</div>
                              </TableCell>
                              <TableCell>
                                {spatiAmenities.length ? (
                                  <div className="flex flex-wrap gap-1.5">
                                    {spatiAmenities.map((amenity) => (
                                      <Badge key={amenity.id} variant="secondary" className="text-xs">
                                        {amenity.name}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">None</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditing(spati)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(spati)}
                                    disabled={isDeleting}
                                  >
                                    {isDeleting ? "Deleting…" : "Delete"}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </section>
              <Separator className="2xl:hidden" />
              <section className="space-y-4 rounded-2xl border bg-muted/30 p-4 shadow-sm">
                <div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {editing ? "Update location" : "New location"}
                    </p>
                    <h3 className="text-lg font-semibold leading-tight">
                      {editing ? `Editing ${editing.name}` : "Create a Späti"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {editing
                        ? "Modify the data below and save your changes."
                        : "Provide the required information to onboard a new location."}
                    </p>
                  </div>
                </div>
                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Basic details
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Name, type, opening hours, and ratings.
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" {...form.register("name", { required: true })} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="type">Type</Label>
                        <Input id="type" placeholder="kiosk, bar, ..." {...form.register("type")} />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="hours">Hours</Label>
                        <Input
                          id="hours"
                          placeholder="Mon-Fri 09:00 - 22:00"
                          {...form.register("hours")}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="rating">Rating</Label>
                        <Input
                          id="rating"
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          {...form.register("rating", { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Location
                      </p>
                      <p className="text-sm text-muted-foreground">Address and coordinates.</p>
                    </div>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" {...form.register("address", { required: true })} />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="latitude">Latitude</Label>
                          <Input
                            id="latitude"
                            type="number"
                            step="0.0001"
                            {...form.register("latitude", { valueAsNumber: true, required: true })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="longitude">Longitude</Label>
                          <Input
                            id="longitude"
                            type="number"
                            step="0.0001"
                            {...form.register("longitude", { valueAsNumber: true, required: true })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      rows={3}
                      {...form.register("description", { required: true })}
                    />
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base">Amenities</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => refetchAmenities()}
                        disabled={areAmenitiesFetching}
                      >
                        Refresh list
                      </Button>
                    </div>
                    <Controller
                      control={form.control}
                      name="amenityIds"
                      render={({ field }) => {
                        const selected = field.value ?? [];
                        return (
                          <div className="rounded-xl border bg-background p-3">
                            {areAmenitiesLoading ? (
                              <p className="text-sm text-muted-foreground">Loading amenities…</p>
                            ) : amenitiesError ? (
                              <div className="flex flex-col gap-2">
                                <p className="text-sm text-destructive">
                                  Failed to load amenities. Please try again.
                                </p>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => refetchAmenities()}
                                  disabled={areAmenitiesFetching}
                                >
                                  {areAmenitiesFetching ? "Retrying…" : "Retry"}
                                </Button>
                              </div>
                            ) : amenities.length === 0 ? (
                              <p className="text-sm text-muted-foreground">
                                No amenities available yet. Create one before assigning it to a Späti.
                              </p>
                            ) : (
                              <>
                                <div className="max-h-48 space-y-3 overflow-y-auto pr-1">
                                  {amenities.map((amenity) => {
                                    const isSelected = selected.includes(amenity.id);
                                    return (
                                      <label
                                        key={amenity.id}
                                        className="flex items-center gap-2 text-sm font-medium"
                                      >
                                        <Checkbox
                                          checked={isSelected}
                                          onCheckedChange={(checked) => {
                                            const next =
                                              checked === true
                                                ? Array.from(new Set([...selected, amenity.id]))
                                                : selected.filter((id) => id !== amenity.id);
                                            field.onChange(next);
                                          }}
                                          onBlur={() => field.onBlur()}
                                        />
                                        <span>{amenity.name}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {selected.length
                                    ? `${selected.length} amenity${selected.length === 1 ? "" : "ies"} selected`
                                    : "Select the amenities this Späti offers."}
                                </p>
                              </>
                            )}
                          </div>
                        );
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : editing ? "Update Späti" : "Create Späti"}
                    </Button>
                    {editing ? (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setEditing(null)}
                        disabled={isSubmitting}
                      >
                        Cancel edit
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.reset(emptyFormValues)}
                        disabled={isSubmitting}
                      >
                        Reset form
                      </Button>
                    )}
                  </div>
                </form>
              </section>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle>Amenity catalog</CardTitle>
              <CardDescription>{amenityListStateLabel}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Manage reusable amenities that can be linked to every location.
                  </p>
                </div>
                <Button
                  onClick={() => refetchAmenities()}
                  variant="outline"
                  size="sm"
                  disabled={areAmenitiesFetching}
                >
                  Refresh
                </Button>
              </div>
              {amenityMutationError ? (
                <Alert variant="destructive">
                  <AlertTitle>Request failed</AlertTitle>
                  <AlertDescription>{amenityMutationError.message}</AlertDescription>
                </Alert>
              ) : null}
              {amenitiesError ? (
                <Alert variant="destructive">
                  <AlertTitle>Failed to load amenities</AlertTitle>
                  <AlertDescription>{amenitiesError.message}</AlertDescription>
                </Alert>
              ) : null}
              <form
                onSubmit={onCreateAmenity}
                className="space-y-3 rounded-2xl border bg-muted/30 p-4"
              >
                <div className="grid gap-2">
                  <Label htmlFor="amenity-name">Amenity name</Label>
                  <Input
                    id="amenity-name"
                    placeholder="e.g. Wi-Fi"
                    {...amenityForm.register("name", { required: "Name is required" })}
                  />
                  {amenityForm.formState.errors.name ? (
                    <p className="text-sm text-destructive">
                      {amenityForm.formState.errors.name.message}
                    </p>
                  ) : null}
                </div>
                <Button type="submit" disabled={createAmenityMutation.isPending} className="w-full">
                  {createAmenityMutation.isPending ? "Adding…" : "Add amenity"}
                </Button>
              </form>
              <div className="overflow-hidden rounded-2xl border bg-background">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {areAmenitiesLoading ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center">
                          Loading amenities…
                        </TableCell>
                      </TableRow>
                    ) : amenitiesError ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-destructive">
                          Unable to load amenities. Try refreshing.
                        </TableCell>
                      </TableRow>
                    ) : amenities.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center">
                          No amenities yet. Use the form above to add one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      amenities.map((amenity) => {
                        const isDeleting =
                          deleteAmenityMutation.isPending &&
                          deleteAmenityMutation.variables === amenity.id;
                        return (
                          <TableRow key={amenity.id}>
                            <TableCell className="font-medium">{amenity.name}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteAmenity(amenity)}
                                disabled={isDeleting}
                              >
                                {isDeleting ? "Deleting…" : "Delete"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
