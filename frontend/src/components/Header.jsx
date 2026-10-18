import {
  ArrowIcon, HomeIcon, AskIcon,
  ProfileIcon, SignIcon, CloseIcon, BurgerIcon,
} from "./Icons";
import "./Header.css";
import { useState } from "react";
import { useUserStore } from '../store/useUserStore';

export default function Header({ activeTab, setActiveTab }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userName = useUserStore((state) => state.user?.username) || 'User';
  const userEmail = useUserStore((state) => state.user?.email) || 'user do not write email';

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="mobile-nav-wrapper">
          <div className="logo-state">
            <div className="header-logo"></div>
            <a href="#" className="header-link">
              <ArrowIcon />
              <p>На сайт</p>
            </a>
          </div>
          <button
            className={`burger-toggle-btn ${isMenuOpen ? "open" : ""}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Открыть меню"
          >
            {isMenuOpen ? <CloseIcon /> : <BurgerIcon />}
          </button>

          <nav className={`header-nav-mobile ${isMenuOpen ? "visible" : ""}`}>
            <div className="header-profile">
              <SignIcon />
              <div className="profile-info">
                <div className="header-avatar"></div>
                <div className="profile-short">
                  <p>{userName}</p>
                  <span>{userEmail}</span>
                </div>
              </div>
            </div>
            <button
              className={`nav-btn ${activeTab === "cabinet" ? "active" : ""}`}
              onClick={() => handleNavClick("cabinet")}
            >
              <HomeIcon />
              Личный кабинет
            </button>
            <button className="nav-btn" onClick={() => setIsMenuOpen(false)}>
              <AskIcon />
              Правила
            </button>
            <button className="nav-btn" onClick={() => setIsMenuOpen(false)}>
              <ProfileIcon />
              Профиль
            </button>
          </nav>

          {isMenuOpen && (
            <div
              className="menu-overlay"
              onClick={() => setIsMenuOpen(false)}
            />
          )}
        </div>
        <div className="header-nav-desktop">
          <div className="logo-state">
            <div className="header-logo"></div>
            <a href="#" className="header-link">
              <ArrowIcon />
              <p>На сайт</p>
            </a>
          </div>
          <nav className="header-nav">
            <button
              className={`nav-btn ${activeTab === "cabinet" ? "active" : ""}`}
              onClick={() => setActiveTab("cabinet")}
            >
              <HomeIcon />
              Личный кабинет
            </button>
            <button className={`nav-btn`}>
              <AskIcon />
              Правила
            </button>
            <button className={`nav-btn`}>
              <ProfileIcon />
              Профиль
            </button>
          </nav>

          <div className="header-profile">
            <SignIcon />
            <div className="profile-info">
              <div className="header-avatar"></div>
              <div className="profile-short">
                <p>{userName}</p>
                <span>{userEmail}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
