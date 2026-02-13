-- CreateTable
CREATE TABLE "InfiniteModeUnlock" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "worldId" INTEGER NOT NULL,
    "mapId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InfiniteModeUnlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InfiniteModeUnlock_userId_worldId_mapId_key" ON "InfiniteModeUnlock"("userId", "worldId", "mapId");

-- CreateIndex
CREATE INDEX "InfiniteModeUnlock_userId_idx" ON "InfiniteModeUnlock"("userId");

-- AddForeignKey
ALTER TABLE "InfiniteModeUnlock" ADD CONSTRAINT "InfiniteModeUnlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
