import { ReactNode } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import logo from "../logo.png";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userName = user?.user_metadata?.full_name || "User";
  const userEmail = user?.email || "";
  const userImage = user?.user_metadata?.avatar_url;

  console.log(user);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 py-1 flex items-center justify-between">
          <Link href="/dashboard" className="text-lg font-semibold">
            <Image src={logo} alt="Logo" width={130} height={30} />
          </Link>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <Avatar className="h-8 w-8">
                  {userImage ? (
                    <AvatarImage src={userImage} alt={userName} />
                  ) : (
                    <AvatarFallback>{userName[0].toUpperCase()}</AvatarFallback>
                  )}
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userEmail}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/sign-out">Sign out</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
