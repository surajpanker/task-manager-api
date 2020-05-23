const express =require('express');
const router = express.Router();
const User = require('../models/user')
const auth =require('../middleware/auth.js')
const multer= require('multer');
const sharp =require('sharp');
const {sendWelcomeEmail,sendcancealEmail} = require('../emails/account')
//sign up
router.post('/users', async (req, res) => {
    const user = new User(req.body)
// without async 
    // user.save().then(() => {
    //     res.status(201).send(user)
    // }).catch((e) => {
    //     res.status(400).send(e)
    // })

   //with async  for creating user
   try
    {
        await user.save();
        sendWelcomeEmail(user.email,user.name);
       const token = await user.GenrateToken();
       res.status(201).send({user,token});
  
   }
   catch(e){
    res.status(401).send(e);
   }
   
   })

   //logout from current device for it we req.token =token in auth.js
router.post('/users/logout',auth,async (req,res)=>{
              
try{
   req.user.tokens= req.user.tokens.filter((token)=>{
      return token.token!==req.token;
   })
   
   await req.user.save();
   res.status(201).send({details:"user Logout",user:req.user})

}catch(e){
    res.status(401).send({error:"User can't login"})
}

})
//logout all like netflix
router.post('/users/logoutAll',auth,async (req,res)=>{
    
    try{
      req.user.tokens =[];
      await req.user.save();
      res.status(201).send("All user logout succesfully")

    } catch(e){
        res.status(500).send("Can't logout from all user")
    }
  

})




   router.get('/users/me', auth, async (req, res) => {
      // console.log(req.user)
        res.send(req.user)
       })
   //login
   router.post('/users/login',async (req,res)=>{

          try{
          const user = await User.findByCredentials(req.body.email,req.body.password);
        
          const token = await user.GenrateToken();
       
          res.send({ user, token })//  res.send({user,token});
          }catch(e){
             //console.log(e)
              res.status(404).send({error:"User not Exist"})
          }
   })
  



//for reading data 

router.get('/users', async (req,res)=>{

    //for reading multiple data without async
    //   User.find({}).then((user)=>{
    //       res.send(user);
    //   }).catch((e)=>{
    //       res.status(400).send(e)
    //   })
     
    try{
      const user = await User.find({});
      res.status(201).send(user);
    
    }
    catch(e){

        res.status(401).send();
    }


})



router.patch('/users/me',auth,async (req,res)=>{
    const updates = Object.keys(req.body);
    const allowUpdates =['name','age','password'];
    const isValid = updates.every((update)=>{
 
     return allowUpdates.includes(update)
    })
 
    if(!isValid)
    res.status(401).send('Update is not found')
 
  try{
   //const user = await User.findById(req.user._id);
   updates.forEach((key)=>{
    req.user[key]=req.body[key];
    })
     
    
    await req.user.save();

    
    res.status(201).send(req.user);
 
  }catch(e){
 
     res.status(404).send(e);
  }
 
 
 
 })


//delete use by id findbyidanddelete(_) take one argument that id i
router.delete('/users/me',auth,async (req,res)=>{
    try{
        // const user = await User.findByIdAndDelete(req.user._id)
        // if(!user)
        //   res.status(404).send({error:"user not found"});
       //mongoose provide remove the user 
          await req.user.remove()
          sendcancealEmail(req.user,req.name)
          res.status(201).send({info:"task and user both are deleted",ME:req.user})
    }catch(e){
        res.status(404).send({error:"User is not found"})
    }

})

const upload = multer({
    limits:{
        fileSize:1000000 //in 1 mb
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpeg|png|jpg)$/)){
            cb(new Error('file must be jpeg ,jpg,png'))
        }
        cb(undefined,true)
    }
})
router.post('/users/me/avatar',auth,upload.single('profile'),async (req,res)=>{

    const buffer = await sharp(req.file.buffer).resize({
   height:300,
   width:300
    }).png().toBuffer()
   //req.user.avatar=req.file.buffer
   req.user.avatar=buffer;
    await req.user.save()
    res.send({info:"file has been uploaded"});

},(error,req,res,next)=>{
    res.send({error:error.message})
})
router.delete('/users/me/avatar',auth,async (req,res)=>{
    req.user.avatar =undefined;
    await req.user.save()
    res.send({
        info:"Usre has been deleted"
    })
})


router.get('/users/:id/avatar',async (req,res)=>{

 try{
   const user = await User.findById(req.params.id)
   if(!user || !user.avatar)
    throw new Error();

  // req.set('Content-Type',' application/json')  
  res.set('Content-Type',' image/jpg')  
  //send user
  /*
And with this in place we should be able to access the image for a user by their I.D..

This is something we should be able to access in an image tag or by just directly typing it in the browser.
  */
  res.send(user.avatar);
 }catch(e){
     res.status(404).send();
 }
      
})


module.exports=router