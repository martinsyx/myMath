import React from 'react';
import Link from 'next/link';

const Sidebar = () => {
  const menuItems = [
    { name: '数感学习', href: '/number-sense' },
    { name: '加法学习', href: '/addition' },
    { name: '减法学习', href: '/subtraction' },
    { name: '乘法学习', href: '/multiplication' },
    { name: '除法学习', href: '/division' },
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