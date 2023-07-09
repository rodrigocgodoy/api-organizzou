import express from 'express';
import { getMeHandler } from '../controllers/user.controller';
import { isAuthenticated } from '../middleware/isAuthenticated';

const router = express.Router();

/**
 * @swagger
 * /users/me:
 *      get:
 *          summary: Get info on user
 *          tags:
 *              - Users
 *          description: Send a message to the server and get a response added to the original text.
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              responseText:
 *                                  type: string
 *                                  example: This is some example string! This is an endpoint
 *          responses:
 *              201:
 *                  description: Success
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  text:
 *                                      type: string
 *                                      example: This is some example string!
 *              404:
 *                  description: Not found
 *              500:
 *                  description: Internal server error
 */
router.get('/me', isAuthenticated, getMeHandler);

export default router;
