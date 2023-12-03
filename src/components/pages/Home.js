import React, { useState, useEffect } from 'react';
import '../CssFiles/Home.css';
import {Link} from 'react-router-dom';

function Home() {

  const TypingEffect = ({ text, speed}) => {
    const [displayedText, setDisplayedText] = useState('');
    const [showCursor, setShowCursor] = useState(true);
  
    useEffect(() => {
      let isMounted = true;
  
      const typeText = (index) => {
        if (index <= text.length && isMounted) {
          setDisplayedText(text.substring(0, index));
          setTimeout(() => typeText(index + 1), speed);
        } 
        else {
          const blinkInterval = setInterval(() => {
            setShowCursor((prev) => !prev);
          }, 860);
  
          return () => {
            clearInterval(blinkInterval);
            isMounted = false;
          };
        }
      };
  
      typeText(0);
  
      return () => {
        isMounted = false;
        setDisplayedText('');
      };
    }, [text, speed]);
  
    return (
      <div style={{ display: 'inline-block' }}>
        <p style={{ display: 'inline' }} className='tit-t'>
          {displayedText}
        </p>
        {showCursor && <span style={{ fontWeight: 'bold', borderLeft: '7px solid white', paddingLeft: '4px' }}></span>}
      </div>
    );
  };

const paragraphText = "Revolutionize crowdfunding with our platform.Discover unique projects and support creators while owning exclusive NFTs tied to their success.Join the NFT-powered crowdfunding movement today.Empower creators, own a piece of innovation."

  return (
    <div className="App">

      <header className="header-section">
        <div>
          <h1 className='logo'>Hexno</h1>
        </div>
        <div>
          <div className="header-content">
            <h1 className='tit'>Crowdfunding <span style={{color: '#00A9FF'}}>Using</span></h1>
            <h1 className='tit-1'>NFTs</h1>
            <TypingEffect text={paragraphText} speed={30}/>
        </div>
        <Link to="/home/crowdfunding" style={{ textDecoration: 'none', color: 'white'}}>
        <button className='get-button'>Get Started</button>
        </Link>
        </div>
      </header>
    </div>
  );
}

export default Home;
