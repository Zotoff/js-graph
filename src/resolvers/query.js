module.exports = {
    notes: async (parent, args, {models}) => {
        return await models.Note.find();
    },
    note: async(parent, args, {models}) => {
        return await models.Note.findById(args.id)
    },
    users: async (parent, args, {models}) => {
        return await models.User.find();
    },
    user: async (parent, args, {models}) => {
        return await models.User.findOne({email: args.email});
    },
    me: async (parent, args, { models, user }) => {
      // Находим пользователя по текущему пользовательскому контексту
      return await models.User.findById(user.id);
    }
}