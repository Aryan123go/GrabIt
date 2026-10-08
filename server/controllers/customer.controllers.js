
import Customer from "../model/customer.model.js"
import bcrypt from 'bcrypt'
import genToken from "../utils/genToken.js"

// register customer

export const getCookieOptions = () => ({
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
})

const sanitizeCustomer = (customer) => {
    const publicCustomer = customer.toObject ? customer.toObject() : { ...customer }
    delete publicCustomer.password
    return publicCustomer
}

const registerCustomer = async (req, res)=>{
    try{
        const {fullName, email, password, phone} = req.body
        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({message: 'All fields are Required'})
        }
        if (password.length < 6) {
            return res.status(400).json({message: 'Password must have atleast 6 characters'})
        }
        if (phone.length < 10) {
            return res.status(400).json({message: 'Phone number must have atleast 10 characters'})
        }
        const emailExists = await Customer.findOne({ email })
        if (emailExists) {
            return res.status(409).json({message: 'User already exists'})
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newCustomer = await Customer.create({
            fullName,
            email,
            password: hashedPassword,
            phone
        })

        const token = genToken(newCustomer._id)
        res.cookie('token', token, getCookieOptions())

        const publicCustomer = sanitizeCustomer(newCustomer)
        return res.status(201).json({success: true, message: 'Customer registered successfully', customer: publicCustomer})
    }
    catch (err) {
        return res.status(500).json({message: "Server Crashed", error: err.message})
    }
}



//login customer

const loginCustomer = async (req, res)=>{
    try{
        const {email, password} = req.body

        if (!email || !password) {
            return res.status(400).json({message: "All Fields are required"})
        }

        const customer = await Customer.findOne({ email })
        if (!customer) {
            return res.status(404).json({message: "User Not Exists"})
        }

        const isMatch = await bcrypt.compare(password, customer.password)
        if (!isMatch) {
            return res.status(401).json({message: "Password is wrong"})
        }

        const token = genToken(customer._id)
        res.cookie('token', token, getCookieOptions())
        const publicCustomer = sanitizeCustomer(customer)
        return res.status(200).json({success: true, message: "Login Successful", customer: publicCustomer})
    }
    catch (err) {
        return res.status(500).json({error: err.message})
    }
}

// get customer

const getMe = async (req, res)=>{
    if (!req.customer) {
        return res.status(401).json({message: "Customer not found"})
    }
    return res.status(200).json({authenticatedCustomer: sanitizeCustomer(req.customer)})
}

const updateCustomerProfile = async (req, res) => {
    try {
        const { fullName, email, phone, shippingAddress } = req.body

        if (!fullName || !email || !phone) {
            return res.status(400).json({ message: 'Name, email, and phone are required' })
        }

        const emailOwner = await Customer.findOne({ email, _id: { $ne: req.customer._id } })
        if (emailOwner) {
            return res.status(409).json({ message: 'Email is already in use' })
        }

        const updatedCustomer = await Customer.findByIdAndUpdate(
            req.customer._id,
            { fullName, email, phone, shippingAddress },
            { new: true, runValidators: true }
        )

        return res.status(200).json({ customer: sanitizeCustomer(updatedCustomer) })
    } catch (err) {
        return res.status(500).json({ message: 'Unable to update profile', error: err.message })
    }
}

// logout customer

const logoutCustomer = async (req, res)=>{
    try {
        res.clearCookie('token', getCookieOptions())
        return res.status(200).json({success: true, message: "Logged out successfully"})
    }
    catch (err) {
        return res.status(500).json({error: err.message})
    }
}

export { registerCustomer, loginCustomer, getMe, updateCustomerProfile, logoutCustomer }