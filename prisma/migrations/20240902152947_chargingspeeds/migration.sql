-- CreateTable
CREATE TABLE "ChargingSpeed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unit" TEXT NOT NULL,
    "stringValue" TEXT,
    "numberValue" REAL
);
