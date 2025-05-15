import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-gray-100"></div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isLoggedIn={!!token} />
      <main className="flex-grow container mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}