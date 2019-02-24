pragma solidity ^0.5.0;


import "./Owner.sol";


contract ProductList is Owner{

	struct Item {

		uint id;
		address seller;
		address buyer;
		string name;
		string description;
		uint256 price;

	}
	
	//State variables
	mapping (uint => Item) public items;
	uint itemCounter= 0;

	event itemSold(uint indexed _id, address indexed _seller, string _name, uint256 _price);
	event itemBought(uint indexed _id, address indexed _buyer, address indexed _seller, string _name, uint256 _price);
	// constructor() public{
	// 	sellItem('default item', 'description for default item', 1000000000000	000000);
	// }

	function sellItem (string memory _name, string memory _description, uint256 _price, address _seller) public {
		itemCounter++;
		items[itemCounter] = Item(itemCounter, _seller, address(0), _name, _description, _price);
		emit itemSold( itemCounter, _seller, _name, _price );
	}
	
	function getNumberOfItems () public view returns(uint)  {
		return itemCounter;
	}

	function getItemsForSale () public view returns(uint[] memory) {
		uint[] memory itemIds = new uint[](itemCounter);//Create an array with max no of elt set as itemCoubter
		//memory because the default which is Storage is more expensive
		uint numberOfItemsForSale = 0;
		//Iterate over the items
		for(uint i = 1; i <= itemCounter; i++){
			//We keep the the id if it has no buyer
			if(items[i].buyer == address(0)){
				itemIds[numberOfItemsForSale] = items[i].id;
				numberOfItemsForSale++;
			}
		}

		//Return a smaller array containing only the items for sale
		uint[] memory forSale = new uint[](numberOfItemsForSale);
		for(uint j = 0; j <	numberOfItemsForSale; j++){
			forSale[j] = itemIds[j];
		}
		return forSale;
	}
	
	
	function buyItem (uint _id, address _buyer, uint _value) public {//payable meaning this fxn may receive ether from it's caller
		

		require (itemCounter > 0);//Check that an item exists for sale

		require (_id > 0 && _id <= itemCounter);//check that requested item exists
		
		Item storage item = items[_id];//This is how you get an element of a mapping

		require (item.seller != address(0));//This item has a seller
		
		require (item.buyer == address(0));////This itemm hasnt been sold

		require (_buyer != item.seller); // The buyer isnt the seller

		require (_value == item.price); //Amount sent is the price of this item

		item.buyer = _buyer;//Store the buyer

		// item.seller.transfer(msg.value);//transfer funds -- kaleido handles transfers now

		//trigger event
		emit itemBought(_id, item.buyer, item.seller, item.name, item.price);
	}

	function kill() public onlyOwner {//Only the owner of this contract can do this
        selfdestruct(owner);
    }
	
	
}
