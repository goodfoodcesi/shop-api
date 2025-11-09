CREATE TABLE "shop" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"adress" text,
	"country" text,
	"city" text,
	"siret" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
