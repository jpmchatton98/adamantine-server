var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

const port = process.env.PORT ?? 2000;

const config = JSON.parse(process.env.APP_CONFIG ?? "{}");
const mongoPassword = "adamantine";
const mongoUrl = `mongodb://${
  config.mongo?.user ?? "81546829ae328d868fe5bb9070643a6b"
}:${mongoPassword}@${
  config.mongo?.hostString ??
  "16a.mongo.evennode.com:27019/81546829ae328d868fe5bb9070643a6b"
}`;

mongoose.connect(mongoUrl);

var app = express();
app.use(bodyParser());
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://wiki.adamantine-dnd.org"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);

  next();
});

let characterSchema = new mongoose.Schema({
  guid: String,
  player: String,
  data: String,
});
let characterModel = mongoose.model("CharacterData", characterSchema);

function getCharacter(characterId) {}

function setCharacter(username, characterId, newData) {}

function deleteCharacter(characterId) {
  mongoose.connect(mongoUrl);
  characterModel.deleteOne({ guid: characterId });

  return { msg: "deleted" };
}

function getCharacters(username) {
  mongoose.connect(mongoUrl);

  const characters = characterModel.find({
    player: username,
  });

  return characters.map((c) => {
    return {
      guid: c.guid,
      data: JSON.parse(c.data),
    };
  });
}

app.post("/db/getUserCharacters", function (req, res) {
  const data = characterModel
    .find({
      player: req.body.username,
    })
    .then((d) => {
      res.send(d);
    });
});
app.post("/db/getCharacters", function (req, res) {
  const data = characterModel.find().then((d) => {
    res.send(d);
  });
});
app.post("/db/getCharacter", function (req, res) {
  const data = characterModel
    .findOne({
      guid: req.body.characterId,
    })
    .then((d) => {
      res.send(JSON.parse(d?.data ?? "{}"));
    });
});
app.post("/db/setCharacter", function (req, res) {
  characterModel
    .findOne({
      guid: req.body.characterId,
    })
    .then((c) => {
      if (c === null) {
        characterModel
          .insertMany([
            {
              guid: req.body.characterId,
              player: req.body.username,
              data: JSON.stringify(req.body.characterData),
            },
          ])
          .then((i) => {
            res.send({ msg: "created" });
          });
      } else {
        characterModel
          .updateOne(
            {
              guid: req.body.characterId,
            },
            {
              data: JSON.stringify(req.body.characterData),
            }
          )
          .then((i) => {
            res.send({ msg: "updated" });
          });
      }
    });
});
app.post("/db/deleteCharacter", function (req, res) {
  const data = characterModel
    .findOne({
      guid: req.body.characterId,
    })
    .then((c) => {
      if (c !== null) {
        characterModel.deleteOne({
          guid: req.body.characterId,
        });
      }
    });
});

app.listen(port, function () {
  console.log("ready");
});
