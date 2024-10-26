const { v4: uuidv4 } = require("uuid");
const Party = require("../models/Party");
const Quiz = require("../models/Quiz");
const playRecord = require("../models/PlayRecord");
const { BadRequestError } = require("../errors");

const createParty = async (req, res) => {
  const { username } = req.user;
  const { gameId } = req.body;
  const oldParty = await Party.findOne({ owner: username });
  if (oldParty) {
    await Party.findOneAndDelete({ owner: username });
  }
  const partyId = uuidv4().substring(0, 6);
  const party = await Party.create({
    owner: username,
    code: partyId,
    gameId,
    players: [username],
  });
  res.status(201).json({ party });
};

const getParty = async (req, res) => {
  const { code } = req.body;
  const { username } = req.user;
  const party = await Party.findOne({ code });
  if (party === null) {
    throw new BadRequestError("party does not exist");
  }
  if (party.players.length >= 6) {
    throw new BadRequestError("Party is full");
  }
  if (party.started === true) {
    throw new BadRequestError("game has already started");
  }
  const newParty = await Party.findOneAndUpdate(
    { code },
    { players: [...party.players, username] },
    {
      new: true,
    }
  );
  res.status(200).json({ party: newParty });
};

const leaveParty = async (req, res) => {
  const { id } = req.body;
  const { username } = req.user;
  const party = await Party.findOne({ _id: id });
  const newMembers = party.players.filter((p) => p.username != username);
  party.players = newMembers;
  await party.save();
  res.status(200).json({ success: true });
};

const playSocket = (socket, id) => {
  socket.on("player-joined", (players) => {
    players.forEach((p) => {
      if (p === id) return;
      socket.to(p).emit("new-player", id);
    });
  });
  socket.on("owner-left", async (partyId) => {
    const party = await Party.findOne({ _id: partyId });
    const players = party.players;
    if (party.started === true) return;
    await Party.findOneAndDelete({ _id: partyId });
    players.forEach((user) => {
      if (user === id) return;
      socket.to(user).emit("owner-left");
    });
  });
  socket.on("player-left", async (partyId) => {
    const party = await Party.findOne({ _id: partyId });
    if (!party) return;
    if (party.started === true) return;
    const newMembers = party.players.filter((player) => player != id);
    party.players = newMembers;
    await party.save();
    newMembers.forEach((member) => {
      socket.to(member).emit("player-left", id);
    });
  });
  socket.on("kick-player", async (name, partyId, cb) => {
    socket.to(name).emit("kicked");
    cb();
  });
  socket.on("start-game", async (partyId, cb) => {
    const party = await Party.findOne({ _id: partyId });
    const quiz = await Quiz.findOne({ _id: party.gameId });
    quiz.played = quiz.played + 1;
    await quiz.save();
    party.started = true;
    await party.save();
    party.players.filter((player) => {
      socket.to(player).emit("start-game");
    });
    cb();
  });
  socket.on("send-answer", (answer, owner) => {
    socket.to(owner).emit("player-answer", id, answer);
  });
  socket.on("next-question", (members, cb) => {
    members.forEach((member) => {
      socket.to(member).emit("next-question");
    });
    cb();
  });
  socket.on("send-answer", (owner, answer) => {
    socket.to(owner).emit("receive-answer", id, answer);
  });
  socket.on("send-results", (answers, members) => {
    members.forEach((member) => {
      if (member === id) return;
      socket.to(member).emit("round-answers", answers);
    });
  });
};

const recordPlay = async (req, res) => {
  const { userId } = req.user;
  const { quizId } = req.body;
  if (!quizId) {
    throw new BadRequestError("Please provide quiz id");
  }
  const newRecord = await playRecord.create({ playerId: userId, quizId });
  console.log(newRecord);
  res.status(200).json({ msg: "play recorded" });
};

const getPlayRecords = async (req, res) => {
  const today = new Date();
  const last30Days = new Date();
  last30Days.setDate(today.getDate() - 30);
  today.setHours(0, 0, 0, 0);
  const earlyDate = new Date(0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const getData = async (from, to) => {
    const data = await playRecord.aggregate([
      {
        $match: {
          date: {
            $gte: from,
            $lt: to,
          },
        },
      },
      {
        $group: {
          _id: "$quizId",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 4,
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          count: 1,
        },
      },
    ]);
    return data;
  };

  const getQuizzes = async (arr) => {
    return await Promise.all(
      arr.map(async (x) => {
        const quiz = await Quiz.findById({ _id: x.name });
        return quiz;
      })
    );
  };
  const today1 = await getQuizzes(await getData(today, tomorrow));
  const month = await getQuizzes(await getData(last30Days, new Date()));
  const allTime = await getQuizzes(await getData(earlyDate, new Date()));

  res.status(200).json({ today: today1, month, allTime });
};

module.exports = {
  createParty,
  playSocket,
  getParty,
  leaveParty,
  recordPlay,
  getPlayRecords,
};
