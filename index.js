import dgram from "node:dgram";
import dnsPacket from "dns-packet";
const server = dgram.createSocket("udp4");

const db = {
  "sammy.frost.com": {
    type: "A",
    data: "1.2.3.4",
  },
  "blog.sammy.frost.com": {
    type: "CNAME",
    data: "hashnode.network",
  },
};

server.on("error", (err) => {
  console.error(`server error:\n${err.stack}`);
  server.close();
});

server.on("message", (msg, rinfo) => {
  const incomingMsg = dnsPacket.decode(msg);
  const ipFromDb = db[incomingMsg.questions[0].name];

  const ans = dnsPacket.encode({
    type: "response",
    id: incomingMsg.id,
    flags: dnsPacket.AUTHORITATIVE_ANSWER,
    questions: incomingMsg.questions,
    answers: [
      {
        type: ipFromDb.type,
        class: "IN",
        name: incomingMsg.questions[0].name,
        data: ipFromDb.data,
      },
    ],
  });

  server.send(ans, rinfo.port, rinfo.address);
  console.log({
    questions: incomingMsg.questions[0].name,
    rinfo,
  });
});

server.bind(41234, () => {
  console.log("DNS server is running at 41234 PORT ");
});
