import React from 'react';

const Breadcrumb = () => (
  <nav className="text-gray-500 text-sm">
    <ol className="list-reset flex">
      <li><a href="#" className="hover:underline">Home</a></li>
      <li><span className="mx-2">/</span></li>
      <li><a href="#" className="hover:underline">Addition Practice - Kids Math Game</a></li>
    </ol>
  </nav>
);

export default Breadcrumb;