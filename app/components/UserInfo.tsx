import React from 'react';

const UserInfo = () => (
  <div className="flex items-center space-x-2">
    <img 
      src="https://randomuser.me/api/portraits/men/32.jpg" 
      alt="User Profile Avatar" 
      className="w-8 h-8 rounded-full" 
    />
    <span className="text-gray-700">张三</span>
  </div>
);

export default UserInfo; 