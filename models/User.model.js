// models/User.js

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      
      minlength: 6,
      select: false, // Prevents password from being returned in queries
    },
    role: {
      type: String,
      enum: ['student',  'admin'],
      default: 'student',
    },
    avatar: {
      type: String, // URL to profile picture
      default: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKwAAACUCAMAAAA5xjIqAAAAYFBMVEXZ3OFwd3/d4OVyd3tydn9weHtxd33Z3eDg4+huc3fT1ttrcnuboKRweH3HzNBrcHS9wcWJjpKQlJitsbZmbXe2ur6jpqt4f4KUmp50fIPBx8pqc3WAhYlhaHDN0NZla2/UNNnyAAAFJUlEQVR4nO2c7W6zPAxAqQMpIYHwDQVW7v8u30D3vOs+CoQETCXOv02adOSZOE4MjnNycnJycnJycnJycnJysgsA/gPANplDiUaZSJMkFVl0aF+AoOg+8pxfKOU8zz+SLHCO6QvQlFXPL0/QviobOKAuBKJihFy+yRLGKhEczRaguH0L6hf8VsAV2+8ZFdb+b9UxGQ4VXLinrfdSlhCZ3g9jC/fuRQr8g3VHsYWAMDotSxg5hi0ECSPTrioTWHIM23omBz4zocb2VPiiXeJ6IVL42K7Q9OEiWUr7GDkRwJlbCJ50O+SNApRsqeslZCWubFTNLFrPeFWE6QpCLpelXosa2kASHVlPBniufplrZMElpLJEXL46DdUB1qGpQjxXZn/ieWhrLSwsXl9QJrBkg0RXVu1nkB4xiKrXO+4XkSVVhBNaiGe3hr/hSEkLmdSXzTMUV7UvWCHLhYPT6tZr0qC+4sjOtzN/yCZIkV0h6/LkbSLrum8U2beSHXIWKQ3SNbIpiurQJqxZZ5Eq2IqiEMoSxXVNufW8NnubjYzqGbE2Mg3V3SK67qVBkr13+rJ4B7WpbqfgYq1cQyeuK4t4zAGFtqxXoJ3JBJWubIV3b+MvO/T+gtV4JzLQ5HqyPdLC9bDt5u5pnqAE8fRIcS10jjyJxHu8BoJk+ck3RTuO+QQKEi4tY5TgBlbZ1hO3tt/hKfa1HTjVwsrAb/hTHdAsqwxeiLls/eMaL5PFTtgHfnzjdGoFozTktxj9MvSB3ySSvG4aCCGyO0IOPBimTl6vt4Qca+7E8aNkGOgJf1w6Dz8zkkQHm0YDiEXVtt4XyjNs27YSMf6S9Qtw7oXy7XvZPsg/eCWK+wFVRwDgGhWZEHUtyqyIhl9gO03yNeR5cNGTk3flOoJtsZC3kf1/6Tr22jVYOlFclKVQlGXRRM4Rh+pVDIN7LBJVbFvJXc6563Ip1U+JiKPgeqAYD7uCMgn7xzZmODEeTmIpUY2vp/YIXlIeZofgO0XdUT5x6uVy0tUxoLcK6t8/7gzpGM5Xsi4hTO0VcV9aAKcRcvznz8hSSlVGSNHg6fpR7bU6s4gtqSOcZFCNl6eiqjXep/6gRmjHwMmIDIeHXyOyQ7MjSXbdWdeP1twyj/ElLN01F8AvvJ/v0SyXJS3J9qtrcE9z9XzrDHg+26q/y3d7JQSiTk6tVEuQ3T6Tc35ctaGprNdWexx+QTZVWXWCu/1lPmT9ylz9CdncFjK29sH6JUvZtrbK1Y7pyLa2UPS6EwaTsqTf7jgcYu/nmaahLGVbTaFApHsJPo+30WQHBJ3ueMEC2bbbZBfm19Jmwj4IQ7nFrb5fTF1yGNAW1m2hqcg2sl5l/yYnZfRiqRx8hzLbE0lQrNxrLyG3nAjQb5MDI7S3mgfDS2qb5MCD1uacKjQaTewKPGLzGRPMZpn9LdsKa6oQmzYGM7gutRZaqPnWsry2JRsY94ezslRa2iL4Qm6qOmLrTfJA+x21FZDKyswXFFoHWiuh1ErTcF3zJpU+VmaWVX+wYaV94mbhjAaK6dEia8jCwjWf7kDvalkL38EIdgmrIvSM1wNoXn96xzLmY8t+Zr+l/RsqM9O64Gu/Yr1aliTGRWyP8vUpWxmqQrRH+fqUJYYrrWoU95NlhhUXMo2PbpjCDU9AQWi8iGAsa9g3XtM9ZVPDgpvsVGxH2cTMNVj+aSMLsp1RwYV7Rzdtwr9jdrI8fHZjr6VL9Y1m144QdTvKXkxl94zsbLPwH6Q6UMHVaG2dAAAAAElFTkSuQmCC',
    },
    studentData: {
      version: {
        type: String,
        enum: ['en', 'bn'],
        default: 'bn',
      },
      group:{
        type:String,
        enum:['science','commerce','humanities']
      },
      candidate: {
        type: String,
        enum: [ 'ssc', 'hsc', 'admission'],
      },
      
    },
   
   
  },
  {
    timestamps: true,
  }
);

// Password hashing before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
