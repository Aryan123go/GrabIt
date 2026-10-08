import jwt from 'jsonwebtoken'
import Customer from "../model/customer.model.js";

const isAuthenticated = async (req, res, next)=>{
    try {
        const token = req.cookies.token
        if (!token) {
            return res.status(401).json({message: 'Authentication required'})
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const customer = await Customer.findById(decoded.userId)
        if (!customer) {
            return res.status(401).json({message: 'Customer not found'})
        }

        req.customer = customer

        next()
    }
    catch (err) {
        res.status(401).json({message: 'Authentication failed'})
    }
}

export default isAuthenticated
