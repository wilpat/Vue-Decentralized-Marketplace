pragma solidity ^0.5.0;

contract Users {

  // mapping(address => bytes32) public users;
  mapping(bytes32 => address) public users;// Map the email to the address of users

  event UserCreated(bytes32 _email, address indexed _address);
  event UserDestroyed(bytes32 indexed _email);

  function exists (bytes32 _email) public view returns (bool _exists) {
    return (users[_email] != address(0));// check if the 
  }

  function authenticate (bytes32 _email) public view returns (address _address ) {
    require(exists(_email));
    return (users[_email]);
  }

  function create (bytes32 _email, address _address) public {
    users[_email] = _address ;
    emit UserCreated( _email, _address);
  }

  function destroy (bytes32 _email) public {
    require(exists(_email));
    delete users[_email];
    emit UserDestroyed(_email);
  }

  function get (bytes32 _email) public view returns(address _address) {
    require(exists(_email));
    return (users[_email]);
  }

}
