import Link from "next/link";
import { Home, Search, PlusSquare, Heart, User } from "lucide-react";

export function MobileNavigation() {
  return (
    <nav className="flex justify-around py-2 bg-background border-t text-muted-foreground">
      <MobileNavItem href="/home" icon={<Home className="w-6 h-6" />} />
      <MobileNavItem href="/search" icon={<Search className="w-6 h-6" />} />
      <MobileNavItem href="/create" icon={<PlusSquare className="w-6 h-6" />} />
      <MobileNavItem href="/activity" icon={<Heart className="w-6 h-6" />} />
      <MobileNavItem href="/profile" icon={<User className="w-6 h-6" />} />
    </nav>
  );
}

function MobileNavItem({
  href,
  icon,
}: {
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href} className="p-2 hover:text-primary transition">
      {icon}
    </Link>
  );
}
