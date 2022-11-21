const mongoose = require('mongoose');
const slugify=require('slugify')
const studentsSchema = new mongoose.Schema(
    {
        name: {
        type: String,
        unique: true,
        requiers: true,
        },
        age: {
        type: Number,
        required: [true, "A student must have a age"],
        },
        ide: Number,
        createAt: {
            type: Date,
            default: Date.now(),
            select:false
        },
        slug:String
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

studentsSchema.virtual('halfIde').get(function () {
    return `the half of ide ${this.ide / 2}`;
})
studentsSchema.pre('save', function (next) {
    this.slug = slugify(`iaif332002${this.name}`);
    next();
});

const Student = mongoose.model('Student', studentsSchema);

module.exports = Student;

