import express from 'express'
import userModel from '../model/users.mjs'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import authorize from '../middleware/auth.mjs'

const router = express.Router()

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      username,
      
      password:hashPassword
    });

    await newUser.save();

    return res.status(201).json({ message: 'Registration successful...' });
  } catch (error) {
    console.error(error); // Log the actual error for debugging
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const {username, password} = req.body

  try{

    const user = await userModel.findOne({username})
    console.log(user)
    if(!user){
      return res.status(401).json({message:'user not found'})
    }

  
   

    const isMatch =  await bcrypt.compare(password,user.password)
   
    if(!isMatch)
      return res.json({message:'invalid credentials'})

    const token = jwt.sign({id:user._id, role: user.role },"shyam", {expiresIn:'20m'})
    //const token = jwt.sign({id:user._id},"shyam", {expiresIn:'20m'})
    res.json({token})

  }catch(error){
    res.status(500).json({message:'Server error'})
  }
 })

router.get('/', authorize([,'user']), async (req, res) => {
  const user = await userModel.findById(req.user.id).select('-password')
  res.json({user})
})

export default router
