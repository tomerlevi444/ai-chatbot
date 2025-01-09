ALTER TABLE "apartment" ALTER COLUMN "properties" SET DATA TYPE text[];--> statement-breakpoint
ALTER TABLE "apartment" ALTER COLUMN "properties" SET DEFAULT '{}'::text[];--> statement-breakpoint
ALTER TABLE "apartment" ALTER COLUMN "properties" SET NOT NULL;