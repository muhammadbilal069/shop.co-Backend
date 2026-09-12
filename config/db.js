const mongoose=require('mongoose');
const mongoConnect=async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDb Connected!")
    } catch (error) {
        console.log(error)
    }
}
module.exports=mongoConnect;