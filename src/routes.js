const { Router } = require('express');

const UserController = require('./app/controllers/UserController');
const SessionController = require('./app/controllers/SessionController');
const FileController = require('./app/controllers/FileController');
const AppointmentController = require('./app/controllers/AppointmentController');
const SchenduleController = require('./app/controllers/SchenduleController');
const NotificationController = require('./app/controllers/NotificationsController');

const authMiddleware = require('./app/middlewares/auth');

const multer = require('multer');
const multerConfig = require('./config/multer');

const router = new Router();
const upload = multer(multerConfig);

router.post('/users', UserController.store);
router.post('/sessions', SessionController.store);

router.use(authMiddleware);

router.put('/users', UserController.update);

router.post('/files', upload.single('file'), FileController.store);

router.get('/appointments', AppointmentController.index);
router.post('/appointments', AppointmentController.store);
router.delete('/appointments/:id', AppointmentController.delete)

router.get('/schendule', SchenduleController.index);

router.get('/notifications', NotificationController.index);
router.put('/notifications/:id', NotificationController.update);

module.exports = router;