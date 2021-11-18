import { useState } from 'react';
import web3 from "web3";
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { useRouter } from 'next/router';


const Web3 = require("web3");
let web3Metamask;
let metamaskAccounts;
let metamaskAccount;
let currentAccount;

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

import {
    nftaddress, nftmarketaddress
  } from "../config";

import CutoutNFTFactory from '../abi/CutoutNFTFactory.json';
import CutoutMarket from '../abi/CutoutMarket.json';


export default function CreateItem (){


const connectAccount = async()=>{
    try{
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
        // We are in the browser and metamask is running.

        await window.ethereum.request({ method: "eth_requestAccounts" });
        web3Metamask = new Web3(window.ethereum);
 

      } else {
        // We are on the server *OR* the user is not running metamask
        const provider = new Web3.providers.HttpProvider(
          "https://rinkeby.infura.io/v3/3be8ee0f25324e1cbcf6e35f00f5b3ce"
        );
        web3Metamask = new Web3(provider);
      }

    } catch (err){

        console.log(err)

    }
   
    metamaskAccounts = await web3Metamask.eth.getAccounts();
    metamaskAccount = metamaskAccounts[0];
    console.log("MetamaskAccount", metamaskAccount);
   
    }

    connectAccount();

    const [fileUrl, setFileUrl] = useState(null);
    const [formInput, updateFormInput] = useState({ price: '', name: '', description: ''});
    const router = useRouter();

    console.log("Esta es nftaddress", nftaddress);
    console.log("Esta es nftmarketaddress", nftmarketaddress);
    
    

    const onChange = async (e)=>{
        const file = e.target.files[0];
        try{
            const added = await client.add(
                file,
                {
                    progress: (prog) => console.log(`received: ${prog}`)

                }
            )
        const url = `https://ipfs.infura.io/ipfs/${added.path}`;
        
        setFileUrl(url)

        } catch (e){
            console.log(e)

        }
    };

    const createItem = async ()=>{
        const { name, description, price } = formInput;

        if(!name || !description || !price || !fileUrl) return;

        const data = JSON.stringify({
            name, description, image: fileUrl
        });

        try{
            const added = await client.add(data);
        const url = `https://ipfs.infura.io/ipfs/${added.path}`;
        
        createSale(url)

        } catch (error){
            console.log("Error al subir el archivo: ", error);

        }

    };

    const createSale = async (url)=> {


          const tokenContract = await new web3Metamask.eth.Contract(CutoutNFTFactory.abi, nftaddress);
          let transaction = await tokenContract.methods.createToken(url).send({from: metamaskAccount});
          //console.log(transaction['events'])
          //console.log("Token Id", transaction['events'].Transfer.returnValues[2]);

          //let event = transaction.events[0];
          //let value = event.args[2];
          let tokenId = await transaction['events'].Transfer.returnValues[2];

          const price = web3.utils.toWei(formInput.price,'ether');

          const marketContract = await new web3Metamask.eth.Contract(CutoutMarket.abi, nftmarketaddress);
          let listingPrice = await marketContract.methods.getListingPrice().call({from: metamaskAccount});
          listingPrice = listingPrice.toString();

          transaction = await marketContract.methods.createMarketItem(nftaddress, tokenId, price).send({from: metamaskAccount, value: listingPrice});
          console.log("Market Item", transaction)
          //await transaction.wait();
          router.push('/')  
        
        }

        return(

            <div className="flex justify-center">
                <div className="w-1/2 flex flex-col pb-12">

                    <input
                    placeholder="Nombre del NFT"
                    className="mt-8 border rounded p-4"
                    onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
                    />

                    <textarea
                    placeholder="Descripción"
                    className="mt-2 border rounded p-4"
                    onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
                    />

                    <input
                    placeholder="Precio de salida"
                    className="mt-8 border rounded p-4"
                    onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
                    />

                    <input
                    type="file"
                    name="NFT"
                    className="my-4"
                    onChange={onChange}
                    />

                    {
                      fileUrl && (
                        <img className="rounded mt-4" width="350" src={fileUrl}/>

                        )

                    }

                    <button
                    onClick={createItem}
                    className="font-bold mt-4 bg-black text-white rounded p-4 shadow-lg"
                    >
                    Mint
                    </button>

                </div>

            </div>

        )


}