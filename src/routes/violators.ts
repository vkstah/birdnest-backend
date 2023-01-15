import { violatorsCache } from "../index";

export const handleViolators = (req, res) => {
  res.send({
    data: violatorsCache,
  });
};
