import React from 'react';
import { Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center justify-center gap-2 py-8" >
      <img src="/images/logo.png" />
    </Link>
  );
};

export default Logo;
