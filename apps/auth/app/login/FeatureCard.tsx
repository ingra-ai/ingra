import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="mb-4">{icon}</div>
      <h2 className="text-lg font-semibold mb-2 text-center leading-6">{title}</h2>
      <p className="text-sm text-center leading-5">{description}</p>
    </div>
  );
};
