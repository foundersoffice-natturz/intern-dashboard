import { ReactNode } from "react";
import { signOut, useSession } from "next-auth/react";

export default function Layout({ children }: { children: ReactNode }) {
  const { data } = useSession();
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="font-semibold">Intern Reporting Dashboard</div>
          <div className="text-sm text-slate-600 flex gap-3 items-center">
            <span>{data?.user?.email}</span>
            <button
              className="rounded-full border px-3 py-1 hover:bg-slate-50"
              onClick={() => signOut()}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
