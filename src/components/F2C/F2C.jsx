import { useParams } from 'react-router-dom'

function F2C() {
    const { address } = useParams();
    return (
        <div>
            <h2>Welcome: {address} </h2>
            <h4>You have successfully Buy some $CREDITs. You can now go to Market and purchase the Item(s) you want!</h4>
        </div>
    )
}

export default F2C;