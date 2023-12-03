import React, { useState, useEffect } from 'react';
import '../App.css';
import { ethers } from 'ethers';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';


const s = require('./src/components/Artifacts/NftMarket.json');
const ABI = s.abi;


function Marketplace() {
  const [index,setIndex] = useState('');
  const [metadata,SetMetadata] = useState('');
  const [imageData,setImageData] = useState([]);
  const [toAddress, setToAddress] = useState('');
  const [open, setOpen] = useState(false);
  const [hasQueried, setHasQueried] = useState(false);
  const [cid, setCid] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  
  useEffect(() => {
    getDetails();
  }, []); 
  
  async function getDetails() {

    const ip = [
      'QmU8gVbeajvPKMZWN1gmaSwoUH15hiiJBtN4epdHPACYyV',
      'QmRKfwoFmjEZ9xWzzLQ5kanWCFXRqGk94eYfYM3M7roRNu',
      'QmTSPzk2tueG21cUKq46sztbLFVjWXecQ2WezYrxQCbqun',
      'QmW788yPHb7dj8eHoEuGTsvH4pG5g4oGaE2SPfbyuCoHK4',
      'QmYbDmtK7jVYdufJd8HLCPaCA9zbsSEJXhkek4A1MBCJHH',
      'QmV7DZukD7MLUHPYm3ADCD9CkCjr6HZ13hJzc5vszfAkcb',
      'QmfSWXQkzhW8Lq8hVeEZZ4iUUa9feW9m4JewW1kqexjrqy',
    ]
    SetMetadata(ip);

    const image = [
        'QmeAuqYFmtRB1cfdtDidgABxvaXUXebFTzjL8wGRo6rZhk',
        'QmTT75ERUsLqSoJ3Kda2foroUerPC1CvxcamYqQs9A3GbB',
        'QmSZtmitiDhhB2zKuJGij3rhELZAY1a91fQW7mpP6EEAaa',
        'QmZD2BYidWHPEUtPNFi8rRDhDNEAeSKJQ8wiTPqtYT9VUD',
        'QmfJDZNBcedjPtzU4xVXDV2GkLgnMfJ3fEbLgnnQh7WuFd',
        'QmWihMLASkuLkyJgGNmskUnsrbvNUB9sPbxUJkr2HTxYZe',
        'QmRgMK29DPX1qJ8RnYv4xN6PNNEVPFbCMaGQyG3ecmp9pf',
    ]
    setImageData(image);

    setHasQueried(true);
  }

  async function nftTransfer(){
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract('0x84D798A007f3A61CE63EEbAb2905b12927b680f3',ABI,signer);
    console.log(cid)

    try {
      const tx = await contract.safeMint(toAddress, metadata[index], { value: ethers.parseEther('0.0000000000000001') });
      const txHash = tx.hash;
      console.log('Transaction hash:', txHash);
      setLoading(true);
      setTransactionHash(txHash);
      await tx.wait();
      setToAddress('');
    } catch (error) {
      if (error.code === 'ACTION_REJECTED') {
        console.error('Transaction rejected by user');
        window.alert('Transaction rejected by user');
        setToAddress('');
      } else {
        console.log(error)
        console.error('Error sending transaction:', error.code);
      }}finally {
        setLoading(false);
      }
    
    // if(cid){
    // console.log(cid);
    // const tx = await contract.safeMint(toAddress, metadata[index],{value: ethers.parseEther('0.1')});
    // await tx.wait();
    // }

  }


  const handleBuyNowClick = (imageAddress,index) => {
    setCid(imageAddress);
    if(cid){
      setIndex(index);
      setOpenDialog(true);
      console.log(index);
      if(toAddress){
      nftTransfer();}
  }
  };

  function handleOpen(){
      setOpen(true);
  }
  function handleClose(){
    setOpen(false);
  }
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setToAddress('');
    setLoading(false);
    setTransactionHash(null);
  };
  const dialogActionsStyle = {
    display: 'flex',
    justifyContent: 'center',
    borderRadius: '0 0 15px 15px',
  };

  return (
    <div className="App">
      <Backdrop
        sx={{ color: 'rgb(94, 93, 93)', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
      >
        <CircularProgress />
      </Backdrop>
      <div className="grid-container">
        {hasQueried ? (
          imageData.map((imageAddress, index) => (
            <div key={index} className="image-card">
              <div className="image">
                <img src={`https://coffee-late-mammal-984.mypinata.cloud/ipfs/${imageAddress}?pinataGatewayToken=okwoHAvrLMH3VPnGt_83drKxPhMgkGP1YzHDwYbFEgzW_FACtNAJyFGLOH-W7fcB`} />
              </div>
              <div className="button-container">
                <button className="button" onClick={() => handleBuyNowClick(imageAddress,index)}>Mint NFT</button>
              </div>
            </div>
          ))
        ) : ('')}
      </div>
      <Dialog open={openDialog} fullWidth maxWidth="xs" style={{ borderRadius: '15px' }} onClose={handleCloseDialog}>
        <DialogTitle style={{ textAlign: 'center', fontWeight: 'bold', fontFamily: 'Arial', fontSize: '30px' }}>
          Payment
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleCloseDialog}
            aria-label="close"
            style={{ position: 'absolute', top: '10px', right: '20px', background: 'transparent' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText style={{ fontWeight: 'bold', textAlign: 'center', fontFamily: 'Arial' }}>
            Amount: 2 ETH
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="amount"
            label="Address"
            fullWidth
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
          />
        </DialogContent>
        <DialogActions style={dialogActionsStyle}>
          {loading ? (
            <h5 style={{fontSize: '20px'}}>Minting NFT...</h5>
          ) : transactionHash ? (
            <>
            <h5 style={{fontSize: '20px',color: '#5aa75a',fontFamily:'arial'}}>✓ NFT Minted!</h5>
            </>
          ) : (
            <button className="button" onClick={nftTransfer}>
              Mint NFT
            </button>
          )}
          
          {transactionHash && (
          <p style={{textAlign: 'center'}}>
            <a
              href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'grey',fontFamily:'monospace' }}
            >
              view on etherscan
            </a>
          </p>
        )}
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Marketplace;
