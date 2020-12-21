const { request, response } = require("express");
const Equipment = require("../models/equipment");

exports.addEquipment = async (request, response) => {
  //create new equipment from request
  const new_equipment = {
    name: request.body.name,
    rent: request.body.rent,
    totalAmount: 1,
    availableAmount: 1,
    rentedAmount: 0,
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

/* INCREASE QUANTITY */
exports.incrementQuantity = async (request, response) => {
  const id = request.params.id;

  try {
    let equipment = await Equipment.findById(id).orFail();

    equipment.totalAmount++;
    equipment.availableAmount++;

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
  const id = request.params.id;

  try {
    let equipment = await Equipment.findById(id).orFail();

    if (equipment.availableAmount === 0)
      return response
        .status(400)
        .json({ error: { message: "Cannot decrement" } });

    equipment.totalAmount--;
    equipment.availableAmount--;

    equipment.save();

    return response.status(200).json({
      message: "Decremented successfully",
      amount: equipment.totalAmount,
    });
  } catch (error) {
    return response.status(500).json({ error });
  }
};
