declare module "next-auth" {
  interface Session {
    user: {
      role: "admin" | "developer";
    } & DefaultSession["user"];
  }
}
