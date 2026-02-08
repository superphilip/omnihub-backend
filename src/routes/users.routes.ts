import { Router } from 'express';
import * as UserController from '../controllers/users.controller.js';
import { validateBody } from '../middlewares/validateBody.js';
import { signupSchema, confirmOCRSchema, updateUserSchema } from '../validators/user.validator.js';
import { uploadTo } from '../middlewares/upload.middleware.js';
import { authenticate, checkRouteAccess } from '../middlewares/authMiddleware.js';


const router = Router();

router.post('/signup', validateBody(signupSchema), UserController.signup);
router.get('/document-types', UserController.getDocumentTypes);

router.use(authenticate);
router.use(checkRouteAccess);

//Trae el usuario por ID
router.get('/:id', UserController.getUserById);
// Actualiza el usuario por ID
router.put(
    '/:id',
    validateBody(updateUserSchema),
    UserController.updateUser
);
// Actualiza el documento del usuario por ID
router.post(
    '/:id/documents/:docType',
    uploadTo('users').single('file'),
    UserController.updateUserDocument
);
// Confirma la identidad del usuario por ID
router.post(
    '/:id/confirm-identity',
    validateBody(confirmOCRSchema),
    UserController.confirmIdentity
);
// Admin - Gestiona el estado del usuario (activar/desactivar, etc)
router.put(
    '/:id/status',
    UserController.manageUserStatus
);
// Admin - Obtiene todos los usuarios
router.get('/', UserController.getAllUsers);


export default router;