import React from 'react';

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center">
        <div className="border-4 border-slate-200 border-t-blue-800 rounded-full w-12 h-12 animate-spin"></div>
        <p className="mt-4 text-slate-600">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;