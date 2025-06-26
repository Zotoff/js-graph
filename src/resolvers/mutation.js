import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import {
  AuthenticationError,
  ForbiddenError
}  from 'apollo-server-express';

import dotenv from 'dotenv';
import gravatar from '../util/gravatar.js'; // Для dotenv
dotenv.config();

const Mutation = {
  newNote: async (parent, args, { models }) => {
    return await models.Note.create({
      content: args.content,
      author: "Me"
    })
  },
  deleteNote: async (parent, { id }, { models }) => {
    try {
      await models.Note.findOneAndDelete({
        _id: id
      })
      return true
    } catch (err) {
      return false
    }
  },
  updateNote: async (parent, { content, id }, { models }) => {
    return await models.Note.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          content
        }
      },
      {
        new: true
      }
    );
  },
  signUp: async (parent, { username, email, password }, { models }) => {

    // Нормализуем имейл
    email = email.trim().toLowerCase();
    // Хешируем пароль

    const hashed = await bcrypt.hash(password, 10);
    // Создаем url gravatar-изображения

    const avatar = gravatar(email);
    try {
      const user = await models.User.create({
        username,
        email,
        avatar,
        password: hashed
      });

      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not set");
      }

      // Создаем и возвращаем json web token
      return jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    } catch (err) {
      console.log(err);
      // Если при регистрации возникла проблема, выбрасываем ошибку
      throw new Error('Error creating account');
    }
  },
  signIn: async (parent, { username, email, password }, { models }) => {

    if (email) {
      // Нормализуем e-mail
      email = email.trim().toLowerCase();
    }

    const user = await models.User.findOne({
      $or: [{ email }, { username }]
    });

    // Если пользователь не найден, выбрасываем ошибку аутентификации
    if (!user) {
      throw new AuthenticationError('Error signing in');
    }

    // Если пароли не совпадают, выбрасываем ошибку аутентификации
    const valid = await   bcrypt.compare(password, user.password);

    if (!valid) {

      throw new AuthenticationError('Error signing in');

    }

    // Создаем и возвращаем json web token
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  }
}

export default Mutation;