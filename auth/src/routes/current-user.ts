import express from 'express';

import { currentUser } from '@moon37ok/common';

const router = express.Router();

router.get( '/api/users/currentuser', currentUser, (req, res) => {
  res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
