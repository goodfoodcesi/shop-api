CREATE TABLE "shop_access" (
	"id" text PRIMARY KEY NOT NULL,
	"shop_id" text NOT NULL,
	"user_id" text,
	"organization_id" text,
	"role" text NOT NULL,
	"granted_by" text NOT NULL,
	"granted_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shop_document" (
	"id" text PRIMARY KEY NOT NULL,
	"shop_id" text NOT NULL,
	"type" text NOT NULL,
	"url" text NOT NULL,
	"filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer,
	"is_verified" boolean DEFAULT false,
	"verified_at" timestamp,
	"verified_by" text,
	"rejection_reason" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"uploaded_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shop_status_history" (
	"id" text PRIMARY KEY NOT NULL,
	"shop_id" text NOT NULL,
	"from_status" text,
	"to_status" text NOT NULL,
	"changed_by" text NOT NULL,
	"changed_at" timestamp DEFAULT now() NOT NULL,
	"reason" text,
	"metadata" jsonb
);
--> statement-breakpoint
ALTER TABLE "shop" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "shop" ALTER COLUMN "country" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "shop" ALTER COLUMN "city" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "shop" ALTER COLUMN "siret" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "shop" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "shop" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "shop" ADD COLUMN "phone" text NOT NULL;--> statement-breakpoint
ALTER TABLE "shop" ADD COLUMN "address" text NOT NULL;--> statement-breakpoint
ALTER TABLE "shop" ADD COLUMN "address_line_2" text;--> statement-breakpoint
ALTER TABLE "shop" ADD COLUMN "zip_code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "shop" ADD COLUMN "latitude" text;--> statement-breakpoint
ALTER TABLE "shop" ADD COLUMN "longitude" text;--> statement-breakpoint
ALTER TABLE "shop" ADD COLUMN "logo" text;--> statement-breakpoint
ALTER TABLE "shop" ADD COLUMN "cover_image" text;--> statement-breakpoint
ALTER TABLE "shop" ADD COLUMN "prep_time" integer;--> statement-breakpoint
ALTER TABLE "shop" ADD COLUMN "schedule" jsonb;--> statement-breakpoint
ALTER TABLE "shop" ADD COLUMN "status" text DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "shop" ADD COLUMN "submitted_at" timestamp;--> statement-breakpoint
ALTER TABLE "shop" ADD COLUMN "validated_at" timestamp;--> statement-breakpoint
ALTER TABLE "shop" ADD COLUMN "validated_by" text;--> statement-breakpoint
ALTER TABLE "shop" ADD COLUMN "rejected_at" timestamp;--> statement-breakpoint
ALTER TABLE "shop" ADD COLUMN "rejected_by" text;--> statement-breakpoint
ALTER TABLE "shop" ADD COLUMN "rejected_reason" text;--> statement-breakpoint
ALTER TABLE "shop" ADD COLUMN "action_required_at" timestamp;--> statement-breakpoint
ALTER TABLE "shop" ADD COLUMN "action_required_by" text;--> statement-breakpoint
ALTER TABLE "shop" ADD COLUMN "action_required_reason" text;--> statement-breakpoint
ALTER TABLE "shop" ADD COLUMN "visible_since" timestamp;--> statement-breakpoint
ALTER TABLE "shop" ADD COLUMN "hidden_at" timestamp;--> statement-breakpoint
ALTER TABLE "shop_access" ADD CONSTRAINT "shop_access_shop_id_shop_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_document" ADD CONSTRAINT "shop_document_shop_id_shop_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_status_history" ADD CONSTRAINT "shop_status_history_shop_id_shop_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "shop_access_shop_id_idx" ON "shop_access" USING btree ("shop_id");--> statement-breakpoint
CREATE INDEX "shop_access_user_id_idx" ON "shop_access" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "shop_access_org_id_idx" ON "shop_access" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "shop_status_history_shop_id_idx" ON "shop_status_history" USING btree ("shop_id");--> statement-breakpoint
CREATE INDEX "shop_status_history_changed_at_idx" ON "shop_status_history" USING btree ("changed_at");--> statement-breakpoint
ALTER TABLE "shop" DROP COLUMN "adress";