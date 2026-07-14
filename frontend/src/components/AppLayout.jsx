import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function AppLayout({ children, title, eyebrow = "OPERATIONS CENTER" }) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Navbar title={title} eyebrow={eyebrow} />
        <main className="hallmark-page-enter p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
