// Autodesk Forge configuration
module.exports = {
  // Set environment variables or hard-code here
  credentials: {
    client_id: "Gljjvgeu0aYrEAwqLatOyvZ56tSjIlmP",
    client_secret: "PcvwD6AcmYlrMiGg",
    callback_url: process.env.FORGE_CALLBACK_URL,
  },
  scopes: {
    // Required scopes for the server-side application
    internal: ["bucket:create", "bucket:read", "data:read", "data:create", "data:write"],
    // Required scope for the client-side viewer
    public: ["viewables:read"],
  },
};
