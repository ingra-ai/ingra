'use server';
import db from "@lib/db";
import type { LogObject } from "consola/core";

export async function pushToAuditTable(logObj: LogObject) {
  const { date, args, type, level, tag } = logObj;

  // Truncate the tag field if it exceeds the maximum length
  const truncatedTag = tag && tag.length > 255 ? tag.substring(0, 255) : tag;

  try {
    await db.auditLog.create({
      data: {
        date: new Date(date),
        args,
        type,
        level,
        tag: truncatedTag,
      },
    });
  } catch (error) {
    console.error('Error inserting audit log:', error);
  }
}
