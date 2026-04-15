const service = require("../services/availabilityService");
const { HTTP_STATUS } = require("../config/constants");

exports.get = async (req, res) => {
    try {
        const schedule = await service.getAvailability();
        res.json({ success: true, data: schedule });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { timezone, rules } = req.body;
        const schedule = await service.updateAvailability(timezone, rules);
        res.json({ success: true, data: schedule });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};