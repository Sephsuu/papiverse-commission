import React from 'react';

interface FieldSkeletonProps {
  text?: string;   
  width?: string;  
}

const FieldSkeleton: React.FC<FieldSkeletonProps> = ({ text, width = 'w-32' }) => {
  return (
    <span
      className={`inline-block h-5 rounded ${
        text ? '' : `bg-gray-300 ${width}`
      }`}
    >
      {text || '\u00A0'}
    </span>
  );
};

export default FieldSkeleton;
