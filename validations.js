import { body } from "express-validator";

export const loginValidation = [
  body("email", "Неверный формат почты").isEmail(),
  body("password", "Пароль должен быть минимум 5 символов").isLength({
    min: 5,
  }),
];

export const registerValidation = [
  body("email", "Неверный формат почты").isEmail(),
  body("password", "Пароль должен быть минимум 5 символов").isLength({
    min: 5,
  }),
  body("fullName", "Укажите имя").isLength({ min: 3 }),
  body("avatarUrl", "Неверная ссылка на аватарку").optional().isString(),
];

export const postCreateValidation = [
  body("info_ru.title", "Введите заголовок статьи").isLength({ min: 3 }).isString(),
  body("info_ru.text", "Введите текст статьи").isLength({ min: 3 }).isString(),
  body("info_kg.title").optional().isString(),
  body("info_kg.text").optional().isString(),
  body("info_en.title").optional().isString(),
  body("info_en.text").optional().isString(),
  body("tags", "Неверный формат тэгов").optional().isString(),
  body("imageUrl", "Неверная ссылка на изображение").optional().isString(),
];