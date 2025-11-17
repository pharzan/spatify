CREATE TABLE "spati_locations" (
	"id" text PRIMARY KEY NOT NULL,
	"store_name" text NOT NULL,
	"description" text NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"address" text NOT NULL,
	"opening_hours" text NOT NULL,
	"store_type" text NOT NULL,
	"rating" double precision NOT NULL
);
