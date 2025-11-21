"use client";

import { useEffect, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Building2, Sparkles } from "lucide-react";
import {
  listSpatis,
  createSpati,
  updateSpati,
  deleteSpati,
  type CreateSpatiPayload,
  type UpdateSpatiPayload,
  type Spati,
  type SpatiId,
} from "@/lib/api/spatis";
import {
  listAmenities,
  createAmenity,
  updateAmenity,
  deleteAmenity,
  type Amenity,
  type AmenityId,
  type CreateAmenityPayload,
  type UpdateAmenityPayload,
} from "@/lib/api/amenities";
import { login, type AdminLoginPayload } from "@/lib/api/auth";
import {
  getStoredAuthToken,
  setAuthToken,
} from "@/lib/auth/token-storage";

const queryKeys = {
  spatis: ["spatis"] as const,
  amenities: ["amenities"] as const,
};

type SpatiPayload = CreateSpatiPayload & UpdateSpatiPayload;

type SpatiFormValues = {
  name: string;
  address: string;
  description: string;
  hours: string;
  type: string;
  rating: string;
  latitude: string;
  longitude: string;
  amenityIds: string[];
};

const emptySpatiFormValues: SpatiFormValues = {
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

const toFormValues = (spati: NormalizedSpati): SpatiFormValues => ({
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

const buildSpatiPayload = (values: SpatiFormValues): SpatiPayload => ({
  name: values.name,
  address: values.address,
  description: values.description,
  hours: values.hours,
  type: values.type,
  rating: Number(values.rating) || 0,
  latitude: Number(values.latitude) || 0,
  longitude: Number(values.longitude) || 0,
  amenityIds: values.amenityIds,
});

type AmenityFormValues = CreateAmenityPayload & UpdateAmenityPayload;

const emptyAmenityForm: AmenityFormValues = {
  name: "",
};

export const SpatiAdminPage = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AdminContent />
    </QueryClientProvider>
  );
};

const AdminContent = () => {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(() => getStoredAuthToken());

  const handleLogout = () => {
    setAuthToken(null);
    setToken(null);
    queryClient.clear();
  };

  if (!token) {
    return <LoginView onAuthenticated={(value) => setToken(value)} />;
  }

  return <Dashboard onLogout={handleLogout} />;
};

const LoginView = ({
  onAuthenticated,
}: {
  onAuthenticated: (token: string) => void;
}) => {
  const form = useForm<AdminLoginPayload>({
    defaultValues: { email: "", password: "" },
  });
  const loginMutation = useMutation({
    mutationFn: (values: AdminLoginPayload) => login(values),
    onSuccess: (data) => {
      setAuthToken(data.token);
      onAuthenticated(data.token);
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Use your admin credentials to manage Spätis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) => loginMutation.mutate(values))}
          >
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                {...form.register("email", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                {...form.register("password", { required: true })}
              />
            </div>
            {loginMutation.isError ? (
              <p className="text-sm text-destructive">
                {loginMutation.error instanceof Error
                  ? loginMutation.error.message
                  : "Unable to sign in. Please try again."}
              </p>
            ) : null}
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const navItems = [
  {
    id: "spatis" as const,
    label: "Spätis",
    description: "Manage location listings",
    Icon: Building2,
  },
  {
    id: "amenities" as const,
    label: "Amenities",
    description: "Edit amenity catalog",
    Icon: Sparkles,
  },
];

const Dashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [activeSection, setActiveSection] = useState<
    (typeof navItems)[number]["id"]
  >("spatis");
  const currentNav = navItems.find((item) => item.id === activeSection)!;

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className="hidden lg:flex lg:w-64 lg:flex-col border-r bg-muted/30">
        <div className="px-6 py-6">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
            Späti Admin
          </p>
          <h1 className="text-2xl font-semibold">
            Berlin’s late-night dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Manage locations and amenities with live updates.
          </p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ id, label, description, Icon }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full rounded-lg px-4 py-3 text-left transition ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <div>
                    <p className="font-semibold">{label}</p>
                    <p
                      className={`text-xs ${
                        isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                      }`}
                    >
                      {description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
        <div className="px-6 py-4 border-t mt-auto">
          <Button variant="outline" className="w-full" onClick={onLogout}>
            Log out
          </Button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col">
        <div className="border-b px-6 sm:px-10 py-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Späti Admin</p>
            <h2 className="text-3xl font-bold tracking-tight">
              {currentNav.label}
            </h2>
            <p className="text-muted-foreground">{currentNav.description}</p>
          </div>
          <div className="lg:hidden">
            <Button variant="outline" onClick={onLogout}>
              Log out
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6">
          <div className="flex gap-2 lg:hidden">
            {navItems.map(({ id, label }) => (
              <Button
                key={id}
                variant={activeSection === id ? "default" : "outline"}
                onClick={() => setActiveSection(id)}
              >
                {label}
              </Button>
            ))}
          </div>
          {activeSection === "spatis" ? <SpatiSection /> : <AmenitySection />}
        </div>
      </main>
    </div>
  );
};

const SpatiSection = () => {
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

  const form = useForm<SpatiFormValues>({ defaultValues: emptySpatiFormValues });
  const [editing, setEditing] = useState<NormalizedSpati | null>(null);

  useEffect(() => {
    if (editing) {
      form.reset(toFormValues(editing));
    } else {
      form.reset(emptySpatiFormValues);
    }
  }, [editing, form]);

  const createMutation = useMutation({
    mutationFn: (values: SpatiPayload) => createSpati(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.spatis });
      form.reset(emptySpatiFormValues);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: SpatiId; data: SpatiPayload }) =>
      updateSpati(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.spatis });
      setEditing(null);
      form.reset(emptySpatiFormValues);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: SpatiId) => deleteSpati(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.spatis });
      if (editing && editing.id) {
        setEditing(null);
      }
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    const payload = buildSpatiPayload(values);
    if (editing) {
      updateMutation.mutate({ id: editing.id as SpatiId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  });

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
                            if (spati.id && window.confirm("Delete this Späti?")) {
                              deleteMutation.mutate(spati.id as SpatiId);
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
                  <Input id="spati-name" {...form.register("name", { required: true })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="spati-address">Address</Label>
                  <Input
                    id="spati-address"
                    {...form.register("address", { required: true })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="spati-description">Description</Label>
                  <Textarea id="spati-description" rows={3} {...form.register("description", { required: true })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="spati-hours">Hours</Label>
                  <Input id="spati-hours" {...form.register("hours") } />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="spati-type">Type</Label>
                  <Input id="spati-type" {...form.register("type")} />
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="spati-latitude">Latitude</Label>
                    <Input
                      id="spati-latitude"
                      type="number"
                      step="0.0001"
                      {...form.register("latitude")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="spati-longitude">Longitude</Label>
                    <Input
                      id="spati-longitude"
                      type="number"
                      step="0.0001"
                      {...form.register("longitude")}
                    />
                  </div>
                </div>
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
                                    : (field.value ?? []).filter((id) => id !== amenity.id);
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

const AmenitySection = () => {
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
