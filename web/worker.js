const state = {
  latest: null,
  history: [],
};

self.onmessage = (message) => {
  const { type, event } = message.data || {};
  if (type !== "event" || !event) {
    return;
  }
  state.latest = event;
  state.history.push(event);
  if (state.history.length > 256) {
    state.history.shift();
  }
  self.postMessage({
    type: "apply",
    event,
    latest: state.latest,
    historySize: state.history.length,
  });
};

