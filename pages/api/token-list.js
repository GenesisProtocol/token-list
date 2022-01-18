import tokens from "../../assets/tokens.json";

export default function handler(req, res) {
  tokens.timestamp = new Date().toISOString();
  res.status(200).json(tokens);
}
