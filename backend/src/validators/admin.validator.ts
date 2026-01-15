import { query } from "express-validator";

const getBuildingByIdValidation = [
    query("buildingId")
        .notEmpty()
        .withMessage("Missing buildingId")
        .trim()
        .isMongoId()
        .withMessage("Invalid buildingId"),
];

const getBuildingsByCampusIdValidation = [
    query("campusId")
        .notEmpty()
        .withMessage("Missing campusId")
        .trim()
        .isMongoId()
        .withMessage("Invalid campusId"),
];

const getRoomByIdValidation = [
    query("roomId")
        .notEmpty()
        .withMessage("Missing roomId")
        .trim()
        .isMongoId()
        .withMessage("Invalid roomId"),
];

const getRoomsByBuildingIdValidation = [
    query("buildingId")
        .notEmpty()
        .withMessage("Missing buildingId")
        .trim()
        .isMongoId()
        .withMessage("Invalid buildingId"),
];

const getCampusByIdValidation = [
    query("campusId")
        .notEmpty()
        .withMessage("Missing campusId")
        .trim()
        .isMongoId()
        .withMessage("Invalid campusId"),
];

const moveBuildingValidation = [
    query("buildingId")
        .notEmpty()
        .withMessage("Missing buildingId")
        .trim()
        .isMongoId()
        .withMessage("Invalid buildingId"),
    query("newCampusId")
        .notEmpty()
        .withMessage("Missing newCampusId")
        .trim()
        .isMongoId()
        .withMessage("Invalid newCampusId"),
];

const moveRoomValidation = [
    query("roomId")
        .notEmpty()
        .withMessage("Missing roomId")
        .trim()
        .isMongoId()
        .withMessage("Invalid roomId"),
    query("newBuildingId")
        .notEmpty()
        .withMessage("Missing newBuildingId")
        .trim()
        .isMongoId()
        .withMessage("Invalid newBuildingId"),
];

const mergeBuildingsValidation = [
    query("sourceBuildingId")
        .notEmpty()
        .withMessage("Missing sourceBuildingId")
        .trim()
        .isMongoId()
        .withMessage("Invalid sourceBuildingId"),
    query("targetBuildingId")
        .notEmpty()
        .withMessage("Missing targetBuildingId")
        .trim()
        .isMongoId()
        .withMessage("Invalid targetBuildingId"),
];

const mergeRoomsValidation = [
    query("sourceRoomId")
        .notEmpty()
        .withMessage("Missing sourceRoomId")
        .trim()
        .isMongoId()
        .withMessage("Invalid sourceRoomId"),
    query("targetRoomId")
        .notEmpty()
        .withMessage("Missing targetRoomId")
        .trim()
        .isMongoId()
        .withMessage("Invalid targetRoomId"),
];

const updateRoomValidation = [
    query("roomId")
        .notEmpty()
        .withMessage("Missing roomId")
        .trim()
        .isMongoId()
        .withMessage("Invalid roomId"),
    query("details")
        .notEmpty()
        .withMessage("Missing details"),
];

const updateBuildingValidation = [
    query("buildingId")
        .notEmpty()
        .withMessage("Missing buildingId")
        .trim()
        .isMongoId()
        .withMessage("Invalid buildingId"),
    query("details")
        .notEmpty()
        .withMessage("Missing details"),
];

export {
    getBuildingByIdValidation,
    getBuildingsByCampusIdValidation,
    getRoomByIdValidation,
    getRoomsByBuildingIdValidation,
    getCampusByIdValidation,
    moveBuildingValidation,
    moveRoomValidation,
    mergeBuildingsValidation,
    mergeRoomsValidation,
    updateRoomValidation,
    updateBuildingValidation,
};