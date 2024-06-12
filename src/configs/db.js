import mongoose from "mongoose";


const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017'
    const dbName = process.env.DB_NAME || 'Xcard_Test'

    const connectionInstance = await mongoose.connect(`${mongoUrl}/${dbName}`)

    console.log(
      `\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}/${dbName}`
    )

    // Event monitoring
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to db')
    })

    mongoose.connection.on('error', (err) => {
      console.log(err.message)
    })

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose connection is disconnected')
    })

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close()
      console.log('Mongoose connection closed through app termination')
      process.exit(0)
    })
  } catch (error) {
    console.log('Error:' + error.message)
    process.exit(1)
  }
}



export default connectDB;
