import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    // ✅ இது உன்னுடைய Host மற்றும் DB பெயரைத் தெளிவாகக் காட்டும்
    console.log(`Vault Online: ${conn.connection.host} 🏛️`);
    console.log(`Database Name: ${conn.connection.name} ✅`); 
  } catch (error) {
    console.log(`Vault Connection Error: ${error}`);
    process.exit(1); // கனெக்ஷன் இல்லை என்றால் சர்வரை நிறுத்த இது உதவும்
  }
};

export default connectDB;