import React from 'react';

const PageContainer = ({ children }) => {
  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-8 pb-20">
        {children}
      </div>
    </div>
  );
};

export default PageContainer;