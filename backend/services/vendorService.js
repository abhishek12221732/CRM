// Mock vendor service that simulates message sending
exports.sendMessage = async (messageData) => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
    
    // Simulate 90% success rate
    const success = Math.random() < 0.9;
    
    return {
      success,
      message: success ? 'Message sent successfully' : 'Failed to send message',
      vendorId: `vendor-${Math.random().toString(36).substr(2, 9)}`
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};