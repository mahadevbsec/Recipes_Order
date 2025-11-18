// src/components/Recipes.jsx

import React, { useCallback, useEffect, useState } from "react";
import RecipeCard from "./RecipeCard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { buildUrl } from "../utils/apiConfig";

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [orderedRecipes, setOrderedRecipes] = useState([]);
  const [searchKey, setSearchKey] = useState("");
  const [showOrders, setShowOrders] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [orderInfo, setOrderInfo] = useState({ 
    name: "", 
    phone: "",
    paymentMethod: "cash" // Default to cash on delivery
  });
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

  const handleOrderRecipe = async (id) => {
    try {
      const recipe = recipes.find(r => r._id === id);
      if (recipe) {
        // Check if recipe is already ordered
        if (orderedRecipes.some(r => r._id === id)) {
          toast.info("Recipe already ordered");
          return;
        }
        
        // Show order modal
        setSelectedRecipe(recipe);
        setShowOrderModal(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error ordering recipe");
    }
  };

  const handleOrderSubmit = async () => {
    if (!orderInfo.name.trim() || !orderInfo.phone.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    // Phone number validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(orderInfo.phone.replace(/\s/g, ''))) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      // Handle online payment
      if (orderInfo.paymentMethod === "online") {
        // TEST PAYMENT - No backend required
        await processTestPayment();
      } else {
        // Cash on delivery - place order directly
        placeOrder();
      }
    } catch (error) {
      console.error("Order processing error:", error);
      toast.error("Error processing order. Please try again.");
    }
  };

  // Test Payment Processing (No Backend Required)
  const processTestPayment = async () => {
    try {
      // Show payment processing message
      toast.info("Initializing payment...");
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show payment options modal
      const paymentSuccess = await showPaymentOptions();
      
      if (paymentSuccess) {
        // Payment successful - place order
        placeOrder('Paid', 'test_payment_' + Date.now());
      } else {
        // Payment failed or cancelled
        toast.info("Payment cancelled. You can try again or select cash on delivery.");
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    }
  };

  // Show payment options modal
  const showPaymentOptions = () => {
    return new Promise((resolve) => {
      // Create a simple payment modal
      const paymentModal = document.createElement('div');
      paymentModal.className = 'payment-modal-overlay';
      paymentModal.innerHTML = `
        <div class="payment-modal">
          <div class="payment-modal-header">
            <h3>💳 Select Payment Method</h3>
            <button class="close-payment-modal">&times;</button>
          </div>
          <div class="payment-modal-body">
            <div class="payment-methods">
              <button class="payment-method-btn" data-method="card">
                <span class="payment-icon">💳</span>
                <div>
                  <strong>Credit/Debit Card</strong>
                  <small>Visa, Mastercard, Rupay</small>
                </div>
              </button>
              <button class="payment-method-btn" data-method="upi">
                <span class="payment-icon">📱</span>
                <div>
                  <strong>UPI</strong>
                  <small>Google Pay, PhonePe, Paytm</small>
                </div>
              </button>
              <button class="payment-method-btn" data-method="netbanking">
                <span class="payment-icon">🏦</span>
                <div>
                  <strong>Net Banking</strong>
                  <small>All major banks</small>
                </div>
              </button>
            </div>
            <div class="test-payment-info">
              <p>🧪 <strong>Test Mode</strong> - No actual charges</p>
              <small>Use test card: 4111 1111 1111 1111</small>
            </div>
          </div>
        </div>
      `;

      // Add styles
      paymentModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10001;
      `;

      document.body.appendChild(paymentModal);

      // Handle payment method selection
      const paymentButtons = paymentModal.querySelectorAll('.payment-method-btn');
      const closeButton = paymentModal.querySelector('.close-payment-modal');

      paymentButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
          const method = btn.dataset.method;
          
          // Simulate payment processing
          btn.disabled = true;
          btn.innerHTML = `
            <div class="payment-spinner"></div>
            <div>
              <strong>Processing...</strong>
              <small>Please wait</small>
            </div>
          `;
          
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Show success
          btn.innerHTML = `
            <span class="payment-icon">✅</span>
            <div>
              <strong>Payment Successful!</strong>
              <small>${method} payment completed</small>
            </div>
          `;
          
          setTimeout(() => {
            document.body.removeChild(paymentModal);
            resolve(true);
          }, 1000);
        });
      });

      closeButton.addEventListener('click', () => {
        document.body.removeChild(paymentModal);
        resolve(false);
      });

      // Close on backdrop click
      paymentModal.addEventListener('click', (e) => {
        if (e.target === paymentModal) {
          document.body.removeChild(paymentModal);
          resolve(false);
        }
      });
    });
  };

  // Place order after successful payment
  const placeOrder = (paymentStatus = 'Pending', paymentId = null) => {
    const orderedRecipe = {
      ...selectedRecipe,
      orderInfo: {
        name: orderInfo.name,
        phone: orderInfo.phone,
        paymentMethod: orderInfo.paymentMethod,
        paymentStatus: paymentStatus,
        paymentId: paymentId,
        orderDate: new Date().toLocaleDateString(),
        orderTime: new Date().toLocaleTimeString()
      }
    };
    
    setOrderedRecipes(prev => [...prev, orderedRecipe]);
    
    // Show appropriate success message
    const paymentMessage = orderInfo.paymentMethod === "online" && paymentStatus === "Paid"
      ? `Online payment completed! We'll contact ${orderInfo.name} at ${orderInfo.phone}`
      : `Order placed! We'll contact ${orderInfo.name} at ${orderInfo.phone} for cash on delivery`;
    
    toast.success(paymentMessage);
    
    // Reset modal
    setShowOrderModal(false);
    setSelectedRecipe(null);
    setOrderInfo({ name: "", phone: "", paymentMethod: "cash" });
  };

  const handleModalClose = () => {
    setShowOrderModal(false);
    setSelectedRecipe(null);
    setOrderInfo({ name: "", phone: "", paymentMethod: "cash" });
  };

  // Delete ordered recipe
  const handleDeleteOrder = (orderId) => {
    try {
      // Find the recipe to delete
      const recipeToDelete = orderedRecipes.find(r => r._id === orderId);
      
      if (recipeToDelete) {
        // Remove from ordered recipes
        setOrderedRecipes(prev => prev.filter(r => r._id !== orderId));
        
        // Show success message
        toast.success(`Order for "${recipeToDelete.title}" has been deleted`);
        
        // If no more orders, switch back to recipes view
        if (orderedRecipes.length === 1) {
          setShowOrders(false);
        }
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Error deleting order. Please try again.");
    }
  };

  // Save ordered recipes to localStorage for persistence
  const saveOrderedRecipes = (recipes) => {
    try {
      localStorage.setItem('orderedRecipes', JSON.stringify(recipes));
    } catch (error) {
      console.error("Error saving ordered recipes:", error);
    }
  };

  // Load ordered recipes from localStorage on component mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('orderedRecipes');
    if (savedOrders) {
      try {
        setOrderedRecipes(JSON.parse(savedOrders));
      } catch (error) {
        console.error("Error loading saved orders:", error);
      }
    }
  }, []);

  // Save ordered recipes whenever they change
  useEffect(() => {
    saveOrderedRecipes(orderedRecipes);
  }, [orderedRecipes]);

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
        
        <div className="navigation-buttons" style={{ marginTop: '1rem' }}>
          <button 
            onClick={() => setShowOrders(false)}
            className={`nav-btn ${!showOrders ? 'active' : ''}`}
            style={{ marginRight: '1rem' }}
          >
            All Recipes
          </button>
          <button 
            onClick={() => setShowOrders(true)}
            className={`nav-btn ${showOrders ? 'active' : ''}`}
          >
            Ordered Recipes ({orderedRecipes.length})
          </button>
        </div>
      </div>
      
      {!showOrders ? (
        <>
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
                onOrderRecipe={handleOrderRecipe}
              />
            ))}
          </div>
          
          {recipes.length === 0 && (
            <div className="empty-state">
              <h3>No recipes found</h3>
              <p>Try adjusting your search or add a new recipe!</p>
            </div>
          )}
        </>
      ) : (
        <div className="ordered-recipes">
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#2d3748' }}>
            Your Ordered Recipes
          </h2>
          
          {orderedRecipes.length === 0 ? (
            <div className="empty-state">
              <h3>No ordered recipes yet</h3>
              <p>Start ordering recipes to see them here!</p>
            </div>
          ) : (
            <div className="recipe-list">
              {orderedRecipes.map((recipe) => (
                <div key={recipe._id} className="ordered-recipe-card">
                  <div className="recipe-image">
                    {recipe.imageUrl ? (
                      <img src={recipe.imageUrl} alt={recipe.title} />
                    ) : (
                      <div className="placeholder-image">
                        <span>No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="recipe-content">
                    <h3>{recipe.title}</h3>
                    <p className="recipe-description">{recipe.description}</p>
                    
                    {/* Order Information */}
                    <div className="order-details">
                      <h4>📋 Order Information</h4>
                      <div className="order-info-grid">
                        <div className="info-item">
                          <span className="info-label">Name:</span>
                          <span className="info-value">{recipe.orderInfo.name}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Phone:</span>
                          <span className="info-value">{recipe.orderInfo.phone}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Date:</span>
                          <span className="info-value">{recipe.orderInfo.orderDate}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Time:</span>
                          <span className="info-value">{recipe.orderInfo.orderTime}</span>
                        </div>
                      </div>
                      
                      {/* Payment Information */}
                      <div className="payment-info">
                        <div className="payment-method-badge">
                          💳 {recipe.orderInfo.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}
                        </div>
                        <div className={`payment-status ${recipe.orderInfo.paymentStatus.toLowerCase()}`}>
                          {recipe.orderInfo.paymentStatus === 'Paid' ? '✅ Paid' : '⏳ Pending'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="recipe-actions">
                      <button 
                        onClick={() => handleDeleteOrder(recipe._id)}
                        className="delete-order-btn"
                      >
                        🗑️ Delete Order
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <ToastContainer />
      
      {/* Order Modal */}
      {showOrderModal && (
        <div className="modal-overlay">
          <div className="order-modal">
            <div className="modal-header">
              <h3>Order Recipe: {selectedRecipe?.title}</h3>
              <button onClick={handleModalClose} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input
                  type="text"
                  id="name"
                  value={orderInfo.name}
                  onChange={(e) => setOrderInfo({...orderInfo, name: e.target.value})}
                  placeholder="Enter your name"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number:</label>
                <input
                  type="tel"
                  id="phone"
                  value={orderInfo.phone}
                  onChange={(e) => setOrderInfo({...orderInfo, phone: e.target.value})}
                  placeholder="Enter your 10-digit phone number"
                  className="form-input"
                  maxLength="10"
                />
              </div>
              <div className="form-group">
                <label>Payment Method:</label>
                <div className="payment-options">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={orderInfo.paymentMethod === "cash"}
                      onChange={(e) => setOrderInfo({...orderInfo, paymentMethod: e.target.value})}
                    />
                    <span className="payment-label">
                      <span className="payment-icon">💵</span>
                      <span className="payment-text">
                        <strong>Cash on Delivery</strong>
                        <small>Pay when you receive your order</small>
                      </span>
                    </span>
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={orderInfo.paymentMethod === "online"}
                      onChange={(e) => setOrderInfo({...orderInfo, paymentMethod: e.target.value})}
                    />
                    <span className="payment-label">
                      <span className="payment-icon">💳</span>
                      <span className="payment-text">
                        <strong>Online Payment</strong>
                        <small>Pay now with secure payment gateway</small>
                      </span>
                    </span>
                  </label>
                </div>
                {orderInfo.paymentMethod === "online" && (
                  <div className="payment-info">
                    <p><strong>💡 Online Payment Options:</strong></p>
                    <ul>
                      <li>Credit/Debit Card (Visa, Mastercard, Rupay)</li>
                      <li>UPI (Google Pay, PhonePe, Paytm)</li>
                      <li>Net Banking</li>
                      <li>Digital Wallets</li>
                    </ul>
                    <p className="security-note">
                      🔒 Secure payment powered by industry-standard encryption
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={handleModalClose} className="cancel-btn">Cancel</button>
              <button onClick={handleOrderSubmit} className="submit-order-btn">Submit Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recipes;
