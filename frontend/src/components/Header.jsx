import { ArrowIcon, HomeIcon, AskIcon, ProfileIcon, SignIcon } from "./Icons";
import "./Header.css";

export default function Header({ activeTab, setActiveTab }) {
  return (
      <header className="app-header">
        <div className="header-content">
            <div className="logo-state">
                <div className="header-logo">
                    
                </div>
                <a href="#" className="header-link">
                    <ArrowIcon />
                    <p>На сайт</p>
                </a>
            </div>
            <nav className="header-nav">
                <button 
                    className={`nav-btn ${activeTab === 'cabinet' ? 'active' : ''}`}
                    onClick={() => setActiveTab('cabinet')}
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
                    <div className="header-avatar">
                        
                    </div>
                    <div className="profile-short">
                        <p>User</p>
                        <span>nameuser@email.com</span>
                    </div>
                </div>
            </div>
        </div>
      </header>
  );
}