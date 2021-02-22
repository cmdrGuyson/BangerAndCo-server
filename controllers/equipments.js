const { request, response } = require("express");
const moment = require("moment");
const Equipment = require("../models/equipment");
const Rent = require("../models/rent");

exports.addEquipment = async (request, response) => {
  //create new equipment from request
  const new_equipment = {
    name: request.body.name,
    rent: request.body.rent,
    totalAmount: 1,
  };

  try {
    //Save in database and return response
    const equipment = await Equipment.create(new_equipment);
    return response.status(200).json(equipment);
  } catch (error) {
    return response.status(500).json({ error });
  }
};

/* GET INFORMATION ON ALL Equipment */
exports.getAllEquipment = async (request, response) => {
  try {
    const equipment = await Equipment.find();
    return response.status(200).json({ equipment });
  } catch (error) {
    return response.status(500).json({ error });
  }
};

/* GET LIST OF AVAILABLE EQUIPMENT GIVEN DROP OFF AND PICKUP DATE */
exports.getAvailableEquipment = async (request, response) => {
  //Get user input
  const userInput = {
    pickupDate: request.params.pickupDate,
    dropoffDate: request.params.dropoffDate,
  };

  try {
    //Pickup and Dropoff as Date objects
    const pickup = new Date(
      moment(userInput.pickupDate, "YYYY-MM-DD").add(1, "day").format()
    );

    const dropoff = new Date(
      moment(userInput.dropoffDate, "YYYY-MM-DD").add(1, "day").format()
    );

    const rents = await Rent.find({
      $or: [{ status: "pending" }, { status: "collected" }],
    });

    //Active rents in the selected period
    let activeEquipmentIds = [];

    //If car has previous rents that are pending
    if (rents.length > 0) {
      rents.forEach((rent) => {
        let possibleDropOffDate = new Date(
          moment(rent.rentedFrom).set({ hour: 0, minute: 0, second: 0 })
        );
        let possiblePickUpDate = new Date(
          moment(rent.rentedTo)
            .add(2, "day")
            .set({ hour: 0, minute: 0, second: 0 })
        );
        if (dropoff > possibleDropOffDate && pickup < possiblePickUpDate) {
          activeEquipmentIds.push(...rent.additionalEquipment);
        }
      });
    }

    //Number of equipment used in active rents
    let activeEquipmentCounts = getCounts(activeEquipmentIds);

    //Get all equipments
    const equipments = await Equipment.find();

    let availableEquipment = [];

    //Check if there are any equipments available by comparing rented equipment with totals
    equipments.forEach((equipment) => {
      if (!activeEquipmentCounts[equipment._id.toString()]) {
        availableEquipment.push(equipment);
      } else if (
        equipment.totalAmount > activeEquipmentCounts[equipment._id.toString()]
      ) {
        availableEquipment.push(equipment);
      }
    });

    return response.status(200).json({ availableEquipment });
  } catch (error) {
    return response.status(500).json({ error });
  }
};

/* INCREASE QUANTITY */
exports.incrementQuantity = async (request, response) => {
  try {
    const id = request.params.id;

    let equipment = await Equipment.findById(id).orFail();

    equipment.totalAmount++;

    equipment.save();

    return response.status(200).json({
      message: "Incremented successfully",
      amount: equipment.totalAmount,
    });
  } catch (error) {
    return response.status(500).json({ error });
  }
};

/* DECREMENT QUANTITY */
exports.decrementQuantity = async (request, response) => {
  try {
    const id = request.params.id;

    let equipment = await Equipment.findById(id).orFail();

    if (equipment.totalAmount === 0)
      return response
        .status(400)
        .json({ error: { message: "Cannot decrement" } });

    equipment.totalAmount--;

    equipment.save();

    return response.status(200).json({
      message: "Decremented successfully",
      amount: equipment.totalAmount,
    });
  } catch (error) {
    return response.status(500).json({ error });
  }
};

const getCounts = (array) => {
  var counts = {};
  for (p = 0; p < array.length; p++) {
    counts[array[p]] = counts[array[p]] + 1 || 1;
  }
  return counts;
};
