// // components/LogoutButton.tsx
// "use client";

// import { useRouter } from "next/navigation";

// export default function LogoutButton() {
//   const router = useRouter();

//   const handleLogout = () => {
//     // Clear all auth data
//     localStorage.removeItem("auth_token");
//     localStorage.removeItem("user_data");
//     sessionStorage.removeItem("auth_token");
//     sessionStorage.removeItem("user_data");
    
//     // Redirect to login
//     router.push("/");
//   };

//   return (
//     <button
//       onClick={handleLogout}
//       className="fixed top-4 right-4 z-50 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors shadow-md"
//     >
//       Logout
//     </button>
//   );
// }

"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("user_data");
    
    // Clear any other stored data
    localStorage.clear();
    sessionStorage.clear();
    
    // Redirect to login
    router.push("/");
    router.refresh(); // Refresh to update UI state
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      title="Logout"
      aria-label="Logout"
    >
      <LogOut size={16} />
      <span className="hidden sm:inline">Logout</span>
    </button>
  );
}