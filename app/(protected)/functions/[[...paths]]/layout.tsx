import { notFound } from "next/navigation";

const SUPPORTED_PATHS = [
  'new',
  'edit',
  'run'
];

type FunctionLayoutProps = {
  children: React.ReactNode;
  view: React.ReactNode;
  edit: React.ReactNode;
  run: React.ReactNode;
  addNew: React.ReactNode;
  params: {
    paths: string[];
  };
};

export default function Layout(props: FunctionLayoutProps) {
  const {
    children,
    view,
    edit,
    addNew,
    run,
    params
  } = props;
  const { paths = [] } = params;

  if (paths.length && SUPPORTED_PATHS.indexOf(paths?.[0]) === -1) {
    return notFound();
  }

  const [operation, recordId] = paths;
  const isNew = operation === 'new';
  const isEdit = operation === 'edit' && recordId;
  const isRun = operation === 'run' && recordId;

  return (
    <div className="flex flex-col-reverse lg:flex-row h-full" data-testid="functions-layout">
      {
        isRun ? (
          <>
            <div className="flex-1 w-full lg:w-6/12 p-4">
              {view}
            </div>
            <div className="flex-1 w-full lg:w-6/12 p-4">
              {run}
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 w-full lg:w-5/12 p-4">
              {view}
            </div>
            {
              (isNew || isEdit) && (
                <div className="flex-1 w-full lg:w-7/12 p-4">
                  {isNew ? addNew : edit}
                </div>
              )
            }
          </>
        )
      }
    </div>
  );
}