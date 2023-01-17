import express from 'express'
import ejs from 'ejs'
import mongoose from 'mongoose'

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
    enum: ['EE', 'CS', 'Account'],
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

// create a model from Student Schema
/** notice: model 命名必須是單數，必須大寫開頭 */
const Student = mongoose.model('Student', studentSchema)

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
console.log('insert before')
insertModel(Student, { name: 'Mary', age: 25, major: 'CS', scholarship: { merit: 5000, other: 1000 }}, 'Mary')
console.log('insert after')
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