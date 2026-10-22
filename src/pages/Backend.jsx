import { useState, useEffect } from 'react'




export default function Backend() {

    const [product, setProduct] = useState([]);

    const [name, setName] = useState('');

    const [price, setPrice] = useState('');

    const api_url = 'http://localhost:8080/api/product'

    useEffect(() => {

        fetch(api_url)

            .then((response) => response.json())

            .then((data) => {

                setProduct(data)
                console.log(data)

            })

    }, []);

    async function formSubmit(e) {

        e.preventDefault(); //prevent yung refresh

        try {

            await fetch(api_url, {

            method: 'POST',

            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify({

                name: name,
                price: price,

            })

        })

        }

        catch (err) {

            console.log(err);

        }

    }

    return (

        <div>

            <h1>Welcome to Backend</h1>

            <form onSubmit={formSubmit}>

                <label htmlFor="name">Name</label>

                <input type="text" id='name' onChange={(event)=> setName(event.target.value)} />

                <label htmlFor="price">Price</label>

                <input type="number" id='price' onChange={(event)=> setPrice(event.target.value)} />

                <input type="submit" value="Submit" />

            </form>

            <table>

                <tr>

                    <td>Name</td>

                    <td>Price</td>

                </tr>

                {

                    product.map((products) => (

                        <tr>

                            <td>{ products.name }</td>

                            <td>{ products.price }</td>

                        </tr>

                    ))

                }

            </table>

        </div>

    );

}
