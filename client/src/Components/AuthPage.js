import React, { useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { buildUrl } from "../utils/apiConfig";

const AuthPage = ({ initialMode = "login" }) => {
  const [mode, setMode] = useState(initialMode);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [forgotForm, setForgotForm] = useState({ email: "", password: "" });
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const carouselImages = useMemo(
    () => [
      {
        src: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1200&q=80",
        alt: "Fresh salad bowl",
        caption: "Discover vibrant, healthy recipes curated for every mood.",
      },
      {
        src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
        alt: "Stack of pancakes with berries",
        caption: "Save your favorites and revisit them anytime in seconds.",
      },
      {
        src: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
        alt: "Chef garnishing gourmet dish",
        caption: "Create elegant plates and inspire fellow food lovers.",
      },
    ],
    []
  );

  const [currentSlide, setCurrentSlide] = useState(0);
  const goToSlide = (index) => {
    setCurrentSlide((index + carouselImages.length) % carouselImages.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [carouselImages.length]);

  const handlePrev = () => goToSlide(currentSlide - 1);
  const handleNext = () => goToSlide(currentSlide + 1);

  const normalizeEmail = (value) => value.trim().toLowerCase();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      setShowError(true);
      return;
    }

    try {
      let response = await fetch(buildUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizeEmail(loginForm.email),
          password: loginForm.password,
        }),
      });

      response = await response.json();

      if (!response.error) {
        toast.success("Login Successful");
        localStorage.setItem("token", response.token);

        setTimeout(() => {
          window.location.href = "/recipes";
        }, 2000);
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error("An error occurred while logging in:", error);
      toast.error("Login failed. Please try again.");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      setShowError(true);
      return;
    }

    try {
      const response = await fetch(buildUrl("/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerForm.name,
          email: normalizeEmail(registerForm.email),
          password: registerForm.password,
        }),
      });

      if (response.ok) {
        const user = await response.json();

        if (user.error) {
          toast.warn("User already exists. Try with different email");
        } else {
          toast.success("Registration successful.");
          localStorage.setItem("token", user.token);
          setTimeout(() => {
            window.location.href = "/recipes";
          }, 2000);
        }
      } else {
        console.error("Failed to register user:", response.status);
        toast.error("Registration failed.");
      }
    } catch (error) {
      console.error("An error occurred while registering user:", error);
      toast.error("Registration failed. Please try again.");
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotForm.email || !forgotForm.password) {
      setShowError(true);
      return;
    }

    try {
      const response = await fetch(buildUrl("/auth/forgotpassword"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizeEmail(forgotForm.email),
          newPassword: forgotForm.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "Password updated successfully!");
        setTimeout(() => {
          setMode("login");
        }, 1500);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update password.");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password.");
    }
  };

  const renderActiveForm = () => {
    switch (mode) {
      case "register":
        return (
          <form onSubmit={handleRegisterSubmit}>
            <h2>Sign Up</h2>
            <input
              type="text"
              placeholder="Enter your name"
              value={registerForm.name}
              onChange={(e) =>
                setRegisterForm((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <input
              type="email"
              placeholder="Enter your email"
              value={registerForm.email}
              onChange={(e) =>
                setRegisterForm((prev) => ({ ...prev, email: e.target.value }))
              }
            />
            <input
              type="password"
              placeholder="Enter your password"
              value={registerForm.password}
              onChange={(e) =>
                setRegisterForm((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
            />
            <button type="submit">Register</button>
            <p className="form-helper-text">
              Already have an account?{" "}
              <span
                className="inline-link"
                onClick={() => setMode("login")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setMode("login");
                }}
              >
                Sign in
              </span>
            </p>
          </form>
        );
      case "forgot":
        return (
          <form onSubmit={handleForgotSubmit}>
            <h2>Reset Password</h2>
            <input
              type="email"
              placeholder="Enter your email"
              value={forgotForm.email}
              onChange={(e) =>
                setForgotForm((prev) => ({ ...prev, email: e.target.value }))
              }
            />
            <input
              type="password"
              placeholder="Enter new password"
              value={forgotForm.password}
              onChange={(e) =>
                setForgotForm((prev) => ({ ...prev, password: e.target.value }))
              }
            />
            <button type="submit">Update password</button>
          </form>
        );
      case "login":
      default:
        return (
          <form onSubmit={handleLoginSubmit}>
            <h2>Login</h2>
            <input
              type="email"
              placeholder="Enter your email"
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm((prev) => ({ ...prev, email: e.target.value }))
              }
            />
            <input
              type="password"
              placeholder="Enter your password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm((prev) => ({ ...prev, password: e.target.value }))
              }
            />
            <button type="submit">Sign in</button>
            <p className="form-helper-text">
              Don&apos;t have an account?{" "}
              <span
                className="inline-link"
                onClick={() => setMode("register")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setMode("register");
                }}
              >
                Sign up
              </span>
            </p>
          </form>
        );
    }
  };

  return (
    <div className="login-layout">
      <div className="SignupContainer form-panel">
        <div className="auth-tab-list">
          <button
            className={mode === "login" ? "active" : ""}
            type="button"
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            type="button"
            onClick={() => setMode("register")}
          >
            Sign Up
          </button>
          <button
            className={mode === "forgot" ? "active" : ""}
            type="button"
            onClick={() => setMode("forgot")}
          >
            Forgot Password
          </button>
        </div>

        {renderActiveForm()}
        {showError && (
          <span className="fill-fields-error">Please fill all required fields</span>
        )}
        <ToastContainer />
      </div>

      <div className="carousel-panel">
        <div id="loginCarousel" className="carousel slide" aria-roledescription="carousel">
          <ol className="carousel-indicators">
            {carouselImages.map((_, index) => (
              <li
                key={index}
                className={index === currentSlide ? "active" : ""}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </ol>

          <div className="carousel-inner">
            {carouselImages.map((image, index) => (
              <div
                key={image.alt}
                className={`carousel-item ${
                  index === currentSlide ? "active" : ""
                }`}
              >
                <img className="d-block w-100" src={image.src} alt={image.alt} />
                <div className="carousel-caption d-none d-md-block">
                  <p>{image.caption}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            className="carousel-control-prev"
            type="button"
            onClick={handlePrev}
            aria-label="Previous"
          >
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            onClick={handleNext}
            aria-label="Next"
          >
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

