module.exports = function mockOcrResponse() {
  return {
    success: true,
    items: [
      { name: "Paracetamol 500mg", price: 120, quantity: 2, confidence: 0.95 },
      { name: "Blood Test", price: 800, quantity: 1, confidence: 0.92 }
    ],
    total: 920,
    confidence: 0.93,
    processing_time: 0.5,
    engine: "mock"
  };
};
