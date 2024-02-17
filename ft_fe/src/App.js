import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import './index.css';


function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Home />,
    },
   
    
  ]);

  return <RouterProvider router={router} />;
}

export default App;
