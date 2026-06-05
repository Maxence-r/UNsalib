import { Schema, model } from 'mongoose';

const MaintenanceSchema = new Schema({
    key: {
        type: String,
        default: 'global',
        unique: true,
        immutable: true
    },
    maintenance: {
        type: Boolean,
        default: false
    },
    vacation: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Maintenance = model('Maintenance', MaintenanceSchema);

export default Maintenance;
