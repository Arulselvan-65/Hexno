import {
  React,
  useState,
  useEffect
} from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import "../CssFiles/CrowdFunding.css";
import ar from "../Images/ar.jpg";
import ar1 from "../Images/ar1.jpg";
import ar2 from "../Images/ar2.jpg";
import create from "../Images/create.png";
import Modal from "react-modal";
import axios from "axios";
import {
  ethers
} from "ethers";
import {
  SpinnerDotted,
  SpinnerCircular
} from "spinners-react";

const s = require("../Contract/artifacts/contracts/CrowdFund.sol/CrowdFund.json");
const ABI = s.abi;
const contAddr = require('../Contract/crowdFundAddress.json');

Modal.setAppElement("#root");


export default function CrowdFunding() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [smallDes, setSmallDes] = useState("");
  const [fullDes, setFullDes] = useState("");
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [min, setMin] = useState("");
  const [resAddress, setResAddress] = useState("");
  const [formSubmissions, setFormSubmissions] = useState([]);
  const [details, setDetails] = useState([]);
  const [items, setitems] = useState([]);
  const [hasFinished, setHasFinished] = useState(false);
  const [modals, setModals] = useState("");
  const [buttonind, setButtonind] = useState("");
  const [loading, setLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [currToken, setCurrToken] = useState("");
  const [requiredSpin, setRequiredSpin] = useState(false);
  const [roundSpin, setroundSpin] = useState(false);

  const openModal = (val) => {
    setModals(val);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setModals("");
  };
  const openDialog = () => {
    setIsDialogOpen(true);
  };
  const closeDialog = () => {
    setIsDialogOpen(false);
  };
  const openPaymentDialog = (ind) => {
    setButtonind(ind);
    setIsPaymentDialogOpen(true);
  };
  const closePaymentDialog = () => {
    setIsPaymentDialogOpen(false);
    setButtonind("");
    setTransactionHash("");
    setLoading(false);
  };
  const handleInputChange = (e) => {
    setSmallDes(e.target.value);
  };
  const handleInputChange1 = (e) => {
    setFullDes(e.target.value);
  };

  async function contribute(ind) {
    console.log(ind);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const total = parseInt(ind.value );
    const min = parseInt(ind.minimumContribution / 10 ** 18);
    const Name = document.querySelector(".ContributorName");
    const Val = document.querySelector(".Contribution");
    let cid = "";
    let option = 0;

    const amt = parseFloat(Val.value);
    if (Name.value === "" || amt === "") {
      window.alert("Fill all the fileds!!!!");
    }
    if (typeof amt !== "number" || typeof total !== "number" || amt === 0) {
      window.alert("Invalid Input!!!");
    }
    if (min > Val) {
      window.alert("Should pay atleast MinimumContribution Value!!!");
    } else {
      const percentage = (amt / total) * 100;

      let p = percentage.toFixed(2);

      console.log(p);
      console.log(total);
      console.log(amt);
      if (amt == total) {
        cid = ind.uri3;
        option = 1;
        setCurrToken("✓ NFT Minted!");
      } else {
        if (p >= 10 && p <= 25) {
          cid = ind.uri1;
          option = 1;
          setCurrToken("✓ NFT Minted!");
        } else if (p > 25 && p <= 50) {
          cid = ind.uri2;
          option = 1;
          setCurrToken("✓ NFT Minted!");
        } else if (p > 50) {
          cid = ind.uri3;
          option = 1;
          setCurrToken("✓ NFT Minted!");
        } else {
          option = 0;
          setCurrToken("✓ ERC-20 Minted!");
        }
      }

      try {
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          `${contAddr.address}`,
          ABI,
          signer
        );
        const tx = await contract.contribute(
          parseInt(ind.id),
          Name.value,
          cid.toString(),
          option, {
            value: ethers.parseEther(`${amt}`)
          }
        );
        const txHash = tx.hash;
        setLoading(true);
        setTransactionHash(txHash);
        await tx.wait();
        getProjects();
      } catch (e) {
        console.log("Error : ", e);
      } finally {
        setLoading(false);
        getProjects();
        getProjects();
      }
    }
  }

  async function createProject() {
    const titl = document.querySelector(".title");
    const valu = document.querySelector(".value");
    const mi = document.querySelector(".min");
    const re = document.querySelector(".res-add");

    if (
      titl.value === "" ||
      valu.value === "" ||
      mi.value === "" ||
      re.value === ""
    ) {
      window.alert("Fill all the fileds!!!!");
    } else {
      setTitle(titl.value);
      setValue(valu.value);
      setMin(mi.value);
      setResAddress(re.value);
      if(parseInt(valu.value / (10**18)) < 1 || parseInt(mi.value / (10**18)) < 1){
         alert(`Atleast 1 Ether!!!!`);
      }
      if ((re.value).length - 2 < 40) {
        alert(`Invalid Recipient Address!!!`);
      }
      else {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            `${contAddr.address}`,
            ABI,
            signer
          );

          const tx = await contract.createProject(
            title,
            value,
            min,
            resAddress
          );
          setRequiredSpin(true);
          await tx.wait().then((re) => {
            if (tx) {
              sendDetails();
              closeDialog();
              getProjects();
              setRequiredSpin(false);
            }
          });
        } catch (e) {
          window.alert("Click Again!!!");
        } finally {
          getProjects();
        }
      }
    }
  }

  async function getProjects() {
    setroundSpin(true);
    const response = await axios.get("http://localhost:3002/submissions");
    const serverDetails = response.data;
    const provider = new ethers.JsonRpcProvider(
      "https://sepolia.infura.io/v3/1de2c1c15d0c444f995d92341fc47b1c"
    );
    const contract = new ethers.Contract(
      `${contAddr.address}`,
      ABI,
      provider
    );
    let n = await contract.getProjectId();
    n = parseInt(n);
    console.log("Overall size:", n);
    let l = [];

    for (let i = 1; i <= n + 1; i++) {
      try {
        if (details) {
          let d = serverDetails[i - 1];
          let s = await contract.projects(i);
          const data = {
            title: s[0],
            value: parseInt(s[1]) / 10 ** 18,
            collectedValue: parseInt(s[2]) / 10 ** 18,
            minimumContribution: parseInt(s[3]) / 10 ** 18,
            recipient: s[4],
            isCompleted: s[5],
            contributorsCount: parseInt(s[6]),
            id: s[7],
            smallDescription: d.data.smallDescription,
            fullDescription: d.data.fullDescription,
            uri1: d.data.uri1,
            uri2: d.data.uri2,
            uri3: d.data.uri3,
            img1: d.data.img1,
            img2: d.data.img2,
            img3: d.data.img3,
          };
          if (data.title) l.push(data);
        }
        console.log(l)
      } catch (e) {
        console.error(e);
      }
    }
    l = l.sort((a, b) => (a.isCompleted === b.isCompleted) ? 0 : a.isCompleted ? 1 : -1);
    setitems(l);
    setHasFinished(true);
    console.log("completed");
    setroundSpin(false);
  }

  useEffect(() => {
    async function fetchData() {
      try {
        getProjects();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  const sendDetails = async () => {
    const f = document.querySelector(".inp-1");
    const s = document.querySelector(".inp-2");
    const t = document.querySelector(".inp-3");
    const titl = document.querySelector(".title");
    const valu = document.querySelector(".value");
    const mi = document.querySelector(".min");
    const re = document.querySelector(".res-add");

    const fst = f.value;
    const sec = s.value;
    const th = t.value;
    if(fst.length < 46 || sec.length < 46 || th.length < 46){
      window.alert("Invalid CID!!!");
    }
    else{

    if (
      fst === "" ||
      sec === "" ||
      th === "" ||
      smallDes === "" ||
      fullDes === "" ||
      titl.value === "" ||
      valu.value === "" ||
      mi.value === "" ||
      re.value === ""
    ) {
      window.alert("Fill all the fileds!!!!");
    } else {
      await axios.post("http://localhost:3002/submit", {
        smallDescription: smallDes,
        fullDescription: fullDes,
        uri1: fst,
        uri2: sec,
        uri3: th,
      });
    }
    setSmallDes('');
    setFullDes('');
  }
  };

  const TypingEffect = ({
    text,
    speed
  }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [showCursor, setShowCursor] = useState(true);
    useEffect(() => {
      let isMounted = true;
      const typeText = (index) => {
        if (index <= text.length && isMounted) {
          setDisplayedText(text.substring(0, index));
          setTimeout(() => typeText(index + 1), speed);
        } else {
          const blinkInterval = setInterval(() => {
            setShowCursor((prev) => !prev);
          }, 860);
          setTimeout(() => {
            clearInterval(blinkInterval);
            isMounted && typeText(0);
          }, 5000);
          return () => {
            clearInterval(blinkInterval);
            isMounted = false;
          };
        }
      };
      typeText(0);
      return () => {
        isMounted = false;
        setDisplayedText("");
      };
    }, [text, speed]);
    return ( 
    
    <div style = {
          {
            display: "inline-block"
          }
        } >
        <p style = {
          {
            display: "inline"
          }
        }
        className = "tit-t" > {
          displayedText
        } </p> {
        showCursor && ( <span style = {
            {
              fontWeight: "bold",
              borderLeft: "7px solid white",
              paddingLeft: "4px",
            }
          } >
          </span>
        )
      } </div>
  );
};
//End of Typing Effect
const paragraphText =
  "Empower your project dreams with our crowdfunding platform. Create a compelling campaign, share your story, and invite backers to support your vision. Start your crowdfunding journey today and turn ideas into reality!";
const settings = {
  dots: false,
  infinite: true,
  speed: 5000,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  arrows: false,
};
const slideData = [{
    id: 1,
    imageUrl: ar,
    alt: "Image 1"
  },
  {
    id: 2,
    imageUrl: ar2,
    alt: "Image 2"
  },
  {
    id: 3,
    imageUrl: ar1,
    alt: "Image 3"
  },
];
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    border: "none",
    borderRadius: "8px",
    padding: "20px",
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    backdropFilter: "blur(4px)",
  },
};
return ( <>
  <div className = "caro"
  style = {
    {
      pointerEvents: "none"
    }
  } >
  <div>
  <Modal isOpen = {
    isModalOpen
  }
  onRequestClose = {
    closeModal
  }
  style = {
    customStyles
  }
  shouldCloseOnOverlayClick = {
    false
  } >
  <div className = "val1" >
  <div style = {
    {
      display: "flex",
      alignItems: "right",
      justifyContent: "space-between",
    }
  } >
  <h1 style = {
    {
      fontSize: "36px"
    }
  } > {
    modals.title
  } </h1> 
  <button style = {
    {
      backgroundColor: "transparent",
      border: "none",
      fontSize: "28px",
      color: "white",
      cursor: "pointer",
    }
  }
  onClick = {
    closeModal
  } > ✕
  </button> </div > <h3 style = {
    {
      marginTop: "15px"
    }
  } > Description </h3> <div className = "hash-divider" > </div> <div style = {
    {
      width: "1000px",
      maxHeight: "130px",
      overflowY: "auto",
    }
  } > {
    modals.fullDescription && ( <p style = {
        {
          marginTop: "2px",
          marginBottom: "2px",
          lineHeight: "30px",
          color: "#d6d6d6",
          fontSize: "19px",
          letterSpacing: "1px",
        }
      } > {
        modals.fullDescription
      } </p>
    )
  } </div> <div className = "hash-divider" > </div> <div style = {
    {
      height: "10px"
    }
  } > </div> <
  h1 style = {
    {
      textAlign: "center",
      marginTop: "2%",
      marginBottom: "2%",
    }
  } >
  Exclusive Rewards!!
  </h1> <div className = "titles">
  <div className = "column" > 10 to 25 % </div> 
  <div className = "column" > 25 to 50 % </div> 
  <div className = "column" > More than 50 % </div> </div> <
  div className = "titles" >
  <div style = {
    {
      textAlign: "center",
      color: "#d6d6d6"
    }
  } >
  <img src = {
    `https://plum-neat-snake-634.mypinata.cloud/ipfs/${modals.img1}?pinataGatewayToken=2lJKUgK4Ex-LacR8LOhqVMVjJp70nVqVTLBH5CORj8N-PQANpTDxEvByuf0nIq2J`
  }
  style = {
    {
      width: "170px",
      height: "170px"
    }
  }
  /> </div> 
  <div style = {
    {
      textAlign: "center",
      color: "#d6d6d6"
    }
  } >
  <img src = {
    `https://plum-neat-snake-634.mypinata.cloud/ipfs/${modals.img2}?pinataGatewayToken=2lJKUgK4Ex-LacR8LOhqVMVjJp70nVqVTLBH5CORj8N-PQANpTDxEvByuf0nIq2J`
  }
  style = {
    {
      width: "170px",
      height: "170px"
    }
  }/> </div> 
  <div style = {
    {
      textAlign: "center",
      color: "#d6d6d6"
    }
  } >
  <img src = {
    `https://plum-neat-snake-634.mypinata.cloud/ipfs/${modals.img3}?pinataGatewayToken=2lJKUgK4Ex-LacR8LOhqVMVjJp70nVqVTLBH5CORj8N-PQANpTDxEvByuf0nIq2J`
  }
  style = {
    {
      width: "170px",
      height: "170px"
    }
  }/> 
  </div> 
  </div> 
  </div> 
  </Modal>

  
   <Modal isOpen = {
    isDialogOpen
  }
  onRequestClose = {
    closeDialog
  }
  style = {
    customStyles
  }
  shouldCloseOnOverlayClick = {
    false
  } >
  <div className = "data-collection-box" >
  <h1 style = {
    {
      textAlign: "center",
      marginBottom: "13px"
    }
  } >
  Create Project </h1> 
  <IconButton disableRipple edge = "end"
  color = "inherit"
  onClick = {
    closeDialog
  }
  style = {
    {
      position: "absolute",
      top: "0px",
      right: "-30px",
      background: "transparent",
      color: "#a9a9a9",
    }
  } >
  <CloseIcon fontSize = "large"
  fontWeight = "300" / >
  </IconButton> 
  <h3 style = {
    {
      marginTop: "15px"
    }
  } > Project Data </h3> 
  <div className = "hash-divider" > </div> 
  <div style = {
    {
      display: "grid",
      gridTemplateColumns: "repeat(4, 190px)",
      justifyContent: "start",
      gap: "70px",
    }
  } >
  <div>
  <label htmlFor = "image1URI" > Title: </label> <
  input type = "text"
  name = "image1URI"
  placeholder = "Title"
  className = "title"
  style = {
    {
      marginTop: "10px"
    }
  }
  /> </div > <div >
  <label htmlFor = "image1URI" > Value: </label> <
  input type = "text"
  name = "image1URI"
  placeholder = "Value"
  className = "value"
  style = {
    {
      marginTop: "10px"
    }
  }
  /> </div > <div>
  <label htmlFor = "image1URI" > Minimum Contribution: </label> <
  input type = "text"
  name = "image1URI"
  placeholder = "Minimum Contribution"
  className = "min"
  style = {
    {
      marginTop: "10px"
    }
  }
  /> </div > <div>
  <label htmlFor = "image1URI" > Recipient Address </label> <
  input type = "text"
  name = "image1URI"
  placeholder = "Recipient Address"
  className = "res-add"
  style = {
    {
      marginTop: "10px"
    }
  }
  /> </div > </div> 
  <h3 style = {
    {
      marginTop: "15px"
    }
  } > Image Data </h3> 
  <div className = "hash-divider" > </div> <div style = {
    {
      display: "grid",
      gridTemplateColumns: "repeat(4, 190px)",
      justifyContent: "start",
      gap: "70px",
    }
  } >
  <div>
  <label htmlFor = "image1URI" > Image 1 CID: </label> <
  input type = "text"
  name = "image1URI"
  placeholder = "Image-1 CID"
  className = "inp-1"
  style = {
    {
      marginTop: "10px"
    }
  }
  /> </div > <div>
  <label htmlFor = "image2URI" > Image 2 CID: </label> <
  input type = "text"
  name = "image2URI"
  placeholder = "Image-2 CID"
  className = "inp-2"
  style = {
    {
      marginTop: "10px"
    }
  }
  /> </div >
   <div>
  <label htmlFor = "image3URI" > Image 3 CID: </label> <
  input type = "text"
  name = "image3URI"
  placeholder = "Image-3 CID"
  className = "inp-3"
  style = {
    {
      marginTop: "10px"
    }
  }
  /> </div > </div> 
  <h3 style = {
  {
      marginTop: "15px"
    }
  } > Description </h3> <div className = "hash-divider" > </div> 
  <div style = {
    {
      display: "flex",
      justifyContent: "start",
      gap: "40px",
    }
  } >
  <div style = {
    {
      display: "flex",
      flexDirection: "column"
    }
  } >
  <label htmlFor = "smallDescription" > Basic Description: </label> <
  TextField className = "small-des"
  id = "standard-multiline-static"
  multiline rows = {
    2
  }
  value = {
    smallDes
  }
  onChange = {
    handleInputChange
  }
  placeholder = "Enter a two line description  of your Project"
  InputProps = {
    {
      style: {
        color: "#a9a9a9",
        backgroundColor: "#323232",
        borderRadius: "10px",
        marginBottom: "12px",
        marginTop: "10px",
      },
    }
  }
  style = {
    {
      width: "400px"
    }
  }
  /> </div > 
  <div style = {
    {
      display: "flex",
      flexDirection: "column"
    }
  } >
  <label htmlFor = "fullDescription" > Full Description: </label> <
  TextField className = "full-des"
  id = "standard-multiline-static"
  multiline rows = {
    2
  }
  value = {
    fullDes
  }
  onChange = {
    handleInputChange1
  }
  placeholder = "Enter Full description  of your Project"
  InputProps = {
    {
      style: {
        color: "#a9a9a9",
        backgroundColor: "#323232",
        borderRadius: "10px",
        marginBottom: "12px",
        marginTop: "10px",
      },
    }
  }
  style = {
    {
      width: "400px"
    }
  }
  /> </div > 
  <div style = {
    {
      width: "330px"
    }
  } > </div> 
  </div > 
  <button onClick = {
    createProject
  } > Submit </button> 
  </div > 
  </Modal> 
  
  
  <Modal isOpen = {
    isPaymentDialogOpen
  }
  onRequestClose = {
    closePaymentDialog
  }
  style = {
    customStyles
  }
  shouldCloseOnOverlayClick = {
    false
  } >
  <div className = "data-collection-box-1" >
  <h1 style = {
    {
      textAlign: "center",
      marginBottom: "13px"
    }
  } >
  Payment </h1> <IconButton disableRipple edge = "end"
  color = "inherit"
  onClick = {
    closePaymentDialog
  }
  style = {
    {
      position: "absolute",
      top: "9px",
      right: "-30px",
      background: "transparent",
      color: "#a9a9a9",
    }
  } >
  <CloseIcon fontSize = "large"
  fontWeight = "300" / >
  </IconButton> <label style = {
    {
      marginTop: "20px"
    }
  } > Name: </label> <
  input type = "text"
  name = "image1URI"
  placeholder = "Name"
  className = "ContributorName"
  style = {
    {
      marginTop: "1px"
    }
  }
  /> <label style = {
    {
      marginTop: "20px"
    }
  } > Value: </label> <
  input type = "text"
  name = "image1URI"
  placeholder = "Value"
  className = "Contribution"
  style = {
    {
      marginTop: "1px"
    }
  }
  /> {
    loading ? ( <h5 style = {
        {
          fontSize: "20px",
          textAlign: "center"
        }
      } >
      Minting Token...
      </h5>
    ) : transactionHash ? ( <>
      <h5 style = {
        {
          fontSize: "20px",
          color: "#5aa75a",
          fontFamily: "arial",
          textAlign: "center",
        }
      } > {
        currToken
      } </h5> </>
    ) : ( <button className = "button"
      onClick = {
        () => contribute(buttonind)
      } >
      Fund Now </button>
    )
  } {
    transactionHash && ( <p style = {
        {
          textAlign: "center"
        }
      } >
      <a href = {
        `https://sepolia.etherscan.io/tx/${transactionHash}`
      }
      target = "_blank"
      rel = "noopener noreferrer"
      style = {
        {
          color: "grey",
          fontFamily: "monospace"
        }
      } >
      view on etherscan </a> </p >
    )
  } </div> </Modal > </div> 
  
  <Slider {
    ...settings
  } > {
    slideData.map((slide) => ( <div key = {
        slide.id
      } >
      <
      img src = {
        slide.imageUrl
      }
      alt = {
        slide.alt
      }
      style = {
        {
          width: "100%",
          height: "90vh"
        }
      }
      /> </div >
    ))
  } </Slider> </div >
  <div className = "container-2" >
  <div className = "content" >
  <h1 className = "tit" > {
    " "
  }
  Create a <span style = {
    {
      color: "#00A9FF"
    }
  } > Project </span> and Bring </h1 > <h1 className = "tit-1" > {
    " "
  }
  Your Ideas to < span style = {
    {
      color: "#00A9FF"
    }
  } > Life! </span> </h1 > <
  TypingEffect text = {
    paragraphText
  }
  speed = {
    30
  }
  /> <
  button className = "create-button"
  onClick = {
    openDialog
  } >
  Create a Project </button> </div> 
  <img src = {
    create
  }
  style = {
    {
      height: "550px"
    }
  } /> </div > 
  
  
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
  <div className = "container-1" >
  <div className = "left-side-1" >
  <h1 style = {
    {
      textAlign: "center",
      marginBottom: "2%",
      fontSize: "60px",
    }
  } >
  Projects </h1> <div > {
    roundSpin && ( <
      SpinnerCircular style = {
        {
          color: "#009deb",
          marginTop: "15%",
          marginLeft: "42%",
        }
      }
      size = {
        150
      }
      />
    )
  } </div> {
    hasFinished ? ( <div className = "card-1" > {
        items.map((item, index) => ( <div key = {
            index
          }
          className = "val" >
          <div style = {
            {
              display: "flex",
              alignItems: "right",
              justifyContent: "space-between",
            }
          } >
          <h3 style = {
            {
              fontSize: "40px"
            }
          } > {
            item.title
          } </h3> <h5 className = "complete-status"
          style = {
            {
              marginTop: "15px",
              fontSize: "20px",
              color: item.isCompleted === true ? "#70e000" : "#fdc500",
            }
          } > {
            item.isCompleted === true ?
            "✔Completed" : "Open for Funding..."
          } </h5> </div > <h3 style = {
            {
              marginTop: "15px"
            }
          } > Description </h3> <div className = "hash-divider" > </div> <div style = {
            {
              width: "1000px"
            }
          } > {
            item.smallDescription && ( <
              p style = {
                {
                  marginTop: "2px",
                  marginBottom: "2px",
                  lineHeight: "30px",
                  color: "#d6d6d6",
                  fontSize: "19px",
                  letterSpacing: "1px",
                }
              } > {
                item.smallDescription
              } &nbsp; <a onClick = {
                () => openModal(items[index])
              }
              style = {
                {
                  marginTop: "0",
                  marginBottom: "0",
                  lineHeight: "0",
                  color: "white",
                  fontSize: "19px",
                  letterSpacing: "0",
                  cursor: "pointer",
                  textDecoration: "underline",
                }
              } >
              see details </a> </p >
            )
          } </div> <div className = "hash-divider" > </div> <div className = "titles" >
          <div className = "column" > Value </div> <div className = "column" > Collected Value </div>
           <div className = "column" > Minimum Contribution </div> 
           </div > <div className = "titles" >
          <div style = {
            {
              textAlign: "center",
              color: "#d6d6d6"
            }
          } > {
            item.value
          } </div> <div style = {
            {
              textAlign: "center",
              color: "#d6d6d6"
            }
          } > {
            item.collectedValue
          } </div>
          <div style = {
            {
              textAlign: "center",
              color: "#d6d6d6"
            }
          } > {
            item.minimumContribution
          } </div> </div > <div className = "hash-divider" > </div> <div style = {
            {
              display: "flex"
            }
          } >
          <h4 style = {
            {
              marginTop: "2%"
            }
          } >
          Recipient Address < span > &nbsp; &nbsp; &nbsp; &nbsp; </span>: </h4 > <
          p style = {
            {
              marginTop: "2%",
              fontSize: "17.5px",
              color: "#d6d6d6",
            }
          } >
          &nbsp; &nbsp; {
            item.recipient
          } </p> </div > <div style = {
            {
              display: "flex"
            }
          } >
          <h4 style = {
            {
              marginTop: "2%"
            }
          } >
          Contributors Count < span > &nbsp; </span>:{" "} </h4 > <
          p style = {
            {
              marginTop: "2%",
              fontSize: "17.5px",
              color: "#d6d6d6",
            }
          } >
          &nbsp; &nbsp; {
            item.contributorsCount
          } </p> </div > {
            item.isCompleted ? (
              ""
            ) : ( <button className = "fund-button"
              onClick = {
                () => openPaymentDialog(items[index])
              } >
              Fund this Project </button>
            )
          } </div>
        ))
      } </div>
    ) : (
      ""
    )
  } </div> </div > 
  
  </>
);
}