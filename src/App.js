
  
import React, {useState, useEffect} from 'react';
import "./App.css";
import Home from "./pages/Home";
import Rooms from "./pages/Rooms";
import SingleRoom from "./pages/SingleRoom";
import Add from "./pages/Add";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import {
  Route,
  Switch
} from "react-router-dom"; /**Switch will render the first route child that matches */

import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";
import BigNumber from "bignumber.js";
import BookingRoomAbi from "./contract/BookingRoom.abi.json";
import erc20 from "./contract/erc20.abi.json";

const ERC20_DECIMALS = 18;

// const contractAddress = "0x86702e5343EFb9F4c1e24172F832dEc598A099ef";
const contractAddress = "0x5c6fd96BA92a7c54fc6aA12Ea73C343A26899562";
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

function App() {
  const [celoBalance, setCeloBalance] = useState(0);
  const [contract, setcontract] = useState(null);
  const [address, setAddress] = useState(null);
  const [kit, setKit] = useState(null);
  const [cUSDBalance, setcUSDBalance] = useState(0);


  const connectCeloWallet = async () => {
    
    if (window.celo) {
      try {
        await window.celo.enable();
        const web3 = new Web3(window.celo);
        let kit = newKitFromWeb3(web3);

        const accounts = await kit.web3.eth.getAccounts();
        const user_address = accounts[0];

        kit.defaultAccount = user_address;

        await setAddress(user_address);
        console.log(user_address);

        await setKit(kit);
        // console.log(kit)

        // web3 events
        let options = {
          fromBlock: 0,
          address: ["0x5c6fd96BA92a7c54fc6aA12Ea73C343A26899562"], //Only get events from specific addresses
          topics: [], //What topics to subscribe to
        };

        let subscription = web3.eth.subscribe("logs", options, (err, event) => {
          if (!err) console.log(event);
        });

        // subscription.on('data', event => {
        //   if (contract) {
        //   getFoods()
        //   }
        // })


      } catch (error) {
        console.log("There is an error");
        console.log({ error });
      }
    } else {
      console.log("please install the extension");
    }
  };

  const getRooms = async function() {
    let _roomLength = await contract.methods.getRoomBookingLength().call();

    var _rooms = [];
    for (let i=0; i < _roomLength; i++) {
      let _room = new Promise(async (resolve, reject) => {
        let p = await contract.methods.getInformationRoom(i).call();
        resolve({
          index: i,
          owner: p[0],
          name: p[1],
          imageURL: p[2],
          description: p[3],
          services: p[4],
          location: p[5],
          category: p[6],
          isBooking: p[7],
          capacity: p[8],
          size: p[9],
          price: p[10],
        });
      });
      _rooms.push(_room)
    }

    const rooms = await Promise.all(_rooms);
    // setRoom(rooms)
  }

  const addToRoom = async (
    _name,
    _imageURL,
    _description,
    _services,
    _location,
    _category,
    _capacity,
    _size,
    _price,
    _dateAvailable
  ) => {
    try {
      console.log(_imageURL);
      const price = new BigNumber(_price).shiftedBy(ERC20_DECIMALS).toString();

      const arrImageURL = _imageURL.split(",");
      const dateTimeStamp = Date.parse(_dateAvailable)/1000;

      console.log(dateTimeStamp);

      await contract.methods
        .addRoom(
          _name,
          arrImageURL,
          _description,
          _location,
          _services,
          _category,
          _size,
          price,
          _capacity,
          dateTimeStamp
        )
        .send({from: address});
      getRooms()
    } catch (error) {
      console.log(error)
    }
  }

  const rentRoom = async (_price, _index) => {
    try {
      const cUSDContract = new kit.web3.eth.Contract(
        erc20,
        cUSDContractAddress
      );

      const cost = new BigNumber(_price).shiftedBy(ERC20_DECIMALS).toString();

      await cUSDContract.methods
        .approve(contractAddress, cost)
        .send({from: address});

      await contract.methods.rentRoom(_index).send({from: address});

      getBalance();
      getRooms();
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    connectCeloWallet();
  }, []);

  useEffect(() => {
    if (kit && address) {
      return getBalance();
    } else {
      console.log("no kit or address");
    }
  }, [kit, address]);

  const getBalance = async () => {
    const balance = await kit.getTotalBalance(address);
    const celoBalance = balance.CELO.shiftedBy(-ERC20_DECIMALS).toFixed(2);
    const USDBalance = balance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);

    const contract = new kit.web3.eth.Contract(BookingRoomAbi, contractAddress);

    setcontract(contract);
    setCeloBalance(celoBalance);
    setcUSDBalance(USDBalance);
  };

  return (
    <>
      <Navbar cUSDBalance={cUSDBalance}
        celoBalance={celoBalance}
        address={address}
        connectCeloWallet={connectCeloWallet}/>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/rooms/" component={Rooms} />
        <Route exact path="/add/">
          <Add addToRoom={addToRoom}/>
        </Route>
        <Route exact path="/rooms/:zebra" component={SingleRoom} />
        <Route component={Error} />
      </Switch>
      <Footer />
    </>
  );
}

export default App;