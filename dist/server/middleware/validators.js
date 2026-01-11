"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginRules = exports.registerRules = exports.validate = void 0;
const express_validator_1 = require("express-validator");
// Función auxiliar para verificar resultados de validación en el controlador
// Si hay errores, responde automáticamente y detiene el flujo.
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => err.msg) // Devuelve lista limpia de mensajes
        });
    }
    next();
};
exports.validate = validate;
// Reglas de validación para REGISTRO
exports.registerRules = [
    (0, express_validator_1.body)('email')
        .isEmail().withMessage('El formato del correo electrónico no es válido')
        .normalizeEmail(), // Convierte a minúsculas, quita espacios, etc.
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/\d/).withMessage('La contraseña debe contener al menos un número'),
    // .matches(/[A-Z]/).withMessage('Debe contener una mayúscula (Opcional por ahora)'),
    (0, express_validator_1.body)('nombre')
        .optional()
        .trim()
        .notEmpty().withMessage('El nombre no puede estar vacío si se envía')
];
// Reglas de validación para LOGIN
exports.loginRules = [
    (0, express_validator_1.body)('email')
        .isEmail().withMessage('Ingrese un correo electrónico válido')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
];
