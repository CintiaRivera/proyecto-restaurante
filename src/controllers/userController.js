import UserModel from '../models/userSchema.js';
import bcrypt from 'bcryptjs';

export const getUsers = async (_, res) => {
  try {
    const data = await UserModel.find({});
    const filteredData = data
      .filter((user) => user._doc.isActive === true)
      .map((user) => ({
        ...user._doc,
        password: undefined,
        isActive:undefined,
      }));
    res.json({ data: filteredData, message: 'Usuarios encontrados' });
  } catch (e) {
    console.error(e);
  }
  res
    .status(500)
    .json({ data: null, message: 'Ocurrio un error al conectarse a la DB' });
};

export const postUser = async (req, res) => {
  const { body } = req;

  const hashedPassword = bcrypt.hashSync(body.password, 10);

  const newUser = new UserModel({
    firstname: body.firstname,
    lastname: body.lastname,
    username: body.username,
    password: hashedPassword,
    isActive: true,
    isAdmin: false,
  });
  try {
    await newUser.save();

    res
      .status(201)
      .json({ data: null, message: 'Usuario creado exitosamente' });
  } catch (e) {
    if (e.message.includes('duplicate')) {
      res
        .status(400)
        .json({ data: null, message: 'El nombre de usuario ya esta en uso' });
      return;
    }
    res
      .status(500)
      .json({ data: null, message: 'Ocurrio un error guardando el usuario' });
  }
};

export const putUser = async (req, res) => {
  const {
    body,
    params: { id },
  } = req;
  try {
    const action = await UserModel.updateOne({ _id: id }, body);
    if (action.modifiedCount === 0) {
      res.status(400).json({
        data: null,
        message: 'No se encontro un usuario con ese id',
      });
      return;
    }

    res.json({
      data: null,
      message: 'El usuario ha sido actualizado exitosamente',
    });
  } catch (e) {
    if (e.message.includes('duplicate')) {
      res
        .status(400)
        .json({ data: null, message: 'El nombre de usuario ya esta en uso' });
      return;
    }
    res.status(500).json({
      data: null,
      message: 'Ocurrio un error actualizando el usuario',
    });
  }
};

export const deleteUser = async (req, res) => {
  const {
    params: { id },
  } = req;
  try {
    const action = await UserModel.updateOne({ _id: id }, { isActive: false });
    if (action.modifiedCount === 0) {
      res.status(400).json({
        data: null,
        message: 'No se encontro un usuario con ese id',
      });
      return;
    }

    res.json({
      data: null,
      message: 'El usuario ha sido eliminado exitosamente',
    });
  } catch (e) {
    res.status(500).json({
      data: null,
      message: 'Ocurrio un error eliminando el usuario',
    });
  }
};
