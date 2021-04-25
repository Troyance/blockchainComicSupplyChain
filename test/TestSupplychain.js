// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within
// Declare a variable and assign the compiled smart contract artifact
var SupplyChain = artifacts.require('SupplyChain')

contract('SupplyChain', function(accounts) {
    // Declare few constants and assign a few sample accounts generated by ganache-cli
    var sku = 1
    var upc = 1
    const ownerID = accounts[0]
    const CreatorID = accounts[1]
    const CreatorName = "Brian K. Vaughan"
    var productID = sku + upc
    var rightsPrice = web3.utils.toWei(".5", "ether")
    const productNotes = "Saga, Book One"
    const productPrice = web3.utils.toWei("1", "ether")
    const retailPrice = web3.utils.toWei("1.5", "ether")
    var itemState = 0
    const distributorID = accounts[2]
    const publisherID = accounts[3]
    const retailerID = accounts[4]
    const consumerID = accounts[5]
    const emptyAddress = '0x00000000000000000000000000000000000000'

    ///Available Accounts
    ///==================
    ///(0) 0x27d8d15cbc94527cadf5ec14b69519ae23288b95
    ///(1) 0x018c2dabef4904ecbd7118350a0c54dbeae3549a
    ///(2) 0xce5144391b4ab80668965f2cc4f2cc102380ef0a
    ///(3) 0x460c31107dd048e34971e57da2f99f659add4f02
    ///(4) 0xd37b7b8c62be2fdde8daa9816483aebdbd356088
    ///(5) 0x27f184bdc0e7a931b507ddd689d76dba10514bcb
    ///(6) 0xfe0df793060c49edca5ac9c104dd8e3375349978
    ///(7) 0xbd58a85c96cc6727859d853086fe8560bc137632
    ///(8) 0xe07b5ee5f738b2f87f88b99aac9c64ff1e0c7917
    ///(9) 0xbd3ff2e3aded055244d66544c9c059fa0851da44

    console.log("ganache-cli accounts used here...")
    console.log("Contract Owner: accounts[0] ", accounts[0])
    console.log("Creator: accounts[1] ", accounts[1])
    console.log("Publisher: accounts[2] ", accounts[2])
    console.log("Distributor: accounts[3] ", accounts[3])
    console.log("Retailer: accounts[4] ", accounts[4])
    console.log("Consumer: accounts[5] ", accounts[5])

    // 1st Test
    it("Testing smart contract function createItem() that allows a creator to create comic", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false

        // Watch the emitted event Created()
        await supplyChain.addCreator(CreatorID)

        supplyChain.contract.events.Created({}, (err, res) => {
          eventEmitted = true
        })
        // Mark an item as Created by calling function createItem()
        await supplyChain.createItem(upc, CreatorID, CreatorName, productNotes)

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], CreatorID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], CreatorID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], CreatorName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferTwo[7], 0, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

    // 2nd Test
    it("Testing smart contract function sellItemRights() that allows a creator to sell rights to comic", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false

        // Watch the emitted event RightsForSale()
        supplyChain.contract.events.RightsForSale({}, (err, res) => {
          eventEmitted = true
        })
        // Mark an item as RightsForSale by calling function sellItemRights()
        await supplyChain.sellItemRights(upc, rightsPrice, { from: CreatorID })

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set

        assert.equal(resultBufferTwo[7], 1, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

    // 3rd Test
    it("Testing smart contract function buyItemRights() that allows a publisher to buy rights to comic", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false

        // Watch the emitted event RightsSold()
        await supplyChain.addPublisher(publisherID)

        supplyChain.contract.events.RightsSold({}, (err, res) => {
          eventEmitted = true
        })

        // Mark an item as RightsSold by calling function buyItemRights()
        await supplyChain.buyItemRights(upc, { from: publisherID, value: rightsPrice })

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[2], publisherID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[7], 2, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')

    })

    // 4th Test
    it("Testing smart contract function printItem() that allows a publisher to print comic", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false

        // Watch the emitted event Printed()
        supplyChain.contract.events.Printed({}, (err, res) => {
          eventEmitted = true
        })

        // Mark an item as Printed by calling function printItem()
        await supplyChain.printItem(upc, { from: publisherID })

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[7], 3, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

    // 5th Test
    it("Testing smart contract function sellItem() that allows a publisher to sell comic", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false

        // Watch the emitted event ForSale()
        supplyChain.contract.events.ForSale({}, (err, res) => {
          eventEmitted = true
        })


        // Mark an item as ForSale by calling function sellItem()
        await supplyChain.sellItem(upc, productPrice, { from: publisherID })

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[7], 4, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')

    })

    // 6th Test
    it("Testing smart contract function buyItem() that allows a retailer to buy comic", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false

        // Watch the emitted event Sold()
        await supplyChain.addRetailer(retailerID)

        supplyChain.contract.events.Sold({}, (err, res) => {
          eventEmitted = true
        })


        // Mark an item as Sold by calling function buyItem()
        await supplyChain.buyItem(upc, { from: retailerID, value: productPrice })

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[7], 5, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')


    })

    // 7th Test
    it("Testing smart contract function processItem() that allows a publisher to process comic orders", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false

        // Watch the emitted event Received()
        supplyChain.contract.events.Processed({}, (err, res) => {
          eventEmitted = true
        })

        // Mark an item as Processed by calling function processItem()
        await supplyChain.processItem(upc, { from: publisherID })

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set

        assert.equal(resultBufferTwo[7], 6, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')


    })

    // 8th Test
    it("Testing smart contract function packageItem() that allows a distributor to package comic", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false

        // Watch the emitted event Purchased()
        await supplyChain.addDistributor(distributorID)

        supplyChain.contract.events.Packaged({}, (err, res) => {
          eventEmitted = true
        })

        // Mark an item as Packaged by calling function packageItem()
        await supplyChain.packageItem(upc, { from: distributorID })

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[2], distributorID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[7], 7, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')


    })

    // 8th Test
    it("Testing smart contract function shipItem() that allows a distributor to ship comic", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false

        // Watch the emitted event Shipped()
        supplyChain.contract.events.Shipped({}, (err, res) => {
          eventEmitted = true
        })

        // Mark an item as Shipped by calling function shipItem()
        await supplyChain.shipItem(upc, { from: distributorID })

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[7], 8, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')


    })

    //9th Test
    it("Testing smart contract function receiveItem() that allows a retailer to receive comic", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false

        // Watch the emitted event Received()
        supplyChain.contract.events.Received({}, (err, res) => {
          eventEmitted = true
        })

        // Mark an item as Received by calling function receiveItem()
        await supplyChain.receiveItem(upc, { from: retailerID })

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[2], retailerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[7], 9, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')


    })

    //10th Test
    it("Testing smart contract function stockItem() that allows a retailer to stock comic", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false

        // Watch the emitted event Stocked()
        supplyChain.contract.events.Received({}, (err, res) => {
          eventEmitted = true
        })

        // Mark an item as Stocked by calling function stockItem()
        await supplyChain.stockItem(upc, retailPrice, { from: retailerID })

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[7], 10, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')


    })

    //11th Test
    it("Testing smart contract function purchaseItem() that allows a consumer to purchase comic", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false

        // Watch the emitted event Purchased()
        await supplyChain.addConsumer(consumerID)

        supplyChain.contract.events.Purchased({}, (err, res) => {
          eventEmitted = true
        })

        // Mark an item as Shipped by calling function shipItem()
        await supplyChain.purchaseItem(upc, { from: consumerID, value: retailPrice })

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[2], consumerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[7], 11, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')


    })

    it("Testing smart contract function fetchItemBufferOne() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)

        // Verify the result set:
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU');
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC');
        assert.equal(resultBufferOne[2], consumerID, 'Error: Missing or Invalid ownerID');
        assert.equal(resultBufferOne[3], CreatorID, 'Error: Missing or Invalid originFarmerID');
        assert.equal(resultBufferOne[4], CreatorName, 'Error: Missing or Invalid originFarmName');
    })


    it("Testing smart contract function fetchItemBufferTwo() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set:
        assert.equal(resultBufferTwo[0], sku, 'Error: Invalid item SKU');
        assert.equal(resultBufferTwo[1], upc, 'Error: Invalid item UPC');
        assert.equal(resultBufferTwo[2], productID, 'Error: Missing or Invalid productID');
        assert.equal(resultBufferTwo[3], productNotes, 'Error: Missing or Invalid productNotes');
        assert.equal(resultBufferTwo[4], rightsPrice, 'Error: Missing or Invalid rightsPrice');
        assert.equal(resultBufferTwo[5], productPrice, 'Error: Missing or Invalid productPrice');
        assert.equal(resultBufferTwo[6], retailPrice, 'Error: Missing or Invalid retailPrice');
        assert.equal(resultBufferTwo[7], 11, 'Error: Invalid item State');
        assert.equal(resultBufferTwo[8], publisherID, 'Error: Missing or Invalid publisherID');
        assert.equal(resultBufferTwo[9], distributorID, 'Error: Missing or Invalid distributorID');
        assert.equal(resultBufferTwo[10], retailerID, 'Error: Missing or Invalid retailerID');
        assert.equal(resultBufferTwo[11], consumerID, 'Error: Missing or Invalid consumerID');

    })

});
