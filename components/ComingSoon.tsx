import { type CSSProperties } from "react";

export const ComingSoonComp: React.FC = () => {
  const cssStyle: CSSProperties = {
    backgroundImage: 'url(/static/coming-soon-bg.jpg)'
  };

  return (
    <div className="relative h-full w-full flex items-center justify-center bg-cover bg-center text-center" style={ cssStyle }>
      <div className="absolute top-0 right-0 bottom-0 left-0 bg-gray-900 opacity-75"></div>

      <div className="z-50 flex flex-col justify-center items-center text-white w-full h-full">
        <span className="text-bold text-3xl mb-5">Bakabit Portal</span>
        <h1 className="text-5xl mb-10">We are <b>Almost</b> there!</h1>
        <p>Stay tuned for something amazing!!!</p>
      </div>
    </div>
  );
};