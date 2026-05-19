import { analyzeMessage, buildStallReply } from "./scamDetector.mjs";

const reports = [
  {
    id: "jurong",
    area: "Jurong East",
    type: "Parcel phishing",
    loss: "$8.2k",
    trend: "+18%",
    detail: "Fake delivery notices are pushing victims to pay small redelivery fees.",
    x: 23,
    y: 43,
  },
  {
    id: "woodlands",
    area: "Woodlands",
    type: "Bank impersonation",
    loss: "$19.4k",
    trend: "+31%",
    detail: "Calls claiming suspicious card activity request OTPs and login details.",
    x: 39,
    y: 19,
  },
  {
    id: "tampines",
    area: "Tampines",
    type: "Job scam",
    loss: "$12.1k",
    trend: "+12%",
    detail: "Recruiters ask for deposits before unlocking fake remote work tasks.",
    x: 72,
    y: 34,
  },
  {
    id: "harbour",
    area: "HarbourFront",
    type: "Investment fraud",
    loss: "$42.0k",
    trend: "+27%",
    detail: "Group chats promote guaranteed returns and pressure users to transfer fast.",
    x: 43,
    y: 52,
  },
];

const sampleMessages = [
  "Urgent! Your bank account will be locked. Click http://fake-bank.sg now to verify OTP and claim reward.",
  "Congratulations, you won a voucher. Pay a small delivery fee by PayNow to receive it today.",
  "Hi, are we still meeting at the library after school?",
];

const state = {
  selectedReport: reports[0],
  points: 1840,
  minutesStalled: 42,
};

const reportLayer = document.querySelector("[data-report-layer]");
const reportTitle = document.querySelector("[data-report-title]");
const reportDetail = document.querySelector("[data-report-detail]");
const reportMeta = document.querySelector("[data-report-meta]");
const reportList = document.querySelector("[data-report-list]");
const messageInput = document.querySelector("[data-message-input]");
const analyzeButton = document.querySelector("[data-analyze]");
const sampleButton = document.querySelector("[data-sample]");
const meterFill = document.querySelector("[data-meter-fill]");
const scoreValue = document.querySelector("[data-score]");
const riskLevel = document.querySelector("[data-risk-level]");
const signalList = document.querySelector("[data-signals]");
const reasoningText = document.querySelector("[data-reasoning]");
const stallReply = document.querySelector("[data-stall-reply]");
const chatLog = document.querySelector("[data-chat-log]");
const sendStall = document.querySelector("[data-send-stall]");
const incomingCall = document.querySelector("[data-incoming-call]");
const callStatus = document.querySelector("[data-call-status]");
const timeValue = document.querySelector("[data-time-value]");
const pointsValue = document.querySelector("[data-points-value]");
const levelBar = document.querySelector("[data-level-bar]");
const navButtons = document.querySelectorAll("[data-jump]");

function renderReports() {
  reportLayer.innerHTML = "";
  reportList.innerHTML = "";

  reports.forEach((report) => {
    const marker = document.createElement("button");
    marker.className = `map-marker ${report.id === state.selectedReport.id ? "is-active" : ""}`;
    marker.style.left = `${report.x}%`;
    marker.style.top = `${report.y}%`;
    marker.type = "button";
    marker.setAttribute("aria-label", `${report.type} in ${report.area}`);
    marker.dataset.id = report.id;
    marker.innerHTML = "<span></span>";
    reportLayer.append(marker);

    const row = document.createElement("button");
    row.className = `report-row ${report.id === state.selectedReport.id ? "is-active" : ""}`;
    row.type = "button";
    row.dataset.id = report.id;
    row.innerHTML = `
      <span>
        <strong>${report.area}</strong>
        <small>${report.type}</small>
      </span>
      <em>${report.trend}</em>
    `;
    reportList.append(row);
  });

  reportTitle.textContent = `${state.selectedReport.type} - ${state.selectedReport.area}`;
  reportDetail.textContent = state.selectedReport.detail;
  reportMeta.textContent = `${state.selectedReport.loss} reported this week`;
}

function selectReport(id) {
  const next = reports.find((report) => report.id === id);
  if (!next) return;
  state.selectedReport = next;
  renderReports();
}

function renderAnalysis(result) {
  meterFill.style.width = `${Math.max(8, result.score)}%`;
  scoreValue.textContent = `${result.score}%`;
  riskLevel.textContent = `${result.level} risk`;
  riskLevel.dataset.level = result.level.toLowerCase();
  signalList.innerHTML = "";

  const signals = result.signals.length ? result.signals : ["No major signal"];
  signals.forEach((signal) => {
    const item = document.createElement("li");
    item.textContent = signal;
    signalList.append(item);
  });

  reasoningText.textContent = result.summary;
  stallReply.textContent = buildStallReply(result.level);
}

function analyzeCurrentMessage() {
  const result = analyzeMessage(messageInput.value);
  renderAnalysis(result);
}

function useSampleMessage() {
  const current = sampleMessages.indexOf(messageInput.value);
  messageInput.value = sampleMessages[(current + 1) % sampleMessages.length];
  analyzeCurrentMessage();
}

function appendChat(role, text) {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${role}`;
  bubble.textContent = text;
  chatLog.append(bubble);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function sendStallReply() {
  const result = analyzeMessage(messageInput.value);
  appendChat("scammer", "Hello, have you completed the verification? Your account is still at risk.");
  appendChat("bot", buildStallReply(result.level));
  state.minutesStalled += result.level === "High" ? 8 : 4;
  state.points += result.level === "High" ? 320 : 140;
  renderProgress();
}

function simulateCall() {
  incomingCall.classList.add("is-ringing");
  callStatus.textContent = "Suspicious caller detected. AI defender is ready to answer.";

  window.setTimeout(() => {
    incomingCall.classList.remove("is-ringing");
    callStatus.textContent = "AI defender answered and is asking verification questions.";
    state.minutesStalled += 6;
    state.points += 260;
    renderProgress();
  }, 900);
}

function renderProgress() {
  timeValue.textContent = `${state.minutesStalled}m`;
  pointsValue.textContent = state.points.toLocaleString("en-SG");
  levelBar.style.width = `${Math.min(100, (state.points / 2500) * 100)}%`;
}

function setupNavigation() {
  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector(button.dataset.jump)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

reportLayer.addEventListener("click", (event) => {
  const marker = event.target.closest("[data-id]");
  if (marker) selectReport(marker.dataset.id);
});

reportList.addEventListener("click", (event) => {
  const row = event.target.closest("[data-id]");
  if (row) selectReport(row.dataset.id);
});

analyzeButton.addEventListener("click", analyzeCurrentMessage);
sampleButton.addEventListener("click", useSampleMessage);
sendStall.addEventListener("click", sendStallReply);
incomingCall.addEventListener("click", simulateCall);
messageInput.addEventListener("input", analyzeCurrentMessage);

renderReports();
renderAnalysis(analyzeMessage(messageInput.value));
renderProgress();
setupNavigation();
