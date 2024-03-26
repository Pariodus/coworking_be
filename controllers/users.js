const User = require("../models/User");

//@desc     Get all users
//@route    GET /api/v1/users
//@access   Private (for admin only)
exports.getUsers = async (req, res, next) => {
  try {
    // Check if the user is an admin
    if (req.user.role !== "admin") {
      return res.status(401).json({ success: false, message: "Unauthorized access"});
    }

    // Fetch all users from the database
    const users = await User.find();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot get users" });
  }
};


//@desc   Update user
//@route  PUT /api/v1/users/:userid
//@access Private
exports.updateUser = async (req, res, next) => {
    try {
      let user = await User.findById(req.params.userId);
  
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      if (req.user.role === 'admin' || req.user._id.toString() === user._id.toString()) {
        if (req.body.name) {
          user.name = req.body.name;
        }
        if (req.body.email) {
          user.email = req.body.email;
        }
        if (req.body.tel) {
          user.tel = req.body.tel;
        }
        if (req.body.role && req.user.role === 'admin') {
          user.role = req.body.role;
        }
        if (req.body.password) {
          // Hash the password before saving
          user.password = req.body.password;
        }
  
        // Save updated user
        await user.save();
  
        res.status(200).json({ success: true, data: user });
      } else {
        return res.status(401).json({ success: false, message: "Unauthorized access" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Cannot update user" });
    }
  };
  

//@desc     Delete user
//@route    Delete /api/v1/users/:id
//@access   Private (for admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    // Check if the user is an admin
    // Find user by ID
    let user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (req.user.role === 'admin' || req.user._id.toString() === user._id.toString()) {
      // Delete user
      await user.deleteOne();

      res.status(200).json({ success: true, message: "User deleted successfully" });
    } else {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Cannot delete user" });
  }
};

