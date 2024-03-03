/**
 * @swagger
 * components:
 *   schemas:
 *    Task:
 *      type: object
 *      properties:
 *        id:
 *          type: integer
 *          format: int32
 *          description: Unique identifier for the task, automatically incremented.
 *        title:
 *          type: string
 *          description: Title of the task.
 *        description:
 *          type: string
 *          nullable: true
 *          description: Detailed description of the task, nullable.
 *        status:
 *          $ref: '#/components/schemas/TaskStatus'
 *          description: Current status of the task.
 *        priority:
 *          $ref: '#/components/schemas/TaskPriority'
 *          description: Priority level of the task.
 *        userId:
 *          type: string
 *          format: uuid
 *          description: Identifier for the user associated with the task. Optional.
 *      required:
 *        - id
 *        - title
 *        - status
 *        - priority
 *
 *    TaskStatus:
 *      type: string
 *      enum:
 *        - TODO
 *        - IN_PROGRESS
 *        - DONE
 *      description: Enumeration for possible statuses of a task.
 *
 *    TaskPriority:
 *      type: string
 *      enum:
 *        - LOW
 *        - MEDIUM
 *        - HIGH
 *      description: Enumeration for possible priority levels of a task.
 *
 *    ApiSuccess:
 *      type: object
 *      required:
 *        - message
 *      properties:
 *        message:
 *          type: string
 *          description: A brief description of the successful operation.
 *        data:
 *          oneOf:
 *            - type: object
 *              additionalProperties: true
 *              description: An arbitrary object returned by the operation.
 *            - type: array
 *              items:
 *                type: object
 *                additionalProperties: true
 *              description: An array of arbitrary objects returned by the operation.
 * 
 *    ApiError:
 *      type: object
 *      required:
 *        - error
 *      properties:
 *        code:
 *          type: integer
 *          format: int32
 *          nullable: true
 *          description: An optional error code representing the error type.
 *        error:
 *          type: string
 *          description: A detailed message describing the error.
 */
