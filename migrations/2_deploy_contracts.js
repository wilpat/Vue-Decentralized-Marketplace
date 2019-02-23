var Users = artifacts.require("./Users.sol");
var Owner = artifacts.require("./Owner.sol");
var ProductList = artifacts.require("./ProductList.sol");

module.exports = function(deployer) {
  deployer.deploy(Owner);
  deployer.deploy(Users);
  deployer.deploy(ProductList);
};
