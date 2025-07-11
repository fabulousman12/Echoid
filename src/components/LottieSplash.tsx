import React, { useEffect } from 'react';
import Lottie from 'lottie-react';

import { useHistory } from 'react-router-dom';

const LottieSplash: React.FC = () => {
  const navigate = useHistory();

  useEffect(() => {
    // Hide native splash screen
  

    const timer = setTimeout(() => {
      navigate.push('/home'); // Or wherever your main screen is
    }, 3000); // Adjust based on animation length

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-white">
    
    </div>
  );
};

export default LottieSplash;
