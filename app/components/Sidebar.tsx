import React from 'react';
import Link from 'next/link';

const Sidebar = () => {
  const menuItems = [
    { name: 'Number Sense - Kids Math', href: '/number-sense' },
    { name: 'Addition Practice - Kids Math Game', href: '/addition' },
    // { name: 'Subtraction Practice - Kids Math Game', href: '/subtraction' },
    // { name: 'Multiplication Practice - Kids Math Game', href: '/multiplication' },
    // { name: 'Division Practice - Kids Math Game', href: '/division' },
  ];
  return (
    <aside className="w-48 bg-gray-100 h-full p-4 border-r flex flex-col space-y-4">
      {menuItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className="block py-2 px-4 rounded hover:bg-blue-100 text-gray-700 font-medium"
        >
          {item.name}
        </Link>
      ))}
    </aside>
  );
};

export default Sidebar;