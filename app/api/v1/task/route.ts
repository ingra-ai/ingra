import { getUserByPhraseCode } from "@/data/user";
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
 *         required: true
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
 *         required: false
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
 *                 $ref: '#/components/schemas/Task'
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
 *                 $ref: '#/components/schemas/Task'
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

type TaskRequestPayload = Pick<Task , "title" | "description" | "status" | "priority"> & {
  action: string;
  phraseCode: string;
};


/**
 * Dynamic route handlers for /api/v1/task
 * @see https://nextjs.org/docs/app/building-your-application/routing/route-handlers#dynamic-route-segments
 */
export async function GET(req: NextRequest, { params }: { params: TaskRequestPayload } ) {
  const { phraseCode, ...taskPayload } = params || {};

  const userWithProfile = await getUserByPhraseCode(phraseCode);

  if ( !userWithProfile ) {
    return NextResponse.json(
      { error: "Invalid phrase code" },
      {
        status: 400
      }
    );
  }

  const findManyParams: Parameters<typeof db.task.findMany>[0] = {
    where: {
      userId: userWithProfile.id
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5
  };

  if ( taskPayload.status ) {
    findManyParams.where!.status = taskPayload.status;
  }

  if ( taskPayload.priority ) {
    findManyParams.where!.priority = taskPayload.priority;
  }

  if ( taskPayload.title ) {
    findManyParams.where!.title = { contains: taskPayload.title, mode: "insensitive" };
  }

  if ( taskPayload.description ) {
    findManyParams.where!.description = { contains: taskPayload.description, mode: "insensitive" };
  }

  const tasks = await db.task.findMany(findManyParams);

  return NextResponse.json(
    { message: "OK", data: tasks },
    {
      status: 200
    }
  );
}

export async function POST(req: NextRequest ) {
  const data = await req.json()
  const { phraseCode, ...taskPayload } = data || {};

  const userWithProfile = await getUserByPhraseCode(phraseCode);

  if ( !userWithProfile ) {
    return NextResponse.json(
      { error: "Invalid phrase code" },
      {
        status: 400
      }
    );
  }

  const task = await db.task.create({
    data: {
      ...taskPayload,
      userId: userWithProfile.id
    }
  });

  return NextResponse.json(
    { message: "OK", data: [task] },
    {
      status: 201
    }
  );
};

export async function PATCH(req: NextRequest) {
  const data = await req.json()
  const { phraseCode, ...taskPayload } = data || {};

  const userWithProfile = await getUserByPhraseCode(phraseCode);

  if ( !userWithProfile ) {
    return NextResponse.json(
      { error: "Invalid phrase code" },
      {
        status: 400
      }
    );
  }

  const task = await db.task.update({
    where: {
      id: taskPayload.taskId,
      userId: userWithProfile.id
    },
    data: {
      ...taskPayload
    }
  });

  return NextResponse.json(
    { message: "OK", data: [task] },
    {
      status: 200
    }
  );
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

