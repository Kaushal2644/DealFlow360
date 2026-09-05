import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}