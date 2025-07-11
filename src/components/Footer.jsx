// Footer.js
import React from 'react';
import { FaUserCircle, FaCommentDots, FaCog } from 'react-icons/fa';
import './Footer.css'; // Import the CSS for styles

const Footer = ({ activeFooter, setActiveFooter }) => {
  return (
    <footer className="footer">
      <div
        className={`footer-item ${activeFooter === 'Group' ? 'active' : ''}`}
        onClick={() => setActiveFooter('Group')}
      >
        <FaUserCircle size={24} />
        <span>Groups</span>
      </div>
      <div
        className={`footer-item ${activeFooter === 'Chats' ? 'active' : ''}`}
        onClick={() => setActiveFooter('Chats')}
      >
        <FaCommentDots size={24} />
        <span>Chats</span>
      </div>
      <div
        className={`footer-item ${activeFooter === 'Status' ? 'active' : ''}`}
        onClick={() => setActiveFooter('Status')}
      >
        <FaCog size={24} />
        <span>Status</span>
      </div>
    </footer>
  );
};

export default Footer;
