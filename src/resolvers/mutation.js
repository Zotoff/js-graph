import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

import {
  AuthenticationError,
  ForbiddenError
}  from 'apollo-server-express';

import dotenv from 'dotenv';
import gravatar from '../util/gravatar.js'; // Для dotenv
dotenv.config();

const Mutation = {
  newNote: async (parent, args, { models, user }) => {
    if (!user) {
      throw new ForbiddenError('Not authorized');
    }
    return await models.Note.create({
      content: args.content,
      author: new mongoose.Types.ObjectId(user.id)
    })
  },
  deleteNote: async (parent, { id }, { models, user }) => {
    if (!user) {
      throw new ForbiddenError('Not authorized');
    }
    const note = await models.Note.findById(id);
    // если автор не совпадает с пользователем, выбрасываем ошибку
    if (note && note.author.toString() !== user.id) {
      throw new ForbiddenError(
        'You are not the author of this note'
      );
    }

    try {
      await note.remove();
      return true
    } catch (err) {
      return false
    }
  },
  updateNote: async (parent, { content, id }, { models, user }) => {
    if (!user) {
      throw new ForbiddenError('Not authorized');
    }
    // находим заметку
    const note = await models.Note.findById(id);
    if (note && note.author.toString() !== user.id) {
      throw new ForbiddenError(
        'You are not the author of this note'
      );
    }
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
  },
  toggleFavorite: async (parent, { id }, { models, user }) => {
    if (!user) {
      throw new ForbiddenError('Not authorized');
    }
    let noteCheck = await models.Note.findById(id);
    const hasUser = noteCheck.favoritedBy.indexOf(user.id);

    if (hasUser >= 0) {
      return await models.Note.findOneAndUpdate(
        { _id: id },
        {
          $pull: {
            favoritedBy: new mongoose.Types.ObjectId(user.id)
          },
          $inc: {
            favoriteCount: -1
          }
        },
        {
          // возвращаем обновленную заметку
          new: true
        }
      )
    } else {
      return await models.Note.findOneAndUpdate(
        { _id: id },
        {
          $push: {
            favoritedBy: new mongoose.Types.ObjectId(user.id)
          },
          $inc: {
            favoriteCount: 1
          }
        },
        {
          // возвращаем обновленную заметку
          new: true
        }
      )
    }
  }
}

export default Mutation;