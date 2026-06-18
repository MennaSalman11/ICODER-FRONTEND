"use client";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Settings, Shield, Link as LinkIcon, Code } from "lucide-react"; // مكتبة الأيقونات

export default function UpdateProfileLayout({ children }: { children: React.ReactNode }) {
  const { handle } = useParams();
  const pathname = usePathname();


  const menuItems = [
    { name: "General", href: `/profile/${handle}/update-profile`, icon: <Settings size={20} /> },
    { name: "Security", href: `/profile/${handle}/update-profile/security`, icon: <Shield size={20} /> },
    { name: "Code Templates", href: `/profile/${handle}/update-profile/code-templates`, icon: <Code size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-28 px-4 md:px-10">
      <div className="max-w-6xl mx-auto md:row gap-10 flex flex-row items-start">
        
        {/* الـ Sidebar الأيسر */}
        <aside className="w-full md:w-1/4 bg-white rounded-2xl p-6 shadow-sm h-fit">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-950">Settings</h2>
            <p className="text-sm text-gray-400">Manage your platform account</p>
          </div>
          
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isActive 
                    ? "bg-orange-50 text-orange-600 font-medium" 
                    : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}