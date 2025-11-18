import React from 'react';

const RecipeCard = ({ recipe, onDelete, onAddFavorite, onOrderRecipe }) => {
  return (
    <div className="recipe-card">
      <div className="recipe-image">
        {recipe.imageUrl ? (
          <img src={recipe.imageUrl} alt={recipe.title} />
        ) : (
          <div className="no-image">No Image</div>
        )}
      </div>
      <div className="recipe-content">
        <h3>{recipe.title}</h3>
        <div className="recipe-ingredients">
          <h4>Ingredients:</h4>
          <ul>
            {recipe.ingredients && recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
        <div className="recipe-instructions">
          <h4>Instructions:</h4>
          <p>{recipe.instructions}</p>
        </div>
        <div className="recipe-actions">
          <button 
            onClick={() => onAddFavorite(recipe._id)}
            className="favorite-btn"
          >
            Add to Favorites
          </button>
          <button 
            onClick={() => onOrderRecipe(recipe._id)}
            className="order-btn"
          >
            Order Recipe
          </button>
          <button 
            onClick={() => onDelete(recipe._id)}
            className="delete-btn"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;