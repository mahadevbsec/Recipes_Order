import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../App.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  const LogoutUser = () => {
    if (window.confirm("You wanna logout?")) {
      localStorage.clear();
      navigate("/login");
    } else {
      navigate("/recipes");
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const auth = localStorage.getItem("token");
  
  const handleToggleMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <button 
        className="navbar-toggler" 
        type="button" 
        data-toggle="collapse" 
        data-target="#navbarTogglerDemo01" 
        aria-controls="navbarTogglerDemo01" 
        aria-expanded="false" 
        aria-label="Toggle navigation"
        onClick={toggleMenu}
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`} id="navbarTogglerDemo01">
        <a className="navbar-brand" href="#">Recipe Sharing App</a>
        {auth ? (
          <>
            <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
              <li className="nav-item">
                <NavLink className="nav-link" to="/recipes" onClick={handleToggleMenu}>
                  Recipes
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/add-recipe" onClick={handleToggleMenu}>
                  Add Recipe
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/liked-products" onClick={handleToggleMenu}>
                  Favourites
                </NavLink>
              </li>
            </ul>
            <div className="ml-auto">
              <button 
                className="btn btn-link text-dark my-2 my-sm-0" 
                type="button"
                onClick={LogoutUser}
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="ml-auto">
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
