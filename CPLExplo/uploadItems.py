##### python script to upload items to CPL, creating decentralized contracts and uri to store them.

import sys # to get args
from os import walk # to walk a folder

import requests
import ipfs_api 


address = ""
price = 100

## plan
#1: get the files
#2: upload the file + metadata to ipfs (run local node)
#3: create new contract using dds


def runFolder(path: str):
    
    f = []
    for (dirpath, dirnames, filenames) in walk(path):
        f.extend(filenames)
        break
    return f

def uploadToIpfs(path, files): #recheck metadata
    image_cids = []
    meta_cids = []
    for file in files:
        if ".png" or ".jpg" in file:
            image_cids = ipfs_api.publish(path+"/"+file)
        elif ".json" in file:
            meta_cids = ipfs_api.publish(path+"/"+file)
        else:
            print("bad file")
    return meta_cids, image_cids
    #index of metadata match file index
            
def createContracts(image_cids):
    mintContract =  "https://f5auzuxklj.execute-api.ca-central-1.amazonaws.com/dev/oracleMint"
    listItem =  "https://f5auzuxklj.execute-api.ca-central-1.amazonaws.com/dev/listItem"
    for cid in image_cids:
        data = {"body": {
                    "address": address,
                    "uri": "https://ipfs.io/ipfs/" + cid,
                    "MaxPrice": price,
                    "numDays": int(20)
                }}
        res = requests.post(mintContract, data)
        data2 = {
                "body": {
                    "address": address,
                    "itemid": int(res.hex), #remove
                    "name": "", #remove
                    "score": 0,
                    "tag": "", #remove
                    "description": "", #remove
                    "image": "https://ipfs.io/ipfs/" + cid
                }
            }
        res2 = requests.post(listItem, data2)
        print(res2)

    #url: https://f5auzuxklj.execute-api.ca-central-1.amazonaws.com/dev/oracleMint POST 
    #listitem


if __name__ == '__main__':
    print(ipfs_api.my_id()) #get our node id
    path = sys.argv
    files = runFolder(path[1]) #get the folder path
    meta_cids, image_cids = uploadToIpfs(path, files)
    createContracts(image_cids)




