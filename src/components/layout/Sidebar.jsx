import { Link, useLocation } from 'react-router-dom';
import { MdDashboard, MdShoppingBag, MdReceipt, MdMessage } from 'react-icons/md';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: MdDashboard },
    { path: '/admin/products', label: 'Manage Products', icon: MdShoppingBag },
    { path: '/admin/orders', label: 'Manage Orders', icon: MdReceipt },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-center py-4">Admin Panel</h2>
      </div>

      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                    ${
                      isActive(item.path)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }
                  `}
                >
                  <Icon className="text-xl" />
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
