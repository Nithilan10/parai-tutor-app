export default function robots() {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${base.replace(/\/$/, "")}/sitemap.xml`,
  };
}
