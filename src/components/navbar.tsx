"use client"

import Link from "next/link"
import {FlameIcon, Settings} from "lucide-react"
import { signIn } from "~/server/auth"
import { Button } from "~/components/ui/button"

export default function Navbar() {
    type Navlink = {
        title: string,
        href: string,
    }
    const navLinks: Navlink[] = [
        {
            title: "Home",
            href: "/"
        },
        {
            title: "About",
            href: "/about",
        },
        {
            title: "Firesides",
            href: "/firesides"
        }
    ]
    return (
      <div className="mx-auto grid w-full max-w-7xl grid-cols-3 p-4">
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
                className="font-medium transition duration-200 ease-in hover:text-orange-500"
              >
                {navLink.title}
              </Link>
            ))}
          </div>
        </div>
        <div className="justify-end"></div>
      </div>
    );
}