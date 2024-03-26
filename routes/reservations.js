const express = require('express');
const {getReservations, getReservation, addReservation, updateReservation, deleteReservation ,getUserReservations ,getReservationsInRange } = require('../controllers/reservations');

const router = express.Router({mergeParams: true});

const {protect, authorize} = require('../middleware/auth');

router.route('/').get(protect, getReservations).post(protect, authorize('admin', 'user'), addReservation);
router.route('/:id').get(protect, authorize('admin', 'user'), getReservation).put(protect, authorize('admin', 'user'), updateReservation).delete(protect, authorize('admin', 'user'), deleteReservation);


router.route('/user/:userId').get(getUserReservations);
//router.route('/range/:start/:end').get(getReservationsInRange);
router.route('/range/:start/:end').get(protect, authorize('user','admin'),getReservationsInRange);



module.exports = router;