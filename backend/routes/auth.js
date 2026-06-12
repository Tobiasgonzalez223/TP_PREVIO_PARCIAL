const express = require('express');
const router = express.Router();
// Importamos el controlador de auth (vas a tener que crearlo en la carpeta controllers)
const authController = require('../controllers/authController');

// POST /api/auth/register [cite: 97]
router.post('/register', authController.register);

// POST /api/auth/login [cite: 98]
router.post('/login', authController.login);

module.exports = router;