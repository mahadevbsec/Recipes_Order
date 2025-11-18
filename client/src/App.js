import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Login from './Components/Login';
import Register from './Components/Register';
import PrivateComponent from './Components/PrivateComponent';
import Recipes from './Components/Recipes';
import AddRecipe from './Components/AddRecipe';
import LikedProducts from './Components/LikedProducts';
import ForgotPassword from './Components/ForgotPassword';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Private routes */}
        <Route element={<PrivateComponent />}>
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/add-recipe" element={<AddRecipe />} />
          <Route path="/liked-products" element={<LikedProducts />} />
        </Route>

        {/* Optional: fallback route */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
