'use client'

import React, { useState, useEffect } from "react";
import Web3 from "web3";
import RatingUpdateContractABI from "./contracts/RatingUpdate.json";
import "./App.css";

// コントラクトアドレスを定数として設定（適切な値に置き換えてください）
const RATING_UPDATE_CONTRACT_ADDRESS = "0x1Bc3a68B365e58369B0a8F8b74EfAB82Fd19070d";
const NPC_ADDRESS = "0xFEc125680918182BC8A9AF242145350074F0F951";


export default function Home() {
  const [userChoice, setUserChoice] = useState(null);
  const [cpuChoice, setCpuChoice] = useState(null);
  const [result, setResult] = useState("");
  const [connected, setConnected] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [ratingUpdateContract, setRatingUpdateContract] = useState(null);
  const [cpuAddress, setCpuAddress] = useState("");

  const choices = ["Rock", "Scissors", "Paper"];

  useEffect(() => {
    setCpuAddress( NPC_ADDRESS)

    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);

      const contractInstance = new window.web3.eth.Contract(
          RatingUpdateContractABI,
          RATING_UPDATE_CONTRACT_ADDRESS
      );
      setRatingUpdateContract(contractInstance);
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      // Web3やMetaMaskが無い場合はアラートを表示
      window.alert("Ethereumブラウザのインストールを検討してください。MetaMaskを試してください!");
    }
  }, []);

  const updateRating = async (winner, loser) => {
    if (ratingUpdateContract) {
      try {

        console.log( "winner :" , winner );
        console.log( "loser : " , loser );
        await ratingUpdateContract.methods
            .updateRatingValue(winner, loser)
            .send({ from: accounts[0] });
      } catch (err) {
        console.error("エラーが発生しました:", err);
      }
    }
  };


  const handleClick = (choice) => {
    setUserChoice(choice);
    const randomIndex = Math.floor(Math.random() * choices.length);
    const cpuChoice = choices[randomIndex];
    setCpuChoice(cpuChoice);
    determineWinner(choice, cpuChoice);
  };

  const determineWinner = (userChoice, cpuChoice) => {
    let winnerAddr = null;
    let loserAddr = null;

    if (userChoice === cpuChoice) {
      setResult("even");
    } else if (
        (userChoice === "Rock" && cpuChoice === "Scissors") ||
        (userChoice === "Scissors" && cpuChoice === "Paper") ||
        (userChoice === "Paper" && cpuChoice === "Rock")
    ) {
      setResult("Win");
      winnerAddr = accounts[0]
      loserAddr = cpuAddress;
    } else {
      setResult("Lose");
      winnerAddr = cpuAddress
      loserAddr = accounts[0]
    }

    // 勝者が決まった場合、勝敗結果をスマートコントラクトに書き込む
    if (winnerAddr && loserAddr) {
      updateRating(winnerAddr, loserAddr);
    }
  };

  const connectWallet = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccounts(accounts);
    setConnected(true);
  };

  const getImageFilename = (choice) => {
    switch (choice) {
      case "Rock":
        return "sushimaster256goo.png";
      case "Scissors":
        return "sushimaster256choki.png";
      case "Paper":
        return "sushimaster256paaa.png";
      default:
        return "";
    }
  }

  const getImageFilenameEnemy = (choice) => {
    switch (choice) {
      case "Rock":
        return "enemy_sushimaster256_goo.png";
      case "Scissors":
        return "enemy_sushimaster256_choki.png";
      case "Paper":
        return "enemy_sushimaster256_paaaa.png";
      default:
        return "";
    }
  }
  return (
      <div className="App">
        <h1>Rock Paper Scissors Game</h1>
        {connected ? (
            <p>Connected account: {accounts[0]}</p>
        ) : (
            <button onClick={connectWallet}>Connect Wallet</button>
        )}

        <div>
          <label>
            CPU Address:
            <input
                type="text"
                value={cpuAddress}
                disabled={true}
            />
          </label>
        </div>

        <div>
          {choices.map((choice) => (
              <button key={choice} onClick={() => handleClick(choice)}>
                {choice}
              </button>
          ))}
        </div>
        <div className="gameArea">
          <div className="playerChoice">
            <h2>Your choice: {userChoice}</h2>
            {userChoice && (
                <img src={getImageFilename(userChoice)} alt={userChoice} />
            )}
          </div>
          <div className="versus">
            <h2>VS</h2>
          </div>
          <div className="cpuChoice">
            <h2>CPU's choice: {cpuChoice}</h2>
            {cpuChoice && (
                <img src={getImageFilenameEnemy(cpuChoice)} alt={cpuChoice} />
            )}
          </div>
        </div>
        <div className="resultArea">
          <h2>Result: {result}</h2>
        </div>
      </div>
  );
}
