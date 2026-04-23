import { Outlet } from 'react-router-dom';
import { Navbar } from '../shared/components/organisms/Navbar';

export const Layout = () => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <main>
      <Outlet />
    </main>
  </div>
);

