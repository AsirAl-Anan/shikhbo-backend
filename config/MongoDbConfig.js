import mongoose from "mongoose"


const connectDb = async ()  =>{
try {
 const res=await   mongoose.connect(process.env.MONGODB_URI)
    
} catch (error) {
    console.log("erro", error)
}
}
export default connectDb