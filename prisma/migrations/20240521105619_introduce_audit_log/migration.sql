-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "args" JSONB NOT NULL,
    "type" VARCHAR(32) NOT NULL,
    "level" INTEGER NOT NULL,
    "tag" VARCHAR(32),

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
