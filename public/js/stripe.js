import axios from "axios"
import { showAlert } from "./alert";

const stripe = Stripe('pk_test_51RNTrFPvBUg4cL2HzKRMDDiTp9sMDiBtgBL2ADv3j31npQhO0ohKKcsO7mzqfbl2kWz2Tvw8d4VSpMVE4QgzbUNe00eKAI15bq')

export const bookTour = async tourId => {
    try {
        // 1) Get checkout session from API
        const session = await axios(`http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`)
        console.log(session);
        // 2) create the checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })
    } catch (err) {
        console.log(err);
        showAlert('error', err)
    }
}
