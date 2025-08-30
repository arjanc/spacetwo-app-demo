// "use client";

// import { Suspense } from "react";
// import { useSearchParams } from "next/navigation";
// import LoginForm from "../../components/LoginForm";

// function LoginContent() {
//   const searchParams = useSearchParams();
//   const error = searchParams.get("error");

//   return <LoginForm error={error} />;
// }

// export default function LoginPage() {
//   return (
//     <Suspense
//       fallback={
//         <div className="min-h-screen bg-[#111111] flex items-center justify-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
//         </div>
//       }
//     >
//       <LoginContent />
//     </Suspense>
//   );
// }

import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
