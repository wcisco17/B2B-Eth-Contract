"use strict";

var Painter = artifacts.require("../contracts/Painter.sol");

module.exports = function(deployer, network, accounts){
  deployer.deploy(Painter, accounts[0]); 
}
