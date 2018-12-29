var Painter = artifacts.require("../contracts/Painter.sol");

contract("Painter", (accounts) => {
    let painterInstance;

    let seller = accounts[0];
    let buyer = accounts[1];

    let goods = "MacBook 2018";
    let quantity = 3;
    let courier = accounts[2];

    const TYPE_PRICE = 1;
    const TYPE_ORDER = 1;
    const TYPE_SHIPMENT = 2;


    const ORDER_PRICE = 3;
    const ORDER_SAFEPAY = 4;

    const INVOICE_ORDERNO = 1;
    const INVOICE_COURIER = 3;

    let orderno = 1;
    let invoiceno = 1;
    let order_price = 100000;
    let shipment_price = 50000;
    let price = order_price + shipment_price;


    it("Should be the contract name and version", () => {
        return Painter.deployed().then((instance) => {
                painterInstance = instance

                return painterInstance.contractName()
            })
            .then((contractName) => {
                assert.equal(contractName, "Les Paintre", "has the correct name")
                return painterInstance.contractVersion()
            })
            .then((contractVersion) => {
                assert.equal(contractVersion, "1.0.0v", "has the correct version")
            })
    })

    // it("Should be the sellers account that owns the contract", () => {
    //     let deal;

    //     return Painter.new(buyer, {
    //             from: seller
    //         })
    //         .then((instance) => {
    //             deal = instance
    //             return deal.owner()
    //         })
    //         .then((owner) => {
    //             assert.equal(seller, owner, "The seller account does not owns the contract")
    //         })
    // })

    it("The First order number is 1", () => {

        var deal;

        return Painter.new(buyer, {
            from: seller
        }).then(function (instance) {
            deal = instance;

            return deal.sendOrder(goods, quantity, {
                from: buyer
            });
        }).then(function (transaction) {
            return new Promise(function (resolve, reject) {
                return web3.eth.getTransaction(transaction.tx, function (err, tx) {
                    if (err) {
                        reject(err);
                    }
                    resolve(tx);
                });
            });
        }).then(function (tx) {
            console.log(tx.gasPrice.toString());
        }).then(function (receipt) {
            //query getTransactionReceipt
        }).then(function (order) {
            console.log(order)
            return deal.queryOrder(orderno);
        }).then(function (order) {
            assert.notEqual(order, null, "The order number 1 did not exists");
        });
    });

    it("Checks the price to pay for the order | Only the owner can call this function", () => {
        let deal;

        return Painter.new(buyer, {
                from: seller
            }).then((instance) => {
                deal = instance;

                return deal.sendOrder(goods, quantity, {
                    from: buyer
                });
            })
            .then(() => {
                return deal.sendPrice(orderno, order_price, TYPE_ORDER, {
                    from: seller
                });
            }).then(() => {
                return deal.queryOrder(orderno);
            }).then((order) => {
                assert.equal(order[ORDER_PRICE].toString(), order_price);
            });
    });

    it("Sends the value of safe pay, Blocked until the delivery of order", () => {
        let deal;

        return Painter.new(buyer, {
                from: seller
            })
            .then((instance) => {
                deal = instance;

                return deal.sendOrder(goods, quantity, {
                    from: buyer
                });
            })
            .then(() => {
                return deal.sendPrice(orderno, order_price, TYPE_ORDER, {
                    from: seller
                });
            })
            .then(() => {
                return deal.sendPrice(orderno, shipment_price, TYPE_SHIPMENT, {
                    from: seller
                })
            })
            .then(() => {
                return deal.sendSafepay(orderno, {
                    from: buyer,
                    value: price
                })
            })
            .then(() => {
                return deal.queryOrder(orderno)
            })
            .then((order) => {
                assert.equal(order[ORDER_SAFEPAY].toString(), price);
            })
    })

    it("Sends the invoice of the data", () => {
        let deal;
        return Painter.new(buyer, {
                from: seller
            })
            .then((instance) => {
                deal = instance;

                return deal.sendOrder(goods, quantity, {
                    from: buyer
                });
            })
            .then(() => {
                return deal.sendPrice(orderno, order_price, TYPE_ORDER, {
                    from: seller
                });
            })
            .then(() => {
                return deal.sendInvoice(orderno, 0, courier, {
                    from: seller,
                })
            })
            .then((invoice) => {
                return deal.getInvoice(orderno, {
                    from: seller
                })
            })
            .then((invoice) => {
                assert.notEqual(invoice, null, "Not equal to null")
            })
    })

    it("The invoice 1 should match the order 1", () => {
        let deal;
        return Painter.new(buyer, {
                from: seller
            })
            .then((instance) => {
                deal = instance;

                return deal.sendOrder(goods, quantity, {
                    from: buyer
                });
            })
            .then(() => {
                return deal.sendPrice(orderno, order_price, TYPE_ORDER, {
                    from: seller
                });
            })
            .then(() => {
                return deal.sendInvoice(orderno, 0, courier, {
                    from: seller,
                })
            })
            .then((invoice) => {
                return deal.getInvoice(orderno, {
                    from: courier
                })
            })
            .then((invoice) => {
                assert.equal(Number(invoice[INVOICE_ORDERNO]), orderno)
            })
    })

    it("Checks the courier is correct", () => {
        let deal;

        return Painter.new(buyer, {
            from: seller
        }).then(function (instance) {
            deal = instance;

            return deal.sendOrder(goods, quantity, {
                from: buyer
            });
        }).then(function () {
            return deal.sendPrice(orderno, price, TYPE_ORDER, {
                from: seller
            });
        }).then(function () {
            return deal.sendInvoice(orderno, 0, courier, {
                from: seller
            });
        }).then(function () {
            return deal.getInvoice(invoiceno, {
                from: courier
            });
        }).then(function (invoice) {
            console.log(invoice)
            assert.equal(invoice[INVOICE_COURIER].toString(), courier);
        });
    })


    // it("Sends the order and Delivers product", () => {
    //     let deal;

    //     return Painter.new(buyer, {
    //             from: seller
    //         })
    //         .then((instance) => {
    //             deal = instance;

    //             return deal.sendOrder(goods, quantity, {
    //                 from: buyer
    //             });
    //         })
    //         .then(() => {
    //             return deal.sendPrice(orderno, order_price, TYPE_ORDER, {
    //                 from: seller
    //             });
    //         })
    //         .then(() => {
    //             return deal.sendPrice(orderno, shipment_price, TYPE_SHIPMENT, {
    //                 from: seller
    //             })
    //         })
    //         .then(() => {
    //             return deal.sendSafepay(orderno, {
    //                 from: buyer,
    //                 value: price
    //             })
    //         })
    //         .then(() => {
    //             return deal.sendInvoice(orderno, 0, courier, {
    //                 from: seller,
    //             })
    //         })
    //         .then(() => {
    //             return deal.delivery(orderno, 0, {
    //                 from: courier
    //             })
    //         })
    //         .then(function () {
    //             return new Promise(function (resolve, reject) {
    //                 return web3.eth.getBalance(deal.address, function (err, hash) {
    //                     if (err) {
    //                         reject(err);
    //                     }
    //                     resolve(hash);
    //                 });
    //             });
    //         }).then(function (balance) {
    //             assert.equal(balance.toString(), 0);
    //         });
    // })


})