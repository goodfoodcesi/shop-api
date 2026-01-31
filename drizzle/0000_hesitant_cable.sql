CREATE TABLE "menu" (
	"id" text PRIMARY KEY NOT NULL,
	"shop_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"category" text,
	"options" jsonb,
	"display_order" integer DEFAULT 0,
	"image_url" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shop" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"email" text,
	"phone" text NOT NULL,
	"address" text NOT NULL,
	"address_line_2" text,
	"city" text NOT NULL,
	"zip_code" text NOT NULL,
	"country" text NOT NULL,
	"latitude" text,
	"longitude" text,
	"siret" text NOT NULL,
	"logo" text,
	"cover_image" text,
	"prep_time" integer,
	"schedule" jsonb,
	"status" text DEFAULT 'draft' NOT NULL,
	"submitted_at" timestamp,
	"validated_at" timestamp,
	"validated_by" text,
	"rejected_at" timestamp,
	"rejected_by" text,
	"rejected_reason" text,
	"action_required_at" timestamp,
	"action_required_by" text,
	"action_required_reason" text,
	"visible_since" timestamp,
	"hidden_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
ALTER TABLE "menu" ADD CONSTRAINT "menu_shop_id_shop_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_access" ADD CONSTRAINT "shop_access_shop_id_shop_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_document" ADD CONSTRAINT "shop_document_shop_id_shop_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_status_history" ADD CONSTRAINT "shop_status_history_shop_id_shop_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "menu_shop_id_idx" ON "menu" USING btree ("shop_id");--> statement-breakpoint
CREATE INDEX "menu_is_published_idx" ON "menu" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "menu_category_idx" ON "menu" USING btree ("category");--> statement-breakpoint
CREATE INDEX "shop_access_shop_id_idx" ON "shop_access" USING btree ("shop_id");--> statement-breakpoint
CREATE INDEX "shop_access_user_id_idx" ON "shop_access" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "shop_access_org_id_idx" ON "shop_access" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "shop_status_history_shop_id_idx" ON "shop_status_history" USING btree ("shop_id");--> statement-breakpoint
CREATE INDEX "shop_status_history_changed_at_idx" ON "shop_status_history" USING btree ("changed_at");