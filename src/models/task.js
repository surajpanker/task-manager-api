const mongoose =require('mongoose');
const validator =require('validator');
const TaskSchema =mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner:{

        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User' //for relation between two models ref:'modelname'
    }
},{
    timestamps:true
})
const Task = mongoose.model('Tasks',TaskSchema)

module.exports =Task;