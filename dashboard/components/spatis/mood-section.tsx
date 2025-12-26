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
  createMood,
  deleteMood,
  listMoods,
  updateMood,
  type Mood,
  type MoodId,
  type CreateMoodPayload,
  type UpdateMoodPayload,
} from "@/lib/api/moods";
import {
  adminMoodInputSchema,
  type AdminMoodFormValues,
} from "@/lib/validations/admin";

import { queryKeys } from "./query-keys";

const emptyMoodForm: AdminMoodFormValues = {
  name: "",
  color: "#000000",
};

const getToastErrorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";

export const MoodSection = () => {
  const queryClient = useQueryClient();
  const moodsQuery = useQuery<Mood[]>({
    queryKey: queryKeys.moods,
    queryFn: () => listMoods(),
  });
  const form = useForm<AdminMoodFormValues>({
    resolver: zodResolver(adminMoodInputSchema),
    defaultValues: emptyMoodForm,
  });
  const { errors } = form.formState;
  const [editing, setEditing] = useState<Mood | null>(null);

  useEffect(() => {
    if (editing) {
      form.reset({
        name: editing.name ?? "",
        color: editing.color ?? "#000000",
      });
    } else {
      form.reset(emptyMoodForm);
    }
  }, [editing, form]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateMoodPayload) => createMood(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.moods });
      form.reset(emptyMoodForm);
      toast.success("Mood created", {
        description: `Added "${variables.name || "mood"}".`,
      });
    },
    onError: (error) => {
      toast.error("Failed to create mood", {
        description: getToastErrorMessage(error),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: MoodId; data: UpdateMoodPayload }) =>
      updateMood(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.moods });
      setEditing(null);
      form.reset(emptyMoodForm);
      toast.success("Mood updated", {
        description: `Saved changes for "${variables.data.name || "mood"}".`,
      });
    },
    onError: (error) => {
      toast.error("Failed to update mood", {
        description: getToastErrorMessage(error),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: MoodId; name?: string }) => deleteMood(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.moods });
      if (editing && editing.id === variables.id) {
        setEditing(null);
      }
      toast.success("Mood deleted", {
        description: `Removed "${variables.name || "mood"}".`,
      });
    },
    onError: (error) => {
      toast.error("Failed to delete mood", {
        description: getToastErrorMessage(error),
      });
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    const imageFile =
      values.image instanceof FileList ? values.image[0] : values.image;

    const payload: CreateMoodPayload | UpdateMoodPayload = {
      name: values.name,
      color: values.color,
      image: imageFile,
      removeImage: values.removeImage,
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id as MoodId, data: payload });
    } else {
      createMutation.mutate(payload as CreateMoodPayload);
    }
  });

  const mutationError =
    createMutation.error || updateMutation.error || deleteMutation.error;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Moods</h2>
        <p className="text-muted-foreground">
          Manage mood colors and vibes for your Späti locations.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mood list</CardTitle>
            <CardDescription>
              {moodsQuery.isLoading
                ? "Loading moods..."
                : `${moodsQuery.data?.length ?? 0} total`}
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {moodsQuery.isError ? (
              <p className="text-sm text-destructive">
                Failed to load moods. Please try again.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {moodsQuery.data?.map((mood) => (
                    <TableRow key={mood.id}>
                      <TableCell>
                        {mood.imageUrl ? (
                          <img
                            src={mood.imageUrl}
                            alt={mood.name}
                            className="h-8 w-8 rounded object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded bg-muted" />
                        )}
                      </TableCell>
                      <TableCell>{mood.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-6 w-6 rounded border"
                            style={{ backgroundColor: mood.color }}
                          />
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {mood.color}
                          </code>
                        </div>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditing(mood)}
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
                              mood.id &&
                              window.confirm("Delete this mood?")
                            ) {
                              deleteMutation.mutate({
                                id: mood.id as MoodId,
                                name: mood.name,
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
            <CardTitle>{editing ? "Edit mood" : "New mood"}</CardTitle>
            <CardDescription>
              {editing ? "Update the selected mood" : "Create a new mood"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="mood-name">Name</Label>
                <Input id="mood-name" {...form.register("name")} />
                {errors.name?.message ? (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="mood-color">Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="mood-color-picker"
                    type="color"
                    className="w-20 h-10 cursor-pointer"
                    {...form.register("color")}
                    onChange={(e) => {
                      form.setValue("color", e.target.value.toUpperCase());
                    }}
                  />
                  <Input
                    id="mood-color"
                    type="text"
                    placeholder="#000000"
                    className="flex-1 font-mono"
                    {...form.register("color")}
                    onChange={(e) => {
                      form.setValue("color", e.target.value.toUpperCase());
                    }}
                  />
                </div>
                {errors.color?.message ? (
                  <p className="text-xs text-destructive">
                    {errors.color.message}
                  </p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  Click the color box to pick a color, or enter a hex code
                  manually
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="mood-image">Icon</Label>
                <Input
                  id="mood-image"
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
                      : "Create mood"}
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
