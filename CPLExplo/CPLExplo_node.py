#program to connect to CPL and get info (proof) of transaction. Used to validate/explore the ledger.
from web3 import Web3

import requests

#methods:
# buying: 0x001b374b
# minting: 0x782b5937
# deleting: 0x5537a73a
# prooving: 0x9226099c
methods = {'buying': '0x001b374b', 'minting': '0x782b5937', 'deleting': '0x5537a73a', 'prooving': '0x9226099c'}
def connect(address, mode, id=0, hash="", catID=""):
     #connecting to blockchain using HTTP provider 
    w3 = Web3(Web3.HTTPProvider(address))
    print(f"Connected: {w3.is_connected()}")

    if mode=="catId": 
        translist = []
        transaction = getTransactions()
        for i in transaction:
            if i['methodId'] == methods[catID]:
                transac = w3.eth.get_transaction_receipt(i['hash'])
                translist.append(transac)
        display(translist, catID)
        return 1
    elif mode=='hash':
        transac = w3.eth.get_transaction_receipt(hash)
        display(transac, methods[transaction[id]['methodId']])
        return 1
    elif mode=='id':
        transaction = getTransactions()
        transac = w3.eth.get_transaction_receipt(transaction[id]['hash'])
        display(transac, methods[transaction[id]['methodId']])
        return 1

    

        
def display(transac, methodID):
    if type(transac) == list:
        for i in transac:
            print(f"--------------------- {i.blockNumber} ---------------------")
            print(f"Hash: {str(i.transactionHash.hex())}")
            print(f"From {i['from']}")
            print(f"To: {i.to}")
            print(f"Transaction Type: {methodID}")
            print(f"Confirmations: {bool(i.status)}")
            print("----------------------------------------------------\n")
    else:
        print(f"--------------------- {transac.blockNumber} ---------------------")
        print(f"Hash: {str(transac.transactionHash.hex())}")
        print(f"From {transac['from']}")
        print(f"To: {transac.to}")
        print(f"Transaction Type: {methodID}")
        print(f"Confirmed: {bool(transac.status)}")
        print("----------------------------------------------------\n")

def getTransactions():
    #etherscan client
   transactions = requests.get("https://api-goerli.etherscan.io/api?module=account&action=txlist&address=0x439da8962debe41408712dE41b6161B66349E250&startblock=0&endblock=99999999&apikey=RCJJXRYSTIJT7NAAJA2IQKTQQCPBZ4ZGK4")
   json_tran = transactions.json()
   return json_tran['result']
   #['methodId']

if '__main__' == __name__: 
    connect("https://goerli.infura.io/v3/38c76bf4a8364360b6c32145bbaa7799", "catId", catID="prooving")
    #getTransactions()
    #print("Hello, world!")
