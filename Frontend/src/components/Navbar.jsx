import React, { useState, useContext } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Typography,
} from "@mui/material";
import {
  Psychology,
  Leaderboard,
  Login,
  Logout,
  Menu as MenuIcon,
  MenuBook,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { AuthContext } from "../AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const { isLoggedIn, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppBar 
      position="sticky" 
      color="transparent"            
      elevation={0}
      className="premium-navbar"
    >
      <div className="navbar-glow"></div>
      <Toolbar className="navbar-toolbar">
        {/* Logo Section */}
        <Typography
          component={Link}
          to="/"
          variant="h5"
          className="logo-container"
          style={{ textDecoration: "none" }}
        >
          <div className="logo-icon-wrapper">
            <Psychology className="logo-icon" />
            <div className="logo-icon-glow"></div>
          </div>
          <span className="logo-text">MindSweepers</span>
        </Typography>

        {isMobile ? (
          <>
            <IconButton 
              color="inherit" 
              onClick={(e) => setAnchorEl(e.currentTarget)}
              className="mobile-menu-button"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              className="mobile-menu"
              PaperProps={{
                className: "mobile-menu-paper"
              }}
            >
              <MenuItem
                component={Link}
                to="/leaderboard"
                onClick={() => setAnchorEl(null)}
                className="mobile-menu-item"
              >
                <Leaderboard className="menu-item-icon" /> 
                <span>Leaderboard</span>
              </MenuItem>
              <MenuItem
                component={Link}
                to="/rules"
                onClick={() => setAnchorEl(null)}
                className="mobile-menu-item"
              >
                <MenuBook className="menu-item-icon" /> 
                <span>Rules</span>
              </MenuItem>
              {isLoggedIn ? (
                <MenuItem
                  onClick={() => {
                    handleLogout();
                    setAnchorEl(null);
                  }}
                  className="mobile-menu-item logout-item"
                >
                  <Logout className="menu-item-icon" /> 
                  <span>Logout</span>
                </MenuItem>
              ) : (
                <MenuItem
                  component={Link}
                  to="/login"
                  onClick={() => setAnchorEl(null)}
                  className="mobile-menu-item login-item"
                >
                  <Login className="menu-item-icon" /> 
                  <span>Login</span>
                </MenuItem>
              )}
            </Menu>
          </>
        ) : (
          <div className="nav-links-container">
            <Button
              component={Link}
              to="/leaderboard"
              className="nav-button"
              startIcon={<Leaderboard />}
            >
              <span className="nav-button-text">Leaderboard</span>
            </Button>
            <Button
              component={Link}
              to="/rules"
              className="nav-button"
              startIcon={<MenuBook />}
            >
              <span className="nav-button-text">Rules</span>
            </Button>
            {isLoggedIn ? (
              <Button
                onClick={handleLogout}
                className="nav-button logout-button"
                startIcon={<Logout />}
              >
                <span className="nav-button-text">Logout</span>
              </Button>
            ) : (
              <Button
                component={Link}
                to="/login"
                className="nav-button login-button"
                startIcon={<Login />}
              >
                <span className="nav-button-text">Login</span>
              </Button>
            )}
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;