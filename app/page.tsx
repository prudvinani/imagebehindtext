"use client";

import { ImageEditor } from "./components/image-editor";





export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Text Behind Image Editor</h1>
      <ImageEditor/>
      </div>
    </div>
  );
}