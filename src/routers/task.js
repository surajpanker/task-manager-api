
const express =require('express');
const router = express.Router();
const Task = require('../models/task')
const auth = require('../middleware/auth')
router.post('/tasks',auth,async (req,res)=>{
    //const t1 =new Task(req.body);
     // without async 

    // t1.save().then(()=>{
    // res.status(201).send(t1);

    // }).catch((e)=>{
    // res.status(400).send(e);
    // });

       //with async  for creating Task
const t1 =new Task({...req.body,owner:req.user._id})
       try{
        await t1.save();
        res.status(201).send(t1);
       }
       catch(e){
           res.status(401).send();
       }
     
   
})

//lets do assignment
//fetch sigle task
//first they authniticate
//those task which is created
router.get('/tasks/:id',auth,async (req,res)=>{
    const _id =req.params.id;
    // Task.findById(_id).then((task)=>{
    // if(!task)
    //  return res.status(401).send()
    //  res.send(task);
    // }).catch((e)=>{
    //     res.status(500).send();
    // })

 // for using  async
    try{
     const task = await Task.findOne({_id,owner:req.user._id});
     if(!task)
       res.status(401).send();

       res.status(201).send(task);
    }
    catch(e){

      res.status(401).send();

    }
})

//fetch multiple task
//fiktering data using query string
//GET /tasks ? completed=true/false
router.get('/tasks',auth,async (req,res)=>{

    // Task.find({}).then((task)=>{
    //     if(!task)
    //      return res.status(404).send()
    //      res.send(task);
    //     }).catch((e)=>{
    //         res.status(500).send();
    //     })
  
    //for using async
    try 
    {
       const match ={ } // no value provide fetch all task
       const sort ={ }  // if no sorting defined 
       if(req.query.completed){
        match.completed= req.query.completed =='true'
       }
       if(req.query.sortBy){
         const parts =req.query.sortBy.split(':');//split srting 
         sort[parts[0]]= parts[1]==='desc'?-1:1;
       }
   //console.log(req.query.limit)
    await req.user.populate({
      path:"task",
      match,
      options:{
        limit:parseInt(req.query.limit),
        skip:parseInt(req.query.skip),
        sort
        
      }
    }).execPopulate();
     res.status(201).send(req.user.task)
    }
    catch(e){
        res.status(401).send('You are not authanticate');
    }
    
    })

    


router.patch('/tasks/:id',auth,async (req,res)=>{
    const updates =Object.keys(req.body);
    const allowUpdates = ['description','completed'] ;
    const isValid = updates.every((update)=>{
      return allowUpdates.includes(update);
   
    })
    if(!isValid)
      res.status(404).send({error:"Update is invalid"});
   
      try{
       //const t1 =await Task.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
       const t1 =await Task.findOne({_id:req.params.id,owner:req.user._id});
       
         if(!t1)
          res.status(404).send({error:"task not found"});

          updates.forEach((key)=>{
            t1[key]=req.body[key]
          })
   
          await t1.save()
   
          res.status(201).send({info:"taskis updated",task:t1});
      }catch(e){
          res.status(404).send(e);
      }
   
   
   })

   //deleting task by id
router.delete('/tasks/:id',auth,async (req,res)=>{
    
    try{
    const t1 =await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id});
    console.log(t1);
    if(!t1)
    res.status(401).send({error:"task not exists"})

    res.status(201).send({info:'task has been deleted',t1});


    }catch(e){
        res.status(404).send({error:"Task not found"})
    }

})



   module.exports=router;