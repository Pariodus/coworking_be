const Reservation = require("../models/Reservation");
const Coworking = require("../models/Coworking");

//@desc     Get all reservations
//@route    GET /api/v1/reservations
//@access   Private
exports.getReservations = async (req, res, next) => {
  let query;
  //General users can see only their reservations!
  if (req.user.role !== "admin") {
    query = Reservation.find({ user: req.user.id }).populate({
      path: "coworking",
      select: "name province tel",
    });
  } else {
    //If you are an admin, you can see all!
    if (req.params.coworkingId) {
      console.log(req.params.coworkingId);
      query = Reservation.find({ coworking: req.params.coworkingId }).populate({
        path: "coworking",
        select: "name province tel",
      });
    } else {
      query = Reservation.find().populate({
        path: "coworking",
        select: "name province tel",
      });
    }
  }
  try {
    const reservations = await query;
    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Reservation" });
  }
};

//desc      Get single reservation
//route     GET /api/v1/reservations/:id
//access    Public
exports.getReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate({
      path: "coworking",
      select: "name description tel",
    });

    if (!reservation) {
      return res
        .status(404)
        .json({
          success: false,
          message: `No reservation with the id of ${req.params.id}`,
        });
    }

    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Reservation" });
  }
};

//@desc     Add single reservation
//@route    POST /api/v1/coworkings/:coworkingId/reservations/
//@access   Public
exports.addReservation = async (req, res, next) => {
  try {
    req.body.coworking = req.params.coworkingId;

    const coworking = await Coworking.findById(req.params.coworkingId);

    const start = req.body.reserveDateStart.split("T")[1].split(".")[0];
    const end = req.body.reserveDateEnd.split("T")[1].split(".")[0];
    const costart = coworking.openTime;
    const coend = coworking.closeTime;

    const startcompare = new Date(`2000-01-01T${start}`);
    const endcompare = new Date(`2000-01-01T${end}`);
    const costartcompare = new Date(`2000-01-01T${costart}`);
    const coendcompare = new Date(`2000-01-01T${coend}`);

    startcompare.setHours(startcompare.getHours() + 7);
    endcompare.setHours(endcompare.getHours() + 7);
    costartcompare.setHours(costartcompare.getHours() + 7);
    coendcompare.setHours(coendcompare.getHours() + 7);

    if (req.body.reserveDateStart > req.body.reserveDateEnd) {
      return res
        .status(500)
        .json({ success: false, message: "Please reserve again" });
    }

    if (startcompare < costartcompare) {
      return res
        .status(500)
        .json({
          success: false,
          message: `Sorry, ${coworking.name} is closing.`,
        });
    }

    if (endcompare > coendcompare) {
      return res
        .status(500)
        .json({
          success: false,
          message: `Sorry, ${coworking.name} is closing.`,
        });
    }

    if (!coworking) {
      return res
        .status(404)
        .json({
          success: false,
          message: `No coworking with the id of ${req.params.coworkingId}`,
        });
    }

    //add user Id to req.body
    req.body.user = req.user.id;
    //Check for existed reservation
    const existedReservations = await Reservation.find({ user: req.user.id });
    //If the user is not an admin, they can only create 3 reservation.
    if (existedReservations.length >= 3 && req.user.role !== "admin") {
      return res
        .status(400)
        .json({
          success: false,
          message: `The user with ID ${req.user.id} has already made 3 reservations`,
        });
    }

    const reservation = await Reservation.create(req.body);
    res.status(201).json({ success: true, data: reservation });

  } catch (err) {
    console.log(err.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot create reservation" });
  }
};


//@desc     Update reservation
//@route    PUT /api/v1/reservations/:reservationID
//@access   Private
exports.updateReservation = async (req, res, next) => {
  try {
    let reservation = await Reservation.findById(req.params.id);
    // let coworking = await Coworking.findById(reservation.coworking);

    if (!reservation) {
      return res.status(404).json({ success: false, message: `No appt with id ${req.params.id}` });
    }

    if (reservation.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({success: false, message: `User ${req.user.id} is not authorized to update this reservation`});
    }

    if (req.body.reserveDateStart > req.body.reserveDateEnd) {
      return res.status(500).json({ success: false, message: "Please reserve again" });
    }

    if(req.body.reserveDateStart){
      const start = req.body.reserveDateStart.split("T")[1].split(".")[0];
      const startcompare = new Date(`2000-01-01T${start}`);
      startcompare.setHours(startcompare.getHours() + 7);

      let coworking = await Coworking.findById(reservation.coworking);
      const costart = coworking.openTime;
      const costartcompare = new Date(`2000-01-01T${costart}`);
      costartcompare.setHours(costartcompare.getHours() + 7);

      if (startcompare < costartcompare) {
          return res
            .status(500)
            .json({
              success: false,
              message: `Sorry, ${coworking.name} is closing.`,
            });
        }
    }

    if(req.body.reserveDateEnd){
      const end = req.body.reserveDateEnd.split("T")[1].split(".")[0];
      const endcompare = new Date(`2000-01-01T${end}`);
      endcompare.setHours(endcompare.getHours() + 7);

      let coworking = await Coworking.findById(reservation.coworking);
      const coend = coworking.closeTime;
      const coendcompare = new Date(`2000-01-01T${coend}`);
      coendcompare.setHours(coendcompare.getHours() + 7);

      if (endcompare > coendcompare) {
          return res
            .status(500)
            .json({
              success: false,
              message: `Sorry, ${coworking.name} is closing.`,
            });
        }
    }

    reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});

    res.status(200).json({ success: true, data: reservation });
  } catch (err) {
    console.log(err.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot update Reservation" });
  }
};

//@desc     Delete reservation
//@route    DELETE /api/v1/reservations/:id
//@access   Private
exports.deleteReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res
        .status(404)
        .json({ success: false, message: `No appt with id ${req.params.id}` });
    }

    //Make sure user is the reservation owner
    if (
      reservation.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(401)
        .json({
          success: false,
          message: `User ${req.user.id} is not authorized to delete this bootcapm`,
        });
    }

    await reservation.deleteOne();

    res.status(200).json({ success: true, date: {} });
  } catch (err) {
    console.log(err.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot delete reservation" });
  }
};

//@desc     Get user reservations
//@route    GET /api/v1/reservations/user/:userId
//@access   Public
exports.getUserReservations = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const reservations = await Reservation.find({ user: userId }).populate({
      path: "coworking",
      select: "name province tel",
    });

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Cannot find reservations for the user",
      });
  }
};


//@desc     Get reservations within a specified time range
//@route    GET /api/v1/reservations/range/:start/:end
//@access   Public
exports.getReservationsInRange = async (req, res, next) => {
    try {
      // Check if the user making the request is an admin
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Only admin" });
      }
  
      // Convert start and end parameters to Date objects
      const start = new Date(req.params.start);
      const end = new Date(req.params.end);
  
      // Check if the conversion was successful
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid date format" });
      }
  
      // Find reservations within the specified time range
      const reservations = await Reservation.find({
        reserveDateStart: { $gte: start },
        reserveDateEnd: { $lte: end },
      }).populate({
        path: "coworking",
        select: "name province tel",
      });
  
      res.status(200).json({
        success: true,
        count: reservations.length,
        data: reservations,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Cannot find reservations within the specified time range" });
    }
  };