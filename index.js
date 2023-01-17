import express from 'express'
import ejs from 'ejs'
import mongoose from 'mongoose'
import fs from 'node:fs'

const app = express()
app.use(express.static('public'))

mongoose.connect('mongodb://localhost:27017/exampleDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB.');
}).catch(err => {
  console.log('Connected Failed.');
  console.log(err);
})

// create Schema
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 15,
    required: true
  },
  age: {
    type: Number,
    max: 150,
    min: 18,
    required: [true, 'Missed age field.']
  },
  major: {
    type: String,
    enum: ['EE', 'CS', 'Account', 'Chem'],
    required: function () {
      return this.age > 18
    }
  },
  scholarship: {
    merit: {
      type: Number,
      max: [6000, 'Merit cant more then $6000. ']
    },
    other: Number
  }
})

/**  create an instance method at "SCHEMA", and used by "DATA" */
studentSchema.methods.totalScholarship = function () {
  return this.scholarship.merit + this.scholarship.other
}

/** create a static method at "SCHEMA", and used by "MODEL" */
studentSchema.static.setOtherToZero = function () {
  return this.updateMany({}, { 'scholarship.other': 0 })
}

/** define middleware - pre(before) & post(after) */
studentSchema.pre('save', async function() {
  fs.writeFile('record.txt', 'One data has ready to save.', { flag: 'a' }, e => {
    if (e) throw e
  })
})

studentSchema.post('save', async function() {
  fs.writeFile('record.txt', 'One data has been saved.', { flag: 'a' }, e => {
    if (e) throw e
  })
})

// create a model from Student Schema
// notice: model 命名必須是單數，必須大寫開頭
const Student = mongoose.model('Student', studentSchema)


// use instance method that we create before
// Student.findOne({ name: 'Jeremy' }).then(data => {
//   console.log('total scholarship:', data.totalScholarship())
// })

// Student.find({}).then(dataArr => {
//   dataArr.forEach(data => {
//     console.log(`${data.name}'s total scholarship is: ${data.totalScholarship()}`)
//   })
// })

/** FIND (SQL called: SELECT ... FROM ...) */
// Student.find({ name: 'Jeremy' }).then(data => console.log(data))

// Student.findOne({ name: 'Jeremy' }).then(data => console.log(data))

// Student.find({ 'scholarship.merit': { $gte: 1500 } }).then(data => console.log(data))

/** INSERT */
const insertModel = (ModelConstructor, insertData, alias = 'data') => {
  const modelLiteral = new ModelConstructor(insertData)

  modelLiteral
    .save()
    .then(() => {
      console.log(`${ alias } has been saved into DB.`, new Date())
    }).catch((err) => {
      console.log(`Error happened when ${ alias } saved into DB.`, new Date());
      console.log(err);
    })

  return modelLiteral
}

// const insertName = 'John Wu9'
// insertModel(Student, { name: insertName, age: 22, major: 'Chem', scholarship: { merit: 100, other: 0 }}, insertName)

/** UPDATE */
// option 說明: if 沒有給 { new: true } option, callback msg 會給到 update 之前的 data
// Student
//   .findOneAndUpdate(
//     { name: 'Chili' },
//     { name: 'Chili Hot'},
//     { new: true }
//   )
//   .then(msg => console.log(msg))

/** DELETE */
// Student.deleteMany({ name: 'Jeremy' }).then(msg => console.log(msg))
// also can get data which been delete - use findOneAndDelete()
// Student
//   .findOneAndDelete({ 'scholarship.merit': { $lte: 2000 }})
//   .then(delData => console.log(delData))

app.get('/', (req, res) => {
  res.render('index.ejs')
})

app.listen(3000, () => {
  console.log('connected port 3000');
})