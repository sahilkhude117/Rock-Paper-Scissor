import { useState } from "react";
import { client } from "../client";
import {ConnectButton, TransactionButton, useActiveAccount, useActiveWallet, useDisconnect, useReadContract} from 'thirdweb/react';
import { inAppWallet } from 'thirdweb/wallets'
import { shortenAddress } from 'thirdweb/utils'
import { getContract } from "thirdweb";
import {baseSepolia} from 'thirdweb/chains';
import {claimTo, getBalance} from 'thirdweb/extensions/erc20';

type Choice = 'Rock' | 'Paper' | 'Scissors';
type Result = 'Win' | 'Lose' | 'Tie';

const choices: Choice[] = ['Rock','Paper','Scissors'];

const getComputerChoice = (): Choice => choices[Math.floor(Math.random() * choices.length)];

const determineWinner = (playerChoice: Choice, computerChoice: Choice): Result => {
    if(playerChoice == computerChoice) return 'Tie';
    if(
        (playerChoice === 'Rock' && computerChoice === 'Scissors') ||
        (playerChoice === 'Paper' && computerChoice === 'Rock') ||
        (playerChoice === 'Scissors' && computerChoice === 'Paper')
    ) {
        return 'Win';
    }
    return 'Lose';
};

interface GameResult {
    playerChoice: Choice;
    computerChoice: Choice;
    gameResult: Result;
}

export default function RockPaperScissors(){
    const account = useActiveAccount();
    const { disconnect } = useDisconnect();
    const wallet = useActiveWallet();

    const contract = getContract({
        client:client,
        chain: baseSepolia,
        address: "0xb0c72Fc956f95287c0fF57549aFdEc0169bd9a8D"
    })

    const [result,setResult] = useState<GameResult | null>(null);
    const [showPrize,setShowPrize] = useState<boolean>(false);
    const [showModal,setShowModel] = useState<boolean>(false);
    const [prizeClaimed,setPrizeClaimed] = useState<boolean>(false);

    const handleChoice = (playerChoice: Choice) => {
        const computerChoice = getComputerChoice();
        const gameResult = determineWinner(playerChoice,computerChoice);
        setResult({ playerChoice, computerChoice, gameResult});
        setShowPrize(gameResult === 'Win');
    };

    const resetGame = () => {
        setResult(null);
        setShowPrize(false);
        setPrizeClaimed(false);
    };

    const claimPrize = () => {
        setShowModel(true);
    };

    const { data: tokenbalance } = useReadContract(
        getBalance,
        {
            contract: contract,
            address: account?.address!
        }
    )
 
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            backgroundColor: '#f0f0f0',
            color: '#333'
        }}>
            <h1 style={{
                fontSize:'1.5rem',
                fontWeight:'bold',
                marginBottom:'2rem',
                textAlign: 'center'
            }}>Mini Game</h1>
            
            {!account ? (
                <ConnectButton 
                client={client}
                accountAbstraction={{
                    chain: baseSepolia,
                    sponsorGas: true
                }}
                wallets={[
                    inAppWallet({
                        auth: {
                            options:[
                                'email',
                            ]
                        }
                    })
                ]}
              />
            ):(
                <>
                    <div style={{
                        display:'flex',
                        flexDirection:'row',
                        height:'auto',
                        width:'100%',
                        gap:'0.5rem',
                        alignItems:'center',
                        justifyContent:'space-between',
                        border:'1px solid #f0f0f0',
                        padding: '0.5rem'
                    }}>
                        <div>
                            <p style={{
                                fontSize: "0.5rem",
                                marginBottom: '-10px',
                                marginTop: '-10px'
                            }}>
                                {shortenAddress(account.address)}
                            </p>
                            <p style={{
                                fontSize: "0.75rem",
                                marginBottom: '-10px',
                            }}>Balance : {tokenbalance?.displayValue}</p>
                            <button 
                               onClick={()=> disconnect(wallet!)}
                               style={{
                                padding: '0.5rem 1rem',
                                background: '#dc3545',
                                color: 'white',
                                border:'none',
                                borderRadius:'4px',
                                cursor:'pointer',
                                fontSize:'0.75rem'
                               }}
                            >Logout</button>
                        </div>
                    </div>
                    if(result){
                        <div style={{ display:'flex',flexDirection:'column',alignItems:'center'}}>
                        <p style={{fontSize:'1.5rem',marginBottom:'-10px'}}>You Chose: {result?.playerChoice}</p>
                        <p style={{fontSize:'1.5rem',marginBottom:'-20px'}}>Comouter Chose: {result?.computerChoice}</p>
                        <p style={{fontWeight:'bold',fontSize:'2rem'}}>Result: {result?.gameResult}</p>

                            <div style={{
                                position:'absolute',
                                bottom:'2rem',
                                display:'flex',
                                flexDirection:'column',
                                gap:'1rem',
                                alignItems:'center'
                            }}>
                                <button
                                    onClick={resetGame}
                                    style={{
                                        padding:'0.5rem 1rem',
                                        background:'#28a745',
                                        color:'white',
                                        border:'none',
                                        borderRadius:'4px',
                                        cursor:'pointer'
                                    }}
                                >
                                    Try Again 
                                </button>
                                {showPrize && !prizeClaimed && (
                                    <button onClick={claimPrize}>
                                        Claim Prize
                                    </button>
                                )}
                                {showModal && (
                                    <div style={{
                                        position:'fixed',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                        display:'flex',
                                        justifyContent:'center',
                                        alignItems:'center'
                                    }}>
                                        <div style={{
                                            background: 'white',
                                            padding: '2rem',
                                            borderRadius: '8px',
                                            maxWidth: ' 300px',
                                            textAlign: 'center'
                                        }}>
                                            <h2 style={{
                                                fontSize:'1.2rem',
                                                marginBottom:'1rem',
                                            }}>
                                                Claim 10 Tokens!
                                            </h2>
                                            <p style={{
                                                marginBottom:'1rem'
                                            }}>
                                                You won and can claim 10 tokens to your wallet
                                            </p>

                                            <TransactionButton 
                                                transaction={() => claimTo({
                                                    contract: contract,
                                                    to: account.address,
                                                    quantity:"10"
                                            })}
                                            onTransactionConfirmed={() => {
                                                alert('Prize claimed!')
                                                setShowModel(false)
                                                setPrizeClaimed(true)
                                            }}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: '#28a745',
                                                color:'white',
                                                border:'none',
                                                borderRadius:'4px',
                                                cursor:'pointer'
                                            }}>
                                                Claim Prize
                                            </TransactionButton>

                                        </div>

                                    </div>
                                )}
                            </div>
                        </div>
                        
                    }else{
                        <div>
                        <h3>Choose Your Option</h3>
                        <div style={{display:'flex',justifyContent:'center',gap:'0.5rem',margin:'2rem'}}>
                            {choices.map((choice) => (
                                <button
                                    key = {choice}
                                    onClick={() => handleChoice(choice)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: '#007bff',
                                        color:'white',
                                        border:'none',
                                        borderRadius:'4px',
                                        cursor:'pointer',
                                        fontSize:'3rem'
                                    }}
                                >
                                    choice === 'Rock' ? '🪨';
                                    choice === 'Paper'? '🗞️';
                                    ✂️
                                </button>
                            ))}
                                
                        </div>
                    </div>
                    }
                </>
            )}
            
            
        </div>
    )
}
