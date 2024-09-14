import mongoose from 'mongoose';
import Password from '../services/password';
// UserDoc

// define interface for User
interface UserAttrs {
  email: string;
  password: string;
};

// an interface that describes the properties that a User Model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// an interface that describes the properties that a User Document has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  // createdAt: string; // automatically added by mongoose
  // updatedAt: string; // automatically added by mongoose
}

// define a schema
const userSchema = new mongoose.Schema({
  email: {
    type: String, // capital S to represent the type in mongoose
    required: true
  },
  password: {
    type: String,
    required: true
  },
}, {
  toJSON: {
    transform(_doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password;
    }
  }
});

userSchema.pre('save', async function(done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

// use only userSchema.build() (avoid using new User) to ensure type safety
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
}

// create a model
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
