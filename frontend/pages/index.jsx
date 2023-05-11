import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { ethers, Contract, providers } from "ethers";
import { Crypto_DEVS_DAO_CONTRACT_ADDRESS, Crypto_Devs_NFT_CONTRACT_ADDRESS, DAO_CONTRACT_ABI, NFT_CONTRACT_ABI } from "../constants/index"
import { formatEther } from "ethers/lib/utils";

export default function Home() {
  const [proposals, setProposals] = useState([]);
  const [fakeNFTtokenId, setFakeNFTtokenId] = useState("0");
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [numProposalsinDAO, setNumProposalsinDAO] = useState("0");
  const [userNFTBalance, setUserNFTBalance] = useState(0);
  const [treasuryBalance, setTreasuryBalance] = useState("0");
  const [walletConnect, setWalletConnect] = useState(false);
  const web3ModalRef = useRef();

  const fetchProposalById = async (id) => {
    try {
      const provider = await getProviderOrSigner();
      const daoContract = getDaoContractInstance(provider);
      const proposal = await daoContract.proposals(id);
      const ParsedProposal = {
        proposalId: id,
        nftTokenId: proposal.nftTokenId.toString(),
        deadline: new Date(parseInt(proposal.deadline.toString()) * 1000),
        yesVotes: proposal.yesVotes.toString(),
        noVotes: proposal.noVotes.toString(),
        executed: proposal.executed,
      }
      return ParsedProposal;
    } catch (err) {
      console.error(err);
    }
  }
  const fetchAllProposal = async () => {
    try {
      const proposals = [];
      for (let i = 0; i < numProposalsinDAO; i++) {
        const proposal = fetchProposalById(i);
        proposals.push(proposal);
      }
      setProposals(proposals);
      return proposals;
    } catch (err) {
      console.error(err);
    }
  }
  const getDaoContractInstance = (providerOrSigner) => {
    return new Contract(
      Crypto_DEVS_DAO_CONTRACT_ADDRESS,
      DAO_CONTRACT_ABI,
      providerOrSigner
    );
  }

  const getNftContractInstance = (providerOrSigner) => {
    return new Contract(
      Crypto_Devs_NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      providerOrSigner
    );
  }

  const getDAOOwner = async () => {
    try {
      const signer = await getProviderOrSigner();
      const daoContract = getDaoContractInstance(signer);
      const owner_address = await daoContract.owner();
      if (owner_address === signer.getAddress()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const getNumOfProposalsInDAO = async () => {
    try {
      const provider = await getProviderOrSigner();
      const daoContract = getDaoContractInstance(provider);
      const numProposals = daoContract.numProposals();
      setNumProposalsinDAO(numProposals.toString());
    } catch (err) {
      console.error(err);
    }
  }
  const getUserNFTBalance = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = getNftContractInstance(signer);
      const address = await signer.getAddress();
      const balance = await nftContract.balanceOf(address);
      setUserNFTBalance(parseInt(balance.toString()));
    } catch (err) {
      console.error(err);
    }
  }
  const getDAOTreasuryBalance = async () => {
    try {
      const provider = await getProviderOrSigner();
      const balance = await provider.getBalance(
        Crypto_DEVS_DAO_CONTRACT_ADDRESS
      );
      setTreasuryBalance(balance.toString());
    } catch (err) {
      console.error(err);
    }

  }

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnect(true);
    } catch (err) {
      console.error(err);
    }
  }

  const getProviderOrSigner = async (needSigner = false) => {
    try {
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);

      const { chainId } = await web3Provider.getNetwork();
      if (chainId != 11155111) {
        window.alert("Change network to Sepolia");
        throw new Error("Change network to Sepolia");
      }
      if (needSigner) {
        const signer = await web3Provider.getSigner();
        return signer;
      }
      return web3Provider;

    } catch (err) {
      console.error(err);
    }
  }
  useEffect(() => {
    if (!walletConnect) {
      web3ModalRef.current = new Web3Modal({
        network: "sepolia",
        providerOptions: {},
        disableInjectedProvider: false
      })
      connectWallet().then(() => {
        getDAOTreasuryBalance();
        getUserNFTBalance();
        getNumOfProposalsInDAO();
        getDAOOwner();
      });
    }
  }, [walletConnect]);

  useEffect(() => {
    if (selectedTab == "View Proposal") {
      fetchAllProposal();
    }
  }, [selectedTab]);



  const renderTabs = () => {
    if (selectedTab === "Create Proposal") {
      return renderCreateProposalTab();
    }
    else if (selectedTab === "View Proposal") {
      return renderViewProposalTab();
    }
    return null;
  }

  const createProposal = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const daoContract = getDaoContractInstance(signer);
      const tx = await daoContract.createProposal(fakeNFTtokenId);
      setLoading(true);
      await tx.wait();
      await getNumOfProposalsInDAO();
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  }
  const renderCreateProposalTab = () => {
    if (loading) {
      return (
        <div className={styles.description}>
          Loading...Wating for Transaction..
        </div>
      )
    }
    else if (userNFTBalance == 0) {
      return (
        <div className={styles.description}>
          You Don't own any CryptoDevs NFT <br />
          <b>You Can not Create Or vote on a Proposal</b>
        </div>
      );
    }
    else {
      return (
        <div className={styles.container}>
          <label>Fake NFT TokenId to Purchase : </label>
          <input type="number" placeholder="0" onChange={(e) => setFakeNFTtokenId(e.target.value)} />
          <button className={styles.button} onClick={createProposal}>Create</button>
        </div>
      );
    }
  }
  const voteOnProposal = async (proposalId, _vote) => {
    try {
      const signer = await getProviderOrSigner(true);
      const daoContract = getDaoContractInstance(signer);
      let vote = _vote === "Yes" ? 0 : 1;
      const tx = await daoContract.voteOnProposal(proposalId, vote);
      setLoading(true);
      await tx.wait();
      setLoading(false);
      await fetchAllProposal();
    } catch (err) {
      console.error(err);
    }
  }

  const executeProposal = async (proposalId) => {
    try {
      const signer = getProviderOrSigner(true);
      const daoContract = getDaoContractInstance(signer);
      const tx = await daoContract.executeProposal(proposalId);
      setLoading(true);
      await tx.wait();
      setLoading(false);
      await fetchAllProposal();
      getDAOTreasuryBalance();
    } catch (err) {
      console.error(err);
    }
  }
  const renderViewProposalTab = async () => {
    if (loading) {
      return (
        <div className={styles.description}>
          Loading...Wating For the transaction..
        </div>
      );
    }
    else if (proposals.length === 0) {
      return (
        <div className={styles.description}>
          No Proposals have been created
        </div>
      );
    }
    else {
      return (
        <div>
          {proposals.map((p, index) => (
            <div key={index} className={styles.propsalCard}>
              <p>Proposal ID: {p.prposalId}</p>
              <p>Fake NFT to Purchase: {p.nftTokenId}</p>
              <p>Deadline: {p.deadline.toString()}</p>
              <p>Yes Votes: {p.yesVotes}</p>
              <p>No Votes: {p.noVotes}</p>
              <p>Executed?: {p.executed.toString()}</p>
              {p.deadline.getTime() > Date.now() && !p.executed ? (
                <div className={styles.flex}>
                  <button className={styles.button2} onClick={() => voteOnProposal(p.proposalId, "Yes")}>Votes YES!</button>
                  <button className={styles.button2} onClick={() => voteOnProposal(p.proposalId, "No")}>Vote No!</button>
                </div>
              ) : p.deadline.getTime() < Date.now() && !p.executed ? (
                <div className={styles.flex}>
                  <button
                    className={styles.button2}
                    onClick={() => executeProposal(p.propsalId)}
                  >
                    Execute Proposal{p.yesVotes > p.noVotes ? "Yes" : "No"}
                  </button>
                </div>
              ) : (
                <div className={styles.description}>
                  Proposal Executed!
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }
  }

  const withdrawDAOEth = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = getDaoContractInstance(signer);
      const tx = await contract.withdrawEther();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      getDAOTreasuryBalance();
    } catch (err) {
      console.error(err);
      window.alert(err.reason);
    }
  }
  return (
    <>
      <div className={styles.container}>
        <Head>
          <title>Crypto Devs DAO</title>
          <meta name="description" content="Crypto Devs DAO" />
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
              <button className={styles.button} onClick={() => setSelectedTab("Create Proposal")}>Create Proposal</button>
              <button className={styles.button} onClick={() => setSelectedTab("View Proposal")}>View Proposal</button>
            </div>
          </div>
          {renderTabs()}
          {isOwner ? (
            <div>
              loading ? <button className={styles.button}>Loading...</button>
              : <button className={styles.button} onClick={withdrawDAOEth}>Withdraw DAO Eth</button>
            </div>
          ) : ("")}
        </div>
        <div>
          <img className={styles.image} src="/cryptodevs/0.svg"/>
        </div>
        <footer className={styles.footer}>
          Made with &#10084; by Crypto Devs
        </footer>
      </div>
    </>
  );
}
