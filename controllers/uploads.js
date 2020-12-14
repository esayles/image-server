const multer = require("multer");
const path = require("path");
const fs = require("fs");
const config = require("../config.json");

const uploadDir = path.join(__dirname, "..", "data", "fakes");

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, `${Date.now().toString(16)}fake`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (blacklisted.some(extension => ext === extension)) {
            return cb(new Error(`The file extension ${ext.replace(".", "")} is not allowed to be uploaded`), false);
        }
        return cb(null, true);
    }
}).single("file");

class Uploads {

    constructor() {
        throw new Error("This class may not be initiated with new");
    }

    static randomFile(root) {
        const dirs = fs.readdirSync(root);
        const length = dirs.length;
        const getRandomIndex = length => Math.floor( Math.random() * length );

        let randomIndex = getRandomIndex( length );
        return dirs[randomIndex];
    }

    static async upload(req, res) {
        upload(req, res, async error => {
            if (error) {
                console.error(error);
                return res.json({ message: error.message || String(error) });
            }

            const files = [];

            if (!req.files || !req.files.length) return res.status(400).json({ message: "No files" });

            files.push({
                    mimetype: req.file.mimetype,
                    url: `${config.domain}/${file.filename}`,
                    timestamp: Date.now()
            });
            
            return res.json({ message: `Sucessfully uploaded ${files.length} files`, files });
        });
    }

    static async getFile(req, res) {
        return res.sendFile(path.join(uploadDir, Uploads.randomFile(uploadDir)));
    }

}

module.exports = Uploads;
