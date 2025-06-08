import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema({
  amount: Number,
  description: String,
  date: { type: Date, default: Date.now }
})

export const Transaction = mongoose.model('Transaction', transactionSchema)