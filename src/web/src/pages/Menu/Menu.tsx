import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Categories } from './Categories';
import { Items } from './Items';
import { HiOutlineViewGrid, HiOutlineCube } from 'react-icons/hi';

export const Menu: React.FC = () => {
  const location = useLocation();
  const isCategories = location.pathname === '/menu' || location.pathname === '/menu/categories';
  const isItems = location.pathname === '/menu/items';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="heading-lg text-text-primary">Menu</h1>
      </div>

      {/* Sub-navigation */}
      <div className="flex gap-2 mb-6 border-b border-border">
        <Link
          to="/menu/categories"
          className={`px-4 py-2 body-sm font-medium border-b-2 transition-colors ${
            isCategories
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <HiOutlineViewGrid className="inline w-4 h-4 mr-2" />
          Categories
        </Link>
        <Link
          to="/menu/items"
          className={`px-4 py-2 body-sm font-medium border-b-2 transition-colors ${
            isItems
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <HiOutlineCube className="inline w-4 h-4 mr-2" />
          Items
        </Link>
      </div>

      {/* Routes */}
      <Routes>
        <Route index element={<Navigate to="/menu/categories" replace />} />
        <Route path="categories" element={<Categories />} />
        <Route path="items" element={<Items />} />
      </Routes>
    </div>
  );
};
