//component to item compare size using three.js
import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'

import Modal from "react-bootstrap/Modal";
import ModalBody from "react-bootstrap/ModalBody";
import ModalHeader from "react-bootstrap/ModalHeader";
import ModalFooter from "react-bootstrap/ModalFooter";
import ModalTitle from "react-bootstrap/ModalTitle";
//import * as THREE from 'three'

import testimg from './css/menu.png'
import { useState, useRef } from 'react'

import './css/compare.css'

/**
 * divide by 20 all of the size
 * size:
 * 24*30,
 * 16*20,
 * 12*36,
 * 9*12,
 * 11.5*16.5
*/

//displau mode to the compare function 
function UI(props) {
    const switchD = () => {
        if (props.dSize) {
            props.setdSize(false)
        } else {
            props.setdSize(true)
        }
    }
    const switchDm = () => {
        if (props.dM) {
            props.setDm(false)
        } else {
            props.setDm(true)
        }
    }
    return (
        <div class="compare-UI">
           
            <input type="checkbox" id="taille" name="taille" value="dSize" onChange={switchD} checked={props.dSize}/>
            <label for="taille">{window.localStorage.getItem("language") == "en" ? "Show sizes" : "Afficher les tailles"} </label><br /><br />
            <input type="checkbox" id="m" name="m" value="dSize" onChange={switchDm} checked={props.dM}/>
            <label for="m">{window.localStorage.getItem("language") == "en" ? "Show a meter in comparison" : "Afficher un metre en comparaison"} </label><br /><br />
            
        </div>
    )
}

