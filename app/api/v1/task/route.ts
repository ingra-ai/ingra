import { getUserByPhraseCode } from "@/data/user";
import { ActionError, ApiError, ApiSuccess } from "@lib/api-response";
import db from "@lib/db";
import { Task } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/v1/task:
 *   get:
 *     summary: Retrieves a list of tasks based on search criteria.
 *     operationId: GetTasks
 *     description: Get list of tasks or todos with or without search criteria.
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *           default: ""
 *         description: Title of the task to search for.
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
 *         description: Status of the task to filter by. Optional. Default is TODO
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH]
 *         description: Priority of the task to filter by. Optional. Default is MEDIUM
 *       - in: query
 *         name: phraseCode
 *         schema:
 *           type: string
 *         required: true
 *         description: A unique code for additional validation or action. Optional.
 *     responses:
 *       '200':
 *         description: Successfully retrieved list of tasks
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *     tags:
 *       - Task and Todos
 * 
 *   post:
 *     summary: Create a new task
 *     operationId: CreateTask
 *     description: Create a new task or todo.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phraseCode]
 *             properties:
 *               task:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Task'
 *                   - type: object
 *                     required: [title, description]
 *                     properties: {}
 *               phraseCode:
 *                 type: string
 *                 description: A unique code to authenticate the user to perform this operation.
 *     responses:
 *       '201':
 *         description: Successfully created task
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *     tags:
 *       - Task and Todos
 * 
 *   patch:
 *     summary: Update an existing task
 *     operationId: UpdateTask
 *     description: Update an existing task or todo.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phraseCode]
 *             properties:
 *               task:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Task'
 *                   - type: object
 *                     properties: {}
 *               phraseCode:
 *                 type: string
 *                 description: A unique code to authenticate the user to perform this operation.
 *     responses:
 *       '200':
 *         description: Successfully updated task
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *     tags:
 *       - Task and Todos
 */

type TaskRequestParams = Pick<Task , "title" | "description" | "status" | "priority"> & {
  phraseCode: string;
};

/**
 * Dynamic route handlers for /api/v1/task
 * @see https://nextjs.org/docs/app/building-your-application/routing/route-handlers#dynamic-route-segments
 */
export async function GET(req: NextRequest ) {
  const { searchParams } = new URL(req.url)
  const params = Object.fromEntries( searchParams ) as TaskRequestParams;
  const { phraseCode, ...restOfPayload } = params || {};

  try {
    const userWithProfile = await getUserByPhraseCode(phraseCode);
  
    if ( !userWithProfile ) {
      throw new ActionError("error", 400, "Invalid phrase code");
    }
  
    const findManyParams: Parameters<typeof db.task.findMany>[0] = {
      where: {
        userId: userWithProfile.id
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20
    };
  
    if ( restOfPayload.status ) {
      findManyParams.where!.status = restOfPayload.status;
    }
  
    if ( restOfPayload.priority ) {
      findManyParams.where!.priority = restOfPayload.priority;
    }
  
    if ( restOfPayload.title ) {
      findManyParams.where!.title = { contains: restOfPayload.title, mode: "insensitive" };
    }
  
    if ( restOfPayload.description ) {
      findManyParams.where!.description = { contains: restOfPayload.description, mode: "insensitive" };
    }
  
    const tasks = await db.task.findMany(findManyParams),
      numberOfTasks = tasks?.length || 0;

    if ( numberOfTasks === 0 ) {
      return NextResponse.json(
        { 
          status: "OK", 
          message: "No tasks found",
          data: tasks || []
        } as ApiSuccess<Task>,
        {
          status: 200
        }
      );
    }
    else {
      return NextResponse.json(
        { 
          status: "OK", 
          message: `${ tasks.length} tasks found`,
          data: tasks || []
        } as ApiSuccess<Task>,
        {
          status: 201
        }
      );
    }
  }
  catch (err: any) {
    if ( err instanceof ActionError ) {
      return NextResponse.json( err.toJson(),
        {
          status: err.status || 500
        }
      );

    }
    else {
      return NextResponse.json(
        { 
          status: 400,
          code: "BAD_REQUEST",
          message: err?.message || "Something went wrong. Please try again." 
        } as ApiError,
        {
          status: 400
        }
      );
    }
  }
}

/**
 * Handles the POST request for creating a new task.
 * - 'create' method from Prisma Client is used to create a new task.
 * 
 * @param req - The NextRequest object representing the incoming request.
 * @returns A NextResponse object with the created task data or an error message.
 */
export async function POST(req: NextRequest ) {
  const data = await req.json()

  /**
   * The mapping of task is defined in requestBody of post schema for post:
   * This also can be checked at /api/swagger to test your API.
   * e.g. { task: { ...taskProps }, phraseCode: string }
   */
  const { phraseCode, task: restOfPayload } = data || {};

  try {
    const userWithProfile = await getUserByPhraseCode(phraseCode);
  
    if ( !userWithProfile ) {
      throw new ActionError("error", 400, "Invalid phrase code");
    }
  
    const task = await db.task.create({
      data: {
        // id: taskPayload.id, - do not send ID when creating.
        title: restOfPayload.title,
        description: restOfPayload.description,
        status: restOfPayload.status,
        priority: restOfPayload.priority,
        userId: userWithProfile.id
      }
    });

    return NextResponse.json(
      { 
        status: "OK", 
        message: 'Task created successfully.',
        data: [task] 
      } as ApiSuccess<Task>,
      {
        status: 201
      }
    );
  }
  catch (err: any) {
    if ( err instanceof ActionError ) {
      return NextResponse.json( err.toJson(),
        {
          status: err.status || 500
        }
      );

    }
    else {
      return NextResponse.json(
        { 
          status: 400,
          code: "BAD_REQUEST",
          message: err?.message || "Something went wrong. Please try again." 
        } as ApiError,
        {
          status: 400
        }
      );
    }
  }

};

/**
 * Handles the PATCH request for updating a task.
 * - 'update' method from Prisma Client is used to update an existing task.
 * 
 * @param req - The NextRequest object containing the request details.
 * @returns A NextResponse object with the updated task data or an error message.
 */
export async function PATCH(req: NextRequest) {
  const data = await req.json()

  /**
   * The mapping of task is defined in requestBody of post schema for post:
   * This also can be checked at /api/swagger to test your API.
   * e.g. { task: { ...taskProps }, phraseCode: string }
   */
  const { phraseCode, task: restOfPayload } = data || {};

  try {

    const userWithProfile = await getUserByPhraseCode(phraseCode);
    
    if ( !userWithProfile ) {
      throw new ActionError("error", 400, "Invalid phrase code");
    }
  
    const taskBefore = await db.task.findUnique({
      where: {
        id: restOfPayload.id,
        userId: userWithProfile.id
      }
    });
  
    if ( !taskBefore ) {
      throw new ActionError("error", 404, "Unable to find the current task");
    }
  
    const fieldsUpdatedMessages = [];
  
    if ( taskBefore.title !== restOfPayload.title ) {
      fieldsUpdatedMessages.push("title");
    }
  
    if ( taskBefore.description !== restOfPayload.description ) {
      fieldsUpdatedMessages.push("description");
    }
  
    if ( taskBefore.status !== restOfPayload.status ) {
      fieldsUpdatedMessages.push(`status from ${taskBefore.status} to ${restOfPayload.status}`);
    }
  
    if ( taskBefore.priority !== restOfPayload.priority ) {
      fieldsUpdatedMessages.push(`priority from ${taskBefore.priority} to ${restOfPayload.priority}`);
    }
  
    const taskAfter = await db.task.update({
      where: {
        id: taskBefore.id
      },
      data: {
        id: taskBefore.id,
        title: restOfPayload.title,
        description: restOfPayload.description,
        status: restOfPayload.status,
        priority: restOfPayload.priority,
        userId: taskBefore.userId
      }
    });
  
    return NextResponse.json(
      { 
        status: "OK", 
        message: "Task updated successfully.",
        data: {
          taskBefore,
          taskAfter,
          updatedFields: fieldsUpdatedMessages.join(', ')
        } 
      } as ApiSuccess<any>,
      {
        status: 200
      }
    );
  }
  catch (err: any) {
    if ( err instanceof ActionError ) {
      return NextResponse.json( err.toJson(),
        {
          status: err.status || 500
        }
      );

    }
    else {
      return NextResponse.json(
        { 
          status: 400,
          code: "BAD_REQUEST",
          message: err?.message || "Something went wrong. Please try again." 
        } as ApiError,
        {
          status: 400
        }
      );
    }
  }
}

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

