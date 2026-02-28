'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var objsSchema = new Schema({
    image           : {type: String, default: null},
    title           : [{
        key            : {type: String, default: null},
        value          : {type: String, default: null},
    }],
    owner           : {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
    size            : {type: String, default: null},
    technique       : [{
        key            : {type: String, default: null},
        value          : {type: String, default: null}
    }],
    price           : {type: Number, default: 0},
    concept         : [{
        key            : {type: String, default: null},
        value          : {type: String, default: null},
    }],
    category        : {type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: "696ba0aeb799e545608d56ac" }, // จิตรกรรม
    presentation    : {type: mongoose.Schema.Types.ObjectId, ref: 'Presentation', default: "696b9f44b799e545608d5690" }, // แขวนผนัน
    status          : {
        approval        : {type: mongoose.Schema.Types.ObjectId, ref: 'Setting_Status', default: "69677d4de5f76f7a8c42dbf6" }, // Pending 
        sale            : {type: mongoose.Schema.Types.ObjectId, ref: 'Setting_Status', default: "69678075e5f76f7a8c42dc12" }, // Not for sale
    }, 
    location        : {type: mongoose.Schema.Types.ObjectId, ref: 'Location', default: "696c55d5060c692480c7df5b"}, // ศิลปินจัดเก็บด้วยตัวเอง
    // สัดส่วนการจัดสรรผลงาน จำเป้นไหม ???
}, { timestamps: true });

module.exports = mongoose.model('Artwork', objsSchema, 'Artwork');
