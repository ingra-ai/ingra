/**
 * @swagger
 * components:
 *   schemas:
 *     ApiCalendarEventAttendee:
 *       type: object
 *       required:
 *         - email
 *         - displayName
 *       properties:
 *         email:
 *           type: string
 *           description: The email address of the attendee.
 *         displayName:
 *           type: string
 *           description: The display name of the attendee.
 */
export type ApiCalendarEventAttendee = {
  email: string;
  displayName: string;
};

/**
 * @swagger
 * components:
 *   schemas:
 *     ApiCalendarEvent:
 *       type: object
 *       required:
 *         - title
 *         - creator
 *         - organizer
 *         - startDateTime
 *         - endDateTime
 *         - duration
 *         - location
 *         - link
 *         - reminder
 *         - attendees
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the calendar event.
 *         creator:
 *           type: string
 *           description: The email of the person who created the event. 'me' indicates the current user.
 *         organizer:
 *           type: string
 *           description: The email of the person organizing the event. 'me' also indicates the current user.
 *         startDateTime:
 *           type: string
 *           format: date-time
 *           description: The start date and time of the event.
 *         endDateTime:
 *           type: string
 *           format: date-time
 *           description: The end date and time of the event.
 *         duration:
 *           type: string
 *           description: The duration of the event in ISO 8601 duration format.
 *         location:
 *           type: string
 *           description: The location of the event.
 *         link:
 *           type: string
 *           description: A link to additional information or to join the event, such as a video call link.
 *         reminder:
 *           type: string
 *           description: The reminder setting for the event.
 *         attendees:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ApiCalendarEventAttendee'
 *           description: A list of attendees for the event.
 */
export type ApiCalendarEvent = {
  title: string;
  creator: 'me' | string;
  organizer: 'me' | string;
  startDateTime: string;
  endDateTime: string;
  duration: string;
  location: string;
  link: string;
  reminder: string;
  attendees: ApiCalendarEventAttendee[];
};
/**
 * @swagger
 * components:
 *   schemas:
 *     ApiCalendarEventBody:
 *       type: object
 *       required:
 *         - summary
 *         - description
 *         - timeZone
 *         - events
 *       properties:
 *         summary:
 *           type: string
 *           description: A summary or title for the group of events.
 *         description:
 *           type: string
 *           description: A detailed description of the event or events.
 *         timeZone:
 *           type: string
 *           description: The time zone in which the events are scheduled.
 *         events:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ApiCalendarEvent'
 *           description: An array of calendar event objects.
 */
export type ApiCalendarEventBody = {
  summary: string;
  description: string;
  timeZone: string;
  events: ApiCalendarEvent[];
};

/**
 * @swagger
 * components:
 *   schemas:
 *     ApiCalendarEventsResponse:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           description: The email address associated with the calendar events.
 *         eventBody:
 *           type: object
 *           nullable: true
 *           $ref: '#/components/schemas/ApiCalendarEventBody'
 *           description: The body of the calendar events, including summary, description, time zone, and events array. Null if no events are found.
 */
export type ApiCalendarEventsResponse = {
  email: string;
  eventBody: ApiCalendarEventBody | null;
};
