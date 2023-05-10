import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import {ethers, Contract, providers} from "ethers";
import {Crypto_DEVS_DAO_CONTRACT_ADDRESS,Crypto_Devs_NFT_CONTRACT_ADDRESS,DAO_CONTRACT_ABI,NFT_CONTRACT_ABI} from "../constants/index"
import { formatEther } from "ethers/lib/utils";

export default function Home() {
  const [selectedTab, setSelectedTab] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [numProposalsinDAO, setNumProposalsinDAO] = useState("0");
  const [userNFTBalance, setUserNFTBalance] = useState(0);
  const [treasuryBalance, setTreasuryBalance] = useState("0");
  const [walletConnect, setWalletConnect] = useState(false);
  const web3ModalRef = useRef();

  const getDaoContractInstance = (providerOrSigner)=>{
    return new Contract(
      Crypto_DEVS_DAO_CONTRACT_ADDRESS,
      DAO_CONTRACT_ABI,
      providerOrSigner
    );
  }

  const getNftContractInstance=(providerOrSigner)=>{
    return new Contract(
      Crypto_Devs_NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      providerOrSigner
    );
  }

  const getDAOOwner = async()=>{
    try{
      const signer = await getProviderOrSigner();
      const daoContract = getDaoContractInstance(signer);
      const owner_address = await daoContract.owner();
      if(owner_address === signer.getAddress()){
        setIsOwner(true);
      }
    }catch(err){
      console.error(err);
    } 
  }

  const getNumOfProposalsInDAO = async()=>{
    try{
      const provider = await getProviderOrSigner();
      const daoContract = getDaoContractInstance(provider);
      const numProposals = daoContract.numProposals();
      setNumProposalsinDAO(numProposals.toString());
    }catch(err){
      console.error(err);
    }
  }
  const getUserNFTBalance = async()=>{
    try{
      const signer = await getProviderOrSigner(true);
      const nftContract = getNftContractInstance(signer);
      const address = await signer.getAddress();
      const balance = await nftContract.balanceOf(address);
      setUserNFTBalance(parseInt(balance.toString()));
    }catch(err){
      console.error(err);
    }
  }
  const getDAOTreasuryBalance = async()=>{
    try{
      const provider = await getProviderOrSigner();
      const balance = await provider.getBalance(
        Crypto_DEVS_DAO_CONTRACT_ADDRESS
      );
      setTreasuryBalance(balance.toString());
    }catch(err){
      console.error(err);
    }

  }
  
  const connectWallet = async()=>{
    try{
      await getProviderOrSigner();
      setWalletConnect(true);
    }catch(err){
      console.error(err);
    }
  }

  const getProviderOrSigner = async(needSigner = false)=>{
    try{
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);

      const {chainId} = await web3Provider.getNetwork();
      if(chainId!=11155111){
        window.alert("Change network to Sepolia");
        throw new Error("Change network to Sepolia");
      }
      if(needSigner){
        const signer = await web3Provider.getSigner();
        return signer;
      }
      return web3Provider;

    }catch(err){
      console.error(err);
    }
  }
  useEffect(()=>{
    if(!walletConnect){
      web3ModalRef.current = new Web3Modal({
        network:"sepolia",
        providerOptions:{},
        disableInjectedProvider:false
      }) 
      connectWallet().then(()=>{
        getDAOTreasuryBalance();
        getUserNFTBalance();
        getNumOfProposalsInDAO();
        getDAOOwner();
      });
    }
  },[walletConnect]);

  const renderTabs = ()=>{
    if(selectedTab === "Create Propsal"){
      return renderCreateProposalTab();
    }
    else if(selectedTab === "View Proposal"){
      return renderViewProposalTab();
    }
    return null;
  }
  
  const renderCreateProposalTab = ()=>{
    
  }
  return (
    <>
    <div className={styles.container}>
      <Head>
        <title>Crypto Devs DAO</title>
        <meta name="description" content="Crypto Devs DAO"/>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.tittle}>Welcome To Crypto Devs </h1>
          <div className={styles.description}>Welcome to the DAO!</div>
          <div className={styles.description}>Your CryptoDevs NFT Balance:{userNFTBalance}</div>
          <div className={styles.description}>Treasury Balance : {formatEther(treasuryBalance)} ETH</div>
          <div className={styles.description}>Total Number Of Proposals : {numProposalsinDAO}</div>
          <div className={styles.flex}>
            <button className={styles.button} onClick={()=>setSelectedTab("Create Proposal")}>Create Proposal</button>
            <button className={styles.button} onClick={()=>setSelectedTab("View Proposal")}>View Proposal</button>
          </div>
        </div>
        {renderTabs()}
      </div>
      {/* <div>
        <img className={styles.image} src="/cryptodevs/0.svg" alt="" />
      </div> */}
    </div>
    </>
  );
}
