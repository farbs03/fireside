"use client"

import Link from "next/link";
import { FlameIcon, Settings } from "lucide-react";
import { signIn, useSession, signOut } from "next-auth/react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import Image from "next/image";

export default function Navbar() {
  type Navlink = {
    title: string;
    href: string;
  };
  const navLinks: Navlink[] = [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "About",
      href: "/about",
    },
    {
      title: "Firesides",
      href: "/firesides",
    },
  ];

  const providers = [
    {
      title: "Google",
      logo: "/logos/google-logo.png",
    },
    {
      title: "Discord",
      logo: "/logos/discord-logo.png",
    },
  ];

  const { data: sessionData } = useSession();

  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-3 items-center p-4">
      <div className="flex items-center gap-2">
        <FlameIcon className="h-6 w-6" />
        <Link href="/" className="text-2xl font-bold">
          Fireside
        </Link>
      </div>
      <div>
        <div className="mx-auto flex w-fit items-center justify-center gap-4 rounded-full bg-white px-4 py-2 drop-shadow-lg">
          {navLinks.map((navLink) => (
            <Link
              key={navLink.href}
              href={navLink.href}
              className={`font-medium transition duration-200 ease-in hover:text-orange-500`}
            >
              {navLink.title}
            </Link>
          ))}
        </div>
      </div>
      <div className="justify-end">
        {sessionData ? (
          <Button
            onClick={sessionData ? () => void signOut() : () => void signIn()}
            className="ml-auto block"
          >
            {sessionData ? "Sign Out" : "Sign In"}
          </Button>
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <Button className="ml-auto block">Sign In</Button>
            </PopoverTrigger>
            <PopoverContent className="w-60">
              {providers.map((provider) => (
                <button
                  onClick={() => void signIn("google")}
                  key={provider.title}
                  className="flex w-full justify-between rounded-lg p-4 transition duration-100 ease-in hover:bg-zinc-100"
                >
                  <Image
                    alt={provider.title}
                    src={provider.logo}
                    width={20}
                    height={10}
                  />
                  <p>Sign in with {provider.title}</p>
                </button>
              ))}
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
