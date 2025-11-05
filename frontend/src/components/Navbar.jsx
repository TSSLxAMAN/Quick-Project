import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthContext.jsx";
import Logo from '../assets/logo.png'

const MenuIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

const XMarkIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const baseClasses =
        "block w-full text-center lg:inline lg:w-auto lg:text-left text-sm font-medium px-4 py-2 rounded-lg transition duration-150 ease-in-out";
    const glowActive =
        "bg-indigo-600/20 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)] border border-indigo-500/40";
    const hoverEffect =
        "hover:bg-gray-700/50 hover:text-white";

    const navLink = (path, label) => (
        <Link
            to={path}
            className={`${baseClasses} ${hoverEffect} ${location.pathname === path ? glowActive : "text-gray-300"
                }`}
        >
            {label}
        </Link>
    );

    return (
        <nav className="bg-gray-800 text-white shadow-xl sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="text-2xl font-extrabold tracking-tight text-indigo-400 transform hover:scale-[1.03] transition-transform duration-200 ease-out flex "
                    >
                        <img src={Logo} className="h-8 w-8 mx-3" />
                        AssignMatch
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center space-x-2">
                        {navLink("/", "Home")}
                        {navLink("/about", "About")}
                        {navLink("/contact", "Contact")}

                        {isAuthenticated ? (
                            <>
                                {navLink("/dashboard", "Dashboard")}
                                {navLink("/profile", "Profile")}
                                

                                {/* User info + Logout */}
                                <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-700">
                                    <span className="text-gray-300 text-sm flex items-center">
                                        
                                        {user?.username}{" "}
                                        (<span className="text-indigo-400 font-semibold">{user?.role}</span>)
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="text-sm font-medium bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition duration-150 ease-in-out shadow-md ring-2 ring-red-500/50 hover:ring-red-500"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-3">
                                {navLink("/login", "Login")}
                                <Link
                                    to="/register"
                                    className="text-sm font-medium bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition duration-150 ease-in-out shadow-lg transform hover:scale-[1.05]"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex lg:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition"
                        >
                            {isMenuOpen ? <XMarkIcon /> : <MenuIcon />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            <div
                className={`lg:hidden transition-all duration-300 ease-out ${isMenuOpen
                        ? "max-h-96 opacity-100 py-3 border-t border-gray-700"
                        : "max-h-0 opacity-0 overflow-hidden"
                    }`}
            >
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col items-center">
                    {navLink("/", "Home")}
                    {navLink("/about", "About")}
                    {navLink("/contact", "Contact")}
                    {isAuthenticated ? (
                        <>
                            {navLink("/dashboard", "Dashboard")}
                            {navLink("/profile", "Profile")}
                            
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setIsMenuOpen(false);
                                }}
                                className="w-full text-center text-sm font-medium bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition duration-150 ease-in-out mt-2"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            {navLink("/login", "Login")}
                            <Link
                                to="/register"
                                className="w-full text-center text-sm font-medium bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition duration-150 ease-in-out mt-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
