"use client";

import { useState } from "react";
import { Building2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

import { AmenitySection } from "./amenity-section";
import { SpatiSection } from "./spati-section";

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

type DashboardProps = {
  onLogout: () => void;
};

export const Dashboard = ({ onLogout }: DashboardProps) => {
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
                        isActive
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground"
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

