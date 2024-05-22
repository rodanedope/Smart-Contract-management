import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  useEffect(() => {
    const initWallet = async () => {
      if (window.ethereum) {
        setEthWallet(window.ethereum);
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        handleAccount(accounts);
      }
    };
    initWallet();
  }, []);

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      initializeATM();
    } else {
      setAccount(undefined);
    }
  };

  const initializeATM = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
    setATM(atmContract);
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    try {
      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      handleAccount(accounts);
    } catch (error) {
      console.error("Error connecting account:", error);
    }
  };

  const getBalance = async () => {
    if (atm) {
      const balance = await atm.getBalance();
      setBalance(ethers.utils.formatEther(balance));
    }
  };

  const deposit = async () => {
    if (atm) {
      try {
        const tx = await atm.deposit(ethers.utils.parseEther(depositAmount));
        await tx.wait();
        getBalance();
        setDepositAmount(""); // Clear input field after deposit
      } catch (error) {
        console.error("Error depositing:", error);
      }
    }
  };

  const withdraw = async () => {
    if (atm) {
      try {
        const tx = await atm.withdraw(ethers.utils.parseEther(withdrawAmount));
        await tx.wait();
        getBalance();
        setWithdrawAmount(""); // Clear input field after withdraw
      } catch (error) {
        console.error("Error withdrawing:", error);
      }
    }
  };

  const addDepositValue = () => {
    setDepositAmount((parseFloat(depositAmount || "0") + 1).toString());
  };

  const reduceDepositValue = () => {
    setDepositAmount((parseFloat(depositAmount || "0") - 1).toString());
  };

  const addWithdrawValue = () => {
    setWithdrawAmount((parseFloat(withdrawAmount || "0") + 1).toString());
  };

  const reduceWithdrawValue = () => {
    setWithdrawAmount((parseFloat(withdrawAmount || "0") - 1).toString());
  };

  const renderContent = () => {
    if (!ethWallet) {
      return <p>Please install MetaMask to use this ATM.</p>;
    }

    if (!account) {
      return <button style={styles.button} onClick={connectAccount}>Connect to MetaMask</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div style={styles.accountInfo}>
        <p>Account: {account}</p>
        <p>Balance: {balance} ETH</p>
        <div style={styles.transaction}>
          <input
            type="text"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="Enter deposit amount in ETH"
            style={styles.input}
          />
          <button style={styles.button} onClick={deposit}>Deposit</button>
          <button style={styles.button} onClick={addDepositValue}>Add Value</button>
          <button style={styles.button} onClick={reduceDepositValue}>Reduce Value</button>
        </div>
        <div style={styles.transaction}>
          <input
            type="text"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Enter withdraw amount in ETH"
            style={styles.input}
          />
          <button style={styles.button} onClick={withdraw}>Withdraw</button>
          <button style={styles.button} onClick={addWithdrawValue}>Add Value</button>
          <button style={styles.button} onClick={reduceWithdrawValue}>Reduce Value</button>
        </div>
      </div>
    );
  };

  return (
    <main style={styles.container}>
      <header>
        <h1>MetaMask ATM</h1>
      </header>
      {renderContent()}
    </main>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    margin: '10px 5px',
    cursor: 'pointer',
    borderRadius: '5px',
    transition: 'background-color 0.3s ease',
  },
  accountInfo: {
    marginTop: '20px',
  },
  transaction: {
    marginTop: '15px',
  },
  input: {
    padding: '10px',
    margin: '10px 5px',
    width: 'calc(100% - 24px)',
    boxSizing: 'border-box',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
};
