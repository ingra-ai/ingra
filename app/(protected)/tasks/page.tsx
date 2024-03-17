import { getAuthSession } from '@app/auth/session';
import db from '@lib/db';
import { cn } from '@lib/utils';
import { TaskStatus, TaskPriority } from '@/schemas/task';
import { formatDistance } from 'date-fns';
import { Badge, BadgeProps } from '@components/ui/badge';
import { AddTaskButton } from './AddTaskButton';

const statuses: Record<any, string> = {
  [TaskStatus.enum.TODO]: 'text-gray-400 bg-gray-400/10',
  [TaskStatus.enum.IN_PROGRESS]: 'text-blue-400 bg-blue-400/10',
  [TaskStatus.enum.DONE]: 'text-green-400 bg-green-400/10',
};

const priorities: Record<any, BadgeProps['variant']> = {
  [TaskPriority.enum.LOW]: 'default',
  [TaskPriority.enum.MEDIUM]: 'accent',
  [TaskPriority.enum.HIGH]: 'destructive',
};

export default async function Page() {
  const authSession = await getAuthSession();
  const tasks = authSession
    ? await db.task.findMany({
        where: {
          userId: authSession.user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    : [];

  return (
    <div className="border-t border-white/10 pt-11">
      <div className="flex items-center px-2">
        <div className="flex-grow">
          <h1 className="text-base font-semibold leading-10">Tasks List</h1>
        </div>
        <div className="block">
          <AddTaskButton />
        </div>
      </div>
      <table className="mt-6 w-full whitespace-nowrap text-left table-fixed">
        <colgroup>
          <col className="w-4/12 md:w-2/12 xl:w-2/12" />
          <col className="w-5/12 md:w-7/12 xl:w-6/12" />
          <col className="hidden md:w-1/12 xl:w-1/12" />
          <col className="w-3/12 md:w-2/12 xl:w-1/12" />
          <col className="hidden xl:w-2/12" />
        </colgroup>
        <thead className="border-b border-white/10 text-sm leading-6">
          <tr>
            <th scope="col" className="p-3 font-semibold">
              Title
            </th>
            <th scope="col" className="p-3 font-semibold">
              Description
            </th>
            <th scope="col" className="p-3 pr-5 font-semibold text-right hidden md:table-cell">
              Priority
            </th>
            <th scope="col" className="p-3 font-semibold text-right">
              Status
            </th>
            <th scope="col" className="p-3 font-semibold text-right hidden xl:table-cell">
              Created at
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {tasks.map((item) => (
            <tr key={item.id}>
              <td className="p-3">
                <div className="flex items-center gap-x-4">
                  <div className="text-sm font-medium leading-6 truncate">{item.title}</div>
                </div>
              </td>
              <td className="p-3">
                <div className="font-mono text-sm leading-6 text-gray-400 w-100 truncate">{item.description || '-'}</div>
              </td>
              <td className="p-3 text-right hidden md:table-cell">
                <div className="flex items-center justify-end gap-x-2">
                  <Badge variant={priorities[item.priority]}>{item.priority}</Badge>
                </div>
              </td>
              <td className="p-3 text-xs text-right">
                <div className="flex items-center justify-end gap-x-2">
                  <div className={cn(statuses[item.status], 'flex-none rounded-full p-1')}>
                    <div className="h-1.5 w-1.5 rounded-full bg-current" />
                  </div>
                  <div className="block">{item.status}</div>
                </div>
              </td>
              <td className="p-3 text-right text-sm leading-6 text-gray-400 hidden xl:table-cell">
                <time dateTime={item.createdAt.toISOString()}>{formatDistance(item.createdAt, Date.now(), { addSuffix: true })}</time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
