// src/components/Recipes.jsx

import React, { useCallback, useEffect, useState } from "react";
import RecipeCard from "./RecipeCard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { buildUrl } from "../utils/apiConfig";

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [searchKey, setSearchKey] = useState("");

  const token = localStorage.getItem("token");

  const fetchRecipes = useCallback(async () => {
    try {
      const res = await fetch(buildUrl("/auth/recipe"), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch recipes");
      }
      const data = await res.json();
      setRecipes(data);
    } catch (err) {
      console.error("Error fetching recipes:", err);
      toast.error("Could not load recipes.");
    }
  }, [token]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this recipe?")) return;
    try {
      const res = await fetch(buildUrl(`/auth/recipe/${id}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to delete");
      }
      toast.success("Recipe deleted");
      // remove from state
      setRecipes((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Error deleting recipe");
    }
  };

  const handleAddFavorite = async (id) => {
    try {
      const res = await fetch(buildUrl(`/auth/likedRecipes/${id}`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to add favorite");
      }
      toast.success("Added to favorites");
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const handleSearchChange = async (e) => {
    const key = e.target.value;
    setSearchKey(key);

    if (key.trim().length === 0) {
      fetchRecipes();
    } else {
      try {
        const res = await fetch(buildUrl(`/auth/searchRecipes/${key}`), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Search failed");
        }
        const data = await res.json();
        setRecipes(data);
      } catch (err) {
        console.error(err);
        toast.error("Search fetch error");
      }
    }
  };

  return (
    <div className="main-content">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          color: '#2d3748',
          background: 'linear-gradient(135deg, #ff9a9e 0%, #a8edea 50%, #fed6e3 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '0.5rem'
        }}>
          Delicious Recipes
        </h1>
        <p style={{ color: '#718096', fontSize: '1.1rem' }}>
          Discover and share amazing recipes from around the world
        </p>
      </div>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search recipes by name, ingredients, or keywords..."
          value={searchKey}
          onChange={handleSearchChange}
        />
      </div>
      
      <div className="recipe-list">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe._id}
            recipe={recipe}
            onDelete={handleDelete}
            onAddFavorite={handleAddFavorite}
          />
        ))}
      </div>
      
      {recipes.length === 0 && (
        <div className="empty-state">
          <h3>No recipes found</h3>
          <p>Try adjusting your search or add a new recipe!</p>
        </div>
      )}
      
      <ToastContainer />
    </div>
  );
};

export default Recipes;
