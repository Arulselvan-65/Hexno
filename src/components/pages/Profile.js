import '../CssFiles/CrowdFunding.css';
import '../CssFiles/App.css';
import { Alchemy, Network } from 'alchemy-sdk';
import { useState,React } from 'react';
import {
    SpinnerDotted
  } from "spinners-react";

export default function Profile() {

  const [userAddress, setUserAddress] = useState('');
  const [tokenBalance,setTokenBalance] = useState('');
  const [results,setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [isClicked,setIsClicked] = useState(false);
  const [requiredSpin,setRequiredSpin] = useState(false);

  function getData(){
    setRequiredSpin(true);
    setIsClicked(false);
    if(window.ethereum){
        window.ethereum.request({ method: 'eth_requestAccounts' })
        .then((accounts) => {
          getTokenBalance(accounts[0]);
        })
        .catch((err) => console.error(err));
    }
  }


  async function getTokenBalance(addr) {
    console.log(addr);
    setUserAddress(addr);
    let alchemy;
    try{
        const settings = {
            apiKey: "WUlCbz8-Yg6a5QJIQe-Cg88VlDr01zPW",
            network: Network.ETH_SEPOLIA,
        }; 
    alchemy = new Alchemy(settings);

}catch(e){}


    const data = await alchemy.core.getTokenBalances(addr);
    const tokenDataPromises = data.tokenBalances.map((token) => {
        return alchemy.core.getTokenMetadata(token.contractAddress);
      });
      let d = await  Promise.all(tokenDataPromises);
      let l = 0;
      for(let i=0;i< d.length;i++){
            if(d[i].symbol === "HA"){
                l+=parseInt(data.tokenBalances[i].tokenBalance);
            }
      }
      setTokenBalance(l);
    const data1 = await alchemy.nft.getNftsForOwner(addr);
    setResults(data1);
    setHasQueried(true);
    setIsClicked(true);
    setRequiredSpin(false);
}
    window.ethereum.on('accountsChanged', (a)=>{
        setTokenBalance('');
        getData(a[0]);

    })
        return(

            <div>

<div style = {
    {
      position: "relative",
      width: "100%",
      height: "100%"
    }
  }> 
  
  {requiredSpin && ( <div style = {
        {
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }
      } >
      
      <SpinnerDotted style = {
        {
          color: "#009deb"
        }
      }
      size = {
        150
      }
      /> </div >
    )
  } 
  </div>
    {isClicked ? (
            <>
                <div className='val' style={{height: '200px'}}>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 300px)', gridGap: '20px',textAlign: 'left' }}>
                <div style={{padding: '10px' ,width: '150px'}}>
                    <h1>
                        Address
                    </h1>
                    </div>
                <div style={{padding: '10px' }}>
                    <h3 style={{paddingTop: '8px'}}>{userAddress}</h3>
                    </div>

                <div style={{padding: '10px',width: '230px' }}>
                <h1>
                        No.of Tokens
                    </h1>   
                    </div>
                <div style={{padding: '10px'}}>
                    <h3 style={{paddingTop: '8px'}}>{tokenBalance}&nbsp;&nbsp;HA</h3>
                    </div>
                </div>
                </div>
            <div className='grid-container'>
          {hasQueried ? (
            results.ownedNfts.map((e, i) => (
                e.name ? (
                    e.raw.metadata.image.length === 46 ? (
                <div className='image-card' key={i}>
                    <div className='image'>
                    { <img src={`https://plum-neat-snake-634.mypinata.cloud/ipfs/${e.raw.metadata.image}?pinataGatewayToken=2lJKUgK4Ex-LacR8LOhqVMVjJp70nVqVTLBH5CORj8N-PQANpTDxEvByuf0nIq2J`} 
                        crossOrigin='anonymous' 
                        alt="nft"/> }
                    </div>
                <div>
                    <h4 style={{color: 'white',fontSize: '20px'}}>Title : <span style={{color: '#b5b5b5',fontSize: '16px'}}>{e.name}</span></h4>
                <div style={{height: '10px'}}></div>
                </div>
                </div>
                ):null
                ): null
                ))) : ('')}
                
                </div>
                </>
                ) : (
                    <button onClick={() => getData()} className='get-details-button'>Get Profile Details</button>
                )}
            </div>

        )
}