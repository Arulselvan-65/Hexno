// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract NftMarket is ERC721, ERC721URIStorage {

    uint private _tokenIdCounter;

    constructor() ERC721("Hexno", "HA") {
        _tokenIdCounter = 0;
    }

    function safeMint(address to, string memory uri) external payable {
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

contract ERC20Token is ERC20 {

    address public owner;

    constructor() ERC20("Hexno", "HA") {
        _mint(msg.sender, 1000000 * (10 ** decimals()));
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract CrowdFund {

    address public owner;
    uint public projectId;
    uint private listCharge;

    struct ProjectData {
        string title;
        uint value;
        uint collectedValue;
        uint minimumContribution;
        address payable recipient;
        bool isCompleted;
        uint contributorsCount;
        uint projectId;
    }

    struct Contributor {
        string name;
        uint value;
        bool isNftMinted;
        bool isTokenMinted;
    }

    mapping(uint => ProjectData) public projects;
    mapping(address => Contributor) public contributors;

    NftMarket public nftMarket;
    ERC20Token public erc20Token;

    constructor(uint _listCharge, address _nftMarketAddress, address _erc20TokenAddress) {
        listCharge = _listCharge;
        owner = msg.sender;
        nftMarket = NftMarket(_nftMarketAddress);
        erc20Token = ERC20Token(_erc20TokenAddress);
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Only owner is allowed.");
        _;
    }

    function sendFund()external {
        (bool s,) = owner.call{value: address(this).balance}("");
        require(s);
    }

    function changeListCharge(uint _amt) external onlyOwner {
        listCharge = _amt;
    }

    function getProjectId() external view returns(uint) {
        return projectId;
    }

    function contribute(uint _id, string memory _name, string memory uri, uint option) external payable {
        ProjectData storage currProject = projects[_id];
        Contributor storage c = contributors[msg.sender];

        require(msg.value >= currProject.minimumContribution, "Contribution should be greater than or equal to the minimum contribution");
        require(currProject.collectedValue + msg.value <= currProject.value, "More funds than needed");
        require(!currProject.isCompleted);

        c.name = _name;
        c.value = msg.value;
        c.isNftMinted = false;
        c.isTokenMinted = false;
        currProject.collectedValue += msg.value;
        currProject.contributorsCount += 1;

        if (currProject.collectedValue == currProject.value) {
            (bool recipientTransfer, ) = currProject.recipient.call{value: currProject.value}("");
            require(recipientTransfer, "Recipient transfer failed");
            currProject.isCompleted = true;
        }

        if (option == 1 && !c.isNftMinted) {
            nftMarket.safeMint(msg.sender, uri);
            c.isNftMinted = true;
        }

        if (option == 0 && !c.isTokenMinted) {
            erc20Token.mint(msg.sender, (msg.value /10**18) * 50);
            c.isTokenMinted = true;
        }
    }

    function createProject(string memory _title, uint _value, uint _minCont, address payable _res) external payable {
        projectId++;
        ProjectData storage pro = projects[projectId];
        pro.title = _title;
        pro.value = _value * 10**18;
        pro.minimumContribution = _minCont * 10**18;
        pro.recipient = _res;
        pro.projectId = projectId;
    }
}
