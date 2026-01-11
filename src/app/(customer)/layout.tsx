// // app/(customer)/layout.tsx
// "use client";

// import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';

// export default function CustomerLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   const router = useRouter();

//   useEffect(() => {
//     // Check if user is authenticated
//     const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
//     if (!token) {
//       router.push('/');
//     }
//   }, [router]);

//   const handleLogout = () => {
//     // Clear all auth data
//     localStorage.removeItem('auth_token');
//     sessionStorage.removeItem('auth_token');
//     localStorage.removeItem('user_data');
//     sessionStorage.removeItem('user_data');
    
//     // Redirect to login
//     router.push('/');
//   };

//   return (
//     <>
//       {/* Logout button - fixed position */}
//       <button
//         onClick={handleLogout}
//         className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600 transition-colors shadow-md"
//       >
//         Logout
//       </button>
//       {children}
//     </>
//   );
// }

"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (!token) {
      router.push('/');
    }
  }, [router]);

  return <>{children}</>;
}