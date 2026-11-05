-- CreateEnum
CREATE TYPE "LanguageCode" AS ENUM ('GU', 'EN');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'CHANGES_REQUESTED', 'PUBLISHED', 'ARCHIVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PlaceType" AS ENUM ('TEMPLE', 'HISTORICAL_SITE', 'LANDMARK', 'PUBLIC_FACILITY');

-- CreateEnum
CREATE TYPE "VillageInfoCategory" AS ENUM ('AGRICULTURE', 'FARMING', 'DAIRY', 'ANIMAL_HUSBANDRY', 'CULTURE', 'TRADITION');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "news_categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameGu" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_articles" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "featuredImage" TEXT,
    "sourceUrl" TEXT,
    "sourceName" TEXT,
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_translations" (
    "id" TEXT NOT NULL,
    "newsArticleId" TEXT NOT NULL,
    "languageCode" "LanguageCode" NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "village_places" (
    "id" TEXT NOT NULL,
    "type" "PlaceType" NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "featuredImage" TEXT,
    "address" TEXT,
    "contactPhone" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "village_places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "village_place_translations" (
    "id" TEXT NOT NULL,
    "villagePlaceId" TEXT NOT NULL,
    "languageCode" "LanguageCode" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "description" TEXT NOT NULL,
    "history" TEXT,
    "timing" TEXT,
    "architecture" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "village_place_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "village_info" (
    "id" TEXT NOT NULL,
    "category" "VillageInfoCategory" NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "featuredImage" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "village_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "village_info_translations" (
    "id" TEXT NOT NULL,
    "villageInfoId" TEXT NOT NULL,
    "languageCode" "LanguageCode" NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "village_info_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameGu" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "businesses" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "openingHours" TEXT,
    "featuredImage" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_translations" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "languageCode" "LanguageCode" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "ownerName" TEXT,
    "productsServices" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "featuredImage" TEXT,
    "location" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_translations" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "languageCode" "LanguageCode" NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "organizer" TEXT,
    "venueDetails" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_albums" (
    "id" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "coverImage" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_album_translations" (
    "id" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "languageCode" "LanguageCode" NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_album_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_items" (
    "id" TEXT NOT NULL,
    "albumId" TEXT,
    "uploadedById" TEXT,
    "publicId" TEXT NOT NULL,
    "secureUrl" TEXT NOT NULL,
    "resourceType" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "format" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "bytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_item_translations" (
    "id" TEXT NOT NULL,
    "mediaItemId" TEXT NOT NULL,
    "languageCode" "LanguageCode" NOT NULL,
    "title" TEXT,
    "caption" TEXT,
    "altText" TEXT,
    "credits" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_item_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_reviews" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "fromStatus" "ContentStatus" NOT NULL,
    "toStatus" "ContentStatus" NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "news_categories_slug_key" ON "news_categories"("slug");

-- CreateIndex
CREATE INDEX "news_articles_status_publishedAt_idx" ON "news_articles"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "news_articles_isPinned_idx" ON "news_articles"("isPinned");

-- CreateIndex
CREATE INDEX "news_articles_categoryId_idx" ON "news_articles"("categoryId");

-- CreateIndex
CREATE INDEX "news_translations_slug_idx" ON "news_translations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "news_translations_newsArticleId_languageCode_key" ON "news_translations"("newsArticleId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "news_translations_languageCode_slug_key" ON "news_translations"("languageCode", "slug");

-- CreateIndex
CREATE INDEX "village_places_type_status_idx" ON "village_places"("type", "status");

-- CreateIndex
CREATE INDEX "village_places_isFeatured_idx" ON "village_places"("isFeatured");

-- CreateIndex
CREATE INDEX "village_place_translations_slug_idx" ON "village_place_translations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "village_place_translations_villagePlaceId_languageCode_key" ON "village_place_translations"("villagePlaceId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "village_place_translations_languageCode_slug_key" ON "village_place_translations"("languageCode", "slug");

-- CreateIndex
CREATE INDEX "village_info_category_status_idx" ON "village_info"("category", "status");

-- CreateIndex
CREATE INDEX "village_info_sortOrder_idx" ON "village_info"("sortOrder");

-- CreateIndex
CREATE INDEX "village_info_translations_slug_idx" ON "village_info_translations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "village_info_translations_villageInfoId_languageCode_key" ON "village_info_translations"("villageInfoId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "village_info_translations_languageCode_slug_key" ON "village_info_translations"("languageCode", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "business_categories_slug_key" ON "business_categories"("slug");

-- CreateIndex
CREATE INDEX "businesses_categoryId_status_idx" ON "businesses"("categoryId", "status");

-- CreateIndex
CREATE INDEX "businesses_isVerified_idx" ON "businesses"("isVerified");

-- CreateIndex
CREATE INDEX "business_translations_slug_idx" ON "business_translations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "business_translations_businessId_languageCode_key" ON "business_translations"("businessId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "business_translations_languageCode_slug_key" ON "business_translations"("languageCode", "slug");

-- CreateIndex
CREATE INDEX "events_startDate_status_idx" ON "events"("startDate", "status");

-- CreateIndex
CREATE INDEX "events_isFeatured_idx" ON "events"("isFeatured");

-- CreateIndex
CREATE INDEX "event_translations_slug_idx" ON "event_translations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "event_translations_eventId_languageCode_key" ON "event_translations"("eventId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "event_translations_languageCode_slug_key" ON "event_translations"("languageCode", "slug");

-- CreateIndex
CREATE INDEX "media_albums_status_idx" ON "media_albums"("status");

-- CreateIndex
CREATE INDEX "media_albums_isFeatured_idx" ON "media_albums"("isFeatured");

-- CreateIndex
CREATE INDEX "media_album_translations_slug_idx" ON "media_album_translations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "media_album_translations_albumId_languageCode_key" ON "media_album_translations"("albumId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "media_album_translations_languageCode_slug_key" ON "media_album_translations"("languageCode", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "media_items_publicId_key" ON "media_items"("publicId");

-- CreateIndex
CREATE INDEX "media_items_albumId_idx" ON "media_items"("albumId");

-- CreateIndex
CREATE INDEX "media_items_resourceType_idx" ON "media_items"("resourceType");

-- CreateIndex
CREATE INDEX "media_items_uploadedById_idx" ON "media_items"("uploadedById");

-- CreateIndex
CREATE UNIQUE INDEX "media_item_translations_mediaItemId_languageCode_key" ON "media_item_translations"("mediaItemId", "languageCode");

-- CreateIndex
CREATE INDEX "content_reviews_entityType_entityId_idx" ON "content_reviews"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "content_reviews_reviewerId_idx" ON "content_reviews"("reviewerId");

-- CreateIndex
CREATE INDEX "activity_logs_userId_idx" ON "activity_logs"("userId");

-- CreateIndex
CREATE INDEX "activity_logs_action_createdAt_idx" ON "activity_logs"("action", "createdAt");

-- CreateIndex
CREATE INDEX "activity_logs_entityType_entityId_idx" ON "activity_logs"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "news_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_translations" ADD CONSTRAINT "news_translations_newsArticleId_fkey" FOREIGN KEY ("newsArticleId") REFERENCES "news_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "village_place_translations" ADD CONSTRAINT "village_place_translations_villagePlaceId_fkey" FOREIGN KEY ("villagePlaceId") REFERENCES "village_places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "village_info_translations" ADD CONSTRAINT "village_info_translations_villageInfoId_fkey" FOREIGN KEY ("villageInfoId") REFERENCES "village_info"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "business_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_translations" ADD CONSTRAINT "business_translations_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_translations" ADD CONSTRAINT "event_translations_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_album_translations" ADD CONSTRAINT "media_album_translations_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "media_albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_items" ADD CONSTRAINT "media_items_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "media_albums"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_items" ADD CONSTRAINT "media_items_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_item_translations" ADD CONSTRAINT "media_item_translations_mediaItemId_fkey" FOREIGN KEY ("mediaItemId") REFERENCES "media_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_reviews" ADD CONSTRAINT "content_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" TEXT,
    "ipAddress" TEXT,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_tokenHash_idx" ON "refresh_tokens"("tokenHash");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
