import { Link, useLocation } from 'react-router-dom';
import { MdDashboard, MdShoppingBag, MdReceipt, MdCategory } from 'react-icons/md';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: MdDashboard },
    { path: '/admin/products', label: 'Manage Products', icon: MdShoppingBag },
    { path: '/admin/categories', label: 'Manage Categories', icon: MdCategory },
    { path: '/admin/orders', label: 'Manage Orders', icon: MdReceipt },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="bg-gray-900 text-white w-full md:w-64 md:min-h-screen p-3 sm:p-4 flex-shrink-0">
      <div className="mb-4 md:mb-8">
        <h2 className="text-lg sm:text-2xl font-bold text-center py-2 md:py-4">Admin Panel</h2>
      </div>

      <nav>
        <ul className="flex md:flex-col gap-1 sm:gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path} className="flex-shrink-0">
                <Link
                  to={item.path}
                  className={`
                    flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors whitespace-nowrap text-sm sm:text-base
                    ${
                      isActive(item.path)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }
                  `}
                >
                  <Icon className="text-lg sm:text-xl" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
