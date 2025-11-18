"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
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
};

export const SpatiAdminPage = () => {
  const [editing, setEditing] = useState<Spati | null>(null);
  const form = useForm<SpatiFormValues>({
    defaultValues: emptyFormValues,
  });

  const { data: spatis = [], isLoading, error, refetch, isFetching } = useSpatisQuery();
  const createMutation = useCreateSpatiMutation();
  const updateMutation = useUpdateSpatiMutation();
  const deleteMutation = useDeleteSpatiMutation();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error || updateMutation.error || deleteMutation.error;

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

  const listStateLabel = useMemo(() => {
    if (isLoading) return "Loading spatis…";
    if (error) return "Unable to load spatis";
    if (spatis.length === 0) return "No spatis found";
    return `${spatis.length} spatis`;
  }, [error, isLoading, spatis.length]);

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
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>All Spätis</CardTitle>
                <CardDescription>{listStateLabel}</CardDescription>
              </div>
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
                disabled={isFetching}
              >
                Refresh
              </Button>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="overflow-hidden rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Coordinates</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {spatis.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          {isLoading ? "Loading…" : "No entries yet. Create one using the form."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      spatis.map((spati) => {
                        const isDeleting =
                          deleteMutation.isPending && deleteMutation.variables === spati.id;
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
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{editing ? `Edit ${editing.name}` : "Create Späti"}</CardTitle>
              <CardDescription>
                {editing ? "Update the selected Späti and save your changes." : "Provide all details to create a new entry."}
              </CardDescription>
            </CardHeader>
            <form onSubmit={onSubmit}>
              <CardContent className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" {...form.register("name", { required: true })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    {...form.register("description", { required: true })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" {...form.register("address", { required: true })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hours">Hours</Label>
                  <Input id="hours" placeholder="Mon-Fri 09:00 - 22:00" {...form.register("hours")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Input id="type" placeholder="kiosk, bar, ..." {...form.register("type")} />
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
              </CardContent>
              <CardFooter className="flex items-center gap-3">
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
                    Reset
                  </Button>
                )}
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
