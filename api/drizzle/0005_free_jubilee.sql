CREATE TABLE "moods" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" text NOT NULL,
	"image_url" text
);
--> statement-breakpoint
ALTER TABLE "spati_locations" ADD COLUMN "mood_id" text;--> statement-breakpoint
ALTER TABLE "spati_locations" ADD CONSTRAINT "spati_locations_mood_id_moods_id_fk" FOREIGN KEY ("mood_id") REFERENCES "public"."moods"("id") ON DELETE no action ON UPDATE no action;