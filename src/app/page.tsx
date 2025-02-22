import Link from "next/link";

import { LatestPost } from "~/app/_components/post";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import Navbar from "~/components/navbar";
import { MapPin } from "lucide-react";

export default async function Home() {
  return (
    <HydrateClient>
      <main>
        <Navbar />
        <div className="flex min-h-screen flex-col"></div>
      </main>
    </HydrateClient>
  );
}
