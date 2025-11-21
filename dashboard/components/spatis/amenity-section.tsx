"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  createAmenity,
  deleteAmenity,
  listAmenities,
  updateAmenity,
  type Amenity,
  type AmenityId,
  type CreateAmenityPayload,
  type UpdateAmenityPayload,
} from "@/lib/api/amenities";

import { queryKeys } from "./query-keys";

type AmenityFormValues = CreateAmenityPayload & UpdateAmenityPayload;

const emptyAmenityForm: AmenityFormValues = {
  name: "",
};

export const AmenitySection = () => {
  const queryClient = useQueryClient();
  const amenitiesQuery = useQuery<Amenity[]>({
    queryKey: queryKeys.amenities,
    queryFn: () => listAmenities(),
  });
  const form = useForm<AmenityFormValues>({ defaultValues: emptyAmenityForm });
  const [editing, setEditing] = useState<Amenity | null>(null);

  useEffect(() => {
    if (editing) {
      form.reset({ name: editing.name ?? "" });
    } else {
      form.reset(emptyAmenityForm);
    }
  }, [editing, form]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateAmenityPayload) => createAmenity(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.amenities });
      form.reset(emptyAmenityForm);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: AmenityId; data: UpdateAmenityPayload }) =>
      updateAmenity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.amenities });
      setEditing(null);
      form.reset(emptyAmenityForm);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: AmenityId) => deleteAmenity(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.amenities });
      if (editing && editing.id === id) {
        setEditing(null);
      }
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id as AmenityId, data: values });
    } else {
      createMutation.mutate(values);
    }
  });

  const mutationError =
    createMutation.error || updateMutation.error || deleteMutation.error;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Amenities</h2>
        <p className="text-muted-foreground">
          Keep the amenity list in sync with your physical locations.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Amenity list</CardTitle>
            <CardDescription>
              {amenitiesQuery.isLoading
                ? "Loading amenities..."
                : `${amenitiesQuery.data?.length ?? 0} total`}
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {amenitiesQuery.isError ? (
              <p className="text-sm text-destructive">
                Failed to load amenities. Please try again.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {amenitiesQuery.data?.map((amenity) => (
                    <TableRow key={amenity.id}>
                      <TableCell>{amenity.name}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditing(amenity)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (
                              amenity.id &&
                              window.confirm("Delete this amenity?")
                            ) {
                              deleteMutation.mutate(amenity.id as AmenityId);
                            }
                          }}
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
            <CardTitle>{editing ? "Edit amenity" : "New amenity"}</CardTitle>
            <CardDescription>
              {editing
                ? "Update the selected amenity"
                : "Create a new amenity"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="amenity-name">Name</Label>
                <Input
                  id="amenity-name"
                  {...form.register("name", { required: true })}
                />
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
                      : "Create amenity"}
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

