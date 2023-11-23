//component to item compare size using three.js
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

function Compare() {
    return (
        <div class="compare" style={{height: 700 + "px"}}>
            <Canvas>
                <ambientLight intensity={Math.PI / 2}/>
                <pointLight position={[10, 10, 10]} />
                <mesh scale={1} position={[3, 0, 0]}>
                    <boxGeometry args={[2, 1, 0.3]}/>
                    <meshStandardMaterial color={'red'}/>
                </mesh>
                <mesh scale={1} position={[-3, 0, 0]}>

                    <boxGeometry args={[4, 2, 0.3]}/>
                    <meshStandardMaterial color={'green'}/>
                </mesh>
                <OrbitControls />
            </Canvas>
        </div>
    )
}

export default Compare; 