const express = require('express');
const router = express.Router();
const activosController = require('../controllers/activosController');
const { verifyToken } = require('../middlewares/authMiddleware');

// El listado de activos también debería estar protegido
router.get('/', verifyToken, activosController.listar);

module.exports = router;