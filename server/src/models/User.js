import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN", "SUPER_ADMIN"],
      default: "USER"
    },
    isSuspended: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationOTP: {
      type: String
    },
    otpExpires: {
      type: Date,
      index: { expires: 600 }
    },
    failedOtpAttempts: {
      type: Number,
      default: 0
    },
    passwordResetToken: {
      type: String,
      default: null
    },
    passwordResetExpires: {
      type: Date,
      default: null
    },
    alias: {
      type: String,
      unique: true,
      sparse: true
    },
    bio: {
      type: String,
      default: ""
    },
    xp: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    },
    streak: {
      type: Number,
      default: 0
    },
    coins: {
      type: Number,
      default: 50
    },
    dailyCoins: {
      type: Number,
      default: 0
    },
    lastCoinReset: {
      type: Date,
      default: Date.now
    },
    lastActions: {
      game: {
        type: Date,
        default: null
      },
      vote: {
        type: Date,
        default: null
      },
      meme: {
        type: Date,
        default: null
      }
    },
    lastPlayedGame: {
      type: Date,
      default: null
    },
    lastActive: {
      type: Date,
      default: null
    },
    badges: {
      type: [
        {
          name: {
            type: String,
            required: true
          },
          earnedAt: {
            type: Date,
            default: Date.now
          }
        }
      ],
      default: []
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
