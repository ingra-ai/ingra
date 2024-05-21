type FunctionLayoutProps = {
  children: React.ReactNode;
};

export default function Layout(props: FunctionLayoutProps) {
  const {
    children
  } = props;

  return (
    <div className="block px-4 mb-20" data-testid='functions-layout'>
      { children }
    </div>
  );
}