import React, { useState, useEffect } from 'react';
import '../CssFiles/App.css';
import IconButton from '@mui/material/IconButton';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import {Link} from 'react-router-dom';

function Navbar(){
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 600);
  const [isConnected,setIsConnected] = useState(false);
  
  function connectWallet(){
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then((accounts) => {
          setIsConnected(true);
        })
        .catch((err) => console.error(err));
    }
    else{
      window.alert("Metamask is not Installed!!!!!!");
    }
  }

  function currButton(c){
    if(c === 'market'){
      const btn = document.querySelector('.nav-button-1');
      btn.style.color = 'white'
      const ethButton = document.querySelector('.nav-button');
      ethButton.style.color = '#00A9FF';
    }
    else{
      const ethButton = document.querySelector('.nav-button');
      ethButton.style.color = 'white';
      const btn = document.querySelector('.nav-button-1');
      btn.style.color = '#00A9FF'
    }
  }

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }

    setDrawerOpen(open);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 600);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(()=>{
    if(window.ethereum){
    window.ethereum.on('accountsChanged',function(accounts){
      setIsConnected(true);
    })
  }
  })

    return(
<AppBar position="static" style={{backgroundColor: 'transparent'}}>
    <Toolbar style={{ justifyContent: 'space-between',height:'30px', padding: '4px',width: '1450px',marginBottom: '10px',right:'3%',left:'3%'}}>
        <div style={{ display: 'flex', alignItems: 'center',color: 'black' }}>
            <a href="/" className='logo-1'>Hexno</a>
        </div>
        {isSmallScreen ? (
        <>
            <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            >
            <MenuIcon />
            </IconButton>
            <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={toggleDrawer(false)}
            >
            <List>
                <ListItem button onClick={toggleDrawer(false)}>
                <ListItemText primary="Create NFT" />
                </ListItem>
                <ListItem button onClick={toggleDrawer(false)}>
                <ListItemText primary="NFTs" />
                </ListItem>
                <ListItem button onClick={toggleDrawer(false)}>
                <ListItemText primary="MyNFTs" />
                </ListItem>
                <ListItem button onClick={toggleDrawer(false)}>
                <ListItemText primary="Connect Wallet" />
                </ListItem>
            </List>
            </Drawer>
        </>
        ) : (
        <div style={{ display: 'flex', alignItems: 'center',gap: '8px' }}>
            <Link to="/home/crowdfunding" style={{ textDecoration: 'none', color: 'white'}}>
                <button className='nav-button-1' onClick={() => currButton('crowdfunding')}>
                CrowdFunding
                </button>
            </Link>
            <Link to="/home/profile" style={{ textDecoration: 'none', color: 'white'}}>
                <button className='nav-button' onClick={() => currButton('market')}>
                Profile
                </button>
            </Link>
            <Link >
              <button style={{color: isConnected ?'green' : 'white'}} className='nav-button1' onClick={connectWallet}>
                {isConnected  ? '⦿ Connected': 'Connect Wallet'}
              </button>
            </Link>
        </div>
        )}
    </Toolbar>
    </AppBar>

    )
}

export default Navbar;