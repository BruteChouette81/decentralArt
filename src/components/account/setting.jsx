import {useState } from 'react';
import axios from 'axios';
import { API, Storage } from 'aws-amplify';
import {Buffer} from 'buffer'

import "./css/profile.css"
import 'bootstrap/dist/css/bootstrap.min.css'

function AutoRefresh( t ) {
    setTimeout("location.reload(true);", t);
}

function Settings(props) {
    const [image_file, setImage] = useState(null);
    const [backcolor, setBackcolor] = useState("")
    const [username, setUsername] = useState("")
    const [description, setDescription] = useState("")

    

    function setS3Config(bucket, level) {
        Storage.configure({
            bucket: bucket,
            level: level,
            region: "ca-central-1",
            identityPoolId: 'ca-central-1:85ca7a33-46b1-4827-ae75-694463376952'
        })
    }

    function handleBackChange(color) {
        setBackcolor(color)
    }

    function handleNameChange(event) {
        setUsername(event.target.value)
    }

    function handleBioChange(event) {
        setDescription(event.target.value)
    }

    async function handleChange(event) {
        setImage(event.target.files[0])
    }

    function handleSubmit(event) {
        event.preventDefault()
        const url = '/uploadFile';
        var config = {
            body: {
                account: props.address.toLowerCase(),
                background: backcolor,
                name: username,
                description: description,
                is_cust: false
            }
          };
        //formData.append('account', account);
        //formData.append('background', backcolor);
        //formData.append('file', image);

        //directly save the image to S3 bucket
        if (image_file) {
            //<input type='file' id='profilepic' name='profilepic' accept='image/png, image/jpeg' style={{color: 'black'}} onChange={handleChange}/>
            console.log(image_file.name)
            config.body.is_cust = true;
            setS3Config("clientbc6cabec04d84d318144798d9000b9b3205313-dev", "public")
            try {
                //image_file
                //image_file
                Storage.put(`${props.address.toLowerCase()}.png`, image_file).then((results) => { // add ".png"
                    console.log(results)
                });
            } catch (error) {
                console.log(error)
            }
            
        }
        
        API.put('serverv2', url, config).then((response) => {
          console.log(response);
          AutoRefresh(1500); //apply changes 
        });
    
      }
    
    return(
        <div>
            <button class="btn btn-link" type="button" id="edit-btn" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                [edit your account]
            </button>

            <div class="offcanvas offcanvas-start" tabIndex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel" style={{textAlign: 'start'}}>
                <div class="offcanvas-header">
                    <h5 class="offcanvas-title" id="offcanvasExampleLabel">Settings</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div class="offcanvas-body">
                    <div style={{paddingBottom: 30 + 'px' }}>
                        <h3 style={{color: 'black'}}>Customize your profile</h3>
                    </div>
                    <div>
                        <form onSubmit={handleSubmit}>
                            <label style={{color: 'black'}} class="form-label" >Change your profile picture:</label>
                            <input type='file' class="form-control form-control-sm" id='profilepicselecter' name='profilepicselecter' accept='image/png, image/jpeg' style={{color: 'black'}} onChange={handleChange}/>
                            <br />
                            <br />
                            <label style={{color: 'black'}} class="form-label" >Change your background color:</label>
                            <div class="dropdown">
                                <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                    Color picker
                                </button>
                                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                    <li><a class="dropdown-item" href="#" onClick={() => handleBackChange("blue")}>Blue</a></li>
                                    <li><a class="dropdown-item" href="#" onClick={() =>handleBackChange("red")}>Red</a></li>
                                    <li><a class="dropdown-item" href="#" onClick={() =>handleBackChange("green")}>Green</a></li>
                                    <li><a class="dropdown-item" href="#" onClick={() =>handleBackChange("aqua")}>Aqua</a></li>
                                    <li><a class="dropdown-item" href="#" onClick={() =>handleBackChange("purple")}>Purple</a></li>
                                </ul>
                            </div>
                            <br />
                            <label for="newnameselecter" class="form-label" style={{color: 'black'}} >Change your username:</label>
                            <input type="text" class="form-control" name="newnameselecter" id="newnameselecter" onChange={handleNameChange} />
                            <br />
                            <label for="newnameselecter" class="form-label" style={{color: 'black'}} >Change your bio:</label>
                            <input type="text" class="form-control" name="newnameselecter" id="newnameselecter" onChange={handleBioChange} />
                            <br />

                            <br />
                            <input type="submit" class="btn btn-primary" value="Submit"/>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings;