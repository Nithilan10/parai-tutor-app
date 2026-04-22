export default function sitemap() {
  const base = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
  const paths = [
    "",
    "/login",
    "/register",
    "/about",
    "/dashboard",
    "/tutorials",
    "/history",
    "/making-of-parai",
    "/profile",
  ];
  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
