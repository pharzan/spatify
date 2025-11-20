CREATE TABLE "amenities" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spati_amenities" (
	"spati_id" text NOT NULL,
	"amenity_id" text NOT NULL,
	CONSTRAINT "spati_amenities_spati_id_amenity_id_pk" PRIMARY KEY("spati_id","amenity_id")
);
--> statement-breakpoint
ALTER TABLE "spati_amenities" ADD CONSTRAINT "spati_amenities_spati_id_spati_locations_id_fk" FOREIGN KEY ("spati_id") REFERENCES "public"."spati_locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spati_amenities" ADD CONSTRAINT "spati_amenities_amenity_id_amenities_id_fk" FOREIGN KEY ("amenity_id") REFERENCES "public"."amenities"("id") ON DELETE cascade ON UPDATE no action;