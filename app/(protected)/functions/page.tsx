import { getAuthSession } from '@app/auth/session';
import { AddFunctionButton } from './AddFunctionButton';


export default async function Page() {
  const authSession = await getAuthSession();

  return (
    <div className="" data-testid="task-page">
      <div className="flex items-center px-2">
        <div className="flex-grow">
          <h1 className="text-base font-semibold leading-10">Functions</h1>
        </div>
        <div className="block">
          <AddFunctionButton />
        </div>
      </div>
      <div>
        Functions Body
      </div>
    </div>
  );
}
