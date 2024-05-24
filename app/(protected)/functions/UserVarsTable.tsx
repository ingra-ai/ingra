'use client';

type UserVarsTableProps = {
  userVarsRecord: Record<string, any>;
};

export const UserVarsTable: React.FC<UserVarsTableProps> = (props) => {
  const { userVarsRecord = {} } = props;
  const userVarsEntries = Object.entries(userVarsRecord);

  return (
    <div className="block max-w-[1600px]" data-testid='user-vars-table'>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6">User Variables ({userVarsEntries.length})</h1>
          <p className="mt-2 text-sm">
            Your variables will be passed as part of <code className="italic">global</code> in your functions and flows
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        </div>
      </div>
      <table className="mt-4 w-full whitespace-nowrap text-left table-fixed">
        <colgroup>
          <col className="w-4/12" />
          <col className="w-8/12" />
        </colgroup>
        <thead className="border-b border-white/10 text-sm leading-6">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0">
              Key
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold w-full">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {userVarsEntries.map(([key, value]) => {
            return (
              <tr key={key}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 truncate" title={key}>
                  {key}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm truncate" title={value}>{value}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
