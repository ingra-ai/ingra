import { getUserByPhraseCode } from "@/data/user";
import db from "@lib/db";
import { Task } from "@prisma/client";
import { NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/v1/getTasks:
 *   get:
 *     summary: Retrieves a list of tasks based on search criteria.
 *     description: >
 *       This API endpoint returns a list of tasks filtered by title, description, status, and priority for the authenticated user.
 *       It returns a maximum of 5 tasks ordered by their creation date in descending order. All query parameters are optional, and if not provided,
 *       they default to an empty string for string parameters or are ignored for enums. The phraseCode is used for additional authentication or action triggering.
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *           default: ""
 *         description: Title of the task to search for. Optional.
 *       - in: query
 *         name: description
 *         schema:
 *           type: string
 *           default: ""
 *         description: Description of the task to search for. Optional.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [TODO, IN_PROGRESS, DONE]
 *         description: Status of the task to filter by. Optional.
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH]
 *         description: Priority of the task to filter by. Optional.
 *       - in: query
 *         name: phraseCode
 *         schema:
 *           type: string
 *         required: false
 *         description: A unique code for additional validation or action. Optional.
 *     responses:
 *       200:
 *         description: A list of tasks matching the search criteria.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TaskResponsePayload'
 *       400:
 *         description: Bad request, when the query parameters are invalid.
 */
type TaskRequestPayload = Pick<Task , "title" | "description" | "status" | "priority"> & {
  action: string;
  phraseCode: string;
};

/**
 * @swagger
 * components:
 *   schemas:
 *     TaskResponsePayload:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: 'Complete the project documentation'
 *           maxLength: 255
 *         description:
 *           type: string
 *           nullable: true
 *           example: 'Ensure all the endpoints are properly documented.'
 *         status:
 *           type: string
 *           enum:
 *             - TODO
 *             - IN_PROGRESS
 *             - DONE
 *           example: 'TODO'
 *         priority:
 *           type: string
 *           enum:
 *             - LOW
 *             - MEDIUM
 *             - HIGH
 *           example: 'HIGH'
 *       required:
 *         - title
 *         - status
 *         - priority
 */
type TaskResponsePayload = Pick<Task , "title" | "description" | "status" | "priority">;

/**
 * Dynamic route handlers for /api/v1/task/[action]
 * @see https://nextjs.org/docs/app/building-your-application/routing/route-handlers#dynamic-route-segments
 */
