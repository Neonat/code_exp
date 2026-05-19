import assert from "node:assert/strict";
import { analyzeMessage, buildStallReply } from "../src/scamDetector.mjs";

const highRisk = analyzeMessage(
  "Urgent! Your bank account will be locked. Click http://fake-bank.sg now to verify OTP and claim reward."
);

assert.equal(highRisk.level, "High");
assert.equal(highRisk.score >= 80, true);
assert.equal(highRisk.signals.includes("Urgency"), true);
assert.equal(highRisk.signals.includes("Suspicious link"), true);
assert.equal(highRisk.signals.includes("OTP or credential request"), true);

const lowRisk = analyzeMessage("Hi, are we still meeting at the library after school?");

assert.equal(lowRisk.level, "Low");
assert.equal(lowRisk.score < 35, true);

const reply = buildStallReply("High");

assert.equal(reply.includes("which department"), true);
assert.equal(reply.includes("case reference"), true);
