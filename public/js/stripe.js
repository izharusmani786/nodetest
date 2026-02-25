const stripe = Stripe('pk_test_51T3r1xRy3xe4xz9pQDyYMpjSF56gP9V8pBOTYFG06BcncZWxRFJeMZfnXBJV0EsvZLJmQFhz9bPGkJ5XWH4J2QGQ00bKXUtpsY');

const buyProduct = async (productId) => {
    try {
        const session = await axios.get(`/api/v1/bookings/checkout-session/${productId}`);
        console.log(session);
        await stripe.redirectToCheckout({ sessionId: session.data.session.id });
    } catch (error) {
        console.error('Error purchasing product:', error);
    }
};

document.querySelector('.add-to-cart').addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { productId } = e.target.dataset;
    console.log('Product ID:', productId);
    buyProduct(productId);
});