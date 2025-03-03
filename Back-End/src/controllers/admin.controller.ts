const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Admin } = require('../models/admin.model');
const { userProvider } = require('../providers/index.provider');

export const newAdmin = async (req: any, res: any) => {
    const { username, password } = req.body;
    // Validamos si el Admin ya existe en la base de datos
    const admin = await Admin.findOne({ where: { username: username } });
    if (admin) {
        return res.status(400).json({ msg: 'Ya existe el Admin con el nombre: ' + admin });
    };
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        // Guardamos el Admin en la base de datos
        await Admin.create({
            username: username,
            password: hashedPassword
        })
        res.json({ msg: 'Admin creado existosamente!' })
    } catch (err) {
        res.status(400).json({ msg: 'Error al crear el Admin' })
    };
  };

// ADMIN LOGIN
export const loginAdmin = async (req: any, res: any) => {  
  const { username, password } = req.body;
  try {
    const dbUser = await userProvider.validateUser(username, password);
    if (!dbUser) {
      return res.status(400).json({
        msg: 'No existe el Usuario con el nombre: '+ username
      });
    }
    // Validamos password // NO ME AVISA QUE LA CONTRA ES INCORRECTA EN BACK 
    const passwordValid = await bcrypt.compare(password, dbUser.password);
    if (!passwordValid) {
      return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
    }

    let role = "USER"; // Rol predeterminado SI NO es "admin" ni "encuestador"
    if (username === "admin") {
      role = "ADMIN";
    } else if (username === "encuestador") {
      role = "ENCUESTADOR";
    };

    const token = jwt.sign({ username: username, role: role },
      process.env.TOKEN_SECRET || 'secret');
      console.log("User role is:" ,role);
      res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error en Login General' });
  };
};