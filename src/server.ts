import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import setupRouter from './routes/setup.routes.js';
import permissionRouter from './routes/permission.routes.js';
import roleRouter from './routes/role.routes.js';
import authRouter from './routes/auth.routes.js';
import permissionRoutesRouter from './routes/permissionRoute.routes.js';
import usersRouter from './routes/users.routes.js';
import permissionTemplateRouter from './routes/permissionTemplate.routes.js';
import locationRoutes from './routes/location.routes.js';
import routeRoutes from './routes/route.routes.js';
import loanRoutes from './routes/loan.routes.js';
import LoanLimitRoutes from './routes/loanLimit.routes.js';
import loanProductRoutes from './routes/loanProduct.routes.js';
import installmentRoutes from './routes/installment.routes.js';
import cashRegisterRouter from './routes/cashRegister.routes.js';
import cashMovementRouter from './routes/cashMovement.routes.js';
import walletRoutes from './routes/wallet.routes.js';
import walletTransactionRoutes from './routes/walletTransaction.routes.js';
import investorRoutes from './routes/investor.routes.js';
import investorMovementRoutes from './routes/investorMovement.routes.js';
import expenseRoutes from './routes/expense.routes.js';
import expenseCategoryRoutes from './routes/expenseCategory.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';




const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/setup', setupRouter);
app.use('/api/permissions', permissionRouter);
app.use('/api/roles', roleRouter);
app.use('/api/auth', authRouter);
app.use('/api/permission-routes', permissionRoutesRouter);
app. use('/api/permission-templates', permissionTemplateRouter);
app.use('/api/users', usersRouter);
app.use('/api/locations', locationRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/loan-limits', LoanLimitRoutes)
app.use('/api/loan-products', loanProductRoutes);
app.use('/api/installments', installmentRoutes);
app.use('/api/cash-registers', cashRegisterRouter);
app.use('/api/cash-movements', cashMovementRouter);
app.use('/api/wallets', walletRoutes);
app.use('/api/walletsTransactions', walletTransactionRoutes);
app.use('/api/investors', investorRoutes);
app.use('/api/investor-movements', investorMovementRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/expense-categories', expenseCategoryRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API con node.js' });
});

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";

app.listen(Number(PORT),HOST, () => {
    console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
});