import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const getStorage = (folderName: string) => multer.diskStorage({
    destination: (req, file, cb) => {
        const id = req.params.id;
        
        const uploadPath = id 
            ? path.join(__dirname, `../../public/uploads/${folderName}/${id}`)
            : path.join(__dirname, `../../public/uploads/${folderName}`);
        
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
        cb(null, uniqueName);
    }
});

export const uploadTo = (folder: string) => multer({
    storage: getStorage(folder),
    fileFilter: (req, file, cb) => {
        const forbidden = ['.exe', '.bat', '.sh', '.msi', '.com', '.bin', '.cmd'];
        const ext = path.extname(file.originalname).toLowerCase();
        
        if (forbidden.includes(ext)) {
            return cb(new Error('Archivo no permitido por seguridad.'));
        }
        cb(null, true);
    },
    limits: { 
        fileSize: 20 * 1024 * 1024 
    }
});