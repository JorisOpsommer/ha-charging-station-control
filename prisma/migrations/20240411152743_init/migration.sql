-- CreateTable
CREATE TABLE "ChargingStation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "brand" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ChargingStationCredential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "chargingStationId" TEXT NOT NULL,
    "apiClientId" TEXT,
    "apiClientSecret" TEXT,
    "smappeeSerialIdMobileApp" TEXT,
    CONSTRAINT "ChargingStationCredential_chargingStationId_fkey" FOREIGN KEY ("chargingStationId") REFERENCES "ChargingStation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChargingSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    "chargingStationId" TEXT,
    CONSTRAINT "ChargingSession_chargingStationId_fkey" FOREIGN KEY ("chargingStationId") REFERENCES "ChargingStation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChargingStateChange" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chargingSessionId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChargingStateChange_chargingSessionId_fkey" FOREIGN KEY ("chargingSessionId") REFERENCES "ChargingSession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InstructionStateChange" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chargingSessionId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InstructionStateChange_chargingSessionId_fkey" FOREIGN KEY ("chargingSessionId") REFERENCES "ChargingSession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "stringValue" TEXT,
    "numberValue" REAL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "HomeAssistantData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inverterOutputInWatt" REAL NOT NULL,
    "powerConsumptionInWatt" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ChargingStationCredential_chargingStationId_key" ON "ChargingStationCredential"("chargingStationId");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");
