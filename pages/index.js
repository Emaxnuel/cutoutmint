import { useEffect, useState } from "react";
import axios from "axios";
//import Web3Modal from "web3modal";

import {
  nftaddress, nftmarketaddress
} from "../config";

import CutoutNFTFactory from '../abi/CutoutNFTFactory.json';
import CutoutMarket from '../abi/CutoutMarket.json';


import web3 from "web3";
let web3Metamask;
let metamaskAccounts;
let metamaskAccount;

//const ganache = require("ganache-cli");
const Web3 = require("web3");

//const ganacheProvider = new Web3(ganache.providers());

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState('not-loaded');


  
  



  useEffect(()=>{
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
      // We are in the browser and metamask is running.
      window.ethereum.request({ method: "eth_requestAccounts" });
      web3Metamask = new Web3(window.ethereum);
    } else {
      // We are on the server *OR* the user is not running metamask
      const provider = new Web3.providers.HttpProvider(
        "https://rinkeby.infura.io/v3/3be8ee0f25324e1cbcf6e35f00f5b3ce"
      );
      web3Metamask = new Web3(provider);
    }  
  
    //metamaskAccounts = web3Metamask.eth.getAccounts();
    //metamaskAccount = metamaskAccounts[0];
    //console.log("MetamaskAccount", metamaskAccount);
  loadNFTs();

  }, []);

  const loadNFTs = async ()=> {
    
    //@params Este provider lo da Ganache Visual
    //const provider = await new Web3.providers.HttpProvider('HTTP://127.0.0.1:7545');



    const tokenContract = await new web3Metamask.eth.Contract(CutoutNFTFactory.abi, nftaddress);
    const marketContract = await new web3Metamask.eth.Contract(CutoutMarket.abi, nftmarketaddress);
    
    console.log("Metodos", CutoutNFTFactory.abi);
    console.log("Metodos", CutoutMarket.abi);

    const data = await marketContract.methods.fetchMyNFTs().call()

    console.log("Token Contract está en", tokenContract.options.address)
    console.log("Market Contract está en", marketContract.options.address)

    console.log("Esta es la data", data)
    

    const items = await Promise.all(data.map(async i =>{
        const tokenUri = await tokenContract.methods.tokenURI((i.tokenId)).call();
        const meta = await axios.get(tokenUri);
        let price = web3.utils.fromWei(i.price,'ether');

        let item = {
            price,
            tokenId: i.tokenId,
            seller: i.seller,
            owner: i.owner,
            image: meta.data.image,
            name: meta.data.name,
            description: meta.data.description,
        }
        console.log("El item es ",item);

        return item;
  }));
  

    setNfts(items);
    setLoadingState('loaded');

  };

  const buyNft = async (nft)=>{
        //const web3Modal = new Web3Modal();
        //const connection = await web3Modal.connect();
        //let providerMetamask;

          // We are in the browser and metamask is running.
         await window.ethereum.request({ method: "eth_requestAccounts" });
         const providerMetamask = await new Web3(window.ethereum);


        metamaskAccounts = await providerMetamask.eth.getAccounts();
        metamaskAccount = metamaskAccounts[0];
        
        const marketContract = await new providerMetamask.eth.Contract(CutoutMarket.abi, nftmarketaddress);

        const price = web3.utils.toWei(nft.price.toString(),'ether');

        const transaction = await marketContract.methods.createMarketSale(nftaddress, nft.tokenId).send({
          from: metamaskAccount,
          value: price,
        });

        //await wait(transaction);
        loadNFTs();

  }

  if(loadingState === 'loaded' && !nfts.length) return(
    <h1 className="textoCutout px-20 py-10 text-3xl">No hay items</h1>
    
  )

  return (
   <div className="flex justify-center">
     <div className="px-4" style={{ maxWidth: '1600px'}}>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {

                  nfts.map((nft, i)=>(

                      <div key={i} className="border shadow rounded-xl overflow-hidden">
                        <img src={nft.image} />
                        <div className="p-4">
                          <p style={{ height: '64px'}} className="text-2xl font-semibold">{nft.name}</p>
                          <div style={{ height: '70px', overflow: 'hidden'}}>
                            <p className="text-gray-400">{nft.description}</p>

                          </div>
                        </div>
                        <div className="p-4 bg-black">
                          <p className="text-m mb-4 text-white">Puja Actual</p>
                          <p className="text-2xl mb-4 font-bold text-white">{nft.price} ETH</p>
                          <button className="w-full bg-black-500 text-white font-bold py-2 px-12 rounded"
                          onClick={()=> buyNft(nft)}>
                            Oferta
                          </button>
                        </div>

                      </div>

                  ))

                }

        </div>


     </div>

   </div>
  )
}
