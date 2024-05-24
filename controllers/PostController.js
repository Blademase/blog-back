import PostModel from "../models/Post.js";
import CommentModel from "../models/Commet.js";

export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModel.find().limit(5).exec();

    const tags = posts
      .map((obj) => obj.tags)
      .flat()
      .slice(0, 5);

    res.json(tags);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось получить тэги",
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const posts = await PostModel.find().populate("user").exec();
    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось получить статьи",
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;
    PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: { viewsCount: 1 },
      },
      {
        returnDocument: "after",
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: "Не удалось вернуть статью",
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: "Статья не найдена",
          });
        }

        res.json(doc);
      }
    ).populate("user");
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось получить статьи",
    });
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;

    PostModel.findOneAndDelete(
      {
        _id: postId,
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: "Не удалось удалить статью",
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: "Статья не найдена",
          });
        }

        res.json({
          success: true,
        });
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось получить статьи",
    });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new PostModel({
      info_ru: {
        title: req.body.info_ru.title,
        text: req.body.info_ru.text
      },
      info_kg: {
        title: req.body.info_kg.title,
        text: req.body.info_kg.text
      },
      info_en: {
        title: req.body.info_en.title,
        text: req.body.info_en.text
      },
      imageUrl: req.body.imageUrl,
      tags: req.body.tags.split(","),
      user: req.userId,
    });

    const post = await doc.save();

    res.status(201).json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалосьf создать статью",
    });
  }
};
export const update = async (req, res) => {
  try {
    const postId = req.params.id;

    await PostModel.updateOne(
        {
          _id: postId,
        },
        {
          info_ru: {
            title: req.body.info_ru.title,
            text: req.body.info_ru.text,
          },
          info_kg: {
            title: req.body.info_kg.title,
            text: req.body.info_kg.text,
          },
          info_en: {
            title: req.body.info_en.title,
            text: req.body.info_en.text,
          },
          imageUrl: req.body.imageUrl,
          user: req.userId,
          tags: req.body.tags.split(","),
        }
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось обновить статью",
    });
  }
};

export const createComment = async (req, res) => {
  try {
    const { postId, text } = req.body;

    const comment = new CommentModel({
      text,
      user: req.userId,
      post: postId,
    });

    await comment.save();

    // Increment the comments count in the Post model
    await PostModel.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    // Populate the comment with user data
    const populatedComment = await CommentModel.findById(comment._id).populate("user");

    res.json(populatedComment);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось создать комментарий",
    });
  }
};
export const getCommentsForPost = async (req, res) => {
  try {
    const postId = req.params.postId;

    const comments = await CommentModel.find({ post: postId })
      .populate("user")
      .exec();

    res.json(comments);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось получить комментарии",
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;

    // Найдем комментарий, чтобы узнать к какому посту он относится
    const comment = await CommentModel.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Комментарий не найден",
      });
    }

    // Удаляем комментарий из базы данных
    await CommentModel.findByIdAndDelete(commentId);

    // Уменьшаем счетчик комментариев в посте
    await PostModel.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось удалить комментарий",
    });
  }
};

export const getLastComments = async (req, res) => {
  try {
    const comments = await CommentModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user")
      .exec();
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
