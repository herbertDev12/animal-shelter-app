import React from 'react';

export default function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
      <div className="m-10 p-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-2xl text-center">
        <h1 className="text-4xl font-extrabold drop-shadow">
          React + Tailwind v4 is Alive! 🚀
        </h1>
        <p className="text-purple-100 mt-2 font-medium">
          If you see this gorgeous gradient box, everything is working perfectly.
        </p>
      </div>
    </div>
  );
}