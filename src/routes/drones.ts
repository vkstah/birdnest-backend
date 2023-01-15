import { dronesSnapshotCache } from "../index";

export const handleDrones = (req, res) => {
  res.send({
    data: dronesSnapshotCache,
  });
};
