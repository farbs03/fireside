"use client";

import dynamic from "next/dynamic";
import Navbar from "~/components/navbar";
import Dashboard from "./components/Dashboard";

const LazyMap = dynamic(() => import("./components/Map"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex h-full w-full flex-grow" mx-auto>
        <div className="w-full flex-grow">
          <LazyMap />
        </div>
        <div className="w-full max-w-[300px] flex-grow">
          <Dashboard />
        </div>
      </div>
    </main>
  );
}
