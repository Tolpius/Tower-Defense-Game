-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "worldId" INTEGER NOT NULL,
    "mapId" INTEGER NOT NULL,
    "isInfinite" BOOLEAN NOT NULL,
    "wave" INTEGER NOT NULL,
    "kills" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Score_score_createdAt_idx" ON "Score"("score" DESC, "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Score_worldId_mapId_isInfinite_idx" ON "Score"("worldId", "mapId", "isInfinite");

-- CreateIndex
CREATE INDEX "Score_userId_idx" ON "Score"("userId");

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
