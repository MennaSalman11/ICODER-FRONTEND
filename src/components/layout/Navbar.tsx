"use client";

import { Book, Menu, Sunset, Trees, User, Zap } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { PiSignOut } from "react-icons/pi";
interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

interface Navbar1Props {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  menu?: MenuItem[];
  auth?: {
    login: {
      title: string;
      url: string;
    };
    signup: {
      title: string;
      url: string;
    };
  };
}

const Navbar = ({

}: Navbar1Props) => {
  const {data:session , status} = useSession();
console.log("Current Status:", status);
console.log("Current Session:", session);

  
  return (
    <section className=" absolute top-0 left-0 w-full z-50 bg-transparent">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Desktop Menu */}
        <nav className="hidden items-center justify-between lg:flex">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}


            <div className="flex items-center">
              <Link href="/" className="text-3xl text-orange-400 font-bold tracking-tighter text-foreground">
              ICoder
            </Link>
            </div>
          </div>
       
          <div className="flex items-center gap-4">
        {status === "loading" ? (
  <span className="text-sm text-muted-foreground animate-pulse">
    Loading...
  </span>
) : status === "unauthenticated" ? (
  <div className="flex items-start">
    <Button asChild variant="ghost" className="text-2xl m-2 text-white hover:bg-white/10 hover:text-orange-300 transition-all duration-300">
      <Link href="/login">login</Link>
    </Button>
    <Button asChild className="m-2 text-2xl text-orange-300 hover:bg-gray-200 px-5 font-semibold">
      <Link href="/register">sign Up</Link>
    </Button>
  </div>
) : (
  <div className="flex items-center gap-4">
   {/* <span className="text-sm font-medium text-black">
    Welcome, {session?.user?.handle || session?.user?.name || "User"}
  </span> */}

{status === "authenticated" ? (
          <Link 
            href={`/profile/${session?.user?.handle}`}
            className="flex items-center gap-2 bg-orange-400 px-4 py-2 rounded hover:bg-orange-500 transition"
          >
            <User size={18} />
           {session?.user?.handle || session?.user?.name || "User"}
          </Link>
        ) : (
          <Link href="/login">Login</Link>
        )}

    <Link href="/problems" className="text-black hover:text-gray-300 text-sm font-medium">
      Problems
    </Link>
    <Button
      size="sm"
      variant="destructive"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Logout
      <PiSignOut className=" size-4 text-white" />
    </Button>
  </div>
)}

          </div>
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  {/* <SheetTitle>
                  </SheetTitle> */}
                </SheetHeader>
                <div className="flex flex-col gap-6 p-4">
                    <Link href="/" className="text-2xl font-bold tracking-tighter text-foreground">
              ICoder
            </Link>
              

                  <div className="flex flex-col gap-3">
                    {status==='loading'? <>
            <span>Loading....</span>
            </> :
            (
         status==='unauthenticated'?
         <>
           <Button asChild variant="outline" size="sm">
              <Link href='/login'>login</Link>
            </Button>
            <Button asChild size="sm">
              <Link href='/register'>sign up</Link>
            </Button>
         </>:
         <>
         <Button asChild variant='outline'>
          <Link href='#'>Problems</Link>
         </Button>
          <Button
  size="sm"
  variant="destructive"
  onClick={() => signOut({ callbackUrl: "/login" })} 
>
  sign out
</Button>
         </>
            )
            }
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  );
};

const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground">
          {item.items.map((subItem) => (
            <NavigationMenuLink asChild key={subItem.title} className="w-80">
              <SubMenuLink item={subItem} />
            </NavigationMenuLink>
          ))}
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink
        href={item.url}
        className="bg-background hover:bg-muted hover:text-accent-foreground group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
      >
        {item.title}
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <SubMenuLink key={subItem.title} item={subItem} />
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <a key={item.title} href={item.url} className="text-md font-semibold">
      {item.title}
    </a>
  );
};

const SubMenuLink = ({ item }: { item: MenuItem }) => {
  return (
    <a
      className="hover:bg-muted hover:text-accent-foreground flex min-w-80 select-none flex-row gap-4 rounded-md p-3 leading-none no-underline outline-none transition-colors"
      href={item.url}
    >
      <div className="text-foreground">{item.icon}</div>
      <div>
        <div className="text-sm font-semibold">{item.title}</div>
        {item.description && (
          <p className="text-muted-foreground text-sm leading-snug">
            {item.description}
          </p>
        )}
      </div>
    </a>
  );
};

export { Navbar };
