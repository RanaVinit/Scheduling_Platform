const service = require("../services/eventTypeService");
const { HTTP_STATUS } = require("../config/constants");

exports.getAll = async (req, res) => {
    try {
        const eventTypes = await service.getAllEventTypes();
        res.json({ success: true, data: eventTypes });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};

exports.getOne = async (req, res) => {
    try {
        const eventType = await service.getEventTypeById(req.params.id);
        if (!eventType) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Event type not found" });
        }
        res.json({ success: true, data: eventType });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { title, durationMinutes, slug } = req.body;
        if (!title || !durationMinutes || !slug) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Title, duration, and slug are required" });
        }
        const eventType = await service.createEventType(req.body);
        res.status(HTTP_STATUS.CREATED).json({ success: true, data: eventType });
    } catch (error) {
        res.status(error.status || HTTP_STATUS.BAD_REQUEST).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const eventType = await service.updateEventType(req.params.id, req.body);
        res.json({ success: true, data: eventType });
    } catch (error) {
        res.status(error.status || HTTP_STATUS.BAD_REQUEST).json({ error: error.message });
    }
};

exports.remove = async (req, res) => {
    try {
        await service.deleteEventType(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};
