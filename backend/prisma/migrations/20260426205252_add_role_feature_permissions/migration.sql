-- CreateTable
CREATE TABLE "role_feature_permissions" (
    "id" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "can_read" BOOLEAN NOT NULL DEFAULT false,
    "can_edit" BOOLEAN NOT NULL DEFAULT false,
    "can_delete" BOOLEAN NOT NULL DEFAULT false,
    "can_search" BOOLEAN NOT NULL DEFAULT false,
    "role_permission_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_feature_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "role_feature_permissions_feature_idx" ON "role_feature_permissions"("feature");

-- CreateIndex
CREATE UNIQUE INDEX "role_feature_permissions_role_permission_id_feature_key" ON "role_feature_permissions"("role_permission_id", "feature");

-- AddForeignKey
ALTER TABLE "role_feature_permissions" ADD CONSTRAINT "role_feature_permissions_role_permission_id_fkey" FOREIGN KEY ("role_permission_id") REFERENCES "role_permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