export async function GET(req: NextRequest, { params }: { params: TaskRequestPayload } ) {
  const { action, phraseCode, ...taskPayload } = params || {};

  const userWithProfile = await getUserByPhraseCode(phraseCode);

  if ( !userWithProfile ) {
    return NextResponse.json(
      { error: "Invalid phrase code" },
      {
        status: 400
      }
    );
  }

  switch ( action ) {
    case "getTasks":
      // Get all tasks
      let andConditions = [];

      if ( taskPayload.status ) {
        andConditions.push({ status: taskPayload.status });
      }

      if ( taskPayload.priority ) {
        andConditions.push({ priority: taskPayload.priority });
      }

      return await db.task.findMany({
        where: {
          userId: userWithProfile.id,
          OR: [
            { title: { contains: taskPayload.title, mode: "insensitive" } },
            { description: { contains: taskPayload?.description || '', mode: "insensitive" } }
          ],
          AND: andConditions
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5
      });
    default:
      return NextResponse.json(
        { error: "Invalid action" },
        {
          status: 400
        }
      );
  }
}

/**
 * @swagger
 * /api/v1/addNewTask:
 *   post:
 *     summary: Adds a new task for the user.
 *     description: >
 *       This API endpoint allows adding a new task for the authenticated user identified by a phraseCode.
 *       The task details are specified in the request body along with the action type and the phraseCode for user identification.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phraseCode:
 *                 type: string
 *                 description: A unique code to identify the user.
 *                 required: true
 *               title:
 *                 type: string
 *                 description: Title of the task.
 *                 required: true
 *               description:
 *                 type: string
 *                 description: Detailed description of the task.
 *                 required: false
 *               status:
 *                 type: string
 *                 description: Status of the task.
 *                 enum: [TODO, IN_PROGRESS, DONE]
 *                 required: true
 *                 default: "TODO"
 *               priority:
 *                 type: string
 *                 description: Priority level of the task.
 *                 enum: [LOW, MEDIUM, HIGH]
 *                 required: true
 *                 default: "MEDIUM"
 *             required:
 *               - phraseCode
 *               - title
 *               - status
 *               - priority
 *     responses:
 *       200:
 *         description: Task added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponsePayload'
 *       400:
 *         description: Bad request, when the phraseCode is invalid or required fields are missing.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid phrase code
 */
export async function POST(req: NextRequest ) {
  const data = await req.json()
  const { action, phraseCode, ...taskPayload } = data || {};

  const userWithProfile = await getUserByPhraseCode(phraseCode);

  if ( !userWithProfile ) {
    return NextResponse.json(
      { error: "Invalid phrase code" },
      {
        status: 400
      }
    );
  }

  switch ( action ) {
    case "addNewTask":
      return await db.task.create({
        data: {
          ...taskPayload,
          userId: userWithProfile.id
        }
      });
    default:
      return NextResponse.json(
        { error: "Invalid action" },
        {
          status: 400
        }
      );
  }
};

export async function PUT(req: NextRequest) {
  return NextResponse.json(
    { error: "Method not allowed" },
    {
      status: 405
    }
  );
}

export async function DELETE(req: NextRequest) {
  return NextResponse.json(
    { error: "Method not allowed" },
    {
      status: 405
    }
  );
}

/**
 * @swagger
 * /api/v1/updateTask:
 *   patch:
 *     summary: Updates an existing task.
 *     description: >
 *       This API endpoint allows for partial updates to an existing task for the authenticated user. The task is identified by its ID,
 *       and the user can selectively update the title, description, status, and/or priority of the task. Only the fields intended to be updated
 *       need to be included in the request body along with the task ID. This allows for flexibility in updating any combination of fields without
 *       needing to provide the entire task information.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phraseCode:
 *                 type: string
 *                 description: A unique code to identify the user.
 *                 required: true
 *               taskId:
 *                 type: integer
 *                 description: The ID of the task to be updated. This is a required field to identify the task.
 *               title:
 *                 type: string
 *                 description: New title of the task. Optional.
 *               description:
 *                 type: string
 *                 description: New detailed description of the task. Optional.
 *               status:
 *                 type: string
 *                 description: New status of the task. Optional. Values can be TODO, IN_PROGRESS, or DONE.
 *               priority:
 *                 type: string
 *                 description: New priority level of the task. Optional. Values can be LOW, MEDIUM, or HIGH.
 *             required:
 *               - taskId
 *               - phraseCode
 *     responses:
 *       200:
 *         description: Task updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponsePayload'
 *       400:
 *         description: Bad request, when the task ID is invalid or no update fields are provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid task ID or missing update parameters
 */
export async function PATCH(req: NextRequest) {
  const data = await req.json()
  const { action, phraseCode, ...taskPayload } = data || {};

  const userWithProfile = await getUserByPhraseCode(phraseCode);

  if ( !userWithProfile ) {
    return NextResponse.json(
      { error: "Invalid phrase code" },
      {
        status: 400
      }
    );
  }

  switch ( action ) {
    case "updateTask":
      return await db.task.update({
        where: {
          id: taskPayload.taskId,
          userId: userWithProfile.id
        },
        data: {
          ...taskPayload
        }
      });
    default:
      return NextResponse.json(
        { error: "Invalid action" },
        {
          status: 400
        }
      );
  }
}

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json(
    { error: "Method not allowed" },
    {
      status: 405
    }
  );
}

export async function HEAD(req: NextRequest) {
  return NextResponse.json(
    { error: "Method not allowed" },
    {
      status: 405
    }
  );
}