import { notFound } from "next/navigation";

const SUPPORTED_PATHS = [
  'new',
  'edit'
];

type FunctionLayoutProps = {
  children: React.ReactNode;
  view: React.ReactNode;
  edit: React.ReactNode;
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
    params
  } = props;
  const { paths = [] } = params;

  if ( paths.length && SUPPORTED_PATHS.indexOf(paths?.[0]) === -1 ) {
    return notFound();
  }

  const [operation, recordId] = paths;
  const isNew = operation === 'new';
  const isEdit = operation === 'edit';
  
  return (
    <div className="flex flex-col md:flex-row h-full" data-testid="functions-layout">
      <div className="flex-1 p-4">
        {view}
      </div>
      {
        isNew && (
          <div className="flex-1 p-4">
            {addNew}
          </div>
        )
      }
      {
        isEdit && recordId && (
          <div className="flex-1 p-4">
            {edit}
          </div>
        )
      }
    </div>
  )
}