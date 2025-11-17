import React, { useCallback, useEffect, useState } from "react";
import "../Styles/likedProducts.css";
import { toast, ToastContainer } from "react-toastify";
import { buildUrl } from "../utils/apiConfig";

const LikedProducts = () => {
  const [likedProducts, setLikedProducts] = useState([]);

  const fetchLikedProducts = useCallback(async () => {
    try {
      const response = await fetch(buildUrl("https://recipes-share.onrender.com/auth/likedRecipes"));

      if (!response.ok) {
        toast.error("Failed to fetch liked products");
      }

      const data = await response.json();

      // Set the fetched data to the state
      setLikedProducts(data);
    } catch (error) {
      toast.error("Error fetching liked products:", error);
    }
  }, []);

  useEffect(() => {
    fetchLikedProducts();
  }, [fetchLikedProducts]);

  const handleRemoveItem = async (recipeId) => {
    try {
      if (
        window.confirm(
          "Are you sure you wanna remove this recipe from favourites??"
        )
      ) {
        const response = await fetch(
          buildUrl(`https://recipes-share.onrender.com/auth/removeLiked/${recipeId}`),
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          toast.success("Item Removed successfully");
          fetchLikedProducts();
          setTimeout(() => {
            window.location.href = "/liked-products";
          }, 4000);
        } else {
          const data = await response.json();
          toast.error(data.error);
        }
      } else {
        window.location.href = "/liked-products";
      }
    } catch (error) {
      toast.error("Error removing item from liked products:", error);
    }
  };

  return (
    <div className="main-content">
      <div className="likedRecipes">
        <h2>My Favorite Recipes</h2>
      <ul>
        {likedProducts.map((product) => (
          <li key={product._id} className="list">
            <div>
              <h3>{product.title}</h3>
              <p>{product.instructions}</p>
              <img src={product.imageUrl} alt={product.title} />
              <h4>Ingredients:</h4>
              <ul>
                {product.ingredients.length > 0 && (
                  <ul className="ingredients-list">
                    {product.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                )}
              </ul>

              <div className="instructions-container">
                <h4>Instructions:</h4>
                <div className="instructions-list">
                  {product.instructions.split("\n").map((step, index) => (
                    <p key={index}>{step}</p>
                  ))}
                </div>
              </div>

              <button
                className="remove-item-button"
                onClick={() => handleRemoveItem(product._id)}
              >
                Remove Item
              </button>
            </div>
          </li>
        ))}
      </ul>
      <ToastContainer />
      </div>
    </div>
  );
};

export default LikedProducts;
