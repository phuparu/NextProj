import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import User from "@models/user";
import { connectToDB } from "@utils/database";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session }) {
      const sessionUser = await User.findOne({ email: session.user.email });
      session.user.id = sessionUser._id.toString();

      return session;
    },
    async signIn({ account, profile, user, credentials }) {
      try {
        await connectToDB();

        // Check if user already exists
        const userExists = await User.findOne({ email: profile.email });

        // Function to generate a valid username
        const generateValidUsername = (name) => {
          let username = name.replace(/[^a-zA-Z0-9._]/g, ""); // Remove invalid characters
          if (username.length < 8) {
            username = username.padEnd(8, "0"); // Pad to meet minimum length
          } else if (username.length > 20) {
            username = username.substring(0, 20); // Trim to meet maximum length
          }
          return username.toLowerCase();
        };

        if (!userExists) {
          let username = generateValidUsername(profile.name);

          // Ensure the username is unique
          let userCheck = await User.findOne({ username });
          let uniqueUsername = username;
          let counter = 1;
          while (userCheck) {
            uniqueUsername = `${username}${counter}`;
            userCheck = await User.findOne({ username: uniqueUsername });
            counter += 1;
          }

          // Create a new user document
          await User.create({
            email: profile.email,
            username: uniqueUsername,
            image: profile.picture,
          });
        }

        return true;
      } catch (error) {
        console.log("Error checking if user exists: ", error.message);
        return false;
      }
    },
  },
});

export { handler as GET, handler as POST };
