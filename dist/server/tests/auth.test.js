"use strict";
const request = require('supertest');
const app = require('../index');
const { pool } = require('../config/db');
// Cerramos la conexión a la base de datos al finalizar todas las pruebas
afterAll(async () => {
    await pool.end();
});
describe('POST /api/login', () => {
    // Caso 1: Login Exitoso
    it('Debe retornar 200 y el usuario si las credenciales son correctas', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({
            email: 'admin@test.com',
            password: 'admin123'
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.user).toHaveProperty('email', 'admin@test.com');
    });
    // Caso 2: Login Fallido (Contraseña incorrecta)
    it('Debe retornar 401 si la contraseña es incorrecta', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({
            email: 'admin@test.com',
            password: 'wrongpassword'
        });
        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBeDefined();
    });
    // Caso 3: Fallo de Validación (Email inválido)
    // Gracias al middleware express-validator esto debería devolver 400
    it('Debe retornar 400 si el email no es válido', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({
            email: 'notanemail',
            password: 'admin123'
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toBeDefined();
    });
});
