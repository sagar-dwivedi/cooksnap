import { Heart, Home, PlusSquare, Search, User } from "lucide-react";
import { NavItem } from "./NavItem";
import { CreateRecipeSheet } from "../CreateRecipeSheet";

export function DesktopNavigation() {
  return (
    <nav className="h-full flex flex-col px-4 py-6 bg-background">
      {/* Logo */}
      <div className="text-2xl font-bold mb-8 px-2">CookSnap</div>

      {/* Navigation Links */}
      <ul className="space-y-4">
        <NavItem href="/home" icon={<Home />} label="Home" />
        <NavItem href="/search" icon={<Search />} label="Search" />
        <CreateRecipeSheet />
        <NavItem href="/activity" icon={<Heart />} label="Activity" />
        <NavItem href="/profile" icon={<User />} label="Profile" />
      </ul>
    </nav>
  );
}
