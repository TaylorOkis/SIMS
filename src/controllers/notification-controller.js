import { clients } from "../utils/sse.js";

const notification = (req, res) => {
  res.setHeader("ContentType", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const client = { id: req.user.id, res };
  clients.add(client);

  req.on("close", () => {
    clients.delete(client);
  });
};

export default notification;
