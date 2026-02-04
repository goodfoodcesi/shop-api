CREATE TYPE "public"."item_status" AS ENUM('draft', 'published', 'sold', 'archived');--> statement-breakpoint
CREATE TABLE "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"category" varchar(100) NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"seller_id" uuid NOT NULL,
	"status" "item_status" DEFAULT 'published' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;