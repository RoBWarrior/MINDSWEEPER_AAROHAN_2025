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
    <AppBar position="sticky" 
  color="transparent"            
  elevation={3}
  sx={{
    background: "linear-gradient(90deg,#0f172a 0%, #4f46e5 45%, #06b6d4 100%)",
    backdropFilter: "blur(8px)",
    boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
    fontWeight: 700,
  }}>

      <Toolbar className="flex justify-between items-center px-4 md:px-10">
       
        <Typography
          component={Link}
          to="/"
          variant="h5"
          className="neon-text flex items-center gap-2 font-bold text-cyan-400 hover:text-fuchsia-400 transition-colors"
          style={{ textDecoration: "none", fontFamily: "Orbitron, sans-serif" }}
        >
          <Psychology fontSize="large" />
          MindSweeper
        </Typography>

        {isMobile ? (
          <>
            <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MenuIcon className="text-cyan-400 hover:text-fuchsia-400 transition-colors" />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              sx={{
                "& .MuiPaper-root": {
                  background: "rgba(20, 20, 35, 0.9)",
                  color: "white",
                  backdropFilter: "blur(12px)",
                },
              }}
            >
              <MenuItem
                component={Link}
                to="/leaderboard"
                onClick={() => setAnchorEl(null)}
                className="font-cursive nav-link"
              >
                <Leaderboard sx={{ mr: 1 }} /> Leaderboard
              </MenuItem>
              <MenuItem
                component={Link}
                to="/rules"
                onClick={() => setAnchorEl(null)}
                className="font-cursive nav-link"
              >
                <MenuBook sx={{ mr: 1 }} /> Rules
              </MenuItem>
              {isLoggedIn ? (
                <MenuItem
                  onClick={() => {
                    handleLogout();
                    setAnchorEl(null);
                  }}
                  className="font-cursive nav-link"
                >
                  <Logout sx={{ mr: 1 }} /> Logout
                </MenuItem>
              ) : (
                <MenuItem
                  component={Link}
                  to="/login"
                  onClick={() => setAnchorEl(null)}
                  className="font-cursive nav-link"
                >
                  <Login sx={{ mr: 1 }} /> Login
                </MenuItem>
              )}
            </Menu>
          </>
        ) : (
          <div className="flex items-center gap-6">
            <Button
              component={Link}
              to="/leaderboard"
              color="inherit"
              startIcon={<Leaderboard />}
              className="nav-link text-cyan-400 hover:text-fuchsia-400 text-lg "
              sx={{ fontFamily: "Orbitron, sans-serif", textTransform: "none", fontWeight: 700}}
            >
              Leaderboard
            </Button>
            <Button
              component={Link}
              to="/rules"
              color="inherit"
              startIcon={<MenuBook />}
              className="nav-link text-cyan-400 hover:text-fuchsia-400 text-lg"
              sx={{ fontFamily: "Orbitron, sans-serif", textTransform: "none",  fontWeight: 700}}
            >
              Rules
            </Button>
            {isLoggedIn ? (
              <Button
                onClick={handleLogout}
                color="inherit"
                startIcon={<Logout />}
                className="nav-link text-cyan-400 hover:text-fuchsia-400 text-lg"
                sx={{ fontFamily: "Orbitron, sans-serif", textTransform: "none", fontWeight: 700 }}
              >
                Logout
              </Button>
            ) : (
              <Button
                component={Link}
                to="/login"
                color="inherit"
                startIcon={<Login />}
                className="nav-link text-cyan-400 hover:text-fuchsia-400 text-lg"
                sx={{ fontFamily: "Orbitron, sans-serif", textTransform: "none", fontWeight: 700 }}
              >
                Login
              </Button>
            )}
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
