DROP TABLE "favorites";

ALTER TABLE "categories" ADD COLUMN "image" TEXT;

ALTER TABLE "users" ADD COLUMN "fcmToken" TEXT;
