"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  adminAmenityInputSchema,
  type AdminAmenityFormValues,
} from "@/lib/validations/admin";

import { queryKeys } from "./query-keys";

const emptyAmenityForm: AdminAmenityFormValues = {
  name: "",
};

const getToastErrorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";

export const AmenitySection = () => {
  const queryClient = useQueryClient();
  const amenitiesQuery = useQuery<Amenity[]>({
    queryKey: queryKeys.amenities,
    queryFn: () => listAmenities(),
  });
  const form = useForm<AdminAmenityFormValues>({
    resolver: zodResolver(adminAmenityInputSchema),
    defaultValues: emptyAmenityForm,
  });
  const { errors } = form.formState;
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.amenities });
      form.reset(emptyAmenityForm);
      toast.success("Amenity created", {
        description: `Added "${variables.name || "amenity"}".`,
      });
    },
    onError: (error) => {
      toast.error("Failed to create amenity", {
        description: getToastErrorMessage(error),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: AmenityId; data: UpdateAmenityPayload }) =>
      updateAmenity(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.amenities });
      setEditing(null);
      form.reset(emptyAmenityForm);
      toast.success("Amenity updated", {
        description: `Saved changes for "${variables.data.name || "amenity"}".`,
      });
    },
    onError: (error) => {
      toast.error("Failed to update amenity", {
        description: getToastErrorMessage(error),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: AmenityId; name?: string }) => deleteAmenity(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.amenities });
      if (editing && editing.id === variables.id) {
        setEditing(null);
      }
      toast.success("Amenity deleted", {
        description: `Removed "${variables.name || "amenity"}".`,
      });
    },
    onError: (error) => {
      toast.error("Failed to delete amenity", {
        description: getToastErrorMessage(error),
      });
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    const imageFile =
      values.image instanceof FileList ? values.image[0] : values.image;

    const payload: CreateAmenityPayload | UpdateAmenityPayload = {
      name: values.name,
      image: imageFile,
      removeImage: values.removeImage,
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id as AmenityId, data: payload });
    } else {
      createMutation.mutate(payload as CreateAmenityPayload);
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
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {amenitiesQuery.data?.map((amenity) => (
                    <TableRow key={amenity.id}>
                      <TableCell>
                        {amenity.imageUrl ? (
                          <img
                            src={amenity.imageUrl}
                            alt={amenity.name}
                            className="h-8 w-8 rounded object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded bg-muted" />
                        )}
                      </TableCell>
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
                              deleteMutation.mutate({
                                id: amenity.id as AmenityId,
                                name: amenity.name,
                              });
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
              {editing ? "Update the selected amenity" : "Create a new amenity"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="amenity-name">Name</Label>
                <Input id="amenity-name" {...form.register("name")} />
                {errors.name?.message ? (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="amenity-image">Icon</Label>
                <Input
                  id="amenity-image"
                  type="file"
                  accept="image/*"
                  {...form.register("image")}
                />
                {editing?.imageUrl && !form.watch("removeImage") && (
                  <div className="flex items-center gap-4 rounded-md border p-2">
                    <img
                      src={editing.imageUrl}
                      alt="Current icon"
                      className="h-10 w-10 rounded object-cover"
                    />
                    <div className="flex-1 text-sm text-muted-foreground">
                      Current icon
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
                    Icon will be removed on save.{" "}
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
