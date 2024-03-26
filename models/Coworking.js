const mongoose = require('mongoose');

const CoworkingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    address:{
        type: String,
        required: [true, 'Please add an address']
    },
    tel:{
        type: String
    },
    openTime:{
        type: String
    },
    closeTime:{
        type: String
    },
    picture : { 
        type: String
    }
},{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

//Cascade delete reservations when a coworking is deleted
CoworkingSchema.pre('deleteOne', {document:true, query: false}, async function(next){
    console.log(`Reservations being removed from coworking ${this._id}`);
    await this.model('Reservation').deleteMany({coworking: this._id});
    next();
});

//Reverse populate with virtuals
CoworkingSchema.virtual('reservations', {
    ref: 'Reservation',
    localField: '_id',
    foreignField: 'coworking',
    justOne: false
});

module.exports=mongoose.model('Coworking', CoworkingSchema);



// exports.isTimeLater(time1, time2) {
//     const [hours1, minutes1, seconds1] = time1.split(':').map(Number);
//     const [hours2, minutes2, seconds2] = time2.split(':').map(Number);

//     if (hours1 > hours2) {
//         return true;
//     } else if (hours1 === hours2 && minutes1 > minutes2) {
//         return true;
//     } else if (hours1 === hours2 && minutes1 === minutes2 && seconds1 > seconds2) {
//         return true;
//     } else {
//         return false;
//     }
// };





// exports.checktime = (opentime,closetime,checkstarttime,checkendtime){
//     const starttime = this.Integer.valueOf(opentime);
//     const closetime = this.Integer.valueOf(closetime);
//     const checkstarttime = this.Integer.valueOf(checkstarttime);
//     const checkclosetime = this.Integer.valueOf(checkclosetime);

//     if(checkstarttime >= starttime && checkclosetime <= closetime ){
//         return true;
//     }
//     return false;
// }