const size = [[24, 30], [16,20], [12, 36], [9, 12]]
function Compare() {
    const [dSize, setdSize] = useState(true)
    const [dM, setDm] = useState(false)

    const [show1, setShow1] = useState(false)
    const [show2, setShow2] = useState(false)
    const [show3, setShow3] = useState(false)
    const [show4, setShow4] = useState(false)

    const [hover1, setHover1] = useState(false)
    const [hover2, setHover2] = useState(false)
    const [hover3, setHover3] = useState(false)
    const [hover4, setHover4] = useState(false)

    const activate1 = () => {
        if (show1) {
            setShow1(false)
        } else {
            setShow1(true)
        }
    }
    const activate2 = () => {
        if (show2) {
            setShow2(false)
        } else {
            setShow2(true)
        }
        
    }
    const activate3 = () => {
        if (show3) {
            setShow3(false)
        } else {
            setShow3(true)
        }
        
    }
    const activate4 = () => {
        if (show4) {
            setShow4(false)
        } else {
            setShow4(true)
        }
        
    }
    
    //
   
    return (
        <div class="compare" style={{height: 900 + "px"}}>
            <h1 style={{"textAlign": "center"}}>{window.localStorage.getItem("language") == "en" ? "Comparison tool" : "Outil de comparaison"}</h1>
            <UI dSize={dSize} setdSize={setdSize} dM={dM} setDm={setDm}/>
            <Canvas>
                <ambientLight intensity={Math.PI / 2}/>
                <pointLight position={[10, 10, 10]} />

                <mesh scale={0.5} position={[3, 0, 0]} onPointerOver={(event) => (event.stopPropagation(), setHover1(true))} onPointerOut={(event) => setHover1(false)} onClick={(event) => activate1() }>
                    <boxGeometry args={[(size[0][1]/10), (size[0][0]/10), 0.3]}/>
                <meshStandardMaterial color={hover1 ? 'white' :"red"} />
                    {dSize ? <Html>
                        <p>24x30 po</p>
                    </Html> : ""}
                </mesh>
                <mesh scale={0.5} position={[1, 0, 0]} onPointerOver={(event) => (event.stopPropagation(), setHover2(true))} onPointerOut={(event) => setHover2(false)} onClick={(event) => activate2() }>

                    <boxGeometry args={[(size[1][1]/10), (size[1][0]/10), 0.3]}/>
                    <meshStandardMaterial color={hover2 ? 'white' :'green'}/>
                    {dSize ?<Html>
                        <p>16x20 po</p>
                    </Html> : ""}
                </mesh>
                <mesh scale={0.5} position={[-1, 0, 0]} onPointerOver={(event) => (event.stopPropagation(), setHover3(true))} onPointerOut={(event) => setHover3(false)} onClick={(event) => activate3() }>

                    <boxGeometry args={[(size[2][1]/10), (size[2][0]/10), 0.3]}/>
                    <meshStandardMaterial color={hover3 ? 'white' :'yellow'}/>
                    {dSize ?<Html>
                        <p>12x36 po</p>
                    </Html> : ""}
                </mesh>
                <mesh scale={0.5} position={[-3, 0, 0]} onPointerOver={(event) => (event.stopPropagation(), setHover4(true))} onPointerOut={(event) => setHover4(false)} onClick={(event) => activate4() }> 

                    <boxGeometry args={[(size[3][1]/10), (size[3][0]/10), 0.3]}/>
                    <meshStandardMaterial color={hover4 ? 'white' : 'lightblue'}/>
                    {dSize ?<Html>
                        <p>9x12 po</p>
                    </Html> : ""}
                </mesh>
                { dM ? <mesh scale={0.5} position={[-4, 0, 0]}>

                    <boxGeometry args={[0.3, 4, 0.3]}/>
                    <meshStandardMaterial color={'grey'}/>
                    <Html>
                        <h4>100 cm</h4>
                    </Html>
                </mesh> : "" }
                <OrbitControls />
                
            </Canvas>
            <Modal show={show4}>
            <ModalHeader>
                <ModalTitle>9x12 po</ModalTitle>
            </ModalHeader>
            <ModalBody>Example: <br />
                <img id='itemimg' src="https://ipfs.io/ipfs/Qmcm41tHKbFGdGfbzbnD4FME1iAokM9D8GniyNq3NZr9wK" alt="" /> <br />
                <strong>Dimension: </strong>
                9 x 12 po ou 23 x 31 cm
            </ModalBody>
            <ModalFooter>
                <button class="btn btn-primary btn-lg" onClick={activate4}>Close</button>
            </ModalFooter>
            </Modal>
            <Modal show={show3}>
            <ModalHeader>
                <ModalTitle>12x36 po</ModalTitle>
            </ModalHeader>
            <ModalBody>Example: <br />
                <img style={{"width": 450 + "px", "borderRadius": 12 + "px"}} src="https://ipfs.io/ipfs/QmeEppng32buQwCHBMBptrnrDkxXZpozuwHjidF358G5KN" alt="" /> <br />
                <strong>Dimension: </strong>
                12 x 36 po ou 31 x 92 cm
            </ModalBody>
            <ModalFooter>
                <button class="btn btn-primary btn-lg" onClick={activate3}>Close</button>
            </ModalFooter>
            </Modal>
            <Modal show={show2}>
            <ModalHeader>
                <ModalTitle>16x20 po</ModalTitle>
            </ModalHeader>
            <ModalBody>Example: <br />
                <img id='itemimg' src="https://ipfs.io/ipfs/QmS1ETj7E1viDiAzBPwit2juvxZojrSs7nun1Y8PRGZCmi" alt="" /> <br />
                <strong>Dimension: </strong>
                16 x 20 po ou 41 x 51 cm
            </ModalBody>
            <ModalFooter>
                <button class="btn btn-primary btn-lg" onClick={activate2}>Close</button>
            </ModalFooter>
            </Modal>
            <Modal show={show1}>
            <ModalHeader>
                <ModalTitle>24x30 po</ModalTitle>
            </ModalHeader>
            <ModalBody>Example: <br />
                <img id='itemimg' src="https://ipfs.io/ipfs/QmRtA7CBs8SxjYK1SxTn724HfSbvz5nx4PoW1RvtiCCeBB" alt="" /> <br />
                <strong>Dimension: </strong>
                24 x 30 po ou 61 x 76 cm
            </ModalBody>
            <ModalFooter>
                <button class="btn btn-primary btn-lg" onClick={activate1}>Close</button>
            </ModalFooter>
            </Modal>
        </div>
    )
}

export default Compare; 