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
        <div className="grid grid-cols-3 max-w-7xl mx-auto w-full p-4">
            <div className="flex items-center gap-2">
                <FlameIcon className="w-6 h-6" />
                <Link href="/" className="font-bold text-2xl">Fireside</Link>
            </div>
            <div>
                <div className="flex mx-auto w-fit items-center gap-4 bg-white rounded-full drop-shadow-lg py-2 px-4 justify-center">
                    {navLinks.map((navLink) => (
                        <Link key={navLink.href} href={navLink.href} className="hover:text-orange-500 transition duration-200 ease-in font-medium">{navLink.title}</Link>
                    ))}
                </div>
            </div>
            <div className="justify-end">
                <Button onClick={() => void signIn()}>Sign In</Button>
            </div>
            
        </div>
    )
}